import { db } from '../database/database.js';
import { ledgerService } from '../services/ledger.service.js';
import { paymentService } from '../services/payment.service.js';
import { seedDatabase } from '../database/seed.js';
import { generateTestPan } from '@paynexa/core';

async function runBenchmark() {
  console.log('🚀 Starting PayNexa High-Concurrency Stress Benchmark...');
  db.table('accounts').clear();
  db.table('journalEntries').clear();
  db.table('postings').clear();
  db.table('paymentIntents').clear();
  seedDatabase();

  const startTime = Date.now();
  const iterations = 500;
  console.log(`Processing ${iterations} concurrent ledger transfers and payment intents...`);

  const validPan = generateTestPan('VISA');
  let successCount = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const intent = paymentService.createIntent({
        merchantId: 'merch_demo_1',
        amountCents: 1000 + (i % 20) * 50,
        currency: 'USD',
        description: `Benchmark Intent #${i + 1}`,
      });

      await paymentService.confirmIntent(intent.id, {
        paymentMethodType: 'CARD',
        ipAddress: `10.0.${Math.floor(i / 250)}.${(i % 250) + 1}`,
        card: {
          cardNumber: validPan,
          expMonth: 10,
          expYear: 28,
          cvv: '123',
          holderName: 'Benchmark Tester',
        },
      });

      successCount++;
    } catch (err: unknown) {
      console.error(`Error in tx ${i}:`, (err as Error).message);
    }
  }

  const durationMs = Date.now() - startTime;
  const tps = Number(((successCount / (durationMs / 1000))).toFixed(2));

  console.log(`\n✨ Benchmark Completed!`);
  console.log(`- Total Successful Transactions: ${successCount} / ${iterations}`);
  console.log(`- Time Elapsed: ${durationMs}ms`);
  console.log(`- Throughput: ${tps} TPS (Transactions Per Second)`);

  const audit = ledgerService.auditSystemLedger();
  console.log(`\n🔍 Post-Benchmark Double-Entry Ledger Integrity Audit:`);
  console.log(`- Global Ledger Balanced: ${audit.isBalanced ? '✅ YES' : '❌ NO'}`);
  console.log(`- Unbalanced Journals: ${audit.unbalancedJournalsCount}`);
  console.log(`- Net Accounting Variance: $${audit.netAccountingVarianceCents / 100}`);
}

runBenchmark().catch(console.error);
