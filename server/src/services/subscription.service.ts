import crypto from 'node:crypto';
import { db } from '../database/database.js';
import { webhookDispatcher } from './webhook-dispatcher.service.js';
import {
  Plan,
  Subscription,
  Invoice,
  InvoiceItem,
  BillingInterval,
  CurrencyCode,
} from '@paynexa/core';

export class SubscriptionService {
  public createPlan(params: {
    merchantId: string;
    name: string;
    description?: string;
    amountCents: number;
    currency: CurrencyCode;
    interval: BillingInterval;
    intervalCount?: number;
    trialPeriodDays?: number;
  }): Plan {
    const plan: Plan = {
      id: `plan_${crypto.randomUUID()}`,
      merchantId: params.merchantId,
      name: params.name,
      description: params.description,
      amountCents: params.amountCents,
      currency: params.currency,
      interval: params.interval,
      intervalCount: params.intervalCount || 1,
      trialPeriodDays: params.trialPeriodDays || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return db.table('plans').insert(plan);
  }

  public listPlans(merchantId?: string): Plan[] {
    if (merchantId) {
      return db.table('plans').find((p) => p.merchantId === merchantId);
    }
    return db.table('plans').all();
  }

  public createSubscription(params: {
    merchantId: string;
    customerId: string;
    planId: string;
    defaultPaymentMethodId?: string;
  }): Subscription {
    const plan = db.table('plans').get(params.planId);
    if (!plan) throw new Error(`Plan not found: ${params.planId}`);

    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.interval === 'MONTH') {
      periodEnd.setMonth(periodEnd.getMonth() + plan.intervalCount);
    } else if (plan.interval === 'YEAR') {
      periodEnd.setFullYear(periodEnd.getFullYear() + plan.intervalCount);
    } else {
      periodEnd.setDate(periodEnd.getDate() + 30);
    }

    const subId = `sub_${crypto.randomUUID()}`;
    const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice: Invoice = {
      id: `in_${crypto.randomUUID()}`,
      merchantId: params.merchantId,
      customerId: params.customerId,
      subscriptionId: subId,
      number: invoiceNumber,
      amountDueCents: plan.amountCents,
      amountPaidCents: plan.amountCents,
      amountRemainingCents: 0,
      currency: plan.currency,
      status: 'PAID',
      items: [
        {
          id: `ii_${crypto.randomUUID()}`,
          description: `Subscription to ${plan.name}`,
          amountCents: plan.amountCents,
          currency: plan.currency,
          quantity: 1,
        },
      ],
      dueDate: now.toISOString(),
      paidAt: now.toISOString(),
      createdAt: now.toISOString(),
    };

    db.table('invoices').insert(invoice);

    const subscription: Subscription = {
      id: subId,
      merchantId: params.merchantId,
      customerId: params.customerId,
      planId: params.planId,
      status: 'ACTIVE',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      defaultPaymentMethodId: params.defaultPaymentMethodId,
      latestInvoiceId: invoice.id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    db.table('subscriptions').insert(subscription);

    webhookDispatcher.dispatchEvent('subscription.created', subscription.merchantId, subscription);
    return subscription;
  }

  public listSubscriptions(merchantId?: string): Subscription[] {
    if (merchantId) {
      return db.table('subscriptions').find((s) => s.merchantId === merchantId);
    }
    return db.table('subscriptions').all();
  }

  public cancelSubscription(subscriptionId: string): Subscription {
    const sub = db.table('subscriptions').get(subscriptionId);
    if (!sub) throw new Error(`Subscription not found: ${subscriptionId}`);

    const updated = db.table('subscriptions').update(subscriptionId, {
      status: 'CANCELED',
      canceledAt: new Date().toISOString(),
    });

    webhookDispatcher.dispatchEvent('subscription.canceled', sub.merchantId, updated);
    return updated;
  }

  public listInvoices(merchantId?: string): Invoice[] {
    if (merchantId) {
      return db.table('invoices').find((i) => i.merchantId === merchantId);
    }
    return db.table('invoices').all();
  }
}

export const subscriptionService = new SubscriptionService();
