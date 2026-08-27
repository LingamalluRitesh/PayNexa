/**
 * PayNexa Core Banking & Double-Entry Ledger Types
 * 
 * Standard Accounting Equation:
 * Assets = Liabilities + Equity + (Revenue - Expenses)
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'CAD' | 'AUD' | 'SGD';

export type AccountType = 
  | 'ASSET'        // Bank balances, receivables, cash in transit
  | 'LIABILITY'    // Customer balances, merchant stored value, unpaid payables
  | 'EQUITY'       // Platform capital, retained earnings
  | 'REVENUE'      // Processing fees, FX margins, interchange income
  | 'EXPENSE';     // Network fees, chargeback losses, operational overhead

export type AccountCategory = 
  | 'MERCHANT_SETTLEMENT'
  | 'CUSTOMER_WALLET'
  | 'PLATFORM_RESERVE'
  | 'PLATFORM_FEES'
  | 'SCHEME_SETTLEMENT'
  | 'DISPUTE_ESCROW'
  | 'FX_LIQUIDITY_POOL';

export type EntryDirection = 'DEBIT' | 'CREDIT';

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  currency: CurrencyCode;
  balanceCents: number; // Balance stored in minor units (e.g., cents, pence, paise)
  pendingHoldCents: number;
  availableBalanceCents: number;
  ownerId?: string; // Merchant ID or Customer User ID
  ownerType?: 'MERCHANT' | 'CUSTOMER' | 'PLATFORM';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Posting {
  id: string;
  journalEntryId: string;
  accountId: string;
  direction: EntryDirection;
  amountCents: number;
  currency: CurrencyCode;
  exchangeRate?: number; // Base currency exchange rate if multi-currency entry
  amountInBaseCents?: number;
  accountSnapshotBalanceCents?: number; // Account balance immediately following this posting
  description?: string;
  createdAt: string;
}

export type JournalStatus = 'POSTED' | 'PENDING' | 'REVERSED';

export type JournalTransactionType = 
  | 'PAYMENT_CAPTURE'
  | 'PAYMENT_REFUND'
  | 'P2P_TRANSFER'
  | 'WALLET_TOPUP'
  | 'WALLET_WITHDRAWAL'
  | 'MERCHANT_PAYOUT'
  | 'DISPUTE_HOLD'
  | 'DISPUTE_REVERSAL'
  | 'SUBSCRIPTION_CHARGE'
  | 'FX_CONVERSION'
  | 'INTERCHANGE_FEE'
  | 'PLATFORM_FEE_COLLECTION';

export interface JournalEntry {
  id: string;
  referenceId: string; // Idempotency reference (e.g. payment_intent_id, transfer_id)
  type: JournalTransactionType;
  status: JournalStatus;
  description: string;
  baseCurrency: CurrencyCode;
  totalDebitCents: number;
  totalCreditCents: number;
  postings: Posting[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  reversedAt?: string;
  reversalReason?: string;
}

export interface BalanceHold {
  id: string;
  accountId: string;
  amountCents: number;
  referenceType: 'PAYMENT_AUTHORIZATION' | 'DISPUTE_PENDING' | 'WITHDRAWAL_IN_TRANSIT';
  referenceId: string;
  status: 'ACTIVE' | 'RELEASED' | 'CAPTURED';
  expiresAt: string;
  createdAt: string;
}

export interface FxRatePair {
  baseCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
  rate: number;
  spreadBps: number; // Basis points added as spread (e.g. 50 = 0.5%)
  effectiveRate: number;
  updatedAt: string;
}

export interface LedgerAuditAssertion {
  isBalanced: boolean;
  totalSystemAssetsCents: number;
  totalSystemLiabilitiesCents: number;
  totalSystemEquityCents: number;
  totalSystemRevenueCents: number;
  totalSystemExpenseCents: number;
  netAccountingVarianceCents: number; // Must strictly equal 0
  unbalancedJournalsCount: number;
  auditedAt: string;
}
