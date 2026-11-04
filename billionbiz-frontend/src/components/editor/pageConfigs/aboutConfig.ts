// ============================================================
// ABOUT US PAGE CONFIG
// ============================================================
import { Users } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const aboutConfig: PageConfig = {
  type: 'about',
  name: 'About Us',
  category: 'storefront',
  icon: Users,
  description: 'Tell your brand story and build trust.',
  path: '/about',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'HeroBanner', name: 'Hero', group: 'content', defaultProps: { heading: 'About Us', description: 'Our story, mission, and the people behind the brand.', layout: 'center' } },
    { type: 'RichText', name: 'Brand Story', group: 'content', defaultProps: { heading: 'Our Story', body: 'Founded with a passion for quality and innovation, we set out to create products that make a difference in people\'s lives. From humble beginnings to a growing brand, our journey has been driven by our commitment to excellence.' } },
    { type: 'ImageWithText', name: 'Image + Text', group: 'content', defaultProps: { heading: 'Our Mission', body: 'We believe in creating products that combine quality, sustainability, and accessibility. Every product is designed with our customers in mind.', imagePosition: 'left' } },
    { type: 'ImageWithText', name: 'Why Choose Us', group: 'content', defaultProps: { heading: 'Why Choose Us', body: 'Premium quality materials, sustainable practices, exceptional customer service, and a commitment to innovation.', imagePosition: 'right' } },
    { type: 'RichText', name: 'Statistics', group: 'content', defaultProps: { heading: 'By the Numbers', body: '10,000+ happy customers | 500+ products | 50+ countries | 4.9★ average rating' } },
    { type: 'Testimonials', name: 'Reviews', group: 'content' },
    { type: 'Newsletter', name: 'CTA', group: 'content', defaultProps: { heading: 'Join Our Community', description: 'Stay connected and be the first to know about new products and exclusive offers.' } },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'standard', label: 'Standard Layout' },
    { id: 'hero-focused', label: 'Hero Focused' },
    { id: 'story-driven', label: 'Story Driven' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [
      { id: 'main', label: 'Page Content', fields: [
        { key: 'pageTitle', label: 'Page Title', type: 'text', defaultValue: 'About Us' },
        { key: 'introduction', label: 'Introduction', type: 'textarea', defaultValue: 'Our story, mission, and the people behind the brand.' },
        { key: 'brandStory', label: 'Brand Story', type: 'textarea' },
        { key: 'mission', label: 'Mission Statement', type: 'textarea' },
        { key: 'vision', label: 'Vision Statement', type: 'textarea' },
      ]},
    ]},
    { id: 'sections', label: 'Sections', groups: [{ id: 'sections', label: 'Section Configuration', fields: [
      { key: 'showHero', label: 'Show Hero', type: 'toggle', defaultValue: true },
      { key: 'showBrandStory', label: 'Show Brand Story', type: 'toggle', defaultValue: true },
      { key: 'showMission', label: 'Show Mission', type: 'toggle', defaultValue: true },
      { key: 'showStatistics', label: 'Show Statistics', type: 'toggle', defaultValue: true },
      { key: 'showReviews', label: 'Show Reviews', type: 'toggle', defaultValue: true },
      { key: 'showCTA', label: 'Show CTA', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'headingColor', label: 'Heading Color', type: 'color' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'standard', pageTitle: 'About Us',
    introduction: 'Our story, mission, and the people behind the brand.',
    showHero: true, showBrandStory: true, showMission: true, showStatistics: true, showReviews: true, showCTA: true,
    pageWidth: 'standard',
  },
};
