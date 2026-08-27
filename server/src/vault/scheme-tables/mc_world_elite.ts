/**
 * Card Scheme Specification: MastercardWorldEliteProduct
 * Network: MASTERCARD
 * Funding Type: CREDIT
 * Description: Mastercard World Elite Ultra Premium Card
 * Base Interchange Rate: 2.45%
 */

export interface MastercardWorldEliteProductCardProfile {
  networkBrand: 'MASTERCARD';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const MastercardWorldEliteProductDefinition: MastercardWorldEliteProductCardProfile = {
  networkBrand: 'MASTERCARD',
  fundingType: 'CREDIT',
  productName: 'Mastercard World Elite Ultra Premium Card',
  baseInterchangePercentage: 2.45,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class MastercardWorldEliteProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.45;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
