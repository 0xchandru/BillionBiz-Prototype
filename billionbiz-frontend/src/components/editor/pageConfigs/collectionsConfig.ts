// ============================================================
// COLLECTIONS PAGE CONFIG
// ============================================================
import { Grid } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const collectionsConfig: PageConfig = {
  type: 'collections',
  name: 'Collections',
  category: 'storefront',
  icon: Grid,
  description: 'Browse product collections.',
  path: '/collections',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'PageHeader', name: 'Page Header', group: 'content', defaultProps: { heading: 'Our Collections', description: 'Explore our curated product collections.' } },
    { type: 'CollectionGrid', name: 'Collection Grid', group: 'content' },
    { type: 'Newsletter', name: 'Newsletter', group: 'content' },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'grid', label: 'Grid Layout' },
    { id: 'carousel', label: 'Carousel Layout' },
    { id: 'featured', label: 'Featured Collection Layout' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'pageTitle', label: 'Page Title', type: 'text', defaultValue: 'Our Collections' },
      { key: 'pageDescription', label: 'Page Description', type: 'textarea', defaultValue: 'Explore our curated product collections.' },
    ]}]},
    { id: 'collections', label: 'Collections', groups: [{ id: 'col-settings', label: 'Collection Settings', fields: [
      { key: 'collectionSource', label: 'Collection Source', type: 'select', options: [{ label: 'Automatic', value: 'auto' }, { label: 'Manual', value: 'manual' }], defaultValue: 'auto' },
      { key: 'gridColumns', label: 'Columns', type: 'segmented', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }], defaultValue: 3 },
      { key: 'showCollectionImage', label: 'Show Collection Image', type: 'toggle', defaultValue: true },
      { key: 'showDescription', label: 'Show Description', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
      { key: 'cardDesign', label: 'Card Design', type: 'select', options: [{ label: 'Minimal', value: 'minimal' }, { label: 'Bordered', value: 'bordered' }, { label: 'Shadow', value: 'shadow' }], defaultValue: 'minimal' },
      { key: 'imageRadius', label: 'Image Radius', type: 'select', options: [{ label: 'None', value: '0' }, { label: 'Small', value: '4px' }, { label: 'Medium', value: '8px' }, { label: 'Large', value: '16px' }], defaultValue: '8px' },
      { key: 'hoverEffect', label: 'Hover Effect', type: 'select', options: [{ label: 'None', value: 'none' }, { label: 'Lift', value: 'lift' }, { label: 'Zoom Image', value: 'zoom' }], defaultValue: 'lift' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'grid', pageTitle: 'Our Collections', pageDescription: 'Explore our curated product collections.',
    collectionSource: 'auto', gridColumns: 3, showCollectionImage: true, showDescription: true,
    cardDesign: 'minimal', imageRadius: '8px', hoverEffect: 'lift', pageWidth: 'standard',
  },
};
