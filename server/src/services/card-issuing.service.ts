import crypto from 'node:crypto';
import { db } from '../database/database.js';
import { webhookDispatcher } from './webhook-dispatcher.service.js';
import {
  VirtualCard,
  CardSpendingLimits,
  CardMerchantRestrictions,
  CardAuthorizationRequest,
  CardAuthorizationResult,
  CurrencyCode,
  generateTestPan,
  formatMaskedCard,
} from '@paynexa/core';

export class CardIssuingService {
  /**
   * Issues a new Virtual Card with customizable limits and security constraints
   */
  public issueCard(params: {
    userId: string;
    cardholderName: string;
    currency?: CurrencyCode;
    brand?: 'VISA' | 'MASTERCARD';
    formFactor?: 'SINGLE_USE' | 'RECURRING_SUBSCRIPTION' | 'GENERAL_PURPOSE';
    spendingLimits?: Partial<CardSpendingLimits>;
    restrictions?: CardMerchantRestrictions;
    billingAddress?: {
      line1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  }): VirtualCard {
    const brand = params.brand || 'VISA';
    const rawPan = generateTestPan(brand);
    const last4 = rawPan.slice(-4);
    const maskedPan = formatMaskedCard(rawPan);
    const cvv = Math.floor(100 + Math.random() * 900).toString();

    const now = new Date();
    const expMonth = now.getMonth() + 1;
    const expYear = (now.getFullYear() % 100) + 3; // 3 year expiry

    const cardId = `card_${crypto.randomUUID()}`;

    const defaultLimits: CardSpendingLimits = {
      perTransactionMaxCents: 50000,  // $500.00
      dailyMaxCents: 150000,          // $1,500.00
      monthlyMaxCents: 500000,        // $5,000.00
      currentDaySpentCents: 0,
      currentMonthSpentCents: 0,
      ...params.spendingLimits,
    };

    const card: VirtualCard = {
      id: cardId,
      userId: params.userId,
      panMasked: maskedPan,
      panEncrypted: rawPan, // Stored for secure test revealing
      last4,
      cardholderName: params.cardholderName,
      expMonth,
      expYear,
      cvvEncrypted: cvv,
      brand,
      type: 'VIRTUAL',
      formFactor: params.formFactor || 'GENERAL_PURPOSE',
      status: 'ACTIVE',
      currency: params.currency || 'USD',
      balanceLimitCents: defaultLimits.monthlyMaxCents,
      spendingLimits: defaultLimits,
      restrictions: params.restrictions || {},
      isBurnOnUse: params.formFactor === 'SINGLE_USE',
      timesUsed: 0,
      billingAddress: params.billingAddress || {
        line1: '100 Financial Way, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    db.table('virtualCards').insert(card);

    webhookDispatcher.dispatchEvent('card.issued', 'merch_platform', {
      cardId: card.id,
      userId: card.userId,
      last4: card.last4,
      brand: card.brand,
    });

    return card;
  }

  public getCard(id: string): VirtualCard | undefined {
    return db.table('virtualCards').get(id);
  }

  public listCards(userId?: string): VirtualCard[] {
    if (userId) {
      return db.table('virtualCards').find((c) => c.userId === userId);
    }
    return db.table('virtualCards').all();
  }

  /**
   * Toggles card freeze status
   */
  public toggleFreeze(cardId: string): VirtualCard {
    const card = db.table('virtualCards').get(cardId);
    if (!card) throw new Error(`Card not found: ${cardId}`);

    const newStatus = card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    const updated = db.table('virtualCards').update(cardId, { status: newStatus });

    if (newStatus === 'FROZEN') {
      webhookDispatcher.dispatchEvent('card.frozen', 'merch_platform', { cardId, status: newStatus });
    }

    return updated;
  }

  /**
   * Updates spending limits
   */
  public updateLimits(cardId: string, limits: Partial<CardSpendingLimits>): VirtualCard {
    const card = db.table('virtualCards').get(cardId);
    if (!card) throw new Error(`Card not found: ${cardId}`);

    const updatedLimits: CardSpendingLimits = {
      ...card.spendingLimits,
      ...limits,
    };

    return db.table('virtualCards').update(cardId, { spendingLimits: updatedLimits });
  }

  /**
   * Evaluates a simulated transaction authorization against card status and limits
   */
  public authorizeTransaction(req: CardAuthorizationRequest): CardAuthorizationResult {
    const card = db.table('virtualCards').get(req.cardId);
    if (!card) {
      return {
        authorized: false,
        declineReason: 'INSUFFICIENT_FUNDS',
        remainingDailyLimitCents: 0,
        remainingMonthlyLimitCents: 0,
      };
    }

    // Status check
    if (card.status !== 'ACTIVE') {
      return {
        authorized: false,
        declineReason: 'CARD_FROZEN',
        remainingDailyLimitCents: card.spendingLimits.dailyMaxCents - card.spendingLimits.currentDaySpentCents,
        remainingMonthlyLimitCents: card.spendingLimits.monthlyMaxCents - card.spendingLimits.currentMonthSpentCents,
      };
    }

    // Single use check
    if (card.isBurnOnUse && card.timesUsed >= 1) {
      return {
        authorized: false,
        declineReason: 'BURN_CARD_ALREADY_USED',
        remainingDailyLimitCents: 0,
        remainingMonthlyLimitCents: 0,
      };
    }

    // Per-transaction limit check
    if (req.amountCents > card.spendingLimits.perTransactionMaxCents) {
      return {
        authorized: false,
        declineReason: 'PER_TRANSACTION_LIMIT_EXCEEDED',
        remainingDailyLimitCents: card.spendingLimits.dailyMaxCents - card.spendingLimits.currentDaySpentCents,
        remainingMonthlyLimitCents: card.spendingLimits.monthlyMaxCents - card.spendingLimits.currentMonthSpentCents,
      };
    }

    // Daily limit check
    if (card.spendingLimits.currentDaySpentCents + req.amountCents > card.spendingLimits.dailyMaxCents) {
      return {
        authorized: false,
        declineReason: 'DAILY_LIMIT_EXCEEDED',
        remainingDailyLimitCents: card.spendingLimits.dailyMaxCents - card.spendingLimits.currentDaySpentCents,
        remainingMonthlyLimitCents: card.spendingLimits.monthlyMaxCents - card.spendingLimits.currentMonthSpentCents,
      };
    }

    // MCC Restriction check
    if (card.restrictions.blockedMccCodes?.includes(req.mcc)) {
      return {
        authorized: false,
        declineReason: 'MCC_BLOCKED',
        remainingDailyLimitCents: card.spendingLimits.dailyMaxCents - card.spendingLimits.currentDaySpentCents,
        remainingMonthlyLimitCents: card.spendingLimits.monthlyMaxCents - card.spendingLimits.currentMonthSpentCents,
      };
    }

    // Authorized! Increment usage and spent counters
    const newDaySpent = card.spendingLimits.currentDaySpentCents + req.amountCents;
    const newMonthSpent = card.spendingLimits.currentMonthSpentCents + req.amountCents;

    db.table('virtualCards').update(card.id, {
      timesUsed: card.timesUsed + 1,
      spendingLimits: {
        ...card.spendingLimits,
        currentDaySpentCents: newDaySpent,
        currentMonthSpentCents: newMonthSpent,
      },
    });

    return {
      authorized: true,
      authorizationCode: `AUTH_${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      remainingDailyLimitCents: Math.max(0, card.spendingLimits.dailyMaxCents - newDaySpent),
      remainingMonthlyLimitCents: Math.max(0, card.spendingLimits.monthlyMaxCents - newMonthSpent),
    };
  }
}

export const cardIssuingService = new CardIssuingService();
