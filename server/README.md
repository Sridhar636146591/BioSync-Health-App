# BioSync Health API Server

Backend server for BioSync Health application with JSON file storage.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login to existing account

### Users
- `GET /api/users` - Get all users (for discover feature)

### Health Data
- `GET /api/health-data/:email` - Get user's health data
- `POST /api/health-data/:email` - Save user's health data

### Friends
- `GET /api/friends/:email` - Get user's friends

## Data Storage

All data is stored in JSON files in the `data/` directory:
- `data/users.json` - User accounts
- `data/health-data/{email}.json` - Individual health data
- `data/friends.json` - Friend relationships

## Deployment

The server can be deployed to Render, Heroku, or any Node.js hosting platform.

Make sure to set the `PORT` environment variable in production.
