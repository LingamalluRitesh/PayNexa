import { CurrencyCode } from './ledger.types.js';

export type UserRole = 'ADMIN' | 'COMPLIANCE_OFFICER' | 'MERCHANT_OWNER' | 'MERCHANT_DEV' | 'CONSUMER';

export type KycStatus = 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
export type KycDocumentType = 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'BUSINESS_INCORPORATION';

export interface KycVerification {
  id: string;
  userId: string;
  merchantId?: string;
  documentType: KycDocumentType;
  documentNumberMasked: string;
  fullName: string;
  dateOfBirth?: string;
  country: string;
  addressLine: string;
  status: KycStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  verifiedAt?: string;
  rejectionReason?: string;
  reviewerNotes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  merchantId?: string;
  defaultCurrency: CurrencyCode;
  kycStatus: KycStatus;
  isTwoFactorEnabled: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  merchantId: string;
  name: string;
  keyPrefix: string; // e.g. "pk_live_" or "sk_live_"
  keyRedacted: string; // e.g. "sk_live_...9f8b"
  keyHash: string; // SHA-256 hash for secure DB lookup
  type: 'PUBLISHABLE' | 'SECRET';
  environment: 'TEST' | 'LIVE';
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}
