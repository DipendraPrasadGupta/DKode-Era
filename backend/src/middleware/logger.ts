import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    // Pick color/emoji based on status code
    let statusIndicator = '🟢';
    if (statusCode >= 400 && statusCode < 500) {
      statusIndicator = '🟡';
    } else if (statusCode >= 500) {
      statusIndicator = '🔴';
    }
    
    console.log(
      `[API] ${statusIndicator} [${method}] ${originalUrl} - Status: ${statusCode} - ${duration}ms`
    );
  });
  
  next();
};
