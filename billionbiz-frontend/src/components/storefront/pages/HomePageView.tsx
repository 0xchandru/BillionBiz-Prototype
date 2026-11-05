import React from 'react';
import { LayoutTemplate, Sparkles } from 'lucide-react';
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
  currencyCode?: string;
  mode?: string;
  editorPreview?: boolean;
  onNavigate?: (path: string) => void;
  device?: 'desktop' | 'tablet' | 'mobile';
  sections?: any[];
}

export const HomePageView: React.FC<HomePageViewProps> = ({
  sections = [],
  products = [],
  categories = [],
  offerings = [],
  currencyCode = 'INR',
  onNavigate,
  device = 'desktop',
  editorPreview = false
}) => {
  const dataContext = { products, categories, offerings, currencyCode };
  // Only render custom body sections - Header and Footer are rendered natively by StoreLayout
  const bodySections = (sections || []).filter((s: any) =>
    s && !isHeaderComponent(s) && !isFooterComponent(s)
  );

  // Truthful empty canvas when no body sections have been added by the merchant
  if (bodySections.length === 0) {
    return (
      <div className="min-h-[460px] flex items-center justify-center p-6 sm:p-10" role="status" aria-label="Homepage has no content">
        <div className="max-w-xl w-full text-center py-12 sm:py-16 px-6 sm:px-10 border border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-900 shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 dark:border-amber-900">
            {editorPreview ? <LayoutTemplate size={25} /> : <Sparkles size={24} />}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editorPreview ? 'Your homepage is ready to design' : 'This store is getting ready'}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {editorPreview
                ? <>There are no homepage sections in this store yet. Choose <strong className="text-slate-800 dark:text-white">+ Add Section</strong> in the Pages sidebar to start building the storefront.</>
                : 'The store owner has not added homepage content yet. Please check back soon.'}
            </p>
          </div>
          {editorPreview && <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"><span className="h-2 w-2 rounded-full bg-amber-500" />Preview only · no sample content is being shown</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {bodySections.map((section: any, idx: number) => (
        <SectionRenderer
          key={section.id || idx}
          section={section}
          overrideDevice={device}
          onNavigate={onNavigate}
          dataContext={dataContext}
          currencyCode={currencyCode}
        />
      ))}
    </div>
  );
};
