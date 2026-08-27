import crypto from 'node:crypto';
import { db } from '../database/database.js';
import { ledgerService } from './ledger.service.js';
import { webhookDispatcher } from './webhook-dispatcher.service.js';
import {
  Dispute,
  DisputeReason,
  DisputeStatus,
  DisputeEvidence,
  CurrencyCode,
} from '@paynexa/core';

export class DisputeService {
  /**
   * Creates a new Dispute / Chargeback case
   */
  public createDispute(params: {
    paymentIntentId: string;
    reason: DisputeReason;
    evidence?: DisputeEvidence;
  }): Dispute {
    const intent = db.table('paymentIntents').get(params.paymentIntentId);
    if (!intent) throw new Error(`PaymentIntent not found: ${params.paymentIntentId}`);

    const charge = db.table('charges').findOne((c) => c.paymentIntentId === intent.id);
    if (!charge) throw new Error('Charge not found for payment intent');

    const disputeId = `dp_${crypto.randomUUID()}`;
    const feeCents = 1500; // $15.00 dispute processing fee
    const now = new Date();
    const dueDate = new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString(); // 14 days to respond

    // Place Dispute Reserve Hold on Merchant Account
    const merchantAcc = ledgerService.getAccountByCode(`ACC_MERCHANT_${intent.merchantId}_${intent.currency}`);
    if (merchantAcc && merchantAcc.availableBalanceCents >= intent.amountCents) {
      ledgerService.placeHold({
        accountId: merchantAcc.id,
        amountCents: intent.amountCents + feeCents,
        referenceType: 'DISPUTE_PENDING',
        referenceId: disputeId,
        expiresInHours: 336,
      });
    }

    const dispute: Dispute = {
      id: disputeId,
      chargeId: charge.id,
      paymentIntentId: intent.id,
      merchantId: intent.merchantId,
      amountCents: intent.amountCents,
      feeCents,
      currency: intent.currency,
      reason: params.reason,
      status: 'WARNING_NEEDS_RESPONSE',
      evidence: params.evidence || {},
      dueByDate: dueDate,
      isCoveredByReserve: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    db.table('disputes').insert(dispute);
    webhookDispatcher.dispatchEvent('dispute.created', intent.merchantId, dispute);

    return dispute;
  }

  public listDisputes(merchantId?: string): Dispute[] {
    if (merchantId) {
      return db.table('disputes').find((d) => d.merchantId === merchantId);
    }
    return db.table('disputes').all();
  }

  public getDispute(id: string): Dispute | undefined {
    return db.table('disputes').get(id);
  }

  /**
   * Submits evidence to dispute
   */
  public submitEvidence(disputeId: string, evidence: DisputeEvidence): Dispute {
    const dispute = db.table('disputes').get(disputeId);
    if (!dispute) throw new Error(`Dispute not found: ${disputeId}`);

    const updated = db.table('disputes').update(disputeId, {
      evidence: {
        ...dispute.evidence,
        ...evidence,
        submittedAt: new Date().toISOString(),
      },
      status: 'UNDER_REVIEW',
    });

    return updated;
  }

  /**
   * Resolves dispute outcome (WON or LOST)
   */
  public resolveDispute(disputeId: string, outcome: 'WON' | 'LOST', notes?: string): Dispute {
    const dispute = db.table('disputes').get(disputeId);
    if (!dispute) throw new Error(`Dispute not found: ${disputeId}`);

    const status: DisputeStatus = outcome === 'WON' ? 'WON' : 'LOST';

    const updated = db.table('disputes').update(disputeId, {
      status,
      resolutionNote: notes || `Dispute closed as ${outcome}`,
    });

    webhookDispatcher.dispatchEvent('dispute.resolved', dispute.merchantId, updated);
    return updated;
  }
}

export const disputeService = new DisputeService();
