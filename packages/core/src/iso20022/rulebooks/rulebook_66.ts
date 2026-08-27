/**
 * ISO 20022 Scheme Rulebook Specification #66
 * Validation & Clearing Rules for Interbank Network Clearing #66
 */

export interface ClearingRulebookParameters66 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_66_SPEC: ClearingRulebookParameters66 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator66 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_66_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_66_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
