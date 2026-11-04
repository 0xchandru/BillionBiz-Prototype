import type { BlockDefinition, BlockInstance, SectionDefinition } from './types';

const id = (prefix: string) => {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}-${randomPart}`;
};

export const heroBannerBlockDefinitions: BlockDefinition[] = [
  {
    type: 'eyebrow',
    schemaVersion: 1,
    label: 'Eyebrow',
    description: 'Short supporting label above the main headline.',
    allowedSections: ['HeroBanner'],
    maxPerSection: 1,
    settings: [
      { key: 'text', label: 'Text', control: 'text', defaultValue: 'New collection', maxLength: 60 }
    ],
    defaultSettings: { text: 'New collection' }
  },
  {
    type: 'heading',
    schemaVersion: 1,
    label: 'Heading',
    description: 'Primary page headline.',
    allowedSections: ['HeroBanner'],
    maxPerSection: 1,
    settings: [
      { key: 'text', label: 'Heading', control: 'textarea', defaultValue: 'Make room for what you love.', maxLength: 180 },
      { key: 'level', label: 'Heading level', control: 'select', defaultValue: 'h1', options: [
        { label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' }
      ] }
    ],
    defaultSettings: { text: 'Make room for what you love.', level: 'h1' }
  },
  {
    type: 'rich-text',
    schemaVersion: 1,
    label: 'Text',
    description: 'Supporting copy for the hero.',
    allowedSections: ['HeroBanner'],
    maxPerSection: 1,
    settings: [
      { key: 'text', label: 'Text', control: 'textarea', defaultValue: 'Discover products chosen to make everyday moments feel a little more special.', maxLength: 500 }
    ],
    defaultSettings: { text: 'Discover products chosen to make everyday moments feel a little more special.' }
  },
  {
    type: 'button',
    schemaVersion: 1,
    label: 'Button',
    description: 'A navigational or conversion action.',
    allowedSections: ['HeroBanner'],
    maxPerSection: 2,
    settings: [
      { key: 'label', label: 'Button label', control: 'text', defaultValue: 'Explore products', maxLength: 40 },
      { key: 'href', label: 'Destination', control: 'url', defaultValue: '/shop', maxLength: 500 },
      { key: 'variant', label: 'Style', control: 'select', defaultValue: 'primary', options: [
        { label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Text link', value: 'text' }
      ] },
      { key: 'openInNewTab', label: 'Open in new tab', control: 'toggle', defaultValue: false }
    ],
    defaultSettings: { label: 'Explore products', href: '/shop', variant: 'primary', openInNewTab: false }
  },
  {
    type: 'image',
    schemaVersion: 1,
    label: 'Image',
    description: 'Optional hero media. Use a real uploaded asset or approved external image URL.',
    allowedSections: ['HeroBanner'],
    maxPerSection: 1,
    settings: [
      { key: 'src', label: 'Image URL', control: 'image', defaultValue: '', maxLength: 2000 },
      { key: 'alt', label: 'Alternative text', control: 'text', defaultValue: '', maxLength: 180 },
      { key: 'fit', label: 'Image fit', control: 'select', defaultValue: 'cover', options: [
        { label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }
      ] }
    ],
    defaultSettings: { src: '', alt: '', fit: 'cover' }
  }
];

const makeBlock = (type: string, settings: Record<string, any>): BlockInstance => ({
  id: id(type),
  type,
  schemaVersion: 1,
  enabled: true,
  settings,
  designOverrides: {},
  responsiveOverrides: {}
});

export const createDefaultHeroBannerBlocks = (): BlockInstance[] => [
  makeBlock('eyebrow', { text: 'New collection' }),
  makeBlock('heading', { text: 'Make room for what you love.', level: 'h1' }),
  makeBlock('rich-text', { text: 'Discover products chosen to make everyday moments feel a little more special.' }),
  makeBlock('button', { label: 'Explore products', href: '/shop', variant: 'primary', openInNewTab: false }),
  makeBlock('image', { src: '', alt: '', fit: 'cover' })
];

export const heroBannerSectionDefinition: SectionDefinition = {
  type: 'HeroBanner',
  schemaVersion: 1,
  label: 'Hero Banner',
  category: 'hero',
  description: 'A responsive introduction with reusable content blocks and optional media.',
  renderer: 'hero-banner',
  allowedPageTypes: ['landing', 'home', 'standard', 'custom'],
  settings: [
    { key: 'layout', label: 'Layout', control: 'select', defaultValue: 'split-right', options: [
      { label: 'Text left, image right', value: 'split-right' },
      { label: 'Image left, text right', value: 'split-left' },
      { label: 'Centered', value: 'centered' }
    ] },
    { key: 'contentWidth', label: 'Content width', control: 'select', defaultValue: 'wide', options: [
      { label: 'Standard', value: 'standard' }, { label: 'Wide', value: 'wide' }, { label: 'Full width', value: 'full' }
    ] },
    { key: 'verticalAlignment', label: 'Vertical alignment', control: 'select', defaultValue: 'center', options: [
      { label: 'Top', value: 'start' }, { label: 'Center', value: 'center' }, { label: 'Bottom', value: 'end' }
    ] },
    { key: 'minHeight', label: 'Minimum height', control: 'number', defaultValue: 520, min: 280, max: 900 }
  ],
  allowedBlocks: heroBannerBlockDefinitions.map((block) => block.type),
  minBlocks: 1,
  maxBlocks: 12,
  defaultSettings: {
    layout: 'split-right',
    contentWidth: 'wide',
    verticalAlignment: 'center',
    minHeight: 520
  },
  createDefaultBlocks: createDefaultHeroBannerBlocks
};

export const createHeroBannerInstance = (sectionId: string, name = 'Hero Banner') => ({
  id: sectionId,
  type: 'HeroBanner',
  name,
  isHidden: false,
  schemaVersion: 1,
  enabled: true,
  settings: { ...heroBannerSectionDefinition.defaultSettings },
  blocks: createDefaultHeroBannerBlocks(),
  designOverrides: {},
  responsiveOverrides: {},
  props: {}
});
