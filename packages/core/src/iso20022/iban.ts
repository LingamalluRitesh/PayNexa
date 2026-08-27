/**
 * ISO 13616 International Bank Account Number (IBAN) & ISO 9362 BIC Validator
 */

export interface IbanStructure {
  countryCode: string;
  totalLength: number;
  bbanPattern: RegExp;
  bankCodeStart: number;
  bankCodeEnd: number;
  accountNumberStart: number;
  accountNumberEnd: number;
}

export const IBAN_REGISTRY: Record<string, IbanStructure> = {
  AL: { countryCode: 'AL', totalLength: 28, bbanPattern: /^\d{8}[A-Z0-9]{16}$/, bankCodeStart: 4, bankCodeEnd: 12, accountNumberStart: 12, accountNumberEnd: 28 },
  AD: { countryCode: 'AD', totalLength: 24, bbanPattern: /^\d{8}[A-Z0-9]{12}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 12, accountNumberEnd: 24 },
  AT: { countryCode: 'AT', totalLength: 20, bbanPattern: /^\d{16}$/, bankCodeStart: 4, bankCodeEnd: 9, accountNumberStart: 9, accountNumberEnd: 20 },
  BE: { countryCode: 'BE', totalLength: 16, bbanPattern: /^\d{12}$/, bankCodeStart: 4, bankCodeEnd: 7, accountNumberStart: 7, accountNumberEnd: 14 },
  BA: { countryCode: 'BA', totalLength: 20, bbanPattern: /^\d{16}$/, bankCodeStart: 4, bankCodeEnd: 7, accountNumberStart: 7, accountNumberEnd: 15 },
  BG: { countryCode: 'BG', totalLength: 22, bbanPattern: /^[A-Z]{4}\d{6}[A-Z0-9]{8}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 14, accountNumberEnd: 22 },
  HR: { countryCode: 'HR', totalLength: 21, bbanPattern: /^\d{17}$/, bankCodeStart: 4, bankCodeEnd: 11, accountNumberStart: 11, accountNumberEnd: 21 },
  CY: { countryCode: 'CY', totalLength: 28, bbanPattern: /^\d{8}[A-Z0-9]{16}$/, bankCodeStart: 4, bankCodeEnd: 7, accountNumberStart: 12, accountNumberEnd: 28 },
  CZ: { countryCode: 'CZ', totalLength: 24, bbanPattern: /^\d{20}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 14, accountNumberEnd: 24 },
  DK: { countryCode: 'DK', totalLength: 18, bbanPattern: /^\d{14}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 8, accountNumberEnd: 18 },
  EE: { countryCode: 'EE', totalLength: 20, bbanPattern: /^\d{16}$/, bankCodeStart: 4, bankCodeEnd: 6, accountNumberStart: 8, accountNumberEnd: 20 },
  FI: { countryCode: 'FI', totalLength: 18, bbanPattern: /^\d{14}$/, bankCodeStart: 4, bankCodeEnd: 7, accountNumberStart: 7, accountNumberEnd: 17 },
  FR: { countryCode: 'FR', totalLength: 27, bbanPattern: /^\d{10}[A-Z0-9]{11}\d{2}$/, bankCodeStart: 4, bankCodeEnd: 9, accountNumberStart: 14, accountNumberEnd: 25 },
  DE: { countryCode: 'DE', totalLength: 22, bbanPattern: /^\d{18}$/, bankCodeStart: 4, bankCodeEnd: 12, accountNumberStart: 12, accountNumberEnd: 22 },
  GI: { countryCode: 'GI', totalLength: 23, bbanPattern: /^[A-Z]{4}[A-Z0-9]{15}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 8, accountNumberEnd: 23 },
  GR: { countryCode: 'GR', totalLength: 27, bbanPattern: /^\d{7}[A-Z0-9]{16}$/, bankCodeStart: 4, bankCodeEnd: 7, accountNumberStart: 11, accountNumberEnd: 27 },
  HU: { countryCode: 'HU', totalLength: 28, bbanPattern: /^\d{24}$/, bankCodeStart: 4, bankCodeEnd: 7, accountNumberStart: 12, accountNumberEnd: 27 },
  IS: { countryCode: 'IS', totalLength: 26, bbanPattern: /^\d{22}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 10, accountNumberEnd: 26 },
  IE: { countryCode: 'IE', totalLength: 22, bbanPattern: /^[A-Z0-9]{4}\d{14}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 14, accountNumberEnd: 22 },
  IT: { countryCode: 'IT', totalLength: 27, bbanPattern: /^[A-Z]\d{10}[A-Z0-9]{12}$/, bankCodeStart: 5, bankCodeEnd: 10, accountNumberStart: 15, accountNumberEnd: 27 },
  LV: { countryCode: 'LV', totalLength: 21, bbanPattern: /^[A-Z]{4}[A-Z0-9]{13}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 8, accountNumberEnd: 21 },
  LI: { countryCode: 'LI', totalLength: 21, bbanPattern: /^\d{5}[A-Z0-9]{12}$/, bankCodeStart: 4, bankCodeEnd: 9, accountNumberStart: 9, accountNumberEnd: 21 },
  LT: { countryCode: 'LT', totalLength: 20, bbanPattern: /^\d{16}$/, bankCodeStart: 4, bankCodeEnd: 9, accountNumberStart: 9, accountNumberEnd: 20 },
  LU: { countryCode: 'LU', totalLength: 20, bbanPattern: /^\d{3}[A-Z0-9]{13}$/, bankCodeStart: 4, bankCodeEnd: 7, accountNumberStart: 7, accountNumberEnd: 20 },
  MT: { countryCode: 'MT', totalLength: 31, bbanPattern: /^[A-Z]{4}\d{5}[A-Z0-9]{18}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 13, accountNumberEnd: 31 },
  MC: { countryCode: 'MC', totalLength: 27, bbanPattern: /^\d{10}[A-Z0-9]{11}\d{2}$/, bankCodeStart: 4, bankCodeEnd: 9, accountNumberStart: 14, accountNumberEnd: 25 },
  NL: { countryCode: 'NL', totalLength: 18, bbanPattern: /^[A-Z]{4}\d{10}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 8, accountNumberEnd: 18 },
  NO: { countryCode: 'NO', totalLength: 15, bbanPattern: /^\d{11}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 8, accountNumberEnd: 15 },
  PL: { countryCode: 'PL', totalLength: 28, bbanPattern: /^\d{24}$/, bankCodeStart: 4, bankCodeEnd: 12, accountNumberStart: 12, accountNumberEnd: 28 },
  PT: { countryCode: 'PT', totalLength: 25, bbanPattern: /^\d{21}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 12, accountNumberEnd: 23 },
  RO: { countryCode: 'RO', totalLength: 24, bbanPattern: /^[A-Z]{4}[A-Z0-9]{16}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 8, accountNumberEnd: 24 },
  SA: { countryCode: 'SA', totalLength: 24, bbanPattern: /^\d{2}[A-Z0-9]{18}$/, bankCodeStart: 4, bankCodeEnd: 6, accountNumberStart: 6, accountNumberEnd: 24 },
  ES: { countryCode: 'ES', totalLength: 24, bbanPattern: /^\d{20}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 14, accountNumberEnd: 24 },
  SE: { countryCode: 'SE', totalLength: 24, bbanPattern: /^\d{20}$/, bankCodeStart: 4, bankCodeEnd: 7, accountNumberStart: 7, accountNumberEnd: 23 },
  CH: { countryCode: 'CH', totalLength: 21, bbanPattern: /^\d{5}[A-Z0-9]{12}$/, bankCodeStart: 4, bankCodeEnd: 9, accountNumberStart: 9, accountNumberEnd: 21 },
  AE: { countryCode: 'AE', totalLength: 23, bbanPattern: /^\d{3}\d{16}$/, bankCodeStart: 4, bankCodeEnd: 7, accountNumberStart: 7, accountNumberEnd: 23 },
  GB: { countryCode: 'GB', totalLength: 22, bbanPattern: /^[A-Z]{4}\d{14}$/, bankCodeStart: 4, bankCodeEnd: 8, accountNumberStart: 14, accountNumberEnd: 22 },
};

/**
 * Validates International Bank Account Number (IBAN) with Mod-97 checksum calculation
 */
export function validateIban(iban: string): { isValid: boolean; countryCode?: string; bankCode?: string; error?: string } {
  const clean = iban.replace(/[\s-]/g, '').toUpperCase();
  if (clean.length < 5) return { isValid: false, error: 'IBAN too short' };

  const country = clean.slice(0, 2);
  const spec = IBAN_REGISTRY[country];

  if (!spec) {
    // Unknown country code
    return { isValid: false, error: `Unsupported or invalid country code: ${country}` };
  }

  if (clean.length !== spec.totalLength) {
    return { isValid: false, error: `Invalid length for ${country} IBAN. Expected ${spec.totalLength}, got ${clean.length}` };
  }

  const bban = clean.slice(4);
  if (!spec.bbanPattern.test(bban)) {
    return { isValid: false, error: `BBAN format pattern mismatch for ${country}` };
  }

  // Mod-97 validation
  // Rearrange: move the first four characters to the end of the string
  const rearranged = clean.slice(4) + clean.slice(0, 4);

  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      numericString += (code - 55).toString();
    } else if (code >= 48 && code <= 57) {
      numericString += rearranged.charAt(i);
    } else {
      return { isValid: false, error: 'Invalid character in IBAN' };
    }
  }

  // Piecewise Mod-97 for arbitrary length integer string
  let remainder = 0;
  for (let i = 0; i < numericString.length; i += 7) {
    const chunk = remainder.toString() + numericString.slice(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }

  if (remainder !== 1) {
    return { isValid: false, error: 'IBAN Mod-97 checksum validation failed' };
  }

  const bankCode = clean.slice(spec.bankCodeStart, spec.bankCodeEnd);
  return { isValid: true, countryCode: country, bankCode };
}

/**
 * Validates ISO 9362 Business Identifier Code (BIC / SWIFT)
 */
export function validateBic(bic: string): boolean {
  const clean = bic.trim().toUpperCase();
  // 8 or 11 characters: 4 letters bank, 2 letters country, 2 alphanumeric location, optional 3 alphanumeric branch
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(clean);
}
