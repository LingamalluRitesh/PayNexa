import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WebhookDispatcher } from "../services/webhook-dispatcher.ts";

describe("Webhook Dispatcher & HMAC Security", () => {
  it("should generate and verify HMAC-SHA256 signatures accurately", () => {
    const dispatcher = new WebhookDispatcher();
    const secret = "whsec_test_secret_key_12345";
    const payload = JSON.stringify({ event: "payment.succeeded", amount: 5000 });

    const signature = dispatcher.generateSignature(payload, secret);
    assert.strictEqual(signature.length, 64);
    assert.strictEqual(dispatcher.verifySignature(payload, secret, signature), true);
  });

  it("should calculate correct exponential backoff delays", () => {
    const dispatcher = new WebhookDispatcher();
    assert.strictEqual(dispatcher.calculateBackoffDelay(1, 1000), 1000);
    assert.strictEqual(dispatcher.calculateBackoffDelay(2, 1000), 2000);
    assert.strictEqual(dispatcher.calculateBackoffDelay(3, 1000), 4000);
    assert.strictEqual(dispatcher.calculateBackoffDelay(10, 1000, 32000), 32000);
  });

  it("should record successful and failed dispatch attempts", () => {
    const dispatcher = new WebhookDispatcher();
    dispatcher.registerEndpoint({
      id: "ep_merchant_1",
      url: "https://merchant.example.com/webhooks",
      secret: "whsec_m1",
      subscribedEvents: ["payment.created", "payment.succeeded"],
      isActive: true,
    });

    const event = {
      id: "evt_101",
      eventType: "payment.succeeded",
      timestamp: new Date().toISOString(),
      data: { paymentId: "pay_999", amount: 15000 },
    };

    const attempt = dispatcher.dispatchEvent("ep_merchant_1", event, true);
    assert.strictEqual(attempt.success, true);
    assert.strictEqual(attempt.statusCode, 200);
    assert.strictEqual(dispatcher.getDeliveryHistory("ep_merchant_1").length, 1);
  });
});
