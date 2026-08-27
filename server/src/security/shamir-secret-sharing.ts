import crypto from 'node:crypto';

/**
 * Shamir's (k, n) Threshold Secret Sharing Scheme over Galois Field GF(256)
 * Used for multi-custody quorum authorization of critical master cryptographic keys.
 */
export class ShamirSecretSharing {
  // Irreducible polynomial for AES GF(2^8): x^8 + x^4 + x^3 + x + 1 (0x11B)
  private readonly EXP: number[] = new Array(512);
  private readonly LOG: number[] = new Array(256);

  constructor() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      this.EXP[i] = x;
      this.EXP[i + 255] = x;
      this.LOG[x] = i;
      x = (x << 1) ^ (x & 0x80 ? 0x11b : 0);
    }
    this.LOG[0] = 0;
  }

  private gfMul(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.EXP[this.LOG[a] + this.LOG[b]];
  }

  private gfDiv(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero in GF(256)');
    if (a === 0) return 0;
    return this.EXP[this.LOG[a] - this.LOG[b] + 255];
  }

  /**
   * Splits a secret string into n shares requiring at least k shares to reconstruct
   */
  public split(secret: string, totalShares: number = 5, threshold: number = 3): string[] {
    if (threshold > totalShares || threshold < 2) {
      throw new Error(`Invalid threshold ${threshold} for ${totalShares} total shares`);
    }

    const secretBytes = Buffer.from(secret, 'utf8');
    const shares: number[][] = Array.from({ length: totalShares }, () => []);

    for (let i = 0; i < secretBytes.length; i++) {
      const s = secretBytes[i];
      // Coefficients for polynomial f(x) = s + a1*x + a2*x^2 + ... + a_{k-1}*x^{k-1}
      const coeffs = [s];
      for (let c = 1; c < threshold; c++) {
        coeffs.push(crypto.randomBytes(1)[0]);
      }

      // Evaluate at x = 1, 2, ..., totalShares
      for (let x = 1; x <= totalShares; x++) {
        let y = 0;
        let xPower = 1;
        for (let c = 0; c < threshold; c++) {
          y ^= this.gfMul(coeffs[c], xPower);
          xPower = this.gfMul(xPower, x);
        }
        shares[x - 1].push(y);
      }
    }

    return shares.map((shareBytes, idx) => {
      const x = idx + 1;
      const hex = Buffer.from(shareBytes).toString('hex');
      return `${x.toString(16).padStart(2, '0')}-${hex}`;
    });
  }

  /**
   * Reconstructs the original secret using Lagrange polynomial interpolation
   */
  public combine(shares: string[]): string {
    if (shares.length < 2) {
      throw new Error('At least 2 shares required for reconstruction');
    }

    const parsedShares = shares.map((s) => {
      const [xHex, dataHex] = s.split('-');
      return {
        x: parseInt(xHex, 16),
        bytes: Buffer.from(dataHex, 'hex'),
      };
    });

    const secretLen = parsedShares[0].bytes.length;
    const reconstructed: number[] = [];

    for (let i = 0; i < secretLen; i++) {
      let secretByte = 0;

      for (let j = 0; j < parsedShares.length; j++) {
        const { x: xj, bytes: bytesJ } = parsedShares[j];
        const yj = bytesJ[i];

        let numerator = 1;
        let denominator = 1;

        for (let m = 0; m < parsedShares.length; m++) {
          if (m === j) continue;
          const { x: xm } = parsedShares[m];
          numerator = this.gfMul(numerator, xm);
          denominator = this.gfMul(denominator, xj ^ xm);
        }

        const lagrangeBasis = this.gfDiv(numerator, denominator);
        secretByte ^= this.gfMul(yj, lagrangeBasis);
      }

      reconstructed.push(secretByte);
    }

    return Buffer.from(reconstructed).toString('utf8');
  }
}

export const shamir = new ShamirSecretSharing();
