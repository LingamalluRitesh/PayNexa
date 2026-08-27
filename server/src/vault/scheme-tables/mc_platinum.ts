/**
 * Card Scheme Specification: MastercardPlatinumProduct
 * Network: MASTERCARD
 * Funding Type: CREDIT
 * Description: Mastercard Platinum Premium Card
 * Base Interchange Rate: 1.95%
 */

export interface MastercardPlatinumProductCardProfile {
  networkBrand: 'MASTERCARD';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const MastercardPlatinumProductDefinition: MastercardPlatinumProductCardProfile = {
  networkBrand: 'MASTERCARD',
  fundingType: 'CREDIT',
  productName: 'Mastercard Platinum Premium Card',
  baseInterchangePercentage: 1.95,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class MastercardPlatinumProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.95;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
