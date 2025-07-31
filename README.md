# Snack Track Insight App - Restructured

This is a restructured version of the Snack Track Insight App with improved organization and separation of concerns.

## Project Structure

```
snack-track-insight-app/
├── backend/
│   ├── server.js          # Main backend server
│   ├── db.js              # Database connection and setup
│   ├── .env               # Backend environment variables
│   └── package.json       # Backend dependencies and scripts
├── frontend/
│   ├── (standard React/Vite structure)
│   ├── .env               # Frontend environment variables
│   └── package.json       # Frontend dependencies and scripts
├── .env                   # Example environment variables template
├── package.json           # Root package.json with workspace scripts
└── RESTRUCTURE_PLAN.md    # Documentation of the restructuring process
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Azure account with Speech and Text Analytics services

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd snack-track-insight-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

### Environment Setup

1. Copy the example environment file and fill in your values:
```bash
cp .env .env.local
```

2. Update backend/.env with your database and Azure credentials
3. Update frontend/.env with your API base URL

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```

3. Open your browser to http://localhost:5173

## Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:backend` - Start backend development server
- `npm run build` - Build frontend for production
- `npm run start` - Start backend server for production

## Features

- Speech-to-Text transcription using Azure Speech Services
- Text analysis using Azure Text Analytics
- Food consumption tracking with point-based rewards system
- Mobile-responsive interface with React and Tailwind CSS
- PostgreSQL database for data persistence

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.
