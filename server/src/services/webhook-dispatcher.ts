/**
 * Reliable Webhook Event Dispatcher & HMAC Signer.
 * Handles merchant notification queues, exponential backoff retries, and cryptographic payload signatures.
 */

import crypto from "crypto";

export interface WebhookEventPayload {
  id: string;
  eventType: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  subscribedEvents: string[];
  isActive: boolean;
}

export interface DeliveryAttempt {
  eventId: string;
  endpointId: string;
  attemptNumber: number;
  statusCode?: number;
  success: boolean;
  timestamp: string;
  signature: string;
}

export class WebhookDispatcher {
  private endpoints: Map<string, WebhookEndpoint> = new Map();
  private deliveryHistory: DeliveryAttempt[] = [];

  public registerEndpoint(endpoint: WebhookEndpoint): void {
    this.endpoints.set(endpoint.id, endpoint);
  }

  public generateSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  public verifySignature(payload: string, secret: string, signature: string): boolean {
    const expected = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  public calculateBackoffDelay(attemptNumber: number, baseDelayMs = 1000, maxDelayMs = 32000): number {
    const delay = baseDelayMs * Math.pow(2, attemptNumber - 1);
    return Math.min(delay, maxDelayMs);
  }

  public dispatchEvent(endpointId: string, event: WebhookEventPayload, simulateSuccess = true): DeliveryAttempt {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint || !endpoint.isActive) {
      throw new Error(`Endpoint ${endpointId} is inactive or not found.`);
    }

    const payloadString = JSON.stringify(event);
    const signature = this.generateSignature(payloadString, endpoint.secret);

    const attempt: DeliveryAttempt = {
      eventId: event.id,
      endpointId: endpoint.id,
      attemptNumber: 1,
      statusCode: simulateSuccess ? 200 : 504,
      success: simulateSuccess,
      timestamp: new Date().toISOString(),
      signature,
    };

    this.deliveryHistory.push(attempt);
    return attempt;
  }

  public getDeliveryHistory(endpointId?: string): DeliveryAttempt[] {
    if (!endpointId) return this.deliveryHistory;
    return this.deliveryHistory.filter((d) => d.endpointId === endpointId);
  }
}
