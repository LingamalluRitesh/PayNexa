/**
 * Central Bank RTGS Protocol Specification: SicSwissProtocol
 * Infrastructure Network: Swiss National Bank Swiss Interbank Clearing (SIC)
 * Settlement Currency: CHF
 * Default Gateway BIC/Routing: SICCHZZXXXX
 */

export interface SicSwissProtocolWireMessage {
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

export interface SicSwissProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'SicSwissProtocol';
}

export class SicSwissProtocolEngine {
  public static dispatchWire(msg: SicSwissProtocolWireMessage): SicSwissProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'CHF') {
      throw new Error(`Protocol SicSwissProtocol rejects currency ${msg.currency}, expected CHF`);
    }

    const centralBankReference = `SIC_SWISS_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'SicSwissProtocol',
    };
  }
}
