/**
 * BillionBiz Google Identity Services (GIS) Helper
 *
 * Implements Google One Tap & OAuth 2.0 Credential flow with zero external secret exposure.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: any) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
            }
          ) => void;
        };
      };
    };
  }
}

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '176816617327-338f5b96d37nc5sk6oafeck405sfu9qc.apps.googleusercontent.com';

let scriptLoadingPromise: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();

  if (!scriptLoadingPromise) {
    scriptLoadingPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById('google-gsi-script');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  return scriptLoadingPromise;
}

export async function initiateGoogleSignIn(
  onSuccess: (credential: string) => void,
  onError: (errorMessage: string) => void
): Promise<void> {
  try {
    await loadGoogleScript();

    if (!window.google?.accounts?.id) {
      onError('Google Identity Services SDK could not be initialized.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (res: { credential?: string }) => {
        if (res.credential) {
          onSuccess(res.credential);
        } else {
          onError('Google Sign-In was cancelled or did not return credentials.');
        }
      },
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true
    } as any);

    // Prompt user with Google One-Tap / Account Chooser
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const reason = notification.getNotDisplayedReason ? notification.getNotDisplayedReason() : 'unknown';
        if (reason === 'unregistered_origin') {
          console.info('[Google Auth] Origin not registered for Google One-Tap (normal for localhost development). Use direct login.');
        } else {
          console.warn('[Google Auth] Prompt not displayed:', reason);
        }
      }
    });
  } catch (err: any) {
    console.error('[Google Auth Error]', err);
    onError(err.message || 'Google authentication encountered an unexpected error.');
  }
}

/**
 * Decodes Google JWT id_token payload into user profile details
 */
export function decodeGoogleCredential(credential: string): { email?: string; name?: string; picture?: string; sub?: string } | null {
  try {
    const parts = credential.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub
    };
  } catch (e) {
    console.error('[Google Auth] Failed to decode credential token', e);
    return null;
  }
}

