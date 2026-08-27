/**
 * ISO 8583 Data Elements: DE 1 through DE 10
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

export const DE_GROUP_1_SPECS: Record<number, IsoDataElementSpec> = {
  1: {
    fieldNumber: 1,
    name: 'Data Element 1 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 1 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  2: {
    fieldNumber: 2,
    name: 'Data Element 2 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 2 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  3: {
    fieldNumber: 3,
    name: 'Data Element 3 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 3 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  4: {
    fieldNumber: 4,
    name: 'Data Element 4 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 4 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  5: {
    fieldNumber: 5,
    name: 'Data Element 5 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 5 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  6: {
    fieldNumber: 6,
    name: 'Data Element 6 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 6 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  7: {
    fieldNumber: 7,
    name: 'Data Element 7 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 7 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  8: {
    fieldNumber: 8,
    name: 'Data Element 8 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 8 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  9: {
    fieldNumber: 9,
    name: 'Data Element 9 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 9 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  10: {
    fieldNumber: 10,
    name: 'Data Element 10 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 10 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
};
