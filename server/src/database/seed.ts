import crypto from 'node:crypto';
import { db } from './database.js';
import { ledgerService } from '../services/ledger.service.js';
import { generateApiKey, hashApiKey, formatMaskedCard } from '@paynexa/core';

export function seedDatabase(): void {
  // If accounts already exist, skip seed
  if (db.table('accounts').count() > 0) {
    console.log('Database already initialized, skipping seed.');
    return;
  }

  console.log('🌱 Seeding PayNexa Core Banking & Payment Database...');

  // 1. Users
  const alex = db.table('users').insert({
    id: 'usr_alex_chen',
    email: 'alex.chen@acmecommerce.io',
    name: 'Alex Chen',
    role: 'MERCHANT_OWNER',
    merchantId: 'merch_demo_1',
    defaultCurrency: 'USD',
    kycStatus: 'VERIFIED',
    isTwoFactorEnabled: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  });

  const sarah = db.table('users').insert({
    id: 'usr_sarah_connor',
    email: 'sarah.c@cyberdyne.net',
    name: 'Sarah Connor',
    role: 'CONSUMER',
    defaultCurrency: 'USD',
    kycStatus: 'VERIFIED',
    isTwoFactorEnabled: false,
    createdAt: '2026-02-01T10:30:00.000Z',
  });

  const priya = db.table('users').insert({
    id: 'usr_priya_sharma',
    email: 'priya.sharma@fintechhub.in',
    name: 'Priya Sharma',
    role: 'CONSUMER',
    defaultCurrency: 'INR',
    kycStatus: 'VERIFIED',
    isTwoFactorEnabled: true,
    createdAt: '2026-02-15T14:20:00.000Z',
  });

  const complianceOfficer = db.table('users').insert({
    id: 'usr_compliance_admin',
    email: 'elena.compliance@paynexa.io',
    name: 'Elena Rostova',
    role: 'COMPLIANCE_OFFICER',
    defaultCurrency: 'USD',
    kycStatus: 'VERIFIED',
    isTwoFactorEnabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  });

  // 2. Core Ledger Accounts
  const reserveUsd = ledgerService.createAccount({
    code: 'ACC_PLATFORM_RESERVE_USD',
    name: 'PayNexa Central Liquidity Reserve (USD)',
    type: 'ASSET',
    category: 'PLATFORM_RESERVE',
    currency: 'USD',
    initialBalanceCents: 100000000, // $1,000,000.00 initial capital
  });

  const feesUsd = ledgerService.createAccount({
    code: 'ACC_PLATFORM_FEES_USD',
    name: 'PayNexa Revenue & Processing Fees (USD)',
    type: 'REVENUE',
    category: 'PLATFORM_FEES',
    currency: 'USD',
    initialBalanceCents: 458200, // $4,582.00
  });

  const equityUsd = ledgerService.createAccount({
    code: 'ACC_PLATFORM_EQUITY_USD',
    name: 'PayNexa Contributed Capital & Retained Earnings (USD)',
    type: 'EQUITY',
    category: 'PLATFORM_RESERVE',
    currency: 'USD',
    initialBalanceCents: 95003800, // $950,038.00 balancing equity
  });

  const clearingUsd = ledgerService.createAccount({
    code: 'ACC_SCHEME_CLEARING_USD',
    name: 'Visa/Mastercard Scheme Clearing (USD)',
    type: 'ASSET',
    category: 'SCHEME_SETTLEMENT',
    currency: 'USD',
    initialBalanceCents: 5824000, // $58,240.00 in transit
  });

  const merchAccUsd = ledgerService.createAccount({
    code: 'ACC_MERCHANT_merch_demo_1_USD',
    name: 'Acme Commerce Settlement (USD)',
    type: 'LIABILITY',
    category: 'MERCHANT_SETTLEMENT',
    currency: 'USD',
    ownerId: 'merch_demo_1',
    ownerType: 'MERCHANT',
    initialBalanceCents: 8452000, // $84,520.00
  });

  const merchAccEur = ledgerService.createAccount({
    code: 'ACC_MERCHANT_merch_demo_1_EUR',
    name: 'Acme Commerce Settlement (EUR)',
    type: 'LIABILITY',
    category: 'MERCHANT_SETTLEMENT',
    currency: 'EUR',
    ownerId: 'merch_demo_1',
    ownerType: 'MERCHANT',
    initialBalanceCents: 2435000, // €24,350.00
  });

  const customerAlexUsd = ledgerService.createAccount({
    code: 'ACC_CUSTOMER_usr_alex_chen_USD',
    name: "Alex Chen's Main Digital Wallet (USD)",
    type: 'LIABILITY',
    category: 'CUSTOMER_WALLET',
    currency: 'USD',
    ownerId: alex.id,
    ownerType: 'CUSTOMER',
    initialBalanceCents: 1425000, // $14,250.00
  });

  const customerSarahUsd = ledgerService.createAccount({
    code: 'ACC_CUSTOMER_usr_sarah_connor_USD',
    name: "Sarah Connor's Digital Wallet (USD)",
    type: 'LIABILITY',
    category: 'CUSTOMER_WALLET',
    currency: 'USD',
    ownerId: sarah.id,
    ownerType: 'CUSTOMER',
    initialBalanceCents: 485000, // $4,850.00
  });

  const customerPriyaInr = ledgerService.createAccount({
    code: 'ACC_CUSTOMER_usr_priya_sharma_INR',
    name: "Priya Sharma's UPI Wallet (INR)",
    type: 'LIABILITY',
    category: 'CUSTOMER_WALLET',
    currency: 'INR',
    ownerId: priya.id,
    ownerType: 'CUSTOMER',
    initialBalanceCents: 38500000, // ₹385,000.00
  });

  // 3. API Keys for Acme Commerce
  const pubKeyRaw = 'pk_live_demo_acme_checkout_2026';
  db.table('apiKeys').insert({
    id: 'key_pub_demo',
    merchantId: 'merch_demo_1',
    name: 'Acme Primary Publishable Key',
    keyPrefix: 'pk_live_',
    keyRedacted: 'pk_live_...2026',
    keyHash: hashApiKey(pubKeyRaw),
    type: 'PUBLISHABLE',
    environment: 'LIVE',
    createdAt: '2026-01-10T08:30:00.000Z',
  });

  const secKeyRaw = 'sk_live_demo_acme_master_secret_2026';
  db.table('apiKeys').insert({
    id: 'key_sec_demo',
    merchantId: 'merch_demo_1',
    name: 'Acme Master Production Secret Key',
    keyPrefix: 'sk_live_',
    keyRedacted: 'sk_live_...2026',
    keyHash: hashApiKey(secKeyRaw),
    type: 'SECRET',
    environment: 'LIVE',
    createdAt: '2026-01-10T08:30:00.000Z',
  });

  // 4. Fraud Rules
  db.table('fraudRules').insert({
    id: 'rule_vel_1',
    name: 'Excessive Velocity Burst Check',
    description: 'Triggers when more than 5 payments are attempted within 5 minutes',
    conditionType: 'VELOCITY_COUNT_EXCEEDED',
    thresholdValue: 5,
    timeWindowSeconds: 300,
    riskPoints: 45,
    actionIfTriggered: 'CHALLENGE_3DS',
    isEnabled: true,
    isSystemRule: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  });

  db.table('fraudRules').insert({
    id: 'rule_amt_high',
    name: 'High Value Transaction Monitor',
    description: 'Requires 3D Secure verification on transactions exceeding $1,000.00',
    conditionType: 'AMOUNT_GREATER_THAN',
    thresholdValue: 100000,
    riskPoints: 35,
    actionIfTriggered: 'CHALLENGE_3DS',
    isEnabled: true,
    isSystemRule: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  });

  db.table('fraudRules').insert({
    id: 'rule_geo_1',
    name: 'IP & Issuing Country Cross-Border Check',
    description: 'Flags transactions where client IP origin differs from card BIN issuing country',
    conditionType: 'IP_COUNTRY_MISMATCH',
    thresholdValue: 'CROSS_BORDER',
    riskPoints: 25,
    actionIfTriggered: 'MANUAL_REVIEW',
    isEnabled: true,
    isSystemRule: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  });

  // 5. Blacklist
  db.table('blacklist').insert({
    id: 'bl_ip_1',
    type: 'IP_ADDRESS',
    value: '198.51.100.42',
    reason: 'Confirmed credential stuffing automated bot attack',
    addedBy: complianceOfficer.name,
    createdAt: '2026-02-10T12:00:00.000Z',
  });

  db.table('blacklist').insert({
    id: 'bl_email_1',
    type: 'EMAIL',
    value: 'fraudster@disposable-inbox.xyz',
    reason: 'Repeated chargeback abuse',
    addedBy: complianceOfficer.name,
    createdAt: '2026-02-14T09:30:00.000Z',
  });

  // 6. Virtual Cards
  db.table('virtualCards').insert({
    id: 'card_alex_visa',
    userId: alex.id,
    panMasked: '4532 •••• •••• 8821',
    panEncrypted: '4532982410398821',
    last4: '8821',
    cardholderName: 'Alex Chen',
    expMonth: 8,
    expYear: 29,
    cvvEncrypted: '842',
    brand: 'VISA',
    type: 'VIRTUAL',
    formFactor: 'GENERAL_PURPOSE',
    status: 'ACTIVE',
    currency: 'USD',
    balanceLimitCents: 1000000,
    spendingLimits: {
      perTransactionMaxCents: 150000,
      dailyMaxCents: 300000,
      monthlyMaxCents: 1000000,
      currentDaySpentCents: 24500,
      currentMonthSpentCents: 184500,
    },
    restrictions: {},
    isBurnOnUse: false,
    timesUsed: 14,
    billingAddress: {
      line1: '500 Market St, Floor 12',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
    },
    createdAt: '2026-01-15T11:00:00.000Z',
    updatedAt: '2026-01-15T11:00:00.000Z',
  });

  db.table('virtualCards').insert({
    id: 'card_sarah_burn',
    userId: sarah.id,
    panMasked: '5241 •••• •••• 3914',
    panEncrypted: '5241049281723914',
    last4: '3914',
    cardholderName: 'Sarah Connor',
    expMonth: 12,
    expYear: 28,
    cvvEncrypted: '319',
    brand: 'MASTERCARD',
    type: 'VIRTUAL',
    formFactor: 'SINGLE_USE',
    status: 'ACTIVE',
    currency: 'USD',
    balanceLimitCents: 25000,
    spendingLimits: {
      perTransactionMaxCents: 25000,
      dailyMaxCents: 25000,
      monthlyMaxCents: 25000,
      currentDaySpentCents: 0,
      currentMonthSpentCents: 0,
    },
    restrictions: { singleMerchantLockName: 'CloudCompute Inc' },
    isBurnOnUse: true,
    timesUsed: 0,
    billingAddress: {
      line1: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      postalCode: '97477',
      country: 'US',
    },
    createdAt: '2026-02-18T16:45:00.000Z',
    updatedAt: '2026-02-18T16:45:00.000Z',
  });

  // 7. Plans & Subscriptions
  const planDev = db.table('plans').insert({
    id: 'plan_dev_pro',
    merchantId: 'merch_demo_1',
    name: 'Developer Pro Tier',
    description: 'Full API access, 10,000 monthly transactions, and dedicated webhook SLA',
    amountCents: 4900,
    currency: 'USD',
    interval: 'MONTH',
    intervalCount: 1,
    trialPeriodDays: 14,
    isActive: true,
    createdAt: '2026-01-12T09:00:00.000Z',
  });

  db.table('subscriptions').insert({
    id: 'sub_demo_1',
    merchantId: 'merch_demo_1',
    customerId: sarah.id,
    planId: planDev.id,
    status: 'ACTIVE',
    currentPeriodStart: '2026-02-01T00:00:00.000Z',
    currentPeriodEnd: '2026-03-01T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  });

  // 8. Sample Payment Intents
  const pi1 = db.table('paymentIntents').insert({
    id: 'pi_demo_captured_01',
    merchantId: 'merch_demo_1',
    customerId: sarah.id,
    amountCents: 12500, // $125.00
    currency: 'USD',
    feeCents: 393,
    netAmountCents: 12107,
    status: 'SUCCEEDED',
    paymentMethodType: 'CARD',
    description: 'Enterprise Cloud License Order #9841',
    statementDescriptor: 'PAYNEXA*ACME',
    clientSecret: 'pi_demo_captured_01_secret_demo',
    riskScore: 18,
    riskDecision: 'APPROVE',
    metadata: { orderId: 'ORD-9841', customerName: 'Sarah Connor' },
    capturedAt: '2026-02-26T10:15:00.000Z',
    createdAt: '2026-02-26T10:14:30.000Z',
    updatedAt: '2026-02-26T10:15:00.000Z',
  });

  db.table('charges').insert({
    id: 'ch_demo_01',
    paymentIntentId: pi1.id,
    merchantId: pi1.merchantId,
    customerId: sarah.id,
    amountCents: 12500,
    currency: 'USD',
    amountRefundedCents: 0,
    feeCents: 393,
    status: 'SUCCEEDED',
    paid: true,
    refunded: false,
    paymentMethodSnapshot: {
      id: 'pm_demo_1',
      customerId: sarah.id,
      type: 'CARD',
      card: {
        brand: 'VISA',
        last4: '4242',
        expMonth: 11,
        expYear: 28,
        funding: 'CREDIT',
        country: 'US',
        fingerprint: 'fp_sample_visa_4242',
        holderName: 'Sarah Connor',
      },
      isDefault: true,
      createdAt: '2026-02-26T10:14:30.000Z',
    },
    createdAt: '2026-02-26T10:15:00.000Z',
  });

  const pi2 = db.table('paymentIntents').insert({
    id: 'pi_demo_captured_02',
    merchantId: 'merch_demo_1',
    customerId: priya.id,
    amountCents: 850000, // ₹8,500.00
    currency: 'INR',
    feeCents: 17300,
    netAmountCents: 832700,
    status: 'SUCCEEDED',
    paymentMethodType: 'UPI',
    description: 'SaaS Annual Subscription Pack',
    statementDescriptor: 'PAYNEXA*UPI',
    clientSecret: 'pi_demo_captured_02_secret_demo',
    riskScore: 12,
    riskDecision: 'APPROVE',
    metadata: { vpa: 'priya@okhdfcbank' },
    capturedAt: '2026-02-27T08:30:00.000Z',
    createdAt: '2026-02-27T08:29:10.000Z',
    updatedAt: '2026-02-27T08:30:00.000Z',
  });

  // 9. Sample Dispute
  db.table('disputes').insert({
    id: 'dp_demo_chargeback_1',
    chargeId: 'ch_demo_01',
    paymentIntentId: pi1.id,
    merchantId: 'merch_demo_1',
    amountCents: 12500,
    feeCents: 1500,
    currency: 'USD',
    reason: 'FRAUDULENT',
    status: 'WARNING_NEEDS_RESPONSE',
    evidence: {
      customerName: 'Sarah Connor',
      customerEmail: 'sarah.c@cyberdyne.net',
      customerPurchaseIp: '198.51.100.12',
    },
    dueByDate: '2026-03-12T23:59:59.000Z',
    isCoveredByReserve: true,
    createdAt: '2026-02-26T14:00:00.000Z',
    updatedAt: '2026-02-26T14:00:00.000Z',
  });

  // 10. Webhook Endpoint
  db.table('webhookEndpoints').insert({
    id: 'whep_demo_1',
    merchantId: 'merch_demo_1',
    url: 'https://webhook.site/paynexa-sandbox-receiver',
    description: 'Production Commerce Webhook Listener',
    secret: 'whsec_paynexa_merchant_hmac_sample_token_2026',
    subscribedEvents: ['*'],
    isActive: true,
    failureCount: 0,
    lastDeliveryStatus: 'SUCCESS',
    lastDeliveryAt: '2026-02-27T08:30:01.000Z',
    createdAt: '2026-01-10T09:00:00.000Z',
  });

  console.log('✅ PayNexa database seed completed successfully.');
}
