import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { db } from '../database/database.js';
import { generateApiKey, ApiKey } from '@paynexa/core';

export const authRouter = Router();

authRouter.get('/me', (req: AuthenticatedRequest, res: Response) => {
  const user = db.table('users').get(req.userId || 'usr_alex_chen') || {
    id: 'usr_alex_chen',
    email: 'alex.chen@acmecommerce.io',
    name: 'Alex Chen',
    role: 'MERCHANT_OWNER',
    merchantId: 'merch_demo_1',
    defaultCurrency: 'USD',
    kycStatus: 'VERIFIED',
    isTwoFactorEnabled: true,
    createdAt: new Date().toISOString(),
  };

  res.json({ success: true, data: user });
});

authRouter.get('/api-keys', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId || 'merch_demo_1';
  const keys = db.table('apiKeys').find((k) => k.merchantId === merchantId);
  res.json({ success: true, data: keys });
});

authRouter.post('/api-keys', (req: AuthenticatedRequest, res: Response) => {
  try {
    const merchantId = req.merchantId || req.body.merchantId || 'merch_demo_1';
    const type = req.body.type || 'SECRET';
    const env = req.body.environment || 'LIVE';
    const name = req.body.name || (type === 'SECRET' ? 'Secret Key' : 'Publishable Key');

    const generated = generateApiKey(type, env);

    const apiKey: ApiKey = {
      id: `key_${crypto.randomUUID()}`,
      merchantId,
      name,
      keyPrefix: generated.keyPrefix,
      keyRedacted: generated.keyRedacted,
      keyHash: generated.keyHash,
      type,
      environment: env,
      createdAt: new Date().toISOString(),
    };

    db.table('apiKeys').insert(apiKey);

    // Return rawKey ONLY upon creation
    res.status(201).json({
      success: true,
      data: {
        ...apiKey,
        rawKey: generated.rawKey,
      },
    });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'key_creation_failed', message: (err as Error).message } });
  }
});

authRouter.delete('/api-keys/:id', (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.table('apiKeys').delete(req.params.id);
  res.json({ success: deleted });
});
