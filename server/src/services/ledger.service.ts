import crypto from 'node:crypto';
import { db } from '../database/database.js';
import {
  LedgerAccount,
  JournalEntry,
  Posting,
  BalanceHold,
  CurrencyCode,
  AccountType,
  AccountCategory,
  JournalTransactionType,
  LedgerAuditAssertion,
} from '@paynexa/core';

export class LedgerService {
  /**
   * Creates a new ledger account
   */
  public createAccount(params: {
    code: string;
    name: string;
    type: AccountType;
    category: AccountCategory;
    currency: CurrencyCode;
    ownerId?: string;
    ownerType?: 'MERCHANT' | 'CUSTOMER' | 'PLATFORM';
    initialBalanceCents?: number;
  }): LedgerAccount {
    const existing = db.table('accounts').findOne((a) => a.code === params.code);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const account: LedgerAccount = {
      id: `acc_${crypto.randomUUID()}`,
      code: params.code,
      name: params.name,
      type: params.type,
      category: params.category,
      currency: params.currency,
      balanceCents: params.initialBalanceCents || 0,
      pendingHoldCents: 0,
      availableBalanceCents: params.initialBalanceCents || 0,
      ownerId: params.ownerId,
      ownerType: params.ownerType || 'PLATFORM',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return db.table('accounts').insert(account);
  }

  public getAccount(id: string): LedgerAccount | undefined {
    return db.table('accounts').get(id);
  }

  public getAccountByCode(code: string): LedgerAccount | undefined {
    return db.table('accounts').findOne((a) => a.code === code);
  }

  public listAccounts(ownerId?: string): LedgerAccount[] {
    if (ownerId) {
      return db.table('accounts').find((a) => a.ownerId === ownerId);
    }
    return db.table('accounts').all();
  }

  /**
   * Posts an immutable Journal Entry with strict double-entry invariant verification:
   * sum(DEBITS) === sum(CREDITS)
   */
  public postJournalEntry(params: {
    referenceId: string;
    type: JournalTransactionType;
    description: string;
    baseCurrency: CurrencyCode;
    postings: Array<{
      accountId: string;
      direction: 'DEBIT' | 'CREDIT';
      amountCents: number;
      currency: CurrencyCode;
      description?: string;
    }>;
    metadata?: Record<string, unknown>;
  }): JournalEntry {
    if (!params.postings || params.postings.length < 2) {
      throw new Error('A journal entry must contain at least two postings to satisfy double-entry bookkeeping.');
    }

    return db.transaction(() => {
      // Check for duplicate reference posting if idempotency required
      const existing = db.table('journalEntries').findOne((j) => j.referenceId === params.referenceId);
      if (existing) {
        return existing;
      }

      let totalDebitCents = 0;
      let totalCreditCents = 0;

      for (const p of params.postings) {
        if (p.amountCents <= 0) {
          throw new Error(`Posting amount must be positive integer minor units. Received: ${p.amountCents}`);
        }
        if (p.direction === 'DEBIT') {
          totalDebitCents += p.amountCents;
        } else if (p.direction === 'CREDIT') {
          totalCreditCents += p.amountCents;
        }
      }

      // Strict Double-Entry Invariance Check
      if (totalDebitCents !== totalCreditCents) {
        throw new Error(
          `Double-entry balance violation! Total Debits (${totalDebitCents}) must equal Total Credits (${totalCreditCents}). Variance: ${totalDebitCents - totalCreditCents}`
        );
      }

      const journalId = `jrn_${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const createdPostings: Posting[] = [];

      for (const p of params.postings) {
        const account = db.table('accounts').get(p.accountId);
        if (!account) {
          throw new Error(`Ledger account not found: ${p.accountId}`);
        }
        if (!account.isActive) {
          throw new Error(`Ledger account is inactive or frozen: ${p.accountId}`);
        }

        // Calculate new balance based on Account Accounting Category Normal Balances
        // ASSET / EXPENSE: Normal DEBIT (+ on Debit, - on Credit)
        // LIABILITY / EQUITY / REVENUE: Normal CREDIT (+ on Credit, - on Debit)
        let balanceDelta = 0;
        if (account.type === 'ASSET' || account.type === 'EXPENSE') {
          balanceDelta = p.direction === 'DEBIT' ? p.amountCents : -p.amountCents;
        } else {
          balanceDelta = p.direction === 'CREDIT' ? p.amountCents : -p.amountCents;
        }

        const newBalanceCents = account.balanceCents + balanceDelta;
        const newAvailableBalanceCents = newBalanceCents - account.pendingHoldCents;

        // Prevent negative balances on Customer or Merchant accounts unless overdraft permitted
        if (account.ownerType === 'CUSTOMER' && newAvailableBalanceCents < 0) {
          throw new Error(`Insufficient funds in account ${account.name} (${account.code}). Available: ${account.availableBalanceCents}, Required: ${p.amountCents}`);
        }

        db.table('accounts').update(account.id, {
          balanceCents: newBalanceCents,
          availableBalanceCents: newAvailableBalanceCents,
        });

        const posting: Posting = {
          id: `pst_${crypto.randomUUID()}`,
          journalEntryId: journalId,
          accountId: account.id,
          direction: p.direction,
          amountCents: p.amountCents,
          currency: p.currency,
          accountSnapshotBalanceCents: newBalanceCents,
          description: p.description || params.description,
          createdAt: now,
        };

        db.table('postings').insert(posting);
        createdPostings.push(posting);
      }

      const entry: JournalEntry = {
        id: journalId,
        referenceId: params.referenceId,
        type: params.type,
        status: 'POSTED',
        description: params.description,
        baseCurrency: params.baseCurrency,
        totalDebitCents,
        totalCreditCents,
        postings: createdPostings,
        metadata: params.metadata,
        createdAt: now,
      };

      db.table('journalEntries').insert(entry);
      return entry;
    });
  }

  /**
   * P2P / Direct Transfer between two ledger accounts
   */
  public transferFunds(params: {
    sourceAccountId: string;
    destinationAccountId: string;
    amountCents: number;
    currency: CurrencyCode;
    description: string;
    referenceId?: string;
  }): JournalEntry {
    const source = db.table('accounts').get(params.sourceAccountId);
    const dest = db.table('accounts').get(params.destinationAccountId);

    if (!source || !dest) {
      throw new Error('Source or Destination account does not exist.');
    }

    const refId = params.referenceId || `xfer_${crypto.randomUUID()}`;

    // Double entry:
    // If transferring between liabilities (e.g. Customer A to Customer B):
    // Debit Customer A (decreases balance)
    // Credit Customer B (increases balance)
    return this.postJournalEntry({
      referenceId: refId,
      type: 'P2P_TRANSFER',
      description: params.description,
      baseCurrency: params.currency,
      postings: [
        {
          accountId: source.id,
          direction: source.type === 'ASSET' ? 'CREDIT' : 'DEBIT',
          amountCents: params.amountCents,
          currency: params.currency,
          description: `Transfer to ${dest.name}`,
        },
        {
          accountId: dest.id,
          direction: dest.type === 'ASSET' ? 'DEBIT' : 'CREDIT',
          amountCents: params.amountCents,
          currency: params.currency,
          description: `Transfer from ${source.name}`,
        },
      ],
    });
  }

  /**
   * Places a pending hold/reservation on an account balance (e.g. for card pre-authorization)
   */
  public placeHold(params: {
    accountId: string;
    amountCents: number;
    referenceType: 'PAYMENT_AUTHORIZATION' | 'DISPUTE_PENDING' | 'WITHDRAWAL_IN_TRANSIT';
    referenceId: string;
    expiresInHours?: number;
  }): BalanceHold {
    return db.transaction(() => {
      const account = db.table('accounts').get(params.accountId);
      if (!account) throw new Error(`Account not found: ${params.accountId}`);

      if (account.availableBalanceCents < params.amountCents) {
        throw new Error(`Insufficient available balance to place hold. Available: ${account.availableBalanceCents}, Hold requested: ${params.amountCents}`);
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + (params.expiresInHours || 72) * 3600 * 1000).toISOString();

      const newHoldCents = account.pendingHoldCents + params.amountCents;
      const newAvailable = account.balanceCents - newHoldCents;

      db.table('accounts').update(account.id, {
        pendingHoldCents: newHoldCents,
        availableBalanceCents: newAvailable,
      });

      const hold: BalanceHold = {
        id: `hold_${crypto.randomUUID()}`,
        accountId: account.id,
        amountCents: params.amountCents,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        status: 'ACTIVE',
        expiresAt,
        createdAt: now.toISOString(),
      };

      return db.table('balanceHolds').insert(hold);
    });
  }

  /**
   * Releases an active hold back to available balance
   */
  public releaseHold(holdId: string): BalanceHold {
    return db.transaction(() => {
      const hold = db.table('balanceHolds').get(holdId);
      if (!hold || hold.status !== 'ACTIVE') {
        throw new Error('Hold not found or not active');
      }

      const account = db.table('accounts').get(hold.accountId);
      if (account) {
        const newHoldCents = Math.max(0, account.pendingHoldCents - hold.amountCents);
        const newAvailable = account.balanceCents - newHoldCents;

        db.table('accounts').update(account.id, {
          pendingHoldCents: newHoldCents,
          availableBalanceCents: newAvailable,
        });
      }

      return db.table('balanceHolds').update(holdId, { status: 'RELEASED' });
    });
  }

  /**
   * Mathematical Audit of Global Ledger Integrity:
   * Verifies Assets = Liabilities + Equity + (Revenue - Expenses)
   */
  public auditSystemLedger(currency: CurrencyCode = 'USD'): LedgerAuditAssertion {
    const accounts = db.table('accounts').find((a) => a.currency === currency);
    let totalSystemAssetsCents = 0;
    let totalSystemLiabilitiesCents = 0;
    let totalSystemEquityCents = 0;
    let totalSystemRevenueCents = 0;
    let totalSystemExpenseCents = 0;

    for (const acc of accounts) {
      switch (acc.type) {
        case 'ASSET':
          totalSystemAssetsCents += acc.balanceCents;
          break;
        case 'LIABILITY':
          totalSystemLiabilitiesCents += acc.balanceCents;
          break;
        case 'EQUITY':
          totalSystemEquityCents += acc.balanceCents;
          break;
        case 'REVENUE':
          totalSystemRevenueCents += acc.balanceCents;
          break;
        case 'EXPENSE':
          totalSystemExpenseCents += acc.balanceCents;
          break;
      }
    }

    // Accounting Equation: Assets == Liabilities + Equity + Revenue - Expense
    const rightSide = totalSystemLiabilitiesCents + totalSystemEquityCents + totalSystemRevenueCents - totalSystemExpenseCents;
    const netAccountingVarianceCents = totalSystemAssetsCents - rightSide;

    // Check individual journals
    const journals = db.table('journalEntries').find((j) => j.baseCurrency === currency);
    let unbalancedJournalsCount = 0;
    for (const j of journals) {
      if (j.totalDebitCents !== j.totalCreditCents) {
        unbalancedJournalsCount++;
      }
    }

    return {
      isBalanced: netAccountingVarianceCents === 0 && unbalancedJournalsCount === 0,
      totalSystemAssetsCents,
      totalSystemLiabilitiesCents,
      totalSystemEquityCents,
      totalSystemRevenueCents,
      totalSystemExpenseCents,
      netAccountingVarianceCents,
      unbalancedJournalsCount,
      auditedAt: new Date().toISOString(),
    };
  }
}

export const ledgerService = new LedgerService();
