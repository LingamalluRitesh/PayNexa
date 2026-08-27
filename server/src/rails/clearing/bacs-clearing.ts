/**
 * Interbank Clearing Adapter: BacsDirectClearingAdapter
 * Protocol Network: Pay.UK BACS 3-Day Direct Debit and Credit Scheme
 * Settlement Currency: GBP
 * Daily Cutoff Window: 23:59 UTC
 */

export interface BacsDirectClearingAdapterInstruction {
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

export interface BacsDirectClearingAdapterClearingStatus {
  clearingMessageId: string;
  networkReference: string;
  statusCode: 'SETTLED' | 'PENDING_MATCH' | 'QUEUED' | 'REJECTED';
  settlementTimestamp: string;
  grossAmountMinorUnits: number;
  clearingFeeMinorUnits: number;
}

export class BacsDirectClearingAdapter {
  public executeSettlement(instruction: BacsDirectClearingAdapterInstruction): BacsDirectClearingAdapterClearingStatus {
    if (instruction.settlementAmount <= 0) {
      throw new Error('Settlement amount must be positive');
    }
    if (instruction.currency !== 'GBP') {
      throw new Error(`Clearing adapter BacsDirectClearingAdapter expects GBP, received ${instruction.currency}`);
    }

    const networkReference = `BACS_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
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

export const bacsClearing = new BacsDirectClearingAdapter();
