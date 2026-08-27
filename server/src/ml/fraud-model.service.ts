export interface RawTransactionFeatures {
  amountCents: number;
  currency: string;
  hourOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  isWeekend: boolean;
  userAgeDays: number;
  pastTransactionsCount30d: number;
  pastDisputesCount: number;
  velocityCount1h: number;
  velocityVolume1hCents: number;
  velocityCount24h: number;
  velocityVolume24hCents: number;
  isCrossBorder: boolean;
  mccRiskCoefficient: number; // 0.0 - 1.0
  deviceTrustScore: number; // 0.0 - 1.0
  cardPresent: boolean;
}

export interface ModelPrediction {
  fraudProbability: number; // 0.000 to 1.000
  calibratedRiskScore: number; // 0 to 100
  topAttributions: Array<{ feature: string; impact: number; description: string }>;
  modelConfidence: number;
}

export class MachineLearningFraudModel {
  /**
   * Gradient Boosted Decision Tree (GBDT) Ensemble Inference Simulator
   */
  public predict(features: RawTransactionFeatures): ModelPrediction {
    let logOdds = -2.8; // Base prior probability ~5.7% baseline fraud risk

    const attributions: Array<{ feature: string; impact: number; description: string }> = [];

    // Feature 1: High Velocity 1h
    if (features.velocityCount1h > 3) {
      const delta = 1.45;
      logOdds += delta;
      attributions.push({
        feature: 'velocityCount1h',
        impact: delta,
        description: `Rapid 1-hour transaction surge (${features.velocityCount1h} attempts)`,
      });
    }

    // Feature 2: High Amount Outlier
    if (features.amountCents > 500000) { // > $5,000
      const delta = 0.95;
      logOdds += delta;
      attributions.push({
        feature: 'amountCents',
        impact: delta,
        description: `High value transaction ($${(features.amountCents / 100).toFixed(2)})`,
      });
    }

    // Feature 3: Cross Border Mismatch
    if (features.isCrossBorder) {
      const delta = 0.72;
      logOdds += delta;
      attributions.push({
        feature: 'isCrossBorder',
        impact: delta,
        description: 'Cross-border issuance and IP geolocation discrepancy',
      });
    }

    // Feature 4: High Risk MCC (Gambling, Crypto, Luxury Watches)
    if (features.mccRiskCoefficient > 0.6) {
      const delta = 0.65;
      logOdds += delta;
      attributions.push({
        feature: 'mccRiskCoefficient',
        impact: delta,
        description: `Elevated merchant category risk index (${features.mccRiskCoefficient.toFixed(2)})`,
      });
    }

    // Feature 5: Untrusted / Altered Device
    if (features.deviceTrustScore < 0.3) {
      const delta = 1.1;
      logOdds += delta;
      attributions.push({
        feature: 'deviceTrustScore',
        impact: delta,
        description: 'Device fingerprint anomaly or proxy/VPN header detected',
      });
    }

    // Feature 6: Past Dispute History
    if (features.pastDisputesCount > 0) {
      const delta = 1.8;
      logOdds += delta;
      attributions.push({
        feature: 'pastDisputesCount',
        impact: delta,
        description: `Account has ${features.pastDisputesCount} prior dispute(s)`,
      });
    }

    // Feature 7: Long Tenure Account Discount
    if (features.userAgeDays > 180 && features.pastTransactionsCount30d > 5) {
      const delta = -1.2;
      logOdds += delta;
      attributions.push({
        feature: 'userTenureTrust',
        impact: delta,
        description: `Established account tenure (${features.userAgeDays} days) with consistent history`,
      });
    }

    // Sigmoid link function: P = 1 / (1 + exp(-logOdds))
    const fraudProbability = 1 / (1 + Math.exp(-logOdds));
    const calibratedRiskScore = Math.round(fraudProbability * 100);

    // Sort attributions by absolute impact magnitude
    attributions.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    return {
      fraudProbability: Number(fraudProbability.toFixed(4)),
      calibratedRiskScore,
      topAttributions: attributions.slice(0, 4),
      modelConfidence: 0.94,
    };
  }
}

export const mlFraudModel = new MachineLearningFraudModel();
