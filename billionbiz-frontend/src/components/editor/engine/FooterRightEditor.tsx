// ============================================================
// FOOTER RIGHT EDITOR — Integrated Right Sidebar Editor
// Built specifically for the Footer Editor by reusing the
// established BillionBiz EditorRightSidebar layout, header,
// tabs with left/right scroll chevrons, and design tokens.
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Columns,
  Rows,
  Smartphone,
  Tablet,
  Plus,
  Trash2,
  Check,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { findNodeById } from './footerTreeEngine';
import { FOOTER_TREE_TEMPLATES } from './footerTreeTemplates';
import type {
  FooterTreeNode,
  MainAxisDistribution,
  CrossAxisAlignment,
  BgType,
} from './footerTreeTypes';
import styles from '../../../pages/editor/EditorLayout.module.css';

interface FooterRightEditorProps {
  onClose?: () => void;
}

export const FooterRightEditor: React.FC<FooterRightEditorProps> = ({ onClose }) => {
  const {
    footerTree,
    pendingFooterTree,
    selectedFooterNodeId,
    pendingFooterTemplateId,
    applyPendingFooterTemplate,
    cancelPendingFooterTemplate,
  } = useEditorContextStore();

  const effectiveTree = pendingFooterTree || footerTree;
  const isRootSelected = selectedFooterNodeId === null;
  const selectedNode = isRootSelected ? null : findNodeById(effectiveTree, selectedFooterNodeId);

  // Determine available tabs based on selected element
  const tabs = React.useMemo(() => {
    if (isRootSelected) {
      return [
        { id: 'templates', label: 'Templates' },
        { id: 'layout', label: 'Layout' },
        { id: 'design', label: 'Design' },
        { id: 'spacing', label: 'Spacing' },
        { id: 'responsive', label: 'Responsive' },
      ];
    }
    if (selectedNode?.nodeType === 'group') {
      return [
        { id: 'layout', label: 'Layout' },
        { id: 'design', label: 'Design' },
        { id: 'spacing', label: 'Spacing' },
        { id: 'responsive', label: 'Responsive' },
      ];
    }
    // Component block
    const isTextComponent = ['text', 'heading', 'brand', 'link-list', 'newsletter', 'copyright', 'button', 'contact-info', 'app-download'].includes(selectedNode?.nodeType || '');
    if (isTextComponent) {
      return [
        { id: 'content', label: 'Content' },
        { id: 'typography', label: 'Typography' },
        { id: 'design', label: 'Design' },
        { id: 'spacing', label: 'Spacing' },
        { id: 'responsive', label: 'Responsive' },
      ];
    }
    return [
      { id: 'content', label: 'Content' },
      { id: 'design', label: 'Design' },
      { id: 'spacing', label: 'Spacing' },
      { id: 'responsive', label: 'Responsive' },
    ];
  }, [isRootSelected, selectedNode?.nodeType]);

  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || 'layout');
  const tabsRef = useRef<HTMLDivElement>(null);

  // If activeTab is not valid in the current tab list, fallback to first tab
  useEffect(() => {
    if (!tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0]?.id || 'layout');
    }
  }, [tabs, activeTab]);

  const handlePrevTab = () => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    const nextIdx = (idx - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIdx].id);
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -80, behavior: 'smooth' });
    }
  };

  const handleNextTab = () => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    const nextIdx = (idx + 1) % tabs.length;
    setActiveTab(tabs[nextIdx].id);
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 80, behavior: 'smooth' });
    }
  };

  // Title for panel header
  const title = isRootSelected
    ? 'Footer Settings'
    : selectedNode?.nodeType === 'group'
    ? 'Group'
    : selectedNode?.name || 'Component';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '100%', overflowX: 'hidden', overflowY: 'hidden', boxSizing: 'border-box' }}>
      {/* ─── Panel Header matching EditorRightSidebar ─── */}
      <div className={styles.panelHeader}>
        <div className={styles.phLeft}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            title="Collapse sidebar"
          >
            <ChevronRight size={20} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {title}
          </h3>
        </div>
      </div>

      {/* ─── Pending Template Confirmation Banner ─── */}
      {pendingFooterTemplateId && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#eff6ff',
            borderBottom: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <Sparkles size={16} color="#2563eb" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1d4ed8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Previewing Template
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={() => applyPendingFooterTemplate()}
              style={{
                padding: '4px 10px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
            <button
              onClick={() => cancelPendingFooterTemplate()}
              style={{
                padding: '4px 8px',
                backgroundColor: '#e2e8f0',
                color: '#475569',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── Exact EditorRightSidebar Tabs Header with Chevron Scroll Buttons ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          background: '#f8fafc',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={handlePrevTab}
          style={{
            padding: '8px 10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted, #64748b)',
            flexShrink: 0,
            transition: 'color 0.15s ease',
          }}
          title="Scroll tabs left"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={tabsRef}
          className={styles.propTabs}
          style={{
            overflowX: 'auto',
            flexWrap: 'nowrap',
            borderBottom: 'none',
            flex: 1,
            display: 'flex',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.propTab} ${activeTab === tab.id ? styles.activePropTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '1 0 auto',
                padding: '12px 10px',
                textAlign: 'center',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNextTab}
          style={{
            padding: '8px 10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted, #64748b)',
            flexShrink: 0,
            transition: 'color 0.15s ease',
          }}
          title="Scroll tabs right"
          aria-label="Scroll tabs right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── Scrollable Tab Content ─── */}
      <div className={styles.propContent} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {isRootSelected ? (
          <RootTabContent activeTab={activeTab} />
        ) : selectedNode?.nodeType === 'group' ? (
          <GroupTabContent node={selectedNode} activeTab={activeTab} />
        ) : selectedNode ? (
          <ComponentTabContent node={selectedNode} activeTab={activeTab} />
        ) : null}
      </div>
    </div>
  );
};

// ─── ROOT TAB CONTENT ────────────────────────────────────────

const RootTabContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const {
    pendingFooterTemplateId,
    previewFooterTemplate,
    applyFooterTreeTemplate,
  } = useEditorContextStore();

  if (activeTab === 'templates') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            Footer Templates
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Choose a responsive footer layout. All link columns are organized into independent groups. Theme colors & typography are preserved.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FOOTER_TREE_TEMPLATES.map((tmpl) => {
            const isPending = pendingFooterTemplateId === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => previewFooterTemplate(tmpl.id)}
                style={{
                  border: isPending ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  backgroundColor: isPending ? '#f8fafc' : '#ffffff',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                    }}
                  >
                    {tmpl.category}
                  </span>
                  {isPending && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={13} /> Active Preview
                    </span>
                  )}
                </div>

                <div>
                  <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                    {tmpl.name}
                  </h5>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {tmpl.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      previewFooterTemplate(tmpl.id);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: isPending ? '#eff6ff' : '#f1f5f9',
                      color: isPending ? '#2563eb' : '#1e293b',
                      border: isPending ? '1px solid #2563eb' : '1px solid transparent',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isPending ? '✓ Previewing' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyFooterTreeTemplate(tmpl.id);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isPending ? '#16a34a' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isPending ? '0 2px 6px rgba(22, 163, 74, 0.3)' : '0 2px 6px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    {isPending ? 'Apply Layout' : 'Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeTab === 'layout') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            Container Max Width
          </label>
          <select
            defaultValue="1280px"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="1140px">1140px (Compact)</option>
            <option value="1280px">1280px (Standard)</option>
            <option value="1440px">1440px (Wide)</option>
            <option value="100%">100% (Full Width)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            Major Rows Spacing (Gap)
          </label>
          <input
            type="range"
            min="16"
            max="64"
            defaultValue="32"
            style={{ width: '100%', accentColor: '#2563eb' }}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'design') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            Footer Background
          </label>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Inherited from store theme palette. You can set a custom background color or gradient here.
          </p>
          <input
            type="color"
            defaultValue="#ffffff"
            style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            Top Border
          </label>
          <select
            defaultValue="solid"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="solid">1px Solid Separator</option>
            <option value="none">No Border</option>
            <option value="subtle">Subtle Shadow Only</option>
          </select>
        </div>
      </div>
    );
  }

  if (activeTab === 'spacing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Global Footer Padding (px)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Top</span>
            <input type="number" defaultValue={48} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Bottom</span>
            <input type="number" defaultValue={48} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Left</span>
            <input type="number" defaultValue={32} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Right</span>
            <input type="number" defaultValue={32} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          </div>
        </div>
      </div>
    );
  }

  // Responsive
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
          Responsive Behavior
        </h4>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
          On mobile viewports (&lt; 768px), horizontal link columns automatically stack vertically with uniform touch-friendly gaps.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={16} color="#2563eb" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Mobile Auto-Stack</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
            ENABLED
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tablet size={16} color="#2563eb" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Tablet Grid (2-col wrap)</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
            ENABLED
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── GROUP TAB CONTENT ───────────────────────────────────────

const GroupTabContent: React.FC<{ node: FooterTreeNode; activeTab: string }> = ({ node, activeTab }) => {
  const {
    updateFooterTreeNodeLayout,
    updateFooterTreeNodeStyling,
    updateFooterTreeNodeResponsive,
  } = useEditorContextStore();

  const layout = node.layout || {
    direction: 'horizontal',
    width: { mode: 'fill' },
    height: { mode: 'fit' },
    mainAxisDistribution: 'start',
    crossAxisAlignment: 'start',
    gap: 16,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  const styling = node.styling || { bgType: 'inherit' };

  if (activeTab === 'layout') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Direction */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            Direction
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => updateFooterTreeNodeLayout(node.id, { direction: 'horizontal' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '6px',
                border: layout.direction === 'horizontal' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: layout.direction === 'horizontal' ? '#eff6ff' : '#ffffff',
                color: layout.direction === 'horizontal' ? '#1d4ed8' : '#475569',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <Columns size={15} />
              <span>Row</span>
            </button>
            <button
              type="button"
              onClick={() => updateFooterTreeNodeLayout(node.id, { direction: 'vertical' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '6px',
                border: layout.direction === 'vertical' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: layout.direction === 'vertical' ? '#eff6ff' : '#ffffff',
                color: layout.direction === 'vertical' ? '#1d4ed8' : '#475569',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <Rows size={15} />
              <span>Column</span>
            </button>
          </div>
        </div>

        {/* Main Axis Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            Main Axis Distribution
          </label>
          <select
            value={layout.mainAxisDistribution}
            onChange={(e) => updateFooterTreeNodeLayout(node.id, { mainAxisDistribution: e.target.value as MainAxisDistribution })}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
          >
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
            <option value="space-between">Space Between</option>
            <option value="space-around">Space Around</option>
            <option value="space-evenly">Space Evenly</option>
          </select>
        </div>

        {/* Cross Axis Alignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            Cross Axis Alignment
          </label>
          <select
            value={layout.crossAxisAlignment || (layout.direction === 'horizontal' ? 'center' : 'stretch')}
            onChange={(e) => updateFooterTreeNodeLayout(node.id, { crossAxisAlignment: e.target.value as CrossAxisAlignment })}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', width: '100%', boxSizing: 'border-box' }}
          >
            <option value="start">Start ({layout.direction === 'horizontal' ? 'Top' : 'Left'})</option>
            <option value="center">Center</option>
            <option value="end">End ({layout.direction === 'horizontal' ? 'Bottom' : 'Right'})</option>
            <option value="stretch">Stretch</option>
          </select>
        </div>

        {/* Gap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Gap</label>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb' }}>{layout.gap || 0}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="64"
            value={layout.gap || 0}
            onChange={(e) => updateFooterTreeNodeLayout(node.id, { gap: Number(e.target.value) })}
            style={{ width: '100%', accentColor: '#2563eb' }}
          />
        </div>

        {/* Wrap */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block' }}>Flex Wrap</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Wrap children onto multiple lines</span>
          </div>
          <input
            type="checkbox"
            checked={Boolean(layout.wrap)}
            onChange={(e) => updateFooterTreeNodeLayout(node.id, { wrap: e.target.checked })}
            style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
          />
        </div>

        {/* Width Sizing Mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Width Sizing</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {(['fill', 'fit', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => updateFooterTreeNodeLayout(node.id, { width: { ...layout.width, mode } })}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  border: layout.width.mode === mode ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: layout.width.mode === mode ? '#eff6ff' : '#ffffff',
                  color: layout.width.mode === mode ? '#1d4ed8' : '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {mode === 'fill' ? 'Fill' : mode === 'fit' ? 'Fit' : 'Custom'}
              </button>
            ))}
          </div>
          {layout.width.mode === 'custom' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                type="number"
                value={layout.width.value || 100}
                onChange={(e) => updateFooterTreeNodeLayout(node.id, { width: { ...layout.width, value: Number(e.target.value) } })}
                style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
              <select
                value={layout.width.unit || '%'}
                onChange={(e) => updateFooterTreeNodeLayout(node.id, { width: { ...layout.width, unit: e.target.value as any } })}
                style={{ width: '70px', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="%">%</option>
                <option value="px">px</option>
              </select>
            </div>
          )}
        </div>

        {/* Max Width */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Max Width (px)</label>
            {layout.maxWidth && (
              <button
                type="button"
                onClick={() => updateFooterTreeNodeLayout(node.id, { maxWidth: undefined })}
                style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="number"
            min="0"
            max="1920"
            placeholder="None (unconstrained)"
            value={layout.maxWidth || ''}
            onChange={(e) => updateFooterTreeNodeLayout(node.id, { maxWidth: e.target.value ? Number(e.target.value) : undefined })}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Constrain maximum container width in flex rows.
          </span>
        </div>
      </div>
    );
  }

  if (activeTab === 'design') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Background Type</label>
          <select
            value={styling.bgType}
            onChange={(e) => updateFooterTreeNodeStyling(node.id, { bgType: e.target.value as BgType })}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
          >
            <option value="inherit">Inherit (Transparent)</option>
            <option value="color">Solid Color</option>
          </select>
        </div>

        {styling.bgType === 'color' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Background Color</label>
            <input
              type="color"
              value={styling.bgColor || '#ffffff'}
              onChange={(e) => updateFooterTreeNodeStyling(node.id, { bgColor: e.target.value })}
              style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Border Width (px)</label>
          <input
            type="number"
            min="0"
            max="8"
            value={styling.borderWidth || 0}
            onChange={(e) => updateFooterTreeNodeStyling(node.id, { borderWidth: Number(e.target.value) })}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Border Radius (px)</label>
          <input
            type="number"
            min="0"
            max="32"
            value={styling.borderRadius || 0}
            onChange={(e) => updateFooterTreeNodeStyling(node.id, { borderRadius: Number(e.target.value) })}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'spacing') {
    const pad = layout.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Group Padding (px)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Top</span>
            <input
              type="number"
              value={pad.top}
              onChange={(e) => updateFooterTreeNodeLayout(node.id, { padding: { ...pad, top: Number(e.target.value) } })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Bottom</span>
            <input
              type="number"
              value={pad.bottom}
              onChange={(e) => updateFooterTreeNodeLayout(node.id, { padding: { ...pad, bottom: Number(e.target.value) } })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Left</span>
            <input
              type="number"
              value={pad.left}
              onChange={(e) => updateFooterTreeNodeLayout(node.id, { padding: { ...pad, left: Number(e.target.value) } })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Right</span>
            <input
              type="number"
              value={pad.right}
              onChange={(e) => updateFooterTreeNodeLayout(node.id, { padding: { ...pad, right: Number(e.target.value) } })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Responsive
  const resp = node.responsive || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
          Mobile Layout Overrides
        </h4>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
          Customize how this group behaves on mobile screens (&lt; 768px).
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Mobile Direction
        </label>
        <select
          value={resp.mobile?.direction || 'vertical'}
          onChange={(e) =>
            updateFooterTreeNodeResponsive(node.id, {
              mobile: { ...resp.mobile, direction: e.target.value as any },
            })
          }
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
        >
          <option value="vertical">Stack Vertically (Column)</option>
          <option value="horizontal">Keep Horizontal (Row)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Mobile Gap (px)
        </label>
        <input
          type="number"
          value={resp.mobile?.gap || layout.gap || 16}
          onChange={(e) =>
            updateFooterTreeNodeResponsive(node.id, {
              mobile: { ...resp.mobile, gap: Number(e.target.value) },
            })
          }
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
        />
      </div>
    </div>
  );
};

// ─── COMPONENT TAB CONTENT ───────────────────────────────────

const ComponentTabContent: React.FC<{ node: FooterTreeNode; activeTab: string }> = ({ node, activeTab }) => {
  const {
    updateFooterTreeNodeProps,
  } = useEditorContextStore();

  const props = node.props || {};

  const handleProp = (key: string, val: any) => {
    updateFooterTreeNodeProps(node.id, { [key]: val });
  };

  if (activeTab === 'content') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* HEADING */}
        {node.nodeType === 'heading' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Heading Text</label>
              <input
                type="text"
                value={props.text || ''}
                onChange={(e) => handleProp('text', e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Tag Level</label>
              <select
                value={props.level || 'h3'}
                onChange={(e) => handleProp('level', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
              </select>
            </div>
          </>
        )}

        {/* TEXT */}
        {node.nodeType === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Paragraph Text</label>
            <textarea
              rows={4}
              value={props.text || ''}
              onChange={(e) => handleProp('text', e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
            />
          </div>
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
                      onClick={() => handleProp('logoType', opt.id)}
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
                                  handleProp('imageUrl', ev.target.result as string);
                                  handleProp('image', ev.target.result as string);
                                  handleProp('src', ev.target.result as string);
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
                            handleProp('imageUrl', '');
                            handleProp('image', '');
                            handleProp('src', '');
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
                      handleProp('imageUrl', e.target.value);
                      handleProp('image', e.target.value);
                      handleProp('src', e.target.value);
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
                      handleProp('isTwoLines', nextIsTwo);
                      if (nextIsTwo && !props.upperText) {
                        handleProp('upperText', props.text || 'BILLION');
                        handleProp('lowerText', props.lowerText || 'BIZ COUTURE');
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
                        handleProp('text', e.target.value);
                        handleProp('brandName', e.target.value);
                        handleProp('upperText', e.target.value);
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
                          handleProp('upperText', e.target.value);
                          handleProp('text', e.target.value);
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
                        onChange={(e) => handleProp('lowerText', e.target.value)}
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
                  handleProp('url', e.target.value);
                  handleProp('link', e.target.value);
                }}
                placeholder="/"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Open in</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="footerLogoOpenTab"
                    checked={!props.openInNewTab}
                    onChange={() => handleProp('openInNewTab', false)}
                  />
                  Same tab
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="footerLogoOpenTab"
                    checked={Boolean(props.openInNewTab)}
                    onChange={() => handleProp('openInNewTab', true)}
                  />
                  New tab
                </label>
              </div>
            </div>
          </div>
        )}

        {/* LINK LIST */}
        {node.nodeType === 'link-list' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Column Heading</label>
              <input
                type="text"
                value={props.heading || ''}
                onChange={(e) => handleProp('heading', e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Navigation Links</label>
                <button
                  type="button"
                  onClick={() => {
                    const links = [...(props.links || [])];
                    links.push({ label: 'New Link', href: '#' });
                    handleProp('links', links);
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={12} /> Add Link
                </button>
              </div>

              {(props.links || []).map((link: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', minWidth: 0 }}>
                  <input
                    type="text"
                    value={link.label}
                    placeholder="Label"
                    onChange={(e) => {
                      const next = [...props.links];
                      next[idx] = { ...next[idx], label: e.target.value };
                      handleProp('links', next);
                    }}
                    style={{ flex: 1, minWidth: 0, width: 0, padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                  <input
                    type="text"
                    value={link.href}
                    placeholder="/url"
                    onChange={(e) => {
                      const next = [...props.links];
                      next[idx] = { ...next[idx], href: e.target.value };
                      handleProp('links', next);
                    }}
                    style={{ flex: 1, minWidth: 0, width: 0, padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = props.links.filter((_: any, i: number) => i !== idx);
                      handleProp('links', next);
                    }}
                    style={{ flexShrink: 0, padding: '6px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
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
                onChange={(e) => handleProp('heading', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Description</label>
              <textarea
                rows={2}
                value={props.description || ''}
                onChange={(e) => handleProp('description', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Placeholder</label>
              <input
                type="text"
                value={props.placeholder || 'Enter your email...'}
                onChange={(e) => handleProp('placeholder', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Button Text</label>
              <input
                type="text"
                value={props.buttonText || 'Subscribe'}
                onChange={(e) => handleProp('buttonText', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </>
        )}

        {/* COPYRIGHT */}
        {node.nodeType === 'copyright' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Notice Text</label>
              <input
                type="text"
                value={props.text || '© {year} BillionBiz. All rights reserved.'}
                onChange={(e) => handleProp('text', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Tip: Use {'{year}'} to dynamically display the current year.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Text Alignment</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => handleProp('alignment', align)}
                    style={{
                      padding: '7px',
                      borderRadius: '6px',
                      border: (props.alignment || 'left') === align ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: (props.alignment || 'left') === align ? '#eff6ff' : '#ffffff',
                      color: (props.alignment || 'left') === align ? '#1d4ed8' : '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Font Size (px)</label>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{props.fontSize || 12}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="24"
                value={props.fontSize || 12}
                onChange={(e) => handleProp('fontSize', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>
          </div>
        )}

        {/* SOCIAL LINKS */}
        {node.nodeType === 'social-links' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Social Platforms</label>
            {(props.platforms || []).map((p: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', minWidth: 0 }}>
                <input
                  type="checkbox"
                  checked={Boolean(p.enabled)}
                  onChange={(e) => {
                    const next = [...props.platforms];
                    next[idx] = { ...next[idx], enabled: e.target.checked };
                    handleProp('platforms', next);
                  }}
                  style={{ accentColor: '#2563eb', flexShrink: 0 }}
                />
                <span style={{ width: '70px', flexShrink: 0, fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                  {p.platform}
                </span>
                <input
                  type="text"
                  value={p.url || ''}
                  placeholder="https://..."
                  onChange={(e) => {
                    const next = [...props.platforms];
                    next[idx] = { ...next[idx], url: e.target.value };
                    handleProp('platforms', next);
                  }}
                  style={{ flex: 1, minWidth: 0, width: 0, padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* PAYMENT ICONS */}
        {node.nodeType === 'payment-icons' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Alignment</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => handleProp('alignment', align)}
                    style={{
                      padding: '7px',
                      borderRadius: '6px',
                      border: (props.alignment || 'right') === align ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: (props.alignment || 'right') === align ? '#eff6ff' : '#ffffff',
                      color: (props.alignment || 'right') === align ? '#1d4ed8' : '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Badge Size</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['small', 'medium', 'large'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleProp('size', sz)}
                    style={{
                      padding: '7px',
                      borderRadius: '6px',
                      border: (props.size || 'medium') === sz ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: (props.size || 'medium') === sz ? '#eff6ff' : '#ffffff',
                      color: (props.size || 'medium') === sz ? '#1d4ed8' : '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Active Payment Badges</label>
              {(props.methods || [
                { id: 'visa', name: 'Visa', enabled: true },
                { id: 'mastercard', name: 'Mastercard', enabled: true },
                { id: 'amex', name: 'American Express', enabled: true },
                { id: 'paypal', name: 'PayPal', enabled: true },
                { id: 'apple-pay', name: 'Apple Pay', enabled: true },
                { id: 'google-pay', name: 'Google Pay', enabled: true },
              ]).map((m: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(m.enabled)}
                    onChange={(e) => {
                      const next = [...(props.methods || [
                        { id: 'visa', name: 'Visa', enabled: true },
                        { id: 'mastercard', name: 'Mastercard', enabled: true },
                        { id: 'amex', name: 'American Express', enabled: true },
                        { id: 'paypal', name: 'PayPal', enabled: true },
                        { id: 'apple-pay', name: 'Apple Pay', enabled: true },
                        { id: 'google-pay', name: 'Google Pay', enabled: true },
                      ])];
                      next[idx] = { ...next[idx], enabled: e.target.checked };
                      handleProp('methods', next);
                    }}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACT INFO */}
        {node.nodeType === 'contact-info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Heading</label>
              <input
                type="text"
                value={props.heading || ''}
                placeholder="Contact Us"
                onChange={(e) => handleProp('heading', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Address</label>
              <input
                type="text"
                value={props.address || ''}
                placeholder="123 Commerce Way, NY"
                onChange={(e) => handleProp('address', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Phone</label>
              <input
                type="text"
                value={props.phone || ''}
                placeholder="+1 (800) 123-4567"
                onChange={(e) => handleProp('phone', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Email</label>
              <input
                type="email"
                value={props.email || ''}
                placeholder="support@store.com"
                onChange={(e) => handleProp('email', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Business Hours</label>
              <input
                type="text"
                value={props.hours || ''}
                placeholder="Mon - Fri: 9am - 6pm"
                onChange={(e) => handleProp('hours', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}

        {/* TRUST BADGE */}
        {node.nodeType === 'trust-badge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Layout</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleProp('layout', 'horizontal')}
                  style={{
                    padding: '7px',
                    borderRadius: '6px',
                    border: (props.layout || 'horizontal') === 'horizontal' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: (props.layout || 'horizontal') === 'horizontal' ? '#eff6ff' : '#ffffff',
                    color: (props.layout || 'horizontal') === 'horizontal' ? '#1d4ed8' : '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Horizontal Row
                </button>
                <button
                  type="button"
                  onClick={() => handleProp('layout', 'vertical')}
                  style={{
                    padding: '7px',
                    borderRadius: '6px',
                    border: props.layout === 'vertical' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: props.layout === 'vertical' ? '#eff6ff' : '#ffffff',
                    color: props.layout === 'vertical' ? '#1d4ed8' : '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Vertical Stack
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Trust Badges</label>
              {(props.badges || []).map((b: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={b.enabled !== false}
                    onChange={(e) => {
                      const next = [...props.badges];
                      next[idx] = { ...next[idx], enabled: e.target.checked };
                      handleProp('badges', next);
                    }}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{b.title}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{b.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APP DOWNLOAD */}
        {node.nodeType === 'app-download' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Heading</label>
              <input
                type="text"
                value={props.heading || ''}
                placeholder="Get the App"
                onChange={(e) => handleProp('heading', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Subheading</label>
              <input
                type="text"
                value={props.subheading || ''}
                placeholder="Shop on mobile for exclusive app-only deals"
                onChange={(e) => handleProp('subheading', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={props.showApple !== false}
                onChange={(e) => handleProp('showApple', e.target.checked)}
                style={{ accentColor: '#2563eb' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Show Apple App Store Badge</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={props.showGoogle !== false}
                onChange={(e) => handleProp('showGoogle', e.target.checked)}
                style={{ accentColor: '#2563eb' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Show Google Play Store Badge</span>
            </div>
          </div>
        )}

        {/* LOCALIZATION */}
        {node.nodeType === 'localization' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={props.showCountry !== false}
                onChange={(e) => handleProp('showCountry', e.target.checked)}
                style={{ accentColor: '#2563eb' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Show Country / Currency Selector</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={props.showLanguage !== false}
                onChange={(e) => handleProp('showLanguage', e.target.checked)}
                style={{ accentColor: '#2563eb' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Show Language Selector</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Default Country</label>
              <input
                type="text"
                value={props.currentCountry || 'United States (USD $)'}
                onChange={(e) => handleProp('currentCountry', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Default Language</label>
              <input
                type="text"
                value={props.currentLanguage || 'English (US)'}
                onChange={(e) => handleProp('currentLanguage', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}

        {/* CUSTOM HTML */}
        {node.nodeType === 'custom-html' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Raw HTML Code</label>
            <textarea
              rows={6}
              value={props.html || ''}
              onChange={(e) => handleProp('html', e.target.value)}
              placeholder="<div>Custom embed code...</div>"
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'monospace', width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>
        )}

        {/* BUTTON */}
        {node.nodeType === 'button' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Button Label</label>
              <input
                type="text"
                value={props.label || ''}
                onChange={(e) => handleProp('label', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Link Target</label>
              <input
                type="text"
                value={props.link || ''}
                onChange={(e) => handleProp('link', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </>
        )}

        {/* SPACER */}
        {node.nodeType === 'spacer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Height (px)</label>
            <input
              type="number"
              value={props.size || 24}
              onChange={(e) => handleProp('size', Number(e.target.value))}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'typography') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
            Typography Settings
          </h4>
          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
            Configure font size, weight, text alignment, and colors.
          </p>
        </div>

        {/* Font Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Font Size (px)</label>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{props.fontSize || 14}px</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="range"
              min="10"
              max="48"
              value={props.fontSize || 14}
              onChange={(e) => handleProp('fontSize', Number(e.target.value))}
              style={{ flex: 1, accentColor: '#2563eb' }}
            />
            <input
              type="number"
              min="10"
              max="48"
              value={props.fontSize || 14}
              onChange={(e) => handleProp('fontSize', Number(e.target.value))}
              style={{ width: '60px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
          </div>
        </div>

        {/* Font Weight */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Font Weight</label>
          <select
            value={props.fontWeight || 400}
            onChange={(e) => handleProp('fontWeight', Number(e.target.value))}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
          >
            <option value={400}>Regular (400)</option>
            <option value={500}>Medium (500)</option>
            <option value={600}>Semi-Bold (600)</option>
            <option value={700}>Bold (700)</option>
            <option value={800}>Extra Bold (800)</option>
          </select>
        </div>

        {/* Text Alignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Text Alignment</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => handleProp('alignment', align)}
                style={{
                  padding: '7px',
                  borderRadius: '6px',
                  border: (props.alignment || 'left') === align ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: (props.alignment || 'left') === align ? '#eff6ff' : '#ffffff',
                  color: (props.alignment || 'left') === align ? '#1d4ed8' : '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
              >
                {align}
              </button>
            ))}
          </div>
        </div>

        {/* Line Height */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Line Height</label>
          <select
            value={props.lineHeight || 1.6}
            onChange={(e) => handleProp('lineHeight', Number(e.target.value))}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
          >
            <option value={1.2}>Tight (1.2)</option>
            <option value={1.4}>Snug (1.4)</option>
            <option value={1.6}>Normal (1.6)</option>
            <option value={1.8}>Relaxed (1.8)</option>
            <option value={2.0}>Loose (2.0)</option>
          </select>
        </div>

        {/* Text Color */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Text Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={props.color || '#0f172a'}
              onChange={(e) => handleProp('color', e.target.value)}
              style={{ width: '40px', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', padding: 0 }}
            />
            <input
              type="text"
              value={props.color || ''}
              placeholder="#0f172a (inherit)"
              onChange={(e) => handleProp('color', e.target.value)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'design') {
    const supportsWidthMode = ['text', 'heading', 'link-list', 'newsletter', 'button', 'social-links', 'payment-icons', 'image', 'logo', 'copyright', 'contact-info', 'trust-badge', 'app-download', 'localization', 'custom-html'].includes(node.nodeType);
    const supportsMaxWidth = ['text', 'heading', 'link-list', 'newsletter', 'button', 'social-links', 'payment-icons', 'image', 'logo', 'copyright', 'contact-info', 'trust-badge', 'app-download', 'localization', 'custom-html'].includes(node.nodeType);

    const isNaturalFit = ['copyright', 'payment-icons', 'button', 'social-links', 'logo', 'icon', 'trust-badge', 'app-download', 'localization'].includes(node.nodeType);
    const activeWidthMode = props.widthMode || (isNaturalFit ? 'fit' : 'fill');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
            Design & Layout
          </h4>
          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
            Configure component sizing, boundaries, background, and borders.
          </p>
        </div>

        {/* LOGO & BRAND STYLING */}
        {node.nodeType === 'logo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
              Logo & Brand Styling
            </div>

            {/* Logo Dimensions (if logo image visible) */}
            {props.logoType !== 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Logo Dimensions</span>

                {/* Height */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Logo Height</span>
                    <span style={{ color: '#2563eb', fontWeight: 700 }}>
                      {props.logoHeight || props.height || 40}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="120"
                    value={props.logoHeight || props.height || 40}
                    onChange={(e) => {
                      handleProp('logoHeight', Number(e.target.value));
                      handleProp('height', Number(e.target.value));
                    }}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Width */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Max Width</span>
                    <span style={{ color: '#2563eb', fontWeight: 700 }}>
                      {props.logoWidth || props.desktopWidth || props.width || 140}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="280"
                    value={props.logoWidth || props.desktopWidth || props.width || 140}
                    onChange={(e) => {
                      handleProp('logoWidth', Number(e.target.value));
                      handleProp('desktopWidth', Number(e.target.value));
                      handleProp('width', Number(e.target.value));
                    }}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Shape */}
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
                      const isSelected = (props.shape || 'none') === sh.id;
                      return (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() => handleProp('shape', sh.id)}
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

                  {props.shape === 'rounded' && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Corner Radius</span>
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>{props.borderRadius ?? 8}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="32"
                        value={props.borderRadius ?? 8}
                        onChange={(e) => handleProp('borderRadius', Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
                </div>

                {/* Border & Shadow */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        Border Style
                      </label>
                      <select
                        value={props.borderStyle || 'none'}
                        onChange={(e) => handleProp('borderStyle', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', backgroundColor: '#ffffff' }}
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
                        value={props.shadow || 'none'}
                        onChange={(e) => handleProp('shadow', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', backgroundColor: '#ffffff' }}
                      >
                        <option value="none">None</option>
                        <option value="soft">Soft</option>
                        <option value="medium">Medium</option>
                        <option value="strong">Strong</option>
                      </select>
                    </div>
                  </div>

                  {props.borderStyle && props.borderStyle !== 'none' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Border Width</span>
                        <input
                          type="number"
                          min="1"
                          max="6"
                          value={props.borderWidth || 1}
                          onChange={(e) => handleProp('borderWidth', Number(e.target.value))}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Border Color</span>
                        <input
                          type="color"
                          value={props.borderColor || '#cbd5e1'}
                          onChange={(e) => handleProp('borderColor', e.target.value)}
                          style={{ width: '100%', height: '32px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', padding: '2px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Logo Frame Padding */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Logo Frame Padding</span>
                      <span style={{ color: '#2563eb', fontWeight: 600 }}>{props.imagePadding || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={props.imagePadding || 0}
                      onChange={(e) => handleProp('imagePadding', Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Gap between Logo and Brand Name */}
            {props.logoType === 'both' && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Gap (Logo & Brand Name)</span>
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>{props.logoGap ?? 8}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={props.logoGap ?? 8}
                  onChange={(e) => handleProp('logoGap', Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {/* Brand Name Typography & Colors */}
            {props.logoType !== 'image' && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  Brand Name Typography & Colors
                </span>

                {/* First Line Font Size */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>First Line Font Size</span>
                    <span style={{ color: '#2563eb', fontWeight: 700 }}>
                      {props.firstLineSize || props.fontSize || 20}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={props.firstLineSize || props.fontSize || 20}
                    onChange={(e) => {
                      handleProp('firstLineSize', Number(e.target.value));
                      handleProp('fontSize', Number(e.target.value));
                    }}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Second Line Font Size (when 2 lines) */}
                {Boolean(props.isTwoLines) && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>Second Line Font Size</span>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>
                        {props.secondLineSize || Math.max(10, Math.round((props.firstLineSize || props.fontSize || 20) * 0.58))}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="9"
                      max="28"
                      value={props.secondLineSize || Math.max(10, Math.round((props.firstLineSize || props.fontSize || 20) * 0.58))}
                      onChange={(e) => handleProp('secondLineSize', Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}

                {/* First Line Color */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    First Line Brand Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={props.firstLineColor || props.textColor || props.color || '#0f172a'}
                      onChange={(e) => {
                        handleProp('firstLineColor', e.target.value);
                        handleProp('textColor', e.target.value);
                        handleProp('color', e.target.value);
                      }}
                      style={{ width: '38px', height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={props.firstLineColor || props.textColor || props.color || '#0f172a'}
                      onChange={(e) => {
                        handleProp('firstLineColor', e.target.value);
                        handleProp('textColor', e.target.value);
                        handleProp('color', e.target.value);
                      }}
                      style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                </div>

                {/* Second Line Color (when 2 lines) */}
                {Boolean(props.isTwoLines) && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Second Line Brand Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={props.secondLineColor || props.lowerTextColor || '#64748b'}
                        onChange={(e) => {
                          handleProp('secondLineColor', e.target.value);
                          handleProp('lowerTextColor', e.target.value);
                        }}
                        style={{ width: '38px', height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', padding: 0 }}
                      />
                      <input
                        type="text"
                        value={props.secondLineColor || props.lowerTextColor || '#64748b'}
                        onChange={(e) => {
                          handleProp('secondLineColor', e.target.value);
                          handleProp('lowerTextColor', e.target.value);
                        }}
                        style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                )}

                {/* Font Weight */}
                <div style={{ display: 'grid', gridTemplateColumns: props.isTwoLines ? '1fr 1fr' : '1fr', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Line 1 Weight
                    </span>
                    <select
                      value={props.firstLineWeight || props.fontWeight || 800}
                      onChange={(e) => {
                        handleProp('firstLineWeight', Number(e.target.value));
                        handleProp('fontWeight', Number(e.target.value));
                      }}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', backgroundColor: '#ffffff' }}
                    >
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">SemiBold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">ExtraBold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>

                  {Boolean(props.isTwoLines) && (
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Line 2 Weight
                      </span>
                      <select
                        value={props.secondLineWeight || 600}
                        onChange={(e) => handleProp('secondLineWeight', Number(e.target.value))}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', backgroundColor: '#ffffff' }}
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

                {/* Font Family */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Font Family
                  </span>
                  <select
                    value={props.fontFamily || 'Inter'}
                    onChange={(e) => handleProp('fontFamily', e.target.value)}
                    style={{ width: '100%', padding: '7px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', backgroundColor: '#ffffff' }}
                  >
                    <option value="Inter">Inter (Modern Clean)</option>
                    <option value="Roboto">Roboto (Geometric)</option>
                    <option value="Outfit">Outfit (Contemporary)</option>
                    <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                    <option value="Montserrat">Montserrat (Bold Modern)</option>
                    <option value="inherit">Inherit Store Theme</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Width Sizing: Fit vs Fill */}
        {supportsWidthMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Width Sizing</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleProp('widthMode', 'fit')}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: activeWidthMode === 'fit' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: activeWidthMode === 'fit' ? '#eff6ff' : '#ffffff',
                  color: activeWidthMode === 'fit' ? '#1d4ed8' : '#334155',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                Fit Content
              </button>
              <button
                type="button"
                onClick={() => handleProp('widthMode', 'fill')}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: activeWidthMode === 'fill' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: activeWidthMode === 'fill' ? '#eff6ff' : '#ffffff',
                  color: activeWidthMode === 'fill' ? '#1d4ed8' : '#334155',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                Fill Available
              </button>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {activeWidthMode === 'fit'
                ? 'Component shrinks to fit its own content.'
                : 'Component expands to fill available width in parent row/column.'}
            </span>
          </div>
        )}

        {/* Max Width */}
        {supportsMaxWidth && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Max Width (px)</label>
              {props.maxWidth && (
                <button
                  type="button"
                  onClick={() => handleProp('maxWidth', undefined)}
                  style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="number"
              min="0"
              max="1920"
              placeholder="None (unconstrained)"
              value={props.maxWidth || ''}
              onChange={(e) => handleProp('maxWidth', e.target.value ? Number(e.target.value) : undefined)}
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
            {/* Quick preset chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[240, 320, 420, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleProp('maxWidth', preset)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: props.maxWidth === preset ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: props.maxWidth === preset ? '#eff6ff' : '#f8fafc',
                    color: props.maxWidth === preset ? '#2563eb' : '#64748b',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {preset}px
                </button>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Limits container width from stretching too wide on large screens.
            </span>
          </div>
        )}

        {/* Background Color */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Background Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={props.bgColor || '#ffffff'}
              onChange={(e) => handleProp('bgColor', e.target.value)}
              style={{ width: '40px', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', padding: 0 }}
            />
            <input
              type="text"
              value={props.bgColor || ''}
              placeholder="Transparent (inherit)"
              onChange={(e) => handleProp('bgColor', e.target.value)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Border Radius */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Corner Radius (px)</label>
          <input
            type="number"
            min="0"
            max="40"
            value={props.borderRadius || 0}
            onChange={(e) => handleProp('borderRadius', Number(e.target.value))}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        {/* Opacity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Opacity</label>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {Math.round((props.opacity !== undefined ? Number(props.opacity) : 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={props.opacity !== undefined ? Number(props.opacity) : 1}
            onChange={(e) => handleProp('opacity', Number(e.target.value))}
            style={{ accentColor: '#2563eb' }}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'spacing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
            Spacing Settings
          </h4>
          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
            Configure outer margin and inner padding for this block.
          </p>
        </div>

        {/* Padding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Inner Padding (px)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={props.padding || 0}
            onChange={(e) => handleProp('padding', Number(e.target.value))}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        {/* Margin / Gap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Vertical Gap / Spacing (px)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={props.gap || props.margin || 8}
            onChange={(e) => {
              handleProp('gap', Number(e.target.value));
              handleProp('margin', Number(e.target.value));
            }}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>
    );
  }

  // Responsive
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Device Visibility</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#1e293b' }}>Show on Desktop</span>
          <input type="checkbox" defaultChecked style={{ accentColor: '#2563eb' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#1e293b' }}>Show on Tablet</span>
          <input type="checkbox" defaultChecked style={{ accentColor: '#2563eb' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#1e293b' }}>Show on Mobile</span>
          <input type="checkbox" defaultChecked style={{ accentColor: '#2563eb' }} />
        </div>
      </div>
    </div>
  );
};
