import React, { useMemo, useState } from 'react';
import { Search, ShoppingBag, Package, ImageOff } from 'lucide-react';
import { useStorefrontCartStore } from '../../../store/storefrontCartStore';

interface ShopPageViewProps {
  products?: any[];
  categories?: any[];
  currencyCode?: string;
  onNavigate?: (path: string) => void;
}

const money = (minor: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode }).format(minor / 100);
  } catch {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100);
  }
};

const getPriceRange = (product: any) => {
  const priced = (Array.isArray(product.variants) ? product.variants : [])
    .filter((variant: any) => variant.price_minor !== undefined && variant.price_minor !== null && Number.isFinite(Number(variant.price_minor)))
    .map((variant: any) => Number(variant.price_minor));
  if (priced.length === 0) return null;
  return { min: Math.min(...priced), max: Math.max(...priced) };
};

export const ShopPageView: React.FC<ShopPageViewProps> = ({
  products = [],
  categories = [],
  currencyCode = 'INR',
  onNavigate
}) => {
  const addItem = useStorefrontCartStore((state) => state.addItem);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery.trim() ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      product.category_id === selectedCategory ||
      product.category_name?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = useMemo(() => [...filteredProducts].sort((a, b) => {
    if (sortBy === 'featured') return 0;
    const priceA = getPriceRange(a)?.min ?? Number.POSITIVE_INFINITY;
    const priceB = getPriceRange(b)?.min ?? Number.POSITIVE_INFINITY;
    return sortBy === 'price-low' ? priceA - priceB : priceB - priceA;
  }), [filteredProducts, sortBy]);

  const openProduct = (product: any) => {
    onNavigate?.(`/products/${encodeURIComponent(product.handle || product.id)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Store Catalogue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse products currently active in this store.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${selectedCategory === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
          >
            All Items ({products.length})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${selectedCategory === category.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {sortedProducts.length === 0 ? (
        <div className="text-center py-24 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Package size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {searchQuery || selectedCategory !== 'all' ? 'No matching products' : 'No active products yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No active products match "${searchQuery}". Try a different search.`
              : selectedCategory !== 'all'
                ? 'There are no active products in this category.'
                : 'Products added and activated in the merchant catalogue will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 'var(--theme-grid-gap, 24px)' }}>
          {sortedProducts.map((product) => {
            const variants = Array.isArray(product.variants) ? product.variants : [];
            const priceRange = getPriceRange(product);
            const firstVariant = variants.length === 1 ? variants[0] : null;
            const image = Array.isArray(product.media) ? product.media.find((entry: any) => entry?.url || entry?.src) : undefined;
            const imageUrl = image?.url || image?.src;
            const soldOut = firstVariant?.stock_tracked === true && Number(firstVariant.stock_available ?? 0) <= 0;
            const canAddDirectly = Boolean(
              firstVariant &&
              !soldOut &&
              firstVariant.price_minor !== null &&
              firstVariant.price_minor !== undefined
            );

            return (
              <article
                key={product.id}
                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => openProduct(product)}
                  aria-label={`View ${product.name}`}
                  className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt={image?.alt || product.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ImageOff size={24} />
                      <span className="text-[11px]">Image unavailable</span>
                    </div>
                  )}
                </button>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {product.brand && <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{product.brand}</p>}
                    <button
                      type="button"
                      onClick={() => openProduct(product)}
                      className="text-left text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 hover:underline"
                    >
                      {product.name}
                    </button>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {priceRange ? (
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          {priceRange.min === priceRange.max
                            ? money(priceRange.min, currencyCode)
                            : `${money(priceRange.min, currencyCode)} – ${money(priceRange.max, currencyCode)}`}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Price unavailable</span>
                      )}
                      {soldOut && <span className="text-[11px] font-semibold text-rose-600">Sold out</span>}
                    </div>
                  </div>

                  {soldOut ? (
                    <button type="button" disabled className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-xs cursor-not-allowed">
                      Sold out
                    </button>
                  ) : canAddDirectly ? (
                    <button
                      type="button"
                      onClick={() => addItem(product, firstVariant)}
                      className="w-full py-2 rounded-lg bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] font-semibold text-xs hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag size={14} />
                      <span>Add to Cart</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openProduct(product)}
                      className="w-full py-2 rounded-lg border border-[var(--theme-border)] text-[var(--theme-text-heading)] font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      {variants.length > 1 ? 'Choose options' : 'View product'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
