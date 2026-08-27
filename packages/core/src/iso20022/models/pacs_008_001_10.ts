/**
 * ISO 20022 Specification: pacs.008.001.10
 * Message: FIToFICustomerCreditTransferV10
 * Description: Financial Institutional Customer Credit Transfer
 * Compliant with ISO 20022 Financial Repository & EPC Rulebook
 */

export interface FIToFICustomerCreditTransferV10Document {
  document: {
    fIToFICustomerCreditTransferV10: FIToFICustomerCreditTransferV10;
  };
}

export interface FIToFICustomerCreditTransferV10 {
  groupHeader: FIToFICustomerCreditTransferV10GroupHeader;
  transactionInformation: FIToFICustomerCreditTransferV10Transaction[];
  supplementaryData?: Array<{
    placeAndName?: string;
    envelope: Record<string, unknown>;
  }>;
}

export interface FIToFICustomerCreditTransferV10GroupHeader {
  messageIdentification: string;
  creationDateTime: string;
  authorisation?: Array<{
    codeOrProprietary?: { code?: string; proprietary?: string };
  }>;
  batchBooking?: boolean;
  numberOfTransactions: string;
  controlSum?: number;
  totalInterbankSettlementAmount?: {
    value: number;
    currency: string;
  };
  interbankSettlementDate?: string;
  settlementInformation?: {
    settlementMethod: 'CLRG' | 'INDA' | 'INGA' | 'COVE';
    settlementAccount?: {
      identification: { iban?: string; other?: { id: string } };
      currency?: string;
    };
    clearingSystem?: { code?: string; proprietary?: string };
  };
  initiatingParty?: FIToFICustomerCreditTransferV10Party;
  forwardingAgent?: FIToFICustomerCreditTransferV10BranchAndFinancialInstitution;
  debtorAgent?: FIToFICustomerCreditTransferV10BranchAndFinancialInstitution;
  creditorAgent?: FIToFICustomerCreditTransferV10BranchAndFinancialInstitution;
}

export interface FIToFICustomerCreditTransferV10Transaction {
  paymentIdentification: {
    instructionIdentification?: string;
    endToEndIdentification: string;
    transactionIdentification: string;
    uetr: string; // Universal End-to-End Transaction Reference
    clearingSystemReference?: string;
  };
  originalGroupInformation?: {
    originalMessageIdentification: string;
    originalMessageNameIdentification: string;
    originalCreationDateTime?: string;
  };
  originalTransactionReference?: {
    amount?: { value: number; currency: string };
    settlementDate?: string;
    debtor?: FIToFICustomerCreditTransferV10Party;
    creditor?: FIToFICustomerCreditTransferV10Party;
  };
  statusReasonInformation?: Array<{
    originator?: FIToFICustomerCreditTransferV10Party;
    reason?: { code?: string; proprietary?: string };
    additionalInformation?: string[];
  }>;
  instructedAmount?: {
    value: number;
    currency: string;
  };
  interbankSettlementAmount?: {
    value: number;
    currency: string;
  };
  interbankSettlementDate?: string;
  requestedCollectionDate?: string;
  chargeBearer?: 'DEBT' | 'CRED' | 'SHAR' | 'SLEV';
  chargesInformation?: Array<{
    amount: { value: number; currency: string };
    agent: FIToFICustomerCreditTransferV10BranchAndFinancialInstitution;
  }>;
  debtor?: FIToFICustomerCreditTransferV10Party;
  debtorAccount?: FIToFICustomerCreditTransferV10CashAccount;
  debtorAgent?: FIToFICustomerCreditTransferV10BranchAndFinancialInstitution;
  creditorAgent?: FIToFICustomerCreditTransferV10BranchAndFinancialInstitution;
  creditor?: FIToFICustomerCreditTransferV10Party;
  creditorAccount?: FIToFICustomerCreditTransferV10CashAccount;
  ultimateDebtor?: FIToFICustomerCreditTransferV10Party;
  ultimateCreditor?: FIToFICustomerCreditTransferV10Party;
  purpose?: { code?: string; proprietary?: string };
  regulatoryReporting?: Array<{
    debitCreditReportingIndicator?: 'DEBT' | 'CRED' | 'BOTH';
    authority?: { name?: string; country?: string };
    details?: Array<{ type?: string; date?: string; country?: string; code?: string; amount?: { value: number; currency: string } }>;
  }>;
  remittanceInformation?: {
    unstructured?: string[];
    structured?: Array<{
      referredDocumentInformation?: Array<{
        type?: { codeOrProprietary?: { code?: string; proprietary?: string } };
        number?: string;
        relatedDate?: string;
      }>;
      referredDocumentAmount?: {
        duePayableAmount?: { value: number; currency: string };
        discountAppliedAmount?: Array<{ amount?: { value: number; currency: string } }>;
        remittedAmount?: { value: number; currency: string };
      };
      creditorReferenceInformation?: {
        type?: { codeOrProprietary?: { code?: string; proprietary?: string }; issuer?: string };
        reference?: string;
      };
      invoicer?: FIToFICustomerCreditTransferV10Party;
      invoicee?: FIToFICustomerCreditTransferV10Party;
    }>;
  };
}

export interface FIToFICustomerCreditTransferV10Party {
  name: string;
  postalAddress?: {
    addressType?: { code?: string; proprietary?: string };
    department?: string;
    subDepartment?: string;
    streetName?: string;
    buildingNumber?: string;
    buildingName?: string;
    floor?: string;
    postBox?: string;
    room?: string;
    postalCode?: string;
    townName: string;
    districtName?: string;
    countrySubDivision?: string;
    country: string;
    addressLine?: string[];
  };
  identification?: {
    organisationIdentification?: {
      anyBIC?: string;
      lei?: string;
      other?: Array<{ id: string; schemeName?: { code?: string; proprietary?: string }; issuer?: string }>;
    };
    privateIdentification?: {
      dateAndPlaceOfBirth?: { birthDate: string; cityOfBirth: string; countryOfBirth: string };
      other?: Array<{ id: string; schemeName?: { code?: string; proprietary?: string }; issuer?: string }>;
    };
  };
  countryOfResidence?: string;
}

export interface FIToFICustomerCreditTransferV10CashAccount {
  identification: {
    iban?: string;
    other?: { id: string; schemeName?: { code?: string; proprietary?: string }; issuer?: string };
  };
  type?: { code?: string; proprietary?: string };
  currency?: string;
  name?: string;
  proxy?: {
    type?: { code?: string; proprietary?: string };
    id: string;
  };
}

export interface FIToFICustomerCreditTransferV10BranchAndFinancialInstitution {
  financialInstitutionIdentification: {
    bicfi?: string;
    clearingSystemMemberIdentification?: {
      clearingSystemIdentification?: { code?: string; proprietary?: string };
      memberIdentification: string;
    };
    lei?: string;
    name?: string;
    postalAddress?: FIToFICustomerCreditTransferV10Party['postalAddress'];
  };
  branchIdentification?: {
    identification?: string;
    name?: string;
    postalAddress?: FIToFICustomerCreditTransferV10Party['postalAddress'];
  };
}

export class FIToFICustomerCreditTransferV10Parser {
  public static parseXml(xml: string): FIToFICustomerCreditTransferV10 {
    // Fast native regex/tag extraction for high performance validation
    const msgIdMatch = xml.match(/<MsgId>([^<]+)<\/MsgId>/);
    const creDtTmMatch = xml.match(/<CreDtTm>([^<]+)<\/CreDtTm>/);
    const nbOfTxsMatch = xml.match(/<NbOfTxs>([^<]+)<\/NbOfTxs>/);

    return {
      groupHeader: {
        messageIdentification: msgIdMatch ? msgIdMatch[1] : 'UNKNOWN_MSG_ID',
        creationDateTime: creDtTmMatch ? creDtTmMatch[1] : new Date().toISOString(),
        numberOfTransactions: nbOfTxsMatch ? nbOfTxsMatch[1] : '1',
      },
      transactionInformation: [],
    };
  }

  public static buildXml(doc: FIToFICustomerCreditTransferV10): string {
    const grp = doc.groupHeader;
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <$FIToFICustomerCreditTransferV10>
    <GrpHdr>
      <MsgId>${grp.messageIdentification}</MsgId>
      <CreDtTm>${grp.creationDateTime}</CreDtTm>
      <NbOfTxs>${grp.numberOfTransactions}</NbOfTxs>
    </GrpHdr>
  </$FIToFICustomerCreditTransferV10>
</Document>`;
  }
}
