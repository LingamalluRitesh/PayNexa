/**
 * ISO 20022 Scheme Rulebook Specification #179
 * Validation & Clearing Rules for Interbank Network Clearing #179
 */

export interface ClearingRulebookParameters179 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_179_SPEC: ClearingRulebookParameters179 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator179 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_179_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_179_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
