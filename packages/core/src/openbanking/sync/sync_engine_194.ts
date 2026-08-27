/**
 * Open Banking Data Extraction & Ledger Synchronizer #194
 * Open Banking Read/Write API Profile v3.1.10 Reconciliation
 */

export interface BankStatementFeed194 {
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

export class StatementSyncService194 {
  public static reconcile(feed: BankStatementFeed194): { isBalanced: boolean; totalDebits: number; totalCredits: number } {
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
