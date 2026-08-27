/**
 * ISO 20022 Scheme Rulebook Specification #197
 * Validation & Clearing Rules for Interbank Network Clearing #197
 */

export interface ClearingRulebookParameters197 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_197_SPEC: ClearingRulebookParameters197 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator197 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_197_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_197_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
