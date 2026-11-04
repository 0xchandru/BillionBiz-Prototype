import React from 'react';
import {
  Palette, Paintbrush, Hash, CreditCard,
  Loader2, FileText, Smartphone, ChevronsUp, Globe,
  PanelLeftClose, PanelLeftOpen, ChevronRight,
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import type { ThemeCategoryType } from '../../../store/landingEditorStore';
import styles from '../../../pages/editor/EditorLayout.module.css';

// ─── Theme sub-nav categories ───
const THEME_CATEGORIES = [
  { id: 'themes' as const, label: 'Theme Presets', icon: Palette, desc: 'Preset styles & palettes' },
  { id: 'colors' as const, label: 'Color Palette', icon: Paintbrush, desc: 'Brand, surface & accents' },
  { id: 'typography' as const, label: 'Typography', icon: Hash, desc: 'Fonts & typography scale' },
  { id: 'buttons' as const, label: 'Buttons & Forms', icon: CreditCard, desc: 'Shapes, inputs & CTA styling' },
  { id: 'effects' as const, label: 'Effects & Motion', icon: Loader2, desc: 'Radius, shadows & animations' },
  { id: 'custom-css' as const, label: 'Custom CSS', icon: FileText, desc: 'Custom code styling' },
];

export const DesignPanel: React.FC = () => {
  const {
    designSection, setDesignSection,
    selectedThemeCategory, setSelectedThemeCategory,
    isLeftSidebarCollapsed, setLeftSidebarCollapsed,
    isRightSidebarOpen, setRightSidebarOpen,
    setActivePanel,
  } = useLandingEditorStore();

  const isThemeCategoryActive = (catId: ThemeCategoryType) =>
    (designSection === 'themes' || designSection === 'theme' || !designSection) && selectedThemeCategory === catId && isRightSidebarOpen;

  const isLoaderActive = designSection === 'loader' && isRightSidebarOpen;
  const isScrollActive = designSection === 'scroll-behavior' && isRightSidebarOpen;
  const isMobileNavActive = (designSection === 'mobile-nav' || designSection === 'mobile') && isRightSidebarOpen;
  const isMobilePwaActive = (designSection === 'mobile-pwa' || designSection === 'mobile-web') && isRightSidebarOpen;
  const isMobileAppActive = designSection === 'mobile-app' && isRightSidebarOpen;

  return (
    <div className={styles.contextPanelInner}>
      <div className={styles.contextPanelHeader}>
        <div>
          <h3 className={styles.contextPanelTitle}>Design &amp; Theme</h3>
          <p className={styles.contextPanelDesc}>Theme tokens, interactions &amp; responsive UI</p>
        </div>
        <button
          onClick={() => setLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          className={styles.collapseBtn}
          title={isLeftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isLeftSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className={styles.contextPanelScroll}>
        {/* Group 1: Theme Styling */}
        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>Theme Design System</div>

          {THEME_CATEGORIES.map((cat) => {
            const isSelected = isThemeCategoryActive(cat.id);
            const CatIcon = cat.icon;
            return (
              <div
                key={cat.id}
                className={`${styles.navItem} ${isSelected ? styles.navItemActive : ''}`}
                onClick={() => {
                  setDesignSection('themes');
                  setSelectedThemeCategory(cat.id);
                  setActivePanel('design');
                  setRightSidebarOpen(true);
                }}
              >
                <div className={`${styles.navItemIcon} ${isSelected ? styles.navItemIconActive : ''}`}>
                  <CatIcon size={16} />
                </div>
                <div className={styles.navItemContent}>
                  <span className={`${styles.navItemLabel} ${isSelected ? styles.navItemLabelActive : ''}`}>{cat.label}</span>
                  <span className={styles.navItemPath}>{cat.desc}</span>
                </div>
                <ChevronRight size={14} className={styles.navItemChevron} />
              </div>
            );
          })}
        </div>

        {/* Group 2: Global Interactive Elements */}
        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>Global Elements</div>

          {/* Loader */}
          <div
            className={`${styles.navItem} ${isLoaderActive ? styles.navItemActive : ''}`}
            onClick={() => {
              setDesignSection('loader');
              setActivePanel('design');
              setRightSidebarOpen(true);
            }}
          >
            <div className={`${styles.navItemIcon} ${isLoaderActive ? styles.navItemIconActive : ''}`}>
              <Loader2 size={16} />
            </div>
            <div className={styles.navItemContent}>
              <span className={`${styles.navItemLabel} ${isLoaderActive ? styles.navItemLabelActive : ''}`}>Loader Animation</span>
              <span className={styles.navItemPath}>Page load screen &amp; style</span>
            </div>
            <ChevronRight size={14} className={styles.navItemChevron} />
          </div>

          {/* Scroll Behavior */}
          <div
            className={`${styles.navItem} ${isScrollActive ? styles.navItemActive : ''}`}
            onClick={() => {
              setDesignSection('scroll-behavior');
              setActivePanel('design');
              setRightSidebarOpen(true);
            }}
          >
            <div className={`${styles.navItemIcon} ${isScrollActive ? styles.navItemIconActive : ''}`}>
              <ChevronsUp size={16} />
            </div>
            <div className={styles.navItemContent}>
              <span className={`${styles.navItemLabel} ${isScrollActive ? styles.navItemLabelActive : ''}`}>Scroll Behavior</span>
              <span className={styles.navItemPath}>Smooth scroll &amp; back-to-top</span>
            </div>
            <ChevronRight size={14} className={styles.navItemChevron} />
          </div>
        </div>

        {/* Group 3: Mobile & Responsive */}
        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>Mobile &amp; Responsive</div>

          {/* Mobile Navigation */}
          <div
            className={`${styles.navItem} ${isMobileNavActive ? styles.navItemActive : ''}`}
            onClick={() => {
              setDesignSection('mobile-nav');
              setActivePanel('design');
              setRightSidebarOpen(true);
            }}
          >
            <div className={`${styles.navItemIcon} ${isMobileNavActive ? styles.navItemIconActive : ''}`}>
              <Smartphone size={16} />
            </div>
            <div className={styles.navItemContent}>
              <span className={`${styles.navItemLabel} ${isMobileNavActive ? styles.navItemLabelActive : ''}`}>Mobile Navigation</span>
              <span className={styles.navItemPath}>Bottom navbar items &amp; drawer</span>
            </div>
            <ChevronRight size={14} className={styles.navItemChevron} />
          </div>

          {/* Mobile Web & PWA */}
          <div
            className={`${styles.navItem} ${isMobilePwaActive ? styles.navItemActive : ''}`}
            onClick={() => {
              setDesignSection('mobile-pwa');
              setActivePanel('design');
              setRightSidebarOpen(true);
            }}
          >
            <div className={`${styles.navItemIcon} ${isMobilePwaActive ? styles.navItemIconActive : ''}`}>
              <Globe size={16} />
            </div>
            <div className={styles.navItemContent}>
              <span className={`${styles.navItemLabel} ${isMobilePwaActive ? styles.navItemLabelActive : ''}`}>Mobile Web &amp; PWA</span>
              <span className={styles.navItemPath}>Home screen banner &amp; splash</span>
            </div>
            <ChevronRight size={14} className={styles.navItemChevron} />
          </div>

          {/* Mobile App Shell */}
          <div
            className={`${styles.navItem} ${isMobileAppActive ? styles.navItemActive : ''}`}
            onClick={() => {
              setDesignSection('mobile-app');
              setActivePanel('design');
              setRightSidebarOpen(true);
            }}
          >
            <div className={`${styles.navItemIcon} ${isMobileAppActive ? styles.navItemIconActive : ''}`}>
              <Smartphone size={16} />
            </div>
            <div className={styles.navItemContent}>
              <span className={`${styles.navItemLabel} ${isMobileAppActive ? styles.navItemLabelActive : ''}`}>Mobile App Shell</span>
              <span className={styles.navItemPath}>Native safe area &amp; status bar</span>
            </div>
            <ChevronRight size={14} className={styles.navItemChevron} />
          </div>
        </div>
      </div>
    </div>
  );
};
