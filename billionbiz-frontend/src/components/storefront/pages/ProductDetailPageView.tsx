import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Truck, RotateCcw } from 'lucide-react';
import { useStorefrontCartStore } from '../../../store/storefrontCartStore';

interface ProductDetailPageViewProps {
  product?: any;
  productHandle?: string;
  products?: any[];
  relatedProducts?: any[];
  onNavigate?: (path: string) => void;
}

export const ProductDetailPageView: React.FC<ProductDetailPageViewProps> = ({
  product: directProduct,
  productHandle,
  products = [],
  relatedProducts = [],
  onNavigate
}) => {
  const { addItem } = useStorefrontCartStore();
  const [quantity, setQuantity] = useState(1);

  // If no products exist in the store catalog, render truthful empty state
  if (!directProduct && (!products || products.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag size={24} />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No Products in Catalogue
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Add and publish products in your Admin Portal Catalogue to view and preview product detail pages.
        </p>
      </div>
    );
  }

  // Find product by direct prop, handle or ID, or first item
  const product =
    directProduct ||
    products.find((p) => p.handle === productHandle || p.id === productHandle) ||
    products[0];

  const price = product.price_minor ? product.price_minor / 100 : 999;
  const comparePrice = product.compare_at_minor ? product.compare_at_minor / 100 : null;
  const images = (product.media && product.media.length > 0)
    ? product.media.map((m: any) => m.url)
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop'];

  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate?.('/shop')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Back to Catalogue</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-[var(--theme-border)]">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                    activeImage === img ? 'border-indigo-600' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Buy Box */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.brand && (
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {product.brand}
              </span>
            )}
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {product.name}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              SKU: {product.sku || 'STD-001'}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {comparePrice && (
              <span className="text-lg text-slate-400 line-through">
                ₹{comparePrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
              In Stock
            </span>
          </div>

          {/* Quantity selector & Add to Cart */}
          <div className="space-y-4 pt-4 border-t border-[var(--theme-border)]">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity:</span>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => addItem(product, undefined, quantity)}
                className="flex-1 py-3.5 rounded-xl bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] font-bold text-sm shadow-md hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={18} />
                <span>Add to Cart — ₹{(price * quantity).toLocaleString('en-IN')}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t border-[var(--theme-border)]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Product Overview</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description || 'Crafted with premium materials for maximum durability and effortless elegance.'}
            </p>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--theme-border)] text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-emerald-500" />
              <span>Standard delivery 3–5 days</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-emerald-500" />
              <span>7-Day Return Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[var(--theme-border)] space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => {
              const rpPrice = rp.price_minor ? rp.price_minor / 100 : 999;
              return (
                <div
                  key={rp.id}
                  onClick={() => onNavigate?.(`/products/${rp.handle || rp.id}`)}
                  className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition p-3 space-y-2"
                >
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                    <img
                      src={rp.media?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&fit=crop'}
                      alt={rp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">{rp.name}</h4>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">₹{rpPrice.toLocaleString('en-IN')}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

