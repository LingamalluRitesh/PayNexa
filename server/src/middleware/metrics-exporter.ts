/**
 * Prometheus Payment Gateway Telemetry & Latency Monitor.
 * Records authorization rates, decline reasons, transaction volume sums, and exposes Prometheus exposition text.
 */

export class PaymentMetricsRegistry {
  private transactionsTotal: Map<string, number> = new Map(); // status -> count
  private volumeTotalMinor: Map<string, number> = new Map(); // currency -> sum
  private latenciesMs: number[] = [];

  public recordTransaction(status: "SUCCESS" | "DECLINED" | "REJECTED_FRAUD", amountMinor: number, currency: string, latencyMs: number): void {
    this.transactionsTotal.set(status, (this.transactionsTotal.get(status) || 0) + 1);
    this.volumeTotalMinor.set(currency.toUpperCase(), (this.volumeTotalMinor.get(currency.toUpperCase()) || 0) + amountMinor);
    this.latenciesMs.push(latencyMs);
  }

  public getSummary() {
    const totalTx = Array.from(this.transactionsTotal.values()).reduce((a, b) => a + b, 0);
    const avgLatency = this.latenciesMs.length ? this.latenciesMs.reduce((a, b) => a + b, 0) / this.latenciesMs.length : 0;

    return {
      totalTransactions: totalTx,
      statusBreakdown: Object.fromEntries(this.transactionsTotal.entries()),
      volumeBreakdown: Object.fromEntries(this.volumeTotalMinor.entries()),
      avgLatencyMs: Math.round(avgLatency * 100) / 100,
    };
  }

  public exportPrometheus(): string {
    const lines = [
      "# HELP paynexa_transactions_total Total processed payment transactions",
      "# TYPE paynexa_transactions_total counter",
    ];
    for (const [status, count] of this.transactionsTotal.entries()) {
      lines.push(`paynexa_transactions_total{status="${status}"} ${count}`);
    }

    lines.push("# HELP paynexa_volume_minor_total Total transaction volume in currency minor units");
    lines.push("# TYPE paynexa_volume_minor_total counter");
    for (const [currency, volume] of this.volumeTotalMinor.entries()) {
      lines.push(`paynexa_volume_minor_total{currency="${currency}"} ${volume}`);
    }

    return lines.join("\n") + "\n";
  }
}
