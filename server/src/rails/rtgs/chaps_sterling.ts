/**
 * Central Bank RTGS Protocol Specification: ChapsSterlingProtocol
 * Infrastructure Network: Bank of England Clearing House Automated Payment System (CHAPS)
 * Settlement Currency: GBP
 * Default Gateway BIC/Routing: 200000
 */

export interface ChapsSterlingProtocolWireMessage {
  wireIdentification: string;
  senderParticipantCode: string;
  receiverParticipantCode: string;
  amountMinorUnits: number;
  currency: string;
  valueDate: string;
  beneficiaryAccount: string;
  beneficiaryName: string;
  originatorAccount: string;
  originatorName: string;
  regulatoryCode?: string;
  priorityFlag: 'NORMAL' | 'HIGH' | 'URGENT_CENTRAL_BANK';
}

export interface ChapsSterlingProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'ChapsSterlingProtocol';
}

export class ChapsSterlingProtocolEngine {
  public static dispatchWire(msg: ChapsSterlingProtocolWireMessage): ChapsSterlingProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'GBP') {
      throw new Error(`Protocol ChapsSterlingProtocol rejects currency ${msg.currency}, expected GBP`);
    }

    const centralBankReference = `CHAPS_STERLING_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'ChapsSterlingProtocol',
    };
  }
}
