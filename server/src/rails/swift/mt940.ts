export interface SwiftMt940StatementLine {
  valueDate: string; // YYMMDD
  entryDate?: string; // MMDD
  debitCreditIndicator: 'C' | 'D' | 'RC' | 'RD';
  currencyLastLetter?: string;
  amount: number;
  transactionTypeCode: string; // 4 chars (e.g. NTRF, NCHK, NCOL)
  customerReference: string; // up to 16 chars
  bankReference?: string; // up to 16 chars
  supplementaryDetails?: string; // Tag 86 narrative
}

export interface SwiftMt940Statement {
  transactionReference: string; // Tag 20
  accountIdentification: string; // Tag 25
  statementNumber: string; // Tag 28C
  openingBalance: {
    indicator: 'C' | 'D';
    date: string; // YYMMDD
    currency: string;
    amount: number;
  }; // Tag 60F
  lines: SwiftMt940StatementLine[];
  closingBalance: {
    indicator: 'C' | 'D';
    date: string; // YYMMDD
    currency: string;
    amount: number;
  }; // Tag 62F
}

export class SwiftMt940Engine {
  /**
   * Generates a SWIFT MT940 Customer Statement Message
   */
  public generateMt940(statement: SwiftMt940Statement): string {
    const lines: string[] = [
      '{1:F01PAYNUS33XXX0000000000}',
      '{2:I940CUSTOMERBANKXXXXU}',
      '{4:',
      `:20:${statement.transactionReference.slice(0, 16)}`,
      `:25:${statement.accountIdentification}`,
      `:28C:${statement.statementNumber}`,
      `:60F:${statement.openingBalance.indicator}${statement.openingBalance.date}${statement.openingBalance.currency}${statement.openingBalance.amount.toFixed(2).replace('.', ',')}`,
    ];

    for (const line of statement.lines) {
      const amtStr = line.amount.toFixed(2).replace('.', ',');
      const entryDt = line.entryDate || line.valueDate.slice(2, 6);
      const stmtLine = `:61:${line.valueDate}${entryDt}${line.debitCreditIndicator}${amtStr}${line.transactionTypeCode}//${line.customerReference}`;
      lines.push(stmtLine);

      if (line.supplementaryDetails) {
        lines.push(`:86:${line.supplementaryDetails.slice(0, 65)}`);
      }
    }

    lines.push(
      `:62F:${statement.closingBalance.indicator}${statement.closingBalance.date}${statement.closingBalance.currency}${statement.closingBalance.amount.toFixed(2).replace('.', ',')}`
    );
    lines.push('-}');

    return lines.join('\r\n');
  }

  /**
   * Parses SWIFT MT940 End-of-Day Bank Statement text
   */
  public parseMt940(raw: string): SwiftMt940Statement {
    const rawLines = raw.split(/\r?\n/);
    const statement: Partial<SwiftMt940Statement> = { lines: [] };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      if (line.startsWith(':20:')) {
        statement.transactionReference = line.substring(4);
      } else if (line.startsWith(':25:')) {
        statement.accountIdentification = line.substring(4);
      } else if (line.startsWith(':28C:')) {
        statement.statementNumber = line.substring(5);
      } else if (line.startsWith(':60F:')) {
        const payload = line.substring(5);
        const indicator = payload[0] as 'C' | 'D';
        const date = payload.slice(1, 7);
        const currency = payload.slice(7, 10);
        const amount = parseFloat(payload.slice(10).replace(',', '.'));
        statement.openingBalance = { indicator, date, currency, amount };
      } else if (line.startsWith(':61:')) {
        const payload = line.substring(4);
        const valueDate = payload.slice(0, 6);
        const entryDate = payload.slice(6, 10);
        const dOrC = payload[10] as 'C' | 'D';
        const rest = payload.slice(11);
        const slashIdx = rest.indexOf('//');
        const amtType = slashIdx !== -1 ? rest.slice(0, slashIdx) : rest;
        const ref = slashIdx !== -1 ? rest.slice(slashIdx + 2) : 'REF';

        statement.lines?.push({
          valueDate,
          entryDate,
          debitCreditIndicator: dOrC,
          amount: parseFloat(amtType.slice(0, -4).replace(',', '.')),
          transactionTypeCode: amtType.slice(-4),
          customerReference: ref,
        });
      } else if (line.startsWith(':62F:')) {
        const payload = line.substring(5);
        const indicator = payload[0] as 'C' | 'D';
        const date = payload.slice(1, 7);
        const currency = payload.slice(7, 10);
        const amount = parseFloat(payload.slice(10).replace(',', '.'));
        statement.closingBalance = { indicator, date, currency, amount };
      }
    }

    return statement as SwiftMt940Statement;
  }
}

export const swiftMt940 = new SwiftMt940Engine();
