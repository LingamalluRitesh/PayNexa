/**
 * Card Scheme Specification: VisaGoldProduct
 * Network: VISA
 * Funding Type: CREDIT
 * Description: Visa Gold Enhanced Rewards Consumer Card
 * Base Interchange Rate: 1.65%
 */

export interface VisaGoldProductCardProfile {
  networkBrand: 'VISA';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const VisaGoldProductDefinition: VisaGoldProductCardProfile = {
  networkBrand: 'VISA',
  fundingType: 'CREDIT',
  productName: 'Visa Gold Enhanced Rewards Consumer Card',
  baseInterchangePercentage: 1.65,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class VisaGoldProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.65;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
