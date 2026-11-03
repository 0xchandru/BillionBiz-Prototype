import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/billionbiz'),
  JWT_SECRET: z.string().default('billionbiz-secret-jwt-key-2026-production-ready'),
  CORS_ALLOWED_ORIGINS: z.string().default(
    'https://chandraprakash.codes,https://www.chandraprakash.codes,https://admin.chandraprakash.codes,https://accounts.chandraprakash.codes,https://staff.chandraprakash.codes,https://pos.chandraprakash.codes,https://ops.chandraprakash.codes,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8080'
  ),
  APP_URL: z.string().default('https://chandraprakash.codes'),
  API_BASE_URL: z.string().default('http://localhost:8080'),
  EMAIL_PROVIDER: z.enum(['console', 'smtp', 'resend', 'sendgrid']).default('console'),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@chandraprakash.codes'),
  INTEGRATION_CREDENTIALS_KEK: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  TUNNEL_URL: z.string().optional()
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (err: any) {
  console.error('[CRITICAL ENV CONFIGURATION ERROR] Missing or invalid environment variables:');
  if (err instanceof z.ZodError) {
    err.errors.forEach((e) => {
      console.error(` - ${e.path.join('.')}: ${e.message}`);
    });
  } else {
    console.error(err);
  }
  process.exit(1);
}

export const env = parsedEnv;

