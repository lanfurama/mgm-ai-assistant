import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = randomUUID();
  req.requestId = requestId;

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
    };

    if (res.statusCode >= 400) {
      console.error('[Request]', logData);
    } else {
      console.log('[Request]', logData);
    }
  });

  next();
};
