/**
 * Card Scheme Specification: VisaCorporateProduct
 * Network: VISA
 * Funding Type: COMMERCIAL
 * Description: Visa Corporate Mid-Market Card
 * Base Interchange Rate: 2.5%
 */

export interface VisaCorporateProductCardProfile {
  networkBrand: 'VISA';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const VisaCorporateProductDefinition: VisaCorporateProductCardProfile = {
  networkBrand: 'VISA',
  fundingType: 'COMMERCIAL',
  productName: 'Visa Corporate Mid-Market Card',
  baseInterchangePercentage: 2.5,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class VisaCorporateProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.5;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
