/**
 * Mastercard Comprehensive Interchange Program Rate Matrix
 * Exact rates for Mastercard Merit, Consumer, Commercial, and Interregional programs
 */

export interface MastercardInterchangeProgram {
  programCode: string;
  programName: string;
  ratePercent: number;
  fixedFeeCents: number;
  description: string;
  cardType: 'CREDIT' | 'DEBIT' | 'PREPAID' | 'COMMERCIAL';
}

export const MASTERCARD_INTERCHANGE_PROGRAMS: Record<string, MastercardInterchangeProgram> = {
  'MC_REGULATED_DEBIT': { programCode: 'MC_REGULATED_DEBIT', programName: 'Mastercard US Regulated Debit', ratePercent: 0.05, fixedFeeCents: 21, description: 'Durbin regulated debit card', cardType: 'DEBIT' },
  'MC_MERIT_III_RETAIL': { programCode: 'MC_MERIT_III_RETAIL', programName: 'Mastercard Merit III Base Retail', ratePercent: 1.58, fixedFeeCents: 10, description: 'Card present chip terminal retail', cardType: 'CREDIT' },
  'MC_MERIT_III_SUPERMARKET': { programCode: 'MC_MERIT_III_SUPERMARKET', programName: 'Mastercard Merit III Supermarket', ratePercent: 1.25, fixedFeeCents: 5, description: 'Supermarket and grocery retail', cardType: 'CREDIT' },
  'MC_MERIT_III_RESTAURANT': { programCode: 'MC_MERIT_III_RESTAURANT', programName: 'Mastercard Merit III Restaurant', ratePercent: 1.55, fixedFeeCents: 10, description: 'Restaurant dining purchase', cardType: 'CREDIT' },
  'MC_MERIT_III_ECOM_3DS': { programCode: 'MC_MERIT_III_ECOM_3DS', programName: 'Mastercard Merit III E-Commerce with Identity Check 3DS', ratePercent: 1.85, fixedFeeCents: 10, description: 'Secure 3D Secure 2.2 online purchase', cardType: 'CREDIT' },
  'MC_WORLD_MERIT_RETAIL': { programCode: 'MC_WORLD_MERIT_RETAIL', programName: 'Mastercard World Consumer Retail', ratePercent: 2.05, fixedFeeCents: 10, description: 'World tier rewards card', cardType: 'CREDIT' },
  'MC_WORLD_ELITE_ECOM': { programCode: 'MC_WORLD_ELITE_ECOM', programName: 'Mastercard World Elite E-Commerce', ratePercent: 2.45, fixedFeeCents: 10, description: 'World Elite premium rewards online purchase', cardType: 'CREDIT' },
  'MC_CORPORATE_LEVEL_2': { programCode: 'MC_CORPORATE_LEVEL_2', programName: 'Mastercard Corporate Level 2 Commercial', ratePercent: 2.50, fixedFeeCents: 10, description: 'Commercial corporate card with tax data', cardType: 'COMMERCIAL' },
  'MC_PURCHASING_LEVEL_3': { programCode: 'MC_PURCHASING_LEVEL_3', programName: 'Mastercard Purchasing Level 3 B2B', ratePercent: 1.90, fixedFeeCents: 10, description: 'Purchasing card with itemized line items', cardType: 'COMMERCIAL' },
  'MC_STANDARD_NON_QUAL': { programCode: 'MC_STANDARD_NON_QUAL', programName: 'Mastercard Standard Non-Qualified', ratePercent: 2.95, fixedFeeCents: 20, description: 'Non-qualifying keyed or delayed settlement', cardType: 'CREDIT' },
};
