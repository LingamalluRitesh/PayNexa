/**
 * Card Scheme Specification: MastercardWorldProduct
 * Network: MASTERCARD
 * Funding Type: CREDIT
 * Description: Mastercard World Travel Lifestyle Card
 * Base Interchange Rate: 2.15%
 */

export interface MastercardWorldProductCardProfile {
  networkBrand: 'MASTERCARD';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const MastercardWorldProductDefinition: MastercardWorldProductCardProfile = {
  networkBrand: 'MASTERCARD',
  fundingType: 'CREDIT',
  productName: 'Mastercard World Travel Lifestyle Card',
  baseInterchangePercentage: 2.15,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class MastercardWorldProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.15;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
