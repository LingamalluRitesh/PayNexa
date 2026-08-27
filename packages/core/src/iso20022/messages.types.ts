/**
 * ISO 20022 Universal Financial Industry Message Scheme
 * Implements pacs.008 (Credit Transfer), pacs.002 (Payment Status),
 * pacs.004 (Payment Return), pain.001 (Credit Initiation), and camt.053 (Bank Statement).
 */

export interface PostalAddress24 {
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
  townLocationName?: string;
  districtName?: string;
  countrySubDivision?: string;
  country: string; // ISO 3166-1 alpha-2
  addressLine?: string[];
}

export interface PartyIdentification135 {
  name: string;
  postalAddress?: PostalAddress24;
  identification?: {
    organisationIdentification?: {
      anyBIC?: string;
      lei?: string; // Legal Entity Identifier
      other?: Array<{ id: string; schemeName?: { code?: string; proprietary?: string } }>;
    };
    privateIdentification?: {
      dateAndPlaceOfBirth?: { birthDate: string; cityOfBirth: string; countryOfBirth: string };
      other?: Array<{ id: string; schemeName?: { code?: string; proprietary?: string } }>;
    };
  };
  countryOfResidence?: string;
}

export interface FinancialInstitutionIdentification18 {
  bicfi?: string; // Business Identifier Code
  clearingSystemMemberIdentification?: {
    clearingSystemIdentification?: { code?: string; proprietary?: string };
    memberIdentification: string;
  };
  lei?: string;
  name?: string;
  postalAddress?: PostalAddress24;
}

export interface BranchAndFinancialInstitutionIdentification6 {
  financialInstitutionIdentification: FinancialInstitutionIdentification18;
  branchIdentification?: {
    identification?: string;
    lei?: string;
    name?: string;
    postalAddress?: PostalAddress24;
  };
}

export interface CashAccount38 {
  identification: {
    iban?: string;
    other?: { id: string; schemeName?: { code?: string; proprietary?: string } };
  };
  type?: { code?: string; proprietary?: string };
  currency?: string;
  name?: string;
}

export interface GroupHeader93 {
  messageIdentification: string;
  creationDateTime: string;
  numberOfTransactions: string;
  controlSum?: number;
  totalInterbankSettlementAmount?: {
    currency: string;
    value: number;
  };
  interbankSettlementDate?: string;
  settlementInformation: {
    settlementMethod: 'CLRG' | 'INDA' | 'INGA' | 'COVE';
    clearingSystem?: { code?: string; proprietary?: string };
  };
  initiatingParty?: PartyIdentification135;
}

/**
 * pacs.008.001.10 - Financial Institutional Customer Credit Transfer
 */
export interface CreditTransferTransaction43 {
  paymentIdentification: {
    instructionIdentification?: string;
    endToEndIdentification: string;
    transactionIdentification: string;
    uetr: string; // Universal End-to-End Transaction Reference (UUIDv4)
    clearingSystemReference?: string;
  };
  paymentTypeInformation?: {
    instructionPriority?: 'HIGH' | 'NORM';
    serviceLevel?: Array<{ code?: string; proprietary?: string }>;
    localInstrument?: { code?: string; proprietary?: string };
    categoryPurpose?: { code?: string; proprietary?: string };
  };
  interbankSettlementAmount: {
    currency: string;
    value: number;
  };
  interbankSettlementDate: string;
  settlementPriority?: 'HIGH' | 'NORM';
  settlementTimeIndication?: {
    debitDateTime?: string;
    creditDateTime?: string;
  };
  acceptanceDateTime?: string;
  instructedAmount?: {
    currency: string;
    value: number;
  };
  exchangeRateInformation?: {
    unitCurrency?: string;
    exchangeRate: number;
    rateType?: 'SPOT' | 'SALE' | 'AGRD';
    contractIdentification?: string;
  };
  chargeBearer: 'DEBT' | 'CRED' | 'SHAR' | 'SLEV';
  debtor: PartyIdentification135;
  debtorAccount: CashAccount38;
  debtorAgent: BranchAndFinancialInstitutionIdentification6;
  creditorAgent: BranchAndFinancialInstitutionIdentification6;
  creditor: PartyIdentification135;
  creditorAccount: CashAccount38;
  remittanceInformation?: {
    unstructured?: string[];
    structured?: Array<{
      referredDocumentInformation?: Array<{
        type?: { codeOrProprietary?: { code?: string } };
        number?: string;
        relatedDate?: string;
      }>;
    }>;
  };
}

export interface FIToFICustomerCreditTransferV10 {
  groupHeader: GroupHeader93;
  creditTransferTransactionInformation: CreditTransferTransaction43[];
}

/**
 * pacs.002.001.12 - Payment Status Report
 */
export interface PaymentTransaction130 {
  statusIdentification?: string;
  originalInstructionIdentification?: string;
  originalEndToEndIdentification?: string;
  originalTransactionIdentification?: string;
  originalUETR?: string;
  transactionStatus: 'ACCP' | 'ACSP' | 'ACTC' | 'ACWC' | 'RJCT' | 'PDNG' | 'RCVD';
  statusReasonInformation?: Array<{
    originator?: PartyIdentification135;
    reason?: { code?: string; proprietary?: string };
    additionalInformation?: string[];
  }>;
  effectiveInterbankSettlementDate?: string;
  originalTransactionReference?: {
    interbankSettlementAmount?: { currency: string; value: number };
    interbankSettlementDate?: string;
    paymentTypeInformation?: { serviceLevel?: Array<{ code?: string }> };
    debtor?: PartyIdentification135;
    debtorAgent?: BranchAndFinancialInstitutionIdentification6;
    creditorAgent?: BranchAndFinancialInstitutionIdentification6;
    creditor?: PartyIdentification135;
  };
}

export interface FIToFIPaymentStatusReportV12 {
  groupHeader: {
    messageIdentification: string;
    creationDateTime: string;
    initiatingParty?: PartyIdentification135;
  };
  originalGroupInformationAndStatus?: {
    originalMessageIdentification: string;
    originalMessageNameIdentification: string;
    originalCreationDateTime?: string;
    originalNumberOfTransactions?: string;
    groupStatus?: 'ACCP' | 'PART' | 'RJCT' | 'PDNG';
  };
  transactionInformationAndStatus?: PaymentTransaction130[];
}

/**
 * camt.053.001.10 - Bank-to-Customer End-of-Day Statement
 */
export interface AccountStatement10 {
  identification: string;
  statementPagination?: { pageNumber: string; lastPageIndicator: boolean };
  electronicSequenceNumber?: number;
  legalSequenceNumber?: number;
  creationDateTime: string;
  fromToDate?: { fromDateTime: string; toDateTime: string };
  account: CashAccount38;
  balance: Array<{
    type: { codeOrProprietary: { code: 'OPBD' | 'CLBD' | 'ITBD' | 'PRCD' } };
    amount: { currency: string; value: number };
    creditDebitIndicator: 'CRDT' | 'DBIT';
    date: { date: string };
  }>;
  entry?: Array<{
    amount: { currency: string; value: number };
    creditDebitIndicator: 'CRDT' | 'DBIT';
    status: { code: 'BOOK' | 'PDNG' | 'FUTR' };
    bookingDate: { date: string };
    valueDate: { date: string };
    accountServicerReference?: string;
    entryDetails?: Array<{
      transactionDetails?: Array<{
        references?: { endToEndIdentification?: string; uetr?: string };
        amountDetails?: { instructedAmount?: { currency: string; value: number } };
        relatedParties?: { debtor?: PartyIdentification135; creditor?: PartyIdentification135 };
      }>;
    }>;
  }>;
}

export interface BankToCustomerStatementV10 {
  groupHeader: {
    messageIdentification: string;
    creationDateTime: string;
    messageRecipient?: PartyIdentification135;
  };
  statement: AccountStatement10[];
}
