import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { pool } from './config/database.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import productRoutes from './routes/products.js';

const app = express();

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const frontendUrl = config.cors.frontendUrl;
    
    if (frontendUrl === '*') {
      callback(null, true);
      return;
    }
    
    if (Array.isArray(frontendUrl)) {
      if (!origin || frontendUrl.includes(origin)) {
        callback(null, true);
        return;
      }
    } else {
      if (!origin || origin === frontendUrl || origin.startsWith(frontendUrl)) {
        callback(null, true);
        return;
      }
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.use('/api/products', productRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log('\n=== Server Started ===');
  console.log(`Port: ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`CORS: ${Array.isArray(config.cors.frontendUrl) ? config.cors.frontendUrl.join(', ') : config.cors.frontendUrl}`);
  console.log('=====================\n');
});
