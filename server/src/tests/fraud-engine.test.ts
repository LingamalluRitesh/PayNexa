import { describe, it } from 'node:test';
import assert from 'node:assert';
import { fraudEngine } from '../services/fraud-engine.service.js';

describe('Fraud & Risk Detection Engine', () => {
  it('should approve standard low-risk transaction', () => {
    const assessment = fraudEngine.evaluateTransaction({
      amountCents: 2500, // $25.00
      currency: 'USD',
      ipAddress: '192.168.1.50',
      ipCountry: 'US',
      cardCountry: 'US',
      cardBin: '453200',
    });

    assert.strictEqual(assessment.decision, 'APPROVE');
    assert.ok(assessment.totalRiskScore < 50);
  });

  it('should decline transaction from blacklisted IP address', () => {
    fraudEngine.addBlacklistEntry({
      type: 'IP_ADDRESS',
      value: '203.0.113.99',
      reason: 'Automated card testing bot',
      addedBy: 'test_suite',
    });

    const assessment = fraudEngine.evaluateTransaction({
      amountCents: 5000,
      currency: 'USD',
      ipAddress: '203.0.113.99',
      ipCountry: 'US',
      cardCountry: 'US',
    });

    assert.strictEqual(assessment.decision, 'DECLINE');
    assert.ok(assessment.totalRiskScore >= 85);
  });

  it('should trigger 3DS challenge on high risk or cross-border mismatch', () => {
    const assessment = fraudEngine.evaluateTransaction({
      amountCents: 1200000, // $12,000.00
      currency: 'USD',
      ipCountry: 'DE',
      cardCountry: 'US',
    });

    assert.ok(assessment.decision === 'CHALLENGE_3DS' || assessment.decision === 'DECLINE');
    assert.ok(assessment.factors.length > 0);
  });
});
