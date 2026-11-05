import type { SectionInstance } from './types';
import { createHeroBannerInstance, createDefaultHeroBannerBlocks } from './heroBannerDefinition';
import { createFeaturedCollectionInstance } from './featuredCollectionDefinition';
import { getSectionDefinition } from './registry';

export interface LegacySectionData {
  id: string;
  type: string;
  name?: string;
  props?: Record<string, any>;
  isHidden?: boolean;
  schemaVersion?: number;
  enabled?: boolean;
  settings?: Record<string, any>;
  blocks?: Array<Record<string, any>>;
  designOverrides?: Record<string, any>;
  responsiveOverrides?: Record<string, any>;
}

export function isVersionedSection(section: LegacySectionData): section is LegacySectionData & SectionInstance {
  return Number(section.schemaVersion) > 0 &&
    Boolean(section.settings && typeof section.settings === 'object') &&
    Array.isArray(section.blocks);
}

export function migrateLegacyHeroBanner(section: LegacySectionData): LegacySectionData & SectionInstance {
  if (isVersionedSection(section)) return section;

  const props = section.props || {};
  const seeded = createHeroBannerInstance(section.id, section.name || 'Hero Banner');
  const blocks = createDefaultHeroBannerBlocks();

  const eyebrow = blocks.find((block) => block.type === 'eyebrow');
  const heading = blocks.find((block) => block.type === 'heading');
  const text = blocks.find((block) => block.type === 'rich-text');
  const button = blocks.find((block) => block.type === 'button');
  const image = blocks.find((block) => block.type === 'image');

  if (eyebrow) eyebrow.settings.text = String(props.badge ?? eyebrow.settings.text);
  if (heading) {
    heading.settings.text = String(props.heading ?? heading.settings.text);
    heading.settings.level = props.headingLevel === 'h2' ? 'h2' : 'h1';
  }
  if (text) text.settings.text = String(props.description ?? text.settings.text);
  if (button) {
    button.settings.label = String(props.primaryBtn ?? button.settings.label);
    button.settings.href = String(props.primaryBtnLink ?? '/shop');
  }
  if (image) {
    image.settings.src = String(props.image ?? '');
    image.settings.alt = String(props.imageAlt ?? '');
  }

  const legacyLayout = props.selectedLayout || props.layout;
  const layout = legacyLayout === 'right' ? 'split-left' : legacyLayout === 'center' ? 'centered' : 'split-right';

  return {
    ...seeded,
    settings: {
      ...seeded.settings,
      layout,
      contentWidth: props.sectionWidth || 'wide',
      minHeight: Number(props.minHeight || 520)
    },
    blocks,
    designOverrides: {
      ...(props.bgColor && props.bgColor !== 'inherit' ? { sectionBackground: props.bgColor } : {}),
      ...(props.headingColor && props.headingColor !== 'inherit' ? { headingColor: props.headingColor } : {}),
      ...(props.textColor && props.textColor !== 'inherit' ? { bodyColor: props.textColor } : {})
    },
    responsiveOverrides: {},
    props
  };
}

export function migrateLegacyFeaturedCollection(section: LegacySectionData): LegacySectionData & SectionInstance {
  if (isVersionedSection(section)) return section;

  const props = section.props || {};
  const seeded = createFeaturedCollectionInstance(section.id, section.name || 'Featured Collection');
  const settings = {
    ...seeded.settings,
    ...(typeof props.heading === 'string' ? { heading: props.heading } : {}),
    ...(typeof props.description === 'string' ? { description: props.description } : {}),
    ...(typeof props.linkText === 'string' ? { linkText: props.linkText } : {}),
    ...(typeof props.linkUrl === 'string' ? { linkUrl: props.linkUrl } : {}),
    ...(typeof props.selectedLayout === 'string' ? { layout: props.selectedLayout } : {}),
    ...(typeof props.layout === 'string' ? { layout: props.layout } : {}),
    ...(typeof props.columns === 'number' ? { columns: props.columns } : {}),
    ...(typeof props.productLimit === 'number' ? { productLimit: props.productLimit } : {})
  };

  return {
    ...seeded,
    settings,
    // Product data remains a live catalogue binding. Legacy copied arrays are
    // deliberately not migrated into page content.
    designOverrides: {
      ...(props.bgColor && props.bgColor !== 'inherit' ? { sectionBackground: props.bgColor } : {}),
      ...(props.headingColor && props.headingColor !== 'inherit' ? { headingColor: props.headingColor } : {}),
      ...(props.textColor && props.textColor !== 'inherit' ? { bodyColor: props.textColor } : {}),
      ...(props.cardBg && props.cardBg !== 'inherit' ? { cardBackground: props.cardBg } : {}),
      ...(props.priceColor && props.priceColor !== 'inherit' ? { priceColor: props.priceColor } : {}),
      ...(props.linkColor && props.linkColor !== 'inherit' ? { linkColor: props.linkColor } : {})
    },
    responsiveOverrides: {},
    props: {}
  } as LegacySectionData & SectionInstance;
}

export function migrateLegacySection(section: LegacySectionData): LegacySectionData {
  if (isVersionedSection(section)) return section;
  const definition = getSectionDefinition(section.type);
  if (!definition) return section;

  if (section.type === 'HeroBanner') {
    return migrateLegacyHeroBanner(section);
  }
  if (section.type === 'FeaturedCollection') {
    return migrateLegacyFeaturedCollection(section);
  }

  return {
    ...section,
    schemaVersion: definition.schemaVersion,
    enabled: section.isHidden !== true,
    settings: { ...definition.defaultSettings, ...(section.props || {}) },
    blocks: [],
    designOverrides: {},
    responsiveOverrides: {}
  };
}

export function sectionInstanceToRendererProps(section: LegacySectionData): Record<string, any> {
  if (!isVersionedSection(section)) {
    if (section.type === 'HeroBanner' || section.type === 'FeaturedCollection') {
      const migrated = section.type === 'HeroBanner'
        ? migrateLegacyHeroBanner(section)
        : migrateLegacyFeaturedCollection(section);
      return {
        ...(section.props || {}),
        ...(migrated.settings || {}),
        blocks: migrated.blocks || [],
        designOverrides: migrated.designOverrides || {},
        responsiveOverrides: migrated.responsiveOverrides || {},
        schemaVersion: migrated.schemaVersion
      };
    }
    return { ...(section.props || {}) };
  }

  return {
    ...(section.props || {}),
    ...(section.settings || {}),
    blocks: section.blocks,
    designOverrides: section.designOverrides || {},
    responsiveOverrides: section.responsiveOverrides || {},
    schemaVersion: section.schemaVersion
  };
}
