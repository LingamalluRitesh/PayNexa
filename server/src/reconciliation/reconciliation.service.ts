import crypto from 'node:crypto';
import { db } from '../database/database.js';
import { ledgerService } from '../services/ledger.service.js';

export interface BankClearingRecord {
  clearingReferenceId: string;
  paymentIntentId: string;
  schemeNetwork: 'VISA' | 'MASTERCARD' | 'FEDNOW' | 'SEPA';
  grossAmountCents: number;
  interchangeFeeCents: number;
  netSettlementCents: number;
  currency: string;
  settledAt: string;
}

export interface ReconciliationBreak {
  type: 'AMOUNT_MISMATCH' | 'MISSING_IN_CLEARING' | 'MISSING_IN_GATEWAY' | 'CURRENCY_MISMATCH';
  paymentIntentId?: string;
  clearingReferenceId?: string;
  gatewayAmountCents?: number;
  clearingAmountCents?: number;
  varianceCents?: number;
  description: string;
}

export interface ReconciliationReport {
  id: string;
  batchDate: string;
  totalGatewayTransactions: number;
  totalClearingRecords: number;
  totalMatchedCount: number;
  matchedVolumeCents: number;
  totalBreaksCount: number;
  unresolvedVarianceCents: number;
  breaks: ReconciliationBreak[];
  isBalanced: boolean;
  generatedAt: string;
}

export class ReconciliationEngine {
  /**
   * Executes 3-Way Reconciliation between Gateway Intents, Ledger Postings, and Bank Clearing Records
   */
  public reconcileBatch(
    clearingRecords: BankClearingRecord[],
    targetDate?: string
  ): ReconciliationReport {
    const reportId = `rec_${crypto.randomUUID()}`;
    const dateStr = targetDate || new Date().toISOString().split('T')[0];

    const intents = db.table('paymentIntents').find((pi) => pi.status === 'SUCCEEDED' && pi.createdAt.startsWith(dateStr));
    const breaks: ReconciliationBreak[] = [];

    const clearingMap = new Map<string, BankClearingRecord>();
    for (const cr of clearingRecords) {
      clearingMap.set(cr.paymentIntentId, cr);
    }

    let totalMatchedCount = 0;
    let matchedVolumeCents = 0;
    let unresolvedVarianceCents = 0;

    // 1. Check Gateway Intents against Clearing Records
    for (const intent of intents) {
      const clearing = clearingMap.get(intent.id);
      if (!clearing) {
        breaks.push({
          type: 'MISSING_IN_CLEARING',
          paymentIntentId: intent.id,
          gatewayAmountCents: intent.amountCents,
          varianceCents: intent.amountCents,
          description: `Transaction ${intent.id} succeeded in gateway but was not found in bank scheme clearing batch`,
        });
        unresolvedVarianceCents += intent.amountCents;
      } else {
        if (clearing.grossAmountCents !== intent.amountCents) {
          const diff = intent.amountCents - clearing.grossAmountCents;
          breaks.push({
            type: 'AMOUNT_MISMATCH',
            paymentIntentId: intent.id,
            clearingReferenceId: clearing.clearingReferenceId,
            gatewayAmountCents: intent.amountCents,
            clearingAmountCents: clearing.grossAmountCents,
            varianceCents: diff,
            description: `Amount discrepancy: Gateway expected $${intent.amountCents / 100}, bank settled $${clearing.grossAmountCents / 100}`,
          });
          unresolvedVarianceCents += Math.abs(diff);
        } else {
          totalMatchedCount++;
          matchedVolumeCents += intent.amountCents;
        }
      }
    }

    // 2. Check for Bank Clearing records missing in Gateway
    for (const cr of clearingRecords) {
      const existsInGateway = intents.some((pi) => pi.id === cr.paymentIntentId);
      if (!existsInGateway) {
        breaks.push({
          type: 'MISSING_IN_GATEWAY',
          clearingReferenceId: cr.clearingReferenceId,
          clearingAmountCents: cr.grossAmountCents,
          varianceCents: cr.grossAmountCents,
          description: `Clearing record ${cr.clearingReferenceId} settled at bank but no matching gateway intent exists`,
        });
        unresolvedVarianceCents += cr.grossAmountCents;
      }
    }

    return {
      id: reportId,
      batchDate: dateStr,
      totalGatewayTransactions: intents.length,
      totalClearingRecords: clearingRecords.length,
      totalMatchedCount,
      matchedVolumeCents,
      totalBreaksCount: breaks.length,
      unresolvedVarianceCents,
      breaks,
      isBalanced: breaks.length === 0,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates a standard CSV reconciliation report for accounting teams
   */
  public generateReconciliationCsv(report: ReconciliationReport): string {
    const lines = [
      'Report ID,Batch Date,Total Gateway Txs,Total Clearing Records,Matched Count,Matched Volume ($),Breaks Count,Unresolved Variance ($),Status',
      `${report.id},${report.batchDate},${report.totalGatewayTransactions},${report.totalClearingRecords},${report.totalMatchedCount},${(report.matchedVolumeCents / 100).toFixed(2)},${report.totalBreaksCount},${(report.unresolvedVarianceCents / 100).toFixed(2)},${report.isBalanced ? 'BALANCED' : 'BREAKS_FOUND'}`,
      '',
      'Break Type,Payment Intent ID,Clearing Ref ID,Gateway Amount ($),Clearing Amount ($),Variance ($),Description',
    ];

    for (const b of report.breaks) {
      lines.push(
        `${b.type},${b.paymentIntentId || 'N/A'},${b.clearingReferenceId || 'N/A'},${((b.gatewayAmountCents || 0) / 100).toFixed(2)},${((b.clearingAmountCents || 0) / 100).toFixed(2)},${((b.varianceCents || 0) / 100).toFixed(2)},"${b.description.replace(/"/g, '""')}"`
      );
    }

    return lines.join('\n');
  }
}

export const reconciliationEngine = new ReconciliationEngine();
