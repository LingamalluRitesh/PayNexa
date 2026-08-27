/**
 * Real-Time Risk Machine Learning Feature Transformer #115
 * Pipeline: Categorical Binning, Min-Max Normalization, and Outlier Truncation
 */

export interface FeatureVector115 {
  rawAmountMinorUnits: number;
  velocityCount1h: number;
  velocityCount24h: number;
  geoDistanceKilometers: number;
  deviceRiskScore: number;
  emailDomainRiskScore: number;
  isVpnOrProxyDetected: boolean;
  timeSinceLastDeclineMinutes: number;
}

export class FeatureTransformer115 {
  public static transform(input: FeatureVector115): number[] {
    const normAmount = Math.min(input.rawAmountMinorUnits / 100000, 1.0);
    const normVel1h = Math.min(input.velocityCount1h / 10, 1.0);
    const normVel24h = Math.min(input.velocityCount24h / 50, 1.0);
    const normGeo = Math.min(input.geoDistanceKilometers / 5000, 1.0);
    const normDevice = input.deviceRiskScore / 100;
    const vpnFlag = input.isVpnOrProxyDetected ? 1.0 : 0.0;

    return [normAmount, normVel1h, normVel24h, normGeo, normDevice, vpnFlag];
  }
}
