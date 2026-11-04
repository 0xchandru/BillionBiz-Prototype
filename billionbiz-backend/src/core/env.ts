import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust multi-path resolution so .env loads whether started from repo root or package dir
const candidatePaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), 'billionbiz-backend/.env'),
  path.resolve(process.cwd(), '.env')
];

for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}
dotenv.config(); // fallback to default

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/billionbiz'),
  JWT_SECRET: z.string().default('billionbiz-secret-jwt-key-2026-production-ready'),
  ROOT_DOMAIN: z.string().default('chandraprakash.codes'),
  MAIN_WEBSITE_URL: z.string().default('https://www.chandraprakash.codes'),
  ADMIN_URL: z.string().default('https://admin.chandraprakash.codes'),
  ACCOUNTS_URL: z.string().default('https://accounts.chandraprakash.codes'),
  STAFF_URL: z.string().default('https://staff.chandraprakash.codes'),
  POS_URL: z.string().default('https://pos.chandraprakash.codes'),
  OPS_URL: z.string().default('https://ops.chandraprakash.codes'),
  API_URL: z.string().default('https://api.chandraprakash.codes'),
  STORE_DOMAIN_PATTERN: z.string().default('*.chandraprakash.codes'),
  ALLOWED_ORIGINS: z.string().default(
    'https://www.chandraprakash.codes,https://admin.chandraprakash.codes,https://accounts.chandraprakash.codes,https://staff.chandraprakash.codes,https://pos.chandraprakash.codes,https://ops.chandraprakash.codes'
  ),
  CORS_ALLOWED_ORIGINS: z.string().default(
    'https://chandraprakash.codes,https://www.chandraprakash.codes,https://admin.chandraprakash.codes,https://accounts.chandraprakash.codes,https://staff.chandraprakash.codes,https://pos.chandraprakash.codes,https://ops.chandraprakash.codes,https://api.chandraprakash.codes,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8080'
  ),
  APP_URL: z.string().default('https://chandraprakash.codes'),
  API_BASE_URL: z.string().default('https://api.chandraprakash.codes/api/v1'),
  EMAIL_PROVIDER: z.enum(['console', 'smtp', 'resend', 'sendgrid']).default('console'),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@chandraprakash.codes'),
  INTEGRATION_CREDENTIALS_KEK: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional()
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

