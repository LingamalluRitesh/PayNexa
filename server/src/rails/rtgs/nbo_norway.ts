/**
 * Central Bank RTGS Protocol Specification: NboNorwayProtocol
 * Infrastructure Network: Norges Bank Settlement System (NBO)
 * Settlement Currency: NOK
 * Default Gateway BIC/Routing: DNBNNO22XXX
 */

export interface NboNorwayProtocolWireMessage {
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

export interface NboNorwayProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'NboNorwayProtocol';
}

export class NboNorwayProtocolEngine {
  public static dispatchWire(msg: NboNorwayProtocolWireMessage): NboNorwayProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'NOK') {
      throw new Error(`Protocol NboNorwayProtocol rejects currency ${msg.currency}, expected NOK`);
    }

    const centralBankReference = `NBO_NORWAY_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'NboNorwayProtocol',
    };
  }
}
