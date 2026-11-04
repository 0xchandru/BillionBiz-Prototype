import React, { useState } from 'react';
import { Compass, ArrowLeft, Search } from 'lucide-react';

interface System404ViewProps {
  onNavigate?: (path: string) => void;
  brandName?: string;
}

export const System404View: React.FC<System404ViewProps> = ({
  onNavigate,
  brandName = 'Store'
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onNavigate) {
      onNavigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
        <Compass size={40} className="animate-spin-slow" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-black tracking-widest text-indigo-600 uppercase">Error 404</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          The page you requested does not exist or may have been relocated in {brandName}'s store.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-sm mx-auto">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search products or collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </form>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => onNavigate?.('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition cursor-pointer"
        >
          <ArrowLeft size={13} />
          Back to Home
        </button>
        <button
          onClick={() => onNavigate?.('/shop')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          Browse Catalogue
        </button>
      </div>
    </div>
  );
};

