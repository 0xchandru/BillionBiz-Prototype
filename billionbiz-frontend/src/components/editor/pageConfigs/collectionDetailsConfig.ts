// ============================================================
// COLLECTION DETAILS PAGE CONFIG
// ============================================================
import { Layers } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const collectionDetailsConfig: PageConfig = {
  type: 'collection-details',
  name: 'Collection Details',
  category: 'storefront',
  icon: Layers,
  description: 'Dynamic collection page with products.',
  path: '/collections/:slug',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'CollectionHero', name: 'Collection Hero', group: 'content' },
    { type: 'Breadcrumbs', name: 'Breadcrumbs', group: 'content' },
    { type: 'RichText', name: 'Collection Description', group: 'content', defaultProps: { heading: '', body: 'Explore our curated selection of premium products in this collection.' } },
    { type: 'ProductListing', name: 'Product Listing', group: 'content' },
    { type: 'Newsletter', name: 'Newsletter', group: 'content' },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'hero-grid', label: 'Hero + Product Grid' },
    { id: 'sidebar-grid', label: 'Sidebar + Product Grid' },
    { id: 'minimal', label: 'Minimal Grid' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Collection Content', fields: [
      { key: 'collectionTitle', label: 'Collection Title', type: 'text', helpText: 'Dynamically populated from collection data' },
      { key: 'collectionDescription', label: 'Description', type: 'textarea' },
      { key: 'heroContent', label: 'Hero Promotional Text', type: 'textarea' },
    ]}]},
    { id: 'collectionHero', label: 'Collection Hero', groups: [{ id: 'hero', label: 'Hero Settings', fields: [
      { key: 'heroImage', label: 'Hero Image', type: 'image' },
      { key: 'heroMobileImage', label: 'Mobile Image', type: 'image' },
      { key: 'heroOverlay', label: 'Overlay', type: 'toggle', defaultValue: true },
      { key: 'heroTextPosition', label: 'Text Position', type: 'segmented', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }], defaultValue: 'center' },
    ]}]},
    { id: 'products', label: 'Products', groups: [{ id: 'products', label: 'Product Display', fields: [
      { key: 'gridColumns', label: 'Grid Columns', type: 'segmented', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }], defaultValue: 4 },
      { key: 'enableFilters', label: 'Enable Filters', type: 'toggle', defaultValue: true },
      { key: 'enableSorting', label: 'Enable Sorting', type: 'toggle', defaultValue: true },
      { key: 'enablePagination', label: 'Enable Pagination', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
      { key: 'imageRadius', label: 'Image Radius', type: 'select', options: [{ label: 'None', value: '0' }, { label: 'Medium', value: '8px' }, { label: 'Large', value: '16px' }], defaultValue: '8px' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'hero-grid', gridColumns: 4, enableFilters: true, enableSorting: true, enablePagination: true,
    heroOverlay: true, heroTextPosition: 'center', pageWidth: 'standard',
  },
  seoConfig: { dynamic: true, template: '{collection.name} - BillionBiz' },
};
