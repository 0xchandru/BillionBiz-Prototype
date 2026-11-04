// ============================================================
// MASTER EDITOR ENGINE — UNIFIED EDITOR CONTEXT STORE
// Central dynamic context store unifying page, header, and footer editors
// into one shared editor framework.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PLATFORM_VERSION } from '../config/version';
import type {
  EditorType,
  SelectedTarget,
  ViewportDevice,
  ZoomLevel,
  DensityLevel,
  PreviewState,
  HeaderRow,
  HeaderRowLayout,
  HeaderElement,
  HeaderRowType,
  HeaderElementType,
  GlobalHeaderSettings,
  FooterRow,
  FooterColumn,
  FooterElement,
  FooterRowType,
  FooterElementType,
  GlobalFooterSettings,
  AuditResult,
  UserPreset,
  PresetApplyMode,
  PresetPreviewState,
  PresetApplyOption,
  DesignTokenOverrides,
} from '../components/editor/engine/types';
import {
  createDefaultHeaderStack,
  createDefaultGlobalSettings as createDefaultHeaderGlobalSettings,
  STRUCTURE_PRESETS as HEADER_STRUCTURE_PRESETS,
  APPEARANCE_PRESETS as HEADER_APPEARANCE_PRESETS,
  HEADER_VARIANTS,
  HEADER_ARRANGEMENTS,
  HEADER_TEMPLATES,
  createResponsiveArrangement,
} from '../components/editor/engine/headerPresets';
import {
  createDefaultFooterStack,
  createDefaultFooterGlobalSettings,
  FOOTER_STRUCTURE_PRESETS,
  FOOTER_APPEARANCE_PRESETS,
  FOOTER_VARIANTS,
  FOOTER_ARRANGEMENTS,
  FOOTER_TEMPLATES,
} from '../components/editor/engine/footerPresets';
import {
  createInitialHistoryState,
  createSnapshot,
  pushHistoryEntry,
  undoHistory,
  redoHistory,
  type HistoryState,
} from '../components/editor/engine/historyEngine';
import { runEditorAudit } from '../components/editor/engine/auditEngine';
import { useSiteStore } from './siteStore';
import type { FooterTreeNode } from '../components/editor/engine/footerTreeTypes';
import {
  createDefaultFooterTree,
  findNodeById,
  insertNode,
  removeNode,
  updateNode,
  moveNode,
  cloneNodeWithNewIds,
  getAncestorPath,
  findParentNode,
} from '../components/editor/engine/footerTreeEngine';
import { FOOTER_TREE_TEMPLATES } from '../components/editor/engine/footerTreeTemplates';

interface EditorContextState {
  // ─── Core Context ───
  editorType: EditorType;
  selectedTarget: SelectedTarget;
  activeTab: string;
  accordionState: Record<string, boolean>;

  // ─── Viewport & Preview Controls (shared topbar) ───
  viewport: ViewportDevice;
  zoom: ZoomLevel;
  previewState: PreviewState;
  density: DensityLevel;

  // ─── Left Sidebar State ───
  sidebarActiveTab: 'pages' | 'sections' | 'layers' | 'assets' | 'settings';
  treeViewMode: 'tree' | 'layers';

  // ─── Header State ───
  headerRows: HeaderRow[];
  headerSettings: GlobalHeaderSettings;

  // ─── Footer State ───
  footerRows: FooterRow[];
  footerSettings: GlobalFooterSettings;
  footerTree: FooterTreeNode[];
  selectedFooterNodeId: string | null;
  footerRightSidebarMode: 'inspector' | 'templates';
  pendingFooterTemplateId: string | null;
  pendingFooterTree: FooterTreeNode[] | null;
  footerExpandedNodeIds: string[];
  isFooterComponentPickerOpen: boolean;
  footerPickerTargetParentId: string | null;
  footerPickerTargetIndex?: number;

  // ─── History ───
  history: HistoryState;

  // ─── Audit ───
  auditResult: AuditResult | null;

  // ─── Shared Modals ───
  isCommandPaletteOpen: boolean;
  isAiDrawerOpen: boolean;
  isAuditModalOpen: boolean;
  isPresetModalOpen: boolean;
  pendingPreset: {
    editorType: EditorType;
    type: 'structure' | 'appearance' | 'curated';
    id: string;
  } | null;
  isSavePresetModalOpen: boolean;
  isAddComponentModalOpen: boolean;
  addComponentCategory: string;

  // ─── Variant/Arrangement/Template ───
  presetPreview: PresetPreviewState | null;
  currentHeaderVariantId: string | null;
  currentHeaderArrangementId: string | null;
  currentFooterVariantId: string | null;
  currentFooterArrangementId: string | null;
  userPresets: UserPreset[];

  // ─── Actions: Core Context ───
  setEditorType: (type: EditorType) => void;
  selectTarget: (target: SelectedTarget) => void;
  setActiveTab: (tab: string) => void;
  toggleAccordion: (key: string) => void;
  setViewport: (viewport: ViewportDevice) => void;
  setZoom: (zoom: ZoomLevel) => void;
  setPreviewState: (state: PreviewState) => void;
  setDensity: (density: DensityLevel) => void;
  setSidebarActiveTab: (tab: 'pages' | 'sections' | 'layers' | 'assets' | 'settings') => void;
  setTreeViewMode: (mode: 'tree' | 'layers') => void;

  setHeaderRows: (rows: HeaderRow[]) => void;
  updateHeaderRow: (rowId: string, updates: Partial<HeaderRow>) => void;
  reorderHeaderRows: (startIndex: number, endIndex: number) => void;
  toggleHeaderRowVisibility: (rowId: string) => void;
  duplicateHeaderRow: (rowId: string) => void;
  deleteHeaderRow: (rowId: string) => void;
  addHeaderRow: (type: HeaderRowType, name: string) => void;

  updateHeaderElement: (rowId: string, elementId: string, updates: Partial<HeaderElement>) => void;
  reorderHeaderElements: (rowId: string, startIndex: number, endIndex: number) => void;
  deleteHeaderElement: (rowId: string, elementId: string) => void;
  toggleHeaderElementVisibility: (rowId: string, elementId: string) => void;
  duplicateHeaderElement: (rowId: string, elementId: string) => void;
  addHeaderElement: (rowId: string, type: HeaderElementType, name: string, defaultProps?: Record<string, any>) => void;
  updateHeaderSettings: (updates: Partial<GlobalHeaderSettings>) => void;
  syncHeaderToSiteStore: () => void;

  // ─── Actions: Footer Editor ───
  updateFooterRow: (rowId: string, updates: Partial<FooterRow>) => void;
  reorderFooterRows: (startIndex: number, endIndex: number) => void;
  toggleFooterRowVisibility: (rowId: string) => void;
  duplicateFooterRow: (rowId: string) => void;
  deleteFooterRow: (rowId: string) => void;
  addFooterRow: (type: FooterRowType, name: string) => void;

  updateFooterElement: (rowId: string, elementId: string, updates: Partial<FooterElement>) => void;
  deleteFooterElement: (rowId: string, elementId: string) => void;
  addFooterElement: (
    rowId: string,
    columnId: string,
    type: FooterElementType,
    name: string,
    defaultProps?: Record<string, any>,
    groupId?: string
  ) => void;
  updateFooterSettings: (updates: Partial<GlobalFooterSettings>) => void;

  // ─── Actions: Footer Tree Architecture ───
  setFooterTree: (tree: FooterTreeNode[]) => void;
  selectFooterNode: (nodeId: string | null) => void;
  setFooterRightSidebarMode: (mode: 'inspector' | 'templates') => void;
  toggleFooterNodeExpanded: (nodeId: string) => void;
  expandFooterAncestors: (nodeId: string) => void;
  addFooterTreeNode: (newNode: FooterTreeNode, parentId?: string | null, index?: number) => void;
  updateFooterTreeNode: (nodeId: string, updates: Partial<FooterTreeNode>) => void;
  updateFooterTreeNodeProps: (nodeId: string, propUpdates: Record<string, any>) => void;
  updateFooterTreeNodeLayout: (nodeId: string, layoutUpdates: Record<string, any>) => void;
  updateFooterTreeNodeStyling: (nodeId: string, stylingUpdates: Record<string, any>) => void;
  updateFooterTreeNodeResponsive: (nodeId: string, responsiveUpdates: Record<string, any>) => void;
  deleteFooterTreeNode: (nodeId: string) => void;
  duplicateFooterTreeNode: (nodeId: string) => void;
  moveFooterTreeNode: (nodeId: string, newParentId: string | null, targetIndex: number) => void;
  openFooterComponentPicker: (parentId?: string | null, targetIndex?: number) => void;
  closeFooterComponentPicker: () => void;
  previewFooterTemplate: (templateId: string) => void;
  applyFooterTreeTemplate: (templateId: string) => void;
  applyPendingFooterTemplate: () => void;
  cancelPendingFooterTemplate: () => void;

  // ─── Actions: History ───
  undo: () => void;
  redo: () => void;
  pushSnapshot: (description: string) => void;

  // ─── Actions: Audit ───
  runAudit: () => void;

  // ─── Actions: Shared Modals & Presets ───
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openAiDrawer: () => void;
  closeAiDrawer: () => void;
  openAuditModal: () => void;
  closeAuditModal: () => void;
  openPresetModal: () => void;
  closePresetModal: () => void;
  openAddComponentModal: (category?: string) => void;
  closeAddComponentModal: () => void;
  openSavePresetModal: () => void;
  closeSavePresetModal: () => void;

  applyPresetPrompt: (editorType: EditorType, type: 'structure' | 'appearance' | 'curated', id: string) => void;
  confirmApplyPreset: (mode: PresetApplyMode) => void;
  saveUserPreset: (name: string, options?: { structure: boolean; style: boolean; content: boolean; behavior: boolean }) => void;
  deleteUserPreset: (presetId: string) => void;
  applyUserPreset: (presetId: string) => void;

  // ─── Variant/Arrangement/Template Actions ───
  previewVariant: (editorType: 'header' | 'footer', variantId: string, isHoverOnly?: boolean) => void;
  previewArrangement: (editorType: 'header' | 'footer', arrangementId: string) => void;
  previewTemplate: (editorType: 'header' | 'footer', templateId: string) => void;
  cancelPreview: () => void;
  applyVariant: (editorType: 'header' | 'footer', variantId: string, option: PresetApplyOption) => void;
  applyArrangement: (editorType: 'header' | 'footer', arrangementId: string, option: PresetApplyOption) => void;
  applyTemplate: (editorType: 'header' | 'footer', templateId: string, option: PresetApplyOption) => void;
  stagePresetSelection: (params: {
    editorType: 'header' | 'footer';
    variantId?: string;
    arrangementId?: string;
    templateId?: string;
    themePreset?: string;
    stylingUpdates?: Partial<DesignTokenOverrides>;
  }) => void;
  commitStagedPreset: (editorType: 'header' | 'footer', option?: PresetApplyOption) => void;
  discardStagedPreset: () => void;
  resetEditorContextStore: () => void;
}

const initialHeaderRows = createDefaultHeaderStack();
const initialHeaderSettings = createDefaultHeaderGlobalSettings();
const initialFooterRows = createDefaultFooterStack();
const initialFooterSettings = createDefaultFooterGlobalSettings();
const initialFooterTree = initialFooterRows[0]?.children || createDefaultFooterTree();

export const useEditorContextStore = create<EditorContextState>()(
  persist(
    (set, get) => ({
      // Core Context
      editorType: 'page',
      selectedTarget: { type: 'none' },
      activeTab: 'style',
      accordionState: { general: true, layout: true, colors: true },

      // Viewport & Preview
      viewport: 'desktop',
      zoom: 100,
      previewState: 'normal',
      density: 'comfortable',

      // Left Sidebar
      sidebarActiveTab: 'sections',
      treeViewMode: 'tree',

      // Data models
      headerRows: initialHeaderRows,
      headerSettings: initialHeaderSettings,
      footerRows: initialFooterRows,
      footerSettings: initialFooterSettings,
      footerTree: initialFooterTree,
      selectedFooterNodeId: null,
      footerRightSidebarMode: 'inspector',
      pendingFooterTemplateId: null,
      pendingFooterTree: null,
      footerExpandedNodeIds: ['fg-nav-group', 'fg-sub-1', 'fg-sub-2', 'fg-bottom-bar'],
      isFooterComponentPickerOpen: false,
      footerPickerTargetParentId: null,
      footerPickerTargetIndex: undefined,

      // History & Audit
      history: createInitialHistoryState(50),
      auditResult: null,

      // Modals
      isCommandPaletteOpen: false,
      isAiDrawerOpen: false,
      isAuditModalOpen: false,
      isPresetModalOpen: false,
      pendingPreset: null,
      isSavePresetModalOpen: false,
      isAddComponentModalOpen: false,
      addComponentCategory: 'all',
      userPresets: [],

      // Variant/Arrangement/Template
      presetPreview: null,
      currentHeaderVariantId: 'modern-commerce',
      currentHeaderArrangementId: 'standard',
      currentFooterVariantId: 'classic-multi-column',
      currentFooterArrangementId: 'standard-multi-column',

      // ──────────────────────────────────────────────────────────
      // Core Context Actions
      // ──────────────────────────────────────────────────────────
      setEditorType: (type: EditorType) => {
        const currentTarget = get().selectedTarget;
        const shouldPreserve =
          currentTarget &&
          (currentTarget.type === 'row' ||
           currentTarget.type === 'column' ||
           currentTarget.type === 'element') &&
          currentTarget.editorType === type;

        set({
          editorType: type,
          selectedTarget: shouldPreserve ? currentTarget : { type: 'global', editorType: type },
          activeTab: get().activeTab || 'style',
        });
        // Auto-run audit when switching context
        get().runAudit();
      },

      selectTarget: (target: SelectedTarget) => {
        set({ selectedTarget: target, activeTab: 'style' });
      },

      setActiveTab: (tab: string) => set({ activeTab: tab }),

      toggleAccordion: (key: string) =>
        set((state) => ({
          accordionState: {
            ...state.accordionState,
            [key]: !state.accordionState[key],
          },
        })),

      setViewport: (viewport: ViewportDevice) => set({ viewport }),
      setZoom: (zoom: ZoomLevel) => set({ zoom }),
      setPreviewState: (previewState: PreviewState) => set({ previewState }),
      setDensity: (density: DensityLevel) => {
        set({ density });
        // Also update settings density
        set((state) => ({
          footerSettings: { ...state.footerSettings, density },
        }));
      },

      setSidebarActiveTab: (tab) => set({ sidebarActiveTab: tab }),
      setTreeViewMode: (mode) => set({ treeViewMode: mode }),

      // ──────────────────────────────────────────────────────────
      // Header Actions
      // ──────────────────────────────────────────────────────────
      setHeaderRows: (rows) => {
        set({ headerRows: rows });
      },

      updateHeaderRow: (rowId, updates) => {
        set((state) => {
          const newRows = state.headerRows.map((r) =>
            (r.id === rowId || (r.type === 'primary-nav' && (rowId === 'row-primary-nav' || rowId.includes('primary'))))
              ? {
                  ...r,
                  ...updates,
                  layout: { ...r.layout, ...updates.layout },
                  styling: { ...r.styling, ...updates.styling },
                }
              : r
          );
          return { headerRows: newRows };
        });
        get().pushSnapshot(`Updated header row ${rowId}`);
      },

      reorderHeaderRows: (startIndex, endIndex) => {
        set((state) => {
          const newRows = [...state.headerRows];
          const [moved] = newRows.splice(startIndex, 1);
          newRows.splice(endIndex, 0, moved);
          return { headerRows: newRows };
        });
        get().pushSnapshot('Reordered header rows');
      },

      toggleHeaderRowVisibility: (rowId) => {
        set((state) => {
          const target = state.headerRows.find((r) => r.id === rowId);
          if (target?.isLocked || target?.type === 'primary-nav' || target?.id === 'row-primary-nav') {
            return state; // Locked row cannot be hidden
          }
          return {
            headerRows: state.headerRows.map((r) =>
              r.id === rowId ? { ...r, isVisible: !r.isVisible } : r
            ),
          };
        });
        get().pushSnapshot(`Toggled visibility of row ${rowId}`);
      },

      duplicateHeaderRow: (rowId) => {
        set((state) => {
          const rowToClone = state.headerRows.find((r) => r.id === rowId);
          if (!rowToClone || rowToClone.isLocked || rowToClone.type === 'primary-nav' || rowToClone.id === 'row-primary-nav') {
            return state; // Locked Header row cannot be duplicated
          }

          const cloned: HeaderRow = {
            ...JSON.parse(JSON.stringify(rowToClone)),
            id: `row-${rowToClone.type}-${Date.now().toString(36)}`,
            name: `${rowToClone.name} (Copy)`,
            isLocked: false,
            elements: rowToClone.elements.map((el) => ({
              ...JSON.parse(JSON.stringify(el)),
              id: `el-${el.type}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
              isLocked: false,
            })),
          };

          const idx = state.headerRows.findIndex((r) => r.id === rowId);
          const newRows = [...state.headerRows];
          newRows.splice(idx + 1, 0, cloned);
          return {
            headerRows: newRows,
            selectedTarget: { type: 'row', editorType: 'header', rowId: cloned.id },
          };
        });
        get().pushSnapshot('Duplicated header row');
      },

      deleteHeaderRow: (rowId) => {
        set((state) => {
          const target = state.headerRows.find((r) => r.id === rowId);
          if (target?.isLocked || target?.type === 'primary-nav' || target?.id === 'row-primary-nav') {
            return state; // Locked row cannot be deleted
          }
          const remaining = state.headerRows.filter((r) => r.id !== rowId);
          return {
            headerRows: remaining,
            selectedTarget: { type: 'global', editorType: 'header' },
          };
        });
        get().pushSnapshot('Deleted header row');
      },

      addHeaderRow: (type, name) => {
        // Enforce single Header navbar constraint (only one primary-nav)
        const state = get();
        if (type === 'primary-nav' || name === 'Header' || state.headerRows.some((r) => r.type === 'primary-nav')) {
          if (type === 'primary-nav' || name === 'Header') return;
        }

        let defaultElements: HeaderElement[] = [];
        let defaultBg = '#ffffff';
        let defaultTextColor = '#0f172a';
        let defaultHeight = 44;
        let defaultContainer: HeaderRowLayout['container'] = 'constrained';
        let defaultAlignment: HeaderRowLayout['alignment'] = 'space-between';

        if (type === 'announcement') {
          defaultBg = '#198754';
          defaultTextColor = '#ffffff';
          defaultHeight = 38;
          defaultContainer = 'full';
          defaultAlignment = 'center';
          defaultElements = [
            {
              id: `el-announcement-${Date.now().toString(36)}`,
              type: 'promo-text',
              name: 'Announcement Notice',
              props: {
                text: '✨ Free worldwide shipping on orders over $99! Use code FREESHIP',
                link: '/collections/sale',
                badge: 'SALE',
                ctaText: 'Shop Now',
                showCountdown: true,
              },
            },
          ];
        } else if (type === 'utility') {
          defaultBg = '#f8fafc';
          defaultTextColor = '#475569';
          defaultHeight = 34;
          defaultContainer = 'constrained';
          defaultElements = [
            {
              id: `el-utility-${Date.now().toString(36)}`,
              type: 'utility-links',
              name: 'Utility Links',
              props: {
                phone: '+1 (800) 555-0199',
                email: 'support@billionbiz.com',
                welcomeMessage: 'Welcome to BillionBiz Store',
                trackOrderLink: '/track-order',
                currency: 'USD ($) | English',
              },
            },
          ];
        } else if (type === 'secondary-nav') {
          defaultBg = '#ffffff';
          defaultTextColor = '#0f172a';
          defaultHeight = 42;
          defaultContainer = 'constrained';
          defaultElements = [
            {
              id: `el-secnav-${Date.now().toString(36)}`,
              type: 'secondary-nav',
              name: 'Category Navigation',
              props: {
                links: [
                  { label: '🔥 All Deals', href: '/deals' },
                  { label: 'New Arrivals', href: '/new' },
                  { label: 'Best Sellers', href: '/best-sellers' },
                  { label: 'Collections', href: '/collections' },
                  { label: 'Gift Cards', href: '/gift-cards' },
                  { label: 'Clearance', href: '/sale' },
                ],
              },
            },
          ];
        } else if (type === 'promo') {
          defaultBg = '#0f172a';
          defaultTextColor = '#ffffff';
          defaultHeight = 46;
          defaultContainer = 'full';
          defaultElements = [
            {
              id: `el-promo-${Date.now().toString(36)}`,
              type: 'promo-bar',
              name: 'Campaign Banner',
              props: {
                headline: 'Limited Time Offer: Extra 20% Off Everything',
                couponCode: 'SAVE20',
                ctaText: 'Claim Discount',
                ctaLink: '/shop',
              },
            },
          ];
        }

        const newRow: HeaderRow = {
          id: `row-${type}-${Date.now().toString(36)}`,
          type,
          name,
          isVisible: true,
          layout: {
            container: defaultContainer,
            alignment: defaultAlignment,
            logoPosition: 'left',
            navPosition: 'center',
            actionsPosition: 'right',
            paddingX: 20,
            paddingY: 8,
            gap: 16,
            height: defaultHeight,
          },
          styling: {
            bgType: 'theme',
            bgColor: defaultBg,
            textColor: defaultTextColor,
            borderBottom: true,
            borderColor: '#e2e8f0',
            shadow: 'none',
            radius: 0,
            fontSize: 13,
            fontWeight: 500,
          },
          elements: defaultElements,
        };

        let newRows: HeaderRow[];
        if (type === 'announcement') {
          newRows = [newRow, ...state.headerRows];
        } else if (type === 'utility') {
          const primaryIdx = state.headerRows.findIndex((r) => r.type === 'primary-nav');
          if (primaryIdx !== -1) {
            newRows = [...state.headerRows];
            newRows.splice(primaryIdx, 0, newRow);
          } else {
            newRows = [newRow, ...state.headerRows];
          }
        } else {
          newRows = [...state.headerRows, newRow];
        }

        set({
          headerRows: newRows,
          selectedTarget: { type: 'row', editorType: 'header', rowId: newRow.id },
        });
        get().pushSnapshot(`Added header row ${name}`);
      },

      updateHeaderElement: (rowId, elementId, updates) => {
        set((state) => {
          const newRows = state.headerRows.map((r) => {
            if (r.id !== rowId) return r;
            return {
              ...r,
              elements: r.elements.map((el) => {
                if (el.id !== elementId) return el;
                return {
                  ...el,
                  ...updates,
                  props: { ...el.props, ...updates.props },
                };
              }),
            };
          });
          return { headerRows: newRows };
        });
        get().pushSnapshot(`Updated header element ${elementId}`);
      },

      reorderHeaderElements: (rowId, startIndex, endIndex) => {
        set((state) => {
          const newRows = state.headerRows.map((r) => {
            if (r.id !== rowId) return r;
            const newEls = [...r.elements];
            const [moved] = newEls.splice(startIndex, 1);
            newEls.splice(endIndex, 0, moved);
            return { ...r, elements: newEls };
          });
          return { headerRows: newRows };
        });
        get().pushSnapshot('Reordered header elements');
      },

      deleteHeaderElement: (rowId, elementId) => {
        set((state) => {
          const row = state.headerRows.find((r) => r.id === rowId);
          const el = row?.elements.find((e) => e.id === elementId);
          if (el?.isLocked || el?.id === 'el-logo' || el?.id === 'el-nav-links') {
            return state; // Locked element cannot be deleted
          }
          const componentKey = el?.type === 'navigation' || el?.type === 'primary-nav' || el?.type === 'navigation-menu'
            ? 'navigation'
            : el?.type === 'actions' || el?.type === 'action-group'
            ? 'actions'
            : el?.type;
          const newRows = state.headerRows.map((r) => {
            if (r.id !== rowId) return r;
            const responsiveArrangement = r.layout?.responsiveArrangement
              ? JSON.parse(JSON.stringify(r.layout.responsiveArrangement))
              : undefined;
            if (responsiveArrangement && componentKey) {
              (['desktop', 'tablet', 'mobile'] as const).forEach((device) => {
                const slots = responsiveArrangement[device];
                (['left', 'center', 'right', 'disabled'] as const).forEach((slot) => {
                  slots[slot] = slots[slot].filter((key: string) => key !== componentKey);
                });
                slots.disabled.push(componentKey);
              });
            }
            return {
              ...r,
              elements: r.elements,
              layout: responsiveArrangement ? { ...r.layout, responsiveArrangement } : r.layout,
            };
          });
          return {
            headerRows: newRows,
            selectedTarget: { type: 'row', editorType: 'header', rowId },
          };
        });
        get().pushSnapshot('Deleted header element');
      },

      toggleHeaderElementVisibility: (rowId, elementId) => {
        set((state) => {
          const newRows = state.headerRows.map((r) => {
            if (r.id !== rowId) return r;
            return {
              ...r,
              elements: r.elements.map((el) => {
                if (el.id !== elementId) return el;
                return { ...el, isVisible: el.isVisible === false ? true : false };
              }),
            };
          });
          return { headerRows: newRows };
        });
        get().pushSnapshot(`Toggled visibility of element ${elementId}`);
      },

      duplicateHeaderElement: (rowId, elementId) => {
        set((state) => {
          const row = state.headerRows.find((r) => r.id === rowId);
          if (!row) return state;
          const el = row.elements.find((e) => e.id === elementId);
          if (!el) return state;
          const cloned: HeaderElement = {
            ...JSON.parse(JSON.stringify(el)),
            id: `el-${el.type}-${Date.now().toString(36)}`,
            name: `${el.name} (Copy)`,
            isLocked: false,
          };
          const idx = row.elements.findIndex((e) => e.id === elementId);
          const newElements = [...row.elements];
          newElements.splice(idx + 1, 0, cloned);
          const newRows = state.headerRows.map((r) =>
            r.id === rowId ? { ...r, elements: newElements } : r
          );
          return {
            headerRows: newRows,
            selectedTarget: {
              type: 'element',
              editorType: 'header',
              rowId,
              elementId: cloned.id,
              elementType: cloned.type,
            },
          };
        });
        get().pushSnapshot('Duplicated header element');
      },

      addHeaderElement: (rowId, type, name, defaultProps = {}) => {
        const newEl: HeaderElement = {
          id: `el-${type}-${Date.now().toString(36)}`,
          type,
          name,
          props: defaultProps,
        };

        set((state) => {
          const newRows = state.headerRows.map((r) => {
            if (r.id !== rowId) return r;
            return { ...r, elements: [...r.elements, newEl] };
          });
          return {
            headerRows: newRows,
            selectedTarget: {
              type: 'element',
              editorType: 'header',
              rowId,
              elementId: newEl.id,
              elementType: type,
            },
          };
        });
        get().pushSnapshot(`Added header element ${name}`);
      },

      updateHeaderSettings: (updates) => {
        set((state) => ({
          headerSettings: { ...state.headerSettings, ...updates },
        }));
        get().pushSnapshot('Updated header settings');
      },

      syncHeaderToSiteStore: () => {
        const { headerRows, headerSettings } = get();
        const siteState = useSiteStore.getState();
        const landingPage = siteState.pages.find((p) => p.id === 'landing-page');
        if (!landingPage) return;

        // Compile header state into landing-page header sections props
        const mainNavRow = headerRows.find((r) => r.type === 'primary-nav');
        const logoEl = mainNavRow?.elements.find((e) => e.type === 'logo');
        const navEl = mainNavRow?.elements.find((e) => e.type === 'navigation' || e.type === 'navigation-menu' || e.type === 'primary-nav');
        const actionsEl = mainNavRow?.elements.find((e) => e.type === 'actions' || e.type === 'action-group');

        const headerSection = landingPage.sections.find((s) => s.type === 'Header');
        if (headerSection) {
          const updatedProps = {
            ...headerSection.props,
            logo: logoEl?.props?.text || 'BillionBiz',
            logoType: logoEl?.props?.logoType || 'text',
            logoHeight: logoEl?.props?.desktopWidth ? Math.min(95, Math.floor(logoEl.props.desktopWidth / 2)) : 60,
            links: (navEl?.props?.links || []).map((l: any) => l.label || l),
            showSearch: actionsEl?.props?.showSearch ?? true,
            showCart: actionsEl?.props?.showCart ?? true,
            showAccount: actionsEl?.props?.showAccount ?? true,
            showWishlist: actionsEl?.props?.showWishlist ?? true,
            sticky: headerSettings.scrollBehavior !== 'static',
            selectedLayout:
              headerSettings.structurePreset === 'centered-split'
                ? 'logo-center'
                : headerSettings.structurePreset === 'stacked'
                  ? 'nav-below'
                  : headerSettings.structurePreset === 'compact'
                    ? 'minimal'
                    : 'logo-left',
            bgColor: mainNavRow?.styling?.bgColor || '#ffffff',
            textColor: mainNavRow?.styling?.textColor || '#0f172a',
          };
          siteState.updateSectionProps(landingPage.id, headerSection.id, updatedProps);
        }

        // Also sync AnnouncementBar section to siteStore
        const announcementRow = headerRows.find((r) => r.type === 'announcement' || r.id.includes('announcement'));
        const announcementSection = landingPage.sections.find((s) => s.type === 'AnnouncementBar' || s.id === 'announcement-bar');
        if (announcementRow && announcementSection) {
          const el = announcementRow.elements?.[0];
          const elProps = el?.props || {};
          const currentBar = elProps.announcementBar;
          siteState.updateSectionProps(landingPage.id, announcementSection.id, {
            ...announcementSection.props,
            announcementBar: currentBar || announcementSection.props?.announcementBar,
            variant: currentBar?.look || elProps.variant || announcementRow.layout?.variantId || 'single',
            stylePreset: currentBar?.look || elProps.stylePreset || 'single',
            showCountdown: (currentBar?.look || elProps.variant) === 'countdown',
            text: currentBar?.content?.message || elProps.text,
            ctaText: currentBar?.content?.ctaLabel || elProps.ctaText,
            ctaLink: currentBar?.content?.ctaLink || elProps.ctaLink,
            announcements: currentBar?.content?.marqueeItems || elProps.announcements,
            slides: currentBar?.content?.slides || elProps.slides,
            bgColor: currentBar?.design?.bgColor || announcementRow.styling?.bgColor,
            textColor: currentBar?.design?.textColor || announcementRow.styling?.textColor,
          });
        }
      },

      // ──────────────────────────────────────────────────────────
      // Footer Actions
      // ──────────────────────────────────────────────────────────
      updateFooterRow: (rowId, updates) => {
        set((state) => ({
          footerRows: state.footerRows.map((r) =>
            r.id === rowId ? { ...r, ...updates } : r
          ),
        }));
        get().pushSnapshot(`Updated footer row ${rowId}`);
      },

      reorderFooterRows: (startIndex, endIndex) => {
        set((state) => {
          const newRows = [...state.footerRows];
          const [moved] = newRows.splice(startIndex, 1);
          newRows.splice(endIndex, 0, moved);
          return { footerRows: newRows };
        });
        get().pushSnapshot('Reordered footer rows');
      },

      toggleFooterRowVisibility: (rowId) => {
        set((state) => {
          const target = state.footerRows.find((r) => r.id === rowId);
          if (target?.isLocked || target?.type === 'navigation' || target?.id === 'row-main-nav') {
            return state; // Locked footer row cannot be hidden
          }
          return {
            footerRows: state.footerRows.map((r) =>
              r.id === rowId ? { ...r, isVisible: !r.isVisible } : r
            ),
          };
        });
        get().pushSnapshot(`Toggled footer row visibility ${rowId}`);
      },

      duplicateFooterRow: (rowId) => {
        set((state) => {
          const rowToClone = state.footerRows.find((r) => r.id === rowId);
          if (!rowToClone || rowToClone.isLocked || rowToClone.type === 'navigation' || rowToClone.id === 'row-main-nav') {
            return state; // Locked Footer directory row cannot be duplicated
          }

          const cloned: FooterRow = {
            ...JSON.parse(JSON.stringify(rowToClone)),
            id: `row-${rowToClone.type}-${Date.now().toString(36)}`,
            name: `${rowToClone.name} (Copy)`,
            isLocked: false,
          };

          const idx = state.footerRows.findIndex((r) => r.id === rowId);
          const newRows = [...state.footerRows];
          newRows.splice(idx + 1, 0, cloned);
          return {
            footerRows: newRows,
            selectedTarget: { type: 'row', editorType: 'footer', rowId: cloned.id },
          };
        });
        get().pushSnapshot('Duplicated footer row');
      },

      deleteFooterRow: (rowId) => {
        set((state) => {
          const target = state.footerRows.find((r) => r.id === rowId);
          if (target?.isLocked || target?.type === 'navigation' || target?.id === 'row-main-nav') {
            return state; // Locked footer row cannot be deleted
          }
          return {
            footerRows: state.footerRows.filter((r) => r.id !== rowId),
            selectedTarget: { type: 'global', editorType: 'footer' },
          };
        });
        get().pushSnapshot('Deleted footer row');
      },

      addFooterRow: (type, name) => {
        // Enforce single Footer directory constraint & single-instance row types
        const state = get();
        if (type === 'navigation' || name === 'Footer' || name === 'Footer Directory' || state.footerRows.some((r) => r.type === 'navigation' || r.id === 'row-main-nav')) {
          if (type === 'navigation' || name === 'Footer' || name === 'Footer Directory') return;
        }
        if (state.footerRows.some((r) => r.type === type && (type === 'trust' || type === 'newsletter' || type === 'payment' || type === 'social' || type === 'legal' || type === 'brand' || type === 'app' || type === 'contact'))) {
          return;
        }

        let defaultBg = '#ffffff';
        let defaultTextColor = '#0f172a';
        let defaultColumns: FooterColumn[] = [];

        if (type === 'trust') {
          defaultBg = '#f8fafc';
          defaultColumns = [
            {
              id: `col-trust-${Date.now().toString(36)}`,
              width: '1fr',
              elements: [
                {
                  id: `el-ftr-trust-${Date.now().toString(36)}`,
                  type: 'trust-badges',
                  name: 'Customer Guarantees',
                  capabilities: ['style', 'content', 'responsive'],
                  props: {
                    items: [
                      { icon: 'shield-check', title: 'Bank-Grade Security', description: '256-bit SSL encrypted payments' },
                      { icon: 'truck', title: 'Fast Free Delivery', description: 'Orders shipped in 24 hours' },
                      { icon: 'refresh-cw', title: '30-Day Guarantees', description: 'Zero question return policy' },
                      { icon: 'headphones', title: '24/7 Priority Support', description: 'Direct access to support specialists' },
                    ],
                  },
                },
              ],
            },
          ];
        } else if (type === 'newsletter') {
          defaultBg = '#ffffff';
          defaultColumns = [
            {
              id: `col-newsletter-${Date.now().toString(36)}`,
              width: '1fr',
              elements: [
                {
                  id: `el-ftr-newsletter-${Date.now().toString(36)}`,
                  type: 'newsletter-form',
                  name: 'Newsletter Form',
                  capabilities: ['style', 'content', 'responsive'],
                  props: {
                    headline: 'Join Our VIP Insider List',
                    description: 'Get 15% off your first order plus early access to private sales.',
                    placeholder: 'Enter your email address...',
                    buttonText: 'Subscribe',
                  },
                },
              ],
            },
          ];
        } else if (type === 'brand') {
          defaultColumns = [
            {
              id: `col-brand-${Date.now().toString(36)}`,
              width: '1fr',
              elements: [
                {
                  id: `el-ftr-brand-${Date.now().toString(36)}`,
                  type: 'brand-description',
                  name: 'Brand Bio',
                  capabilities: ['style', 'content', 'responsive'],
                  props: {
                    title: 'BillionBiz',
                    text: 'Empowering modern online merchants with frictionless store infrastructure, intelligent workflows, and conversion-optimized retail tools.',
                  },
                },
              ],
            },
          ];
        } else if (type === 'payment') {
          defaultColumns = [
            {
              id: `col-payment-${Date.now().toString(36)}`,
              width: '1fr',
              elements: [
                {
                  id: `el-ftr-payment-${Date.now().toString(36)}`,
                  type: 'payment-methods',
                  name: 'Payment Methods',
                  capabilities: ['style', 'content', 'responsive'],
                  props: {
                    heading: 'Accepted Payment Methods',
                    providers: ['visa', 'mastercard', 'amex', 'paypal', 'apple-pay', 'google-pay'],
                  },
                },
              ],
            },
          ];
        } else if (type === 'legal') {
          defaultColumns = [
            {
              id: `col-legal-${Date.now().toString(36)}`,
              width: '1fr',
              elements: [
                {
                  id: `el-ftr-legal-${Date.now().toString(36)}`,
                  type: 'copyright',
                  name: 'Legal & Policies',
                  capabilities: ['style', 'content', 'responsive'],
                  props: {
                    text: '© 2026 BillionBiz, Inc. All rights reserved.',
                    showBackToTop: true,
                  },
                },
              ],
            },
          ];
        } else if (type === 'social') {
          defaultColumns = [
            {
              id: `col-social-${Date.now().toString(36)}`,
              width: '1fr',
              elements: [
                {
                  id: `el-ftr-social-${Date.now().toString(36)}`,
                  type: 'social-links',
                  name: 'Social Profiles',
                  capabilities: ['style', 'content', 'responsive'],
                  props: {
                    heading: 'Follow Us',
                    platforms: [
                      { platform: 'twitter', url: 'https://twitter.com', enabled: true },
                      { platform: 'instagram', url: 'https://instagram.com', enabled: true },
                      { platform: 'youtube', url: 'https://youtube.com', enabled: true },
                    ],
                  },
                },
              ],
            },
          ];
        } else if (type === 'app') {
          defaultColumns = [
            {
              id: `col-app-${Date.now().toString(36)}`,
              width: '1fr',
              elements: [
                {
                  id: `el-ftr-app-${Date.now().toString(36)}`,
                  type: 'app-download',
                  name: 'App Download Badges',
                  capabilities: ['style', 'content', 'responsive'],
                  props: {
                    heading: 'Get the BillionBiz App',
                    subtitle: 'Shop anytime, track orders in real time, and enjoy 1-click mobile checkout.',
                    appStoreUrl: '#',
                    googlePlayUrl: '#',
                    qrEnabled: true,
                  },
                },
              ],
            },
          ];
        } else if (type === 'contact') {
          defaultColumns = [
            {
              id: `col-contact-${Date.now().toString(36)}`,
              width: '1fr',
              elements: [
                {
                  id: `el-ftr-contact-${Date.now().toString(36)}`,
                  type: 'contact-info',
                  name: 'Contact Information',
                  capabilities: ['style', 'content', 'responsive'],
                  props: {
                    phone: '+1 (800) 555-0199',
                    email: 'care@billionbiz.com',
                    address: '742 Evergreen Terrace, San Francisco, CA 94107',
                    hours: 'Mon – Fri: 9:00 AM – 7:00 PM EST',
                  },
                },
              ],
            },
          ];
        } else if (type === 'seo') {
          defaultColumns = [
            {
              id: `col-seo-${Date.now().toString(36)}`,
              width: '1fr',
              elements: [
                {
                  id: `el-ftr-seo-${Date.now().toString(36)}`,
                  type: 'rich-text',
                  name: 'SEO & Brand Story',
                  capabilities: ['style', 'content', 'responsive'],
                  props: {
                    heading: 'Discover Premium Online Shopping with BillionBiz',
                    text: 'We curate authentic, premium essentials crafted for conscious consumers. Enjoy lightning-fast doorstep shipping across India, guaranteed genuine products, hassle-free returns, and dedicated 24/7 customer concierge support.',
                    keywords: [
                      'Organic Skincare',
                      'Ayurvedic Products',
                      'Eco-Friendly Essentials',
                      'Pan-India Fast Delivery',
                      '100% Genuine Certified',
                    ],
                    isExpandable: true,
                    enableSchema: true,
                  },
                },
              ],
            },
          ];
        } else if (type === 'category-links') {
          defaultColumns = [
            {
              id: `col-catlinks-${Date.now().toString(36)}`,
              width: '1fr',
              elements: [
                {
                  id: `el-ftr-catlinks-${Date.now().toString(36)}`,
                  type: 'category-links' as any,
                  name: 'Category Directory Links',
                  capabilities: ['style', 'content', 'responsive'],
                  props: {
                    separator: ', ',
                    titleTransform: 'uppercase',
                    titleColor: '#0f172a',
                    linkColor: '#64748b',
                    linkHoverColor: '#0f172a',
                    fontSize: 13,
                    categories: [
                      {
                        id: 'cat-1',
                        name: 'KITCHEN',
                        links: [
                          { label: 'Storage Jars', url: '#' },
                          { label: 'Storage Containers', url: '#' },
                          { label: 'Lunch Boxes', url: '#' },
                          { label: 'Casseroles', url: '#' },
                          { label: 'Lunch Bags', url: '#' },
                          { label: 'Kitchen Tools', url: '#' },
                          { label: 'Baking Dishes', url: '#' },
                          { label: 'Kitchen Racks', url: '#' },
                          { label: 'Cookware', url: '#' },
                          { label: 'Cooking Pots', url: '#' },
                          { label: 'Stainless Steel Cookware', url: '#' },
                          { label: 'Aprons', url: '#' }
                        ]
                      },
                      {
                        id: 'cat-2',
                        name: 'DINING',
                        links: [
                          { label: 'Plates', url: '#' },
                          { label: 'Platters', url: '#' },
                          { label: 'Bowls', url: '#' },
                          { label: 'Snack Bowls', url: '#' },
                          { label: 'Table Linen', url: '#' },
                          { label: 'Tea Cups', url: '#' },
                          { label: 'Coffee Mugs', url: '#' },
                          { label: 'Water Bottles', url: '#' },
                          { label: 'Wine Glasses', url: '#' },
                          { label: 'Champagne Glasses', url: '#' },
                          { label: 'Tumblers', url: '#' },
                          { label: 'Table Mats', url: '#' },
                          { label: 'Cake Stands', url: '#' },
                          { label: 'Serving Bowls', url: '#' },
                          { label: 'Dinner Plates', url: '#' },
                          { label: 'Section Plates', url: '#' },
                          { label: 'Drinkware', url: '#' }
                        ]
                      },
                      {
                        id: 'cat-3',
                        name: 'DECOR',
                        links: [
                          { label: 'Puja Essentials', url: '#' },
                          { label: 'Showpieces', url: '#' },
                          { label: 'Photo Frames', url: '#' },
                          { label: 'Baskets', url: '#' },
                          { label: 'Mirrors', url: '#' },
                          { label: 'Candles', url: '#' },
                          { label: 'Candle Stands', url: '#' },
                          { label: "Kids' Collection", url: '#' },
                          { label: 'Vases', url: '#' },
                          { label: 'Tissue Boxes', url: '#' },
                          { label: 'Decorative Trays', url: '#' },
                          { label: 'Table Accents', url: '#' },
                          { label: 'Decorative Bowls', url: '#' }
                        ]
                      },
                      {
                        id: 'cat-4',
                        name: 'BATH',
                        links: [
                          { label: 'Floor Mats', url: '#' },
                          { label: 'Dustbins', url: '#' },
                          { label: 'Bathroom Accessories', url: '#' },
                          { label: 'Bathroom Sets', url: '#' },
                          { label: 'Dispensers', url: '#' }
                        ]
                      },
                      {
                        id: 'cat-5',
                        name: 'BAGS AND ACCESSORIES',
                        links: [
                          { label: 'Car Accessories', url: '#' },
                          { label: 'Jewellery', url: '#' },
                          { label: 'Earrings', url: '#' },
                          { label: 'Rings', url: '#' },
                          { label: 'Makeup Pouches', url: '#' },
                          { label: 'Jewellery Organisers', url: '#' },
                          { label: 'Tote Bags', url: '#' },
                          { label: 'Travel Bags', url: '#' },
                          { label: 'Sling Bags', url: '#' },
                          { label: 'Handbags', url: '#' }
                        ]
                      },
                      {
                        id: 'cat-6',
                        name: 'SOFT FURNISHINGS',
                        links: [
                          { label: 'Throw Blankets', url: '#' },
                          { label: 'Cushions And Cushion Covers', url: '#' },
                          { label: 'Bedsheets', url: '#' },
                          { label: 'Rugs', url: '#' }
                        ]
                      }
                    ]
                  }
                }
              ]
            }
          ];
        } else {
          defaultColumns = [
            { id: `col-${Date.now().toString(36)}-1`, width: '1fr', elements: [] },
            { id: `col-${Date.now().toString(36)}-2`, width: '1fr', elements: [] },
            { id: `col-${Date.now().toString(36)}-3`, width: '1fr', elements: [] },
          ];
        }

        const newRow: FooterRow = {
          id: `row-ftr-${type}-${Date.now().toString(36)}`,
          type,
          name,
          isVisible: true,
          layout: {
            container: 'constrained',
            columns: defaultColumns.length,
            gap: 24,
            alignment: 'stretch',
            verticalAlignment: 'top',
            paddingX: 32,
            paddingY: 36,
          },
          styling: {
            bgType: 'theme',
            bgColor: defaultBg,
            textColor: defaultTextColor,
            borderTop: true,
            borderBottom: false,
            borderColor: '#e2e8f0',
            dividerStyle: 'solid',
            shadow: 'none',
            radius: 0,
            fontSize: 14,
          },
          columns: defaultColumns,
        };

        set((state) => ({
          footerRows: [...state.footerRows, newRow],
          selectedTarget: { type: 'row', editorType: 'footer', rowId: newRow.id },
        }));
        get().pushSnapshot(`Added footer row ${name}`);
      },

      updateFooterElement: (rowId, elementId, updates) => {
        set((state) => {
          const newRows = state.footerRows.map((r) => {
            if (r.id !== rowId) return r;
            return {
              ...r,
              columns: r.columns.map((col) => ({
                ...col,
                elements: col.elements.map((el) => {
                  if (el.id !== elementId) return el;
                  return {
                    ...el,
                    ...updates,
                    props: { ...el.props, ...updates.props },
                  };
                }),
              })),
            };
          });
          return { footerRows: newRows };
        });
        get().pushSnapshot(`Updated footer element ${elementId}`);
      },

      deleteFooterElement: (rowId, elementId) => {
        set((state) => {
          const row = state.footerRows.find((r) => r.id === rowId);
          let targetEl: FooterElement | undefined;
          row?.columns.forEach((c) => {
            const found = c.elements.find((e) => e.id === elementId);
            if (found) targetEl = found;
          });
          if (targetEl?.isLocked) {
            return state; // Locked footer element cannot be deleted
          }
          const newRows = state.footerRows.map((r) => {
            if (r.id !== rowId) return r;
            const filterElList = (list: FooterElement[]): FooterElement[] => {
              return list
                .filter((el) => el.id !== elementId)
                .map((el) => {
                  if (el.type === 'group' && Array.isArray(el.props?.elements)) {
                    return {
                      ...el,
                      props: {
                        ...el.props,
                        elements: (el.props.elements as any[]).filter((sub) => sub.id !== elementId),
                      },
                    };
                  }
                  return el;
                });
            };

            const updatedColumns = r.columns.map((col) => ({
              ...col,
              elements: filterElList(col.elements),
            }));

            const updatedSubRows = r.rows?.map((subRow) => ({
              ...subRow,
              columns: subRow.columns.map((col) => ({
                ...col,
                elements: filterElList(col.elements),
              })),
            }));

            return {
              ...r,
              columns: updatedColumns,
              ...(updatedSubRows ? { rows: updatedSubRows } : {}),
            };
          });
          return {
            footerRows: newRows,
            selectedTarget: { type: 'row', editorType: 'footer', rowId },
          };
        });
        get().pushSnapshot('Deleted footer element');
      },

      addFooterElement: (rowId, columnId, type, name, defaultProps = {}, groupId?: string) => {
        const newEl: FooterElement = {
          id: `el-ftr-${type}-${Date.now().toString(36)}`,
          type,
          name,
          props: defaultProps,
          capabilities: ['style', 'content', 'design', 'responsive', 'advanced'],
        };

        set((state) => {
          const insertElementIntoList = (elements: FooterElement[]): FooterElement[] => {
            if (!groupId) {
              return [...elements, newEl];
            }
            return elements.map((el) => {
              if (el.id === groupId && el.type === 'group') {
                const existingChildren = el.props?.children || (el as any).children || [];
                return {
                  ...el,
                  props: {
                    ...el.props,
                    children: [...existingChildren, newEl],
                  },
                };
              }
              return el;
            });
          };

          const newRows = state.footerRows.map((r) => {
            if (r.id !== rowId) return r;
            const updatedCols = (r.columns || []).map((col) => {
              if (col.id !== columnId && r.columns.length > 0) return col;
              return { ...col, elements: insertElementIntoList(col.elements) };
            });
            const updatedSubRows = r.rows?.map((rowBand) => ({
              ...rowBand,
              columns: rowBand.columns.map((col) => {
                if (col.id !== columnId) return col;
                return { ...col, elements: insertElementIntoList(col.elements) };
              }),
            }));
            return {
              ...r,
              columns: updatedCols,
              ...(updatedSubRows ? { rows: updatedSubRows } : {}),
            };
          });

          return {
            footerRows: newRows,
            selectedTarget: {
              type: 'element',
              editorType: 'footer',
              rowId,
              elementId: newEl.id,
              elementType: type,
            },
          };
        });
        get().pushSnapshot(`Added footer element ${name}`);
      },

      updateFooterSettings: (updates) => {
        set((state) => ({
          footerSettings: { ...state.footerSettings, ...updates },
        }));
        get().pushSnapshot('Updated footer settings');
      },

      // ──────────────────────────────────────────────────────────
      // Recursive Footer Tree Architecture Actions
      // ──────────────────────────────────────────────────────────
      setFooterTree: (tree) => {
        const rows = get().footerRows;
        const newRows = rows.map((r) =>
          r.id === 'footer-main' ? { ...r, children: tree } : r
        );
        set({
          footerTree: tree,
          footerRows: newRows,
        });
        get().pushSnapshot('Updated footer tree');
      },

      selectFooterNode: (nodeId) => {
        if (!nodeId || nodeId === 'root' || nodeId === 'footer-main') {
          set({
            selectedFooterNodeId: null,
            selectedTarget: { type: 'row', editorType: 'footer', rowId: 'footer-main' },
            footerRightSidebarMode: 'inspector',
          });
          return;
        }

        const effectiveTree = get().pendingFooterTree || get().footerTree;
        const node = findNodeById(effectiveTree, nodeId);
        if (node) {
          const ancestors = getAncestorPath(effectiveTree, nodeId) || [];
          const currentExpanded = get().footerExpandedNodeIds;
          const mergedExpanded = Array.from(new Set([...currentExpanded, ...ancestors]));

          set({
            selectedFooterNodeId: nodeId,
            selectedTarget: { type: 'footer-node', nodeId, nodeType: node.nodeType },
            footerRightSidebarMode: 'inspector',
            footerExpandedNodeIds: mergedExpanded,
          });
        }
      },

      setFooterRightSidebarMode: (mode) => {
        set({ footerRightSidebarMode: mode });
      },

      toggleFooterNodeExpanded: (nodeId) => {
        set((state) => {
          const isExp = state.footerExpandedNodeIds.includes(nodeId);
          return {
            footerExpandedNodeIds: isExp
              ? state.footerExpandedNodeIds.filter((id) => id !== nodeId)
              : [...state.footerExpandedNodeIds, nodeId],
          };
        });
      },

      expandFooterAncestors: (nodeId) => {
        const effectiveTree = get().pendingFooterTree || get().footerTree;
        const ancestors = getAncestorPath(effectiveTree, nodeId) || [];
        set((state) => ({
          footerExpandedNodeIds: Array.from(
            new Set([...state.footerExpandedNodeIds, ...ancestors])
          ),
        }));
      },

      addFooterTreeNode: (newNode, parentId = null, index) => {
        const currentTree = get().footerTree;
        const nextTree = insertNode(currentTree, parentId, newNode, index);
        const rows = get().footerRows;
        const newRows = rows.map((r) =>
          r.id === 'footer-main' ? { ...r, children: nextTree } : r
        );
        const nextExpanded = parentId
          ? Array.from(new Set([...get().footerExpandedNodeIds, parentId]))
          : get().footerExpandedNodeIds;

        set({
          footerTree: nextTree,
          footerRows: newRows,
          selectedFooterNodeId: newNode.id,
          selectedTarget: { type: 'footer-node', nodeId: newNode.id, nodeType: newNode.nodeType },
          footerExpandedNodeIds: nextExpanded,
          footerRightSidebarMode: 'inspector',
          isFooterComponentPickerOpen: false,
        });
        get().pushSnapshot(`Added footer node: ${newNode.name}`);
      },

      updateFooterTreeNode: (nodeId, updates) => {
        const currentTree = get().footerTree;
        const nextTree = updateNode(currentTree, nodeId, updates);
        const rows = get().footerRows;
        const newRows = rows.map((r) =>
          r.id === 'footer-main' ? { ...r, children: nextTree } : r
        );
        set({
          footerTree: nextTree,
          footerRows: newRows,
        });
      },

      updateFooterTreeNodeProps: (nodeId, propUpdates) => {
        const currentTree = get().footerTree;
        const node = findNodeById(currentTree, nodeId);
        const nextTree = updateNode(currentTree, nodeId, {
          props: { ...(node?.props || {}), ...propUpdates },
        });
        const rows = get().footerRows;
        const newRows = rows.map((r) =>
          r.id === 'footer-main' ? { ...r, children: nextTree } : r
        );
        set({
          footerTree: nextTree,
          footerRows: newRows,
        });
        get().pushSnapshot('Updated block properties');
      },

      updateFooterTreeNodeLayout: (nodeId, layoutUpdates) => {
        const currentTree = get().footerTree;
        const node = findNodeById(currentTree, nodeId);
        const nextTree = updateNode(currentTree, nodeId, {
          layout: { ...(node?.layout || {}), ...layoutUpdates } as any,
        });
        const rows = get().footerRows;
        const newRows = rows.map((r) =>
          r.id === 'footer-main' ? { ...r, children: nextTree } : r
        );
        set({
          footerTree: nextTree,
          footerRows: newRows,
        });
        get().pushSnapshot('Updated layout');
      },

      updateFooterTreeNodeStyling: (nodeId, stylingUpdates) => {
        const currentTree = get().footerTree;
        const node = findNodeById(currentTree, nodeId);
        const nextTree = updateNode(currentTree, nodeId, {
          styling: { ...(node?.styling || {}), ...stylingUpdates } as any,
        });
        const rows = get().footerRows;
        const newRows = rows.map((r) =>
          r.id === 'footer-main' ? { ...r, children: nextTree } : r
        );
        set({
          footerTree: nextTree,
          footerRows: newRows,
        });
        get().pushSnapshot('Updated style');
      },

      updateFooterTreeNodeResponsive: (nodeId, responsiveUpdates) => {
        const currentTree = get().footerTree;
        const node = findNodeById(currentTree, nodeId);
        const nextTree = updateNode(currentTree, nodeId, {
          responsive: { ...(node?.responsive || {}), ...responsiveUpdates } as any,
        });
        const rows = get().footerRows;
        const newRows = rows.map((r) =>
          r.id === 'footer-main' ? { ...r, children: nextTree } : r
        );
        set({
          footerTree: nextTree,
          footerRows: newRows,
        });
        get().pushSnapshot('Updated responsive settings');
      },

      deleteFooterTreeNode: (nodeId) => {
        const currentTree = get().footerTree;
        const nextTree = removeNode(currentTree, nodeId);
        const rows = get().footerRows;
        const newRows = rows.map((r) =>
          r.id === 'footer-main' ? { ...r, children: nextTree } : r
        );
        const selectedId = get().selectedFooterNodeId === nodeId ? null : get().selectedFooterNodeId;
        const selectedTarget =
          selectedId === null
            ? ({ type: 'row', editorType: 'footer', rowId: 'footer-main' } as SelectedTarget)
            : get().selectedTarget;

        set({
          footerTree: nextTree,
          footerRows: newRows,
          selectedFooterNodeId: selectedId,
          selectedTarget,
        });
        get().pushSnapshot('Deleted footer node');
      },

      duplicateFooterTreeNode: (nodeId) => {
        const currentTree = get().footerTree;
        const node = findNodeById(currentTree, nodeId);
        if (!node) return;
        const cloned = cloneNodeWithNewIds(node);
        cloned.name = node.name;
        const { parent, index } = findParentNode(currentTree, nodeId);
        const nextTree = insertNode(currentTree, parent ? parent.id : null, cloned, index + 1);
        const rows = get().footerRows;
        const newRows = rows.map((r) =>
          r.id === 'footer-main' ? { ...r, children: nextTree } : r
        );
        set({
          footerTree: nextTree,
          footerRows: newRows,
          selectedFooterNodeId: cloned.id,
          selectedTarget: { type: 'footer-node', nodeId: cloned.id, nodeType: cloned.nodeType },
        });
        get().pushSnapshot(`Duplicated footer node: ${node.name}`);
      },

      moveFooterTreeNode: (nodeId, newParentId, targetIndex) => {
        const currentTree = get().footerTree;
        const nextTree = moveNode(currentTree, nodeId, newParentId, targetIndex);
        const rows = get().footerRows;
        const newRows = rows.map((r) =>
          r.id === 'footer-main' ? { ...r, children: nextTree } : r
        );
        set({
          footerTree: nextTree,
          footerRows: newRows,
        });
        get().pushSnapshot('Moved footer node');
      },

      openFooterComponentPicker: (parentId = null, targetIndex) => {
        set({
          isFooterComponentPickerOpen: true,
          footerPickerTargetParentId: parentId,
          footerPickerTargetIndex: targetIndex,
        });
      },

      closeFooterComponentPicker: () => {
        set({
          isFooterComponentPickerOpen: false,
          footerPickerTargetParentId: null,
          footerPickerTargetIndex: undefined,
        });
      },

      previewFooterTemplate: (templateId) => {
        const tpl = FOOTER_TREE_TEMPLATES.find((t) => t.id === templateId);
        if (tpl) {
          set({
            pendingFooterTemplateId: templateId,
            pendingFooterTree: JSON.parse(JSON.stringify(tpl.tree)),
          });
        }
      },

      applyFooterTreeTemplate: (templateId: string) => {
        const tpl = FOOTER_TREE_TEMPLATES.find((t) => t.id === templateId);
        if (!tpl) return;
        const cloned = JSON.parse(JSON.stringify(tpl.tree));
        const { footerRows } = get();
        const targetRow = footerRows.find((r) => r.id === 'footer-main') || footerRows[0];
        const newRows = targetRow
          ? footerRows.map((r) => (r.id === targetRow.id ? { ...r, id: 'footer-main', children: cloned } : r))
          : [{ ...createDefaultFooterStack()[0], children: cloned }];

        // Auto-expand top groups in left sidebar tree so user sees the new group hierarchy
        const topGroupIds = cloned.filter((n: any) => n.nodeType === 'group').map((n: any) => n.id);

        set({
          footerTree: cloned,
          footerRows: newRows,
          footerExpandedNodeIds: topGroupIds,
          pendingFooterTemplateId: null,
          pendingFooterTree: null,
          selectedFooterNodeId: null,
          selectedTarget: { type: 'row', editorType: 'footer', rowId: 'footer-main' },
        });
        get().pushSnapshot(`Applied footer template: ${tpl.name}`);
      },

      applyPendingFooterTemplate: () => {
        const { pendingFooterTemplateId, pendingFooterTree, footerRows } = get();
        if (pendingFooterTemplateId) {
          get().applyFooterTreeTemplate(pendingFooterTemplateId);
          return;
        }
        if (pendingFooterTree) {
          const cloned = JSON.parse(JSON.stringify(pendingFooterTree));
          const targetRow = footerRows.find((r) => r.id === 'footer-main') || footerRows[0];
          const newRows = targetRow
            ? footerRows.map((r) => (r.id === targetRow.id ? { ...r, id: 'footer-main', children: cloned } : r))
            : [{ ...createDefaultFooterStack()[0], children: cloned }];
          const topGroupIds = cloned.filter((n: any) => n.nodeType === 'group').map((n: any) => n.id);
          set({
            footerTree: cloned,
            footerRows: newRows,
            footerExpandedNodeIds: topGroupIds,
            pendingFooterTemplateId: null,
            pendingFooterTree: null,
            selectedFooterNodeId: null,
            selectedTarget: { type: 'row', editorType: 'footer', rowId: 'footer-main' },
            footerRightSidebarMode: 'inspector',
          });
          get().pushSnapshot('Applied footer template');
        }
      },

      cancelPendingFooterTemplate: () => {
        set({
          pendingFooterTemplateId: null,
          pendingFooterTree: null,
        });
      },

      // ──────────────────────────────────────────────────────────
      // History Actions
      // ──────────────────────────────────────────────────────────
      pushSnapshot: (description: string) => {
        const state = get();
        const entry = createSnapshot(state.editorType, description, {
          headerRows: state.headerRows,
          headerSettings: state.headerSettings,
          footerRows: state.footerRows,
          footerSettings: state.footerSettings,
          footerTree: state.footerTree,
        });
        set((s) => ({ history: pushHistoryEntry(s.history, entry) }));
        // Also re-run audit on every change
        get().runAudit();
      },

      undo: () => {
        const { newHistory, entryToRestore } = undoHistory(get().history);
        if (!entryToRestore) return;

        set({ history: newHistory });
        if (entryToRestore.snapshot.headerRows) {
          set({ headerRows: entryToRestore.snapshot.headerRows });
        }
        if (entryToRestore.snapshot.headerSettings) {
          set({ headerSettings: entryToRestore.snapshot.headerSettings });
        }
        if (entryToRestore.snapshot.footerRows) {
          set({ footerRows: entryToRestore.snapshot.footerRows });
        }
        if (entryToRestore.snapshot.footerSettings) {
          set({ footerSettings: entryToRestore.snapshot.footerSettings });
        }
        if (entryToRestore.snapshot.footerTree) {
          set({ footerTree: entryToRestore.snapshot.footerTree });
        }
        get().runAudit();
      },

      redo: () => {
        const { newHistory, entryToRestore } = redoHistory(get().history);
        if (!entryToRestore) return;

        set({ history: newHistory });
        if (entryToRestore.snapshot.headerRows) {
          set({ headerRows: entryToRestore.snapshot.headerRows });
        }
        if (entryToRestore.snapshot.headerSettings) {
          set({ headerSettings: entryToRestore.snapshot.headerSettings });
        }
        if (entryToRestore.snapshot.footerRows) {
          set({ footerRows: entryToRestore.snapshot.footerRows });
        }
        if (entryToRestore.snapshot.footerSettings) {
          set({ footerSettings: entryToRestore.snapshot.footerSettings });
        }
        if (entryToRestore.snapshot.footerTree) {
          set({ footerTree: entryToRestore.snapshot.footerTree });
        }
        get().runAudit();
      },

      // ──────────────────────────────────────────────────────────
      // Audit Actions
      // ──────────────────────────────────────────────────────────
      runAudit: () => {
        const state = get();
        const result = runEditorAudit(state.editorType, {
          headerRows: state.headerRows,
          headerSettings: state.headerSettings,
          footerRows: state.footerRows,
          footerSettings: state.footerSettings,
        });
        set({ auditResult: result });
      },

      // ──────────────────────────────────────────────────────────
      // Modal Actions
      // ──────────────────────────────────────────────────────────
      openCommandPalette: () => set({ isCommandPaletteOpen: true }),
      closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
      openAiDrawer: () => set({ isAiDrawerOpen: true }),
      closeAiDrawer: () => set({ isAiDrawerOpen: false }),
      openAuditModal: () => {
        get().runAudit();
        set({ isAuditModalOpen: true });
      },
      closeAuditModal: () => set({ isAuditModalOpen: false }),
      openPresetModal: () => set({ isPresetModalOpen: true }),
      closePresetModal: () => set({ isPresetModalOpen: false, pendingPreset: null }),
      openAddComponentModal: (category = 'all') =>
        set({ isAddComponentModalOpen: true, addComponentCategory: category }),
      closeAddComponentModal: () => set({ isAddComponentModalOpen: false }),
      openSavePresetModal: () => set({ isSavePresetModalOpen: true }),
      closeSavePresetModal: () => set({ isSavePresetModalOpen: false }),

      applyPresetPrompt: (editorType, type, id) => {
        set({ pendingPreset: { editorType, type, id } });
      },

      confirmApplyPreset: (mode: PresetApplyMode) => {
        const state = get();
        const pending = state.pendingPreset;
        if (!pending) return;

        if (pending.editorType === 'header') {
          if (pending.type === 'structure') {
            const preset = HEADER_STRUCTURE_PRESETS.find((p) => p.id === pending.id);
            if (preset) {
              set((s) => ({
                headerSettings: { ...s.headerSettings, structurePreset: pending.id },
                headerRows: s.headerRows.map((r) => {
                  if (r.type === 'primary-nav') {
                    return { ...r, layout: { ...r.layout, ...preset.layout } };
                  }
                  return r;
                }),
              }));
            }
          } else if (pending.type === 'appearance') {
            const preset = HEADER_APPEARANCE_PRESETS.find((p) => p.id === pending.id);
            if (preset) {
              set((s) => ({
                headerSettings: {
                  ...s.headerSettings,
                  appearancePreset: pending.id,
                  tokens: {
                    ...s.headerSettings.tokens,
                    ...preset.tokens,
                  },
                },
              }));
            }
          }
        } else if (pending.editorType === 'footer') {
          if (pending.type === 'structure') {
            const preset = FOOTER_STRUCTURE_PRESETS.find((p) => p.id === pending.id);
            if (preset) {
              set((s) => ({
                footerSettings: { ...s.footerSettings, structurePreset: pending.id },
              }));
            }
          } else if (pending.type === 'appearance') {
            const preset = FOOTER_APPEARANCE_PRESETS.find((p) => p.id === pending.id);
            if (preset && preset.styling) {
              set((s) => ({
                footerSettings: {
                  ...s.footerSettings,
                  appearancePreset: pending.id,
                  tokens: {
                    ...s.footerSettings.tokens,
                    bgColor: preset.styling?.bgColor || s.footerSettings.tokens.bgColor,
                    textColor: preset.styling?.textColor || s.footerSettings.tokens.textColor,
                    borderColor: preset.styling?.borderColor || s.footerSettings.tokens.borderColor,
                    accentColor: preset.styling?.accentColor || s.footerSettings.tokens.accentColor,
                  },
                },
              }));
            }
          }
        }

        set({ pendingPreset: null, isPresetModalOpen: false });
        get().pushSnapshot(`Applied preset: ${pending.id} (${mode})`);
      },

      saveUserPreset: (name, options) => {
        const state = get();
        const effectiveOptions = options || { structure: true, style: true, content: true, behavior: true };
        const newPreset: UserPreset = {
          id: `preset-${Date.now()}`,
          name,
          createdAt: Date.now(),
          editorType: state.editorType,
          structure: effectiveOptions.structure,
          style: effectiveOptions.style,
          content: effectiveOptions.content,
          behavior: effectiveOptions.behavior,
          data: {
            rows: state.editorType === 'header' ? state.headerRows : state.footerRows,
            globalSettings: state.editorType === 'header' ? state.headerSettings : state.footerSettings,
          },
        };

        set((s) => ({
          userPresets: [...s.userPresets, newPreset],
          isSavePresetModalOpen: false,
        }));
      },

      deleteUserPreset: (presetId) => {
        set((s) => ({
          userPresets: s.userPresets.filter((p) => p.id !== presetId),
        }));
      },

      applyUserPreset: (presetId) => {
        const state = get();
        const preset = state.userPresets.find((p) => p.id === presetId);
        if (!preset) return;

        if (preset.editorType === 'header') {
          set({
            headerRows: JSON.parse(JSON.stringify(preset.data.rows)),
            headerSettings: { ...preset.data.globalSettings as any },
          });
          get().pushSnapshot(`Applied user preset: ${preset.name}`);
        } else if (preset.editorType === 'footer') {
          set({
            footerRows: JSON.parse(JSON.stringify(preset.data.rows)),
            footerSettings: { ...preset.data.globalSettings as any },
          });
          get().pushSnapshot(`Applied user preset: ${preset.name}`);
        }
      },

      // ──────────────────────────────────────────────────────────
      // Variant / Arrangement / Template Actions
      // ──────────────────────────────────────────────────────────
      previewVariant: (editorType, variantId, isHoverOnly = false) => {
        const state = get();
        if (editorType === 'header') {
          const variant = HEADER_VARIANTS.find((v) => v.id === variantId);
          if (!variant) return;

          const baseRows = state.headerRows && state.headerRows.length > 0
            ? state.headerRows
            : createDefaultHeaderStack();

          const currentPrimaryRow = baseRows.find((r) => r.type === 'primary-nav') || baseRows[0];
          const currentElements = currentPrimaryRow?.elements ? [...currentPrimaryRow.elements] : [];
          const variantPrimary = variant.rows.find((r) => r.type === 'primary-nav') || variant.rows[0];
          const arrangementId = variantPrimary?.layout?.arrangementId || variant.compatibleArrangementIds?.[0];
          const arrangement = HEADER_ARRANGEMENTS.find((candidate) => candidate.id === arrangementId);
          const previewArrangement = variantPrimary?.layout?.responsiveArrangement
            ? JSON.parse(JSON.stringify(variantPrimary.layout.responsiveArrangement))
            : createResponsiveArrangement(
                currentPrimaryRow?.layout?.responsiveArrangement,
                arrangement?.layout || variantPrimary?.layout || {},
                { variantId: variant.id },
              );

          // CRITICAL: Presets ONLY change the header navbar (primary-nav) layout in preview!
          // Category bar, announcement bar, utility bar, and promo rows remain 100% UNTOUCHED!
          // All header items (logo, links, search, actions) remain 100% UNTOUCHED!
          // User styling & colors remain 100% UNTOUCHED!
          const previewRows: HeaderRow[] = baseRows.map((row: HeaderRow) => {
            if (row.type === 'primary-nav' && variantPrimary) {
              const defaultElements = createDefaultHeaderStack().find((r) => r.type === 'primary-nav')?.elements || [];
              let elementsToUse = currentElements.length > 0 ? [...currentElements] : [...row.elements];
              const hasNav = elementsToUse.some((e) => e.type === 'navigation' || e.type === 'primary-nav' || e.type === 'navigation-menu');
              const hasSearch = elementsToUse.some((e) => e.type === 'search');
              if (!hasNav) {
                const defNav = defaultElements.find((e) => e.type === 'navigation');
                if (defNav) elementsToUse.push(defNav);
              }
              if (!hasSearch) {
                const defSearch = defaultElements.find((e) => e.type === 'search');
                if (defSearch) elementsToUse.push(defSearch);
              }
              if (variant.id === 'prominent-search') {
                elementsToUse = elementsToUse.map((el) => {
                  if (el.type === 'search') {
                    return { ...el, isVisible: true, props: { ...el.props, mode: 'large-inline', showCategoryFilter: true } };
                  }
                  return el;
                });
              }
              if (variant.id !== 'minimalist-clean' && variant.id !== 'minimal-hamburger') {
                elementsToUse = elementsToUse.map((el) => {
                  if (el.type === 'navigation' || el.type === 'primary-nav' || el.type === 'navigation-menu') {
                    return { ...el, isVisible: true };
                  }
                  return el;
                });
              }

              const updatedRow: HeaderRow = {
                ...row,
                layout: {
                  ...row.layout,
                  alignment: variantPrimary.layout?.alignment ?? row.layout?.alignment,
                  logoPosition: variantPrimary.layout?.logoPosition ?? row.layout?.logoPosition,
                  navPosition: variantPrimary.layout?.navPosition ?? row.layout?.navPosition,
                  actionsPosition: variantPrimary.layout?.actionsPosition ?? row.layout?.actionsPosition,
                  container: variantPrimary.layout?.container ?? row.layout?.container,
                  height: row.layout?.height ?? 64,
                  isCompact: row.layout?.isCompact,
                  gap: variantPrimary.layout?.gap ?? row.layout?.gap,
                  paddingX: variantPrimary.layout?.paddingX ?? row.layout?.paddingX,
                  paddingY: variantPrimary.layout?.paddingY ?? row.layout?.paddingY,
                  responsiveArrangement: previewArrangement,
                  variantId: variant.id,
                  arrangementId: variantPrimary.layout?.arrangementId || row.layout?.arrangementId,
                },
                elements: elementsToUse,
                styling: {
                  ...row.styling,
                  ...variantPrimary?.styling,
                  radius: variantPrimary?.styling?.radius ?? 0,
                  shadow: variantPrimary?.styling?.shadow ?? 'none',
                  bgColor: row.styling.bgColor,
                  textColor: row.styling.textColor,
                  borderColor: row.styling.borderColor,
                  bgGradient: row.styling.bgGradient,
                  bgImage: row.styling.bgImage,
                  bgVideo: row.styling.bgVideo,
                },
              };
              return updatedRow;
            }
            return row;
          });

          set({
            presetPreview: {
              isActive: true,
              isHoverOnly,
              editorType: 'header',
              presetType: 'variant',
              presetId: variantId,
              presetName: variant.name,
              previewRows,
              previewSettings: {
                positioning: (variant.id === 'floating' ? 'floating' : (variant.id === 'transparent' ? 'overlay' : (variant.id === 'side-rail' ? 'sticky' : 'static'))) as any,
                heroAwareMode: (variant.id === 'transparent' ? 'transparent-hero' : 'standard') as any,
                ...variant.globalOverrides,
              },
              originalRows: baseRows,
              originalSettings: state.headerSettings,
            },
          });
        } else {
          const variant = FOOTER_VARIANTS.find((v) => v.id === variantId);
          if (!variant) return;
          set({
            presetPreview: {
              isActive: true,
              editorType: 'footer',
              presetType: 'variant',
              presetId: variantId,
              presetName: variant.name,
              previewRows: JSON.parse(JSON.stringify(variant.rows)),
              previewSettings: variant.globalOverrides || {},
              originalRows: state.footerRows,
              originalSettings: state.footerSettings,
            },
          });
        }
      },

      previewArrangement: (editorType, arrangementId) => {
        const state = get();
        if (editorType === 'header') {
          const arrangement = HEADER_ARRANGEMENTS.find((a) => a.id === arrangementId);
          if (!arrangement) return;
          const previewRows: HeaderRow[] = JSON.parse(JSON.stringify(state.headerRows));
          previewRows.forEach((r) => {
            if (r.type === 'primary-nav') {
              r.layout = {
                ...r.layout,
                ...arrangement.layout,
                arrangementId,
                responsiveArrangement: createResponsiveArrangement(r.layout?.responsiveArrangement, arrangement.layout),
              };
            }
          });
          set({
            presetPreview: {
              isActive: true,
              editorType: 'header',
              presetType: 'arrangement',
              presetId: arrangementId,
              presetName: arrangement.name,
              previewRows,
              previewSettings: {},
              originalRows: state.headerRows,
              originalSettings: state.headerSettings,
            },
          });
        } else {
          const arrangement = FOOTER_ARRANGEMENTS.find((a) => a.id === arrangementId);
          if (!arrangement) return;
          const previewRows: FooterRow[] = JSON.parse(JSON.stringify(state.footerRows));
          previewRows.forEach((r) => {
            if (r.type === 'navigation') {
              r.layout = { ...r.layout, ...arrangement.layout };
            }
          });
          set({
            presetPreview: {
              isActive: true,
              editorType: 'footer',
              presetType: 'arrangement',
              presetId: arrangementId,
              presetName: arrangement.name,
              previewRows,
              previewSettings: {},
              originalRows: state.footerRows,
              originalSettings: state.footerSettings,
            },
          });
        }
      },

      previewTemplate: (editorType, templateId) => {
        const state = get();
        if (editorType === 'header') {
          const template = HEADER_TEMPLATES.find((t) => t.id === templateId);
          if (!template) return;
          set({
            presetPreview: {
              isActive: true,
              editorType: 'header',
              presetType: 'template',
              presetId: templateId,
              presetName: template.name,
              previewRows: JSON.parse(JSON.stringify(template.rows)),
              previewSettings: template.globalOverrides || {},
              originalRows: state.headerRows,
              originalSettings: state.headerSettings,
            },
          });
        } else {
          const template = FOOTER_TEMPLATES.find((t) => t.id === templateId);
          if (!template) return;
          set({
            presetPreview: {
              isActive: true,
              editorType: 'footer',
              presetType: 'template',
              presetId: templateId,
              presetName: template.name,
              previewRows: JSON.parse(JSON.stringify(template.rows)),
              previewSettings: template.globalOverrides || {},
              originalRows: state.footerRows,
              originalSettings: state.footerSettings,
            },
          });
        }
      },

      cancelPreview: () => {
        set({ presetPreview: null });
      },

      applyVariant: (editorType, variantId, option) => {
        const state = get();
        if (editorType === 'header') {
          const variant = HEADER_VARIANTS.find((v) => v.id === variantId);
          if (!variant) return;

          // Preview and Apply must commit the same derived model. In the old
          // path Apply discarded responsiveArrangement, causing the applied
          // navbar to differ from the hover preview.
          get().previewVariant('header', variantId);
          const preview = get().presetPreview;
          if (!preview?.previewRows) return;
          set({
            headerRows: JSON.parse(JSON.stringify(preview.previewRows)) as HeaderRow[],
            headerSettings: { ...state.headerSettings, ...(preview.previewSettings as Partial<GlobalHeaderSettings>) },
            currentHeaderVariantId: variantId,
            presetPreview: null,
          });
          get().pushSnapshot(`Applied variant: ${variant.name} (${option})`);
        } else {
          const variant = FOOTER_VARIANTS.find((v) => v.id === variantId);
          if (!variant) return;

          const newRows = JSON.parse(JSON.stringify(variant.rows)) as FooterRow[];

          set({
            footerRows: newRows,
            footerSettings: { ...state.footerSettings, ...variant.globalOverrides },
            currentFooterVariantId: variantId,
            presetPreview: null,
          });
          get().pushSnapshot(`Applied variant: ${variant.name} (${option})`);
        }
      },

      applyArrangement: (editorType, arrangementId, _option) => {
        const state = get();
        if (editorType === 'header') {
          const arrangement = HEADER_ARRANGEMENTS.find((a) => a.id === arrangementId);
          if (!arrangement) return;

          const defaultElements = createDefaultHeaderStack().find((r) => r.type === 'primary-nav')?.elements || [];

          const updatedRows: HeaderRow[] = state.headerRows.map((r) => {
            if (r.type === 'primary-nav') {
              let updatedElements = [...r.elements];
              const hasNav = updatedElements.some((e) => e.type === 'navigation' || e.type === 'primary-nav' || e.type === 'navigation-menu');
              const hasSearch = updatedElements.some((e) => e.type === 'search');
              const hasLogo = updatedElements.some((e) => e.type === 'logo');
              const hasActions = updatedElements.some((e) => e.type === 'actions' || e.type === 'action-group');

              if (!hasLogo) {
                const defLogo = defaultElements.find((e) => e.type === 'logo');
                if (defLogo) updatedElements.unshift(defLogo);
              }
              if (!hasNav) {
                const defNav = defaultElements.find((e) => e.type === 'navigation');
                if (defNav) updatedElements.push(defNav);
              }
              if (!hasSearch) {
                const defSearch = defaultElements.find((e) => e.type === 'search');
                if (defSearch) updatedElements.push(defSearch);
              }
              if (!hasActions) {
                const defActions = defaultElements.find((e) => e.type === 'actions');
                if (defActions) updatedElements.push(defActions);
              }

              const isSearchHub = arrangementId === 'search-center' || arrangement.layout?.searchPosition === 'center' || arrangement.layout?.responsiveArrangement?.desktop?.center?.includes('search');
              if (isSearchHub) {
                updatedElements = updatedElements.map((el) => {
                  if (el.type === 'search') {
                    return {
                      ...el,
                      isVisible: true,
                      props: {
                        ...el.props,
                        mode: 'large-inline',
                        placeholder: el.props?.placeholder || 'Search products, collections, brands...',
                        showCategoryFilter: true,
                      },
                    };
                  }
                  return el;
                });
              }

              if (arrangementId !== 'hamburger-right') {
                updatedElements = updatedElements.map((el) => {
                  if (el.type === 'navigation' || el.type === 'primary-nav' || el.type === 'navigation-menu') {
                    return { ...el, isVisible: true };
                  }
                  return el;
                });
              }

              const nextResponsiveArrangement = arrangement.layout?.responsiveArrangement
                ? JSON.parse(JSON.stringify(arrangement.layout.responsiveArrangement))
                : createResponsiveArrangement(r.layout?.responsiveArrangement, arrangement.layout, { variantId: r.layout?.variantId });

              return {
                ...r,
                layout: {
                  ...r.layout,
                  ...arrangement.layout,
                  arrangementId,
                  responsiveArrangement: nextResponsiveArrangement,
                },
                elements: updatedElements,
              };
            }
            return r;
          });
          set({
            headerRows: updatedRows,
            currentHeaderArrangementId: arrangementId,
            presetPreview: null,
          });
          get().pushSnapshot(`Applied arrangement: ${arrangement.name}`);
        } else {
          const arrangement = FOOTER_ARRANGEMENTS.find((a) => a.id === arrangementId);
          if (!arrangement) return;

          const updatedRows: FooterRow[] = state.footerRows.map((r) => {
            if (r.type === 'navigation') {
              return { ...r, layout: { ...r.layout, ...arrangement.layout } };
            }
            return r;
          });
          set({
            footerRows: updatedRows,
            currentFooterArrangementId: arrangementId,
            presetPreview: null,
          });
          get().pushSnapshot(`Applied arrangement: ${arrangement.name}`);
        }
      },

      applyTemplate: (editorType, templateId, option) => {
        const state = get();
        if (editorType === 'header') {
          const template = HEADER_TEMPLATES.find((t) => t.id === templateId);
          if (!template) return;

          const newRows = JSON.parse(JSON.stringify(template.rows)) as HeaderRow[];

          if (option === 'keep-content') {
            const currentPrimary = state.headerRows.find((r) => r.type === 'primary-nav');
            const newPrimary = newRows.find((r) => r.type === 'primary-nav');
            if (currentPrimary && newPrimary) {
              const currentLogo = currentPrimary.elements.find((e) => e.type === 'logo');
              const newLogo = newPrimary.elements.find((e) => e.type === 'logo');
              if (currentLogo && newLogo && currentLogo.props?.text && currentLogo.props.text !== 'BillionBiz') {
                newLogo.props.text = currentLogo.props.text;
              }
              if (currentLogo && newLogo && currentLogo.props?.imageUrl) {
                newLogo.props.imageUrl = currentLogo.props.imageUrl;
                newLogo.props.logoType = currentLogo.props.logoType || 'image';
              }
            }
          }

          set({
            headerRows: newRows,
            headerSettings: { ...state.headerSettings, ...template.globalOverrides },
            currentHeaderVariantId: template.variantId,
            currentHeaderArrangementId: template.arrangementId,
            presetPreview: null,
          });
          get().pushSnapshot(`Applied template: ${template.name} (${option})`);
        } else {
          const treeTpl = FOOTER_TREE_TEMPLATES.find((t) => t.id === templateId);
          if (treeTpl) {
            get().applyFooterTreeTemplate(treeTpl.id);
            set({ presetPreview: null });
            return;
          }

          const template = FOOTER_TEMPLATES.find((t) => t.id === templateId);
          if (!template) return;

          const newRows = JSON.parse(JSON.stringify(template.rows)) as FooterRow[];

          set({
            footerRows: newRows,
            footerSettings: { ...state.footerSettings, ...template.globalOverrides },
            currentFooterVariantId: template.variantId,
            currentFooterArrangementId: template.arrangementId,
            presetPreview: null,
          });
          get().pushSnapshot(`Applied template: ${template.name} (${option})`);
        }
      },

      stagePresetSelection: ({ editorType, variantId, arrangementId, templateId, themePreset, stylingUpdates }) => {
        const state = get();
        const currentPreview = state.presetPreview;
        const targetVariantId = variantId ?? currentPreview?.stagedVariantId ?? (editorType === 'header' ? 'modern-commerce' : 'classic-multi-column');
        const targetArrangementId = arrangementId ?? currentPreview?.stagedArrangementId;
        const targetTemplateId = templateId ?? currentPreview?.stagedTemplateId;
        const targetThemePreset = themePreset ?? currentPreview?.stagedThemePreset;

        if (editorType === 'header') {
          let baseRows: HeaderRow[];
          let baseSettings: Partial<GlobalHeaderSettings> = {};

          if (templateId) {
            const tpl = HEADER_TEMPLATES.find((t) => t.id === templateId);
            baseRows = tpl ? JSON.parse(JSON.stringify(tpl.rows)) : JSON.parse(JSON.stringify(state.headerRows));
            if (tpl?.globalOverrides) baseSettings = { ...tpl.globalOverrides };
          } else if (variantId) {
            const v = HEADER_VARIANTS.find((item) => item.id === variantId);
            baseRows = v ? JSON.parse(JSON.stringify(v.rows)) : JSON.parse(JSON.stringify(state.headerRows));
            if (v?.globalOverrides) baseSettings = { ...v.globalOverrides };
          } else if (currentPreview?.previewRows) {
            baseRows = JSON.parse(JSON.stringify(currentPreview.previewRows)) as HeaderRow[];
            baseSettings = { ...(currentPreview.previewSettings as Partial<GlobalHeaderSettings>) };
          } else {
            baseRows = JSON.parse(JSON.stringify(state.headerRows));
          }

          // Apply arrangement layout override if specified
          if (targetArrangementId) {
            const arr = HEADER_ARRANGEMENTS.find((a) => a.id === targetArrangementId);
            if (arr) {
              baseRows.forEach((r) => {
                if (r.type === 'primary-nav') {
                  const nextResponsiveArrangement = arr.layout?.responsiveArrangement
                    ? JSON.parse(JSON.stringify(arr.layout.responsiveArrangement))
                    : createResponsiveArrangement(r.layout?.responsiveArrangement, arr.layout);
                  r.layout = { ...r.layout, ...arr.layout, responsiveArrangement: nextResponsiveArrangement };

                  const isSearchHub = targetArrangementId === 'search-center' || arr.layout?.searchPosition === 'center' || arr.layout?.responsiveArrangement?.desktop?.center?.includes('search');
                  if (isSearchHub) {
                    r.elements = r.elements.map((el) => {
                      if (el.type === 'search') {
                        return { ...el, isVisible: true, props: { ...el.props, mode: 'large-inline', showCategoryFilter: true } };
                      }
                      return el;
                    });
                  }
                  if (targetArrangementId !== 'hamburger-right') {
                    r.elements = r.elements.map((el) => {
                      if (el.type === 'navigation' || el.type === 'primary-nav' || el.type === 'navigation-menu') {
                        return { ...el, isVisible: true };
                      }
                      return el;
                    });
                  }
                }
              });
            }
          }

          // Apply theme styling overrides
          if (targetThemePreset) {
            baseRows.forEach((r) => {
              if (targetThemePreset === 'luxury') {
                r.styling = { ...r.styling, bgColor: r.type === 'announcement' ? '#18181b' : '#09090b', textColor: '#f4f4f5', borderColor: '#27272a' };
              } else if (targetThemePreset === 'dark-saas') {
                r.styling = { ...r.styling, bgColor: r.type === 'announcement' ? '#1e1b4b' : '#0b0f19', textColor: '#f8fafc', borderColor: '#1e293b' };
              } else if (targetThemePreset === 'ocean') {
                r.styling = { ...r.styling, bgColor: r.type === 'announcement' ? '#075985' : '#0c4a6e', textColor: '#f0f9ff', borderColor: '#0369a1' };
              } else if (targetThemePreset === 'warm') {
                r.styling = { ...r.styling, bgColor: r.type === 'announcement' ? '#292524' : '#1c1917', textColor: '#fafaf9', borderColor: '#44403c' };
              } else if (targetThemePreset === 'minimal') {
                r.styling = { ...r.styling, bgColor: '#ffffff', textColor: '#0f172a', borderColor: '#e2e8f0' };
              }
            });
          }

          if (stylingUpdates) {
            baseRows.forEach((r) => {
              if (stylingUpdates.bgColor) r.styling = { ...r.styling, bgColor: stylingUpdates.bgColor };
              if (stylingUpdates.textColor) r.styling = { ...r.styling, textColor: stylingUpdates.textColor };
              if (stylingUpdates.borderColor) r.styling = { ...r.styling, borderColor: stylingUpdates.borderColor };
            });
          }

          set({
            presetPreview: {
              isActive: true,
              editorType: 'header',
              presetType: 'staged',
              presetId: targetTemplateId || targetVariantId,
              presetName: targetTemplateId || targetVariantId,
              previewRows: baseRows,
              previewSettings: baseSettings,
              originalRows: currentPreview?.originalRows || state.headerRows,
              originalSettings: currentPreview?.originalSettings || state.headerSettings,
              stagedVariantId: targetVariantId,
              stagedArrangementId: targetArrangementId,
              stagedTemplateId: targetTemplateId,
              stagedThemePreset: targetThemePreset,
            },
          });
        } else {
          // Footer Editor
          let baseRows: FooterRow[];
          let baseSettings: Partial<GlobalFooterSettings> = {};

          if (templateId) {
            const treeTpl = FOOTER_TREE_TEMPLATES.find((t) => t.id === templateId);
            if (treeTpl) {
              set({
                pendingFooterTemplateId: templateId,
                pendingFooterTree: JSON.parse(JSON.stringify(treeTpl.tree)),
              });
            }
            const tpl = FOOTER_TEMPLATES.find((t) => t.id === templateId);
            baseRows = tpl ? JSON.parse(JSON.stringify(tpl.rows)) : JSON.parse(JSON.stringify(state.footerRows));
            if (treeTpl && baseRows.length > 0) {
              baseRows[0].children = JSON.parse(JSON.stringify(treeTpl.tree));
            }
            if (tpl?.globalOverrides) baseSettings = { ...tpl.globalOverrides };
          } else if (variantId) {
            const v = FOOTER_VARIANTS.find((item) => item.id === variantId);
            baseRows = v ? JSON.parse(JSON.stringify(v.rows)) : JSON.parse(JSON.stringify(state.footerRows));
            if (v?.globalOverrides) baseSettings = { ...v.globalOverrides };
          } else if (currentPreview?.previewRows) {
            baseRows = JSON.parse(JSON.stringify(currentPreview.previewRows)) as FooterRow[];
            baseSettings = { ...(currentPreview.previewSettings as Partial<GlobalFooterSettings>) };
          } else {
            baseRows = JSON.parse(JSON.stringify(state.footerRows));
          }

          if (targetArrangementId) {
            const arr = FOOTER_ARRANGEMENTS.find((a) => a.id === targetArrangementId);
            if (arr) {
              baseRows.forEach((r) => {
                if (r.type === 'navigation') {
                  r.layout = { ...r.layout, ...arr.layout };
                }
              });
            }
          }

          if (targetThemePreset) {
            baseRows.forEach((r) => {
              if (targetThemePreset === 'luxury') {
                r.styling = { ...r.styling, bgColor: '#09090b', textColor: '#f4f4f5', borderColor: '#27272a' };
              } else if (targetThemePreset === 'dark-saas') {
                r.styling = { ...r.styling, bgColor: '#0b0f19', textColor: '#f8fafc', borderColor: '#1e293b' };
              } else if (targetThemePreset === 'ocean') {
                r.styling = { ...r.styling, bgColor: '#0c4a6e', textColor: '#f0f9ff', borderColor: '#0369a1' };
              } else if (targetThemePreset === 'warm') {
                r.styling = { ...r.styling, bgColor: '#1c1917', textColor: '#fafaf9', borderColor: '#44403c' };
              } else if (targetThemePreset === 'minimal') {
                r.styling = { ...r.styling, bgColor: '#ffffff', textColor: '#0f172a', borderColor: '#e2e8f0' };
              }
            });
          }

          set({
            presetPreview: {
              isActive: true,
              editorType: 'footer',
              presetType: 'staged',
              presetId: targetTemplateId || targetVariantId,
              presetName: targetTemplateId || targetVariantId,
              previewRows: baseRows,
              previewSettings: baseSettings,
              originalRows: currentPreview?.originalRows || state.footerRows,
              originalSettings: currentPreview?.originalSettings || state.footerSettings,
              stagedVariantId: targetVariantId,
              stagedArrangementId: targetArrangementId,
              stagedTemplateId: targetTemplateId,
              stagedThemePreset: targetThemePreset,
            },
          });
        }
      },

      commitStagedPreset: (editorType, option = 'keep-content') => {
        const state = get();
        const preview = state.presetPreview;
        if (!preview) return;

        if (editorType === 'header') {
          const newRows = JSON.parse(JSON.stringify(preview.previewRows)) as HeaderRow[];

          if (option === 'keep-content') {
            const currentPrimary = state.headerRows.find((r) => r.type === 'primary-nav');
            const newPrimary = newRows.find((r) => r.type === 'primary-nav');
            if (currentPrimary && newPrimary) {
              const currentLogo = currentPrimary.elements.find((e) => e.type === 'logo');
              const newLogo = newPrimary.elements.find((e) => e.type === 'logo');
              if (currentLogo && newLogo && currentLogo.props?.text && currentLogo.props.text !== 'BillionBiz') {
                newLogo.props.text = currentLogo.props.text;
              }
              if (currentLogo && newLogo && currentLogo.props?.imageUrl) {
                newLogo.props.imageUrl = currentLogo.props.imageUrl;
                newLogo.props.logoType = currentLogo.props.logoType || 'image';
              }
            }
          }

          set({
            headerRows: newRows,
            headerSettings: { ...state.headerSettings, ...(preview.previewSettings as any) },
            currentHeaderVariantId: preview.stagedVariantId || null,
            currentHeaderArrangementId: preview.stagedArrangementId || null,
            presetPreview: null,
          });
          get().pushSnapshot(`Applied header template & theme: ${preview.presetName}`);
        } else {
          if (preview.stagedTemplateId) {
            const treeTpl = FOOTER_TREE_TEMPLATES.find((t) => t.id === preview.stagedTemplateId);
            if (treeTpl) {
              get().applyFooterTreeTemplate(treeTpl.id);
              set({ presetPreview: null });
              return;
            }
          }

          const newRows = JSON.parse(JSON.stringify(preview.previewRows)) as FooterRow[];

          set({
            footerRows: newRows,
            footerSettings: { ...state.footerSettings, ...(preview.previewSettings as any) },
            currentFooterVariantId: preview.stagedVariantId || null,
            currentFooterArrangementId: preview.stagedArrangementId || null,
            presetPreview: null,
          });
          get().pushSnapshot(`Applied footer template & theme: ${preview.presetName}`);
        }
      },

      discardStagedPreset: () => {
        set({ presetPreview: null });
      },

      resetEditorContextStore: () => {
        set({
          editorType: 'page',
          selectedTarget: { type: 'none' },
          activeTab: 'style',
          viewport: 'desktop',
          zoom: 100,
          previewState: 'normal',
          density: 'comfortable',
          sidebarActiveTab: 'sections',
          treeViewMode: 'tree',
          headerRows: createDefaultHeaderStack(),
          headerSettings: createDefaultHeaderGlobalSettings(),
          footerRows: createDefaultFooterStack(),
          footerSettings: createDefaultFooterGlobalSettings(),
          history: createInitialHistoryState(50),
          auditResult: null,
          isCommandPaletteOpen: false,
          isAiDrawerOpen: false,
          isPresetModalOpen: false,
          pendingPreset: null,
          isSavePresetModalOpen: false,
          userPresets: [],
          presetPreview: null,
          footerTree: createDefaultFooterTree(),
          selectedFooterNodeId: null,
          footerRightSidebarMode: 'inspector',
          pendingFooterTemplateId: null,
          pendingFooterTree: null,
          footerExpandedNodeIds: [],
          isFooterComponentPickerOpen: false,
        });
        useEditorContextStore.persist?.clearStorage?.();
      },
    }),
    {
      name: `billionbiz-editor-context-v${PLATFORM_VERSION.replace(/\./g, '_')}`,
      partialize: (state) => ({
        headerRows: state.headerRows,
        headerSettings: state.headerSettings,
        footerRows: state.footerRows,
        footerSettings: state.footerSettings,
        footerTree: state.footerTree,
        userPresets: state.userPresets,
        density: state.density,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  (window as any).__editorContextStore = useEditorContextStore;
  if (sessionStorage.getItem('billionbiz_version_just_upgraded') === 'true') {
    useEditorContextStore.getState().resetEditorContextStore();
  }
}
