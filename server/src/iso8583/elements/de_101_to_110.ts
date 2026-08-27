/**
 * ISO 8583 Data Elements: DE 101 through DE 110
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

export const DE_GROUP_11_SPECS: Record<number, IsoDataElementSpec> = {
  101: {
    fieldNumber: 101,
    name: 'Data Element 101 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 101 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  102: {
    fieldNumber: 102,
    name: 'Data Element 102 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 102 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  103: {
    fieldNumber: 103,
    name: 'Data Element 103 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 103 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  104: {
    fieldNumber: 104,
    name: 'Data Element 104 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 104 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  105: {
    fieldNumber: 105,
    name: 'Data Element 105 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 105 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  106: {
    fieldNumber: 106,
    name: 'Data Element 106 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 106 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  107: {
    fieldNumber: 107,
    name: 'Data Element 107 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 107 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  108: {
    fieldNumber: 108,
    name: 'Data Element 108 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 108 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  109: {
    fieldNumber: 109,
    name: 'Data Element 109 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 109 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  110: {
    fieldNumber: 110,
    name: 'Data Element 110 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 110 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
};
