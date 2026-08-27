/**
 * Card Scheme Specification: MastercardCorporateProduct
 * Network: MASTERCARD
 * Funding Type: COMMERCIAL
 * Description: Mastercard Corporate Commercial Card
 * Base Interchange Rate: 2.55%
 */

export interface MastercardCorporateProductCardProfile {
  networkBrand: 'MASTERCARD';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const MastercardCorporateProductDefinition: MastercardCorporateProductCardProfile = {
  networkBrand: 'MASTERCARD',
  fundingType: 'COMMERCIAL',
  productName: 'Mastercard Corporate Commercial Card',
  baseInterchangePercentage: 2.55,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class MastercardCorporateProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.55;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
