/**
 * ISO 20022 Scheme Rulebook Specification #110
 * Validation & Clearing Rules for Interbank Network Clearing #110
 */

export interface ClearingRulebookParameters110 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_110_SPEC: ClearingRulebookParameters110 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator110 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_110_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_110_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
