/**
 * ISO 8583 Data Elements: DE 61 through DE 70
 * Standard: ISO 8583:1987 / 1993 Financial Transaction Card Originated Messages
 */

export interface IsoDataElementSpec {
  fieldNumber: number;
  name: string;
  format: 'FIXED' | 'LLVAR' | 'LLLVAR' | 'LLLLVAR';
  dataType: 'N' | 'A' | 'AN' | 'ANS' | 'B' | 'Z';
  maxLength: number;
  description: string;
  validator: (val: string) => boolean;
}

export const DE_GROUP_7_SPECS: Record<number, IsoDataElementSpec> = {
  61: {
    fieldNumber: 61,
    name: 'Data Element 61 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 61 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  62: {
    fieldNumber: 62,
    name: 'Data Element 62 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 62 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  63: {
    fieldNumber: 63,
    name: 'Data Element 63 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 63 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  64: {
    fieldNumber: 64,
    name: 'Data Element 64 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 64 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  65: {
    fieldNumber: 65,
    name: 'Data Element 65 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 65 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  66: {
    fieldNumber: 66,
    name: 'Data Element 66 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 66 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  67: {
    fieldNumber: 67,
    name: 'Data Element 67 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 67 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  68: {
    fieldNumber: 68,
    name: 'Data Element 68 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 68 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  69: {
    fieldNumber: 69,
    name: 'Data Element 69 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 69 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  70: {
    fieldNumber: 70,
    name: 'Data Element 70 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 70 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
};
