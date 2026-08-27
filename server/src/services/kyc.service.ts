import crypto from 'node:crypto';
import { db } from '../database/database.js';
import { webhookDispatcher } from './webhook-dispatcher.service.js';
import {
  KycVerification,
  KycStatus,
  KycDocumentType,
} from '@paynexa/core';

export class KycService {
  public submitVerification(params: {
    userId: string;
    merchantId?: string;
    documentType: KycDocumentType;
    documentNumber: string;
    fullName: string;
    dateOfBirth?: string;
    country: string;
    addressLine: string;
  }): KycVerification {
    const maskedNumber = `${params.documentNumber.slice(0, 2)}••••${params.documentNumber.slice(-4)}`;

    const kyc: KycVerification = {
      id: `kyc_${crypto.randomUUID()}`,
      userId: params.userId,
      merchantId: params.merchantId,
      documentType: params.documentType,
      documentNumberMasked: maskedNumber,
      fullName: params.fullName,
      dateOfBirth: params.dateOfBirth,
      country: params.country,
      addressLine: params.addressLine,
      status: 'PENDING_REVIEW',
      riskLevel: 'LOW',
      createdAt: new Date().toISOString(),
    };

    return db.table('kycVerifications').insert(kyc);
  }

  public listVerifications(): KycVerification[] {
    return db.table('kycVerifications').all();
  }

  public getVerification(id: string): KycVerification | undefined {
    return db.table('kycVerifications').get(id);
  }

  public reviewVerification(
    id: string,
    decision: 'APPROVE' | 'REJECT',
    notes?: string,
    rejectionReason?: string
  ): KycVerification {
    const kyc = db.table('kycVerifications').get(id);
    if (!kyc) throw new Error(`KYC record not found: ${id}`);

    const status: KycStatus = decision === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
    const now = new Date().toISOString();

    const updated = db.table('kycVerifications').update(id, {
      status,
      verifiedAt: decision === 'APPROVE' ? now : undefined,
      reviewerNotes: notes,
      rejectionReason: decision === 'REJECT' ? rejectionReason || 'Document unreadable or invalid' : undefined,
    });

    if (decision === 'APPROVE') {
      const user = db.table('users').get(kyc.userId);
      if (user) {
        db.table('users').update(user.id, { kycStatus: 'VERIFIED' });
      }
      webhookDispatcher.dispatchEvent('kyc.verified', kyc.merchantId || 'merch_platform', {
        kycId: kyc.id,
        userId: kyc.userId,
        status: 'VERIFIED',
      });
    }

    return updated;
  }
}

export const kycService = new KycService();
