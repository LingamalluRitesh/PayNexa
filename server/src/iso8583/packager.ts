import { parseMti, MtiAnalysis } from './mti.js';
import { Iso8583Bitmap } from './bitmap.js';
import { ISO_8583_FIELDS, IsoFieldDefinition } from './fields.js';

export interface Iso8583Message {
  mti: string;
  mtiInfo?: MtiAnalysis;
  bitmap: Iso8583Bitmap;
  fields: Record<number, string>;
  rawMessage?: string;
}

export class Iso8583Packager {
  /**
   * Packs an ISO 8583 message object into an ASCII wire string
   */
  public pack(mti: string, fields: Record<number, string>): string {
    const bitmap = new Iso8583Bitmap();

    for (const [fieldStr, val] of Object.entries(fields)) {
      const fieldNum = parseInt(fieldStr, 10);
      if (val !== undefined && val !== null && val !== '') {
        bitmap.set(fieldNum, true);
      }
    }

    const bitmapHex = bitmap.toHex();
    let body = '';

    const activeFields = bitmap.getActiveFields();
    for (const fieldNum of activeFields) {
      const def = ISO_8583_FIELDS[fieldNum] || {
        fieldNumber: fieldNum,
        name: `DE ${fieldNum}`,
        format: 'LLVAR',
        type: 'ANS',
        maxLength: 99,
        description: '',
      };

      const rawVal = fields[fieldNum] || '';
      body += this.formatField(rawVal, def);
    }

    return `${mti}${bitmapHex}${body}`;
  }

  /**
   * Unpacks a raw ASCII ISO 8583 message wire string
   */
  public unpack(raw: string): Iso8583Message {
    if (raw.length < 20) {
      throw new Error(`ISO 8583 message too short: ${raw.length} chars`);
    }

    const mti = raw.slice(0, 4);
    const mtiInfo = parseMti(mti);

    // Primary bitmap is 16 hex chars (64 bits)
    const primaryHex = raw.slice(4, 20);
    const primaryBitmap = new Iso8583Bitmap(primaryHex);

    let offset = 20;
    let fullBitmapHex = primaryHex;

    if (primaryBitmap.hasSecondary()) {
      const secondaryHex = raw.slice(20, 36);
      fullBitmapHex = primaryHex + secondaryHex;
      offset = 36;
    }

    const bitmap = new Iso8583Bitmap(fullBitmapHex);
    const fields: Record<number, string> = {};

    const activeFields = bitmap.getActiveFields();
    for (const fieldNum of activeFields) {
      const def = ISO_8583_FIELDS[fieldNum] || {
        fieldNumber: fieldNum,
        name: `DE ${fieldNum}`,
        format: 'LLVAR',
        type: 'ANS',
        maxLength: 99,
        description: '',
      };

      const { value, bytesConsumed } = this.parseField(raw.slice(offset), def);
      fields[fieldNum] = value;
      offset += bytesConsumed;
    }

    return {
      mti,
      mtiInfo,
      bitmap,
      fields,
      rawMessage: raw,
    };
  }

  private formatField(val: string, def: IsoFieldDefinition): string {
    switch (def.format) {
      case 'FIXED':
        if (def.type === 'N') {
          return val.padStart(def.maxLength, '0').slice(-def.maxLength);
        }
        return val.padEnd(def.maxLength, ' ').slice(0, def.maxLength);
      case 'LLVAR': {
        const len = Math.min(val.length, def.maxLength);
        const lenPrefix = len.toString().padStart(2, '0');
        return `${lenPrefix}${val.slice(0, len)}`;
      }
      case 'LLLVAR': {
        const len = Math.min(val.length, def.maxLength);
        const lenPrefix = len.toString().padStart(3, '0');
        return `${lenPrefix}${val.slice(0, len)}`;
      }
      case 'LLLLVAR': {
        const len = Math.min(val.length, def.maxLength);
        const lenPrefix = len.toString().padStart(4, '0');
        return `${lenPrefix}${val.slice(0, len)}`;
      }
    }
  }

  private parseField(remaining: string, def: IsoFieldDefinition): { value: string; bytesConsumed: number } {
    switch (def.format) {
      case 'FIXED': {
        const val = remaining.slice(0, def.maxLength);
        return { value: val, bytesConsumed: def.maxLength };
      }
      case 'LLVAR': {
        const len = parseInt(remaining.slice(0, 2), 10);
        const val = remaining.slice(2, 2 + len);
        return { value: val, bytesConsumed: 2 + len };
      }
      case 'LLLVAR': {
        const len = parseInt(remaining.slice(0, 3), 10);
        const val = remaining.slice(3, 3 + len);
        return { value: val, bytesConsumed: 3 + len };
      }
      case 'LLLLVAR': {
        const len = parseInt(remaining.slice(0, 4), 10);
        const val = remaining.slice(4, 4 + len);
        return { value: val, bytesConsumed: 4 + len };
      }
    }
  }
}

export const iso8583 = new Iso8583Packager();
