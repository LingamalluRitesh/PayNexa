import { CurrencyCode } from './ledger.types.js';

export type PaymentMethodType = 
  | 'CARD'
  | 'UPI'
  | 'BANK_TRANSFER_ACH'
  | 'BANK_TRANSFER_SEPA'
  | 'WALLET_BALANCE'
  | 'CRYPTO_STABLECOIN';

export type PaymentIntentStatus = 
  | 'REQUIRES_PAYMENT_METHOD'
  | 'REQUIRES_CONFIRMATION'
  | 'REQUIRES_ACTION'         // 3D Secure / OTP Verification needed
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'REQUIRES_CAPTURE'
  | 'CANCELED'
  | 'FAILED';

export type RefundStatus = 
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED';

export interface CardDetails {
  brand: 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER' | 'RUPAY' | 'UNKNOWN';
  last4: string;
  expMonth: number;
  expYear: number;
  funding: 'CREDIT' | 'DEBIT' | 'PREPAID';
  country: string;
  fingerprint: string;
  holderName?: string;
}

export interface UpiDetails {
  vpa: string; // Virtual Payment Address e.g. alex@okaxis
  payerName?: string;
}

export interface BankTransferDetails {
  routingNumber?: string;
  accountNumberMasked?: string;
  ibanMasked?: string;
  bankName?: string;
}

export interface PaymentMethod {
  id: string;
  customerId: string;
  type: PaymentMethodType;
  card?: CardDetails;
  upi?: UpiDetails;
  bank?: BankTransferDetails;
  isDefault: boolean;
  fingerprint?: string;
  createdAt: string;
}

export interface ThreeDSecureChallenge {
  required: boolean;
  challengeId?: string;
  otpCodeSimulator?: string; // Simulated 6-digit OTP for dev/sandbox verification
  acsUrl?: string;
  paresStatus?: 'Y' | 'N' | 'A' | 'U';
  frictionless: boolean;
  status: 'PENDING' | 'AUTHENTICATED' | 'FAILED';
}

export interface PaymentIntent {
  id: string;
  merchantId: string;
  customerId?: string;
  amountCents: number;
  currency: CurrencyCode;
  feeCents: number;
  netAmountCents: number;
  status: PaymentIntentStatus;
  paymentMethodType?: PaymentMethodType;
  paymentMethodId?: string;
  description?: string;
  statementDescriptor?: string;
  receiptEmail?: string;
  idempotencyKey?: string;
  clientSecret: string;
  threeDSecure?: ThreeDSecureChallenge;
  riskScore?: number;
  riskDecision?: 'APPROVE' | 'CHALLENGE_3DS' | 'MANUAL_REVIEW' | 'REVIEW' | 'DECLINE';
  metadata: Record<string, unknown>;
  capturedAt?: string;
  canceledAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Charge {
  id: string;
  paymentIntentId: string;
  merchantId: string;
  customerId?: string;
  amountCents: number;
  currency: CurrencyCode;
  amountRefundedCents: number;
  feeCents: number;
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
  paid: boolean;
  refunded: boolean;
  paymentMethodSnapshot: PaymentMethod;
  failureCode?: string;
  failureMessage?: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  chargeId: string;
  paymentIntentId: string;
  merchantId: string;
  amountCents: number;
  currency: CurrencyCode;
  reason: 'DUPLICATE' | 'FRAUDULENT' | 'REQUESTED_BY_CUSTOMER' | 'EXPIRED_UNFULFILLED';
  status: RefundStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Customer {
  id: string;
  merchantId?: string;
  email: string;
  name: string;
  phone?: string;
  currency: CurrencyCode;
  balanceCents: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
