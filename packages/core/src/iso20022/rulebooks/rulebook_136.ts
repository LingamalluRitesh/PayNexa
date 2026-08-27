/**
 * ISO 20022 Scheme Rulebook Specification #136
 * Validation & Clearing Rules for Interbank Network Clearing #136
 */

export interface ClearingRulebookParameters136 {
  maximumSingleCreditTransferCents: number;
  maximumDirectDebitBatchSize: number;
  supportedCurrencies: string[];
  settlementCutoffTimeUtc: string;
  operatingDays: 'CALENDAR_DAYS' | 'TARGET_BUSINESS_DAYS' | 'FEDERAL_RESERVE_DAYS';
  requiresMandatoryUetr: boolean;
}

export const SCHEME_RULEBOOK_136_SPEC: ClearingRulebookParameters136 = {
  maximumSingleCreditTransferCents: 1000000000,
  maximumDirectDebitBatchSize: 50000,
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
  settlementCutoffTimeUtc: '17:00:00',
  operatingDays: 'TARGET_BUSINESS_DAYS',
  requiresMandatoryUetr: true,
};

export class RulebookValidator136 {
  public static validateTransfer(amountCents: number, currency: string): boolean {
    if (amountCents > SCHEME_RULEBOOK_136_SPEC.maximumSingleCreditTransferCents) return false;
    if (!SCHEME_RULEBOOK_136_SPEC.supportedCurrencies.includes(currency)) return false;
    return true;
  }
}
