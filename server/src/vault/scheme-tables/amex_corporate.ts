/**
 * Card Scheme Specification: AmexCorporateProduct
 * Network: AMEX
 * Funding Type: COMMERCIAL
 * Description: American Express Corporate Commercial Card
 * Base Interchange Rate: 2.95%
 */

export interface AmexCorporateProductCardProfile {
  networkBrand: 'AMEX';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const AmexCorporateProductDefinition: AmexCorporateProductCardProfile = {
  networkBrand: 'AMEX',
  fundingType: 'COMMERCIAL',
  productName: 'American Express Corporate Commercial Card',
  baseInterchangePercentage: 2.95,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class AmexCorporateProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.95;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
