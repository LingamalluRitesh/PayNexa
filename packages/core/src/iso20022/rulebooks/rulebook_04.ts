/**
 * ISO 20022 Scheme Rulebook Specification #4
 * Validation & Clearing Rules for Interbank Network Clearing #4
 */

export interface ClearingRulebookParameters4 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_4_SPEC: ClearingRulebookParameters4 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator4 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_4_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_4_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
