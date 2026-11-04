// ============================================================
// MASTER EDITOR ENGINE — SHARED CAPABILITY INSPECTOR
// Unified right inspector that dynamically reads declared
// capabilities and generates tabs and property control groups
// (spec §4, §14, §15, §51, §72, §76).
// ============================================================

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Palette,
  Layout,
  Sliders,
  Smartphone,
  Code,
  Info,
  Layers,
  FileText,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Lock,
  Search,
  ShoppingCart,
  User,
  Heart,
  Sparkles,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import styles from '../../../pages/editor/EditorLayout.module.css';
import { AnnouncementBarRightEditor, UtilityBarRightEditor } from '../EditorRightSidebar';
import {
  COMPONENT_REGISTRY,
  CAPABILITY_LABELS,
  CAPABILITY_ORDER,
} from './componentRegistry';
import {
  STRUCTURE_PRESETS as HEADER_STRUCTURE_PRESETS,
  HEADER_TEMPLATES,
  ANNOUNCEMENT_VARIANTS,
} from './headerPresets';
import { TemplatesRightInspector } from './TemplatesRightInspector';
import { HeaderSectionInspector } from './HeaderSectionInspector';
import { ChildItemOverlayInspector } from './ChildItemOverlayInspector';
import { resolveFooterRowId } from '../utils/editorNavigation';
import type {
  ComponentCapability,
  HeaderRow,
  FooterRow,
} from './types';

const ScrollableTabsBar: React.FC<{
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (id: any) => void;
}> = ({ tabs, activeTab, onTabChange }) => {
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -100 : 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid var(--border-color)',
      background: '#f8fafc',
    }}>
      <button
        type="button"
        onClick={() => scrollTabs('left')}
        style={{
          padding: '8px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}
        title="Scroll tabs left"
      >
        <ChevronLeft size={16} />
      </button>
      <div
        ref={tabsRef}
        className={styles.propTabs}
        style={{ overflowX: 'auto', flexWrap: 'nowrap', borderBottom: 'none', flex: 1 }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.propTab} ${activeTab === tab.id ? styles.activePropTab : ''}`}
            onClick={() => onTabChange(tab.id)}
            style={{ flex: '0 0 auto', padding: '12px 14px', whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scrollTabs('right')}
        style={{
          padding: '8px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}
        title="Scroll tabs right"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export const CapabilityInspector: React.FC = () => {
  const { closeRightSidebar } = useLandingEditorStore();

  const {
    selectedTarget,
    activeTab,
    setActiveTab,
    headerRows,
    headerSettings,
    updateHeaderRow,
    reorderHeaderRows,
    toggleHeaderRowVisibility,
    deleteHeaderRow,
    addHeaderRow,
    updateHeaderElement,
    toggleHeaderElementVisibility,
    updateHeaderSettings,
    openPresetModal,
    footerRows,
    footerSettings,
    updateFooterRow,
    updateFooterElement,
    updateFooterSettings,
  } = useEditorContextStore();

  const effectiveHeaderRows = headerRows && headerRows.length > 0 ? headerRows : [];

  // ──────────────────────────────────────────────────────────
  // 0. TEMPLATES & PRESETS INSPECTOR
  // ──────────────────────────────────────────────────────────
  if (selectedTarget.type === 'presets') {
    if (selectedTarget.editorType === 'header') {
      const mainRow = effectiveHeaderRows.find((r) => r.type === 'primary-nav') || effectiveHeaderRows[0];
      if (mainRow) {
        return <HeaderSectionInspector row={mainRow} onClose={closeRightSidebar} />;
      }
    }
    return <TemplatesRightInspector editorType={selectedTarget.editorType} />;
  }

  // ──────────────────────────────────────────────────────────
  // 1. GLOBAL SETTINGS INSPECTOR (Header: 6 Tabs or Footer: 4 Tabs)
  // ──────────────────────────────────────────────────────────
  if (selectedTarget.type === 'global') {
    const isHeader = selectedTarget.editorType === 'header' || selectedTarget.editorType === undefined;
    if (isHeader) {
      const mainRow = effectiveHeaderRows.find((r) => r.type === 'primary-nav') || effectiveHeaderRows[0];
      if (mainRow) {
        return <HeaderSectionInspector row={mainRow} onClose={closeRightSidebar} />;
      }
    } else {
      return null;
    }

    const headerTabs = [
      { id: 'style', label: 'Style', icon: Palette },
      { id: 'structure', label: 'Structure', icon: Layout },
      { id: 'content', label: 'Content', icon: FileText },
      { id: 'behavior', label: 'Behavior', icon: Sliders },
      { id: 'responsive', label: 'Responsive', icon: Smartphone },
      { id: 'advanced', label: 'Advanced', icon: Code },
    ];

    const footerTabs = [
      { id: 'style', label: 'Design Tokens', icon: Palette },
      { id: 'behavior', label: 'Back to Top & Motion', icon: Sliders },
      { id: 'responsive', label: 'Mobile & Rules', icon: Smartphone },
      { id: 'advanced', label: 'A11y, Legal & Code', icon: Code },
    ];

    const tabs = isHeader ? headerTabs : footerTabs;
    const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : 'style';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Inspector Header: matching EditorRightSidebar */}
        <div className={styles.panelHeader}>
          <div className={styles.phLeft}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={closeRightSidebar}
              title="Collapse sidebar"
            >
              <ChevronRight size={20} className={styles.backIcon} />
            </button>
            <h3 className={styles.fw600}>
              {isHeader ? 'Header Settings' : 'Footer Settings'}
            </h3>
          </div>
        </div>

        {/* Exact EditorRightSidebar Tabs Header with Chevron Scroll Buttons */}
        <ScrollableTabsBar
          tabs={tabs}
          activeTab={currentTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content Panels */}
        <div className={styles.propContent} style={{ padding: '16px', gap: '16px' }}>
          {isHeader ? (
            <>
              {/* 1.1 STYLE TAB */}
              {currentTab === 'style' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                    Header Height & Container
                  </h4>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Overall Header Height ({headerSettings.headerHeight || 72}px)
                    </label>
                    <input
                      type="range"
                      min={40}
                      max={120}
                      value={headerSettings.headerHeight || 72}
                      onChange={(e) => updateHeaderSettings({ headerHeight: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Container Mode
                    </label>
                    <select
                      value={headerSettings.containerMode || 'contained'}
                      onChange={(e) => updateHeaderSettings({ containerMode: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="contained">Contained (Max Width)</option>
                      <option value="full">Full Width (Edge-to-Edge)</option>
                      <option value="boxed">Boxed Floating Header</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Header Density
                    </label>
                    <select
                      value={headerSettings.density || 'comfortable'}
                      onChange={(e) => updateHeaderSettings({ density: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="compact">Compact (Dense Spacing)</option>
                      <option value="comfortable">Comfortable (Balanced)</option>
                      <option value="spacious">Spacious (Airy & Luxury)</option>
                    </select>
                  </div>

                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '16px 0 12px' }}>
                    Background & Surface
                  </h4>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Surface Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={headerSettings.tokens.bgColor}
                        onChange={(e) =>
                          updateHeaderSettings({
                            tokens: { ...headerSettings.tokens, bgColor: e.target.value },
                          })
                        }
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={headerSettings.tokens.bgColor}
                        onChange={(e) =>
                          updateHeaderSettings({
                            tokens: { ...headerSettings.tokens, bgColor: e.target.value },
                          })
                        }
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Shadow & Border
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <select
                        value={headerSettings.tokens.shadow}
                        onChange={(e) =>
                          updateHeaderSettings({
                            tokens: { ...headerSettings.tokens, shadow: e.target.value as any },
                          })
                        }
                        style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      >
                        <option value="none">No Shadow</option>
                        <option value="soft">Soft Elevation</option>
                        <option value="medium">Medium Shadow</option>
                        <option value="strong">Strong Drop</option>
                      </select>
                      <select
                        value={headerSettings.colorScheme || 'light'}
                        onChange={(e) => updateHeaderSettings({ colorScheme: e.target.value as any })}
                        style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      >
                        <option value="light">Light Scheme</option>
                        <option value="dark">Dark Scheme</option>
                        <option value="system">System Mode</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Typography & Text Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="color"
                        value={headerSettings.tokens.textColor || '#0f172a'}
                        onChange={(e) =>
                          updateHeaderSettings({
                            tokens: { ...headerSettings.tokens, textColor: e.target.value },
                          })
                        }
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={headerSettings.tokens.textColor || '#0f172a'}
                        onChange={(e) =>
                          updateHeaderSettings({
                            tokens: { ...headerSettings.tokens, textColor: e.target.value },
                          })
                        }
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                    <select
                      value={headerSettings.tokens.fontFamily || 'inherit'}
                      onChange={(e) =>
                        updateHeaderSettings({
                          tokens: { ...headerSettings.tokens, fontFamily: e.target.value },
                        })
                      }
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="inherit">Default Font (Theme Inherit)</option>
                      <option value="Inter, sans-serif">Inter (Modern Clean)</option>
                      <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Crisp Tech)</option>
                      <option value="'Outfit', sans-serif">Outfit (Geometric Brand)</option>
                      <option value="'Playfair Display', serif">Playfair Display (Luxury Editorial)</option>
                      <option value="'Cinzel', serif">Cinzel (High Jewelry Serif)</option>
                      <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech Neo-Grotesque)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Accent Brand Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={headerSettings.tokens.accentColor || '#2563eb'}
                        onChange={(e) =>
                          updateHeaderSettings({
                            tokens: { ...headerSettings.tokens, accentColor: e.target.value },
                          })
                        }
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={headerSettings.tokens.accentColor || '#2563eb'}
                        onChange={(e) =>
                          updateHeaderSettings({
                            tokens: { ...headerSettings.tokens, accentColor: e.target.value },
                          })
                        }
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px', marginBottom: '14px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                      <span>Glassmorphism Backdrop Blur</span>
                      <input
                        type="checkbox"
                        checked={Boolean(headerSettings.tokens?.bgGlass)}
                        onChange={(e) =>
                          updateHeaderSettings({
                            tokens: { ...headerSettings.tokens, bgGlass: e.target.checked },
                          })
                        }
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </label>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      Applies frosted glass filter (`backdrop-filter: blur(12px)`) with semi-transparent background
                    </div>
                  </div>
                </div>
              )}

              {/* 1.2 STRUCTURE TAB */}
              {currentTab === 'structure' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Header Rows ({headerRows.length})
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                    Order and manage participating bands across your storefront header.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {headerRows.map((row, idx) => {
                      const isLockedRow = Boolean(row.isLocked || row.type === 'primary-nav' || row.id === 'row-primary-nav');
                      const displayName = (row.type === 'primary-nav' || row.id === 'row-primary-nav') ? 'Header' : row.name;

                      return (
                        <div
                          key={row.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={14} color="#6366f1" />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{displayName}</span>
                            {isLockedRow && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, color: '#64748b', backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>
                                <Lock size={10} /> Locked
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => idx > 0 && reorderHeaderRows(idx, idx - 1)}
                              disabled={idx === 0}
                              style={{ padding: '4px', background: 'transparent', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                              title="Move Row Up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => idx < headerRows.length - 1 && reorderHeaderRows(idx, idx + 1)}
                              disabled={idx === headerRows.length - 1}
                              style={{ padding: '4px', background: 'transparent', border: 'none', cursor: idx === headerRows.length - 1 ? 'default' : 'pointer', opacity: idx === headerRows.length - 1 ? 0.3 : 1 }}
                              title="Move Row Down"
                            >
                              <ArrowDown size={14} />
                            </button>
                            {isLockedRow ? (
                              <div style={{ padding: '4px', display: 'flex', alignItems: 'center', color: '#94a3b8' }} title="Core component — permanently visible">
                                <Lock size={13} />
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleHeaderRowVisibility(row.id)}
                                style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: row.isVisible ? '#10b981' : '#94a3b8' }}
                                title={row.isVisible ? 'Hide Row' : 'Show Row'}
                              >
                                {row.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                              </button>
                            )}
                            {!isLockedRow && headerRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteHeaderRow(row.id)}
                                style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                title="Delete Row"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => addHeaderRow('header-row', 'Custom Header Row')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#ffffff',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2563eb',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginBottom: '16px',
                    }}
                  >
                    <Plus size={14} /> Add Header Row
                  </button>

                  <div style={{ marginBottom: '16px', padding: '12px', background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Sparkles size={16} color="#2563eb" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>Header Templates & Variants</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                      Browse pre-built commerce, luxury, SaaS, and editorial header arrangements with 1-click preview and apply.
                    </p>
                    <button
                      type="button"
                      onClick={() => openPresetModal()}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
                      }}
                    >
                      <Palette size={13} />
                      Browse Template Gallery ({HEADER_TEMPLATES.length} Styles)
                    </button>
                  </div>

                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '16px 0 10px' }}>
                    Layout Presets
                  </h4>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Structure Preset Quick-Switch
                    </label>
                    <select
                      value={headerSettings.structurePreset || 'standard'}
                      onChange={(e) => updateHeaderSettings({ structurePreset: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      {HEADER_STRUCTURE_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    {(() => {
                      const activePreset = HEADER_STRUCTURE_PRESETS.find(p => p.id === (headerSettings.structurePreset || 'standard'));
                      return activePreset ? (
                        <div style={{ marginTop: '6px', padding: '6px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>
                          📐 {activePreset.diagram}
                        </div>
                      ) : null;
                    })()}
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Header Position
                    </label>
                    <select
                      value={headerSettings.positioning}
                      onChange={(e) => updateHeaderSettings({ positioning: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="static">Static (Document flow)</option>
                      <option value="sticky">Sticky (Sticks to top of viewport)</option>
                      <option value="floating">Floating (Detached overlay pill)</option>
                      <option value="overlay">Hero Overlay (Translucent above hero)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 1.3 CONTENT TAB */}
              {currentTab === 'content' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                    Global Sources & Information
                  </h4>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Global Logo Source
                    </label>
                    <select
                      value={headerSettings.globalLogoSource || 'theme'}
                      onChange={(e) => updateHeaderSettings({ globalLogoSource: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="theme">Default Brand Theme Logo</option>
                      <option value="custom">Custom Header Mark Override</option>
                      <option value="media">Media Library Asset</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Global Navigation Menu Source
                    </label>
                    <select
                      value={headerSettings.globalNavSource || 'main-menu'}
                      onChange={(e) => updateHeaderSettings({ globalNavSource: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="main-menu">Primary Storefront Menu</option>
                      <option value="category-tree">Live Product Categories Tree</option>
                      <option value="custom">Custom Dynamic Navigation</option>
                    </select>
                  </div>

                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '16px 0 10px' }}>
                    Store Contact Info
                  </h4>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Support Phone</label>
                    <input
                      type="text"
                      placeholder="+1 (800) 555-0199"
                      value={headerSettings.storeInfo?.phone || ''}
                      onChange={(e) => updateHeaderSettings({ storeInfo: { ...headerSettings.storeInfo, phone: e.target.value } })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Support Email</label>
                    <input
                      type="email"
                      placeholder="support@billionbiz.io"
                      value={headerSettings.storeInfo?.email || ''}
                      onChange={(e) => updateHeaderSettings({ storeInfo: { ...headerSettings.storeInfo, email: e.target.value } })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              {/* 1.4 BEHAVIOR TAB */}
              {currentTab === 'behavior' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                    Scroll Behavior & Dynamics
                  </h4>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Header Scroll Dynamic
                    </label>
                    <select
                      value={headerSettings.scrollBehavior}
                      onChange={(e) => updateHeaderSettings({ scrollBehavior: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="static">Static (Does not follow scroll)</option>
                      <option value="sticky">Sticky (Always pinned to top)</option>
                      <option value="sticky-after-scroll">Sticky after Scroll Threshold</option>
                      <option value="hide-down-reveal-up">Hide on Scroll Down / Reveal on Scroll Up</option>
                      <option value="shrink-on-scroll">Shrink Height on Scroll</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Hero-Aware Header Integration
                    </label>
                    <select
                      value={headerSettings.heroAwareMode}
                      onChange={(e) => updateHeaderSettings({ heroAwareMode: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="standard">Standard Solid Surface</option>
                      <option value="overlay-hero">Overlay Transparent on Hero</option>
                      <option value="transparent-hero">Transparent to Solid after Scroll</option>
                      <option value="auto-contrast">Auto-Contrast (Invert on Dark Hero)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Scroll Activation Threshold ({headerSettings.stickyThreshold}px)
                    </label>
                    <input
                      type="range"
                      min={20}
                      max={300}
                      value={headerSettings.stickyThreshold}
                      onChange={(e) => updateHeaderSettings({ stickyThreshold: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Navigation Menu Interaction
                    </label>
                    <select
                      value={headerSettings.navInteraction}
                      onChange={(e) => updateHeaderSettings({ navInteraction: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="hover">Hover (Immediate open on pointer)</option>
                      <option value="click">Click to Toggle</option>
                      <option value="hybrid">Hybrid (Hover desktop, click mobile)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Mega Menu Trigger Dynamic
                    </label>
                    <select
                      value={headerSettings.megaMenuBehavior || 'hover-open'}
                      onChange={(e) => updateHeaderSettings({ megaMenuBehavior: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="hover-open">Hover Open (With 150ms intent buffer)</option>
                      <option value="delayed-open">Delayed Open (Prevents accidental triggers)</option>
                      <option value="click-open">Click Required to Open</option>
                      <option value="instant-open">Instant Open (No Delay)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Global Search Interaction Style
                    </label>
                    <select
                      value={headerSettings.searchMode || 'dropdown'}
                      onChange={(e) => updateHeaderSettings({ searchMode: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="dropdown">Dropdown Panel (Below Search)</option>
                      <option value="overlay">Full-Page Backdrop Modal</option>
                      <option value="command">Command Palette / Spotlight Search</option>
                      <option value="full-screen">Full Screen Search Takeover</option>
                      <option value="inline">Expand Inline Input</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Sticky Transition Animation
                    </label>
                    <select
                      value={headerSettings.transitions || 'slide'}
                      onChange={(e) => updateHeaderSettings({ transitions: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="slide">Smooth Slide Down</option>
                      <option value="fade">Subtle Fade In</option>
                      <option value="compress">Compress Height on Scroll</option>
                      <option value="none">Instant Jump (No Animation)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 1.5 RESPONSIVE TAB */}
              {currentTab === 'responsive' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                    Responsive Rules & Breakpoints
                  </h4>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Mobile Menu Style
                    </label>
                    <select
                      value={headerSettings.mobileMenuType}
                      onChange={(e) => updateHeaderSettings({ mobileMenuType: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="drawer">Slide-in Drawer (Left)</option>
                      <option value="full-screen">Full Screen Modal</option>
                      <option value="bottom-sheet">Modern Bottom Sheet</option>
                      <option value="accordion">Accordion Dropdown</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Mobile Logo Width ({headerSettings.responsiveRules.mobile.logoWidth}px)
                    </label>
                    <input
                      type="range"
                      min={60}
                      max={160}
                      value={headerSettings.responsiveRules.mobile.logoWidth}
                      onChange={(e) =>
                        updateHeaderSettings({
                          responsiveRules: {
                            ...headerSettings.responsiveRules,
                            mobile: { ...headerSettings.responsiveRules.mobile, logoWidth: parseInt(e.target.value) },
                          },
                        })
                      }
                      style={{ width: '100%' }}
                    />
                  </div>

                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '16px 0 10px' }}>
                    Mobile Actions Visibility
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={headerSettings.responsiveRules.mobile.showSearch}
                        onChange={(e) =>
                          updateHeaderSettings({
                            responsiveRules: {
                              ...headerSettings.responsiveRules,
                              mobile: { ...headerSettings.responsiveRules.mobile, showSearch: e.target.checked },
                            },
                          })
                        }
                      />
                      <span>Show Search Trigger on Mobile</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={headerSettings.responsiveRules.mobile.showCart}
                        onChange={(e) =>
                          updateHeaderSettings({
                            responsiveRules: {
                              ...headerSettings.responsiveRules,
                              mobile: { ...headerSettings.responsiveRules.mobile, showCart: e.target.checked },
                            },
                          })
                        }
                      />
                      <span>Show Cart Badge on Mobile</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={headerSettings.responsiveRules.mobile.showAccount}
                        onChange={(e) =>
                          updateHeaderSettings({
                            responsiveRules: {
                              ...headerSettings.responsiveRules,
                              mobile: { ...headerSettings.responsiveRules.mobile, showAccount: e.target.checked },
                            },
                          })
                        }
                      />
                      <span>Show Account Icon on Mobile</span>
                    </label>
                  </div>
                </div>
              )}

              {/* 1.6 ADVANCED TAB */}
              {currentTab === 'advanced' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                    Accessibility & SEO
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                    <input
                      type="checkbox"
                      checked={headerSettings.accessibility.skipToContent}
                      onChange={(e) =>
                        updateHeaderSettings({
                          accessibility: { ...headerSettings.accessibility, skipToContent: e.target.checked },
                        })
                      }
                    />
                    <span>Include "Skip to Main Content" WCAG link</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                    <input
                      type="checkbox"
                      checked={headerSettings.seo.logoH1OnHome}
                      onChange={(e) =>
                        updateHeaderSettings({
                          seo: { ...headerSettings.seo, logoH1OnHome: e.target.checked },
                        })
                      }
                    />
                    <span>Semantic &lt;h1&gt; on Storefront Logo</span>
                  </label>

                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '16px 0 10px' }}>
                    Audience Display Rules
                  </h4>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Audience Targeting
                    </label>
                    <select
                      value={headerSettings.displayRules.targetAudience}
                      onChange={(e) =>
                        updateHeaderSettings({
                          displayRules: { ...headerSettings.displayRules, targetAudience: e.target.value as any },
                        })
                      }
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="all">All Storefront Visitors</option>
                      <option value="logged-in">Logged-in Members Only</option>
                      <option value="guest">Guest / First-Time Shoppers Only</option>
                    </select>
                  </div>

                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '16px 0 10px' }}>
                    Custom CSS & Classes
                  </h4>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>CSS Class Names</label>
                    <input
                      type="text"
                      placeholder="e.g. sticky-header luxury-nav"
                      value={headerSettings.customClasses || ''}
                      onChange={(e) => updateHeaderSettings({ customClasses: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* FOOTER GLOBAL SETTINGS */
            <>
              {currentTab === 'style' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                    Footer Surface & Styling
                  </h4>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Footer Background Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={footerSettings.tokens.bgColor}
                        onChange={(e) =>
                          updateFooterSettings({
                            tokens: { ...footerSettings.tokens, bgColor: e.target.value },
                          })
                        }
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={footerSettings.tokens.bgColor}
                        onChange={(e) =>
                          updateFooterSettings({
                            tokens: { ...footerSettings.tokens, bgColor: e.target.value },
                          })
                        }
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'behavior' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                    Back to Top & Motion
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '14px' }}>
                    <input
                      type="checkbox"
                      checked={footerSettings.backToTop}
                      onChange={(e) => updateFooterSettings({ backToTop: e.target.checked })}
                    />
                    <span>Show Back to Top floating button</span>
                  </label>
                </div>
              )}

              {currentTab === 'responsive' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                    Mobile Stack Layout
                  </h4>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Mobile Directory Behavior
                    </label>
                    <select
                      value={footerSettings.responsiveRules.mobile.layout}
                      onChange={(e) =>
                        updateFooterSettings({
                          responsiveRules: {
                            ...footerSettings.responsiveRules,
                            mobile: { ...footerSettings.responsiveRules.mobile, layout: e.target.value as any },
                          },
                        })
                      }
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="accordion">Collapsible Accordions</option>
                      <option value="stack">Full Vertical Stack</option>
                    </select>
                  </div>
                </div>
              )}

              {currentTab === 'advanced' && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                    Legal & Compliance
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                    <input
                      type="checkbox"
                      checked={footerSettings.accessibility.ariaLabels}
                      onChange={(e) =>
                        updateFooterSettings({
                          accessibility: { ...footerSettings.accessibility, ariaLabels: e.target.checked },
                        })
                      }
                    />
                    <span>Include landmark role="contentinfo"</span>
                  </label>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // 2. ROW INSPECTOR (Header or Footer)
  // ──────────────────────────────────────────────────────────
  if (selectedTarget.type === 'row') {
    const isHeader = selectedTarget.editorType === 'header' || selectedTarget.editorType === undefined;
    const headerRow = isHeader
      ? (effectiveHeaderRows.find((r) =>
          r.id === selectedTarget.rowId ||
          (selectedTarget.rowId === 'announcement-bar' && (r.type === 'announcement' || r.id.includes('announcement'))) ||
          (selectedTarget.rowId === 'utility-bar' && (r.type === 'utility' || r.id.includes('utility'))) ||
          ((selectedTarget.rowId === 'category-bar' || selectedTarget.rowId === 'secondary-nav') && (r.type === 'secondary-nav' || r.id.includes('secondary') || r.id.includes('category'))) ||
          (selectedTarget.rowId === 'header-main' && (r.type === 'primary-nav' || r.id.includes('primary')))
        ) || effectiveHeaderRows.find((r) => r.type === 'primary-nav') || effectiveHeaderRows[0])
      : undefined;

    if (isHeader && headerRow) {
      if (
        headerRow.type === 'announcement' ||
        headerRow.id === 'row-announcement' ||
        headerRow.id.includes('announcement') ||
        selectedTarget.rowId === 'announcement-bar'
      ) {
        return <AnnouncementBarRightEditor onClose={closeRightSidebar} />;
      }
      if (
        headerRow.type === 'utility' ||
        headerRow.id === 'row-utility' ||
        headerRow.id.includes('utility') ||
        selectedTarget.rowId === 'utility-bar'
      ) {
        return <UtilityBarRightEditor onClose={closeRightSidebar} />;
      }
      return <HeaderSectionInspector row={headerRow} onClose={closeRightSidebar} />;
    }

    const resolvedFooterRowId = !isHeader ? resolveFooterRowId(selectedTarget.rowId, footerRows) : null;
    const footerRow = !isHeader
      ? (footerRows.find((r) => r.id === selectedTarget.rowId) ||
         footerRows.find((r) => r.id === resolvedFooterRowId) ||
         footerRows.find((r) => r.type === 'navigation') ||
         footerRows[0])
      : undefined;

    if (!isHeader) {
      return null;
    }
    const row = headerRow || footerRow;

    if (!row) return null;

    const primaryElement = isHeader
      ? (headerRow as HeaderRow)?.elements?.[0]
      : (footerRow as FooterRow)?.columns?.[0]?.elements?.[0];

    const rowTabs = [
      { id: 'style', label: 'Style', icon: Palette },
      { id: 'content', label: 'Content', icon: FileText },
      { id: 'layout', label: 'Layout', icon: Layout },
      { id: 'behavior', label: 'Behavior', icon: Sliders },
      { id: 'responsive', label: 'Responsive', icon: Smartphone },
      { id: 'advanced', label: 'Advanced', icon: Code },
    ];

    const currentTab = rowTabs.some((t) => t.id === activeTab) ? activeTab : 'style';

    const handleUpdateRowContent = (propsUpdate: Record<string, any>) => {
      if (isHeader) {
        if (primaryElement) {
          updateHeaderElement(row.id, primaryElement.id, {
            props: { ...primaryElement.props, ...propsUpdate },
          });
        }
      } else {
        if (primaryElement) {
          updateFooterElement(row.id, primaryElement.id, {
            props: { ...primaryElement.props, ...propsUpdate },
          });
        }
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className={styles.panelHeader}>
          <div className={styles.phLeft}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={closeRightSidebar}
              title="Collapse sidebar"
            >
              <ChevronRight size={20} className={styles.backIcon} />
            </button>
            <h3 className={styles.fw600}>{row.name}</h3>
          </div>
        </div>

        {/* Exact EditorRightSidebar Tabs Header with Chevron Scroll Buttons */}
        <ScrollableTabsBar
          tabs={rowTabs}
          activeTab={currentTab}
          onTabChange={setActiveTab}
        />

        <div className={styles.propContent} style={{ padding: '16px', gap: '16px', overflowY: 'auto' }}>
          {/* ─── 1. STYLE TAB (Default Design) ─── */}
          {currentTab === 'style' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Background Color
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={row.styling.bgColor || '#ffffff'}
                    onChange={(e) => {
                      if (isHeader) updateHeaderRow(row.id, { styling: { ...(row as HeaderRow).styling, bgColor: e.target.value } });
                      else updateFooterRow(row.id, { styling: { ...(row as FooterRow).styling, bgColor: e.target.value } });
                    }}
                    style={{ width: '38px', height: '38px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={row.styling.bgColor || '#ffffff'}
                    onChange={(e) => {
                      if (isHeader) updateHeaderRow(row.id, { styling: { ...(row as HeaderRow).styling, bgColor: e.target.value } });
                      else updateFooterRow(row.id, { styling: { ...(row as FooterRow).styling, bgColor: e.target.value } });
                    }}
                    style={{ flex: 1, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Text Color
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={row.styling.textColor || '#0f172a'}
                    onChange={(e) => {
                      if (isHeader) updateHeaderRow(row.id, { styling: { ...(row as HeaderRow).styling, textColor: e.target.value } });
                      else updateFooterRow(row.id, { styling: { ...(row as FooterRow).styling, textColor: e.target.value } });
                    }}
                    style={{ width: '38px', height: '38px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={row.styling.textColor || '#0f172a'}
                    onChange={(e) => {
                      if (isHeader) updateHeaderRow(row.id, { styling: { ...(row as HeaderRow).styling, textColor: e.target.value } });
                      else updateFooterRow(row.id, { styling: { ...(row as FooterRow).styling, textColor: e.target.value } });
                    }}
                    style={{ flex: 1, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {isHeader && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      Row Height
                    </label>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {((row as HeaderRow).layout.height || 40)}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={28}
                    max={120}
                    value={(row as HeaderRow).layout.height || 40}
                    onChange={(e) => updateHeaderRow(row.id, { layout: { ...(row as HeaderRow).layout, height: parseInt(e.target.value) } })}
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Horizontal Spacing
                  </label>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {row.layout.paddingX ?? 20}px
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={row.layout.paddingX ?? 20}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isHeader) updateHeaderRow(row.id, { layout: { ...(row as HeaderRow).layout, paddingX: val } });
                    else updateFooterRow(row.id, { layout: { ...(row as FooterRow).layout, paddingX: val } });
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Shadow Style
                </label>
                <select
                  value={row.styling.shadow || 'none'}
                  onChange={(e) => {
                    if (isHeader) updateHeaderRow(row.id, { styling: { ...(row as HeaderRow).styling, shadow: e.target.value as any } });
                    else updateFooterRow(row.id, { styling: { ...(row as FooterRow).styling, shadow: e.target.value as any } });
                  }}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="none">None</option>
                  <option value="soft">Soft Subtle</option>
                  <option value="medium">Medium Elevated</option>
                  <option value="strong">High Contrast Strong</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(row.styling.borderBottom)}
                    onChange={(e) => {
                      if (isHeader) updateHeaderRow(row.id, { styling: { ...(row as HeaderRow).styling, borderBottom: e.target.checked } });
                      else updateFooterRow(row.id, { styling: { ...(row as FooterRow).styling, borderBottom: e.target.checked } });
                    }}
                  />
                  <span>Show Bottom Border Divider</span>
                </label>
              </div>

              {row.styling.borderBottom && (
                <div style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#64748b', marginBottom: '4px' }}>
                    Border Color
                  </label>
                  <input
                    type="text"
                    value={row.styling.borderColor || '#e2e8f0'}
                    onChange={(e) => {
                      if (isHeader) updateHeaderRow(row.id, { styling: { ...(row as HeaderRow).styling, borderColor: e.target.value } });
                      else updateFooterRow(row.id, { styling: { ...(row as FooterRow).styling, borderColor: e.target.value } });
                    }}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ─── 2. CONTENT TAB (Contents & Copy) ─── */}
          {currentTab === 'content' && (
            <div>
              {/* ANNOUNCEMENT BAR CONTENT */}
              {row.type === 'announcement' && (
                <div>
                  {/* Variant Selector */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                      Announcement Bar Layout Variant
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {ANNOUNCEMENT_VARIANTS.map((v) => {
                        const isCurrent = (primaryElement?.props?.variant || 'single') === v.id;
                        return (
                          <div
                            key={v.id}
                            onClick={() => {
                              handleUpdateRowContent({
                                variant: v.id,
                                mode: v.id === 'marquee' ? 'marquee' : v.id === 'carousel' ? 'slider' : 'static',
                                ...v.defaultProps,
                              });
                            }}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: isCurrent ? '2px solid #2563eb' : '1px solid #cbd5e1',
                              backgroundColor: isCurrent ? '#eff6ff' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '12px', fontWeight: isCurrent ? 700 : 600, color: isCurrent ? '#1d4ed8' : '#0f172a' }}>
                                {v.name}
                              </span>
                              {isCurrent && <Check size={13} color="#2563eb" />}
                            </div>
                            <span style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.2 }}>
                              {v.description}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multi-item manager for Carousel, Marquee, Multi-Slot */}
                  {(primaryElement?.props?.variant === 'carousel' ||
                    primaryElement?.props?.variant === 'marquee' ||
                    primaryElement?.props?.variant === 'multi-slot') ? (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                          Announcements List ({(primaryElement?.props?.slides || primaryElement?.props?.announcements || []).length})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const currentSlides = primaryElement?.props?.slides || primaryElement?.props?.announcements || [
                              { text: primaryElement?.props?.text || 'Special promotion order now!' }
                            ];
                            const newSlide = {
                              id: `slide-${Date.now()}`,
                              text: '✨ New Special Announcement! Use code BB2026',
                              link: '/collections',
                              badge: 'PROMO',
                              cta: 'Shop Now',
                            };
                            handleUpdateRowContent({
                              slides: [...currentSlides, newSlide],
                              announcements: [...currentSlides, newSlide],
                            });
                          }}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#2563eb',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Plus size={12} /> Add Slide
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(primaryElement?.props?.slides || primaryElement?.props?.announcements || [
                          { text: primaryElement?.props?.text || '✨ Free worldwide shipping on orders over $99! Use code FREESHIP', link: '/offers', badge: 'SALE' }
                        ]).map((slide: any, sIdx: number) => (
                          <div
                            key={sIdx}
                            style={{
                              padding: '10px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Slide #{sIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentSlides = primaryElement?.props?.slides || primaryElement?.props?.announcements || [];
                                  const next = currentSlides.filter((_: any, i: number) => i !== sIdx);
                                  handleUpdateRowContent({ slides: next, announcements: next });
                                }}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                                title="Remove announcement"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Announcement message..."
                              value={slide.text || ''}
                              onChange={(e) => {
                                const currentSlides = [...(primaryElement?.props?.slides || primaryElement?.props?.announcements || [])];
                                currentSlides[sIdx] = { ...currentSlides[sIdx], text: e.target.value };
                                handleUpdateRowContent({ slides: currentSlides, announcements: currentSlides });
                              }}
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                              <input
                                type="text"
                                placeholder="Link URL (/sale)"
                                value={slide.link || ''}
                                onChange={(e) => {
                                  const currentSlides = [...(primaryElement?.props?.slides || primaryElement?.props?.announcements || [])];
                                  currentSlides[sIdx] = { ...currentSlides[sIdx], link: e.target.value };
                                  handleUpdateRowContent({ slides: currentSlides, announcements: currentSlides });
                                }}
                                style={{ padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}
                              />
                              <input
                                type="text"
                                placeholder="Badge (SALE)"
                                value={slide.badge || ''}
                                onChange={(e) => {
                                  const currentSlides = [...(primaryElement?.props?.slides || primaryElement?.props?.announcements || [])];
                                  currentSlides[sIdx] = { ...currentSlides[sIdx], badge: e.target.value };
                                  handleUpdateRowContent({ slides: currentSlides, announcements: currentSlides });
                                }}
                                style={{ padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Single, Split, or Countdown view */
                    <div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Notice Message
                        </label>
                        <textarea
                          rows={2}
                          value={
                            primaryElement?.props?.text ||
                            primaryElement?.props?.announcements?.[0]?.text ||
                            '✨ Free worldwide shipping on orders over $99! Use code FREESHIP'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateRowContent({
                              text: val,
                              announcements: [
                                { text: val, link: primaryElement?.props?.link || '/collections/sale', badge: primaryElement?.props?.badge || 'SALE' },
                              ],
                            });
                          }}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            Badge Tag
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. SALE, HOT"
                            value={primaryElement?.props?.badge || 'SALE'}
                            onChange={(e) => handleUpdateRowContent({ badge: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            CTA Button Label
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Shop Now"
                            value={primaryElement?.props?.ctaText || 'Shop Now'}
                            onChange={(e) => handleUpdateRowContent({ ctaText: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          CTA Destination URL
                        </label>
                        <input
                          type="text"
                          placeholder="/collections/sale"
                          value={primaryElement?.props?.link || primaryElement?.props?.ctaLink || '/collections/sale'}
                          onChange={(e) => handleUpdateRowContent({ link: e.target.value, ctaLink: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                        />
                      </div>

                      {(primaryElement?.props?.variant === 'countdown' || primaryElement?.props?.showCountdown) && (
                        <div style={{ marginBottom: '14px', padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
                            ⏳ Countdown Target Date & Time
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2026-12-31T23:59:59"
                            value={primaryElement?.props?.countdownTarget || '2026-12-31T23:59:59'}
                            onChange={(e) => handleUpdateRowContent({ countdownTarget: e.target.value, showCountdown: true })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '12px' }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Close button toggle */}
                  <div style={{ marginTop: '12px', padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={primaryElement?.props?.showCloseButton !== false && primaryElement?.props?.closeable !== false}
                        onChange={(e) => handleUpdateRowContent({ showCloseButton: e.target.checked, closeable: e.target.checked })}
                      />
                      <span>Show Dismiss / Close Button (✕)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* UTILITY BAR CONTENT */}
              {row.type === 'utility' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Customer Support Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+1 (800) 555-0199"
                      value={primaryElement?.props?.phone || '+1 (800) 555-0199'}
                      onChange={(e) => handleUpdateRowContent({ phone: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Support Email
                    </label>
                    <input
                      type="text"
                      placeholder="support@billionbiz.com"
                      value={primaryElement?.props?.email || 'support@billionbiz.com'}
                      onChange={(e) => handleUpdateRowContent({ email: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Greeting / Secondary Notice
                    </label>
                    <input
                      type="text"
                      placeholder="Welcome to BillionBiz Store"
                      value={primaryElement?.props?.welcomeMessage || 'Welcome to BillionBiz Store'}
                      onChange={(e) => handleUpdateRowContent({ welcomeMessage: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Order Tracking URL
                    </label>
                    <input
                      type="text"
                      placeholder="/track-order"
                      value={primaryElement?.props?.trackOrderLink || '/track-order'}
                      onChange={(e) => handleUpdateRowContent({ trackOrderLink: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Currency & Language Selector
                    </label>
                    <input
                      type="text"
                      placeholder="English | USD ($)"
                      value={primaryElement?.props?.currency || 'USD ($) | English'}
                      onChange={(e) => handleUpdateRowContent({ currency: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              {/* SECONDARY NAV / CATALOG */}
              {row.type === 'secondary-nav' && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                    Catalog Category Links
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                    Default navigation categories displayed as horizontal pills:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(primaryElement?.props?.links || [
                      { label: '🔥 All Deals', href: '/deals' },
                      { label: 'New Arrivals', href: '/new' },
                      { label: 'Best Sellers', href: '/best-sellers' },
                      { label: 'Collections', href: '/collections' },
                      { label: 'Gift Cards', href: '/gift-cards' },
                      { label: 'Clearance', href: '/sale' },
                    ]).map((link: any, lIdx: number) => (
                      <div key={lIdx} style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const newLinks = [...(primaryElement?.props?.links || [])];
                            if (newLinks[lIdx]) {
                              newLinks[lIdx].label = e.target.value;
                              handleUpdateRowContent({ links: newLinks });
                            }
                          }}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          value={link.href}
                          onChange={(e) => {
                            const newLinks = [...(primaryElement?.props?.links || [])];
                            if (newLinks[lIdx]) {
                              newLinks[lIdx].href = e.target.value;
                              handleUpdateRowContent({ links: newLinks });
                            }
                          }}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CAMPAIGN PROMO BAR */}
              {row.type === 'promo' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Promo Headline
                    </label>
                    <input
                      type="text"
                      value={primaryElement?.props?.headline || 'Limited Time Offer: Extra 20% Off Everything'}
                      onChange={(e) => handleUpdateRowContent({ headline: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      value={primaryElement?.props?.couponCode || 'SAVE20'}
                      onChange={(e) => handleUpdateRowContent({ couponCode: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Button CTA
                    </label>
                    <input
                      type="text"
                      value={primaryElement?.props?.ctaText || 'Claim Discount'}
                      onChange={(e) => handleUpdateRowContent({ ctaText: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              {/* PRIMARY HEADER ROW / HEADER-ROW CONTENT */}
              {(row.type === 'primary-nav' || row.type === 'header-row' || row.type === 'custom-row') && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Header Elements ({(row as HeaderRow).elements?.length || 0})
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                    Components included in this header band. Select an element to edit its content and styles.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {(row as HeaderRow).elements?.map((el) => {
                      const isLocked = Boolean(el.isLocked || el.id === 'el-logo' || el.id === 'el-nav-links' || el.id === 'el-actions');
                      return (
                        <div
                          key={el.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                          }}
                        >
                          <div
                            onClick={() => {
                              useEditorContextStore.getState().selectTarget({
                                type: 'element',
                                editorType: 'header',
                                rowId: row.id,
                                elementId: el.id,
                                elementType: el.type,
                              });
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>
                              {el.name}
                            </span>
                            <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>
                              {el.type}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => toggleHeaderElementVisibility(row.id, el.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: el.isVisible !== false ? '#10b981' : '#94a3b8', padding: '3px' }}
                              title={el.isVisible !== false ? 'Hide Element' : 'Show Element'}
                            >
                              {el.isVisible !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => {
                                  useEditorContextStore.getState().deleteHeaderElement(row.id, el.id);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '3px' }}
                                title="Delete Element"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TRUST & BADGES BAR (FOOTER) */}
              {row.type === 'trust' && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                    Trust Guarantees & Badges
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(primaryElement?.props?.items || [
                      { title: 'Bank-Grade Security', description: '256-bit SSL encrypted payments' },
                      { title: 'Fast Free Delivery', description: 'Orders shipped in 24 hours' },
                      { title: '30-Day Guarantees', description: 'Zero question return policy' },
                      { title: '24/7 Priority Support', description: 'Direct access to support specialists' },
                    ]).map((item: any, iIdx: number) => (
                      <div key={iIdx} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...(primaryElement?.props?.items || [])];
                            if (newItems[iIdx]) {
                              newItems[iIdx].title = e.target.value;
                              handleUpdateRowContent({ items: newItems });
                            }
                          }}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...(primaryElement?.props?.items || [])];
                            if (newItems[iIdx]) {
                              newItems[iIdx].description = e.target.value;
                              handleUpdateRowContent({ items: newItems });
                            }
                          }}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', color: '#64748b' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NEWSLETTER HERO BAR (FOOTER) */}
              {row.type === 'newsletter' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Headline
                    </label>
                    <input
                      type="text"
                      value={primaryElement?.props?.headline || 'Join Our VIP Insider List'}
                      onChange={(e) => handleUpdateRowContent({ headline: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Description Copy
                    </label>
                    <textarea
                      rows={2}
                      value={primaryElement?.props?.description || 'Get 15% off your first order plus early access to private sales.'}
                      onChange={(e) => handleUpdateRowContent({ description: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Input Placeholder
                    </label>
                    <input
                      type="text"
                      value={primaryElement?.props?.placeholder || 'Enter your email address...'}
                      onChange={(e) => handleUpdateRowContent({ placeholder: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={primaryElement?.props?.buttonText || 'Subscribe'}
                      onChange={(e) => handleUpdateRowContent({ buttonText: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              {/* BRAND & BIO BAR */}
              {row.type === 'brand' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Brand Title
                    </label>
                    <input
                      type="text"
                      value={primaryElement?.props?.title || 'BillionBiz'}
                      onChange={(e) => handleUpdateRowContent({ title: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Brand Bio Description
                    </label>
                    <textarea
                      rows={3}
                      value={primaryElement?.props?.text || 'Empowering modern online merchants with frictionless store infrastructure, intelligent workflows, and conversion-optimized retail tools.'}
                      onChange={(e) => handleUpdateRowContent({ text: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              {/* PAYMENT & SECURITY BAR */}
              {row.type === 'payment' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Heading
                    </label>
                    <input
                      type="text"
                      value={primaryElement?.props?.heading || 'Accepted Payment Methods'}
                      onChange={(e) => handleUpdateRowContent({ heading: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Supported payment methods: Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay.
                  </div>
                </div>
              )}

              {/* LEGAL & POLICIES BAR */}
              {row.type === 'legal' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Copyright Statement
                    </label>
                    <textarea
                      rows={2}
                      value={primaryElement?.props?.text || '© 2026 BillionBiz, Inc. All rights reserved.'}
                      onChange={(e) => handleUpdateRowContent({ text: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={primaryElement?.props?.showBackToTop ?? true}
                        onChange={(e) => handleUpdateRowContent({ showBackToTop: e.target.checked })}
                      />
                      <span>Show Back to Top Button</span>
                    </label>
                  </div>
                </div>
              )}

              {/* SOCIAL MEDIA BAR */}
              {row.type === 'social' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Section Heading
                    </label>
                    <input
                      type="text"
                      value={primaryElement?.props?.heading || 'Follow Us'}
                      onChange={(e) => handleUpdateRowContent({ heading: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              {/* HEADER PRIMARY NAVBAR */}
              {row.type === 'primary-nav' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>
                    This is your primary Header navigation row. Child elements (Logo, Navigation, Actions) can be edited individually from the left sidebar tree or altered here.
                  </p>
                  <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Composed Child Elements:</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {(row as HeaderRow).elements.map((el) => el.name).join(', ')}
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER DIRECTORY */}
              {row.type === 'navigation' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>
                    This is your primary multi-column Footer directory. Use the left sidebar to add directory columns or edit links within each column.
                  </p>
                  <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Columns:</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {((row as FooterRow).columns || []).length} directory columns configured
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOM ROW FALLBACK */}
              {(row.type === 'custom-row' || row.type === 'header-row') && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Row Section Name
                    </label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => {
                        if (isHeader) updateHeaderRow(row.id, { name: e.target.value });
                        else updateFooterRow(row.id, { name: e.target.value });
                      }}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── 3. LAYOUT TAB ─── */}
          {currentTab === 'layout' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                  Container Width
                </label>
                <select
                  value={row.layout.container}
                  onChange={(e) => {
                    if (isHeader) updateHeaderRow(row.id, { layout: { ...(row as HeaderRow).layout, container: e.target.value as any } });
                    else updateFooterRow(row.id, { layout: { ...(row as FooterRow).layout, container: e.target.value as any } });
                  }}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="constrained">Constrained (Standard Container)</option>
                  <option value="full">Full Width (Edge-to-Edge)</option>
                  <option value="boxed">Boxed (Inset with Margin)</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                  Vertical Padding ({row.layout.paddingY}px)
                </label>
                <input
                  type="range"
                  min={4}
                  max={60}
                  value={row.layout.paddingY}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isHeader) updateHeaderRow(row.id, { layout: { ...(row as HeaderRow).layout, paddingY: val } });
                    else updateFooterRow(row.id, { layout: { ...(row as FooterRow).layout, paddingY: val } });
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* ─── 4. BEHAVIOR TAB ─── */}
          {currentTab === 'behavior' && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={row.isVisible}
                  onChange={() => {
                    if (isHeader) toggleHeaderRowVisibility(row.id);
                  }}
                />
                <span>Row is Visible</span>
              </label>
            </div>
          )}

          {/* ─── 5. RESPONSIVE TAB ─── */}
          {currentTab === 'responsive' && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={row.responsive?.showOnDesktop ?? true}
                  onChange={(e) => {
                    const updates = { responsive: { ...row.responsive, showOnDesktop: e.target.checked } };
                    if (isHeader) updateHeaderRow(row.id, updates);
                    else updateFooterRow(row.id, updates);
                  }}
                />
                <span>Visible on Desktop</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={row.responsive?.showOnMobile ?? true}
                  onChange={(e) => {
                    const updates = { responsive: { ...row.responsive, showOnMobile: e.target.checked } };
                    if (isHeader) updateHeaderRow(row.id, updates);
                    else updateFooterRow(row.id, updates);
                  }}
                />
                <span>Visible on Mobile</span>
              </label>
            </div>
          )}

          {/* ─── 6. ADVANCED TAB ─── */}
          {currentTab === 'advanced' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                Custom CSS Class
              </label>
              <input
                type="text"
                placeholder="e.g. hero-announcement-bar"
                value={row.styling.customClass || ''}
                onChange={(e) => {
                  if (isHeader) updateHeaderRow(row.id, { styling: { ...(row as HeaderRow).styling, customClass: e.target.value } });
                  else updateFooterRow(row.id, { styling: { ...(row as FooterRow).styling, customClass: e.target.value } });
                }}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // 3. ELEMENT INSPECTOR (16 Composable Header Items & Footer)
  // ──────────────────────────────────────────────────────────
  if (selectedTarget.type === 'element') {
    const isHeader = selectedTarget.editorType === 'header' || selectedTarget.editorType === undefined;
    const regKey = `${selectedTarget.editorType || 'header'}:${selectedTarget.elementType}`;
    const registration = COMPONENT_REGISTRY[regKey];

    // Find element
    let element: any = null;
    let containingRow: any = null;
    if (isHeader) {
      containingRow = effectiveHeaderRows.find((r: any) => r.id === selectedTarget.rowId);
      if (!containingRow) {
        containingRow = effectiveHeaderRows.find((r: any) => r.elements?.some((e: any) => e.id === selectedTarget.elementId));
      }
      if (!containingRow) {
        containingRow = effectiveHeaderRows.find((r: any) => r.type === 'primary-nav') || effectiveHeaderRows[0];
      }
      element = containingRow?.elements?.find((e: any) => e.id === selectedTarget.elementId);
      if (!element && containingRow?.elements?.length) {
        element = containingRow.elements[0];
      }
      if (element && containingRow) {
        if (
          containingRow.type === 'announcement' ||
          containingRow.id?.includes('announcement') ||
          selectedTarget.elementType === 'announcement-bar' ||
          selectedTarget.elementId === 'el-announcement-content' ||
          element.type === 'announcement-bar' ||
          element.type === 'promo-text'
        ) {
          return <AnnouncementBarRightEditor onClose={closeRightSidebar} />;
        }
        if (
          containingRow.type === 'utility' ||
          containingRow.id?.includes('utility') ||
          selectedTarget.elementType === 'utility-bar' ||
          selectedTarget.elementType === 'utility-nav' ||
          selectedTarget.elementId === 'el-utility-content' ||
          element.type === 'utility-bar' ||
          element.type === 'utility-nav'
        ) {
          return <UtilityBarRightEditor onClose={closeRightSidebar} />;
        }
        if (containingRow.type !== 'primary-nav') {
          return <HeaderSectionInspector row={containingRow} onClose={closeRightSidebar} />;
        }
        return (
          <ChildItemOverlayInspector
            element={element}
            row={containingRow}
            onClose={() => {
              useEditorContextStore.getState().selectTarget({
                type: 'row',
                editorType: 'header',
                rowId: containingRow.id,
              });
              useEditorContextStore.getState().setActiveTab('content');
            }}
          />
        );
      }
    } else {
      let row = footerRows.find((r) => r.id === selectedTarget.rowId);
      if (!row) {
        for (const candidate of footerRows) {
          for (const col of candidate.columns || []) {
            if (col.elements.some((e) => e.id === selectedTarget.elementId)) {
              row = candidate;
              break;
            }
          }
          if (row) break;
        }
      }
      for (const col of row?.columns || []) {
        const found = col.elements.find((e) => e.id === selectedTarget.elementId);
        if (found) {
          element = found;
          break;
        }
      }
      if (element && row) {
        return (
          <ChildItemOverlayInspector
            element={element}
            row={row}
            editorType="footer"
            onClose={() => {
              useEditorContextStore.getState().selectTarget({
                type: 'row',
                editorType: 'footer',
                rowId: row!.id,
              });
              useEditorContextStore.getState().setActiveTab('columns');
            }}
          />
        );
      }
    }

    if (!element) {
      if (isHeader && effectiveHeaderRows[0]) {
        return <HeaderSectionInspector row={effectiveHeaderRows[0]} onClose={closeRightSidebar} />;
      }
      if (!isHeader) {
        return null;
      }
      return null;
    }

    // Declared capabilities
    const capabilities: ComponentCapability[] =
      registration?.capabilities || element.capabilities || ['style', 'content', 'responsive', 'advanced'];

    const sortedCapabilities = CAPABILITY_ORDER.filter((c) => capabilities.includes(c));
    const currentTab = sortedCapabilities.includes(activeTab as any)
      ? (activeTab as ComponentCapability)
      : sortedCapabilities[0] || 'style';

    const handleUpdateProps = (newProps: Record<string, any>) => {
      if (isHeader) {
        updateHeaderElement(selectedTarget.rowId, element.id, {
          props: { ...element.props, ...newProps },
        });
      } else {
        updateFooterElement(selectedTarget.rowId, element.id, {
          props: { ...element.props, ...newProps },
        });
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className={styles.panelHeader}>
          <div className={styles.phLeft}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={closeRightSidebar}
              title="Collapse sidebar"
            >
              <ChevronRight size={20} className={styles.backIcon} />
            </button>
            <h3 className={styles.fw600}>{element.name}</h3>
          </div>
        </div>

        {/* Breadcrumb Navigation Trail */}
        {isHeader && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '11px',
              background: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
              color: '#64748b',
            }}
          >
            <span
              onClick={() => useEditorContextStore.getState().selectTarget({ type: 'global', editorType: 'header' })}
              style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 500 }}
              title="Go to Global Header Settings"
            >
              Header
            </span>
            <ChevronRight size={12} color="#94a3b8" />
            <span
              onClick={() => {
                const r = headerRows.find((x) => x.id === selectedTarget.rowId);
                if (r) {
                  useEditorContextStore.getState().selectTarget({ type: 'row', editorType: 'header', rowId: r.id });
                }
              }}
              style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 500 }}
              title="Go to parent row"
            >
              {headerRows.find((x) => x.id === selectedTarget.rowId)?.name || 'Row'}
            </span>
            <ChevronRight size={12} color="#94a3b8" />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {element.name}
            </span>
          </div>
        )}

        {/* Exact EditorRightSidebar Tabs Header with Chevron Scroll Buttons */}
        <ScrollableTabsBar
          tabs={sortedCapabilities.map((cap) => ({ id: cap, label: CAPABILITY_LABELS[cap] || cap }))}
          activeTab={currentTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content Panels */}
        <div className={styles.propContent} style={{ padding: '16px', gap: '16px', overflowY: 'auto' }}>
          {/* ─── 1. STYLE TAB ─── */}
          {currentTab === 'style' && (
            <div>
              {/* LOGO STYLING */}
              {element.type === 'logo' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Font Size ({element.props.fontSize || 22}px)
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={48}
                      value={element.props.fontSize || 22}
                      onChange={(e) => handleUpdateProps({ fontSize: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Font Weight
                    </label>
                    <select
                      value={element.props.fontWeight || 800}
                      onChange={(e) => handleUpdateProps({ fontWeight: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value={400}>Regular (400)</option>
                      <option value={500}>Medium (500)</option>
                      <option value={600}>Semi-Bold (600)</option>
                      <option value={700}>Bold (700)</option>
                      <option value={800}>Extra Bold (800)</option>
                      <option value={900}>Black (900)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Font Family Override
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inter, Cinzel, Playfair Display"
                      value={element.props.fontFamily || ''}
                      onChange={(e) => handleUpdateProps({ fontFamily: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Letter Spacing ({element.props.letterSpacing ?? -0.5}px)
                    </label>
                    <input
                      type="range"
                      min={-2}
                      max={4}
                      step={0.5}
                      value={element.props.letterSpacing ?? -0.5}
                      onChange={(e) => handleUpdateProps({ letterSpacing: parseFloat(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Text Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={element.props.textColor || '#0f172a'}
                        onChange={(e) => handleUpdateProps({ textColor: e.target.value })}
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={element.props.textColor || '#0f172a'}
                        onChange={(e) => handleUpdateProps({ textColor: e.target.value })}
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Desktop Width ({element.props.desktopWidth || element.props.width || 150}px)
                    </label>
                    <input
                      type="range"
                      min={60}
                      max={320}
                      value={element.props.desktopWidth || element.props.width || 150}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        handleUpdateProps({ desktopWidth: val, width: val });
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Tablet Width ({element.props.tabletWidth || 130}px)
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={260}
                      value={element.props.tabletWidth || 130}
                      onChange={(e) => handleUpdateProps({ tabletWidth: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Mobile Width ({element.props.mobileWidth || 110}px)
                    </label>
                    <input
                      type="range"
                      min={40}
                      max={200}
                      value={element.props.mobileWidth || 110}
                      onChange={(e) => handleUpdateProps({ mobileWidth: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </>
              )}

              {/* NAVIGATION MENU / PRIMARY NAV STYLING */}
              {(element.type === 'primary-nav' || element.type === 'navigation-menu' || element.type === 'navigation' || element.type === 'nav-links') && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Item Spacing ({element.props.spacing || 24}px)
                    </label>
                    <input
                      type="range"
                      min={8}
                      max={48}
                      value={element.props.spacing || 24}
                      onChange={(e) => handleUpdateProps({ spacing: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Font Size ({element.props.fontSize || 14}px)
                    </label>
                    <input
                      type="range"
                      min={11}
                      max={22}
                      value={element.props.fontSize || 14}
                      onChange={(e) => handleUpdateProps({ fontSize: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Font Weight
                    </label>
                    <select
                      value={element.props.fontWeight || 500}
                      onChange={(e) => handleUpdateProps({ fontWeight: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value={400}>Regular (400)</option>
                      <option value={500}>Medium (500)</option>
                      <option value={600}>Semi-Bold (600)</option>
                      <option value={700}>Bold (700)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Text Transform
                    </label>
                    <select
                      value={element.props.textTransform || 'none'}
                      onChange={(e) => handleUpdateProps({ textTransform: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="none">Normal Case</option>
                      <option value="uppercase">UPPERCASE</option>
                      <option value="capitalize">Capitalize Each Word</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Link Text Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={element.props.textColor || '#0f172a'}
                        onChange={(e) => handleUpdateProps({ textColor: e.target.value })}
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={element.props.textColor || '#0f172a'}
                        onChange={(e) => handleUpdateProps({ textColor: e.target.value })}
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Hover State Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={element.props.hoverColor || '#2563eb'}
                        onChange={(e) => handleUpdateProps({ hoverColor: e.target.value })}
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={element.props.hoverColor || '#2563eb'}
                        onChange={(e) => handleUpdateProps({ hoverColor: e.target.value })}
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Active Link Indicator
                    </label>
                    <select
                      value={element.props.activeIndicator || 'underline'}
                      onChange={(e) => handleUpdateProps({ activeIndicator: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="underline">Subtle Underline</option>
                      <option value="pill">Pill Background</option>
                      <option value="dot">Bottom Dot Indicator</option>
                      <option value="bold">Bold Accent</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </>
              )}

              {/* ACTION GROUP / ACTIONS STYLING */}
              {(element.type === 'action-group' || element.type === 'actions') && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Icon Size ({element.props.iconSize || 18}px)
                    </label>
                    <input
                      type="range"
                      min={14}
                      max={28}
                      value={element.props.iconSize || 18}
                      onChange={(e) => handleUpdateProps({ iconSize: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Spacing Between Icons ({element.props.spacing || 16}px)
                    </label>
                    <input
                      type="range"
                      min={8}
                      max={32}
                      value={element.props.spacing || 16}
                      onChange={(e) => handleUpdateProps({ spacing: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Icon Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={element.props.iconColor || '#334155'}
                        onChange={(e) => handleUpdateProps({ iconColor: e.target.value })}
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={element.props.iconColor || '#334155'}
                        onChange={(e) => handleUpdateProps({ iconColor: e.target.value })}
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Hover Color
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={element.props.hoverColor || '#2563eb'}
                        onChange={(e) => handleUpdateProps({ hoverColor: e.target.value })}
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={element.props.hoverColor || '#2563eb'}
                        onChange={(e) => handleUpdateProps({ hoverColor: e.target.value })}
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Notification Badge Background
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={element.props.badgeBg || '#ef4444'}
                        onChange={(e) => handleUpdateProps({ badgeBg: e.target.value })}
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={element.props.badgeBg || '#ef4444'}
                        onChange={(e) => handleUpdateProps({ badgeBg: e.target.value })}
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SEARCH ELEMENT STYLING */}
              {element.type === 'search' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Display Mode
                    </label>
                    <select
                      value={element.props.displayMode || 'inline'}
                      onChange={(e) => handleUpdateProps({ displayMode: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="inline">Inline Input Bar</option>
                      <option value="icon">Icon Only (Trigger Modal/Overlay)</option>
                      <option value="modal">Full Width Modal Bar</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Input Width ({element.props.width || 240}px)
                    </label>
                    <input
                      type="range"
                      min={120}
                      max={480}
                      value={element.props.width || 240}
                      onChange={(e) => handleUpdateProps({ width: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Corner Radius ({element.props.borderRadius || 9999}px)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={element.props.borderRadius === 9999 ? 30 : (element.props.borderRadius || 20)}
                      onChange={(e) => handleUpdateProps({ borderRadius: parseInt(e.target.value) >= 30 ? 9999 : parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Background Surface
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={element.props.bgColor || '#f1f5f9'}
                        onChange={(e) => handleUpdateProps({ bgColor: e.target.value })}
                        style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={element.props.bgColor || '#f1f5f9'}
                        onChange={(e) => handleUpdateProps({ bgColor: e.target.value })}
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ANNOUNCEMENT BAR ELEMENT STYLING */}
              {(element.type === 'announcement-bar' || element.type === 'promo-text') && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Font Size ({element.props.fontSize || 13}px)
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={20}
                      value={element.props.fontSize || 13}
                      onChange={(e) => handleUpdateProps({ fontSize: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Font Weight
                    </label>
                    <select
                      value={element.props.fontWeight || 500}
                      onChange={(e) => handleUpdateProps({ fontWeight: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value={400}>Regular (400)</option>
                      <option value={500}>Medium (500)</option>
                      <option value={600}>Semi-Bold (600)</option>
                      <option value={700}>Bold (700)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      CTA Style
                    </label>
                    <select
                      value={element.props.ctaStyle || 'underline'}
                      onChange={(e) => handleUpdateProps({ ctaStyle: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="underline">Text with Underline</option>
                      <option value="pill">Pill Button</option>
                      <option value="arrow">Arrow Link</option>
                    </select>
                  </div>
                </>
              )}

              {/* FALLBACK GENERIC STYLE PROPERTIES */}
              {!['logo', 'primary-nav', 'navigation-menu', 'navigation', 'nav-links', 'action-group', 'actions', 'search', 'announcement-bar', 'promo-text'].includes(element.type) && (
                <>
                  {element.props.fontSize !== undefined && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                        Font Size ({element.props.fontSize}px)
                      </label>
                      <input
                        type="range"
                        min={10}
                        max={48}
                        value={element.props.fontSize || 14}
                        onChange={(e) => handleUpdateProps({ fontSize: parseInt(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  {element.props.width !== undefined && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                        Element Width ({element.props.width}px)
                      </label>
                      <input
                        type="range"
                        min={40}
                        max={360}
                        value={element.props.width || 140}
                        onChange={(e) => handleUpdateProps({ width: parseInt(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  {element.props.textColor !== undefined && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                        Text Color
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={element.props.textColor || '#0f172a'}
                          onChange={(e) => handleUpdateProps({ textColor: e.target.value })}
                          style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          value={element.props.textColor || '#0f172a'}
                          onChange={(e) => handleUpdateProps({ textColor: e.target.value })}
                          style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── 2. CONTENT TAB ─── */}
          {currentTab === 'content' && (
            <div>
              {/* LOGO CONTENT */}
              {element.type === 'logo' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Logo Display Type
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['text', 'image', 'both'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleUpdateProps({ logoType: t })}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            border: (element.props.logoType || 'text') === t ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            background: (element.props.logoType || 'text') === t ? '#eff6ff' : '#ffffff',
                            color: (element.props.logoType || 'text') === t ? '#1d4ed8' : '#334155',
                            fontWeight: 600,
                            fontSize: '12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(element.props.logoType !== 'image') && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Brand Name Text
                      </label>
                      <input
                        type="text"
                        value={element.props.text || 'BillionBiz'}
                        onChange={(e) => handleUpdateProps({ text: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '8px' }}>
                      <input
                        type="checkbox"
                        checked={element.props.showTagline || false}
                        onChange={(e) => handleUpdateProps({ showTagline: e.target.checked })}
                      />
                      <span>Show Sub-Brand Tagline</span>
                    </label>
                    {element.props.showTagline && (
                      <input
                        type="text"
                        placeholder="e.g. World-Class Commerce"
                        value={element.props.taglineText || ''}
                        onChange={(e) => handleUpdateProps({ taglineText: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    )}
                  </div>

                  {(element.props.logoType === 'image' || element.props.logoType === 'both') && (
                    <>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Main Logo Image URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://example.com/logo.svg"
                          value={element.props.mainLogoUrl || element.props.imageUrl || ''}
                          onChange={(e) => handleUpdateProps({ mainLogoUrl: e.target.value, imageUrl: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Dark Mode / Scrolled Logo URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://example.com/logo-light.svg"
                          value={element.props.darkLogoUrl || ''}
                          onChange={(e) => handleUpdateProps({ darkLogoUrl: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Image Alt Text
                        </label>
                        <input
                          type="text"
                          placeholder="Brand Logo"
                          value={element.props.altText || ''}
                          onChange={(e) => handleUpdateProps({ altText: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* NAVIGATION MENU / PRIMARY NAV CONTENT */}
              {(element.type === 'primary-nav' || element.type === 'navigation-menu' || element.type === 'navigation' || element.type === 'nav-links') && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      Menu Links ({element.props.items?.length || element.props.links?.length || 0})
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const standardNav = [
                          { id: 'nav-home', label: 'Home', link: '/' },
                          { id: 'nav-shop', label: 'Shop', link: '/shop', hasMegaMenu: true, badge: 'HOT' },
                          { id: 'nav-collections', label: 'Collections', link: '/collections' },
                          { id: 'nav-about', label: 'About', link: '/about' },
                          { id: 'nav-contact', label: 'Contact', link: '/contact' },
                        ];
                        handleUpdateProps({ items: standardNav, links: standardNav });
                      }}
                      style={{ fontSize: '11px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + Standard Preset
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {(element.props.items || element.props.links || []).map((link: any, idx: number) => (
                      <div
                        key={link.id || idx}
                        style={{
                          padding: '10px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Label (e.g. Shop)"
                            value={link.label || ''}
                            onChange={(e) => {
                              const items = [...(element.props.items || element.props.links || [])];
                              items[idx] = { ...items[idx], label: e.target.value };
                              handleUpdateProps({ items, links: items });
                            }}
                            style={{ flex: 1, padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}
                          />
                          <input
                            type="text"
                            placeholder="Badge (e.g. HOT)"
                            value={link.badge || ''}
                            onChange={(e) => {
                              const items = [...(element.props.items || element.props.links || [])];
                              items[idx] = { ...items[idx], badge: e.target.value };
                              handleUpdateProps({ items, links: items });
                            }}
                            style={{ width: '80px', padding: '5px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const items = (element.props.items || element.props.links || []).filter((_: any, i: number) => i !== idx);
                              handleUpdateProps({ items, links: items });
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '3px' }}
                            title="Delete link"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Destination Link (e.g. /shop)"
                          value={link.link || link.href || ''}
                          onChange={(e) => {
                            const items = [...(element.props.items || element.props.links || [])];
                            items[idx] = { ...items[idx], link: e.target.value, href: e.target.value };
                            handleUpdateProps({ items, links: items });
                          }}
                          style={{ width: '100%', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', marginBottom: '6px' }}
                        />
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={Boolean(link.hasDropdown)}
                              onChange={(e) => {
                                const items = [...(element.props.items || element.props.links || [])];
                                items[idx] = { ...items[idx], hasDropdown: e.target.checked };
                                handleUpdateProps({ items, links: items });
                              }}
                            />
                            <span>Dropdown</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={Boolean(link.hasMegaMenu)}
                              onChange={(e) => {
                                const items = [...(element.props.items || element.props.links || [])];
                                items[idx] = { ...items[idx], hasMegaMenu: e.target.checked };
                                handleUpdateProps({ items, links: items });
                              }}
                            />
                            <span>Mega Menu</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const items = [
                        ...(element.props.items || element.props.links || []),
                        { id: `nav-${Date.now()}`, label: 'New Link', link: '/page' },
                      ];
                      handleUpdateProps({ items, links: items });
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#eff6ff',
                      border: '1px dashed #3b82f6',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2563eb',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Menu Item
                  </button>
                </>
              )}

              {/* ACTION GROUP / ACTIONS CONTENT */}
              {(element.type === 'action-group' || element.type === 'actions') && (
                <>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Shopper Action Icons
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                        <Search size={15} color="#2563eb" /> Search Icon
                      </span>
                      <input
                        type="checkbox"
                        checked={element.props.showSearch !== false}
                        onChange={(e) => handleUpdateProps({ showSearch: e.target.checked })}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                        <User size={15} color="#2563eb" /> Customer Account
                      </span>
                      <input
                        type="checkbox"
                        checked={element.props.showAccount !== false}
                        onChange={(e) => handleUpdateProps({ showAccount: e.target.checked })}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                        <Heart size={15} color="#ef4444" /> Wishlist Icon
                      </span>
                      <input
                        type="checkbox"
                        checked={element.props.showWishlist !== false}
                        onChange={(e) => handleUpdateProps({ showWishlist: e.target.checked })}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                        <ShoppingCart size={15} color="#10b981" /> Shopping Cart
                      </span>
                      <input
                        type="checkbox"
                        checked={element.props.showCart !== false}
                        onChange={(e) => handleUpdateProps({ showCart: e.target.checked })}
                      />
                    </label>
                  </div>

                  {/* CTA BUTTON */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                      Header CTA Button
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                      <input
                        type="checkbox"
                        checked={element.props.showCta || false}
                        onChange={(e) => handleUpdateProps({ showCta: e.target.checked })}
                      />
                      <span>Enable Action CTA Button</span>
                    </label>

                    {element.props.showCta && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                            Button Label
                          </label>
                          <input
                            type="text"
                            value={element.props.ctaText || 'Get Started'}
                            onChange={(e) => handleUpdateProps({ ctaText: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                            Button Destination Link
                          </label>
                          <input
                            type="text"
                            value={element.props.ctaLink || '/signup'}
                            onChange={(e) => handleUpdateProps({ ctaLink: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                            Button Variant
                          </label>
                          <select
                            value={element.props.ctaVariant || 'filled'}
                            onChange={(e) => handleUpdateProps({ ctaVariant: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                          >
                            <option value="filled">Solid / Filled</option>
                            <option value="outline">Outlined Border</option>
                            <option value="ghost">Ghost / Subtle</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* SEARCH CONTENT */}
              {element.type === 'search' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={element.props.placeholder || 'Search products, collections, brands...'}
                      onChange={(e) => handleUpdateProps({ placeholder: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={element.props.categoryFilter || false}
                        onChange={(e) => handleUpdateProps({ categoryFilter: e.target.checked })}
                      />
                      <span>Enable Category Dropdown Filter in Search</span>
                    </label>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Popular Search Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Jackets, Denim, Accessories, Boots"
                      value={Array.isArray(element.props.popularSearches) ? element.props.popularSearches.join(', ') : (element.props.popularSearches || '')}
                      onChange={(e) => handleUpdateProps({ popularSearches: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </>
              )}

              {/* ANNOUNCEMENT BAR CONTENT & VARIANTS */}
              {(element.type === 'announcement-bar' || element.type === 'promo-text') && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Announcement Bar Variant
                    </label>
                    <select
                      value={element.props.variant || 'single'}
                      onChange={(e) => handleUpdateProps({ variant: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
                    >
                      {ANNOUNCEMENT_VARIANTS.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} — {v.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    Announcements ({element.props.slides?.length || 1})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {(element.props.slides || [{ text: element.props.text || 'Free shipping on orders over $99', cta: 'Shop Now', link: '/offers' }]).map((slide: any, sIdx: number) => (
                      <div
                        key={sIdx}
                        style={{
                          padding: '10px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      >
                        <textarea
                          rows={2}
                          value={slide.text || ''}
                          placeholder="Announcement message..."
                          onChange={(e) => {
                            const next = [...(element.props.slides || [{ text: '' }])];
                            next[sIdx] = { ...next[sIdx], text: e.target.value };
                            handleUpdateProps({ slides: next, text: next[0]?.text });
                          }}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', marginBottom: '6px' }}
                        />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="CTA Text (Shop Now)"
                            value={slide.cta || ''}
                            onChange={(e) => {
                              const next = [...(element.props.slides || [{ text: '' }])];
                              next[sIdx] = { ...next[sIdx], cta: e.target.value };
                              handleUpdateProps({ slides: next });
                            }}
                            style={{ flex: 1, padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}
                          />
                          <input
                            type="text"
                            placeholder="Link URL (/offers)"
                            value={slide.link || ''}
                            onChange={(e) => {
                              const next = [...(element.props.slides || [{ text: '' }])];
                              next[sIdx] = { ...next[sIdx], link: e.target.value };
                              handleUpdateProps({ slides: next });
                            }}
                            style={{ flex: 1, padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}
                          />
                          {(element.props.slides || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = element.props.slides.filter((_: any, i: number) => i !== sIdx);
                                handleUpdateProps({ slides: next });
                              }}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '3px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...(element.props.slides || [{ text: 'Special offer!' }]),
                        { text: 'New promo message', cta: 'Claim Offer', link: '/sale' },
                      ];
                      handleUpdateProps({ slides: next });
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#eff6ff',
                      border: '1px dashed #3b82f6',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2563eb',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Announcement Slide
                  </button>
                </>
              )}

              {/* FALLBACK GENERIC CONTENT */}
              {!['logo', 'primary-nav', 'navigation-menu', 'navigation', 'nav-links', 'action-group', 'actions', 'search', 'announcement-bar', 'promo-text'].includes(element.type) && (
                <>
                  {element.props.text !== undefined && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                        Primary Text
                      </label>
                      <textarea
                        rows={2}
                        value={element.props.text || ''}
                        onChange={(e) => handleUpdateProps({ text: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  )}

                  {element.props.heading !== undefined && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                        Heading
                      </label>
                      <input
                        type="text"
                        value={element.props.heading || ''}
                        onChange={(e) => handleUpdateProps({ heading: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  )}

                  {element.props.html !== undefined && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                        Raw HTML / SVG Code
                      </label>
                      <textarea
                        rows={4}
                        value={element.props.html || ''}
                        onChange={(e) => handleUpdateProps({ html: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── 3. ITEMS TAB ─── */}
          {currentTab === 'items' && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                Configured Items
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                Manage individual links and action buttons within this element.
              </p>
              {Array.isArray(element.props.items) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {element.props.items.map((item: any, idx: number) => (
                    <div
                      key={item.id || idx}
                      style={{
                        padding: '10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <input
                          type="text"
                          value={item.label || ''}
                          onChange={(e) => {
                            const next = [...element.props.items];
                            next[idx] = { ...next[idx], label: e.target.value };
                            handleUpdateProps({ items: next, links: next });
                          }}
                          style={{ flex: 1, padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = element.props.items.filter((_: any, i: number) => i !== idx);
                            handleUpdateProps({ items: next, links: next });
                          }}
                          style={{ marginLeft: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Link URL (e.g. /shop)"
                        value={item.link || item.href || ''}
                        onChange={(e) => {
                          const next = [...element.props.items];
                          next[idx] = { ...next[idx], link: e.target.value, href: e.target.value };
                          handleUpdateProps({ items: next, links: next });
                        }}
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...element.props.items,
                        { id: `item-${Date.now()}`, label: 'New Item', link: '/' },
                      ];
                      handleUpdateProps({ items: next, links: next });
                    }}
                    style={{
                      padding: '8px',
                      background: '#ffffff',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2563eb',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Item
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── 4. COLUMNS TAB (Mega Menu) ─── */}
          {currentTab === 'columns' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  Mega Menu Columns ({element.props.columns?.length || 0})
                </h4>
                <select
                  value={element.props.columnCount || element.props.columns?.length || 4}
                  onChange={(e) => handleUpdateProps({ columnCount: parseInt(e.target.value) })}
                  style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                >
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                  <option value={5}>5 Columns</option>
                </select>
              </div>

              {Array.isArray(element.props.columns) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {element.props.columns.map((col: any, idx: number) => (
                    <div
                      key={col.id || idx}
                      style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <input
                          type="text"
                          value={col.heading || ''}
                          onChange={(e) => {
                            const next = [...element.props.columns];
                            next[idx] = { ...next[idx], heading: e.target.value };
                            handleUpdateProps({ columns: next });
                          }}
                          style={{ flex: 1, padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = element.props.columns.filter((_: any, i: number) => i !== idx);
                            handleUpdateProps({ columns: next });
                          }}
                          style={{ marginLeft: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', cursor: 'pointer', marginBottom: '6px' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(col.isPromo)}
                          onChange={(e) => {
                            const next = [...element.props.columns];
                            next[idx] = { ...next[idx], isPromo: e.target.checked };
                            handleUpdateProps({ columns: next });
                          }}
                        />
                        <span>✨ Promo Card Column</span>
                      </label>

                      {col.isPromo ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                          <input
                            type="text"
                            placeholder="Promo Card Title"
                            value={col.promoTitle || ''}
                            onChange={(e) => {
                              const next = [...element.props.columns];
                              next[idx] = { ...next[idx], promoTitle: e.target.value };
                              handleUpdateProps({ columns: next });
                            }}
                            style={{ padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}
                          />
                          <input
                            type="text"
                            placeholder="Promo Card Image URL"
                            value={col.promoImage || ''}
                            onChange={(e) => {
                              const next = [...element.props.columns];
                              next[idx] = { ...next[idx], promoImage: e.target.value };
                              handleUpdateProps({ columns: next });
                            }}
                            style={{ padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px' }}
                          />
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {col.links?.length || 0} sub-links configured
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...(element.props.columns || []),
                        { id: `col-${Date.now()}`, heading: 'New Category', links: [{ label: 'Sublink 1', link: '/' }] },
                      ];
                      handleUpdateProps({ columns: next });
                    }}
                    style={{
                      padding: '8px',
                      background: '#ffffff',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2563eb',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Mega Menu Column
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── 5. DROPDOWN TAB ─── */}
          {currentTab === 'dropdown' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                  Dropdown Width ({element.props.dropdownWidth || 220}px)
                </label>
                <input
                  type="range"
                  min={160}
                  max={420}
                  value={element.props.dropdownWidth || 220}
                  onChange={(e) => handleUpdateProps({ dropdownWidth: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                  Dropdown Animation
                </label>
                <select
                  value={element.props.dropdownAnimation || 'fade-slide'}
                  onChange={(e) => handleUpdateProps({ dropdownAnimation: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="fade">Smooth Fade</option>
                  <option value="fade-slide">Fade & Slide Down</option>
                  <option value="zoom">Subtle Scale In</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                  Dropdown Elevation Shadow
                </label>
                <select
                  value={element.props.dropdownShadow || 'medium'}
                  onChange={(e) => handleUpdateProps({ dropdownShadow: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="none">Flat (No Shadow)</option>
                  <option value="small">Small Shadow</option>
                  <option value="medium">Medium Shadow</option>
                  <option value="large">Elevated / Large</option>
                </select>
              </div>
            </div>
          )}

          {/* ─── 6. BEHAVIOR TAB ─── */}
          {currentTab === 'behavior' && (
            <div>
              {element.props.interaction !== undefined && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                    Trigger Interaction
                  </label>
                  <select
                    value={element.props.interaction || 'hover'}
                    onChange={(e) => handleUpdateProps({ interaction: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="hover">Hover (Mouse enter)</option>
                    <option value="click">Click to toggle</option>
                  </select>
                </div>
              )}

              {element.type === 'search' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                    Search Experience Mode
                  </label>
                  <select
                    value={element.props.searchMode || 'dropdown'}
                    onChange={(e) => handleUpdateProps({ searchMode: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="dropdown">Live Autocomplete Dropdown</option>
                    <option value="overlay">Full Overlay with Categories</option>
                    <option value="command">Command Palette / Quick Jump</option>
                  </select>
                </div>
              )}

              {(element.type === 'announcement-bar' || element.type === 'promo-text') && (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                    <input
                      type="checkbox"
                      checked={element.props.autoRotate ?? true}
                      onChange={(e) => handleUpdateProps({ autoRotate: e.target.checked })}
                    />
                    <span>Auto-rotate announcement slides</span>
                  </label>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                      Rotation Speed ({element.props.rotationSpeed || 5}s)
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={15}
                      value={element.props.rotationSpeed || 5}
                      onChange={(e) => handleUpdateProps({ rotationSpeed: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                    <input
                      type="checkbox"
                      checked={element.props.pauseOnHover ?? true}
                      onChange={(e) => handleUpdateProps({ pauseOnHover: e.target.checked })}
                    />
                    <span>Pause rotation on hover</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                    <input
                      type="checkbox"
                      checked={element.props.closeable ?? true}
                      onChange={(e) => handleUpdateProps({ closeable: e.target.checked })}
                    />
                    <span>Allow shoppers to close / dismiss</span>
                  </label>
                </>
              )}
            </div>
          )}

          {/* ─── 7. DESIGN TAB ─── */}
          {currentTab === 'design' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                  Background Surface
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={element.props.bgColor || '#ffffff'}
                    onChange={(e) => handleUpdateProps({ bgColor: e.target.value })}
                    style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={element.props.bgColor || '#ffffff'}
                    onChange={(e) => handleUpdateProps({ bgColor: e.target.value })}
                    style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {element.props.badgeBg !== undefined && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                    Badge Background Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={element.props.badgeBg || '#2563eb'}
                      onChange={(e) => handleUpdateProps({ badgeBg: e.target.value })}
                      style={{ width: '36px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={element.props.badgeBg || '#2563eb'}
                      onChange={(e) => handleUpdateProps({ badgeBg: e.target.value })}
                      style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── 8. LAYOUT TAB ─── */}
          {currentTab === 'layout' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                  Alignment
                </label>
                <select
                  value={element.props.alignment || 'left'}
                  onChange={(e) => handleUpdateProps({ alignment: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="left">Left Aligned</option>
                  <option value="center">Centered</option>
                  <option value="right">Right Aligned</option>
                  <option value="space-between">Space Between</option>
                </select>
              </div>

              {element.props.density !== undefined && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                    Density
                  </label>
                  <select
                    value={element.props.density || 'comfortable'}
                    onChange={(e) => handleUpdateProps({ density: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ─── 9. LINK TAB ─── */}
          {currentTab === 'link' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                  Destination Link
                </label>
                <input
                  type="text"
                  placeholder="/"
                  value={element.props.href || element.props.customUrl || '/'}
                  onChange={(e) => handleUpdateProps({ href: e.target.value, customUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={element.props.openInNewTab || false}
                  onChange={(e) => handleUpdateProps({ openInNewTab: e.target.checked })}
                />
                <span>Open link in new browser tab</span>
              </label>
            </div>
          )}

          {/* ─── 10. RESPONSIVE TAB ─── */}
          {currentTab === 'responsive' && (
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                Per-breakpoint visibility controls for this element.
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={element.props.showOnDesktop !== false}
                  onChange={(e) => handleUpdateProps({ showOnDesktop: e.target.checked })}
                />
                <span>Visible on Desktop</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={element.props.showOnTablet !== false}
                  onChange={(e) => handleUpdateProps({ showOnTablet: e.target.checked })}
                />
                <span>Visible on Tablet</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={element.props.showOnMobile !== false}
                  onChange={(e) => handleUpdateProps({ showOnMobile: e.target.checked })}
                />
                <span>Visible on Mobile Viewport</span>
              </label>
            </div>
          )}

          {/* ─── 11. ADVANCED TAB ─── */}
          {currentTab === 'advanced' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                  Custom CSS Class
                </label>
                <input
                  type="text"
                  placeholder="e.g. brand-mark-special"
                  value={element.props.customClass || ''}
                  onChange={(e) => handleUpdateProps({ customClass: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                  ARIA Accessibility Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Store Home Page Link"
                  value={element.props.ariaLabel || ''}
                  onChange={(e) => handleUpdateProps({ ariaLabel: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const defaults = registration?.defaults || {};
                    handleUpdateProps(defaults);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={13} /> Reset Element to Defaults
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default fallback for header: show main header section inspector
  const mainHeaderRow = headerRows.find((r) => r.type === 'primary-nav') || headerRows[0];
  if (mainHeaderRow) {
    return (
      <HeaderSectionInspector
        row={mainHeaderRow}
        onClose={closeRightSidebar}
      />
    );
  }

  // Default empty state
  return (
    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
      <Info size={24} style={{ margin: '0 auto 8px auto', display: 'block', color: '#94a3b8' }} />
      <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
        Select any header row or component to inspect its properties.
      </p>
    </div>
  );
};
