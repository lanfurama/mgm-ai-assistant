import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler.js';

export const validateBody = (schema: {
  [key: string]: (value: any) => boolean | string;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const [key, validator] of Object.entries(schema)) {
      const value = req.body[key];
      const result = validator(value);

      if (result === false) {
        errors.push(`${key} is invalid`);
      } else if (typeof result === 'string') {
        errors.push(result);
      }
    }

    if (errors.length > 0) {
      const error: ApiError = new Error(`Validation failed: ${errors.join(', ')}`);
      error.statusCode = 400;
      return next(error);
    }

    next();
  };
};

export const validateParams = (schema: {
  [key: string]: (value: any) => boolean | string;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const [key, validator] of Object.entries(schema)) {
      const value = req.params[key];
      const result = validator(value);

      if (result === false) {
        errors.push(`${key} is invalid`);
      } else if (typeof result === 'string') {
        errors.push(result);
      }
    }

    if (errors.length > 0) {
      const error: ApiError = new Error(`Validation failed: ${errors.join(', ')}`);
      error.statusCode = 400;
      return next(error);
    }

    next();
  };
};

export const validators = {
  required: (value: any): boolean | string => {
    if (value === undefined || value === null || value === '') {
      return 'is required';
    }
    return true;
  },
  string: (value: any): boolean | string => {
    if (typeof value !== 'string') {
      return 'must be a string';
    }
    return true;
  },
  array: (value: any): boolean | string => {
    if (!Array.isArray(value)) {
      return 'must be an array';
    }
    return true;
  },
  nonEmpty: (value: any): boolean | string => {
    if (Array.isArray(value) && value.length === 0) {
      return 'cannot be empty';
    }
    if (typeof value === 'string' && value.trim().length === 0) {
      return 'cannot be empty';
    }
    return true;
  },
  combine: (...validators: Array<(value: any) => boolean | string>) => {
    return (value: any): boolean | string => {
      for (const validator of validators) {
        const result = validator(value);
        if (result !== true) {
          return result;
        }
      }
      return true;
    };
  },
};
