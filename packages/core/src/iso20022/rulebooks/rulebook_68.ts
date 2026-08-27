/**
 * ISO 20022 Scheme Rulebook Specification #68
 * Validation & Clearing Rules for Interbank Network Clearing #68
 */

export interface ClearingRulebookParameters68 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_68_SPEC: ClearingRulebookParameters68 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator68 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_68_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_68_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
