// ============================================================
// REVIEWS / TESTIMONIALS PAGE CONFIG
// ============================================================
import { Star } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const reviewsConfig: PageConfig = {
  type: 'reviews',
  name: 'Reviews / Testimonials',
  category: 'storefront',
  icon: Star,
  description: 'Showcase customer reviews and testimonials.',
  path: '/reviews',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'HeroBanner', name: 'Reviews Hero', group: 'content', defaultProps: { heading: 'Customer Reviews', description: 'See what our customers are saying about us.', layout: 'center' } },
    { type: 'RichText', name: 'Rating Summary', group: 'content', defaultProps: { heading: 'Overall Rating', body: '4.8 out of 5 stars — Based on 2,500+ reviews' } },
    { type: 'Testimonials', name: 'Reviews', group: 'content' },
    { type: 'Testimonials', name: 'Featured Reviews', group: 'content' },
    { type: 'Newsletter', name: 'CTA', group: 'content', defaultProps: { heading: 'Share Your Experience', description: 'We\'d love to hear about your experience with our products.', buttonText: 'Write a Review' } },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'grid', label: 'Grid Layout' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'masonry', label: 'Masonry' },
    { id: 'two-column', label: 'Two Column' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'heading', label: 'Heading', type: 'text', defaultValue: 'Customer Reviews' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ]}]},
    { id: 'ratingSummary', label: 'Rating Summary', groups: [{ id: 'summary', label: 'Rating Summary', fields: [
      { key: 'showRatingSummary', label: 'Show Rating Summary', type: 'toggle', defaultValue: true },
      { key: 'averageRating', label: 'Average Rating', type: 'number', min: 0, max: 5, step: 0.1, defaultValue: 4.8 },
      { key: 'totalReviews', label: 'Total Reviews', type: 'number', defaultValue: 2500 },
      { key: 'showBreakdown', label: 'Show Rating Breakdown', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'carousel', label: 'Carousel', groups: [{ id: 'carousel', label: 'Carousel Settings', fields: [
      { key: 'autoplay', label: 'Autoplay', type: 'toggle', defaultValue: true },
      { key: 'autoplaySpeed', label: 'Speed (seconds)', type: 'number', min: 2, max: 10, defaultValue: 5 },
      { key: 'showArrows', label: 'Show Arrows', type: 'toggle', defaultValue: true },
      { key: 'showDots', label: 'Show Dots', type: 'toggle', defaultValue: true },
    ]}], showWhen: { field: 'selectedLayout', value: 'carousel' } },
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'grid', heading: 'Customer Reviews', showRatingSummary: true,
    averageRating: 4.8, totalReviews: 2500, showBreakdown: true,
    autoplay: true, autoplaySpeed: 5, showArrows: true, showDots: true, pageWidth: 'standard',
  },
};
