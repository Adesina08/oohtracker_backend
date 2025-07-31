# Project Restructuring Plan

## Current Structure Issues
1. Backend and frontend files are mixed in root directory
2. Environment variables are in root .env but used by both frontend and backend
3. Scripts in package.json reference both frontend and backend

## Proposed Structure
```
snack-track-insight-app/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── (current frontend structure)
│   ├── .env.example
│   └── package.json
├── .gitignore
├── README.md
└── package.json (with workspace scripts)
```

## Benefits of Restructuring
1. Clear separation of backend and frontend concerns
2. Independent development of each part
3. Clearer environment variable management
4. Better deployment strategies

## Implementation Steps
1. Create backend directory
2. Move backend files to backend directory
3. Create separate package.json files for backend and frontend
4. Update environment variable management
5. Update scripts in root package.json to work with new structure
6. Test application functionality