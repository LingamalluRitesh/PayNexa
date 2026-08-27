import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateIban, validateBic, iso20022 } from '@paynexa/core';
import { achRail } from '../rails/ach.rail.js';
import { upiRail } from '../rails/upi.rail.js';
import { amlEngine } from '../aml/aml.service.js';
import { pciVault } from '../vault/vault.service.js';
import { generateTestPan } from '@paynexa/core';

describe('ISO 20022, Payment Rails, PCI Vault & AML Compliance', () => {
  it('should validate European and International IBANs with Mod-97', () => {
    // Valid German IBAN
    const deRes = validateIban('DE89370400440532013000');
    assert.strictEqual(deRes.isValid, true);
    assert.strictEqual(deRes.countryCode, 'DE');

    // Valid French IBAN
    const frRes = validateIban('FR1420041010050500013M02606');
    assert.strictEqual(frRes.isValid, true);
    assert.strictEqual(frRes.countryCode, 'FR');

    // Invalid IBAN Checksum
    const invalidRes = validateIban('DE89370400440532013009');
    assert.strictEqual(invalidRes.isValid, false);
  });

  it('should validate SWIFT / BIC formats', () => {
    assert.strictEqual(validateBic('DBEUMM21XXX'), true);
    assert.strictEqual(validateBic('BNPAFRPP'), true);
    assert.strictEqual(validateBic('INVALID_BIC_123'), false);
  });

  it('should generate ISO 20022 pacs.008 Credit Transfer XML', () => {
    const doc = iso20022.createPacs008Document({
      endToEndId: 'E2E_PAYNEXA_9921',
      amount: 1500.5,
      currency: 'EUR',
      debtorName: 'Acme Corp Germany',
      debtorIban: 'DE89370400440532013000',
      debtorBic: 'DBEUMM21XXX',
      creditorName: 'Global Supplier SARL',
      creditorIban: 'FR1420041010050500013M02606',
      creditorBic: 'BNPAFRPP',
      remittanceInfo: 'Invoice #INV-2026-99',
    });

    const xml = iso20022.generatePacs008Xml(doc);
    assert.ok(xml.includes('urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10'));
    assert.ok(xml.includes('<EndToEndId>E2E_PAYNEXA_9921</EndToEndId>'));
    assert.ok(xml.includes('1500.50'));
    assert.ok(xml.includes('DE89370400440532013000'));
  });

  it('should generate compliant NACHA 94-character fixed-width ACH file', () => {
    const nacha = achRail.generateNachaFile({
      immediateDestination: '021000021',
      immediateOrigin: '1234567890',
      immediateDestinationName: 'FEDERAL RESERVE BANK',
      immediateOriginName: 'PAYNEXA DISBURSEMENT',
      batches: [
        {
          serviceClassCode: '200',
          companyName: 'PAYNEXA PAYROLL',
          companyIdentification: '1234567890',
          standardEntryClassCode: 'PPD',
          companyEntryDescription: 'PAYROLL',
          effectiveEntryDate: '260827',
          entries: [
            {
              transactionCode: '22', // DDA Credit
              receivingDfiRoutingNumber: '021000021',
              checkDigit: '1',
              dfiAccountNumber: '9876543210',
              amountCents: 450000,
              individualIdentificationNumber: 'EMP-1049',
              individualName: 'Alex Chen',
              addendaIndicator: '0',
            },
          ],
        },
      ],
    });

    const lines = nacha.split('\r\n');
    assert.ok(lines.length >= 10);
    assert.strictEqual(lines[0].length, 94);
    assert.strictEqual(lines[0][0], '1'); // File Header
    assert.strictEqual(lines[1][0], '5'); // Batch Header
    assert.strictEqual(lines[2][0], '6'); // Entry Detail
  });

  it('should generate UPI 2.0 dynamic payment intent links', () => {
    const upi = upiRail.generateIntentUrl({
      payeeVpa: 'merchant@paynexa',
      payeeName: 'Acme Superstore',
      merchantCode: '5411',
      transactionId: 'TXN_99182',
      transactionRefId: 'REF_99182',
      transactionNote: 'Grocery order #99182',
      amountRupees: 1499.5,
    });

    assert.ok(upi.rawIntentUri.startsWith('upi://pay?'));
    assert.ok(upi.rawIntentUri.includes('pa=merchant%40paynexa'));
    assert.ok(upi.rawIntentUri.includes('am=1499.50'));
  });

  it('should tokenize and detokenize sensitive cardholder data via PCI Vault', () => {
    const pan = generateTestPan('VISA');
    const token = pciVault.tokenizeCard({
      customerId: 'usr_sarah',
      cardNumber: pan,
      expMonth: 10,
      expYear: 28,
      cvv: '992',
      holderName: 'Sarah Connor',
    });

    assert.ok(token.tokenId.startsWith('tok_card_'));
    assert.strictEqual(token.brand, 'VISA');

    // Detokenize and verify exact match
    const detokenized = pciVault.detokenize(token.tokenId);
    assert.strictEqual(detokenized.pan, pan);
    assert.strictEqual(detokenized.cvv, '992');
    assert.strictEqual(detokenized.holderName, 'Sarah Connor');
  });

  it('should screen against OFAC SDN Sanctions with fuzzy Jaro-Winkler distance', () => {
    // Near exact match
    const blocked = amlEngine.screenName('Vladimir B. Petrov');
    assert.strictEqual(blocked.isMatch, true);
    assert.strictEqual(blocked.riskCategory, 'BLOCKED_SANCTION');

    // Clean low-risk name
    const clean = amlEngine.screenName('Johnathan Michael Smith');
    assert.strictEqual(clean.isMatch, false);
    assert.strictEqual(clean.riskCategory, 'LOW');
  });
});
