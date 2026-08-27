/**
 * Card Scheme Specification: MastercardStandardProduct
 * Network: MASTERCARD
 * Funding Type: CREDIT
 * Description: Mastercard Standard Consumer Card
 * Base Interchange Rate: 1.58%
 */

export interface MastercardStandardProductCardProfile {
  networkBrand: 'MASTERCARD';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const MastercardStandardProductDefinition: MastercardStandardProductCardProfile = {
  networkBrand: 'MASTERCARD',
  fundingType: 'CREDIT',
  productName: 'Mastercard Standard Consumer Card',
  baseInterchangePercentage: 1.58,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class MastercardStandardProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.58;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
