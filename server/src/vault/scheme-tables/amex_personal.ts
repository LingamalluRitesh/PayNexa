/**
 * Card Scheme Specification: AmexPersonalProduct
 * Network: AMEX
 * Funding Type: CREDIT
 * Description: American Express Personal Green Card
 * Base Interchange Rate: 2.3%
 */

export interface AmexPersonalProductCardProfile {
  networkBrand: 'AMEX';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const AmexPersonalProductDefinition: AmexPersonalProductCardProfile = {
  networkBrand: 'AMEX',
  fundingType: 'CREDIT',
  productName: 'American Express Personal Green Card',
  baseInterchangePercentage: 2.3,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class AmexPersonalProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.3;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
