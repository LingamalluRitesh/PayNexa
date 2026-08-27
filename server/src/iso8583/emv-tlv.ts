/**
 * EMV Chip BER-TLV (Tag-Length-Value) ASN.1 Parser & Builder
 * Compliant with EMV Book 3 / ISO 7816-4 specifications
 */

export interface EmvTlvTag {
  tag: string; // e.g. "9F26"
  tagDescription: string;
  length: number;
  valueHex: string;
  isConstructed: boolean;
  subTags?: EmvTlvTag[];
}

export const KNOWN_EMV_TAGS: Record<string, string> = {
  '4F': 'Application Identifier (AID)',
  '5A': 'Application Primary Account Number (PAN)',
  '5F20': 'Cardholder Name',
  '5F24': 'Application Expiration Date',
  '5F25': 'Application Effective Date',
  '5F28': 'Issuer Country Code',
  '5F2A': 'Transaction Currency Code',
  '5F34': 'Application PAN Sequence Number (PSN)',
  '82': 'Application Interchange Profile (AIP)',
  '84': 'Dedicated File (DF) Name',
  '8A': 'Authorization Response Code (ARC)',
  '95': 'Terminal Verification Results (TVR)',
  '9A': 'Transaction Date (YYMMDD)',
  '9C': 'Transaction Type',
  '9F02': 'Amount, Authorized (Numeric)',
  '9F03': 'Amount, Other (Numeric)',
  '9F10': 'Issuer Application Data (IAD)',
  '9F1A': 'Terminal Country Code',
  '9F26': 'Application Cryptogram (ARQC/TC/AAC)',
  '9F27': 'Cryptogram Information Data (CID)',
  '9F33': 'Terminal Capabilities',
  '9F34': 'Cardholder Verification Method (CVM) Results',
  '9F35': 'Terminal Type',
  '9F36': 'Application Transaction Counter (ATC)',
  '9F37': 'Unpredictable Number (UN)',
  '9F41': 'Transaction Sequence Counter',
};

export class EmvTlvParser {
  /**
   * Parses hex-encoded EMV BER-TLV bytes (DE 55) into structured Tag objects
   */
  public parse(hex: string): EmvTlvTag[] {
    const clean = hex.trim().replace(/\s/g, '').toUpperCase();
    const tags: EmvTlvTag[] = [];
    let offset = 0;

    while (offset < clean.length) {
      if (offset + 2 > clean.length) break;

      // 1. Parse Tag
      let tagHex = clean.slice(offset, offset + 2);
      offset += 2;

      const firstByte = parseInt(tagHex, 16);
      // If bottom 5 bits are all 1s (0x1F), tag is multi-byte
      if ((firstByte & 0x1F) === 0x1F) {
        while (offset < clean.length) {
          const nextByteHex = clean.slice(offset, offset + 2);
          tagHex += nextByteHex;
          offset += 2;
          const val = parseInt(nextByteHex, 16);
          // If bit 8 is 0, this is the last byte of the tag
          if ((val & 0x80) === 0) break;
        }
      }

      const isConstructed = (firstByte & 0x20) === 0x20;

      // 2. Parse Length
      if (offset + 2 > clean.length) break;
      let lenHex = clean.slice(offset, offset + 2);
      offset += 2;
      let length = parseInt(lenHex, 16);

      // Multi-byte length: if bit 8 is set
      if ((length & 0x80) === 0x80) {
        const numBytes = length & 0x7F;
        const fullLenHex = clean.slice(offset, offset + numBytes * 2);
        offset += numBytes * 2;
        length = parseInt(fullLenHex, 16);
      }

      // 3. Parse Value
      const valHex = clean.slice(offset, offset + length * 2);
      offset += length * 2;

      const tagDesc = KNOWN_EMV_TAGS[tagHex] || `Proprietary / Vendor Tag (${tagHex})`;

      const tagObj: EmvTlvTag = {
        tag: tagHex,
        tagDescription: tagDesc,
        length,
        valueHex: valHex,
        isConstructed,
      };

      if (isConstructed && valHex.length > 0) {
        tagObj.subTags = this.parse(valHex);
      }

      tags.push(tagObj);
    }

    return tags;
  }

  /**
   * Encodes a list of Tag objects into raw hex BER-TLV string for Field 55
   */
  public encode(tags: Array<{ tag: string; valueHex: string }>): string {
    let result = '';
    for (const t of tags) {
      const cleanVal = t.valueHex.replace(/\s/g, '').toUpperCase();
      const lengthBytes = cleanVal.length / 2;
      let lenHex = '';

      if (lengthBytes < 128) {
        lenHex = lengthBytes.toString(16).padStart(2, '0').toUpperCase();
      } else {
        const valLenHex = lengthBytes.toString(16);
        const numBytes = Math.ceil(valLenHex.length / 2);
        const prefix = (0x80 | numBytes).toString(16).toUpperCase();
        lenHex = `${prefix}${valLenHex.padStart(numBytes * 2, '0').toUpperCase()}`;
      }

      result += `${t.tag.toUpperCase()}${lenHex}${cleanVal}`;
    }
    return result;
  }
}

export const emvTlv = new EmvTlvParser();
