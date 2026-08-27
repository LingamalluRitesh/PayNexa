/**
 * Card Scheme Specification: VisaPlatinumProduct
 * Network: VISA
 * Funding Type: CREDIT
 * Description: Visa Platinum High Spend Consumer Card
 * Base Interchange Rate: 1.85%
 */

export interface VisaPlatinumProductCardProfile {
  networkBrand: 'VISA';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const VisaPlatinumProductDefinition: VisaPlatinumProductCardProfile = {
  networkBrand: 'VISA',
  fundingType: 'CREDIT',
  productName: 'Visa Platinum High Spend Consumer Card',
  baseInterchangePercentage: 1.85,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class VisaPlatinumProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.85;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
