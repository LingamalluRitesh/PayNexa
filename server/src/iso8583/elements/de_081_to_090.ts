/**
 * ISO 8583 Data Elements: DE 81 through DE 90
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

export const DE_GROUP_9_SPECS: Record<number, IsoDataElementSpec> = {
  81: {
    fieldNumber: 81,
    name: 'Data Element 81 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 81 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  82: {
    fieldNumber: 82,
    name: 'Data Element 82 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 82 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  83: {
    fieldNumber: 83,
    name: 'Data Element 83 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 83 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  84: {
    fieldNumber: 84,
    name: 'Data Element 84 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 84 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  85: {
    fieldNumber: 85,
    name: 'Data Element 85 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 85 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  86: {
    fieldNumber: 86,
    name: 'Data Element 86 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 86 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  87: {
    fieldNumber: 87,
    name: 'Data Element 87 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 87 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
  88: {
    fieldNumber: 88,
    name: 'Data Element 88 - ISO 8583 Field Specification',
    format: 'LLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 88 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  89: {
    fieldNumber: 89,
    name: 'Data Element 89 - ISO 8583 Field Specification',
    format: 'LLLVAR',
    dataType: 'ANS',
    maxLength: 99,
    description: 'Financial message attribute DE 89 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 99,
  },
  90: {
    fieldNumber: 90,
    name: 'Data Element 90 - ISO 8583 Field Specification',
    format: 'FIXED',
    dataType: 'ANS',
    maxLength: 12,
    description: 'Financial message attribute DE 90 specification and formatting',
    validator: (val: string) => typeof val === 'string' && val.length <= 12,
  },
};
