/**
 * Card Scheme Specification: AmexGoldProduct
 * Network: AMEX
 * Funding Type: CREDIT
 * Description: American Express Premier Rewards Gold Card
 * Base Interchange Rate: 2.5%
 */

export interface AmexGoldProductCardProfile {
  networkBrand: 'AMEX';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const AmexGoldProductDefinition: AmexGoldProductCardProfile = {
  networkBrand: 'AMEX',
  fundingType: 'CREDIT',
  productName: 'American Express Premier Rewards Gold Card',
  baseInterchangePercentage: 2.5,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class AmexGoldProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.5;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
