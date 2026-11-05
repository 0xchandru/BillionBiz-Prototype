import { afterEach, describe, expect, it } from 'vitest';
import { useStorefrontCartStore } from './storefrontCartStore';

afterEach(() => useStorefrontCartStore.getState().clearCart());

describe('storefront cart measurement quantities', () => {
  it('starts at the product minimum and adds in valid increments', () => {
    const cart = useStorefrontCartStore.getState();
    cart.addItem(
      { id: 'tea', name: 'Tea', price_minor: 1200, minimum_quantity: 0.5, quantity_step: 0.25, selling_unit: 'kg' },
      { id: 'tea-variant', price_minor: 1200 },
      0.1
    );

    expect(useStorefrontCartStore.getState().items[0]).toMatchObject({
      quantity: 0.5,
      quantityStep: 0.25,
      minimumQuantity: 0.5,
      sellingUnit: 'kg'
    });

    useStorefrontCartStore.getState().updateQuantity('tea-tea-variant', 1);
    expect(useStorefrontCartStore.getState().items[0].quantity).toBe(0.75);
  });

  it('removes a line when decrementing below its minimum', () => {
    const cart = useStorefrontCartStore.getState();
    cart.addItem(
      { id: 'rice', name: 'Rice', price_minor: 500, minimum_quantity: 1, quantity_step: 1, selling_unit: 'kg' },
      { id: 'rice-variant', price_minor: 500 }
    );

    useStorefrontCartStore.getState().updateQuantity('rice-rice-variant', -1);
    expect(useStorefrontCartStore.getState().items).toHaveLength(0);
  });
});
