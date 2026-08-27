/**
 * Central Bank RTGS Protocol Specification: ChatsHongKongProtocol
 * Infrastructure Network: Hong Kong Monetary Authority Clearing House Automated Transfer System
 * Settlement Currency: HKD
 * Default Gateway BIC/Routing: HSBCHKHHXXX
 */

export interface ChatsHongKongProtocolWireMessage {
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

export interface ChatsHongKongProtocolSettlementReceipt {
  wireIdentification: string;
  centralBankReference: string;
  settledTimestamp: string;
  statusCode: 'SETTLED' | 'QUEUED' | 'REJECTED';
  grossAmountMinorUnits: number;
  interbankFeeMinorUnits: number;
  clearingMechanism: 'ChatsHongKongProtocol';
}

export class ChatsHongKongProtocolEngine {
  public static dispatchWire(msg: ChatsHongKongProtocolWireMessage): ChatsHongKongProtocolSettlementReceipt {
    if (msg.amountMinorUnits <= 0) {
      throw new Error(`Invalid wire transfer amount: ${msg.amountMinorUnits}`);
    }
    if (msg.currency !== 'HKD') {
      throw new Error(`Protocol ChatsHongKongProtocol rejects currency ${msg.currency}, expected HKD`);
    }

    const centralBankReference = `CHATS_HONGKONG_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      wireIdentification: msg.wireIdentification,
      centralBankReference,
      settledTimestamp: new Date().toISOString(),
      statusCode: 'SETTLED',
      grossAmountMinorUnits: msg.amountMinorUnits,
      interbankFeeMinorUnits: 150, // Central Bank participant transaction surcharge
      clearingMechanism: 'ChatsHongKongProtocol',
    };
  }
}
