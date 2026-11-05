import { create } from 'zustand';
import { api, type UserProfile, type AuthResponse } from '../api/services';
import { syncAuthFromUrlOrCookie, persistAuthSession, clearAuthSession } from '../utils/crossDomainAuth';

export interface AuthActionResult {
  success: boolean;
  destination?: string;
  error?: string;
  token?: string;
  orgId?: string;
  storeId?: string;
  storeSlug?: string;
  requiresMfa?: boolean;
  challengeToken?: string;
  expiresInSeconds?: number;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  role: string | null;
  permissions: string[];
  organizationId: string | null;
  organizationName: string | null;
  storeId: string | null;
  storeName: string | null;
  storeSlug: string | null;
  organizations: any[];
  onboardingChecklist: any[];
  portalDestination: { portal: string; url: string; path: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<AuthActionResult>;
  loginUnified: (identifier: string, authFactor: { password?: string; otp?: string }) => Promise<AuthActionResult>;
  loginGoogle: (payload: { credential?: string; idToken?: string; code?: string; redirectUri?: string }) => Promise<AuthActionResult>;
  completeMfaChallenge: (challengeToken: string, credential: { code?: string; recoveryCode?: string }) => Promise<AuthActionResult>;
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    storeName: string;
    capabilityMode?: string;
  }) => Promise<AuthActionResult>;
  registerStreamlined: (data: {
    identifier: string;
    storeName: string;
    slug?: string;
    capabilityMode?: string;
    password?: string;
    fullName?: string;
    plan?: string;
  }) => Promise<AuthActionResult>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  switchStore: (storeId: string, orgId?: string) => void;
  clearError: () => void;
}

// Hydrate session from URL params (cross-subdomain handoff), cookies, or localStorage
const initialSession = typeof window !== 'undefined' ? syncAuthFromUrlOrCookie() : null;

export const useAuthStore = create<AuthState>((set) => ({
  token: initialSession?.token || null,
  user: null,
  role: null,
  permissions: [],
  organizationId: initialSession?.orgId || null,
  organizationName: null,
  storeId: initialSession?.storeId || null,
  storeName: typeof window !== 'undefined' ? localStorage.getItem('billionbiz_store_name') : null,
  storeSlug: initialSession?.storeSlug || null,
  organizations: [],
  onboardingChecklist: [],
  portalDestination: null,
  isAuthenticated: !!initialSession?.token,
  isLoading: false,
  isCheckingAuth: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res: AuthResponse = await api.login({ email, password });
      if (res.mfaRequired) {
        if (!res.challengeToken) throw new Error('The server requested MFA but did not return a valid challenge. Start sign-in again.');
        set({ isLoading: false, isAuthenticated: false, error: null });
        return {
          success: false,
          requiresMfa: true,
          challengeToken: res.challengeToken,
          expiresInSeconds: res.expiresInSeconds || 300
        };
      }

      const { token, user, organizations, portalDestination } = res;
      if (typeof token !== 'string' || !token.trim()) throw new Error('Authentication did not return a valid session token.');

      // Extract first org & store
      const primaryOrg = organizations && organizations.length > 0 ? organizations[0] : null;
      const orgId = primaryOrg?.organization_id || 'org-billionbiz-default';
      const storeId = primaryOrg?.store_id || 'store-shoum-default';
      const storeName = primaryOrg?.store_name || 'My Store';
      const storeSlug = primaryOrg?.store_slug || 'my-store';
      const role = primaryOrg?.role || 'OWNER';

      persistAuthSession({
        token,
        orgId,
        storeId,
        storeSlug
      });

      set({
        token,
        user,
        role,
        organizationId: orgId,
        organizationName: primaryOrg?.organization_name || 'Default Organization',
        storeId,
        storeName,
        storeSlug,
        organizations: organizations || [],
        portalDestination: portalDestination || null,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return {
        success: true,
        destination: portalDestination?.path || '/dashboard',
        token,
        orgId,
        storeId,
        storeSlug
      };
    } catch (err: any) {
      const message = err.message || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  loginUnified: async (identifier, authFactor) => {
    set({ isLoading: true, error: null });
    try {
      const res: AuthResponse = await api.loginUnified({
        identifier,
        password: authFactor.password,
        otp: authFactor.otp
      });
      if (res.mfaRequired) {
        if (!res.challengeToken) throw new Error('The server requested MFA but did not return a valid challenge. Start sign-in again.');
        set({ isLoading: false, isAuthenticated: false, error: null });
        return {
          success: false,
          requiresMfa: true,
          challengeToken: res.challengeToken,
          expiresInSeconds: res.expiresInSeconds || 300
        };
      }

      const { token, user, organizations, portalDestination } = res;
      if (typeof token !== 'string' || !token.trim()) throw new Error('Authentication did not return a valid session token.');

      const primaryOrg = organizations && organizations.length > 0 ? organizations[0] : null;
      const orgId = primaryOrg?.organization_id || 'org-billionbiz-default';
      const storeId = primaryOrg?.store_id || 'store-shoum-default';
      const storeName = primaryOrg?.store_name || 'My Store';
      const storeSlug = primaryOrg?.store_slug || 'my-store';
      const role = primaryOrg?.role || 'OWNER';

      persistAuthSession({
        token,
        orgId,
        storeId,
        storeSlug
      });

      set({
        token,
        user,
        role,
        organizationId: orgId,
        organizationName: primaryOrg?.organization_name || 'Default Organization',
        storeId,
        storeName,
        storeSlug,
        organizations: organizations || [],
        portalDestination: portalDestination || null,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return {
        success: true,
        destination: portalDestination?.path || '/dashboard',
        token,
        orgId,
        storeId,
        storeSlug
      };
    } catch (err: any) {
      const message = err.message || 'Login failed. Please check your details.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  completeMfaChallenge: async (challengeToken, credential) => {
    set({ isLoading: true, error: null });
    try {
      const res: AuthResponse = await api.completeMfaChallenge({
        challengeToken,
        ...(credential.code ? { code: credential.code } : {}),
        ...(credential.recoveryCode ? { recoveryCode: credential.recoveryCode } : {})
      });
      const { token, user, organizations, portalDestination } = res;
      if (typeof token !== 'string' || !token.trim()) {
        throw new Error('MFA verification did not return a valid session token. Please start sign-in again.');
      }

      const primaryOrg = organizations && organizations.length > 0 ? organizations[0] : null;
      const orgId = primaryOrg?.organization_id || 'org-billionbiz-default';
      const storeId = primaryOrg?.store_id || 'store-shoum-default';
      const storeName = primaryOrg?.store_name || 'My Store';
      const storeSlug = primaryOrg?.store_slug || 'my-store';
      const role = primaryOrg?.role || 'OWNER';

      persistAuthSession({ token, orgId, storeId, storeSlug });
      set({
        token,
        user,
        role,
        organizationId: orgId,
        organizationName: primaryOrg?.organization_name || 'Default Organization',
        storeId,
        storeName,
        storeSlug,
        organizations: organizations || [],
        portalDestination: portalDestination || null,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true, destination: portalDestination?.path || '/dashboard', token, orgId, storeId, storeSlug };
    } catch (err: any) {
      const message = err.message || 'MFA verification failed. Check your code and try again.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  loginGoogle: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res: AuthResponse = await api.loginGoogle(payload);
      if (res.mfaRequired) {
        if (!res.challengeToken) throw new Error('Google sign-in requires MFA but did not return a valid challenge. Start Google sign-in again.');
        set({ isLoading: false, isAuthenticated: false, error: null });
        return {
          success: false,
          requiresMfa: true,
          challengeToken: res.challengeToken,
          expiresInSeconds: res.expiresInSeconds || 300
        };
      }

      const { token, user, organizations, portalDestination } = res;
      if (typeof token !== 'string' || !token.trim()) throw new Error('Authentication did not return a valid session token.');

      const primaryOrg = organizations && organizations.length > 0 ? organizations[0] : null;
      const orgId = primaryOrg?.organization_id || 'org-billionbiz-default';
      const storeId = primaryOrg?.store_id || 'store-shoum-default';
      const storeName = primaryOrg?.store_name || 'My Store';
      const storeSlug = primaryOrg?.store_slug || 'my-store';
      const role = primaryOrg?.role || 'OWNER';

      persistAuthSession({
        token,
        orgId,
        storeId,
        storeSlug
      });

      set({
        token,
        user,
        role,
        organizationId: orgId,
        organizationName: primaryOrg?.organization_name || 'Default Organization',
        storeId,
        storeName,
        storeSlug,
        organizations: organizations || [],
        portalDestination: portalDestination || null,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return {
        success: true,
        destination: portalDestination?.path || '/dashboard',
        token,
        orgId,
        storeId,
        storeSlug
      };
    } catch (err: any) {
      const message = err.message || 'Google authentication failed. Please try again.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  registerStreamlined: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res: AuthResponse = await api.registerStreamlined(payload);
      const { token, user, organization, store, portalDestination } = res;
      if (typeof token !== 'string' || !token.trim()) throw new Error('Registration did not return a valid session token. Please try again.');

      const orgId = organization?.id || 'org-billionbiz-default';
      const storeId = store?.id || 'store-shoum-default';
      const storeName = store?.name || payload.storeName;
      const storeSlug = store?.slug || payload.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      persistAuthSession({
        token,
        orgId,
        storeId,
        storeSlug
      });

      set({
        token,
        user,
        role: 'OWNER',
        organizationId: orgId,
        organizationName: organization?.name || payload.storeName,
        storeId,
        storeName,
        storeSlug,
        organizations: [{ organization_id: orgId, organization_name: payload.storeName, store_id: storeId, store_name: storeName }],
        portalDestination: portalDestination || null,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return {
        success: true,
        destination: '/dashboard',
        token,
        orgId,
        storeId,
        storeSlug
      };
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res: AuthResponse = await api.register(payload);
      const { token, user, organization, store, onboardingChecklist, portalDestination } = res;
      if (typeof token !== 'string' || !token.trim()) throw new Error('Registration did not return a valid session token. Please try again.');

      const orgId = organization?.id || 'org-billionbiz-default';
      const storeId = store?.id || 'store-shoum-default';
      const storeName = store?.name || payload.storeName;
      const storeSlug = store?.slug || payload.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      persistAuthSession({
        token,
        orgId,
        storeId,
        storeSlug
      });

      set({
        token,
        user,
        role: 'OWNER',
        organizationId: orgId,
        organizationName: organization?.name || payload.storeName,
        storeId,
        storeName,
        storeSlug,
        organizations: [{ organization_id: orgId, organization_name: payload.storeName, store_id: storeId, store_name: storeName }],
        onboardingChecklist: onboardingChecklist || [],
        portalDestination: portalDestination || null,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return {
        success: true,
        destination: '/dashboard',
        token,
        orgId,
        storeId,
        storeSlug
      };
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: () => {
    clearAuthSession();

    set({
      token: null,
      user: null,
      role: null,
      permissions: [],
      organizationId: null,
      organizationName: null,
      storeId: null,
      storeName: null,
      storeSlug: null,
      organizations: [],
      onboardingChecklist: [],
      portalDestination: null,
      isAuthenticated: false,
      error: null
    });

    window.location.href = '/login';
  },

  checkAuth: async () => {
    const token = localStorage.getItem('billionbiz_token');
    if (!token) {
      set({ isAuthenticated: false, isCheckingAuth: false });
      return false;
    }

    set({ isCheckingAuth: true });
    try {
      const res = await api.getMe();
      const currentStoreName = res.storeName || localStorage.getItem('billionbiz_store_name');
      const currentStoreSlug = res.storeSlug || localStorage.getItem('billionbiz_store_slug');
      if (res.storeName) {
        localStorage.setItem('billionbiz_store_name', res.storeName);
      }
      if (res.storeSlug) {
        localStorage.setItem('billionbiz_store_slug', res.storeSlug);
      }

      set({
        user: res.user,
        role: res.role,
        storeId: res.storeId || localStorage.getItem('billionbiz_store_id'),
        storeName: currentStoreName,
        storeSlug: currentStoreSlug,
        organizationId: res.organizationId || localStorage.getItem('billionbiz_org_id'),
        organizationName: res.organizationName,
        onboardingChecklist: res.onboardingChecklist || [],
        portalDestination: res.portalDestination || null,
        permissions: res.permissions || [],
        isAuthenticated: true,
        isCheckingAuth: false
      });
      return true;
    } catch (err) {
      // Token expired or invalid - thoroughly purge storage and cookies
      clearAuthSession();
      set({
        token: null,
        user: null,
        role: null,
        permissions: [],
        organizationId: null,
        organizationName: null,
        storeId: null,
        storeName: null,
        storeSlug: null,
        organizations: [],
        isAuthenticated: false,
        isCheckingAuth: false
      });
      return false;
    }
  },

  switchStore: (newStoreId, newOrgId) => {
    localStorage.setItem('billionbiz_store_id', newStoreId);
    if (newOrgId) {
      localStorage.setItem('billionbiz_org_id', newOrgId);
      set({ organizationId: newOrgId, storeId: newStoreId });
    } else {
      set({ storeId: newStoreId });
    }
    window.location.reload();
  },

  clearError: () => set({ error: null })
}));
