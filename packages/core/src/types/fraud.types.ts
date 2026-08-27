import { CurrencyCode } from './ledger.types.js';

export type FraudDecision = 'APPROVE' | 'CHALLENGE_3DS' | 'MANUAL_REVIEW' | 'DECLINE';

export type RuleConditionType = 
  | 'AMOUNT_GREATER_THAN'
  | 'VELOCITY_COUNT_EXCEEDED'
  | 'VELOCITY_VOLUME_EXCEEDED'
  | 'IP_COUNTRY_MISMATCH'
  | 'CARD_BIN_BLACKLISTED'
  | 'HIGH_RISK_MCC'
  | 'SUSPICIOUS_EMAIL_DOMAIN'
  | 'DEVICE_FINGERPRINT_ALTERED';

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  conditionType: RuleConditionType;
  thresholdValue: string | number;
  timeWindowSeconds?: number;
  riskPoints: number; // 0 - 100 added to overall score if triggered
  actionIfTriggered: FraudDecision;
  isEnabled: boolean;
  isSystemRule: boolean;
  createdAt: string;
}

export interface RiskFactor {
  ruleId: string;
  ruleName: string;
  riskPoints: number;
  message: string;
}

export interface FraudAssessment {
  id: string;
  paymentIntentId?: string;
  totalRiskScore: number; // 0 - 100
  decision: FraudDecision;
  factors: RiskFactor[];
  evaluatedAt: string;
  ipAddress?: string;
  ipCountry?: string;
  cardCountry?: string;
  deviceFingerprint?: string;
  isReviewed: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface BlacklistEntry {
  id: string;
  type: 'IP_ADDRESS' | 'EMAIL' | 'CARD_FINGERPRINT' | 'CARD_BIN';
  value: string;
  reason: string;
  addedBy: string;
  createdAt: string;
}
