// ============================================================
// CONTACT US PAGE CONFIG
// ============================================================
import { Mail } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const contactConfig: PageConfig = {
  type: 'contact',
  name: 'Contact Us',
  category: 'storefront',
  icon: Mail,
  description: 'Help customers get in touch.',
  path: '/contact',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'HeroBanner', name: 'Contact Hero', group: 'content', defaultProps: { heading: 'Get in Touch', description: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.', layout: 'center' } },
    { type: 'RichText', name: 'Contact Information', group: 'content', defaultProps: { heading: 'Contact Information', body: 'Email: hello@billionbiz.com\nPhone: +1 (555) 123-4567\nAddress: 123 Business St, Suite 100, New York, NY 10001\nHours: Mon-Fri 9am-6pm EST' } },
    { type: 'ContactForm', name: 'Contact Form', group: 'content' },
    { type: 'Map', name: 'Map', group: 'content' },
    { type: 'FAQ', name: 'FAQ', group: 'content', defaultProps: { heading: 'Frequently Asked Questions', items: [{ question: 'What are your business hours?', answer: 'We are available Monday through Friday, 9am to 6pm EST.' }, { question: 'How quickly do you respond?', answer: 'We typically respond to all inquiries within 24 hours.' }] } },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'form-right', label: 'Info Left + Form Right' },
    { id: 'form-left', label: 'Form Left + Info Right' },
    { id: 'stacked', label: 'Stacked (Full Width)' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'heading', label: 'Heading', type: 'text', defaultValue: 'Get in Touch' },
      { key: 'description', label: 'Description', type: 'textarea', defaultValue: 'We\'d love to hear from you.' },
    ]}]},
    { id: 'contactInfo', label: 'Contact Info', groups: [{ id: 'info', label: 'Contact Information', fields: [
      { key: 'email', label: 'Email', type: 'text', defaultValue: 'hello@billionbiz.com' },
      { key: 'phone', label: 'Phone', type: 'text', defaultValue: '+1 (555) 123-4567' },
      { key: 'address', label: 'Address', type: 'textarea', defaultValue: '123 Business St, Suite 100, New York, NY 10001' },
      { key: 'businessHours', label: 'Business Hours', type: 'text', defaultValue: 'Mon-Fri 9am-6pm EST' },
    ]}]},
    { id: 'form', label: 'Form', groups: [{ id: 'form', label: 'Form Settings', fields: [
      { key: 'showName', label: 'Name Field', type: 'toggle', defaultValue: true },
      { key: 'showEmail', label: 'Email Field', type: 'toggle', defaultValue: true },
      { key: 'showPhone', label: 'Phone Field', type: 'toggle', defaultValue: false },
      { key: 'showSubject', label: 'Subject Field', type: 'toggle', defaultValue: true },
      { key: 'showMessage', label: 'Message Field', type: 'toggle', defaultValue: true },
      { key: 'submitText', label: 'Submit Button Text', type: 'text', defaultValue: 'Send Message' },
      { key: 'successMessage', label: 'Success Message', type: 'text', defaultValue: 'Thank you! We\'ll get back to you soon.' },
    ]}]},
    { id: 'map', label: 'Map', groups: [{ id: 'map', label: 'Map Settings', fields: [
      { key: 'showMap', label: 'Show Map', type: 'toggle', defaultValue: true },
      { key: 'mapHeight', label: 'Map Height', type: 'number', min: 200, max: 600, defaultValue: 400, unit: 'px', showWhen: { field: 'showMap', value: true } },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'form-right', heading: 'Get in Touch', description: 'We\'d love to hear from you.',
    email: 'hello@billionbiz.com', phone: '+1 (555) 123-4567', showMap: true, mapHeight: 400,
    showName: true, showEmail: true, showSubject: true, showMessage: true, submitText: 'Send Message',
    pageWidth: 'standard',
  },
};
