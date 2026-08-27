/**
 * Card Scheme Specification: VisaFleetProduct
 * Network: VISA
 * Funding Type: COMMERCIAL
 * Description: Visa Fleet Fuel & Maintenance Card
 * Base Interchange Rate: 2.05%
 */

export interface VisaFleetProductCardProfile {
  networkBrand: 'VISA';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const VisaFleetProductDefinition: VisaFleetProductCardProfile = {
  networkBrand: 'VISA',
  fundingType: 'COMMERCIAL',
  productName: 'Visa Fleet Fuel & Maintenance Card',
  baseInterchangePercentage: 2.05,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class VisaFleetProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.05;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
