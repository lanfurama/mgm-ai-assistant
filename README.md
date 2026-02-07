<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MGM AI Assistant

AI-powered product description generator for e-commerce.

## Project Structure

```
├── src/              # Frontend React app
│   ├── api/          # Vertex AI (Gemini) API
│   ├── components/   # UI components
│   ├── config/       # Configuration
│   ├── hooks/        # Custom React hooks
│   ├── services/     # Business logic & localStorage
│   ├── types/        # TypeScript types
│   └── utils/        # Utilities
├── index.html
└── vite.config.ts
```

## Prerequisites

- Node.js 18+

## Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment:
   - Create `.env.local` file:
```bash
VITE_VERTEX_AI_API_KEY=your_vertex_ai_api_key
VITE_VERTEX_AI_PROJECT_ID=your_project_id
VITE_VERTEX_AI_LOCATION=europe-west4
VITE_VERTEX_AI_ENDPOINT_ID=your_endpoint_id
```

## Run Application

```bash
npm run dev
```

- Frontend: `http://localhost:3004`

## Build for Production

```bash
npm run build
```

Output is in `dist/` directory. Deploy as static files to any web server or CDN.

## Features

- Add products manually or via Excel file
- AI-powered SEO-optimized product descriptions (Vertex AI)
- Products stored in browser localStorage
- Batch processing with progress tracking
- Export results to Excel
- Real-time product status updates
