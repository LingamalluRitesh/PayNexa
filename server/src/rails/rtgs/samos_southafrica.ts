/**
 * Central Bank RTGS Protocol Specification: SamosSouthAfricaProtocol
 * Infrastructure Network: South African Reserve Bank Settlement System (SAMOS)
 * Settlement Currency: ZAR
 * Default Gateway BIC/Routing: SBZAZAJJXXX
 */

export interface SamosSouthAfricaProtocolWireMessage {
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

export interface SamosSouthAfricaProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'SamosSouthAfricaProtocol';
}

export class SamosSouthAfricaProtocolEngine {
  public static dispatchWire(msg: SamosSouthAfricaProtocolWireMessage): SamosSouthAfricaProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'ZAR') {
      throw new Error(`Protocol SamosSouthAfricaProtocol rejects currency ${msg.currency}, expected ZAR`);
    }

    const centralBankReference = `SAMOS_SOUTHAFRICA_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'SamosSouthAfricaProtocol',
    };
  }
}
