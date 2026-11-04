import React, { useRef, useEffect, Suspense, lazy } from 'react';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore } from '../../store/siteStore';
import styles from '../../pages/editor/EditorLayout.module.css';

const SettingsRenderer = lazy(() => import('./SettingsRenderer').then(m => ({ default: m.SettingsRenderer })));
const StoreBrandRenderer = lazy(() => import('./StoreBrandRenderer').then(m => ({ default: m.StoreBrandRenderer })));
const SeoGrowthRenderer = lazy(() => import('./SeoGrowthRenderer').then(m => ({ default: m.SeoGrowthRenderer })));

import { AddComponentModal } from './engine/AddComponentModal';
import { PresetModal } from './engine/PresetModal';
import { WebsitePreview } from './WebsitePreview';

import { useEditorContextStore } from '../../store/editorContextStore';
import { scrollPreviewToHeaderSection, scrollPreviewToFooterSection, scrollPreviewToSection } from './utils/previewScroll';

export const EditorCanvas: React.FC = () => {
   const { 
     isRightSidebarOpen, 
     activePanel, 
     selectedPageId, 
     selectedSectionId,
     pagesNavLevel 
   } = useLandingEditorStore();
   const { selectedTarget } = useEditorContextStore();
   const { theme } = useSiteStore();
   const containerRef = useRef<HTMLDivElement>(null);

   // Scroll preview intelligently when switching or opening a particular page editor
   useEffect(() => {
      if (selectedPageId === 'footer-global') {
         const targetId = selectedSectionId || (selectedTarget?.type === 'row' ? selectedTarget.rowId : undefined);
         scrollPreviewToFooterSection(targetId || 'footer-main');
         return;
      }
      if (selectedPageId === 'header-global') {
         const targetId = selectedSectionId || (selectedTarget?.type === 'row' ? selectedTarget.rowId : undefined);
         scrollPreviewToHeaderSection(targetId || 'header-main');
         return;
      }
      if (selectedSectionId && selectedPageId === 'landing-page') {
         scrollPreviewToSection(selectedSectionId);
         return;
      }
      const wrappers = document.querySelectorAll(`.${styles.canvasWrapper}`);
      wrappers.forEach((el) => {
         el.scrollTop = 0;
         el.classList.remove(styles.isScrolled);
      });
   }, [selectedPageId, pagesNavLevel, activePanel, selectedSectionId, selectedTarget]);

   // ─── Determine what to render in the canvas ───
   const renderCanvasContent = () => {
      const renderFallback = (
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: '#64748b', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ width: '16px', height: '16px', border: '2px solid #e2e8f0', borderTopColor: 'var(--primary, #2563eb)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
               <span>Loading view...</span>
            </div>
         </div>
      );

      switch (activePanel) {
         case 'settings':
            return (
               <Suspense fallback={renderFallback}>
                  <SettingsRenderer />
               </Suspense>
            );
         case 'brand':
         case 'store-brand':
            return (
               <Suspense fallback={renderFallback}>
                  <StoreBrandRenderer />
               </Suspense>
            );
         case 'seo-growth':
            return (
               <Suspense fallback={renderFallback}>
                  <SeoGrowthRenderer />
               </Suspense>
            );
         case 'pages': {
            const isGlobalHeader = selectedPageId === 'header-global';
            const isGlobalFooter = selectedPageId === 'footer-global';

            return (
               <div style={{ width: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
                  <WebsitePreview
                     highlightSection={isGlobalHeader ? 'header' : isGlobalFooter ? 'footer' : null}
                  />
               </div>
            );
         }
         case 'design':
         case 'design-experience':
         default: {
            return (
               <div style={{ width: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
                  <WebsitePreview />
               </div>
            );
         }
      }
   };

   return (
      <div
         ref={containerRef}
         className={`${styles.canvasArea} ${isRightSidebarOpen ? styles.canvasShrink : ''}`}
         style={{
            '--theme-primary': theme?.colors?.primary || '#198754',
            '--theme-secondary': theme?.colors?.secondary || '#ff6b00',
            '--theme-bg': theme?.colors?.background || '#ffffff',
            '--theme-text': theme?.colors?.text || '#0f172a'
         } as React.CSSProperties}
      >
         {renderCanvasContent()}
         <AddComponentModal />
         <PresetModal />
      </div>
   );
};
