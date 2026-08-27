import crypto from 'node:crypto';
import { db } from '../database/database.js';
import { config } from '../config/index.js';
import {
  FraudRule,
  FraudAssessment,
  FraudDecision,
  RiskFactor,
  BlacklistEntry,
  CurrencyCode,
} from '@paynexa/core';

export class FraudEngineService {
  /**
   * Evaluates a payment intent or transaction against all fraud & risk rules
   */
  public evaluateTransaction(params: {
    paymentIntentId?: string;
    amountCents: number;
    currency: CurrencyCode;
    customerId?: string;
    ipAddress?: string;
    ipCountry?: string;
    cardCountry?: string;
    cardBin?: string;
    cardFingerprint?: string;
    email?: string;
    deviceFingerprint?: string;
  }): FraudAssessment {
    const factors: RiskFactor[] = [];
    let riskScore = 10; // Base background risk

    const rules = db.table('fraudRules').find((r) => r.isEnabled);
    const blacklist = db.table('blacklist').all();

    // 1. Blacklist Checks
    if (params.ipAddress) {
      const ipMatch = blacklist.find((b) => b.type === 'IP_ADDRESS' && b.value === params.ipAddress);
      if (ipMatch) {
        riskScore += 90;
        factors.push({
          ruleId: 'sys_bl_ip',
          ruleName: 'Blacklisted IP Address',
          riskPoints: 90,
          message: `IP ${params.ipAddress} is on the global fraud blacklist: ${ipMatch.reason}`,
        });
      }
    }

    if (params.email) {
      const emailMatch = blacklist.find((b) => b.type === 'EMAIL' && b.value.toLowerCase() === params.email?.toLowerCase());
      if (emailMatch) {
        riskScore += 90;
        factors.push({
          ruleId: 'sys_bl_email',
          ruleName: 'Blacklisted Email Address',
          riskPoints: 90,
          message: `Email is associated with confirmed fraud: ${emailMatch.reason}`,
        });
      }
    }

    if (params.cardBin) {
      const binMatch = blacklist.find((b) => b.type === 'CARD_BIN' && b.value === params.cardBin);
      if (binMatch) {
        riskScore += 80;
        factors.push({
          ruleId: 'sys_bl_bin',
          ruleName: 'High Risk Card BIN',
          riskPoints: 80,
          message: `Card BIN ${params.cardBin} is flagged for elevated chargeback risk`,
        });
      }
    }

    // 2. Velocity Checks (Recent transactions in time window)
    const windowSecs = config.FRAUD_VELOCITY_WINDOW_SECONDS;
    const windowStart = new Date(Date.now() - windowSecs * 1000).toISOString();

    const recentIntents = db.table('paymentIntents').find((pi) => {
      const isRecent = pi.createdAt >= windowStart;
      const isSameCustomer = Boolean(params.customerId && pi.customerId === params.customerId);
      const isSameIp = Boolean(params.ipAddress && pi.metadata?.ipAddress === params.ipAddress);
      return Boolean(isRecent && (isSameCustomer || isSameIp));
    });

    if (recentIntents.length >= config.FRAUD_VELOCITY_MAX_TX_COUNT) {
      riskScore += 45;
      factors.push({
        ruleId: 'sys_velocity_burst',
        ruleName: 'Rapid Transaction Velocity Burst',
        riskPoints: 45,
        message: `${recentIntents.length} transactions initiated within ${windowSecs} seconds`,
      });
    }

    // 3. Geo & IP Anomaly
    if (params.ipCountry && params.cardCountry && params.ipCountry !== params.cardCountry) {
      riskScore += 25;
      factors.push({
        ruleId: 'sys_geo_mismatch',
        ruleName: 'IP and Card Issuing Country Mismatch',
        riskPoints: 25,
        message: `Client IP Country (${params.ipCountry}) differs from Card Country (${params.cardCountry})`,
      });
    }

    // 4. High Transaction Amount
    const maxAmount = config.FRAUD_MAX_AMOUNT_USD_DEFAULT * 100;
    if (params.amountCents > maxAmount) {
      riskScore += 30;
      factors.push({
        ruleId: 'sys_high_amount',
        ruleName: 'High Value Single Transaction',
        riskPoints: 30,
        message: `Transaction value ($${params.amountCents / 100}) exceeds standard velocity ceiling ($${config.FRAUD_MAX_AMOUNT_USD_DEFAULT})`,
      });
    }

    // 5. Dynamic Configured Rules Evaluation
    for (const rule of rules) {
      if (rule.conditionType === 'AMOUNT_GREATER_THAN') {
        const threshold = Number(rule.thresholdValue);
        if (params.amountCents > threshold) {
          riskScore += rule.riskPoints;
          factors.push({
            ruleId: rule.id,
            ruleName: rule.name,
            riskPoints: rule.riskPoints,
            message: `Amount exceeds threshold ${threshold}`,
          });
        }
      }
    }

    // Clamp score between 0 and 100
    const finalScore = Math.min(100, Math.max(0, riskScore));

    // Decision Logic
    let decision: FraudDecision = 'APPROVE';
    if (finalScore >= config.FRAUD_AUTOMATIC_DECLINE_SCORE) {
      decision = 'DECLINE';
    } else if (finalScore >= config.FRAUD_AUTOMATIC_CHALLENGE_SCORE) {
      decision = 'CHALLENGE_3DS';
    } else if (finalScore >= 50) {
      decision = 'MANUAL_REVIEW';
    }

    const assessment: FraudAssessment = {
      id: `fraud_${crypto.randomUUID()}`,
      paymentIntentId: params.paymentIntentId,
      totalRiskScore: finalScore,
      decision,
      factors,
      evaluatedAt: new Date().toISOString(),
      ipAddress: params.ipAddress,
      ipCountry: params.ipCountry,
      cardCountry: params.cardCountry,
      deviceFingerprint: params.deviceFingerprint,
      isReviewed: false,
    };

    db.table('fraudAssessments').insert(assessment);
    return assessment;
  }

  public listRules(): FraudRule[] {
    return db.table('fraudRules').all();
  }

  public createRule(params: Omit<FraudRule, 'id' | 'createdAt'>): FraudRule {
    const rule: FraudRule = {
      ...params,
      id: `rule_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    return db.table('fraudRules').insert(rule);
  }

  public toggleRule(id: string): FraudRule {
    const rule = db.table('fraudRules').get(id);
    if (!rule) throw new Error(`Fraud rule not found: ${id}`);
    return db.table('fraudRules').update(id, { isEnabled: !rule.isEnabled });
  }

  public listAssessments(limit: number = 50): FraudAssessment[] {
    return db.table('fraudAssessments').all().slice(-limit).reverse();
  }

  public addBlacklistEntry(entry: Omit<BlacklistEntry, 'id' | 'createdAt'>): BlacklistEntry {
    const item: BlacklistEntry = {
      ...entry,
      id: `bl_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    return db.table('blacklist').insert(item);
  }

  public listBlacklist(): BlacklistEntry[] {
    return db.table('blacklist').all();
  }
}

export const fraudEngine = new FraudEngineService();
