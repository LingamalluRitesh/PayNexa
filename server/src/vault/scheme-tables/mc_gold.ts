/**
 * Card Scheme Specification: MastercardGoldProduct
 * Network: MASTERCARD
 * Funding Type: CREDIT
 * Description: Mastercard Gold Consumer Rewards Card
 * Base Interchange Rate: 1.7%
 */

export interface MastercardGoldProductCardProfile {
  networkBrand: 'MASTERCARD';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const MastercardGoldProductDefinition: MastercardGoldProductCardProfile = {
  networkBrand: 'MASTERCARD',
  fundingType: 'CREDIT',
  productName: 'Mastercard Gold Consumer Rewards Card',
  baseInterchangePercentage: 1.7,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class MastercardGoldProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.7;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
