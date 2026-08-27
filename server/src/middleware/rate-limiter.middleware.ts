import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const buckets = new Map<string, RateLimitBucket>();

export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = config.RATE_LIMIT_WINDOW_MS;
  const maxRequests = config.RATE_LIMIT_MAX_REQUESTS;

  let bucket = buckets.get(clientIp);

  if (!bucket || now > bucket.resetTime) {
    bucket = {
      count: 1,
      resetTime: now + windowMs,
    };
    buckets.set(clientIp, bucket);
  } else {
    bucket.count++;
  }

  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - bucket.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetTime / 1000));

  if (bucket.count > maxRequests) {
    res.status(429).json({
      success: false,
      error: {
        code: 'rate_limit_exceeded',
        message: 'Too many requests. Please throttle your API consumption.',
      },
    });
    return;
  }

  next();
}
