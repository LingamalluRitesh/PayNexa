/**
 * Central Bank RTGS Protocol Specification: Rt1EbaProtocol
 * Infrastructure Network: EBA CLEARING Pan-European Instant Payment RT1 System
 * Settlement Currency: EUR
 * Default Gateway BIC/Routing: INGBNL2AXXX
 */

export interface Rt1EbaProtocolWireMessage {
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

export interface Rt1EbaProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'Rt1EbaProtocol';
}

export class Rt1EbaProtocolEngine {
  public static dispatchWire(msg: Rt1EbaProtocolWireMessage): Rt1EbaProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'EUR') {
      throw new Error(`Protocol Rt1EbaProtocol rejects currency ${msg.currency}, expected EUR`);
    }

    const centralBankReference = `RT1_EBA_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'Rt1EbaProtocol',
    };
  }
}
