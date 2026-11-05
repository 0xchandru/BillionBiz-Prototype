import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';
import { defaultPropsMap, sectionNameMap } from '../components/editor/SectionRenderer';
import { getAllPageConfigs } from '../components/editor/pageConfigs';
import { createHeroBannerInstance } from '../components/editor/sectionEngine/heroBannerDefinition';
import { createFeaturedCollectionInstance } from '../components/editor/sectionEngine/featuredCollectionDefinition';
import type { PageCategory } from '../components/editor/pageConfigs/types';
import { useContentStateStore } from './contentStateStore';
import {
  PLATFORM_VERSION,
} from '../config/version';


export interface SectionData {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  isHidden: boolean;
  schemaVersion?: number;
  enabled?: boolean;
  settings?: Record<string, any>;
  blocks?: Array<Record<string, any>>;
  designOverrides?: Record<string, any>;
  responsiveOverrides?: Record<string, any>;
}

export interface PageSnapshot {
  sections: SectionData[];
  pageProps: Record<string, any>;
  publishedAt: string;
}

export interface PageData {
  id: string;
  name: string;
  path: string;
  type: string;                // page config type key (e.g., 'shop', 'product-details')
  category: PageCategory;      // storefront, commerce, customer, legal, system
  status: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string;
  canonicalUrl?: string;
  searchVisibility?: boolean;
  sections: SectionData[];
  pageProps: Record<string, any>; // page-level props (layout, content, style, etc.)
  visibility: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  lastPublishedSnapshot?: PageSnapshot;
  draftVersion?: number;
}

import type { GlobalThemeData } from '../components/editor/theme/themePresets';
import { DEFAULT_THEME_SPACING, getDefaultTheme, mergeThemeData, migrateThemeData, themePresets } from '../components/editor/theme/themePresets';
import { useThemeHistoryStore } from './themeHistoryStore';

export type ThemeData = GlobalThemeData;

export interface OnlineStoreState {
  pages: PageData[];
  theme: ThemeData;
  settings: Record<string, any>;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  lastPublishedSnapshots: Record<string, PageSnapshot>;
  markSaved: () => void;
  markUnsaved: () => void;
  
  updateSectionProps: (pageId: string, sectionId: string, newProps: Record<string, any>) => void;
  updateSectionInstance: (pageId: string, sectionId: string, patch: Partial<SectionData>) => void;
  reorderSections: (pageId: string, startIndex: number, endIndex: number) => void;
  toggleSectionVisibility: (pageId: string, sectionId: string) => void;
  addSection: (pageId: string, sectionType: string, insertIndex?: number) => void;
  removeSection: (pageId: string, sectionId: string) => void;
  duplicateSection: (pageId: string, sectionId: string) => void;
  updatePageProps: (pageId: string, newProps: Partial<PageData>) => void;
  addPage: (name: string, path: string) => void;
  removePage: (pageId: string) => void;
  updateTheme: (newTheme: Partial<ThemeData> | Record<string, any>, forceHistory?: boolean) => void;
  updateSettings: (newSettings: Record<string, any>) => void;
  resetTheme: () => void;
  resetAllThemeSettings: () => void;
  resetColorPalette: () => void;
  resetTypography: () => void;
  resetButtons: () => void;
  resetSpacing: () => void;
  resetEffects: () => void;
  resetCustomCss: () => void;
  undoTheme: () => void;
  redoTheme: () => void;
  // Real-time backend synchronization
  isSyncing: boolean;
  fetchLiveStoreData: () => Promise<void>;
  saveSettingsToBackend: (settings: Record<string, any>) => Promise<void>;
  saveThemeToBackend: (theme: Partial<ThemeData>) => Promise<void>;
  savePageDraftToBackend: (pageId: string) => Promise<any>;
  publishStoreToBackend: (notes?: string) => Promise<any>;
  // Methods for Online Store Editor
  updatePageSettings: (pageId: string, settings: Record<string, any>) => void;
  resetPageToDefault: (pageId: string) => void;
  publishPage: (pageId: string) => void;
  unpublishPage: (pageId: string) => void;
  resetOnlineStore: () => void;
  resetSiteStore?: () => void;
}

export type SiteState = OnlineStoreState;

const createSectionId = (): string => {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return `sec-${suffix}`;
};

// Helper to create a section with default props
const createSection = (id: string, type: string, overrides?: Partial<SectionData>): SectionData => {
  if (type === 'HeroBanner' && !overrides) {
    return createHeroBannerInstance(id, sectionNameMap[type] || 'Hero Banner') as SectionData;
  }
  if (type === 'FeaturedCollection' && !overrides) {
    return createFeaturedCollectionInstance(id, sectionNameMap[type] || 'Featured Collection') as SectionData;
  }

  return {
    id,
    type,
    name: sectionNameMap[type] || type.replace(/([A-Z])/g, ' $1').trim(),
    isHidden: false,
    props: { ...defaultPropsMap[type] },
    ...overrides,
  };
};

// Helper predicate functions for separating Header, Footer, and Homepage scopes
export const isHeaderComponent = (s: SectionData | { type: string; id?: string }) => {
  if (!s) return false;
  return ['AnnouncementBar', 'UtilityBar', 'Header', 'CategoryBar'].includes(s.type);
};

export const isFooterComponent = (s: SectionData | { type: string; id?: string }) => {
  if (!s) return false;
  return (
    [
      'FooterTrust',
      'FooterNewsletter',
      'FooterMain',
      'FooterSocial',
      'FooterBottom',
      'FooterMenu',
      'FooterText',
      'Footer',
    ].includes(s.type) ||
    (typeof s.type === 'string' && s.type.startsWith('Footer')) ||
    (Boolean(s.id && s.id.startsWith('footer-')) && s.type !== 'Newsletter')
  );
};

export const isHomepageBodySection = (s: SectionData | { type: string; id?: string }) => {
  if (!s) return false;
  return !isHeaderComponent(s) && !isFooterComponent(s);
};

// Helper to generate default sections for a page config (clean empty initial canvas per merchant specification)
const generateDefaultSections = (_pageId: string, _configType: string): SectionData[] => {
  return [];
};

// Build the initial pages from page configs
const buildPredefinedPages = (): PageData[] => {
  const configs = getAllPageConfigs();
  return configs.map(config => {
    const pageId = `${config.type}-page`;
    return {
      id: pageId,
      name: config.name,
      path: config.path,
      type: config.type,
      category: config.category,
      status: 'published' as const,
      seoTitle: `${config.name} - BillionBiz`,
      seoDescription: config.description || '',
      sections: [],
      pageProps: { ...config.defaultProps },
      visibility: { desktop: true, tablet: true, mobile: true },
    };
  });
};

// Initial mock data — Landing page + predefined pages (clean empty canvas & published by default)
export const getInitialPages = (): PageData[] => [
  {
    id: 'landing-page',
    name: 'Landing page',
    path: '/',
    type: 'landing',
    category: 'storefront',
    status: 'published',
    seoTitle: 'BillionBiz | Build, Launch & Grow Your Business',
    seoDescription: 'The best platform to launch your store.',
    sections: [],
    pageProps: {},
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  {
    id: 'maintenance-page',
    name: 'Maintenance',
    path: '/maintenance',
    type: 'maintenance',
    category: 'system',
    status: 'published',
    seoTitle: 'Under Maintenance - BillionBiz',
    seoDescription: 'We are currently performing scheduled maintenance.',
    sections: [],
    pageProps: { layout: 'countdown', estimatedTime: '2 Hours', notifyEmail: true },
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  {
    id: 'booking-page',
    name: 'Booking',
    path: '/booking',
    type: 'booking',
    category: 'commerce',
    status: 'published',
    seoTitle: 'Book an Appointment - BillionBiz',
    seoDescription: 'Schedule a session or reserve a service with us.',
    sections: [],
    pageProps: { layout: 'calendar-grid', slotDuration: 30, allowGuestBooking: true },
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  {
    id: 'order-confirmation-page',
    name: 'Order Confirmation',
    path: '/order-confirmation',
    type: 'order-confirmation',
    category: 'commerce',
    status: 'published',
    seoTitle: 'Order Confirmed - BillionBiz',
    seoDescription: 'Your order details and invoice receipt.',
    sections: [],
    pageProps: { layout: 'receipt-detailed', showDownloadPdf: true, showTrackButton: true },
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  {
    id: 'thank-you-page',
    name: 'Thank You',
    path: '/thank-you',
    type: 'thank-you',
    category: 'commerce',
    status: 'published',
    seoTitle: 'Thank You for Your Order - BillionBiz',
    seoDescription: 'We appreciate your business.',
    sections: [],
    pageProps: { layout: 'celebration-banner', showSocialShare: true, couponOffer: 'THANKS10' },
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  {
    id: 'order-tracking-page',
    name: 'Order Tracking',
    path: '/order-tracking',
    type: 'order-tracking',
    category: 'commerce',
    status: 'published',
    seoTitle: 'Track Your Package - BillionBiz',
    seoDescription: 'Live carrier parcel tracking and delivery status.',
    sections: [],
    pageProps: { layout: 'timeline-live', carrierAutoDetect: true, showSupportChat: true },
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  {
    id: 'forgot-password-page',
    name: 'Forgot Password',
    path: '/forgot-password',
    type: 'forgot-password',
    category: 'customer',
    status: 'published',
    seoTitle: 'Forgot Password - BillionBiz',
    seoDescription: 'Reset your customer account password.',
    sections: [],
    pageProps: { layout: 'standard' },
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  {
    id: 'email-verification-page',
    name: 'Email Verification',
    path: '/account/verify-email',
    type: 'email-verification',
    category: 'customer',
    status: 'published',
    seoTitle: 'Email Verification - BillionBiz',
    seoDescription: 'Verify your customer account email address.',
    sections: [],
    pageProps: { layout: 'standard' },
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  {
    id: 'reset-password-page',
    name: 'Reset Password',
    path: '/reset-password',
    type: 'reset-password',
    category: 'customer',
    status: 'published',
    seoTitle: 'Create New Password - BillionBiz',
    seoDescription: 'Enter your new secure account password.',
    sections: [],
    pageProps: { layout: 'standard' },
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  ...buildPredefinedPages(),
];

export const getInitialSettings = (): Record<string, any> => {
  const dynamicStoreName = (typeof window !== 'undefined' ? localStorage.getItem('billionbiz_store_name') : null) || 'Your store';
  return {
    storeName: dynamicStoreName,
    siteName: dynamicStoreName,
    tagline: '',
    description: '',
    language: 'English',
    announcement: '',
    copyright: `© ${new Date().getFullYear()} ${dynamicStoreName}. All rights reserved.`,
    showBottomNav: true,
    floatingActions: [],
    floatingPosition: 'right',
    floatingStyle: 'circle',
    decorationsEnabled: false,
    decorationTrigger: 'purchase',
    bottomNavLinks: [
      { id: 'home', icon: 'Home', text: 'Home', link: '/' },
      { id: 'shop', icon: 'Grid', text: 'Shop', link: '/collections/all' },
      { id: 'cart', icon: 'ShoppingCart', text: 'Cart', link: '/cart' },
      { id: 'profile', icon: 'User', text: 'Profile', link: '/profile' }
    ]
  };
};

export const useOnlineStore = create<OnlineStoreState>()(
  persist<OnlineStoreState>(
    (set, get) => ({
      pages: getInitialPages(),
      theme: getDefaultTheme(),
      hasUnsavedChanges: false,
      lastPublishedSnapshots: {},
      markSaved: () => set({ hasUnsavedChanges: false }),
      markUnsaved: () => set({ hasUnsavedChanges: true }),
      settings: getInitialSettings(),
      isLoading: true,

      resetOnlineStore: () => {
        set({
          pages: getInitialPages(),
          theme: getDefaultTheme(),
          settings: getInitialSettings(),
          hasUnsavedChanges: false,
          lastPublishedSnapshots: {},
        });
      },
      resetSiteStore: () => {
        set({
          pages: getInitialPages(),
          theme: getDefaultTheme(),
          settings: getInitialSettings(),
          hasUnsavedChanges: false,
          lastPublishedSnapshots: {},
          isLoading: false,
        });
        useSiteStore.persist?.clearStorage?.();
      },

      isSyncing: false,

      fetchLiveStoreData: async () => {
        try {
          set({ isLoading: true });
          const [pagesRes, brandRes, settingsRes, themeRes] = await Promise.allSettled([
            apiClient.get('/storefront/pages'),
            apiClient.get('/storefront/brand'),
            apiClient.get('/storefront/settings'),
            apiClient.get('/storefront/theme'),
          ]);

          const stateUpdates: Partial<OnlineStoreState> = {};

          if (pagesRes.status === 'fulfilled' && pagesRes.value?.pages && pagesRes.value.pages.length > 0) {
            const serverPages = pagesRes.value.pages;
            const mappedPages: PageData[] = serverPages.map((sp: any) => ({
              id: sp.id,
              name: sp.name,
              path: sp.path,
              type: sp.type || 'standard',
              category: sp.category || (sp.is_system ? 'storefront' : 'custom'),
              status: sp.status === 'published' ? 'published' : 'draft',
              seoTitle: sp.seo_title || '',
              seoDescription: sp.seo_description || '',
              socialImage: sp.social_image || '',
              canonicalUrl: sp.canonical_url || '',
              searchVisibility: sp.search_visibility !== false,
              sections: Array.isArray(sp.sections) ? sp.sections : [],
              pageProps: sp.draft_page_props || sp.page_props || {},
              draftVersion: Number(sp.draft_version || 0),
              visibility: sp.visibility || { desktop: true, tablet: true, mobile: true },
              is_system: sp.is_system,
              is_locked: sp.is_locked,
              template_key: sp.template_key
            } as any));
            stateUpdates.pages = mappedPages;
          }

          let newSettings = { ...get().settings };
          if (brandRes.status === 'fulfilled' && brandRes.value?.brand) {
            const b = brandRes.value.brand;
            newSettings = {
              ...newSettings,
              storeName: b.name || newSettings.storeName,
              siteName: b.name || newSettings.siteName,
              tagline: b.tagline !== undefined ? b.tagline : newSettings.tagline,
              logoUrl: b.logoUrl || newSettings.logoUrl,
              faviconUrl: b.faviconUrl || newSettings.faviconUrl,
              socialLinks: b.socialLinks || newSettings.socialLinks,
            };
          }

          if (settingsRes.status === 'fulfilled' && settingsRes.value?.settings) {
            const s = settingsRes.value.settings;
            newSettings = {
              ...newSettings,
              ...(s.uiConfig && typeof s.uiConfig === 'object' ? s.uiConfig : {}),
              mode: s.mode || newSettings.mode,
              primaryDomain: s.primaryDomain || newSettings.primaryDomain,
              domains: s.domains || newSettings.domains,
              passwordEnabled: s.passwordEnabled ?? newSettings.passwordEnabled,
              maintenanceMode: s.maintenanceMode ?? newSettings.maintenanceMode,
              redirects: s.redirects || newSettings.redirects,
              seoDefaults: s.seoDefaults || newSettings.seoDefaults,
            };
          }
          stateUpdates.settings = newSettings;

          if (themeRes.status === 'fulfilled' && themeRes.value?.theme) {
            const t = themeRes.value.theme;
            const currentTheme = get().theme;
            stateUpdates.theme = migrateThemeData({
              ...currentTheme,
              presetName: t.preset_name || currentTheme.presetName || 'modern',
              palette: t.palette ? mergeThemeData(currentTheme.palette, t.palette) : currentTheme.palette,
              typography: t.typography ? mergeThemeData(currentTheme.typography, t.typography) : currentTheme.typography,
              buttons: t.buttons ? mergeThemeData(currentTheme.buttons, t.buttons) : currentTheme.buttons,
              effects: t.effects ? mergeThemeData(currentTheme.effects, t.effects) : currentTheme.effects,
            });
          }

          set({ ...stateUpdates, isLoading: false });
        } catch (err) {
          console.warn('[OnlineStore] fetchLiveStoreData error:', err);
          set({ isLoading: false });
        }
      },

      saveSettingsToBackend: async (newSettings: Record<string, any>) => {
        const brandFields: any = {};
        if (newSettings.storeName !== undefined || newSettings.name !== undefined) {
          brandFields.name = newSettings.storeName ?? newSettings.name;
        }
        if (newSettings.tagline !== undefined) brandFields.tagline = newSettings.tagline;
        if (newSettings.logoUrl !== undefined) brandFields.logoUrl = newSettings.logoUrl;
        if (newSettings.faviconUrl !== undefined) brandFields.faviconUrl = newSettings.faviconUrl;
        if (newSettings.socialLinks !== undefined) brandFields.socialLinks = newSettings.socialLinks;

        const settingFields: any = {};
        if (newSettings.passwordEnabled !== undefined) settingFields.passwordEnabled = newSettings.passwordEnabled;
        if (newSettings.password !== undefined) settingFields.password = newSettings.password;
        if (newSettings.maintenanceMode !== undefined) settingFields.maintenanceMode = newSettings.maintenanceMode;
        if (newSettings.redirects !== undefined) settingFields.redirects = newSettings.redirects;
        if (newSettings.seoDefaults !== undefined) settingFields.seoDefaults = newSettings.seoDefaults;
        if (newSettings.primaryDomain !== undefined) settingFields.primaryDomain = newSettings.primaryDomain;
        const uiConfigKeys = [
          'showBottomNav', 'bottomNavLinks', 'bottomNavStyle', 'bottomNavPosition', 'bottomNavActiveColor',
          'floatingActions', 'floatingPosition', 'floatingStyle', 'decorationsEnabled', 'decorationTrigger'
        ];
        const uiConfig = Object.fromEntries(uiConfigKeys.filter((key) => newSettings[key] !== undefined).map((key) => [key, newSettings[key]]));
        if (Object.keys(uiConfig).length > 0) settingFields.uiConfig = uiConfig;

        const requests: Promise<any>[] = [];
        if (Object.keys(brandFields).length > 0) {
          requests.push(apiClient.patch('/storefront/brand', brandFields));
        }
        if (Object.keys(settingFields).length > 0) {
          requests.push(apiClient.patch('/storefront/settings', settingFields));
        }
        await Promise.all(requests);
      },

      saveThemeToBackend: async (newTheme: Partial<ThemeData>) => {
        await apiClient.patch('/storefront/theme', {
          presetName: newTheme.presetName || (newTheme as any).id || (newTheme as any).name || 'modern',
          palette: newTheme.palette,
          typography: newTheme.typography,
          buttons: newTheme.buttons,
          effects: newTheme.effects,
          customCss: (newTheme as any).customCss,
        });
      },

      savePageDraftToBackend: async (pageId: string) => {
        const page = get().pages.find((item) => item.id === pageId);
        if (!page) {
          throw new Error('The selected page could not be found in the current store.');
        }

        const response = await apiClient.patch<{ message: string; pageId: string; version: number }>(
          `/storefront/pages/${encodeURIComponent(page.id)}/draft`,
          {
            sections: page.sections || [],
            pageProps: page.pageProps || {},
            seoTitle: page.seoTitle || '',
            seoDescription: page.seoDescription || '',
            expectedVersion: page.draftVersion ?? 0,
          }
        );

        set((state) => ({
          pages: state.pages.map((item) =>
            item.id === pageId ? { ...item, draftVersion: response.version } : item
          ),
        }));

        return response;
      },

      publishStoreToBackend: async (notes = 'Published from Store Editor') => {
        const res = await apiClient.post('/storefront/publish', { notes });
        set({ hasUnsavedChanges: false });
        return res;
      },

  updateSectionProps: (pageId, sectionId, newProps) => set((state) => {
    const pages = state.pages.map(page => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        sections: page.sections.map(sec => 
          sec.id === sectionId ? { ...sec, props: { ...sec.props, ...newProps } } : sec
        )
      };
    });
    return { pages, hasUnsavedChanges: true };
  }),

  updateSectionInstance: (pageId, sectionId, patch) => set((state) => {
    const pages = state.pages.map((page) => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        sections: page.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                ...patch,
                props: patch.props ? { ...section.props, ...patch.props } : section.props
              }
            : section
        )
      };
    });
    return { pages, hasUnsavedChanges: true };
  }),

  reorderSections: (pageId, startIndex, endIndex) => set((state) => {
    const pages = state.pages.map(page => {
      if (page.id !== pageId) return page;
      const sections = Array.from(page.sections);
      const [removed] = sections.splice(startIndex, 1);
      sections.splice(endIndex, 0, removed);
      return { ...page, sections };
    });
    return { pages, hasUnsavedChanges: true };
  }),

  toggleSectionVisibility: (pageId, sectionId) => set((state) => {
    const pages = state.pages.map(page => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        sections: page.sections.map(sec => 
          sec.id === sectionId ? { ...sec, isHidden: !sec.isHidden } : sec
        )
      };
    });
    return { pages, hasUnsavedChanges: true };
  }),

  addSection: (pageId, sectionType, insertIndex) => set((state) => {
    const pages = state.pages.map(page => {
      if (page.id !== pageId) return page;
      const newSection = createSection(createSectionId(), sectionType);
      
      const sections = [...page.sections];
      
      if (insertIndex !== undefined && insertIndex !== null) {
        sections.splice(insertIndex, 0, newSection);
      } else {
        const firstFooterIndex = sections.findIndex(s => isFooterComponent(s));
        if (firstFooterIndex !== -1) {
          sections.splice(firstFooterIndex, 0, newSection);
        } else {
          sections.push(newSection);
        }
      }
      
      return { ...page, sections };
    });
    return { pages, hasUnsavedChanges: true };
  }),

  removeSection: (pageId, sectionId) => set((state) => {
    // Clean up content states for the deleted section
    useContentStateStore.getState().deleteSectionStates(sectionId);
    
    const pages = state.pages.map(page => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        sections: page.sections.filter(sec => sec.id !== sectionId)
      };
    });
    return { pages, hasUnsavedChanges: true };
  }),

  duplicateSection: (pageId, sectionId) => set((state) => {
    const pages = state.pages.map(page => {
      if (page.id !== pageId) return page;
      const sectionIndex = page.sections.findIndex(sec => sec.id === sectionId);
      if (sectionIndex === -1) return page;
      const original = page.sections[sectionIndex];
      const duplicate: SectionData = {
        ...original,
        id: `sec-${Date.now()}`,
        name: `${original.name} (Copy)`,
        props: JSON.parse(JSON.stringify(original.props)),
      };
      const sections = [...page.sections];
      sections.splice(sectionIndex + 1, 0, duplicate);
      return { ...page, sections };
    });
    return { pages, hasUnsavedChanges: true };
  }),

  updatePageProps: (pageId, newProps) => set((state) => {
    const pages = state.pages.map(page => 
      page.id === pageId ? { ...page, ...newProps } : page
    );
    return { pages, hasUnsavedChanges: true };
  }),

  addPage: (name, path) => set((state) => {
    const newPage: PageData = {
      id: `page-${Date.now()}`,
      name,
      path,
      type: 'Custom',
      sections: [
        createSection(`announcement-bar-${Date.now()}`, 'AnnouncementBar'),
        createSection(`utility-bar-${Date.now()}`, 'UtilityBar'),
        createSection(`header-${Date.now()}`, 'Header'),
        createSection(`footer-${Date.now()}`, 'Footer'),
      ],
      category: 'storefront',
      status: 'draft',
      pageProps: {},
      visibility: { desktop: true, tablet: true, mobile: true }
    };
    return { pages: [...state.pages, newPage], hasUnsavedChanges: true };
  }),

  removePage: (pageId) => set((state) => ({
    pages: state.pages.filter(page => page.id !== pageId),
    hasUnsavedChanges: true
  })),

  updateTheme: (newTheme, forceHistory = false) => {
    useThemeHistoryStore.getState().pushState(get().theme, forceHistory);
    set((state) => {
      const patch = newTheme as Record<string, any>;
      const merged = mergeThemeData(state.theme, patch);
      // Synchronize legacy colors object if palette is updated
      if (patch.colors) {
        merged.colors = mergeThemeData(state.theme.colors, patch.colors);
        merged.palette = mergeThemeData(merged.palette, {
          brand: { primary: patch.colors.primary, secondary: patch.colors.secondary, accent: patch.colors.accent },
          background: { background: patch.colors.background },
          text: { body: patch.colors.text },
          border: { border: patch.colors.border },
        });
      } else if (patch.palette?.brand?.primary) {
        merged.colors = {
          ...merged.colors,
          primary: patch.palette.brand.primary,
          secondary: patch.palette.brand.secondary || merged.colors.secondary,
          background: patch.palette.background.background || merged.colors.background,
          text: patch.palette.text.body || merged.colors.text,
          accent: patch.palette.brand.accent || merged.colors.accent,
          border: patch.palette.border.border || merged.colors.border,
        };
      }
      return { theme: merged, hasUnsavedChanges: true };
    });
  },

  resetTheme: () => {
    useThemeHistoryStore.getState().pushState(get().theme, true);
    set(() => ({
      theme: getDefaultTheme(),
      hasUnsavedChanges: true,
    }));
  },

  resetAllThemeSettings: () => {
    useThemeHistoryStore.getState().pushState(get().theme, true);
    set((state) => {
      const preset = themePresets[state.theme.presetName] || getDefaultTheme();
      return {
        theme: {
          presetName: state.theme.presetName,
          description: preset.description,
          palette: JSON.parse(JSON.stringify(preset.palette)),
          typography: JSON.parse(JSON.stringify(preset.typography)),
          buttons: JSON.parse(JSON.stringify(preset.buttons)),
          effects: JSON.parse(JSON.stringify(preset.effects)),
          colors: { ...preset.colors },
          ui: { ...preset.ui },
          layout: { ...preset.layout },
          animation: { ...preset.animation },
          customCss: '',
        },
        hasUnsavedChanges: true,
      };
    });
  },

  resetColorPalette: () => {
    useThemeHistoryStore.getState().pushState(get().theme, true);
    set((state) => {
      const preset = themePresets[state.theme.presetName] || getDefaultTheme();
      return {
        theme: {
          ...state.theme,
          colors: { ...preset.colors },
          palette: JSON.parse(JSON.stringify(preset.palette)),
        },
        hasUnsavedChanges: true,
      };
    });
  },

  resetTypography: () => {
    useThemeHistoryStore.getState().pushState(get().theme, true);
    set((state) => {
      const preset = themePresets[state.theme.presetName] || getDefaultTheme();
      return {
        theme: {
          ...state.theme,
          typography: JSON.parse(JSON.stringify(preset.typography)),
        },
        hasUnsavedChanges: true
      };
    });
  },

  resetButtons: () => {
    useThemeHistoryStore.getState().pushState(get().theme, true);
    set((state) => {
      const preset = themePresets[state.theme.presetName] || getDefaultTheme();
      return {
        theme: {
          ...state.theme,
          buttons: JSON.parse(JSON.stringify(preset.buttons)),
        },
        hasUnsavedChanges: true
      };
    });
  },

  resetSpacing: () => {
    useThemeHistoryStore.getState().pushState(get().theme, true);
    set((state) => {
      const preset = themePresets[state.theme.presetName] || getDefaultTheme();
      return {
        theme: {
          ...state.theme,
          spacing: {
            ...DEFAULT_THEME_SPACING,
            ...(preset.spacing || {})
          }
        },
        hasUnsavedChanges: true
      };
    });
  },

  resetEffects: () => {
    useThemeHistoryStore.getState().pushState(get().theme, true);
    set((state) => {
      const preset = themePresets[state.theme.presetName] || getDefaultTheme();
      return {
        theme: {
          ...state.theme,
          effects: JSON.parse(JSON.stringify(preset.effects)),
          ui: { ...preset.ui },
        },
        hasUnsavedChanges: true
      };
    });
  },

  resetCustomCss: () => {
    useThemeHistoryStore.getState().pushState(get().theme, true);
    set((state) => ({
      theme: {
        ...state.theme,
        customCss: '',
      },
      hasUnsavedChanges: true,
    }));
  },

  undoTheme: () => {
    const previousTheme = useThemeHistoryStore.getState().undo(get().theme);
    if (previousTheme) {
      set({ theme: previousTheme, hasUnsavedChanges: true });
    }
  },

  redoTheme: () => {
    const nextTheme = useThemeHistoryStore.getState().redo(get().theme);
    if (nextTheme) {
      set({ theme: nextTheme, hasUnsavedChanges: true });
    }
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
      hasUnsavedChanges: true,
    }));
  },

  // --- Pages Editor Methods ---
  
  updatePageSettings: (pageId, settings) => set((state) => {
    const pages = state.pages.map(page => 
      page.id === pageId ? { ...page, pageProps: { ...page.pageProps, ...settings } } : page
    );
    return { pages, hasUnsavedChanges: true };
  }),
  
  resetPageToDefault: (pageId) => set((state) => {
    const pages = state.pages.map(page => {
      if (page.id !== pageId) return page;
      const config = getAllPageConfigs().find(c => c.type === page.type);
      if (!config) return page;
      
      return {
        ...page,
        sections: generateDefaultSections(pageId, config.type),
        pageProps: { ...config.defaultProps }
      };
    });
    return { pages, hasUnsavedChanges: true };
  }),
  
  publishPage: (pageId) => set((state) => {
    const now = new Date().toISOString();
    const landingPage = state.pages.find(page => page.id === 'landing-page') || state.pages[0];

    if (pageId === 'header-global') {
      const headerSections = (landingPage?.sections || []).filter(isHeaderComponent);
      const snapshot: PageSnapshot = {
        sections: JSON.parse(JSON.stringify(headerSections)),
        pageProps: {},
        publishedAt: now,
      };
      return {
        hasUnsavedChanges: false,
        lastPublishedSnapshots: {
          ...state.lastPublishedSnapshots,
          'header-global': snapshot,
        },
      };
    }

    if (pageId === 'footer-global') {
      const footerSections = (landingPage?.sections || []).filter(isFooterComponent);
      const snapshot: PageSnapshot = {
        sections: JSON.parse(JSON.stringify(footerSections)),
        pageProps: {},
        publishedAt: now,
      };
      return {
        hasUnsavedChanges: false,
        lastPublishedSnapshots: {
          ...state.lastPublishedSnapshots,
          'footer-global': snapshot,
        },
      };
    }

    if (pageId === 'landing-page') {
      const bodySections = (landingPage?.sections || []).filter(isHomepageBodySection);
      const snapshot: PageSnapshot = {
        sections: JSON.parse(JSON.stringify(bodySections)),
        pageProps: JSON.parse(JSON.stringify(landingPage?.pageProps || {})),
        publishedAt: now,
      };
      const pages = state.pages.map(page =>
        page.id === 'landing-page'
          ? { ...page, status: 'published' as const, lastPublishedSnapshot: snapshot }
          : page
      );
      return {
        pages,
        hasUnsavedChanges: false,
        lastPublishedSnapshots: {
          ...state.lastPublishedSnapshots,
          'landing-page': snapshot,
        },
      };
    }

    const targetPage = state.pages.find(page => page.id === pageId);
    if (!targetPage) return state;

    const snapshot: PageSnapshot = {
      sections: JSON.parse(JSON.stringify(targetPage.sections)),
      pageProps: JSON.parse(JSON.stringify(targetPage.pageProps || {})),
      publishedAt: now,
    };

    const pages = state.pages.map(page => 
      page.id === pageId 
        ? { ...page, status: 'published' as const, lastPublishedSnapshot: snapshot } 
        : page
    );

    const updatedSnapshots = {
      ...state.lastPublishedSnapshots,
      [pageId]: snapshot,
    };

    return { 
      pages, 
      hasUnsavedChanges: false, 
      lastPublishedSnapshots: updatedSnapshots 
    };
  }),
  
  unpublishPage: (pageId) => set((state) => {
    if (pageId === 'header-global' || pageId === 'footer-global') {
      const updatedSnapshots = { ...state.lastPublishedSnapshots };
      delete updatedSnapshots[pageId];
      return { lastPublishedSnapshots: updatedSnapshots };
    }

    const pages = state.pages.map(page => 
      page.id === pageId 
        ? { ...page, status: 'draft' as const, lastPublishedSnapshot: undefined } 
        : page
    );
    const updatedSnapshots = { ...state.lastPublishedSnapshots };
    delete updatedSnapshots[pageId];
    return { pages, lastPublishedSnapshots: updatedSnapshots };
  })
    }),
    {
      name: `billionbiz-storage-v${PLATFORM_VERSION.replace(/\./g, '_')}`,
      // Published snapshots used to be persisted three times: on the page,
      // in lastPublishedSnapshots, and (for headers) inside section props.
      // That rapidly exhausts localStorage and blocks every save/publish.
      partialize: (state) => {
        const stripEditorPayload = (section: SectionData): SectionData => {
          const { _headerEditor, _headerRows, _headerSettings, ...props } = section.props || {};
          return { ...section, props };
        };
        const compactSnapshot = (snapshot: PageSnapshot): PageSnapshot => ({
          ...snapshot,
          sections: (snapshot.sections || []).map(stripEditorPayload),
        });
        const { headerEditor: _headerEditor, ...settings } = state.settings || {};
        return {
          pages: state.pages.map((page) => {
            const { lastPublishedSnapshot: _lastPublishedSnapshot, ...pageWithoutSnapshot } = page;
            return {
              ...pageWithoutSnapshot,
              sections: page.sections.map(stripEditorPayload),
            };
          }),
          theme: state.theme,
          settings,
          hasUnsavedChanges: state.hasUnsavedChanges,
          lastPublishedSnapshots: Object.fromEntries(
            Object.entries(state.lastPublishedSnapshots || {}).map(([id, snapshot]) => [id, compactSnapshot(snapshot)])
          ),
        } as unknown as SiteState;
      },
      merge: (persistedState: any, currentState: any) => {
        const defaultTheme = getDefaultTheme();
        const storedTheme = persistedState?.theme || {};
        const storedSnapshots: Record<string, PageSnapshot> = persistedState?.lastPublishedSnapshots || {};

        // Migrate and isolate global header and global footer snapshots from landing-page if needed
        if (storedSnapshots['landing-page'] && storedSnapshots['landing-page'].sections) {
          if (!storedSnapshots['header-global']) {
            const headerSecs = storedSnapshots['landing-page'].sections.filter(isHeaderComponent);
            if (headerSecs.length > 0) {
              storedSnapshots['header-global'] = {
                sections: headerSecs,
                pageProps: {},
                publishedAt: storedSnapshots['landing-page'].publishedAt,
              };
            }
          }
          if (!storedSnapshots['footer-global']) {
            const footerSecs = storedSnapshots['landing-page'].sections.filter(isFooterComponent);
            if (footerSecs.length > 0) {
              storedSnapshots['footer-global'] = {
                sections: footerSecs,
                pageProps: {},
                publishedAt: storedSnapshots['landing-page'].publishedAt,
              };
            }
          }
          storedSnapshots['landing-page'] = {
            ...storedSnapshots['landing-page'],
            sections: storedSnapshots['landing-page'].sections.filter(isHomepageBodySection),
          };
        }
        
        const storedPages = Array.isArray(persistedState?.pages)
          ? persistedState.pages.map((p: any) => {
              const snapshot = p.lastPublishedSnapshot || storedSnapshots[p.id];
              const hasValidSnapshot = Boolean(
                snapshot &&
                snapshot.publishedAt &&
                Array.isArray(snapshot.sections)
              );
              let sections = Array.isArray(p.sections) ? [...p.sections] : [];
              if (p.id === 'landing-page') {
                // Remove legacy uncustomized utility-bar above header if present
                sections = sections.filter((s: any) => !(s && s.id === 'utility-bar' && (!s.props || Object.keys(s.props).length <= 2)));
                
                // Ensure Header is present
                if (!sections.some((s: any) => s && s.type === 'Header')) {
                  sections.unshift(createSection('header-main', 'Header'));
                }
                // Ensure AnnouncementBar is present
                if (!sections.some((s: any) => s && s.type === 'AnnouncementBar')) {
                  sections.unshift(createSection('announcement-bar', 'AnnouncementBar'));
                }
                // Ensure Footer components exist
                if (!sections.some((s: any) => s && s.type === 'Footer')) {
                  sections.push(createSection('footer-main', 'Footer'));
                }
                if (!sections.some((s: any) => s && s.type === 'FooterMenu')) {
                  const footerIdx = sections.findIndex((s: any) => s && s.type === 'Footer');
                  sections.splice(footerIdx !== -1 ? footerIdx : sections.length, 0, createSection('footer-menu', 'FooterMenu'));
                }
                if (!sections.some((s: any) => s && s.type === 'FooterText')) {
                  const footerIdx = sections.findIndex((s: any) => s && s.type === 'Footer');
                  sections.splice(footerIdx !== -1 ? footerIdx : sections.length, 0, createSection('footer-text', 'FooterText'));
                }
                // Filter out legacy mock body sections so the landing page body starts completely clean and empty as requested
                sections = sections.filter((s: any) => {
                  if (s && (s.id === 'hero-main' || s.id === 'newsletter-landing' || s.id === 'featured-products' || s.id === 'trust-badges')) {
                    return false;
                  }
                  return true;
                });
              }
              const nameMap: Record<string, string> = {
                'product-details-page': 'Product Detail',
                'shop-page': 'Product Listing',
                'order-history-page': 'Order Listing',
                'order-details-page': 'Order Detail',
                'register-page': 'Sign Up',
                'account-page': 'Profile',
                'privacy-policy-page': 'Privacy Policy',
                'privacy-page': 'Privacy Policy',
                'terms-conditions-page': 'Terms & Conditions',
                'terms-page': 'Terms & Conditions',
                'return-policy-page': 'Refund Policy',
                'returns-refunds-page': 'Refund Policy',
                'shipping-policy-page': 'Shipping Policy',
              };
              return {
                ...p,
                name: nameMap[p.id] || p.name,
                sections,
                status: hasValidSnapshot && p.status === 'published' ? 'published' : 'draft',
                lastPublishedSnapshot: hasValidSnapshot ? snapshot : undefined,
              };
            })
          : currentState.pages;

        // Ensure missing default pages (e.g. email-verification-page) are included
        const existingIds = new Set(storedPages.map((p: any) => p.id));
        for (const defaultPage of currentState.pages) {
          if (!existingIds.has(defaultPage.id)) {
            storedPages.push(defaultPage);
          }
        }

        const dynamicStoreName = (typeof window !== 'undefined' ? localStorage.getItem('billionbiz_store_name') : null) || 'Chandru Store';
        const rawStoreName = persistedState?.settings?.storeName;
        const resolvedStoreName = (!rawStoreName || rawStoreName === 'BillionBiz' || rawStoreName === 'Shoum') ? dynamicStoreName : rawStoreName;

        const storedSettings = {
          ...currentState.settings,
          ...persistedState?.settings,
          storeName: resolvedStoreName,
          siteName: resolvedStoreName,
        };

        return {
          ...currentState,
          ...persistedState,
          // Persisted editor drafts are only a cache. Keep the preview behind
          // its skeleton until the active tenant's data is fetched.
          isLoading: true,
          settings: storedSettings,
          pages: storedPages,
          lastPublishedSnapshots: storedSnapshots,
          theme: {
            ...defaultTheme,
            ...storedTheme,
            palette: storedTheme.palette ? {
              ...defaultTheme.palette,
              ...storedTheme.palette,
              background: {
                ...defaultTheme.palette.background,
                ...storedTheme.palette.background,
                footerBg: storedTheme.palette.background?.footerBg || defaultTheme.palette.background.footerBg,
              },
              text: {
                ...defaultTheme.palette.text,
                ...storedTheme.palette.text,
                footerText: storedTheme.palette.text?.footerText || defaultTheme.palette.text.footerText,
              },
            } : defaultTheme.palette,
            typography: storedTheme.typography ? { ...defaultTheme.typography, ...storedTheme.typography } : defaultTheme.typography,
            buttons: storedTheme.buttons ? { ...defaultTheme.buttons, ...storedTheme.buttons } : defaultTheme.buttons,
            effects: storedTheme.effects ? { ...defaultTheme.effects, ...storedTheme.effects } : defaultTheme.effects,
          }
        };
      }
    }
  )
);

/**
 * Canonical native Online Store hook for BillionBiz
 * Backward-compatible alias `useSiteStore` provided during migration.
 */
export const useSiteStore = useOnlineStore;

/**
 * Non-destructive store initialization
 * Invariant: Never wipe merchant data on version changes or platform upgrades.
 */
export const resetEntirePlatformStore = () => {
  console.warn('[BillionBiz Platform] resetEntirePlatformStore called; non-destructive mode preserved.');
};

if (typeof window !== 'undefined') {
  (window as any).__onlineStore = useOnlineStore;
  (window as any).__siteStore = useOnlineStore;
  (window as any).__resetEntirePlatformStore = resetEntirePlatformStore;
}
