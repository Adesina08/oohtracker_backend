# Backend API

This directory contains a minimal Express server used by the Snack Track Insight application.

## Setup

```sh
cd backend
npm install
# Ensure the `ffmpeg` binary is available for processing audio and video inputs.
npm start
```

The server transcribes uploaded audio using Azure Speech to Text, so make sure
`AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` are configured in your environment.

The server listens on `PORT` (defaults to `4000`) and uses the `DB_*` environment variables to connect to PostgreSQL. It exposes a simple health endpoint at `/api/health` that returns `{ status: 'ok' }` and an informational message at `/api`.
During development the frontend's Vite server proxies `/api` requests to this port, so make sure the backend is running before interacting with the app.

### Environment variables

Create a `.env` file in this directory for local development and define at least the following variables. In production set them as environment variables (e.g. Azure App Settings):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=snackuser
DB_PASSWORD=snackpass
DB_NAME=snacktrack
PORT=4000
```

If a `.env` file is present these values are loaded with `dotenv` during local development. When `WEBSITE_INSTANCE_ID` is defined (the case on Azure Web Apps) the server skips loading `.env` files and relies solely on environment variables provided by the platform.
When connecting to a hosted database (e.g. Render or Heroku), provide the host, port, username and password from your provider. TLS is automatically enabled for any host that is not `localhost`.

Future API routes should be added to `server.js`.
