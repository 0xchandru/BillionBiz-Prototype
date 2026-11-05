import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getEditorPath, resolveHeaderRowId, resolveFooterRowId } from '../../components/editor/utils/editorNavigation';
import styles from './EditorLayout.module.css';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore, type PageData } from '../../store/siteStore';
import type { EditorPanelType } from '../../store/landingEditorStore';
import { useEditorContextStore } from '../../store/editorContextStore';
import { scrollPreviewToHeaderSection, scrollPreviewToFooterSection, scrollPreviewToSection } from '../../components/editor/utils/previewScroll';

const EditorTopBar = lazy(() => import('../../components/editor/EditorTopBar').then((module) => ({ default: module.EditorTopBar })));
const EditorLeftSidebar = lazy(() => import('../../components/editor/EditorLeftSidebar').then((module) => ({ default: module.EditorLeftSidebar })));
const EditorRightSidebar = lazy(() => import('../../components/editor/EditorRightSidebar').then((module) => ({ default: module.EditorRightSidebar })));
const EditorCanvas = lazy(() => import('../../components/editor/EditorCanvas').then((module) => ({ default: module.EditorCanvas })));
const EditorSwitchConfirmModal = lazy(() => import('../../components/editor/ui/EditorSwitchConfirmModal').then((module) => ({ default: module.EditorSwitchConfirmModal })));
const FooterComponentPicker = lazy(() => import('../../components/editor/engine/FooterComponentPicker').then((module) => ({ default: module.FooterComponentPicker })));

const EditorWorkspaceLoading: React.FC = () => (
  <div role="status" aria-label="Loading store editor" style={{ height: '100%', minHeight: 320, display: 'grid', gridTemplateColumns: '280px minmax(0,1fr) 320px', gap: 12, padding: 12, background: '#f1f5f9' }}>
    <div style={{ borderRadius: 12, background: 'linear-gradient(90deg,#e2e8f0,#f8fafc,#e2e8f0)', backgroundSize: '200% 100%', animation: 'bbiz-skeleton 1.4s ease infinite' }} />
    <div style={{ borderRadius: 12, background: 'linear-gradient(90deg,#e2e8f0,#f8fafc,#e2e8f0)', backgroundSize: '200% 100%', animation: 'bbiz-skeleton 1.4s ease infinite' }} />
    <div style={{ borderRadius: 12, background: 'linear-gradient(90deg,#e2e8f0,#f8fafc,#e2e8f0)', backgroundSize: '200% 100%', animation: 'bbiz-skeleton 1.4s ease infinite' }} />
  </div>
);

const resolveHeaderRowIdFromSection = resolveHeaderRowId;
const resolveFooterRowIdFromSection = resolveFooterRowId;

const resolvePageId = (rawId: string, pages: PageData[]): string | null => {
  if (!rawId) return null;

  if (['header-global', 'footer-global', 'cookie-consent-global', 'toaster-global'].includes(rawId)) {
    return rawId;
  }

  const aliases: Record<string, string> = {
    'products-list': 'shop-page',
    'products': 'shop-page',
    'shop': 'shop-page',
    'product-details': 'product-details-page',
    'refund-policy-page': 'return-policy-page',
    'refund-policy': 'return-policy-page',
    'returns': 'return-policy-page',
    'landing': 'landing-page',
    'home': 'landing-page',
    'header': 'header-global',
    'header-page': 'header-global',
    'footer': 'footer-global',
    'footer-page': 'footer-global',
    'cookie-consent': 'cookie-consent-global',
    'cookie': 'cookie-consent-global',
    'consent': 'cookie-consent-global',
    'toaster': 'toaster-global',
    'toast': 'toaster-global',
  };

  const cleanId = rawId ? rawId.toLowerCase().replace(/\/+$/, '') : '';
  const target = aliases[cleanId] || cleanId;

  if (['header-global', 'footer-global', 'cookie-consent-global', 'toaster-global'].includes(target)) {
    return target;
  }

  // 1. Direct ID match
  const matchId = pages.find(p => p.id === target);
  if (matchId) return matchId.id;

  // 2. ID with -page suffix
  const matchIdSuffix = pages.find(p => p.id === `${target}-page`);
  if (matchIdSuffix) return matchIdSuffix.id;

  // 3. Canonical route match. Backend pages use database UUIDs, while
  // editor deep links still use stable product-facing aliases.
  const routeAliases: Record<string, string> = {
    'landing-page': '/',
    'shop-page': '/shop',
    'product-details-page': '/products',
    'collections-page': '/collections',
    'cart-page': '/cart',
    'checkout-page': '/checkout',
    'account-page': '/account',
    'booking-page': '/booking',
    'contact-page': '/contact',
    'privacy-policy-page': '/policies/privacy',
    'terms-conditions-page': '/policies/terms',
    'return-policy-page': '/policies/refund',
    'refund-policy-page': '/policies/refund',
  };
  const route = target.startsWith('/') ? target : routeAliases[target];
  if (route) {
    const matchPath = pages.find((page) => page.path.replace(/\/+$/, '') === route.replace(/\/+$/, '') || (route === '/' && page.path === '/'));
    if (matchPath) return matchPath.id;
  }

  // 4. Type match
  const matchType = pages.find(p => p.type === target || p.type === target.replace(/-page$/, ''));
  if (matchType) return matchType.id;

  // 5. Normalized path or name match
  const matchName = pages.find(p => p.name.toLowerCase() === target.toLowerCase() || p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === target.toLowerCase().replace(/[^a-z0-9]/g, ''));
  if (matchName) return matchName.id;

  return null;
};

const VALID_TABS: EditorPanelType[] = ['pages', 'brand', 'design', 'growth', 'settings', 'store-brand', 'design-experience', 'seo-growth'];

const EditorLayout: React.FC = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const [searchParams] = useSearchParams();
  const pageIdParam = searchParams.get('pageId');
  const sectionIdParam = searchParams.get('sectionId');
  const tabParam = (searchParams.get('tab') || tab || 'pages').toLowerCase().replace(/\/+$/, '');

  const { setActivePanel, setSelectedPageId, setRightSidebarOpen, isFullPageMode, isRightSidebarOpen, navigateToPage, pendingEditorSwitch, setPendingEditorSwitch } = useLandingEditorStore();
  const lastProcessedUrlRef = useRef<string>('');

  // Hydrate Store Editor with real database tenant pages, theme, brand, and settings
  useEffect(() => {
    useSiteStore.getState().fetchLiveStoreData();
  }, []);

  useEffect(() => {
    const currentUrlKey = `${tabParam}|${pageIdParam || ''}|${sectionIdParam || ''}`;
    if (lastProcessedUrlRef.current === currentUrlKey) {
      return;
    }
    lastProcessedUrlRef.current = currentUrlKey;

    const pages = useSiteStore.getState().pages;

    // Map legacy and new tab names to canonical tabs
    const tabAliases: Record<string, EditorPanelType> = {
      'editor': 'pages',
      'pages': 'pages',
      'brand': 'brand',
      'store-brand': 'brand',
      'design': 'design',
      'design-experience': 'design',
      'theme': 'design',
      'seo-growth': 'growth',
      'growth': 'growth',
      'settings': 'settings',
    };

    const isKnownTab = Object.prototype.hasOwnProperty.call(tabAliases, tabParam);
    const resolvedTab: EditorPanelType = tabAliases[tabParam] || 'pages';

    if (!pageIdParam && !isKnownTab) {
      const pathPageId = resolvePageId(tabParam, pages);
      if (pathPageId) {
        const storeState = useLandingEditorStore.getState();
        const isAlreadyOnThisPage = storeState.selectedPageId === pathPageId && storeState.pagesNavLevel === 'page-detail';

        if (isAlreadyOnThisPage) {
          if (sectionIdParam && sectionIdParam !== storeState.selectedSectionId) {
            useLandingEditorStore.getState().setSelectedSectionId(sectionIdParam);
            if (pathPageId === 'header-global') {
              const headerRows = useEditorContextStore.getState().headerRows;
              const targetRowId = resolveHeaderRowIdFromSection(sectionIdParam, headerRows);
              useEditorContextStore.getState().selectTarget({
                type: 'row',
                editorType: 'header',
                rowId: targetRowId,
              });
            } else if (pathPageId === 'footer-global') {
              const footerRows = useEditorContextStore.getState().footerRows;
              const targetRowId = resolveFooterRowIdFromSection(sectionIdParam, footerRows);
              useEditorContextStore.getState().selectTarget({
                type: 'row',
                editorType: 'footer',
                rowId: targetRowId,
              });
            }
            setRightSidebarOpen(true);
          }
          return;
        }

        setActivePanel('pages');
        setSelectedPageId(pathPageId);
        const effectiveSectionId = sectionIdParam || null;
        navigateToPage(pathPageId, effectiveSectionId);
        useEditorContextStore.getState().setEditorType(pathPageId === 'header-global' ? 'header' : pathPageId === 'footer-global' ? 'footer' : 'page');
        const currentTarget = useEditorContextStore.getState().selectedTarget;
        if (currentTarget?.type !== 'element') {
          if (pathPageId === 'header-global') {
            const headerRows = useEditorContextStore.getState().headerRows;
            const targetRowId = resolveHeaderRowIdFromSection(effectiveSectionId, headerRows);
            useEditorContextStore.getState().selectTarget({
              type: 'row',
              editorType: 'header',
              rowId: targetRowId,
            });
          } else if (pathPageId === 'footer-global') {
            const footerRows = useEditorContextStore.getState().footerRows;
            const targetRowId = resolveFooterRowIdFromSection(effectiveSectionId, footerRows);
            useEditorContextStore.getState().selectTarget({
              type: 'row',
              editorType: 'footer',
              rowId: targetRowId,
            });
          } else {
            useEditorContextStore.getState().selectTarget({ type: 'none' });
          }
        }
        if (effectiveSectionId) {
          useLandingEditorStore.getState().setSelectedSectionId(effectiveSectionId);
        }
        const shouldOpenRight = Boolean(
          effectiveSectionId ||
          pathPageId === 'header-global' ||
          pathPageId === 'footer-global' ||
          pathPageId === 'cookie-consent-global' ||
          pathPageId === 'toaster-global' ||
          (pathPageId && pathPageId !== 'landing-page')
        );
        setRightSidebarOpen(shouldOpenRight);
        return;
      }
    }

    if (pageIdParam && resolvedTab === 'pages') {
      const resolved = resolvePageId(pageIdParam, pages);
      if (resolved) {
        const storeState = useLandingEditorStore.getState();
        const isAlreadyOnThisPage = storeState.selectedPageId === resolved && storeState.pagesNavLevel === 'page-detail';

        if (isAlreadyOnThisPage) {
          if (sectionIdParam && sectionIdParam !== storeState.selectedSectionId) {
            useLandingEditorStore.getState().setSelectedSectionId(sectionIdParam);
            if (resolved === 'header-global') {
              const headerRows = useEditorContextStore.getState().headerRows;
              const targetRowId = resolveHeaderRowIdFromSection(sectionIdParam, headerRows);
              useEditorContextStore.getState().selectTarget({
                type: 'row',
                editorType: 'header',
                rowId: targetRowId,
              });
            } else if (resolved === 'footer-global') {
              const footerRows = useEditorContextStore.getState().footerRows;
              const targetRowId = resolveFooterRowIdFromSection(sectionIdParam, footerRows);
              useEditorContextStore.getState().selectTarget({
                type: 'row',
                editorType: 'footer',
                rowId: targetRowId,
              });
            }
            setRightSidebarOpen(true);
          }
          return;
        }

        setActivePanel('pages');
        setSelectedPageId(resolved);
        const effectiveSectionId = sectionIdParam || null;
        useEditorContextStore.getState().setEditorType(resolved === 'header-global' ? 'header' : resolved === 'footer-global' ? 'footer' : 'page');
        const currentTarget = useEditorContextStore.getState().selectedTarget;
        if (currentTarget?.type !== 'element') {
          if (resolved === 'header-global') {
            const headerRows = useEditorContextStore.getState().headerRows;
            const targetRowId = resolveHeaderRowIdFromSection(effectiveSectionId, headerRows);
            useEditorContextStore.getState().selectTarget({
              type: 'row',
              editorType: 'header',
              rowId: targetRowId,
            });
          } else if (resolved === 'footer-global') {
            const footerRows = useEditorContextStore.getState().footerRows;
            const targetRowId = resolveFooterRowIdFromSection(effectiveSectionId, footerRows);
            useEditorContextStore.getState().selectTarget({
              type: 'row',
              editorType: 'footer',
              rowId: targetRowId,
            });
          } else {
            useEditorContextStore.getState().selectTarget({ type: 'none' });
          }
        }
        if (storeState.selectedPageId !== resolved || storeState.pagesNavLevel !== 'page-detail' || (effectiveSectionId && effectiveSectionId !== storeState.selectedSectionId)) {
          navigateToPage(resolved, effectiveSectionId);
        }
        if (effectiveSectionId) {
          useLandingEditorStore.getState().setSelectedSectionId(effectiveSectionId);
        }
        const shouldOpenResolvedRight = Boolean(
          effectiveSectionId ||
          resolved === 'header-global' ||
          resolved === 'footer-global' ||
          resolved === 'cookie-consent-global' ||
          resolved === 'toaster-global' ||
          (resolved && resolved !== 'landing-page')
        );
        setRightSidebarOpen(shouldOpenResolvedRight);
        return;
      }
    }

    if (VALID_TABS.includes(resolvedTab)) {
      setActivePanel(resolvedTab);
      if (resolvedTab === 'design' || resolvedTab === 'design-experience') {
        setSelectedPageId('landing-page');
      }
      if (resolvedTab === 'pages' && !pageIdParam) {
        if (sectionIdParam) {
          const isHeader = ['header-main', 'announcement-bar', 'utility-bar', 'category-bar'].includes(sectionIdParam) ||
            sectionIdParam.startsWith('header-') || sectionIdParam.startsWith('row-announcement') ||
            sectionIdParam.startsWith('row-utility') || sectionIdParam.startsWith('row-secondary-nav') ||
            sectionIdParam.startsWith('row-primary-nav');
          const isFooter = sectionIdParam.startsWith('footer-');
          if (isHeader) {
            navigate(getEditorPath('header-global', sectionIdParam), { replace: true });
            return;
          } else if (isFooter) {
            navigate(getEditorPath('footer-global', sectionIdParam), { replace: true });
            return;
          } else {
            navigate(getEditorPath('landing-page', sectionIdParam), { replace: true });
            return;
          }
        }
        const state = useLandingEditorStore.getState();
        if (state.pagesNavLevel !== 'list') {
          state.navigateToPagesList();
        }
      }
    } else {
      setActivePanel('pages');
      if (!pageIdParam) {
        if (sectionIdParam) {
          navigate(getEditorPath('header-global', sectionIdParam), { replace: true });
          return;
        }
        const state = useLandingEditorStore.getState();
        if (state.pagesNavLevel !== 'list') {
          state.navigateToPagesList();
        }
      }
    }
  }, [tabParam, pageIdParam, sectionIdParam, setActivePanel, setSelectedPageId, setRightSidebarOpen, navigateToPage, navigate]);

  return (
    <div className={`${styles.editorWrapper} ${isFullPageMode ? styles.focusMode : ''}`}>
      <Suspense fallback={<EditorWorkspaceLoading />}>
        <EditorTopBar />
        <div className={styles.mainEditor}>
          {!isFullPageMode && <EditorLeftSidebar />}
          <EditorCanvas />
          {!isFullPageMode && isRightSidebarOpen && <EditorRightSidebar />}
        </div>
        {pendingEditorSwitch && (
          <EditorSwitchConfirmModal
            currentName={pendingEditorSwitch.currentName}
            targetName={pendingEditorSwitch.targetName}
            onCancel={() => setPendingEditorSwitch(null)}
            onConfirm={() => {
              const confirmAction = pendingEditorSwitch.onConfirm;
              const targetPage = pendingEditorSwitch.targetPageId;
              const targetSection = pendingEditorSwitch.targetSectionId;
              setPendingEditorSwitch(null);
              confirmAction();
              if (targetPage === 'footer-global') {
                scrollPreviewToFooterSection(targetSection || 'footer-main');
              } else if (targetPage === 'header-global') {
                scrollPreviewToHeaderSection(targetSection || 'header-main');
              } else if (targetSection) {
                scrollPreviewToSection(targetSection);
              }
            }}
          />
        )}
        <FooterComponentPicker />
      </Suspense>
    </div>
  );
};

export default EditorLayout;
