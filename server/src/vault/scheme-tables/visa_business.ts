/**
 * Card Scheme Specification: VisaBusinessProduct
 * Network: VISA
 * Funding Type: COMMERCIAL
 * Description: Visa Business Small Enterprise Card
 * Base Interchange Rate: 2.2%
 */

export interface VisaBusinessProductCardProfile {
  networkBrand: 'VISA';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const VisaBusinessProductDefinition: VisaBusinessProductCardProfile = {
  networkBrand: 'VISA',
  fundingType: 'COMMERCIAL',
  productName: 'Visa Business Small Enterprise Card',
  baseInterchangePercentage: 2.2,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class VisaBusinessProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.2;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
