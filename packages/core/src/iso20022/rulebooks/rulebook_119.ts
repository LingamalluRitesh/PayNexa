/**
 * ISO 20022 Scheme Rulebook Specification #119
 * Validation & Clearing Rules for Interbank Network Clearing #119
 */

export interface ClearingRulebookParameters119 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_119_SPEC: ClearingRulebookParameters119 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator119 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_119_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_119_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
