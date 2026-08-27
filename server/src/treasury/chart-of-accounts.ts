/**
 * Enterprise Chart of Accounts (COA) Taxonomy & Hierarchy
 * Standard financial categorization according to GAAP & IFRS
 */

export interface ChartOfAccountNode {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  category: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  description: string;
  parentCode?: string;
  isLeaf: boolean;
}

export const ENTERPRISE_CHART_OF_ACCOUNTS: ChartOfAccountNode[] = [
  // 100000: ASSETS
  { code: '100000', name: 'Total Assets', type: 'ASSET', category: 'ROOT', normalBalance: 'DEBIT', description: 'Total economic resources owned', isLeaf: false },
  { code: '110000', name: 'Cash and Cash Equivalents', type: 'ASSET', category: 'LIQUIDITY', normalBalance: 'DEBIT', description: 'Central bank liquidity & operating bank deposits', parentCode: '100000', isLeaf: false },
  { code: '111000', name: 'Federal Reserve Liquidity Reserve (USD)', type: 'ASSET', category: 'PLATFORM_RESERVE', normalBalance: 'DEBIT', description: 'Central bank reserve account', parentCode: '110000', isLeaf: true },
  { code: '112000', name: 'European Central Bank Target2 Reserve (EUR)', type: 'ASSET', category: 'PLATFORM_RESERVE', normalBalance: 'DEBIT', description: 'ECB liquidity pool', parentCode: '110000', isLeaf: true },
  { code: '113000', name: 'Bank of England CHAPS Reserve (GBP)', type: 'ASSET', category: 'PLATFORM_RESERVE', normalBalance: 'DEBIT', description: 'BOE liquidity deposit', parentCode: '110000', isLeaf: true },
  { code: '114000', name: 'Reserve Bank of India RTGS Pool (INR)', type: 'ASSET', category: 'PLATFORM_RESERVE', normalBalance: 'DEBIT', description: 'RBI nodal bank account', parentCode: '110000', isLeaf: true },
  { code: '120000', name: 'Scheme Clearing Receivables', type: 'ASSET', category: 'SCHEME_SETTLEMENT', normalBalance: 'DEBIT', description: 'Receivables due from card networks in settlement', parentCode: '100000', isLeaf: false },
  { code: '121000', name: 'Visa International Clearing Receivable (USD)', type: 'ASSET', category: 'SCHEME_SETTLEMENT', normalBalance: 'DEBIT', description: 'Visa scheme clearing funds in transit', parentCode: '120000', isLeaf: true },
  { code: '122000', name: 'Mastercard Global Clearing Receivable (USD)', type: 'ASSET', category: 'SCHEME_SETTLEMENT', normalBalance: 'DEBIT', description: 'Mastercard scheme clearing funds in transit', parentCode: '120000', isLeaf: true },
  { code: '123000', name: 'FedNow Instant Clearing Transit (USD)', type: 'ASSET', category: 'SCHEME_SETTLEMENT', normalBalance: 'DEBIT', description: 'FedNow clearing receivable', parentCode: '120000', isLeaf: true },
  { code: '124000', name: 'NPCI UPI 2.0 Clearing Receivable (INR)', type: 'ASSET', category: 'SCHEME_SETTLEMENT', normalBalance: 'DEBIT', description: 'NPCI net settlement in transit', parentCode: '120000', isLeaf: true },

  // 200000: LIABILITIES
  { code: '200000', name: 'Total Liabilities', type: 'LIABILITY', category: 'ROOT', normalBalance: 'CREDIT', description: 'Total debts and obligations', isLeaf: false },
  { code: '210000', name: 'Customer Stored Value (Digital Wallets)', type: 'LIABILITY', category: 'CUSTOMER_WALLET', normalBalance: 'CREDIT', description: 'Consumer stored value liability balances', parentCode: '200000', isLeaf: false },
  { code: '211000', name: 'Consumer Stored Value Wallets (USD)', type: 'LIABILITY', category: 'CUSTOMER_WALLET', normalBalance: 'CREDIT', description: 'USD customer deposits', parentCode: '210000', isLeaf: true },
  { code: '212000', name: 'Consumer Stored Value Wallets (EUR)', type: 'LIABILITY', category: 'CUSTOMER_WALLET', normalBalance: 'CREDIT', description: 'EUR customer deposits', parentCode: '210000', isLeaf: true },
  { code: '213000', name: 'Consumer Stored Value Wallets (INR)', type: 'LIABILITY', category: 'CUSTOMER_WALLET', normalBalance: 'CREDIT', description: 'INR customer deposits', parentCode: '210000', isLeaf: true },
  { code: '220000', name: 'Merchant Settlement Payables', type: 'LIABILITY', category: 'MERCHANT_SETTLEMENT', normalBalance: 'CREDIT', description: 'Funds owed to merchants pending payout schedule', parentCode: '200000', isLeaf: false },
  { code: '221000', name: 'Acme Commerce Settlement Account (USD)', type: 'LIABILITY', category: 'MERCHANT_SETTLEMENT', normalBalance: 'CREDIT', description: 'Merchant settlement payable', parentCode: '220000', isLeaf: true },
  { code: '222000', name: 'Acme Commerce Settlement Account (EUR)', type: 'LIABILITY', category: 'MERCHANT_SETTLEMENT', normalBalance: 'CREDIT', description: 'Merchant EUR settlement payable', parentCode: '220000', isLeaf: true },
  { code: '230000', name: 'Merchant Rolling Reserves (Dispute Collateral)', type: 'LIABILITY', category: 'MERCHANT_SETTLEMENT', normalBalance: 'CREDIT', description: '5% 90-day rolling reserve collateral holds', parentCode: '200000', isLeaf: true },
  { code: '240000', name: 'Unearned / Deferred Subscription Revenue', type: 'LIABILITY', category: 'DEFERRED_REVENUE', normalBalance: 'CREDIT', description: 'Prepaid SaaS subscription billings', parentCode: '200000', isLeaf: true },

  // 300000: EQUITY
  { code: '300000', name: 'Total Shareholder Equity', type: 'EQUITY', category: 'ROOT', normalBalance: 'CREDIT', description: 'Net worth and contributed capital', isLeaf: false },
  { code: '310000', name: 'Contributed Capital (Tier 1 Regulatory Capital)', type: 'EQUITY', category: 'PLATFORM_RESERVE', normalBalance: 'CREDIT', description: 'Paid-in founder and institutional equity', parentCode: '300000', isLeaf: true },
  { code: '320000', name: 'Retained Earnings', type: 'EQUITY', category: 'PLATFORM_RESERVE', normalBalance: 'CREDIT', description: 'Cumulative net income retained', parentCode: '300000', isLeaf: true },
  { code: '330000', name: 'Cumulative FX Translation Adjustment (CTA)', type: 'EQUITY', category: 'PLATFORM_RESERVE', normalBalance: 'CREDIT', description: 'Multi-currency translation gains/losses', parentCode: '300000', isLeaf: true },

  // 400000: REVENUES
  { code: '400000', name: 'Total Platform Revenues', type: 'REVENUE', category: 'ROOT', normalBalance: 'CREDIT', description: 'Gross earned financial operating income', isLeaf: false },
  { code: '410000', name: 'Payment Processing Transaction Fees (2.9% + $0.30)', type: 'REVENUE', category: 'PLATFORM_FEES', normalBalance: 'CREDIT', description: 'Standard merchant processing transaction fees', parentCode: '400000', isLeaf: true },
  { code: '420000', name: 'Interchange Share & Scheme Rebate Revenue', type: 'REVENUE', category: 'PLATFORM_FEES', normalBalance: 'CREDIT', description: 'Issuing bank interchange revenue share', parentCode: '400000', isLeaf: true },
  { code: '430000', name: 'Foreign Exchange (FX) Spread Margin Revenue', type: 'REVENUE', category: 'PLATFORM_FEES', normalBalance: 'CREDIT', description: '0.45% institutional spread margin income', parentCode: '400000', isLeaf: true },
  { code: '440000', name: 'Virtual Card Issuing SaaS Subscription Fees', type: 'REVENUE', category: 'PLATFORM_FEES', normalBalance: 'CREDIT', description: 'Monthly recurring card program subscriptions', parentCode: '400000', isLeaf: true },
  { code: '450000', name: 'Chargeback & Dispute Arbitration Fees', type: 'REVENUE', category: 'PLATFORM_FEES', normalBalance: 'CREDIT', description: '$15.00 dispute processing fee per incident', parentCode: '400000', isLeaf: true },

  // 500000: DIRECT OPERATING EXPENSES (COGS)
  { code: '500000', name: 'Cost of Financial Services (COGS)', type: 'EXPENSE', category: 'ROOT', normalBalance: 'DEBIT', description: 'Direct payment network costs', isLeaf: false },
  { code: '510000', name: 'Visa & Mastercard Interchange Costs', type: 'EXPENSE', category: 'SCHEME_FEES', normalBalance: 'DEBIT', description: 'Interchange passed to issuing banks', parentCode: '500000', isLeaf: true },
  { code: '520000', name: 'Card Scheme Assessment & Network Fees', type: 'EXPENSE', category: 'SCHEME_FEES', normalBalance: 'DEBIT', description: 'Visa 0.14% & MC 0.1375% assessment fees', parentCode: '500000', isLeaf: true },
  { code: '530000', name: '3D Secure 2.2 Server & ACS Routing Fees', type: 'EXPENSE', category: 'GATEWAY_FEES', normalBalance: 'DEBIT', description: 'EMVCo 3DS authentication gateway fees', parentCode: '500000', isLeaf: true },
  { code: '540000', name: 'Banking Network Wire & Clearing Fees', type: 'EXPENSE', category: 'CLEARING_FEES', normalBalance: 'DEBIT', description: 'Federal Reserve & SWIFT transfer costs', parentCode: '500000', isLeaf: true },
];
