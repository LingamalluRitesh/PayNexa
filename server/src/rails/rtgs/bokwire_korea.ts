/**
 * Central Bank RTGS Protocol Specification: BokWireKoreaProtocol
 * Infrastructure Network: Bank of Korea Financial Telecommunications and Wire System
 * Settlement Currency: KRW
 * Default Gateway BIC/Routing: KOEXKRSEXXX
 */

export interface BokWireKoreaProtocolWireMessage {
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

export interface BokWireKoreaProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'BokWireKoreaProtocol';
}

export class BokWireKoreaProtocolEngine {
  public static dispatchWire(msg: BokWireKoreaProtocolWireMessage): BokWireKoreaProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'KRW') {
      throw new Error(`Protocol BokWireKoreaProtocol rejects currency ${msg.currency}, expected KRW`);
    }

    const centralBankReference = `BOKWIRE_KOREA_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'BokWireKoreaProtocol',
    };
  }
}
