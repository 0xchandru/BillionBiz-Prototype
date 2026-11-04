import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Files, Store, Palette, Settings,
  Home, ShoppingBag, ShoppingCart,
  Search as SearchIcon, AlertTriangle, Cookie, Bell, FileText,
  Shield, Truck, RotateCcw, Phone, Heart,
  HelpCircle, Layout, PanelLeftClose, PanelLeftOpen,
  Building2, Lock, Layers,
  LayoutGrid, Tag, Gift, CheckCircle2, List, ChevronRight, User,
  Mail, Plus, Eye, EyeOff, Trash2, GripVertical,
} from 'lucide-react';
import { BrandPanel } from './panels/BrandPanel';
import { DesignPanel } from './panels/DesignPanel';
import { SettingsPanel } from './panels/SettingsPanel';
import { ComponentTreePanel } from './engine/ComponentTreePanel';
import { FooterTreePanel } from './engine/FooterTreePanel';
import { useEditorContextStore } from '../../store/editorContextStore';
import { scrollPreviewToHeaderSection } from './utils/previewScroll';

import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore, isHomepageBodySection } from '../../store/siteStore';
import { getPageConfig } from './pageConfigs';
import styles from '../../pages/editor/EditorLayout.module.css';
import type { EditorPanelType } from '../../store/landingEditorStore';
import { getEditorPath, resolveHeaderRowId } from './utils/editorNavigation';

// ─── Icon mapping for pages matching user specification ───
const pageIconMap: Record<string, React.FC<{ size?: number }>> = {
  'landing': Home,
  'landing-page': Home,
  'maintenance': AlertTriangle,
  'maintenance-page': AlertTriangle,
  'product-details': ShoppingBag,
  'product-details-page': ShoppingBag,
  'shop': LayoutGrid,
  'shop-page': LayoutGrid,
  'wishlist': Heart,
  'wishlist-page': Heart,
  'cart': ShoppingCart,
  'cart-page': ShoppingCart,
  'checkout': Tag,
  'checkout-page': Tag,
  'booking': FileText,
  'booking-page': FileText,
  'order-confirmation': CheckCircle2,
  'order-confirmation-page': CheckCircle2,
  'thank-you': Gift,
  'thank-you-page': Gift,
  'order-history': List,
  'order-history-page': List,
  'order-details': List,
  'order-details-page': List,
  'order-tracking': Truck,
  'order-tracking-page': Truck,
  'about': Building2,
  'about-page': Building2,
  'contact': Phone,
  'contact-page': Phone,
  'faq': HelpCircle,
  'faq-page': HelpCircle,
  'privacy': Shield,
  'privacy-page': Shield,
  'privacy-policy': Shield,
  'privacy-policy-page': Shield,
  'terms': Shield,
  'terms-page': Shield,
  'terms-conditions': FileText,
  'terms-conditions-page': FileText,
  'shipping-policy': Truck,
  'shipping-policy-page': Truck,
  'returns-refunds': RotateCcw,
  'returns-refunds-page': RotateCcw,
  'return-policy': RotateCcw,
  'return-policy-page': RotateCcw,
  'refund-policy': RotateCcw,
  'refund-policy-page': RotateCcw,
  'search': SearchIcon,
  'search-page': SearchIcon,
  'not-found': AlertTriangle,
  'not-found-page': AlertTriangle,
  'collections': Layout,
  'collections-page': Layout,
  'collection-details': Layout,
  'collection-details-page': Layout,
  'account': User,
  'account-page': User,
  'login': Lock,
  'login-page': Lock,
  'register': User,
  'register-page': User,
  'forgot-password': Lock,
  'forgot-password-page': Lock,
  'reset-password': Lock,
  'reset-password-page': Lock,
  'email-verification': Mail,
  'email-verification-page': Mail,
  'reviews': Heart,
  'reviews-page': Heart,
};

// ─── Top-Level Navigation Tabs (5-Tab Architecture) ───
interface TabDef {
  id: EditorPanelType;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const TABS: TabDef[] = [
  { id: 'pages', label: 'Pages', icon: Files },
  { id: 'brand', label: 'Brand', icon: Store },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ─── Chrome component entries (Header, Footer, Toaster, Cookie / Consent) ───
interface ChromeComponentDef {
  id: string;
  label: string;
  icon: React.FC<{ size?: number }>;
  type: 'global';
  badge: string;
}

const CHROME_COMPONENTS: ChromeComponentDef[] = [
  { id: 'header-global', label: 'Header', icon: Layers, type: 'global', badge: 'All pages' },
  { id: 'footer-global', label: 'Footer', icon: Layers, type: 'global', badge: 'All pages' },
  { id: 'toaster-global', label: 'Toaster', icon: Bell, type: 'global', badge: 'All pages' },
  { id: 'cookie-consent-global', label: 'Cookie / Consent', icon: Cookie, type: 'global', badge: 'All pages' },
];

export const EditorLeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    activePanel, setActivePanel,
    selectedSectionId: _selectedSectionId, setSelectedSectionId,
    selectedPageId,
    isLeftSidebarCollapsed, setLeftSidebarCollapsed,
    pagesNavLevel, navigateToPage,
    isRightSidebarOpen, setRightSidebarOpen,
  } = useLandingEditorStore();
  const { pages, updatePageProps, removeSection } = useSiteStore();
  const activePage = pages.find(p => p.id === selectedPageId) || pages[0];

  const headerBarTypes = ['AnnouncementBar', 'UtilityBar'];
  const footerBarTypes = ['FooterTrust', 'FooterNewsletter', 'FooterSocial', 'FooterBottom', 'FooterMenu', 'FooterText'];
  const isFooterMain = (t?: string) => t === 'Footer' || t === 'FooterMain';

  // Scroll retention for pages list
  const pagesListScrollRef = useRef<HTMLDivElement>(null);
  const pagesListScrollTopRef = useRef<number>(0);

  useEffect(() => {
    if (pagesNavLevel === 'list' && pagesListScrollRef.current) {
      pagesListScrollRef.current.scrollTop = pagesListScrollTopRef.current;
    }
  }, [pagesNavLevel]);

  // Synchronize master context store editorType with active global view
  useEffect(() => {
    if (selectedPageId === 'header-global') {
      const context = useEditorContextStore.getState();
      context.setEditorType('header');
      const target = context.selectedTarget;
      const isHeaderTarget =
        (target.type === 'row' || target.type === 'element') &&
        target.editorType === 'header' &&
        Boolean(target.rowId);

      if (!isHeaderTarget) {
        const landingStore = useLandingEditorStore.getState();
        const currentSectionId = landingStore.selectedSectionId;
        const isKnownHeaderSection =
          Boolean(currentSectionId) &&
          (['header-main', 'announcement-bar', 'utility-bar', 'category-bar', 'secondary-nav'].includes(currentSectionId!) ||
           currentSectionId!.startsWith('row-') ||
           currentSectionId!.startsWith('header-'));

        const targetRowId = resolveHeaderRowId(isKnownHeaderSection ? currentSectionId : null, context.headerRows);
        context.selectTarget({ type: 'row', editorType: 'header', rowId: targetRowId });
        if (!isKnownHeaderSection) {
          setSelectedSectionId('header-main');
        }
      }
    } else if (selectedPageId === 'footer-global') {
      const context = useEditorContextStore.getState();
      context.setEditorType('footer');
      context.selectTarget({ type: 'none' });
    } else {
      const context = useEditorContextStore.getState();
      context.setEditorType('page');
      if (context.selectedTarget.type !== 'none') {
        context.selectTarget({ type: 'none' });
      }
    }
  }, [selectedPageId]);

  // Cleanup duplicate locked sections
  useEffect(() => {
    if (activePage && activePage.sections) {
      const seen = new Set<string>();
      const deduplicated = activePage.sections.filter(s => {
        if (s.type === 'Header' || s.type === 'Footer') {
          if (seen.has(s.type)) return false;
          seen.add(s.type);
        }
        return true;
      });

      const headerBars = deduplicated.filter(s => headerBarTypes.includes(s.type));
      const header = deduplicated.find(s => s.type === 'Header');
      const templateSections = deduplicated.filter(
        s => !headerBarTypes.includes(s.type) &&
          s.type !== 'Header' &&
          !footerBarTypes.includes(s.type) &&
          !isFooterMain(s.type)
      );
      const footerBars = deduplicated.filter(s => footerBarTypes.includes(s.type));
      const footer = deduplicated.find(s => isFooterMain(s.type));

      const canonical = [
        ...headerBars,
        ...(header ? [header] : []),
        ...templateSections,
        ...footerBars,
        ...(footer ? [footer] : []),
      ];

      const isChanged =
        canonical.length !== activePage.sections.length ||
        canonical.some((s, i) => s.id !== activePage.sections[i]?.id);

      if (isChanged) {
        updatePageProps(activePage.id, { sections: canonical });
      }
    }
  }, [activePage?.id, activePage?.sections, updatePageProps]);

  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Search state in Pages tab
  const [pageSearch, setPageSearch] = useState('');

  // ─── TAB CLICK HANDLER ───
  const handleTabClick = (tabId: EditorPanelType) => {
    setActivePanel(tabId);
    const routeMap: Record<string, string> = {
      'pages': '/editor/pages',
      'brand': '/editor/brand',
      'design': '/editor/design',
      'settings': '/editor/settings',
      'store-brand': '/editor/brand',
      'design-experience': '/editor/design',
      'seo-growth': '/editor/brand',
    };
    navigate(routeMap[tabId] || '/editor/pages');
  };

  // ─────────────────────────────────────────────────────
  // RENDER: CONTEXTUAL CONTENT FOR EACH OF THE 4 TABS
  // ─────────────────────────────────────────────────────

  const renderContextualPanel = () => {
    switch (activePanel) {
      case 'pages':
        return renderPagesPanel();
      case 'design':
      case 'design-experience':
        return <DesignPanel />;
      case 'brand':
      case 'store-brand':
      case 'seo-growth':
        return <BrandPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return renderPagesPanel();
    }
  };

  const renderEditorDetailHeader = (title: string, description?: string) => (
    <div
      className={styles.contextPanelHeader}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <h3 className={styles.contextPanelTitle} style={{ fontSize: '14px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </h3>
        {description && <p className={styles.contextPanelDesc} style={{ margin: '2px 0 0' }}>{description}</p>}
      </div>
      <button
        onClick={() => setLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        className={styles.collapseBtn}
        title={isLeftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        type="button"
      >
        {isLeftSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      </button>
    </div>
  );

  // ─── TAB 1: PAGES PANEL ───
  const renderPagesPanel = () => {
    if (pagesNavLevel === 'page-detail') {
      if (selectedPageId === 'header-global') {
        return (
          <div className={styles.contextPanelInner} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', width: '100%' }}>
            {renderEditorDetailHeader(
              'Header Editor',
              'Universal Storefront Header'
            )}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
              <ComponentTreePanel editorType="header" />
            </div>
          </div>
        );
      }
      if (selectedPageId === 'footer-global') {
        return (
          <div className={styles.contextPanelInner} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', width: '100%' }}>
            {renderEditorDetailHeader(
              'Footer Editor',
              'Universal Storefront Footer'
            )}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
              <FooterTreePanel />
            </div>
          </div>
        );
      }
      if (selectedPageId === 'cookie-consent-global') return renderCookieConsentDetailView();
      if (selectedPageId === 'toaster-global') return renderToasterDetailView();
      return renderPageDetailView();
    }
    return renderPageListView();
  };

  const renderPageListView = () => {
    const filterFn = (p: typeof pages[0]) => {
      if (!pageSearch.trim()) return true;
      const q = pageSearch.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) || (p.path || '').toLowerCase().includes(q);
    };

    const allFilteredPages = pages.filter(filterFn);

    // 1. COMMERCE & STOREFRONT: Home, Shop, Collections, Product Details, Cart, Checkout
    const commercePagesRaw = allFilteredPages.filter(p =>
      p.path === '/' ||
      p.path === '/shop' ||
      p.path.startsWith('/collections') ||
      p.path.startsWith('/products') ||
      p.path === '/cart' ||
      p.path === '/checkout' ||
      ['landing', 'landing-page', 'shop', 'shop-page', 'product-details', 'product-details-page', 'cart', 'cart-page', 'checkout', 'checkout-page', 'collections', 'collections-page', 'wishlist-page'].includes(p.id) ||
      ['landing', 'shop', 'product_detail', 'cart', 'checkout', 'collection'].includes(p.type)
    );

    const commercePriorityMap: Record<string, number> = {
      'landing-page': 1,
      'landing': 1,
      '/': 1,
      'shop-page': 2,
      'shop': 2,
      '/shop': 2,
      'product-details-page': 3,
      'product-details': 3,
      '/products': 3,
      'collections-page': 4,
      'collections': 4,
      '/collections': 4,
      'collection-details-page': 5,
      'cart-page': 6,
      'cart': 6,
      '/cart': 6,
      'checkout-page': 7,
      'checkout': 7,
      '/checkout': 7,
      'wishlist-page': 8,
      'wishlist': 8,
      '/wishlist': 8,
    };

    const commercePages = [...commercePagesRaw].sort((a, b) => {
      const pA = commercePriorityMap[a.id] || commercePriorityMap[a.path] || 99;
      const pB = commercePriorityMap[b.id] || commercePriorityMap[b.path] || 99;
      return pA - pB;
    });

    // 2. CUSTOMER & SERVICES: Account, Book Appointment, Order History
    const servicesPages = allFilteredPages.filter(p =>
      !commercePages.includes(p) && (
        p.path === '/account' ||
        p.path.startsWith('/account/') ||
        p.path === '/book' ||
        p.path === '/booking' ||
        ['account', 'account-page', 'booking', 'booking-page', 'order-history', 'order-history-page', 'order-details', 'order-details-page', 'order-tracking', 'order-tracking-page', 'login-page', 'register-page'].includes(p.id) ||
        ['account', 'booking'].includes(p.type)
      )
    );

    // 3. LEGAL POLICIES: Privacy, Terms, Refund, Shipping
    const legalPages = allFilteredPages.filter(p =>
      !commercePages.includes(p) && !servicesPages.includes(p) && (
        p.path.startsWith('/policies/') ||
        ['/privacy', '/terms', '/refund', '/shipping'].includes(p.path) ||
        ['privacy-policy-page', 'privacy-page', 'terms-conditions-page', 'terms-page', 'return-policy-page', 'returns-refunds-page', 'refund-policy-page', 'shipping-policy-page'].includes(p.id) ||
        p.type === 'policy'
      )
    );

    // 4. SYSTEM & UTILITY: Contact, 404, Password, Maintenance
    const systemPages = allFilteredPages.filter(p =>
      !commercePages.includes(p) && !servicesPages.includes(p) && !legalPages.includes(p) && (
        p.path === '/contact' ||
        p.path === '/404' ||
        p.path === '/password' ||
        p.path === '/maintenance' ||
        ['contact', 'contact-page', 'not-found', 'not-found-page', 'maintenance', 'maintenance-page', 'password', 'password-page'].includes(p.id) ||
        ['contact', 'maintenance', 'system', '404', 'password'].includes(p.type) ||
        (p as any).is_system
      )
    );

    // 5. CUSTOM PAGES: Any user-created custom pages
    const customPages = allFilteredPages.filter(p =>
      !commercePages.includes(p) &&
      !servicesPages.includes(p) &&
      !legalPages.includes(p) &&
      !systemPages.includes(p)
    );

    // 6. GLOBAL CHROME: Header, Footer, Toaster, Cookie / Consent
    const chromeComponentsFiltered = CHROME_COMPONENTS.filter(gc =>
      !pageSearch.trim() ||
      gc.label.toLowerCase().includes(pageSearch.toLowerCase()) ||
      gc.badge.toLowerCase().includes(pageSearch.toLowerCase())
    );

    return (
      <div className={styles.contextPanelInner}>
        <div className={styles.contextPanelHeader}>
          <div>
            <h3 className={styles.contextPanelTitle}>Pages &amp; Layout</h3>
            <p className={styles.contextPanelDesc}>All editable storefront pages &amp; templates</p>
          </div>
          <button
            onClick={() => setLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
            className={styles.collapseBtn}
            title={isLeftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isLeftSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Quick Search */}
        <div className={styles.pageSearchContainer}>
          <div className={styles.pageSearchWrapper}>
            <SearchIcon size={14} className={styles.pageSearchIcon} />
            <input
              type="text"
              placeholder="Search pages..."
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              className={styles.pageSearchInput}
            />
          </div>
        </div>

        <div
          ref={pagesListScrollRef}
          className={styles.contextPanelScroll}
          onScroll={(e) => {
            pagesListScrollTopRef.current = e.currentTarget.scrollTop;
          }}
        >
          {/* Group 1: COMMERCE & STOREFRONT */}
          {commercePages.length > 0 && (
            <div className={styles.navGroup} style={{ marginBottom: '14px' }}>
              <div className={styles.referenceGroupHeader}>
                <span>COMMERCE</span>
                <span className={styles.referenceGroupCount}>{commercePages.length}</span>
              </div>
              {commercePages.map(page => renderPageListItem(page))}
            </div>
          )}

          {/* Group 2: CUSTOMER & SERVICES */}
          {servicesPages.length > 0 && (
            <div className={styles.navGroup} style={{ marginBottom: '14px' }}>
              <div className={styles.referenceGroupHeader}>
                <span>SERVICES &amp; ACCOUNT</span>
                <span className={styles.referenceGroupCount}>{servicesPages.length}</span>
              </div>
              {servicesPages.map(page => renderPageListItem(page))}
            </div>
          )}

          {/* Group 3: LEGAL POLICIES */}
          {legalPages.length > 0 && (
            <div className={styles.navGroup} style={{ marginBottom: '14px' }}>
              <div className={styles.referenceGroupHeader}>
                <span>LEGAL POLICIES</span>
                <span className={styles.referenceGroupCount}>{legalPages.length}</span>
              </div>
              {legalPages.map(page => renderPageListItem(page))}
            </div>
          )}

          {/* Group 4: SYSTEM & UTILITY */}
          {systemPages.length > 0 && (
            <div className={styles.navGroup} style={{ marginBottom: '14px' }}>
              <div className={styles.referenceGroupHeader}>
                <span>SYSTEM &amp; UTILITY</span>
                <span className={styles.referenceGroupCount}>{systemPages.length}</span>
              </div>
              {systemPages.map(page => renderPageListItem(page))}
            </div>
          )}

          {/* Group 5: CUSTOM PAGES (if any created) */}
          {customPages.length > 0 && (
            <div className={styles.navGroup} style={{ marginBottom: '14px' }}>
              <div className={styles.referenceGroupHeader}>
                <span>CUSTOM PAGES</span>
                <span className={styles.referenceGroupCount}>{customPages.length}</span>
              </div>
              {customPages.map(page => renderPageListItem(page))}
            </div>
          )}

          {/* Group 6: CHROME */}
          {chromeComponentsFiltered.length > 0 && (
            <div className={styles.navGroup} style={{ marginBottom: '14px' }}>
              <div className={styles.referenceGroupHeader}>
                <span>CHROME</span>
                <span className={styles.referenceGroupCount}>{chromeComponentsFiltered.length}</span>
              </div>
              {chromeComponentsFiltered.map(gc => {
                const isSelected = selectedPageId === gc.id && pagesNavLevel === 'page-detail' && isRightSidebarOpen;
                return (
                  <div
                    key={gc.id}
                    className={`${styles.navItem} ${isSelected ? styles.navItemActive : ''}`}
                    onClick={() => {
                      if (pagesListScrollRef.current) {
                        pagesListScrollTopRef.current = pagesListScrollRef.current.scrollTop;
                      }

                      const isHeaderFamily = gc.id === 'header-global';
                      if (isHeaderFamily) {
                        let targetRowId = 'row-primary-nav';
                        let targetSectionId = 'header-main';

                        navigateToPage('header-global', targetSectionId);
                        navigate(getEditorPath('header-global', targetSectionId));
                        useEditorContextStore.getState().setEditorType('header');

                        setSelectedSectionId(targetSectionId);
                        useEditorContextStore.getState().selectTarget({
                          type: 'row',
                          editorType: 'header',
                          rowId: targetRowId,
                        });
                        setRightSidebarOpen(true);
                        scrollPreviewToHeaderSection(targetRowId);
                        return;
                      }

                      if (gc.id === 'footer-global') {
                        let targetSectionId = 'footer-main';

                        navigateToPage('footer-global', targetSectionId);
                        navigate(getEditorPath('footer-global', targetSectionId));
                        useEditorContextStore.getState().setEditorType('footer');

                        setSelectedSectionId(targetSectionId);
                        useEditorContextStore.getState().selectTarget({ type: 'none' });
                        setRightSidebarOpen(false);
                        return;
                      }
                    }}
                  >
                    <div className={`${styles.navItemIcon} ${isSelected ? styles.navItemIconActive : ''}`}>
                      <gc.icon size={16} />
                    </div>
                    <span className={`${styles.navItemLabel} ${isSelected ? styles.navItemLabelActive : ''}`}>{gc.label}</span>
                    <span className={styles.allPagesBadge}>{gc.badge}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Divider Line above Legal */}
          {legalPages.length > 0 && (
            <>
              <div style={{ height: '1px', backgroundColor: 'var(--border-color, #e2e8f0)', margin: '14px 4px 14px' }} />

              {/* Group 8: LEGAL */}
              <div className={styles.navGroup} style={{ marginBottom: '14px' }}>
                <div className={styles.referenceGroupHeader}>
                  <span>LEGAL</span>
                  <span className={styles.referenceGroupCount}>{legalPages.length}</span>
                </div>
                {legalPages.map(page => renderPageListItem(page))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderPageListItem = (page: typeof pages[0]) => {
    const isSelected = page.id === selectedPageId && pagesNavLevel === 'page-detail' && isRightSidebarOpen;
    const Icon = pageIconMap[page.type] || pageIconMap[page.id] || (getPageConfig(page.type)?.icon) || FileText;
    const isSystemLocked = (page as any).is_system || (page as any).is_locked;

    return (
      <div
        key={page.id}
        className={`${styles.navItem} ${isSelected ? styles.navItemActive : ''}`}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '8px' }}
        onClick={() => {
          if (pagesListScrollRef.current) {
            pagesListScrollTopRef.current = pagesListScrollRef.current.scrollTop;
          }
          navigateToPage(page.id);
          navigate(getEditorPath(page.id));
          if (page.id !== 'landing-page') {
            setRightSidebarOpen(true);
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <div className={`${styles.navItemIcon} ${isSelected ? styles.navItemIconActive : ''}`}>
            <Icon size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <span className={`${styles.navItemLabel} ${isSelected ? styles.navItemLabelActive : ''}`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {page.name}
            </span>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
              {page.path}
            </span>
          </div>
        </div>

        {isSystemLocked ? (
          <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontWeight: 600, border: '1px solid #e2e8f0' }} title="System Protected Page">
            Locked
          </span>
        ) : (
          <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: page.status === 'published' ? '#dcfce7' : '#fef3c7', color: page.status === 'published' ? '#15803d' : '#b45309', fontWeight: 600 }}>
            {page.status === 'published' ? 'Live' : 'Draft'}
          </span>
        )}
      </div>
    );
  };


  // ─── GLOBAL COOKIE CONSENT DETAIL VIEW ───
  const renderCookieConsentDetailView = () => {
    return (
      <div className={styles.contextPanelInner}>
        {renderEditorDetailHeader('Cookie Consent', 'GDPR & privacy consent banner')}

        <div className={styles.contextPanelScroll}>
          <div style={{ padding: '16px' }}>
            <div className={styles.navItem} onClick={() => setRightSidebarOpen(true)}>
              <div className={styles.navItemIcon}>
                <Cookie size={15} />
              </div>
              <div className={styles.navItemContent}>
                <span className={styles.navItemLabel}>Consent Banner Configuration</span>
                <span className={styles.navItemPath}>Notice text, policy URL & accept buttons</span>
              </div>
              <ChevronRight size={14} className={styles.navItemChevron} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── GLOBAL TOASTER DETAIL VIEW ───
  const renderToasterDetailView = () => {
    return (
      <div className={styles.contextPanelInner}>
        {renderEditorDetailHeader('Notifications & Toasts', 'Cart updates, order alerts & toaster popups')}

        <div className={styles.contextPanelScroll}>
          <div style={{ padding: '16px' }}>
            <div className={styles.navItem} onClick={() => setRightSidebarOpen(true)}>
              <div className={styles.navItemIcon}>
                <Bell size={15} />
              </div>
              <div className={styles.navItemContent}>
                <span className={styles.navItemLabel}>Toast Notification Style</span>
                <span className={styles.navItemPath}>Position, animation & sound effects</span>
              </div>
              <ChevronRight size={14} className={styles.navItemChevron} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── PAGE DETAIL VIEW: Sections, Blocks & Templates (Strictly section authoring, No SEO forms) ───
  const renderPageDetailView = () => {
    if (!activePage) return null;

    const sections = (activePage.sections || []).filter(isHomepageBodySection);

    return (
      <div className={styles.contextPanelInner} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', width: '100%' }}>
        {renderEditorDetailHeader(activePage.name, 'Sections & Blocks')}

        <div className={styles.contextPanelScroll} style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          {sections.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', marginBottom: 12 }}>
                <Layers size={22} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>No sections added yet</div>
              <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4, maxWidth: 220, lineHeight: 1.45 }}>
                Click "+ Add Section" below to add a Hero, Featured Collection, or custom content block.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', padding: '4px 2px' }}>
                Template Sections ({sections.length})
              </div>
              {sections.map((sec, idx) => {
                const isSelected = _selectedSectionId === sec.id;
                return (
                  <div
                    key={sec.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                    onClick={() => {
                      setSelectedSectionId(sec.id);
                      setRightSidebarOpen(true);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      <GripVertical size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: isSelected ? '#1d4ed8' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sec.name || sec.type}
                        </span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{sec.type}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (activePage.sections || []).map(s => s.id === sec.id ? { ...s, isHidden: !s.isHidden } : s);
                          updatePageProps(activePage.id, { sections: updated });
                        }}
                        style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: sec.isHidden ? '#94a3b8' : '#334155' }}
                        title={sec.isHidden ? 'Show section' : 'Hide section'}
                      >
                        {sec.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSectionToDelete(sec.id)}
                        style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
                        title="Delete section"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Section Button at Bottom of Left Sidebar */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color, #e2e8f0)', backgroundColor: '#ffffff' }}>
          <button
            type="button"
            onClick={() => useLandingEditorStore.getState().setAddSectionWidgetOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
          >
            <Plus size={15} />
            <span>Add Section</span>
          </button>
        </div>
      </div>
    );
  };

  // ─── TAB 2, 3, 4: DESIGN, STORE & BRAND, SETTINGS PANELS ───
  // ─── Panels for Design, Store & Brand, and Settings tabs ───
  // Extracted to: panels/DesignPanel.tsx, panels/BrandPanel.tsx, panels/SettingsPanel.tsx
  // The renderContextualPanel() switch above renders them as imported components.





  // ─────────────────────────────────────────────────────
  // RENDER: MAIN SIDEBAR CONTENT (HORIZONTAL TABS ON TOP)
  // ─────────────────────────────────────────────────────

  const isPageDetail = activePanel === 'pages' && pagesNavLevel === 'page-detail';

  const sidebarContent = (
    <div className={styles.horizontalTabsSidebar}>
      {/* Level 1: Exactly 4 Horizontal Tabs on Top of the Vertical Sidebar */}
      {!isPageDetail && (
        <div className={styles.horizontalTabBar}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id || (tab.id === 'brand' && (activePanel === 'store-brand' || activePanel === 'seo-growth')) || (tab.id === 'design' && activePanel === 'design-experience');
            return (
              <button
                key={tab.id}
                className={`${styles.horizontalTabBtn} ${isActive ? styles.horizontalTabBtnActive : ''}`}
                onClick={() => handleTabClick(tab.id)}
                title={tab.label}
                type="button"
              >
                <Icon size={18} className={styles.horizontalTabIcon} />
                <span className={styles.horizontalTabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Level 2: Contextual Panel Content for Selected Tab */}
      <div className={styles.sidebarPanelBody}>
        {renderContextualPanel()}
      </div>

      {/* Delete section confirmation modal */}
      {sectionToDelete && createPortal(
        <div className={styles.fullscreenModalOverlay} style={{ zIndex: 99999 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '320px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontFamily: '"Outfit", sans-serif' }}>Delete Section</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text-muted)' }}>Are you sure you want to delete this section? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSectionToDelete(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeSection(activePage.id, sectionToDelete);
                  setSectionToDelete(null);
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '13px', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );

  const shouldCollapse = isLeftSidebarCollapsed;

  if (shouldCollapse) {
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '48px',
          position: 'relative',
          flexShrink: 0,
          zIndex: 40
        }}
      >
        {/* Collapsed strip with quick expand button and icon toggles */}
        <div className={styles.horizontalCollapsedStrip}>
          <button
            className={styles.collapsedExpandBtn}
            onClick={() => setLeftSidebarCollapsed(false)}
            title="Expand sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
          <div className={styles.collapsedDivider} />
          {!isPageDetail && TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id || (tab.id === 'brand' && (activePanel === 'store-brand' || activePanel === 'seo-growth')) || (tab.id === 'design' && activePanel === 'design-experience');
            return (
              <button
                key={tab.id}
                className={`${styles.collapsedTabIconBtn} ${isActive ? styles.collapsedTabIconBtnActive : ''}`}
                onClick={() => {
                  handleTabClick(tab.id);
                  setLeftSidebarCollapsed(false);
                }}
                title={tab.label}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        {/* Hover expansion */}
        <aside
          className={styles.leftPanel}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '310px',
            zIndex: 100,
            transform: isHovered ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isHovered ? '0 10px 25px -5px rgba(0,0,0,0.15)' : 'none',
          }}
        >
          {sidebarContent}
        </aside>
      </div>
    );
  }

  return (
    <aside className={styles.leftPanel}>
      {sidebarContent}
    </aside>
  );
};
