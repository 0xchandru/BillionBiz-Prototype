// ============================================================
// MASTER EDITOR ENGINE — REDESIGNED PRESET MODAL
// 3-Level Variant / Arrangement / Template Selection System
// Includes live preview trigger, visual ASCII diagrams, search,
// category filtering, and 3-mode non-destructive apply dialog.
// ============================================================

import React, { useState } from 'react';
import {
  Sparkles,
  Layout,
  X,
  Search,
  Eye,
  SlidersHorizontal,
  Bookmark,
  Trash2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
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
import type { PresetApplyOption } from './types';

export const PresetModal: React.FC = () => {
  const {
    isPresetModalOpen,
    closePresetModal,
    editorType,
    currentHeaderVariantId,
    currentHeaderArrangementId,
    currentFooterVariantId,
    currentFooterArrangementId,
    previewVariant,
    previewArrangement,
    previewTemplate,
    applyVariant,
    applyArrangement,
    applyTemplate,
    userPresets,
    applyUserPreset,
    deleteUserPreset,
    saveUserPreset,
  } = useEditorContextStore();

  const [activeTab, setActiveTab] = useState<'variants' | 'arrangements' | 'templates' | 'saved'>('variants');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Apply confirmation dialog state
  const [pendingApply, setPendingApply] = useState<{
    type: 'variant' | 'arrangement' | 'template';
    id: string;
    name: string;
  } | null>(null);
  const [applyOption, setApplyOption] = useState<PresetApplyOption>('keep-content');
  const [saveCurrentBeforeApply, setSaveCurrentBeforeApply] = useState(true);

  if (!isPresetModalOpen) return null;

  const isHeader = editorType === 'header';

  // Data sets
  const variants = isHeader ? HEADER_VARIANTS : FOOTER_VARIANTS;
  const arrangements = isHeader ? HEADER_ARRANGEMENTS : FOOTER_ARRANGEMENTS;
  const templates = isHeader ? HEADER_TEMPLATES : FOOTER_TEMPLATES;
  const relevantUserPresets = userPresets.filter((p) => p.editorType === editorType);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'commerce', label: 'Commerce' },
    { id: 'saas', label: 'Tech SaaS' },
    { id: 'fashion', label: 'Fashion & Luxury' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'creative', label: 'Creative' },
    { id: 'corporate', label: 'Corporate' },
  ];

  // Filters
  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || v.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredArrangements = arrangements.filter((a) => {
    return (
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const effectiveEditorType: 'header' | 'footer' = editorType === 'footer' ? 'footer' : 'header';

  const handleConfirmApply = () => {
    if (!pendingApply) return;

    if (saveCurrentBeforeApply) {
      saveUserPreset(`Backup before ${pendingApply.name}`);
    }

    if (pendingApply.type === 'variant') {
      applyVariant(effectiveEditorType, pendingApply.id, applyOption);
    } else if (pendingApply.type === 'arrangement') {
      applyArrangement(effectiveEditorType, pendingApply.id, applyOption);
    } else if (pendingApply.type === 'template') {
      applyTemplate(effectiveEditorType, pendingApply.id, applyOption);
    }

    setPendingApply(null);
    closePresetModal();
  };

  const handleLivePreview = (type: 'variant' | 'arrangement' | 'template', id: string) => {
    if (type === 'variant') {
      previewVariant(effectiveEditorType, id);
    } else if (type === 'arrangement') {
      previewArrangement(effectiveEditorType, id);
    } else if (type === 'template') {
      previewTemplate(effectiveEditorType, id);
    }
    // Close modal so user immediately inspects actual canvas with banner
    closePresetModal();
  };

  // Active item lookup
  const activeVariantId = isHeader ? currentHeaderVariantId : currentFooterVariantId;
  const activeArrangementId = isHeader ? currentHeaderArrangementId : currentFooterArrangementId;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={closePresetModal}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '88vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── MODAL HEADER ─── */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  backgroundColor: '#eff6ff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {isHeader ? 'Header Editor' : 'Footer Editor'}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Design System Presets</span>
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              Variants, Arrangements &amp; Templates
            </h2>
          </div>

          <button
            type="button"
            onClick={closePresetModal}
            style={{
              background: '#f1f5f9',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              color: '#64748b',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── CURRENT CONFIGURATION BAR ─── */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#475569' }}>
            <div>
              <span style={{ color: '#94a3b8', marginRight: '4px' }}>Active Variant:</span>
              <strong style={{ color: '#0f172a' }}>
                {variants.find((v) => v.id === activeVariantId)?.name || 'Default Commerce'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', marginRight: '4px' }}>Arrangement:</span>
              <strong style={{ color: '#0f172a' }}>
                {arrangements.find((a) => a.id === activeArrangementId)?.name || 'Standard'}
              </strong>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#16a34a',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: '#dcfce7',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              <CheckCircle2 size={12} />
              Synced &amp; Ready
            </span>
          </div>
        </div>

        {/* ─── TABS & SEARCH BAR ─── */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Main 4 Tabs */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('variants');
                setSelectedCategory('all');
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: activeTab === 'variants' ? 600 : 500,
                backgroundColor: activeTab === 'variants' ? '#ffffff' : 'transparent',
                color: activeTab === 'variants' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                boxShadow: activeTab === 'variants' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={14} color={activeTab === 'variants' ? '#2563eb' : '#64748b'} />
              <span>Variants</span>
              <span style={{ fontSize: '11px', opacity: 0.75 }}>({variants.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('arrangements');
                setSelectedCategory('all');
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: activeTab === 'arrangements' ? 600 : 500,
                backgroundColor: activeTab === 'arrangements' ? '#ffffff' : 'transparent',
                color: activeTab === 'arrangements' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                boxShadow: activeTab === 'arrangements' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Layout size={14} color={activeTab === 'arrangements' ? '#2563eb' : '#64748b'} />
              <span>Arrangements</span>
              <span style={{ fontSize: '11px', opacity: 0.75 }}>({arrangements.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('templates');
                setSelectedCategory('all');
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: activeTab === 'templates' ? 600 : 500,
                backgroundColor: activeTab === 'templates' ? '#ffffff' : 'transparent',
                color: activeTab === 'templates' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                boxShadow: activeTab === 'templates' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={14} color={activeTab === 'templates' ? '#2563eb' : '#64748b'} />
              <span>Templates</span>
              <span style={{ fontSize: '11px', opacity: 0.75 }}>({templates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('saved');
                setSelectedCategory('all');
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: activeTab === 'saved' ? 600 : 500,
                backgroundColor: activeTab === 'saved' ? '#ffffff' : 'transparent',
                color: activeTab === 'saved' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                boxShadow: activeTab === 'saved' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Bookmark size={14} color={activeTab === 'saved' ? '#2563eb' : '#64748b'} />
              <span>Saved</span>
              <span style={{ fontSize: '11px', opacity: 0.75 }}>({relevantUserPresets.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 12px',
              minWidth: '240px',
            }}
          >
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder={`Filter ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12px',
                color: '#0f172a',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ─── CATEGORY PILLS (for Variants & Templates) ─── */}
        {(activeTab === 'variants' || activeTab === 'templates') && (
          <div
            style={{
              padding: '8px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              backgroundColor: '#ffffff',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: selectedCategory === cat.id ? 600 : 500,
                  backgroundColor: selectedCategory === cat.id ? '#2563eb' : '#f1f5f9',
                  color: selectedCategory === cat.id ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* ─── CARDS BODY ─── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', backgroundColor: '#f8fafc' }}>
          {/* TAB 1: VARIANTS */}
          {activeTab === 'variants' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {filteredVariants.map((v) => {
                const isCurrent = activeVariantId === v.id;
                return (
                  <div
                    key={v.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: isCurrent ? '0 4px 12px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Visual ASCII / Mini Layout Preview */}
                    <div
                      style={{
                        backgroundColor: '#0f172a',
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                        fontSize: '10.5px',
                        lineHeight: '1.4',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        height: '62px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        userSelect: 'none',
                        border: '1px solid #1e293b',
                      }}
                    >
                      {v.previewDiagram || `[Logo]  Navigation  [CTA]`}
                    </div>

                    {/* Meta info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                            {v.name}
                          </h4>
                          {isCurrent && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#16a34a',
                                backgroundColor: '#dcfce7',
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              Current
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#6366f1',
                            backgroundColor: '#eef2ff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {v.category}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                        {v.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleLivePreview('variant', v.id)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '7px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Eye size={13} />
                        <span>Live Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPendingApply({ type: 'variant', id: v.id, name: v.name })}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '7px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Sparkles size={13} />
                        <span>Apply</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ARRANGEMENTS */}
          {activeTab === 'arrangements' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {filteredArrangements.map((a) => {
                const isCurrent = activeArrangementId === a.id;
                return (
                  <div
                    key={a.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: isCurrent ? '0 4px 12px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                          {a.name}
                        </h4>
                        {isCurrent && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#16a34a',
                              backgroundColor: '#dcfce7',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Current
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                        {a.description}
                      </p>
                    </div>

                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '11px',
                        color: '#64748b',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Container Mode:</span>
                        <strong style={{ color: '#0f172a' }}>{a.layout.container || 'Standard'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Alignment:</span>
                        <strong style={{ color: '#0f172a' }}>{a.layout.alignment || 'Space Between'}</strong>
                      </div>
                      {isHeader && (a.layout as any).logoPosition && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Logo Position:</span>
                          <strong style={{ color: '#0f172a' }}>{(a.layout as any).logoPosition}</strong>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => handleLivePreview('arrangement', a.id)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '7px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={13} />
                        <span>Live Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPendingApply({ type: 'arrangement', id: a.id, name: a.name })}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '7px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Layout size={13} />
                        <span>Apply</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: TEMPLATES */}
          {activeTab === 'templates' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {filteredTemplates.map((t) => (
                <div
                  key={t.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      {t.name}
                    </h4>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#6366f1',
                        backgroundColor: '#eef2ff',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t.category}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {t.description}
                  </p>

                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '11px',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <SlidersHorizontal size={13} color="#2563eb" />
                    <span>Variant: <strong>{t.variantId}</strong> • Arrangement: <strong>{t.arrangementId}</strong></span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => handleLivePreview('template', t.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={13} />
                      <span>Live Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPendingApply({ type: 'template', id: t.id, name: t.name })}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Sparkles size={13} />
                      <span>Apply</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SAVED USER PRESETS */}
          {activeTab === 'saved' && (
            <div>
              {relevantUserPresets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                  <Bookmark size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#334155' }}>No Saved Presets Yet</h4>
                  <p style={{ margin: 0, fontSize: '13px', maxWidth: '400px', marginInline: 'auto' }}>
                    Save custom {isHeader ? 'header' : 'footer'} configurations to reuse them across store themes.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {relevantUserPresets.map((up) => (
                    <div
                      key={up.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                          {up.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(up.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {up.structure && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', background: '#eff6ff', color: '#2563eb', borderRadius: '4px' }}>
                            Structure
                          </span>
                        )}
                        {up.style && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '4px' }}>
                            Styling
                          </span>
                        )}
                        {up.content && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', background: '#f0fdf4', color: '#16a34a', borderRadius: '4px' }}>
                            Content
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                        <button
                          type="button"
                          onClick={() => {
                            applyUserPreset(up.id);
                            closePresetModal();
                          }}
                          style={{
                            flex: 1,
                            padding: '7px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Apply Preset
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteUserPreset(up.id)}
                          style={{
                            padding: '7px',
                            borderRadius: '6px',
                            border: '1px solid #fecaca',
                            backgroundColor: '#fff1f2',
                            color: '#ef4444',
                            cursor: 'pointer',
                          }}
                          title="Delete saved preset"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── APPLY CONFIRMATION DIALOG (OVERLAY) ─── */}
        {pendingApply && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                width: '100%',
                maxWidth: '520px',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2563eb',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Apply {pendingApply.type}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Apply &quot;{pendingApply.name}&quot;?
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Choose how your existing content (text, links, and logos) should be applied to the new layout:
                </p>
              </div>

              {/* 3 Radio Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Option 1: Keep My Content (Recommended) */}
                <label
                  onClick={() => setApplyOption('keep-content')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: applyOption === 'keep-content' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: applyOption === 'keep-content' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="applyOption"
                    checked={applyOption === 'keep-content'}
                    onChange={() => setApplyOption('keep-content')}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Keep My Content</strong>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Recommended
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.35 }}>
                      Preserve existing text, links, and logo. Only the layout, structure, and styling will update.
                    </p>
                  </div>
                </label>

                {/* Option 2: Adapt My Content */}
                <label
                  onClick={() => setApplyOption('adapt-content')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: applyOption === 'adapt-content' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: applyOption === 'adapt-content' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="applyOption"
                    checked={applyOption === 'adapt-content'}
                    onChange={() => setApplyOption('adapt-content')}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>Adapt My Content</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.35 }}>
                      Intelligently map content elements into new layout slots, reorganizing where needed.
                    </p>
                  </div>
                </label>

                {/* Option 3: Replace With Preset Defaults */}
                <label
                  onClick={() => setApplyOption('replace-preset')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: applyOption === 'replace-preset' ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                    backgroundColor: applyOption === 'replace-preset' ? '#fff1f2' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="applyOption"
                    checked={applyOption === 'replace-preset'}
                    onChange={() => setApplyOption('replace-preset')}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Replace With Preset</strong>
                      <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 600 }}>⚠️ Fresh copy</span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.35 }}>
                      Full swap with preset defaults. Custom copy and links will be replaced with preset content.
                    </p>
                  </div>
                </label>
              </div>

              {/* Checkbox: Save Backup */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#475569',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <input
                  type="checkbox"
                  checked={saveCurrentBeforeApply}
                  onChange={(e) => setSaveCurrentBeforeApply(e.target.checked)}
                />
                <span>Save a backup version before applying (can be restored anytime)</span>
              </label>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPendingApply(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApply}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  Apply {pendingApply.name}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
