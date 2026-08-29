/**
 * Foreign Exchange (FX) Conversion & Markup Spread Engine.
 * Supports cross-currency conversions, minor unit precision, and basis point (bps) spreads.
 */

export interface FxQuote {
  fromCurrency: string;
  toCurrency: string;
  baseRate: number;
  markupBps: number;
  effectiveRate: number;
  fromAmountMinor: number;
  toAmountMinor: number;
  timestamp: string;
}

export class FxConversionEngine {
  private rates: Map<string, number> = new Map(); // e.g. "EUR/USD" -> 1.0850

  constructor() {
    // Default baseline rates relative to USD
    this.rates.set("USD/EUR", 0.92);
    this.rates.set("EUR/USD", 1.087);
    this.rates.set("USD/GBP", 0.78);
    this.rates.set("GBP/USD", 1.282);
    this.rates.set("USD/JPY", 152.50);
    this.rates.set("JPY/USD", 0.00656);
  }

  public setRate(pair: string, rate: number): void {
    this.rates.set(pair.toUpperCase(), rate);
  }

  public getRate(from: string, to: string): number {
    if (from.toUpperCase() === to.toUpperCase()) return 1.0;
    const pair = `${from.toUpperCase()}/${to.toUpperCase()}`;
    const direct = this.rates.get(pair);
    if (direct !== undefined) return direct;

    // Triangular routing through USD
    const fromToUsd = this.rates.get(`${from.toUpperCase()}/USD`) || (1 / (this.rates.get(`USD/${from.toUpperCase()}`) || 1));
    const usdToTarget = this.rates.get(`USD/${to.toUpperCase()}`) || (1 / (this.rates.get(`${to.toUpperCase()}/USD`) || 1));

    return fromToUsd * usdToTarget;
  }

  public convertWithSpread(
    fromCurrency: string,
    toCurrency: string,
    amountMinor: number,
    markupBps = 50 // 50 bps = 0.5%
  ): FxQuote {
    const baseRate = this.getRate(fromCurrency, toCurrency);
    const spreadMultiplier = 1 - markupBps / 10000;
    const effectiveRate = baseRate * spreadMultiplier;

    const convertedMinor = Math.round(amountMinor * effectiveRate);

    return {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      baseRate,
      markupBps,
      effectiveRate,
      fromAmountMinor: amountMinor,
      toAmountMinor: convertedMinor,
      timestamp: new Date().toISOString(),
    };
  }
}
