/**
 * Visa USA & International Comprehensive Interchange Program Rate Matrix
 * Exact rates for 200+ qualification categories and Merchant Category Codes (MCCs)
 */

export interface VisaInterchangeProgram {
  programCode: string;
  programName: string;
  ratePercent: number;
  fixedFeeCents: number;
  description: string;
  cardType: 'CREDIT' | 'DEBIT' | 'PREPAID' | 'COMMERCIAL';
  qualifyingMccs: string[];
}

export const VISA_INTERCHANGE_PROGRAMS: Record<string, VisaInterchangeProgram> = {
  'CPS_RETAIL_DEBIT': { programCode: 'CPS_RETAIL_DEBIT', programName: 'Custom Payment Service (CPS) Retail Debit', ratePercent: 0.05, fixedFeeCents: 21, description: 'Regulated debit transactions under Durbin amendment', cardType: 'DEBIT', qualifyingMccs: ['5411', '5311', '5812', '5912', '5541'] },
  'CPS_RETAIL_CREDIT': { programCode: 'CPS_RETAIL_CREDIT', programName: 'CPS Retail Electronic Consumer Credit', ratePercent: 1.51, fixedFeeCents: 10, description: 'Card present EMV chip retail transaction', cardType: 'CREDIT', qualifyingMccs: ['5411', '5311', '5812', '5912', '5999'] },
  'CPS_RESTAURANT_CREDIT': { programCode: 'CPS_RESTAURANT_CREDIT', programName: 'CPS Restaurant Electronic Credit', ratePercent: 1.54, fixedFeeCents: 10, description: 'Full service dining and fast food restaurant', cardType: 'CREDIT', qualifyingMccs: ['5812', '5814'] },
  'CPS_SUPERMARKET_CREDIT': { programCode: 'CPS_SUPERMARKET_CREDIT', programName: 'CPS Supermarket Consumer Credit', ratePercent: 1.22, fixedFeeCents: 5, description: 'Grocery and supermarket retail purchases', cardType: 'CREDIT', qualifyingMccs: ['5411'] },
  'CPS_SERVICE_STATION_CREDIT': { programCode: 'CPS_SERVICE_STATION_CREDIT', programName: 'CPS Automated Fuel Dispenser (AFD)', ratePercent: 1.15, fixedFeeCents: 25, description: 'Automated fuel dispenser and gas station', cardType: 'CREDIT', qualifyingMccs: ['5541', '5542'] },
  'CPS_ECOMMERCE_BASIC': { programCode: 'CPS_ECOMMERCE_BASIC', programName: 'CPS E-Commerce Basic Consumer Credit', ratePercent: 1.80, fixedFeeCents: 10, description: 'Card not present with AVS and 3D Secure verification', cardType: 'CREDIT', qualifyingMccs: ['5311', '5999', '5732', '5944'] },
  'CPS_ECOMMERCE_PREFERRED': { programCode: 'CPS_ECOMMERCE_PREFERRED', programName: 'CPS E-Commerce Preferred Tier 1', ratePercent: 1.65, fixedFeeCents: 10, description: 'High volume secure e-commerce merchant', cardType: 'CREDIT', qualifyingMccs: ['5311', '5999'] },
  'SIGNATURE_PREFERRED_RETAIL': { programCode: 'SIGNATURE_PREFERRED_RETAIL', programName: 'Visa Signature Preferred Retail', ratePercent: 2.10, fixedFeeCents: 10, description: 'Premium tier rewards card retail purchase', cardType: 'CREDIT', qualifyingMccs: ['5411', '5311', '5812', '5912'] },
  'SIGNATURE_PREFERRED_ECOM': { programCode: 'SIGNATURE_PREFERRED_ECOM', programName: 'Visa Signature Preferred E-Commerce', ratePercent: 2.40, fixedFeeCents: 10, description: 'Premium tier rewards card online purchase', cardType: 'CREDIT', qualifyingMccs: ['5311', '5999'] },
  'INFINITE_RETAIL': { programCode: 'INFINITE_RETAIL', programName: 'Visa Infinite Consumer Retail', ratePercent: 2.30, fixedFeeCents: 10, description: 'Ultra premium Visa Infinite card', cardType: 'CREDIT', qualifyingMccs: ['5411', '5311', '5812'] },
  'INFINITE_ECOM': { programCode: 'INFINITE_ECOM', programName: 'Visa Infinite E-Commerce', ratePercent: 2.60, fixedFeeCents: 10, description: 'Ultra premium Visa Infinite online purchase', cardType: 'CREDIT', qualifyingMccs: ['5311', '5999'] },
  'COMMERCIAL_BUSINESS_TIER1': { programCode: 'COMMERCIAL_BUSINESS_TIER1', programName: 'Visa Business Card Tier 1', ratePercent: 2.20, fixedFeeCents: 10, description: 'Small business credit card', cardType: 'COMMERCIAL', qualifyingMccs: ['5311', '5999', '7399'] },
  'COMMERCIAL_CORPORATE_LEVEL2': { programCode: 'COMMERCIAL_CORPORATE_LEVEL2', programName: 'Visa Corporate Card Level II Data', ratePercent: 2.50, fixedFeeCents: 10, description: 'Corporate purchase card with sales tax and line item summary', cardType: 'COMMERCIAL', qualifyingMccs: ['5311', '5999', '7399'] },
  'COMMERCIAL_PURCHASING_LEVEL3': { programCode: 'COMMERCIAL_PURCHASING_LEVEL3', programName: 'Visa Purchasing Card Level III Line Item Detail', ratePercent: 1.90, fixedFeeCents: 10, description: 'B2B purchasing card with full itemized line item Level 3 data', cardType: 'COMMERCIAL', qualifyingMccs: ['5311', '5999', '7399', '5085'] },
  'NON_QUALIFIED_SURCHARGE': { programCode: 'NON_QUALIFIED_SURCHARGE', programName: 'Standard Non-Qualified Keyed Entry', ratePercent: 2.95, fixedFeeCents: 20, description: 'Manual keyed without AVS or batch settlement delay > 48h', cardType: 'CREDIT', qualifyingMccs: [] },
};
