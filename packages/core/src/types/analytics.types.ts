import { CurrencyCode } from './ledger.types.js';

export interface VolumeDataPoint {
  timestamp: string; // ISO date / hour
  volumeCents: number;
  transactionCount: number;
  successfulCount: number;
  failedCount: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  volumeCents: number;
  percentage: number;
}

export interface PlatformMetrics {
  totalPaymentVolumeCents: number;
  grossRevenueCents: number;
  netRevenueCents: number;
  totalTransactions: number;
  successRatePercentage: number;
  averageTransactionValueCents: number;
  disputeRatePercentage: number;
  totalRefundedCents: number;
  activeCardsCount: number;
  activeMerchantsCount: number;
  activeConsumersCount: number;
  currency: CurrencyCode;
}

export interface MerchantAnalyticsOverview {
  merchantId: string;
  currency: CurrencyCode;
  metrics: PlatformMetrics;
  timeseries: VolumeDataPoint[];
  methodBreakdown: PaymentMethodBreakdown[];
  recentRiskAlertsCount: number;
}
