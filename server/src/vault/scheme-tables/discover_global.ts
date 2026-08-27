/**
 * Card Scheme Specification: DiscoverGlobalProduct
 * Network: DISCOVER
 * Funding Type: CREDIT
 * Description: Discover Global Network Consumer Card
 * Base Interchange Rate: 1.56%
 */

export interface DiscoverGlobalProductCardProfile {
  networkBrand: 'DISCOVER';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const DiscoverGlobalProductDefinition: DiscoverGlobalProductCardProfile = {
  networkBrand: 'DISCOVER',
  fundingType: 'CREDIT',
  productName: 'Discover Global Network Consumer Card',
  baseInterchangePercentage: 1.56,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class DiscoverGlobalProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.56;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
