import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:5432';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  passwordHash: string;
  createdAt: string;
  points: number;
}

export interface ConsumptionLog {
  id: string;
  userId: string;
  product: string;
  brand?: string;
  category: string;
  spend?: number;
  companions?: string;
  location?: string;
  notes?: string;
  mediaUrl?: string;
  mediaType?: 'photo' | 'audio' | 'video';
  captureMethod: 'manual' | 'ai';
  aiAnalysis?: any;
  createdAt: string;
  points: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: string;
  isActive: boolean;
}

// Database operations
export const dbOperations = {
  // User operations
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'points'>) {
    const { data, error } = await supabase
      .from('users')
      .insert({ ...userData, points: 0 })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUserPoints(userId: string, points: number) {
    // Get current user points first, then update
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const newPoints = (user.points || 0) + points;
    
    const { data, error } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Consumption logs
  async createConsumptionLog(logData: Omit<ConsumptionLog, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('consumption_logs')
      .insert(logData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserConsumptionLogs(userId: string) {
    const { data, error } = await supabase
      .from('consumption_logs')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAllConsumptionLogs() {
    const { data, error } = await supabase
      .from('consumption_logs')
      .select(`
        *,
        users (
          firstName,
          lastName,
          email
        )
      `)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Analytics
  async getConsumptionAnalytics() {
    const { data, error } = await supabase
      .from('consumption_logs')
      .select('category, createdAt, points')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Rewards
  async getRewards() {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('isActive', true)
      .order('pointsRequired', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};
