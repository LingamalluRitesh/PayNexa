/**
 * Interbank Clearing Adapter: LynxCanadaClearingAdapter
 * Protocol Network: Payments Canada Lynx High-Value Clearing System
 * Settlement Currency: CAD
 * Daily Cutoff Window: 18:00 UTC
 */

export interface LynxCanadaClearingAdapterInstruction {
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

export interface LynxCanadaClearingAdapterClearingStatus {
  clearingMessageId: string;
  networkReference: string;
  statusCode: 'SETTLED' | 'PENDING_MATCH' | 'QUEUED' | 'REJECTED';
  settlementTimestamp: string;
  grossAmountMinorUnits: number;
  clearingFeeMinorUnits: number;
}

export class LynxCanadaClearingAdapter {
  public executeSettlement(instruction: LynxCanadaClearingAdapterInstruction): LynxCanadaClearingAdapterClearingStatus {
    if (instruction.settlementAmount <= 0) {
      throw new Error('Settlement amount must be positive');
    }
    if (instruction.currency !== 'CAD') {
      throw new Error(`Clearing adapter LynxCanadaClearingAdapter expects CAD, received ${instruction.currency}`);
    }

    const networkReference = `LYNX_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
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

export const lynxClearing = new LynxCanadaClearingAdapter();
