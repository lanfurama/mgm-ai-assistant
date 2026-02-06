import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (config.nodeEnv === 'development') {
    console.error('[Error]', {
      statusCode,
      message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    console.error('[Error]', {
      statusCode,
      message,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error: ApiError = new Error(`Not found: ${req.method} ${req.path}`);
  error.statusCode = 404;
  next(error);
};
