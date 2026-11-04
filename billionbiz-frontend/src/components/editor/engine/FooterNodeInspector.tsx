// ============================================================
// FOOTER NODE INSPECTOR — Right Sidebar Inspector & Templates
// Complete inspector for Footer Root, recursive Groups, and
// all Component/Block types, plus the Template Selection Library.
// ============================================================

import React, { useState } from 'react';
import {
  Layers,
  LayoutGrid,
  Columns,
  Rows,
  Smartphone,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { findNodeById } from './footerTreeEngine';
import { FOOTER_TREE_TEMPLATES } from './footerTreeTemplates';
import type { FooterRowLayout, FooterRowStyling } from './types';
import type {
  FooterTreeNode,
  MainAxisDistribution,
  CrossAxisAlignment,
  SizingMode,
  BgType,
} from './footerTreeTypes';

// ─── TABS COMPONENT ──────────────────────────────────────────

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const InspectorTabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => (
  <div
    style={{
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      padding: '0 8px',
    }}
  >
    {tabs.map((tab) => {
      const active = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '10px 14px',
            fontSize: '12px',
            fontWeight: active ? 600 : 500,
            color: active ? '#2563eb' : '#64748b',
            border: 'none',
            borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

// ─── TEMPLATE SELECTION VIEW ─────────────────────────────────

const FooterTemplateGallery: React.FC = () => {
  const {
    pendingFooterTemplateId,
    previewFooterTemplate,
    applyPendingFooterTemplate,
    applyFooterTreeTemplate,
    cancelPendingFooterTemplate,
    setFooterRightSidebarMode,
  } = useEditorContextStore();

  const [confirmApply, setConfirmApply] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
            Footer Templates
          </h3>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Select a layout to preview. Global theme colors and fonts will be preserved.
          </p>
        </div>
        <button
          onClick={() => {
            cancelPendingFooterTemplate();
            setFooterRightSidebarMode('inspector');
          }}
          style={{
            padding: '6px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Pending Banner if any */}
      {pendingFooterTemplateId && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#eff6ff',
            borderBottom: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>
              Previewing Template
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => cancelPendingFooterTemplate()}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => setConfirmApply(true)}
              style={{
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Apply Template
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmApply && (
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} color="#dc2626" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#991b1b' }}>
              Replace current footer layout?
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: '#b91c1c' }}>
            This will update the footer components with the selected template. Your store theme styles and colors will remain intact.
          </p>
          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
            <button
              onClick={() => setConfirmApply(false)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid #fca5a5',
                backgroundColor: '#ffffff',
                color: '#7f1d1d',
                cursor: 'pointer',
              }}
            >
              No, Keep Current
            </button>
            <button
              onClick={() => {
                applyPendingFooterTemplate();
                setConfirmApply(false);
              }}
              style={{
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Yes, Apply
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {FOOTER_TREE_TEMPLATES.map((tpl) => {
          const isSelected = pendingFooterTemplateId === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => previewFooterTemplate(tpl.id)}
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: isSelected ? '#f8faff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.backgroundColor = '#fafafa';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {tpl.name}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#64748b',
                    backgroundColor: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {tpl.category}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                {tpl.description}
              </p>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {tpl.tree.length} top container{tpl.tree.length !== 1 ? 's' : ''}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      previewFooterTemplate(tpl.id);
                    }}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#2563eb' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {isSelected ? 'Previewing' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyFooterTreeTemplate(tpl.id);
                    }}
                    style={{
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: 'none',
                      backgroundColor: isSelected ? '#16a34a' : '#2563eb',
                      color: '#ffffff',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 6px rgba(22, 163, 74, 0.3)' : '0 2px 6px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    {isSelected ? '✓ Apply' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── FOOTER ROOT INSPECTOR ───────────────────────────────────

const DEFAULT_ROOT_LAYOUT: FooterRowLayout = {
  container: 'constrained',
  columns: 4,
  gap: 40,
  alignment: 'stretch',
  verticalAlignment: 'top',
  paddingX: 32,
  paddingY: 64,
};

const DEFAULT_ROOT_STYLING: FooterRowStyling = {
  bgType: 'theme',
  bgColor: '#ffffff',
  textColor: '#0f172a',
  borderTop: false,
  borderBottom: false,
  borderColor: '#e2e8f0',
  dividerStyle: 'solid',
  shadow: 'none',
  radius: 0,
  fontSize: 14,
};

const FooterRootInspector: React.FC = () => {
  const { footerRows, updateFooterRow, openFooterComponentPicker } = useEditorContextStore();
  const rootRow = footerRows.find((r) => r.id === 'footer-main') || footerRows[0];

  const layout = rootRow?.layout || DEFAULT_ROOT_LAYOUT;
  const styling = rootRow?.styling || DEFAULT_ROOT_STYLING;

  const handleUpdateLayout = (updates: Partial<FooterRowLayout>) => {
    if (rootRow) {
      updateFooterRow(rootRow.id, { layout: { ...layout, ...updates } });
    }
  };

  const handleUpdateStyling = (updates: Partial<FooterRowStyling>) => {
    if (rootRow) {
      updateFooterRow(rootRow.id, { styling: { ...styling, ...updates } });
    }
  };

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#2563eb" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
            Footer Container
          </h3>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
          Global settings for the root footer section.
        </p>
      </div>

      {/* Add Component to Root Button */}
      <button
        onClick={() => openFooterComponentPicker(null)}
        style={{
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid #bfdbfe',
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dbeafe')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
      >
        <Plus size={16} />
        Add Group or Component
      </button>

      {/* Container Layout Mode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Container Width Mode
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {(['constrained', 'full'] as const).map((mode) => {
            const active = (layout.container || 'constrained') === mode;
            return (
              <button
                key={mode}
                onClick={() => handleUpdateLayout({ container: mode })}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: active ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: active ? '#eff6ff' : '#ffffff',
                  color: active ? '#1d4ed8' : '#475569',
                  fontSize: '12px',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Padding */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Vertical Padding (Y)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="range"
            min={16}
            max={120}
            step={4}
            value={layout.paddingY || 64}
            onChange={(e) => handleUpdateLayout({ paddingY: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', width: '40px', textAlign: 'right' }}>
            {layout.paddingY || 64}px
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Horizontal Padding (X)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="range"
            min={0}
            max={80}
            step={4}
            value={layout.paddingX || 32}
            onChange={(e) => handleUpdateLayout({ paddingX: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', width: '40px', textAlign: 'right' }}>
            {layout.paddingX || 32}px
          </span>
        </div>
      </div>

      {/* Background & Colors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Background Color
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="color"
            value={styling.bgColor || '#ffffff'}
            onChange={(e) => handleUpdateStyling({ bgColor: e.target.value, bgType: 'custom' })}
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          />
          <input
            type="text"
            value={styling.bgColor || '#ffffff'}
            onChange={(e) => handleUpdateStyling({ bgColor: e.target.value, bgType: 'custom' })}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#0f172a',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Text Color
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="color"
            value={styling.textColor || '#0f172a'}
            onChange={(e) => handleUpdateStyling({ textColor: e.target.value })}
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          />
          <input
            type="text"
            value={styling.textColor || '#0f172a'}
            onChange={(e) => handleUpdateStyling({ textColor: e.target.value })}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#0f172a',
            }}
          />
        </div>
      </div>

      {/* Border Top / Bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Dividers
        </label>
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!styling.borderTop}
              onChange={(e) => handleUpdateStyling({ borderTop: e.target.checked })}
            />
            Top Border
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!styling.borderBottom}
              onChange={(e) => handleUpdateStyling({ borderBottom: e.target.checked })}
            />
            Bottom Border
          </label>
        </div>
      </div>
    </div>
  );
};

// ─── RECURSIVE GROUP INSPECTOR ───────────────────────────────

interface GroupInspectorProps {
  node: FooterTreeNode;
}

const GroupInspector: React.FC<GroupInspectorProps> = ({ node }) => {
  const {
    updateFooterTreeNodeLayout,
    updateFooterTreeNodeStyling,
    updateFooterTreeNodeResponsive,
    openFooterComponentPicker,
  } = useEditorContextStore();

  const [activeTab, setActiveTab] = useState<'layout' | 'style' | 'spacing' | 'responsive'>('layout');

  const layout = node.layout || {
    direction: 'horizontal',
    width: { mode: 'fill' },
    height: { mode: 'fit' },
    mainAxisDistribution: 'start',
    crossAxisAlignment: 'stretch',
    gap: 24,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  const styling = node.styling || { bgType: 'inherit' };
  const responsive = node.responsive || {};

  const tabs = [
    { id: 'layout', label: 'Layout' },
    { id: 'style', label: 'Style' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'responsive', label: 'Responsive' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Node Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LayoutGrid size={16} />
          </div>
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                padding: '2px 4px',
              }}
            >
              Group
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', paddingLeft: '4px' }}>
              Group Container ({node.children?.length || 0} items)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => openFooterComponentPicker(node.id)}
            title="Add child component"
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <InspectorTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as any)}
      />

      {/* Tab Contents */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* ─── TAB 1: LAYOUT ─── */}
        {activeTab === 'layout' && (
          <>
            {/* Direction */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Direction
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => updateFooterTreeNodeLayout(node.id, { direction: 'horizontal' })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: layout.direction === 'horizontal' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: layout.direction === 'horizontal' ? '#eff6ff' : '#ffffff',
                    color: layout.direction === 'horizontal' ? '#1d4ed8' : '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Rows size={14} />
                  Horizontal (Row)
                </button>
                <button
                  onClick={() => updateFooterTreeNodeLayout(node.id, { direction: 'vertical' })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: layout.direction === 'vertical' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: layout.direction === 'vertical' ? '#eff6ff' : '#ffffff',
                    color: layout.direction === 'vertical' ? '#1d4ed8' : '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Columns size={14} />
                  Vertical (Column)
                </button>
              </div>
            </div>

            {/* Width Sizing Mode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Width Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {(['fit', 'fill', 'custom'] as SizingMode[]).map((mode) => {
                  const active = (layout.width?.mode || 'fill') === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() =>
                        updateFooterTreeNodeLayout(node.id, {
                          width: { ...layout.width, mode },
                        })
                      }
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: active ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: active ? '#eff6ff' : '#ffffff',
                        color: active ? '#1d4ed8' : '#475569',
                        fontSize: '11px',
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>

              {layout.width?.mode === 'custom' && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="number"
                    value={layout.width?.value || 300}
                    onChange={(e) =>
                      updateFooterTreeNodeLayout(node.id, {
                        width: { ...layout.width, value: Number(e.target.value) },
                      })
                    }
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                    }}
                  />
                  <select
                    value={layout.width?.unit || 'px'}
                    onChange={(e) =>
                      updateFooterTreeNodeLayout(node.id, {
                        width: { ...layout.width, unit: e.target.value as any },
                      })
                    }
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                    }}
                  >
                    <option value="px">px</option>
                    <option value="%">%</option>
                    <option value="rem">rem</option>
                  </select>
                </div>
              )}
            </div>

            {/* Height Sizing Mode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Height Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {(['fit', 'fill', 'custom'] as SizingMode[]).map((mode) => {
                  const active = (layout.height?.mode || 'fit') === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() =>
                        updateFooterTreeNodeLayout(node.id, {
                          height: { ...layout.height, mode },
                        })
                      }
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: active ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: active ? '#eff6ff' : '#ffffff',
                        color: active ? '#1d4ed8' : '#475569',
                        fontSize: '11px',
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Axis Distribution */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Main-Axis Distribution
              </label>
              <select
                value={layout.mainAxisDistribution || 'start'}
                onChange={(e) =>
                  updateFooterTreeNodeLayout(node.id, {
                    mainAxisDistribution: e.target.value as MainAxisDistribution,
                  })
                }
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="start">Start (Left / Top)</option>
                <option value="center">Center</option>
                <option value="end">End (Right / Bottom)</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
                <option value="space-evenly">Space Evenly</option>
              </select>
            </div>

            {/* Cross Axis Alignment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Cross-Axis Alignment
              </label>
              <select
                value={layout.crossAxisAlignment || 'stretch'}
                onChange={(e) =>
                  updateFooterTreeNodeLayout(node.id, {
                    crossAxisAlignment: e.target.value as CrossAxisAlignment,
                  })
                }
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="start">Start</option>
                <option value="center">Center</option>
                <option value="end">End</option>
                <option value="stretch">Stretch</option>
              </select>
            </div>

            {/* Wrap Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Wrap Children
              </label>
              <input
                type="checkbox"
                checked={!!layout.wrap}
                onChange={(e) => updateFooterTreeNodeLayout(node.id, { wrap: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
            </div>
          </>
        )}

        {/* ─── TAB 2: STYLE ─── */}
        {activeTab === 'style' && (
          <>
            {/* Background Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Background Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {(['inherit', 'color', 'gradient', 'image'] as BgType[]).map((type) => {
                  const active = (styling.bgType || 'inherit') === type;
                  return (
                    <button
                      key={type}
                      onClick={() => updateFooterTreeNodeStyling(node.id, { bgType: type })}
                      style={{
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: active ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: active ? '#eff6ff' : '#ffffff',
                        color: active ? '#1d4ed8' : '#475569',
                        fontSize: '11px',
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Background Color */}
            {styling.bgType === 'color' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                  Background Color
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={styling.bgColor || '#f8fafc'}
                    onChange={(e) => updateFooterTreeNodeStyling(node.id, { bgColor: e.target.value })}
                    style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    value={styling.bgColor || '#f8fafc'}
                    onChange={(e) => updateFooterTreeNodeStyling(node.id, { bgColor: e.target.value })}
                    style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>
            )}

            {/* Border Radius */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Border Radius
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={styling.borderRadius || 0}
                  onChange={(e) => updateFooterTreeNodeStyling(node.id, { borderRadius: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, width: '35px', textAlign: 'right' }}>
                  {styling.borderRadius || 0}px
                </span>
              </div>
            </div>

            {/* Border Width & Color */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Border Width
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={styling.borderWidth || 0}
                  onChange={(e) => updateFooterTreeNodeStyling(node.id, { borderWidth: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, width: '35px', textAlign: 'right' }}>
                  {styling.borderWidth || 0}px
                </span>
              </div>
            </div>

            {(styling.borderWidth || 0) > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                  Border Color
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={styling.borderColor || '#e2e8f0'}
                    onChange={(e) => updateFooterTreeNodeStyling(node.id, { borderColor: e.target.value })}
                    style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    value={styling.borderColor || '#e2e8f0'}
                    onChange={(e) => updateFooterTreeNodeStyling(node.id, { borderColor: e.target.value })}
                    style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── TAB 3: SPACING ─── */}
        {activeTab === 'spacing' && (
          <>
            {/* Gap */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Children Gap
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={4}
                  value={layout.gap ?? 24}
                  onChange={(e) => updateFooterTreeNodeLayout(node.id, { gap: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, width: '35px', textAlign: 'right' }}>
                  {layout.gap ?? 24}px
                </span>
              </div>
            </div>

            {/* Padding Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Padding (Top, Right, Bottom, Left)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Top</span>
                  <input
                    type="number"
                    value={layout.padding?.top ?? 0}
                    onChange={(e) =>
                      updateFooterTreeNodeLayout(node.id, {
                        padding: { ...layout.padding, top: Number(e.target.value) },
                      })
                    }
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Bottom</span>
                  <input
                    type="number"
                    value={layout.padding?.bottom ?? 0}
                    onChange={(e) =>
                      updateFooterTreeNodeLayout(node.id, {
                        padding: { ...layout.padding, bottom: Number(e.target.value) },
                      })
                    }
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Left</span>
                  <input
                    type="number"
                    value={layout.padding?.left ?? 0}
                    onChange={(e) =>
                      updateFooterTreeNodeLayout(node.id, {
                        padding: { ...layout.padding, left: Number(e.target.value) },
                      })
                    }
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Right</span>
                  <input
                    type="number"
                    value={layout.padding?.right ?? 0}
                    onChange={(e) =>
                      updateFooterTreeNodeLayout(node.id, {
                        padding: { ...layout.padding, right: Number(e.target.value) },
                      })
                    }
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── TAB 4: RESPONSIVE ─── */}
        {activeTab === 'responsive' && (
          <>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                <Smartphone size={16} color="#2563eb" />
                Mobile Overrides (&lt; 768px)
              </div>

              {/* Mobile Direction */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                  Mobile Direction
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() =>
                      updateFooterTreeNodeResponsive(node.id, {
                        mobile: { ...responsive.mobile, direction: 'vertical' },
                      })
                    }
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      border:
                        (responsive.mobile?.direction || 'vertical') === 'vertical'
                          ? '1.5px solid #2563eb'
                          : '1px solid #cbd5e1',
                      backgroundColor:
                        (responsive.mobile?.direction || 'vertical') === 'vertical'
                          ? '#eff6ff'
                          : '#ffffff',
                      color:
                        (responsive.mobile?.direction || 'vertical') === 'vertical'
                          ? '#1d4ed8'
                          : '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Column (Stack)
                  </button>
                  <button
                    onClick={() =>
                      updateFooterTreeNodeResponsive(node.id, {
                        mobile: { ...responsive.mobile, direction: 'horizontal' },
                      })
                    }
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      border:
                        responsive.mobile?.direction === 'horizontal'
                          ? '1.5px solid #2563eb'
                          : '1px solid #cbd5e1',
                      backgroundColor:
                        responsive.mobile?.direction === 'horizontal' ? '#eff6ff' : '#ffffff',
                      color:
                        responsive.mobile?.direction === 'horizontal' ? '#1d4ed8' : '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Row (Horizontal)
                  </button>
                </div>
              </div>

              {/* Mobile Gap */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                  Mobile Gap
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={4}
                    value={responsive.mobile?.gap ?? layout.gap ?? 16}
                    onChange={(e) =>
                      updateFooterTreeNodeResponsive(node.id, {
                        mobile: { ...responsive.mobile, gap: Number(e.target.value) },
                      })
                    }
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 600, width: '30px', textAlign: 'right' }}>
                    {responsive.mobile?.gap ?? layout.gap ?? 16}px
                  </span>
                </div>
              </div>

              {/* Mobile Visibility */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                  Visible on Mobile
                </label>
                <input
                  type="checkbox"
                  checked={responsive.mobile?.visible !== false}
                  onChange={(e) =>
                    updateFooterTreeNodeResponsive(node.id, {
                      mobile: { ...responsive.mobile, visible: e.target.checked },
                    })
                  }
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── LEAF COMPONENT INSPECTOR ────────────────────────────────

interface ComponentInspectorProps {
  node: FooterTreeNode;
}

const ComponentInspector: React.FC<ComponentInspectorProps> = ({ node }) => {
  const {
    updateFooterTreeNode,
    updateFooterTreeNodeProps,
  } = useEditorContextStore();

  const props = node.props || {};

  const handlePropChange = (key: string, value: any) => {
    updateFooterTreeNodeProps(node.id, { [key]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Node Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div>
            <input
              type="text"
              value={node.name}
              onChange={(e) => updateFooterTreeNode(node.id, { name: e.target.value })}
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                border: '1px solid transparent',
                borderRadius: '4px',
                padding: '2px 4px',
                outline: 'none',
                maxWidth: '160px',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'transparent')}
            />
            <div style={{ fontSize: '11px', color: '#64748b', paddingLeft: '4px', textTransform: 'capitalize' }}>
              {node.nodeType.replace('-', ' ')} Component
            </div>
          </div>
        </div>

      </div>

      {/* Component Specific Settings */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* HEADING */}
        {node.nodeType === 'heading' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Text</label>
              <input
                type="text"
                value={props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Heading Level</label>
              <select
                value={props.level || 'h3'}
                onChange={(e) => handlePropChange('level', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Font Size (px)</label>
              <input
                type="number"
                value={props.fontSize || 16}
                onChange={(e) => handlePropChange('fontSize', Number(e.target.value))}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Alignment</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    onClick={() => handlePropChange('alignment', align)}
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      border: (props.alignment || 'left') === align ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: (props.alignment || 'left') === align ? '#eff6ff' : '#ffffff',
                      color: (props.alignment || 'left') === align ? '#1d4ed8' : '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TEXT */}
        {node.nodeType === 'text' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Content</label>
              <textarea
                rows={4}
                value={props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Font Size (px)</label>
              <input
                type="number"
                value={props.fontSize || 14}
                onChange={(e) => handlePropChange('fontSize', Number(e.target.value))}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
          </>
        )}

        {/* LOGO & BRANDNAME */}
        {node.nodeType === 'logo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Display Format */}
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
                  const isSelected = (props.logoType || 'both') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handlePropChange('logoType', opt.id)}
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

            {/* Logo Image Preview & Uploader */}
            {props.logoType !== 'text' && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
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
                    {props.imageUrl || props.image || props.src ? (
                      <img
                        src={props.imageUrl || props.image || props.src}
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
                                  handlePropChange('imageUrl', ev.target.result as string);
                                  handlePropChange('image', ev.target.result as string);
                                  handlePropChange('src', ev.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {(props.imageUrl || props.image || props.src) && (
                        <button
                          type="button"
                          onClick={() => {
                            handlePropChange('imageUrl', '');
                            handlePropChange('image', '');
                            handlePropChange('src', '');
                          }}
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
                    value={props.imageUrl || props.image || props.src || ''}
                    onChange={(e) => {
                      handlePropChange('imageUrl', e.target.value);
                      handlePropChange('image', e.target.value);
                      handlePropChange('src', e.target.value);
                    }}
                    placeholder="Or enter image URL (https://...)"
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            {/* Brand Name Text (if brand name visible) */}
            {props.logoType !== 'image' && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                    Brand Name Layout
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIsTwo = !props.isTwoLines;
                      handlePropChange('isTwoLines', nextIsTwo);
                      if (nextIsTwo && !props.upperText) {
                        handlePropChange('upperText', props.text || 'BILLION');
                        handlePropChange('lowerText', props.lowerText || 'BIZ COUTURE');
                      }
                    }}
                    style={{
                      fontSize: '11px',
                      color: '#2563eb',
                      background: props.isTwoLines ? '#eff6ff' : '#f8fafc',
                      border: `1px solid ${props.isTwoLines ? '#bfdbfe' : '#e2e8f0'}`,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {props.isTwoLines ? '✓ Two Lines Active' : '+ Switch to 2 Lines'}
                  </button>
                </div>

                {!props.isTwoLines ? (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Brand Name Text</span>
                    <input
                      type="text"
                      value={props.brandName || props.text || 'BillionBiz'}
                      onChange={(e) => {
                        handlePropChange('text', e.target.value);
                        handlePropChange('brandName', e.target.value);
                        handlePropChange('upperText', e.target.value);
                      }}
                      placeholder="e.g. BillionBiz"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>First Line (Primary)</span>
                      <input
                        type="text"
                        value={props.upperText || 'BILLION'}
                        onChange={(e) => {
                          handlePropChange('upperText', e.target.value);
                          handlePropChange('text', e.target.value);
                        }}
                        placeholder="BILLION"
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Second Line (Secondary / Tagline)</span>
                      <input
                        type="text"
                        value={props.lowerText || 'BIZ COUTURE'}
                        onChange={(e) => handlePropChange('lowerText', e.target.value)}
                        placeholder="BIZ COUTURE"
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Destination Link */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                Destination Link
              </label>
              <input
                type="text"
                value={props.url || props.link || '/'}
                onChange={(e) => {
                  handlePropChange('url', e.target.value);
                  handlePropChange('link', e.target.value);
                }}
                placeholder="/"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Open in</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="nodeInspectorLogoOpenTab"
                    checked={!props.openInNewTab}
                    onChange={() => handlePropChange('openInNewTab', false)}
                  />
                  Same tab
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="nodeInspectorLogoOpenTab"
                    checked={Boolean(props.openInNewTab)}
                    onChange={() => handlePropChange('openInNewTab', true)}
                  />
                  New tab
                </label>
              </div>
            </div>
          </div>
        )}

        {/* IMAGE */}
        {node.nodeType === 'image' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Image URL</label>
              <input
                type="text"
                value={props.src || ''}
                placeholder="https://example.com/image.png"
                onChange={(e) => handlePropChange('src', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Alt Text</label>
              <input
                type="text"
                value={props.alt || ''}
                placeholder="Descriptive alt text"
                onChange={(e) => handlePropChange('alt', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Width</label>
              <input
                type="number"
                value={props.width || 200}
                onChange={(e) => handlePropChange('width', Number(e.target.value))}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
          </>
        )}

        {/* LINK LIST */}
        {node.nodeType === 'link-list' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Heading</label>
              <input
                type="text"
                value={props.heading || ''}
                onChange={(e) => handlePropChange('heading', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Links</label>
                <button
                  onClick={() => {
                    const currentLinks = props.links || [];
                    handlePropChange('links', [...currentLinks, { label: 'New Link', href: '#' }]);
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#2563eb',
                    cursor: 'pointer',
                  }}
                >
                  + Add Link
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(props.links || []).map((l: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', minWidth: 0 }}>
                    <input
                      type="text"
                      value={l.label}
                      placeholder="Label"
                      onChange={(e) => {
                        const newLinks = [...(props.links || [])];
                        newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                        handlePropChange('links', newLinks);
                      }}
                      style={{ flex: 1, minWidth: 0, width: 0, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text"
                      value={l.href}
                      placeholder="URL"
                      onChange={(e) => {
                        const newLinks = [...(props.links || [])];
                        newLinks[idx] = { ...newLinks[idx], href: e.target.value };
                        handlePropChange('links', newLinks);
                      }}
                      style={{ flex: 1, minWidth: 0, width: 0, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={() => {
                        const newLinks = (props.links || []).filter((_: any, i: number) => i !== idx);
                        handlePropChange('links', newLinks);
                      }}
                      style={{ flexShrink: 0, padding: '6px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* NEWSLETTER */}
        {node.nodeType === 'newsletter' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Heading</label>
              <input
                type="text"
                value={props.heading || ''}
                onChange={(e) => handlePropChange('heading', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Description</label>
              <input
                type="text"
                value={props.description || ''}
                onChange={(e) => handlePropChange('description', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Input Placeholder</label>
              <input
                type="text"
                value={props.placeholder || 'Your email address'}
                onChange={(e) => handlePropChange('placeholder', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Button Text</label>
              <input
                type="text"
                value={props.buttonText || 'Subscribe'}
                onChange={(e) => handlePropChange('buttonText', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Layout</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {['horizontal', 'vertical'].map((layout) => (
                  <button
                    key={layout}
                    onClick={() => handlePropChange('layout', layout)}
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      border: (props.layout || 'horizontal') === layout ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: (props.layout || 'horizontal') === layout ? '#eff6ff' : '#ffffff',
                      color: (props.layout || 'horizontal') === layout ? '#1d4ed8' : '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* BUTTON */}
        {node.nodeType === 'button' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Label</label>
              <input
                type="text"
                value={props.label || 'Button'}
                onChange={(e) => handlePropChange('label', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Destination Link</label>
              <input
                type="text"
                value={props.link || '#'}
                onChange={(e) => handlePropChange('link', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Variant</label>
              <select
                value={props.variant || 'primary'}
                onChange={(e) => handlePropChange('variant', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
          </>
        )}

        {/* SOCIAL LINKS */}
        {node.nodeType === 'social-links' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Platforms</label>
            {(props.platforms || []).map((p: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={!!p.enabled}
                  onChange={(e) => {
                    const newPlatforms = [...(props.platforms || [])];
                    newPlatforms[idx] = { ...newPlatforms[idx], enabled: e.target.checked };
                    handlePropChange('platforms', newPlatforms);
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', width: '80px' }}>
                  {p.platform}
                </span>
                <input
                  type="text"
                  value={p.url || ''}
                  placeholder="URL"
                  onChange={(e) => {
                    const newPlatforms = [...(props.platforms || [])];
                    newPlatforms[idx] = { ...newPlatforms[idx], url: e.target.value };
                    handlePropChange('platforms', newPlatforms);
                  }}
                  style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* PAYMENT ICONS */}
        {node.nodeType === 'payment-icons' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Supported Methods</label>
            {(props.methods || []).map((m: any, idx: number) => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!m.enabled}
                  onChange={(e) => {
                    const newMethods = [...(props.methods || [])];
                    newMethods[idx] = { ...newMethods[idx], enabled: e.target.checked };
                    handlePropChange('methods', newMethods);
                  }}
                />
                {m.name}
              </label>
            ))}
          </div>
        )}

        {/* COPYRIGHT */}
        {node.nodeType === 'copyright' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Text (Use {'{year}'} for current year)
              </label>
              <input
                type="text"
                value={props.text || '© {year} BillionBiz. All rights reserved.'}
                onChange={(e) => handlePropChange('text', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Font Size</label>
              <input
                type="number"
                value={props.fontSize || 12}
                onChange={(e) => handlePropChange('fontSize', Number(e.target.value))}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
          </>
        )}

        {/* DIVIDER */}
        {node.nodeType === 'divider' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Thickness (px)</label>
              <input
                type="number"
                value={props.thickness || 1}
                onChange={(e) => handlePropChange('thickness', Number(e.target.value))}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Style</label>
              <select
                value={props.style || 'solid'}
                onChange={(e) => handlePropChange('style', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </>
        )}

        {/* SPACER */}
        {node.nodeType === 'spacer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Height (px)</label>
            <input
              type="number"
              value={props.height || 24}
              onChange={(e) => handlePropChange('height', Number(e.target.value))}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN EXPORTED COMPONENT ─────────────────────────────────

export const FooterNodeInspector: React.FC = () => {
  const {
    footerRightSidebarMode,
    selectedFooterNodeId,
    footerTree,
    pendingFooterTree,
  } = useEditorContextStore();

  // If in templates mode, show template library
  if (footerRightSidebarMode === 'templates') {
    return <FooterTemplateGallery />;
  }

  // If root is selected (selectedFooterNodeId is null)
  if (!selectedFooterNodeId) {
    return <FooterRootInspector />;
  }

  // Find selected node in effective tree
  const effectiveTree = pendingFooterTree || footerTree;
  const selectedNode = findNodeById(effectiveTree, selectedFooterNodeId);

  if (!selectedNode) {
    return <FooterRootInspector />;
  }

  if (selectedNode.nodeType === 'group') {
    return <GroupInspector node={selectedNode} />;
  }

  return <ComponentInspector node={selectedNode} />;
};
