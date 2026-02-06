import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import productRoutes from './routes/products.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Auto-detect server IP addresses
const getServerIPs = (): string[] => {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  
  Object.keys(interfaces).forEach((name) => {
    const nets = interfaces[name];
    if (nets) {
      nets.forEach((net) => {
        // Skip internal (loopback) and non-IPv4 addresses
        if (net.family === 'IPv4' && !net.internal) {
          ips.push(net.address);
        }
      });
    }
  });
  
  return ips;
};

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

// Log detected origins for debugging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin !== req.headers.host) {
    console.log(`[CORS] Request from origin: ${origin}`);
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  const serverIPs = getServerIPs();
  console.log('\n=== Server Started ===');
  console.log(`Local:   http://localhost:${PORT}`);
  if (serverIPs.length > 0) {
    console.log('Network:');
    serverIPs.forEach(ip => {
      console.log(`         http://${ip}:${PORT}`);
    });
  }
  console.log(`\nCORS Config: ${FRONTEND_URL || '* (auto-detect - allows all origins)'}`);
  console.log('=====================\n');
});
