import { Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { db } from '../database/database.js';
import { AuthenticatedRequest } from './auth.middleware.js';
import { computeRequestPayloadHash, isValidIdempotencyKey } from '@paynexa/core';

export function idempotencyMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

  // Only apply to state-modifying requests that supply the header
  if (!idempotencyKey || (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH')) {
    return next();
  }

  if (!isValidIdempotencyKey(idempotencyKey)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'invalid_idempotency_key',
        message: 'Idempotency-Key must be 8-128 alphanumeric characters, underscores, or hyphens.',
      },
    });
    return;
  }

  const merchantId = req.merchantId || 'default';
  const requestHash = computeRequestPayloadHash(req.body, req.path, req.method);

  // Check if idempotency key was previously processed
  const cached = db.table('idempotency').findOne(
    (entry) => entry.key === idempotencyKey && entry.merchantId === merchantId
  );

  if (cached) {
    if (cached.requestHash !== requestHash) {
      res.status(409).json({
        success: false,
        error: {
          code: 'idempotency_payload_mismatch',
          message: 'An existing request was already made with this Idempotency-Key using a different payload.',
        },
      });
      return;
    }

    // Return cached response
    res.setHeader('Idempotent-Replay', 'true');
    res.status(cached.responseStatus).send(JSON.parse(cached.responseBody));
    return;
  }

  // Intercept the response to capture and cache it
  const originalJson = res.json.bind(res);

  res.json = function (body: unknown): Response {
    try {
      db.table('idempotency').insert({
        id: `idem_${crypto.randomUUID()}`,
        key: idempotencyKey,
        merchantId,
        path: req.path,
        requestHash,
        responseStatus: res.statusCode,
        responseBody: JSON.stringify(body),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
      });
    } catch (err) {
      console.error('Failed to store idempotency record:', err);
    }

    return originalJson(body);
  };

  next();
}
