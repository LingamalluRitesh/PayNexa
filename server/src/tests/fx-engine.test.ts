import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FxConversionEngine } from "../../../packages/core/src/currencies/fx-engine.ts";

describe("Foreign Exchange (FX) Engine", () => {
  it("should calculate exact 1:1 conversion for identical currencies", () => {
    const fx = new FxConversionEngine();
    const quote = fx.convertWithSpread("USD", "USD", 10000, 0);
    assert.strictEqual(quote.baseRate, 1.0);
    assert.strictEqual(quote.toAmountMinor, 10000);
  });

  it("should convert currencies and deduct basis point markup", () => {
    const fx = new FxConversionEngine();
    fx.setRate("USD/EUR", 0.90);
    const quote = fx.convertWithSpread("USD", "EUR", 10000, 100);
    assert.strictEqual(quote.baseRate, 0.90);
    assert.strictEqual(quote.toAmountMinor, 8910);
  });

  it("should perform triangular rate routing through base pairs", () => {
    const fx = new FxConversionEngine();
    const gbpToEur = fx.getRate("GBP", "EUR");
    assert.strictEqual(typeof gbpToEur, "number");
    assert.ok(gbpToEur > 1.0);
  });
});
