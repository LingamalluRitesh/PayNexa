import { db } from '../database/database.js';
import {
  PlatformMetrics,
  VolumeDataPoint,
  PaymentMethodBreakdown,
  MerchantAnalyticsOverview,
  CurrencyCode,
} from '@paynexa/core';

export class AnalyticsService {
  public getPlatformMetrics(currency: CurrencyCode = 'USD'): PlatformMetrics {
    const intents = db.table('paymentIntents').all();
    const refunds = db.table('refunds').all();
    const cards = db.table('virtualCards').all();
    const disputes = db.table('disputes').all();
    const users = db.table('users').all();

    let totalPaymentVolumeCents = 0;
    let netRevenueCents = 0;
    let totalTransactions = intents.length;
    let successfulCount = 0;

    for (const intent of intents) {
      if (intent.status === 'SUCCEEDED') {
        totalPaymentVolumeCents += intent.amountCents;
        netRevenueCents += intent.feeCents;
        successfulCount++;
      }
    }

    let totalRefundedCents = 0;
    for (const r of refunds) {
      if (r.status === 'SUCCEEDED') {
        totalRefundedCents += r.amountCents;
      }
    }

    const successRatePercentage = totalTransactions > 0
      ? Number(((successfulCount / totalTransactions) * 100).toFixed(1))
      : 100;

    const disputeRatePercentage = totalTransactions > 0
      ? Number(((disputes.length / totalTransactions) * 100).toFixed(2))
      : 0;

    const averageTransactionValueCents = successfulCount > 0
      ? Math.round(totalPaymentVolumeCents / successfulCount)
      : 0;

    return {
      totalPaymentVolumeCents,
      grossRevenueCents: totalPaymentVolumeCents,
      netRevenueCents,
      totalTransactions,
      successRatePercentage,
      averageTransactionValueCents,
      disputeRatePercentage,
      totalRefundedCents,
      activeCardsCount: cards.filter((c) => c.status === 'ACTIVE').length,
      activeMerchantsCount: users.filter((u) => u.role === 'MERCHANT_OWNER').length || 3,
      activeConsumersCount: users.filter((u) => u.role === 'CONSUMER').length || 10,
      currency,
    };
  }

  public getTimeseries(merchantId?: string): VolumeDataPoint[] {
    const intents = merchantId
      ? db.table('paymentIntents').find((pi) => pi.merchantId === merchantId)
      : db.table('paymentIntents').all();

    // Group transactions by date
    const groups: Record<string, { volumeCents: number; total: number; success: number; failed: number }> = {};

    // Seed last 7 days keys
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      groups[key] = { volumeCents: 0, total: 0, success: 0, failed: 0 };
    }

    for (const intent of intents) {
      const key = intent.createdAt.split('T')[0];
      if (!groups[key]) {
        groups[key] = { volumeCents: 0, total: 0, success: 0, failed: 0 };
      }
      groups[key].total++;
      if (intent.status === 'SUCCEEDED') {
        groups[key].volumeCents += intent.amountCents;
        groups[key].success++;
      } else if (intent.status === 'FAILED') {
        groups[key].failed++;
      }
    }

    return Object.entries(groups).map(([timestamp, data]) => ({
      timestamp,
      volumeCents: data.volumeCents,
      transactionCount: data.total,
      successfulCount: data.success,
      failedCount: data.failed,
    }));
  }

  public getPaymentMethodBreakdown(merchantId?: string): PaymentMethodBreakdown[] {
    const intents = merchantId
      ? db.table('paymentIntents').find((pi) => pi.merchantId === merchantId && pi.status === 'SUCCEEDED')
      : db.table('paymentIntents').find((pi) => pi.status === 'SUCCEEDED');

    const counts: Record<string, { count: number; volumeCents: number }> = {
      CARD: { count: 0, volumeCents: 0 },
      UPI: { count: 0, volumeCents: 0 },
      BANK_TRANSFER_ACH: { count: 0, volumeCents: 0 },
      WALLET_BALANCE: { count: 0, volumeCents: 0 },
    };

    let totalVolume = 0;
    for (const intent of intents) {
      const method = intent.paymentMethodType || 'CARD';
      if (!counts[method]) counts[method] = { count: 0, volumeCents: 0 };
      counts[method].count++;
      counts[method].volumeCents += intent.amountCents;
      totalVolume += intent.amountCents;
    }

    return Object.entries(counts).map(([method, data]) => ({
      method,
      count: data.count,
      volumeCents: data.volumeCents,
      percentage: totalVolume > 0 ? Number(((data.volumeCents / totalVolume) * 100).toFixed(1)) : 0,
    }));
  }

  public getMerchantOverview(merchantId: string): MerchantAnalyticsOverview {
    const metrics = this.getPlatformMetrics();
    const timeseries = this.getTimeseries(merchantId);
    const methodBreakdown = this.getPaymentMethodBreakdown(merchantId);
    const recentAlerts = db.table('fraudAssessments').find((f) => f.totalRiskScore > 60).length;

    return {
      merchantId,
      currency: 'USD',
      metrics,
      timeseries,
      methodBreakdown,
      recentRiskAlertsCount: recentAlerts,
    };
  }
}

export const analyticsService = new AnalyticsService();
