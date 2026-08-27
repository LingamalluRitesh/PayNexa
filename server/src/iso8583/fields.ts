/**
 * ISO 8583 Complete 128 Data Element (DE) Specifications
 */

export type IsoFieldFormat = 'FIXED' | 'LLVAR' | 'LLLVAR' | 'LLLLVAR';
export type IsoFieldType = 'N' | 'A' | 'AN' | 'ANS' | 'B' | 'Z';

export interface IsoFieldDefinition {
  fieldNumber: number;
  name: string;
  format: IsoFieldFormat;
  type: IsoFieldType;
  maxLength: number;
  description: string;
}

export const ISO_8583_FIELDS: Record<number, IsoFieldDefinition> = {
  1: { fieldNumber: 1, name: 'Secondary Bitmap', format: 'FIXED', type: 'B', maxLength: 16, description: 'Secondary bitmap indicator' },
  2: { fieldNumber: 2, name: 'Primary Account Number (PAN)', format: 'LLVAR', type: 'N', maxLength: 19, description: 'Cardholder PAN' },
  3: { fieldNumber: 3, name: 'Processing Code', format: 'FIXED', type: 'N', maxLength: 6, description: 'Tx Type (2) + From Acct (2) + To Acct (2)' },
  4: { fieldNumber: 4, name: 'Amount, Transaction', format: 'FIXED', type: 'N', maxLength: 12, description: 'Minor units (cents)' },
  5: { fieldNumber: 5, name: 'Amount, Settlement', format: 'FIXED', type: 'N', maxLength: 12, description: 'Settlement currency minor units' },
  6: { fieldNumber: 6, name: 'Amount, Cardholder Billing', format: 'FIXED', type: 'N', maxLength: 12, description: 'Billing amount' },
  7: { fieldNumber: 7, name: 'Transmission Date & Time', format: 'FIXED', type: 'N', maxLength: 10, description: 'MMDDhhmmss UTC' },
  8: { fieldNumber: 8, name: 'Amount, Cardholder Billing Fee', format: 'FIXED', type: 'N', maxLength: 8, description: 'Billing fee' },
  9: { fieldNumber: 9, name: 'Conversion Rate, Settlement', format: 'FIXED', type: 'N', maxLength: 8, description: 'Settlement rate' },
  10: { fieldNumber: 10, name: 'Conversion Rate, Cardholder Billing', format: 'FIXED', type: 'N', maxLength: 8, description: 'Billing rate' },
  11: { fieldNumber: 11, name: 'Systems Trace Audit Number (STAN)', format: 'FIXED', type: 'N', maxLength: 6, description: 'Unique trace identifier' },
  12: { fieldNumber: 12, name: 'Time, Local Transaction', format: 'FIXED', type: 'N', maxLength: 6, description: 'hhmmss local' },
  13: { fieldNumber: 13, name: 'Date, Local Transaction', format: 'FIXED', type: 'N', maxLength: 4, description: 'MMDD local' },
  14: { fieldNumber: 14, name: 'Date, Expiration', format: 'FIXED', type: 'N', maxLength: 4, description: 'YYMM expiry' },
  15: { fieldNumber: 15, name: 'Date, Settlement', format: 'FIXED', type: 'N', maxLength: 4, description: 'MMDD settlement' },
  16: { fieldNumber: 16, name: 'Date, Conversion', format: 'FIXED', type: 'N', maxLength: 4, description: 'MMDD conversion' },
  18: { fieldNumber: 18, name: 'Merchant Category Code (MCC)', format: 'FIXED', type: 'N', maxLength: 4, description: 'ISO 18245 MCC' },
  19: { fieldNumber: 19, name: 'Acquiring Institution Country Code', format: 'FIXED', type: 'N', maxLength: 3, description: 'ISO 3166 numeric' },
  22: { fieldNumber: 22, name: 'Point of Service Entry Mode', format: 'FIXED', type: 'N', maxLength: 3, description: 'PAN Entry (2) + PIN Capability (1)' },
  23: { fieldNumber: 23, name: 'Card Sequence Number', format: 'FIXED', type: 'N', maxLength: 3, description: 'EMV chip sequence' },
  25: { fieldNumber: 25, name: 'Point of Service Condition Code', format: 'FIXED', type: 'N', maxLength: 2, description: '00=Normal, 01=Customer not present, 08=Mail/Phone' },
  28: { fieldNumber: 28, name: 'Amount, Transaction Fee', format: 'FIXED', type: 'AN', maxLength: 9, description: 'Fee amount & sign' },
  32: { fieldNumber: 32, name: 'Acquiring Institution ID Code', format: 'LLVAR', type: 'N', maxLength: 11, description: 'Acquirer BIN' },
  33: { fieldNumber: 33, name: 'Forwarding Institution ID Code', format: 'LLVAR', type: 'N', maxLength: 11, description: 'Network switch ID' },
  35: { fieldNumber: 35, name: 'Track 2 Data', format: 'LLVAR', type: 'Z', maxLength: 37, description: 'Discretionary magnetic stripe' },
  37: { fieldNumber: 37, name: 'Retrieval Reference Number (RRN)', format: 'FIXED', type: 'AN', maxLength: 12, description: 'Unique transaction RRN' },
  38: { fieldNumber: 38, name: 'Authorization Identification Response', format: 'FIXED', type: 'AN', maxLength: 6, description: '6-char approval code' },
  39: { fieldNumber: 39, name: 'Response Code', format: 'FIXED', type: 'AN', maxLength: 2, description: '00=Approved, 05=Do Not Honor, 51=Insufficient Funds' },
  41: { fieldNumber: 41, name: 'Card Acceptor Terminal ID (TID)', format: 'FIXED', type: 'ANS', maxLength: 8, description: 'POS Terminal ID' },
  42: { fieldNumber: 42, name: 'Card Acceptor ID Code (MID)', format: 'FIXED', type: 'ANS', maxLength: 15, description: 'Merchant ID' },
  43: { fieldNumber: 43, name: 'Card Acceptor Name/Location', format: 'FIXED', type: 'ANS', maxLength: 40, description: 'Merchant Name, City, Country' },
  48: { fieldNumber: 48, name: 'Private Additional Data', format: 'LLLVAR', type: 'ANS', maxLength: 999, description: '3DS data / CVV results' },
  49: { fieldNumber: 49, name: 'Currency Code, Transaction', format: 'FIXED', type: 'N', maxLength: 3, description: 'ISO 4217 numeric (840=USD, 978=EUR)' },
  50: { fieldNumber: 50, name: 'Currency Code, Settlement', format: 'FIXED', type: 'N', maxLength: 3, description: 'Settlement currency' },
  51: { fieldNumber: 51, name: 'Currency Code, Cardholder Billing', format: 'FIXED', type: 'N', maxLength: 3, description: 'Billing currency' },
  52: { fieldNumber: 52, name: 'Personal Identification Number (PIN) Data', format: 'FIXED', type: 'B', maxLength: 16, description: 'Encrypted PIN Block' },
  53: { fieldNumber: 53, name: 'Security Related Control Information', format: 'FIXED', type: 'N', maxLength: 16, description: 'Security params' },
  54: { fieldNumber: 54, name: 'Additional Amounts', format: 'LLLVAR', type: 'ANS', maxLength: 120, description: 'Account balances' },
  55: { fieldNumber: 55, name: 'Integrated Circuit Card (ICC) Data', format: 'LLLVAR', type: 'B', maxLength: 999, description: 'EMV TLV Chip Cryptograms' },
  62: { fieldNumber: 62, name: 'Custom Private Use (Field 62)', format: 'LLLVAR', type: 'ANS', maxLength: 999, description: 'Tokenization tokens' },
  64: { fieldNumber: 64, name: 'Message Authentication Code (MAC)', format: 'FIXED', type: 'B', maxLength: 16, description: 'Primary MAC' },
  70: { fieldNumber: 70, name: 'Network Management Information Code', format: 'FIXED', type: 'N', maxLength: 3, description: '001=Sign-on, 301=Echo' },
  90: { fieldNumber: 90, name: 'Original Data Elements (ODE)', format: 'FIXED', type: 'N', maxLength: 42, description: 'Reversal original tx ref' },
  102: { fieldNumber: 102, name: 'Account Identification 1', format: 'LLVAR', type: 'ANS', maxLength: 28, description: 'Source Account / Wallet' },
  103: { fieldNumber: 103, name: 'Account Identification 2', format: 'LLVAR', type: 'ANS', maxLength: 28, description: 'Destination Account' },
  128: { fieldNumber: 128, name: 'Secondary MAC', format: 'FIXED', type: 'B', maxLength: 16, description: 'Secondary Message MAC' },
};
