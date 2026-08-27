/**
 * Central Bank RTGS Protocol Specification: MepsSingaporeProtocol
 * Infrastructure Network: Monetary Authority of Singapore Electronic Payment System (MEPS+)
 * Settlement Currency: SGD
 * Default Gateway BIC/Routing: DBSSSGSGXXX
 */

export interface MepsSingaporeProtocolWireMessage {
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

export interface MepsSingaporeProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'MepsSingaporeProtocol';
}

export class MepsSingaporeProtocolEngine {
  public static dispatchWire(msg: MepsSingaporeProtocolWireMessage): MepsSingaporeProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'SGD') {
      throw new Error(`Protocol MepsSingaporeProtocol rejects currency ${msg.currency}, expected SGD`);
    }

    const centralBankReference = `MEPS_SINGAPORE_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'MepsSingaporeProtocol',
    };
  }
}
