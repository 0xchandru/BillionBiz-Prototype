import React, { useRef, useEffect } from 'react';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore } from '../../store/siteStore';
import styles from '../../pages/editor/EditorLayout.module.css';


import { AddComponentModal } from './engine/AddComponentModal';
import { PresetModal } from './engine/PresetModal';
import { WebsitePreview } from './WebsitePreview';

import { useEditorContextStore } from '../../store/editorContextStore';
import { scrollPreviewToHeaderSection, scrollPreviewToFooterSection, scrollPreviewToSection } from './utils/previewScroll';
import { resolveEditorPage } from './utils/pageIdentity';

export const EditorCanvas: React.FC = () => {
   const { 
     isRightSidebarOpen, 
     activePanel, 
     selectedPageId, 
     selectedSectionId,
     pagesNavLevel 
   } = useLandingEditorStore();
   const { selectedTarget } = useEditorContextStore();
   const { theme, pages } = useSiteStore();
   const activePage = resolveEditorPage(pages, selectedPageId);
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
      if (selectedSectionId && activePage?.path === '/') {
         scrollPreviewToSection(selectedSectionId);
         return;
      }
      const wrappers = document.querySelectorAll(`.${styles.canvasWrapper}`);
      wrappers.forEach((el) => {
         el.scrollTop = 0;
         el.classList.remove(styles.isScrolled);
      });
   }, [selectedPageId, pagesNavLevel, activePanel, selectedSectionId, selectedTarget, activePage?.path]);

   // ─── Determine what to render in the canvas ───
   const renderCanvasContent = () => {
      switch (activePanel) {
         case 'pages':
         case 'brand':
         case 'store-brand':
         case 'design':
         case 'design-experience':
         case 'growth':
         case 'seo-growth':
         case 'settings':
         default:
            // Every workspace keeps the same storefront renderer in the center.
            // Workspace-specific controls belong in the contextual inspector.
            return (
               <div style={{ width: '100%', height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
                  <WebsitePreview />
               </div>
            );
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
