// ============================================================
// ORDER HISTORY PAGE CONFIG
// ============================================================
import { ClipboardList } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const orderHistoryConfig: PageConfig = {
  type: 'order-history',
  name: 'Order Listing',
  category: 'customer',
  icon: ClipboardList,
  description: 'View past orders.',
  path: '/account/orders',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'RichText', name: 'Account Navigation', group: 'content', defaultProps: { heading: '', body: 'Profile | Orders | Addresses | Settings' } },
    { type: 'OrderList', name: 'Orders', group: 'content' },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'table', label: 'Table Layout' },
    { id: 'cards', label: 'Card Layout' },
    { id: 'list', label: 'List Layout' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'heading', label: 'Heading', type: 'text', defaultValue: 'Order History' },
      { key: 'emptyMessage', label: 'Empty State Message', type: 'text', defaultValue: 'You haven\'t placed any orders yet.' },
      { key: 'emptyCtaText', label: 'Empty State CTA', type: 'text', defaultValue: 'Start Shopping' },
    ]}]},
    { id: 'orders', label: 'Orders', groups: [{ id: 'orders', label: 'Order Display', fields: [
      { key: 'showOrderNumber', label: 'Order Number', type: 'toggle', defaultValue: true },
      { key: 'showDate', label: 'Date', type: 'toggle', defaultValue: true },
      { key: 'showStatus', label: 'Status', type: 'toggle', defaultValue: true },
      { key: 'showTotal', label: 'Total', type: 'toggle', defaultValue: true },
      { key: 'showViewButton', label: 'View Order Button', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#f8fafc' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'table', heading: 'Order History',
    emptyMessage: 'You haven\'t placed any orders yet.', emptyCtaText: 'Start Shopping',
    showOrderNumber: true, showDate: true, showStatus: true, showTotal: true, showViewButton: true,
    pageWidth: 'standard',
  },
};

// ============================================================
// ORDER DETAILS PAGE CONFIG
// ============================================================
import { FileText } from 'lucide-react';

export const orderDetailsConfig: PageConfig = {
  type: 'order-details',
  name: 'Order Detail',
  category: 'customer',
  icon: FileText,
  description: 'View order details and tracking.',
  path: '/account/orders/:id',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Header', group: 'header' },
    { type: 'RichText', name: 'Order Header', group: 'content', defaultProps: { heading: 'Order Details', body: '' } },
    { type: 'OrderInfo', name: 'Order Information', group: 'content' },
    { type: 'OrderItems', name: 'Order Items', group: 'content' },
    { type: 'RichText', name: 'Shipping', group: 'content', defaultProps: { heading: 'Shipping Information', body: '' } },
    { type: 'RichText', name: 'Billing', group: 'content', defaultProps: { heading: 'Billing Information', body: '' } },
    { type: 'RichText', name: 'Payment', group: 'content', defaultProps: { heading: 'Payment Information', body: '' } },
    { type: 'RichText', name: 'Status', group: 'content', defaultProps: { heading: 'Order Status', body: '' } },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'single-column', label: 'Single Column' },
    { id: 'two-column', label: 'Two Column' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Page Content', fields: [
      { key: 'heading', label: 'Page Heading', type: 'text', defaultValue: 'Order Details' },
    ]}]},
    { id: 'order', label: 'Order', groups: [{ id: 'order', label: 'Order Display', fields: [
      { key: 'showOrderNumber', label: 'Order Number', type: 'toggle', defaultValue: true },
      { key: 'showDate', label: 'Date', type: 'toggle', defaultValue: true },
      { key: 'showStatus', label: 'Status', type: 'toggle', defaultValue: true },
      { key: 'showItems', label: 'Items', type: 'toggle', defaultValue: true },
      { key: 'showTotals', label: 'Totals', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'shipping', label: 'Shipping', groups: [{ id: 'shipping', label: 'Shipping Info', fields: [
      { key: 'showAddress', label: 'Shipping Address', type: 'toggle', defaultValue: true },
      { key: 'showMethod', label: 'Shipping Method', type: 'toggle', defaultValue: true },
      { key: 'showTracking', label: 'Tracking Number', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#f8fafc' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'two-column', heading: 'Order Details',
    showOrderNumber: true, showDate: true, showStatus: true, showItems: true, showTotals: true,
    showAddress: true, showMethod: true, showTracking: true, pageWidth: 'standard',
  },
  seoConfig: { dynamic: true },
};
