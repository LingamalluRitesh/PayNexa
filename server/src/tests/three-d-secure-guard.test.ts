import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ThreeDSecureGuard } from "../security/three-d-secure-guard.ts";

describe("3D Secure 2.0 Risk Decision Guard", () => {
  const guard = new ThreeDSecureGuard();

  it("should qualify low-value domestic transactions for frictionless exemption", () => {
    const res = guard.evaluate({
      transactionId: "tx_1",
      amountMinor: 2500, // $25.00
      currency: "USD",
      cardBin: "411111",
      ipCountry: "US",
      cardCountry: "US",
      isRecurring: false,
      velocityPastHour: 1,
      deviceFingerprintKnown: true,
    });
    assert.strictEqual(res.decision, "FRICTIONLESS_APPROVED");
    assert.strictEqual(res.scaExemptionApplied, "LOW_VALUE");
  });

  it("should trigger challenge for cross-border transactions with new device", () => {
    const res = guard.evaluate({
      transactionId: "tx_2",
      amountMinor: 50000, // $500.00
      currency: "USD",
      cardBin: "411111",
      ipCountry: "GB",
      cardCountry: "US",
      isRecurring: false,
      velocityPastHour: 2,
      deviceFingerprintKnown: false,
    });
    assert.strictEqual(res.decision, "CHALLENGE_REQUIRED");
    assert.ok(res.reasons.includes("CROSS_BORDER_GEO_MISMATCH"));
  });

  it("should reject high-risk suspicious velocity transactions", () => {
    const res = guard.evaluate({
      transactionId: "tx_3",
      amountMinor: 2000000,
      currency: "USD",
      cardBin: "411111",
      ipCountry: "RU",
      cardCountry: "US",
      isRecurring: false,
      velocityPastHour: 8,
      deviceFingerprintKnown: false,
    });
    assert.strictEqual(res.decision, "HIGH_RISK_REJECTED");
  });
});
