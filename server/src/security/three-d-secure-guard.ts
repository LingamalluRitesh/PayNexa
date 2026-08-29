/**
 * 3D Secure 2.0 (3DS2) Decision Engine & SCA Exemption Matrix.
 * Analyzes transaction risk factors and determines frictionless vs challenge authentication workflows.
 */

export interface Transaction3DSContext {
  transactionId: string;
  amountMinor: number;
  currency: string;
  cardBin: string;
  ipCountry: string;
  cardCountry: string;
  isRecurring: boolean;
  velocityPastHour: number;
  deviceFingerprintKnown: boolean;
}

export type ThreeDSDecision = "FRICTIONLESS_APPROVED" | "CHALLENGE_REQUIRED" | "HIGH_RISK_REJECTED";

export interface ThreeDSEvaluationResult {
  decision: ThreeDSDecision;
  riskScore: number;
  scaExemptionApplied?: "LOW_VALUE" | "TRA_EXEMPTION" | "MERCHANT_INITIATED";
  reasons: string[];
}

export class ThreeDSecureGuard {
  public evaluate(context: Transaction3DSContext): ThreeDSEvaluationResult {
    let riskScore = 0;
    const reasons: string[] = [];

    // Geolocation mismatch
    if (context.ipCountry !== context.cardCountry) {
      riskScore += 35;
      reasons.push("CROSS_BORDER_GEO_MISMATCH");
    }

    // Unknown device
    if (!context.deviceFingerprintKnown) {
      riskScore += 20;
      reasons.push("UNRECOGNIZED_DEVICE_FINGERPRINT");
    }

    // High velocity
    if (context.velocityPastHour > 5) {
      riskScore += 30;
      reasons.push("ELEVATED_HOURLY_VELOCITY");
    }

    // Extreme high value check
    if (context.amountMinor > 1000000) {
      // > $10,000
      riskScore += 25;
      reasons.push("LARGE_TICKET_TRANSACTION");
    }

    // Decision Logic
    if (riskScore >= 70) {
      return {
        decision: "HIGH_RISK_REJECTED",
        riskScore,
        reasons,
      };
    }

    // Check SCA Exemptions for Low Risk
    if (riskScore < 25) {
      if (context.isRecurring) {
        return {
          decision: "FRICTIONLESS_APPROVED",
          riskScore,
          scaExemptionApplied: "MERCHANT_INITIATED",
          reasons: ["SCA_EXEMPT_RECURRING"],
        };
      }

      if (context.amountMinor <= 3000) {
        // <= $30
        return {
          decision: "FRICTIONLESS_APPROVED",
          riskScore,
          scaExemptionApplied: "LOW_VALUE",
          reasons: ["SCA_EXEMPT_LOW_VALUE"],
        };
      }

      if (context.amountMinor <= 25000) {
        // <= $250 with low fraud rate
        return {
          decision: "FRICTIONLESS_APPROVED",
          riskScore,
          scaExemptionApplied: "TRA_EXEMPTION",
          reasons: ["SCA_EXEMPT_TRA_LOW_RISK"],
        };
      }
    }

    return {
      decision: "CHALLENGE_REQUIRED",
      riskScore,
      reasons: reasons.length > 0 ? reasons : ["STANDARD_3DS2_CHALLENGE"],
    };
  }
}
