/**
 * Platform Version & Non-Destructive Storage Configuration
 *
 * Invariant: Platform version upgrades must NEVER wipe or reset merchant store
 * content, pages, themes, or draft revisions.
 */

declare const __APP_VERSION__: string | undefined;

export const PLATFORM_VERSION =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.3.0';
export const PLATFORM_VERSION_STORAGE_KEY = 'billionbiz_platform_version';

export interface VersionCheckResult {
  isNewVersion: boolean;
  previousVersion: string | null;
  currentVersion: string;
}

/**
 * Checks whether the browser is running this platform version for the first time.
 * Invariant: All merchant-owned store data, page drafts, themes, and settings are preserved.
 */
export const checkAndHandleVersionUpgrade = (): VersionCheckResult => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { isNewVersion: false, previousVersion: null, currentVersion: PLATFORM_VERSION };
  }

  try {
    const storedVersion = localStorage.getItem(PLATFORM_VERSION_STORAGE_KEY);
    const isNewVersion = storedVersion !== PLATFORM_VERSION;

    if (isNewVersion) {
      console.info(
        `%c[BillionBiz Platform]%c Upgraded from ${storedVersion || 'initial'} to v${PLATFORM_VERSION}. Preserving all merchant data.`,
        'background: #064652; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
        'color: inherit;'
      );

      // Record the current platform version without touching any merchant data keys
      localStorage.setItem(PLATFORM_VERSION_STORAGE_KEY, PLATFORM_VERSION);

      return {
        isNewVersion: true,
        previousVersion: storedVersion,
        currentVersion: PLATFORM_VERSION,
      };
    }

    return {
      isNewVersion: false,
      previousVersion: storedVersion,
      currentVersion: PLATFORM_VERSION,
    };
  } catch (error) {
    console.error('[BillionBiz Platform] Error checking version:', error);
    return { isNewVersion: false, previousVersion: null, currentVersion: PLATFORM_VERSION };
  }
};
