// ============================================================
// MASTER EDITOR ENGINE — DYNAMIC CONTEXTUAL COMMAND PALETTE
// Dynamically detects the current page editor (Header, Footer, Homepage,
// Pages, Theme, Settings, Brand) and
// displays intelligent, crash-proof contextual search options.
// ============================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Palette,
  Settings,
  Eye,
  UploadCloud,
  Layers,
  Monitor,
  Tablet,
  Smartphone,
  Columns,
  FileText,
  CheckCircle2,
  X,
  Command,
  ShieldCheck,
  Sparkles,
  Megaphone,
  Phone,
  CreditCard,
  Mail,
  Share2,
  Box,
  SlidersHorizontal,
  FolderOpen,
  Store,
  Compass,
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useSiteStore } from '../../../store/siteStore';
import styles from './topbar.module.css';
import { getEditorPath } from '../utils/editorNavigation';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  badge: string;
  badgeColor?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onPublish,
  onPreview,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    activePanel,
    pagesNavLevel,
    setActivePanel,
    setAddSectionWidgetOpen,
    setSelectedThemeCategory,
    setDevice,
    setSelectedSectionId,
    selectedPageId,
    navigateToPage,
    setActiveSettingItem,
    setRightSidebarOpen,
  } = useLandingEditorStore();

  const { pages = [] } = useSiteStore();
  const editorEngineStore = useEditorContextStore();

  // Safely find pages
  const landingPage = pages.find((p) => p && p.id === 'landing-page') || pages[0] || { id: 'landing-page', name: 'Homepage', sections: [] };
  const activePage = pages.find((p) => p && p.id === selectedPageId) || landingPage;

  // Context Detection
  const isHeaderEditor = selectedPageId === 'header-global';
  const isFooterEditor = selectedPageId === 'footer-global';
  const isThemeEditor = activePanel === 'design' || activePanel === 'design-experience';
  const isBrandEditor = activePanel === 'brand' || activePanel === 'store-brand';
  const isSettingsEditor = activePanel === 'settings';
  const isPages = activePanel === 'pages';
  const isPageDetail = (isPages && pagesNavLevel === 'page-detail') || isHeaderEditor || isFooterEditor;

  const getScopeBadge = () => {
    if (isHeaderEditor) return 'Header Editor';
    if (isFooterEditor) return 'Footer Editor';
    if (isThemeEditor) return 'Theme Styles';
    if (isBrandEditor) return 'Store & Brand';
    if (isSettingsEditor) return 'Settings';
    if (selectedPageId === 'landing-page') return 'Homepage';
    return activePage?.name || 'Page Editor';
  };
  const scopeBadge = getScopeBadge();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ─── 1. BUILD DYNAMIC CONTEXTUAL OPTIONS ───
  const contextualItems = useMemo<PaletteItem[]>(() => {
    const items: PaletteItem[] = [];

    // A. HEADER EDITOR CONTEXTUAL OPTIONS
    if (isHeaderEditor) {
      const headerRows = editorEngineStore.headerRows || [];
      headerRows.forEach((row) => {
        if (!row) return;
        const icon =
          row.type === 'announcement' ? <Megaphone size={14} color="#f59e0b" /> :
          row.type === 'utility' ? <Phone size={14} color="#0ea5e9" /> :
          row.type === 'primary-nav' ? <Compass size={14} color="#10b981" /> :
          row.type === 'promo' ? <Sparkles size={14} color="#ec4899" /> :
          row.type === 'secondary-nav' ? <Layers size={14} color="#8b5cf6" /> :
          <Box size={14} color="#6366f1" />;

        items.push({
          id: `header-row-${row.id}`,
          title: `Edit ${row.name || row.type}`,
          subtitle: `Row: ${row.type} • Height: ${row.layout?.height || 60}px`,
          badge: 'Header Component',
          badgeColor: '#2563eb',
          icon,
          action: () => {
            editorEngineStore.selectTarget({ type: 'row', editorType: 'header', rowId: row.id });
            setRightSidebarOpen(true);
            onClose();
          },
        });
      });

      // Quick Header Presets & Actions
      items.push(
        {
          id: 'browse-header-variants',
          title: 'Browse Header Variants (10 Variants)',
          subtitle: 'Modern Commerce, Floating Pill, Centered Logo, Tech SaaS, Luxury...',
          badge: 'Presets',
          badgeColor: '#7c3aed',
          icon: <Sparkles size={14} color="#7c3aed" />,
          action: () => {
            editorEngineStore.setEditorType('header');
            editorEngineStore.openPresetModal();
            onClose();
          },
        },
        {
          id: 'browse-header-arrangements',
          title: 'Header Layout Arrangements (8 Layouts)',
          subtitle: 'Standard, Centered Split, Stacked, Logo Right, Compact...',
          badge: 'Layout',
          badgeColor: '#2563eb',
          icon: <SlidersHorizontal size={14} color="#2563eb" />,
          action: () => {
            editorEngineStore.setEditorType('header');
            editorEngineStore.openPresetModal();
            onClose();
          },
        },
        {
          id: 'add-header-section',
          title: 'Add Section to Header Stack',
          subtitle: 'Announcement Bar, Utility Bar, Catalog Menu, Promo Banner...',
          badge: 'Add Row',
          badgeColor: '#10b981',
          icon: <Plus size={14} color="#10b981" />,
          action: () => {
            editorEngineStore.openAddComponentModal('all');
            onClose();
          },
        },
        {
          id: 'audit-header',
          title: 'Run Header Accessibility & SEO Audit',
          subtitle: 'Verify WCAG contrast, tab ordering, ARIA landmarks, mobile height',
          badge: 'Audit',
          badgeColor: '#059669',
          icon: <ShieldCheck size={14} color="#059669" />,
          action: () => {
            editorEngineStore.openAuditModal();
            onClose();
          },
        }
      );
    }

    // B. FOOTER EDITOR CONTEXTUAL OPTIONS
    else if (isFooterEditor) {
      const footerRows = editorEngineStore.footerRows || [];
      footerRows.forEach((row) => {
        if (!row) return;
        const icon =
          row.type === 'brand' ? <Sparkles size={14} color="#f59e0b" /> :
          row.type === 'navigation' ? <Compass size={14} color="#10b981" /> :
          row.type === 'newsletter' ? <Mail size={14} color="#ec4899" /> :
          row.type === 'trust' ? <ShieldCheck size={14} color="#6366f1" /> :
          row.type === 'payment' ? <CreditCard size={14} color="#0ea5e9" /> :
          row.type === 'social' ? <Share2 size={14} color="#f59e0b" /> :
          row.type === 'legal' ? <FileText size={14} color="#64748b" /> :
          <Box size={14} color="#6366f1" />;

        items.push({
          id: `footer-row-${row.id}`,
          title: `Edit ${row.name || row.type}`,
          subtitle: `Row: ${row.type} • Container: ${row.layout?.container || 'Constrained'}`,
          badge: 'Footer Component',
          badgeColor: '#16a34a',
          icon,
          action: () => {
            editorEngineStore.selectTarget({ type: 'row', editorType: 'footer', rowId: row.id });
            setRightSidebarOpen(true);
            onClose();
          },
        });
      });

      items.push(
        {
          id: 'browse-footer-variants',
          title: 'Browse Footer Variants (8 Variants)',
          subtitle: 'Multi-Column, Centered Brand, Newsletter First, Mega Commerce...',
          badge: 'Presets',
          badgeColor: '#7c3aed',
          icon: <Sparkles size={14} color="#7c3aed" />,
          action: () => {
            editorEngineStore.setEditorType('footer');
            editorEngineStore.openPresetModal();
            onClose();
          },
        },
        {
          id: 'browse-footer-arrangements',
          title: 'Footer Grid Arrangements (6 Layouts)',
          subtitle: 'Standard, Brand Left + Links, Centered, Mega Grid, Compact...',
          badge: 'Layout',
          badgeColor: '#2563eb',
          icon: <SlidersHorizontal size={14} color="#2563eb" />,
          action: () => {
            editorEngineStore.setEditorType('footer');
            editorEngineStore.openPresetModal();
            onClose();
          },
        },
        {
          id: 'add-footer-section',
          title: 'Add Section to Footer Stack',
          subtitle: 'Trust Badges, Newsletter, Payment Icons, Social Bar, Legal Notice...',
          badge: 'Add Row',
          badgeColor: '#10b981',
          icon: <Plus size={14} color="#10b981" />,
          action: () => {
            editorEngineStore.openAddComponentModal('all');
            onClose();
          },
        },
        {
          id: 'audit-footer',
          title: 'Run Footer Compliance & Accessibility Audit',
          subtitle: 'Verify policy links, copyright year, contrast, social tags',
          badge: 'Audit',
          badgeColor: '#059669',
          icon: <ShieldCheck size={14} color="#059669" />,
          action: () => {
            editorEngineStore.openAuditModal();
            onClose();
          },
        }
      );
    }

    // C. THEME STYLES CONTEXTUAL OPTIONS
    else if (isThemeEditor) {
      const themeCategories = [
        { id: 'colors', title: 'Color Palette & Brand Colors', sub: 'Primary, secondary, accent, surface & background colors' },
        { id: 'typography', title: 'Typography & Font Pairings', sub: 'Headings font, body font, font weights and scale' },
        { id: 'buttons', title: 'Buttons & CTA Styles', sub: 'Border radius, shadow elevation, hover effects' },
        { id: 'effects', title: 'Effects & Shadows', sub: 'Gradients, glassmorphism, blur effects, card radius' },
        { id: 'presets', title: 'Theme Presets Gallery', sub: 'Switch between Modern, Luxury, Minimal, Warm, Ocean' },
        { id: 'css', title: 'Custom CSS Stylesheet', sub: 'Write custom CSS overrides for the entire storefront' },
      ];
      themeCategories.forEach((cat) => {
        items.push({
          id: `theme-cat-${cat.id}`,
          title: cat.title,
          subtitle: cat.sub,
          badge: 'Theme Option',
          badgeColor: '#8b5cf6',
          icon: <Palette size={14} color="#8b5cf6" />,
          action: () => {
            setActivePanel('design');
            setSelectedThemeCategory(cat.id as any);
            setRightSidebarOpen(true);
            onClose();
          },
        });
      });
    }

    // D. STORE & BRAND CONTEXTUAL OPTIONS
    else if (isBrandEditor) {
      const brandItems = [
        { id: 'identity', title: 'Store Name & Brand Tagline', sub: 'Update brand display name and short motto' },
        { id: 'logo', title: 'Logo & Favicon Assets', sub: 'Upload primary vector logo, dark mode mark, and browser favicon' },
        { id: 'social', title: 'Social Media Profiles', sub: 'Instagram, YouTube, Twitter/X, TikTok, LinkedIn' },
        { id: 'contact', title: 'Support Email & Contact Phone', sub: 'Customer service email, phone hotline, and address' },
      ];
      brandItems.forEach((b) => {
        items.push({
          id: `brand-${b.id}`,
          title: b.title,
          subtitle: b.sub,
          badge: 'Brand Detail',
          badgeColor: '#f59e0b',
          icon: <Store size={14} color="#f59e0b" />,
          action: () => {
            setActivePanel('brand');
            onClose();
          },
        });
      });
    }

    // E. SETTINGS CONTEXTUAL OPTIONS
    else if (isSettingsEditor) {
      const settingsList = [
        { id: 'General', title: 'General Store Information', sub: 'Currency, timezone, weight units, store contact' },
        { id: 'Domains', title: 'Custom Domains & SSL', sub: 'Connect custom domain, DNS settings, SSL status' },
        { id: 'Checkout', title: 'Checkout & Payment Gateways', sub: 'Stripe, PayPal, Apple Pay, COD, currency' },
        { id: 'Shipping', title: 'Shipping & Delivery Zones', sub: 'Shipping rates, free shipping thresholds, zones' },
        { id: 'Policies', title: 'Store Policies & Legal Terms', sub: 'Refund policy, Privacy policy, Terms of service' },
        { id: 'SEO', title: 'SEO & Search Engine Indexing', sub: 'Sitemap, Google verification, social meta tags' },
      ];
      settingsList.forEach((s) => {
        items.push({
          id: `setting-${s.id}`,
          title: s.title,
          subtitle: s.sub,
          badge: 'Setting',
          badgeColor: '#64748b',
          icon: <Settings size={14} color="#64748b" />,
          action: () => {
            setActivePanel('settings');
            setActiveSettingItem(s.id as any);
            onClose();
          },
        });
      });
    }

    // F. PAGE EDITOR CONTEXTUAL OPTIONS (Homepage or Custom Pages)
    else if (isPageDetail) {
      const currentSections = activePage?.sections || [];
      currentSections.forEach((section, index) => {
        if (!section || !section.id) return;
        items.push({
          id: `section-${section.id}`,
          title: `Jump to Section: ${section.name || section.type || `Section ${index + 1}`}`,
          subtitle: `${section.type || 'Custom Section'} • Section #${index + 1}${section.isHidden ? ' (Hidden)' : ''}`,
          badge: 'Page Section',
          badgeColor: '#6366f1',
          icon: <Layers size={14} color="#6366f1" />,
          action: () => {
            setActivePanel('pages');
            setSelectedSectionId(section.id);
            setRightSidebarOpen(true);
            onClose();
          },
        });
      });

      // Page Actions
      items.push(
        {
          id: 'add-section-to-page',
          title: `Add Section to ${activePage?.name || 'Page'}`,
          subtitle: 'Hero Banner, Product Carousel, Testimonials, FAQ, Gallery...',
          badge: 'Action',
          badgeColor: '#10b981',
          icon: <Plus size={14} color="#10b981" />,
          action: () => {
            setActivePanel('pages');
            setAddSectionWidgetOpen(true);
            onClose();
          },
        },
        {
          id: 'jump-to-header-studio',
          title: 'Edit Global Header for this Page',
          subtitle: 'Open Header Editor with live real-time synchronization',
          badge: 'Studio',
          badgeColor: '#2563eb',
          icon: <Compass size={14} color="#2563eb" />,
          action: () => {
            navigateToPage('header-global');
            editorEngineStore.setEditorType('header');
            onClose();
          },
        },
        {
          id: 'jump-to-footer-studio',
          title: 'Edit Global Footer for this Page',
          subtitle: 'Open Footer Editor with live real-time synchronization',
          badge: 'Studio',
          badgeColor: '#16a34a',
          icon: <Layers size={14} color="#16a34a" />,
          action: () => {
            navigateToPage('footer-global');
            editorEngineStore.setEditorType('footer');
            onClose();
          },
        }
      );
    }

    return items;
  }, [
    isHeaderEditor,
    isFooterEditor,
    isThemeEditor,
    isBrandEditor,
    isSettingsEditor,
    isPageDetail,
    activePage,
    editorEngineStore.headerRows,
    editorEngineStore.footerRows,
  ]);

  // ─── 2. STOREFRONT PAGES QUICK SWITCHER ───
  const pageSwitcherItems = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [
      {
        id: 'page-header-global',
        title: 'Global Header Editor',
        subtitle: 'Multi-band header with Announcement, Logo, Nav, Search & Cart',
        badge: 'Studio',
        badgeColor: '#2563eb',
        icon: <Compass size={14} color="#2563eb" />,
        action: () => {
          setActivePanel('pages');
          navigateToPage('header-global');
          editorEngineStore.setEditorType('header');
          navigate(getEditorPath('header-global'));
          onClose();
        },
      },
      {
        id: 'page-footer-global',
        title: 'Global Footer Editor',
        subtitle: 'Multi-column footer with Brand, Newsletter, Trust & Legal',
        badge: 'Studio',
        badgeColor: '#16a34a',
        icon: <Layers size={14} color="#16a34a" />,
        action: () => {
          setActivePanel('pages');
          navigateToPage('footer-global');
          editorEngineStore.setEditorType('footer');
          navigate(getEditorPath('footer-global'));
          onClose();
        },
      },
    ];

    (pages || []).forEach((p) => {
      if (!p || !p.id) return;
      list.push({
        id: `page-jump-${p.id}`,
        title: `${p.name || p.id} Page`,
        subtitle: `Route: ${p.path || `/${p.id}`} • Category: ${p.category || 'Store'}`,
        badge: p.id === 'landing-page' ? 'Home' : 'Page',
        badgeColor: '#3b82f6',
        icon: <FileText size={14} color="#3b82f6" />,
        action: () => {
          setActivePanel('pages');
          navigateToPage(p.id);
          navigate(getEditorPath(p.id));
          onClose();
        },
      });
    });

    return list;
  }, [pages]);

  // ─── 3. GLOBAL COMMANDS & VIEWPORT TOOLS ───
  const globalCommands = useMemo<PaletteItem[]>(() => [
    {
      id: 'cmd-save',
      title: `Save ${scopeBadge} Draft`,
      badge: 'Action',
      badgeColor: '#059669',
      icon: <CheckCircle2 size={14} color="#059669" />,
      action: () => {
        onSave();
        onClose();
      },
    },
    {
      id: 'cmd-publish',
      title: `Publish ${scopeBadge} to Live Storefront`,
      badge: 'Action',
      badgeColor: '#16a34a',
      icon: <UploadCloud size={14} color="#16a34a" />,
      action: () => {
        onPublish();
        onClose();
      },
    },
    {
      id: 'cmd-preview',
      title: 'Preview Storefront in New Tab',
      badge: 'Preview',
      badgeColor: '#2563eb',
      icon: <Eye size={14} color="#2563eb" />,
      action: () => {
        onPreview();
        onClose();
      },
    },
    {
      id: 'cmd-pages-manager',
      title: 'Store Pages & Navigation Manager',
      badge: 'Pages',
      badgeColor: '#f59e0b',
      icon: <FolderOpen size={14} color="#f59e0b" />,
      action: () => {
        setActivePanel('pages');
        useLandingEditorStore.getState().navigateToPagesList();
        navigate('/editor/pages');
        onClose();
      },
    },
    {
      id: 'cmd-view-desktop',
      title: 'Switch Viewport to Desktop (1440px)',
      badge: 'Viewport',
      icon: <Monitor size={14} color="#64748b" />,
      action: () => {
        setDevice('desktop');
        onClose();
      },
    },
    {
      id: 'cmd-view-tablet',
      title: 'Switch Viewport to Tablet (768px)',
      badge: 'Viewport',
      icon: <Tablet size={14} color="#64748b" />,
      action: () => {
        setDevice('tablet');
        onClose();
      },
    },
    {
      id: 'cmd-view-mobile',
      title: 'Switch Viewport to Mobile (375px)',
      badge: 'Viewport',
      icon: <Smartphone size={14} color="#64748b" />,
      action: () => {
        setDevice('mobile');
        onClose();
      },
    },
    {
      id: 'cmd-view-all',
      title: 'Compare All 3 Viewports Side-by-Side',
      badge: 'Viewport',
      icon: <Columns size={14} color="#64748b" />,
      action: () => {
        setDevice('all');
        onClose();
      },
    },
  ], [scopeBadge, onSave, onPublish, onPreview]);

  // ─── FILTERING ───
  const filterList = (list: PaletteItem[]) => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.badge.toLowerCase().includes(q)
    );
  };

  const [activeCategory, setActiveCategory] = useState<'all' | 'context' | 'pages' | 'tools'>('all');

  const filteredContextual = filterList(contextualItems);
  const filteredPages = filterList(pageSwitcherItems);
  const filteredGlobals = filterList(globalCommands);

  const totalResults = filteredContextual.length + filteredPages.length + filteredGlobals.length;

  const showContextual = (activeCategory === 'all' || activeCategory === 'context') && filteredContextual.length > 0;
  const showPages = (activeCategory === 'all' || activeCategory === 'pages') && filteredPages.length > 0;
  const showGlobals = (activeCategory === 'all' || activeCategory === 'tools') && filteredGlobals.length > 0;

  if (!isOpen) return null;

  return (
    <div className={styles.commandPaletteOverlay} onClick={onClose}>
      <div className={styles.commandPaletteBox} onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div className={styles.commandInputContainer}>
          <Search size={18} color="var(--primary, #2563eb)" />
          <input
            ref={inputRef}
            type="text"
            className={styles.commandInput}
            placeholder={`Search ${scopeBadge}, pages, presets & tools...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <div className={styles.shortcutKey}>ESC</div>
        </div>

        {/* Category Pill Filters Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #f1f5f9',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '3px 10px',
              borderRadius: '16px',
              fontSize: '11.5px',
              fontWeight: activeCategory === 'all' ? 700 : 500,
              backgroundColor: activeCategory === 'all' ? 'var(--primary, #2563eb)' : '#ffffff',
              color: activeCategory === 'all' ? '#ffffff' : '#64748b',
              border: activeCategory === 'all' ? '1px solid transparent' : '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              flexShrink: 0,
            }}
          >
            All ({totalResults})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('context')}
            style={{
              padding: '3px 10px',
              borderRadius: '16px',
              fontSize: '11.5px',
              fontWeight: activeCategory === 'context' ? 700 : 500,
              backgroundColor: activeCategory === 'context' ? 'var(--primary, #2563eb)' : '#ffffff',
              color: activeCategory === 'context' ? '#ffffff' : '#64748b',
              border: activeCategory === 'context' ? '1px solid transparent' : '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              flexShrink: 0,
            }}
          >
            {scopeBadge} ({filteredContextual.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('pages')}
            style={{
              padding: '3px 10px',
              borderRadius: '16px',
              fontSize: '11.5px',
              fontWeight: activeCategory === 'pages' ? 700 : 500,
              backgroundColor: activeCategory === 'pages' ? 'var(--primary, #2563eb)' : '#ffffff',
              color: activeCategory === 'pages' ? '#ffffff' : '#64748b',
              border: activeCategory === 'pages' ? '1px solid transparent' : '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              flexShrink: 0,
            }}
          >
            Pages ({filteredPages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('tools')}
            style={{
              padding: '3px 10px',
              borderRadius: '16px',
              fontSize: '11.5px',
              fontWeight: activeCategory === 'tools' ? 700 : 500,
              backgroundColor: activeCategory === 'tools' ? 'var(--primary, #2563eb)' : '#ffffff',
              color: activeCategory === 'tools' ? '#ffffff' : '#64748b',
              border: activeCategory === 'tools' ? '1px solid transparent' : '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              flexShrink: 0,
            }}
          >
            Tools &amp; Viewports ({filteredGlobals.length})
          </button>
        </div>

        {/* Results List */}
        <div className={styles.commandList} style={{ maxHeight: '420px' }}>
          {/* GROUP 1: DYNAMIC CONTEXTUAL OPTIONS (Specific to Current Page/Studio) */}
          {showContextual && (
            <div className={styles.commandGroup}>
              <div className={styles.commandGroupTitle}>
                {scopeBadge} Options &amp; Actions
              </div>
              {filteredContextual.map((item) => (
                <button
                  key={item.id}
                  className={styles.commandItem}
                  onClick={item.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    margin: '1px 0',
                    width: '100%',
                    border: '1px solid transparent',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '7px',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '340px' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: item.badgeColor ? `${item.badgeColor}12` : '#f1f5f9',
                      color: item.badgeColor || '#64748b',
                      border: `1px solid ${item.badgeColor ? `${item.badgeColor}30` : '#e2e8f0'}`,
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}
                  >
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* GROUP 2: SWITCH TO OTHER STOREFRONT PAGES */}
          {showPages && (
            <div className={styles.commandGroup}>
              <div className={styles.commandGroupTitle}>
                Storefront Pages &amp; Studios
              </div>
              {filteredPages.map((item) => (
                <button
                  key={item.id}
                  className={styles.commandItem}
                  onClick={item.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    margin: '1px 0',
                    width: '100%',
                    border: '1px solid transparent',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '7px',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '340px' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: item.badgeColor ? `${item.badgeColor}12` : '#f1f5f9',
                      color: item.badgeColor || '#64748b',
                      border: `1px solid ${item.badgeColor ? `${item.badgeColor}30` : '#e2e8f0'}`,
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}
                  >
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* GROUP 3: GLOBAL TOOLS & ACTIONS */}
          {showGlobals && (
            <div className={styles.commandGroup}>
              <div className={styles.commandGroupTitle}>
                Global Tools &amp; Actions
              </div>
              {filteredGlobals.map((item) => (
                <button
                  key={item.id}
                  className={styles.commandItem}
                  onClick={item.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    margin: '1px 0',
                    width: '100%',
                    border: '1px solid transparent',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '7px',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                        {item.title}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}
                  >
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          )}

          {totalResults === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No components, pages, or tools matching &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.commandFooter}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Command size={13} color="var(--primary, #2563eb)" />
            <span>Search components, pages, presets &amp; global tools</span>
          </div>
          <span>BillionBiz Command Palette</span>
        </div>
      </div>
    </div>
  );
};
