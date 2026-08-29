import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PaymentMetricsRegistry } from "../middleware/metrics-exporter.ts";

describe("Payment Metrics Registry & Prometheus Exporter", () => {
  it("should record transactions, volumes, and generate Prometheus exposition format", () => {
    const registry = new PaymentMetricsRegistry();
    registry.recordTransaction("SUCCESS", 10000, "USD", 45);
    registry.recordTransaction("SUCCESS", 5000, "USD", 35);
    registry.recordTransaction("DECLINED", 2000, "EUR", 120);

    const summary = registry.getSummary();
    assert.strictEqual(summary.totalTransactions, 3);
    assert.strictEqual(summary.statusBreakdown["SUCCESS"], 2);
    assert.strictEqual(summary.statusBreakdown["DECLINED"], 1);
    assert.strictEqual(summary.volumeBreakdown["USD"], 15000);

    const prom = registry.exportPrometheus();
    assert.ok(prom.includes('paynexa_transactions_total{status="SUCCESS"} 2'));
    assert.ok(prom.includes('paynexa_volume_minor_total{currency="USD"} 15000'));
  });
});
