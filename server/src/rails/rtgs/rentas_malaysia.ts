/**
 * Central Bank RTGS Protocol Specification: RentasMalaysiaProtocol
 * Infrastructure Network: Bank Negara Malaysia Real-time Electronic Transfer System (RENTAS)
 * Settlement Currency: MYR
 * Default Gateway BIC/Routing: MBBEMYKLXXX
 */

export interface RentasMalaysiaProtocolWireMessage {
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

export interface RentasMalaysiaProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'RentasMalaysiaProtocol';
}

export class RentasMalaysiaProtocolEngine {
  public static dispatchWire(msg: RentasMalaysiaProtocolWireMessage): RentasMalaysiaProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'MYR') {
      throw new Error(`Protocol RentasMalaysiaProtocol rejects currency ${msg.currency}, expected MYR`);
    }

    const centralBankReference = `RENTAS_MALAYSIA_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'RentasMalaysiaProtocol',
    };
  }
}
