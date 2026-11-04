// ============================================================
// WISHLIST PAGE CONFIG
// ============================================================
import { Heart } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const wishlistConfig: PageConfig = {
  type: 'wishlist',
  name: 'Wishlist',
  category: 'commerce',
  icon: Heart,
  description: 'View saved/wishlisted products.',
  path: '/wishlist',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'RichText', name: 'Wishlist Header', group: 'content', defaultProps: { heading: 'My Wishlist', body: '' } },
    { type: 'ProductListing', name: 'Wishlist Products', group: 'content' },
    { type: 'Newsletter', name: 'Newsletter', group: 'content' },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'grid', label: 'Grid Layout' },
    { id: 'list', label: 'List Layout' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'heading', label: 'Heading', type: 'text', defaultValue: 'My Wishlist' },
      { key: 'emptyHeading', label: 'Empty State Heading', type: 'text', defaultValue: 'Your wishlist is empty' },
      { key: 'emptyDescription', label: 'Empty State Description', type: 'textarea', defaultValue: 'Save items you love to your wishlist and find them here later.' },
      { key: 'emptyCtaText', label: 'Empty State CTA', type: 'text', defaultValue: 'Start Shopping' },
    ]}]},
    { id: 'products', label: 'Products', groups: [{ id: 'products', label: 'Product Display', fields: [
      { key: 'gridColumns', label: 'Columns', type: 'segmented', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }], defaultValue: 4 },
      { key: 'showRemove', label: 'Remove Button', type: 'toggle', defaultValue: true },
      { key: 'showAddToCart', label: 'Add to Cart Button', type: 'toggle', defaultValue: true },
      { key: 'showAvailability', label: 'Show Availability', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'grid', heading: 'My Wishlist',
    emptyHeading: 'Your wishlist is empty', emptyDescription: 'Save items you love to your wishlist.',
    emptyCtaText: 'Start Shopping', gridColumns: 4, showRemove: true, showAddToCart: true, showAvailability: true,
    pageWidth: 'standard',
  },
};
