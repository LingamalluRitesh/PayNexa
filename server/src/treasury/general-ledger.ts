import { db } from '../database/database.js';
import { ENTERPRISE_CHART_OF_ACCOUNTS } from './chart-of-accounts.js';

export interface TrialBalanceLine {
  accountCode: string;
  accountName: string;
  type: string;
  debitCents: number;
  creditCents: number;
}

export interface TrialBalanceReport {
  asOfDate: string;
  lines: TrialBalanceLine[];
  totalDebitCents: number;
  totalCreditCents: number;
  isBalanced: boolean;
  varianceCents: number;
}

export interface BalanceSheetReport {
  asOfDate: string;
  assets: {
    currentAssets: Array<{ name: string; amountCents: number }>;
    totalAssetsCents: number;
  };
  liabilities: {
    customerDeposits: Array<{ name: string; amountCents: number }>;
    merchantPayables: Array<{ name: string; amountCents: number }>;
    totalLiabilitiesCents: number;
  };
  equity: {
    contributedCapitalCents: number;
    retainedEarningsCents: number;
    currentPeriodNetIncomeCents: number;
    totalEquityCents: number;
  };
  isBalanced: boolean;
  varianceCents: number;
}

export interface IncomeStatementReport {
  periodStartDate: string;
  periodEndDate: string;
  revenues: Array<{ category: string; amountCents: number }>;
  totalRevenueCents: number;
  directCosts: Array<{ category: string; amountCents: number }>;
  totalDirectCostsCents: number;
  grossProfitCents: number;
  grossMarginPercentage: number;
  operatingExpenses: Array<{ category: string; amountCents: number }>;
  totalOperatingExpensesCents: number;
  netOperatingIncomeCents: number;
}

export class GeneralLedgerReportingEngine {
  /**
   * Generates a GAAP / IFRS Compliant Trial Balance
   */
  public generateTrialBalance(currency: string = 'USD'): TrialBalanceReport {
    const accounts = db.table('accounts').find((a) => a.currency === currency);
    const lines: TrialBalanceLine[] = [];
    let totalDebitCents = 0;
    let totalCreditCents = 0;

    for (const acc of accounts) {
      const isDebitNormal = acc.type === 'ASSET' || acc.type === 'EXPENSE';
      let debitCents = 0;
      let creditCents = 0;

      if (isDebitNormal) {
        debitCents = acc.balanceCents;
        totalDebitCents += debitCents;
      } else {
        creditCents = acc.balanceCents;
        totalCreditCents += creditCents;
      }

      lines.push({
        accountCode: acc.code,
        accountName: acc.name,
        type: acc.type,
        debitCents,
        creditCents,
      });
    }

    const varianceCents = totalDebitCents - totalCreditCents;

    return {
      asOfDate: new Date().toISOString(),
      lines,
      totalDebitCents,
      totalCreditCents,
      isBalanced: varianceCents === 0,
      varianceCents,
    };
  }

  /**
   * Generates a Consolidated Balance Sheet (Assets = Liabilities + Equity)
   */
  public generateBalanceSheet(currency: string = 'USD'): BalanceSheetReport {
    const accounts = db.table('accounts').find((a) => a.currency === currency);

    let totalAssetsCents = 0;
    const currentAssets: Array<{ name: string; amountCents: number }> = [];

    let totalLiabilitiesCents = 0;
    const customerDeposits: Array<{ name: string; amountCents: number }> = [];
    const merchantPayables: Array<{ name: string; amountCents: number }> = [];

    let contributedCapitalCents = 0;
    let retainedEarningsCents = 0;
    let currentPeriodRevenueCents = 0;
    let currentPeriodExpenseCents = 0;

    for (const acc of accounts) {
      if (acc.type === 'ASSET') {
        totalAssetsCents += acc.balanceCents;
        currentAssets.push({ name: acc.name, amountCents: acc.balanceCents });
      } else if (acc.type === 'LIABILITY') {
        totalLiabilitiesCents += acc.balanceCents;
        if (acc.category === 'CUSTOMER_WALLET') {
          customerDeposits.push({ name: acc.name, amountCents: acc.balanceCents });
        } else {
          merchantPayables.push({ name: acc.name, amountCents: acc.balanceCents });
        }
      } else if (acc.type === 'EQUITY') {
        if (acc.code.includes('CAPITAL') || acc.code.includes('EQUITY')) {
          contributedCapitalCents += acc.balanceCents;
        } else {
          retainedEarningsCents += acc.balanceCents;
        }
      } else if (acc.type === 'REVENUE') {
        currentPeriodRevenueCents += acc.balanceCents;
      } else if (acc.type === 'EXPENSE') {
        currentPeriodExpenseCents += acc.balanceCents;
      }
    }

    const currentPeriodNetIncomeCents = currentPeriodRevenueCents - currentPeriodExpenseCents;
    const totalEquityCents = contributedCapitalCents + retainedEarningsCents + currentPeriodNetIncomeCents;

    const varianceCents = totalAssetsCents - (totalLiabilitiesCents + totalEquityCents);

    return {
      asOfDate: new Date().toISOString(),
      assets: {
        currentAssets,
        totalAssetsCents,
      },
      liabilities: {
        customerDeposits,
        merchantPayables,
        totalLiabilitiesCents,
      },
      equity: {
        contributedCapitalCents,
        retainedEarningsCents,
        currentPeriodNetIncomeCents,
        totalEquityCents,
      },
      isBalanced: varianceCents === 0,
      varianceCents,
    };
  }

  /**
   * Generates a Period Income Statement (Profit & Loss / P&L)
   */
  public generateIncomeStatement(currency: string = 'USD'): IncomeStatementReport {
    const accounts = db.table('accounts').find((a) => a.currency === currency);

    const revenues: Array<{ category: string; amountCents: number }> = [];
    let totalRevenueCents = 0;

    const directCosts: Array<{ category: string; amountCents: number }> = [];
    let totalDirectCostsCents = 0;

    for (const acc of accounts) {
      if (acc.type === 'REVENUE') {
        totalRevenueCents += acc.balanceCents;
        revenues.push({ category: acc.name, amountCents: acc.balanceCents });
      } else if (acc.type === 'EXPENSE') {
        totalDirectCostsCents += acc.balanceCents;
        directCosts.push({ category: acc.name, amountCents: acc.balanceCents });
      }
    }

    const grossProfitCents = totalRevenueCents - totalDirectCostsCents;
    const grossMarginPercentage = totalRevenueCents > 0 ? (grossProfitCents / totalRevenueCents) * 100 : 100;

    return {
      periodStartDate: '2026-01-01T00:00:00.000Z',
      periodEndDate: new Date().toISOString(),
      revenues,
      totalRevenueCents,
      directCosts,
      totalDirectCostsCents,
      grossProfitCents,
      grossMarginPercentage: Number(grossMarginPercentage.toFixed(2)),
      operatingExpenses: [],
      totalOperatingExpensesCents: 0,
      netOperatingIncomeCents: grossProfitCents,
    };
  }
}

export const generalLedger = new GeneralLedgerReportingEngine();
