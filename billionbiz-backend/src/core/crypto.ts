import crypto from 'crypto';

/**
 * BillionBiz Integration Credentials Envelope Encryption Service
 *
 * Implements AES-256-GCM authenticated envelope encryption with Additional
 * Authenticated Data (AAD) bound to the tenant context (organization, store,
 * provider, and environment).
 *
 * Invariant: Plaintext merchant credentials are never written to the database,
 * never logged, never returned to the browser, and never stored in environment variables.
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_VERSION = 'v1';

// Derive 32-byte key from INTEGRATION_CREDENTIALS_KEK or fallback for local dev
function getMasterKey(): Buffer {
  const kekHex = process.env.INTEGRATION_CREDENTIALS_KEK;
  if (kekHex && kekHex.length >= 64) {
    return Buffer.from(kekHex.substring(0, 64), 'hex');
  }
  // Deterministic local development fallback derived from JWT_SECRET
  const devSecret = process.env.JWT_SECRET || 'billionbiz-local-development-secret-key-32';
  return crypto.createHash('sha256').update(`kek:${devSecret}`).digest();
}

export interface EncryptionContext {
  organizationId?: string;
  storeId: string;
  providerKey: string;
  environment: 'TEST' | 'LIVE';
}

export interface EncryptedEnvelope {
  ciphertext: string;
  iv: string;
  tag: string;
  keyVersion: string;
}

/**
 * Encrypts merchant credentials with AES-256-GCM bound to tenant context.
 */
export function encryptCredentials(
  data: Record<string, any>,
  context: EncryptionContext
): EncryptedEnvelope {
  const masterKey = getMasterKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);

  // Bind Additional Authenticated Data (AAD) to prevent cross-tenant / cross-provider tampering
  const aad = `${context.organizationId || ''}:${context.storeId}:${context.providerKey.toLowerCase()}:${context.environment.toUpperCase()}`;
  cipher.setAAD(Buffer.from(aad, 'utf8'));

  const plaintext = JSON.stringify(data);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag,
    keyVersion: KEY_VERSION
  };
}

/**
 * Decrypts merchant credentials with AES-256-GCM verifying tenant context AAD.
 */
export function decryptCredentials(
  envelope: EncryptedEnvelope,
  context: EncryptionContext
): Record<string, any> {
  const masterKey = getMasterKey();
  const iv = Buffer.from(envelope.iv, 'hex');
  const tag = Buffer.from(envelope.tag, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);

  // Verify AAD matches exactly
  const aad = `${context.organizationId || ''}:${context.storeId}:${context.providerKey.toLowerCase()}:${context.environment.toUpperCase()}`;
  decipher.setAAD(Buffer.from(aad, 'utf8'));
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(envelope.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

/**
 * Helper to mask credentials for UI display
 */
export function maskCredential(value: string | undefined): string {
  if (!value) return '';
  if (value.length <= 8) return '••••••••';
  return `${value.substring(0, 4)}••••••••${value.substring(value.length - 4)}`;
}

