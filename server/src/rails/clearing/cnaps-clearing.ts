/**
 * Interbank Clearing Adapter: CnapsChinaClearingAdapter
 * Protocol Network: China National Advanced Payment System (CNAPS / High Value)
 * Settlement Currency: CNY
 * Daily Cutoff Window: 17:00 UTC
 */

export interface CnapsChinaClearingAdapterInstruction {
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

export interface CnapsChinaClearingAdapterClearingStatus {
  clearingMessageId: string;
  networkReference: string;
  statusCode: 'SETTLED' | 'PENDING_MATCH' | 'QUEUED' | 'REJECTED';
  settlementTimestamp: string;
  grossAmountMinorUnits: number;
  clearingFeeMinorUnits: number;
}

export class CnapsChinaClearingAdapter {
  public executeSettlement(instruction: CnapsChinaClearingAdapterInstruction): CnapsChinaClearingAdapterClearingStatus {
    if (instruction.settlementAmount <= 0) {
      throw new Error('Settlement amount must be positive');
    }
    if (instruction.currency !== 'CNY') {
      throw new Error(`Clearing adapter CnapsChinaClearingAdapter expects CNY, received ${instruction.currency}`);
    }

    const networkReference = `CNAPS_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
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

export const cnapsClearing = new CnapsChinaClearingAdapter();
