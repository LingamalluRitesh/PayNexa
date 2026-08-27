import { CurrencyCode } from './ledger.types.js';

export type BillingInterval = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID';

export interface Plan {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  amountCents: number;
  currency: CurrencyCode;
  interval: BillingInterval;
  intervalCount: number;
  trialPeriodDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  merchantId: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialEnd?: string;
  defaultPaymentMethodId?: string;
  latestInvoiceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amountCents: number;
  currency: CurrencyCode;
  quantity: number;
}

export interface Invoice {
  id: string;
  merchantId: string;
  customerId: string;
  subscriptionId?: string;
  number: string; // e.g. INV-2026-0042
  amountDueCents: number;
  amountPaidCents: number;
  amountRemainingCents: number;
  currency: CurrencyCode;
  status: 'DRAFT' | 'OPEN' | 'PAID' | 'UNCOLLECTIBLE' | 'VOID';
  items: InvoiceItem[];
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}
