/**
 * Central Bank RTGS Protocol Specification: ZahavIsraelProtocol
 * Infrastructure Network: Bank of Israel Real Time Gross Settlement (ZAHAV)
 * Settlement Currency: ILS
 * Default Gateway BIC/Routing: LUMIIT20XXX
 */

export interface ZahavIsraelProtocolWireMessage {
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

export interface ZahavIsraelProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'ZahavIsraelProtocol';
}

export class ZahavIsraelProtocolEngine {
  public static dispatchWire(msg: ZahavIsraelProtocolWireMessage): ZahavIsraelProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'ILS') {
      throw new Error(`Protocol ZahavIsraelProtocol rejects currency ${msg.currency}, expected ILS`);
    }

    const centralBankReference = `ZAHAV_ISRAEL_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'ZahavIsraelProtocol',
    };
  }
}
