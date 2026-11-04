// ============================================================
// SEARCH RESULTS PAGE CONFIG
// ============================================================
import { Search } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const searchResultsConfig: PageConfig = {
  type: 'search-results',
  name: 'Search Results',
  category: 'storefront',
  icon: Search,
  description: 'Display search results with filters.',
  path: '/search',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'RichText', name: 'Search Header', group: 'content', defaultProps: { heading: 'Search Results', body: '' } },
    { type: 'ProductListing', name: 'Search Results', group: 'content' },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'grid', label: 'Grid Results' },
    { id: 'grid-sidebar', label: 'Grid with Sidebar' },
    { id: 'list', label: 'List Results' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'searchHeading', label: 'Search Heading', type: 'text', defaultValue: 'Search Results' },
      { key: 'searchPlaceholder', label: 'Search Placeholder', type: 'text', defaultValue: 'Search products...' },
      { key: 'emptyMessage', label: 'Empty Search Message', type: 'text', defaultValue: 'Start typing to search our products.' },
      { key: 'noResultsMessage', label: 'No Results Message', type: 'text', defaultValue: 'No products found. Try adjusting your search.' },
    ]}]},
    { id: 'products', label: 'Products', groups: [{ id: 'products', label: 'Product Display', fields: [
      { key: 'gridColumns', label: 'Grid Columns', type: 'segmented', options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }], defaultValue: 4 },
      { key: 'resultsPerPage', label: 'Results Per Page', type: 'number', min: 8, max: 48, defaultValue: 12 },
      { key: 'enablePagination', label: 'Enable Pagination', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'filters', label: 'Filters', groups: [{ id: 'filters', label: 'Filter Settings', fields: [
      { key: 'enableFilters', label: 'Enable Filters', type: 'toggle', defaultValue: true },
      { key: 'filterPosition', label: 'Filter Position', type: 'segmented', options: [{ label: 'Sidebar', value: 'sidebar' }, { label: 'Top', value: 'top' }, { label: 'Drawer', value: 'drawer' }], defaultValue: 'sidebar', showWhen: { field: 'enableFilters', value: true } },
    ]}]},
    { id: 'sorting', label: 'Sorting', groups: [{ id: 'sorting', label: 'Sorting Options', fields: [
      { key: 'enableSorting', label: 'Enable Sorting', type: 'toggle', defaultValue: true },
      { key: 'defaultSort', label: 'Default Sort', type: 'select', options: [{ label: 'Relevance', value: 'relevance' }, { label: 'Price: Low to High', value: 'price-asc' }, { label: 'Price: High to Low', value: 'price-desc' }, { label: 'Newest', value: 'newest' }], defaultValue: 'relevance' },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'grid', searchHeading: 'Search Results', searchPlaceholder: 'Search products...',
    emptyMessage: 'Start typing to search our products.', noResultsMessage: 'No products found.',
    gridColumns: 4, resultsPerPage: 12, enableFilters: true, filterPosition: 'sidebar', enableSorting: true, enablePagination: true,
    pageWidth: 'standard',
  },
};
