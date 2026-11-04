// ============================================================
// 404 / NOT FOUND PAGE CONFIG
// ============================================================
import { AlertTriangle } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const notFoundConfig: PageConfig = {
  type: 'not-found',
  name: '404 / Not Found',
  category: 'system',
  icon: AlertTriangle,
  description: 'Page shown when a URL is not found.',
  path: '/404',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'RichText', name: '404 Message', group: 'content', defaultProps: { heading: 'Page Not Found', body: 'Sorry, the page you\'re looking for doesn\'t exist or has been moved.', alignment: 'center' } },
    { type: 'RichText', name: 'Search', group: 'content', defaultProps: { heading: '', body: 'Try searching for what you\'re looking for.', alignment: 'center' } },
    { type: 'Newsletter', name: 'CTA', group: 'content', defaultProps: { heading: '', description: '', buttonText: 'Continue Shopping' } },
    { type: 'FeaturedCollection', name: 'Recommended Products', group: 'content', defaultProps: { heading: 'Popular Products' } },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'centered', label: 'Centered Content' },
    { id: 'split', label: 'Image + Content' },
    { id: 'full-screen', label: 'Full Screen' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: '404 Content', fields: [
      { key: 'heading', label: 'Heading', type: 'text', defaultValue: 'Page Not Found' },
      { key: 'description', label: 'Description', type: 'textarea', defaultValue: 'Sorry, the page you\'re looking for doesn\'t exist or has been moved.' },
      { key: 'searchPlaceholder', label: 'Search Placeholder', type: 'text', defaultValue: 'Search our store...' },
      { key: 'ctaText', label: 'CTA Button Text', type: 'text', defaultValue: 'Continue Shopping' },
      { key: 'ctaUrl', label: 'CTA Button URL', type: 'url', defaultValue: '/collections/all' },
    ]}]},
    { id: 'search', label: 'Search', groups: [{ id: 'search', label: 'Search Settings', fields: [
      { key: 'showSearch', label: 'Show Search', type: 'toggle', defaultValue: true },
      { key: 'searchPlaceholder2', label: 'Input Placeholder', type: 'text', defaultValue: 'Search...', showWhen: { field: 'showSearch', value: true } },
    ]}]},
    { id: 'recommendations', label: 'Recommendations', groups: [{ id: 'rec', label: 'Product Recommendations', fields: [
      { key: 'enableRecommendations', label: 'Enable Recommendations', type: 'toggle', defaultValue: true },
      { key: 'recCount', label: 'Product Count', type: 'number', min: 2, max: 8, defaultValue: 4, showWhen: { field: 'enableRecommendations', value: true } },
      { key: 'recLayout', label: 'Layout', type: 'segmented', options: [{ label: 'Grid', value: 'grid' }, { label: 'Carousel', value: 'carousel' }], defaultValue: 'grid', showWhen: { field: 'enableRecommendations', value: true } },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'centered', heading: 'Page Not Found',
    description: 'Sorry, the page you\'re looking for doesn\'t exist or has been moved.',
    searchPlaceholder: 'Search our store...', ctaText: 'Continue Shopping', ctaUrl: '/collections/all',
    showSearch: true, enableRecommendations: true, recCount: 4, recLayout: 'grid',
    pageWidth: 'standard',
  },
};
