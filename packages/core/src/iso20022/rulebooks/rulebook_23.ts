/**
 * ISO 20022 Scheme Rulebook Specification #23
 * Validation & Clearing Rules for Interbank Network Clearing #23
 */

export interface ClearingRulebookParameters23 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_23_SPEC: ClearingRulebookParameters23 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator23 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_23_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_23_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
