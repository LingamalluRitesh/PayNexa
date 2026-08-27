/**
 * Interbank Clearing Adapter: NppAustraliaClearingAdapter
 * Protocol Network: Reserve Bank of Australia New Payments Platform (NPP)
 * Settlement Currency: AUD
 * Daily Cutoff Window: 23:59 UTC
 */

export interface NppAustraliaClearingAdapterInstruction {
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

export interface NppAustraliaClearingAdapterClearingStatus {
  clearingMessageId: string;
  networkReference: string;
  statusCode: 'SETTLED' | 'PENDING_MATCH' | 'QUEUED' | 'REJECTED';
  settlementTimestamp: string;
  grossAmountMinorUnits: number;
  clearingFeeMinorUnits: number;
}

export class NppAustraliaClearingAdapter {
  public executeSettlement(instruction: NppAustraliaClearingAdapterInstruction): NppAustraliaClearingAdapterClearingStatus {
    if (instruction.settlementAmount <= 0) {
      throw new Error('Settlement amount must be positive');
    }
    if (instruction.currency !== 'AUD') {
      throw new Error(`Clearing adapter NppAustraliaClearingAdapter expects AUD, received ${instruction.currency}`);
    }

    const networkReference = `NPP_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
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

export const nppClearing = new NppAustraliaClearingAdapter();
