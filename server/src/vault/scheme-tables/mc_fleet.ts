/**
 * Card Scheme Specification: MastercardFleetProduct
 * Network: MASTERCARD
 * Funding Type: COMMERCIAL
 * Description: Mastercard Fleet Commercial Transport Card
 * Base Interchange Rate: 2.1%
 */

export interface MastercardFleetProductCardProfile {
  networkBrand: 'MASTERCARD';
  fundingType: 'COMMERCIAL';
  productName: string;
  baseInterchangePercentage: number;
  tokenizationVaultAllowed: boolean;
  supports3dSecureV2: boolean;
  supportsLevel3LineItems: boolean;
  maximumSingleTransactionLimitCents: number;
}

export const MastercardFleetProductDefinition: MastercardFleetProductCardProfile = {
  networkBrand: 'MASTERCARD',
  fundingType: 'COMMERCIAL',
  productName: 'Mastercard Fleet Commercial Transport Card',
  baseInterchangePercentage: 2.1,
  tokenizationVaultAllowed: true,
  supports3dSecureV2: true,
  supportsLevel3LineItems: true,
  maximumSingleTransactionLimitCents: 100000000,
};

export class MastercardFleetProductEvaluator {
  public static calculateCost(amountCents: number, is3dSecureVerified: boolean): number {
    let effectiveRate = 2.1;
    if (!is3dSecureVerified) {
      effectiveRate += 0.35; // Non-authenticated surcharge
    }
    return Math.round((amountCents * effectiveRate) / 100) + 10;
  }
}
