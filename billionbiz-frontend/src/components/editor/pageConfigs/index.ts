// ============================================================
// PAGE CONFIG REGISTRY
// Central registry for all page configurations
// ============================================================

import type { PageConfig, PageCategory } from './types';

// Registry map
const pageConfigRegistry: Map<string, PageConfig> = new Map();

/**
 * Register a page config.
 */
export function registerPageConfig(config: PageConfig): void {
  pageConfigRegistry.set(config.type, config);
}

/**
 * Get a page config by type.
 */
export function getPageConfig(type: string): PageConfig | undefined {
  return pageConfigRegistry.get(type);
}

/**
 * Get all registered page configs.
 */
export function getAllPageConfigs(): PageConfig[] {
  return Array.from(pageConfigRegistry.values());
}

/**
 * Get page configs by category.
 */
export function getPageConfigsByCategory(category: PageCategory): PageConfig[] {
  return getAllPageConfigs().filter(c => c.category === category);
}

/**
 * Get all page configs grouped by category.
 */
export function getPageConfigsGrouped(): Record<PageCategory, PageConfig[]> {
  const grouped: Record<PageCategory, PageConfig[]> = {
    storefront: [],
    commerce: [],
    customer: [],
    legal: [],
    system: [],
  };
  getAllPageConfigs().forEach(config => {
    grouped[config.category].push(config);
  });
  return grouped;
}

/**
 * Get the category display name.
 */
export function getCategoryDisplayName(category: PageCategory): string {
  const names: Record<PageCategory, string> = {
    storefront: 'Storefront',
    commerce: 'Commerce',
    customer: 'Customer',
    legal: 'Legal',
    system: 'System',
  };
  return names[category] || category;
}

// Import and register all page configs
import { shopConfig } from './shopConfig';
import { collectionsConfig } from './collectionsConfig';
import { collectionDetailsConfig } from './collectionDetailsConfig';
import { aboutConfig } from './aboutConfig';
import { contactConfig } from './contactConfig';
import { faqPageConfig } from './faqPageConfig';
import { reviewsConfig } from './reviewsConfig';
import { searchResultsConfig } from './searchResultsConfig';
import { productDetailsConfig } from './productDetailsConfig';
import { cartConfig } from './cartConfig';
import { wishlistConfig } from './wishlistConfig';
import { checkoutConfig } from './checkoutConfig';
import { loginConfig } from './loginConfig';
import { registerConfig } from './registerConfig';
import { accountConfig } from './accountConfig';
import { orderHistoryConfig, orderDetailsConfig } from './orderConfigs';
import { privacyPolicyConfig, termsConditionsConfig, shippingPolicyConfig, returnPolicyConfig } from './legalConfigs';
import { notFoundConfig } from './notFoundConfig';

[
  // Storefront
  shopConfig,
  collectionsConfig,
  collectionDetailsConfig,
  aboutConfig,
  contactConfig,
  faqPageConfig,
  reviewsConfig,
  searchResultsConfig,
  // Commerce
  productDetailsConfig,
  cartConfig,
  wishlistConfig,
  checkoutConfig,
  // Customer
  loginConfig,
  registerConfig,
  accountConfig,
  orderHistoryConfig,
  orderDetailsConfig,
  // Legal
  privacyPolicyConfig,
  termsConditionsConfig,
  shippingPolicyConfig,
  returnPolicyConfig,
  // System
  notFoundConfig,
].forEach(registerPageConfig);

// Re-export types
export type { PageConfig, PageTabConfig, PageCategory, PageLayoutOption, DefaultSectionDef } from './types';
