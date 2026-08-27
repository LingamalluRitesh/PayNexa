/**
 * ISO 20022 Scheme Rulebook Specification #69
 * Validation & Clearing Rules for Interbank Network Clearing #69
 */

export interface ClearingRulebookParameters69 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_69_SPEC: ClearingRulebookParameters69 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator69 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_69_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_69_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
