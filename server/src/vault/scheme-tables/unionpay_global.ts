/**
 * Card Scheme Specification: UnionPayGlobalProduct
 * Network: UNIONPAY
 * Funding Type: DEBIT
 * Description: China UnionPay Global Cross-Border Card
 * Base Interchange Rate: 0.85%
 */

export interface UnionPayGlobalProductCardProfile {
  networkBrand: 'UNIONPAY';
  fundingType: 'DEBIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const UnionPayGlobalProductDefinition: UnionPayGlobalProductCardProfile = {
  networkBrand: 'UNIONPAY',
  fundingType: 'DEBIT',
  productName: 'China UnionPay Global Cross-Border Card',
  baseInterchangePercentage: 0.85,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class UnionPayGlobalProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 0.85;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
