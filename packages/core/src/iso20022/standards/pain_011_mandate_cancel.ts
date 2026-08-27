/**
 * ISO 20022 Message Standard: Pain011MandateCancellationRequest
 * Domain Category: PAIN
 * Business Purpose: Customer Mandate Cancellation Request Message
 * Compliant with ISO 20022 Financial Repository v2026.1
 */

export interface Pain011MandateCancellationRequestEnvelope {
  businessApplicationHeader?: {
    from: { financialInstitutionIdentification?: { bicfi?: string; clearingMemberId?: string } };
    to: { financialInstitutionIdentification?: { bicfi?: string; clearingMemberId?: string } };
    businessMessageIdentifier: string;
    messageDefinitionIdentifier: string;
    creationDate: string;
    signature?: { signatureValueHex?: string };
  };
  document: Pain011MandateCancellationRequestDocument;
}

export interface Pain011MandateCancellationRequestDocument {
  header: Pain011MandateCancellationRequestHeader;
  transactionPayload: Pain011MandateCancellationRequestPayload[];
  reconciliationAuditSummary?: Pain011MandateCancellationRequestAudit;
}

export interface Pain011MandateCancellationRequestHeader {
  messageIdentifier: string;
  creationTimestamp: string;
  batchCount: number;
  totalTransactionVolume: number;
  clearingMechanism: 'FEDNOW' | 'TIPS' | 'RT1' | 'CHAPS' | 'TARGET2' | 'UPI_NPCI' | 'SWIFT_FIN';
  settlementCurrency: string;
  authorizingEntity: {
    entityName: string;
    entityLei?: string;
    countryCode: string;
  };
}

export interface Pain011MandateCancellationRequestPayload {
  instructionId: string;
  endToEndTransactionId: string;
  universalTransactionReference: string; // Universal End-to-End Transaction Reference (UETR UUIDv4)
  settlementAmount: {
    amountMajorUnits: number;
    amountMinorUnits: number;
    currencyIso4217: string;
  };
  valueDate: string; // ISO 8601 Date
  debtorParty: {
    name: string;
    accountIban?: string;
    accountNationalNumber?: string;
    servicerBic: string;
    countryCode: string;
    taxIdentificationNumber?: string;
  };
  creditorParty: {
    name: string;
    accountIban?: string;
    accountNationalNumber?: string;
    servicerBic: string;
    countryCode: string;
    taxIdentificationNumber?: string;
  };
  chargesBearer: 'DEBT' | 'CRED' | 'SHAR' | 'SLEV';
  remittanceNarrative?: string[];
  statusReasonCode?: string;
  isHighPriorityProcessing: boolean;
}

export interface Pain011MandateCancellationRequestAudit {
  totalDebitsMinorUnits: number;
  totalCreditsMinorUnits: number;
  unbalancedVarianceUnits: number;
  isMathematicallyBalanced: boolean;
  auditedTimestamp: string;
}

export class Pain011MandateCancellationRequestEngine {
  public static validate(doc: Pain011MandateCancellationRequestDocument): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!doc.header.messageIdentifier) {
      errors.push('Missing mandatory MessageIdentifier in group header');
    }
    if (doc.header.totalTransactionVolume < 0) {
      errors.push('Total transaction volume cannot be negative');
    }
    for (let i = 0; i < doc.transactionPayload.length; i++) {
      const tx = doc.transactionPayload[i];
      if (!tx.instructionId) {
        errors.push(`Transaction index ${i} missing instructionId`);
      }
      if (!tx.universalTransactionReference) {
        errors.push(`Transaction index ${i} missing universalTransactionReference (UETR)`);
      }
      if (tx.settlementAmount.amountMinorUnits <= 0) {
        errors.push(`Transaction index ${i} settlement amount must be strictly positive`);
      }
    }
    return { isValid: errors.length === 0, errors };
  }

  public static serializeXml(doc: Pain011MandateCancellationRequestDocument): string {
    const hdr = doc.header;
    let txXml = '';
    for (const tx of doc.transactionPayload) {
      txXml += `
      <Tx>
        <Id>${tx.instructionId}</Id>
        <UETR>${tx.universalTransactionReference}</UETR>
        <Amt Ccy="${tx.settlementAmount.currencyIso4217}">${tx.settlementAmount.amountMajorUnits.toFixed(2)}</Amt>
        <Dbtr><Nm>${tx.debtorParty.name}</Nm><Agt>${tx.debtorParty.servicerBic}</Agt></Dbtr>
        <Cdtr><Nm>${tx.creditorParty.name}</Nm><Agt>${tx.creditorParty.servicerBic}</Agt></Cdtr>
      </Tx>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:$pain_011_mandate_cancel">
  <Header>
    <MsgId>${hdr.messageIdentifier}</MsgId>
    <CreDtTm>${hdr.creationTimestamp}</CreDtTm>
    <NbOfTxs>${hdr.batchCount}</NbOfTxs>
    <TtlAmt Ccy="${hdr.settlementCurrency}">${hdr.totalTransactionVolume.toFixed(2)}</TtlAmt>
  </Header>
  <Payload>${txXml}
  </Payload>
</Document>`;
  }
}
