/**
 * Stable bridge between editor navigation aliases and persisted page records.
 *
 * The editor still uses readable route aliases in its URLs (for example,
 * "landing-page"), while the backend owns real database IDs. All page lookups
 * must pass through this resolver instead of assuming an alias is a DB ID.
 */

export interface PageIdentityLike {
  id: string;
  path: string;
  type?: string;
  name?: string;
}

const normalizePath = (path: string): string => {
  const value = String(path || '/').trim();
  if (!value.startsWith('/')) return `/${value}`;
  const normalized = value.replace(/\\/+$/, '');
  return normalized || '/';
};

const ROUTE_ALIASES: Record<string, string> = {
  'landing-page': '/',
  'home-page': '/',
  home: '/',
  'shop-page': '/shop',
  'product-details-page': '/products',
  'collections-page': '/collections',
  'collection-details-page': '/collections',
  'cart-page': '/cart',
  'checkout-page': '/checkout',
  'account-page': '/account',
  'booking-page': '/booking',
  'about-page': '/about',
  'contact-page': '/contact',
  'faq-page': '/faq',
  'privacy-policy-page': '/policies/privacy',
  'terms-conditions-page': '/policies/terms',
  'shipping-policy-page': '/policies/shipping',
  'return-policy-page': '/policies/refund',
  'refund-policy-page': '/policies/refund',
  'wishlist-page': '/wishlist',
  'search-page': '/search',
};

export function getHomePage<T extends PageIdentityLike>(pages: T[]): T | undefined {
  return pages.find((page) => normalizePath(page.path) === '/') ||
    pages.find((page) => page.type === 'landing' || page.type === 'home');
}

export function resolveEditorPage<T extends PageIdentityLike>(
  pages: T[],
  selectedPageId?: string | null
): T | undefined {
  if (!Array.isArray(pages) || pages.length === 0) return undefined;
  if (!selectedPageId) return getHomePage(pages) || pages[0];

  const exact = pages.find((page) => page.id === selectedPageId);
  if (exact) return exact;

  const alias = selectedPageId.toLowerCase();
  const route = alias.startsWith('/') ? normalizePath(alias) : ROUTE_ALIASES[alias];
  if (route) {
    const routeMatch = pages.find((page) => normalizePath(page.path) === route);
    if (routeMatch) return routeMatch;
  }

  const type = alias.replace(/-page$/, '');
  const typeMatch = pages.find((page) => page.type?.toLowerCase() === type);
  if (typeMatch) return typeMatch;

  const nameMatch = pages.find((page) =>
    page.name?.toLowerCase().replace(/\\s+/g, '-') === type
  );
  return nameMatch || getHomePage(pages) || pages[0];
}

export function resolveHomePageOrThrow<T extends PageIdentityLike>(pages: T[]): T {
  const homePage = getHomePage(pages);
  if (!homePage) {
    throw new Error('The store does not have a homepage record.');
  }
  return homePage;
}
