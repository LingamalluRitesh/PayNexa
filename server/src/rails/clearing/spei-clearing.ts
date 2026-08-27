/**
 * Interbank Clearing Adapter: SpeiMexicoClearingAdapter
 * Protocol Network: Bank of Mexico SPEI Real-Time Electronic Payment System
 * Settlement Currency: MXN
 * Daily Cutoff Window: 17:30 UTC
 */

export interface SpeiMexicoClearingAdapterInstruction {
  clearingMessageId: string;
  senderBicOrRouting: string;
  receiverBicOrRouting: string;
  settlementAmount: number; // In minor units
  currency: string;
  valueDate: string;
  debtorCustomer: {
    name: string;
    accountIdentifier: string;
  };
  creditorCustomer: {
    name: string;
    accountIdentifier: string;
  };
  remittanceNarrative?: string;
  priorityLevel: 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface SpeiMexicoClearingAdapterClearingStatus {
  clearingMessageId: string;
  networkReference: string;
  statusCode: 'SETTLED' | 'PENDING_MATCH' | 'QUEUED' | 'REJECTED';
  settlementTimestamp: string;
  grossAmountMinorUnits: number;
  clearingFeeMinorUnits: number;
}

export class SpeiMexicoClearingAdapter {
  public executeSettlement(instruction: SpeiMexicoClearingAdapterInstruction): SpeiMexicoClearingAdapterClearingStatus {
    if (instruction.settlementAmount <= 0) {
      throw new Error('Settlement amount must be positive');
    }
    if (instruction.currency !== 'MXN') {
      throw new Error(`Clearing adapter SpeiMexicoClearingAdapter expects MXN, received ${instruction.currency}`);
    }

    const networkReference = `SPEI_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    return {
      clearingMessageId: instruction.clearingMessageId,
      networkReference,
      statusCode: 'SETTLED',
      settlementTimestamp: new Date().toISOString(),
      grossAmountMinorUnits: instruction.settlementAmount,
      clearingFeeMinorUnits: 25, // Fixed clearing participant fee
    };
  }
}

export const speiClearing = new SpeiMexicoClearingAdapter();
