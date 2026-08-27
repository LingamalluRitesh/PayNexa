/**
 * ISO 20022 Scheme Rulebook Specification #159
 * Validation & Clearing Rules for Interbank Network Clearing #159
 */

export interface ClearingRulebookParameters159 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_159_SPEC: ClearingRulebookParameters159 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator159 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_159_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_159_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
