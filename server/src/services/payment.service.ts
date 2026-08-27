import crypto from 'node:crypto';
import { db } from '../database/database.js';
import { ledgerService } from './ledger.service.js';
import { fraudEngine } from './fraud-engine.service.js';
import { webhookDispatcher } from './webhook-dispatcher.service.js';
import {
  PaymentIntent,
  PaymentIntentStatus,
  Charge,
  Refund,
  CurrencyCode,
  PaymentMethodType,
  PaymentMethod,
  calculateProcessingFee,
  isValidLuhn,
  detectCardBrand,
  formatMaskedCard,
} from '@paynexa/core';

export class PaymentService {
  /**
   * Creates a new PaymentIntent with fee calculation and initial risk evaluation
   */
  public createIntent(params: {
    merchantId: string;
    amountCents: number;
    currency: CurrencyCode;
    customerId?: string;
    description?: string;
    statementDescriptor?: string;
    receiptEmail?: string;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
  }): PaymentIntent {
    if (params.amountCents <= 0) {
      throw new Error('Payment amount must be a positive integer in minor units (cents).');
    }

    const { feeCents, netAmountCents } = calculateProcessingFee(params.amountCents);
    const intentId = `pi_${crypto.randomUUID()}`;
    const clientSecret = `pi_${intentId}_secret_${crypto.randomBytes(16).toString('hex')}`;
    const now = new Date().toISOString();

    const intent: PaymentIntent = {
      id: intentId,
      merchantId: params.merchantId,
      customerId: params.customerId,
      amountCents: params.amountCents,
      currency: params.currency,
      feeCents,
      netAmountCents,
      status: 'REQUIRES_PAYMENT_METHOD',
      description: params.description || 'Payment via PayNexa Gateway',
      statementDescriptor: params.statementDescriptor || 'PAYNEXA*ONLINE',
      receiptEmail: params.receiptEmail,
      idempotencyKey: params.idempotencyKey,
      clientSecret,
      metadata: params.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    db.table('paymentIntents').insert(intent);

    webhookDispatcher.dispatchEvent('payment_intent.created', intent.merchantId, intent);
    return intent;
  }

  public getIntent(id: string): PaymentIntent | undefined {
    return db.table('paymentIntents').get(id);
  }

  public listIntents(merchantId?: string, limit: number = 50): PaymentIntent[] {
    const list = merchantId
      ? db.table('paymentIntents').find((pi) => pi.merchantId === merchantId)
      : db.table('paymentIntents').all();
    return list.slice(-limit).reverse();
  }

  /**
   * Confirms payment with payment method details (Card, UPI, ACH, etc.)
   */
  public async confirmIntent(
    intentId: string,
    params: {
      paymentMethodType: PaymentMethodType;
      card?: {
        cardNumber: string;
        expMonth: number;
        expYear: number;
        cvv: string;
        holderName: string;
      };
      upi?: { vpa: string };
      bank?: { routingNumber: string; accountNumber: string; bankName: string };
      ipAddress?: string;
      deviceFingerprint?: string;
    }
  ): Promise<PaymentIntent> {
    const intent = db.table('paymentIntents').get(intentId);
    if (!intent) throw new Error(`PaymentIntent not found: ${intentId}`);

    if (intent.status === 'SUCCEEDED') {
      return intent;
    }
    if (intent.status === 'CANCELED' || intent.status === 'FAILED') {
      throw new Error(`Cannot confirm payment intent with status: ${intent.status}`);
    }

    let paymentMethod: PaymentMethod;
    let cardCountry = 'US';
    let cardBin = '';

    // Validate payment method
    if (params.paymentMethodType === 'CARD') {
      if (!params.card) throw new Error('Card details are required for CARD payment method.');
      const cleanPan = params.card.cardNumber.replace(/\D/g, '');
      if (!isValidLuhn(cleanPan)) {
        throw new Error('Invalid card number: Failed Luhn algorithm checksum.');
      }

      cardBin = cleanPan.slice(0, 6);
      const brand = detectCardBrand(cleanPan);
      const last4 = cleanPan.slice(-4);

      paymentMethod = {
        id: `pm_${crypto.randomUUID()}`,
        customerId: intent.customerId || 'cust_guest',
        type: 'CARD',
        card: {
          brand,
          last4,
          expMonth: params.card.expMonth,
          expYear: params.card.expYear,
          funding: 'CREDIT',
          country: cardCountry,
          fingerprint: `fp_${crypto.createHash('sha256').update(cleanPan).digest('hex').slice(0, 16)}`,
          holderName: params.card.holderName,
        },
        isDefault: true,
        createdAt: new Date().toISOString(),
      };
    } else if (params.paymentMethodType === 'UPI') {
      if (!params.upi?.vpa || !params.upi.vpa.includes('@')) {
        throw new Error('Invalid UPI Virtual Payment Address (VPA). Format: username@bank');
      }
      paymentMethod = {
        id: `pm_${crypto.randomUUID()}`,
        customerId: intent.customerId || 'cust_guest',
        type: 'UPI',
        upi: { vpa: params.upi.vpa },
        isDefault: true,
        createdAt: new Date().toISOString(),
      };
    } else {
      paymentMethod = {
        id: `pm_${crypto.randomUUID()}`,
        customerId: intent.customerId || 'cust_guest',
        type: params.paymentMethodType,
        bank: params.bank,
        isDefault: true,
        createdAt: new Date().toISOString(),
      };
    }

    db.table('paymentMethods').insert(paymentMethod);

    // Fraud Evaluation
    const assessment = fraudEngine.evaluateTransaction({
      paymentIntentId: intent.id,
      amountCents: intent.amountCents,
      currency: intent.currency,
      customerId: intent.customerId,
      ipAddress: params.ipAddress || '192.168.1.100',
      ipCountry: 'US',
      cardCountry,
      cardBin,
      cardFingerprint: paymentMethod.card?.fingerprint,
      deviceFingerprint: params.deviceFingerprint,
    });

    // Check if declined by fraud engine
    if (assessment.decision === 'DECLINE') {
      const updated = db.table('paymentIntents').update(intent.id, {
        status: 'FAILED',
        failureReason: 'Transaction declined due to high risk fraud detection score.',
        riskScore: assessment.totalRiskScore,
        riskDecision: assessment.decision,
      });

      webhookDispatcher.dispatchEvent('payment_intent.payment_failed', intent.merchantId, updated);
      throw new Error(`Payment declined: High risk score (${assessment.totalRiskScore}/100)`);
    }

    // Check if 3D Secure OTP Challenge is required
    if (assessment.decision === 'CHALLENGE_3DS' || (params.paymentMethodType === 'CARD' && intent.amountCents > 15000)) {
      const simulatedOtp = '123456';
      const updated = db.table('paymentIntents').update(intent.id, {
        status: 'REQUIRES_ACTION',
        paymentMethodType: params.paymentMethodType,
        paymentMethodId: paymentMethod.id,
        riskScore: assessment.totalRiskScore,
        riskDecision: assessment.decision,
        threeDSecure: {
          required: true,
          challengeId: `3ds_${crypto.randomUUID()}`,
          otpCodeSimulator: simulatedOtp,
          frictionless: false,
          status: 'PENDING',
        },
      });

      webhookDispatcher.dispatchEvent('payment_intent.requires_action', intent.merchantId, updated);
      return updated;
    }

    // Direct Settlement (Frictionless / Approved)
    return this.settlePayment(intent.id, paymentMethod, assessment.totalRiskScore, assessment.decision);
  }

  /**
   * Verifies 3DS OTP Code and settles payment
   */
  public async verify3DsOtp(intentId: string, otpCode: string): Promise<PaymentIntent> {
    const intent = db.table('paymentIntents').get(intentId);
    if (!intent) throw new Error(`PaymentIntent not found: ${intentId}`);

    if (intent.status !== 'REQUIRES_ACTION' || !intent.threeDSecure) {
      throw new Error('PaymentIntent does not require 3D Secure verification.');
    }

    const expectedOtp = intent.threeDSecure.otpCodeSimulator || '123456';
    if (otpCode !== expectedOtp && otpCode !== '000000') {
      throw new Error('Invalid OTP Code. Please enter the simulated OTP shown in test sandbox.');
    }

    const paymentMethod = intent.paymentMethodId
      ? db.table('paymentMethods').get(intent.paymentMethodId)
      : undefined;

    return this.settlePayment(
      intent.id,
      paymentMethod || {
        id: 'pm_fallback',
        customerId: intent.customerId || 'cust_guest',
        type: 'CARD',
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
      intent.riskScore || 20,
      'APPROVE'
    );
  }

  /**
   * Executes Double-Entry Ledger Bookkeeping and Marks Payment Succeeded
   */
  private settlePayment(
    intentId: string,
    paymentMethod: PaymentMethod,
    riskScore: number,
    riskDecision: 'APPROVE' | 'CHALLENGE_3DS' | 'MANUAL_REVIEW' | 'REVIEW' | 'DECLINE'
  ): PaymentIntent {
    return db.transaction(() => {
      const intent = db.table('paymentIntents').get(intentId);
      if (!intent) throw new Error(`Intent not found: ${intentId}`);

      // Locate or create ledger accounts
      const merchantSettlementAcc = ledgerService.getAccountByCode(`ACC_MERCHANT_${intent.merchantId}_${intent.currency}`) ||
        ledgerService.createAccount({
          code: `ACC_MERCHANT_${intent.merchantId}_${intent.currency}`,
          name: `Merchant Settlement (${intent.merchantId})`,
          type: 'LIABILITY',
          category: 'MERCHANT_SETTLEMENT',
          currency: intent.currency,
          ownerId: intent.merchantId,
          ownerType: 'MERCHANT',
        });

      const schemeSettlementAcc = ledgerService.getAccountByCode(`ACC_SCHEME_CLEARING_${intent.currency}`) ||
        ledgerService.createAccount({
          code: `ACC_SCHEME_CLEARING_${intent.currency}`,
          name: `Scheme Clearing (${intent.currency})`,
          type: 'ASSET',
          category: 'SCHEME_SETTLEMENT',
          currency: intent.currency,
        });

      const platformFeesAcc = ledgerService.getAccountByCode(`ACC_PLATFORM_FEES_${intent.currency}`) ||
        ledgerService.createAccount({
          code: `ACC_PLATFORM_FEES_${intent.currency}`,
          name: `Platform Revenue Fees (${intent.currency})`,
          type: 'REVENUE',
          category: 'PLATFORM_FEES',
          currency: intent.currency,
        });

      // Post Double-Entry Journal Entry:
      // DEBIT Scheme Settlement (Asset increases by total amount)
      // CREDIT Merchant Settlement Account (Liability increases by net amount)
      // CREDIT Platform Fee Account (Revenue increases by fee amount)
      // Total Debits == Total Credits (Invariant preserved)
      ledgerService.postJournalEntry({
        referenceId: intent.id,
        type: 'PAYMENT_CAPTURE',
        description: `Payment capture for ${intent.id} (${intent.description || 'Checkout'})`,
        baseCurrency: intent.currency,
        postings: [
          {
            accountId: schemeSettlementAcc.id,
            direction: 'DEBIT',
            amountCents: intent.amountCents,
            currency: intent.currency,
            description: 'Inflow from payment scheme network',
          },
          {
            accountId: merchantSettlementAcc.id,
            direction: 'CREDIT',
            amountCents: intent.netAmountCents,
            currency: intent.currency,
            description: `Merchant payout allocation (net of fee ${intent.feeCents})`,
          },
          {
            accountId: platformFeesAcc.id,
            direction: 'CREDIT',
            amountCents: intent.feeCents,
            currency: intent.currency,
            description: 'PayNexa payment processing fee',
          },
        ],
        metadata: {
          paymentIntentId: intent.id,
          merchantId: intent.merchantId,
          paymentMethodType: paymentMethod.type,
        },
      });

      // Create Charge Record
      const chargeId = `ch_${crypto.randomUUID()}`;
      const charge: Charge = {
        id: chargeId,
        paymentIntentId: intent.id,
        merchantId: intent.merchantId,
        customerId: intent.customerId,
        amountCents: intent.amountCents,
        currency: intent.currency,
        amountRefundedCents: 0,
        feeCents: intent.feeCents,
        status: 'SUCCEEDED',
        paid: true,
        refunded: false,
        paymentMethodSnapshot: paymentMethod,
        createdAt: new Date().toISOString(),
      };
      db.table('charges').insert(charge);

      // Update Intent Status
      const now = new Date().toISOString();
      const updatedIntent = db.table('paymentIntents').update(intent.id, {
        status: 'SUCCEEDED',
        paymentMethodType: paymentMethod.type,
        paymentMethodId: paymentMethod.id,
        riskScore,
        riskDecision,
        capturedAt: now,
        threeDSecure: intent.threeDSecure
          ? { ...intent.threeDSecure, status: 'AUTHENTICATED' }
          : undefined,
      });

      webhookDispatcher.dispatchEvent('payment_intent.succeeded', intent.merchantId, updatedIntent);
      return updatedIntent;
    });
  }

  /**
   * Processes a Full or Partial Refund with Ledger Reversals
   */
  public async refundPayment(
    paymentIntentId: string,
    params: { amountCents?: number; reason?: 'DUPLICATE' | 'FRAUDULENT' | 'REQUESTED_BY_CUSTOMER' | 'EXPIRED_UNFULFILLED' }
  ): Promise<Refund> {
    return db.transaction(() => {
      const intent = db.table('paymentIntents').get(paymentIntentId);
      if (!intent) throw new Error(`PaymentIntent not found: ${paymentIntentId}`);
      if (intent.status !== 'SUCCEEDED') {
        throw new Error('Only successfully captured payment intents can be refunded.');
      }

      const charge = db.table('charges').findOne((c) => c.paymentIntentId === intent.id);
      if (!charge) throw new Error('Associated charge not found for intent');

      const refundAmountCents = params.amountCents || intent.amountCents;
      const availableToRefund = charge.amountCents - charge.amountRefundedCents;

      if (refundAmountCents <= 0 || refundAmountCents > availableToRefund) {
        throw new Error(`Invalid refund amount. Available to refund: ${availableToRefund} cents`);
      }

      const merchantSettlementAcc = ledgerService.getAccountByCode(`ACC_MERCHANT_${intent.merchantId}_${intent.currency}`);
      const schemeSettlementAcc = ledgerService.getAccountByCode(`ACC_SCHEME_CLEARING_${intent.currency}`);
      const platformFeesAcc = ledgerService.getAccountByCode(`ACC_PLATFORM_FEES_${intent.currency}`);

      if (!merchantSettlementAcc || !schemeSettlementAcc || !platformFeesAcc) {
        throw new Error('Ledger accounts for settlement not found');
      }

      // Calculate proportional fee reversal
      const proportion = refundAmountCents / intent.amountCents;
      const reversedFeeCents = Math.round(intent.feeCents * proportion);
      const merchantDebitCents = refundAmountCents - reversedFeeCents;

      const refundId = `re_${crypto.randomUUID()}`;

      // Post Double-Entry Refund Journal:
      // DEBIT Merchant Settlement Account (reduces merchant balance)
      // DEBIT Platform Fee Account (reverses platform fee)
      // CREDIT Scheme Clearing Account (returns funds to card network)
      ledgerService.postJournalEntry({
        referenceId: refundId,
        type: 'PAYMENT_REFUND',
        description: `Refund for ${intent.id} (${params.reason || 'Customer request'})`,
        baseCurrency: intent.currency,
        postings: [
          {
            accountId: merchantSettlementAcc.id,
            direction: 'DEBIT',
            amountCents: merchantDebitCents,
            currency: intent.currency,
            description: `Merchant refund deduction`,
          },
          {
            accountId: platformFeesAcc.id,
            direction: 'DEBIT',
            amountCents: reversedFeeCents,
            currency: intent.currency,
            description: `Platform fee refund reversal`,
          },
          {
            accountId: schemeSettlementAcc.id,
            direction: 'CREDIT',
            amountCents: refundAmountCents,
            currency: intent.currency,
            description: `Scheme clearing cardholder refund credit`,
          },
        ],
      });

      const updatedRefunded = charge.amountRefundedCents + refundAmountCents;
      db.table('charges').update(charge.id, {
        amountRefundedCents: updatedRefunded,
        refunded: updatedRefunded >= charge.amountCents,
      });

      const refund: Refund = {
        id: refundId,
        chargeId: charge.id,
        paymentIntentId: intent.id,
        merchantId: intent.merchantId,
        amountCents: refundAmountCents,
        currency: intent.currency,
        reason: params.reason || 'REQUESTED_BY_CUSTOMER',
        status: 'SUCCEEDED',
        createdAt: new Date().toISOString(),
      };

      db.table('refunds').insert(refund);
      webhookDispatcher.dispatchEvent('charge.refunded', intent.merchantId, refund);

      return refund;
    });
  }
}

export const paymentService = new PaymentService();
