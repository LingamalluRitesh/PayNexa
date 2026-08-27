/**
 * Card Scheme Specification: AmexPlatinumProduct
 * Network: AMEX
 * Funding Type: CREDIT
 * Description: American Express Platinum Charge Card
 * Base Interchange Rate: 2.85%
 */

export interface AmexPlatinumProductCardProfile {
  networkBrand: 'AMEX';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const AmexPlatinumProductDefinition: AmexPlatinumProductCardProfile = {
  networkBrand: 'AMEX',
  fundingType: 'CREDIT',
  productName: 'American Express Platinum Charge Card',
  baseInterchangePercentage: 2.85,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class AmexPlatinumProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.85;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
