/**
 * Card Scheme Specification: DinersClubProduct
 * Network: DISCOVER
 * Funding Type: COMMERCIAL
 * Description: Diners Club International Corporate Card
 * Base Interchange Rate: 2.4%
 */

export interface DinersClubProductCardProfile {
  networkBrand: 'DISCOVER';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const DinersClubProductDefinition: DinersClubProductCardProfile = {
  networkBrand: 'DISCOVER',
  fundingType: 'COMMERCIAL',
  productName: 'Diners Club International Corporate Card',
  baseInterchangePercentage: 2.4,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class DinersClubProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.4;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
