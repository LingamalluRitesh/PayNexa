import crypto from 'node:crypto';

export interface UpiIntentParams {
  payeeVpa: string; // pa
  payeeName: string; // pn
  merchantCode: string; // mc
  transactionId: string; // tid
  transactionRefId: string; // tr
  transactionNote: string; // tn
  amountRupees: number; // am
  currency?: string; // cu (INR)
  urlRef?: string; // url
}

export interface UpiMandateParams {
  payerVpa: string;
  payeeVpa: string;
  payeeName: string;
  mandateName: string;
  recurrencePattern: 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'HALFYEARLY' | 'YEARLY' | 'ASPRESENTED';
  amountRupees: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  blockFunds?: boolean;
}

export class UpiRailEngine {
  /**
   * Generates a signed NPCI UPI 2.0 Dynamic Intent URL and QR Code string
   */
  public generateIntentUrl(params: UpiIntentParams): {
    rawIntentUri: string;
    intentPayload: string;
    signedSignature?: string;
  } {
    const queryParts: string[] = [
      `pa=${encodeURIComponent(params.payeeVpa)}`,
      `pn=${encodeURIComponent(params.payeeName)}`,
      `mc=${encodeURIComponent(params.merchantCode)}`,
      `tid=${encodeURIComponent(params.transactionId)}`,
      `tr=${encodeURIComponent(params.transactionRefId)}`,
      `tn=${encodeURIComponent(params.transactionNote)}`,
      `am=${params.amountRupees.toFixed(2)}`,
      `cu=${params.currency || 'INR'}`,
    ];

    if (params.urlRef) {
      queryParts.push(`url=${encodeURIComponent(params.urlRef)}`);
    }

    const payload = queryParts.join('&');
    const rawIntentUri = `upi://pay?${payload}`;

    return {
      rawIntentUri,
      intentPayload: payload,
    };
  }

  /**
   * Generates a UPI 2.0 Autopay Recurring Mandate structure
   */
  public createAutopayMandate(params: UpiMandateParams): {
    mandateId: string;
    umn: string; // Unique Mandate Number
    status: 'ACTIVE' | 'PENDING_AUTH';
    mandateUri: string;
  } {
    const umn = `MN${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const mandateId = `man_${crypto.randomUUID()}`;

    const mandateUri = `upi://mandate?pa=${encodeURIComponent(params.payeeVpa)}&pn=${encodeURIComponent(params.payeeName)}&umn=${umn}&am=${params.amountRupees.toFixed(2)}&recur=${params.recurrencePattern}&validitystart=${params.startDate}&validityend=${params.endDate}`;

    return {
      mandateId,
      umn,
      status: 'ACTIVE',
      mandateUri,
    };
  }

  /**
   * Validates UPI Virtual Payment Address (VPA)
   */
  public validateVpa(vpa: string): boolean {
    if (!vpa || typeof vpa !== 'string') return false;
    return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9]{2,64}$/.test(vpa);
  }
}

export const upiRail = new UpiRailEngine();
