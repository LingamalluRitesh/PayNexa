import crypto from 'node:crypto';

export interface AchBatchEntry {
  transactionCode: '22' | '27' | '32' | '37'; // 22 = DDA Credit, 27 = DDA Debit, 32 = Savings Credit, 37 = Savings Debit
  receivingDfiRoutingNumber: string; // 8 digits (excluding check digit)
  checkDigit: string; // 1 digit
  dfiAccountNumber: string; // up to 17 alphanumeric
  amountCents: number;
  individualIdentificationNumber: string; // up to 15 chars
  individualName: string; // up to 22 chars
  discretionaryData?: string; // 2 chars
  addendaIndicator: '0' | '1';
}

export interface AchBatch {
  serviceClassCode: '200' | '220' | '225'; // 200 = Mixed, 220 = Credits Only, 225 = Debits Only
  companyName: string; // 16 chars
  companyDiscretionaryData?: string; // 20 chars
  companyIdentification: string; // 10 chars (Tax ID or Originator ID)
  standardEntryClassCode: 'PPD' | 'CCD' | 'WEB' | 'TEL';
  companyEntryDescription: string; // 10 chars (e.g. "PAYROLL", "PAYMENT")
  effectiveEntryDate: string; // YYMMDD
  entries: AchBatchEntry[];
}

export class AchRailEngine {
  /**
   * Generates a standard NACHA 94-character fixed-width formatted ACH file
   */
  public generateNachaFile(params: {
    immediateDestination: string; // 9 digits (Routing of Federal Reserve Bank)
    immediateOrigin: string; // 10 digits (Originator Tax ID or Routing)
    fileCreationDate?: Date;
    fileIdModifier?: string;
    immediateDestinationName?: string; // 23 chars
    immediateOriginName?: string; // 23 chars
    batches: AchBatch[];
  }): string {
    const lines: string[] = [];
    const now = params.fileCreationDate || new Date();
    const dateYYMMDD = this.formatDate(now);
    const timeHHMM = this.formatTime(now);
    const fileModifier = params.fileIdModifier || 'A';

    // 1. File Header Record (Type 1)
    const fileHeader = [
      '1',
      '01',
      this.padRight(params.immediateDestination, 10, ' '),
      this.padRight(params.immediateOrigin, 10, ' '),
      dateYYMMDD,
      timeHHMM,
      fileModifier,
      '094',
      '10',
      '1',
      this.padRight(params.immediateDestinationName || 'FEDACH', 23, ' '),
      this.padRight(params.immediateOriginName || 'PAYNEXA ORG', 23, ' '),
      '        ',
    ].join('');
    lines.push(fileHeader);

    let totalEntryCount = 0;
    let totalDebitCents = 0;
    let totalCreditCents = 0;
    let fileRoutingHash = 0;

    // 2. Batches
    params.batches.forEach((batch, batchIdx) => {
      const batchNum = batchIdx + 1;
      let batchDebitCents = 0;
      let batchCreditCents = 0;
      let batchRoutingHash = 0;

      // Batch Header Record (Type 5)
      const batchHeader = [
        '5',
        batch.serviceClassCode,
        this.padRight(batch.companyName, 16, ' '),
        this.padRight(batch.companyDiscretionaryData || '', 20, ' '),
        this.padRight(batch.companyIdentification, 10, ' '),
        batch.standardEntryClassCode,
        this.padRight(batch.companyEntryDescription, 10, ' '),
        this.padRight('', 6, ' '), // Company Descriptive Date
        batch.effectiveEntryDate,
        '   ', // Settlement Date (Julian, left blank by ODFI)
        '1', // Originator Status Code
        this.padRight(params.immediateOrigin.slice(0, 8), 8, ' '),
        this.padLeft(batchNum.toString(), 7, '0'),
      ].join('');
      lines.push(batchHeader);

      // Entry Detail Records (Type 6)
      batch.entries.forEach((entry, entryIdx) => {
        totalEntryCount++;
        const traceNum = this.padLeft((entryIdx + 1).toString(), 7, '0');
        const odfiTrace = this.padRight(params.immediateOrigin.slice(0, 8), 8, ' ') + traceNum;

        const routingNum8 = entry.receivingDfiRoutingNumber.slice(0, 8);
        const checkDigit = entry.checkDigit || entry.receivingDfiRoutingNumber.slice(8, 9) || '0';

        const routingVal = parseInt(routingNum8, 10) || 0;
        batchRoutingHash += routingVal;

        if (entry.transactionCode === '27' || entry.transactionCode === '37') {
          batchDebitCents += entry.amountCents;
          totalDebitCents += entry.amountCents;
        } else {
          batchCreditCents += entry.amountCents;
          totalCreditCents += entry.amountCents;
        }

        const entryRecord = [
          '6',
          entry.transactionCode,
          routingNum8,
          checkDigit,
          this.padRight(entry.dfiAccountNumber, 17, ' '),
          this.padLeft(entry.amountCents.toString(), 10, '0'),
          this.padRight(entry.individualIdentificationNumber, 15, ' '),
          this.padRight(entry.individualName, 22, ' '),
          this.padRight(entry.discretionaryData || '', 2, ' '),
          entry.addendaIndicator,
          odfiTrace,
        ].join('');
        lines.push(entryRecord);
      });

      fileRoutingHash += batchRoutingHash;

      // Batch Control Record (Type 8)
      const batchControl = [
        '8',
        batch.serviceClassCode,
        this.padLeft(batch.entries.length.toString(), 6, '0'),
        this.padLeft((batchRoutingHash % 10000000000).toString(), 10, '0'),
        this.padLeft(batchDebitCents.toString(), 12, '0'),
        this.padLeft(batchCreditCents.toString(), 12, '0'),
        this.padRight(batch.companyIdentification, 10, ' '),
        '                   ', // Message Authentication Code (blank)
        '      ', // Reserved
        this.padRight(params.immediateOrigin.slice(0, 8), 8, ' '),
        this.padLeft(batchNum.toString(), 7, '0'),
      ].join('');
      lines.push(batchControl);
    });

    // 3. File Control Record (Type 9)
    const blockCount = Math.ceil((lines.length + 1) / 10);
    const fileControl = [
      '9',
      this.padLeft(params.batches.length.toString(), 6, '0'),
      this.padLeft(blockCount.toString(), 6, '0'),
      this.padLeft(totalEntryCount.toString(), 8, '0'),
      this.padLeft((fileRoutingHash % 10000000000).toString(), 10, '0'),
      this.padLeft(totalDebitCents.toString(), 12, '0'),
      this.padLeft(totalCreditCents.toString(), 12, '0'),
      this.padRight('', 39, ' '),
    ].join('');
    lines.push(fileControl);

    // NACHA blocking: File line count must be multiple of 10, fill with 9s
    while (lines.length % 10 !== 0) {
      lines.push('9'.repeat(94));
    }

    return lines.join('\r\n');
  }

  private padRight(val: string, length: number, padChar: string = ' '): string {
    return (val || '').slice(0, length).padEnd(length, padChar);
  }

  private padLeft(val: string, length: number, padChar: string = '0'): string {
    return (val || '').slice(0, length).padStart(length, padChar);
  }

  private formatDate(d: Date): string {
    const yy = (d.getFullYear() % 100).toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }

  private formatTime(d: Date): string {
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}${mm}`;
  }
}

export const achRail = new AchRailEngine();
