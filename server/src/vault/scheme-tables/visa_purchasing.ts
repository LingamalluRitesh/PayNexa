/**
 * Card Scheme Specification: VisaPurchasingProduct
 * Network: VISA
 * Funding Type: COMMERCIAL
 * Description: Visa Purchasing Level 3 B2B Card
 * Base Interchange Rate: 1.9%
 */

export interface VisaPurchasingProductCardProfile {
  networkBrand: 'VISA';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const VisaPurchasingProductDefinition: VisaPurchasingProductCardProfile = {
  networkBrand: 'VISA',
  fundingType: 'COMMERCIAL',
  productName: 'Visa Purchasing Level 3 B2B Card',
  baseInterchangePercentage: 1.9,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class VisaPurchasingProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.9;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
