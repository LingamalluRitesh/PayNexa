/**
 * Card Scheme Specification: AmexBusinessProduct
 * Network: AMEX
 * Funding Type: COMMERCIAL
 * Description: American Express Business Gold Card
 * Base Interchange Rate: 2.65%
 */

export interface AmexBusinessProductCardProfile {
  networkBrand: 'AMEX';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const AmexBusinessProductDefinition: AmexBusinessProductCardProfile = {
  networkBrand: 'AMEX',
  fundingType: 'COMMERCIAL',
  productName: 'American Express Business Gold Card',
  baseInterchangePercentage: 2.65,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class AmexBusinessProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.65;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
