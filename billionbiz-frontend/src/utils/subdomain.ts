/**
 * BillionBiz Subdomain Routing Utility
 *
 * Resolves portal context based on window.location.hostname and pathname.
 * Supports smooth, instant navigation on local/preview environments
 * while enforcing strict subdomain security on production:
 *
 * - chandraprakash.codes        -> Permanently redirects to https://www.chandraprakash.codes
 * - www.chandraprakash.codes    -> Public Marketing Website & Store Registration
 * - admin.chandraprakash.codes  -> Merchant Admin Workspace & Platform Admin Login
 * - accounts.chandraprakash.codes-> Customer Accounts, Customer Auth, Orders & Profile
 * - pos.chandraprakash.codes    -> Dedicated Cashier & Counter POS Application
 * - staff.chandraprakash.codes  -> Dedicated Staff Portal & Staff Login
 * - ops.chandraprakash.codes    -> Internal Platform Operations & Telemetry Portal
 * - api.chandraprakash.codes    -> Authoritative Backend REST API
 * - {slug}.chandraprakash.codes -> Individual Dynamic Customer Storefront
 */

import { isReservedSubdomain } from './reservedSubdomains';

export type SubdomainType =
  | 'root'
  | 'admin'
  | 'accounts'
  | 'staff'
  | 'pos'
  | 'ops'
  | 'store'
  | 'local'
  | 'redirect'
  | 'reserved'
  | 'api'
  | 'unknown';

export interface SubdomainInfo {
  type: SubdomainType;
  subdomain: string | null;
  storeSlug?: string;
  isSubdomain: boolean;
  isLocal: boolean;
}

/**
 * Checks whether the current runtime is local, an IP, preview, or tunnel
 */
export function isLocalOrPreview(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.vercel.app') ||
    hostname.endsWith('.ngrok-free.app') ||
    hostname.endsWith('.ngrok.io')
  );
}

export function parseSubdomain(): SubdomainInfo {
  if (typeof window === 'undefined') {
    return { type: 'root', subdomain: null, isSubdomain: false, isLocal: false };
  }

  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const isLocal = isLocalOrPreview();
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();

  // 1. Explicit query parameter override (e.g. ?subdomain=admin) for local dev testing
  const params = new URLSearchParams(window.location.search);
  const override = params.get('subdomain')?.toLowerCase();
  if (override) {
    if (override === 'admin') return { type: 'admin', subdomain: 'admin', isSubdomain: true, isLocal };
    if (override === 'accounts') return { type: 'accounts', subdomain: 'accounts', isSubdomain: true, isLocal };
    if (override === 'pos') return { type: 'pos', subdomain: 'pos', isSubdomain: true, isLocal };
    if (override === 'staff') return { type: 'staff', subdomain: 'staff', isSubdomain: true, isLocal };
    if (override === 'ops') return { type: 'ops', subdomain: 'ops', isSubdomain: true, isLocal };
    if (override === 'www') return { type: 'root', subdomain: 'www', isSubdomain: false, isLocal };
    if (override.startsWith('store:')) {
      const slug = override.replace('store:', '');
      return { type: 'store', subdomain: slug, storeSlug: slug, isSubdomain: true, isLocal };
    }
  }

  // 2. Local / Single-Origin / Preview environment: route seamlessly in unified router
  if (isLocal) {
    if (pathname.startsWith('/store/')) {
      const slug = pathname.split('/')[2];
      return { type: 'store', subdomain: slug || 'store', storeSlug: slug, isSubdomain: false, isLocal: true };
    }
    if (pathname.startsWith('/accounts')) {
      return { type: 'accounts', subdomain: 'accounts', isSubdomain: false, isLocal: true };
    }
    if (pathname.startsWith('/staff-app')) {
      return { type: 'staff', subdomain: 'staff', isSubdomain: false, isLocal: true };
    }
    if (pathname.startsWith('/pos-app')) {
      return { type: 'pos', subdomain: 'pos', isSubdomain: false, isLocal: true };
    }
    if (pathname.startsWith('/ops')) {
      return { type: 'ops', subdomain: 'ops', isSubdomain: false, isLocal: true };
    }
    return { type: 'local', subdomain: null, isSubdomain: false, isLocal: true };
  }

  // 3. Apex Domain Redirect: rootDomain -> https://www.<rootDomain>
  if (hostname === rootDomain) {
    window.location.replace(`https://www.${rootDomain}${window.location.pathname}${window.location.search}`);
    return { type: 'redirect', subdomain: 'www', isSubdomain: false, isLocal: false };
  }

  // 4. One-level subdomains on root domain: {sub}.<rootDomain>
  const parts = hostname.split('.');
  if (parts.length === 3 && hostname.endsWith(rootDomain)) {
    const sub = parts[0];
    switch (sub) {
      case 'www':
        return { type: 'root', subdomain: 'www', isSubdomain: false, isLocal: false };
      case 'admin':
        return { type: 'admin', subdomain: 'admin', isSubdomain: true, isLocal: false };
      case 'accounts':
      case 'account':
        return { type: 'accounts', subdomain: 'accounts', isSubdomain: true, isLocal: false };
      case 'pos':
        return { type: 'pos', subdomain: 'pos', isSubdomain: true, isLocal: false };
      case 'staff':
        return { type: 'staff', subdomain: 'staff', isSubdomain: true, isLocal: false };
      case 'ops':
        return { type: 'ops', subdomain: 'ops', isSubdomain: true, isLocal: false };
      case 'api':
        return { type: 'api', subdomain: 'api', isSubdomain: true, isLocal: false };
      default:
        // Check if reserved platform keyword
        if (isReservedSubdomain(sub)) {
          return { type: 'reserved', subdomain: sub, isSubdomain: true, isLocal: false };
        }
        // Valid dynamic merchant storefront
        return {
          type: 'store',
          subdomain: sub,
          storeSlug: sub,
          isSubdomain: true,
          isLocal: false
        };
    }
  }

  // 6. Unknown hostname (Unconfigured external domain or invalid nested domain)
  return { type: 'unknown', subdomain: null, isSubdomain: false, isLocal: false };
}

/**
 * Returns canonical destination URL for a given portal based on environment configuration
 */
export function getPortalUrl(type: 'root' | 'admin' | 'accounts' | 'pos' | 'staff' | 'ops' | 'api', path = ''): string {
  if (typeof window === 'undefined') return path;

  const isLocal = isLocalOrPreview();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (isLocal) {
    if (type === 'pos' && !cleanPath.startsWith('/pos')) return `/pos-app${cleanPath === '/' ? '' : cleanPath}`;
    if (type === 'staff' && !cleanPath.startsWith('/staff')) return `/staff-app${cleanPath === '/' ? '' : cleanPath}`;
    if (type === 'ops' && !cleanPath.startsWith('/ops')) return `/ops${cleanPath === '/' ? '' : cleanPath}`;
    if (type === 'accounts' && !cleanPath.startsWith('/accounts')) return `/accounts${cleanPath === '/' ? '' : cleanPath}`;
    if (type === 'admin') {
      if (cleanPath.startsWith('/login')) return `/login`;
      if (cleanPath.startsWith('/dashboard')) return `/dashboard`;
      return `/dashboard`;
    }
    return cleanPath;
  }

  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes';

  const envMap: Record<string, string | undefined> = {
    root: import.meta.env.VITE_MAIN_WEBSITE_URL || `https://www.${rootDomain}`,
    admin: import.meta.env.VITE_ADMIN_URL || `https://admin.${rootDomain}`,
    accounts: import.meta.env.VITE_ACCOUNTS_URL || `https://accounts.${rootDomain}`,
    staff: import.meta.env.VITE_STAFF_URL || `https://staff.${rootDomain}`,
    pos: import.meta.env.VITE_POS_URL || `https://pos.${rootDomain}`,
    ops: import.meta.env.VITE_OPS_URL || `https://ops.${rootDomain}`,
    api: import.meta.env.VITE_API_URL || `https://api.${rootDomain}/api/v1`
  };

  const baseUrl = (envMap[type] || `https://${type}.${rootDomain}`).replace(/\/+$/, '');
  return `${baseUrl}${cleanPath}`;
}

/**
 * Returns canonical destination URL for a merchant storefront
 */
export function getStoreUrl(slug: string, path = ''): string {
  const isLocal = isLocalOrPreview();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const hasLocalManagedProjects = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost') || hostname.endsWith('.local');
  if (hasLocalManagedProjects) {
    let hash = 2166136261;
    for (const character of slug) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    const port = 20_000 + ((hash >>> 0) % 20_000);
    return `http://${slug}.localhost:${port}${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (isLocal) return `/store/${slug}${cleanPath === '/' ? '' : cleanPath}`;
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes';
  return `https://${slug}.${rootDomain}${cleanPath}`;
}
