/**
 * Card Scheme Specification: MastercardPurchasingProduct
 * Network: MASTERCARD
 * Funding Type: COMMERCIAL
 * Description: Mastercard Purchasing Level 3 Procurement
 * Base Interchange Rate: 1.95%
 */

export interface MastercardPurchasingProductCardProfile {
  networkBrand: 'MASTERCARD';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const MastercardPurchasingProductDefinition: MastercardPurchasingProductCardProfile = {
  networkBrand: 'MASTERCARD',
  fundingType: 'COMMERCIAL',
  productName: 'Mastercard Purchasing Level 3 Procurement',
  baseInterchangePercentage: 1.95,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class MastercardPurchasingProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.95;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
