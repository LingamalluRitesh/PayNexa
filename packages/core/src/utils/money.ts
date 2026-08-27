import { CurrencyCode } from '../types/ledger.types.js';

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  decimals: number;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: { code: 'USD', symbol: '$', decimals: 2, name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', decimals: 2, name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', decimals: 2, name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', decimals: 0, name: 'Japanese Yen' },
  INR: { code: 'INR', symbol: '₹', decimals: 2, name: 'Indian Rupee' },
  CAD: { code: 'CAD', symbol: 'CA$', decimals: 2, name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', decimals: 2, name: 'Australian Dollar' },
  SGD: { code: 'SGD', symbol: 'S$', decimals: 2, name: 'Singapore Dollar' },
};

/**
 * Converts decimal amount (e.g. 10.99 USD or 1000 JPY) to integer minor units (e.g. 1099 cents or 1000 yen)
 * Avoids IEEE 754 floating point precision errors using integer rounding.
 */
export function toMinorUnits(amountDecimal: number, currency: CurrencyCode = 'USD'): number {
  const decimals = CURRENCIES[currency]?.decimals ?? 2;
  const factor = Math.pow(10, decimals);
  return Math.round(amountDecimal * factor);
}

/**
 * Converts integer minor units (cents) to decimal unit
 */
export function toMajorUnits(amountCents: number, currency: CurrencyCode = 'USD'): number {
  const decimals = CURRENCIES[currency]?.decimals ?? 2;
  const factor = Math.pow(10, decimals);
  return amountCents / factor;
}

/**
 * Formats minor units (cents) into a clean localized currency string (e.g., "$1,250.50")
 */
export function formatCurrency(amountCents: number, currency: CurrencyCode = 'USD'): string {
  const meta = CURRENCIES[currency] || CURRENCIES.USD;
  const major = toMajorUnits(amountCents, currency);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: meta.code,
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(major);
}

/**
 * Calculates standard payment processing fee:
 * Formula: (Amount * Rate) + FixedFeeCents
 * e.g., 2.9% + $0.30 -> (amountCents * 0.029) + 30
 */
export function calculateProcessingFee(
  amountCents: number,
  percentageRate: number = 0.029,
  fixedFeeCents: number = 30
): { feeCents: number; netAmountCents: number } {
  const feeCents = Math.round(amountCents * percentageRate) + fixedFeeCents;
  const netAmountCents = Math.max(0, amountCents - feeCents);
  return { feeCents, netAmountCents };
}

/**
 * Converts an amount in base currency to target currency given exchange rate
 */
export function convertCurrency(
  amountCents: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rate: number
): number {
  if (fromCurrency === toCurrency) return amountCents;
  const fromDecimals = CURRENCIES[fromCurrency]?.decimals ?? 2;
  const toDecimals = CURRENCIES[toCurrency]?.decimals ?? 2;

  // Convert to major unit of source
  const major = amountCents / Math.pow(10, fromDecimals);
  // Apply exchange rate
  const convertedMajor = major * rate;
  // Convert back to target minor units
  return Math.round(convertedMajor * Math.pow(10, toDecimals));
}
