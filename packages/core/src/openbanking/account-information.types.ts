/**
 * UK Open Banking & Berlin Group NextGenPSD2 Account Information Services (AISP)
 * Compliant with Open Banking Read/Write API Profile v3.1.10
 */

export interface OBReadAccount6 {
  data: {
    account: OBAccount6[];
  };
  links: {
    self: string;
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
  meta: {
    totalPages?: number;
    firstAvailableDateTime?: string;
    lastAvailableDateTime?: string;
  };
}

export interface OBAccount6 {
  accountId: string;
  status: 'Enabled' | 'Disabled' | 'Deleted' | 'Pending';
  statusUpdateDateTime: string;
  currency: string;
  accountType: 'Personal' | 'Business';
  accountSubType: 'CurrentAccount' | 'Savings' | 'Card' | 'Loan' | 'Mortgage';
  description?: string;
  nickname?: string;
  openingDate?: string;
  maturityDate?: string;
  account: Array<{
    schemeName: 'UK.OBIE.SortCodeAccountNumber' | 'UK.OBIE.IBAN' | 'UK.OBIE.PAN';
    identification: string;
    name?: string;
    secondaryIdentification?: string;
  }>;
  servicer?: {
    schemeName: 'UK.OBIE.BICFI';
    identification: string;
  };
}

export interface OBReadBalance1 {
  data: {
    balance: OBBalance1[];
  };
  links: { self: string };
  meta: Record<string, unknown>;
}

export interface OBBalance1 {
  accountId: string;
  amount: {
    amount: string;
    currency: string;
  };
  creditDebitIndicator: 'Credit' | 'Debit';
  type: 'ClosingAvailable' | 'ClosingBooked' | 'Expected' | 'ForwardAvailable' | 'Information' | 'InterimAvailable' | 'InterimBooked' | 'OpeningAvailable' | 'OpeningBooked' | 'PreviouslyClosedBooked';
  dateTime: string;
  creditLine?: Array<{
    included: boolean;
    type?: 'Available' | 'Credit' | 'Emergency' | 'Pre-Agreed' | 'Temporary';
    amount?: { amount: string; currency: string };
  }>;
}

export interface OBReadTransaction6 {
  data: {
    transaction: OBTransaction6[];
  };
  links: { self: string; next?: string };
  meta: { totalPages?: number };
}

export interface OBTransaction6 {
  accountId: string;
  transactionId: string;
  transactionReference?: string;
  statementReference?: string[];
  creditDebitIndicator: 'Credit' | 'Debit';
  status: 'Booked' | 'Pending';
  transactionMutability?: 'Mutable' | 'Immutable';
  bookingDateTime: string;
  valueDateTime?: string;
  amount: {
    amount: string;
    currency: string;
  };
  chargeAmount?: {
    amount: string;
    currency: string;
  };
  currencyExchange?: {
    sourceCurrency: string;
    targetCurrency?: string;
    unitCurrency?: string;
    exchangeRate: number;
    contractIdentification?: string;
    quotationDate?: string;
  };
  bankTransactionCode?: {
    code: string;
    subCode: string;
  };
  proprietaryBankTransactionCode?: {
    code: string;
    issuer?: string;
  };
  balance?: OBBalance1;
  merchantDetails?: {
    merchantName?: string;
    merchantCategoryCode?: string;
  };
  creditorAgent?: {
    schemeName: string;
    identification: string;
  };
  creditorAccount?: {
    schemeName: string;
    identification: string;
    name?: string;
  };
  debtorAgent?: {
    schemeName: string;
    identification: string;
  };
  debtorAccount?: {
    schemeName: string;
    identification: string;
    name?: string;
  };
}
