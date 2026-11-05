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
      { key: 'showDescription', label: 'Show product description', control: 'toggle', defaultValue: false },
      { key: 'showAddToCart', label: 'Show add-to-cart action', control: 'toggle', defaultValue: true },
      { key: 'imageRatio', label: 'Image ratio', control: 'select', defaultValue: 'square', options: [
        { label: 'Square · 1:1', value: 'square' },
        { label: 'Portrait · 4:5', value: 'portrait' },
        { label: 'Tall · 3:4', value: 'tall' },
        { label: 'Landscape · 4:3', value: 'landscape' }
      ] },
      { key: 'imageFit', label: 'Image fit', control: 'select', defaultValue: 'cover', options: [
        { label: 'Fill frame', value: 'cover' },
        { label: 'Fit entire image', value: 'contain' }
      ] },
      { key: 'titleSize', label: 'Product title size', control: 'select', defaultValue: 'medium', options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ] },
      { key: 'addToCartLabel', label: 'Add-to-cart button label', control: 'text', defaultValue: 'Add to cart', maxLength: 24 },
      { key: 'chooseOptionsLabel', label: 'Variant button label', control: 'text', defaultValue: 'Choose options', maxLength: 24 },
      { key: 'actionStyle', label: 'Action button style', control: 'select', defaultValue: 'primary', options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' }
      ] }
    ],
    defaultSettings: {
      showPrice: true,
      showCompareAt: true,
      showVendor: false,
      showDescription: false,
      showAddToCart: true,
      imageRatio: 'square',
      imageFit: 'cover',
      titleSize: 'medium',
      addToCartLabel: 'Add to cart',
      chooseOptionsLabel: 'Choose options',
      actionStyle: 'primary'
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
