const API_BASE = '/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`API returned non-JSON response (${response.status}): ${text.slice(0, 100)}`);
  }

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || `HTTP ${response.status} Request failed`);
  }

  return json.data as T;
}

export const api = {
  // Auth & Profile
  getMe: () => request<any>('/auth/me'),
  getApiKeys: () => request<any[]>('/auth/api-keys'),
  createApiKey: (data: { name: string; type: 'PUBLISHABLE' | 'SECRET'; environment: 'TEST' | 'LIVE' }) =>
    request<any>('/auth/api-keys', { method: 'POST', body: JSON.stringify(data) }),
  deleteApiKey: (id: string) => request<any>(`/auth/api-keys/${id}`, { method: 'DELETE' }),

  // Ledger & Accounts
  getAccounts: (ownerId?: string) => request<any[]>(`/ledger/accounts${ownerId ? `?ownerId=${ownerId}` : ''}`),
  getJournalEntries: (limit = 50) => request<any[]>(`/ledger/journal-entries?limit=${limit}`),
  transfer: (data: { sourceAccountId: string; destinationAccountId: string; amountCents: number; currency: string; description: string }) =>
    request<any>('/ledger/transfer', { method: 'POST', body: JSON.stringify(data) }),
  getLedgerAudit: () => request<any>('/ledger/audit'),
  getRates: () => request<Record<string, number>>('/ledger/rates'),
  convertCurrency: (data: { amountCents: number; from: string; to: string }) =>
    request<any>('/ledger/convert', { method: 'POST', body: JSON.stringify(data) }),

  // Payments & Checkout
  getIntents: (merchantId?: string) => request<any[]>(`/payments/intents${merchantId ? `?merchantId=${merchantId}` : ''}`),
  getIntent: (id: string) => request<any>(`/payments/intents/${id}`),
  createIntent: (data: { amountCents: number; currency: string; description?: string; customerId?: string; metadata?: any }) =>
    request<any>('/payments/intents', { method: 'POST', body: JSON.stringify(data) }),
  confirmIntent: (id: string, data: any) =>
    request<any>(`/payments/intents/${id}/confirm`, { method: 'POST', body: JSON.stringify(data) }),
  verify3Ds: (id: string, otpCode: string) =>
    request<any>(`/payments/intents/${id}/verify-3ds`, { method: 'POST', body: JSON.stringify({ otpCode }) }),
  refundIntent: (id: string, data: { amountCents?: number; reason?: string }) =>
    request<any>(`/payments/intents/${id}/refund`, { method: 'POST', body: JSON.stringify(data) }),
  getCharges: () => request<any[]>('/payments/charges'),

  // Virtual Cards
  getCards: (userId?: string) => request<any[]>(`/cards${userId ? `?userId=${userId}` : ''}`),
  createCard: (data: any) => request<any>('/cards', { method: 'POST', body: JSON.stringify(data) }),
  toggleCardFreeze: (id: string) => request<any>(`/cards/${id}/toggle-freeze`, { method: 'POST' }),
  updateCardLimits: (id: string, spendingLimits: any) =>
    request<any>(`/cards/${id}/limits`, { method: 'PATCH', body: JSON.stringify({ spendingLimits }) }),
  simulateCardAuth: (id: string, data: any) =>
    request<any>(`/cards/${id}/simulate-auth`, { method: 'POST', body: JSON.stringify(data) }),

  // Fraud & Risk
  getFraudRules: () => request<any[]>('/fraud/rules'),
  createFraudRule: (data: any) => request<any>('/fraud/rules', { method: 'POST', body: JSON.stringify(data) }),
  toggleFraudRule: (id: string) => request<any>(`/fraud/rules/${id}/toggle`, { method: 'POST' }),
  getFraudAssessments: () => request<any[]>('/fraud/assessments'),
  evaluateFraud: (data: any) => request<any>('/fraud/evaluate', { method: 'POST', body: JSON.stringify(data) }),
  getBlacklist: () => request<any[]>('/fraud/blacklist'),
  addBlacklist: (data: any) => request<any>('/fraud/blacklist', { method: 'POST', body: JSON.stringify(data) }),

  // Webhooks
  getWebhookEndpoints: () => request<any[]>('/webhooks/endpoints'),
  createWebhookEndpoint: (data: any) => request<any>('/webhooks/endpoints', { method: 'POST', body: JSON.stringify(data) }),
  deleteWebhookEndpoint: (id: string) => request<any>(`/webhooks/endpoints/${id}`, { method: 'DELETE' }),
  getWebhookLogs: () => request<any[]>('/webhooks/logs'),
  replayWebhook: (logId: string) => request<any>(`/webhooks/logs/${logId}/replay`, { method: 'POST' }),
  sendTestWebhookPing: () => request<any>('/webhooks/test-ping', { method: 'POST' }),

  // Subscriptions & Plans
  getPlans: () => request<any[]>('/subscriptions/plans'),
  createPlan: (data: any) => request<any>('/subscriptions/plans', { method: 'POST', body: JSON.stringify(data) }),
  getSubscriptions: () => request<any[]>('/subscriptions'),
  createSubscription: (data: any) => request<any>('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
  cancelSubscription: (id: string) => request<any>(`/subscriptions/${id}/cancel`, { method: 'POST' }),
  getInvoices: () => request<any[]>('/subscriptions/invoices'),

  // Disputes
  getDisputes: () => request<any[]>('/disputes'),
  createDispute: (data: any) => request<any>('/disputes', { method: 'POST', body: JSON.stringify(data) }),
  submitDisputeEvidence: (id: string, evidence: any) =>
    request<any>(`/disputes/${id}/evidence`, { method: 'POST', body: JSON.stringify(evidence) }),
  resolveDispute: (id: string, outcome: 'WON' | 'LOST', notes?: string) =>
    request<any>(`/disputes/${id}/resolve`, { method: 'POST', body: JSON.stringify({ outcome, notes }) }),

  // Analytics
  getAnalyticsOverview: () => request<any>('/analytics/overview'),
  getPlatformMetrics: () => request<any>('/analytics/metrics'),
  getTimeseries: () => request<any[]>('/analytics/timeseries'),
  getMethodBreakdown: () => request<any[]>('/analytics/methods'),

  // KYC
  getKycList: () => request<any[]>('/kyc'),
  submitKyc: (data: any) => request<any>('/kyc', { method: 'POST', body: JSON.stringify(data) }),
  reviewKyc: (id: string, decision: 'APPROVE' | 'REJECT', notes?: string) =>
    request<any>(`/kyc/${id}/review`, { method: 'POST', body: JSON.stringify({ decision, notes }) }),
};
