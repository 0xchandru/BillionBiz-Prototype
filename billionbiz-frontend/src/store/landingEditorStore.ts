import { create } from 'zustand';
import { useSiteStore } from './siteStore';
import { useEditorContextStore } from './editorContextStore';

export interface PendingEditorSwitch {
  targetPageId: string;
  targetSectionId?: string | null;
  targetName: string;
  currentName: string;
  onConfirm: () => void;
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'all';
export type ThemeCategoryType = 'themes' | 'colors' | 'typography' | 'buttons' | 'effects' | 'custom-css';
export type EditorPanelType = 'pages' | 'brand' | 'design' | 'settings' | 'store-brand' | 'design-experience' | 'seo-growth';
export type PagesNavLevel = 'list' | 'page-detail';

export type BrandSection = 
  | 'store-profile' | 'logo-favicon' | 'business-details'
  | 'social-profiles' | 'whatsapp' | 'domain-urls'
  | 'global-seo' | 'social-sharing' | 'indexing' | 'structured-data' | 'page-seo'
  | 'general' | 'branding' | 'socials' | 'seo';

export type StoreBrandSection = BrandSection;

export type DesignSection = 
  | 'themes' | 'colors' | 'typography' | 'buttons-forms'
  | 'effects-motion' | 'custom-css'
  | 'loader' | 'scroll-behavior' | 'cursor'
  | 'mobile-nav' | 'mobile-pwa' | 'mobile-app'
  | 'theme' | 'buttons' | 'effects' | 'mobile' | 'mobile-web';

export type SeoSection = 'global' | 'page';

export type SettingsSection = 
  | 'launch-checklist' | 'language-region' | 'notifications'
  | 'refund-policy' | 'privacy-policy' | 'terms-of-service' | 'shipping-policy'
  | 'integrations' | 'custom-code' | 'api-webhooks' | 'permissions'
  | 'setup' | 'general' | 'policies' | 'language';

interface LandingEditorState {
  // Section selection
  selectedSectionId: string | null;
  activeSectionTab: string | null;

  // Device
  device: DeviceType;
  lastUserDevice: DeviceType;

  // Sidebar
  isRightSidebarOpen: boolean;
  isLeftSidebarCollapsed: boolean;

  // Focus / Full Page Mode
  isFullPageMode: boolean;

  // Widgets
  isColorWidgetOpen: boolean;
  isTypographyWidgetOpen: boolean;
  isAddSectionWidgetOpen: boolean;
  insertIndex: number | null;
  sectionToDelete: string | null;

  // Settings
  activeSettingItem: string | null;

  // Active panel (top-level tab)
  activePanel: EditorPanelType;

  // Pages tab state
  selectedPageId: string;
  pagesNavLevel: PagesNavLevel;

  // Brand tab state
  brandSection: BrandSection;
  storeBrandSection: BrandSection;

  // Design tab state
  designSection: DesignSection;
  selectedThemeCategory: ThemeCategoryType | null;

  // SEO tab state (used within Brand > SEO)
  seoSection: SeoSection;
  selectedSeoPageId: string | null;

  // Settings tab state
  settingsSection: SettingsSection;

  // ────────────────────────────────────────────
  // TAB MEMORY (restore state when switching tabs)
  // ────────────────────────────────────────────
  lastPagesMemory: {
    selectedPageId: string;
    pagesNavLevel: PagesNavLevel;
    selectedSectionId: string | null;
    isRightSidebarOpen: boolean;
  };
  lastBrandMemory: {
    brandSection: BrandSection;
    isRightSidebarOpen: boolean;
  };
  lastStoreBrandMemory: {
    storeBrandSection: StoreBrandSection;
    isRightSidebarOpen: boolean;
  };
  lastDesignMemory: {
    designSection: DesignSection;
    selectedThemeCategory: ThemeCategoryType | null;
    isRightSidebarOpen: boolean;
  };
  lastSeoMemory: {
    seoSection: SeoSection;
    selectedSeoPageId: string | null;
    isRightSidebarOpen: boolean;
  };
  lastSettingsMemory: {
    settingsSection: SettingsSection;
    activeSettingItem: string | null;
  };

  // ────────────────────────────────────────────
  // ACTIONS
  // ────────────────────────────────────────────
  setSelectedSectionId: (id: string | null) => void;
  setActiveSectionTab: (tab: string | null) => void;
  setDevice: (device: DeviceType) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  closeRightSidebar: () => void;
  setColorWidgetOpen: (isOpen: boolean) => void;
  setTypographyWidgetOpen: (isOpen: boolean) => void;
  setAddSectionWidgetOpen: (isOpen: boolean) => void;
  setInsertIndex: (index: number | null) => void;
  setSectionToDelete: (id: string | null) => void;
  setActiveSettingItem: (item: string | null) => void;
  setActivePanel: (panel: EditorPanelType) => void;
  setSelectedPageId: (id: string) => void;
  setSelectedThemeCategory: (category: ThemeCategoryType | null) => void;
  setFullPageMode: (enabled: boolean) => void;

  // Navigation actions
  setPagesNavLevel: (level: PagesNavLevel) => void;
  setBrandSection: (section: BrandSection) => void;
  setStoreBrandSection: (section: StoreBrandSection) => void;
  setDesignSection: (section: DesignSection) => void;
  setSeoSection: (section: SeoSection) => void;
  setSelectedSeoPageId: (id: string | null) => void;
  setSettingsSection: (section: SettingsSection) => void;

  // Navigate into a page's section list
  navigateToPage: (pageId: string, sectionId?: string | null) => void;
  // Navigate back to pages list
  navigateToPagesList: () => void;
  // Navigate directly to a section's editor (from preview click)
  navigateToSection: (pageId: string, sectionId: string) => void;

  // Editor switch confirmation modal state
  pendingEditorSwitch: PendingEditorSwitch | null;
  setPendingEditorSwitch: (pending: PendingEditorSwitch | null) => void;
  requestEditorSwitch: (params: {
    targetPageId: string;
    targetSectionId?: string | null;
    targetName?: string;
    onConfirm: () => void;
  }) => void;
}

export const useLandingEditorStore = create<LandingEditorState>((set, get) => ({
  selectedSectionId: null,
  activeSectionTab: null,
  device: 'desktop',
  lastUserDevice: 'desktop',
  isRightSidebarOpen: false,
  isLeftSidebarCollapsed: false,
  isFullPageMode: false,
  pendingEditorSwitch: null,
  isColorWidgetOpen: false,
  isTypographyWidgetOpen: false,
  isAddSectionWidgetOpen: false,
  insertIndex: null,
  sectionToDelete: null,
  activeSettingItem: 'setup',

  // Default: Pages tab, list view
  activePanel: 'pages',
  selectedPageId: 'landing-page',
  pagesNavLevel: 'list',

  // Brand defaults
  brandSection: 'store-profile',
  storeBrandSection: 'store-profile',

  // Design defaults
  designSection: 'themes',
  selectedThemeCategory: 'themes',

  // SEO defaults
  seoSection: 'global',
  selectedSeoPageId: null,

  // Settings defaults
  settingsSection: 'launch-checklist',

  // Tab memory
  lastPagesMemory: {
    selectedPageId: 'landing-page',
    pagesNavLevel: 'list',
    selectedSectionId: null,
    isRightSidebarOpen: false,
  },
  lastBrandMemory: {
    brandSection: 'store-profile',
    isRightSidebarOpen: false,
  },
  lastStoreBrandMemory: {
    storeBrandSection: 'store-profile',
    isRightSidebarOpen: false,
  },
  lastDesignMemory: {
    designSection: 'themes',
    selectedThemeCategory: 'themes',
    isRightSidebarOpen: true,
  },
  lastSeoMemory: {
    seoSection: 'global',
    selectedSeoPageId: null,
    isRightSidebarOpen: true,
  },
  lastSettingsMemory: {
    settingsSection: 'launch-checklist',
    activeSettingItem: 'launch-checklist',
  },

  // ────────────────────────────────────────────
  // ACTIONS
  // ────────────────────────────────────────────

  setSelectedSectionId: (id) => {
    if (id) {
      try {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const state = get();
          const isHeader =
            state.selectedPageId === 'header-global' ||
            ['header-main', 'announcement-bar', 'utility-bar', 'category-bar'].includes(id) ||
            id.startsWith('header-') ||
            id.startsWith('row-announcement') ||
            id.startsWith('row-utility') ||
            id.startsWith('row-secondary-nav') ||
            id.startsWith('row-primary-nav');
          const isFooter =
            state.selectedPageId === 'footer-global' ||
            id.startsWith('footer-');

          let targetPath = url.pathname;
          if (isHeader) {
            targetPath = '/editor/header';
          } else if (isFooter) {
            targetPath = '/editor/footer';
          } else if (url.pathname === '/editor/pages' || url.pathname === '/editor') {
            targetPath = '/editor/landing-page';
          }

          if (url.pathname === targetPath && url.searchParams.get('sectionId') !== id) {
            url.searchParams.set('sectionId', id);
            window.history.replaceState(null, '', targetPath + (url.search ? url.search : ''));
          }
        }
      } catch {
        // ignore
      }
    }
    set({
      selectedSectionId: id,
      isRightSidebarOpen: id !== null,
    });
  },

  setActiveSectionTab: (tab) => set({ activeSectionTab: tab }),
  setDevice: (device) => set({ device, lastUserDevice: device }),
  setRightSidebarOpen: (open) => {
    if (!open) {
      try {
        if (typeof window !== 'undefined' && window.location.search.includes('sectionId=')) {
          const url = new URL(window.location.href);
          url.searchParams.delete('sectionId');
          window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
        }
      } catch {
        // ignore
      }
      useEditorContextStore.getState().selectTarget({ type: 'none' });
      set({ isRightSidebarOpen: false, selectedSectionId: null });
      return;
    }
    set({ isRightSidebarOpen: open });
  },
  setLeftSidebarCollapsed: (collapsed) => set({ isLeftSidebarCollapsed: collapsed }),
  setFullPageMode: (enabled) => set({ isFullPageMode: enabled }),

  closeRightSidebar: () => {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('sectionId=')) {
        const url = new URL(window.location.href);
        url.searchParams.delete('sectionId');
        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
      }
    } catch {
      // ignore
    }
    useEditorContextStore.getState().selectTarget({ type: 'none' });
    set({
      isRightSidebarOpen: false,
      selectedSectionId: null,
    });
  },

  setPendingEditorSwitch: (pending) => set({ pendingEditorSwitch: pending }),

  requestEditorSwitch: ({ targetPageId, targetSectionId, targetName, onConfirm }) => {
    const state = get();
    // If we are already on this page or in list view, proceed immediately without confirmation
    if (state.selectedPageId === targetPageId || state.pagesNavLevel !== 'page-detail') {
      onConfirm();
      return;
    }

    const currentName =
      state.selectedPageId === 'landing-page'
        ? 'Landing Page Editor'
        : state.selectedPageId === 'header-global'
        ? 'Header Editor'
        : state.selectedPageId === 'footer-global'
        ? 'Footer Editor'
        : 'Page Editor';

    const defaultTargetName =
      targetPageId === 'header-global'
        ? 'Header Editor'
        : targetPageId === 'footer-global'
        ? 'Footer Editor'
        : targetPageId === 'landing-page'
        ? 'Landing Page Editor'
        : 'Page Editor';

    set({
      pendingEditorSwitch: {
        targetPageId,
        targetSectionId,
        targetName: targetName || defaultTargetName,
        currentName,
        onConfirm,
      },
    });
  },

  setColorWidgetOpen: (isOpen) => set({
    isColorWidgetOpen: isOpen,
    isTypographyWidgetOpen: false,
    isAddSectionWidgetOpen: false,
  }),

  setTypographyWidgetOpen: (isOpen) => set({
    isTypographyWidgetOpen: isOpen,
    isColorWidgetOpen: false,
    isAddSectionWidgetOpen: false,
  }),

  setAddSectionWidgetOpen: (isOpen) => set({
    isAddSectionWidgetOpen: isOpen,
    isColorWidgetOpen: false,
    isTypographyWidgetOpen: false,
  }),

  setInsertIndex: (index) => set({ insertIndex: index }),
  setSectionToDelete: (id) => set({ sectionToDelete: id }),
  setActiveSettingItem: (item) => set({ activeSettingItem: item }),

  // ─── SUB-NAV ACTIONS ───

  setPagesNavLevel: (level) => set({ pagesNavLevel: level }),

  setBrandSection: (section) => set({
    brandSection: section,
    storeBrandSection: section,
    isRightSidebarOpen: false,
  }),

  setStoreBrandSection: (section) => set({
    brandSection: section,
    storeBrandSection: section,
    isRightSidebarOpen: false,
  }),

  setDesignSection: (section) => set((state) => {
    const isMobile = section === 'mobile-nav' || section === 'mobile-pwa' || section === 'mobile-app' || section === 'mobile' || section === 'mobile-web';
    const wasMobile = state.designSection === 'mobile-nav' || state.designSection === 'mobile-pwa' || state.designSection === 'mobile-app' || state.designSection === 'mobile' || state.designSection === 'mobile-web';
    let targetDevice = state.device;
    let lastUserDevice = state.lastUserDevice;

    if (isMobile) {
      if (!wasMobile && state.device !== 'mobile') {
        lastUserDevice = state.device;
      }
      targetDevice = 'mobile';
    } else if (wasMobile) {
      targetDevice = lastUserDevice || 'desktop';
    }

    return {
      designSection: section,
      device: targetDevice,
      lastUserDevice,
      isRightSidebarOpen: true,
    };
  }),

  setSeoSection: (section) => set({
    seoSection: section,
    isRightSidebarOpen: true,
  }),

  setSelectedSeoPageId: (id) => set({
    selectedSeoPageId: id,
    seoSection: id ? 'page' : 'global',
    isRightSidebarOpen: true,
  }),

  setSettingsSection: (section) => set({
    settingsSection: section,
    activeSettingItem: section,
  }),

  setSelectedThemeCategory: (category) => set({
    selectedThemeCategory: category,
    isRightSidebarOpen: category !== null,
    lastDesignMemory: {
      designSection: 'themes',
      selectedThemeCategory: category,
      isRightSidebarOpen: category !== null,
    },
  }),

  navigateToPage: (pageId, sectionId) => set((state) => {
    const wasInMobile = (state.activePanel === 'design' || state.activePanel === 'design-experience') && 
      (state.designSection === 'mobile' || state.designSection === 'mobile-web' || state.designSection === 'mobile-app' || state.designSection === 'mobile-nav' || state.designSection === 'mobile-pwa');
    
    const isGlobalStudio = pageId === 'header-global' || pageId === 'footer-global' || pageId === 'cookie-consent-global' || pageId === 'toaster-global';
    const isDefaultSubpage = pageId !== 'landing-page' && !isGlobalStudio;
    const isSamePage = state.selectedPageId === pageId;
    const targetSectionId = sectionId !== undefined ? sectionId : (isSamePage ? state.selectedSectionId : null);

    return {
      selectedPageId: pageId,
      pagesNavLevel: 'page-detail',
      selectedSectionId: targetSectionId,
      isRightSidebarOpen: (isSamePage && state.isRightSidebarOpen) ? true : (isGlobalStudio || isDefaultSubpage || Boolean(targetSectionId)),
      device: wasInMobile ? (state.lastUserDevice || 'desktop') : state.device,
    };
  }),

  navigateToPagesList: () => set({
    pagesNavLevel: 'list',
    selectedPageId: 'landing-page',
    selectedSectionId: null,
    isRightSidebarOpen: false,
  }),

  navigateToSection: (pageId, sectionId) => set((state) => {
    const siteState = useSiteStore.getState();
    const landingPage = siteState.pages?.find((p: any) => p.id === 'landing-page');
    const matchedSection = landingPage?.sections?.find((s: any) => s && s.id === sectionId);

    let targetPageId = pageId;
    if (matchedSection) {
      if (['Header', 'AnnouncementBar', 'UtilityBar'].includes(matchedSection.type)) {
        targetPageId = 'header-global';
      } else if (['Footer', 'FooterMenu', 'FooterText', 'FooterNewsletter'].includes(matchedSection.type) || (matchedSection.id?.startsWith('footer-') && matchedSection.type !== 'Newsletter')) {
        targetPageId = 'footer-global';
      } else {
        targetPageId = 'landing-page';
      }
    }

    // Save current panel memory before switching
    const currentBrandMemory = (state.activePanel === 'brand' || state.activePanel === 'store-brand') ? {
      brandSection: state.brandSection || state.storeBrandSection,
      isRightSidebarOpen: state.isRightSidebarOpen,
    } : state.lastBrandMemory;

    const currentDesignMemory = (state.activePanel === 'design' || state.activePanel === 'design-experience') ? {
      designSection: state.designSection,
      selectedThemeCategory: state.selectedThemeCategory,
      isRightSidebarOpen: state.isRightSidebarOpen,
    } : state.lastDesignMemory;

    const currentSeoMemory = state.activePanel === 'seo-growth' ? {
      seoSection: state.seoSection,
      selectedSeoPageId: state.selectedSeoPageId,
      isRightSidebarOpen: state.isRightSidebarOpen,
    } : state.lastSeoMemory;

    const currentSettingsMemory = state.activePanel === 'settings' ? {
      settingsSection: state.settingsSection,
      activeSettingItem: state.activeSettingItem,
    } : state.lastSettingsMemory;

    // Restore device from mobile if was in mobile design section
    const wasInMobile = (state.activePanel === 'design' || state.activePanel === 'design-experience') && 
      (state.designSection === 'mobile' || state.designSection === 'mobile-web' || state.designSection === 'mobile-app' || state.designSection === 'mobile-nav' || state.designSection === 'mobile-pwa');
    const nextDevice = wasInMobile ? (state.lastUserDevice || 'desktop') : state.device;

    return {
      activePanel: 'pages',
      selectedPageId: targetPageId,
      pagesNavLevel: 'page-detail',
      selectedSectionId: sectionId,
      isRightSidebarOpen: true,
      device: nextDevice,
      isColorWidgetOpen: false,
      isTypographyWidgetOpen: false,
      isAddSectionWidgetOpen: false,
      lastBrandMemory: currentBrandMemory,
      lastStoreBrandMemory: { storeBrandSection: currentBrandMemory.brandSection, isRightSidebarOpen: currentBrandMemory.isRightSidebarOpen },
      lastDesignMemory: currentDesignMemory,
      lastSeoMemory: currentSeoMemory,
      lastSettingsMemory: currentSettingsMemory,
      lastPagesMemory: {
        selectedPageId: targetPageId,
        pagesNavLevel: 'page-detail' as const,
        selectedSectionId: sectionId,
        isRightSidebarOpen: true,
      },
    };
  }),

  // ─── MAIN PANEL SWITCHER ───

  setActivePanel: (panel) => set((state) => {
    const canonicalPanel: EditorPanelType = 
      panel === 'store-brand' ? 'brand' :
      panel === 'design-experience' ? 'design' :
      panel === 'seo-growth' ? 'brand' :
      panel;

    const wasInMobile = (state.activePanel === 'design' || state.activePanel === 'design-experience') && 
      (state.designSection === 'mobile' || state.designSection === 'mobile-web' || state.designSection === 'mobile-app' || state.designSection === 'mobile-nav' || state.designSection === 'mobile-pwa');
    const isEnteringMobile = canonicalPanel === 'design' && 
      (state.lastDesignMemory.designSection === 'mobile' || state.lastDesignMemory.designSection === 'mobile-web' || state.lastDesignMemory.designSection === 'mobile-app' || state.lastDesignMemory.designSection === 'mobile-nav' || state.lastDesignMemory.designSection === 'mobile-pwa');

    let nextDevice = state.device;
    if (wasInMobile && canonicalPanel !== 'design') {
      nextDevice = state.lastUserDevice || 'desktop';
    } else if (isEnteringMobile) {
      nextDevice = 'mobile';
    }

    // Save current tab state into memory
    const currentPagesMemory = state.activePanel === 'pages' ? {
      selectedPageId: state.selectedPageId,
      pagesNavLevel: state.pagesNavLevel,
      selectedSectionId: state.selectedSectionId,
      isRightSidebarOpen: state.isRightSidebarOpen,
    } : state.lastPagesMemory;

    const currentBrandMemory = (state.activePanel === 'brand' || state.activePanel === 'store-brand') ? {
      brandSection: state.brandSection || state.storeBrandSection,
      isRightSidebarOpen: state.isRightSidebarOpen,
    } : state.lastBrandMemory;

    const currentDesignMemory = (state.activePanel === 'design' || state.activePanel === 'design-experience') ? {
      designSection: state.designSection,
      selectedThemeCategory: state.selectedThemeCategory,
      isRightSidebarOpen: state.isRightSidebarOpen,
    } : state.lastDesignMemory;

    const currentSeoMemory = state.activePanel === 'seo-growth' ? {
      seoSection: state.seoSection,
      selectedSeoPageId: state.selectedSeoPageId,
      isRightSidebarOpen: state.isRightSidebarOpen,
    } : state.lastSeoMemory;

    const currentSettingsMemory = state.activePanel === 'settings' ? {
      settingsSection: state.settingsSection,
      activeSettingItem: state.activeSettingItem,
    } : state.lastSettingsMemory;

    const base = {
      activePanel: canonicalPanel,
      device: nextDevice,
      lastPagesMemory: currentPagesMemory,
      lastBrandMemory: currentBrandMemory,
      lastStoreBrandMemory: { storeBrandSection: currentBrandMemory.brandSection, isRightSidebarOpen: currentBrandMemory.isRightSidebarOpen },
      lastDesignMemory: currentDesignMemory,
      lastSeoMemory: currentSeoMemory,
      lastSettingsMemory: currentSettingsMemory,
      isColorWidgetOpen: false,
      isTypographyWidgetOpen: false,
      isAddSectionWidgetOpen: false,
    };

    switch (canonicalPanel) {
      case 'pages':
        return {
          ...base,
          selectedPageId: currentPagesMemory.selectedPageId || 'landing-page',
          pagesNavLevel: currentPagesMemory.pagesNavLevel || 'list',
          selectedSectionId: currentPagesMemory.selectedSectionId,
          isRightSidebarOpen: currentPagesMemory.isRightSidebarOpen,
        };

      case 'brand':
        return {
          ...base,
          brandSection: currentBrandMemory.brandSection || 'store-profile',
          storeBrandSection: currentBrandMemory.brandSection || 'store-profile',
          selectedSectionId: null,
          isRightSidebarOpen: false,
        };

      case 'design':
        return {
          ...base,
          designSection: currentDesignMemory.designSection || 'themes',
          selectedThemeCategory: currentDesignMemory.selectedThemeCategory || 'themes',
          selectedPageId: 'landing-page',
          selectedSectionId: null,
          isRightSidebarOpen: currentDesignMemory.isRightSidebarOpen,
        };

      case 'settings':
        return {
          ...base,
          settingsSection: currentSettingsMemory.settingsSection || 'launch-checklist',
          activeSettingItem: currentSettingsMemory.activeSettingItem || 'launch-checklist',
          selectedSectionId: null,
          isRightSidebarOpen: false,
        };

      default:
        return base;
    }
  }),

  setSelectedPageId: (id) => set((state) => {
    const isSamePage = state.selectedPageId === id;
    return {
      selectedPageId: (state.activePanel === 'design' || state.activePanel === 'design-experience') ? 'landing-page' : id,
      selectedSectionId: isSamePage ? state.selectedSectionId : null,
      isRightSidebarOpen: isSamePage ? state.isRightSidebarOpen : (id !== 'landing-page' && !['brand', 'settings'].includes(state.activePanel)),
      lastPagesMemory: state.activePanel === 'pages' ? {
        ...state.lastPagesMemory,
        selectedPageId: id,
      } : state.lastPagesMemory,
    };
  }),
}));
