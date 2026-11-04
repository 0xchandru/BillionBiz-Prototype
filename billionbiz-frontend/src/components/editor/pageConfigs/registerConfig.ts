// ============================================================
// REGISTER PAGE CONFIG
// ============================================================
import { UserPlus } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const registerConfig: PageConfig = {
  type: 'register',
  name: 'Sign Up',
  category: 'customer',
  icon: UserPlus,
  description: 'Customer registration page.',
  path: '/account/register',
  headerVariant: 'minimal',
  footerVariant: 'minimal',
  defaultSections: [
    { type: 'Header', name: 'Minimal Header', group: 'header', defaultProps: { variant: 'minimal' } },
    { type: 'RegisterForm', name: 'Registration Form', group: 'content' },
    { type: 'RichText', name: 'Login CTA', group: 'content', defaultProps: { heading: '', body: 'Already have an account? Sign in.', alignment: 'center' } },
    { type: 'Footer', name: 'Minimal Footer', group: 'footer', defaultProps: { variant: 'minimal' } },
  ],
  layouts: [
    { id: 'centered', label: 'Centered Form' },
    { id: 'split-screen', label: 'Split Screen' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'heading', label: 'Heading', type: 'text', defaultValue: 'Create an Account' },
      { key: 'description', label: 'Description', type: 'textarea', defaultValue: 'Join us and start shopping.' },
      { key: 'loginCta', label: 'Login CTA Text', type: 'text', defaultValue: 'Already have an account? Sign in' },
    ]}]},
    { id: 'form', label: 'Form', groups: [{ id: 'form', label: 'Form Fields', fields: [
      { key: 'showFirstName', label: 'First Name', type: 'toggle', defaultValue: true },
      { key: 'showLastName', label: 'Last Name', type: 'toggle', defaultValue: true },
      { key: 'showEmail', label: 'Email', type: 'toggle', defaultValue: true },
      { key: 'showPassword', label: 'Password', type: 'toggle', defaultValue: true },
      { key: 'showConfirmPassword', label: 'Confirm Password', type: 'toggle', defaultValue: true },
      { key: 'submitText', label: 'Submit Button Text', type: 'text', defaultValue: 'Create Account' },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#f8fafc' },
      { key: 'formBackground', label: 'Form Background', type: 'color', defaultValue: '#ffffff' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'centered', heading: 'Create an Account', description: 'Join us and start shopping.',
    showFirstName: true, showLastName: true, showEmail: true, showPassword: true, showConfirmPassword: true,
    submitText: 'Create Account', pageWidth: 'narrow',
  },
};
