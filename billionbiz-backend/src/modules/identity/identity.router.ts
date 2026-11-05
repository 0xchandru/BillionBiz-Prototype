import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { generateToken, requireAuth } from '../../middleware/auth.js';
import { recordAudit, enqueueOutbox } from '../../core/auditAndOutbox.js';
import { sendEmail } from '../../core/notificationWorker.js';
import { provisionDefaultStorefront } from '../storefront/storefrontProvisioner.js';
import { env } from '../../core/env.js';
import { encodeBase32, encryptMfaSecret, decryptMfaSecret, findValidTotpCounter, hashRecoveryCode } from '../../core/totp.js';
import { createMfaLoginChallenge, verifyMfaLoginChallenge } from '../../core/mfaService.js';
import {
  validateSubdomainSlug,
  generateCandidateSlug,
  isReservedSubdomain,
  PLATFORM_MAIN_DOMAIN
} from '../../core/subdomains.js';

export const identityRouter = Router();

async function respondWithMfaChallenge(res: Response, user: { id: string; email?: string | null; full_name?: string | null }) {
  const challenge = await createMfaLoginChallenge(user.id);
  return res.status(200).json({
    mfaRequired: true,
    challengeToken: challenge.challengeToken,
    expiresInSeconds: challenge.expiresInSeconds,
    user: { id: user.id, email: user.email || null, fullName: user.full_name || null }
  });
}

const OTP_MAX_ATTEMPTS = 5;

type OtpCheckResult =
  | { ok: true }
  | { ok: false; status: number; error: string; message: string };

function hashOtp(code: string): string {
  return crypto.createHmac('sha256', env.JWT_SECRET).update(code).digest('hex');
}

function constantTimeStringEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

async function consumeOtp(identifier: string, otpType: string, suppliedCode: string): Promise<OtpCheckResult> {
  if (!/^\d{6}$/.test(suppliedCode)) {
    return { ok: false, status: 400, error: 'INVALID_OTP', message: 'Enter the 6-digit verification code' };
  }

  const result = await query(
    `SELECT id, code, expires_at, attempts
     FROM verification_otps
     WHERE identifier = $1 AND type = $2 AND is_used = FALSE
     ORDER BY created_at DESC
     LIMIT 1`,
    [identifier, otpType]
  );

  if (result.rowCount === 0) {
    return { ok: false, status: 400, error: 'INVALID_OTP', message: 'Invalid or already used verification code' };
  }

  const record = result.rows[0];
  if (new Date() > new Date(record.expires_at)) {
    await query(
      `UPDATE verification_otps SET is_used = TRUE WHERE id = $1 AND is_used = FALSE`,
      [record.id]
    );
    return { ok: false, status: 400, error: 'EXPIRED_OTP', message: 'Verification code has expired. Please request a new code.' };
  }

  const attempts = Number(record.attempts || 0);
  if (attempts >= OTP_MAX_ATTEMPTS) {
    await query(
      `UPDATE verification_otps SET is_used = TRUE WHERE id = $1 AND is_used = FALSE`,
      [record.id]
    );
    return { ok: false, status: 429, error: 'OTP_ATTEMPTS_EXCEEDED', message: 'Too many incorrect attempts. Request a new verification code.' };
  }

  // Store an HMAC digest at rest. A still-valid legacy plaintext OTP is
  // accepted only during the short deployment window.
  const valid = constantTimeStringEqual(String(record.code), hashOtp(suppliedCode)) ||
    constantTimeStringEqual(String(record.code), suppliedCode);

  if (!valid) {
    const updated = await query(
      `UPDATE verification_otps
       SET attempts = attempts + 1,
           is_used = CASE WHEN attempts + 1 >= $2 THEN TRUE ELSE is_used END
       WHERE id = $1 AND is_used = FALSE AND attempts < $2
       RETURNING attempts`,
      [record.id, OTP_MAX_ATTEMPTS]
    );
    const nextAttempts = Number(updated.rows[0]?.attempts || attempts + 1);
    if (nextAttempts >= OTP_MAX_ATTEMPTS) {
      return { ok: false, status: 429, error: 'OTP_ATTEMPTS_EXCEEDED', message: 'Too many incorrect attempts. Request a new verification code.' };
    }
    return { ok: false, status: 400, error: 'INVALID_OTP', message: 'Invalid verification code' };
  }

  const consumed = await query(
    `UPDATE verification_otps SET is_used = TRUE
     WHERE id = $1 AND is_used = FALSE AND attempts < $2
     RETURNING id`,
    [record.id, OTP_MAX_ATTEMPTS]
  );
  if (consumed.rowCount === 0) {
    return { ok: false, status: 409, error: 'OTP_ALREADY_USED', message: 'This verification code has already been used. Request a new code.' };
  }

  return { ok: true };
}


/**
 * Resolves the role-aware target operational portal shell (T-047)
 */
export function resolvePortalDestination(role: string, isPlatformAdmin = false): { portal: string; url: string; path: string } {
  if (isPlatformAdmin) {
    return { portal: 'PLATFORM_ADMIN', url: env.ADMIN_URL, path: '/platform' };
  }
  const normalizedRole = (role || '').toUpperCase();
  switch (normalizedRole) {
    case 'OWNER':
    case 'ADMIN':
    case 'MANAGER':
      return { portal: 'MERCHANT_ADMIN', url: env.ADMIN_URL, path: '/dashboard' };
    case 'CASHIER':
      return { portal: 'POS', url: env.POS_URL, path: '/pos' };
    case 'STAFF':
      return { portal: 'STAFF', url: env.STAFF_URL, path: '/staff' };
    default:
      return { portal: 'MERCHANT_ADMIN', url: env.ADMIN_URL, path: '/dashboard' };
  }
}

// POST /api/v1/auth/login
identityRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'MISSING_CREDENTIALS', message: 'Email and password are required' });
  }

  const userRes = await query(
    `SELECT u.id, u.email, u.password_hash, u.full_name, u.is_platform_admin, u.email_verified, u.mfa_enabled
     FROM users u
     WHERE u.email = $1`,
    [email.toLowerCase().trim()]
  );

  if (userRes.rowCount === 0) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
  }

  const user = userRes.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
  }
  if (user.mfa_enabled) {
    return respondWithMfaChallenge(res, user);
  }

  // Fetch organizations and stores
  const orgsRes = await query(
    `SELECT o.id as organization_id, o.name as organization_name, om.role,
            s.id as store_id, s.name as store_name, s.slug as store_slug
     FROM organization_memberships om
     JOIN organizations o ON o.id = om.organization_id
     LEFT JOIN stores s ON s.organization_id = o.id
     WHERE om.user_id = $1`,
    [user.id]
  );

  const primaryOrg = orgsRes.rows[0]?.organization_id;
  const primaryStore = orgsRes.rows[0]?.store_id;
  const role = orgsRes.rows[0]?.role || 'MEMBER';

  const token = generateToken({
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    isPlatformAdmin: user.is_platform_admin,
    organizationId: primaryOrg,
    storeId: primaryStore,
    role
  });

  await recordAudit({
    organizationId: primaryOrg,
    storeId: primaryStore,
    actorId: user.id,
    action: 'USER_LOGIN',
    targetType: 'USER',
    targetId: user.id,
    ipAddress: req.ip
  });

  const portalDestination = resolvePortalDestination(role, user.is_platform_admin);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      isPlatformAdmin: user.is_platform_admin,
      emailVerified: user.email_verified,
      mfaEnabled: user.mfa_enabled
    },
    organizations: orgsRes.rows,
    portalDestination
  });
});

// POST /api/v1/auth/register (Merchant Onboarding & First Store Provisioning - T-045)
identityRouter.post('/register', async (req: Request, res: Response) => {
  const { email, password, fullName, storeName, capabilityMode } = req.body;
  if (!email || !password || !fullName || !storeName) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'All fields are required' });
  }

  const existing = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
  if (existing.rowCount && existing.rowCount > 0) {
    return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'An account with this email already exists' });
  }

  const userId = `usr-${uuidv4()}`;
  const orgId = `org-${uuidv4()}`;
  const storeId = `str-${uuidv4()}`;
  const locId = `loc-${uuidv4()}`;
  const staffProfileId = `stf-${uuidv4()}`;
  const passwordHash = await bcrypt.hash(password, 10);

  const rawRequestedSlug = (req.body.slug as string)?.trim() || generateCandidateSlug(storeName);
  const slugValidation = validateSubdomainSlug(rawRequestedSlug);
  if (!slugValidation.isValid) {
    return res.status(400).json({
      error: slugValidation.errorCode,
      message: slugValidation.error
    });
  }
  const storeSlug = slugValidation.normalizedSlug;

  const existingSlug = await query(`SELECT id FROM stores WHERE LOWER(slug) = $1`, [storeSlug]);
  if (existingSlug.rowCount && existingSlug.rowCount > 0) {
    return res.status(409).json({
      error: 'SUBDOMAIN_TAKEN',
      message: 'This store subdomain is already taken. Please try another one.'
    });
  }

  // Generate 32-byte cryptographic email verification token
  const rawVerifyToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawVerifyToken).digest('hex');
  const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const defaultChecklist = [
    { step: 'verify_email', title: 'Verify email address', desc: 'Confirm your email to activate full publishing permissions.' },
    { step: 'add_first_item', title: 'Add first product or service', desc: 'Create your primary offering to display in your store.' },
    { step: 'setup_payments', title: 'Configure payment methods', desc: 'Enable Razorpay or cash tenders for seamless checkout.' },
    { step: 'customize_theme', title: 'Customize Storefront in Store Editor', desc: 'Personalize colors, logo, and page layout.' },
    { step: 'publish_live', title: 'Publish your store', desc: 'Make your store publicly accessible to customers.' }
  ];

  try {
    await withTransaction(async (client) => {
    // 1. Create User
    await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, email_verified)
       VALUES ($1, $2, $3, $4, FALSE)`,
      [userId, email.toLowerCase().trim(), passwordHash, fullName]
    );

    // 2. Email verification token
    await client.query(
      `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [`evt-${uuidv4()}`, userId, tokenHash, verifyExpiry]
    );

    // 3. Create Organization
    await client.query(
      `INSERT INTO organizations (id, name, slug)
       VALUES ($1, $2, $3)`,
      [orgId, `${storeName} Group`, `${storeSlug}-${uuidv4().substring(0, 6)}`]
    );

    // 4. Create Store Shell (Status: ACTIVE for automatic publishing)
    await client.query(
      `INSERT INTO stores (id, organization_id, name, slug, status)
       VALUES ($1, $2, $3, $4, 'ACTIVE')`,
      [storeId, orgId, storeName, storeSlug]
    );

    // 5. Capabilities & Storefront Settings
    const mode = (capabilityMode || 'BOTH').toUpperCase();
    const prodEnabled = mode === 'COMMERCE' || mode === 'BOTH';
    const apptEnabled = mode === 'SERVICES' || mode === 'BOTH';

    await client.query(
      `INSERT INTO store_capabilities (store_id, product_commerce_enabled, appointments_enabled, restaurant_pos_enabled)
       VALUES ($1, $2, $3, TRUE)`,
      [storeId, prodEnabled, apptEnabled]
    );

    // 6. Default Store Location
    await client.query(
      `INSERT INTO store_locations (id, store_id, name, is_primary, is_active)
       VALUES ($1, $2, 'Primary Location', TRUE, TRUE)`,
      [locId, storeId]
    );

    // 7. Organization Membership & Staff Profile
    await client.query(
      `INSERT INTO organization_memberships (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, 'OWNER')`,
      [`mem-${uuidv4()}`, orgId, userId]
    );

    const pinHash = await bcrypt.hash('1234', 10);
    await client.query(
      `INSERT INTO staff_profiles (id, organization_id, user_id, store_id, display_name, pin_hash, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
      [staffProfileId, orgId, userId, storeId, fullName, pinHash]
    );

    await client.query(
      `INSERT INTO role_assignments (id, staff_profile_id, role_id, store_id, location_id)
       VALUES ($1, $2, 'role-owner', $3, $4)`,
      [`ra-${uuidv4()}`, staffProfileId, storeId, locId]
    );

    // 8. Provision Full Online Store Architecture (Subdomain, Theme, Navigation, System Pages Catalog, Starter Release)
    await provisionDefaultStorefront({
      client,
      storeId,
      storeName,
      storeSlug,
      mode: mode as any,
      userId
    });

    // 10. Guided Onboarding Checklist
    for (const item of defaultChecklist) {
      await client.query(
        `INSERT INTO onboarding_checklists (id, store_id, step_key, title, description, is_completed)
         VALUES ($1, $2, $3, $4, $5, FALSE)`,
        [`chk-${uuidv4()}`, storeId, item.step, item.title, item.desc]
      );
    }
    });
  } catch (err: any) {
    if (err.code === '23505' && (err.constraint === 'uq_stores_slug_lower' || String(err.detail).includes('slug'))) {
      return res.status(409).json({
        error: 'SUBDOMAIN_TAKEN',
        message: 'This store subdomain is already taken. Please try another one.'
      });
    }
    throw err;
  }

  // 10. Enqueue Outbox Email Verification Event
  await enqueueOutbox({
    organizationId: orgId,
    storeId,
    eventType: 'USER_REGISTERED',
    payload: {
      userId,
      email: email.toLowerCase().trim(),
      fullName,
      storeName,
      verifyToken: rawVerifyToken,
      verifyUrl: `${env.ADMIN_URL}/verify-email?token=${rawVerifyToken}`
    }
  });

  const token = generateToken({
    userId,
    email: email.toLowerCase().trim(),
    fullName,
    isPlatformAdmin: false,
    organizationId: orgId,
    storeId,
    role: 'OWNER'
  });

  const portalDestination = resolvePortalDestination('OWNER', false);

  res.status(201).json({
    message: 'Store created successfully',
    token,
    user: { id: userId, email, fullName, emailVerified: false },
    organization: { id: orgId, name: `${storeName} Group` },
    store: { id: storeId, name: storeName, slug: storeSlug, status: 'DRAFT' },
    onboardingChecklist: defaultChecklist.map(c => ({ stepKey: c.step, title: c.title, isCompleted: false })),
    portalDestination,
    verificationTokenPreview: process.env.NODE_ENV === 'test' ? rawVerifyToken : undefined
  });
});

// POST /api/v1/auth/verify-email (T-046)
identityRouter.post('/verify-email', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'MISSING_TOKEN', message: 'Verification token is required' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const tokenRes = await query(
    `SELECT id, user_id, expires_at
     FROM email_verification_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );

  if (tokenRes.rowCount === 0) {
    return res.status(400).json({ error: 'INVALID_TOKEN', message: 'Invalid or expired verification token' });
  }

  const tokenRecord = tokenRes.rows[0];
  if (new Date() > new Date(tokenRecord.expires_at)) {
    await query(`DELETE FROM email_verification_tokens WHERE id = $1`, [tokenRecord.id]);
    return res.status(400).json({ error: 'EXPIRED_TOKEN', message: 'Verification token has expired' });
  }

  await withTransaction(async (client) => {
    // 1. Mark user verified
    await client.query(
      `UPDATE users SET email_verified = TRUE WHERE id = $1`,
      [tokenRecord.user_id]
    );

    // 2. Mark onboarding step completed
    await client.query(
      `UPDATE onboarding_checklists
       SET is_completed = TRUE, completed_at = NOW()
       WHERE step_key = 'verify_email'
         AND store_id IN (
           SELECT s.id FROM stores s
           JOIN organization_memberships om ON om.organization_id = s.organization_id
           WHERE om.user_id = $1
         )`,
      [tokenRecord.user_id]
    );

    // 3. Delete token
    await client.query(
      `DELETE FROM email_verification_tokens WHERE id = $1`,
      [tokenRecord.id]
    );
  });

  res.json({ message: 'Email verified successfully', emailVerified: true });
});

// POST /api/v1/auth/forgot-password (T-046)
identityRouter.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'MISSING_EMAIL', message: 'Email address is required' });
  }

  const userRes = await query(`SELECT id, email, full_name FROM users WHERE email = $1`, [email.toLowerCase().trim()]);

  // Constant response to prevent user enumeration
  if (userRes.rowCount && userRes.rowCount > 0) {
    const user = userRes.rows[0];
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await query(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [`prt-${uuidv4()}`, user.id, tokenHash, expiry]
    );

    const orgRes = await query(
      `SELECT organization_id FROM organization_memberships WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );
    const orgId = orgRes.rows[0]?.organization_id;

    if (orgId) {
      await enqueueOutbox({
        organizationId: orgId,
        eventType: 'USER_PASSWORD_RESET_REQUESTED',
        payload: {
          userId: user.id,
          email: user.email,
          fullName: user.full_name,
          resetToken: rawResetToken,
          resetUrl: `${env.ADMIN_URL}/reset-password?token=${rawResetToken}`
        }
      });
    }

    if (process.env.NODE_ENV === 'test') {
      return res.json({
        message: 'If an account exists with this email, password reset instructions have been dispatched.',
        resetTokenPreview: rawResetToken
      });
    }
  }

  res.json({
    message: 'If an account exists with this email, password reset instructions have been dispatched.'
  });
});

// POST /api/v1/auth/reset-password (T-046)
identityRouter.post('/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Token and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const tokenRes = await query(
    `SELECT id, user_id, expires_at, is_used
     FROM password_reset_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );

  if (tokenRes.rowCount === 0) {
    return res.status(400).json({ error: 'INVALID_TOKEN', message: 'Invalid or expired password reset token' });
  }

  const tokenRecord = tokenRes.rows[0];
  if (tokenRecord.is_used || new Date() > new Date(tokenRecord.expires_at)) {
    return res.status(400).json({ error: 'EXPIRED_TOKEN', message: 'Password reset token has already been used or expired' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await withTransaction(async (client) => {
    // 1. Update password
    await client.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [newHash, tokenRecord.user_id]
    );

    // 2. Mark token used
    await client.query(
      `UPDATE password_reset_tokens SET is_used = TRUE WHERE id = $1`,
      [tokenRecord.id]
    );

    // 3. Revoke existing active sessions
    await client.query(
      `DELETE FROM sessions WHERE user_id = $1`,
      [tokenRecord.user_id]
    );
  });

  res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
});

// POST /api/v1/auth/mfa/enroll (T-046)
identityRouter.post('/mfa/enroll', requireAuth, async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'An authenticated account is required' });
  }

  const user = await query(
    `SELECT mfa_enabled FROM users WHERE id = $1`,
    [userId]
  );
  if (user.rowCount === 0) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Account was not found' });
  }
  if (user.rows[0].mfa_enabled) {
    return res.status(409).json({ error: 'MFA_ALREADY_ENABLED', message: 'MFA is already enabled. Use the account security recovery flow before replacing an active authenticator.' });
  }

  const secret = encodeBase32(crypto.randomBytes(20));
  const encryptedSecret = encryptMfaSecret(secret, env.JWT_SECRET);
  const recoveryCodes = Array.from(
    { length: 8 },
    () => crypto.randomBytes(12).toString('hex').toUpperCase()
  );
  const recoveryCodeHashes = recoveryCodes.map((code) => hashRecoveryCode(code, env.JWT_SECRET));

  const saved = await query(
    `UPDATE users
     SET mfa_secret = $1,
         mfa_enabled = FALSE,
         mfa_last_counter = -1,
         mfa_recovery_codes = $2::jsonb,
         mfa_failed_attempts = 0,
         mfa_locked_until = NULL
     WHERE id = $3 AND mfa_enabled = FALSE
     RETURNING id`,
    [encryptedSecret, JSON.stringify(recoveryCodeHashes), userId]
  );
  if (saved.rowCount === 0) {
    return res.status(409).json({ error: 'MFA_ENROLLMENT_CONFLICT', message: 'The MFA enrollment state changed. Refresh and try again.' });
  }

  const label = encodeURIComponent(`BillionBiz:${req.auth?.email || userId}`);
  const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=BillionBiz&algorithm=SHA1&digits=6&period=30`;

  return res.json({
    secret,
    otpauthUrl,
    recoveryCodes,
    message: 'Scan the QR code or enter the secret in your authenticator app, then verify a current code to enable MFA. Save the recovery codes securely; they are shown only once.'
  });
});

// POST /api/v1/auth/mfa/verify (RFC 6238 TOTP / single-use recovery code)
identityRouter.post('/mfa/verify', requireAuth, async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  const recoveryCode = typeof req.body?.recoveryCode === 'string' ? req.body.recoveryCode.trim() : '';

  if (!code && !recoveryCode) {
    return res.status(400).json({ error: 'MISSING_CODE', message: 'Enter a 6-digit authenticator code or a recovery code' });
  }
  if (code && recoveryCode) {
    return res.status(400).json({ error: 'AMBIGUOUS_MFA_CREDENTIAL', message: 'Submit either an authenticator code or a recovery code, not both' });
  }

  const userResult = await query(
    `SELECT mfa_secret, mfa_enabled, mfa_last_counter, mfa_recovery_codes,
            mfa_failed_attempts, mfa_locked_until
     FROM users
     WHERE id = $1`,
    [userId]
  );
  if (userResult.rowCount === 0) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Account was not found' });
  }

  const user = userResult.rows[0];
  if (!user.mfa_secret) {
    return res.status(400).json({ error: 'MFA_NOT_ENROLLED', message: 'Start MFA enrollment before verifying a code' });
  }

  if (user.mfa_locked_until && new Date(user.mfa_locked_until).getTime() > Date.now()) {
    const retryAfterSeconds = Math.max(1, Math.ceil((new Date(user.mfa_locked_until).getTime() - Date.now()) / 1000));
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({ error: 'MFA_ATTEMPTS_EXCEEDED', message: 'Too many incorrect MFA attempts. Try again after the temporary lock expires.', retryAfterSeconds });
  }

  if (user.mfa_locked_until && new Date(user.mfa_locked_until).getTime() <= Date.now()) {
    await query(
      `UPDATE users SET mfa_failed_attempts = 0, mfa_locked_until = NULL WHERE id = $1`,
      [userId]
    );
  }

  const registerFailedAttempt = async () => {
    const failed = await query(
      `UPDATE users
       SET mfa_failed_attempts = mfa_failed_attempts + 1,
           mfa_locked_until = CASE
             WHEN mfa_failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
             ELSE mfa_locked_until
           END
       WHERE id = $1
       RETURNING mfa_failed_attempts, mfa_locked_until`,
      [userId]
    );
    const attempts = Number(failed.rows[0]?.mfa_failed_attempts || 0);
    const locked = attempts >= 5;
    if (locked) res.setHeader('Retry-After', '900');
    return res.status(locked ? 429 : 401).json({
      error: locked ? 'MFA_ATTEMPTS_EXCEEDED' : 'INVALID_MFA_CODE',
      message: locked
        ? 'Too many incorrect MFA attempts. Try again in 15 minutes.'
        : 'The authenticator code or recovery code is invalid.'
    });
  };

  if (recoveryCode) {
    if (recoveryCode.length > 128) {
      return res.status(400).json({ error: 'INVALID_RECOVERY_CODE', message: 'Recovery code format is invalid' });
    }
    const recoveryHash = hashRecoveryCode(recoveryCode, env.JWT_SECRET);
    const consumed = await query(
      `UPDATE users
       SET mfa_recovery_codes = (
         SELECT COALESCE(jsonb_agg(code_hash ORDER BY ordinal), '[]'::jsonb)
         FROM jsonb_array_elements_text(mfa_recovery_codes)
           WITH ORDINALITY AS recovery(code_hash, ordinal)
         WHERE code_hash <> $1::text
       ),
       mfa_enabled = TRUE,
       mfa_failed_attempts = 0,
       mfa_locked_until = NULL
       WHERE id = $2
         AND mfa_recovery_codes @> jsonb_build_array($1::text)
         AND (mfa_locked_until IS NULL OR mfa_locked_until <= NOW())
       RETURNING id`,
      [recoveryHash, userId]
    );
    if (consumed.rowCount === 0) {
      return registerFailedAttempt();
    }
    const sessionToken = generateToken({ ...req.auth!, mfaVerified: true });
    return res.json({
      message: 'Recovery code accepted. This recovery code has been consumed and cannot be used again.',
      mfaEnabled: true,
      recoveryCodeConsumed: true,
      token: sessionToken
    });
  }

  let secret: string;
  try {
    secret = decryptMfaSecret(String(user.mfa_secret), env.JWT_SECRET);
  } catch {
    return res.status(409).json({
      error: 'MFA_REENROLL_REQUIRED',
      message: 'The stored authenticator secret is not in the supported encrypted format. Enroll a new authenticator.'
    });
  }

  const matchedCounter = findValidTotpCounter(
    secret,
    code,
    Date.now(),
    1,
    Number(user.mfa_last_counter ?? -1)
  );
  if (matchedCounter === null) {
    // Distinguish a valid TOTP counter that has already been consumed from
    // an arbitrary incorrect code. This preserves replay protection while
    // returning a stable conflict response to legitimate retry attempts.
    const previouslyUsedCounter = findValidTotpCounter(
      secret,
      code,
      Date.now(),
      1,
      -1
    );
    if (
      previouslyUsedCounter !== null &&
      previouslyUsedCounter <= Number(user.mfa_last_counter ?? -1)
    ) {
      return res.status(409).json({
        error: 'MFA_CODE_ALREADY_USED',
        message: 'This authenticator code has already been used. Wait for the next code and try again.'
      });
    }
    return registerFailedAttempt();
  }

  const activated = await query(
    `UPDATE users
     SET mfa_enabled = TRUE,
         mfa_last_counter = $1,
         mfa_failed_attempts = 0,
         mfa_locked_until = NULL
     WHERE id = $2
       AND mfa_secret = $3
       AND mfa_last_counter < $1
       AND (mfa_locked_until IS NULL OR mfa_locked_until <= NOW())
     RETURNING id`,
    [matchedCounter, userId, user.mfa_secret]
  );
  if (activated.rowCount === 0) {
    return res.status(409).json({
      error: 'MFA_CODE_ALREADY_USED',
      message: 'This authenticator code has already been used. Wait for the next code and try again.'
    });
  }

  const sessionToken = generateToken({ ...req.auth!, mfaVerified: true });
  return res.json({ message: 'MFA successfully enabled', mfaEnabled: true, token: sessionToken });
});

// POST /api/v1/auth/mfa/challenge/verify
identityRouter.post('/mfa/challenge/verify', async (req: Request, res: Response) => {
  const challengeToken = typeof req.body?.challengeToken === 'string' ? req.body.challengeToken.trim() : '';
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  const recoveryCode = typeof req.body?.recoveryCode === 'string' ? req.body.recoveryCode.trim() : '';

  if (!challengeToken || (!code && !recoveryCode) || (code && recoveryCode)) {
    return res.status(400).json({ error: 'INVALID_MFA_CHALLENGE_INPUT', message: 'Submit the login challenge and either an authenticator code or a recovery code.' });
  }

  const verified = await verifyMfaLoginChallenge(challengeToken, code, recoveryCode);
  if (!verified.ok) {
    if (verified.retryAfterSeconds) res.setHeader('Retry-After', String(verified.retryAfterSeconds));
    return res.status(verified.status).json({ error: verified.error, message: verified.message, retryAfterSeconds: verified.retryAfterSeconds });
  }

  const userRes = await query(
    `SELECT id, email, full_name, is_platform_admin, email_verified, mfa_enabled
     FROM users WHERE id = $1 AND mfa_enabled = TRUE`,
    [verified.userId]
  );
  if (userRes.rowCount === 0) {
    return res.status(401).json({ error: 'MFA_ACCOUNT_UNAVAILABLE', message: 'The account could not complete MFA login. Sign in again.' });
  }
  const user = userRes.rows[0];

  const orgsRes = await query(
    `SELECT o.id AS organization_id, o.name AS organization_name, om.role,
            s.id AS store_id, s.name AS store_name, s.slug AS store_slug
     FROM organization_memberships om
     JOIN organizations o ON o.id = om.organization_id
     LEFT JOIN stores s ON s.organization_id = o.id
     WHERE om.user_id = $1`,
    [user.id]
  );
  const primaryOrg = orgsRes.rows[0]?.organization_id;
  const primaryStore = orgsRes.rows[0]?.store_id;
  const role = orgsRes.rows[0]?.role || 'OWNER';

  const token = generateToken({
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    isPlatformAdmin: user.is_platform_admin,
    organizationId: primaryOrg,
    storeId: primaryStore,
    role,
    mfaVerified: true
  });

  await recordAudit({
    organizationId: primaryOrg,
    storeId: primaryStore,
    actorId: user.id,
    action: 'USER_LOGIN_MFA',
    targetType: 'USER',
    targetId: user.id,
    ipAddress: req.ip
  });

  const portalDestination = resolvePortalDestination(role, user.is_platform_admin);
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      isPlatformAdmin: user.is_platform_admin,
      emailVerified: user.email_verified,
      mfaEnabled: true
    },
    organizations: orgsRes.rows,
    portalDestination
  });
});

// POST /api/v1/auth/google (Google OIDC - T-046)
identityRouter.post('/google', async (req: Request, res: Response) => {
  try {
    let { googleId, email, fullName, credential, idToken, code, redirectUri } = req.body;

    const tokenToVerify = credential || idToken;

    // 1. If an ID Token is provided (Google Identity Services GIS credential)
    if (tokenToVerify) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenToVerify)}`);
        if (!verifyRes.ok) {
          const errData = await verifyRes.json().catch(() => ({})) as any;
          return res.status(401).json({
            error: 'INVALID_GOOGLE_TOKEN',
            message: errData.error_description || 'Google ID token verification failed'
          });
        }

        const tokenInfo = await verifyRes.json() as any;
        const expectedClientId = process.env.GOOGLE_CLIENT_ID;

        // Verify audience matches our Google Client ID if configured
        if (expectedClientId && tokenInfo.aud !== expectedClientId) {
          return res.status(401).json({
            error: 'AUDIENCE_MISMATCH',
            message: 'Google token was not issued for this application'
          });
        }

        if (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true) {
          return res.status(400).json({
            error: 'UNVERIFIED_EMAIL',
            message: 'Google account email is not verified'
          });
        }

        googleId = tokenInfo.sub;
        email = tokenInfo.email;
        fullName = tokenInfo.name || `${tokenInfo.given_name || ''} ${tokenInfo.family_name || ''}`.trim() || 'Google User';
      } catch (err: any) {
        return res.status(500).json({
          error: 'GOOGLE_VERIFY_ERROR',
          message: 'Unable to communicate with Google authentication servers'
        });
      }
    } else if (code) {
      // 2. Authorization code exchange
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return res.status(500).json({
          error: 'OAUTH_CONFIG_ERROR',
          message: 'Google OAuth client credentials are not configured on the server'
        });
      }

      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri || 'postmessage',
            grant_type: 'authorization_code'
          })
        });

        if (!tokenRes.ok) {
          const errData = await tokenRes.json().catch(() => ({})) as any;
          return res.status(400).json({
            error: 'CODE_EXCHANGE_FAILED',
            message: errData.error_description || 'Failed to exchange authorization code with Google'
          });
        }

        const tokenData = await tokenRes.json() as any;
        if (!tokenData.id_token) {
          return res.status(401).json({
            error: 'MISSING_GOOGLE_ID_TOKEN',
            message: 'Google did not return an ID token for this authorization code.'
          });
        }

        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`);
        if (!verifyRes.ok) {
          return res.status(401).json({
            error: 'INVALID_GOOGLE_TOKEN',
            message: 'Google ID token verification failed.'
          });
        }

        const tokenInfo = await verifyRes.json() as any;
        if (tokenInfo.aud !== clientId) {
          return res.status(401).json({
            error: 'AUDIENCE_MISMATCH',
            message: 'Google token was not issued for this application.'
          });
        }
        if (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true) {
          return res.status(400).json({
            error: 'UNVERIFIED_EMAIL',
            message: 'Google account email is not verified.'
          });
        }

        googleId = tokenInfo.sub;
        email = tokenInfo.email;
        fullName = tokenInfo.name || 'Google User';
      } catch (err: any) {
        return res.status(500).json({
          error: 'GOOGLE_OAUTH_FAILED',
          message: 'OAuth authorization exchange failed'
        });
      }
    }

    if (!email || !googleId) {
      return res.status(400).json({
        error: 'VALIDATION_FAILED',
        message: 'Google email and Google ID are required to complete authentication'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    let userRes = await query(
      `SELECT id, email, full_name, is_platform_admin, email_verified, mfa_enabled 
       FROM users 
       WHERE email = $1`,
      [cleanEmail]
    );

    let userId: string;
    let isNewUser = false;

    if (userRes.rowCount === 0) {
      userId = `usr-${uuidv4()}`;
      const randomPass = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      await query(
        `INSERT INTO users (id, email, password_hash, full_name, email_verified, google_id)
         VALUES ($1, $2, $3, $4, TRUE, $5)`,
        [userId, cleanEmail, randomPass, fullName || 'Google User', googleId]
      );
      isNewUser = true;
    } else {
      userId = userRes.rows[0].id;
      await query(
        `UPDATE users 
         SET google_id = $1, email_verified = TRUE, updated_at = NOW() 
         WHERE id = $2`,
        [googleId, userId]
      );
    }

    // Fetch existing organization & store memberships
    let orgsRes = await query(
      `SELECT o.id as organization_id, o.name as organization_name, om.role,
              s.id as store_id, s.name as store_name, s.slug as store_slug
       FROM organization_memberships om
       JOIN organizations o ON o.id = om.organization_id
       LEFT JOIN stores s ON s.organization_id = o.id
       WHERE om.user_id = $1`,
      [userId]
    );

    let primaryOrg = orgsRes.rows[0]?.organization_id;
    let primaryStore = orgsRes.rows[0]?.store_id;
    let primaryStoreName = orgsRes.rows[0]?.store_name || `${fullName || 'My Store'}'s Store`;
    let primaryStoreSlug = orgsRes.rows[0]?.store_slug || 'my-store';
    let role = orgsRes.rows[0]?.role || 'OWNER';

    // If brand new user with no store yet, provision first tenant workspace
    if (isNewUser || !primaryOrg || !primaryStore) {
      primaryOrg = primaryOrg || `org-${uuidv4()}`;
      primaryStore = primaryStore || `str-${uuidv4()}`;
      const storeName = `${fullName || 'My Store'}'s Store`;
      const slugBase = generateCandidateSlug(fullName || cleanEmail.split('@')[0] || 'merchant').slice(0, 44) || 'merchant';
      const storeSlug = `${slugBase}-${uuidv4().substring(0, 8)}`;
      const slugValidation = validateSubdomainSlug(storeSlug);
      if (!slugValidation.isValid) {
        throw new Error(`Unable to create a valid storefront subdomain: ${slugValidation.error || 'invalid slug'}`);
      }
      primaryStoreName = storeName;
      primaryStoreSlug = slugValidation.normalizedSlug;

      await withTransaction(async (client) => {
        await client.query(
          `INSERT INTO organizations (id, name, slug)
           VALUES ($1, $2, $3)`,
          [primaryOrg, `${storeName} Group`, primaryStoreSlug]
        );
        await client.query(
          `INSERT INTO stores (id, organization_id, name, slug, status)
           VALUES ($1, $2, $3, $4, 'ACTIVE')`,
          [primaryStore, primaryOrg, storeName, primaryStoreSlug]
        );
        await client.query(
          `INSERT INTO organization_memberships (id, organization_id, user_id, role)
           VALUES ($1, $2, $3, 'OWNER')`,
          [`mem-${uuidv4()}`, primaryOrg, userId]
        );
        await client.query(
          `INSERT INTO store_capabilities (store_id, product_commerce_enabled, appointments_enabled)
           VALUES ($1, TRUE, TRUE)
           ON CONFLICT (store_id) DO NOTHING`,
          [primaryStore]
        );
        await client.query(
          `INSERT INTO store_locations (id, store_id, name, is_primary, is_active)
           VALUES ($1, $2, 'Main Location', TRUE, TRUE)
           ON CONFLICT DO NOTHING`,
          [`loc-${uuidv4()}`, primaryStore]
        );

        // Google-created merchants must receive the same domain, settings,
        // theme, navigation, page catalog and initial publication as all other
        // registration paths.
        await provisionDefaultStorefront({
          client,
          storeId: primaryStore,
          storeName,
          storeSlug: primaryStoreSlug,
          mode: 'BOTH',
          userId
        });
      });

      // Refetch updated orgs
      orgsRes = await query(
        `SELECT o.id as organization_id, o.name as organization_name, om.role,
                s.id as store_id, s.name as store_name, s.slug as store_slug
         FROM organization_memberships om
         JOIN organizations o ON o.id = om.organization_id
         LEFT JOIN stores s ON s.organization_id = o.id
         WHERE om.user_id = $1`,
        [userId]
      );
    }

    const currentGoogleUser = await query(
      `SELECT id, email, full_name, mfa_enabled FROM users WHERE id = $1`,
      [userId]
    );
    if (currentGoogleUser.rows[0]?.mfa_enabled) {
      return respondWithMfaChallenge(res, currentGoogleUser.rows[0]);
    }

    const token = generateToken({
      userId,
      email: cleanEmail,
      fullName: fullName || 'Google User',
      isPlatformAdmin: false,
      organizationId: primaryOrg,
      storeId: primaryStore,
      role
    });

    await recordAudit({
      organizationId: primaryOrg,
      storeId: primaryStore,
      actorId: userId,
      action: isNewUser ? 'USER_REGISTER_GOOGLE' : 'USER_LOGIN_GOOGLE',
      targetType: 'USER',
      targetId: userId,
      ipAddress: req.ip
    });

    const portalDestination = resolvePortalDestination(role, false);

    res.json({
      token,
      user: {
        id: userId,
        email: cleanEmail,
        fullName: fullName || 'Google User',
        emailVerified: true
      },
      organizations: orgsRes.rows,
      portalDestination,
      isNewUser
    });
  } catch (err: any) {
    console.error('[Google OAuth Error]', err);
    res.status(500).json({
      error: 'GOOGLE_AUTH_FAILED',
      message: err.message || 'An unexpected error occurred during Google authentication'
    });
  }
});

// GET /api/v1/auth/portal-route (T-047)
identityRouter.get('/portal-route', requireAuth, async (req: Request, res: Response) => {
  const role = req.auth?.role || 'MEMBER';
  const isPlatformAdmin = req.auth?.isPlatformAdmin || false;
  const destination = resolvePortalDestination(role, isPlatformAdmin);
  res.json({
    role,
    isPlatformAdmin,
    destination
  });
});

// POST /api/v1/auth/pin-login (POS Cashier PIN Login)
identityRouter.post('/pin-login', async (req: Request, res: Response) => {
  const { counterId, pin } = req.body;
  if (!counterId || !pin) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Counter ID and PIN required' });
  }

  // Get counter and store
  const counterRes = await query(
    `SELECT c.id, c.name as counter_name, c.store_id, c.location_id, s.organization_id, s.name as store_name
     FROM counters c
     JOIN stores s ON s.id = c.store_id
     WHERE c.id = $1 AND c.is_active = TRUE`,
    [counterId]
  );

  if (counterRes.rowCount === 0) {
    return res.status(404).json({ error: 'COUNTER_NOT_FOUND', message: 'Active counter not found' });
  }

  const { store_id, organization_id } = counterRes.rows[0];

  // Find staff profiles in this org with matching PIN
  const staffRes = await query(
    `SELECT sp.id, sp.display_name, sp.pin_hash, sp.user_id, u.email, u.mfa_enabled
     FROM staff_profiles sp
     LEFT JOIN users u ON u.id = sp.user_id
     WHERE sp.organization_id = $1 AND sp.is_active = TRUE AND sp.pin_hash IS NOT NULL`,
    [organization_id]
  );

  let matchedStaff: any = null;
  for (const s of staffRes.rows) {
    const isMatch = await bcrypt.compare(pin, s.pin_hash);
    if (isMatch) {
      matchedStaff = s;
      break;
    }
  }

  if (!matchedStaff) {
    return res.status(401).json({ error: 'INVALID_PIN', message: 'Invalid staff PIN for this counter' });
  }
  if (matchedStaff.mfa_enabled === true && matchedStaff.user_id) {
    return respondWithMfaChallenge(res, {
      id: matchedStaff.user_id,
      email: matchedStaff.email,
      full_name: matchedStaff.display_name
    });
  }

  const token = generateToken({
    userId: matchedStaff.user_id || `staff-${matchedStaff.id}`,
    email: matchedStaff.email || `${matchedStaff.display_name}@pos.local`,
    fullName: matchedStaff.display_name,
    isPlatformAdmin: false,
    organizationId: organization_id,
    storeId: store_id,
    role: 'CASHIER'
  });

  const portalDestination = resolvePortalDestination('CASHIER', false);

  res.json({
    token,
    staff: {
      id: matchedStaff.id,
      name: matchedStaff.display_name
    },
    counter: counterRes.rows[0],
    portalDestination
  });
});

// GET /api/v1/auth/me
identityRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  const storeId = req.auth?.storeId;
  const orgId = req.auth?.organizationId;

  const userRes = await query(
    `SELECT id, email, full_name, is_platform_admin, email_verified, mfa_enabled
     FROM users
     WHERE id = $1`,
    [userId]
  );

  let storeName: string | null = null;
  let storeSlug: string | null = null;
  let organizationName: string | null = null;

  if (storeId) {
    const sRes = await query(`SELECT name, slug FROM stores WHERE id = $1`, [storeId]);
    if (sRes.rows.length > 0) {
      storeName = sRes.rows[0].name;
      storeSlug = sRes.rows[0].slug;
    }
  }

  if (orgId) {
    const oRes = await query(`SELECT name FROM organizations WHERE id = $1`, [orgId]);
    if (oRes.rows.length > 0) {
      organizationName = oRes.rows[0].name;
    }
  }

  const checklistRes = storeId ? await query(
    `SELECT step_key, title, description, is_completed, completed_at
     FROM onboarding_checklists
     WHERE store_id = $1
     ORDER BY created_at ASC`,
    [storeId]
  ) : { rows: [] };

  const portalDestination = resolvePortalDestination(req.auth?.role || 'MEMBER', req.auth?.isPlatformAdmin);

  res.json({
    user: userRes.rows[0] || req.auth,
    role: req.auth?.role,
    storeId,
    storeName,
    storeSlug,
    organizationId: orgId,
    organizationName,
    onboardingChecklist: checklistRes.rows,
    portalDestination,
    permissions: req.auth?.permissions || []
  });
});

// GET /api/v1/auth/onboarding-checklist
identityRouter.get('/onboarding-checklist', requireAuth, async (req: Request, res: Response) => {
  const storeId = (req.headers['x-store-id'] as string) || req.auth?.storeId;
  if (!storeId) {
    return res.status(400).json({ error: 'MISSING_STORE', message: 'Store context required' });
  }

  const checklistRes = await query(
    `SELECT id, step_key, title, description, is_completed, completed_at
     FROM onboarding_checklists
     WHERE store_id = $1
     ORDER BY created_at ASC`,
    [storeId]
  );

  res.json({ checklist: checklistRes.rows });
});

// GET /api/v1/auth/check-domain (Real-Time Subdomain Availability Checker)
identityRouter.get('/check-domain', async (req: Request, res: Response) => {
  const rawSlug = (req.query.slug as string || req.query.domain as string || '');
  const validation = validateSubdomainSlug(rawSlug);

  if (!validation.isValid) {
    return res.status(400).json({
      available: false,
      slug: validation.normalizedSlug,
      error: validation.errorCode,
      message: validation.error
    });
  }

  const existing = await query(
    `SELECT id FROM stores WHERE LOWER(slug) = $1`,
    [validation.normalizedSlug]
  );

  if (existing.rowCount && existing.rowCount > 0) {
    return res.status(409).json({
      available: false,
      slug: validation.normalizedSlug,
      fullDomain: `${validation.normalizedSlug}.${PLATFORM_MAIN_DOMAIN}`,
      error: 'SUBDOMAIN_TAKEN',
      message: 'This store subdomain is already taken. Please try another one.'
    });
  }

  res.status(200).json({
    available: true,
    slug: validation.normalizedSlug,
    fullDomain: `${validation.normalizedSlug}.${PLATFORM_MAIN_DOMAIN}`,
    message: 'Domain is available!'
  });
});

/**
 * Normalizes email or international mobile phone number
 */
function normalizeIdentifier(raw: string): { isEmail: boolean; value: string } {
  const trimmed = (raw || '').trim();
  if (trimmed.includes('@') || /[a-zA-Z]/.test(trimmed)) {
    return { isEmail: true, value: trimmed.toLowerCase() };
  }
  // Mobile phone number: normalize country code and digits
  const cleaned = trimmed.replace(/[\s\-\(\)]/g, '');
  return { isEmail: false, value: cleaned.startsWith('+') ? cleaned : `+${cleaned}` };
}

// POST /api/v1/auth/otp/send (Streamlined Single-Input OTP Dispatch)
identityRouter.post('/otp/send', async (req: Request, res: Response) => {
  const { identifier, type } = req.body;
  if (!identifier || typeof identifier !== 'string') {
    return res.status(400).json({ error: 'INVALID_IDENTIFIER', message: 'Email or mobile number is required' });
  }

  const { isEmail, value } = normalizeIdentifier(identifier);
  const otpType = typeof type === 'string' ? type.trim().toUpperCase() : 'REGISTER';
  if (!['REGISTER', 'LOGIN', 'RECOVERY'].includes(otpType)) {
    return res.status(400).json({ error: 'INVALID_OTP_TYPE', message: 'Unsupported verification flow' });
  }
  // Validate format strictly
  if (isEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value)) {
      return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Please enter a valid email address' });
    }
  } else {
    const digitsOnly = value.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15 || !/^\+[0-9]{10,15}$/.test(value)) {
      return res.status(400).json({ error: 'INVALID_PHONE', message: 'Please enter a valid 10-digit mobile number' });
    }
  }

  // Check existing user for login/register constraints
  const digitsOnly = value.replace(/[^0-9]/g, '');
  const last10Digits = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

  let existingUser;
  if (isEmail) {
    existingUser = await query(`SELECT id, email, phone FROM users WHERE LOWER(email) = LOWER($1)`, [value]);
  } else {
    existingUser = await query(
      `SELECT id, email, phone FROM users 
       WHERE phone = $1 
          OR phone = $2 
          OR RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $3`,
      [value, digitsOnly, last10Digits]
    );
  }

  if (otpType === 'LOGIN' && existingUser.rowCount === 0) {
    return res.status(404).json({
      error: 'USER_NOT_FOUND',
      message: `No registered account found with ${isEmail ? 'email' : 'mobile number'} ${value}. Please register your store first.`
    });
  }

  if (otpType === 'REGISTER' && existingUser.rowCount && existingUser.rowCount > 0) {
    return res.status(409).json({
      error: 'USER_ALREADY_EXISTS',
      message: `This ${isEmail ? 'email address' : 'mobile number'} is already registered. Please log in.`
    });
  }

  if (!isEmail) {
    return res.status(503).json({
      error: 'SMS_PROVIDER_NOT_CONFIGURED',
      message: 'Mobile OTP delivery is not configured for this platform yet. Use email verification or configure a supported SMS provider.'
    });
  }

  // Enforce a recipient-level resend limit on the server. A client-side timer
  // is only a usability feature and can be bypassed by calling this endpoint.
  const recentOtpRequests = await query(
    `SELECT COUNT(*)::int AS total
     FROM verification_otps
     WHERE identifier = $1::varchar
       AND type = $2::varchar
       AND created_at > NOW() - INTERVAL '15 minutes'`,
    [value, otpType]
  );
  if (Number(recentOtpRequests.rows[0]?.total || 0) >= 5) {
    res.setHeader('Retry-After', '900');
    return res.status(429).json({
      error: 'OTP_SEND_RATE_LIMITED',
      message: 'Too many verification codes have been requested for this address or number. Try again after 15 minutes.'
    });
  }

  // Generate 6-digit cryptographic code
  const code = crypto.randomInt(100000, 1000000).toString();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate previous unused OTPs for this identifier
  await query(
    `UPDATE verification_otps SET is_used = TRUE WHERE identifier = $1 AND type = $2 AND is_used = FALSE`,
    [value, otpType]
  );

  // Insert new OTP record
  await query(
    `INSERT INTO verification_otps (id, identifier, code, type, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [`otp-${uuidv4()}`, value, codeHash, otpType, expiresAt]
  );

  // Do not log OTPs or full recipient identifiers.

  // Production Real-Time Email Dispatch via Resend
  if (isEmail) {
    try {
      const emailResult = await sendEmail({
        to: value,
        subject: `Your BillionBiz Verification Code: ${code}`,
        text: `Your BillionBiz verification code is ${code}. It expires in 10 minutes.\n\nIf you did not request this code, please ignore this email.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #0f172a;">
            <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="margin-bottom: 20px;">
                <span style="display: inline-block; padding: 4px 10px; background: #eff6ff; color: #2563eb; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Security Verification</span>
                <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 6px 0; letter-spacing: -0.02em;">
                  ${otpType === 'LOGIN' ? 'Sign in to BillionBiz' : 'Verify Your Email'}
                </h1>
                <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">
                  Use the 6-digit verification code below to complete your ${otpType === 'LOGIN' ? 'sign-in request' : 'store registration'}. This code expires in <strong>10 minutes</strong>.
                </p>
              </div>
              
              <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <div style="font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">
                  ${code}
                </div>
              </div>

              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0;">
                If you didn't request this verification code, someone may have entered your email by mistake. You can safely ignore this message.
              </p>

              <div style="padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} BillionBiz Platform. All rights reserved.</p>
                <p style="margin: 4px 0 0 0;">Secure transactional email delivered via Resend.</p>
              </div>
            </div>
          </div>
        `
      });

      if (!emailResult.success) {
        const isQuota = emailResult.error?.name === 'daily_quota_exceeded' ||
          String(emailResult.error?.message || '').toLowerCase().includes('quota');
        await query(
          `UPDATE verification_otps SET is_used = TRUE
           WHERE identifier = $1 AND type = $2 AND is_used = FALSE`,
          [value, otpType]
        );
        return res.status(isQuota ? 503 : 502).json({
          error: isQuota ? 'EMAIL_PROVIDER_QUOTA_EXCEEDED' : 'EMAIL_DELIVERY_FAILED',
          message: isQuota
            ? 'Email delivery is temporarily unavailable because the provider quota has been reached. Try again after the provider limit resets.'
            : 'Unable to deliver the verification email. Check the configured email provider and try again.'
        });
      }
    } catch (sendErr: any) {
      console.error('[AUTH OTP] Email delivery failed:', sendErr.message);
      await query(
        `UPDATE verification_otps SET is_used = TRUE
         WHERE identifier = $1 AND type = $2 AND is_used = FALSE`,
        [value, otpType]
      );
      return res.status(502).json({
        error: 'EMAIL_DELIVERY_FAILED',
        message: 'Unable to deliver the verification email. Please try again.'
      });

    }
  }

  res.json({
    success: true,
    message: 'Verification code sent to your email',
    channel: 'EMAIL',
    identifier: value,
    expiresInSeconds: 600,
    ...(process.env.NODE_ENV === 'test' ? { testCode: code } : {}),
    ...(env.NODE_ENV === 'development' && env.EMAIL_PROVIDER === 'console' ? { devOtpPreview: code } : {})
  });
});

// POST /api/v1/auth/otp/verify (Verify OTP Code)
identityRouter.post('/otp/verify', async (req: Request, res: Response) => {
  const { identifier, code, type } = req.body;
  if (!identifier || !code) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Identifier and 6-digit code are required' });
  }

  const { isEmail, value } = normalizeIdentifier(identifier);
  const otpType = typeof type === 'string' ? type.trim().toUpperCase() : 'REGISTER';
  if (!['REGISTER', 'LOGIN', 'RECOVERY'].includes(otpType)) {
    return res.status(400).json({ error: 'INVALID_OTP_TYPE', message: 'Unsupported verification flow' });
  }

  const otpCheck = await consumeOtp(value, otpType, String(code).trim());
  if (!otpCheck.ok) {
    return res.status(otpCheck.status).json({ error: otpCheck.error, message: otpCheck.message });
  }

  if (otpType === 'LOGIN') {
    // Fetch user and log in immediately
    const userRes = await query(
      isEmail
        ? `SELECT id, email, full_name, phone, is_platform_admin, email_verified, mfa_enabled FROM users WHERE email = $1`
        : `SELECT id, email, full_name, phone, is_platform_admin, email_verified, mfa_enabled FROM users WHERE phone = $1`,
      [value]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User record not found' });
    }

    const user = userRes.rows[0];
    if (user.mfa_enabled) {
      return respondWithMfaChallenge(res, user);
    }
    const orgsRes = await query(
      `SELECT o.id as organization_id, o.name as organization_name, om.role,
              s.id as store_id, s.name as store_name, s.slug as store_slug
       FROM organization_memberships om
       JOIN organizations o ON o.id = om.organization_id
       LEFT JOIN stores s ON s.organization_id = o.id
       WHERE om.user_id = $1`,
      [user.id]
    );

    const primaryOrg = orgsRes.rows[0]?.organization_id;
    const primaryStore = orgsRes.rows[0]?.store_id;
    const role = orgsRes.rows[0]?.role || 'OWNER';

    const token = generateToken({
      userId: user.id,
      email: user.email || `${user.phone}@billionbiz.internal`,
      fullName: user.full_name,
      isPlatformAdmin: user.is_platform_admin,
      organizationId: primaryOrg,
      storeId: primaryStore,
      role
    });

    await recordAudit({
      organizationId: primaryOrg,
      storeId: primaryStore,
      actorId: user.id,
      action: 'USER_LOGIN_OTP',
      targetType: 'USER',
      targetId: user.id,
      ipAddress: req.ip
    });

    const portalDestination = resolvePortalDestination(role, user.is_platform_admin);

    return res.json({
      success: true,
      token,
      user,
      organizations: orgsRes.rows,
      portalDestination
    });
  }

  // For REGISTER
  res.json({
    success: true,
    verified: true,
    identifier: value,
    message: 'Verification code confirmed successfully'
  });
});

// POST /api/v1/auth/login-unified (Unified Single-Field Login by Password OR OTP)
identityRouter.post('/login-unified', async (req: Request, res: Response) => {
  const { identifier, password, otp } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'MISSING_IDENTIFIER', message: 'Email or mobile number is required' });
  }

  const { isEmail, value } = normalizeIdentifier(identifier);

  const userRes = await query(
    isEmail
      ? `SELECT id, email, password_hash, full_name, phone, is_platform_admin, email_verified, mfa_enabled FROM users WHERE email = $1`
      : `SELECT id, email, password_hash, full_name, phone, is_platform_admin, email_verified, mfa_enabled FROM users WHERE phone = $1`,
    [value]
  );

  if (userRes.rowCount === 0) {
    return res.status(401).json({
      error: 'INVALID_CREDENTIALS',
      message: `No account exists with this ${isEmail ? 'email' : 'mobile number'}. Please check or register.`
    });
  }

  const user = userRes.rows[0];

  // If OTP is provided, verify and atomically consume it before issuing a session.
  if (otp) {
    const otpCheck = await consumeOtp(value, 'LOGIN', String(otp).trim());
    if (!otpCheck.ok) {
      return res.status(otpCheck.status === 400 ? 401 : otpCheck.status).json({
        error: otpCheck.error,
        message: otpCheck.message
      });
    }

  } else if (password) {
    if (!user.password_hash) {
      return res.status(400).json({
        error: 'PASSWORD_NOT_SET',
        message: 'No password is set for this account. Please use "Login via OTP" instead.'
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Incorrect password entered' });
    }
  } else {
    return res.status(400).json({ error: 'MISSING_AUTH_FACTOR', message: 'Password or OTP code must be provided' });
  }

  if (user.mfa_enabled) {
    return respondWithMfaChallenge(res, user);
  }

  // Fetch memberships
  const orgsRes = await query(
    `SELECT o.id as organization_id, o.name as organization_name, om.role,
            s.id as store_id, s.name as store_name, s.slug as store_slug
     FROM organization_memberships om
     JOIN organizations o ON o.id = om.organization_id
     LEFT JOIN stores s ON s.organization_id = o.id
     WHERE om.user_id = $1`,
    [user.id]
  );

  const primaryOrg = orgsRes.rows[0]?.organization_id;
  const primaryStore = orgsRes.rows[0]?.store_id;
  const role = orgsRes.rows[0]?.role || 'OWNER';

  const token = generateToken({
    userId: user.id,
    email: user.email || `${user.phone}@billionbiz.internal`,
    fullName: user.full_name,
    isPlatformAdmin: user.is_platform_admin,
    organizationId: primaryOrg,
    storeId: primaryStore,
    role
  });

  await recordAudit({
    organizationId: primaryOrg,
    storeId: primaryStore,
    actorId: user.id,
    action: otp ? 'USER_LOGIN_OTP' : 'USER_LOGIN_PASSWORD',
    targetType: 'USER',
    targetId: user.id,
    ipAddress: req.ip
  });

  const portalDestination = resolvePortalDestination(role, user.is_platform_admin);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.full_name,
      isPlatformAdmin: user.is_platform_admin,
      emailVerified: user.email_verified
    },
    organizations: orgsRes.rows,
    portalDestination
  });
});

// POST /api/v1/auth/register-streamlined (Streamlined Onboarding with Storefront Type & Optional Password)
identityRouter.post('/register-streamlined', async (req: Request, res: Response) => {
  const { identifier, storeName, capabilityMode, password, fullName, slug, plan: requestedPlan } = req.body;
  if (!identifier || !storeName) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Identifier and store name are required' });
  }

  const { isEmail, value } = normalizeIdentifier(identifier);

  // Check existing
  const digitsOnly = value.replace(/[^0-9]/g, '');
  const last10Digits = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

  const existing = await query(
    isEmail
      ? `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`
      : `SELECT id FROM users WHERE phone = $1 OR phone = $2 OR RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $3`,
    isEmail ? [value] : [value, digitsOnly, last10Digits]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    return res.status(409).json({
      error: 'USER_ALREADY_EXISTS',
      message: `This ${isEmail ? 'email address' : 'mobile number'} is already registered. Please log in.`
    });
  }

  const userId = `usr-${uuidv4()}`;
  const orgId = `org-${uuidv4()}`;
  const storeId = `str-${uuidv4()}`;
  const locId = `loc-${uuidv4()}`;
  const staffProfileId = `stf-${uuidv4()}`;

  const displayName = fullName?.trim() || (isEmail ? value.split('@')[0] : `Merchant ${value.slice(-4)}`);
  const passwordHash = password && password.trim().length >= 6 ? await bcrypt.hash(password.trim(), 10) : null;

  const rawRequestedSlug = (slug as string)?.trim() || generateCandidateSlug(storeName);
  const slugValidation = validateSubdomainSlug(rawRequestedSlug);
  if (!slugValidation.isValid) {
    return res.status(400).json({
      error: slugValidation.errorCode,
      message: slugValidation.error
    });
  }
  const storeSlug = slugValidation.normalizedSlug;
  const planCode = typeof requestedPlan === 'string' && /^[a-z0-9_-]{2,64}$/i.test(requestedPlan)
    ? requestedPlan.toUpperCase()
    : 'FREE_TRIAL';

  const slugCheck = await query(`SELECT id FROM stores WHERE LOWER(slug) = $1`, [storeSlug]);
  if (slugCheck.rowCount && slugCheck.rowCount > 0) {
    return res.status(409).json({
      error: 'SUBDOMAIN_TAKEN',
      message: 'This store subdomain is already taken. Please try another one.'
    });
  }

  const mode = (capabilityMode || 'COMMERCE').toUpperCase(); // Default to 'COMMERCE' (Ecommerce store)
  const prodEnabled = mode === 'COMMERCE' || mode === 'BOTH';
  const apptEnabled = mode === 'SERVICES' || mode === 'BOTH';

  const defaultChecklist = [
    { step: 'add_first_item', title: 'Add first product or service', desc: 'Create your primary offering to display in your store.' },
    { step: 'setup_payments', title: 'Configure payment methods', desc: 'Enable Razorpay or cash tenders for seamless checkout.' },
    { step: 'customize_theme', title: 'Customize Storefront in Store Editor', desc: 'Personalize colors, logo, and page layout.' },
    { step: 'publish_live', title: 'Publish your store', desc: 'Make your store publicly accessible to customers.' }
  ];

  try {
    await withTransaction(async (client) => {
    // 1. Create User
    await client.query(
      `INSERT INTO users (id, email, phone, password_hash, full_name, email_verified, phone_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        isEmail ? value : null,
        !isEmail ? value : null,
        passwordHash,
        displayName,
        isEmail, // verified via OTP
        !isEmail // verified via OTP
      ]
    );

    // 2. Create Organization
    await client.query(
      `INSERT INTO organizations (id, name, slug)
       VALUES ($1, $2, $3)`,
      [orgId, `${storeName} Organization`, `${storeSlug}-${uuidv4().substring(0, 6)}`]
    );

    // 3. Create Store Shell (Status: ACTIVE for automatic publishing)
    await client.query(
      `INSERT INTO stores (id, organization_id, name, slug, status)
       VALUES ($1, $2, $3, $4, 'ACTIVE')`,
      [storeId, orgId, storeName, storeSlug]
    );

    // provisionDefaultStorefront owns the single canonical platform-domain mapping.

    // 4. Capabilities & Storefront Settings
    await client.query(
      `INSERT INTO store_capabilities (store_id, product_commerce_enabled, appointments_enabled, restaurant_pos_enabled)
       VALUES ($1, $2, $3, TRUE)`,
      [storeId, prodEnabled, apptEnabled]
    );

    // 5. Default Location & Warehouse
    await client.query(
      `INSERT INTO store_locations (id, store_id, name, is_primary, is_active)
       VALUES ($1, $2, 'Primary Location', TRUE, TRUE)`,
      [locId, storeId]
    );

    // 6. Organization Membership & Staff Profile
    await client.query(
      `INSERT INTO organization_memberships (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, 'OWNER')`,
      [`mem-${uuidv4()}`, orgId, userId]
    );

    const pinHash = await bcrypt.hash('1234', 10);
    await client.query(
      `INSERT INTO staff_profiles (id, organization_id, user_id, store_id, display_name, pin_hash, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
      [staffProfileId, orgId, userId, storeId, displayName, pinHash]
    );

    await client.query(
      `INSERT INTO role_assignments (id, staff_profile_id, role_id, store_id, location_id)
       VALUES ($1, $2, 'role-owner', $3, $4)`,
      [`ra-${uuidv4()}`, staffProfileId, storeId, locId]
    );

    // 7. Provision Complete Online Store Architecture (Subdomain, Theme, Navigation, System Pages Catalog, Starter Release)
    await provisionDefaultStorefront({
      client,
      storeId,
      storeName,
      storeSlug,
      mode: mode as any,
      userId,
      planCode
    });

    // 9. Onboarding Checklist
    for (const item of defaultChecklist) {
      await client.query(
        `INSERT INTO onboarding_checklists (id, store_id, step_key, title, description, is_completed)
         VALUES ($1, $2, $3, $4, $5, FALSE)`,
        [`chk-${uuidv4()}`, storeId, item.step, item.title, item.desc]
      );
    }
    });
  } catch (err: any) {
    if (err.code === '23505' && (err.constraint === 'uq_stores_slug_lower' || String(err.detail).includes('slug'))) {
      return res.status(409).json({
        error: 'SUBDOMAIN_TAKEN',
        message: 'This store subdomain is already taken. Please try another one.'
      });
    }
    throw err;
  }

  const token = generateToken({
    userId,
    email: isEmail ? value : `${value}@billionbiz.internal`,
    fullName: displayName,
    isPlatformAdmin: false,
    organizationId: orgId,
    storeId,
    role: 'OWNER'
  });

  const portalDestination = resolvePortalDestination('OWNER', false);

  // Send real-time welcome email via Resend if email registration
  if (isEmail) {
    try {
      await sendEmail({
        to: value,
        subject: `Welcome to BillionBiz! Your Store Is Provisioning`,
        text: `Hello ${displayName},\n\nYour store "${storeName}" has been created on the ${planCode} plan. Store project and domain provisioning are starting now. The public address will become available after DNS and HTTPS checks pass.\n\nMerchant dashboard: ${env.ADMIN_URL}/dashboard\nStorefront address: https://${storeSlug}.${PLATFORM_MAIN_DOMAIN}\n\n${!passwordHash ? 'Sign in using an email or phone verification code.' : 'Sign in with your password or a verification code.'}\n\nBest regards,\nThe BillionBiz Team`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #0f172a;">
            <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <span style="display: inline-block; padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Store Provisioning</span>
              <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 12px 0 6px 0;">Welcome, ${displayName}!</h1>
              <p style="font-size: 15px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0;">
                Your online store <strong>${storeName}</strong> was created on the <strong>${planCode}</strong> plan. Project and domain provisioning are starting. The public URL will become available after DNS and HTTPS checks pass.
              </p>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;"><strong>Merchant Portal:</strong> <a href="${env.ADMIN_URL}/dashboard" style="color: #2563eb; text-decoration: none;">${env.ADMIN_URL.replace(/^https?:\/\//, '')}/dashboard</a></p>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;"><strong>Storefront Address:</strong> <a href="https://${storeSlug}.${PLATFORM_MAIN_DOMAIN}" style="color: #2563eb; text-decoration: none;">https://${storeSlug}.${PLATFORM_MAIN_DOMAIN}</a></p>
                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Login Method:</strong> ${!passwordHash ? 'Instant Email Verification Code / OTP (No password required)' : 'Password or Email OTP'}</p>
              </div>

              <a href="${env.ADMIN_URL}/dashboard" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px;">
                Launch Merchant Dashboard &rarr;
              </a>

              <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} BillionBiz Platform. All rights reserved.</p>
              </div>
            </div>
          </div>
        `
      });
    } catch (err: any) {
      console.error(`[WELCOME EMAIL] Error dispatching to ${value}:`, err.message);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Store created; project and domain provisioning are in progress.',
    token,
    user: {
      id: userId,
      email: isEmail ? value : null,
      phone: !isEmail ? value : null,
      fullName: displayName,
      emailVerified: isEmail,
      phoneVerified: !isEmail
    },
    organization: { id: orgId, name: `${storeName} Organization` },
    store: { id: storeId, name: storeName, slug: storeSlug, planCode, provisioningStatus: 'PENDING', domainStatus: 'PENDING', status: 'ACTIVE' },
    portalDestination
  });
});

