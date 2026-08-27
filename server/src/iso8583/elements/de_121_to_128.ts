/**
 * ISO 8583 Data Elements: DE 121 through DE 128
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

export const DE_GROUP_13_SPECS: Record<number, IsoDataElementSpec> = {
  121: {
    fieldNumber: 121,
    name: 'Data Element 121 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 121 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  122: {
    fieldNumber: 122,
    name: 'Data Element 122 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 122 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  123: {
    fieldNumber: 123,
    name: 'Data Element 123 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 123 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  124: {
    fieldNumber: 124,
    name: 'Data Element 124 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 124 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  125: {
    fieldNumber: 125,
    name: 'Data Element 125 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 125 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  126: {
    fieldNumber: 126,
    name: 'Data Element 126 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 126 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  127: {
    fieldNumber: 127,
    name: 'Data Element 127 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 127 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  128: {
    fieldNumber: 128,
    name: 'Data Element 128 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 128 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
};
