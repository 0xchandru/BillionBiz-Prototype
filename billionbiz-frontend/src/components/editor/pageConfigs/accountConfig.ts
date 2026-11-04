// ============================================================
// ACCOUNT PAGE CONFIG
// ============================================================
import { User } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const accountConfig: PageConfig = {
  type: 'account',
  name: 'Profile',
  category: 'customer',
  icon: User,
  description: 'Customer account dashboard.',
  path: '/account',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'RichText', name: 'Account Header', group: 'content', defaultProps: { heading: 'My Account', body: '' } },
    { type: 'RichText', name: 'Account Navigation', group: 'content', defaultProps: { heading: '', body: 'Profile | Orders | Addresses | Wishlist | Settings' } },
    { type: 'RichText', name: 'Account Overview', group: 'content', defaultProps: { heading: 'Account Overview', body: 'Welcome back! Here\'s a summary of your account.' } },
    { type: 'RichText', name: 'Recent Orders', group: 'content', defaultProps: { heading: 'Recent Orders', body: 'Your most recent orders will appear here.' } },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'sidebar-nav', label: 'Sidebar Navigation' },
    { id: 'top-nav', label: 'Top Navigation' },
    { id: 'single-column', label: 'Single Column' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'heading', label: 'Heading', type: 'text', defaultValue: 'My Account' },
      { key: 'welcomeText', label: 'Welcome Text', type: 'text', defaultValue: 'Welcome back!' },
    ]}]},
    { id: 'account', label: 'Account', groups: [{ id: 'account', label: 'Account Sections', fields: [
      { key: 'showProfile', label: 'Profile Information', type: 'toggle', defaultValue: true },
      { key: 'showRecentOrders', label: 'Recent Orders', type: 'toggle', defaultValue: true },
      { key: 'showAddresses', label: 'Addresses', type: 'toggle', defaultValue: true },
      { key: 'showWishlist', label: 'Wishlist Link', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#f8fafc' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'sidebar-nav', heading: 'My Account', welcomeText: 'Welcome back!',
    showProfile: true, showRecentOrders: true, showAddresses: true, showWishlist: true, pageWidth: 'standard',
  },
};
