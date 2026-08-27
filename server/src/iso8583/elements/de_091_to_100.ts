/**
 * ISO 8583 Data Elements: DE 91 through DE 100
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

export const DE_GROUP_10_SPECS: Record<number, IsoDataElementSpec> = {
  91: {
    fieldNumber: 91,
    name: 'Data Element 91 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 91 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  92: {
    fieldNumber: 92,
    name: 'Data Element 92 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 92 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  93: {
    fieldNumber: 93,
    name: 'Data Element 93 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 93 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  94: {
    fieldNumber: 94,
    name: 'Data Element 94 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 94 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  95: {
    fieldNumber: 95,
    name: 'Data Element 95 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 95 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  96: {
    fieldNumber: 96,
    name: 'Data Element 96 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 96 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  97: {
    fieldNumber: 97,
    name: 'Data Element 97 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 97 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  98: {
    fieldNumber: 98,
    name: 'Data Element 98 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 98 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  99: {
    fieldNumber: 99,
    name: 'Data Element 99 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 99 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  100: {
    fieldNumber: 100,
    name: 'Data Element 100 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 100 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
};
