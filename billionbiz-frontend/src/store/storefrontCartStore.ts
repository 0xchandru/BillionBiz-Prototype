import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartLineItem {
  id: string;
  productId: string;
  name: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  imageUrl?: string;
  variantId?: string;
  variantTitle?: string;
}

interface StorefrontCartState {
  items: CartLineItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: any, variant?: any, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getSubtotal: () => number;
}

export const useStorefrontCartStore = create<StorefrontCartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (open: boolean) => set({ isOpen: open }),

      addItem: (product: any, variant?: any, quantity = 1) => {
        const lineId = variant?.id ? `${product.id}-${variant.id}` : product.id;
        const rawPrice = variant?.price_minor ?? product.price_minor;
        if (rawPrice === undefined || rawPrice === null || !Number.isFinite(Number(rawPrice))) {
          return;
        }
        const price = Number(rawPrice) / 100;
        const rawCompareAt = variant?.compare_at_minor ?? product.compare_at_minor;
        const compareAt = rawCompareAt === undefined || rawCompareAt === null
          ? undefined
          : Number(rawCompareAt) / 100;
        const imageUrl = product.media?.[0]?.url || product.media_urls?.[0] || undefined;

        set((state) => {
          const existing = state.items.find((item) => item.id === lineId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === lineId ? { ...item, quantity: item.quantity + quantity } : item
              ),
              isOpen: true
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: lineId,
                productId: product.id,
                name: product.name,
                handle: product.handle || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                price,
                compareAtPrice: compareAt,
                quantity,
                imageUrl,
                variantId: variant?.id,
                variantTitle: variant?.sku || variant?.title
              }
            ],
            isOpen: true
          };
        });
      },

      updateQuantity: (id: string, delta: number) => {
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
            .filter((item) => item.quantity > 0)
        }));
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'billionbiz_storefront_cart'
    }
  )
);

