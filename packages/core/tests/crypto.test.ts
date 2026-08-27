import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateWebhookSignature,
  verifyWebhookSignature,
  isValidLuhn,
  generateTestPan,
  toMinorUnits,
  toMajorUnits,
  formatCurrency,
  calculateProcessingFee,
  convertCurrency,
} from '../dist/index.js';

describe('@paynexa/core Utilities', () => {
  it('should generate and verify valid webhook signatures', () => {
    const payload = JSON.stringify({ event: 'payment_intent.succeeded', id: 'pi_123' });
    const secret = 'whsec_test_secret_key_2026';
    const sig = generateWebhookSignature(payload, secret);

    const result = verifyWebhookSignature(payload, sig, secret);
    assert.strictEqual(result.isValid, true);
  });

  it('should reject tampered webhook payloads', () => {
    const payload = JSON.stringify({ event: 'payment_intent.succeeded', id: 'pi_123' });
    const tampered = JSON.stringify({ event: 'payment_intent.succeeded', id: 'pi_TAMPERED' });
    const secret = 'whsec_test_secret_key_2026';
    const sig = generateWebhookSignature(payload, secret);

    const result = verifyWebhookSignature(tampered, sig, secret);
    assert.strictEqual(result.isValid, false);
  });

  it('should validate Luhn card algorithm', () => {
    const pan = generateTestPan('VISA');
    assert.strictEqual(isValidLuhn(pan), true);
    assert.strictEqual(isValidLuhn('4532000000000000'), false);
  });

  it('should compute financial precision without IEEE float errors', () => {
    assert.strictEqual(toMinorUnits(19.99, 'USD'), 1999);
    assert.strictEqual(toMajorUnits(1999, 'USD'), 19.99);
    assert.strictEqual(formatCurrency(125050, 'USD'), '$1,250.50');

    const fee = calculateProcessingFee(10000); // $100 -> 2.9% + $0.30 = $3.20 -> 320 cents
    assert.strictEqual(fee.feeCents, 320);
    assert.strictEqual(fee.netAmountCents, 9680);
  });
});
