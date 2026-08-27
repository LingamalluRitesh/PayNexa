/**
 * ISO 8583 Data Elements: DE 31 through DE 40
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

export const DE_GROUP_4_SPECS: Record<number, IsoDataElementSpec> = {
  31: {
    fieldNumber: 31,
    name: 'Data Element 31 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 31 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  32: {
    fieldNumber: 32,
    name: 'Data Element 32 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 32 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  33: {
    fieldNumber: 33,
    name: 'Data Element 33 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 33 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  34: {
    fieldNumber: 34,
    name: 'Data Element 34 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 34 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  35: {
    fieldNumber: 35,
    name: 'Data Element 35 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 35 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  36: {
    fieldNumber: 36,
    name: 'Data Element 36 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 36 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  37: {
    fieldNumber: 37,
    name: 'Data Element 37 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 37 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  38: {
    fieldNumber: 38,
    name: 'Data Element 38 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 38 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  39: {
    fieldNumber: 39,
    name: 'Data Element 39 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 39 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  40: {
    fieldNumber: 40,
    name: 'Data Element 40 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 40 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
};
