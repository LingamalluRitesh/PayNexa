import { CurrencyCode } from './ledger.types.js';

export type CardType = 'VIRTUAL' | 'PHYSICAL';
export type CardFormFactor = 'SINGLE_USE' | 'RECURRING_SUBSCRIPTION' | 'GENERAL_PURPOSE';
export type CardStatus = 'ACTIVE' | 'FROZEN' | 'TERMINATED' | 'PENDING_ACTIVATION';

export interface CardSpendingLimits {
  perTransactionMaxCents: number;
  dailyMaxCents: number;
  monthlyMaxCents: number;
  currentDaySpentCents: number;
  currentMonthSpentCents: number;
}

export interface CardMerchantRestrictions {
  allowedMccCodes?: string[]; // Merchant Category Codes (e.g. 5411 = Grocery, 5732 = Electronics)
  blockedMccCodes?: string[];
  allowedCountries?: string[];
  singleMerchantLockName?: string; // If locked to e.g. "AWS" or "Netflix"
}

export interface VirtualCard {
  id: string;
  userId: string;
  panMasked: string; // e.g. 4532 •••• •••• 8821
  panEncrypted?: string; // For reveal in secure UI
  last4: string;
  cardholderName: string;
  expMonth: number;
  expYear: number;
  cvvEncrypted?: string;
  brand: 'VISA' | 'MASTERCARD';
  type: CardType;
  formFactor: CardFormFactor;
  status: CardStatus;
  currency: CurrencyCode;
  balanceLimitCents: number;
  spendingLimits: CardSpendingLimits;
  restrictions: CardMerchantRestrictions;
  isBurnOnUse: boolean;
  timesUsed: number;
  billingAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CardAuthorizationRequest {
  cardId: string;
  merchantName: string;
  mcc: string;
  amountCents: number;
  currency: CurrencyCode;
  terminalType: 'ONLINE' | 'POS' | 'RECURRING';
}

export interface CardAuthorizationResult {
  authorized: boolean;
  authorizationCode?: string;
  declineReason?: 
    | 'INSUFFICIENT_FUNDS'
    | 'CARD_FROZEN'
    | 'CARD_EXPIRED'
    | 'DAILY_LIMIT_EXCEEDED'
    | 'MONTHLY_LIMIT_EXCEEDED'
    | 'PER_TRANSACTION_LIMIT_EXCEEDED'
    | 'MCC_BLOCKED'
    | 'COUNTRY_RESTRICTED'
    | 'BURN_CARD_ALREADY_USED';
  remainingDailyLimitCents: number;
  remainingMonthlyLimitCents: number;
}
