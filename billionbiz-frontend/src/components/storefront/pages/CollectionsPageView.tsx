import React from 'react';
import { LayoutGrid, ArrowRight, Package } from 'lucide-react';

interface CollectionsPageViewProps {
  categories?: any[];
  products?: any[];
  onNavigate?: (path: string) => void;
}

export const CollectionsPageView: React.FC<CollectionsPageViewProps> = ({
  categories = [],
  products = [],
  onNavigate
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[var(--theme-border)] pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Collections &amp; Categories</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore curated product categories crafted for distinct spaces and aesthetics.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-24 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <LayoutGrid size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No categories created yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Manage product collections in Admin → Products → Categories to organize your store inventory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{ gap: 'var(--theme-grid-gap, 24px)' }}>
          {categories.map((c) => {
            const count = products.filter(
              (p) => p.category_id === c.id || p.category?.toLowerCase() === c.name?.toLowerCase()
            ).length;

            return (
              <div
                key={c.id}
                onClick={() => onNavigate?.(`/shop?category=${c.id}`)}
                className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-xs hover:shadow-md space-y-3"
                style={{ padding: 'var(--theme-card-padding, 24px)' }}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
                  <Package size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {c.description || 'Explore products in this collection.'}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 gap-1 pt-1">
                  <span>{count > 0 ? `${count} product${count > 1 ? 's' : ''}` : 'View Collection'}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

