// ============================================================
// PRODUCT DETAILS PAGE CONFIG
// ============================================================

import { Package } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const productDetailsConfig: PageConfig = {
  type: 'product-details',
  name: 'Product Detail',
  category: 'commerce',
  icon: Package,
  description: 'Dynamic product page with gallery, details, and purchase options.',
  path: '/products/:slug',
  headerVariant: 'default',
  footerVariant: 'default',

  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'Breadcrumbs', name: 'Breadcrumbs', group: 'content' },
    { type: 'ProductDetails', name: 'Product Details', group: 'content' },
    { type: 'ProductRecommendations', name: 'Recommendations', group: 'content' },
    { type: 'Testimonials', name: 'Reviews', group: 'content' },
    { type: 'FAQ', name: 'FAQ', group: 'content' },
    { type: 'ImageWithText', name: 'Why Choose Us', group: 'content', defaultProps: { heading: 'Why Choose Us', body: 'Quality products, fast shipping, and exceptional customer service.' } },
    { type: 'Newsletter', name: 'Newsletter', group: 'content' },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],

  layouts: [
    { id: 'gallery-left', label: 'Gallery Left + Info Right', description: 'Traditional product layout' },
    { id: 'gallery-right', label: 'Info Left + Gallery Right' },
    { id: 'gallery-large', label: 'Large Gallery + Info Below' },
    { id: 'full-width', label: 'Full-width Product Layout' },
    { id: 'split', label: 'Split Layout' },
  ],

  getTabs: (_selectedLayout?: string, _props?: Record<string, any>): PageTabConfig[] => {
    const tabs: PageTabConfig[] = [];

    // Content
    tabs.push({
      id: 'content',
      label: 'Content',
      groups: [{
        id: 'product-content',
        label: 'Product Information Display',
        fields: [
          { key: 'showTitle', label: 'Show Title', type: 'toggle', defaultValue: true },
          { key: 'showDescription', label: 'Show Description', type: 'toggle', defaultValue: true },
          { key: 'showPrice', label: 'Show Price', type: 'toggle', defaultValue: true },
          { key: 'showComparePrice', label: 'Show Compare-at Price', type: 'toggle', defaultValue: true },
          { key: 'showRating', label: 'Show Rating', type: 'toggle', defaultValue: true },
          { key: 'showSKU', label: 'Show SKU', type: 'toggle', defaultValue: false },
          { key: 'showVendor', label: 'Show Vendor', type: 'toggle', defaultValue: true },
          { key: 'showAvailability', label: 'Show Availability', type: 'toggle', defaultValue: true },
          { key: 'showBadges', label: 'Show Badges', type: 'toggle', defaultValue: true },
        ],
      }],
    });

    // Gallery
    tabs.push({
      id: 'gallery',
      label: 'Gallery',
      groups: [{
        id: 'gallery-settings',
        label: 'Gallery Settings',
        fields: [
          {
            key: 'thumbnailPosition',
            label: 'Thumbnail Position',
            type: 'segmented',
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Bottom', value: 'bottom' },
              { label: 'Right', value: 'right' },
            ],
            defaultValue: 'left',
          },
          {
            key: 'thumbnailSize',
            label: 'Thumbnail Size',
            type: 'select',
            options: [
              { label: 'Small', value: 'small' },
              { label: 'Medium', value: 'medium' },
              { label: 'Large', value: 'large' },
            ],
            defaultValue: 'medium',
          },
          {
            key: 'imageRatio',
            label: 'Image Ratio',
            type: 'select',
            options: [
              { label: 'Square (1:1)', value: '1:1' },
              { label: 'Portrait (3:4)', value: '3:4' },
              { label: 'Landscape (4:3)', value: '4:3' },
              { label: 'Auto', value: 'auto' },
            ],
            defaultValue: '1:1',
          },
          { key: 'enableZoom', label: 'Enable Zoom', type: 'toggle', defaultValue: true },
          { key: 'enableLightbox', label: 'Enable Lightbox', type: 'toggle', defaultValue: true },
          { key: 'enableVideo', label: 'Enable Video', type: 'toggle', defaultValue: true },
          { key: 'enableMobileSwipe', label: 'Mobile Swipe', type: 'toggle', defaultValue: true },
        ],
      }],
    });

    // Purchase
    tabs.push({
      id: 'purchase',
      label: 'Purchase',
      groups: [{
        id: 'purchase-options',
        label: 'Purchase Options',
        fields: [
          { key: 'showQuantity', label: 'Show Quantity Selector', type: 'toggle', defaultValue: true },
          { key: 'showVariants', label: 'Show Variants', type: 'toggle', defaultValue: true },
          { key: 'showAddToCart', label: 'Show Add to Cart', type: 'toggle', defaultValue: true },
          { key: 'showBuyNow', label: 'Show Buy Now', type: 'toggle', defaultValue: true },
          { key: 'showWishlistBtn', label: 'Show Wishlist Button', type: 'toggle', defaultValue: true },
          {
            key: 'buttonPlacement',
            label: 'Button Placement',
            type: 'segmented',
            options: [
              { label: 'Stacked', value: 'stacked' },
              { label: 'Side by Side', value: 'side-by-side' },
            ],
            defaultValue: 'stacked',
          },
        ],
      }],
    });

    // Recommendations
    tabs.push({
      id: 'recommendations',
      label: 'Recommendations',
      groups: [{
        id: 'rec-settings',
        label: 'Recommendation Settings',
        fields: [
          { key: 'enableRecommendations', label: 'Enable Recommendations', type: 'toggle', defaultValue: true },
          {
            key: 'recSource',
            label: 'Source',
            type: 'select',
            options: [
              { label: 'Related Products', value: 'related' },
              { label: 'Recently Viewed', value: 'recent' },
              { label: 'Best Sellers', value: 'best-sellers' },
            ],
            defaultValue: 'related',
            showWhen: { field: 'enableRecommendations', value: true },
          },
          { key: 'recCount', label: 'Product Count', type: 'number', min: 2, max: 12, defaultValue: 4, showWhen: { field: 'enableRecommendations', value: true } },
          {
            key: 'recLayout',
            label: 'Layout',
            type: 'segmented',
            options: [
              { label: 'Grid', value: 'grid' },
              { label: 'Carousel', value: 'carousel' },
            ],
            defaultValue: 'carousel',
            showWhen: { field: 'enableRecommendations', value: true },
          },
        ],
      }],
    });

    // Style
    tabs.push({
      id: 'style',
      label: 'Style',
      groups: [{
        id: 'product-style',
        label: 'Product Page Style',
        fields: [
          { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
          { key: 'galleryRadius', label: 'Gallery Image Radius', type: 'select', options: [
            { label: 'None', value: '0' }, { label: 'Small', value: '4px' }, { label: 'Medium', value: '8px' }, { label: 'Large', value: '16px' },
          ], defaultValue: '8px' },
        ],
      }],
    });

    return tabs;
  },

  defaultProps: {
    selectedLayout: 'gallery-left',
    showTitle: true, showDescription: true, showPrice: true, showComparePrice: true,
    showRating: true, showSKU: false, showVendor: true, showAvailability: true, showBadges: true,
    thumbnailPosition: 'left', thumbnailSize: 'medium', imageRatio: '1:1',
    enableZoom: true, enableLightbox: true, enableVideo: true, enableMobileSwipe: true,
    showQuantity: true, showVariants: true, showAddToCart: true, showBuyNow: true, showWishlistBtn: true,
    buttonPlacement: 'stacked',
    enableRecommendations: true, recSource: 'related', recCount: 4, recLayout: 'carousel',
    pageWidth: 'standard', sectionGap: 40,
  },

  seoConfig: { dynamic: true, template: '{product.name} - BillionBiz' },
};
