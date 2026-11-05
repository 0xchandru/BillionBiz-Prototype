import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;

export function encodeBase32(input: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of input) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function decodeBase32(input: string): Buffer {
  const normalized = input.replace(/[\s=-]/g, '').toUpperCase();
  if (!normalized || !/^[A-Z2-7]+$/.test(normalized)) {
    throw new Error('Invalid Base32 authenticator secret');
  }

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

export function generateTotpAtCounter(secret: string, counter: number, digits = TOTP_DIGITS): string {
  if (!Number.isSafeInteger(counter) || counter < 0 || ![6, 8].includes(digits)) {
    throw new Error('Invalid TOTP counter or digit length');
  }

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac('sha1', decodeBase32(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  );

  return String(binary % (10 ** digits)).padStart(digits, '0');
}

export function generateTotp(secret: string, timestampMs = Date.now(), digits = TOTP_DIGITS): string {
  const counter = Math.floor(timestampMs / 1000 / TOTP_STEP_SECONDS);
  return generateTotpAtCounter(secret, counter, digits);
}

/**
 * Verify current or adjacent 30-second TOTP steps.
 * A previously accepted counter is never accepted again.
 */
export function findValidTotpCounter(
  secret: string,
  suppliedCode: string,
  timestampMs = Date.now(),
  allowedDriftSteps = 1,
  lastAcceptedCounter = -1
): number | null {
  if (!/^\d{6}$/.test(suppliedCode) || !Number.isInteger(allowedDriftSteps) || allowedDriftSteps < 0 || allowedDriftSteps > 2) {
    return null;
  }

  const currentCounter = Math.floor(timestampMs / 1000 / TOTP_STEP_SECONDS);
  for (let drift = -allowedDriftSteps; drift <= allowedDriftSteps; drift += 1) {
    const counter = currentCounter + drift;
    if (counter <= lastAcceptedCounter || counter < 0) continue;

    const candidate = generateTotpAtCounter(secret, counter);
    const candidateBuffer = Buffer.from(candidate);
    const suppliedBuffer = Buffer.from(suppliedCode);
    if (candidateBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(candidateBuffer, suppliedBuffer)) {
      return counter;
    }
  }

  return null;
}

function deriveMfaEncryptionKey(masterSecret: string): Buffer {
  if (!masterSecret || masterSecret.length < 32) {
    throw new Error('A strong server secret is required to encrypt MFA credentials');
  }
  return crypto.createHash('sha256')
    .update('BillionBiz MFA secret encryption v1:')
    .update(masterSecret)
    .digest();
}

/**
 * Encrypt authenticator seeds at rest. The encryption key is derived from
 * the server JWT secret; keep that secret stable across application restarts.
 */
export function encryptMfaSecret(secret: string, masterSecret: string): string {
  const key = deriveMfaEncryptionKey(masterSecret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    'v1',
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url')
  ].join('.');
}

export function decryptMfaSecret(ciphertext: string, masterSecret: string): string {
  const [version, ivText, tagText, encryptedText, extra] = String(ciphertext).split('.');
  if (version !== 'v1' || !ivText || !tagText || !encryptedText || extra !== undefined) {
    throw new Error('MFA secret format is invalid; re-enrollment is required');
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    deriveMfaEncryptionKey(masterSecret),
    Buffer.from(ivText, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'base64url')),
    decipher.final()
  ]).toString('utf8');
}

export function hashRecoveryCode(code: string, masterSecret: string): string {
  const normalized = code.trim().replace(/[\s-]/g, '').toUpperCase();
  return crypto.createHmac('sha256', deriveMfaEncryptionKey(masterSecret))
    .update(normalized)
    .digest('hex');
}
