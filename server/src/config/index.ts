import { z } from 'zod';
import dotenv from 'dotenv';

// Load local .env if present (strictly ignored in git)
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000'),
  
  PAYNEXA_MASTER_SECRET: z.string().default('paynexa_dev_master_secret_key_987654321'),
  JWT_SECRET: z.string().default('paynexa_jwt_development_secret_signature_token'),
  WEBHOOK_SIGNING_SECRET: z.string().default('whsec_paynexa_default_hmac_secret_2026'),
  
  DATABASE_URL: z.string().default('./data/paynexa.db'),
  DATABASE_ENABLE_WAL: z.string().default('true').transform((v) => v === 'true'),
  
  IDEMPOTENCY_TTL_SECONDS: z.string().default('86400').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('500').transform((val) => parseInt(val, 10)),
  
  FRAUD_VELOCITY_WINDOW_SECONDS: z.string().default('300').transform((val) => parseInt(val, 10)),
  FRAUD_VELOCITY_MAX_TX_COUNT: z.string().default('5').transform((val) => parseInt(val, 10)),
  FRAUD_MAX_AMOUNT_USD_DEFAULT: z.string().default('10000').transform((val) => parseInt(val, 10)),
  FRAUD_AUTOMATIC_CHALLENGE_SCORE: z.string().default('65').transform((val) => parseInt(val, 10)),
  FRAUD_AUTOMATIC_DECLINE_SCORE: z.string().default('85').transform((val) => parseInt(val, 10)),
  
  WEBHOOK_MAX_RETRIES: z.string().default('5').transform((val) => parseInt(val, 10)),
  WEBHOOK_BASE_DELAY_MS: z.string().default('1000').transform((val) => parseInt(val, 10)),
  WEBHOOK_REQUEST_TIMEOUT_MS: z.string().default('5000').transform((val) => parseInt(val, 10)),
});

export type Config = z.infer<typeof envSchema>;

function loadConfig(): Config {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.warn('⚠️ Environment validation warnings, using safe development defaults:', result.error.format());
    return envSchema.parse({});
  }
  return result.data;
}

export const config = loadConfig();
