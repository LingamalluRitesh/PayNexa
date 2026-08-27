/**
 * Card Scheme Specification: MastercardBusinessProduct
 * Network: MASTERCARD
 * Funding Type: COMMERCIAL
 * Description: Mastercard Business Executive Card
 * Base Interchange Rate: 2.25%
 */

export interface MastercardBusinessProductCardProfile {
  networkBrand: 'MASTERCARD';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const MastercardBusinessProductDefinition: MastercardBusinessProductCardProfile = {
  networkBrand: 'MASTERCARD',
  fundingType: 'COMMERCIAL',
  productName: 'Mastercard Business Executive Card',
  baseInterchangePercentage: 2.25,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class MastercardBusinessProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.25;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
