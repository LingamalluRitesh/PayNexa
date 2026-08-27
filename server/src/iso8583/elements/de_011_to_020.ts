/**
 * ISO 8583 Data Elements: DE 11 through DE 20
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

export const DE_GROUP_2_SPECS: Record<number, IsoDataElementSpec> = {
  11: {
    fieldNumber: 11,
    name: 'Data Element 11 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 11 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  12: {
    fieldNumber: 12,
    name: 'Data Element 12 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 12 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  13: {
    fieldNumber: 13,
    name: 'Data Element 13 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 13 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  14: {
    fieldNumber: 14,
    name: 'Data Element 14 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 14 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  15: {
    fieldNumber: 15,
    name: 'Data Element 15 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 15 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  16: {
    fieldNumber: 16,
    name: 'Data Element 16 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 16 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  17: {
    fieldNumber: 17,
    name: 'Data Element 17 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 17 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  18: {
    fieldNumber: 18,
    name: 'Data Element 18 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 18 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  19: {
    fieldNumber: 19,
    name: 'Data Element 19 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 19 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  20: {
    fieldNumber: 20,
    name: 'Data Element 20 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 20 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
};
