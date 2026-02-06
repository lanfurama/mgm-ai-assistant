import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  cors: {
    frontendUrl: string | string[] | '*';
  };
}

function parseCorsOrigin(origin: string | undefined): string | string[] | '*' {
  if (!origin || origin === '*') {
    return '*';
  }
  if (origin.includes(',')) {
    return origin.split(',').map(url => url.trim());
  }
  return origin;
}

function validateConfig(): void {
  const required = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export const config: Config = (() => {
  validateConfig();
  
  return {
    port: parseInt(process.env.PORT || '8000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
    },
    cors: {
      frontendUrl: parseCorsOrigin(process.env.FRONTEND_URL),
    },
  };
})();
