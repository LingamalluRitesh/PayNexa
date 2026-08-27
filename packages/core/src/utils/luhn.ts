/**
 * Luhn Algorithm (Mod 10) Implementation for ISO/IEC 7812 Card Numbers
 */

/**
 * Validates whether a given Primary Account Number (PAN) passes the Luhn checksum
 */
export function isValidLuhn(pan: string): boolean {
  const sanitized = pan.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Computes the Luhn check digit for a given prefix string of digits
 */
export function calculateLuhnCheckDigit(prefixDigits: string): number {
  const sanitized = prefixDigits.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = true;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Generates a valid Luhn-compliant test PAN for virtual card issuing
 */
export function generateTestPan(brand: 'VISA' | 'MASTERCARD' = 'VISA'): string {
  // BIN Prefixes: Visa starts with 4, Mastercard with 51-55
  let prefix = brand === 'VISA' ? '4532' : '5241';
  // Generate random middle digits to reach 15 digits total
  while (prefix.length < 15) {
    prefix += Math.floor(Math.random() * 10).toString();
  }

  const checkDigit = calculateLuhnCheckDigit(prefix);
  return prefix + checkDigit.toString();
}

/**
 * Detects card brand from PAN prefix
 */
export function detectCardBrand(pan: string): 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER' | 'RUPAY' | 'UNKNOWN' {
  const clean = pan.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
  if (/^3[47]/.test(clean)) return 'AMEX';
  if (/^6(?:011|5)/.test(clean)) return 'DISCOVER';
  if (/^(508|60|65|81|82)/.test(clean)) return 'RUPAY';
  return 'UNKNOWN';
}
