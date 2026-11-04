// ============================================================
// CHECKOUT PAGE CONFIG
// ============================================================
import { CreditCard } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const checkoutConfig: PageConfig = {
  type: 'checkout',
  name: 'Checkout',
  category: 'commerce',
  icon: CreditCard,
  description: 'Secure checkout process.',
  path: '/checkout',
  headerVariant: 'checkout',
  footerVariant: 'checkout',
  defaultSections: [
    { type: 'Header', name: 'Checkout Header', group: 'header', defaultProps: { variant: 'checkout' } },
    { type: 'CheckoutContent', name: 'Checkout Content', group: 'content' },
    { type: 'Footer', name: 'Checkout Footer', group: 'footer', defaultProps: { variant: 'checkout' } },
  ],
  layouts: [
    { id: 'two-column', label: 'Form Left + Summary Right' },
    { id: 'single-column', label: 'Single Column' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Checkout Content', fields: [
      { key: 'heading', label: 'Heading', type: 'text', defaultValue: 'Checkout' },
      { key: 'continueShoppingText', label: 'Continue Shopping Text', type: 'text', defaultValue: 'Continue Shopping' },
      { key: 'placeOrderText', label: 'Place Order Button', type: 'text', defaultValue: 'Place Order' },
    ]}]},
    { id: 'checkout', label: 'Checkout', groups: [
      { id: 'checkout-steps', label: 'Checkout Steps', fields: [
        { key: 'showCustomerInfo', label: 'Customer Information', type: 'toggle', defaultValue: true },
        { key: 'showShippingAddress', label: 'Shipping Address', type: 'toggle', defaultValue: true },
        { key: 'showDeliveryMethod', label: 'Delivery Method', type: 'toggle', defaultValue: true },
        { key: 'showPayment', label: 'Payment', type: 'toggle', defaultValue: true },
      ]},
    ]},
    { id: 'orderSummary', label: 'Order Summary', groups: [{ id: 'summary', label: 'Order Summary', fields: [
      { key: 'showProducts', label: 'Show Products', type: 'toggle', defaultValue: true },
      { key: 'showSubtotal', label: 'Show Subtotal', type: 'toggle', defaultValue: true },
      { key: 'showDiscount', label: 'Show Discount', type: 'toggle', defaultValue: true },
      { key: 'showShipping', label: 'Show Shipping', type: 'toggle', defaultValue: true },
      { key: 'showTax', label: 'Show Tax', type: 'toggle', defaultValue: true },
      { key: 'showTotal', label: 'Show Total', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Checkout Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#f8fafc' },
      { key: 'formBackground', label: 'Form Background', type: 'color', defaultValue: '#ffffff' },
      { key: 'inputRadius', label: 'Input Radius', type: 'select', options: [{ label: 'Sharp', value: '0' }, { label: 'Rounded', value: '8px' }, { label: 'Pill', value: '24px' }], defaultValue: '8px' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'two-column', heading: 'Checkout', placeOrderText: 'Place Order',
    showCustomerInfo: true, showShippingAddress: true, showDeliveryMethod: true, showPayment: true,
    showProducts: true, showSubtotal: true, showDiscount: true, showShipping: true, showTax: true, showTotal: true,
    backgroundColor: '#f8fafc', formBackground: '#ffffff', inputRadius: '8px', pageWidth: 'standard',
    stickySummary: true,
  },
};
