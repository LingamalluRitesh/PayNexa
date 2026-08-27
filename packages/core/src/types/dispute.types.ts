import { CurrencyCode } from './ledger.types.js';

export type DisputeReason = 
  | 'FRAUDULENT'
  | 'UNRECOGNIZED'
  | 'PRODUCT_NOT_RECEIVED'
  | 'PRODUCT_UNACCEPTABLE'
  | 'SUBSCRIPTION_CANCELED'
  | 'DUPLICATE';

export type DisputeStatus = 
  | 'WARNING_NEEDS_RESPONSE'
  | 'UNDER_REVIEW'
  | 'WON'
  | 'LOST'
  | 'CHARGED_BACK';

export interface DisputeEvidence {
  customerName?: string;
  customerEmail?: string;
  customerPurchaseIp?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  receiptUrl?: string;
  customerCommunicationLog?: string;
  refundPolicyDisclaimer?: string;
  submittedAt?: string;
}

export interface Dispute {
  id: string;
  chargeId: string;
  paymentIntentId: string;
  merchantId: string;
  amountCents: number;
  feeCents: number; // Dispute processing fee (e.g. $15.00)
  currency: CurrencyCode;
  reason: DisputeReason;
  status: DisputeStatus;
  evidence: DisputeEvidence;
  dueByDate: string;
  isCoveredByReserve: boolean;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}
