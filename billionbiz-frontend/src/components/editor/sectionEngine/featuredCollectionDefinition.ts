import type { BlockDefinition, BlockInstance, SectionDefinition } from './types';

const createId = (prefix: string): string => {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}-${suffix}`;
};

export const featuredCollectionBlockDefinitions: BlockDefinition[] = [
  {
    type: 'product-card-template',
    schemaVersion: 1,
    label: 'Product card template',
    description: 'One reusable card layout applied to every product returned by the selected catalogue source.',
    allowedSections: ['FeaturedCollection'],
    maxPerSection: 1,
    settings: [
      { key: 'showPrice', label: 'Show price', control: 'toggle', defaultValue: true },
      { key: 'showCompareAt', label: 'Show compare-at price', control: 'toggle', defaultValue: true },
      { key: 'showVendor', label: 'Show brand', control: 'toggle', defaultValue: false },
      { key: 'showAddToCart', label: 'Show add-to-cart action', control: 'toggle', defaultValue: true }
    ],
    defaultSettings: {
      showPrice: true,
      showCompareAt: true,
      showVendor: false,
      showAddToCart: true
    }
  }
];

export const createDefaultFeaturedCollectionBlocks = (): BlockInstance[] => [
  {
    id: createId('product-card-template'),
    type: 'product-card-template',
    schemaVersion: 1,
    enabled: true,
    settings: {
      showPrice: true,
      showCompareAt: true,
      showVendor: false,
      showAddToCart: true
    },
    designOverrides: {},
    responsiveOverrides: {}
  }
];

export const featuredCollectionSectionDefinition: SectionDefinition = {
  type: 'FeaturedCollection',
  schemaVersion: 1,
  label: 'Featured Collection',
  category: 'commerce',
  description: 'A live product grid or carousel powered by the store catalogue. Product data is never copied into page content.',
  renderer: 'featured-collection',
  allowedPageTypes: ['landing', 'home', 'standard', 'custom'],
  settings: [
    { key: 'heading', label: 'Heading', control: 'text', defaultValue: 'Featured Collection', maxLength: 100 },
    { key: 'description', label: 'Description', control: 'textarea', defaultValue: '', maxLength: 300 },
    { key: 'linkText', label: 'View-all label', control: 'text', defaultValue: 'View all', maxLength: 30 },
    { key: 'linkUrl', label: 'View-all destination', control: 'url', defaultValue: '/shop', maxLength: 500 },
    { key: 'layout', label: 'Layout', control: 'select', defaultValue: 'grid', options: [
      { label: 'Grid', value: 'grid' },
      { label: 'Carousel', value: 'carousel' }
    ] },
    { key: 'columns', label: 'Desktop columns', control: 'number', defaultValue: 4, min: 2, max: 5 },
    { key: 'productLimit', label: 'Products to show', control: 'number', defaultValue: 8, min: 1, max: 24 },
    { key: 'emptyStateText', label: 'Empty-state message', control: 'textarea', defaultValue: 'Add and activate products in your catalogue. They will appear here automatically.', maxLength: 240 }
  ],
  allowedBlocks: featuredCollectionBlockDefinitions.map((block) => block.type),
  minBlocks: 1,
  maxBlocks: 1,
  defaultSettings: {
    heading: 'Featured Collection',
    description: '',
    linkText: 'View all',
    linkUrl: '/shop',
    layout: 'grid',
    columns: 4,
    productLimit: 8,
    emptyStateText: 'Add and activate products in your catalogue. They will appear here automatically.'
  },
  createDefaultBlocks: createDefaultFeaturedCollectionBlocks
};

export const createFeaturedCollectionInstance = (sectionId: string, name = 'Featured Collection') => ({
  id: sectionId,
  type: 'FeaturedCollection',
  name,
  isHidden: false,
  schemaVersion: 1,
  enabled: true,
  settings: { ...featuredCollectionSectionDefinition.defaultSettings },
  blocks: createDefaultFeaturedCollectionBlocks(),
  designOverrides: {},
  responsiveOverrides: {},
  props: {}
});
