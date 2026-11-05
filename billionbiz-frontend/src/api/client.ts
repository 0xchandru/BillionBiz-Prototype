/**
 * BillionBiz API Client
 *
 * Configurable, resilient HTTP client supporting dynamic API endpoints,
 * ngrok tunnel bypass headers, multi-tenant headers, and auth tokens.
 */

export function getApiBaseUrl(): string {
  let url = '';

  // 1. Merchant or developer manual override stored in localStorage
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('billionbiz_api_override');
    if (override && override.trim().length > 0) {
      if (override.includes('ngrok') || override.includes('pseudoapprehensive')) {
        // Automatically purge stale/dead ngrok tunnel overrides
        localStorage.removeItem('billionbiz_api_override');
      } else {
        url = override.trim();
      }
    }
  }

  // 2. Vite environment variable
  if (!url) {
    url = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
  }

  // 3. Fallback to authoritative API URL derived from environment root domain
  if (!url) {
    const root = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').trim();
    url = `https://api.${root}/api/v1`;
  }

  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url || url.trim().length === 0) {
      localStorage.removeItem('billionbiz_api_override');
    } else {
      localStorage.setItem('billionbiz_api_override', url.trim());
    }
    window.dispatchEvent(new Event('billionbiz_api_changed'));
  }
}

export function clearApiBaseUrl(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('billionbiz_api_override');
    window.dispatchEvent(new Event('billionbiz_api_changed'));
  }
}

const isPlatformAdminToken = (token: string | null): boolean => {
  if (!token || typeof window === 'undefined') return false;
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return false;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const binary = window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return payload?.isPlatformAdmin === true;
  } catch {
    return false;
  }
};

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options;

  const baseUrl = getApiBaseUrl();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${baseUrl}${normalizedEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('billionbiz_token') : null;
  const orgId = typeof window !== 'undefined' ? localStorage.getItem('billionbiz_org_id') : null;
  const storeId = typeof window !== 'undefined' ? localStorage.getItem('billionbiz_store_id') : null;
  const storeSlug = typeof window !== 'undefined' ? localStorage.getItem('billionbiz_store_slug') : null;

  // Merchant JWTs already bind the user to an organization/store. Sending
  // stale localStorage tenant IDs alongside that token creates accidental
  // cross-tenant mismatches. Only platform admins may explicitly select a
  // tenant through these headers; the backend independently verifies the JWT.
  const maySelectTenant = !token || isPlatformAdminToken(token);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(maySelectTenant && orgId ? { 'x-organization-id': orgId } : {}),
    ...(maySelectTenant && storeId ? { 'x-store-id': storeId } : {}),
    ...(maySelectTenant && storeSlug ? { 'x-store-slug': storeSlug } : {}),
    // Critical for ngrok free-tier tunnels: bypass browser interstitial HTML page
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string> || {})
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('billionbiz_token');
        const path = window.location.pathname;
        if (!path.startsWith('/login') && !path.startsWith('/register')) {
          window.location.replace('/login');
        }
      }
    }
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

// Convenience methods
apiClient.get = <T = any>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'GET' });

apiClient.post = <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined
  });

apiClient.put = <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined
  });

apiClient.patch = <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined
  });

apiClient.delete = <T = any>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'DELETE' });
