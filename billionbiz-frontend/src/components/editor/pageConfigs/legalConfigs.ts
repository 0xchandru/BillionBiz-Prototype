// ============================================================
// LEGAL PAGES CONFIG (shared for all legal pages)
// ============================================================
import { Shield, FileText, Truck, RefreshCw } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

const legalTabs = (): PageTabConfig[] => [
  { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Legal Content', fields: [
    { key: 'pageTitle', label: 'Page Title', type: 'text' },
    { key: 'lastUpdated', label: 'Last Updated Date', type: 'text' },
    { key: 'legalContent', label: 'Content', type: 'textarea', helpText: 'Rich text content for the legal page.' },
  ]}]},
  { id: 'typography', label: 'Typography', groups: [{ id: 'typography', label: 'Typography Settings', fields: [
    { key: 'bodySize', label: 'Body Size', type: 'select', options: [{ label: 'Small', value: '14px' }, { label: 'Medium', value: '16px' }, { label: 'Large', value: '18px' }], defaultValue: '16px' },
    { key: 'lineHeight', label: 'Line Height', type: 'select', options: [{ label: 'Tight', value: '1.4' }, { label: 'Normal', value: '1.6' }, { label: 'Relaxed', value: '1.8' }], defaultValue: '1.6' },
    { key: 'textAlignment', label: 'Text Alignment', type: 'segmented', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Justify', value: 'justify' }], defaultValue: 'left' },
  ]}]},
  { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
    { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
    { key: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#334155' },
    { key: 'linkColor', label: 'Link Color', type: 'color', defaultValue: '#198754' },
  ]}]},
];

const legalDefaults = {
  selectedLayout: 'narrow',
  bodySize: '16px', lineHeight: '1.6', textAlignment: 'left' as const,
  backgroundColor: '#ffffff', textColor: '#334155', linkColor: '#198754',
  pageWidth: 'narrow',
};

const legalLayouts = [
  { id: 'narrow', label: 'Narrow Content', description: 'Focused reading experience' },
  { id: 'standard', label: 'Standard Width' },
  { id: 'wide', label: 'Wide Content' },
];

const legalSections = [
  { type: 'Header', name: 'Header', group: 'header' as const },
  { type: 'PageHeader', name: 'Page Header', group: 'content' as const },
  { type: 'RichText', name: 'Legal Content', group: 'content' as const },
  { type: 'Footer', name: 'Footer', group: 'footer' as const },
];

export const privacyPolicyConfig: PageConfig = {
  type: 'privacy-policy',
  name: 'Privacy Policy',
  category: 'legal',
  icon: Shield,
  description: 'Your privacy policy.',
  path: '/policies/privacy',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: legalSections.map(s => ({
    ...s,
    defaultProps: s.type === 'PageHeader' ? { heading: 'Privacy Policy' } :
      s.type === 'RichText' ? { heading: '', body: 'This Privacy Policy describes how we collect, use, and protect your personal information when you visit our website or make a purchase.\n\n**Information We Collect**\nWe collect information you provide directly, such as your name, email address, shipping address, and payment information when you make a purchase.\n\n**How We Use Your Information**\nWe use your information to process orders, communicate with you, and improve our services.\n\n**Data Protection**\nWe implement appropriate security measures to protect your personal information.' } : undefined,
  })),
  layouts: legalLayouts,
  getTabs: legalTabs,
  defaultProps: { ...legalDefaults, pageTitle: 'Privacy Policy', legalContent: '' },
};

export const termsConditionsConfig: PageConfig = {
  type: 'terms-conditions',
  name: 'Terms & Conditions',
  category: 'legal',
  icon: FileText,
  description: 'Terms and conditions.',
  path: '/policies/terms',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: legalSections.map(s => ({
    ...s,
    defaultProps: s.type === 'PageHeader' ? { heading: 'Terms & Conditions' } :
      s.type === 'RichText' ? { heading: '', body: 'Please read these Terms and Conditions carefully before using our website.\n\n**Acceptance of Terms**\nBy accessing or using our website, you agree to be bound by these Terms.\n\n**Use of Website**\nYou may use our website for lawful purposes only.\n\n**Intellectual Property**\nAll content on this website is owned by us and protected by intellectual property laws.' } : undefined,
  })),
  layouts: legalLayouts,
  getTabs: legalTabs,
  defaultProps: { ...legalDefaults, pageTitle: 'Terms & Conditions', legalContent: '' },
};

export const shippingPolicyConfig: PageConfig = {
  type: 'shipping-policy',
  name: 'Shipping Policy',
  category: 'legal',
  icon: Truck,
  description: 'Shipping information and policies.',
  path: '/policies/shipping',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: legalSections.map(s => ({
    ...s,
    defaultProps: s.type === 'PageHeader' ? { heading: 'Shipping Policy' } :
      s.type === 'RichText' ? { heading: '', body: 'We offer reliable shipping options to ensure your orders arrive safely and on time.\n\n**Shipping Methods**\n• Standard Shipping: 5-7 business days\n• Express Shipping: 2-3 business days\n• Overnight Shipping: Next business day\n\n**Free Shipping**\nFree standard shipping on all orders over $99.\n\n**International Shipping**\nWe ship to over 50 countries. International shipping typically takes 7-14 business days.' } : undefined,
  })),
  layouts: legalLayouts,
  getTabs: legalTabs,
  defaultProps: { ...legalDefaults, pageTitle: 'Shipping Policy', legalContent: '' },
};

export const returnPolicyConfig: PageConfig = {
  type: 'return-policy',
  name: 'Refund Policy',
  category: 'legal',
  icon: RefreshCw,
  description: 'Return and refund policies.',
  path: '/policies/returns',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: legalSections.map(s => ({
    ...s,
    defaultProps: s.type === 'PageHeader' ? { heading: 'Refund Policy' } :
      s.type === 'RichText' ? { heading: '', body: 'We want you to be completely satisfied with your purchase.\n\n**Return Window**\nYou have 30 days from the date of delivery to return any unused item.\n\n**Return Conditions**\nItems must be in their original packaging and unused condition.\n\n**Refund Process**\nRefunds are processed within 5-7 business days after we receive your return.\n\n**Exchanges**\nWe offer free exchanges for any item within the return window.' } : undefined,
  })),
  layouts: legalLayouts,
  getTabs: legalTabs,
  defaultProps: { ...legalDefaults, pageTitle: 'Refund Policy', legalContent: '' },
};
