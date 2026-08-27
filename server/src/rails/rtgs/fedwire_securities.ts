/**
 * Central Bank RTGS Protocol Specification: FedwireSecuritiesProtocol
 * Infrastructure Network: Federal Reserve National Book-Entry Securities System
 * Settlement Currency: USD
 * Default Gateway BIC/Routing: 021000089
 */

export interface FedwireSecuritiesProtocolWireMessage {
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

export interface FedwireSecuritiesProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'FedwireSecuritiesProtocol';
}

export class FedwireSecuritiesProtocolEngine {
  public static dispatchWire(msg: FedwireSecuritiesProtocolWireMessage): FedwireSecuritiesProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'USD') {
      throw new Error(`Protocol FedwireSecuritiesProtocol rejects currency ${msg.currency}, expected USD`);
    }

    const centralBankReference = `FEDWIRE_SECURITIES_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'FedwireSecuritiesProtocol',
    };
  }
}
