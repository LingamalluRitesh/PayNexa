/**
 * NACHA Standard Entry Class (SEC): POS (PointOfSaleEntry)
 * Description: Electronic debit card POS terminal transaction
 * Compliant with NACHA Operating Rules & Guidelines v2026
 */

export interface PointOfSaleEntryEntry {
  recordTypeCode: '6';
  transactionCode: '22' | '27' | '32' | '37'; // Checking Credit, Checking Debit, Savings Credit, Savings Debit
  receivingDfiRoutingNumber: string; // 8 digits
  checkDigit: string; // 1 digit
  dfiAccountNumber: string; // up to 17 alphanumeric chars
  amountCents: number; // 10 digits minor units
  individualIdentificationNumber: string; // 15 alphanumeric chars
  individualName: string; // 22 alphanumeric chars
  discretionaryData?: string; // 2 alphanumeric chars
  addendaRecordIndicator: '0' | '1';
  traceNumber: string; // 15 numeric digits (ODFI 8 + sequence 7)
}

export class PointOfSaleEntryFormatter {
  public static formatEntryDetail(entry: PointOfSaleEntryEntry): string {
    const recType = '6';
    const txCode = entry.transactionCode.padStart(2, '0');
    const routing = entry.receivingDfiRoutingNumber.padStart(8, '0').slice(0, 8);
    const checkDigit = entry.checkDigit.slice(0, 1);
    const account = entry.dfiAccountNumber.padEnd(17, ' ').slice(0, 17);
    const amount = entry.amountCents.toString().padStart(10, '0').slice(0, 10);
    const idNum = entry.individualIdentificationNumber.padEnd(15, ' ').slice(0, 15);
    const name = entry.individualName.padEnd(22, ' ').slice(0, 22);
    const disc = (entry.discretionaryData || '').padEnd(2, ' ').slice(0, 2);
    const addendaInd = entry.addendaRecordIndicator;
    const trace = entry.traceNumber.padStart(15, '0').slice(0, 15);

    const line = `${recType}${txCode}${routing}${checkDigit}${account}${amount}${idNum}${name}${disc}${addendaInd}${trace}`;
    if (line.length !== 94) {
      throw new Error(`Invalid NACHA POS record length: expected 94, got ${line.length}`);
    }
    return line;
  }
}
