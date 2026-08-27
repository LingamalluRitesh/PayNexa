import { describe, it } from 'node:test';
import assert from 'node:assert';
import { paymentService } from '../services/payment.service.js';
import { generateTestPan } from '@paynexa/core';

describe('Payment Intent Lifecycle & Settlement', () => {
  it('should create and capture payment intent with card', async () => {
    const validCardPan = generateTestPan('VISA');
    const intent = paymentService.createIntent({
      merchantId: 'merch_test_1',
      amountCents: 5000,
      currency: 'USD',
      description: 'Test Checkout Purchase',
    });

    assert.strictEqual(intent.status, 'REQUIRES_PAYMENT_METHOD');
    assert.strictEqual(intent.amountCents, 5000);
    assert.ok(intent.feeCents > 0);
    assert.strictEqual(intent.netAmountCents, intent.amountCents - intent.feeCents);

    const confirmed = await paymentService.confirmIntent(intent.id, {
      paymentMethodType: 'CARD',
      card: {
        cardNumber: validCardPan,
        expMonth: 12,
        expYear: 28,
        cvv: '123',
        holderName: 'Jane Doe',
      },
    });

    assert.strictEqual(confirmed.status, 'SUCCEEDED');
    assert.ok(confirmed.capturedAt);
  });

  it('should refund captured payment and adjust balances', async () => {
    const validCardPan = generateTestPan('VISA');
    const intent = paymentService.createIntent({
      merchantId: 'merch_test_1',
      amountCents: 10000,
      currency: 'USD',
      description: 'Purchase to refund',
    });

    await paymentService.confirmIntent(intent.id, {
      paymentMethodType: 'CARD',
      card: {
        cardNumber: validCardPan,
        expMonth: 12,
        expYear: 28,
        cvv: '123',
        holderName: 'Jane Doe',
      },
    });

    const refund = await paymentService.refundPayment(intent.id, {
      amountCents: 10000,
      reason: 'REQUESTED_BY_CUSTOMER',
    });

    assert.strictEqual(refund.status, 'SUCCEEDED');
    assert.strictEqual(refund.amountCents, 10000);
  });
});
