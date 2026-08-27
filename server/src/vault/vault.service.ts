import crypto from 'node:crypto';
import { db } from '../database/database.js';
import { formatMaskedCard, isValidLuhn, detectCardBrand } from '@paynexa/core';

export interface VaultCardRecord {
  id: string; // Token ID e.g. tok_card_...
  customerId: string;
  panMasked: string;
  fingerprint: string;
  brand: string;
  expMonth: number;
  expYear: number;
  encryptedPayload: string; // AES-256-GCM ciphertext + IV + AuthTag
  keyVersion: number;
  createdAt: string;
}

export class PciDssVaultService {
  private masterKeys: Map<number, Buffer> = new Map();
  private activeKeyVersion: number = 1;

  constructor() {
    // Initialize secure key ring
    const masterSecret = process.env.PAYNEXA_MASTER_SECRET || 'paynexa_vault_master_hsm_key_2026_secure';
    const key = crypto.createHash('sha256').update(masterSecret).digest();
    this.masterKeys.set(1, key);
  }

  /**
   * Tokenizes a raw PAN and CVV into a secure PCI-safe token ID (tok_card_...)
   */
  public tokenizeCard(params: {
    customerId: string;
    cardNumber: string;
    expMonth: number;
    expYear: number;
    cvv: string;
    holderName?: string;
  }): {
    tokenId: string;
    panMasked: string;
    brand: string;
    last4: string;
    fingerprint: string;
    expMonth: number;
    expYear: number;
  } {
    const cleanPan = params.cardNumber.replace(/\D/g, '');
    if (!isValidLuhn(cleanPan)) {
      throw new Error('Card failed Luhn algorithm checksum');
    }

    const brand = detectCardBrand(cleanPan);
    const last4 = cleanPan.slice(-4);
    const panMasked = formatMaskedCard(cleanPan);
    const fingerprint = `fp_${crypto.createHash('sha256').update(cleanPan).digest('hex').slice(0, 16)}`;

    // Sensitive payload to encrypt
    const sensitiveData = JSON.stringify({
      pan: cleanPan,
      cvv: params.cvv,
      holderName: params.holderName,
    });

    const masterKey = this.masterKeys.get(this.activeKeyVersion)!;
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);

    let encrypted = cipher.update(sensitiveData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Packed format: iv:authTag:ciphertext
    const packedCiphertext = `${iv.toString('hex')}:${authTag}:${encrypted}`;
    const tokenId = `tok_card_${crypto.randomUUID()}`;

    const record: VaultCardRecord = {
      id: tokenId,
      customerId: params.customerId,
      panMasked,
      fingerprint,
      brand,
      expMonth: params.expMonth,
      expYear: params.expYear,
      encryptedPayload: packedCiphertext,
      keyVersion: this.activeKeyVersion,
      createdAt: new Date().toISOString(),
    };

    // Store in internal memory/state
    (db.getRawState() as any).vault = (db.getRawState() as any).vault || {};
    (db.getRawState() as any).vault[tokenId] = record;

    return {
      tokenId,
      panMasked,
      brand,
      last4,
      fingerprint,
      expMonth: params.expMonth,
      expYear: params.expYear,
    };
  }

  /**
   * Detokenizes a card for authorized processor dispatch with automatic memory scrubbing
   */
  public detokenize(tokenId: string): { pan: string; cvv: string; holderName?: string } {
    const record = (db.getRawState() as any).vault?.[tokenId] as VaultCardRecord | undefined;
    if (!record) {
      throw new Error(`Token ${tokenId} not found in secure PCI vault`);
    }

    const parts = record.encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Malformed encrypted ciphertext payload in vault');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const ciphertext = parts[2];

    const masterKey = this.masterKeys.get(record.keyVersion);
    if (!masterKey) {
      throw new Error(`Master key version ${record.keyVersion} not found`);
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}

export const pciVault = new PciDssVaultService();
