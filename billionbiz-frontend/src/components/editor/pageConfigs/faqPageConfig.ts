// ============================================================
// FAQ PAGE CONFIG
// ============================================================
import { HelpCircle } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const faqPageConfig: PageConfig = {
  type: 'faq',
  name: 'FAQ',
  category: 'storefront',
  icon: HelpCircle,
  description: 'Answer common questions.',
  path: '/faq',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'HeroBanner', name: 'FAQ Hero', group: 'content', defaultProps: { heading: 'Frequently Asked Questions', description: 'Find answers to the most common questions about our products and services.', layout: 'center' } },
    { type: 'RichText', name: 'FAQ Categories', group: 'content', defaultProps: { heading: '', body: '' } },
    { type: 'FAQ', name: 'FAQ', group: 'content', defaultProps: { heading: 'General Questions', items: [
      { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and Apple Pay.' },
      { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days.' },
      { question: 'What is your return policy?', answer: 'We offer a 30-day return policy for all unused items in their original packaging.' },
      { question: 'Do you ship internationally?', answer: 'Yes, we ship to over 50 countries worldwide. International shipping typically takes 7-14 business days.' },
      { question: 'How can I track my order?', answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order in your account dashboard.' },
    ] } },
    { type: 'Newsletter', name: 'Contact CTA', group: 'content', defaultProps: { heading: 'Still have questions?', description: 'Contact our support team and we\'ll get back to you within 24 hours.', buttonText: 'Contact Us' } },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'single-column', label: 'Single Column' },
    { id: 'two-column', label: 'Two Column' },
    { id: 'sidebar-categories', label: 'Sidebar Categories' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'heading', label: 'Heading', type: 'text', defaultValue: 'Frequently Asked Questions' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ]}]},
    { id: 'faq', label: 'FAQ', groups: [{ id: 'faq-items', label: 'FAQ Items', fields: [
      { key: 'faqItems', label: 'Questions & Answers', type: 'list', listFields: [
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer', label: 'Answer', type: 'textarea' },
        { key: 'category', label: 'Category', type: 'text' },
      ], addLabel: 'Add Question' },
    ]}]},
    { id: 'accordion', label: 'Accordion', groups: [{ id: 'accordion', label: 'Accordion Settings', fields: [
      { key: 'openFirst', label: 'Open First Item', type: 'toggle', defaultValue: true },
      { key: 'allowMultiple', label: 'Allow Multiple Open', type: 'toggle', defaultValue: false },
      { key: 'iconPosition', label: 'Icon Position', type: 'segmented', options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }], defaultValue: 'right' },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'single-column', heading: 'Frequently Asked Questions',
    openFirst: true, allowMultiple: false, iconPosition: 'right', pageWidth: 'narrow',
  },
};
