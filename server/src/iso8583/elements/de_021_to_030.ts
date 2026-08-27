/**
 * ISO 8583 Data Elements: DE 21 through DE 30
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

export const DE_GROUP_3_SPECS: Record<number, IsoDataElementSpec> = {
  21: {
    fieldNumber: 21,
    name: 'Data Element 21 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 21 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  22: {
    fieldNumber: 22,
    name: 'Data Element 22 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 22 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  23: {
    fieldNumber: 23,
    name: 'Data Element 23 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 23 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  24: {
    fieldNumber: 24,
    name: 'Data Element 24 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 24 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  25: {
    fieldNumber: 25,
    name: 'Data Element 25 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 25 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  26: {
    fieldNumber: 26,
    name: 'Data Element 26 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 26 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  27: {
    fieldNumber: 27,
    name: 'Data Element 27 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 27 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  28: {
    fieldNumber: 28,
    name: 'Data Element 28 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 28 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  29: {
    fieldNumber: 29,
    name: 'Data Element 29 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 29 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  30: {
    fieldNumber: 30,
    name: 'Data Element 30 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 30 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
};
