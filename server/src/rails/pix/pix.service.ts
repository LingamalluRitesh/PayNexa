/**
 * Central Bank of Brazil (BACEN) Instant Payment (PIX) Engine
 * Compliant with EMVCo QR Code Specification (BRCode)
 */

export interface PixPaymentParams {
  pixKey: string; // CPF, CNPJ, Email, Phone (+55...), or EVP Random Key
  keyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';
  merchantName: string;
  merchantCity: string;
  amountReais?: number;
  transactionId?: string; // txid (up to 25 alphanumeric chars)
  description?: string;
}

export class PixRailEngine {
  /**
   * Generates a standard EMVCo BRCode PIX dynamic payload string (Payload Format Indicator: 01)
   */
  public generatePixQrPayload(params: PixPaymentParams): string {
    const payloadParts: Array<{ tag: string; value: string }> = [
      { tag: '00', value: '01' }, // Payload Format Indicator
      { tag: '01', value: '12' }, // Point of Initiation Method (12 = Dynamic QR, 11 = Static)
    ];

    // Merchant Account Information (Tag 26)
    const guiSubTag = this.formatTlv('00', 'br.gov.bcb.pix');
    const keySubTag = this.formatTlv('01', params.pixKey);
    const descSubTag = params.description ? this.formatTlv('02', params.description) : '';
    const merchantAccountInfo = `${guiSubTag}${keySubTag}${descSubTag}`;
    payloadParts.push({ tag: '26', value: merchantAccountInfo });

    // Merchant Category Code (Tag 52)
    payloadParts.push({ tag: '52', value: '0000' });

    // Transaction Currency (Tag 53: 986 = BRL)
    payloadParts.push({ tag: '53', value: '986' });

    // Transaction Amount (Tag 54)
    if (params.amountReais && params.amountReais > 0) {
      payloadParts.push({ tag: '54', value: params.amountReais.toFixed(2) });
    }

    // Country Code (Tag 58: BR)
    payloadParts.push({ tag: '58', value: 'BR' });

    // Merchant Name (Tag 59)
    payloadParts.push({ tag: '59', value: params.merchantName.slice(0, 25) });

    // Merchant City (Tag 60)
    payloadParts.push({ tag: '60', value: params.merchantCity.slice(0, 15) });

    // Additional Data Field Template (Tag 62)
    const txId = params.transactionId || '***';
    const txIdSubTag = this.formatTlv('05', txId);
    payloadParts.push({ tag: '62', value: txIdSubTag });

    // Assemble raw string without CRC
    let rawPayload = '';
    for (const p of payloadParts) {
      rawPayload += this.formatTlv(p.tag, p.value);
    }

    // Append Tag 63 (CRC16) header
    rawPayload += '6304';

    // Calculate CRC16-CCITT (Poly: 0x1021, Init: 0xFFFF)
    const crc = this.calculateCrc16(rawPayload);
    return `${rawPayload}${crc}`;
  }

  private formatTlv(tag: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${tag}${len}${value}`;
  }

  private calculateCrc16(str: string): string {
    let crc = 0xffff;
    const polynomial = 0x1021;

    for (let i = 0; i < str.length; i++) {
      const byte = str.charCodeAt(i);
      crc ^= byte << 8;
      for (let bit = 0; bit < 8; bit++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ polynomial) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
}

export const pixRail = new PixRailEngine();
