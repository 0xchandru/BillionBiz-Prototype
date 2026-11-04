import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PageData, SectionData } from '../../store/siteStore';
import { SectionRenderer } from './SectionRenderer';
import { scrollPreviewToHeaderSection } from './utils/previewScroll';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore } from '../../store/siteStore';
import { getDefaultTheme } from './theme/themePresets';
import { 
  Settings, 
  Plus, 
  Home, 
  Search, 
  ShoppingCart, 
  User as UserIcon, 
  Heart, 
  Menu, 
  Grid, 
  List,
  Check,
  ArrowUp,
} from 'lucide-react';
import styles from '../../pages/editor/EditorLayout.module.css';
import { useEditorContextStore } from '../../store/editorContextStore';
import HeaderNavbarSection from './sections/HeaderNavbarSection';
import { FooterTreeRenderer } from './sections/FooterTreeRenderer';
import { getEditorPath } from './utils/editorNavigation';

const WhatsAppSvg: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.32 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.39C16.31 14.26 15.09 13.66 14.86 13.58C14.63 13.5 14.47 13.46 14.31 13.71C14.15 13.95 13.69 14.5 13.55 14.66C13.41 14.82 13.27 14.84 13.02 14.72C12.77 14.59 11.98 14.33 11.04 13.49C10.3 12.84 9.8 12.03 9.66 11.78C9.52 11.54 9.64 11.4 9.77 11.28C9.88 11.17 10.02 10.99 10.14 10.84C10.27 10.7 10.31 10.59 10.39 10.43C10.47 10.27 10.43 10.13 10.37 10.01C10.31 9.89 9.83 8.7 9.62 8.21C9.43 7.73 9.23 7.79 9.07 7.78C8.93 7.78 8.76 7.77 8.6 7.77C8.44 7.77 8.17 7.83 7.95 8.07C7.72 8.32 7.09 8.91 7.09 10.11C7.09 11.32 7.97 12.48 8.09 12.64C8.21 12.8 9.82 15.28 12.28 16.34C12.87 16.59 13.32 16.74 13.68 16.85C14.27 17.04 14.81 17.01 15.24 16.95C15.72 16.88 16.71 16.35 16.92 15.76C17.12 15.17 17.12 14.66 17.06 14.56C17 14.45 16.82 14.39 16.56 14.39Z"
    />
  </svg>
);

interface PageRendererProps {
  page: PageData;
  overrideDevice?: string;
}

export const PageRenderer: React.FC<PageRendererProps> = ({ page, overrideDevice }) => {
  if (!page || !page.sections) {
    return null;
  }

  const navigate = useNavigate();
  const { 
    selectedSectionId, 
    setSelectedSectionId, 
    setAddSectionWidgetOpen, 
    setInsertIndex, 
    activePanel,
    selectedPageId,
    pagesNavLevel,
    navigateToPage,
    setRightSidebarOpen,
    isRightSidebarOpen,
    requestEditorSwitch
  } = useLandingEditorStore();
  const storeDevice = useLandingEditorStore(state => state.device);
  const device = overrideDevice || storeDevice;
  const { theme } = useSiteStore();
  const settings = useSiteStore(state => state.settings) || {};

  const defaultTheme = getDefaultTheme();
  const safeTheme = theme || defaultTheme;
  const p = safeTheme.palette || defaultTheme.palette;
  const t = safeTheme.typography || defaultTheme.typography;
  const b = safeTheme.buttons || defaultTheme.buttons;
  const e = safeTheme.effects || defaultTheme.effects;
  const stylesObj = t.styles || defaultTheme.typography.styles;

  const themeStyles = useMemo(() => `
    .preview-theme-wrapper {
      /* Palette: Brand */
      --theme-brand-primary: ${p.brand?.primary || safeTheme.colors?.primary || defaultTheme.palette.brand.primary};
      --theme-brand-secondary: ${p.brand?.secondary || safeTheme.colors?.secondary || defaultTheme.palette.brand.secondary};
      --theme-brand-accent: ${p.brand?.accent || safeTheme.colors?.accent || defaultTheme.palette.brand.accent};
      --theme-brand-link: ${p.brand?.link || safeTheme.colors?.primary || defaultTheme.palette.brand.link};

      /* Palette: Background */
      --theme-bg-background: ${p.background?.background || safeTheme.colors?.background || defaultTheme.palette.background.background};
      --theme-bg-surface: ${p.background?.surface || defaultTheme.palette.background.surface};
      --theme-bg-section: ${p.background?.sectionBg || defaultTheme.palette.background.sectionBg};
      --theme-bg-container: ${p.background?.containerBg || defaultTheme.palette.background.containerBg};

      /* Palette: Footer */
      --theme-footer-bg: ${p.background?.footerBg || (safeTheme.presetName === 'Luxury' ? '#08080c' : safeTheme.presetName === 'Ocean' ? '#082f49' : safeTheme.presetName === 'Warm' ? '#1c1917' : safeTheme.presetName === 'Minimal' ? '#18181b' : '#0f172a')};
      --theme-footer-text: ${p.text?.footerText || (safeTheme.presetName === 'Luxury' ? '#f8f6f0' : safeTheme.presetName === 'Warm' ? '#fafaf9' : safeTheme.presetName === 'Ocean' ? '#f0f9ff' : '#ffffff')};
      --theme-footer-muted: ${p.text?.footerMuted || '#94a3b8'};
      --theme-footer-border: ${p.border?.footerBorder || 'rgba(255, 255, 255, 0.12)'};

      /* Palette: Text */
      --theme-text-heading: ${p.text?.heading || safeTheme.colors?.text || defaultTheme.palette.text.heading};
      --theme-text-subheading: ${p.text?.subheading || defaultTheme.palette.text.subheading};
      --theme-text-body: ${p.text?.body || safeTheme.colors?.text || defaultTheme.palette.text.body};
      --theme-text-muted: ${p.text?.muted || defaultTheme.palette.text.muted};
      --theme-text-inverse: ${p.text?.inverse || defaultTheme.palette.text.inverse};

      /* Palette: Border */
      --theme-border-border: ${p.border?.border || safeTheme.colors?.border || defaultTheme.palette.border.border};
      --theme-border-divider: ${p.border?.divider || defaultTheme.palette.border.divider};

      /* Palette: States */
      --theme-state-success: ${p.states?.success || defaultTheme.palette.states.success};
      --theme-state-warning: ${p.states?.warning || defaultTheme.palette.states.warning};
      --theme-state-error: ${p.states?.error || defaultTheme.palette.states.error};
      --theme-state-info: ${p.states?.info || defaultTheme.palette.states.info};

      /* Typography Tokens */
      --theme-font-heading: ${t.headingFont || defaultTheme.typography.headingFont};
      --theme-font-body: ${t.bodyFont || defaultTheme.typography.bodyFont};
      --theme-font-button: ${t.buttonFont || t.bodyFont || defaultTheme.typography.buttonFont};
      --theme-font-accent: ${t.accentFont || t.headingFont || defaultTheme.typography.accentFont};
      --theme-base-size: ${t.baseSize ?? defaultTheme.typography.baseSize}px;

      /* Button Tokens */
      --theme-btn-primary-bg: ${b.primary?.bg || defaultTheme.buttons.primary.bg};
      --theme-btn-primary-text: ${b.primary?.text || defaultTheme.buttons.primary.text};
      --theme-btn-primary-border: ${b.primary?.border || defaultTheme.buttons.primary.border};
      --theme-btn-primary-radius: ${b.primary?.borderRadius || defaultTheme.buttons.primary.borderRadius};
      --theme-btn-primary-weight: ${b.primary?.fontWeight ?? defaultTheme.buttons.primary.fontWeight};

      --theme-btn-secondary-bg: ${b.secondary?.bg || defaultTheme.buttons.secondary.bg};
      --theme-btn-secondary-text: ${b.secondary?.text || defaultTheme.buttons.secondary.text};
      --theme-btn-secondary-border: ${b.secondary?.border || defaultTheme.buttons.secondary.border};
      --theme-btn-secondary-radius: ${b.secondary?.borderRadius || defaultTheme.buttons.secondary.borderRadius};

      /* Effects */
      --theme-radius: ${e.borderRadius || safeTheme.ui?.borderRadius || defaultTheme.effects.borderRadius};
      --theme-shadow: ${e.shadow || safeTheme.ui?.shadow || defaultTheme.effects.shadow};
      --theme-transition: ${e.transition || defaultTheme.effects.transition};

      /* Legacy compatibility aliases */
      --theme-primary: var(--theme-brand-primary);
      --theme-secondary: var(--theme-brand-secondary);
      --theme-background: var(--theme-bg-background);
      --theme-text: var(--theme-text-body);
      --theme-accent: var(--theme-brand-accent);
      --theme-border: var(--theme-border-border);
      --theme-max-width: ${safeTheme.layout?.maxWidth ?? defaultTheme.layout.maxWidth}px;

      font-family: var(--theme-font-body);
      font-size: var(--theme-base-size);
      color: var(--theme-text-body);
      background-color: var(--theme-bg-background);
    }
    
    .preview-theme-wrapper h1 {
      font-family: var(--theme-font-heading);
      font-size: ${stylesObj.h1?.fontSize ?? 44}px;
      font-weight: ${stylesObj.h1?.fontWeight ?? 700};
      line-height: ${stylesObj.h1?.lineHeight ?? 1.15};
      letter-spacing: ${stylesObj.h1?.letterSpacing ?? -1}px;
      color: var(--theme-text-heading);
    }
    .preview-theme-wrapper h2 {
      font-family: var(--theme-font-heading);
      font-size: ${stylesObj.h2?.fontSize ?? 34}px;
      font-weight: ${stylesObj.h2?.fontWeight ?? 700};
      line-height: ${stylesObj.h2?.lineHeight ?? 1.2};
      letter-spacing: ${stylesObj.h2?.letterSpacing ?? -0.5}px;
      color: var(--theme-text-heading);
    }
    .preview-theme-wrapper h3 {
      font-family: var(--theme-font-heading);
      font-size: ${stylesObj.h3?.fontSize ?? 26}px;
      font-weight: ${stylesObj.h3?.fontWeight ?? 600};
      line-height: ${stylesObj.h3?.lineHeight ?? 1.25};
      letter-spacing: ${stylesObj.h3?.letterSpacing ?? -0.3}px;
      color: var(--theme-text-heading);
    }
    .preview-theme-wrapper h4 {
      font-family: var(--theme-font-heading);
      font-size: ${stylesObj.h4?.fontSize ?? 20}px;
      font-weight: ${stylesObj.h4?.fontWeight ?? 600};
      line-height: ${stylesObj.h4?.lineHeight ?? 1.3};
      letter-spacing: ${stylesObj.h4?.letterSpacing ?? 0}px;
      color: var(--theme-text-heading);
    }
    .preview-theme-wrapper p {
      color: var(--theme-text-body);
      line-height: ${stylesObj.body?.lineHeight ?? 1.6};
    }
  `, [p, t, b, e, stylesObj, safeTheme, defaultTheme]);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isSectionHidden = (section: any) => {
    if (!section || section.isHidden) return true;
    if (section.props?.visibility) {
      if (device === 'desktop' && section.props.visibility.desktop === false) return true;
      if (device === 'tablet' && section.props.visibility.tablet === false) return true;
      if (device === 'mobile' && section.props.visibility.mobile === false) return true;
    }
    return false;
  };

  useEffect(() => {
    if (selectedSectionId && sectionRefs.current[selectedSectionId]) {
      sectionRefs.current[selectedSectionId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedSectionId, overrideDevice, device]);

  const headerSection = (page.sections || []).find(s => s && s.type === 'Header');
  const hasHeader = !!headerSection;
  const showBottomNav = (settings as any).showBottomNav !== false;
  const bottomNavStyle = (settings as any).bottomNavStyle || 'pill';
  const bottomNavPosition = (settings as any).bottomNavPosition || 'floating';
  const bottomNavActiveColor = (settings as any).bottomNavActiveColor || 'var(--theme-primary, #6366f1)';
  const showBackToTop = (settings as any).showBackToTop !== false;
  const backToTopPosition = (settings as any).backToTopPosition || 'bottom-right';
  const backToTopShape = (settings as any).backToTopShape || 'circle';
  const bottomNavLinks = settings.bottomNavLinks || [
    { id: 'home', icon: 'Home', text: 'Home', link: '/' },
    { id: 'shop', icon: 'Grid', text: 'Shop', link: '/collections/all' },
    { id: 'cart', icon: 'ShoppingCart', text: 'Cart', link: '/cart' },
    { id: 'profile', icon: 'User', text: 'Profile', link: '/profile' }
  ];

  const IconMap: Record<string, React.FC<any>> = {
    Home, Search, ShoppingCart, User: UserIcon, Settings, Heart, Menu, Grid, List, Check
  };

  const selectedTarget = useEditorContextStore((s) => s.selectedTarget);
  const headerRows = useEditorContextStore((s) => s.headerRows);
  const presetPreview = useEditorContextStore((s) => s.presetPreview);
  const isPresetPreviewActive = Boolean(presetPreview?.isActive && presetPreview.editorType === 'header');
  const currentHeaderRows = isPresetPreviewActive && presetPreview?.previewRows
    ? (presetPreview.previewRows as any[])
    : (headerRows && headerRows.length > 0) ? headerRows : [];
  const editorHeaderRows = currentHeaderRows;
  const isSideRailActive = editorHeaderRows.some(
    (r) => r.isVisible !== false && r.type === 'primary-nav' && r.layout?.variantId === 'side-rail'
  );



  const headerTypes = ['AnnouncementBar', 'UtilityBar', 'Header', 'CategoryBar'];
  const footerTypes = [
    'FooterTrust',
    'FooterNewsletter',
    'FooterMain',
    'FooterSocial',
    'FooterBottom',
    'Footer',
    'FooterMenu',
    'FooterText',
    'FooterApp',
    'FooterContact',
    'FooterPayment',
    'FooterSeo',
    'FooterCategoryLinks',
  ];

  const validSections = (page.sections || []).filter(Boolean);
  const rawHeaderSections = validSections.filter(s => headerTypes.includes(s.type));
  // Map header row types to section types
  const headerSectionTypeByRow: Record<string, string> = {
    announcement: 'AnnouncementBar',
    utility: 'UtilityBar',
    'primary-nav': 'Header',
    'secondary-nav': 'CategoryBar',
  };

  // Derive header sections from currentHeaderRows across all editors and previews
  const headerSections: SectionData[] = currentHeaderRows
    .filter((row) => Boolean(headerSectionTypeByRow[row.type]) && row.isVisible !== false)
    .map((row) => {
      const sectionType = headerSectionTypeByRow[row.type];
      const sourceSection = rawHeaderSections.find((section) => section.type === sectionType);
      return {
        id: sourceSection?.id || row.id,
        type: sectionType,
        name: sourceSection?.name || row.name,
        props: sourceSection?.props || row.props || {},
        isHidden: row.isVisible === false,
      } as SectionData;
    });

  if (!headerSections.some((s) => s.type === 'Header')) {
    headerSections.push({
      id: 'header-main',
      type: 'Header',
      name: 'Header Navbar',
      props: {},
      isHidden: false,
    });
  }

  const footerSections: SectionData[] = [
    {
      id: 'footer-main',
      type: 'FooterMain',
      name: 'Footer',
      props: {},
      isHidden: false,
    },
  ];

  const bodySections = validSections.filter(
    (s) =>
      !headerTypes.includes(s.type) &&
      !footerTypes.includes(s.type) &&
      (!s.id?.startsWith('footer-') || s.type === 'Newsletter')
  );

  const orderedSections = [...headerSections, ...bodySections, ...footerSections];

  // For default/sub-pages, render header & footer components from global header and global footer
  const effectiveHeaderSections = [...headerSections];
  const effectiveFooterSections = [...footerSections];

  const isHomepage = page.id === 'landing-page';
  const isHomepageEditing = selectedPageId === 'landing-page';
  const isPages = activePanel === 'pages';
  // Only the Homepage in pages tab has individual draggable/addable/removable sections
  const isEditable = isPages && pagesNavLevel === 'page-detail' && isHomepageEditing;

  const selectHeaderSection = (section: any) => {
    const targetRow = currentHeaderRows.find(r =>
      (section.type === 'AnnouncementBar' && (r.type === 'announcement' || r.id.includes('announcement'))) ||
      (section.type === 'UtilityBar' && (r.type === 'utility' || r.id.includes('utility'))) ||
      (section.type === 'CategoryBar' && (r.type === 'secondary-nav' || r.id.includes('secondary') || r.id.includes('category'))) ||
      (section.type === 'Header' && (r.type === 'primary-nav' || r.id.includes('primary') || r.id === 'row-primary-nav'))
    );
    const rowId = targetRow ? targetRow.id : (
      section.type === 'AnnouncementBar' ? 'row-announcement' :
      section.type === 'UtilityBar' ? 'row-utility' :
      section.type === 'CategoryBar' ? 'row-secondary-nav' : 'row-primary-nav'
    );

    setSelectedSectionId(section.id);
    useEditorContextStore.getState().selectTarget({
      type: 'row',
      editorType: 'header',
      rowId,
    });
    setRightSidebarOpen(true);
    scrollPreviewToHeaderSection(rowId);
  };

  const handleHeaderSectionClick = (section: any) => {
    if (!isPages) return;
    const executeSwitch = () => {
      if (selectedPageId !== 'header-global') {
        navigateToPage('header-global', section.id);
        navigate(getEditorPath('header-global', section.id));
        useEditorContextStore.getState().setEditorType('header');
      }
      selectHeaderSection(section);
      if (section?.id && sectionRefs.current[section.id]) {
        sectionRefs.current[section.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    if (selectedPageId !== 'header-global') {
      requestEditorSwitch({
        targetPageId: 'header-global',
        targetSectionId: section?.id || 'header-main',
        targetName: 'Header Editor',
        onConfirm: executeSwitch,
      });
      return;
    }
    executeSwitch();
  };

  const handleFooterSectionClick = (section: any) => {
    if (!isPages) return;
    const executeSwitch = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', section?.id || 'footer-main');
        navigate(getEditorPath('footer-global', section?.id || 'footer-main'));
        useEditorContextStore.getState().setEditorType('footer');
      }
      setSelectedSectionId(section?.id || 'footer-main');
      useEditorContextStore.getState().selectTarget({ type: 'none' });
      setRightSidebarOpen(false);
    };

    if (selectedPageId !== 'footer-global') {
      requestEditorSwitch({
        targetPageId: 'footer-global',
        targetSectionId: section?.id || 'footer-main',
        targetName: 'Footer Editor',
        onConfirm: executeSwitch,
      });
      return;
    }
    executeSwitch();
  };

  const handleBodySectionClick = (section: any) => {
    if (!isPages) return;

    const targetPageId = isHomepage ? 'landing-page' : page.id;
    const executeSelect = () => {
      if (selectedPageId !== targetPageId || pagesNavLevel !== 'page-detail') {
        navigateToPage(targetPageId, section.id);
        navigate(getEditorPath(targetPageId, section.id));
        useEditorContextStore.getState().setEditorType('page');
      } else {
        navigate(getEditorPath(targetPageId, section.id), { replace: true });
      }
      setSelectedSectionId(section.id);
      useEditorContextStore.getState().selectTarget({ type: 'none' });
      setRightSidebarOpen(true);

      if (section?.id && sectionRefs.current[section.id]) {
        sectionRefs.current[section.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    if (selectedPageId !== targetPageId && pagesNavLevel === 'page-detail') {
      requestEditorSwitch({
        targetPageId,
        targetSectionId: section?.id,
        targetName: targetPageId === 'landing-page' ? 'Landing Page Editor' : page.name,
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  return (
    <div 
      className={`${styles.previewPage} preview-theme-wrapper`}
      style={{ 
        display: isSideRailActive ? 'flex' : 'block',
        minHeight: '100vh',
        paddingBottom: (device === 'mobile' && hasHeader && showBottomNav && bottomNavLinks.length > 0) ? '80px' : '0' 
      }}
    >
      <style>{themeStyles}</style>
      {safeTheme.customCss ? (
        <style id="custom-theme-css" dangerouslySetInnerHTML={{ __html: safeTheme.customCss }} />
      ) : null}

      {/* Docked Full-Height Side Rail Header on Left */}
      {isSideRailActive && (
        <aside
          id="editor-section-side-rail"
          data-section-id="header-main"
          data-section-type="Header"
          className={isPages ? styles.previewSectionWrapper : styles.previewSectionStatic}
          style={{
            width: '240px',
            minWidth: '240px',
            maxWidth: '240px',
            minHeight: '100vh',
            height: '100vh',
            position: 'sticky',
            top: 0,
            alignSelf: 'flex-start',
            zIndex: 40,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            cursor: isPages ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
          onClick={isPages ? () => {
            const headerSec = orderedSections.find(s => s.type === 'Header') || { id: 'header-main', type: 'Header', name: 'Header' };
            handleHeaderSectionClick(headerSec);
          } : undefined}
        >
          <HeaderNavbarSection
            device={device as 'desktop' | 'tablet' | 'mobile'}
            isEditorInteractive={isPages && selectedPageId === 'header-global'}
            useEditorModel={true}
            isSideRail={true}
          />
        </aside>
      )}

      {/* Main Page Content Area */}
      <div style={{ flex: 1, minWidth: 0, minHeight: '100%' }}>
        {isHomepage ? (
          orderedSections.map((section, index) => {
            if (isSectionHidden(section)) return null;
            if (isSideRailActive && section.type === 'Header') return null;

            const isHeader = headerTypes.includes(section.type);

            const storeIndex = page.sections.findIndex(s => s && s.id === section.id);
            const isFooter = footerTypes.includes(section.type) || (section.id?.startsWith('footer-') && section.type !== 'Newsletter');
            const isBody = !isHeader && !isFooter;

            let isCurrentlyActive = false;
            if (isPages && isRightSidebarOpen) {
              if (selectedPageId === 'header-global') {
                if (isHeader) {
                  const targetRowId = selectedTarget && 'rowId' in selectedTarget ? (selectedTarget as any).rowId : null;
                  if (targetRowId) {
                    if (section.type === 'AnnouncementBar' && (targetRowId === 'row-announcement' || targetRowId === 'announcement-bar' || targetRowId.includes('announcement'))) {
                      isCurrentlyActive = true;
                    } else if (section.type === 'UtilityBar' && (targetRowId === 'row-utility' || targetRowId === 'utility-bar' || targetRowId.includes('utility'))) {
                      isCurrentlyActive = true;
                    } else if (section.type === 'CategoryBar' && (targetRowId === 'row-secondary-nav' || targetRowId === 'category-bar' || targetRowId.includes('secondary') || targetRowId.includes('category'))) {
                      isCurrentlyActive = true;
                    } else if (section.type === 'Header' && (targetRowId === 'row-primary-nav' || targetRowId === 'header-main' || targetRowId.includes('primary'))) {
                      isCurrentlyActive = true;
                    }
                  } else {
                    isCurrentlyActive = selectedSectionId === section.id;
                  }
                }
              } else if (selectedPageId === 'footer-global') {
                if (isFooter) {
                  isCurrentlyActive = selectedSectionId === section.id || (Boolean(selectedTarget && 'rowId' in selectedTarget && (selectedTarget as any).rowId === section.id));
                }
              } else {
                isCurrentlyActive = selectedSectionId === section.id && !isHeader && !isFooter;
              }
            }

            const isHeaderEditor = isPages && selectedPageId === 'header-global';
            const isSectionInteractive = isPages;

            const handleClick = isSectionInteractive ? () => {
              if (isHeader) {
                handleHeaderSectionClick(section);
              } else if (isFooter) {
                handleFooterSectionClick(section);
              } else {
                handleBodySectionClick(section);
              }
            } : undefined;

            return (
              <div 
                key={section.id || `${section.type}-${index}`} 
                ref={(el) => { 
                  if (section?.id) {
                    sectionRefs.current[section.id] = el; 
                  }
                }}
                id={section.id ? `editor-section-${section.id}` : undefined}
                data-section-id={section.id}
                data-section-type={section.type}
                className={`${isSectionInteractive ? styles.previewSectionWrapper : styles.previewSectionStatic} ${isCurrentlyActive ? styles.activeSectionBorder : ''} ${section.type === 'Header' && section.props?.sticky !== false ? styles.previewSectionStickyHeader : ''}`}
                onClick={handleClick}
                style={{
                  cursor: isSectionInteractive ? 'pointer' : 'default',
                }}
              >
              {isEditable && storeIndex !== -1 && isBody && (
                <button 
                  type="button"
                  className={`${styles.hoverAddBtn} ${styles.hoverAddBtnTop}`}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setInsertIndex(storeIndex); 
                    setAddSectionWidgetOpen(true); 
                  }}
                  title="Add section above"
                  aria-label="Add section above"
                >
                  <Plus size={14} />
                </button>
              )}
              
              <SectionRenderer
                section={section}
                overrideDevice={overrideDevice}
                isEditorInteractive={isPages}
                useEditorModel={isHeader || isHeaderEditor}
              />
              
              {isEditable && storeIndex !== -1 && isBody && (
                <button 
                  type="button"
                  className={`${styles.hoverAddBtn} ${styles.hoverAddBtnBottom}`}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setInsertIndex(storeIndex + 1); 
                    setAddSectionWidgetOpen(true); 
                  }}
                  title="Add section below"
                  aria-label="Add section below"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          );
        })
      ) : (
        /* For Default Pages (Shop, Cart, Product Details, Legal, FAQ, etc.): Single Full Page Preview Wrapper! */
        <>
          {/* Header Sections for Subpages */}
          {effectiveHeaderSections.map((section, index) => {
            if (isSectionHidden(section)) return null;
            if (isSideRailActive && section.type === 'Header') return null;
            const isHeaderInteractive = isPages;
            return (
              <div 
                key={section.id || `header-${index}`}
                id={section.id ? `editor-section-${section.id}` : undefined}
                data-section-id={section.id}
                data-section-type={section.type}
                className={isHeaderInteractive ? styles.previewSectionClickable : styles.previewSectionStatic}
                onClick={isHeaderInteractive ? () => handleHeaderSectionClick(section) : undefined}
                style={{ cursor: isHeaderInteractive ? 'pointer' : 'default' }}
              >
                <SectionRenderer
                  section={section}
                  overrideDevice={overrideDevice}
                  isEditorInteractive={isPages}
                  useEditorModel={true}
                />
              </div>
            );
          })}

          {/* Full Page Body Wrapper */}
          <div 
            className={isPages ? styles.defaultPageFullWrapper : styles.previewSectionStatic}
            onClick={isPages ? () => {
              useLandingEditorStore.getState().setSelectedPageId(page.id);
              useLandingEditorStore.getState().setRightSidebarOpen(true);
            } : undefined}
            title={isPages ? `Click to edit ${page.name} options` : undefined}
            style={{ cursor: isPages ? 'pointer' : 'default' }}
          >
            {bodySections.map((section, index) => {
              if (isSectionHidden(section)) return null;
              return (
                <SectionRenderer key={section.id || `body-${section.type}-${index}`} section={section} overrideDevice={overrideDevice} />
              );
            })}
          </div>

          {/* Footer Sections */}
          {selectedPageId === 'footer-global' ? (
            <FooterTreeRenderer
              isEditorInteractive={true}
              device={(overrideDevice || device) as any}
            />
          ) : (
            effectiveFooterSections.map((section, index) => {
              if (isSectionHidden(section)) return null;
              const isFooterInteractive = isPages;
              return (
                <div 
                  key={section.id || `footer-${index}`}
                  className={isFooterInteractive ? styles.previewSectionClickable : styles.previewSectionStatic}
                  onClick={isFooterInteractive ? () => handleFooterSectionClick(section) : undefined}
                  style={{ cursor: isFooterInteractive ? 'pointer' : 'default' }}
                >
                  <SectionRenderer
                    section={section}
                    overrideDevice={overrideDevice}
                    isEditorInteractive={false}
                    useEditorModel={true}
                  />
                </div>
              );
            })
          )}
        </>
      )}
      </div>
      
      {device === 'mobile' && showBottomNav && bottomNavLinks && bottomNavLinks.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: bottomNavPosition === 'floating' ? '12px' : 0,
          left: bottomNavPosition === 'floating' ? '16px' : 0,
          right: bottomNavPosition === 'floating' ? '16px' : 0,
          backgroundColor: bottomNavStyle === 'blur' ? 'rgba(255, 255, 255, 0.88)' : (bottomNavStyle === 'minimal' ? 'transparent' : 'var(--theme-background, #ffffff)'),
          backdropFilter: bottomNavStyle === 'blur' ? 'blur(16px)' : undefined,
          WebkitBackdropFilter: bottomNavStyle === 'blur' ? 'blur(16px)' : undefined,
          border: bottomNavPosition === 'floating' ? '1px solid #e2e8f0' : undefined,
          borderTop: bottomNavPosition === 'docked' ? '1px solid #e2e8f0' : undefined,
          borderRadius: bottomNavPosition === 'floating' ? (bottomNavStyle === 'pill' ? '999px' : '16px') : '0',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: bottomNavPosition === 'floating' ? '10px 16px' : '12px 16px',
          paddingBottom: bottomNavPosition === 'docked' ? 'calc(12px + env(safe-area-inset-bottom))' : '10px',
          zIndex: 10000,
          boxShadow: bottomNavPosition === 'floating' ? '0 10px 30px rgba(0,0,0,0.12)' : '0 -4px 20px rgba(0,0,0,0.05)',
        }}>
          {bottomNavLinks.map((item: any, idx: number) => {
            const Icon = (item?.icon && IconMap[item.icon]) ? IconMap[item.icon] : Home;
            const isActive = idx === 0;
            return (
              <a 
                key={item.id || item.text || Math.random()} 
                href={item.link || '#'} 
                onClick={(e) => e.preventDefault()}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  color: isActive ? bottomNavActiveColor : 'var(--theme-text)',
                  opacity: isActive ? 1 : 0.7,
                  flex: 1,
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <Icon size={20} />
                  {item.badge && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-8px',
                      fontSize: '9px',
                      fontWeight: 700,
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      borderRadius: '999px',
                      padding: '1px 5px',
                      lineHeight: '12px',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500 }}>{item.text}</span>
              </a>
            );
          })}
        </div>
      )}

      {/* Live Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: (settings as any).smoothScroll !== false ? 'smooth' : 'auto' });
            // Also scroll any scrollable editor container
            document.querySelector('.previewPage')?.parentElement?.scrollTo({ top: 0, behavior: (settings as any).smoothScroll !== false ? 'smooth' : 'auto' });
          }}
          style={{
            position: 'fixed',
            [backToTopPosition.includes('left') ? 'left' : 'right']: '24px',
            bottom: (device === 'mobile' && showBottomNav && bottomNavLinks.length > 0) ? '88px' : '24px',
            width: backToTopShape === 'pill' ? 'auto' : '42px',
            height: '42px',
            padding: backToTopShape === 'pill' ? '0 14px' : '0',
            borderRadius: backToTopShape === 'circle' ? '50%' : (backToTopShape === 'pill' ? '999px' : '8px'),
            backgroundColor: 'var(--theme-primary, #1e293b)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            zIndex: 9998,
            transition: 'transform 0.2s ease, opacity 0.2s ease',
          }}
          title="Scroll to top"
        >
          <ArrowUp size={18} />
          {backToTopShape === 'pill' && <span style={{ fontSize: '12px', fontWeight: 600 }}>Top</span>}
        </button>
      )}

      {/* Live Floating WhatsApp Button with Exact Official Icon and Variants */}
      {(() => {
        const whatsappPhone = settings.whatsappWidgetPhone || settings.whatsappNumber;
        const showWhatsApp = settings.whatsappWidgetEnabled !== false && Boolean(whatsappPhone);
        if (!showWhatsApp) return null;

        const whatsappPosition = settings.whatsappWidgetPosition || 'right';
        const whatsappVertical = settings.whatsappVerticalPosition || 'bottom';
        const whatsappOffset = settings.whatsappPixelOffset || 24;
        const whatsappVariant = settings.whatsappWidgetVariant || 'round';

        return (
          <div
            style={{
              position: 'fixed',
              [whatsappPosition === 'left' ? 'left' : 'right']: `${whatsappOffset}px`,
              [whatsappVertical === 'middle' ? 'top' : 'bottom']: whatsappVertical === 'middle'
                ? '50%'
                : (device === 'mobile' && showBottomNav && bottomNavLinks.length > 0)
                  ? `${whatsappOffset + 64}px`
                  : `${whatsappOffset}px`,
              transform: whatsappVertical === 'middle' ? 'translateY(-50%)' : 'none',
              zIndex: 9999,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title={`Chat on WhatsApp with ${settings.storeName || 'Shoum'}`}
          >
            {whatsappVariant === 'pill' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  boxShadow: '0 4px 16px rgba(37, 211, 102, 0.45)',
                  fontWeight: 600,
                  fontSize: '13px',
                  userSelect: 'none',
                }}
              >
                <WhatsAppSvg size={20} />
                <span>{settings.whatsappPillText || 'Chat on WhatsApp'}</span>
              </div>
            ) : whatsappVariant === 'glow' ? (
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-6px',
                  borderRadius: '50%',
                  background: 'rgba(37, 211, 102, 0.35)',
                  animation: 'waRadarPulse 2s infinite',
                  pointerEvents: 'none',
                }} />
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: '#25D366',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(37, 211, 102, 0.5)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <WhatsAppSvg size={28} />
                </div>
              </div>
            ) : whatsappVariant === 'badge' ? (
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: '#25D366',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
                  }}
                >
                  <WhatsAppSvg size={26} />
                </div>
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    border: '2px solid #ffffff',
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#25D366',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(37, 211, 102, 0.45)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <WhatsAppSvg size={28} />
              </div>
            )}

            <style>{`
              @keyframes waRadarPulse {
                0% { transform: scale(0.95); opacity: 0.8; }
                70% { transform: scale(1.35); opacity: 0; }
                100% { transform: scale(1.35); opacity: 0; }
              }
            `}</style>
          </div>
        );
      })()}




      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
