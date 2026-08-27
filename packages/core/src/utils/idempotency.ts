import crypto from 'node:crypto';

/**
 * Creates a deterministic SHA-256 hash of a request payload
 */
export function computeRequestPayloadHash(body: unknown, path: string, method: string): string {
  const content = `${method.toUpperCase()}:${path}:${typeof body === 'string' ? body : JSON.stringify(body || {})}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Validates whether a provided idempotency key string conforms to UUID / secure token standards
 */
export function isValidIdempotencyKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  // Key should be between 8 and 128 characters, alphanumeric with hyphens/underscores
  return /^[a-zA-Z0-9_-]{8,128}$/.test(key);
}
