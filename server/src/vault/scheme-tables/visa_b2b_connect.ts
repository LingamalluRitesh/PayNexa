/**
 * Card Scheme Specification: VisaB2bConnectProduct
 * Network: VISA
 * Funding Type: COMMERCIAL
 * Description: Visa B2B Connect Cross-Border Settlement
 * Base Interchange Rate: 1.25%
 */

export interface VisaB2bConnectProductCardProfile {
  networkBrand: 'VISA';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const VisaB2bConnectProductDefinition: VisaB2bConnectProductCardProfile = {
  networkBrand: 'VISA',
  fundingType: 'COMMERCIAL',
  productName: 'Visa B2B Connect Cross-Border Settlement',
  baseInterchangePercentage: 1.25,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class VisaB2bConnectProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.25;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
