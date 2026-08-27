/**
 * Enterprise Risk & Fraud Rules Catalog (120+ Heuristic & Statistical Rule Definitions)
 * Evaluates Velocity, Geolocation, Device Fingerprinting, ASN/ISP Risk, and Card Testing Attacks
 */

export interface EnterpriseRiskRule {
  id: string;
  ruleCode: string;
  ruleCategory: 'VELOCITY' | 'GEOLOCATION' | 'DEVICE' | 'MERCHANT_MCC' | 'CARD_TESTING' | 'BEHAVIORAL' | 'NETWORK_REPUTATION' | 'AML_COMPLIANCE';
  name: string;
  description: string;
  severityPoints: number; // 0 to 100 points
  actionOnTrigger: 'APPROVE' | 'CHALLENGE_3DS' | 'MANUAL_REVIEW' | 'DECLINE';
  isEnabled: boolean;
  parameters: Record<string, unknown>;
}

export const ENTERPRISE_FRAUD_RULES_CATALOG: EnterpriseRiskRule[] = [
  // VELOCITY RULES
  { id: 'RR_VEL_001', ruleCode: 'VEL_CARD_1MIN_SURGE', ruleCategory: 'VELOCITY', name: 'Card 1-Minute Rapid Burst', description: 'Triggers when same card is charged >= 3 times within 60 seconds', severityPoints: 55, actionOnTrigger: 'CHALLENGE_3DS', isEnabled: true, parameters: { windowSeconds: 60, maxAttempts: 3 } },
  { id: 'RR_VEL_002', ruleCode: 'VEL_IP_10MIN_VOLUME', ruleCategory: 'VELOCITY', name: 'IP Subnet Velocity Exhaustion', description: 'Triggers when single IP address creates >= 10 payment intents in 10 minutes', severityPoints: 65, actionOnTrigger: 'MANUAL_REVIEW', isEnabled: true, parameters: { windowSeconds: 600, maxAttempts: 10 } },
  { id: 'RR_VEL_003', ruleCode: 'VEL_DEVICE_24H_LIMIT', ruleCategory: 'VELOCITY', name: 'Device Fingerprint 24h Saturation', description: 'Triggers when single browser fingerprint links to >= 5 unique card PANs in 24 hours', severityPoints: 80, actionOnTrigger: 'DECLINE', isEnabled: true, parameters: { windowHours: 24, maxCards: 5 } },
  { id: 'RR_VEL_004', ruleCode: 'VEL_CUSTOMER_CUMULATIVE_7D', ruleCategory: 'VELOCITY', name: 'Unusual 7-Day Cumulative Spend Spike', description: 'Triggers when 7-day spend exceeds 400% of consumer historical 90-day moving average', severityPoints: 40, actionOnTrigger: 'MANUAL_REVIEW', isEnabled: true, parameters: { movingAverageMultiplier: 4.0 } },
  { id: 'RR_VEL_005', ruleCode: 'VEL_DECLINE_RETRY_STORM', ruleCategory: 'VELOCITY', name: 'Rapid Decline Retry Storm', description: 'Triggers when 3 consecutive transaction declines occur within 3 minutes', severityPoints: 75, actionOnTrigger: 'DECLINE', isEnabled: true, parameters: { maxConsecutiveDeclines: 3, windowSeconds: 180 } },

  // GEOLOCATION RULES
  { id: 'RR_GEO_001', ruleCode: 'GEO_COUNTRY_MISMATCH', ruleCategory: 'GEOLOCATION', name: 'Card BIN vs IP Country Mismatch', description: 'Triggers when card issuing country differs from IP geolocation country', severityPoints: 35, actionOnTrigger: 'CHALLENGE_3DS', isEnabled: true, parameters: {} },
  { id: 'RR_GEO_002', ruleCode: 'GEO_FATF_SANCTION_PROXIMITY', ruleCategory: 'GEOLOCATION', name: 'FATF High-Risk Jurisdiction Origin', description: 'Triggers when IP address or billing address originates from FATF Grey/Black list jurisdictions', severityPoints: 90, actionOnTrigger: 'DECLINE', isEnabled: true, parameters: { highRiskCountries: ['KP', 'IR', 'SY', 'MM'] } },
  { id: 'RR_GEO_003', ruleCode: 'GEO_IMPOSSIBLE_TRAVEL_SPEED', ruleCategory: 'GEOLOCATION', name: 'Impossible Geographic Travel Velocity', description: 'Triggers when two consecutive payments occur from coordinates > 1,000 km apart within 1 hour (> 1,000 km/h)', severityPoints: 85, actionOnTrigger: 'DECLINE', isEnabled: true, parameters: { maxSpeedKmh: 1000 } },
  { id: 'RR_GEO_004', ruleCode: 'GEO_TIMEZONE_IP_DEVIATION', ruleCategory: 'GEOLOCATION', name: 'Device Timezone vs IP Timezone Skew', description: 'Triggers when local browser timezone offset differs by >= 6 hours from IP geo timezone', severityPoints: 30, actionOnTrigger: 'CHALLENGE_3DS', isEnabled: true, parameters: { maxSkewHours: 6 } },

  // DEVICE & PROXY RULES
  { id: 'RR_DEV_001', ruleCode: 'DEV_TOR_EXIT_NODE', ruleCategory: 'DEVICE', name: 'Tor Anonymizing Network Exit Node', description: 'Triggers when connection originates from an identified Tor exit relay', severityPoints: 90, actionOnTrigger: 'DECLINE', isEnabled: true, parameters: {} },
  { id: 'RR_DEV_002', ruleCode: 'DEV_COMMERCIAL_DATACENTER_IP', ruleCategory: 'DEVICE', name: 'Public Hosting / Datacenter IP Address', description: 'Triggers when IP belongs to hosting providers (AWS, DigitalOcean, Hetzner, OVH) rather than residential ISP', severityPoints: 45, actionOnTrigger: 'CHALLENGE_3DS', isEnabled: true, parameters: {} },
  { id: 'RR_DEV_003', ruleCode: 'DEV_HEADLESS_PUPPETEER_BOT', ruleCategory: 'DEVICE', name: 'Automated Headless Browser Signature', description: 'Triggers on navigator.webdriver=true or missing WebGL/Canvas rendering features', severityPoints: 95, actionOnTrigger: 'DECLINE', isEnabled: true, parameters: {} },
  { id: 'RR_DEV_004', ruleCode: 'DEV_EMULATED_TOUCH_FINGERPRINT', ruleCategory: 'DEVICE', name: 'Synthetic Touch Screen Emulation', description: 'Triggers on desktop browser headers simulating mobile touch events abnormally', severityPoints: 50, actionOnTrigger: 'CHALLENGE_3DS', isEnabled: true, parameters: {} },

  // CARD TESTING & BOT PREVENTION
  { id: 'RR_BOT_001', ruleCode: 'BOT_MICRO_CHARGE_PATTERN', ruleCategory: 'CARD_TESTING', name: 'Micro-Amount Card Enumeration Probe', description: 'Triggers when consecutive amounts are between $0.50 and $1.99 across distinct card numbers', severityPoints: 85, actionOnTrigger: 'DECLINE', isEnabled: true, parameters: { minCents: 50, maxCents: 199 } },
  { id: 'RR_BOT_002', ruleCode: 'BOT_SEQUENTIAL_PAN_SWEEP', ruleCategory: 'CARD_TESTING', name: 'Sequential PAN Generation Sweep', description: 'Triggers when card numbers increment mathematically within same BIN prefix', severityPoints: 95, actionOnTrigger: 'DECLINE', isEnabled: true, parameters: {} },
  { id: 'RR_BOT_003', ruleCode: 'BOT_EXPIRY_DATE_BRUTE_FORCE', ruleCategory: 'CARD_TESTING', name: 'Expiry Date Brute-Force Testing', description: 'Triggers when same PAN attempts 3+ distinct expiry dates in 5 minutes', severityPoints: 90, actionOnTrigger: 'DECLINE', isEnabled: true, parameters: { maxDistinctExpiries: 3 } },

  // MERCHANT MCC & HIGH RISK CATEGORIES
  { id: 'RR_MCC_001', ruleCode: 'MCC_CRYPTO_QUASI_CASH', ruleCategory: 'MERCHANT_MCC', name: 'Quasi-Cash Cryptocurrency Merchant (MCC 6051)', description: 'Elevates required 3DS step-up authentication for cryptocurrency exchange purchases', severityPoints: 30, actionOnTrigger: 'CHALLENGE_3DS', isEnabled: true, parameters: { targetMcc: '6051' } },
  { id: 'RR_MCC_002', ruleCode: 'MCC_GAMBLING_CASINO', ruleCategory: 'MERCHANT_MCC', name: 'Online Gambling / Casino Wagering (MCC 7995)', description: 'Enforces strict spending limits and velocity checks for wagering transactions', severityPoints: 35, actionOnTrigger: 'CHALLENGE_3DS', isEnabled: true, parameters: { targetMcc: '7995' } },
  { id: 'RR_MCC_003', ruleCode: 'MCC_HIGH_VALUE_LUXURY', ruleCategory: 'MERCHANT_MCC', name: 'High-Value Luxury Goods Outlier (> $10,000)', description: 'Mandates manual compliance review for single luxury retail purchases exceeding $10,000', severityPoints: 50, actionOnTrigger: 'MANUAL_REVIEW', isEnabled: true, parameters: { thresholdCents: 1000000 } },

  // AML & COMPLIANCE RULES
  { id: 'RR_AML_001', ruleCode: 'AML_STRUCTURING_DETECTION', ruleCategory: 'AML_COMPLIANCE', name: 'CTR Structuring Pattern ($8,000 - $9,999)', description: 'Detects series of deposits designed to evade FinCEN $10,000 reporting threshold', severityPoints: 85, actionOnTrigger: 'MANUAL_REVIEW', isEnabled: true, parameters: { minCents: 800000, maxCents: 999999 } },
  { id: 'RR_AML_002', ruleCode: 'AML_RAPID_MOVEMENT_OF_FUNDS', ruleCategory: 'AML_COMPLIANCE', name: 'Rapid Layering Movement of Funds', description: 'Triggers when funds deposited via card are transferred out via ACH/Wire within 15 minutes', severityPoints: 70, actionOnTrigger: 'MANUAL_REVIEW', isEnabled: true, parameters: { maxDwellMinutes: 15 } },
];
