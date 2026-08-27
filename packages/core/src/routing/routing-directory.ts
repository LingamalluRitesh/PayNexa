/**
 * Global Bank Routing & Clearing Directory Specification
 * Covers US Fedwire ABA numbers, UK Sort Codes, Eurozone BICs, Indian IFSCs, Canadian CCs, Australian BSBs
 */

export interface FinancialInstitutionRoute {
  routingCode: string;
  clearingScheme: 'FEDWIRE_ABA' | 'UK_SORT_CODE' | 'SWIFT_BIC' | 'INDIA_IFSC' | 'AUSTRALIA_BSB' | 'CANADA_TRANSIT';
  institutionName: string;
  branchName: string;
  city: string;
  country: string;
  isDirectSettlementMember: boolean;
  supportedCurrencies: string[];
}

export const GLOBAL_BANK_ROUTING_DIRECTORY: FinancialInstitutionRoute[] = [
  { routingCode: '021000021', clearingScheme: 'FEDWIRE_ABA', institutionName: 'JPMorgan Chase Bank, N.A.', branchName: 'New York Main', city: 'New York', country: 'US', isDirectSettlementMember: true, supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'] },
  { routingCode: '026009593', clearingScheme: 'FEDWIRE_ABA', institutionName: 'Bank of America, N.A.', branchName: 'Charlotte Ops', city: 'Charlotte', country: 'US', isDirectSettlementMember: true, supportedCurrencies: ['USD', 'EUR', 'GBP'] },
  { routingCode: '021000089', clearingScheme: 'FEDWIRE_ABA', institutionName: 'Citibank, N.A.', branchName: 'New York Global Cash', city: 'New York', country: 'US', isDirectSettlementMember: true, supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'SGD'] },
  { routingCode: '121000247', clearingScheme: 'FEDWIRE_ABA', institutionName: 'Wells Fargo Bank, N.A.', branchName: 'San Francisco Treasury', city: 'San Francisco', country: 'US', isDirectSettlementMember: true, supportedCurrencies: ['USD', 'CAD', 'MXN'] },
  { routingCode: '021001033', clearingScheme: 'FEDWIRE_ABA', institutionName: 'BNY Mellon, N.A.', branchName: 'New York Custody', city: 'New York', country: 'US', isDirectSettlementMember: true, supportedCurrencies: ['USD', 'EUR', 'GBP'] },
  { routingCode: '200000', clearingScheme: 'UK_SORT_CODE', institutionName: 'Barclays Bank PLC', branchName: 'London Head Office', city: 'London', country: 'GB', isDirectSettlementMember: true, supportedCurrencies: ['GBP', 'EUR', 'USD'] },
  { routingCode: '400515', clearingScheme: 'UK_SORT_CODE', institutionName: 'HSBC Bank UK PLC', branchName: 'Canary Wharf', city: 'London', country: 'GB', isDirectSettlementMember: true, supportedCurrencies: ['GBP', 'EUR', 'USD', 'HKD'] },
  { routingCode: '300000', clearingScheme: 'UK_SORT_CODE', institutionName: 'Lloyds Bank PLC', branchName: 'City Office', city: 'London', country: 'GB', isDirectSettlementMember: true, supportedCurrencies: ['GBP', 'EUR'] },
  { routingCode: '600001', clearingScheme: 'UK_SORT_CODE', institutionName: 'National Westminster Bank PLC', branchName: 'Princes Street', city: 'London', country: 'GB', isDirectSettlementMember: true, supportedCurrencies: ['GBP', 'EUR'] },
  { routingCode: 'DBEUMM21XXX', clearingScheme: 'SWIFT_BIC', institutionName: 'Deutsche Bank AG', branchName: 'Frankfurt Central', city: 'Frankfurt', country: 'DE', isDirectSettlementMember: true, supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF'] },
  { routingCode: 'BNPAFRPPXXX', clearingScheme: 'SWIFT_BIC', institutionName: 'BNP Paribas S.A.', branchName: 'Paris Corporate', city: 'Paris', country: 'FR', isDirectSettlementMember: true, supportedCurrencies: ['EUR', 'USD'] },
  { routingCode: 'INGBNL2AXXX', clearingScheme: 'SWIFT_BIC', institutionName: 'ING Bank N.V.', branchName: 'Amsterdam Headquarters', city: 'Amsterdam', country: 'NL', isDirectSettlementMember: true, supportedCurrencies: ['EUR', 'USD'] },
  { routingCode: 'SANESMM1XXX', clearingScheme: 'SWIFT_BIC', institutionName: 'Banco Santander, S.A.', branchName: 'Madrid Central', city: 'Madrid', country: 'ES', isDirectSettlementMember: true, supportedCurrencies: ['EUR', 'USD', 'BRL', 'MXN'] },
  { routingCode: 'HDFC0000060', clearingScheme: 'INDIA_IFSC', institutionName: 'HDFC Bank Ltd', branchName: 'Fort Mumbai', city: 'Mumbai', country: 'IN', isDirectSettlementMember: true, supportedCurrencies: ['INR', 'USD', 'AED'] },
  { routingCode: 'ICIC0000001', clearingScheme: 'INDIA_IFSC', institutionName: 'ICICI Bank Ltd', branchName: 'Bandra Kurla Complex', city: 'Mumbai', country: 'IN', isDirectSettlementMember: true, supportedCurrencies: ['INR', 'USD'] },
  { routingCode: 'SBIN0000300', clearingScheme: 'INDIA_IFSC', institutionName: 'State Bank of India', branchName: 'Mumbai Main', city: 'Mumbai', country: 'IN', isDirectSettlementMember: true, supportedCurrencies: ['INR', 'USD', 'EUR'] },
  { routingCode: '062000', clearingScheme: 'AUSTRALIA_BSB', institutionName: 'Commonwealth Bank of Australia', branchName: 'Sydney Central', city: 'Sydney', country: 'AU', isDirectSettlementMember: true, supportedCurrencies: ['AUD', 'NZD', 'USD'] },
  { routingCode: '082001', clearingScheme: 'AUSTRALIA_BSB', institutionName: 'National Australia Bank', branchName: 'Melbourne Head', city: 'Melbourne', country: 'AU', isDirectSettlementMember: true, supportedCurrencies: ['AUD', 'USD'] },
  { routingCode: '000100012', clearingScheme: 'CANADA_TRANSIT', institutionName: 'Royal Bank of Canada', branchName: 'Toronto Main Branch', city: 'Toronto', country: 'CA', isDirectSettlementMember: true, supportedCurrencies: ['CAD', 'USD'] },
  { routingCode: '000200021', clearingScheme: 'CANADA_TRANSIT', institutionName: 'The Bank of Nova Scotia (Scotiabank)', branchName: 'King Street', city: 'Toronto', country: 'CA', isDirectSettlementMember: true, supportedCurrencies: ['CAD', 'USD', 'MXN'] },
];

export function lookupBankRoute(code: string): FinancialInstitutionRoute | undefined {
  const clean = code.trim().toUpperCase();
  return GLOBAL_BANK_ROUTING_DIRECTORY.find((r) => r.routingCode === clean);
}
