import { Request, Response, NextFunction } from 'express';
import { db } from '../database/database.js';
import { hashApiKey } from '@paynexa/core';

export interface AuthenticatedRequest extends Request {
  merchantId?: string;
  userId?: string;
  apiKeyType?: 'PUBLISHABLE' | 'SECRET';
  userRole?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;

  let token = apiKeyHeader;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // Allow public checkout endpoints and healthchecks without auth
  const publicPaths = ['/health', '/api/v1/health', '/api/v1/payments/intents/', '/confirm', '/verify-3ds', '/rates'];
  const isPublic = publicPaths.some((p) => req.path.includes(p)) || req.method === 'OPTIONS';

  if (!token) {
    if (isPublic) {
      req.merchantId = 'merch_demo_1';
      req.userRole = 'MERCHANT_DEV';
      return next();
    }
    // For development convenience in frontend sandbox, fallback to default demo merchant
    req.merchantId = 'merch_demo_1';
    req.userId = 'usr_alex_chen';
    req.userRole = 'MERCHANT_OWNER';
    return next();
  }

  // Lookup API key in database
  const keyHash = hashApiKey(token);
  const foundKey = db.table('apiKeys').findOne((k) => k.keyHash === keyHash);

  if (foundKey) {
    req.merchantId = foundKey.merchantId;
    req.apiKeyType = foundKey.type;
    req.userRole = foundKey.type === 'SECRET' ? 'MERCHANT_OWNER' : 'MERCHANT_DEV';
    db.table('apiKeys').update(foundKey.id, { lastUsedAt: new Date().toISOString() });
    return next();
  }

  // Fallback demo key for rapid sandbox testing
  if (token.startsWith('sk_') || token.startsWith('pk_')) {
    req.merchantId = 'merch_demo_1';
    req.userRole = 'MERCHANT_OWNER';
    return next();
  }

  res.status(401).json({
    success: false,
    error: {
      code: 'authentication_failed',
      message: 'Invalid or expired API Key provided in Authorization header.',
    },
  });
}
