import {
  PaymentIntent,
  Charge,
  Refund,
  VirtualCard,
  LedgerAccount,
  JournalEntry,
  Plan,
  Subscription,
  Dispute,
  DisputeEvidence,
  CurrencyCode,
  PaymentMethodType,
  verifyWebhookSignature,
} from '@paynexa/core';

export interface PayNexaClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export class PayNexaError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PayNexaError';
  }
}

export class PayNexa {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  public readonly payments: PaymentResource;
  public readonly cards: CardResource;
  public readonly ledger: LedgerResource;
  public readonly subscriptions: SubscriptionResource;
  public readonly disputes: DisputeResource;
  public readonly webhooks: WebhookResource;

  constructor(options: PayNexaClientOptions) {
    if (!options.apiKey) {
      throw new PayNexaError('API key is required to initialize the PayNexa SDK.');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || 'http://localhost:4000/api/v1').replace(/\/$/, '');
    this.timeoutMs = options.timeoutMs || 30000;

    this.payments = new PaymentResource(this);
    this.cards = new CardResource(this);
    this.ledger = new LedgerResource(this);
    this.subscriptions = new SubscriptionResource(this);
    this.disputes = new DisputeResource(this);
    this.webhooks = new WebhookResource(this);
  }

  public async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'PayNexa-SDK-Version': '1.0.0',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const json = (await response.json()) as { success: boolean; data?: T; error?: { message: string; code: string; details?: unknown } };

      if (!response.ok || !json.success) {
        throw new PayNexaError(
          json.error?.message || `HTTP ${response.status} - Request failed`,
          response.status,
          json.error?.code || 'request_failed',
          json.error?.details
        );
      }

      return json.data as T;
    } catch (err: unknown) {
      if (err instanceof PayNexaError) throw err;
      throw new PayNexaError((err as Error).message || 'Network communication failure');
    } finally {
      clearTimeout(timer);
    }
  }
}

export class PaymentResource {
  constructor(private client: PayNexa) {}

  public async create(params: {
    amountCents: number;
    currency: CurrencyCode;
    customerId?: string;
    description?: string;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentIntent> {
    return this.client.request<PaymentIntent>(
      'POST',
      '/payments/intents',
      params,
      params.idempotencyKey ? { 'Idempotency-Key': params.idempotencyKey } : undefined
    );
  }

  public async retrieve(id: string): Promise<PaymentIntent> {
    return this.client.request<PaymentIntent>('GET', `/payments/intents/${id}`);
  }

  public async confirm(
    id: string,
    params: {
      paymentMethodType: PaymentMethodType;
      card?: {
        cardNumber: string;
        expMonth: number;
        expYear: number;
        cvv: string;
        holderName: string;
      };
      upi?: { vpa: string };
      bank?: { routingNumber: string; accountNumber: string; bankName: string };
    }
  ): Promise<PaymentIntent> {
    return this.client.request<PaymentIntent>('POST', `/payments/intents/${id}/confirm`, params);
  }

  public async submit3DsOtp(id: string, otpCode: string): Promise<PaymentIntent> {
    return this.client.request<PaymentIntent>('POST', `/payments/intents/${id}/verify-3ds`, { otpCode });
  }

  public async refund(
    paymentIntentId: string,
    params: { amountCents?: number; reason?: string }
  ): Promise<Refund> {
    return this.client.request<Refund>('POST', `/payments/intents/${paymentIntentId}/refund`, params);
  }
}

export class CardResource {
  constructor(private client: PayNexa) {}

  public async create(params: {
    cardholderName: string;
    currency?: CurrencyCode;
    brand?: 'VISA' | 'MASTERCARD';
    formFactor?: 'SINGLE_USE' | 'RECURRING_SUBSCRIPTION' | 'GENERAL_PURPOSE';
    spendingLimits?: { perTransactionMaxCents: number; dailyMaxCents: number; monthlyMaxCents: number };
  }): Promise<VirtualCard> {
    return this.client.request<VirtualCard>('POST', '/cards', params);
  }

  public async list(): Promise<VirtualCard[]> {
    return this.client.request<VirtualCard[]>('GET', '/cards');
  }

  public async get(id: string): Promise<VirtualCard> {
    return this.client.request<VirtualCard>('GET', `/cards/${id}`);
  }

  public async toggleFreeze(id: string): Promise<VirtualCard> {
    return this.client.request<VirtualCard>('POST', `/cards/${id}/toggle-freeze`);
  }

  public async updateLimits(
    id: string,
    spendingLimits: { perTransactionMaxCents: number; dailyMaxCents: number; monthlyMaxCents: number }
  ): Promise<VirtualCard> {
    return this.client.request<VirtualCard>('PATCH', `/cards/${id}/limits`, { spendingLimits });
  }
}

export class LedgerResource {
  constructor(private client: PayNexa) {}

  public async listAccounts(): Promise<LedgerAccount[]> {
    return this.client.request<LedgerAccount[]>('GET', '/ledger/accounts');
  }

  public async getAccount(id: string): Promise<LedgerAccount> {
    return this.client.request<LedgerAccount>('GET', `/ledger/accounts/${id}`);
  }

  public async getJournalEntries(limit?: number): Promise<JournalEntry[]> {
    return this.client.request<JournalEntry[]>('GET', `/ledger/journal-entries${limit ? `?limit=${limit}` : ''}`);
  }

  public async transfer(params: {
    sourceAccountId: string;
    destinationAccountId: string;
    amountCents: number;
    currency: CurrencyCode;
    description: string;
    idempotencyKey?: string;
  }): Promise<JournalEntry> {
    return this.client.request<JournalEntry>(
      'POST',
      '/ledger/transfer',
      params,
      params.idempotencyKey ? { 'Idempotency-Key': params.idempotencyKey } : undefined
    );
  }
}

export class SubscriptionResource {
  constructor(private client: PayNexa) {}

  public async listPlans(): Promise<Plan[]> {
    return this.client.request<Plan[]>('GET', '/subscriptions/plans');
  }

  public async createPlan(params: {
    name: string;
    amountCents: number;
    currency: CurrencyCode;
    interval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    trialPeriodDays?: number;
  }): Promise<Plan> {
    return this.client.request<Plan>('POST', '/subscriptions/plans', params);
  }

  public async createSubscription(params: {
    customerId: string;
    planId: string;
    paymentMethodId?: string;
  }): Promise<Subscription> {
    return this.client.request<Subscription>('POST', '/subscriptions', params);
  }
}

export class DisputeResource {
  constructor(private client: PayNexa) {}

  public async list(): Promise<Dispute[]> {
    return this.client.request<Dispute[]>('GET', '/disputes');
  }

  public async submitEvidence(id: string, evidence: DisputeEvidence): Promise<Dispute> {
    return this.client.request<Dispute>('POST', `/disputes/${id}/evidence`, evidence);
  }
}

export class WebhookResource {
  constructor(private client: PayNexa) {}

  public verifySignature(payload: string, signatureHeader: string, secret: string, toleranceSeconds?: number) {
    return verifyWebhookSignature(payload, signatureHeader, secret, toleranceSeconds);
  }
}

export default PayNexa;
