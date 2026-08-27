import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { PayNexaDatabase } from '../database/database.js';
import { LedgerService } from '../services/ledger.service.js';

describe('Double-Entry Ledger Invariants & Bookkeeping', () => {
  let testDb: PayNexaDatabase;
  let ledger: LedgerService;

  before(() => {
    testDb = new PayNexaDatabase(':memory:');
    ledger = new LedgerService();
  });

  it('should create balanced accounts and record journal entries', () => {
    const uid = Date.now();
    const customer = ledger.createAccount({
      code: `TEST_CUST_${uid}`,
      name: 'Test Customer 1',
      type: 'LIABILITY',
      category: 'CUSTOMER_WALLET',
      currency: 'USD',
      initialBalanceCents: 5000,
    });

    const merchant = ledger.createAccount({
      code: `TEST_MERCH_${uid}`,
      name: 'Test Merchant 1',
      type: 'LIABILITY',
      category: 'MERCHANT_SETTLEMENT',
      currency: 'USD',
      initialBalanceCents: 0,
    });

    assert.strictEqual(customer.balanceCents, 5000);
    assert.strictEqual(merchant.balanceCents, 0);

    // Transfer $20 (2000 cents)
    const entry = ledger.postJournalEntry({
      referenceId: `test_tx_${uid}`,
      type: 'P2P_TRANSFER',
      description: 'Transfer customer to merchant',
      baseCurrency: 'USD',
      postings: [
        { accountId: customer.id, direction: 'DEBIT', amountCents: 2000, currency: 'USD' },
        { accountId: merchant.id, direction: 'CREDIT', amountCents: 2000, currency: 'USD' },
      ],
    });

    assert.strictEqual(entry.status, 'POSTED');
    assert.strictEqual(entry.totalDebitCents, 2000);
    assert.strictEqual(entry.totalCreditCents, 2000);

    const updatedCustomer = ledger.getAccount(customer.id)!;
    const updatedMerchant = ledger.getAccount(merchant.id)!;

    assert.strictEqual(updatedCustomer.balanceCents, 3000);
    assert.strictEqual(updatedMerchant.balanceCents, 2000);
  });

  it('should reject imbalanced journal entries and maintain state', () => {
    const uid = Date.now() + 1;
    const customer = ledger.createAccount({
      code: `TEST_CUST_IMBAL_${uid}`,
      name: 'Test Customer Imbalance',
      type: 'LIABILITY',
      category: 'CUSTOMER_WALLET',
      currency: 'USD',
      initialBalanceCents: 5000,
    });
    const merchant = ledger.createAccount({
      code: `TEST_MERCH_IMBAL_${uid}`,
      name: 'Test Merchant Imbalance',
      type: 'LIABILITY',
      category: 'MERCHANT_SETTLEMENT',
      currency: 'USD',
      initialBalanceCents: 0,
    });

    const balanceBefore = customer.balanceCents;

    assert.throws(
      () => {
        ledger.postJournalEntry({
          referenceId: 'invalid_imbalanced_tx',
          type: 'PAYMENT_CAPTURE',
          description: 'Corrupt imbalanced entry',
          baseCurrency: 'USD',
          postings: [
            { accountId: customer.id, direction: 'DEBIT', amountCents: 1000, currency: 'USD' },
            { accountId: merchant.id, direction: 'CREDIT', amountCents: 500, currency: 'USD' }, // Imbalance!
          ],
        });
      },
      /Double-entry balance violation/
    );

    const customerAfter = ledger.getAccount(customer.id)!;
    assert.strictEqual(customerAfter.balanceCents, balanceBefore);
  });

  it('should verify global accounting integrity audit', () => {
    const audit = ledger.auditSystemLedger();
    assert.strictEqual(audit.unbalancedJournalsCount, 0);
  });
});
