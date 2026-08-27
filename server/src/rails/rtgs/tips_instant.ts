/**
 * Central Bank RTGS Protocol Specification: TipsInstantProtocol
 * Infrastructure Network: Target Instant Payment Settlement (TIPS) 24/7/365
 * Settlement Currency: EUR
 * Default Gateway BIC/Routing: BNPAFRPPXXX
 */

export interface TipsInstantProtocolWireMessage {
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

export interface TipsInstantProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'TipsInstantProtocol';
}

export class TipsInstantProtocolEngine {
  public static dispatchWire(msg: TipsInstantProtocolWireMessage): TipsInstantProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'EUR') {
      throw new Error(`Protocol TipsInstantProtocol rejects currency ${msg.currency}, expected EUR`);
    }

    const centralBankReference = `TIPS_INSTANT_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'TipsInstantProtocol',
    };
  }
}
