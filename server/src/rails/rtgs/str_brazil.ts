/**
 * Central Bank RTGS Protocol Specification: StrBrazilProtocol
 * Infrastructure Network: Central Bank of Brazil Sistema de Transferencia de Reservas
 * Settlement Currency: BRL
 * Default Gateway BIC/Routing: 00000000
 */

export interface StrBrazilProtocolWireMessage {
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

export interface StrBrazilProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'StrBrazilProtocol';
}

export class StrBrazilProtocolEngine {
  public static dispatchWire(msg: StrBrazilProtocolWireMessage): StrBrazilProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'BRL') {
      throw new Error(`Protocol StrBrazilProtocol rejects currency ${msg.currency}, expected BRL`);
    }

    const centralBankReference = `STR_BRAZIL_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'StrBrazilProtocol',
    };
  }
}
