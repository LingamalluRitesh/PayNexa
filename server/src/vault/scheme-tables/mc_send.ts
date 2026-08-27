/**
 * Card Scheme Specification: MastercardSendProduct
 * Network: MASTERCARD
 * Funding Type: DEBIT
 * Description: Mastercard Send Real-Time Push to Card Rails
 * Base Interchange Rate: 0.05%
 */

export interface MastercardSendProductCardProfile {
  networkBrand: 'MASTERCARD';
  fundingType: 'DEBIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const MastercardSendProductDefinition: MastercardSendProductCardProfile = {
  networkBrand: 'MASTERCARD',
  fundingType: 'DEBIT',
  productName: 'Mastercard Send Real-Time Push to Card Rails',
  baseInterchangePercentage: 0.05,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class MastercardSendProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 0.05;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
