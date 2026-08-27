/**
 * Central Bank RTGS Protocol Specification: CnapsChinaProtocol
 * Infrastructure Network: People's Bank of China China National Advanced Payment System
 * Settlement Currency: CNY
 * Default Gateway BIC/Routing: BKCHCNBJXXX
 */

export interface CnapsChinaProtocolWireMessage {
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

export interface CnapsChinaProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'CnapsChinaProtocol';
}

export class CnapsChinaProtocolEngine {
  public static dispatchWire(msg: CnapsChinaProtocolWireMessage): CnapsChinaProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'CNY') {
      throw new Error(`Protocol CnapsChinaProtocol rejects currency ${msg.currency}, expected CNY`);
    }

    const centralBankReference = `CNAPS_CHINA_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'CnapsChinaProtocol',
    };
  }
}
