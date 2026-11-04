/**
 * BillionBiz Platform - Centralized Reserved Subdomains & Domain Validation (Frontend)
 *
 * Provides real-time client-side validation against DNS hostname rules
 * and platform reserved subdomains before dispatching to the API.
 */

export const PLATFORM_MAIN_DOMAIN = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').trim().toLowerCase();

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

  // 2. Length Check
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
