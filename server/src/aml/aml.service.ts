import crypto from 'node:crypto';
import { db } from '../database/database.js';

export interface SanctionEntry {
  id: string;
  name: string;
  aliases: string[];
  entityType: 'INDIVIDUAL' | 'ORGANISATION' | 'VESSEL';
  programs: string[]; // e.g. ["SDGT", "UKRAINE-EO14024", "IRAN"]
  country: string;
  remarks?: string;
}

export interface AmlScreeningResult {
  isMatch: boolean;
  matchScore: number; // 0 - 100
  matchedEntry?: SanctionEntry;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED_SANCTION';
  flags: string[];
  screeningId: string;
  screenedAt: string;
}

export interface SuspiciousActivityReport {
  id: string;
  customerId: string;
  narrative: string;
  totalInvolvedAmountCents: number;
  indicators: string[]; // e.g. "STRUCTURING_UNDER_10K", "RAPID_VELOCITY", "SANCTIONS_PROXIMITY"
  status: 'DRAFT' | 'FILED_WITH_FINCEN';
  createdAt: string;
}

export class AmlSanctionsEngine {
  private sanctionsList: SanctionEntry[] = [
    {
      id: 'SDN_10492',
      name: 'Vladimir Borisovich Petrov',
      aliases: ['V. Petrov', 'Vladimir Petrov'],
      entityType: 'INDIVIDUAL',
      programs: ['RUSSIA-EO14024'],
      country: 'RU',
    },
    {
      id: 'SDN_28419',
      name: 'Quds Cyber Operations Directorate',
      aliases: ['QCOD Labs', 'Quds Cyber Force'],
      entityType: 'ORGANISATION',
      programs: ['IRAN-CYBER'],
      country: 'IR',
    },
    {
      id: 'SDN_39140',
      name: 'Gold Coast Trade Intermediaries Ltd',
      aliases: ['Gold Coast Commodities'],
      entityType: 'ORGANISATION',
      programs: ['SDGT', 'ILLICIT-FINANCE'],
      country: 'AE',
    },
  ];

  /**
   * Jaro-Winkler String Distance Metric for Fuzzy Name Matching
   */
  public calculateJaroWinkler(s1: string, s2: string): number {
    const a = s1.toLowerCase().trim();
    const b = s2.toLowerCase().trim();
    if (a === b) return 1.0;
    if (!a.length || !b.length) return 0.0;

    const matchDistance = Math.floor(Math.max(a.length, b.length) / 2) - 1;
    const aMatches = new Array(a.length).fill(false);
    const bMatches = new Array(b.length).fill(false);

    let matches = 0;
    for (let i = 0; i < a.length; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, b.length);
      for (let j = start; j < end; j++) {
        if (!bMatches[j] && a[i] === b[j]) {
          aMatches[i] = true;
          bMatches[j] = true;
          matches++;
          break;
        }
      }
    }

    if (matches === 0) return 0.0;

    let transpositions = 0;
    let k = 0;
    for (let i = 0; i < a.length; i++) {
      if (aMatches[i]) {
        while (!bMatches[k]) k++;
        if (a[i] !== b[k]) transpositions++;
        k++;
      }
    }

    const weight =
      (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3;

    // Common prefix scaling (up to 4 chars)
    let prefix = 0;
    for (let i = 0; i < Math.min(4, a.length, b.length); i++) {
      if (a[i] === b[i]) prefix++;
      else break;
    }

    const jaroWinkler = weight + prefix * 0.1 * (1 - weight);
    return Math.min(1.0, Math.max(0.0, jaroWinkler));
  }

  /**
   * Screens a party name against global sanctions and PEP registries
   */
  public screenName(name: string): AmlScreeningResult {
    const screeningId = `aml_${crypto.randomUUID()}`;
    let highestScore = 0;
    let bestMatch: SanctionEntry | undefined;

    for (const entry of this.sanctionsList) {
      const directScore = this.calculateJaroWinkler(name, entry.name);
      if (directScore > highestScore) {
        highestScore = directScore;
        bestMatch = entry;
      }

      for (const alias of entry.aliases) {
        const aliasScore = this.calculateJaroWinkler(name, alias);
        if (aliasScore > highestScore) {
          highestScore = aliasScore;
          bestMatch = entry;
        }
      }
    }

    const scorePercentage = Math.round(highestScore * 100);
    const flags: string[] = [];

    let riskCategory: AmlScreeningResult['riskCategory'] = 'LOW';

    if (scorePercentage >= 88) {
      riskCategory = 'BLOCKED_SANCTION';
      flags.push(`Exact or near-exact match (${scorePercentage}%) with SDN: ${bestMatch?.name} [${bestMatch?.programs.join(', ')}]`);
    } else if (scorePercentage >= 70) {
      riskCategory = 'HIGH';
      flags.push(`Potential phonetic match (${scorePercentage}%) requiring enhanced due diligence`);
    }

    return {
      isMatch: riskCategory === 'BLOCKED_SANCTION',
      matchScore: scorePercentage,
      matchedEntry: riskCategory !== 'LOW' ? bestMatch : undefined,
      riskCategory,
      flags,
      screeningId,
      screenedAt: new Date().toISOString(),
    };
  }

  /**
   * Structuring & Smurfing Pattern Detector (Multiple transactions just under $10,000 threshold)
   */
  public detectStructuring(customerId: string, windowHours: number = 48): {
    isStructuringDetected: boolean;
    totalAmountCents: number;
    transactionCount: number;
    sarRecommended: boolean;
  } {
    const windowStart = new Date(Date.now() - windowHours * 3600 * 1000).toISOString();
    const customerIntents = db.table('paymentIntents').find(
      (pi) => pi.customerId === customerId && pi.status === 'SUCCEEDED' && pi.createdAt >= windowStart
    );

    // Look for transactions between $8,000 and $9,999.99 (800,000 - 999,999 cents)
    const suspiciousIntents = customerIntents.filter(
      (pi) => pi.amountCents >= 800000 && pi.amountCents <= 999999
    );

    const totalAmountCents = suspiciousIntents.reduce((sum, pi) => sum + pi.amountCents, 0);

    const isStructuringDetected = suspiciousIntents.length >= 2;
    const sarRecommended = isStructuringDetected && totalAmountCents >= 1800000;

    return {
      isStructuringDetected,
      totalAmountCents,
      transactionCount: suspiciousIntents.length,
      sarRecommended,
    };
  }
}

export const amlEngine = new AmlSanctionsEngine();
