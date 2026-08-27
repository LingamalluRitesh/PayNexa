import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const requestId = `req_${crypto.randomUUID().slice(0, 8)}`;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    // Concise request log
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms) - req:${requestId}`);
    }
  });

  next();
}

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = res.getHeader('X-Request-Id') as string | undefined;

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = (err as { statusCode?: number }).statusCode || 500;
  const code = (err as { code?: string }).code || 'internal_server_error';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message || 'An unexpected error occurred processing your request.',
      requestId,
    },
  });
}
