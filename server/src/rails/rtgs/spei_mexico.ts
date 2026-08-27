/**
 * Central Bank RTGS Protocol Specification: SpeiMexicoProtocol
 * Infrastructure Network: Bank of Mexico Sistema de Pagos Electronicos Interbancarios
 * Settlement Currency: MXN
 * Default Gateway BIC/Routing: 01218000
 */

export interface SpeiMexicoProtocolWireMessage {
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

export interface SpeiMexicoProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'SpeiMexicoProtocol';
}

export class SpeiMexicoProtocolEngine {
  public static dispatchWire(msg: SpeiMexicoProtocolWireMessage): SpeiMexicoProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'MXN') {
      throw new Error(`Protocol SpeiMexicoProtocol rejects currency ${msg.currency}, expected MXN`);
    }

    const centralBankReference = `SPEI_MEXICO_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'SpeiMexicoProtocol',
    };
  }
}
