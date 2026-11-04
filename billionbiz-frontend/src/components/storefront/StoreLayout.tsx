import React from 'react';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight
} from 'lucide-react';
import HeaderNavbarSection from '../editor/sections/HeaderNavbarSection';
import { FooterTreeRenderer } from '../editor/sections/FooterTreeRenderer';
import type { FooterTreeNode } from '../editor/engine/footerTreeTypes';
import type { FooterRow } from '../editor/engine/types';
import { useStorefrontCartStore } from '../../store/storefrontCartStore';

interface StoreLayoutProps {
  children: React.ReactNode;
  brand?: {
    name?: string;
    tagline?: string;
    logoUrl?: string;
    faviconUrl?: string;
    socialLinks?: Record<string, string>;
  };
  navigation?: any[];
  previewMode?: boolean;
  onNavigate?: (path: string) => void;
  currentPath?: string;
  headerProps?: Record<string, any>;
  footerTree?: FooterTreeNode[];
  footerRows?: FooterRow[];
  useEditorChrome?: boolean;
}

export const StoreLayout: React.FC<StoreLayoutProps> = ({
  children,
  onNavigate,
  headerProps,
  footerTree,
  footerRows,
  useEditorChrome = false
}) => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getSubtotal, getTotalCount } = useStorefrontCartStore();
  const subtotal = getSubtotal();
  const totalCount = getTotalCount();

  const handleLinkClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.pathname = path;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg)] text-[var(--theme-text-body)]">
      {/* 1. Global Storefront Header */}
      <header className="sticky top-0 z-40 bg-[var(--theme-bg)] border-b border-[var(--theme-border)] shadow-xs">
        <HeaderNavbarSection
          props={headerProps}
          isEditorInteractive={useEditorChrome}
          useEditorModel={useEditorChrome}
        />
      </header>

      {/* 2. Main Page Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* 3. Global Storefront Footer */}
      <div className="w-full mt-auto">
        <FooterTreeRenderer
          tree={useEditorChrome ? undefined : footerTree}
          rows={useEditorChrome ? undefined : footerRows}
          isEditorInteractive={useEditorChrome}
        />
      </div>

      {/* 4. Slide-Over Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} className="text-slate-800 dark:text-slate-200" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Your Shopping Cart ({totalCount})
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Items */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 dark:divide-slate-800">
                {items.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <ShoppingBag size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Your cart is currently empty
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Discover our handcrafted items in the catalog to add products here.
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLinkClick('/shop');
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] hover:opacity-90 transition"
                    >
                      <span>Explore Catalog</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="py-4 flex gap-3.5 items-center">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        {item.variantTitle && (
                          <span className="text-xs text-slate-400 block truncate">
                            {item.variantTitle}
                          </span>
                        )}
                        <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition"
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {items.length > 0 && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Shipping &amp; taxes calculated at checkout.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLinkClick('/cart');
                      }}
                      className="w-full py-2.5 px-3 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 transition"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLinkClick('/checkout');
                      }}
                      className="w-full py-2.5 px-3 text-xs font-semibold rounded-lg bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] hover:opacity-90 shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <span>Checkout</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

