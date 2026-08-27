export type WebhookEventType = 
  | 'payment_intent.created'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.requires_action'
  | 'charge.refunded'
  | 'dispute.created'
  | 'dispute.resolved'
  | 'card.issued'
  | 'card.frozen'
  | 'card.authorization_declined'
  | 'subscription.created'
  | 'subscription.renewed'
  | 'subscription.canceled'
  | 'kyc.verified'
  | 'payout.paid';

export interface WebhookEndpoint {
  id: string;
  merchantId: string;
  url: string;
  description?: string;
  secret: string; // Used for HMAC-SHA256 signature verification
  subscribedEvents: (WebhookEventType | '*')[];
  isActive: boolean;
  failureCount: number;
  lastDeliveryStatus?: 'SUCCESS' | 'FAILED';
  lastDeliveryAt?: string;
  createdAt: string;
}

export interface WebhookEvent<T = Record<string, unknown>> {
  id: string;
  type: WebhookEventType;
  apiVersion: string;
  data: {
    object: T;
  };
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  endpointId: string;
  merchantId: string;
  eventId: string;
  eventType: WebhookEventType;
  url: string;
  payloadJson: string;
  signatureHeader: string;
  attemptNumber: number;
  httpStatus?: number;
  responseBody?: string;
  responseTimeMs?: number;
  isSuccess: boolean;
  nextRetryAt?: string;
  error?: string;
  deliveredAt: string;
}
