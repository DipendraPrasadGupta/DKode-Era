import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.status || 500;
  const isProd = env.NODE_ENV === 'production';

  // Log full details server-side always
  console.error(`[ERROR] [${req.method}] ${req.url} - Status ${statusCode} - ${err.message}`);
  if (err.stack) console.error(err.stack);

  // In production: never expose internal error messages or Prisma details
  let clientMessage = err.message;
  if (isProd && statusCode === 500) {
    clientMessage = 'An internal server error occurred. Please try again later.';
  }
  // Strip Prisma error details even in dev for security
  if (clientMessage?.includes('prisma') || clientMessage?.includes('PrismaClient')) {
    clientMessage = 'Database operation failed.';
  }

  res.status(statusCode).json({
    error: clientMessage,
    // Only include stack in development and only for non-500s
    ...(!isProd && statusCode !== 500 && { stack: err.stack }),
  });
};

