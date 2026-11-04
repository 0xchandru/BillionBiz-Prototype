import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Undo, Redo, Monitor, Tablet, Smartphone, Columns,
  Sparkles, Save, ExternalLink, UploadCloud, ChevronDown,
  CheckCircle2, Palette, Settings, Store, History,
  Maximize2, Minimize2, RotateCcw, Library
} from 'lucide-react';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import {
  useSiteStore,
  isHeaderComponent,
  isFooterComponent,
  isHomepageBodySection
} from '../../store/siteStore';
import { useThemeHistoryStore } from '../../store/themeHistoryStore';
import { CommandPaletteModal } from './topbar/CommandPaletteModal';
import { AiAssistantDrawer } from './topbar/AiAssistantDrawer';
import { GuidedSetupModal } from './topbar/GuidedSetupModal';
import { PublishModal } from './topbar/PublishModal';
import { HistoryModal } from './topbar/HistoryModal';
import { HealthScorePopovers } from './topbar/HealthScorePopovers';
import { PageSelectorDropdown } from './topbar/PageSelectorDropdown';
import { MoreOptionsMenu } from './topbar/MoreOptionsMenu';
import { useEditorContextStore } from '../../store/editorContextStore';
import { useAuthStore } from '../../store/authStore';
import { getStoreUrl } from '../../utils/subdomain';
import { AuditButton } from './topbar/AuditButton';
import { VersionCompareModal } from './engine/VersionCompareModal';
import styles from './topbar/topbar.module.css';

export const EditorTopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    device,
    setDevice,
    activePanel,
    selectedPageId,
    pagesNavLevel,
    isFullPageMode,
    setFullPageMode,
    setActivePanel,
    isRightSidebarOpen,
    setRightSidebarOpen,
    setAddSectionWidgetOpen,
  } = useLandingEditorStore();

  const {
    pages,
    theme,
    settings,
    undoTheme,
    redoTheme,
    hasUnsavedChanges,
    markSaved,
    lastPublishedSnapshots,
    savePageDraftToBackend,
    saveThemeToBackend,
    saveSettingsToBackend,
  } = useSiteStore();
  const { canUndo, canRedo } = useThemeHistoryStore();
  const { storeSlug } = useAuthStore();

  // Dialog & Drawer States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isVersionCompareOpen, setIsVersionCompareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activePage = pages.find((p) => p.id === selectedPageId) || pages[0];
  const isPages = activePanel === 'pages';
  const isPagesList = isPages && pagesNavLevel === 'list';
  const isPageEditor = isPages && pagesNavLevel === 'page-detail';
  const isTheme = activePanel === 'design' || activePanel === 'design-experience';
  const isStoreBrand = activePanel === 'brand' || activePanel === 'store-brand';
  const isSettings = activePanel === 'settings';
  const isLandingPageEditor =
    !location.pathname.startsWith('/editor/pages') &&
    (location.pathname.startsWith('/editor/landing-page') || (isPageEditor && activePage?.path === '/'));

  // Helper to determine status and baseline per editing scope
  const getPublishScopeState = () => {
    const landingPage = pages.find((p) => p.path === '/') || pages.find((p) => p.id === 'landing-page') || pages[0];

    if (selectedPageId === 'header-global') {
      const currentSections = (landingPage?.sections || []).filter(isHeaderComponent);
      const snapshot = lastPublishedSnapshots?.['header-global'];
      const hasBaseline = Boolean(snapshot?.publishedAt && Array.isArray(snapshot?.sections));
      const hasUnpublished = Boolean(
        !hasBaseline ||
        JSON.stringify(currentSections) !== JSON.stringify(snapshot?.sections || [])
      );
      const isLive = Boolean(hasBaseline && !hasUnpublished && !hasUnsavedChanges);
      const isSavedDraft = Boolean(!isLive && !hasUnsavedChanges);
      return { isLive, isSavedDraft, hasUnpublished, name: 'Global Header' };
    }

    if (selectedPageId === 'footer-global') {
      const currentSections = (landingPage?.sections || []).filter(isFooterComponent);
      const snapshot = lastPublishedSnapshots?.['footer-global'];
      const hasBaseline = Boolean(snapshot?.publishedAt && Array.isArray(snapshot?.sections));
      const hasUnpublished = Boolean(
        !hasBaseline ||
        JSON.stringify(currentSections) !== JSON.stringify(snapshot?.sections || [])
      );
      const isLive = Boolean(hasBaseline && !hasUnpublished && !hasUnsavedChanges);
      const isSavedDraft = Boolean(!isLive && !hasUnsavedChanges);
      return { isLive, isSavedDraft, hasUnpublished, name: 'Global Footer' };
    }

    if (selectedPageId === 'landing-page' || pages.find((page) => page.id === selectedPageId)?.path === '/') {
      const currentSections = (landingPage?.sections || []).filter(isHomepageBodySection);
      const snapshot = landingPage?.lastPublishedSnapshot ||
        lastPublishedSnapshots?.[landingPage?.id || ''] ||
        lastPublishedSnapshots?.['landing-page'];
      const hasBaseline = Boolean(snapshot?.publishedAt && Array.isArray(snapshot?.sections));
      const hasUnpublished = Boolean(
        !hasBaseline ||
        JSON.stringify(currentSections) !== JSON.stringify(snapshot?.sections || []) ||
        JSON.stringify(landingPage?.pageProps || {}) !== JSON.stringify(snapshot?.pageProps || {})
      );
      const isLive = Boolean(landingPage?.status === 'published' && hasBaseline && !hasUnpublished && !hasUnsavedChanges);
      const isSavedDraft = Boolean(!isLive && !hasUnsavedChanges);
      return { isLive, isSavedDraft, hasUnpublished, name: 'Homepage' };
    }

    const targetPage = pages.find((p) => p.id === selectedPageId) || landingPage;
    const snapshot = targetPage?.lastPublishedSnapshot || (targetPage ? lastPublishedSnapshots?.[targetPage.id] : null);
    const hasBaseline = Boolean(snapshot?.publishedAt && Array.isArray(snapshot?.sections));
    const hasUnpublished = Boolean(
      !hasBaseline ||
      (targetPage && (
        JSON.stringify(targetPage.sections) !== JSON.stringify(snapshot?.sections) ||
        JSON.stringify(targetPage.pageProps || {}) !== JSON.stringify(snapshot?.pageProps || {})
      ))
    );
    const isLive = Boolean(targetPage?.status === 'published' && hasBaseline && !hasUnpublished && !hasUnsavedChanges);
    const isSavedDraft = Boolean(!isLive && !hasUnsavedChanges);
    return { isLive, isSavedDraft, hasUnpublished, name: targetPage?.name || 'Page' };
  };

  const { isLive, isSavedDraft, name: activeScopeName } = getPublishScopeState();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const [isSaving, setIsSaving] = useState(false);
  const landingPage = pages.find((page) => page.path === '/') ||
    pages.find((page) => page.id === 'landing-page') ||
    pages[0];

  const getCurrentDraftFingerprint = useCallback(() => {
    const state = useSiteStore.getState();
    return JSON.stringify({
      pages: state.pages.map((page) => ({
        id: page.id,
        sections: page.sections,
        pageProps: page.pageProps
      })),
      theme: state.theme,
      settings: state.settings
    });
  }, []);

  const persistCurrentScope = useCallback(async () => {
    if (isTheme) {
      await saveThemeToBackend(theme);
      return;
    }

    if (isStoreBrand || isSettings) {
      await saveSettingsToBackend(settings);
      return;
    }

    if (isPageEditor) {
      if (selectedPageId === 'header-global' || selectedPageId === 'footer-global') {
        const editorContext = useEditorContextStore.getState();
        if (selectedPageId === 'header-global') {
          editorContext.syncHeaderToSiteStore();
        } else {
          editorContext.syncFooterToSiteStore();
        }
        if (!landingPage) throw new Error('The home page is not available in the current store.');
        await savePageDraftToBackend(landingPage.id);
        return;
      }

      const page = pages.find((item) => item.id === selectedPageId) || landingPage;
      if (!page) throw new Error('The selected page is not available in the current store.');
      await savePageDraftToBackend(page.id);
      return;
    }

    if (hasUnsavedChanges) {
      throw new Error('Select a page, brand, design or settings area before saving.');
    }
  }, [
    isTheme,
    isStoreBrand,
    isSettings,
    isPageEditor,
    selectedPageId,
    landingPage,
    pages,
    theme,
    settings,
    hasUnsavedChanges,
    saveThemeToBackend,
    saveSettingsToBackend,
    savePageDraftToBackend
  ]);

  const handleSave = async () => {
    if (isSaving) return;
    if (!hasUnsavedChanges) {
      showToast('All changes are already saved');
      return;
    }

    const savedFingerprint = getCurrentDraftFingerprint();
    setIsSaving(true);
    try {
      await persistCurrentScope();
      if (getCurrentDraftFingerprint() === savedFingerprint) {
        markSaved();
        showToast(`${activeScopeName} saved successfully`);
      } else {
        showToast('Saved the current snapshot. Newer edits are still pending.');
      }
    } catch (error: any) {
      showToast(`Save failed: ${error?.message || 'Please retry.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Autosave persists the active editor scope. The dirty state is cleared only
  // after the server confirms every requested write.
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving) return;

    const autoSaveTimer = setTimeout(async () => {
      const savedFingerprint = getCurrentDraftFingerprint();
      setIsSaving(true);
      try {
        await persistCurrentScope();
        if (getCurrentDraftFingerprint() === savedFingerprint) {
          markSaved();
          showToast(`${activeScopeName} auto-saved`);
        } else {
          showToast('Auto-save completed. Newer edits are still pending.');
        }
      } catch (error: any) {
        showToast(`Auto-save failed: ${error?.message || 'Changes remain unsaved.'}`);
      } finally {
        setIsSaving(false);
      }
    }, 4000);

    return () => clearTimeout(autoSaveTimer);
  }, [
    hasUnsavedChanges,
    pages,
    theme,
    settings,
    markSaved,
    isTheme,
    isStoreBrand,
    isSettings,
    isPageEditor,
    activeScopeName,
    selectedPageId,
    isSaving,
    persistCurrentScope,
    getCurrentDraftFingerprint
  ]);

  const editorEngineStore = useEditorContextStore();
  const isGlobalHeaderOrFooter = selectedPageId === 'header-global' || selectedPageId === 'footer-global';

  // Keyboard Shortcuts: Ctrl/Cmd+K for Command Palette, Ctrl+S for Save, Ctrl+Z/Y for undo/redo, Alt+1..4 for tabs, Escape for panels/modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().includes('MAC');
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isAiDrawerOpen) {
          setIsAiDrawerOpen(false);
          return;
        }
        if (isHistoryModalOpen) {
          setIsHistoryModalOpen(false);
          return;
        }
        if (isPublishModalOpen) {
          setIsPublishModalOpen(false);
          return;
        }
        if (isSetupModalOpen) {
          setIsSetupModalOpen(false);
          return;
        }
        if (isRightSidebarOpen) {
          setRightSidebarOpen(false);
          return;
        }
      }

      // Quick tab switching: Alt+1 (Pages), Alt+2 (Brand), Alt+3 (Design), Alt+4 (Settings)
      if (e.altKey && !modifier && !e.shiftKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActivePanel('pages');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          setActivePanel('brand');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          setActivePanel('design');
          return;
        }
        if (e.key === '4') {
          e.preventDefault();
          setActivePanel('settings');
          return;
        }
      }

      if (modifier && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName?.toLowerCase();
        if (tagName === 'textarea') return;
        if (tagName === 'input') {
          const inputType = (target as HTMLInputElement).type?.toLowerCase();
          if (['text', 'password', 'search', 'email', 'url', 'number'].includes(inputType)) {
            return;
          }
        }
      }

      if (modifier) {
        if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleSave();
          return;
        }

        if ((e.key.toLowerCase() === 'y' && !e.shiftKey) || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
          e.preventDefault();
          if (isTheme && canRedo) {
            redoTheme();
            showToast('Redone design change');
          } else if (isGlobalHeaderOrFooter) {
            editorEngineStore.redo();
            showToast(`Redone ${selectedPageId === 'header-global' ? 'header' : 'footer'} edit`);
          }
          return;
        }

        if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
          e.preventDefault();
          if (isTheme && canUndo) {
            undoTheme();
            showToast('Undone design change');
          } else if (isGlobalHeaderOrFooter) {
            editorEngineStore.undo();
            showToast(`Undone ${selectedPageId === 'header-global' ? 'header' : 'footer'} edit`);
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTheme, canUndo, canRedo, undoTheme, redoTheme, hasUnsavedChanges, isSettings, isStoreBrand,
    isCommandPaletteOpen, isAiDrawerOpen, isHistoryModalOpen, isPublishModalOpen, isSetupModalOpen,
    isRightSidebarOpen, setRightSidebarOpen, setActivePanel, isGlobalHeaderOrFooter, selectedPageId, editorEngineStore
  ]);

  const handlePublish = () => {
    // The backend publishes one atomic whole-store snapshot. Never mark a
    // page/header/footer as live only in local Zustand state.
    setIsPublishModalOpen(true);
  };

  const handlePreview = () => {
    const previewPath = activePage?.path || '/';
    const slug = storeSlug || localStorage.getItem('billionbiz_store_slug') || 'my-store';
    const pathSuffix = previewPath === '/' ? '' : previewPath;
    const previewUrl = getStoreUrl(slug, pathSuffix);

    window.open(previewUrl, '_blank');
    showToast(`Opening storefront preview (${slug})...`);
  };

  const handleStatusBadgeClick = () => {
    if (isLive) {
      showToast('This release remains live until a new whole-store publication replaces it.');
      return;
    }
    setIsPublishModalOpen(true);
  };

  const authStoreName = useAuthStore((s) => s.storeName);
  const businessName = settings.storeName || settings.siteName || authStoreName || (typeof window !== 'undefined' ? localStorage.getItem('billionbiz_store_name') : null) || 'BillionBiz Store';
  const cleanStoreName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'store';
  const storeUrl = settings.storeUrl || settings.storeDomain || getStoreUrl(cleanStoreName);

  const undoDisabled = isTheme
    ? !canUndo
    : isGlobalHeaderOrFooter
    ? editorEngineStore.history.past.length === 0
    : true;

  const redoDisabled = isTheme
    ? !canRedo
    : isGlobalHeaderOrFooter
    ? editorEngineStore.history.future.length === 0
    : true;

  const handleTopBarUndo = () => {
    if (isTheme) {
      undoTheme();
      showToast('Undone design change');
    } else if (isGlobalHeaderOrFooter) {
      editorEngineStore.undo();
      showToast(`Undone ${selectedPageId === 'header-global' ? 'header' : 'footer'} edit`);
    }
  };

  const handleTopBarRedo = () => {
    if (isTheme) {
      redoTheme();
      showToast('Redone design change');
    } else if (isGlobalHeaderOrFooter) {
      editorEngineStore.redo();
      showToast(`Redone ${selectedPageId === 'header-global' ? 'header' : 'footer'} edit`);
    }
  };

  return (
    <>
      <header className={styles.topBarContainer}>
        {/* ============================================================
            ZONE LEFT: Navigation Cluster, Context Cluster, History Cluster
           ============================================================ */}
        <div className={styles.zoneLeft}>
          {/* Cluster 1: Navigation & Store Identity */}
          <div className={styles.navCluster}>
            <button
              className={styles.backNavBtn}
              onClick={() => {
                if (isPageEditor) {
                  useLandingEditorStore.getState().navigateToPagesList();
                  navigate('/editor/pages');
                } else {
                  navigate('/pages');
                }
              }}
              title={isPageEditor ? "Back to All Pages" : "Back to Dashboard"}
              aria-label={isPageEditor ? "Back to all pages" : "Back to dashboard"}
            >
              <ArrowLeft size={15} />
              {isPageEditor && <span>All Pages</span>}
            </button>

            <div className={styles.domainBadge} title={`Business: ${businessName} (${storeUrl})`}>
              <span className={styles.domainLiveDot} />
              <span className={styles.domainNameText} title={businessName}>
                {businessName}
              </span>
            </div>

            {isPages && <PageSelectorDropdown />}

            {isLandingPageEditor && (
              <button
                id="topbar-library-btn"
                className={styles.btnLibrary}
                onClick={() => setAddSectionWidgetOpen(true)}
                title="Sections Library (Browse & Add Sections)"
                aria-label="Sections Library"
              >
                <Library size={13} />
                <span>Library</span>
              </button>
            )}
          </div>

          {!isPagesList && !isSettings && <div className={styles.divider} />}

          {/* Cluster 2: Dynamic Context per Tab */}
          <div className={styles.contextCluster}>
            {isSettings ? (
              <div className={styles.contextTag}>
                <Settings size={14} color="#64748b" />
                <span>Store Settings</span>
              </div>
            ) : isStoreBrand ? (
              <div className={styles.contextTag}>
                <Store size={14} color="#d97706" />
                <span>Brand & Identity</span>
              </div>
            ) : isTheme ? (
              <div className={styles.contextTag}>
                <Palette size={14} color="#2563eb" />
                <span>Design: {theme?.presetName || 'Modern'}</span>
              </div>
            ) : isPageEditor ? (
              /* Status Badge: only shown inside a specific page editor, not in /editor/pages list */
              <button
                className={`${styles.statusBadge} ${isLive ? styles.statusLive : isSavedDraft ? styles.statusSaved : styles.statusDraft}`}
                onClick={handleStatusBadgeClick}
                title={
                  isLive
                    ? `Status: Live on storefront. The currently published snapshot remains live until a new release is activated.`
                    : isSavedDraft
                      ? `Status: Saved to draft. Click to review & publish ${activeScopeName}.`
                      : `Status: Draft / Unsaved changes. Click to publish ${activeScopeName}.`
                }
              >
                <span className={styles.statusDot} />
                <span>{isLive ? 'Live' : isSavedDraft ? 'Saved' : 'Draft'}</span>
              </button>
            ) : null}
          </div>

          {(isTheme || isPageEditor) && !isSettings && <div className={styles.divider} />}

          {/* Cluster 3: History & Undo/Redo (Hidden in /editor/pages list and Settings) */}
          {(isTheme || isPageEditor) && !isSettings && (
            <div className={styles.historyCluster}>
              <button
                className={styles.iconBtn}
                onClick={handleTopBarUndo}
                disabled={undoDisabled}
                title={isTheme ? (canUndo ? 'Undo design change (Ctrl+Z)' : 'Undo (no changes)') : isGlobalHeaderOrFooter ? 'Undo last change' : 'Undo available in Design tab'}
                aria-label="Undo"
              >
                <Undo size={14} />
              </button>
              <button
                className={styles.iconBtn}
                onClick={handleTopBarRedo}
                disabled={redoDisabled}
                title={isTheme ? (canRedo ? 'Redo design change (Ctrl+Y)' : 'Redo') : isGlobalHeaderOrFooter ? 'Redo last change' : 'Redo available in Design tab'}
                aria-label="Redo"
              >
                <Redo size={14} />
              </button>
              {isPages && (
                <button
                  className={styles.iconBtn}
                  onClick={() => {
                    if (isGlobalHeaderOrFooter) {
                      setIsVersionCompareOpen(true);
                    } else {
                      setIsHistoryModalOpen(true);
                    }
                  }}
                  title="Edit History & Versioning (Releases & Rollbacks)"
                >
                  <History size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ============================================================
            ZONE CENTER: Viewport Modes, Global Search Bar
           ============================================================ */}
        <div className={styles.zoneCenter}>
          {/* Viewport Modes (Shown on Pages and Design where live previews exist) */}
          {(isPages || isTheme) && (
            <div className={styles.deviceToggles}>
              <button
                className={`${styles.deviceBtn} ${device === 'desktop' ? styles.activeDevice : ''}`}
                onClick={() => {
                  setDevice('desktop');
                  if (isFullPageMode) setFullPageMode(false);
                }}
                title="Desktop View (1280px - 1440px)"
              >
                <Monitor size={13} />
              </button>
              <button
                className={`${styles.deviceBtn} ${device === 'tablet' ? styles.activeDevice : ''}`}
                onClick={() => {
                  setDevice('tablet');
                  if (isFullPageMode) setFullPageMode(false);
                }}
                title="Tablet View (768px)"
              >
                <Tablet size={13} />
              </button>
              <button
                className={`${styles.deviceBtn} ${device === 'mobile' ? styles.activeDevice : ''}`}
                onClick={() => {
                  setDevice('mobile');
                  if (isFullPageMode) setFullPageMode(false);
                }}
                title="Mobile View (375px)"
              >
                <Smartphone size={13} />
              </button>
              <div style={{ width: '1px', height: '14px', backgroundColor: '#e2e8f0', margin: '0 1px' }} />
              <button
                className={`${styles.deviceBtn} ${device === 'all' ? styles.activeDevice : ''}`}
                onClick={() => {
                  setDevice('all');
                  setFullPageMode(true);
                  showToast('Compare Mode enabled (Focus Mode on)');
                }}
                title="Compare View (Mobile, Tablet, Desktop)"
              >
                <Columns size={13} />
              </button>
            </div>
          )}

          {/* Command Palette Trigger */}
          <button
            className={styles.searchTriggerBar}
            onClick={() => setIsCommandPaletteOpen(true)}
            title="Search pages, sections, themes & settings (Ctrl+K)"
          >
            <span className={styles.searchPlaceholder}>Search...</span>
            <span className={styles.shortcutKey}>⌘K</span>
          </button>
        </div>

        {/* ============================================================
            ZONE RIGHT: Tools Cluster & Actions Cluster
           ============================================================ */}
        <div className={styles.zoneRight}>
          {/* Cluster 4: Optimization & View Tools */}
          <div className={styles.toolsCluster}>
            {/* Unified Store Readiness (Health + Guided Setup Group) — ONLY shown in /editor/pages list, NOT in page editors */}
            {isPagesList && (
              <HealthScorePopovers onOpenSetup={() => setIsSetupModalOpen(true)} />
            )}

            {/* Audit status is shared by page, header, and footer editors. */}
            {(isPageEditor || isGlobalHeaderOrFooter) && <AuditButton />}

            {/* Full Page / Focus Mode Toggle — transforms directly between Expand and Exit Focus */}
            {(isPages || isTheme) && (
              isFullPageMode ? (
                <button
                  className={styles.focusModePill}
                  onClick={() => {
                    setFullPageMode(false);
                    showToast('Exited Focus Mode');
                  }}
                  title="Exit Focus Mode (Show sidebars)"
                >
                  <Minimize2 size={13} />
                  <span>Exit Focus</span>
                </button>
              ) : (
                <button
                  className={styles.iconBtn}
                  onClick={() => {
                    setFullPageMode(true);
                    showToast('Focus Mode enabled (Sidebars hidden)');
                  }}
                  title="Focus Mode (Maximize canvas preview)"
                >
                  <Maximize2 size={14} />
                </button>
              )
            )}

            {/* Design Mode Specific: Reset Theme Button */}
            {isTheme && (
              <button
                className={styles.btnGhost}
                onClick={() => {
                  showToast('Reset theme customizations to preset defaults');
                }}
                title="Reset theme customizations to preset defaults"
              >
                <RotateCcw size={13} />
                <span className={styles.btnLabel}>Reset Theme</span>
              </button>
            )}
          </div>

          <div className={styles.divider} />

          {/* Cluster 5: Preview & Publishing Actions */}
          <div className={styles.actionsCluster}>
            {/* Storefront Preview Button */}
            {!isSettings && (
              <button
                className={styles.btnGhost}
                onClick={handlePreview}
                title="Preview storefront in new tab"
              >
                <ExternalLink size={13} />
                <span className={styles.btnLabel}>Preview</span>
              </button>
            )}

            {/* AI Assistant Button */}
            <button
              className={styles.btnAi}
              onClick={() => setIsAiDrawerOpen(true)}
              title="Open BillionBiz AI Copilot"
            >
              <Sparkles size={13} />
              <span className={styles.btnLabel}>AI</span>
            </button>

            {/* Primary Action Button based on Tab & View Mode */}
            {isTheme ? (
              <button
                className={styles.btnPrimarySave}
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                style={!hasUnsavedChanges || isSaving ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                title={hasUnsavedChanges ? "Save theme customizations" : "Theme is up to date"}
              >
                <Save size={13} />
                <span>Save Theme</span>
              </button>
            ) : isStoreBrand ? (
              <button
                className={styles.btnPrimarySave}
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                style={!hasUnsavedChanges ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                title={hasUnsavedChanges ? "Save store & brand details" : "All brand details saved"}
              >
                <Save size={13} />
                <span>Save Brand</span>
              </button>
            ) : isSettings ? (
              <button
                className={styles.btnPrimarySave}
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                style={!hasUnsavedChanges ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                title={hasUnsavedChanges ? "Save store settings" : "Settings up to date"}
              >
                <Save size={13} />
                <span>Save Settings</span>
              </button>
            ) : isPageEditor ? (
              /* Inside any page's editor: Show dynamic contextual Save and Publish buttons */
              <>
                <button
                  className={styles.btnGhost}
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving}
                  style={!hasUnsavedChanges || isSaving ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                  title={hasUnsavedChanges ? `Save ${activeScopeName} draft (Ctrl+S)` : `All ${activeScopeName} edits saved`}
                >
                  <Save size={13} />
                  <span className={styles.btnLabel}>Save</span>
                </button>

                <button
                  className={styles.btnPrimary}
                  onClick={handlePublish}
                  title={activePage?.path === '/' ? `Review & publish ${activeScopeName} changes to live storefront` : `Publish ${activeScopeName} directly to live storefront`}
                >
                  <UploadCloud size={13} />
                  <span>Publish</span>
                  {activePage?.path === '/' && <ChevronDown size={11} style={{ opacity: 0.8 }} />}
                </button>
              </>
            ) : null /* In /editor/pages list view: hide save and publish buttons */}

            {/* Three-Dot More Menu */}
            <MoreOptionsMenu onNotify={showToast} />
          </div>
        </div>
      </header>

      {/* Modals & Slide-overs */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onRestoreSuccess={(ver) => showToast(`Successfully restored layout to ${ver}`)}
      />

      <VersionCompareModal
        isOpen={isVersionCompareOpen}
        onClose={() => setIsVersionCompareOpen(false)}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={handlePreview}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={showToast}
      />

      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />

      <GuidedSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className={styles.topbarToast}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
