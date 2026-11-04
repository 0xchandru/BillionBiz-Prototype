import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Upload,
  GripVertical,
  Smartphone,
  Monitor,
  Tablet,
  Shield,
  Image as ImageIcon,
  ChevronDown,
  Search,
  Trash2,
  Edit2,
  Lock,
  ExternalLink,
  Check,
  RotateCcw,
  Palette,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useSiteStore } from '../../../store/siteStore';
import { getDefaultTheme } from '../theme/themePresets';
import { ColorInheritanceControl } from './ColorInheritanceControl';
import { ColorPickerPopover } from '../ui/ColorPickerPopover';
import type { HeaderRow, HeaderElement, FooterRow, FooterElement, ActionItemConfig } from './types';
import {
  CUSTOM_PRESET_ICONS,
  getDefaultActionItems,
  renderActionIcon,
  getVariantsForActionType,
  isPrebuiltAction,
} from './actionIconLibraries';
import styles from '../../../pages/editor/EditorLayout.module.css';

interface ChildItemOverlayInspectorProps {
  element: HeaderElement | FooterElement | any;
  row: HeaderRow | FooterRow | any;
  onClose: () => void;
  editorType?: 'header' | 'footer';
}

// ─── Default Internal Routes ────────────────────────────────
const INTERNAL_ROUTES = [
  { label: 'Home', path: '/' },
  { label: 'Shop All Products', path: '/products' },
  { label: 'Featured Collections', path: '/collections' },
  { label: 'Category Directory', path: '/categories' },
  { label: 'Shopping Cart', path: '/cart' },
  { label: 'Checkout', path: '/checkout' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'User Account', path: '/account' },
  { label: 'Store Blog', path: '/blog' },
];

export const ChildItemOverlayInspector: React.FC<ChildItemOverlayInspectorProps> = ({
  element,
  row,
  onClose,
  editorType,
}) => {
  const { updateHeaderElement, updateFooterElement, selectTarget } = useEditorContextStore();
  const selectedTarget = useEditorContextStore((state) => state.selectedTarget);
  const device = useLandingEditorStore((state) => state.device);
  const { theme } = useSiteStore();
  const defaultPalette = getDefaultTheme().palette;
  const palette = theme?.palette || (theme as any)?.colors || defaultPalette;

  const isFooter =
    editorType === 'footer' ||
    (selectedTarget as any)?.editorType === 'footer' ||
    (row as any)?.columns !== undefined ||
    (row as any)?.type === 'navigation';

  const THEME_CSS_TOKENS = [
    { name: 'Primary', varName: 'var(--primary)', color: palette.brand?.primary || '#2563eb' },
    { name: 'Secondary', varName: 'var(--secondary)', color: palette.brand?.secondary || '#4f46e5' },
    { name: 'Accent', varName: 'var(--accent)', color: palette.brand?.accent || '#f59e0b' },
    { name: 'Heading', varName: 'var(--text-heading)', color: palette.text?.heading || '#0f172a' },
    { name: 'Body Text', varName: 'var(--text-body)', color: palette.text?.body || '#475569' },
    { name: 'Muted', varName: 'var(--text-muted)', color: palette.text?.muted || '#64748b' },
  ];

  const isLogo = element.type === 'logo';
  const isNav =
    element.type === 'primary-nav' ||
    element.type === 'navigation' ||
    element.type === 'navigation-menu' ||
    element.type === 'link-group' ||
    element.type === 'category-menu';
  const isSearch = element.type === 'search';
  const isActions = element.type === 'actions' || element.type === 'action-group';
  const isCta = element.type === 'cta';

  // Search exposes presentation separately from editable content.
  const dynamicTabs = isActions
    ? [
        { id: 'actions', label: 'Actions' },
        { id: 'content', label: 'Content' },
        { id: 'design', label: 'Design' },
      ]
    : [
        ...(isSearch ? [{ id: 'look', label: 'Look' }] : []),
        { id: 'content', label: 'Content' },
        { id: 'design', label: 'Design' },
        { id: 'behavior', label: 'Behavior' },
      ];

  const [activeTab, setActiveTab] = useState<string>(isActions ? 'actions' : 'content');
  const [activeStateTab, setActiveStateTab] = useState<'default' | 'hover' | 'active' | 'focus'>('default');

  // Actions Inspector states
  const [selectedActionItemId, setSelectedActionItemId] = useState<string>('wishlist');
  const [showCustomActionModal, setShowCustomActionModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<ActionItemConfig | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [iconDropdownOpen, setIconDropdownOpen] = useState<boolean>(false);
  const [newActionLabel, setNewActionLabel] = useState<string>('');
  const [newActionPath, setNewActionPath] = useState<string>('');
  const [newActionIconId, setNewActionIconId] = useState<string>('custom-help');
  const [newActionCustomUrl, setNewActionCustomUrl] = useState<string>('');
  const [newActionOpenNewTab, setNewActionOpenNewTab] = useState<boolean>(false);
  const [isDragOverActive, setIsDragOverActive] = useState<boolean>(false);
  const [isDragOverDisabled, setIsDragOverDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (isActions) {
      if (activeTab !== 'actions' && activeTab !== 'content' && activeTab !== 'design') {
        setActiveTab('actions');
      }
    }
  }, [isActions]);

  // Navigation Modals & Popovers State
  const [showInternalRoutePicker, setShowInternalRoutePicker] = useState(false);
  const [showAddLinkTypeModal, setShowAddLinkTypeModal] = useState(false);
  const [customLinkModalType, setCustomLinkModalType] = useState<
    'internal' | 'external' | 'dropdown' | 'mega' | null
  >(null);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkSubcategories, setNewLinkSubcategories] = useState<string>('Men, Women, Accessories');
  const [expandedLinkIdx, setExpandedLinkIdx] = useState<number | null>(null);

  const handleUpdateProps = (updates: Record<string, any>) => {
    if (isFooter) {
      updateFooterElement(row.id, element.id, {
        props: {
          ...element.props,
          ...updates,
        },
      });
    } else {
      updateHeaderElement(row.id, element.id, {
        props: {
          ...element.props,
          ...updates,
        },
      });
    }
  };

  const handleUpdateMeta = (updates: any) => {
    if (isFooter) {
      updateFooterElement(row.id, element.id, updates);
    } else {
      updateHeaderElement(row.id, element.id, updates);
    }
  };

  const handleBack = () => {
    if (isFooter) {
      selectTarget({
        type: 'row',
        editorType: 'footer',
        rowId: row.id,
      });
      useEditorContextStore.getState().setActiveTab('columns');
    }
    onClose();
  };


  // Ensure default links for navigation if empty
  const navLinks: any[] =
    element.props.items || element.props.links || [
      { id: '1', label: 'Home', url: '/' },
      { id: '2', label: 'Shop All', url: '/products', hasMegaMenu: true, badge: 'HOT' },
      { id: '3', label: 'Collections', url: '/collections' },
      { id: '4', label: 'About Us', url: '/about' },
      { id: '5', label: 'Contact', url: '/contact' },
    ];

  const handleUpdateLinks = (newLinks: any[]) => {
    handleUpdateProps({ items: newLinks, links: newLinks });
  };

  const handleAddInternalRoute = (route: { label: string; path: string }) => {
    const newLink = {
      id: `nav-${Date.now()}`,
      label: route.label,
      url: route.path,
      type: 'internal',
    };
    handleUpdateLinks([...navLinks, newLink]);
    setShowInternalRoutePicker(false);
  };

  const handleSaveCustomLink = () => {
    if (!newLinkLabel.trim()) return;

    let newLink: any = {
      id: `nav-${Date.now()}`,
      label: newLinkLabel,
      url: newLinkUrl || '/',
      type: customLinkModalType,
    };

    if (customLinkModalType === 'dropdown') {
      const subItems = newLinkSubcategories
        .split(',')
        .map((s, idx) => ({ id: `sub-${idx}`, label: s.trim(), url: `/category/${encodeURIComponent(s.trim().toLowerCase())}` }))
        .filter((s) => s.label);
      newLink.items = subItems;
      newLink.hasDropdown = true;
    } else if (customLinkModalType === 'mega') {
      newLink.hasMegaMenu = true;
      newLink.columns = [
        { title: 'Categories', items: [{ label: 'All Products', url: '/products' }] },
        { title: 'Featured', items: [{ label: 'Best Sellers', url: '/collections/best-sellers' }] },
      ];
    } else if (customLinkModalType === 'external') {
      newLink.target = '_blank';
    }

    handleUpdateLinks([...navLinks, newLink]);
    setNewLinkLabel('');
    setNewLinkUrl('');
    setCustomLinkModalType(null);
    setShowAddLinkTypeModal(false);
  };

  // Actions Inspector helpers
  const actionItems: ActionItemConfig[] = isActions ? getDefaultActionItems(element.props) : [];

  const updateActionItems = (newItems: ActionItemConfig[]) => {
    handleUpdateProps({
      items: newItems,
      showSearch: newItems.some((i) => i.type === 'search' && i.isEnabled !== false),
      showWishlist: newItems.some((i) => i.type === 'wishlist' && i.isEnabled !== false),
      showAccount: newItems.some((i) => i.type === 'account' && i.isEnabled !== false),
      showCart: newItems.some((i) => i.type === 'cart' && i.isEnabled !== false),
    });
  };

  const activeActionItems = actionItems.filter((it) => it.isEnabled !== false);
  const disabledActionItems = actionItems.filter((it) => it.isEnabled === false);

  const enableActionItem = (id: string) => {
    const updated = actionItems.map((it) => (it.id === id ? { ...it, isEnabled: true } : it));
    updateActionItems(updated);
  };

  const disableActionItem = (id: string) => {
    const updated = actionItems.map((it) => (it.id === id ? { ...it, isEnabled: false } : it));
    updateActionItems(updated);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const isPrebuilt = isPrebuiltAction(itemToDelete.id);
    let updated: ActionItemConfig[];
    if (isPrebuilt) {
      // Moves to disabled container
      updated = actionItems.map((it) =>
        it.id === itemToDelete.id ? { ...it, isEnabled: false } : it
      );
    } else {
      // Custom item: permanently deleted
      updated = actionItems.filter((it) => it.id !== itemToDelete.id);
    }
    updateActionItems(updated);
    if (selectedActionItemId === itemToDelete.id) {
      const remainingActive = updated.filter((it) => it.isEnabled !== false);
      setSelectedActionItemId(remainingActive[0]?.id || updated[0]?.id || 'wishlist');
    }
    setItemToDelete(null);
  };

  const handleDragStartItem = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverItem = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverItemIndex !== targetIdx) {
      setDragOverItemIndex(targetIdx);
    }
  };

  const handleDropOnItem = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = draggedItemId || e.dataTransfer.getData('text/plain');
    if (!id) return;

    const fromIdx = activeActionItems.findIndex((i) => i.id === id);
    if (fromIdx !== -1) {
      // Reordering vertically inside active container
      if (fromIdx !== targetIdx) {
        const reordered = [...activeActionItems];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(targetIdx, 0, moved);
        updateActionItems([...reordered, ...disabledActionItems]);
      }
    } else {
      // Dragged from disabled container into active at targetIdx
      const disabledIdx = disabledActionItems.findIndex((i) => i.id === id);
      if (disabledIdx !== -1) {
        const restored = { ...disabledActionItems[disabledIdx], isEnabled: true };
        const newDisabled = disabledActionItems.filter((i) => i.id !== id);
        const newActive = [...activeActionItems];
        newActive.splice(targetIdx, 0, restored);
        updateActionItems([...newActive, ...newDisabled]);
      }
    }

    setDraggedItemId(null);
    setDragOverItemIndex(null);
    setIsDragOverActive(false);
  };

  const handleCreateCustomAction = () => {
    if (!newActionLabel.trim()) return;
    const newItem: ActionItemConfig = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      label: newActionLabel.trim(),
      iconType: newActionIconId,
      customIconUrl: newActionCustomUrl.trim() || undefined,
      path: newActionPath.trim() || '/',
      isNavigation: true,
      isEnabled: true,
      openInNewTab: newActionOpenNewTab,
    };
    updateActionItems([...actionItems, newItem]);
    setSelectedActionItemId(newItem.id);
    setNewActionLabel('');
    setNewActionPath('');
    setNewActionCustomUrl('');
    setNewActionOpenNewTab(false);
    setShowCustomActionModal(false);
  };

  const handleCustomLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const updated = actionItems.map((it) =>
          it.id === itemId ? { ...it, customIconUrl: dataUrl } : it
        );
        updateActionItems(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
      }}
    >
      {/* ─── 1. INTERACTIVE BREADCRUMB HEADER (Item 21 & 22) ─── */}
      {(() => {
        const footerColumns = isFooter ? ((row as FooterRow).columns || []) : [];
        const colIndex = footerColumns.findIndex((c) =>
          (c.elements || []).some((e) => e.id === element.id)
        );
        const columnNumber = colIndex !== -1 ? colIndex + 1 : 1;
        const isStoreLogo = element.type === 'logo' || element.id === 'el-footer-logo' || element.name === 'Store Logo';
        const displayTitle = isStoreLogo
          ? (isFooter ? 'Store Logo' : 'Logo & Brandname')
          : (element.name || 'Component');

        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, marginRight: '8px' }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  color: '#334155',
                  flexShrink: 0,
                }}
                title={isFooter ? 'Back to Footer Directory' : 'Back to Header'}
              >
                <ChevronLeft size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 600, minWidth: 0, flex: 1 }}>
                {isFooter ? (
                  <>
                    <button
                      type="button"
                      onClick={handleBack}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#64748b',
                        cursor: 'pointer',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                    >
                      Footer
                    </button>
                    <span style={{ color: '#cbd5e1', flexShrink: 0 }}>/</span>
                    <button
                      type="button"
                      onClick={handleBack}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#64748b',
                        cursor: 'pointer',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                    >
                      Column {columnNumber}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#64748b',
                      cursor: 'pointer',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                  >
                    Header
                  </button>
                )}
                <span style={{ color: '#cbd5e1', flexShrink: 0 }}>/</span>
                <span
                  title={displayTitle}
                  style={{
                    color: '#0f172a',
                    fontWeight: 700,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}
                >
                  {displayTitle}
                </span>
              </div>
            </div>

            {/* Close inspector */}
              <button
                type="button"
                onClick={handleBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748b',
                  flexShrink: 0,
                }}
                title="Close inspector"
              >
                <X size={18} />
              </button>
          </div>
        );
      })()}

      {/* ─── 2. Shared right-sidebar header and scrollable tabs ─── */}
      <div className={styles.propTabs} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', background: '#f8fafc', display: 'flex', alignItems: 'center' }}>
        <button type="button" onClick={() => { const index = dynamicTabs.findIndex((tab) => tab.id === activeTab); setActiveTab(dynamicTabs[(index - 1 + dynamicTabs.length) % dynamicTabs.length].id); }} title="Previous tab" aria-label="Previous tab" style={{ border: 0, background: 'transparent', color: '#64748b', padding: '8px 6px', cursor: 'pointer' }}><ChevronLeft size={15} /></button>
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
        {dynamicTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              className={`${styles.propTab} ${isActive ? styles.activePropTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                padding: '12px 0',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {tab.label}
            </div>
          );
        })}
        </div>
        <button type="button" onClick={() => { const index = dynamicTabs.findIndex((tab) => tab.id === activeTab); setActiveTab(dynamicTabs[(index + 1) % dynamicTabs.length].id); }} title="Next tab" aria-label="Next tab" style={{ border: 0, background: 'transparent', color: '#64748b', padding: '8px 6px', cursor: 'pointer' }}><ChevronRight size={15} /></button>
      </div>

      {/* ─── 4. SCROLLABLE TAB CONTENT ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* ══════════════════════════════════════════════════════
            A. LOGO INSPECTOR (Content | Design | Behavior)
           ══════════════════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════════════════
            A. LOGO & BRANDNAME INSPECTOR (Content | Design | Behavior)
           ══════════════════════════════════════════════════════ */}
        {isLogo && (
          <div>
            {/* 1. LOGO CONTENT TAB */}
            {activeTab === 'content' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Logo & Brandname Content
                </div>

                {/* Logo Display Mode */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Display Format
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'image', label: 'Logo only' },
                      { id: 'both', label: 'Logo + Brandname' },
                      { id: 'text', label: 'Brandname only' },
                    ].map((opt) => {
                      const isSelected = (element.props.logoType || 'both') === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleUpdateProps({ logoType: opt.id })}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#2563eb' : '#475569',
                            fontSize: '11px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Logo Image Preview & Uploader (if image is shown) */}
                {element.props.logoType !== 'text' && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                      Logo Image
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          padding: '4px',
                        }}
                      >
                        {element.props.imageUrl || element.props.image ? (
                          <img
                            src={element.props.imageUrl || element.props.image}
                            alt="Logo"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <ImageIcon size={24} color="#94a3b8" />
                        )}
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <label
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            }}
                          >
                            <Upload size={14} /> Upload image
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) {
                                      handleUpdateProps({
                                        imageUrl: ev.target.result as string,
                                        image: ev.target.result as string,
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {(element.props.imageUrl || element.props.image) && (
                            <button
                              type="button"
                              onClick={() => handleUpdateProps({ imageUrl: '', image: '' })}
                              style={{
                                padding: '6px 10px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                color: '#dc2626',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>SVG, PNG, or WebP recommended</span>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={element.props.imageUrl || element.props.image || ''}
                        onChange={(e) => handleUpdateProps({ imageUrl: e.target.value, image: e.target.value })}
                        placeholder="Or enter image URL (https://...)"
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                )}

                {/* Brand Name Text (if brand name visible) */}
                {element.props.logoType !== 'image' && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                        Brand Name Layout
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextIsTwo = !element.props.isTwoLines;
                          handleUpdateProps({
                            isTwoLines: nextIsTwo,
                            upperText: element.props.upperText || element.props.text || 'BILLION',
                            lowerText: element.props.lowerText || 'BIZ COUTURE',
                          });
                        }}
                        style={{
                          fontSize: '11px',
                          color: '#2563eb',
                          background: element.props.isTwoLines ? '#eff6ff' : '#f8fafc',
                          border: `1px solid ${element.props.isTwoLines ? '#bfdbfe' : '#e2e8f0'}`,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        {element.props.isTwoLines ? '✓ Two Lines Active' : '+ Switch to 2 Lines'}
                      </button>
                    </div>

                    {!element.props.isTwoLines ? (
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Brand Name Text</span>
                        <input
                          type="text"
                          value={element.props.brandName || element.props.text || 'BillionBiz'}
                          onChange={(e) => handleUpdateProps({ text: e.target.value, brandName: e.target.value, upperText: e.target.value })}
                          placeholder="e.g. BillionBiz"
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>First Line (Primary)</span>
                          <input
                            type="text"
                            value={element.props.upperText || 'BILLION'}
                            onChange={(e) => handleUpdateProps({ upperText: e.target.value, text: e.target.value })}
                            placeholder="BILLION"
                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Second Line (Secondary / Tagline)</span>
                          <input
                            type="text"
                            value={element.props.lowerText || 'BIZ COUTURE'}
                            onChange={(e) => handleUpdateProps({ lowerText: e.target.value })}
                            placeholder="BIZ COUTURE"
                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Destination Link */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    Destination Link
                  </label>
                  <input
                    type="text"
                    value={element.props.url || '/'}
                    onChange={(e) => handleUpdateProps({ url: e.target.value })}
                    placeholder="/"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', marginBottom: '8px' }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Open in</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="logoOpenTab"
                        checked={!element.props.openInNewTab}
                        onChange={() => handleUpdateProps({ openInNewTab: false })}
                      />
                      Same tab
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="logoOpenTab"
                        checked={Boolean(element.props.openInNewTab)}
                        onChange={() => handleUpdateProps({ openInNewTab: true })}
                      />
                      New tab
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 2. LOGO DESIGN TAB */}
            {activeTab === 'design' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Logo & Brand Styling
                </div>

                {/* A. Logo Image Sizing (shown when logo is visible) */}
                {element.props.logoType !== 'text' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Logo Dimensions</span>
                    
                    {/* Height Slider */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>Logo Height</span>
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>
                          {element.props.logoHeight || element.props.height || 40}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="120"
                        value={element.props.logoHeight || element.props.height || 40}
                        onChange={(e) => handleUpdateProps({ logoHeight: Number(e.target.value), height: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Width Slider */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>Max Width ({device})</span>
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>
                          {device === 'mobile'
                            ? (element.props.mobileWidth || 110)
                            : device === 'tablet'
                            ? (element.props.tabletWidth || 130)
                            : (element.props.desktopWidth || 150)}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="280"
                        value={
                          device === 'mobile'
                            ? (element.props.mobileWidth || 110)
                            : device === 'tablet'
                            ? (element.props.tabletWidth || 130)
                            : (element.props.desktopWidth || 150)
                        }
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (device === 'mobile') handleUpdateProps({ mobileWidth: val });
                          else if (device === 'tablet') handleUpdateProps({ tabletWidth: val });
                          else handleUpdateProps({ desktopWidth: val });
                        }}
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Shape and Frame */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                        Logo Shape
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                        {[
                          { id: 'none', label: 'Original' },
                          { id: 'rounded', label: 'Rounded' },
                          { id: 'circle', label: 'Circle' },
                          { id: 'pill', label: 'Pill' },
                          { id: 'square', label: 'Square' },
                        ].map((sh) => {
                          const isSelected = (element.props.shape || 'none') === sh.id;
                          return (
                            <button
                              key={sh.id}
                              type="button"
                              onClick={() => handleUpdateProps({ shape: sh.id })}
                              style={{
                                padding: '6px 2px',
                                borderRadius: '6px',
                                border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                                color: isSelected ? '#2563eb' : '#475569',
                                fontSize: '11px',
                                fontWeight: isSelected ? 700 : 500,
                                cursor: 'pointer',
                                textAlign: 'center',
                              }}
                            >
                              {sh.label}
                            </button>
                          );
                        })}
                      </div>

                      {element.props.shape === 'rounded' && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                            <span style={{ color: '#64748b' }}>Corner Radius</span>
                            <span style={{ color: '#2563eb', fontWeight: 600 }}>{element.props.borderRadius ?? 8}px</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="32"
                            value={element.props.borderRadius ?? 8}
                            onChange={(e) => handleUpdateProps({ borderRadius: Number(e.target.value) })}
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Logo Border & Shadow */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                            Border Style
                          </label>
                          <select
                            value={element.props.borderStyle || 'none'}
                            onChange={(e) => handleUpdateProps({ borderStyle: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                          >
                            <option value="none">None</option>
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="double">Double</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                            Shadow
                          </label>
                          <select
                            value={element.props.shadow || 'none'}
                            onChange={(e) => handleUpdateProps({ shadow: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                          >
                            <option value="none">None</option>
                            <option value="soft">Soft</option>
                            <option value="medium">Medium</option>
                            <option value="strong">Strong</option>
                          </select>
                        </div>
                      </div>

                      {element.props.borderStyle && element.props.borderStyle !== 'none' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Border Width</span>
                            <input
                              type="number"
                              min="1"
                              max="6"
                              value={element.props.borderWidth || 1}
                              onChange={(e) => handleUpdateProps({ borderWidth: Number(e.target.value) })}
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Border Color</span>
                            <input
                              type="color"
                              value={element.props.borderColor || '#cbd5e1'}
                              onChange={(e) => handleUpdateProps({ borderColor: e.target.value })}
                              style={{ width: '100%', height: '32px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', padding: '2px' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Padding around logo */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: '#64748b' }}>Logo Frame Padding</span>
                          <span style={{ color: '#2563eb', fontWeight: 600 }}>{element.props.imagePadding || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={element.props.imagePadding || 0}
                          onChange={(e) => handleUpdateProps({ imagePadding: Number(e.target.value) })}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Spacing between Logo and Brand Name */}
                {element.props.logoType === 'both' && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Gap (Logo & Brand Name)</span>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>{element.props.logoGap ?? 8}px</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="24"
                      value={element.props.logoGap ?? 8}
                      onChange={(e) => handleUpdateProps({ logoGap: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}

                {/* B. Brand Name Typography & Colors (shown when brand name is visible) */}
                {element.props.logoType !== 'image' && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      Brand Name Typography & Colors
                    </span>

                    {/* First Line Font Size */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>First Line Font Size</span>
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>
                          {element.props.firstLineSize || element.props.fontSize || 20}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="48"
                        value={element.props.firstLineSize || element.props.fontSize || 20}
                        onChange={(e) => handleUpdateProps({ firstLineSize: Number(e.target.value), fontSize: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Second Line Font Size - ONLY SHOWN WHEN isTwoLines IS ENABLED */}
                    {Boolean(element.props.isTwoLines) && (
                      <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>Second Line Font Size</span>
                          <span style={{ color: '#2563eb', fontWeight: 700 }}>
                            {element.props.secondLineSize || Math.max(10, Math.round((element.props.firstLineSize || element.props.fontSize || 20) * 0.58))}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="9"
                          max="28"
                          value={element.props.secondLineSize || Math.max(10, Math.round((element.props.firstLineSize || element.props.fontSize || 20) * 0.58))}
                          onChange={(e) => handleUpdateProps({ secondLineSize: Number(e.target.value) })}
                          style={{ width: '100%' }}
                        />
                      </div>
                    )}

                    {/* First Line Brand Name Color */}
                    <div>
                      <ColorInheritanceControl
                        label="First Line Brand Color"
                        mode={element.props.firstLineColorMode || element.props.textColorMode || 'inherit'}
                        value={element.props.firstLineColor || element.props.textColor || palette.text?.heading || '#0f172a'}
                        inheritedColor={palette.text?.heading || '#0f172a'}
                        inheritedTokenName="Theme Heading Color"
                        allowedModes={['inherit', 'color', 'gradient']}
                        gradientValue={element.props.firstLineGradient || element.props.textGradient}
                        onModeChange={(mode) => handleUpdateProps({ firstLineColorMode: mode, textColorMode: mode })}
                        onChange={(color) => handleUpdateProps({ firstLineColor: color, textColor: color, color })}
                        onGradientChange={(grad) => handleUpdateProps({ firstLineGradient: grad, textGradient: grad })}
                      />
                    </div>

                    {/* Second Line Brand Name Color - ONLY SHOWN WHEN isTwoLines IS ENABLED */}
                    {Boolean(element.props.isTwoLines) && (
                      <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <ColorInheritanceControl
                          label="Second Line Brand Color"
                          mode={element.props.secondLineColorMode || 'color'}
                          value={element.props.secondLineColor || element.props.lowerTextColor || '#64748b'}
                          inheritedColor="#64748b"
                          inheritedTokenName="Secondary Muted Text"
                          allowedModes={['inherit', 'color']}
                          onModeChange={(mode) => handleUpdateProps({ secondLineColorMode: mode })}
                          onChange={(color) => handleUpdateProps({ secondLineColor: color, lowerTextColor: color })}
                        />
                      </div>
                    )}

                    {/* Font Weight */}
                    <div style={{ display: 'grid', gridTemplateColumns: element.props.isTwoLines ? '1fr 1fr' : '1fr', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                          Line 1 Weight
                        </span>
                        <select
                          value={element.props.firstLineWeight || element.props.fontWeight || 800}
                          onChange={(e) => handleUpdateProps({ firstLineWeight: Number(e.target.value), fontWeight: Number(e.target.value) })}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        >
                          <option value="400">Regular (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">SemiBold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">ExtraBold (800)</option>
                          <option value="900">Black (900)</option>
                        </select>
                      </div>

                      {Boolean(element.props.isTwoLines) && (
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                            Line 2 Weight
                          </span>
                          <select
                            value={element.props.secondLineWeight || 600}
                            onChange={(e) => handleUpdateProps({ secondLineWeight: Number(e.target.value) })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                          >
                            <option value="300">Light (300)</option>
                            <option value="400">Regular (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">SemiBold (600)</option>
                            <option value="700">Bold (700)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. LOGO BEHAVIOR TAB */}
            {activeTab === 'behavior' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Logo Behavior & Responsiveness
                </div>

                {/* Click Action */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Click Action
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {[
                      { id: 'home', label: 'Home Page (/)' },
                      { id: 'custom', label: 'Custom URL' },
                    ].map((act) => {
                      const isSelected = (element.props.clickAction || 'home') === act.id;
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleUpdateProps({ clickAction: act.id, url: act.id === 'home' ? '/' : element.props.url })}
                          style={{
                            padding: '8px',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#2563eb' : '#475569',
                            fontSize: '12px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {act.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Device Visibility Checklist */}
                <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Device Visibility
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { key: 'showOnDesktop', label: 'Desktop', icon: Monitor },
                      { key: 'showOnTablet', label: 'Tablet', icon: Tablet },
                      { key: 'showOnMobile', label: 'Mobile', icon: Smartphone },
                    ].map((devItem) => {
                      const Icon = devItem.icon;
                      const isVisible = element.props[devItem.key] !== false;
                      return (
                        <label
                          key={devItem.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon size={14} color="#64748b" /> {devItem.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={(e) => handleUpdateProps({ [devItem.key]: e.target.checked })}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Sticky Header Reaction */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Sticky Header Scroll
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'same', label: 'Same size' },
                      { id: 'shrink', label: 'Shrink logo' },
                      { id: 'hide', label: 'Hide logo' },
                    ].map((opt) => {
                      const isSelected = (element.props.stickyLogoAction || 'shrink') === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleUpdateProps({ stickyLogoAction: opt.id })}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#2563eb' : '#475569',
                            fontSize: '11px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accessibility */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    <Shield size={14} color="#2563eb" /> Accessibility
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>ARIA Label</span>
                      <input
                        type="text"
                        value={element.props.ariaLabel || 'Store Home'}
                        onChange={(e) => handleUpdateProps({ ariaLabel: e.target.value })}
                        placeholder="Store Home"
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Image Alt Text</span>
                      <input
                        type="text"
                        value={element.props.altText || `${element.props.text || 'BillionBiz'} logo`}
                        onChange={(e) => handleUpdateProps({ altText: e.target.value })}
                        placeholder="Logo image description"
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            B. NAVIGATION MENU INSPECTOR (Content | Design | Behavior)
           ══════════════════════════════════════════════════════ */}
        {isNav && (
          <div>
            {/* 1. NAVIGATION CONTENT TAB (Item 10) */}
            {activeTab === 'content' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Menu Builder
                </div>
                <div style={{ marginTop: '-10px', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                  Manage shared navigation data, destinations, badges, dropdowns, and mega menus from this editor.
                </div>

                {/* Primary Menu Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    Primary Menu
                  </label>
                  <select
                    value={element.props.menuSource || 'main'}
                    onChange={(e) => handleUpdateProps({ menuSource: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="main">Main Store Menu</option>
                    <option value="header-top">Header Utility Menu</option>
                    <option value="custom">Custom Dynamic Navigation</option>
                  </select>
                </div>

                {/* Menu Items List with Reordering and Edit */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                      Menu Items ({navLinks.length})
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Drag or click to edit</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {navLinks.map((link, idx) => {
                      const isExpanded = expandedLinkIdx === idx;
                      return (
                        <div
                          key={link.id || idx}
                          style={{
                            border: isExpanded ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            overflow: 'hidden',
                            boxShadow: isExpanded ? '0 2px 8px rgba(37,99,235,0.08)' : 'none',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              cursor: 'pointer',
                              backgroundColor: isExpanded ? '#f8fafc' : '#ffffff',
                            }}
                            onClick={() => setExpandedLinkIdx(isExpanded ? null : idx)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                              <GripVertical size={14} color="#94a3b8" />
                              <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{link.label}</span>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{link.url}</span>
                              {link.badge && (
                                <span style={{ fontSize: '9px', fontWeight: 700, background: '#fee2e2', color: '#dc2626', padding: '1px 5px', borderRadius: '4px' }}>
                                  {link.badge}
                                </span>
                              )}
                              {link.hasMegaMenu && (
                                <span style={{ fontSize: '9px', fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '1px 5px', borderRadius: '4px' }}>
                                  MEGA
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ChevronDown
                                size={14}
                                color="#64748b"
                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
                              />
                            </div>
                          </div>

                          {/* Expanded Item Settings */}
                          {isExpanded && (
                            <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#fcfcfd' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>Label</span>
                                  <input
                                    type="text"
                                    value={link.label}
                                    onChange={(e) => {
                                      const updated = [...navLinks];
                                      updated[idx] = { ...updated[idx], label: e.target.value };
                                      handleUpdateLinks(updated);
                                    }}
                                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                                  />
                                </div>
                                <div>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>Link URL</span>
                                  <input
                                    type="text"
                                    value={link.url}
                                    onChange={(e) => {
                                      const updated = [...navLinks];
                                      updated[idx] = { ...updated[idx], url: e.target.value };
                                      handleUpdateLinks(updated);
                                    }}
                                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                                  />
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>Badge</span>
                                  <select
                                    value={link.badge || 'none'}
                                    onChange={(e) => {
                                      const updated = [...navLinks];
                                      updated[idx] = { ...updated[idx], badge: e.target.value === 'none' ? undefined : e.target.value };
                                      handleUpdateLinks(updated);
                                    }}
                                    style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                                  >
                                    <option value="none">None</option>
                                    <option value="HOT">HOT</option>
                                    <option value="NEW">NEW</option>
                                    <option value="SALE">SALE</option>
                                    <option value="50% OFF">50% OFF</option>
                                  </select>
                                </div>

                                <div>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>Submenu Style</span>
                                  <select
                                    value={link.hasMegaMenu ? 'mega' : link.hasDropdown ? 'dropdown' : 'none'}
                                    onChange={(e) => {
                                      const updated = [...navLinks];
                                      const val = e.target.value;
                                      updated[idx] = {
                                        ...updated[idx],
                                        hasMegaMenu: val === 'mega',
                                        hasDropdown: val === 'dropdown',
                                      };
                                      handleUpdateLinks(updated);
                                    }}
                                    style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                                  >
                                    <option value="none">None</option>
                                    <option value="dropdown">Dropdown Submenu</option>
                                    <option value="mega">Mega Menu</option>
                                  </select>
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...navLinks];
                                        const temp = updated[idx - 1];
                                        updated[idx - 1] = updated[idx];
                                        updated[idx] = temp;
                                        handleUpdateLinks(updated);
                                        setExpandedLinkIdx(idx - 1);
                                      }}
                                      style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', cursor: 'pointer' }}
                                    >
                                      ↑ Move Up
                                    </button>
                                  )}
                                  {idx < navLinks.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...navLinks];
                                        const temp = updated[idx + 1];
                                        updated[idx + 1] = updated[idx];
                                        updated[idx] = temp;
                                        handleUpdateLinks(updated);
                                        setExpandedLinkIdx(idx + 1);
                                      }}
                                      style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', cursor: 'pointer' }}
                                    >
                                      ↓ Move Down
                                    </button>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = navLinks.filter((_, i) => i !== idx);
                                    handleUpdateLinks(updated);
                                    setExpandedLinkIdx(null);
                                  }}
                                  style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', background: '#ffffff', cursor: 'pointer' }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Item Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowInternalRoutePicker(!showInternalRoutePicker)}
                    style={{
                      padding: '9px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      color: '#2563eb',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={14} /> Store Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddLinkTypeModal(true)}
                    style={{
                      padding: '9px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#0f172a',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={14} /> Custom Link...
                  </button>
                </div>

                {/* Popover for Internal Routes */}
                {showInternalRoutePicker && (
                  <div
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      padding: '4px',
                    }}
                  >
                    <div style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                      SELECT STORE ROUTE
                    </div>
                    {INTERNAL_ROUTES.map((route) => (
                      <div
                        key={route.path}
                        onClick={() => handleAddInternalRoute(route)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{route.label}</span>
                        <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{route.path}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal for Custom Link */}
                {showAddLinkTypeModal && (
                  <div
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      padding: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Add Menu Item</span>
                      <button
                        type="button"
                        onClick={() => setShowAddLinkTypeModal(false)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {!customLinkModalType ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                        {[
                          { type: 'internal', label: 'Internal Page URL', desc: 'Link to any store page' },
                          { type: 'external', label: 'External Link', desc: 'Open in new tab with https://' },
                          { type: 'dropdown', label: 'Dropdown Category Flyout', desc: 'Flyout menu with subcategories' },
                          { type: 'mega', label: 'Multi-Category Mega Menu', desc: 'Rich multi-column store showcase' },
                        ].map((item) => (
                          <div
                            key={item.type}
                            onClick={() => setCustomLinkModalType(item.type as any)}
                            style={{
                              padding: '8px 10px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{item.label}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{item.desc}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Link Label</span>
                          <input
                            type="text"
                            value={newLinkLabel}
                            onChange={(e) => setNewLinkLabel(e.target.value)}
                            placeholder="e.g. New Arrivals"
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>URL</span>
                          <input
                            type="text"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            placeholder="/collections/new"
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                          />
                        </div>
                        {customLinkModalType === 'dropdown' && (
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Subcategories (comma separated)</span>
                            <input
                              type="text"
                              value={newLinkSubcategories}
                              onChange={(e) => setNewLinkSubcategories(e.target.value)}
                              placeholder="Men, Women, Accessories"
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                            />
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setCustomLinkModalType(null)}
                            style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'transparent', fontSize: '12px' }}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveCustomLink}
                            style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                          >
                            Add to Menu
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. NAVIGATION DESIGN TAB (Items 10, 25) */}
            {activeTab === 'design' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Navigation Styling
                </div>

                {/* State Selector (Item 25) */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    Interactive State
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {(['default', 'hover', 'active', 'focus'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setActiveStateTab(st)}
                        style={{
                          padding: '6px 4px',
                          borderRadius: '6px',
                          border: activeStateTab === st ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: activeStateTab === st ? '#eff6ff' : '#ffffff',
                          color: activeStateTab === st ? '#2563eb' : '#64748b',
                          fontSize: '11px',
                          fontWeight: activeStateTab === st ? 700 : 500,
                          textTransform: 'capitalize',
                          cursor: 'pointer',
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors based on selected State */}
                {activeStateTab === 'default' && (
                  <ColorInheritanceControl
                    label="Link Text Color (Default)"
                    mode={element.props.linkColorMode || 'inherit'}
                    value={element.props.textColor || palette.text?.body || '#475569'}
                    inheritedColor={palette.text?.body || '#475569'}
                    inheritedTokenName="Theme Body Text"
                    allowedModes={['inherit', 'color']}
                    onModeChange={(m) => handleUpdateProps({ linkColorMode: m })}
                    onChange={(c) => handleUpdateProps({ textColor: c })}
                  />
                )}

                {activeStateTab === 'hover' && (
                  <ColorInheritanceControl
                    label="Link Hover Color"
                    mode={element.props.hoverColorMode || 'inherit'}
                    value={element.props.hoverColor || palette.brand?.primary || '#2563eb'}
                    inheritedColor={palette.brand?.primary || '#2563eb'}
                    inheritedTokenName="Brand Primary"
                    allowedModes={['inherit', 'color']}
                    onModeChange={(m) => handleUpdateProps({ hoverColorMode: m })}
                    onChange={(c) => handleUpdateProps({ hoverColor: c })}
                  />
                )}

                {(activeStateTab === 'active' || activeStateTab === 'focus') && (
                  <ColorInheritanceControl
                    label={`Link ${activeStateTab === 'active' ? 'Active' : 'Focus'} Indicator Color`}
                    mode="inherit"
                    value={element.props.hoverColor || palette.brand?.primary || '#2563eb'}
                    inheritedColor={palette.brand?.primary || '#2563eb'}
                    inheritedTokenName="Brand Primary"
                    allowedModes={['inherit', 'color']}
                    onModeChange={() => {}}
                    onChange={(c) => handleUpdateProps({ hoverColor: c })}
                  />
                )}

                {/* Hover Style */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Hover Indicator Style
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {['underline', 'pill', 'dot', 'none'].map((styleOpt) => {
                      const isSelected = (element.props.hoverIndicator || 'underline') === styleOpt;
                      return (
                        <button
                          key={styleOpt}
                          type="button"
                          onClick={() => handleUpdateProps({ hoverIndicator: styleOpt })}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#2563eb' : '#475569',
                            fontSize: '11px',
                            fontWeight: isSelected ? 700 : 500,
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                          }}
                        >
                          {styleOpt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Controls */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Font Size</span>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>{element.props.fontSize || 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="11"
                      max="20"
                      value={element.props.fontSize || 14}
                      onChange={(e) => handleUpdateProps({ fontSize: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Font Weight</span>
                    <select
                      value={element.props.fontWeight || 500}
                      onChange={(e) => handleUpdateProps({ fontWeight: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                    >
                      <option value={400}>Regular (400)</option>
                      <option value={500}>Medium (500)</option>
                      <option value={600}>Semi-Bold (600)</option>
                      <option value={700}>Bold (700)</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Item Gap Spacing</span>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>{element.props.itemSpacing || 24}px</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="48"
                      value={element.props.itemSpacing || 24}
                      onChange={(e) => handleUpdateProps({ itemSpacing: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. NAVIGATION BEHAVIOR TAB (Item 10) */}
            {activeTab === 'behavior' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Navigation Behavior
                </div>

                {/* Alignment */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Alignment
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {['left', 'center', 'right'].map((align) => {
                      const isSelected = (element.props.alignment || 'left') === align;
                      return (
                        <button
                          key={align}
                          type="button"
                          onClick={() => handleUpdateProps({ alignment: align })}
                          style={{
                            padding: '8px',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#2563eb' : '#475569',
                            fontSize: '12px',
                            fontWeight: isSelected ? 700 : 500,
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                          }}
                        >
                          {align}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Menu Layout Style */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Mobile Drawer Presentation
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'drawer', label: 'Slide Drawer' },
                      { id: 'fullscreen', label: 'Full Screen' },
                      { id: 'accordion', label: 'Accordion' },
                    ].map((opt) => {
                      const isSelected = (element.props.mobileMenuStyle || 'drawer') === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleUpdateProps({ mobileMenuStyle: opt.id })}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#2563eb' : '#475569',
                            fontSize: '11px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accessibility Checklist (Item 20) */}
                <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    <Shield size={14} color="#2563eb" /> Navigation Accessibility
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Semantic <nav> landmark role', defaultChecked: true },
                      { label: 'Keyboard tab arrow navigation', defaultChecked: true },
                      { label: 'Esc key closes submenus & mega menus', defaultChecked: true },
                    ].map((item, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked={item.defaultChecked} style={{ width: '16px', height: '16px' }} />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            C. SEARCH BAR INSPECTOR (Content | Design | Behavior)
           ══════════════════════════════════════════════════════ */}
        {isSearch && (
          <div>
            {activeTab === 'look' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>Search Look</div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>Presentation</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'icon-only', label: 'Icon only' },
                      { id: 'compact', label: 'Compact' },
                      { id: 'bar', label: 'Search bar' },
                    ].map((look) => (
                      <button key={look.id} type="button" onClick={() => handleUpdateProps({ mode: look.id === 'bar' ? 'inline' : look.id === 'compact' ? 'expand' : 'icon' })} style={{ padding: '9px 5px', borderRadius: '6px', border: (element.props.mode || 'icon') === (look.id === 'bar' ? 'inline' : look.id === 'compact' ? 'expand' : 'icon') ? '1.5px solid #2563eb' : '1px solid #e2e8f0', background: (element.props.mode || 'icon') === (look.id === 'bar' ? 'inline' : look.id === 'compact' ? 'expand' : 'icon') ? '#eff6ff' : '#ffffff', color: '#334155', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{look.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>Search icon</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {['search', 'magnify', 'command', 'custom'].map((icon) => (
                      <button key={icon} type="button" onClick={() => handleUpdateProps({ iconType: icon, iconUrl: icon === 'custom' ? element.props.iconUrl : undefined })} style={{ minHeight: '42px', borderRadius: '6px', border: (element.props.iconType || 'search') === icon ? '1.5px solid #2563eb' : '1px solid #e2e8f0', background: (element.props.iconType || 'search') === icon ? '#eff6ff' : '#ffffff', color: '#475569', fontSize: '11px', cursor: 'pointer' }}>{icon === 'search' ? '⌕' : icon === 'magnify' ? '🔎' : icon === 'command' ? '⌘' : 'Custom'}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 1. SEARCH CONTENT TAB (Item 11) */}
            {activeTab === 'content' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Search Configuration
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>Display mode</label>
                  <select value={element.props.mode || 'icon'} onChange={(e) => handleUpdateProps({ mode: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}>
                    <option value="icon">Icon only</option>
                    <option value="expand">Compact icon, expand on click</option>
                    <option value="inline">Search bar</option>
                    <option value="large-inline">Large search bar</option>
                  </select>
                </div>

                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>Custom icon</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {element.props.iconUrl ? <img src={element.props.iconUrl} alt="Search icon" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /> : <Search size={24} color="#64748b" />}
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', color: '#334155', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      <Upload size={14} /> {element.props.iconUrl ? 'Change icon' : 'Upload icon'}
                      <input type="file" accept="image/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => handleUpdateProps({ iconUrl: String(reader.result), iconType: 'custom' }); reader.readAsDataURL(file); }} />
                    </label>
                    {element.props.iconUrl && <button type="button" onClick={() => handleUpdateProps({ iconUrl: undefined, iconType: 'search' })} style={{ border: 0, background: 'transparent', color: '#dc2626', fontSize: '11px', cursor: 'pointer' }}>Remove</button>}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={element.props.placeholder || 'Search products, collections...'}
                    onChange={(e) => handleUpdateProps({ placeholder: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    Search Source Scope
                  </label>
                  <select
                    value={element.props.searchSource || 'products'}
                    onChange={(e) => handleUpdateProps({ searchSource: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                  >
                    <option value="products">Products Only</option>
                    <option value="collections">Products & Collections</option>
                    <option value="all">Entire Store & Blog Articles</option>
                  </select>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#0f172a', cursor: 'pointer' }}>
                    <span>Live search suggestions dropdown</span>
                    <input
                      type="checkbox"
                      checked={element.props.showSuggestions !== false}
                      onChange={(e) => handleUpdateProps({ showSuggestions: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#0f172a', cursor: 'pointer' }}>
                    <span>Recent searches history</span>
                    <input
                      type="checkbox"
                      checked={element.props.recentSearches !== false}
                      onChange={(e) => handleUpdateProps({ recentSearches: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#0f172a', cursor: 'pointer' }}>
                    <span>Keyboard shortcut badge (⌘K)</span>
                    <input
                      type="checkbox"
                      checked={element.props.showShortcut !== false}
                      onChange={(e) => handleUpdateProps({ showShortcut: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 2. SEARCH DESIGN TAB (Item 11) */}
            {activeTab === 'design' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Search Bar Style
                </div>

                {/* Width Mode */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Width Sizing
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '8px' }}>
                    {['auto', 'fixed', 'fill'].map((wMode) => {
                      const isSelected = (element.props.widthMode || 'fixed') === wMode;
                      return (
                        <button
                          key={wMode}
                          type="button"
                          onClick={() => handleUpdateProps({ widthMode: wMode })}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#2563eb' : '#475569',
                            fontSize: '11px',
                            fontWeight: isSelected ? 700 : 500,
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                          }}
                        >
                          {wMode}
                        </button>
                      );
                    })}
                  </div>

                  {element.props.widthMode !== 'fill' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Width</span>
                        <span style={{ fontWeight: 600 }}>{element.props.width || 240}px</span>
                      </div>
                      <input
                        type="range"
                        min="160"
                        max="400"
                        value={element.props.width || 240}
                        onChange={(e) => handleUpdateProps({ width: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
                </div>

                {/* Height & Corner Radius */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                      Height ({element.props.height || 40}px)
                    </label>
                    <input
                      type="range"
                      min="32"
                      max="52"
                      value={element.props.height || 40}
                      onChange={(e) => handleUpdateProps({ height: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                      Corner Radius
                    </label>
                    <select
                      value={element.props.borderRadius || '8px'}
                      onChange={(e) => handleUpdateProps({ borderRadius: e.target.value })}
                      style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                    >
                      <option value="4px">4px (Subtle)</option>
                      <option value="8px">8px (Modern)</option>
                      <option value="12px">12px (Soft)</option>
                      <option value="9999px">Full Pill (Pill)</option>
                    </select>
                  </div>
                </div>

                {/* Search Background & Text Color */}
                <ColorInheritanceControl
                  label="Search Background Color"
                  mode={element.props.bgMode || 'inherit'}
                  value={element.props.bgColor || '#f1f5f9'}
                  inheritedColor="#f1f5f9"
                  inheritedTokenName="Surface Muted"
                  allowedModes={['inherit', 'color']}
                  onModeChange={(m) => handleUpdateProps({ bgMode: m })}
                  onChange={(c) => handleUpdateProps({ bgColor: c })}
                />
              </div>
            )}

            {/* 3. SEARCH BEHAVIOR TAB (Item 11) */}
            {activeTab === 'behavior' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Search Interaction
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Desktop Interaction Mode
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'inline', label: 'Inline Bar' },
                      { id: 'expand', label: 'Expand on click' },
                      { id: 'modal', label: 'Modal Overlay' },
                    ].map((opt) => {
                      const isSelected = (element.props.interactionMode || 'inline') === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleUpdateProps({ interactionMode: opt.id })}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#2563eb' : '#475569',
                            fontSize: '11px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Mobile / Tablet Behavior
                  </span>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                    • <b>Tablet:</b> Compact icon button triggering full overlay.<br />
                    • <b>Mobile:</b> Full-screen immersive search drawer with instant autocomplete.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            D. ACTIONS INSPECTOR (Content | Design | Behavior)
           ══════════════════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════════════════
            D. ACTIONS INSPECTOR (Actions | Content | Design | Behavior)
           ══════════════════════════════════════════════════════ */}
        {isActions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. ACTIONS TAB */}
            {activeTab === 'actions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                      Active Actions ({activeActionItems.length})
                    </span>
                    <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Visible in header</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0' }}>
                    Drag and drop vertically to reorder icons in the header.
                  </p>

                  {/* Active Container (Vertical Drag & Drop Only) */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverActive(true);
                    }}
                    onDragLeave={() => {
                      setIsDragOverActive(false);
                      setDragOverItemIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverActive(false);
                      setDragOverItemIndex(null);
                      const droppedId = draggedItemId || e.dataTransfer.getData('text/plain');
                      if (droppedId) {
                        const fromIdx = activeActionItems.findIndex((i) => i.id === droppedId);
                        if (fromIdx === -1) {
                          enableActionItem(droppedId);
                        }
                      }
                      setDraggedItemId(null);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: isDragOverActive ? '2px dashed #2563eb' : '1px solid #cbd5e1',
                      background: isDragOverActive ? '#eff6ff' : '#f8fafc',
                      minHeight: '84px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {activeActionItems.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12px' }}>
                        No active actions. Click "+ Enable" below to add icons to header.
                      </div>
                    ) : (
                      activeActionItems.map((item, idx) => {
                        const isBeingDragged = draggedItemId === item.id;
                        const isDragTarget = dragOverItemIndex === idx && !isBeingDragged;

                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStartItem(e, item.id)}
                            onDragOver={(e) => handleDragOverItem(e, idx)}
                            onDrop={(e) => handleDropOnItem(e, idx)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              background: '#ffffff',
                              borderRadius: '6px',
                              border: isDragTarget ? '2px solid #2563eb' : '1px solid #e2e8f0',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              gap: '8px',
                              opacity: isBeingDragged ? 0.4 : 1,
                              cursor: 'grab',
                              transition: 'border 0.1s ease, background 0.1s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                              {/* Drag Handle Icon (Vertical Only) */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: '#94a3b8',
                                  cursor: 'grab',
                                  flexShrink: 0,
                                }}
                                title="Drag vertically to reorder"
                              >
                                <GripVertical size={14} />
                              </div>

                              {/* Icon Preview */}
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '5px',
                                  background: '#eff6ff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {renderActionIcon(item, 16, '#2563eb')}
                              </div>

                              {/* Label & Path / Non-nav Badge */}
                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.label}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                                  {!item.isNavigation ? (
                                    <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '1px 5px', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: 500 }}>
                                      Trigger / Non-nav
                                    </span>
                                  ) : item.type === 'custom' ? (
                                    <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {item.path || '/'} {item.openInNewTab && <ExternalLink size={9} />}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                      <Lock size={9} /> {item.path || '/'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Item Actions (Icon-Only Edit & Delete Buttons) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              {/* Edit Button (Icon-Only) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedActionItemId(item.id);
                                  setActiveTab('content');
                                }}
                                title="Edit Action Style & Content"
                                aria-label="Edit Action"
                                style={{
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc',
                                  borderRadius: '5px',
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#2563eb',
                                  cursor: 'pointer',
                                  transition: 'background 0.15s ease',
                                }}
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Delete Button (Icon-Only for all items with confirmation) */}
                              <button
                                type="button"
                                onClick={() => setItemToDelete(item)}
                                title="Delete Action Item"
                                aria-label="Delete Action"
                                style={{
                                  border: '1px solid #fecaca',
                                  background: '#fff1f2',
                                  borderRadius: '5px',
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  transition: 'background 0.15s ease',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Add Custom Action Button (Opens Modal Overlay) */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCustomActionModal(true)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1.5px dashed #3b82f6',
                      borderRadius: '7px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <Plus size={15} /> Add Custom Action Icon
                  </button>
                </div>

                {/* Disabled Container with Extra Usable Icons */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                      Disabled Actions ({disabledActionItems.length})
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Drag or click Enable to restore</span>
                  </div>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverDisabled(true);
                    }}
                    onDragLeave={() => setIsDragOverDisabled(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverDisabled(false);
                      const id = draggedItemId || e.dataTransfer.getData('text/plain');
                      if (id) {
                        const isPrebuilt = isPrebuiltAction(id);
                        if (isPrebuilt) {
                          disableActionItem(id);
                        }
                      }
                      setDraggedItemId(null);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: isDragOverDisabled ? '2px dashed #94a3b8' : '1px dashed #cbd5e1',
                      background: isDragOverDisabled ? '#f1f5f9' : '#f8fafc',
                      minHeight: '60px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {disabledActionItems.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '12px', color: '#94a3b8', fontSize: '11px' }}>
                        No disabled actions. Drag active items here or click delete to disable them.
                      </div>
                    ) : (
                      disabledActionItems.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStartItem(e, item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: '#ffffff',
                            borderRadius: '5px',
                            border: '1px solid #e2e8f0',
                            cursor: 'grab',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {renderActionIcon(item, 14, '#64748b')}
                            </div>
                            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>{item.label}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => enableActionItem(item.id)}
                            style={{
                              border: '1px solid #93c5fd',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              borderRadius: '4px',
                              padding: '3px 8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            + Enable
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. CONTENT TAB */}
            {activeTab === 'content' && (() => {
              const currentItem = activeActionItems.find((i) => i.id === selectedActionItemId) || activeActionItems[0];
              if (!currentItem) {
                return (
                  <div
                    style={{
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px dashed #cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      No Enabled Action Items
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '240px' }}>
                      All action icons are currently disabled. Enable one or more icons in the Actions tab to customize their content and styles.
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('actions')}
                      style={{
                        marginTop: '4px',
                        padding: '6px 14px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Go to Actions Tab
                    </button>
                  </div>
                );
              }

              const variantsList = getVariantsForActionType(currentItem.type);
              const currentVariant = variantsList.find((v) => v.id === currentItem.iconType) || variantsList[0];

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Action Item Selector: Horizontally Scrollable Only (No Dropdown, Only Enabled Items) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                        Active Icons ({activeActionItems.length})
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Select to edit</span>
                    </div>

                    {/* Horizontally scrollable chip bar */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        overflowX: 'auto',
                        paddingBottom: '4px',
                        scrollbarWidth: 'thin',
                      }}
                    >
                      {activeActionItems.map((it) => {
                        const isSelected = it.id === currentItem.id;
                        const hasCustomColor = it.colorMode === 'custom' && it.color;
                        const effectiveColor = hasCustomColor ? it.color : (isSelected ? '#2563eb' : '#64748b');
                        return (
                          <button
                            key={it.id}
                            type="button"
                            onClick={() => setSelectedActionItemId(it.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                              background: isSelected ? '#eff6ff' : '#ffffff',
                              color: isSelected ? '#2563eb' : '#475569',
                              fontSize: '11px',
                              fontWeight: isSelected ? 700 : 500,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              transition: 'all 0.12s ease',
                              boxShadow: isSelected ? '0 1px 3px rgba(37,99,235,0.12)' : 'none',
                            }}
                          >
                            {renderActionIcon(it, 14, effectiveColor)}
                            <span>{it.label}</span>
                            {hasCustomColor && (
                              <span
                                title={`Custom Color: ${it.color}`}
                                style={{
                                  width: '7px',
                                  height: '7px',
                                  borderRadius: '50%',
                                  backgroundColor: it.color,
                                  border: '1px solid rgba(0,0,0,0.15)',
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card 1: Icon Style & Graphic */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      Icon Style & Graphic
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                      {/* Dropdown Button */}
                      <button
                        type="button"
                        onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: iconDropdownOpen ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              background: '#eff6ff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {renderActionIcon(currentItem, 15, currentItem.colorMode === 'custom' && currentItem.color ? currentItem.color : '#2563eb')}
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                            {currentItem.customIconUrl ? 'Custom Graphic Active' : (currentVariant?.name || 'Select Preset Icon')}
                          </span>
                        </div>
                        <ChevronDown size={14} color="#64748b" />
                      </button>

                      {/* Browse Button right next to Dropdown */}
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#1e293b',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'background 0.15s ease',
                        }}
                        title="Browse and upload custom icon or SVG"
                      >
                        <Upload size={13} /> Browse
                        <input
                          type="file"
                          accept="image/*,.svg"
                          onChange={(e) => handleCustomLogoFileUpload(e, currentItem.id)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* Dropdown Menu Popover with 10 Icons WITHOUT TEXT */}
                    {iconDropdownOpen && (
                      <div
                        style={{
                          marginTop: '2px',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Preset Icons (10 Styles)
                          </span>
                          <button
                            type="button"
                            onClick={() => setIconDropdownOpen(false)}
                            style={{ border: 0, background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          >
                            <X size={13} />
                          </button>
                        </div>

                        {/* 10 Icons Without Text */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                          {variantsList.map((variant) => {
                            const IconC = variant.icon;
                            const isSelected = currentItem.iconType === variant.id && !currentItem.customIconUrl;
                            return (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() => {
                                  const updated = actionItems.map((it) =>
                                    it.id === currentItem.id ? { ...it, iconType: variant.id, customIconUrl: undefined } : it
                                  );
                                  updateActionItems(updated);
                                  setIconDropdownOpen(false);
                                }}
                                title={variant.name}
                                aria-label={variant.name}
                                style={{
                                  width: '100%',
                                  aspectRatio: '1',
                                  borderRadius: '6px',
                                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                  background: isSelected ? '#eff6ff' : '#f8fafc',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.12s ease',
                                }}
                              >
                                <IconC size={18} color={isSelected ? '#2563eb' : '#475569'} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Custom Graphic Active Indicator / Input */}
                    {currentItem.customIconUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                        <img
                          src={currentItem.customIconUrl}
                          alt="Custom icon"
                          style={{ width: '24px', height: '24px', objectFit: 'contain', background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                        />
                        <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600, flex: 1 }}>
                          Custom graphic active
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = actionItems.map((it) =>
                              it.id === currentItem.id ? { ...it, customIconUrl: undefined } : it
                            );
                            updateActionItems(updated);
                          }}
                          style={{
                            border: '1px solid #fecaca',
                            background: '#ffffff',
                            color: '#ef4444',
                            borderRadius: '4px',
                            padding: '3px 7px',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          Revert to Icon
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Per-Icon Color Changing Option (Theme CSS Vars & Custom Colors) */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Palette size={14} color="#2563eb" />
                        Icon Color
                      </label>
                      {currentItem.colorMode === 'custom' && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated: ActionItemConfig[] = actionItems.map((it) =>
                              it.id === currentItem.id ? { ...it, colorMode: 'inherit', color: undefined } : it
                            );
                            updateActionItems(updated);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            fontSize: '11px',
                            cursor: 'pointer',
                            padding: '2px 4px',
                          }}
                          title="Reset to inherit global action color"
                        >
                          <RotateCcw size={11} /> Reset
                        </button>
                      )}
                    </div>

                    {/* Mode Toggle: Inherit vs Custom */}
                    <div
                      style={{
                        display: 'flex',
                        background: '#f1f5f9',
                        padding: '2px',
                        borderRadius: '6px',
                        gap: '2px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const updated: ActionItemConfig[] = actionItems.map((it) =>
                            it.id === currentItem.id ? { ...it, colorMode: 'inherit', color: undefined } : it
                          );
                          updateActionItems(updated);
                        }}
                        style={{
                          flex: 1,
                          padding: '5px',
                          borderRadius: '4px',
                          border: 'none',
                          background: currentItem.colorMode !== 'custom' ? '#ffffff' : 'transparent',
                          color: currentItem.colorMode !== 'custom' ? '#2563eb' : '#64748b',
                          fontWeight: currentItem.colorMode !== 'custom' ? 600 : 500,
                          fontSize: '11px',
                          cursor: 'pointer',
                          boxShadow: currentItem.colorMode !== 'custom' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <Sparkles size={11} />
                        Inherit Global
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated: ActionItemConfig[] = actionItems.map((it) =>
                            it.id === currentItem.id
                              ? {
                                  ...it,
                                  colorMode: 'custom',
                                  color: it.color || (element.props.iconColorMode === 'custom' && element.props.iconColor ? element.props.iconColor : palette.brand?.primary || '#2563eb'),
                                }
                              : it
                          );
                          updateActionItems(updated);
                        }}
                        style={{
                          flex: 1,
                          padding: '5px',
                          borderRadius: '4px',
                          border: 'none',
                          background: currentItem.colorMode === 'custom' ? '#ffffff' : 'transparent',
                          color: currentItem.colorMode === 'custom' ? '#2563eb' : '#64748b',
                          fontWeight: currentItem.colorMode === 'custom' ? 600 : 500,
                          fontSize: '11px',
                          cursor: 'pointer',
                          boxShadow: currentItem.colorMode === 'custom' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <Palette size={11} />
                        Custom Color
                      </button>
                    </div>

                    {currentItem.colorMode !== 'custom' ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              backgroundColor: element.props.iconColorMode === 'custom' && element.props.iconColor ? element.props.iconColor : (palette.text?.heading || '#0f172a'),
                              border: '1px solid rgba(0,0,0,0.15)',
                            }}
                          />
                          <span style={{ fontSize: '11px', color: '#475569' }}>
                            Following {element.props.iconColorMode === 'custom' ? 'Custom Global Actions Color' : 'Global Header Theme'}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={11} /> Active
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Theme CSS Variable Color Swatches */}
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.04em' }}>
                            Theme CSS Variable Colors
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {THEME_CSS_TOKENS.map((token) => {
                              const isTokenSelected = (currentItem.color || '').toLowerCase() === token.color.toLowerCase();
                              return (
                                <button
                                  key={token.name}
                                  type="button"
                                  onClick={() => {
                                    const updated: ActionItemConfig[] = actionItems.map((it) =>
                                      it.id === currentItem.id ? { ...it, colorMode: 'custom', color: token.color } : it
                                    );
                                    updateActionItems(updated);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    border: isTokenSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                    background: isTokenSelected ? '#eff6ff' : '#f8fafc',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.12s ease',
                                  }}
                                  title={`${token.name} (${token.varName}): ${token.color}`}
                                >
                                  <span
                                    style={{
                                      width: '14px',
                                      height: '14px',
                                      borderRadius: '3px',
                                      backgroundColor: token.color,
                                      border: '1px solid rgba(0,0,0,0.15)',
                                      flexShrink: 0,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    {isTokenSelected && <Check size={10} color="#ffffff" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.8))' }} />}
                                  </span>
                                  <span style={{ fontSize: '11px', fontWeight: isTokenSelected ? 700 : 500, color: isTokenSelected ? '#2563eb' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {token.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Freeform Custom Color Picker & Hex Input */}
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.04em' }}>
                            Custom Color Picker
                          </span>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 10px',
                              backgroundColor: '#f8fafc',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <ColorPickerPopover
                              value={currentItem.color || '#2563eb'}
                              onChange={(val) => {
                                const updated: ActionItemConfig[] = actionItems.map((it) =>
                                  it.id === currentItem.id ? { ...it, colorMode: 'custom', color: val } : it
                                );
                                updateActionItems(updated);
                              }}
                              size="md"
                            />
                            <input
                              type="text"
                              value={currentItem.color || '#2563eb'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated: ActionItemConfig[] = actionItems.map((it) =>
                                  it.id === currentItem.id ? { ...it, colorMode: 'custom', color: val } : it
                                );
                                updateActionItems(updated);
                              }}
                              placeholder="#000000"
                              style={{
                                flex: 1,
                                padding: '5px 8px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '5px',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                color: '#0f172a',
                                background: '#ffffff',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Cart Badge Customization (if Cart is selected) */}
                  {currentItem.type === 'cart' && (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                          Cart Count Badge Styling
                        </span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#475569', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={element.props.showCartBadge !== false}
                            onChange={(e) => handleUpdateProps({ showCartBadge: e.target.checked })}
                          />
                          Show Badge
                        </label>
                      </div>

                      {element.props.showCartBadge !== false && (
                        <>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                              Item Count Number
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={element.props.cartItemCount !== undefined ? element.props.cartItemCount : 2}
                              onChange={(e) => handleUpdateProps({ cartItemCount: Math.max(0, parseInt(e.target.value) || 0) })}
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '12px' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                              Badge Shape Style
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                              {['pill', 'dot', 'square'].map((st) => {
                                const isSelected = (element.props.cartBadgeStyle || 'pill') === st;
                                return (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleUpdateProps({ cartBadgeStyle: st })}
                                    style={{
                                      padding: '5px',
                                      borderRadius: '5px',
                                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                      background: isSelected ? '#eff6ff' : '#ffffff',
                                      color: isSelected ? '#2563eb' : '#475569',
                                      fontSize: '11px',
                                      fontWeight: isSelected ? 700 : 500,
                                      cursor: 'pointer',
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {st}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Badge Bg</label>
                              <input
                                type="color"
                                value={element.props.cartBadgeBg || palette.brand?.primary || '#2563eb'}
                                onChange={(e) => handleUpdateProps({ cartBadgeBg: e.target.value })}
                                style={{ width: '100%', height: '30px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer', padding: 0 }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Text Color</label>
                              <input
                                type="color"
                                value={element.props.cartBadgeColor || '#ffffff'}
                                onChange={(e) => handleUpdateProps({ cartBadgeColor: e.target.value })}
                                style={{ width: '100%', height: '30px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer', padding: 0 }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Card 4: Per-Icon Click Behavior (Search, Cart, Account, Wishlist) */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      Icon Click Behavior
                    </span>

                    {currentItem.type === 'search' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Search Trigger Action
                        </label>
                        <select
                          value={element.props.searchAction || 'modal'}
                          onChange={(e) => handleUpdateProps({ searchAction: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        >
                          <option value="modal">Full Page Search Modal Overlay</option>
                          <option value="dropdown">Dropdown Search Bar Under Header</option>
                          <option value="command">Command Palette Dialog (⌘K)</option>
                          <option value="inline">Expand Inline Input</option>
                        </select>
                      </div>
                    )}

                    {currentItem.type === 'cart' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Cart Trigger Action
                        </label>
                        <select
                          value={element.props.cartAction || 'drawer'}
                          onChange={(e) => handleUpdateProps({ cartAction: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        >
                          <option value="drawer">Slide-out Mini Cart Drawer (Right)</option>
                          <option value="page">Navigate to /cart Page</option>
                          <option value="modal">Centered Cart Summary Modal</option>
                        </select>
                      </div>
                    )}

                    {currentItem.type === 'account' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Account Trigger Action
                        </label>
                        <select
                          value={element.props.accountAction || 'modal'}
                          onChange={(e) => handleUpdateProps({ accountAction: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        >
                          <option value="modal">Popup Login / Profile Modal</option>
                          <option value="page">Navigate to /account Page</option>
                          <option value="dropdown">Quick Profile Dropdown Menu</option>
                        </select>
                      </div>
                    )}

                    {currentItem.type === 'wishlist' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Wishlist Trigger Action
                        </label>
                        <select
                          value={element.props.wishlistAction || 'drawer'}
                          onChange={(e) => handleUpdateProps({ wishlistAction: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        >
                          <option value="drawer">Slide-out Favorites Drawer (Right)</option>
                          <option value="page">Navigate to /wishlist Page</option>
                          <option value="toast">Display 'Added to Wishlist' Toast Notification</option>
                        </select>
                      </div>
                    )}

                    {!['search', 'cart', 'account', 'wishlist'].includes(currentItem.type) && (
                      <div style={{ padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b' }}>
                        {currentItem.isNavigation ? (
                          <span>🔗 <b>Navigation Link:</b> Navigates to configured URL destination path.</span>
                        ) : (
                          <span>⚡ <b>Interactive Trigger:</b> Triggers dedicated drawer or floating widget.</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card 5: Label & URL Path */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      Action Details & Link
                    </span>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                        Action Label / Tooltip
                      </label>
                      <input
                        type="text"
                        value={currentItem.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = actionItems.map((it) =>
                            it.id === currentItem.id ? { ...it, label: val } : it
                          );
                          updateActionItems(updated);
                        }}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                        Destination URL Path
                      </label>
                      {!currentItem.isNavigation ? (
                        <div style={{ padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b' }}>
                          ℹ️ <b>Non-navigation action:</b> This icon triggers an interactive widget and does not navigate to another page.
                        </div>
                      ) : currentItem.type === 'custom' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <input
                            type="text"
                            value={currentItem.path || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = actionItems.map((it) =>
                                it.id === currentItem.id ? { ...it, path: val } : it
                              );
                              updateActionItems(updated);
                            }}
                            placeholder="e.g. /promos, /contact, https://..."
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '12px' }}
                          />
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={Boolean(currentItem.openInNewTab)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const updated = actionItems.map((it) =>
                                  it.id === currentItem.id ? { ...it, openInNewTab: checked } : it
                                );
                                updateActionItems(updated);
                              }}
                            />
                            Open in new browser tab
                          </label>
                        </div>
                      ) : (
                        <div style={{ padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Lock size={12} color="#94a3b8" />
                          <span>Route: <b>{currentItem.path}</b> (System default route). Protected from alteration.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3. DESIGN TAB */}
            {activeTab === 'design' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Global Actions Style & Colors
                </div>

                {/* Global Actions Color Card */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Palette size={14} color="#2563eb" />
                      Global Action Icons Color
                    </label>
                    {element.props.iconColorMode === 'custom' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateProps({ iconColorMode: 'inherit', iconColor: undefined })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          fontSize: '11px',
                          cursor: 'pointer',
                          padding: '2px 4px',
                        }}
                        title="Reset to inherit navbar theme color"
                      >
                        <RotateCcw size={11} /> Reset
                      </button>
                    )}
                  </div>

                  {/* Inherit vs Custom segmented toggle */}
                  <div
                    style={{
                      display: 'flex',
                      background: '#f1f5f9',
                      padding: '2px',
                      borderRadius: '6px',
                      gap: '2px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {['inherit', 'custom'].map((mode) => {
                      const isSelected = (element.props.iconColorMode || 'inherit') === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleUpdateProps({ iconColorMode: mode })}
                          style={{
                            flex: 1,
                            padding: '5px',
                            borderRadius: '4px',
                            border: 'none',
                            background: isSelected ? '#ffffff' : 'transparent',
                            color: isSelected ? '#2563eb' : '#64748b',
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: '11px',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {mode === 'inherit' ? <Sparkles size={11} /> : <Palette size={11} />}
                          {mode === 'inherit' ? 'Inherit Theme' : 'Custom Color'}
                        </button>
                      );
                    })}
                  </div>

                  {element.props.iconColorMode !== 'custom' ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            backgroundColor: palette.text?.heading || '#0f172a',
                            border: '1px solid rgba(0,0,0,0.15)',
                          }}
                        />
                        <span style={{ fontSize: '11px', color: '#475569' }}>
                          Following Header Text ({palette.text?.heading || '#0f172a'})
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={11} /> Active
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Theme CSS Variable Color Swatches */}
                      <div>
                        <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.04em' }}>
                          Theme CSS Variable Colors
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                          {THEME_CSS_TOKENS.map((token) => {
                            const isTokenSelected = (element.props.iconColor || '').toLowerCase() === token.color.toLowerCase();
                            return (
                              <button
                                key={token.name}
                                type="button"
                                onClick={() => handleUpdateProps({ iconColor: token.color })}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: isTokenSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                  background: isTokenSelected ? '#eff6ff' : '#f8fafc',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.12s ease',
                                }}
                                title={`${token.name} (${token.varName}): ${token.color}`}
                              >
                                <span
                                  style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '3px',
                                    backgroundColor: token.color,
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    flexShrink: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {isTokenSelected && <Check size={10} color="#ffffff" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.8))' }} />}
                                </span>
                                <span style={{ fontSize: '11px', fontWeight: isTokenSelected ? 700 : 500, color: isTokenSelected ? '#2563eb' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {token.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Color Picker & Hex Input */}
                      <div>
                        <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.04em' }}>
                          Freeform Custom Color
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <ColorPickerPopover
                            value={element.props.iconColor || '#0f172a'}
                            onChange={(val) => handleUpdateProps({ iconColor: val })}
                            size="md"
                          />
                          <input
                            type="text"
                            value={element.props.iconColor || '#0f172a'}
                            onChange={(e) => handleUpdateProps({ iconColor: e.target.value })}
                            placeholder="#000000"
                            style={{
                              flex: 1,
                              padding: '5px 8px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              color: '#0f172a',
                              background: '#ffffff',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Icon Size */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Icon Size</span>
                    <span style={{ color: '#2563eb', fontWeight: 700 }}>{element.props.iconSize || 18}px</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                    {[16, 18, 20, 22, 24].map((sz) => {
                      const isSelected = (Number(element.props.iconSize) || 18) === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleUpdateProps({ iconSize: sz })}
                          style={{
                            padding: '6px 0',
                            borderRadius: '5px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#2563eb' : '#475569',
                            fontSize: '11px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {sz}px
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spacing / Gap */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Gap Spacing</span>
                    <span style={{ color: '#2563eb', fontWeight: 700 }}>{element.props.spacing !== undefined ? element.props.spacing : 14}px</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="32"
                    value={element.props.spacing !== undefined ? element.props.spacing : 14}
                    onChange={(e) => handleUpdateProps({ spacing: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            {/* 4. CONFIRMATION DIALOG MODAL FOR DELETING ACTION ITEM */}
            {itemToDelete && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100000,
                  padding: '16px',
                }}
                onClick={() => setItemToDelete(null)}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    maxWidth: '380px',
                    width: '100%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                        Delete Action Item
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Confirmation required
                      </p>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                    Are you sure you want to delete <b>{itemToDelete.label}</b>?
                  </p>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      color: '#475569',
                    }}
                  >
                    {isPrebuiltAction(itemToDelete.id) ? (
                      <span>
                        ℹ️ This prebuilt item will be moved to the <b>Disabled Actions</b> container below. You can restore it anytime.
                      </span>
                    ) : (
                      <span>
                        ⚠️ This custom item and its link destination will be <b>permanently removed</b>.
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(null)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: 0,
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. ADD CUSTOM ACTION OVERLAY WIDGET MODAL */}
            {showCustomActionModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100000,
                  padding: '16px',
                }}
                onClick={() => setShowCustomActionModal(false)}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    maxWidth: '440px',
                    width: '100%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                        Add Custom Action Icon
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Create a custom icon button with custom destination link
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomActionModal(false)}
                      style={{ border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Action Label / Tooltip
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Club, Store Locator, Contact Us"
                      value={newActionLabel}
                      onChange={(e) => setNewActionLabel(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Destination URL Path
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /promos, /contact, https://..."
                      value={newActionPath}
                      onChange={(e) => setNewActionPath(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Choose Icon Preset
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '6px',
                        maxHeight: '120px',
                        overflowY: 'auto',
                        padding: '6px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        background: '#f8fafc',
                      }}
                    >
                      {CUSTOM_PRESET_ICONS.map((preset) => {
                        const IconC = preset.icon;
                        const isSelected = newActionIconId === preset.id && !newActionCustomUrl;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setNewActionIconId(preset.id);
                              setNewActionCustomUrl('');
                            }}
                            title={preset.name}
                            style={{
                              padding: '7px',
                              borderRadius: '6px',
                              border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                              background: isSelected ? '#eff6ff' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.12s ease',
                            }}
                          >
                            <IconC size={16} color={isSelected ? '#2563eb' : '#475569'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Or Custom Logo / Graphic Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or data:image/..."
                      value={newActionCustomUrl}
                      onChange={(e) => setNewActionCustomUrl(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newActionOpenNewTab}
                      onChange={(e) => setNewActionOpenNewTab(e.target.checked)}
                    />
                    Open link in a new browser tab
                  </label>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setShowCustomActionModal(false)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#64748b',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCustomAction}
                      disabled={!newActionLabel.trim()}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 0,
                        backgroundColor: newActionLabel.trim() ? '#2563eb' : '#94a3b8',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: newActionLabel.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Add Action
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            E. FALLBACK GENERIC COMPONENT (Content | Design | Behavior)
           ══════════════════════════════════════════════════════ */}
        {isCta && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeTab === 'content' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CTA Content</div>
                <label style={{ fontSize: '12px', color: '#475569' }}>Button text<input value={element.props.text || ''} onChange={(event) => handleUpdateProps({ text: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                <label style={{ fontSize: '12px', color: '#475569' }}>Destination<input value={element.props.url || ''} onChange={(event) => handleUpdateProps({ url: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                <label style={{ fontSize: '12px', color: '#475569' }}>Open in<select value={element.props.openInNewTab ? 'new' : 'same'} onChange={(event) => handleUpdateProps({ openInNewTab: event.target.value === 'new' })} style={{ display: 'block', width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}><option value="same">Same tab</option><option value="new">New tab</option></select></label>
              </div>
            )}
            {activeTab === 'design' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <ColorInheritanceControl label="CTA Color" mode={element.props.colorMode || 'inherit'} value={element.props.color || palette.brand?.primary || '#2563eb'} inheritedColor={palette.brand?.primary || '#2563eb'} inheritedTokenName="Brand Primary" allowedModes={['inherit', 'color']} onModeChange={(mode) => handleUpdateProps({ colorMode: mode })} onChange={(color) => handleUpdateProps({ color })} />
                <label style={{ fontSize: '12px', color: '#475569' }}>Style<select value={element.props.variant || 'primary'} onChange={(event) => handleUpdateProps({ variant: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}><option value="primary">Primary</option><option value="secondary">Secondary</option><option value="outline">Outline</option><option value="ghost">Ghost</option></select></label>
                <label style={{ fontSize: '12px', color: '#475569' }}>Size<select value={element.props.size || 'sm'} onChange={(event) => handleUpdateProps({ size: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}><option value="xs">XS</option><option value="sm">SM</option><option value="md">MD</option><option value="lg">LG</option></select></label>
              </div>
            )}
            {activeTab === 'behavior' && (
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>Visible<input type="checkbox" checked={element.isVisible !== false} onChange={(event) => handleUpdateMeta({ isVisible: event.target.checked })} /></label>
            )}
          </div>
        )}

        {!isLogo && !isNav && !isSearch && !isActions && !isCta && (
          <div>
            {activeTab === 'content' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. Brand Description / Bio */}
                {(element.type === 'brand-description' || element.type === 'brand-story') && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Brand Story & Bio
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Brand Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={element.props.brandName || ''}
                        onChange={(e) => handleUpdateProps({ brandName: e.target.value })}
                        placeholder="BillionBiz"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Description / Bio Text
                      </label>
                      <textarea
                        rows={4}
                        value={element.props.text || ''}
                        onChange={(e) => handleUpdateProps({ text: e.target.value })}
                        placeholder="Write your brand mission or bio..."
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', lineHeight: 1.5 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={element.props.tagline || ''}
                        onChange={(e) => handleUpdateProps({ tagline: e.target.value })}
                        placeholder="Crafted for modern retail"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </>
                )}

                {/* 2. Contact Information */}
                {(element.type === 'contact' || element.type === 'address') && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Contact Details
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Section Heading
                      </label>
                      <input
                        type="text"
                        value={element.props.heading || 'Contact Us'}
                        onChange={(e) => handleUpdateProps({ heading: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Phone Hotline
                      </label>
                      <input
                        type="text"
                        value={element.props.phone || ''}
                        onChange={(e) => handleUpdateProps({ phone: e.target.value })}
                        placeholder="+1 (800) 555-0199"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={element.props.email || ''}
                        onChange={(e) => handleUpdateProps({ email: e.target.value })}
                        placeholder="support@yourstore.com"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Physical Address
                      </label>
                      <input
                        type="text"
                        value={element.props.address || ''}
                        onChange={(e) => handleUpdateProps({ address: e.target.value })}
                        placeholder="100 Commerce Blvd, Suite 400"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={element.props.whatsapp || ''}
                        onChange={(e) => handleUpdateProps({ whatsapp: e.target.value })}
                        placeholder="+1 (800) 555-0198"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </>
                )}

                {/* 3. Business Hours */}
                {element.type === 'business-hours' && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Business Hours
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Heading
                      </label>
                      <input
                        type="text"
                        value={element.props.heading || 'Business Hours'}
                        onChange={(e) => handleUpdateProps({ heading: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Weekday Hours
                      </label>
                      <input
                        type="text"
                        value={element.props.weekdayHours || 'Mon – Fri: 9:00 AM – 7:00 PM EST'}
                        onChange={(e) => handleUpdateProps({ weekdayHours: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Weekend Hours
                      </label>
                      <input
                        type="text"
                        value={element.props.weekendHours || 'Saturday: 10:00 AM – 5:00 PM EST'}
                        onChange={(e) => handleUpdateProps({ weekendHours: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </>
                )}

                {/* 4. Rich Text */}
                {element.type === 'rich-text' && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Rich Text Content
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Heading (Optional)
                      </label>
                      <input
                        type="text"
                        value={element.props.heading || ''}
                        onChange={(e) => handleUpdateProps({ heading: e.target.value })}
                        placeholder="About Us"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Body Text / Content
                      </label>
                      <textarea
                        rows={5}
                        value={element.props.content || ''}
                        onChange={(e) => handleUpdateProps({ content: e.target.value })}
                        placeholder="Write your text or editorial here..."
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', lineHeight: 1.5 }}
                      />
                    </div>
                  </>
                )}

                {/* 5. Image */}
                {element.type === 'image' && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Image Settings
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={element.props.imageUrl || ''}
                        onChange={(e) => handleUpdateProps({ imageUrl: e.target.value })}
                        placeholder="https://example.com/badge.png"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={element.props.altText || ''}
                        onChange={(e) => handleUpdateProps({ altText: e.target.value })}
                        placeholder="Badge illustration"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Link Destination URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={element.props.linkUrl || ''}
                        onChange={(e) => handleUpdateProps({ linkUrl: e.target.value })}
                        placeholder="https://example.com"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </>
                )}

                {/* 6. Custom HTML */}
                {element.type === 'custom-html' && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Custom HTML / Embed
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        HTML Embed Code
                      </label>
                      <textarea
                        rows={6}
                        value={element.props.html || ''}
                        onChange={(e) => handleUpdateProps({ html: e.target.value })}
                        placeholder="<div>Custom Content</div>"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}
                      />
                    </div>
                  </>
                )}

                {/* 7. Divider / Spacer */}
                {(element.type === 'divider' || element.type === 'spacer') && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      {element.type === 'spacer' ? 'Spacer Height' : 'Divider Styling'}
                    </div>
                    {element.type === 'spacer' ? (
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                          Height ({element.props.height ?? 20}px)
                        </label>
                        <input
                          type="range"
                          min="8"
                          max="64"
                          value={element.props.height ?? 20}
                          onChange={(e) => handleUpdateProps({ height: Number(e.target.value) })}
                          style={{ width: '100%' }}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                            Line Style
                          </label>
                          <select
                            value={element.props.style || 'solid'}
                            onChange={(e) => handleUpdateProps({ style: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                          >
                            <option value="solid">Solid Line</option>
                            <option value="dashed">Dashed Line</option>
                            <option value="dotted">Dotted Line</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                            Thickness ({element.props.thickness ?? 1}px)
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="6"
                            value={element.props.thickness ?? 1}
                            onChange={(e) => handleUpdateProps({ thickness: Number(e.target.value) })}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* 8. Newsletter Signup */}
                {element.type === 'newsletter-form' && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Newsletter Configuration
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Headline
                      </label>
                      <input
                        type="text"
                        value={element.props.title ?? 'Stay in the loop'}
                        onChange={(e) => handleUpdateProps({ title: e.target.value })}
                        placeholder="Stay in the loop"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Subtitle / Description
                      </label>
                      <textarea
                        rows={2}
                        value={element.props.subtitle ?? 'Subscribe for weekly releases, stories & member perks.'}
                        onChange={(e) => handleUpdateProps({ subtitle: e.target.value })}
                        placeholder="Subscribe for weekly releases..."
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Input Placeholder
                      </label>
                      <input
                        type="text"
                        value={element.props.placeholder ?? 'Enter your email...'}
                        onChange={(e) => handleUpdateProps({ placeholder: e.target.value })}
                        placeholder="Enter your email..."
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={element.props.buttonText ?? 'Subscribe'}
                        onChange={(e) => handleUpdateProps({ buttonText: e.target.value })}
                        placeholder="Subscribe"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Form Layout
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {[
                          { id: 'stacked', label: 'Stacked (Best)' },
                          { id: 'inline', label: 'Inline Row' },
                          { id: 'joined', label: 'Joined Capsule' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleUpdateProps({ layout: m.id })}
                            style={{
                              padding: '7px 4px',
                              borderRadius: '6px',
                              border: (element.props.layout || 'stacked') === m.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                              backgroundColor: (element.props.layout || 'stacked') === m.id ? '#eff6ff' : '#ffffff',
                              color: (element.props.layout || 'stacked') === m.id ? '#1d4ed8' : '#334155',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'center',
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Button Style
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {[
                          { id: 'solid', label: 'Solid Fill' },
                          { id: 'pill', label: 'Curved Pill' },
                          { id: 'outline', label: 'Outline' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleUpdateProps({ buttonStyle: s.id })}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: (element.props.buttonStyle || 'solid') === s.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                              backgroundColor: (element.props.buttonStyle || 'solid') === s.id ? '#eff6ff' : '#ffffff',
                              color: (element.props.buttonStyle || 'solid') === s.id ? '#1d4ed8' : '#334155',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                          Button Color
                        </label>
                        <input
                          type="color"
                          value={element.props.buttonBg || '#2563eb'}
                          onChange={(e) => handleUpdateProps({ buttonBg: e.target.value })}
                          style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                          Button Text
                        </label>
                        <input
                          type="color"
                          value={element.props.buttonColor || '#ffffff'}
                          onChange={(e) => handleUpdateProps({ buttonColor: e.target.value })}
                          style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                      ✦ Headline, description & input borders dynamically inherit from footer color palette variables.
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                        <input
                          type="checkbox"
                          checked={element.props.showDisclaimer !== false}
                          onChange={(e) => handleUpdateProps({ showDisclaimer: e.target.checked })}
                        />
                        <span>Show Privacy Disclaimer</span>
                      </label>
                      {element.props.showDisclaimer !== false && (
                        <input
                          type="text"
                          value={element.props.disclaimerText ?? 'By subscribing you agree to our Privacy Policy.'}
                          onChange={(e) => handleUpdateProps({ disclaimerText: e.target.value })}
                          style={{ width: '100%', marginTop: '6px', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', color: '#64748b' }}
                        />
                      )}
                    </div>
                  </>
                )}

                {/* 9. Social Links */}
                {(element.type === 'social-links' || element.type === 'social-icons') && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Social Profiles Configuration
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                          Heading Text
                        </label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={element.props.showHeading !== false}
                            onChange={(e) => handleUpdateProps({ showHeading: e.target.checked })}
                          />
                          <span>Show</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={element.props.heading ?? 'Connect With Us'}
                        onChange={(e) => handleUpdateProps({ heading: e.target.value })}
                        placeholder="Connect With Us"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Display Style
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {[
                          { id: 'circles', label: 'Circles' },
                          { id: 'rounded', label: 'Rounded' },
                          { id: 'minimal', label: 'Minimal' },
                        ].map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleUpdateProps({ variant: v.id })}
                            style={{
                              padding: '6px 4px',
                              borderRadius: '6px',
                              border: (element.props.variant || 'circles') === v.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                              backgroundColor: (element.props.variant || 'circles') === v.id ? '#eff6ff' : '#ffffff',
                              color: (element.props.variant || 'circles') === v.id ? '#1d4ed8' : '#334155',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                        <span>Icon Size</span>
                        <span style={{ color: '#2563eb' }}>{element.props.size ?? 16}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="26"
                        value={element.props.size ?? 16}
                        onChange={(e) => handleUpdateProps({ size: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Active Platforms & Links
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(element.props.platforms || [
                          { platform: 'instagram', url: 'https://instagram.com', enabled: true },
                          { platform: 'twitter', url: 'https://twitter.com', enabled: true },
                          { platform: 'facebook', url: 'https://facebook.com', enabled: true },
                          { platform: 'youtube', url: 'https://youtube.com', enabled: true },
                          { platform: 'tiktok', url: 'https://tiktok.com', enabled: false },
                          { platform: 'linkedin', url: 'https://linkedin.com', enabled: false },
                        ]).map((plat: any, pIdx: number) => {
                          const currentPlatforms = element.props.platforms || [
                            { platform: 'instagram', url: 'https://instagram.com', enabled: true },
                            { platform: 'twitter', url: 'https://twitter.com', enabled: true },
                            { platform: 'facebook', url: 'https://facebook.com', enabled: true },
                            { platform: 'youtube', url: 'https://youtube.com', enabled: true },
                            { platform: 'tiktok', url: 'https://tiktok.com', enabled: false },
                            { platform: 'linkedin', url: 'https://linkedin.com', enabled: false },
                          ];
                          return (
                            <div key={plat.platform} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                              <input
                                type="checkbox"
                                checked={plat.enabled !== false}
                                onChange={(e) => {
                                  const updated = currentPlatforms.map((p: any, i: number) =>
                                    i === pIdx ? { ...p, enabled: e.target.checked } : p
                                  );
                                  handleUpdateProps({ platforms: updated });
                                }}
                              />
                              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1e293b', width: '70px', textTransform: 'capitalize' }}>
                                {plat.platform}
                              </span>
                              <input
                                type="text"
                                value={plat.url || ''}
                                onChange={(e) => {
                                  const updated = currentPlatforms.map((p: any, i: number) =>
                                    i === pIdx ? { ...p, url: e.target.value } : p
                                  );
                                  handleUpdateProps({ platforms: updated });
                                }}
                                placeholder={`https://${plat.platform}.com/...`}
                                style={{ flex: 1, padding: '4px 6px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* 10. Payment Methods */}
                {element.type === 'payment-methods' && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Payment Methods Badges
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                          Heading
                        </label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={element.props.showHeading !== false}
                            onChange={(e) => handleUpdateProps({ showHeading: e.target.checked })}
                          />
                          <span>Show</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={element.props.heading ?? 'Accepted Payments'}
                        onChange={(e) => handleUpdateProps({ heading: e.target.value })}
                        placeholder="Accepted Payments"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Accepted Providers
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {[
                          { id: 'visa', label: 'Visa' },
                          { id: 'mastercard', label: 'Mastercard' },
                          { id: 'amex', label: 'American Express' },
                          { id: 'paypal', label: 'PayPal' },
                          { id: 'applepay', label: 'Apple Pay' },
                          { id: 'googlepay', label: 'Google Pay' },
                          { id: 'klarna', label: 'Klarna' },
                          { id: 'shoppay', label: 'Shop Pay' },
                        ].map((prov) => {
                          const activeProviders: string[] = element.props.providers || ['visa', 'mastercard', 'amex', 'paypal', 'applepay', 'googlepay'];
                          const isChecked = activeProviders.includes(prov.id);
                          return (
                            <label
                              key={prov.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 8px',
                                border: isChecked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                                backgroundColor: isChecked ? '#eff6ff' : '#ffffff',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11.5px',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...activeProviders, prov.id]
                                    : activeProviders.filter((p: string) => p !== prov.id);
                                  handleUpdateProps({ providers: next });
                                }}
                              />
                              <span style={{ fontWeight: isChecked ? 600 : 400 }}>{prov.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* 11. Trust Badges */}
                {element.type === 'trust-badges' && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Trust Guarantees in Column
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Heading (Optional)
                      </label>
                      <input
                        type="text"
                        value={element.props.heading || ''}
                        onChange={(e) => handleUpdateProps({ heading: e.target.value })}
                        placeholder="Guaranteed Safe"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Icon Accent Color
                      </label>
                      <input
                        type="color"
                        value={element.props.iconColor || '#10b981'}
                        onChange={(e) => handleUpdateProps({ iconColor: e.target.value })}
                        style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                    </div>
                  </>
                )}

                {/* 12. App Download */}
                {element.type === 'app-download' && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Mobile App Badges
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Heading
                      </label>
                      <input
                        type="text"
                        value={element.props.heading ?? 'Get Our App'}
                        onChange={(e) => handleUpdateProps({ heading: e.target.value })}
                        placeholder="Get Our App"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        App Store URL
                      </label>
                      <input
                        type="text"
                        value={element.props.appStoreUrl || '#'}
                        onChange={(e) => handleUpdateProps({ appStoreUrl: e.target.value })}
                        placeholder="https://apps.apple.com/..."
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Google Play URL
                      </label>
                      <input
                        type="text"
                        value={element.props.googlePlayUrl || '#'}
                        onChange={(e) => handleUpdateProps({ googlePlayUrl: e.target.value })}
                        placeholder="https://play.google.com/..."
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </>
                )}

                {/* 13. Copyright */}
                {element.type === 'copyright' && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Copyright Statement
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Copyright Text
                      </label>
                      <textarea
                        rows={3}
                        value={element.props.text ?? '© 2026 BillionBiz, Inc. All rights reserved.'}
                        onChange={(e) => handleUpdateProps({ text: e.target.value })}
                        placeholder="© 2026 BillionBiz, Inc. All rights reserved."
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </>
                )}

                {/* Default Fallback */}
                {element.type !== 'brand-description' &&
                  element.type !== 'brand-story' &&
                  element.type !== 'contact' &&
                  element.type !== 'address' &&
                  element.type !== 'business-hours' &&
                  element.type !== 'rich-text' &&
                  element.type !== 'image' &&
                  element.type !== 'custom-html' &&
                  element.type !== 'divider' &&
                  element.type !== 'spacer' &&
                  element.type !== 'newsletter-form' &&
                  element.type !== 'social-links' &&
                  element.type !== 'social-icons' &&
                  element.type !== 'payment-methods' &&
                  element.type !== 'trust-badges' &&
                  element.type !== 'app-download' &&
                  element.type !== 'copyright' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        Component Content / Text
                      </label>
                      <input
                        type="text"
                        value={element.props.text || ''}
                        onChange={(e) => handleUpdateProps({ text: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  )}
              </div>
            )}

            {activeTab === 'design' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <ColorInheritanceControl
                  label="Text Color"
                  mode={element.props.colorMode || 'inherit'}
                  value={element.props.textColor || element.props.color || palette.text?.body || '#0f172a'}
                  inheritedColor={palette.text?.body || '#0f172a'}
                  inheritedTokenName="Theme Body Text"
                  allowedModes={['inherit', 'color', 'gradient']}
                  onModeChange={(m) => handleUpdateProps({ colorMode: m })}
                  onChange={(c) => handleUpdateProps({ textColor: c, color: c })}
                />

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    Alignment
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'left', label: 'Left', icon: AlignLeft },
                      { id: 'center', label: 'Center', icon: AlignCenter },
                      { id: 'right', label: 'Right', icon: AlignRight },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleUpdateProps({ alignment: item.id })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '7px 4px',
                          borderRadius: '6px',
                          border: (element.props.alignment || 'left') === item.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          backgroundColor: (element.props.alignment || 'left') === item.id ? '#eff6ff' : '#ffffff',
                          color: (element.props.alignment || 'left') === item.id ? '#1d4ed8' : '#334155',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <item.icon size={13} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    Font Size ({element.props.fontSize ?? 13}px)
                  </label>
                  <input
                    type="range"
                    min="11"
                    max="28"
                    value={element.props.fontSize ?? 13}
                    onChange={(e) => handleUpdateProps({ fontSize: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    Bottom Margin ({element.props.marginBottom ?? 12}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    value={element.props.marginBottom ?? 12}
                    onChange={(e) => handleUpdateProps({ marginBottom: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'behavior' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#0f172a' }}>
                  <span>Visible on all device viewports</span>
                  <input
                    type="checkbox"
                    checked={element.props.isVisible !== false}
                    onChange={(e) => handleUpdateProps({ isVisible: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#0f172a' }}>
                  <span>Hide this component on Mobile</span>
                  <input
                    type="checkbox"
                    checked={element.props.hideOnMobile === true}
                    onChange={(e) => handleUpdateProps({ hideOnMobile: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#0f172a' }}>
                  <span>Hide this component on Tablet</span>
                  <input
                    type="checkbox"
                    checked={element.props.hideOnTablet === true}
                    onChange={(e) => handleUpdateProps({ hideOnTablet: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                </label>

                <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Custom CSS Class
                  </label>
                  <input
                    type="text"
                    value={element.props.cssClass || ''}
                    onChange={(e) => handleUpdateProps({ cssClass: e.target.value })}
                    placeholder="e.g. custom-widget"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
