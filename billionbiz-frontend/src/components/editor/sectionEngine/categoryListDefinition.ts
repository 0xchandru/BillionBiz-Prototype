import type { BlockDefinition, BlockInstance, SectionDefinition } from './types';

const createId = (prefix: string): string => {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}-${suffix}`;
};

export const categoryListBlockDefinitions: BlockDefinition[] = [
  {
    type: 'category-card-template',
    schemaVersion: 1,
    label: 'Category card template',
    description: 'One reusable card layout applied to every category returned by the catalogue.',
    allowedSections: ['CategoryList'],
    maxPerSection: 1,
    settings: [
      { key: 'showDescription', label: 'Show category description', control: 'toggle', defaultValue: true },
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
      { key: 'titleSize', label: 'Category title size', control: 'select', defaultValue: 'medium', options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ] }
    ],
    defaultSettings: {
      showDescription: true,
      imageRatio: 'square',
      imageFit: 'cover',
      titleSize: 'medium'
    }
  }
];

export const createDefaultCategoryListBlocks = (): BlockInstance[] => [
  {
    id: createId('category-card-template'),
    type: 'category-card-template',
    schemaVersion: 1,
    enabled: true,
    settings: {
      showDescription: true,
      imageRatio: 'square',
      imageFit: 'cover',
      titleSize: 'medium'
    },
    designOverrides: {},
    responsiveOverrides: {}
  }
];

export const categoryListSectionDefinition: SectionDefinition = {
  type: 'CategoryList',
  schemaVersion: 1,
  label: 'Category List',
  category: 'commerce',
  description: 'A responsive category directory powered by the store catalogue. Category data remains live and tenant-scoped.',
  renderer: 'category-list',
  allowedPageTypes: ['landing', 'home', 'standard', 'custom'],
  settings: [
    { key: 'heading', label: 'Heading', control: 'text', defaultValue: 'Shop by category', maxLength: 100 },
    { key: 'description', label: 'Description', control: 'textarea', defaultValue: '', maxLength: 300 },
    { key: 'linkText', label: 'View-all label', control: 'text', defaultValue: 'All categories', maxLength: 30 },
    { key: 'linkUrl', label: 'View-all destination', control: 'url', defaultValue: '/collections', maxLength: 500 },
    { key: 'layout', label: 'Layout', control: 'select', defaultValue: 'grid', options: [
      { label: 'Grid', value: 'grid' },
      { label: 'Carousel', value: 'carousel' }
    ] },
    { key: 'columns', label: 'Desktop columns', control: 'number', defaultValue: 4, min: 2, max: 6 },
    { key: 'categoryLimit', label: 'Categories to show', control: 'number', defaultValue: 8, min: 1, max: 24 },
    { key: 'emptyStateText', label: 'Empty-state message', control: 'textarea', defaultValue: 'Your active categories will appear here once you add them to your catalogue.', maxLength: 240 }
  ],
  allowedBlocks: categoryListBlockDefinitions.map((block) => block.type),
  minBlocks: 1,
  maxBlocks: 1,
  defaultSettings: {
    heading: 'Shop by category',
    description: '',
    linkText: 'All categories',
    linkUrl: '/collections',
    layout: 'grid',
    columns: 4,
    categoryLimit: 8,
    emptyStateText: 'Your active categories will appear here once you add them to your catalogue.'
  },
  createDefaultBlocks: createDefaultCategoryListBlocks
};

export const createCategoryListInstance = (sectionId: string, name = 'Category List') => ({
  id: sectionId,
  type: 'CategoryList',
  name,
  isHidden: false,
  schemaVersion: 1,
  enabled: true,
  settings: { ...categoryListSectionDefinition.defaultSettings },
  blocks: createDefaultCategoryListBlocks(),
  designOverrides: {},
  responsiveOverrides: {},
  props: {}
});
