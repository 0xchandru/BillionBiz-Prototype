import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/pool.js';
import { env } from './env.js';
import { decryptMfaSecret, findValidTotpCounter, hashRecoveryCode } from './totp.js';

export type MfaVerificationResult =
  | { ok: true; recoveryCodeConsumed?: boolean; counter?: number }
  | { ok: false; status: number; error: string; message: string; retryAfterSeconds?: number };

export async function createMfaLoginChallenge(userId: string): Promise<{ challengeToken: string; expiresInSeconds: number }> {
  const challengeToken = crypto.randomBytes(32).toString('base64url');
  const challengeHash = crypto.createHash('sha256').update(challengeToken).digest('hex');
  await query(
    `INSERT INTO mfa_login_challenges (id, user_id, challenge_hash, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes')`,
    [`mfach-${uuidv4()}`, userId, challengeHash]
  );

  return { challengeToken, expiresInSeconds: 300 };
}

export async function verifyMfaCredential(
  userId: string,
  code: string,
  recoveryCode: string
): Promise<MfaVerificationResult> {
  const userResult = await query(
    `SELECT mfa_secret, mfa_enabled, mfa_last_counter, mfa_recovery_codes,
            mfa_failed_attempts, mfa_locked_until
     FROM users WHERE id = $1`,
    [userId]
  );
  if (userResult.rowCount === 0) {
    return { ok: false, status: 404, error: 'USER_NOT_FOUND', message: 'Account was not found' };
  }

  const user = userResult.rows[0];
  if (!user.mfa_secret || !user.mfa_enabled) {
    return { ok: false, status: 400, error: 'MFA_NOT_ENABLED', message: 'MFA is not enabled for this account' };
  }

  if (user.mfa_locked_until && new Date(user.mfa_locked_until).getTime() > Date.now()) {
    const retryAfterSeconds = Math.max(1, Math.ceil((new Date(user.mfa_locked_until).getTime() - Date.now()) / 1000));
    return {
      ok: false,
      status: 429,
      error: 'MFA_ATTEMPTS_EXCEEDED',
      message: 'Too many incorrect MFA attempts. Try again after the temporary lock expires.',
      retryAfterSeconds
    };
  }

  if (user.mfa_locked_until && new Date(user.mfa_locked_until).getTime() <= Date.now()) {
    await query(
      `UPDATE users SET mfa_failed_attempts = 0, mfa_locked_until = NULL WHERE id = $1`,
      [userId]
    );
  }

  const registerFailedAttempt = async (): Promise<MfaVerificationResult> => {
    const failed = await query(
      `UPDATE users
       SET mfa_failed_attempts = mfa_failed_attempts + 1,
           mfa_locked_until = CASE
             WHEN mfa_failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
             ELSE mfa_locked_until
           END
       WHERE id = $1
       RETURNING mfa_failed_attempts`,
      [userId]
    );
    const attempts = Number(failed.rows[0]?.mfa_failed_attempts || 0);
    const locked = attempts >= 5;
    return {
      ok: false,
      status: locked ? 429 : 401,
      error: locked ? 'MFA_ATTEMPTS_EXCEEDED' : 'INVALID_MFA_CODE',
      message: locked
        ? 'Too many incorrect MFA attempts. Try again in 15 minutes.'
        : 'The authenticator code or recovery code is invalid.',
      ...(locked ? { retryAfterSeconds: 900 } : {})
    };
  };

  if (recoveryCode) {
    if (recoveryCode.length > 128) {
      return { ok: false, status: 400, error: 'INVALID_RECOVERY_CODE', message: 'Recovery code format is invalid' };
    }

    const recoveryHash = hashRecoveryCode(recoveryCode, env.JWT_SECRET);
    const consumed = await query(
      `UPDATE users
       SET mfa_recovery_codes = (
         SELECT COALESCE(jsonb_agg(code_hash ORDER BY ordinal), '[]'::jsonb)
         FROM jsonb_array_elements_text(mfa_recovery_codes)
           WITH ORDINALITY AS recovery(code_hash, ordinal)
         WHERE code_hash <> $1
       ),
       mfa_failed_attempts = 0,
       mfa_locked_until = NULL
       WHERE id = $2
         AND mfa_enabled = TRUE
         AND mfa_recovery_codes @> jsonb_build_array($1)
         AND (mfa_locked_until IS NULL OR mfa_locked_until <= NOW())
       RETURNING id`,
      [recoveryHash, userId]
    );

    if (consumed.rowCount === 0) {
      return registerFailedAttempt();
    }

    return { ok: true, recoveryCodeConsumed: true };
  }

  let secret: string;
  try {
    secret = decryptMfaSecret(String(user.mfa_secret), env.JWT_SECRET);
  } catch {
    return {
      ok: false,
      status: 409,
      error: 'MFA_REENROLL_REQUIRED',
      message: 'The stored authenticator secret is not in the supported encrypted format. Enroll a new authenticator.'
    };
  }

  const matchedCounter = findValidTotpCounter(
    secret,
    code,
    Date.now(),
    1,
    Number(user.mfa_last_counter ?? -1)
  );
  if (matchedCounter === null) {
    return registerFailedAttempt();
  }

  const updated = await query(
    `UPDATE users
     SET mfa_last_counter = $1,
         mfa_failed_attempts = 0,
         mfa_locked_until = NULL
     WHERE id = $2
       AND mfa_enabled = TRUE
       AND mfa_last_counter < $1
       AND (mfa_locked_until IS NULL OR mfa_locked_until <= NOW())
     RETURNING id`,
    [matchedCounter, userId]
  );
  if (updated.rowCount === 0) {
    return {
      ok: false,
      status: 409,
      error: 'MFA_CODE_ALREADY_USED',
      message: 'This authenticator code has already been used. Wait for the next code and try again.'
    };
  }

  return { ok: true, counter: matchedCounter };
}

export async function verifyMfaLoginChallenge(
  challengeToken: string,
  code: string,
  recoveryCode: string
): Promise<MfaVerificationResult & { userId?: string }> {
  if (!challengeToken || challengeToken.length > 256) {
    return { ok: false, status: 401, error: 'INVALID_MFA_CHALLENGE', message: 'The MFA login challenge is invalid or expired' };
  }

  const challengeHash = crypto.createHash('sha256').update(challengeToken).digest('hex');
  const challenge = await query(
    `SELECT id, user_id
     FROM mfa_login_challenges
     WHERE challenge_hash = $1
       AND consumed_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [challengeHash]
  );
  if (challenge.rowCount === 0) {
    return { ok: false, status: 401, error: 'INVALID_MFA_CHALLENGE', message: 'The MFA login challenge is invalid, expired, or already used' };
  }

  const userId = challenge.rows[0].user_id as string;
  const verification = await verifyMfaCredential(userId, code, recoveryCode);
  if (!verification.ok) {
    return verification;
  }

  const consumed = await query(
    `UPDATE mfa_login_challenges
     SET consumed_at = NOW()
     WHERE id = $1 AND consumed_at IS NULL AND expires_at > NOW()
     RETURNING id`,
    [challenge.rows[0].id]
  );
  if (consumed.rowCount === 0) {
    return { ok: false, status: 409, error: 'MFA_CHALLENGE_ALREADY_USED', message: 'This MFA login challenge has already been used' };
  }

  return { ok: true, userId, recoveryCodeConsumed: verification.recoveryCodeConsumed };
}
