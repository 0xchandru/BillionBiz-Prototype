import React, { useState } from 'react';
import { Search, ShoppingBag, Package } from 'lucide-react';
import { useStorefrontCartStore } from '../../../store/storefrontCartStore';

interface ShopPageViewProps {
  products?: any[];
  categories?: any[];
  onNavigate?: (path: string) => void;
}

export const ShopPageView: React.FC<ShopPageViewProps> = ({
  products = [],
  categories = [],
  onNavigate
}) => {
  const { addItem } = useStorefrontCartStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' ||
      p.category_id === selectedCategory ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCat;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.price_minor || 0;
    const priceB = b.price_minor || 0;
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Store Catalogue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse our complete inventory with direct live stock.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-24 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Package size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No products found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No items matching '${searchQuery}'. Try another search query.`
              : 'Add products in the Admin Portal Catalogue to make them live here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((p) => {
            const price = p.price_minor ? p.price_minor / 100 : 999;
            const comparePrice = p.compare_at_minor ? p.compare_at_minor / 100 : null;
            const img = p.media?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&fit=crop';
            return (
              <div
                key={p.id}
                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
              >
                <div
                  className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer relative"
                  onClick={() => onNavigate?.(`/products/${p.handle || p.id}`)}
                >
                  <img
                    src={img}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      onClick={() => onNavigate?.(`/products/${p.handle || p.id}`)}
                      className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:underline"
                    >
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {comparePrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{comparePrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addItem(p)}
                    className="w-full py-2 rounded-lg bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] font-semibold text-xs hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

