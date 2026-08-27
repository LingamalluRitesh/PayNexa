import { CurrencyCode, FxRatePair, convertCurrency } from '@paynexa/core';

export class FxRatesService {
  // Base rates relative to USD
  private ratesToUsd: Record<CurrencyCode, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 154.2,
    INR: 86.5,
    CAD: 1.38,
    AUD: 1.55,
    SGD: 1.34,
  };

  private spreadBps: number = 40; // 0.40% spread

  public getRate(from: CurrencyCode, to: CurrencyCode): FxRatePair {
    if (from === to) {
      return {
        baseCurrency: from,
        targetCurrency: to,
        rate: 1.0,
        spreadBps: 0,
        effectiveRate: 1.0,
        updatedAt: new Date().toISOString(),
      };
    }

    const fromUsd = this.ratesToUsd[from];
    const toUsd = this.ratesToUsd[to];
    const rawRate = toUsd / fromUsd;

    // Apply spread: slight markup on retail FX
    const spreadMultiplier = 1 - this.spreadBps / 10000;
    const effectiveRate = Number((rawRate * spreadMultiplier).toFixed(6));

    return {
      baseCurrency: from,
      targetCurrency: to,
      rate: Number(rawRate.toFixed(6)),
      spreadBps: this.spreadBps,
      effectiveRate,
      updatedAt: new Date().toISOString(),
    };
  }

  public convert(amountCents: number, from: CurrencyCode, to: CurrencyCode): {
    convertedAmountCents: number;
    rate: number;
    feeCents: number;
  } {
    const pair = this.getRate(from, to);
    const converted = convertCurrency(amountCents, from, to, pair.effectiveRate);
    const perfectConverted = convertCurrency(amountCents, from, to, pair.rate);
    const feeCents = Math.max(0, perfectConverted - converted);

    return {
      convertedAmountCents: converted,
      rate: pair.effectiveRate,
      feeCents,
    };
  }

  public getAllRates(): Record<string, number> {
    return { ...this.ratesToUsd };
  }
}

export const fxRatesService = new FxRatesService();
