export interface CardTransactionProfile {
  cardBrand: 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER';
  cardFundingType: 'CREDIT' | 'DEBIT' | 'PREPAID' | 'COMMERCIAL';
  cardProductTier: 'STANDARD' | 'REWARDS' | 'SIGNATURE' | 'INFINITE' | 'WORLD_ELITE' | 'CORPORATE_FLEET';
  captureMethod: 'CHIP_EMV' | 'CONTACTLESS_NFC' | 'ECOMMERCE_3DS' | 'ECOMMERCE_NON_3DS' | 'MANUAL_KEYED';
  mcc: string; // Merchant Category Code (e.g. 5411 Supermarket, 5812 Restaurant)
  amountCents: number;
  currency: string;
  isCrossBorder: boolean;
}

export interface InterchangeCalculationResult {
  interchangeRatePercent: number;
  interchangeFixedFeeCents: number;
  totalInterchangeCents: number;
  schemeAssessmentCents: number;
  acquirerMarkupCents: number;
  gatewayFeeCents: number;
  totalProcessingCostCents: number;
  effectiveFeePercent: number;
  qualificationCategory: string;
}

export class InterchangePricingEngine {
  /**
   * Evaluates exact Interchange Plus (IC+) fee structure according to Visa/Mastercard schedules
   */
  public calculateInterchange(profile: CardTransactionProfile): InterchangeCalculationResult {
    let ratePercent = 1.51; // Base default
    let fixedCents = 10;
    let qualification = 'RETAIL_BASE';

    // 1. Debit vs Credit vs Commercial
    if (profile.cardFundingType === 'DEBIT' || profile.cardFundingType === 'PREPAID') {
      // Durbin Amendment Reg II Cap for regulated US debit: 0.05% + 21 cents + 1 cent fraud
      ratePercent = 0.05;
      fixedCents = 22;
      qualification = 'US_REGULATED_DEBIT_DURBIN';
    } else if (profile.cardFundingType === 'COMMERCIAL') {
      ratePercent = 2.70;
      fixedCents = 10;
      qualification = 'COMMERCIAL_CORPORATE_LEVEL_II';
    } else {
      // Consumer Credit
      if (profile.captureMethod === 'ECOMMERCE_3DS') {
        if (profile.cardProductTier === 'SIGNATURE' || profile.cardProductTier === 'WORLD_ELITE') {
          ratePercent = 2.30;
          fixedCents = 10;
          qualification = 'ECOM_CREDIT_PREMIUM_REWARDS_3DS';
        } else {
          ratePercent = 1.80;
          fixedCents = 10;
          qualification = 'ECOM_CREDIT_STANDARD_3DS';
        }
      } else if (profile.captureMethod === 'ECOMMERCE_NON_3DS') {
        ratePercent = 2.10;
        fixedCents = 10;
        qualification = 'ECOM_CREDIT_NON_AUTHENTICATED';
      } else if (profile.captureMethod === 'CHIP_EMV' || profile.captureMethod === 'CONTACTLESS_NFC') {
        ratePercent = 1.51;
        fixedCents = 10;
        qualification = 'CARD_PRESENT_CPS_RETAIL';
      } else {
        ratePercent = 2.95;
        fixedCents = 20;
        qualification = 'MANUAL_KEYED_STANDARD_NON_QUAL';
      }
    }

    // Cross-border surcharge
    if (profile.isCrossBorder) {
      ratePercent += 0.80; // Cross-border interchange differential
      qualification += '_CROSS_BORDER';
    }

    const totalInterchangeCents = Math.round((profile.amountCents * ratePercent) / 100) + fixedCents;

    // Card Network Assessment Fees (Visa 0.14%, MC 0.1375%)
    const schemeRate = profile.cardBrand === 'VISA' ? 0.0014 : 0.001375;
    const schemeAssessmentCents = Math.round(profile.amountCents * schemeRate) + 2;

    // Acquirer Processing Markup (0.20% + 5 cents)
    const acquirerMarkupCents = Math.round(profile.amountCents * 0.002) + 5;

    // Fixed Gateway Fee ($0.10)
    const gatewayFeeCents = 10;

    const totalProcessingCostCents =
      totalInterchangeCents + schemeAssessmentCents + acquirerMarkupCents + gatewayFeeCents;
    const effectiveFeePercent =
      profile.amountCents > 0 ? (totalProcessingCostCents / profile.amountCents) * 100 : 0;

    return {
      interchangeRatePercent: Number(ratePercent.toFixed(4)),
      interchangeFixedFeeCents: fixedCents,
      totalInterchangeCents,
      schemeAssessmentCents,
      acquirerMarkupCents,
      gatewayFeeCents,
      totalProcessingCostCents,
      effectiveFeePercent: Number(effectiveFeePercent.toFixed(2)),
      qualificationCategory: qualification,
    };
  }
}

export const interchangeEngine = new InterchangePricingEngine();
