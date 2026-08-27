/**
 * ISO 20022 Scheme Rulebook Specification #44
 * Validation & Clearing Rules for Interbank Network Clearing #44
 */

export interface ClearingRulebookParameters44 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_44_SPEC: ClearingRulebookParameters44 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator44 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_44_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_44_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
