/**
 * BillionBiz Platform - Centralized Reserved Subdomains & Domain Validation
 *
 * Implements RFC 1035 / RFC 1123 DNS hostname rules and strict platform reserved
 * subdomains protection across all registration, onboarding, and host resolution flows.
 */

export const PLATFORM_MAIN_DOMAIN = (process.env.ROOT_DOMAIN || 'chandraprakash.codes').trim().toLowerCase();

/**
 * Complete list of reserved platform subdomains categorized by concern.
 * All comparisons MUST be performed on trimmed, lowercase values.
 */
export const RESERVED_SUBDOMAINS: readonly string[] = Object.freeze([
  // 1. Existing platform subdomains
  'www',
  'admin',
  'accounts',
  'account',
  'staff',
  'pos',
  'ops',
  'api',

  // 2. Authentication and user management
  'auth',
  'login',
  'logout',
  'register',
  'signup',
  'signin',
  'profile',
  'dashboard',
  'users',
  'user',
  'oauth',
  'callback',
  'sso',

  // 3. Platform services
  'app',
  'platform',
  'system',
  'root',
  'security',
  'support',
  'help',
  'docs',
  'documentation',
  'status',
  'blog',
  'news',
  'marketing',
  'pricing',
  'billing',
  'subscription',
  'subscriptions',
  'payment',
  'payments',
  'checkout',
  'cart',
  'order',
  'orders',
  'invoice',
  'invoices',
  'webhook',
  'webhooks',
  'notification',
  'notifications',

  // 4. Technical and infrastructure
  'mail',
  'email',
  'smtp',
  'imap',
  'pop',
  'ftp',
  'sftp',
  'cdn',
  'static',
  'assets',
  'media',
  'files',
  'upload',
  'uploads',
  'storage',
  'cache',
  'images',
  'fonts',
  'js',
  'css',
  'api-docs',
  'graphql',
  'ws',
  'socket',
  'dev',
  'development',
  'test',
  'testing',
  'staging',
  'stage',
  'beta',
  'demo',
  'preview',
  'sandbox',
  'internal',
  'monitoring',
  'analytics',
  'logs',
  'metrics',

  // 5. Internal platform routing keywords
  'store',
  'stores'
]);

export const RESERVED_SUBDOMAINS_SET: ReadonlySet<string> = new Set(RESERVED_SUBDOMAINS);

/**
 * Checks whether a given subdomain is reserved by the platform.
 * Case-insensitive and trimmed.
 */
export function isReservedSubdomain(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return RESERVED_SUBDOMAINS_SET.has(slug.trim().toLowerCase());
}

export type SubdomainErrorCode =
  | 'EMPTY_SLUG'
  | 'INVALID_LENGTH'
  | 'INVALID_FORMAT'
  | 'SUBDOMAIN_RESERVED'
  | 'SUBDOMAIN_TAKEN';

export interface SubdomainValidationResult {
  isValid: boolean;
  normalizedSlug: string;
  error?: string;
  errorCode?: SubdomainErrorCode;
}

/**
 * Validates a store subdomain slug against DNS hostname rules and the reserved list.
 *
 * Rules:
 * - Normalized with lowercase and trimming.
 * - Minimum 3 characters, maximum 63 characters (RFC 1035 label limit).
 * - Only lowercase alphanumeric characters and hyphens: [a-z0-9-].
 * - Cannot start or end with a hyphen.
 * - No spaces, underscores, dots, or special characters.
 * - Rejects all reserved subdomains regardless of casing.
 */
export function validateSubdomainSlug(rawSlug: string | null | undefined): SubdomainValidationResult {
  const normalized = (rawSlug || '').trim().toLowerCase();

  // 1. Empty Check
  if (!normalized) {
    return {
      isValid: false,
      normalizedSlug: '',
      error: 'Store subdomain cannot be empty.',
      errorCode: 'EMPTY_SLUG'
    };
  }

  // 2. Length Check (RFC 1035 allows 1-63, platform requires min 3 for usability)
  if (normalized.length < 3) {
    return {
      isValid: false,
      normalizedSlug: normalized,
      error: 'Store subdomain must be at least 3 characters long.',
      errorCode: 'INVALID_LENGTH'
    };
  }

  if (normalized.length > 63) {
    return {
      isValid: false,
      normalizedSlug: normalized,
      error: 'Store subdomain cannot exceed 63 characters.',
      errorCode: 'INVALID_LENGTH'
    };
  }

  // 3. DNS Hostname Format Check
  // Disallow leading hyphen, trailing hyphen, underscores, dots, spaces, special chars
  const hostnameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  if (!hostnameRegex.test(normalized)) {
    return {
      isValid: false,
      normalizedSlug: normalized,
      error: 'Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.',
      errorCode: 'INVALID_FORMAT'
    };
  }

  // 4. Reserved Subdomain Check
  if (isReservedSubdomain(normalized)) {
    return {
      isValid: false,
      normalizedSlug: normalized,
      error: 'This subdomain is reserved by BillionBiz. Please choose another store name.',
      errorCode: 'SUBDOMAIN_RESERVED'
    };
  }

  return {
    isValid: true,
    normalizedSlug: normalized
  };
}

/**
 * Helper to generate a clean slug candidate from a raw business or store name
 */
export function generateCandidateSlug(storeName: string): string {
  return (storeName || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
