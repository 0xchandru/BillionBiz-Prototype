// ============================================================
// SHOP / PRODUCTS PAGE CONFIG
// ============================================================

import { ShoppingBag } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const shopConfig: PageConfig = {
  type: 'shop',
  name: 'Product Listing',
  category: 'storefront',
  icon: ShoppingBag,
  description: 'Display all products with filters and sorting.',
  path: '/collections/all',
  headerVariant: 'default',
  footerVariant: 'default',

  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'PageHeader', name: 'Page Header', group: 'content', defaultProps: { heading: 'Shop All Products', description: 'Browse our complete collection of premium products.' } },
    { type: 'Breadcrumbs', name: 'Breadcrumbs', group: 'content' },
    { type: 'ProductListing', name: 'Product Listing', group: 'content' },
    { type: 'Newsletter', name: 'Newsletter', group: 'content' },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],

  layouts: [
    { id: 'grid-sidebar', label: 'Grid with Sidebar', description: 'Product grid with filter sidebar' },
    { id: 'grid-full', label: 'Full Width Grid', description: 'Full-width product grid with top filters' },
    { id: 'grid-minimal', label: 'Minimal Grid', description: 'Clean minimal product grid' },
  ],

  getTabs: (selectedLayout?: string, _props?: Record<string, any>): PageTabConfig[] => {
    const tabs: PageTabConfig[] = [];

    // Content tab
    tabs.push({
      id: 'content',
      label: 'Content',
      groups: [
        {
          id: 'page-content',
          label: 'Page Content',
          fields: [
            { key: 'pageTitle', label: 'Page Title', type: 'text', defaultValue: 'Shop All Products' },
            { key: 'pageDescription', label: 'Page Description', type: 'textarea', defaultValue: 'Browse our complete collection of premium products.' },
            { key: 'introText', label: 'Introduction Text', type: 'textarea' },
            { key: 'emptyStateTitle', label: 'Empty State Title', type: 'text', defaultValue: 'No products found' },
            { key: 'emptyStateDescription', label: 'Empty State Description', type: 'textarea', defaultValue: 'Try adjusting your filters or search criteria.' },
          ],
        },
      ],
    });

    // Products tab
    tabs.push({
      id: 'products',
      label: 'Products',
      groups: [
        {
          id: 'product-source',
          label: 'Product Source',
          fields: [
            {
              key: 'productSource',
              label: 'Product Source',
              type: 'select',
              options: [
                { label: 'All Products', value: 'all' },
                { label: 'Collection', value: 'collection' },
                { label: 'Featured', value: 'featured' },
                { label: 'Best Sellers', value: 'best-sellers' },
                { label: 'New Arrivals', value: 'new-arrivals' },
                { label: 'On Sale', value: 'sale' },
              ],
              defaultValue: 'all',
            },
            { key: 'productsPerPage', label: 'Products Per Page', type: 'number', min: 4, max: 48, step: 4, defaultValue: 12 },
            {
              key: 'gridColumns',
              label: 'Grid Columns',
              type: 'segmented',
              options: [
                { label: '2', value: 2 },
                { label: '3', value: 3 },
                { label: '4', value: 4 },
              ],
              defaultValue: 4,
            },
            { key: 'enablePagination', label: 'Enable Pagination', type: 'toggle', defaultValue: true },
            {
              key: 'paginationType',
              label: 'Pagination Type',
              type: 'select',
              options: [
                { label: 'Page Numbers', value: 'numbered' },
                { label: 'Load More', value: 'load-more' },
                { label: 'Infinite Scroll', value: 'infinite' },
              ],
              defaultValue: 'numbered',
              showWhen: { field: 'enablePagination', value: true },
            },
          ],
        },
      ],
    });

    // Filters tab
    tabs.push({
      id: 'filters',
      label: 'Filters',
      groups: [
        {
          id: 'filter-settings',
          label: 'Filter Settings',
          fields: [
            { key: 'enableFilters', label: 'Enable Filters', type: 'toggle', defaultValue: true },
            {
              key: 'filterPosition',
              label: 'Filter Position',
              type: 'segmented',
              options: [
                { label: 'Sidebar', value: 'sidebar' },
                { label: 'Drawer', value: 'drawer' },
                { label: 'Top', value: 'top' },
              ],
              defaultValue: selectedLayout === 'grid-sidebar' ? 'sidebar' : 'top',
              showWhen: { field: 'enableFilters', value: true },
            },
          ],
        },
        {
          id: 'filter-types',
          label: 'Available Filters',
          showWhen: { field: 'enableFilters', value: true },
          fields: [
            { key: 'filterPrice', label: 'Price Filter', type: 'toggle', defaultValue: true },
            { key: 'filterCategory', label: 'Category Filter', type: 'toggle', defaultValue: true },
            { key: 'filterAvailability', label: 'Availability Filter', type: 'toggle', defaultValue: true },
            { key: 'filterRating', label: 'Rating Filter', type: 'toggle', defaultValue: false },
          ],
        },
      ],
    });

    // Sorting tab
    tabs.push({
      id: 'sorting',
      label: 'Sorting',
      groups: [
        {
          id: 'sorting-settings',
          label: 'Sorting Options',
          fields: [
            { key: 'enableSorting', label: 'Enable Sorting', type: 'toggle', defaultValue: true },
            {
              key: 'defaultSort',
              label: 'Default Sort',
              type: 'select',
              options: [
                { label: 'Featured', value: 'featured' },
                { label: 'Price: Low to High', value: 'price-asc' },
                { label: 'Price: High to Low', value: 'price-desc' },
                { label: 'Newest First', value: 'newest' },
                { label: 'Best Selling', value: 'best-selling' },
                { label: 'Alphabetical', value: 'alpha' },
              ],
              defaultValue: 'featured',
              showWhen: { field: 'enableSorting', value: true },
            },
          ],
        },
      ],
    });

    // Product Card tab
    tabs.push({
      id: 'productCard',
      label: 'Product Card',
      groups: [
        {
          id: 'card-elements',
          label: 'Card Elements',
          fields: [
            { key: 'showProductImage', label: 'Product Image', type: 'toggle', defaultValue: true },
            { key: 'showSecondaryImage', label: 'Secondary Image (Hover)', type: 'toggle', defaultValue: true },
            { key: 'showProductTitle', label: 'Product Title', type: 'toggle', defaultValue: true },
            { key: 'showProductPrice', label: 'Price', type: 'toggle', defaultValue: true },
            { key: 'showComparePrice', label: 'Compare-at Price', type: 'toggle', defaultValue: true },
            { key: 'showRating', label: 'Rating', type: 'toggle', defaultValue: false },
            { key: 'showBadge', label: 'Badge (Sale/New)', type: 'toggle', defaultValue: true },
            { key: 'showQuickAdd', label: 'Quick Add Button', type: 'toggle', defaultValue: true },
            { key: 'showWishlist', label: 'Wishlist Button', type: 'toggle', defaultValue: true },
          ],
        },
      ],
    });

    // Style tab
    tabs.push({
      id: 'style',
      label: 'Style',
      groups: [
        {
          id: 'page-style',
          label: 'Page Style',
          fields: [
            { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
            { key: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#0f172a' },
            { key: 'headingColor', label: 'Heading Color', type: 'color' },
          ],
        },
        {
          id: 'card-style',
          label: 'Product Card Style',
          fields: [
            {
              key: 'cardDesign',
              label: 'Card Design',
              type: 'select',
              options: [
                { label: 'Minimal', value: 'minimal' },
                { label: 'Bordered', value: 'bordered' },
                { label: 'Shadow', value: 'shadow' },
                { label: 'Elevated', value: 'elevated' },
              ],
              defaultValue: 'minimal',
            },
            {
              key: 'imageRadius',
              label: 'Image Radius',
              type: 'select',
              options: [
                { label: 'None', value: '0px' },
                { label: 'Small', value: '4px' },
                { label: 'Medium', value: '8px' },
                { label: 'Large', value: '16px' },
              ],
              defaultValue: '8px',
            },
            {
              key: 'hoverEffect',
              label: 'Hover Effect',
              type: 'select',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Lift', value: 'lift' },
                { label: 'Zoom Image', value: 'zoom' },
                { label: 'Border', value: 'border' },
              ],
              defaultValue: 'lift',
            },
          ],
        },
      ],
    });

    return tabs;
  },

  defaultProps: {
    selectedLayout: 'grid-sidebar',
    pageTitle: 'Shop All Products',
    pageDescription: 'Browse our complete collection of premium products.',
    productSource: 'all',
    productsPerPage: 12,
    gridColumns: 4,
    enableFilters: true,
    filterPosition: 'sidebar',
    filterPrice: true,
    filterCategory: true,
    filterAvailability: true,
    enableSorting: true,
    defaultSort: 'featured',
    enablePagination: true,
    paginationType: 'numbered',
    showProductImage: true,
    showSecondaryImage: true,
    showProductTitle: true,
    showProductPrice: true,
    showComparePrice: true,
    showBadge: true,
    showQuickAdd: true,
    showWishlist: true,
    cardDesign: 'minimal',
    imageRadius: '8px',
    hoverEffect: 'lift',
    pageWidth: 'standard',
    sectionGap: 32,
  },

  seoConfig: { dynamic: false },
};
