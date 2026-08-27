/**
 * Central Bank RTGS Protocol Specification: RtgsIndiaProtocol
 * Infrastructure Network: Reserve Bank of India Real-Time Gross Settlement
 * Settlement Currency: INR
 * Default Gateway BIC/Routing: HDFC0000060
 */

export interface RtgsIndiaProtocolWireMessage {
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

export interface RtgsIndiaProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'RtgsIndiaProtocol';
}

export class RtgsIndiaProtocolEngine {
  public static dispatchWire(msg: RtgsIndiaProtocolWireMessage): RtgsIndiaProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'INR') {
      throw new Error(`Protocol RtgsIndiaProtocol rejects currency ${msg.currency}, expected INR`);
    }

    const centralBankReference = `RTGS_INDIA_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'RtgsIndiaProtocol',
    };
  }
}
