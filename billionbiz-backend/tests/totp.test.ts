import { describe, expect, it } from 'vitest';
import {
  decodeBase32,
  decryptMfaSecret,
  encodeBase32,
  encryptMfaSecret,
  findValidTotpCounter,
  generateTotpAtCounter,
  hashRecoveryCode
} from '../src/core/totp.js';

describe('RFC 6238 TOTP utilities', () => {
  const rfcSecret = encodeBase32(Buffer.from('12345678901234567890', 'ascii'));

  it('encodes and decodes Base32 without padding', () => {
    const original = cryptoRandomFixture();
    expect(decodeBase32(encodeBase32(original))).toEqual(original);
  });

  it('matches the RFC 6238 SHA-1 8-digit reference vector', () => {
    expect(generateTotpAtCounter(rfcSecret, 1, 8)).toBe('94287082');
    expect(generateTotpAtCounter(rfcSecret, 2, 8)).toBe('37359152');
  });

  it('accepts a code only once for a given time counter', () => {
    const code = generateTotpAtCounter(rfcSecret, 100);
    expect(findValidTotpCounter(rfcSecret, code, 100 * 30_000, 0, 99)).toBe(100);
    expect(findValidTotpCounter(rfcSecret, code, 100 * 30_000, 0, 100)).toBeNull();
  });

  it('does not accept an arbitrary six-digit value', () => {
    const validCode = generateTotpAtCounter(rfcSecret, 100);
    const invalidCode = validCode === '123456' ? '123455' : '123456';
    expect(findValidTotpCounter(rfcSecret, invalidCode, 100 * 30_000, 0, 99)).toBeNull();
  });

  it('encrypts authenticator seeds and stores recovery codes as keyed hashes', () => {
    const masterSecret = 'a-stable-test-master-secret-with-more-than-32-characters';
    const encrypted = encryptMfaSecret(rfcSecret, masterSecret);
    expect(encrypted).toMatch(/^v1\./);
    expect(encrypted).not.toContain(rfcSecret);
    expect(decryptMfaSecret(encrypted, masterSecret)).toBe(rfcSecret);
    expect(() => decryptMfaSecret(encrypted, 'a-different-secret-that-is-also-long-enough')).toThrow();

    const recoveryCode = 'A1B2C3D4E5F60708';
    const hashed = hashRecoveryCode(recoveryCode, masterSecret);
    expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    expect(hashed).not.toBe(recoveryCode);
  });
});

function cryptoRandomFixture(): Buffer {
  return Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 250, 251, 252, 253, 254, 255]);
}
