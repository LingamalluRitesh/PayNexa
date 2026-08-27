import crypto from 'node:crypto';
import { validateIban } from '@paynexa/core';

export interface SepaDirectDebitMandate {
  mandateId: string; // Unique Mandate Reference (UMR)
  scheme: 'CORE' | 'B2B';
  creditorIdentifier: string; // e.g. "DE98ZZZ09999999999"
  creditorName: string;
  debtorName: string;
  debtorIban: string;
  debtorBic: string;
  signatureDate: string; // YYYY-MM-DD
  sequenceType: 'FRST' | 'RCUR' | 'FNAL' | 'OOFF'; // First, Recurring, Final, One-Off
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface SepaCollectionBatch {
  messageId: string;
  collectionDate: string; // YYYY-MM-DD
  creditorSchemeId: string;
  mandates: Array<{
    mandate: SepaDirectDebitMandate;
    amountEuros: number;
    endToEndId: string;
  }>;
}

export class SepaDirectDebitEngine {
  /**
   * Generates pain.008.001.10 XML Direct Debit Initiation Message
   */
  public generatePain008Xml(batch: SepaCollectionBatch): string {
    const totalAmt = batch.mandates.reduce((sum, m) => sum + m.amountEuros, 0);
    const now = new Date().toISOString();

    let txXml = '';
    for (const m of batch.mandates) {
      txXml += `
      <DrctDbtTxInf>
        <PmtId><EndToEndId>${m.endToEndId}</EndToEndId></PmtId>
        <InstdAmt Ccy="EUR">${m.amountEuros.toFixed(2)}</InstdAmt>
        <DrctDbtTx>
          <MndtRltdInf>
            <MndtId>${m.mandate.mandateId}</MndtId>
            <DtOfSgntr>${m.mandate.signatureDate}</DtOfSgntr>
          </MndtRltdInf>
          <CdtrSchmeId><Id><PrvtId><Othr><Id>${m.mandate.creditorIdentifier}</Id></Othr></PrvtId></Id></CdtrSchmeId>
        </DrctDbtTx>
        <DbtrAgt><FinInstnId><BICFI>${m.mandate.debtorBic}</BICFI></FinInstnId></DbtrAgt>
        <Dbtr><Nm>${m.mandate.debtorName}</Nm></Dbtr>
        <DbtrAcct><Id><IBAN>${m.mandate.debtorIban}</IBAN></Id></DbtrAcct>
      </DrctDbtTxInf>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.10">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>${batch.messageId}</MsgId>
      <CreDtTm>${now}</CreDtTm>
      <NbOfTxs>${batch.mandates.length}</NbOfTxs>
      <CtrlSum>${totalAmt.toFixed(2)}</CtrlSum>
      <InitgPty><Nm>PayNexa SEPA Direct Debit Service</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT_${batch.messageId}</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <ReqdColltnDt>${batch.collectionDate}</ReqdColltnDt>
      <Cdtr><Nm>PayNexa Merchant Services</Nm></Cdtr>
      ${txXml}
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>`;
  }
}

export const sepaDirectDebit = new SepaDirectDebitEngine();
