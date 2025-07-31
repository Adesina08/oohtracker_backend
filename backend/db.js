import pkg from 'pg';
const { Pool } = pkg;
import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Only load environment variables from a .env file when not running on Azure
// (detected via the WEBSITE_INSTANCE_ID variable). Azure injects configuration
// directly into process.env so loading a file could override those values.
if (!process.env.WEBSITE_INSTANCE_ID) {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    dotenv.config();
  }
}

const isLocal =
  process.env.DB_HOST?.includes('localhost') ||
  process.env.DB_HOST?.includes('127.0.0.1');

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      points INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS consumption_logs (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product TEXT NOT NULL,
      brand TEXT,
      category TEXT NOT NULL,
      spend REAL,
      companions TEXT,
      location TEXT,
      notes TEXT,
      media_url TEXT,
      media_type TEXT,
      capture_method TEXT NOT NULL,
      ai_analysis JSONB,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      points INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      points_required INTEGER NOT NULL,
      category TEXT,
      is_active BOOLEAN DEFAULT TRUE
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*) FROM rewards');
  if (rows[0].count === '0') {
    await pool.query(
      `INSERT INTO rewards (id, name, description, points_required, category, is_active)
       VALUES
       ($1, $2, $3, $4, $5, TRUE),
       ($6, $7, $8, $9, $10, TRUE)`,
      [
        crypto.randomUUID(),
        'Free Coffee',
        'Enjoy a cup on us',
        100,
        'misc',
        crypto.randomUUID(),
        'Movie Ticket',
        'Ticket for any movie',
        250,
        'entertainment'
      ]
    );
  }
}
