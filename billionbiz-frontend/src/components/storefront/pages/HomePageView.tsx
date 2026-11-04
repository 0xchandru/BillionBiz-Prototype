import React from 'react';
import { Sparkles } from 'lucide-react';
import { isHeaderComponent, isFooterComponent } from '../../../store/siteStore';
import { SectionRenderer } from '../../editor/SectionRenderer';

interface HomePageViewProps {
  store?: any;
  brand?: any;
  brandName?: string;
  tagline?: string;
  products?: any[];
  categories?: any[];
  offerings?: any[];
  mode?: string;
  onNavigate?: (path: string) => void;
  sections?: any[];
}

export const HomePageView: React.FC<HomePageViewProps> = ({
  sections = []
}) => {
  // Only render custom body sections - Header and Footer are rendered natively by StoreLayout
  const bodySections = (sections || []).filter((s: any) =>
    s && !isHeaderComponent(s) && !isFooterComponent(s)
  );

  // Truthful empty canvas when no body sections have been added by the merchant
  if (bodySections.length === 0) {
    return (
      <div className="min-h-[460px] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center py-16 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto shadow-xs border border-slate-200 dark:border-slate-700">
            <Sparkles size={22} className="text-amber-500" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Empty Landing Page</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              No sections added yet. Click <strong>+ Add Section</strong> in the left sidebar to add sections to your landing page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {bodySections.map((section: any, idx: number) => (
        <SectionRenderer key={section.id || idx} section={section} />
      ))}
    </div>
  );
};
