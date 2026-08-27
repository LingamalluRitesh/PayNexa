/**
 * ISO 8583 Data Elements: DE 111 through DE 120
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

export const DE_GROUP_12_SPECS: Record<number, IsoDataElementSpec> = {
  111: {
    fieldNumber: 111,
    name: 'Data Element 111 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 111 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  112: {
    fieldNumber: 112,
    name: 'Data Element 112 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 112 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  113: {
    fieldNumber: 113,
    name: 'Data Element 113 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 113 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  114: {
    fieldNumber: 114,
    name: 'Data Element 114 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 114 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  115: {
    fieldNumber: 115,
    name: 'Data Element 115 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 115 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  116: {
    fieldNumber: 116,
    name: 'Data Element 116 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 116 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  117: {
    fieldNumber: 117,
    name: 'Data Element 117 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 117 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  118: {
    fieldNumber: 118,
    name: 'Data Element 118 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 118 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  119: {
    fieldNumber: 119,
    name: 'Data Element 119 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 119 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  120: {
    fieldNumber: 120,
    name: 'Data Element 120 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 120 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
};
