// ============================================================
// MASTER EDITOR ENGINE — TEMPLATES & PRESETS RIGHT INSPECTOR
// Dynamic Variant -> Arrangement -> Template -> Theme System
// Staged live preview with single "Apply Template & Theme" button.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Layout,
  Palette,
  Layers,
  Check,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import {
  HEADER_VARIANTS,
  HEADER_ARRANGEMENTS,
  HEADER_TEMPLATES,
} from './headerPresets';
import {
  FOOTER_VARIANTS,
  FOOTER_ARRANGEMENTS,
  FOOTER_TEMPLATES,
} from './footerPresets';
import styles from '../../../pages/editor/EditorLayout.module.css';

interface TemplatesRightInspectorProps {
  editorType?: 'header' | 'footer';
}

const THEME_PALETTES = [
  {
    id: 'minimal',
    name: 'Clean Light',
    bg: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
    accent: '#2563eb',
  },
  {
    id: 'dark-saas',
    name: 'Midnight SaaS',
    bg: '#0b0f19',
    text: '#f8fafc',
    border: '#1e293b',
    accent: '#6366f1',
  },
  {
    id: 'luxury',
    name: 'Maison Luxury',
    bg: '#09090b',
    text: '#f4f4f5',
    border: '#27272a',
    accent: '#d4af37',
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    bg: '#0c4a6e',
    text: '#f0f9ff',
    border: '#0369a1',
    accent: '#38bdf8',
  },
  {
    id: 'warm',
    name: 'Warm Amber',
    bg: '#1c1917',
    text: '#fafaf9',
    border: '#44403c',
    accent: '#f59e0b',
  },
];

export const TemplatesRightInspector: React.FC<TemplatesRightInspectorProps> = ({
  editorType: propEditorType,
}) => {
  const store = useEditorContextStore();
  const { closeRightSidebar } = useLandingEditorStore();

  const editorType =
    propEditorType ||
    (store.selectedTarget.type === 'presets' ? store.selectedTarget.editorType : 'header');

  const isHeader = editorType === 'header';

  // Available data
  const variants = isHeader ? HEADER_VARIANTS : FOOTER_VARIANTS;
  const arrangements = isHeader ? HEADER_ARRANGEMENTS : FOOTER_ARRANGEMENTS;
  const templates = isHeader ? HEADER_TEMPLATES : FOOTER_TEMPLATES;

  // Staged Preview State
  const preview = store.presetPreview;
  const isStaged = Boolean(preview?.isActive && preview.editorType === editorType);

  const selectedVariantId =
    preview?.stagedVariantId ||
    (isHeader ? store.currentHeaderVariantId : store.currentFooterVariantId) ||
    variants[0]?.id;

  const selectedArrangementId =
    preview?.stagedArrangementId ||
    (isHeader ? store.currentHeaderArrangementId : store.currentFooterArrangementId);

  const selectedTemplateId = preview?.stagedTemplateId;
  const selectedThemePreset = preview?.stagedThemePreset || 'minimal';

  // Active Tab inside Right Sidebar: 'variants' | 'arrangements' | 'templates' | 'theme'
  const [tab, setTab] = useState<'variants' | 'arrangements' | 'templates' | 'theme'>('variants');
  const [appliedSuccessMessage, setAppliedSuccessMessage] = useState<string | null>(null);

  // Active Variant Object
  const currentVariant = useMemo(() => {
    return variants.find((v) => v.id === selectedVariantId) || variants[0];
  }, [variants, selectedVariantId]);

  // Dynamically Filtered Arrangements for Active Variant
  const dynamicArrangements = useMemo(() => {
    if (currentVariant?.compatibleArrangementIds && currentVariant.compatibleArrangementIds.length > 0) {
      return arrangements.filter((a) => currentVariant.compatibleArrangementIds!.includes(a.id));
    }
    return arrangements;
  }, [arrangements, currentVariant]);

  // Dynamically Filtered Templates for Active Variant
  const dynamicTemplates = useMemo(() => {
    if (currentVariant?.compatibleTemplateIds && currentVariant.compatibleTemplateIds.length > 0) {
      return templates.filter(
        (t) =>
          currentVariant.compatibleTemplateIds!.includes(t.id) ||
          t.variantId === currentVariant.id
      );
    }
    const matching = templates.filter((t) => t.variantId === currentVariant?.id);
    return matching.length > 0 ? matching : templates;
  }, [templates, currentVariant]);

  // Handlers for dynamic staging
  const handleSelectVariant = (variantId: string) => {
    const v = variants.find((item) => item.id === variantId);
    const defaultArrangement = v?.compatibleArrangementIds?.[0];
    const defaultTemplate = v?.compatibleTemplateIds?.[0];

    store.stagePresetSelection({
      editorType,
      variantId,
      arrangementId: defaultArrangement,
      templateId: defaultTemplate,
    });
  };

  const handleSelectArrangement = (arrangementId: string) => {
    store.stagePresetSelection({
      editorType,
      arrangementId,
    });
  };

  const handleSelectTemplate = (templateId: string) => {
    store.stagePresetSelection({
      editorType,
      templateId,
    });
    if (!isHeader) {
      store.previewFooterTemplate(templateId);
    }
  };

  const handleSelectTheme = (themeId: string) => {
    store.stagePresetSelection({
      editorType,
      themePreset: themeId,
    });
  };

  const handleApplyAll = () => {
    if (!isHeader && selectedTemplateId) {
      store.applyFooterTreeTemplate(selectedTemplateId);
    }
    store.commitStagedPreset(editorType, 'keep-content');
    setAppliedSuccessMessage(
      `${isHeader ? 'Header' : 'Footer'} Template & Theme applied successfully!`
    );
    setTimeout(() => {
      setAppliedSuccessMessage(null);
    }, 3000);
  };

  const handleDiscard = () => {
    store.discardStagedPreset();
    if (!isHeader) {
      store.cancelPendingFooterTemplate();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, backgroundColor: '#ffffff' }}>
      {/* Panel Header */}
      <div
        className={styles.panelHeader}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={closeRightSidebar}
            title="Collapse sidebar"
          >
            <ChevronRight size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              {isHeader ? 'Header Templates' : 'Footer Templates'}
            </h3>
          </div>
        </div>

        {/* Live Staging Indicator */}
        {isStaged && (
          <span
            style={{
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
              }}
            />
            Live Staged
          </span>
        )}
      </div>

      {/* Success Banner */}
      {appliedSuccessMessage && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            borderBottom: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 16px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#16a34a" />
          <span>{appliedSuccessMessage}</span>
        </div>
      )}

      {/* Sub-bar / Segment Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          padding: '4px',
          gap: '2px',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setTab('variants')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 8px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: tab === 'variants' ? 700 : 500,
            backgroundColor: tab === 'variants' ? '#ffffff' : 'transparent',
            color: tab === 'variants' ? '#2563eb' : '#64748b',
            boxShadow: tab === 'variants' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Layout size={13} />
          <span>Variants</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('arrangements')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 8px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: tab === 'arrangements' ? 700 : 500,
            backgroundColor: tab === 'arrangements' ? '#ffffff' : 'transparent',
            color: tab === 'arrangements' ? '#2563eb' : '#64748b',
            boxShadow: tab === 'arrangements' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Layers size={13} />
          <span>Layout</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('templates')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 8px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: tab === 'templates' ? 700 : 500,
            backgroundColor: tab === 'templates' ? '#ffffff' : 'transparent',
            color: tab === 'templates' ? '#2563eb' : '#64748b',
            boxShadow: tab === 'templates' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Sparkles size={13} />
          <span>Templates</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('theme')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 8px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: tab === 'theme' ? 700 : 500,
            backgroundColor: tab === 'theme' ? '#ffffff' : 'transparent',
            color: tab === 'theme' ? '#2563eb' : '#64748b',
            boxShadow: tab === 'theme' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Palette size={13} />
          <span>Theme</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px' }}>
        {/* TAB 1: VARIANTS */}
        {tab === 'variants' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                1. Select Base Variant
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Choosing a variant immediately updates the preview and unlocks tailored arrangements and templates.
              </p>
            </div>

            {variants.map((v) => {
              const isSelected = selectedVariantId === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVariant(v.id)}
                  style={{
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                        {v.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                          color: isSelected ? '#1e40af' : '#64748b',
                          fontWeight: 600,
                        }}
                      >
                        {v.category}
                      </span>
                    </div>
                    {isSelected && <Check size={16} color="#2563eb" />}
                  </div>

                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {v.description}
                  </p>

                  {/* Visual Diagram Snippet */}
                  {v.previewDiagram && (
                    <div
                      style={{
                        backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#475569',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {v.previewDiagram}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: DYNAMIC ARRANGEMENTS */}
        {tab === 'arrangements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                2. Dynamic Arrangements for {currentVariant?.name}
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Reposition navigation, logo, and search without losing any of your brand content.
              </p>
            </div>

            {dynamicArrangements.map((a) => {
              const isSelected = selectedArrangementId === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => handleSelectArrangement(a.id)}
                  style={{
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                      {a.name}
                    </span>
                    {isSelected && <Check size={15} color="#2563eb" />}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {a.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: DYNAMIC TEMPLATES */}
        {tab === 'templates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                3. Templates for {currentVariant?.name}
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Complete ready-to-use compositions matching this variant.
              </p>
            </div>

            {dynamicTemplates.map((t) => {
              const isSelected = selectedTemplateId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTemplate(t.id)}
                  style={{
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                        {t.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 600,
                        }}
                      >
                        {t.category}
                      </span>
                    </div>
                    {isSelected && <Check size={15} color="#2563eb" />}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {t.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: THEME & PALETTES */}
        {tab === 'theme' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                4. Theme Color Presets
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Select a cohesive theme palette for your header background, borders, and typography.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {THEME_PALETTES.map((theme) => {
                const isSelected = selectedThemePreset === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    style={{
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                        {theme.name}
                      </span>
                      {isSelected && <Check size={14} color="#2563eb" />}
                    </div>

                    {/* Color Swatch Circles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: theme.bg,
                          border: '1px solid #cbd5e1',
                        }}
                        title={`Background: ${theme.bg}`}
                      />
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: theme.text,
                          border: '1px solid #cbd5e1',
                        }}
                        title={`Text: ${theme.text}`}
                      />
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: theme.accent,
                          border: '1px solid #cbd5e1',
                        }}
                        title={`Accent: ${theme.accent}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Main Apply Button */}
          <button
            type="button"
            onClick={handleApplyAll}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 14px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          >
            <Sparkles size={14} />
            <span>Apply Template & Theme</span>
          </button>

          {/* Discard Button */}
          {isStaged && (
            <button
              type="button"
              onClick={handleDiscard}
              title="Discard staged preview"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
          {isStaged
            ? 'Staged in live canvas preview. Changes only affect other editors & publish once applied.'
            : 'Select any variant or template above to stage in live preview.'}
        </div>
      </div>
    </div>
  );
};
