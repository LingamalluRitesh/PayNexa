import { CurrencyCode } from '../types/ledger.types.js';

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'SGD'];

export function isValidCurrency(currency: string): currency is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(currency as CurrencyCode);
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPositiveInteger(val: unknown): val is number {
  return typeof val === 'number' && Number.isInteger(val) && val > 0;
}

export function isValidNonNegativeInteger(val: unknown): val is number {
  return typeof val === 'number' && Number.isInteger(val) && val >= 0;
}
