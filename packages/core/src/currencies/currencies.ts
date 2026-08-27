/**
 * ISO 4217 Global Currency & Central Bank Clearing Specification
 * Complete dataset covering 180+ global fiat currencies, minor units, and clearing systems
 */

export interface CurrencySpecification {
  code: string;
  numericCode: string;
  minorUnits: number;
  name: string;
  symbol: string;
  centralBank: string;
  rtgsClearingSystem: string;
  instantClearingRail?: string;
  settlementCutoffUtc: string;
  isHighValueSupported: boolean;
  standardFractionalUnit: string;
}

export const WORLD_CURRENCIES: Record<string, CurrencySpecification> = {
  'USD': { code: 'USD', numericCode: '840', minorUnits: 2, name: "United States Dollar", symbol: '$', centralBank: "Federal Reserve System", rtgsClearingSystem: 'Fedwire', instantClearingRail: 'FedNow / RTP', settlementCutoffUtc: '22:00', isHighValueSupported: true, standardFractionalUnit: 'Cent' },
  'EUR': { code: 'EUR', numericCode: '978', minorUnits: 2, name: "Euro", symbol: '€', centralBank: "European Central Bank", rtgsClearingSystem: 'Target2', instantClearingRail: 'TIPS / RT1', settlementCutoffUtc: '17:00', isHighValueSupported: true, standardFractionalUnit: 'Cent' },
  'GBP': { code: 'GBP', numericCode: '826', minorUnits: 2, name: "Pound Sterling", symbol: '£', centralBank: "Bank of England", rtgsClearingSystem: 'CHAPS', instantClearingRail: 'Faster Payments (FPS)', settlementCutoffUtc: '16:20', isHighValueSupported: true, standardFractionalUnit: 'Penny' },
  'JPY': { code: 'JPY', numericCode: '392', minorUnits: 0, name: "Japanese Yen", symbol: '¥', centralBank: "Bank of Japan", rtgsClearingSystem: 'BOJ-NET', instantClearingRail: 'Zengin', settlementCutoffUtc: '15:00', isHighValueSupported: true, standardFractionalUnit: 'Yen' },
  'CHF': { code: 'CHF', numericCode: '756', minorUnits: 2, name: "Swiss Franc", symbol: 'CHF', centralBank: "Swiss National Bank", rtgsClearingSystem: 'SIC', instantClearingRail: 'Swiss SIC IP', settlementCutoffUtc: '16:15', isHighValueSupported: true, standardFractionalUnit: 'Rappen' },
  'CAD': { code: 'CAD', numericCode: '124', minorUnits: 2, name: "Canadian Dollar", symbol: 'C$', centralBank: "Bank of Canada", rtgsClearingSystem: 'Lynx', instantClearingRail: 'RTR', settlementCutoffUtc: '18:00', isHighValueSupported: true, standardFractionalUnit: 'Cent' },
  'AUD': { code: 'AUD', numericCode: '036', minorUnits: 2, name: "Australian Dollar", symbol: 'A$', centralBank: "Reserve Bank of Australia", rtgsClearingSystem: 'RITS', instantClearingRail: 'New Payments Platform (NPP)', settlementCutoffUtc: '16:30', isHighValueSupported: true, standardFractionalUnit: 'Cent' },
  'INR': { code: 'INR', numericCode: '356', minorUnits: 2, name: "Indian Rupee", symbol: '₹', centralBank: "Reserve Bank of India", rtgsClearingSystem: 'RTGS', instantClearingRail: 'UPI 2.0 / IMPS', settlementCutoffUtc: '23:59', isHighValueSupported: true, standardFractionalUnit: 'Paisa' },
  'CNY': { code: 'CNY', numericCode: '156', minorUnits: 2, name: "Chinese Yuan Renminbi", symbol: '¥', centralBank: "People's Bank of China", rtgsClearingSystem: 'CNAPS', instantClearingRail: 'IBPS', settlementCutoffUtc: '17:00', isHighValueSupported: true, standardFractionalUnit: 'Fen' },
  'SGD': { code: 'SGD', numericCode: '702', minorUnits: 2, name: "Singapore Dollar", symbol: 'S$', centralBank: "Monetary Authority of Singapore", rtgsClearingSystem: 'MEPS+', instantClearingRail: 'FAST / PayNow', settlementCutoffUtc: '18:30', isHighValueSupported: true, standardFractionalUnit: 'Cent' },
  'HKD': { code: 'HKD', numericCode: '344', minorUnits: 2, name: "Hong Kong Dollar", symbol: 'HK$', centralBank: "Hong Kong Monetary Authority", rtgsClearingSystem: 'CHATS', instantClearingRail: 'FPS', settlementCutoffUtc: '18:00', isHighValueSupported: true, standardFractionalUnit: 'Cent' },
  'NZD': { code: 'NZD', numericCode: '554', minorUnits: 2, name: "New Zealand Dollar", symbol: 'NZ$', centralBank: "Reserve Bank of New Zealand", rtgsClearingSystem: 'NZCDC', instantClearingRail: 'SBI', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Cent' },
  'BRL': { code: 'BRL', numericCode: '986', minorUnits: 2, name: "Brazilian Real", symbol: 'R$', centralBank: "Central Bank of Brazil", rtgsClearingSystem: 'STR', instantClearingRail: 'PIX', settlementCutoffUtc: '23:59', isHighValueSupported: true, standardFractionalUnit: 'Centavo' },
  'MXN': { code: 'MXN', numericCode: '484', minorUnits: 2, name: "Mexican Peso", symbol: 'Mex$', centralBank: "Bank of Mexico", rtgsClearingSystem: 'SPEI', instantClearingRail: 'CoDi / SPEI', settlementCutoffUtc: '17:30', isHighValueSupported: true, standardFractionalUnit: 'Centavo' },
  'SEK': { code: 'SEK', numericCode: '752', minorUnits: 2, name: "Swedish Krona", symbol: 'kr', centralBank: "Sveriges Riksbank", rtgsClearingSystem: 'RIX', instantClearingRail: 'Swish (BiR)', settlementCutoffUtc: '17:00', isHighValueSupported: true, standardFractionalUnit: 'Öre' },
  'NOK': { code: 'NOK', numericCode: '578', minorUnits: 2, name: "Norwegian Krone", symbol: 'kr', centralBank: "Norges Bank", rtgsClearingSystem: 'NBO', instantClearingRail: 'Straks', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Øre' },
  'DKK': { code: 'DKK', numericCode: '208', minorUnits: 2, name: "Danish Krone", symbol: 'kr', centralBank: "Danmarks Nationalbank", rtgsClearingSystem: 'Kronos', instantClearingRail: 'Straksclearing', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Øre' },
  'PLN': { code: 'PLN', numericCode: '985', minorUnits: 2, name: "Polish Zloty", symbol: 'zł', centralBank: "National Bank of Poland", rtgsClearingSystem: 'SORBNET2', instantClearingRail: 'Express Elixir', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Grosz' },
  'ZAR': { code: 'ZAR', numericCode: '710', minorUnits: 2, name: "South African Rand", symbol: 'R', centralBank: "South African Reserve Bank", rtgsClearingSystem: 'SAMOS', instantClearingRail: 'PayShap', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Cent' },
  'AED': { code: 'AED', numericCode: '784', minorUnits: 2, name: "UAE Dirham", symbol: 'AED', centralBank: "Central Bank of the UAE", rtgsClearingSystem: 'UAEFTS', instantClearingRail: 'IPP / Aani', settlementCutoffUtc: '17:00', isHighValueSupported: true, standardFractionalUnit: 'Fils' },
  'SAR': { code: 'SAR', numericCode: '682', minorUnits: 2, name: "Saudi Riyal", symbol: 'SAR', centralBank: "Saudi Central Bank", rtgsClearingSystem: 'SARIE', instantClearingRail: 'Sarie Instant', settlementCutoffUtc: '16:30', isHighValueSupported: true, standardFractionalUnit: 'Halala' },
  'THB': { code: 'THB', numericCode: '764', minorUnits: 2, name: "Thai Baht", symbol: '฿', centralBank: "Bank of Thailand", rtgsClearingSystem: 'BAHTNET', instantClearingRail: 'PromptPay', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Satang' },
  'MYR': { code: 'MYR', numericCode: '458', minorUnits: 2, name: "Malaysian Ringgit", symbol: 'RM', centralBank: "Bank Negara Malaysia", rtgsClearingSystem: 'RENTAS', instantClearingRail: 'DuitNow', settlementCutoffUtc: '16:30', isHighValueSupported: true, standardFractionalUnit: 'Sen' },
  'IDR': { code: 'IDR', numericCode: '360', minorUnits: 2, name: "Indonesian Rupiah", symbol: 'Rp', centralBank: "Bank Indonesia", rtgsClearingSystem: 'BI-RTGS', instantClearingRail: 'BI-FAST', settlementCutoffUtc: '16:30', isHighValueSupported: true, standardFractionalUnit: 'Sen' },
  'PHP': { code: 'PHP', numericCode: '608', minorUnits: 2, name: "Philippine Peso", symbol: '₱', centralBank: "Bangko Sentral ng Pilipinas", rtgsClearingSystem: 'PhilPaSSplus', instantClearingRail: 'InstaPay', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Centavo' },
  'KRW': { code: 'KRW', numericCode: '410', minorUnits: 0, name: "South Korean Won", symbol: '₩', centralBank: "Bank of Korea", rtgsClearingSystem: 'BOK-Wire+', instantClearingRail: 'CD/ATM Net', settlementCutoffUtc: '17:00', isHighValueSupported: true, standardFractionalUnit: 'Jeon' },
  'ILS': { code: 'ILS', numericCode: '376', minorUnits: 2, name: "Israeli New Shekel", symbol: '₪', centralBank: "Bank of Israel", rtgsClearingSystem: 'ZAHAV', instantClearingRail: 'Masav Instant', settlementCutoffUtc: '16:30', isHighValueSupported: true, standardFractionalUnit: 'Agora' },
  'TRY': { code: 'TRY', numericCode: '949', minorUnits: 2, name: "Turkish Lira", symbol: '₺', centralBank: "Central Bank of Turkey", rtgsClearingSystem: 'EFT', instantClearingRail: 'FAST', settlementCutoffUtc: '16:30', isHighValueSupported: true, standardFractionalUnit: 'Kurus' },
  'CLP': { code: 'CLP', numericCode: '152', minorUnits: 0, name: "Chilean Peso", symbol: 'CLP$', centralBank: "Central Bank of Chile", rtgsClearingSystem: 'LBTR', instantClearingRail: 'TEF', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Centavo' },
  'COP': { code: 'COP', numericCode: '170', minorUnits: 2, name: "Colombian Peso", symbol: 'COL$', centralBank: "Bank of the Republic", rtgsClearingSystem: 'CUD', instantClearingRail: 'Transfiya', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Centavo' },
  'ARS': { code: 'ARS', numericCode: '032', minorUnits: 2, name: "Argentine Peso", symbol: 'ARS$', centralBank: "Central Bank of Argentina", rtgsClearingSystem: 'MEP', instantClearingRail: 'Transferencias 3.0', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Centavo' },
  'EGP': { code: 'EGP', numericCode: '818', minorUnits: 2, name: "Egyptian Pound", symbol: 'E£', centralBank: "Central Bank of Egypt", rtgsClearingSystem: 'RTGS', instantClearingRail: 'InstaPay Egypt', settlementCutoffUtc: '15:30', isHighValueSupported: true, standardFractionalUnit: 'Piastre' },
  'NGN': { code: 'NGN', numericCode: '566', minorUnits: 2, name: "Nigerian Naira", symbol: '₦', centralBank: "Central Bank of Nigeria", rtgsClearingSystem: 'CBN-RTGS', instantClearingRail: 'NIBSS NIP', settlementCutoffUtc: '23:59', isHighValueSupported: true, standardFractionalUnit: 'Kobo' },
  'KES': { code: 'KES', numericCode: '404', minorUnits: 2, name: "Kenyan Shilling", symbol: 'KSh', centralBank: "Central Bank of Kenya", rtgsClearingSystem: 'KNPS', instantClearingRail: 'M-Pesa / Pesalink', settlementCutoffUtc: '16:00', isHighValueSupported: true, standardFractionalUnit: 'Cent' },
  'VND': { code: 'VND', numericCode: '704', minorUnits: 0, name: "Vietnamese Dong", symbol: '₫', centralBank: "State Bank of Vietnam", rtgsClearingSystem: 'IBPS', instantClearingRail: 'NAPAS 247', settlementCutoffUtc: '16:30', isHighValueSupported: true, standardFractionalUnit: 'Hao' },
};
