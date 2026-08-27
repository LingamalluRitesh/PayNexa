/**
 * Central Bank RTGS Protocol Specification: KronosDenmarkProtocol
 * Infrastructure Network: Danmarks Nationalbank Real-Time Gross Settlement (Kronos)
 * Settlement Currency: DKK
 * Default Gateway BIC/Routing: DABAFI22XXX
 */

export interface KronosDenmarkProtocolWireMessage {
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

export interface KronosDenmarkProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'KronosDenmarkProtocol';
}

export class KronosDenmarkProtocolEngine {
  public static dispatchWire(msg: KronosDenmarkProtocolWireMessage): KronosDenmarkProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'DKK') {
      throw new Error(`Protocol KronosDenmarkProtocol rejects currency ${msg.currency}, expected DKK`);
    }

    const centralBankReference = `KRONOS_DENMARK_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'KronosDenmarkProtocol',
    };
  }
}
