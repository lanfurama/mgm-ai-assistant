<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MGM AI Assistant

AI-powered product description generator for e-commerce.

## Project Structure

```
├── backend/          # Backend API server
│   ├── src/
│   │   ├── config/   # Database configuration
│   │   ├── models/   # Database models
│   │   ├── routes/   # API routes
│   │   └── server.ts # Express server
│   └── package.json
├── src/              # Frontend React app
│   ├── api/          # API service layer
│   ├── components/   # UI components
│   ├── config/       # Configuration
│   ├── hooks/        # Custom React hooks
│   ├── models/       # Data models
│   ├── services/     # Business logic
│   ├── types/        # TypeScript types
│   └── utils/        # Utilities
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup Database

1. Create PostgreSQL database:
```sql
CREATE DATABASE mgm_ai_assistant;
```

2. Run SQL script to create tables:
```bash
psql -U postgres -d mgm_ai_assistant -f database.sql
```

## Installation

1. Install all dependencies (frontend + backend):
```bash
npm run install:all
```

2. Setup backend environment:
   - Create `backend/.env` file:
```bash
PORT=8000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mgm_ai_assistant
DB_USER=postgres
DB_PASSWORD=your_password
FRONTEND_URL=http://localhost:3000
```

3. Setup frontend environment:
   - Create `.env.local` file:
```bash
VITE_VERTEX_AI_API_KEY=your_vertex_ai_api_key
VITE_VERTEX_AI_PROJECT_ID=your_project_id
VITE_VERTEX_AI_LOCATION=europe-west4
VITE_VERTEX_AI_ENDPOINT_ID=your_endpoint_id
```

## Run Application

Run both frontend and backend with a single command:
```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000` (proxied through frontend)
- API calls from frontend automatically proxy to backend via Vite

## Features

- Add products manually or via Excel file
- AI-powered SEO-optimized product descriptions (Vertex AI)
- PostgreSQL database integration
- RESTful API backend
- Batch processing with progress tracking
- Export results to Excel
- Real-time product status updates
