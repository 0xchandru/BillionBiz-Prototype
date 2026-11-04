import React from 'react';
import { ShoppingBag, ArrowRight, Plus, Minus, ShieldCheck } from 'lucide-react';
import { useStorefrontCartStore } from '../../../store/storefrontCartStore';

interface CartPageViewProps {
  onNavigate?: (path: string) => void;
}

export const CartPageView: React.FC<CartPageViewProps> = ({ onNavigate }) => {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useStorefrontCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Shopping Cart ({items.length})
        </h1>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
          >
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Your shopping cart is currently empty
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Browse our product catalogue to discover handcrafted goods and add them to your cart.
          </p>
          <button
            onClick={() => onNavigate?.('/shop')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] font-bold text-sm shadow-md hover:opacity-90 transition cursor-pointer"
          >
            <span>Explore Catalogue</span>
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Table */}
          <div className="lg:col-span-2 divide-y divide-[var(--theme-border)]">
            {items.map((item) => (
              <div key={item.id} className="py-5 flex gap-4 items-center">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => onNavigate?.(`/products/${item.handle}`)}
                    className="text-base font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:underline"
                  >
                    {item.name}
                  </h3>
                  {item.variantTitle && (
                    <span className="text-xs text-slate-400 block">{item.variantTitle}</span>
                  )}
                  <span className="text-sm font-semibold text-slate-900 dark:text-white mt-1 block">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="text-right min-w-20">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="block text-xs text-slate-400 hover:text-red-500 mt-1 ml-auto cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-[var(--theme-border)] h-fit space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Summary</h2>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 border-b border-[var(--theme-border)] pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (GST included)</span>
                <span className="font-semibold text-slate-900 dark:text-white">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => onNavigate?.('/checkout')}
              className="w-full py-3.5 rounded-xl bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] font-bold text-sm shadow-md hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" />
                Guaranteed safe and encrypted checkout
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

