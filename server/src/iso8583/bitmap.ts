/**
 * ISO 8583 Primary and Secondary 128-Bit Bitmap Handler
 */

export class Iso8583Bitmap {
  private bits: boolean[] = new Array(129).fill(false); // 1-indexed

  constructor(hexString?: string) {
    if (hexString) {
      this.decodeHex(hexString);
    }
  }

  public set(fieldNumber: number, value: boolean = true): void {
    if (fieldNumber < 1 || fieldNumber > 128) {
      throw new Error(`Field number ${fieldNumber} out of range [1, 128]`);
    }
    this.bits[fieldNumber] = value;
    // If any secondary bit (65-128) is set, bit 1 must be true
    if (fieldNumber > 64 && value) {
      this.bits[1] = true;
    }
  }

  public get(fieldNumber: number): boolean {
    if (fieldNumber < 1 || fieldNumber > 128) return false;
    return this.bits[fieldNumber] === true;
  }

  public hasSecondary(): boolean {
    return this.bits[1] === true;
  }

  public getActiveFields(): number[] {
    const active: number[] = [];
    const maxField = this.hasSecondary() ? 128 : 64;
    for (let i = 2; i <= maxField; i++) {
      if (this.bits[i]) {
        active.push(i);
      }
    }
    return active;
  }

  /**
   * Encodes bitmap as hexadecimal ASCII string (16 or 32 chars)
   */
  public toHex(): string {
    const isSecondary = this.hasSecondary();
    const length = isSecondary ? 128 : 64;
    let hex = '';

    for (let i = 1; i <= length; i += 4) {
      let nibble = 0;
      if (this.bits[i]) nibble |= 8;
      if (this.bits[i + 1]) nibble |= 4;
      if (this.bits[i + 2]) nibble |= 2;
      if (this.bits[i + 3]) nibble |= 1;
      hex += nibble.toString(16).toUpperCase();
    }

    return hex;
  }

  /**
   * Decodes hexadecimal ASCII string into bitmap state
   */
  public decodeHex(hex: string): void {
    const cleanHex = hex.trim().toUpperCase();
    this.bits.fill(false);

    for (let i = 0; i < cleanHex.length; i++) {
      const nibble = parseInt(cleanHex[i], 16);
      const baseBit = i * 4 + 1;
      if (baseBit > 128) break;

      this.bits[baseBit] = (nibble & 8) !== 0;
      this.bits[baseBit + 1] = (nibble & 4) !== 0;
      this.bits[baseBit + 2] = (nibble & 2) !== 0;
      this.bits[baseBit + 3] = (nibble & 1) !== 0;
    }
  }

  /**
   * Encodes as raw binary Buffer
   */
  public toBuffer(): Buffer {
    return Buffer.from(this.toHex(), 'hex');
  }
}
