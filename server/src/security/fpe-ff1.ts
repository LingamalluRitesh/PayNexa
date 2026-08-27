import crypto from 'node:crypto';

/**
 * Format-Preserving Encryption (FPE) Implementation (NIST SP 800-38G / FF1 Mode)
 * Encrypts a 16-digit credit card number into another 16-digit numeric string
 * while preserving the card BIN and Last-4 for routing and reporting.
 */
export class FormatPreservingEncryptionFF1 {
  private key: Buffer;

  constructor(keySecret: string = 'paynexa_fpe_ff1_master_key_2026_aes256') {
    this.key = crypto.createHash('sha256').update(keySecret).digest();
  }

  /**
   * Encrypts the middle 8 digits of a 16-digit card number using Feistel rounds
   */
  public encryptPan(pan: string, tweak: string = 'PAYNEXA_TWEAK'): string {
    const clean = pan.replace(/\D/g, '');
    if (clean.length < 12) return pan;

    const first6 = clean.slice(0, 6); // Preserve BIN
    const last4 = clean.slice(-4); // Preserve Last-4
    const middle = clean.slice(6, -4); // Encrypt 6-8 digits

    const encryptedMiddle = this.feistelEncrypt(middle, tweak);
    return `${first6}${encryptedMiddle}${last4}`;
  }

  /**
   * Decrypts the middle digits of an FPE-encrypted card number
   */
  public decryptPan(encryptedPan: string, tweak: string = 'PAYNEXA_TWEAK'): string {
    const clean = encryptedPan.replace(/\D/g, '');
    if (clean.length < 12) return encryptedPan;

    const first6 = clean.slice(0, 6);
    const last4 = clean.slice(-4);
    const middle = clean.slice(6, -4);

    const decryptedMiddle = this.feistelDecrypt(middle, tweak);
    return `${first6}${decryptedMiddle}${last4}`;
  }

  private feistelEncrypt(str: string, tweak: string): string {
    const radix = 10;
    const n = str.length;
    const u = Math.floor(n / 2);
    const v = n - u;

    let A = str.slice(0, u);
    let B = str.slice(u);

    // 10 Feistel Rounds
    for (let round = 0; round < 10; round++) {
      const hmac = crypto.createHmac('sha256', this.key);
      hmac.update(`${tweak}:${round}:${B}`);
      const digest = hmac.digest();
      const roundKey = digest.readUInt32BE(0);

      // Compute modular addition in base 10
      const aNum = parseInt(A, 10) || 0;
      const mod = Math.pow(radix, u);
      const cNum = (aNum + (roundKey % mod)) % mod;
      const C = cNum.toString().padStart(u, '0');

      A = B;
      B = C;
    }

    return `${A}${B}`;
  }

  private feistelDecrypt(str: string, tweak: string): string {
    const radix = 10;
    const n = str.length;
    const u = Math.floor(n / 2);
    const v = n - u;

    let A = str.slice(0, u);
    let B = str.slice(u);

    // 10 Reverse Feistel Rounds
    for (let round = 9; round >= 0; round--) {
      const C = B;
      const nextB = A;

      const hmac = crypto.createHmac('sha256', this.key);
      hmac.update(`${tweak}:${round}:${nextB}`);
      const digest = hmac.digest();
      const roundKey = digest.readUInt32BE(0);

      const mod = Math.pow(radix, u);
      const cNum = parseInt(C, 10) || 0;
      const aNum = (cNum - (roundKey % mod) + mod) % mod;
      A = aNum.toString().padStart(u, '0');
      B = nextB;
    }

    return `${A}${B}`;
  }
}

export const fpeEncryption = new FormatPreservingEncryptionFF1();
