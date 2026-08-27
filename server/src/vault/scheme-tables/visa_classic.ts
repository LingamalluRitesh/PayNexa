/**
 * Card Scheme Specification: VisaClassicProduct
 * Network: VISA
 * Funding Type: CREDIT
 * Description: Visa Classic Consumer Credit/Debit
 * Base Interchange Rate: 1.51%
 */

export interface VisaClassicProductCardProfile {
  networkBrand: 'VISA';
  fundingType: 'CREDIT';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const VisaClassicProductDefinition: VisaClassicProductCardProfile = {
  networkBrand: 'VISA',
  fundingType: 'CREDIT',
  productName: 'Visa Classic Consumer Credit/Debit',
  baseInterchangePercentage: 1.51,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: false,
  maximumSingleTransactionLimitCents: 25000000,
};

export class VisaClassicProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 1.51;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
