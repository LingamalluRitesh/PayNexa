/**
 * Interbank Clearing Adapter: InteracCanadaClearingAdapter
 * Protocol Network: Interac e-Transfer Real-Time Funds Routing
 * Settlement Currency: CAD
 * Daily Cutoff Window: 23:59 UTC
 */

export interface InteracCanadaClearingAdapterInstruction {
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

export interface InteracCanadaClearingAdapterClearingStatus {
  clearingMessageId: string;
  networkReference: string;
  statusCode: 'SETTLED' | 'PENDING_MATCH' | 'QUEUED' | 'REJECTED';
  settlementTimestamp: string;
  grossAmountMinorUnits: number;
  clearingFeeMinorUnits: number;
}

export class InteracCanadaClearingAdapter {
  public executeSettlement(instruction: InteracCanadaClearingAdapterInstruction): InteracCanadaClearingAdapterClearingStatus {
    if (instruction.settlementAmount <= 0) {
      throw new Error('Settlement amount must be positive');
    }
    if (instruction.currency !== 'CAD') {
      throw new Error(`Clearing adapter InteracCanadaClearingAdapter expects CAD, received ${instruction.currency}`);
    }

    const networkReference = `INTERAC_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
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

export const interacClearing = new InteracCanadaClearingAdapter();
