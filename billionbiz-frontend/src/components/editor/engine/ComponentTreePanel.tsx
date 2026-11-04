// ============================================================
// MASTER EDITOR ENGINE — SHARED COMPONENT TREE PANEL
// Unified left sidebar tree panel powering Header and Footer editors
// with full DnD, expand/collapse, visibility,
// cloning, deleting, and component addition (spec §3, §22, §23).
// ============================================================

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Box,
  Megaphone,
  Phone,
  Navigation,
  Sparkles,
  Layers,
  ShieldCheck,
  CreditCard,
  Mail,
  Share2,
  FileText,
  SlidersHorizontal,
  Search,
  Code,
  ShoppingBag,
  MousePointerClick,
  Lock,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Clock,
  Smartphone,
  Monitor,
  Bookmark,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Menu,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import styles from '../../../pages/editor/EditorLayout.module.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { scrollPreviewToHeaderSection } from '../utils/previewScroll';

// ─── Shared Sortable Row Component ──────────────────────────

// ─── Shared Sortable Row Component ──────────────────────────

interface SortableRowProps {
  id: string;
  name: string;
  type: string;
  isVisible: boolean;
  isSelected: boolean;
  isLocked?: boolean;
  onSelect: () => void;
  onToggleVisibility: (e: React.MouseEvent) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children?: React.ReactNode;
}

const SortableRow: React.FC<SortableRowProps> = ({
  id,
  name,
  type,
  isVisible,
  isSelected,
  isLocked,
  onSelect,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  children,
}) => {
  const isDraggable = true;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !isDraggable,
  });
  const [isRowHovered, setIsRowHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isEffectivelyCollapsed = isCollapsed || isDragging;
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; left: number; maxHeight: number }>({
    left: 0,
    maxHeight: 360,
  });

  const style: React.CSSProperties = {
    transform: isDraggable ? CSS.Transform.toString(transform) : undefined,
    transition: isDraggable ? transition : undefined,
    opacity: isDragging ? 0.35 : 1,
    marginBottom: '4px',
    borderRadius: '6px',
    border: isSelected ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
    borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent',
    backgroundColor: isSelected ? '#eff6ff' : isRowHovered ? '#f8fafc' : '#ffffff',
    boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.02)',
    position: 'relative',
  };

  const getRowIcon = () => {
    switch (type) {
      // Header
      case 'announcement':
        return <Megaphone size={14} color="#f59e0b" />;
      case 'utility':
        return <Phone size={14} color="#0ea5e9" />;
      case 'primary-nav':
        return <Navigation size={14} color="#10b981" />;
      case 'secondary-nav':
        return <Layers size={14} color="#8b5cf6" />;
      case 'promo':
        return <Sparkles size={14} color="#ec4899" />;

      // Footer
      case 'brand':
        return <Box size={14} color="#3b82f6" />;
      case 'navigation':
        return <Navigation size={14} color="#10b981" />;
      case 'newsletter':
        return <Mail size={14} color="#ec4899" />;
      case 'trust':
        return <ShieldCheck size={14} color="#6366f1" />;
      case 'payment':
        return <CreditCard size={14} color="#0ea5e9" />;
      case 'social':
        return <Share2 size={14} color="#f59e0b" />;
      case 'legal':
        return <FileText size={14} color="#64748b" />;
      default:
        return <SlidersHorizontal size={14} color="#64748b" />;
    }
  };

  const hasExpandedChildren = Boolean(children) && !isEffectivelyCollapsed;

  return (
    <div ref={setNodeRef} style={{ ...style, width: '100%', boxSizing: 'border-box' }}>
      <div
        onClick={onSelect}
        onMouseEnter={() => setIsRowHovered(true)}
        onMouseLeave={() => setIsRowHovered(false)}
        style={{
          backgroundColor: 'transparent',
          borderBottom: hasExpandedChildren ? '1px solid #f1f5f9' : 'none',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          borderBottomLeftRadius: hasExpandedChildren ? 0 : '6px',
          borderBottomRightRadius: hasExpandedChildren ? 0 : '6px',
          padding: '5px 8px',
          minHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'background-color 0.12s ease',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1, minWidth: 0 }}>
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isRowHovered ? 'grab' : 'default',
              color: isSelected ? '#2563eb' : isRowHovered ? '#2563eb' : '#64748b',
              flexShrink: 0,
              transition: 'color 0.12s ease',
            }}
            title={isRowHovered ? 'Drag to reorder section' : name}
          >
            {isRowHovered ? <GripVertical size={14} /> : getRowIcon()}
          </div>

          <span
            style={{
              fontSize: '12.5px',
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? '#1d4ed8' : '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </span>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {isLocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span title="Default core section (always visible, cannot be deleted)" style={{ display: 'inline-flex', alignItems: 'center', color: '#94a3b8', padding: '3px' }}>
                <Lock size={12} />
              </span>
              {children && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(!isCollapsed);
                  }}
                  title={isEffectivelyCollapsed ? 'Expand child components' : 'Collapse child components'}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '3px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#64748b',
                  }}
                >
                  {isEffectivelyCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Visibility toggle button */}
              <button
                type="button"
                onClick={onToggleVisibility}
                title={isVisible ? 'Hide row' : 'Show row'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '3px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {isVisible ? <Eye size={13} color="#64748b" /> : <EyeOff size={13} color="#ef4444" />}
              </button>

              {/* 3-dot More Options Button */}
              <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!menuOpen) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const spaceBelow = window.innerHeight - rect.bottom;
                      const openUpward = spaceBelow < 250;

                      if (openUpward) {
                        setMenuPos({
                          top: undefined,
                          bottom: window.innerHeight - rect.bottom,
                          left: rect.right + 8,
                          maxHeight: rect.top - 20,
                        });
                      } else {
                        setMenuPos({
                          top: rect.top,
                          bottom: undefined,
                          left: rect.right + 8,
                          maxHeight: spaceBelow - 20,
                        });
                      }
                    }
                    setMenuOpen(!menuOpen);
                  }}
                  title="More options"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '3px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#64748b',
                  }}
                >
                  <MoreVertical size={13} />
                </button>

                {menuOpen && createPortal(
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 999998 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                    />
                    <div
                      className={styles.dropdownMenu}
                      style={{
                        position: 'fixed',
                        top: menuPos.top !== undefined ? `${menuPos.top}px` : 'auto',
                        bottom: menuPos.bottom !== undefined ? `${menuPos.bottom}px` : 'auto',
                        left: `${menuPos.left}px`,
                        right: 'auto',
                        margin: 0,
                        zIndex: 999999,
                        maxHeight: `${menuPos.maxHeight}px`,
                        overflowY: 'auto',
                        width: '200px',
                        minWidth: '200px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.22)',
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxSizing: 'border-box',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setMenuOpen(false);
                          onMoveUp?.();
                        }}
                        disabled={!onMoveUp}
                        style={!onMoveUp ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                      >
                        <ChevronUp size={14} /> Move Up
                      </button>
                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setMenuOpen(false);
                          onMoveDown?.();
                        }}
                        disabled={!onMoveDown}
                        style={!onMoveDown ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                      >
                        <ChevronDown size={14} /> Move Down
                      </button>

                      <div className={styles.dropdownDivider} />

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setMenuOpen(false);
                          onDuplicate();
                        }}
                        disabled={isLocked}
                        title={isLocked ? 'Core section cannot be duplicated' : undefined}
                        style={isLocked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                      >
                        <Copy size={14} /> Duplicate {isLocked ? '(Locked)' : ''}
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => setMenuOpen(false)}
                        disabled={isLocked}
                        style={isLocked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                      >
                        <Clock size={14} /> Schedule visibility
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={(e) => {
                          setMenuOpen(false);
                          onToggleVisibility(e);
                        }}
                        disabled={isLocked}
                        title={isLocked ? 'Core section is always visible' : undefined}
                        style={isLocked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                      >
                        {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        {isVisible ? 'Hide' : 'Show'}
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Smartphone size={14} /> Hide on mobile
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Monitor size={14} /> Hide on desktop
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Code size={14} /> Copy as code
                      </button>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Bookmark size={14} /> Save as snippet
                      </button>

                      <div className={styles.dropdownDivider} />

                      <button
                        type="button"
                        className={`${styles.dropdownItem} ${styles.dangerText}`}
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete();
                        }}
                        disabled={isLocked}
                        title={isLocked ? 'Core section cannot be deleted' : undefined}
                        style={isLocked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                      >
                        <Trash2 size={14} /> Delete {isLocked ? '(Locked)' : ''}
                      </button>
                    </div>
                  </>,
                  document.body
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children container */}
      {hasExpandedChildren && (
        <div
          style={{
            backgroundColor: '#fafbfc',
            padding: '4px 6px 6px 6px',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Header Navbar Zones Tree & Definitions ─────────────────

const matchElementKey = (el: any, key: string) => {
  if (!el) return false;
  if (key === 'logo') return el.type === 'logo' || el.id === 'el-logo' || el.name === 'Logo';
  if (key === 'navigation' || key === 'navigation-left' || key === 'navigation-right') {
    return (
      el.type === 'navigation' ||
      el.type === 'navigation-menu' ||
      el.type === 'primary-nav' ||
      el.id === 'el-nav-links'
    );
  }
  if (key === 'search') return el.type === 'search' || el.id === 'el-search';
  if (key === 'actions') return el.type === 'actions' || el.type === 'action-group' || el.id === 'el-actions';
  if (key === 'cta') return el.type === 'cta' || el.id === 'el-cta';
  if (key === 'menu') return el.type === 'menu' || el.id === 'el-menu';
  return el.type === key || el.id === key;
};

interface HeaderBlockDef {
  key: string;
  name: string;
  icon: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }>;
  color: string;
  elementType: string;
  defaultProps?: Record<string, any>;
}

const HEADER_BLOCK_DEFS: Record<string, HeaderBlockDef> = {
  logo: {
    key: 'logo',
    name: 'Logo & Brandname',
    icon: Sparkles,
    color: '#f59e0b',
    elementType: 'logo',
    defaultProps: {
      brandName: 'BillionBiz',
      logoType: 'both',
      logoWidth: 140,
      logoHeight: 36,
      upperText: 'Billion',
      lowerText: 'Biz',
      shape: 'rounded',
    },
  },
  navigation: {
    key: 'navigation',
    name: 'Navigation Menu',
    icon: Navigation,
    color: '#10b981',
    elementType: 'navigation',
    defaultProps: {
      links: [
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '/shop' },
        { label: 'Collections', href: '/collections' },
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
      hoverEffect: 'underline',
      navAlign: 'center',
    },
  },
  search: {
    key: 'search',
    name: 'Search Bar',
    icon: Search,
    color: '#6366f1',
    elementType: 'search',
    defaultProps: {
      placeholder: 'Search products, collections...',
      mode: 'inline',
      variant: 'inline',
    },
  },
  actions: {
    key: 'actions',
    name: 'Actions',
    icon: ShoppingBag,
    color: '#ec4899',
    elementType: 'actions',
    defaultProps: {
      showSearch: true,
      showWishlist: true,
      showAccount: true,
      showCart: true,
    },
  },
  cta: {
    key: 'cta',
    name: 'Call to Action',
    icon: MousePointerClick,
    color: '#f97316',
    elementType: 'cta',
    defaultProps: {
      text: 'Shop Now',
      url: '/shop',
      variant: 'primary',
      size: 'sm',
    },
  },
  menu: {
    key: 'menu',
    name: 'Menu Trigger',
    icon: Menu,
    color: '#0ea5e9',
    elementType: 'menu',
    defaultProps: {
      label: 'Menu',
    },
  },
};

const getBlockDef = (key: string): HeaderBlockDef => {
  if (key === 'navigation-left' || key === 'navigation-right') {
    return HEADER_BLOCK_DEFS.navigation;
  }
  return (
    HEADER_BLOCK_DEFS[key] || {
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      icon: Box,
      color: '#64748b',
      elementType: key,
    }
  );
};

const AVAILABLE_BLOCKS = [
  { key: 'logo', name: 'Logo & Brandname', icon: Sparkles, color: '#f59e0b', elementType: 'logo' },
  { key: 'navigation', name: 'Navigation Menu', icon: Navigation, color: '#10b981', elementType: 'navigation' },
  { key: 'search', name: 'Search Bar', icon: Search, color: '#6366f1', elementType: 'search' },
  { key: 'actions', name: 'Actions', icon: ShoppingBag, color: '#ec4899', elementType: 'actions' },
  { key: 'cta', name: 'Call to Action', icon: MousePointerClick, color: '#f97316', elementType: 'cta' },
  { key: 'menu', name: 'Menu Trigger', icon: Menu, color: '#0ea5e9', elementType: 'menu' },
];

interface HeaderNavbarZonesTreeProps {
  row: any;
}

const HeaderNavbarZonesTree: React.FC<HeaderNavbarZonesTreeProps> = ({ row }) => {
  const store = useEditorContextStore();
  const currentDevice = (
    store.viewport === 'mobile' ? 'mobile' : store.viewport === 'tablet' ? 'tablet' : 'desktop'
  ) as 'desktop' | 'tablet' | 'mobile';

  const [openAddSlot, setOpenAddSlot] = useState<'left' | 'center' | 'right' | null>(null);
  const [hoveredItemKey, setHoveredItemKey] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{
    slot: 'left' | 'center' | 'right';
    index: number;
    position: 'before' | 'after';
  } | null>(null);
  const [dragOverZone, setDragOverZone] = useState<'left' | 'center' | 'right' | null>(null);

  const fallbackArrangement = {
    desktop: { left: ['logo'], center: ['navigation'], right: ['actions'], disabled: ['search', 'cta', 'menu'] },
    tablet: { left: ['logo'], center: ['navigation'], right: ['actions'], disabled: ['search', 'cta', 'menu'] },
    mobile: { left: ['menu'], center: ['logo'], right: ['actions'], disabled: ['search', 'cta'] },
  };

  const responsiveArrangement = {
    desktop: {
      left: [...(row.layout?.responsiveArrangement?.desktop?.left ?? fallbackArrangement.desktop.left)],
      center: [...(row.layout?.responsiveArrangement?.desktop?.center ?? fallbackArrangement.desktop.center)],
      right: [...(row.layout?.responsiveArrangement?.desktop?.right ?? fallbackArrangement.desktop.right)],
      disabled: [...(row.layout?.responsiveArrangement?.desktop?.disabled ?? fallbackArrangement.desktop.disabled)],
    },
    tablet: {
      left: [...(row.layout?.responsiveArrangement?.tablet?.left ?? fallbackArrangement.tablet.left)],
      center: [...(row.layout?.responsiveArrangement?.tablet?.center ?? fallbackArrangement.tablet.center)],
      right: [...(row.layout?.responsiveArrangement?.tablet?.right ?? fallbackArrangement.tablet.right)],
      disabled: [...(row.layout?.responsiveArrangement?.tablet?.disabled ?? fallbackArrangement.tablet.disabled)],
    },
    mobile: {
      left: [...(row.layout?.responsiveArrangement?.mobile?.left ?? fallbackArrangement.mobile.left)],
      center: [...(row.layout?.responsiveArrangement?.mobile?.center ?? fallbackArrangement.mobile.center)],
      right: [...(row.layout?.responsiveArrangement?.mobile?.right ?? fallbackArrangement.mobile.right)],
      disabled: [...(row.layout?.responsiveArrangement?.mobile?.disabled ?? fallbackArrangement.mobile.disabled)],
    },
  };

  const deviceSlots = responsiveArrangement[currentDevice];

  const ZONES: Array<{
    slot: 'left' | 'center' | 'right';
    label: string;
    icon: React.FC<{ size?: number; color?: string }>;
  }> = [
    { slot: 'left', label: 'Start', icon: AlignLeft },
    { slot: 'center', label: 'Center', icon: AlignCenter },
    { slot: 'right', label: 'End', icon: AlignRight },
  ];

  const handleAddBlock = (slot: 'left' | 'center' | 'right', key: string) => {
    setOpenAddSlot(null);
    const nextArrangement = JSON.parse(JSON.stringify(responsiveArrangement));
    (['left', 'center', 'right', 'disabled'] as const).forEach((s) => {
      nextArrangement[currentDevice][s] = nextArrangement[currentDevice][s].filter((k: string) => k !== key);
    });
    nextArrangement[currentDevice][slot].push(key);

    let nextElements = [...(row.elements || [])];
    let matchedEl = nextElements.find((e: any) => matchElementKey(e, key));
    if (!matchedEl) {
      const def = getBlockDef(key);
      matchedEl = {
        id: `el-${def.elementType}-${Date.now().toString(36)}`,
        type: def.elementType,
        name: def.name,
        props: def.defaultProps || {},
      };
      nextElements.push(matchedEl);
    } else {
      nextElements = nextElements.map((e: any) => (e.id === matchedEl.id ? { ...e, isVisible: true } : e));
    }

    store.updateHeaderRow(row.id, {
      elements: nextElements,
      layout: { ...row.layout, responsiveArrangement: nextArrangement },
    });

    store.selectTarget({
      type: 'element',
      editorType: 'header',
      rowId: row.id,
      elementId: matchedEl.id,
      elementType: matchedEl.type,
    });
    useLandingEditorStore.getState().setSelectedPageId('header-global');
    useLandingEditorStore.getState().setSelectedSectionId('header-main');
    useLandingEditorStore.getState().setRightSidebarOpen(true);
    scrollPreviewToHeaderSection('row-primary-nav');
  };

  const handleSelectItem = (key: string) => {
    let nextElements = [...(row.elements || [])];
    let matchedEl = nextElements.find((e: any) => matchElementKey(e, key));
    if (!matchedEl) {
      const def = getBlockDef(key);
      matchedEl = {
        id: `el-${def.elementType}-${Date.now().toString(36)}`,
        type: def.elementType,
        name: def.name,
        props: def.defaultProps || {},
      };
      nextElements.push(matchedEl);
      store.updateHeaderRow(row.id, { elements: nextElements });
    }
    store.selectTarget({
      type: 'element',
      editorType: 'header',
      rowId: row.id,
      elementId: matchedEl.id,
      elementType: matchedEl.type,
    });
    useLandingEditorStore.getState().setSelectedPageId('header-global');
    useLandingEditorStore.getState().setSelectedSectionId('header-main');
    useLandingEditorStore.getState().setRightSidebarOpen(true);
    scrollPreviewToHeaderSection('row-primary-nav');
  };

  const handleMoveUp = (slot: 'left' | 'center' | 'right', index: number) => {
    const nextArrangement = JSON.parse(JSON.stringify(responsiveArrangement));
    const currentList = nextArrangement[currentDevice][slot];
    if (index > 0) {
      [currentList[index - 1], currentList[index]] = [currentList[index], currentList[index - 1]];
    } else {
      const prevSlot = slot === 'right' ? 'center' : slot === 'center' ? 'left' : null;
      if (prevSlot) {
        const [item] = currentList.splice(0, 1);
        nextArrangement[currentDevice][prevSlot].push(item);
      }
    }
    store.updateHeaderRow(row.id, {
      layout: { ...row.layout, responsiveArrangement: nextArrangement },
    });
  };

  const handleMoveDown = (slot: 'left' | 'center' | 'right', index: number) => {
    const nextArrangement = JSON.parse(JSON.stringify(responsiveArrangement));
    const currentList = nextArrangement[currentDevice][slot];
    if (index < currentList.length - 1) {
      [currentList[index], currentList[index + 1]] = [currentList[index + 1], currentList[index]];
    } else {
      const nextSlot = slot === 'left' ? 'center' : slot === 'center' ? 'right' : null;
      if (nextSlot) {
        const [item] = currentList.splice(index, 1);
        nextArrangement[currentDevice][nextSlot].unshift(item);
      }
    }
    store.updateHeaderRow(row.id, {
      layout: { ...row.layout, responsiveArrangement: nextArrangement },
    });
  };

  const handleDeleteItem = (slot: 'left' | 'center' | 'right', key: string) => {
    const nextArrangement = JSON.parse(JSON.stringify(responsiveArrangement));
    nextArrangement[currentDevice][slot] = nextArrangement[currentDevice][slot].filter((k: string) => k !== key);
    if (!nextArrangement[currentDevice].disabled.includes(key)) {
      nextArrangement[currentDevice].disabled.push(key);
    }
    store.updateHeaderRow(row.id, {
      layout: { ...row.layout, responsiveArrangement: nextArrangement },
    });
  };

  const isItemSelected = (key: string) => {
    const target = store.selectedTarget;
    if (
      target.type !== 'element' ||
      target.editorType !== 'header' ||
      target.rowId !== row.id
    ) {
      return false;
    }
    const targetElementId = target.elementId;
    const el = row.elements?.find((e: any) => e.id === targetElementId);
    return el ? matchElementKey(el, key) : false;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', boxSizing: 'border-box' }}>
      {ZONES.map((zone) => {
        const keys: string[] = deviceSlots[zone.slot] || [];
        const isAddOpen = openAddSlot === zone.slot;
        const isZoneDragOver = dragOverZone === zone.slot;

        return (
          <div
            key={zone.slot}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOverZone(zone.slot);
            }}
            onDragLeave={() => {
              setDragOverZone(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const dragData = (window as any).__bb_dragged_navbar_item;
              if (dragData) {
                const { slot: fromSlot, key: fromKey } = dragData;
                (window as any).__bb_dragged_navbar_item = null;
                setDragOverZone(null);
                setDragOverInfo(null);
                if (fromSlot !== zone.slot) {
                  const nextArrangement = JSON.parse(JSON.stringify(responsiveArrangement));
                  nextArrangement[currentDevice][fromSlot] = nextArrangement[currentDevice][fromSlot].filter((k: string) => k !== fromKey);
                  nextArrangement[currentDevice][zone.slot].push(fromKey);
                  store.updateHeaderRow(row.id, {
                    layout: { ...row.layout, responsiveArrangement: nextArrangement },
                  });
                }
              }
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: isZoneDragOver ? '#eff6ff' : '#ffffff',
              border: isZoneDragOver ? '1.5px dashed #2563eb' : '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '4px',
              transition: 'all 0.12s ease',
              boxSizing: 'border-box',
            }}
          >
            {/* Zone Header with + Add block */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 6px',
                backgroundColor: '#f8fafc',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <zone.icon size={13} color="#64748b" />
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{zone.label}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>({keys.length})</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenAddSlot(isAddOpen ? null : zone.slot);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#2563eb',
                  backgroundColor: '#ffffff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
                title={`Add block into ${zone.label} zone`}
              >
                <Plus size={11} />
                <span>Add block</span>
              </button>
            </div>

            {/* Inline Add Block Picker Dropdown */}
            {isAddOpen && (
              <div
                style={{
                  marginTop: '4px',
                  marginBottom: '4px',
                  padding: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  boxShadow: '0 6px 16px rgba(15,23,42,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  zIndex: 30,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', borderBottom: '1px solid #f1f5f9', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>Add to {zone.label}</span>
                  <button
                    type="button"
                    onClick={() => setOpenAddSlot(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94a3b8' }}
                  >
                    <X size={12} />
                  </button>
                </div>
                {AVAILABLE_BLOCKS.map((blk) => (
                  <button
                    key={blk.key}
                    type="button"
                    onClick={() => handleAddBlock(zone.slot, blk.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '5px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      color: '#0f172a',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <blk.icon size={13} color={blk.color} />
                    <span style={{ flex: 1, fontWeight: 500 }}>{blk.name}</span>
                    <Plus size={11} color="#94a3b8" />
                  </button>
                ))}
              </div>
            )}

            {/* Zone Items Tree */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
              {keys.length === 0 ? (
                <div
                  style={{
                    padding: '6px 8px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    borderRadius: '4px',
                  }}
                >
                  Empty — click + Add block
                </div>
              ) : (
                keys.map((key, idx) => {
                  const def = getBlockDef(key);
                  const selected = isItemSelected(key);
                  const isHovered = hoveredItemKey === `${zone.slot}-${key}`;
                  const isLast = idx === keys.length - 1;
                  const isDragTarget =
                    dragOverInfo?.slot === zone.slot && dragOverInfo?.index === idx;

                  return (
                    <div
                      key={`${zone.slot}-${key}-${idx}`}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: '28px',
                        paddingLeft: '18px',
                        margin: '1px 0',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Tree Branch Vertical Line */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '7px',
                          top: 0,
                          bottom: isLast ? '50%' : 0,
                          width: '1.5px',
                          backgroundColor: '#cbd5e1',
                        }}
                      />
                      {/* Tree Branch Elbow */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '7px',
                          top: '50%',
                          width: '9px',
                          height: '1.5px',
                          backgroundColor: '#cbd5e1',
                          borderBottomLeftRadius: isLast ? '3px' : 0,
                        }}
                      />

                      {/* Item Capsule */}
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          (window as any).__bb_dragged_navbar_item = { slot: zone.slot, key, index: idx };
                          e.dataTransfer.setData('text/plain', key);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pos = e.clientY - rect.top < rect.height / 2 ? 'before' : 'after';
                          setDragOverInfo({ slot: zone.slot, index: idx, position: pos });
                        }}
                        onDragLeave={() => {
                          setDragOverInfo(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const dragData = (window as any).__bb_dragged_navbar_item;
                          if (dragData) {
                            const { slot: fromSlot, key: fromKey } = dragData;
                            (window as any).__bb_dragged_navbar_item = null;
                            const pos = dragOverInfo?.position || 'after';
                            setDragOverInfo(null);
                            setDragOverZone(null);

                            const nextArrangement = JSON.parse(JSON.stringify(responsiveArrangement));
                            nextArrangement[currentDevice][fromSlot] = nextArrangement[currentDevice][fromSlot].filter((k: string) => k !== fromKey);
                            const targetList = nextArrangement[currentDevice][zone.slot];
                            const insertIdx = pos === 'after' ? idx + 1 : idx;
                            targetList.splice(insertIdx, 0, fromKey);

                            store.updateHeaderRow(row.id, {
                              layout: { ...row.layout, responsiveArrangement: nextArrangement },
                            });
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(key);
                        }}
                        onMouseEnter={() => setHoveredItemKey(`${zone.slot}-${key}`)}
                        onMouseLeave={() => setHoveredItemKey(null)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 7px',
                          borderRadius: '5px',
                          backgroundColor: selected ? '#eff6ff' : isHovered ? '#f1f5f9' : 'transparent',
                          color: selected ? '#1d4ed8' : '#334155',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: selected ? 600 : 500,
                          transition: 'all 0.12s ease',
                          border: selected ? '1px solid #bfdbfe' : '1px solid transparent',
                          borderTop: isDragTarget && dragOverInfo?.position === 'before' ? '2px solid #2563eb' : undefined,
                          borderBottom: isDragTarget && dragOverInfo?.position === 'after' ? '2px solid #2563eb' : undefined,
                          boxSizing: 'border-box',
                        }}
                      >
                        {/* Icon & Name — swap to Grip on hover */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              cursor: isHovered ? 'grab' : 'default',
                            }}
                            title={isHovered ? 'Drag to reorder within or between zones' : def.name}
                          >
                            {isHovered ? <GripVertical size={13} color="#2563eb" /> : <def.icon size={13} color={def.color} />}
                          </div>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {def.name}
                          </span>
                        </div>

                        {/* Reorder and Delete Actions */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            opacity: isHovered || selected ? 1 : 0,
                            transition: 'opacity 0.12s ease',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleMoveUp(zone.slot, idx)}
                            title="Move up"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px',
                              cursor: 'pointer',
                              color: '#64748b',
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(zone.slot, idx)}
                            title="Move down"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px',
                              cursor: 'pointer',
                              color: '#64748b',
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <ArrowDown size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(zone.slot, key)}
                            title="Remove block"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px',
                              cursor: 'pointer',
                              color: '#ef4444',
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};




export const ComponentTreePanel: React.FC<{ editorType?: 'header' | 'footer' }> = ({
  editorType: overrideEditorType,
}) => {
  const store = useEditorContextStore();
  const editorType = overrideEditorType || (store.editorType === 'page' ? 'header' : store.editorType);

  if (editorType === 'footer') {
    return null;
  }

  const isHeaderPreviewActive = Boolean(store.presetPreview?.isActive && store.presetPreview?.editorType === 'header');
  const headerRows = isHeaderPreviewActive && store.presetPreview?.previewRows
    ? (store.presetPreview.previewRows as any[])
    : store.headerRows;
  const [addHeaderMenuOpen, setAddHeaderMenuOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = store.headerRows.findIndex((r) => r.id === active.id);
    const newIndex = store.headerRows.findIndex((r) => r.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      store.reorderHeaderRows(oldIndex, newIndex);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, width: '100%', overflowX: 'hidden' }}>

      {/* Stack Header Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px 8px 16px',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
          Header Stack
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          {`${headerRows.length} sections`}
        </div>
      </div>

      {/* Header and Footer Stack List */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={headerRows.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {headerRows.map((row, rIdx) => {
                const isLockedRow = row.type === 'primary-nav';
                const rowDisplayName =
                  row.type === 'announcement'
                    ? 'Announcement Bar'
                    : row.type === 'utility'
                    ? 'Utility Bar'
                    : row.type === 'primary-nav'
                    ? 'Header Navbar'
                    : row.type === 'secondary-nav'
                    ? 'Secondary Navigation'
                    : row.name;

                const isSelected =
                  store.selectedTarget.type === 'row' &&
                  store.selectedTarget.editorType === 'header' &&
                  (store.selectedTarget.rowId === row.id ||
                   (store.selectedTarget.rowId === 'announcement-bar' && (row.type === 'announcement' || row.id.includes('announcement'))) ||
                   (store.selectedTarget.rowId === 'utility-bar' && (row.type === 'utility' || row.id.includes('utility'))) ||
                   ((store.selectedTarget.rowId === 'category-bar' || store.selectedTarget.rowId === 'secondary-nav') && (row.type === 'secondary-nav' || row.id.includes('secondary') || row.id.includes('category'))) ||
                   (store.selectedTarget.rowId === 'header-main' && (row.type === 'primary-nav' || row.id.includes('primary'))));

                const handleSelect = () => {
                  store.selectTarget({ type: 'row', editorType: 'header', rowId: row.id });
                  useLandingEditorStore.getState().setRightSidebarOpen(true);
                  const secId = row.type === 'announcement'
                    ? 'announcement-bar'
                    : row.type === 'utility'
                    ? 'utility-bar'
                    : row.type === 'secondary-nav'
                    ? 'category-bar'
                    : 'header-main';
                  useLandingEditorStore.getState().setSelectedSectionId(secId);
                  scrollPreviewToHeaderSection(row.id);
                };

                return (
                  <SortableRow
                    key={row.id}
                    id={row.id}
                    name={rowDisplayName}
                    type={row.type}
                    isVisible={row.isVisible}
                    isSelected={isSelected}
                    isLocked={isLockedRow}
                    onSelect={handleSelect}
                    onToggleVisibility={(e) => {
                      e.stopPropagation();
                      store.toggleHeaderRowVisibility(row.id);
                    }}
                    onDuplicate={() => store.duplicateHeaderRow(row.id)}
                    onDelete={() => store.deleteHeaderRow(row.id)}
                    onMoveUp={rIdx > 0 ? () => store.reorderHeaderRows(rIdx, rIdx - 1) : undefined}
                    onMoveDown={rIdx < headerRows.length - 1 ? () => store.reorderHeaderRows(rIdx, rIdx + 1) : undefined}
                  >
                    {row.type === 'primary-nav' ? (
                      <HeaderNavbarZonesTree row={row} />
                    ) : null}
                  </SortableRow>
                );
              })}
            </SortableContext>
          </DndContext>
      </div>

      {/* Sticky section/component actions */}
      <div
        style={{
          position: 'relative',
          padding: '12px 16px 16px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          flexShrink: 0,
        }}
      >
        {addHeaderMenuOpen && (
          <div style={{ position: 'absolute', bottom: '68px', left: '16px', right: '16px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 10px 24px rgba(15,23,42,0.14)', zIndex: 20 }}>
            {[
              { type: 'announcement', name: 'Announcement Bar' },
              { type: 'utility', name: 'Utility Bar' },
              { type: 'primary-nav', name: 'Header Navbar' },
              { type: 'secondary-nav', name: 'Secondary Navigation' },
            ].map((option) => {
              const exists = headerRows.some((row) => row.type === option.type);
              const unavailable = exists || option.type === 'primary-nav';
              return (
                <button key={option.type} type="button" disabled={unavailable} onClick={() => { store.addHeaderRow(option.type as any, option.name); setAddHeaderMenuOpen(false); }} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '8px 10px', border: 0, borderRadius: '5px', background: unavailable ? '#f8fafc' : '#ffffff', color: unavailable ? '#94a3b8' : '#0f172a', cursor: unavailable ? 'not-allowed' : 'pointer', fontSize: '12px', textAlign: 'left' }}>
                  <span>{option.name}</span><span>{unavailable ? 'Unavailable' : 'Add'}</span>
                </button>
              );
            })}
          </div>
        )}
        <button type="button" onClick={() => setAddHeaderMenuOpen((open) => !open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 14px', background: '#eff6ff', border: '1.5px dashed #93c5fd', borderRadius: '8px', color: '#1d4ed8', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> Add Header Section
        </button>
      </div>
    </div>
  );
};
