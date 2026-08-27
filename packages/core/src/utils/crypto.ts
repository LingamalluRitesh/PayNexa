import crypto from 'node:crypto';

/**
 * Generates an HMAC-SHA256 signature for webhooks
 * Standard header format: t=timestamp,v1=signature
 */
export function generateWebhookSignature(payload: string, secret: string, timestamp?: number): string {
  const t = timestamp ?? Math.floor(Date.now() / 1000);
  const signedPayload = `${t}.${payload}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(signedPayload);
  const signature = hmac.digest('hex');
  return `t=${t},v1=${signature}`;
}

/**
 * Verifies an incoming HMAC-SHA256 signature against payload and secret
 */
export function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds: number = 300
): { isValid: boolean; error?: string } {
  try {
    const parts = signatureHeader.split(',');
    const timestampPart = parts.find((p) => p.startsWith('t='));
    const sigPart = parts.find((p) => p.startsWith('v1='));

    if (!timestampPart || !sigPart) {
      return { isValid: false, error: 'Malformed signature header format' };
    }

    const timestamp = parseInt(timestampPart.substring(2), 10);
    const signature = sigPart.substring(3);

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > toleranceSeconds) {
      return { isValid: false, error: 'Webhook timestamp expired tolerance window' };
    }

    const expectedSignature = generateWebhookSignature(payload, secret, timestamp);
    const expectedSigPart = expectedSignature.split(',v1=')[1];

    const actualBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expectedSigPart, 'hex');

    if (actualBuf.length !== expectedBuf.length) {
      return { isValid: false, error: 'Signature length mismatch' };
    }

    const isValid = crypto.timingSafeEqual(actualBuf, expectedBuf);
    return { isValid, error: isValid ? undefined : 'Invalid signature' };
  } catch (err: unknown) {
    return { isValid: false, error: (err as Error).message };
  }
}

/**
 * Generates a high-entropy cryptographically secure API key
 */
export function generateApiKey(type: 'PUBLISHABLE' | 'SECRET', env: 'TEST' | 'LIVE' = 'LIVE'): {
  rawKey: string;
  keyPrefix: string;
  keyRedacted: string;
  keyHash: string;
} {
  const prefix = type === 'PUBLISHABLE' ? `pk_${env.toLowerCase()}_` : `sk_${env.toLowerCase()}_`;
  const randomBytes = crypto.randomBytes(24).toString('base64url');
  const rawKey = `${prefix}${randomBytes}`;
  const keyRedacted = `${prefix}...${rawKey.slice(-4)}`;
  const keyHash = hashApiKey(rawKey);

  return {
    rawKey,
    keyPrefix: prefix,
    keyRedacted,
    keyHash,
  };
}

/**
 * Hashes an API key using SHA-256 for secure database index lookup
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Formats a raw 16-digit card number into masked format: 4532 •••• •••• 8821
 */
export function formatMaskedCard(pan: string): string {
  const clean = pan.replace(/\D/g, '');
  if (clean.length < 4) return '••••';
  const first4 = clean.slice(0, 4);
  const last4 = clean.slice(-4);
  return `${first4} •••• •••• ${last4}`;
}
