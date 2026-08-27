/**
 * Central Bank RTGS Protocol Specification: BahtnetThailandProtocol
 * Infrastructure Network: Bank of Thailand Bank of Thailand Financial Network (BAHTNET)
 * Settlement Currency: THB
 * Default Gateway BIC/Routing: BKTRTHBKXXX
 */

export interface BahtnetThailandProtocolWireMessage {
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

export interface BahtnetThailandProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'BahtnetThailandProtocol';
}

export class BahtnetThailandProtocolEngine {
  public static dispatchWire(msg: BahtnetThailandProtocolWireMessage): BahtnetThailandProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'THB') {
      throw new Error(`Protocol BahtnetThailandProtocol rejects currency ${msg.currency}, expected THB`);
    }

    const centralBankReference = `BAHTNET_THAILAND_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'BahtnetThailandProtocol',
    };
  }
}
