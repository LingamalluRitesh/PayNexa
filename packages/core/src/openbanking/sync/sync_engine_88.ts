/**
 * Open Banking Data Extraction & Ledger Synchronizer #88
 * Open Banking Read/Write API Profile v3.1.10 Reconciliation
 */

export interface BankStatementFeed88 {
  bankAccountId: string;
  statementReference: string;
  openingBalanceMinorUnits: number;
  closingBalanceMinorUnits: number;
  currency: string;
  entries: Array<{
    bookingDate: string;
    valueDate: string;
    amountMinorUnits: number;
    creditDebitIndicator: 'CR' | 'DB';
    counterpartyName?: string;
    counterpartyIban?: string;
    remittanceInfo?: string;
  }>;
}

export class StatementSyncService88 {
  public static reconcile(feed: BankStatementFeed88): { isBalanced: boolean; totalDebits: number; totalCredits: number } {
    let totalDebits = 0;
    let totalCredits = 0;

    for (const e of feed.entries) {
      if (e.creditDebitIndicator === 'CR') {
        totalCredits += e.amountMinorUnits;
      } else {
        totalDebits += e.amountMinorUnits;
      }
    }

    const calculatedClosing = feed.openingBalanceMinorUnits + totalCredits - totalDebits;
    return {
      isBalanced: calculatedClosing === feed.closingBalanceMinorUnits,
      totalDebits,
      totalCredits,
    };
  }
}
