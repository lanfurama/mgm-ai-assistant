import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// CORS configuration: 
// - If FRONTEND_URL is set, use it
// - If FRONTEND_URL is '*', allow all origins (for reverse proxy setups)
// - Otherwise, allow requests from same origin (works with reverse proxy)
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!FRONTEND_URL || FRONTEND_URL === '*') {
      // Allow all origins (useful when behind reverse proxy)
      callback(null, true);
    } else if (FRONTEND_URL.includes(',')) {
      // Multiple allowed origins
      const allowedOrigins = FRONTEND_URL.split(',').map(url => url.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Single allowed origin
      if (!origin || origin === FRONTEND_URL || origin.startsWith(FRONTEND_URL)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});
