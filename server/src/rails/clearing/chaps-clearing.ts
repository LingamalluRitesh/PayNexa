/**
 * Interbank Clearing Adapter: ChapsClearingAdapter
 * Protocol Network: Bank of England CHAPS Same-Day High-Value Clearing
 * Settlement Currency: GBP
 * Daily Cutoff Window: 16:20 UTC
 */

export interface ChapsClearingAdapterInstruction {
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

export interface ChapsClearingAdapterClearingStatus {
  clearingMessageId: string;
  networkReference: string;
  statusCode: 'SETTLED' | 'PENDING_MATCH' | 'QUEUED' | 'REJECTED';
  settlementTimestamp: string;
  grossAmountMinorUnits: number;
  clearingFeeMinorUnits: number;
}

export class ChapsClearingAdapter {
  public executeSettlement(instruction: ChapsClearingAdapterInstruction): ChapsClearingAdapterClearingStatus {
    if (instruction.settlementAmount <= 0) {
      throw new Error('Settlement amount must be positive');
    }
    if (instruction.currency !== 'GBP') {
      throw new Error(`Clearing adapter ChapsClearingAdapter expects GBP, received ${instruction.currency}`);
    }

    const networkReference = `CHAPS_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
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

export const chapsClearing = new ChapsClearingAdapter();
