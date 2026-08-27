/**
 * ISO 8583 Message Type Identifier (MTI) Specifications
 * 4-digit code: Version (Pos 1), Class (Pos 2), Function (Pos 3), Origin (Pos 4)
 */

export enum Iso8583Version {
  V1987 = '0',
  V1993 = '1',
  V2003 = '2',
  PRIVATE = '9',
}

export enum Iso8583Class {
  AUTHORIZATION = '1',
  FINANCIAL = '2',
  FILE_ACTIONS = '3',
  REVERSAL_CHARGEBACK = '4',
  RECONCILIATION = '5',
  ADMINISTRATIVE = '6',
  FEE_COLLECTION = '7',
  NETWORK_MANAGEMENT = '8',
  RESERVED = '9',
}

export enum Iso8583Function {
  REQUEST = '0',
  REQUEST_RESPONSE = '1',
  ADVICE = '2',
  ADVICE_RESPONSE = '3',
  NOTIFICATION = '4',
  NOTIFICATION_ACK = '5',
  INSTRUCTION = '6',
  INSTRUCTION_ACK = '7',
  RESERVED = '8',
}

export enum Iso8583Origin {
  ACQUIRER = '0',
  ACQUIRER_REPEAT = '1',
  ISSUER = '2',
  ISSUER_REPEAT = '3',
  OTHER = '4',
  OTHER_REPEAT = '5',
}

export interface MtiAnalysis {
  mti: string;
  version: string;
  class: string;
  function: string;
  origin: string;
  description: string;
  isRequest: boolean;
  isResponse: boolean;
}

export const KNOWN_MTIS: Record<string, string> = {
  '0100': 'Authorization Request (Acquirer -> Issuer)',
  '0110': 'Authorization Response (Issuer -> Acquirer)',
  '0120': 'Authorization Advice',
  '0130': 'Authorization Advice Response',
  '0200': 'Financial Transaction Request (Purchase / Cash Advance)',
  '0210': 'Financial Transaction Response',
  '0220': 'Financial Transaction Advice',
  '0230': 'Financial Transaction Advice Response',
  '0400': 'Reversal Request (Timeout / Cancelled at POS)',
  '0410': 'Reversal Response',
  '0420': 'Reversal Advice',
  '0430': 'Reversal Advice Response',
  '0500': 'Batch Settlement / Reconciliation Request',
  '0510': 'Batch Settlement / Reconciliation Response',
  '0800': 'Network Management Request (Sign-on / Echo Test / Key Exchange)',
  '0810': 'Network Management Response',
  '0820': 'Network Management Advice (Cutover / Key Change)',
};

export function parseMti(mti: string): MtiAnalysis {
  if (!mti || mti.length !== 4) {
    throw new Error(`Invalid ISO 8583 MTI format: expected 4 characters, got ${mti}`);
  }

  const vChar = mti[0];
  const cChar = mti[1];
  const fChar = mti[2];
  const oChar = mti[3];

  let versionDesc = 'ISO 8583:1987';
  if (vChar === '1') versionDesc = 'ISO 8583:1993';
  else if (vChar === '2') versionDesc = 'ISO 8583:2003';
  else if (vChar === '9') versionDesc = 'Private / National';

  const isRequest = fChar === '0';
  const isResponse = fChar === '1';

  return {
    mti,
    version: versionDesc,
    class: cChar,
    function: fChar,
    origin: oChar,
    description: KNOWN_MTIS[mti] || `Custom MTI (${mti})`,
    isRequest,
    isResponse,
  };
}
