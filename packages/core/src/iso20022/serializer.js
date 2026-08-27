import crypto from 'node:crypto';
/**
 * ISO 20022 XML Message Builder and Parser
 */
export class Iso20022Engine {
    /**
     * Generates a fully compliant pacs.008.001.10 XML credit transfer message
     */
    generatePacs008Xml(doc) {
        const grpHdr = doc.groupHeader;
        const tx = doc.creditTransferTransactionInformation[0];
        return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${this.escapeXml(grpHdr.messageIdentification)}</MsgId>
      <CreDtTm>${grpHdr.creationDateTime}</CreDtTm>
      <NbOfTxs>${grpHdr.numberOfTransactions}</NbOfTxs>
      <CtrlSum>${(grpHdr.controlSum || tx.interbankSettlementAmount.value).toFixed(2)}</CtrlSum>
      <TtlIntrBkSttlmAmt Ccy="${tx.interbankSettlementAmount.currency}">${tx.interbankSettlementAmount.value.toFixed(2)}</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>${grpHdr.interbankSettlementDate || tx.interbankSettlementDate}</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>${grpHdr.settlementInformation.settlementMethod}</SttlmMtd>
        ${grpHdr.settlementInformation.clearingSystem?.code ? `<ClrSys><Cd>${grpHdr.settlementInformation.clearingSystem.code}</Cd></ClrSys>` : ''}
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>${this.escapeXml(tx.paymentIdentification.endToEndIdentification)}</EndToEndId>
        <TxId>${this.escapeXml(tx.paymentIdentification.transactionIdentification)}</TxId>
        <UETR>${tx.paymentIdentification.uetr}</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${tx.interbankSettlementAmount.currency}">${tx.interbankSettlementAmount.value.toFixed(2)}</IntrBkSttlmAmt>
      <IntrBkSttlmDt>${tx.interbankSettlementDate}</IntrBkSttlmDt>
      <ChrgBr>${tx.chargeBearer}</ChrgBr>
      <Dbtr>
        <Nm>${this.escapeXml(tx.debtor.name)}</Nm>
        ${tx.debtor.postalAddress ? `<PstlAdr><Ctry>${tx.debtor.postalAddress.country}</Ctry><TwnNm>${this.escapeXml(tx.debtor.postalAddress.townName)}</TwnNm></PstlAdr>` : ''}
      </Dbtr>
      <DbtrAcct>
        <Id>
          ${tx.debtorAccount.identification.iban ? `<IBAN>${tx.debtorAccount.identification.iban}</IBAN>` : `<Othr><Id>${tx.debtorAccount.identification.other?.id}</Id></Othr>`}
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BICFI>${tx.debtorAgent.financialInstitutionIdentification.bicfi || 'PAYNEXAXXX'}</BICFI>
        </FinInstnId>
      </DbtrAgt>
      <CdtrAgt>
        <FinInstnId>
          <BICFI>${tx.creditorAgent.financialInstitutionIdentification.bicfi || 'TARGETXXXX'}</BICFI>
        </FinInstnId>
      </CdtrAgt>
      <Cdtr>
        <Nm>${this.escapeXml(tx.creditor.name)}</Nm>
        ${tx.creditor.postalAddress ? `<PstlAdr><Ctry>${tx.creditor.postalAddress.country}</Ctry><TwnNm>${this.escapeXml(tx.creditor.postalAddress.townName)}</TwnNm></PstlAdr>` : ''}
      </Cdtr>
      <CdtrAcct>
        <Id>
          ${tx.creditorAccount.identification.iban ? `<IBAN>${tx.creditorAccount.identification.iban}</IBAN>` : `<Othr><Id>${tx.creditorAccount.identification.other?.id}</Id></Othr>`}
        </Id>
      </CdtrAcct>
      ${tx.remittanceInformation?.unstructured?.[0] ? `<RmtInf><Ustrd>${this.escapeXml(tx.remittanceInformation.unstructured[0])}</Ustrd></RmtInf>` : ''}
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
    }
    /**
     * Generates a pacs.002.001.12 Payment Status Report XML message
     */
    generatePacs002Xml(doc) {
        const tx = doc.transactionInformationAndStatus?.[0];
        return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.12">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>${this.escapeXml(doc.groupHeader.messageIdentification)}</MsgId>
      <CreDtTm>${doc.groupHeader.creationDateTime}</CreDtTm>
    </GrpHdr>
    ${tx
            ? `<TxInfAndSts>
      <OrgnlEndToEndId>${this.escapeXml(tx.originalEndToEndIdentification || '')}</OrgnlEndToEndId>
      <OrgnlTxId>${this.escapeXml(tx.originalTransactionIdentification || '')}</OrgnlTxId>
      <OrgnlUETR>${tx.originalUETR || ''}</OrgnlUETR>
      <TxSts>${tx.transactionStatus}</TxSts>
      ${tx.statusReasonInformation?.[0]
                ? `<StsRsnInf>
        <Rsn><Cd>${tx.statusReasonInformation[0].reason?.code || 'NARR'}</Cd></Rsn>
        ${tx.statusReasonInformation[0].additionalInformation?.[0] ? `<AddtlInf>${this.escapeXml(tx.statusReasonInformation[0].additionalInformation[0])}</AddtlInf>` : ''}
      </StsRsnInf>`
                : ''}
    </TxInfAndSts>`
            : ''}
  </FIToFIPmtStsRpt>
</Document>`;
    }
    /**
     * Creates a structured pacs.008 transfer document from transfer parameters
     */
    createPacs008Document(params) {
        const now = new Date().toISOString();
        const today = now.split('T')[0];
        const uetr = crypto.randomUUID();
        const tx = {
            paymentIdentification: {
                endToEndIdentification: params.endToEndId,
                transactionIdentification: `TX_${params.endToEndId}`,
                uetr,
            },
            interbankSettlementAmount: {
                currency: params.currency,
                value: params.amount,
            },
            interbankSettlementDate: today,
            chargeBearer: 'SLEV',
            debtor: {
                name: params.debtorName,
                postalAddress: {
                    townName: 'Metropolis',
                    country: params.debtorCountry || 'US',
                },
            },
            debtorAccount: {
                identification: { iban: params.debtorIban },
            },
            debtorAgent: {
                financialInstitutionIdentification: {
                    bicfi: params.debtorBic,
                },
            },
            creditorAgent: {
                financialInstitutionIdentification: {
                    bicfi: params.creditorBic,
                },
            },
            creditor: {
                name: params.creditorName,
                postalAddress: {
                    townName: 'Capital City',
                    country: params.creditorCountry || 'DE',
                },
            },
            creditorAccount: {
                identification: { iban: params.creditorIban },
            },
            remittanceInformation: params.remittanceInfo
                ? { unstructured: [params.remittanceInfo] }
                : undefined,
        };
        return {
            groupHeader: {
                messageIdentification: `MSG_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                creationDateTime: now,
                numberOfTransactions: '1',
                totalInterbankSettlementAmount: {
                    currency: params.currency,
                    value: params.amount,
                },
                interbankSettlementDate: today,
                settlementInformation: {
                    settlementMethod: 'CLRG',
                    clearingSystem: { code: 'FEDNOW' },
                },
            },
            creditTransferTransactionInformation: [tx],
        };
    }
    escapeXml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
export const iso20022 = new Iso20022Engine();
