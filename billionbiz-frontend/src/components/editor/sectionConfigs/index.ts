// ============================================================
// SECTION CONFIG REGISTRY
// Central registry for all section configurations
// ============================================================

import type { SectionConfig } from './types';

// Registry map
const sectionConfigRegistry: Map<string, SectionConfig> = new Map();

/**
 * Register a section config. Call this from each config file.
 */
export function registerSectionConfig(config: SectionConfig): void {
  sectionConfigRegistry.set(config.type, config);
}

/**
 * Get a section config by type.
 */
export function getSectionConfig(type: string): SectionConfig | undefined {
  return sectionConfigRegistry.get(type);
}

/**
 * Get all registered section configs.
 */
export function getAllSectionConfigs(): SectionConfig[] {
  return Array.from(sectionConfigRegistry.values());
}

/**
 * Get section configs by category.
 */
export function getSectionConfigsByCategory(category: string): SectionConfig[] {
  return getAllSectionConfigs().filter(c => c.category === category);
}

/**
 * Check if a section type has a config registered.
 */
export function hasSectionConfig(type: string): boolean {
  return sectionConfigRegistry.has(type);
}

// Import and register all configs
import { heroBannerConfig } from './heroBannerConfig';
import { featuredCollectionConfig } from './featuredCollectionConfig';
import { heroCarouselConfig } from './heroCarouselConfig';
import { categoryListConfig } from './categoryListConfig';
import { announcementBarConfig } from './announcementBarConfig';
import { utilityBarConfig } from './utilityBarConfig';
import { footerConfig } from './footerConfig';
import { footerMenuConfig } from './footerMenuConfig';
import { footerTextConfig } from './footerTextConfig';
import { faqConfig } from './faqConfig';
import { testimonialsConfig } from './testimonialsConfig';
import { imageWithTextConfig } from './imageWithTextConfig';
import { videoConfig } from './videoConfig';
import { newsletterConfig } from './newsletterConfig';
import { richTextConfig } from './richTextConfig';
import { blogPostsConfig } from './blogPostsConfig';
import { contactFormConfig } from './contactFormConfig';
import { pricingTableConfig } from './pricingTableConfig';
import { galleryConfig } from './galleryConfig';
import { mapConfig } from './mapConfig';
import { logoListConfig } from './logoListConfig';

[
  heroBannerConfig,
  featuredCollectionConfig,
  heroCarouselConfig,
  categoryListConfig,
  announcementBarConfig,
  utilityBarConfig,
  footerConfig,
  footerMenuConfig,
  footerTextConfig,
  faqConfig,
  testimonialsConfig,
  imageWithTextConfig,
  videoConfig,
  newsletterConfig,
  richTextConfig,
  blogPostsConfig,
  contactFormConfig,
  pricingTableConfig,
  galleryConfig,
  mapConfig,
  logoListConfig,
].forEach(registerSectionConfig);

// Re-export types
export type { SectionConfig, SectionTabConfig, SectionFieldConfig, FieldGroup, SectionLayoutOption, SectionCategory } from './types';
