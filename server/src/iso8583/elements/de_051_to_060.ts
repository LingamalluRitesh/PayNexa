/**
 * ISO 8583 Data Elements: DE 51 through DE 60
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

export const DE_GROUP_6_SPECS: Record<number, IsoDataElementSpec> = {
  51: {
    fieldNumber: 51,
    name: 'Data Element 51 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 51 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  52: {
    fieldNumber: 52,
    name: 'Data Element 52 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 52 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  53: {
    fieldNumber: 53,
    name: 'Data Element 53 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 53 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  54: {
    fieldNumber: 54,
    name: 'Data Element 54 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 54 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  55: {
    fieldNumber: 55,
    name: 'Data Element 55 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 55 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  56: {
    fieldNumber: 56,
    name: 'Data Element 56 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 56 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  57: {
    fieldNumber: 57,
    name: 'Data Element 57 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 57 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  58: {
    fieldNumber: 58,
    name: 'Data Element 58 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 58 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  59: {
    fieldNumber: 59,
    name: 'Data Element 59 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 59 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  60: {
    fieldNumber: 60,
    name: 'Data Element 60 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 60 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
};
