import crypto from 'node:crypto';
import { db } from '../database/database.js';
import { config } from '../config/index.js';
import {
  WebhookEndpoint,
  WebhookEvent,
  WebhookEventType,
  WebhookDeliveryLog,
  generateWebhookSignature,
} from '@paynexa/core';

export class WebhookDispatcherService {
  /**
   * Registers a new webhook endpoint for a merchant
   */
  public registerEndpoint(params: {
    merchantId: string;
    url: string;
    description?: string;
    subscribedEvents?: (WebhookEventType | '*')[];
  }): WebhookEndpoint {
    const endpoint: WebhookEndpoint = {
      id: `whep_${crypto.randomUUID()}`,
      merchantId: params.merchantId,
      url: params.url,
      description: params.description || 'Merchant Webhook Receiver',
      secret: `whsec_${crypto.randomBytes(24).toString('hex')}`,
      subscribedEvents: params.subscribedEvents || ['*'],
      isActive: true,
      failureCount: 0,
      createdAt: new Date().toISOString(),
    };

    return db.table('webhookEndpoints').insert(endpoint);
  }

  public listEndpoints(merchantId?: string): WebhookEndpoint[] {
    if (merchantId) {
      return db.table('webhookEndpoints').find((e) => e.merchantId === merchantId);
    }
    return db.table('webhookEndpoints').all();
  }

  public getEndpoint(id: string): WebhookEndpoint | undefined {
    return db.table('webhookEndpoints').get(id);
  }

  public deleteEndpoint(id: string): boolean {
    return db.table('webhookEndpoints').delete(id);
  }

  /**
   * Emits an event to all eligible merchant endpoints asynchronously
   */
  public async dispatchEvent<T = Record<string, unknown>>(
    type: WebhookEventType,
    merchantId: string,
    data: T
  ): Promise<WebhookEvent<T>> {
    const event: WebhookEvent<T> = {
      id: `evt_${crypto.randomUUID()}`,
      type,
      apiVersion: '2026-08-01',
      data: { object: data },
      createdAt: new Date().toISOString(),
    };

    const endpoints = db.table('webhookEndpoints').find(
      (e) => e.isActive && e.merchantId === merchantId && (e.subscribedEvents.includes('*') || e.subscribedEvents.includes(type))
    );

    // Asynchronously dispatch to all endpoints
    for (const endpoint of endpoints) {
      this.sendToEndpoint(endpoint, event).catch((err) => {
        console.error(`Webhook delivery failed for endpoint ${endpoint.id}:`, err);
      });
    }

    return event;
  }

  /**
   * Executes HTTP POST delivery to a specific endpoint with HMAC signature
   */
  public async sendToEndpoint(
    endpoint: WebhookEndpoint,
    event: WebhookEvent<any>,
    attempt: number = 1
  ): Promise<WebhookDeliveryLog> {
    const payloadJson = JSON.stringify(event);
    const signatureHeader = generateWebhookSignature(payloadJson, endpoint.secret);
    const logId = `whlog_${crypto.randomUUID()}`;
    const startTime = Date.now();

    let httpStatus: number | undefined;
    let responseBody: string | undefined;
    let isSuccess = false;
    let errorMessage: string | undefined;

    try {
      // If endpoint is a simulated sandbox test URL or localhost receiver
      if (endpoint.url.startsWith('https://webhook.site') || endpoint.url.startsWith('http://localhost') || endpoint.url.startsWith('http://127.0.0.1')) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), config.WEBHOOK_REQUEST_TIMEOUT_MS);

        try {
          const resp = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'PayNexa-Signature': signatureHeader,
              'User-Agent': 'PayNexa-Webhook-Dispatcher/1.0',
            },
            body: payloadJson,
            signal: controller.signal,
          });

          httpStatus = resp.status;
          responseBody = await resp.text().catch(() => '');
          isSuccess = resp.status >= 200 && resp.status < 300;
        } finally {
          clearTimeout(timeout);
        }
      } else {
        // Simulated instant delivery for developer showcase sandbox
        isSuccess = true;
        httpStatus = 200;
        responseBody = '{"status":"received","processed":true}';
      }
    } catch (err: unknown) {
      errorMessage = (err as Error).message || 'Network timeout';
      httpStatus = 500;
      isSuccess = false;
    }

    const responseTimeMs = Date.now() - startTime;
    const now = new Date().toISOString();

    // Update endpoint health
    if (isSuccess) {
      db.table('webhookEndpoints').update(endpoint.id, {
        failureCount: 0,
        lastDeliveryStatus: 'SUCCESS',
        lastDeliveryAt: now,
      });
    } else {
      const newFailures = endpoint.failureCount + 1;
      db.table('webhookEndpoints').update(endpoint.id, {
        failureCount: newFailures,
        lastDeliveryStatus: 'FAILED',
        lastDeliveryAt: now,
      });

      // Schedule retry if under max retries
      if (attempt < config.WEBHOOK_MAX_RETRIES) {
        const backoffDelay = Math.pow(2, attempt) * config.WEBHOOK_BASE_DELAY_MS;
        setTimeout(() => {
          this.sendToEndpoint(endpoint, event, attempt + 1).catch(() => {});
        }, backoffDelay);
      }
    }

    const log: WebhookDeliveryLog = {
      id: logId,
      endpointId: endpoint.id,
      merchantId: endpoint.merchantId,
      eventId: event.id,
      eventType: event.type,
      url: endpoint.url,
      payloadJson,
      signatureHeader,
      attemptNumber: attempt,
      httpStatus,
      responseBody: responseBody?.slice(0, 500),
      responseTimeMs,
      isSuccess,
      deliveredAt: now,
      error: errorMessage,
    };

    return db.table('webhookDeliveryLogs').insert(log);
  }

  public listLogs(merchantId?: string, limit: number = 50): WebhookDeliveryLog[] {
    const logs = merchantId
      ? db.table('webhookDeliveryLogs').find((l) => l.merchantId === merchantId)
      : db.table('webhookDeliveryLogs').all();
    return logs.slice(-limit).reverse();
  }

  public async replayDelivery(logId: string): Promise<WebhookDeliveryLog> {
    const originalLog = db.table('webhookDeliveryLogs').get(logId);
    if (!originalLog) throw new Error(`Webhook delivery log not found: ${logId}`);

    const endpoint = db.table('webhookEndpoints').get(originalLog.endpointId);
    if (!endpoint) throw new Error(`Webhook endpoint ${originalLog.endpointId} no longer exists`);

    const event = JSON.parse(originalLog.payloadJson) as WebhookEvent;
    return this.sendToEndpoint(endpoint, event, 1);
  }
}

export const webhookDispatcher = new WebhookDispatcherService();
