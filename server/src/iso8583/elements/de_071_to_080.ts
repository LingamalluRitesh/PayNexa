/**
 * ISO 8583 Data Elements: DE 71 through DE 80
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

export const DE_GROUP_8_SPECS: Record<number, IsoDataElementSpec> = {
  71: {
    fieldNumber: 71,
    name: 'Data Element 71 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 71 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  72: {
    fieldNumber: 72,
    name: 'Data Element 72 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 72 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  73: {
    fieldNumber: 73,
    name: 'Data Element 73 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 73 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  74: {
    fieldNumber: 74,
    name: 'Data Element 74 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 74 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  75: {
    fieldNumber: 75,
    name: 'Data Element 75 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 75 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  76: {
    fieldNumber: 76,
    name: 'Data Element 76 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 76 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  77: {
    fieldNumber: 77,
    name: 'Data Element 77 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 77 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  78: {
    fieldNumber: 78,
    name: 'Data Element 78 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 78 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  79: {
    fieldNumber: 79,
    name: 'Data Element 79 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 79 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  80: {
    fieldNumber: 80,
    name: 'Data Element 80 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 80 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
};
