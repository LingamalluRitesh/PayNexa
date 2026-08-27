/**
 * ISO 8583 Data Elements: DE 41 through DE 50
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

export const DE_GROUP_5_SPECS: Record<number, IsoDataElementSpec> = {
  41: {
    fieldNumber: 41,
    name: 'Data Element 41 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 41 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  42: {
    fieldNumber: 42,
    name: 'Data Element 42 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 42 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  43: {
    fieldNumber: 43,
    name: 'Data Element 43 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 43 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  44: {
    fieldNumber: 44,
    name: 'Data Element 44 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 44 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  45: {
    fieldNumber: 45,
    name: 'Data Element 45 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 45 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  46: {
    fieldNumber: 46,
    name: 'Data Element 46 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 46 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  47: {
    fieldNumber: 47,
    name: 'Data Element 47 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 47 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  48: {
    fieldNumber: 48,
    name: 'Data Element 48 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 48 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  49: {
    fieldNumber: 49,
    name: 'Data Element 49 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 49 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  50: {
    fieldNumber: 50,
    name: 'Data Element 50 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 50 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
};
