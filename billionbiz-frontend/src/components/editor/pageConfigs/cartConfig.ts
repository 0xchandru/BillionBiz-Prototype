// ============================================================
// CART PAGE CONFIG
// ============================================================
import { ShoppingCart } from 'lucide-react';
import type { PageConfig, PageTabConfig } from './types';

export const cartConfig: PageConfig = {
  type: 'cart',
  name: 'Cart',
  category: 'commerce',
  icon: ShoppingCart,
  description: 'View and manage cart items.',
  path: '/cart',
  headerVariant: 'default',
  footerVariant: 'default',
  defaultSections: [
    { type: 'Header', name: 'Cart Header', group: 'header' },
    { type: 'CartItems', name: 'Cart Items', group: 'content' },
    { type: 'CartSummary', name: 'Cart Summary', group: 'content' },
    { type: 'ProductRecommendations', name: 'Recommendations', group: 'content' },
    { type: 'Footer', name: 'Footer', group: 'footer' },
  ],
  layouts: [
    { id: 'standard', label: 'Standard (Items + Summary)' },
    { id: 'two-column', label: 'Two Column (Items Left, Summary Right)' },
    { id: 'minimal', label: 'Minimal Cart' },
  ],
  getTabs: (): PageTabConfig[] => [
    { id: 'content', label: 'Content', groups: [{ id: 'content', label: 'Cart Content', fields: [
      { key: 'cartTitle', label: 'Cart Title', type: 'text', defaultValue: 'Your Cart' },
      { key: 'emptyCartTitle', label: 'Empty Cart Title', type: 'text', defaultValue: 'Your cart is empty' },
      { key: 'emptyCartDescription', label: 'Empty Cart Description', type: 'textarea', defaultValue: 'Looks like you haven\'t added anything to your cart yet.' },
      { key: 'continueShoppingText', label: 'Continue Shopping Text', type: 'text', defaultValue: 'Continue Shopping' },
    ]}]},
    { id: 'cart', label: 'Cart', groups: [{ id: 'cart-elements', label: 'Cart Item Display', fields: [
      { key: 'showProductImage', label: 'Product Image', type: 'toggle', defaultValue: true },
      { key: 'showVariant', label: 'Variant', type: 'toggle', defaultValue: true },
      { key: 'showQuantity', label: 'Quantity Selector', type: 'toggle', defaultValue: true },
      { key: 'showPrice', label: 'Price', type: 'toggle', defaultValue: true },
      { key: 'showRemove', label: 'Remove Button', type: 'toggle', defaultValue: true },
      { key: 'showComparePrice', label: 'Compare-at Price', type: 'toggle', defaultValue: true },
    ]}]},
    { id: 'summary', label: 'Summary', groups: [{ id: 'summary', label: 'Order Summary', fields: [
      { key: 'showSubtotal', label: 'Show Subtotal', type: 'toggle', defaultValue: true },
      { key: 'showDiscount', label: 'Show Discount', type: 'toggle', defaultValue: true },
      { key: 'showShipping', label: 'Show Shipping Estimate', type: 'toggle', defaultValue: true },
      { key: 'showTax', label: 'Show Tax', type: 'toggle', defaultValue: false },
      { key: 'showTotal', label: 'Show Total', type: 'toggle', defaultValue: true },
      { key: 'checkoutButtonText', label: 'Checkout Button Text', type: 'text', defaultValue: 'Proceed to Checkout' },
    ]}]},
    { id: 'recommendations', label: 'Recommendations', groups: [{ id: 'rec', label: 'Recommendations', fields: [
      { key: 'enableRecommendations', label: 'Enable Recommendations', type: 'toggle', defaultValue: true },
      { key: 'recLayout', label: 'Layout', type: 'segmented', options: [{ label: 'Grid', value: 'grid' }, { label: 'Carousel', value: 'carousel' }], defaultValue: 'carousel', showWhen: { field: 'enableRecommendations', value: true } },
      { key: 'recCount', label: 'Product Count', type: 'number', min: 2, max: 8, defaultValue: 4, showWhen: { field: 'enableRecommendations', value: true } },
    ]}]},
    { id: 'style', label: 'Style', groups: [{ id: 'style', label: 'Visual Style', fields: [
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
    ]}]},
  ],
  defaultProps: {
    selectedLayout: 'two-column', cartTitle: 'Your Cart',
    emptyCartTitle: 'Your cart is empty', emptyCartDescription: 'Looks like you haven\'t added anything to your cart yet.',
    continueShoppingText: 'Continue Shopping', showProductImage: true, showVariant: true, showQuantity: true,
    showPrice: true, showRemove: true, showComparePrice: true, showSubtotal: true, showDiscount: true,
    showShipping: true, showTotal: true, checkoutButtonText: 'Proceed to Checkout',
    enableRecommendations: true, recLayout: 'carousel', recCount: 4, pageWidth: 'standard',
  },
};
