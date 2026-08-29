import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FxConversionEngine } from "../../../packages/core/src/currencies/fx-engine.ts";
import { ThreeDSecureGuard } from "../security/three-d-secure-guard.ts";
import { WebhookDispatcher } from "../services/webhook-dispatcher.ts";

describe("PayNexa End-to-End Treasury, FX & Settlement Lifecycle", () => {
  it("should process multi-currency payment with 3DS2, FX conversion, and webhook event dispatch", () => {
    // 1. Evaluate 3DS2 Risk
    const guard = new ThreeDSecureGuard();
    const eval3ds = guard.evaluate({
      transactionId: "tx_cross_border_1",
      amountMinor: 15000, // $150.00
      currency: "USD",
      cardBin: "424242",
      ipCountry: "US",
      cardCountry: "US",
      isRecurring: false,
      velocityPastHour: 1,
      deviceFingerprintKnown: true,
    });
    assert.strictEqual(eval3ds.decision, "FRICTIONLESS_APPROVED");

    // 2. Perform FX Conversion to EUR for Settlement
    const fx = new FxConversionEngine();
    fx.setRate("USD/EUR", 0.92);
    const quote = fx.convertWithSpread("USD", "EUR", 15000, 50); // 50 bps spread
    assert.strictEqual(quote.effectiveRate, 0.92 * 0.995);
    assert.ok(quote.toAmountMinor > 0);

    // 3. Dispatch Merchant Notification
    const dispatcher = new WebhookDispatcher();
    dispatcher.registerEndpoint({
      id: "ep_treasury_merchant",
      url: "https://api.acme-corp.com/paynexa-events",
      secret: "whsec_live_top_secret",
      subscribedEvents: ["settlement.cleared"],
      isActive: true,
    });

    const event = {
      id: "evt_settle_001",
      eventType: "settlement.cleared",
      timestamp: new Date().toISOString(),
      data: {
        originalAmount: quote.fromAmountMinor,
        originalCurrency: quote.fromCurrency,
        settledAmount: quote.toAmountMinor,
        settledCurrency: quote.toCurrency,
      },
    };

    const delivery = dispatcher.dispatchEvent("ep_treasury_merchant", event, true);
    assert.strictEqual(delivery.success, true);
    assert.strictEqual(delivery.statusCode, 200);
    assert.strictEqual(
      dispatcher.verifySignature(JSON.stringify(event), "whsec_live_top_secret", delivery.signature),
      true
    );
  });
});
