// ============================================================
// LOGIN PAGE CONFIG
// ============================================================
import { LogIn } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const loginConfig: PageConfig = {
  type: 'login',
  name: 'Login',
  category: 'customer',
  icon: LogIn,
  description: 'Customer login page.',
  path: '/account/login',
  headerVariant: 'minimal',
  footerVariant: 'minimal',
  defaultSections: [
    { type: 'Header', name: 'Minimal Header', group: 'header', defaultProps: { variant: 'minimal' } },
    { type: 'LoginForm', name: 'Login Form', group: 'content' },
    { type: 'RichText', name: 'Register CTA', group: 'content', defaultProps: { heading: '', body: 'Don\'t have an account? Create one now.', alignment: 'center' } },
    { type: 'Footer', name: 'Minimal Footer', group: 'footer', defaultProps: { variant: 'minimal' } },
  ],
  layouts: [
    { id: 'centered', label: 'Centered Form' },
    { id: 'split-screen', label: 'Split Screen (Image + Form)' },
    { id: 'form-left', label: 'Form Left + Image Right' },
    { id: 'form-right', label: 'Image Left + Form Right' },
  ],
  getTabs: (selectedLayout?: string): PageTabConfig[] => {
    const tabs: PageTabConfig[] = [];
    tabs.push({ id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'heading', label: 'Heading', type: 'text', defaultValue: 'Welcome Back' },
      { key: 'description', label: 'Description', type: 'textarea', defaultValue: 'Sign in to your account to continue.' },
      { key: 'forgotPasswordText', label: 'Forgot Password Text', type: 'text', defaultValue: 'Forgot your password?' },
      { key: 'registerText', label: 'Register Text', type: 'text', defaultValue: 'Don\'t have an account? Sign up' },
      { key: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Sign In' },
    ]}]});
    tabs.push({ id: 'form', label: 'Form', groups: [{ id: 'form', label: 'Form Settings', fields: [
      { key: 'showEmail', label: 'Email Field', type: 'toggle', defaultValue: true },
      { key: 'showPassword', label: 'Password Field', type: 'toggle', defaultValue: true },
      { key: 'showRememberMe', label: 'Remember Me', type: 'toggle', defaultValue: true },
      { key: 'showForgotPassword', label: 'Forgot Password Link', type: 'toggle', defaultValue: true },
      { key: 'showPasswordToggle', label: 'Show/Hide Password', type: 'toggle', defaultValue: true },
    ]}]});
    // Show image controls only for split layouts
    if (selectedLayout === 'split-screen' || selectedLayout === 'form-left' || selectedLayout === 'form-right') {
      tabs.push({ id: 'image', label: 'Image', groups: [{ id: 'image', label: 'Side Image', fields: [
        { key: 'sideImage', label: 'Image', type: 'image' },
        { key: 'sideImageOverlay', label: 'Image Overlay', type: 'toggle', defaultValue: true },
        { key: 'sideImageText', label: 'Image Text', type: 'text' },
      ]}]});
    }
    tabs.push({ id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#f8fafc' },
      { key: 'formBackground', label: 'Form Background', type: 'color', defaultValue: '#ffffff' },
      { key: 'inputStyle', label: 'Input Style', type: 'select', options: [{ label: 'Outlined', value: 'outlined' }, { label: 'Filled', value: 'filled' }, { label: 'Underline', value: 'underline' }], defaultValue: 'outlined' },
      { key: 'buttonStyle', label: 'Button Style', type: 'select', options: [{ label: 'Filled', value: 'filled' }, { label: 'Outlined', value: 'outlined' }, { label: 'Gradient', value: 'gradient' }], defaultValue: 'filled' },
      { key: 'borderRadius', label: 'Border Radius', type: 'select', options: [{ label: 'None', value: '0' }, { label: 'Small', value: '4px' }, { label: 'Medium', value: '8px' }, { label: 'Large', value: '16px' }], defaultValue: '8px' },
    ]}]});
    return tabs;
  },
  defaultProps: {
    selectedLayout: 'centered', heading: 'Welcome Back', description: 'Sign in to your account to continue.',
    forgotPasswordText: 'Forgot your password?', registerText: 'Don\'t have an account? Sign up', buttonText: 'Sign In',
    showEmail: true, showPassword: true, showRememberMe: true, showForgotPassword: true, showPasswordToggle: true,
    backgroundColor: '#f8fafc', formBackground: '#ffffff', inputStyle: 'outlined', buttonStyle: 'filled', borderRadius: '8px',
    formWidth: 'standard', pageWidth: 'narrow',
  },
};
