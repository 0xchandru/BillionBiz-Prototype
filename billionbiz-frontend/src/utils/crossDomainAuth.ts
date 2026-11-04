/**
 * Cross-Subdomain Authentication & Session Synchronization Utility
 *
 * Facilitates seamless single sign-on (SSO) and session preservation across:
 * - chandraprakash.codes (Marketing & Registration apex)
 * - admin.chandraprakash.codes (Merchant Admin Dashboard)
 * - pos.chandraprakash.codes, staff.chandraprakash.codes, etc.
 *
 * Uses a hybrid approach:
 * 1. Root-scoped HTTP cookies (Domain=.chandraprakash.codes) for passive cross-subdomain sharing.
 * 2. Secure URL token passing during cross-subdomain redirects for immediate, atomic hydration.
 * 3. LocalStorage persistence on each origin.
 */

import { getPortalUrl, isLocalOrPreview } from './subdomain';

const COOKIE_DOMAIN = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').trim().toLowerCase();

/**
 * Sets a cookie accessible across all subdomains of chandraprakash.codes
 */
export function setCrossDomainCookie(name: string, value: string, days = 30): void {
  if (typeof document === 'undefined') return;

  const hostname = window.location.hostname.toLowerCase();
  let domainAttribute = '';

  // Apply domain scoping if running on chandraprakash.codes or its subdomains
  if (hostname === COOKIE_DOMAIN || hostname.endsWith(`.${COOKIE_DOMAIN}`)) {
    domainAttribute = `; Domain=.${COOKIE_DOMAIN}`;
  }

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const isSecure = window.location.protocol === 'https:';
  const secureAttribute = isSecure ? '; Secure' : '';

  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/${domainAttribute}; SameSite=Lax${secureAttribute}`;
}

/**
 * Retrieves a cookie by name
 */
export function getCrossDomainCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const pattern = new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)');
  const matches = document.cookie.match(pattern);
  return matches ? decodeURIComponent(matches[1]) : null;
}

/**
 * Removes a cookie across all subdomains
 */
export function removeCrossDomainCookie(name: string): void {
  if (typeof document === 'undefined') return;

  const hostname = window.location.hostname.toLowerCase();
  let domainAttribute = '';

  if (hostname === COOKIE_DOMAIN || hostname.endsWith(`.${COOKIE_DOMAIN}`)) {
    domainAttribute = `; Domain=.${COOKIE_DOMAIN}`;
  }

  document.cookie = `${name}=; Path=/${domainAttribute}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  // Also delete host-only version if any exists
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}

export interface AuthSessionData {
  token: string;
  orgId?: string;
  storeId?: string;
  storeSlug?: string;
  storeName?: string;
}

/**
 * Atomically stores authentication session in both localStorage and cross-subdomain cookies
 */
export function persistAuthSession(session: AuthSessionData): void {
  if (typeof window === 'undefined') return;

  if (session.token) {
    localStorage.setItem('billionbiz_token', session.token);
    setCrossDomainCookie('billionbiz_token', session.token);
  }

  if (session.orgId) {
    localStorage.setItem('billionbiz_org_id', session.orgId);
    setCrossDomainCookie('billionbiz_org_id', session.orgId);
  }

  if (session.storeId) {
    localStorage.setItem('billionbiz_store_id', session.storeId);
    setCrossDomainCookie('billionbiz_store_id', session.storeId);
  }

  if (session.storeSlug) {
    localStorage.setItem('billionbiz_store_slug', session.storeSlug);
    setCrossDomainCookie('billionbiz_store_slug', session.storeSlug);
  }

  if (session.storeName) {
    localStorage.setItem('billionbiz_store_name', session.storeName);
    setCrossDomainCookie('billionbiz_store_name', session.storeName);
  }
}

/**
 * Clears authentication session across localStorage and cookies
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('billionbiz_token');
  localStorage.removeItem('billionbiz_org_id');
  localStorage.removeItem('billionbiz_store_id');
  localStorage.removeItem('billionbiz_store_slug');
  localStorage.removeItem('billionbiz_store_name');

  removeCrossDomainCookie('billionbiz_token');
  removeCrossDomainCookie('billionbiz_org_id');
  removeCrossDomainCookie('billionbiz_store_id');
  removeCrossDomainCookie('billionbiz_store_slug');
  removeCrossDomainCookie('billionbiz_store_name');
}

/**
 * Inspects URL parameters (?token=...&orgId=...) and cross-domain cookies to hydrate
 * the local session seamlessly when navigating between subdomains.
 *
 * Cleans the URL query parameters using history.replaceState to keep address bar clean.
 */
export function syncAuthFromUrlOrCookie(): AuthSessionData | null {
  if (typeof window === 'undefined') return null;

  // 1. Check URL parameters for explicit cross-subdomain handoff
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    const urlOrgId = searchParams.get('orgId');
    const urlStoreId = searchParams.get('storeId');
    const urlSlug = searchParams.get('slug');

    if (urlToken) {
      persistAuthSession({
        token: urlToken,
        orgId: urlOrgId || undefined,
        storeId: urlStoreId || undefined,
        storeSlug: urlSlug || undefined
      });

      // Remove auth tokens from URL query parameters without reloading
      searchParams.delete('token');
      searchParams.delete('orgId');
      searchParams.delete('storeId');
      searchParams.delete('slug');

      const remainingQuery = searchParams.toString();
      const newUrl = window.location.pathname + (remainingQuery ? `?${remainingQuery}` : '') + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);

      return {
        token: urlToken,
        orgId: urlOrgId || undefined,
        storeId: urlStoreId || undefined,
        storeSlug: urlSlug || undefined
      };
    }
  } catch (err) {
    console.warn('[CrossDomainAuth] Error reading URL auth parameters:', err);
  }

  // 2. Check localStorage on current origin
  const localToken = localStorage.getItem('billionbiz_token');
  if (localToken) {
    return {
      token: localToken,
      orgId: localStorage.getItem('billionbiz_org_id') || undefined,
      storeId: localStorage.getItem('billionbiz_store_id') || undefined,
      storeSlug: localStorage.getItem('billionbiz_store_slug') || undefined
    };
  }

  // 3. Fallback: check cross-domain cookie
  const cookieToken = getCrossDomainCookie('billionbiz_token');
  if (cookieToken) {
    const cookieOrg = getCrossDomainCookie('billionbiz_org_id') || undefined;
    const cookieStore = getCrossDomainCookie('billionbiz_store_id') || undefined;
    const cookieSlug = getCrossDomainCookie('billionbiz_store_slug') || undefined;

    // Sync into local storage for this origin
    localStorage.setItem('billionbiz_token', cookieToken);
    if (cookieOrg) localStorage.setItem('billionbiz_org_id', cookieOrg);
    if (cookieStore) localStorage.setItem('billionbiz_store_id', cookieStore);
    if (cookieSlug) localStorage.setItem('billionbiz_store_slug', cookieSlug);

    return {
      token: cookieToken,
      orgId: cookieOrg,
      storeId: cookieStore,
      storeSlug: cookieSlug
    };
  }

  return null;
}

/**
 * Safely redirects the browser to the Admin Dashboard on admin.chandraprakash.codes
 * (or /dashboard in local development).
 */
export function redirectToAdminDashboard(session?: Partial<AuthSessionData>): void {
  if (typeof window === 'undefined') return;

  const token = session?.token || localStorage.getItem('billionbiz_token') || getCrossDomainCookie('billionbiz_token');
  const orgId = session?.orgId || localStorage.getItem('billionbiz_org_id') || getCrossDomainCookie('billionbiz_org_id');
  const storeId = session?.storeId || localStorage.getItem('billionbiz_store_id') || getCrossDomainCookie('billionbiz_store_id');
  const storeSlug = session?.storeSlug || localStorage.getItem('billionbiz_store_slug') || getCrossDomainCookie('billionbiz_store_slug');

  // Persist before redirecting
  if (token) {
    persistAuthSession({
      token,
      orgId: orgId || undefined,
      storeId: storeId || undefined,
      storeSlug: storeSlug || undefined
    });
  }

  const isLocal = isLocalOrPreview();
  if (isLocal) {
    window.location.replace('/dashboard');
    return;
  }

  // Build canonical admin portal URL
  const adminBaseUrl = getPortalUrl('admin', '/dashboard');
  const target = new URL(adminBaseUrl);

  if (token) {
    target.searchParams.set('token', token);
  }
  if (orgId) {
    target.searchParams.set('orgId', orgId);
  }
  if (storeId) {
    target.searchParams.set('storeId', storeId);
  }
  if (storeSlug) {
    target.searchParams.set('slug', storeSlug);
  }

  window.location.replace(target.toString());
}

