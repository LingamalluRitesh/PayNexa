/**
 * Card Scheme Specification: JcbInternationalProduct
 * Network: JCB
 * Funding Type: CREDIT
 * Description: JCB International Cardholder Network
 * Base Interchange Rate: 1.95%
 */

export interface JcbInternationalProductCardProfile {
  networkBrand: 'JCB';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const JcbInternationalProductDefinition: JcbInternationalProductCardProfile = {
  networkBrand: 'JCB',
  fundingType: 'CREDIT',
  productName: 'JCB International Cardholder Network',
  baseInterchangePercentage: 1.95,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class JcbInternationalProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.95;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
