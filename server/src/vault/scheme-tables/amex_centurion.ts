/**
 * Card Scheme Specification: AmexCenturionProduct
 * Network: AMEX
 * Funding Type: CREDIT
 * Description: American Express Centurion Black Card
 * Base Interchange Rate: 3.25%
 */

export interface AmexCenturionProductCardProfile {
  networkBrand: 'AMEX';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const AmexCenturionProductDefinition: AmexCenturionProductCardProfile = {
  networkBrand: 'AMEX',
  fundingType: 'CREDIT',
  productName: 'American Express Centurion Black Card',
  baseInterchangePercentage: 3.25,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class AmexCenturionProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 3.25;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
