// ============================================================
// FOOTER COMPONENT PICKER
// Reusable component picker modal for inserting Groups and
// Components/Blocks into the recursive footer tree.
// ============================================================

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  LayoutGrid,
  Heading,
  Type,
  Image,
  Gem,
  Sparkles,
  Menu,
  Share2,
  SquareCheck,
  Mail,
  Minus,
  MoveVertical,
  CreditCard,
  Copyright,
  Layers,
  ArrowRight,
  PhoneCall,
  ShieldCheck,
  Smartphone,
  Globe,
  Code,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import {
  FOOTER_COMPONENT_DEFS,
  createNodeFromDef,
  findNodeById,
} from './footerTreeEngine';
import type { FooterNodeCategory, FooterComponentDefinition, FooterTreeNode } from './footerTreeTypes';
import { createDefaultGroupLayout } from './footerTreeTypes';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  LayoutGrid,
  Heading,
  Type,
  Image,
  Gem,
  Sparkles,
  Menu,
  Share2,
  SquareCheck,
  Mail,
  Minus,
  MoveVertical,
  CreditCard,
  Copyright,
  Layers,
  PhoneCall,
  ShieldCheck,
  Smartphone,
  Globe,
  Code,
};

const CATEGORIES: { id: FooterNodeCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Components' },
  { id: 'layout', label: 'Layout' },
  { id: 'content', label: 'Content' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'actions', label: 'Actions' },
  { id: 'forms', label: 'Forms' },
  { id: 'structure', label: 'Structure' },
  { id: 'store-info', label: 'Store Info' },
];

export const FooterComponentPicker: React.FC = () => {
  const {
    isFooterComponentPickerOpen,
    footerPickerTargetParentId,
    footerPickerTargetIndex,
    closeFooterComponentPicker,
    addFooterTreeNode,
    footerTree,
  } = useEditorContextStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FooterNodeCategory | 'all'>('all');

  // Determine parent context
  const parentNode = useMemo(() => {
    if (!footerPickerTargetParentId) return null;
    return findNodeById(footerTree, footerPickerTargetParentId);
  }, [footerTree, footerPickerTargetParentId]);

  const parentType: 'root' | 'group' = parentNode ? 'group' : 'root';
  const parentName = parentNode ? parentNode.name : 'Footer Root';

  // Filter components
  const filteredComponents = useMemo(() => {
    return FOOTER_COMPONENT_DEFS.filter((def) => {
      // Must be allowed for parent
      if (!def.allowedParents.includes(parentType)) return false;

      // Category filter
      if (activeCategory !== 'all' && def.category !== activeCategory) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = def.name.toLowerCase().includes(q);
        const matchesDesc = def.description.toLowerCase().includes(q);
        const matchesCat = def.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [parentType, activeCategory, searchQuery]);

  if (!isFooterComponentPickerOpen) return null;

  const handleSelectComponent = (def: FooterComponentDefinition) => {
    let overrides: Partial<FooterTreeNode> | undefined = undefined;

    if (def.nodeType === 'group') {
      const isParentHorizontal = parentNode?.layout?.direction === 'horizontal';
      // When added into a horizontal group (like the main footer row) or at root,
      // the new group acts as a column. Columns should always stack children vertically
      // by default so components added inside are vertically aligned, never squished horizontally!
      if (isParentHorizontal || !parentNode) {
        overrides = {
          layout: {
            ...createDefaultGroupLayout('vertical'),
            gap: 16,
            crossAxisAlignment: 'start',
            width: { mode: 'fill' },
          },
        };
      }
    }

    const newNode = createNodeFromDef(def, overrides);
    addFooterTreeNode(newNode, footerPickerTargetParentId, footerPickerTargetIndex);
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(15, 23, 42, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeFooterComponentPicker();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Add Component
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#64748b',
                  backgroundColor: '#f1f5f9',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                Into {parentName}
              </span>
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Select a component to insert into your footer layout
            </p>
          </div>
          <button
            onClick={closeFooterComponentPicker}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: '#f8fafc',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search bar & Categories */}
        <div style={{ padding: '16px 24px 12px 24px', backgroundColor: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
          {/* Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '8px 12px',
              marginBottom: '12px',
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search components (e.g. Group, Heading, Newsletter, Social)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '14px',
                color: '#0f172a',
                backgroundColor: 'transparent',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: active ? 600 : 500,
                    border: active ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: active ? '#eff6ff' : '#ffffff',
                    color: active ? '#1d4ed8' : '#64748b',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Components Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
            maxHeight: '52vh',
          }}
        >
          {filteredComponents.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '48px 16px',
                textAlign: 'center',
                color: '#94a3b8',
              }}
            >
              <LayoutGrid size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#475569' }}>
                No components found
              </p>
              <p style={{ margin: 0, fontSize: '13px' }}>
                Try adjusting your search query or selecting a different category.
              </p>
            </div>
          ) : (
            filteredComponents.map((def) => {
              const IconComp = ICON_MAP[def.icon] || LayoutGrid;
              const isGroup = def.nodeType === 'group';

              return (
                <div
                  key={def.nodeType}
                  onClick={() => handleSelectComponent(def)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: isGroup ? '1.5px solid #bfdbfe' : '1px solid #e2e8f0',
                    backgroundColor: isGroup ? '#f8faff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = isGroup ? '#eff6ff' : '#f8fafc';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isGroup ? '#bfdbfe' : '#e2e8f0';
                    e.currentTarget.style.backgroundColor = isGroup ? '#f8faff' : '#ffffff';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: isGroup ? '#dbeafe' : '#f1f5f9',
                      color: isGroup ? '#1d4ed8' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        {def.name}
                      </span>
                      {isGroup && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#2563eb',
                            backgroundColor: '#dbeafe',
                            padding: '1px 6px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Container
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '12px',
                        color: '#64748b',
                        lineHeight: 1.4,
                      }}
                    >
                      {def.description}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    color="#94a3b8"
                    style={{ alignSelf: 'center', flexShrink: 0, opacity: 0.7 }}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <span>
            {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} available
          </span>
          <button
            onClick={closeFooterComponentPicker}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '12px',
              fontWeight: 500,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
