// ============================================================
// MASTER EDITOR ENGINE — SHARED ADD COMPONENT MODAL
// Clean, user-friendly modal strictly showing main items
// (complete row bands) for the Header and Footer editors.
// Child elements are added via item-level '+' buttons in left sidebar.
// ============================================================

import React, { useState } from 'react';
import {
  Megaphone,
  Phone,
  Layers,
  Sparkles,
  Box,
  ShieldCheck,
  Mail,
  CreditCard,
  FileText,
  Share2,
  X,
  Search,
  Check,
  Plus,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';

export const AddComponentModal: React.FC = () => {
  const {
    isAddComponentModalOpen,
    closeAddComponentModal,
    addHeaderRow,
    addFooterRow,
  } = useEditorContextStore();

  const { selectedPageId } = useLandingEditorStore();
  const store = useEditorContextStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  if (!isAddComponentModalOpen) return null;

  // Determine active editor mode
  const effectiveEditorType: 'header' | 'footer' =
    selectedPageId === 'header-global'
      ? 'header'
      : selectedPageId === 'footer-global'
      ? 'footer'
      : store.editorType === 'footer'
      ? 'footer'
      : 'header';

  const isHeader = effectiveEditorType === 'header';

  // Categories for Header
  const headerCategories = [
    { id: 'all', label: 'All Sections' },
    { id: 'Information', label: 'Information & Notices' },
    { id: 'Navigation', label: 'Catalog Navigation' },
    { id: 'Commerce', label: 'Promos & Deals' },
    { id: 'Structure', label: 'Custom Rows' },
  ];

  // Categories for Footer
  const footerCategories = [
    { id: 'all', label: 'All Sections' },
    { id: 'Trust', label: 'Trust & Guarantees' },
    { id: 'Customer', label: 'Newsletter & Leads' },
    { id: 'Brand', label: 'Brand & Bio' },
    { id: 'Commerce', label: 'Payment & Checkout' },
    { id: 'Social', label: 'Social Media' },
    { id: 'Legal', label: 'Legal & Copyright' },
    { id: 'Structure', label: 'Custom Rows' },
  ];

  const categories = isHeader ? headerCategories : footerCategories;

  // Header main items (row bands)
  const headerRowPresets = [
    {
      type: 'announcement',
      name: 'Announcement Bar',
      desc: 'Top notice banner for discounts, flash sales, free shipping notices, and countdown timers.',
      category: 'Information',
      icon: <Megaphone size={18} color="#f59e0b" />,
    },
    {
      type: 'utility',
      name: 'Utility Bar',
      desc: 'Secondary top bar with customer support phone, email, order tracking, and currency selector.',
      category: 'Information',
      icon: <Phone size={18} color="#0ea5e9" />,
    },
    {
      type: 'secondary-nav',
      name: 'Category Catalog Bar',
      desc: 'Dedicated horizontal catalog menu with scrollable category pills and discount badges.',
      category: 'Navigation',
      icon: <Layers size={18} color="#8b5cf6" />,
    },
    {
      type: 'promo',
      name: 'Campaign Promo Bar',
      desc: 'High-impact promotional banner with coupon codes, countdown clocks, and instant action button.',
      category: 'Commerce',
      icon: <Sparkles size={18} color="#ec4899" />,
    },
    {
      type: 'header-row',
      name: 'Custom Header Row',
      desc: 'Flexible multi-element header container supporting custom layout, spacing, and styling.',
      category: 'Structure',
      icon: <Box size={18} color="#6366f1" />,
    },
  ];

  // Footer main items (row bands)
  const footerRowPresets = [
    {
      type: 'trust',
      name: 'Trust & Badges Bar',
      desc: 'Confidence row highlighting free express shipping, 30-day money-back guarantee, and 256-bit SSL.',
      category: 'Trust',
      icon: <ShieldCheck size={18} color="#6366f1" />,
    },
    {
      type: 'newsletter',
      name: 'Newsletter Hero Bar',
      desc: 'High-conversion email capture banner with incentive coupon discount copy and social proof.',
      category: 'Customer',
      icon: <Mail size={18} color="#ec4899" />,
    },
    {
      type: 'brand',
      name: 'Brand & Bio Bar',
      desc: 'Storefront identity row featuring custom brand mark, company mission, and social networks.',
      category: 'Brand',
      icon: <Sparkles size={18} color="#f59e0b" />,
    },
    {
      type: 'payment',
      name: 'Payment & Security Bar',
      desc: 'Accepted payment methods (Visa, Mastercard, Amex, Apple Pay) and secure checkout badges.',
      category: 'Commerce',
      icon: <CreditCard size={18} color="#0ea5e9" />,
    },
    {
      type: 'legal',
      name: 'Legal & Policies Bar',
      desc: 'Bottom bar with copyright notice, privacy policy, terms of service, and Back-to-Top button.',
      category: 'Legal',
      icon: <FileText size={18} color="#64748b" />,
    },
    {
      type: 'social',
      name: 'Social Media Bar',
      desc: 'Prominent social profile icons row for Instagram, YouTube, Twitter/X, and TikTok.',
      category: 'Social',
      icon: <Share2 size={18} color="#f59e0b" />,
    },
    {
      type: 'category-links',
      name: 'Category Directory Links',
      desc: 'Horizontal directory of categories and products with customizable separators and styling.',
      category: 'Commerce',
      icon: <Layers size={18} color="#10b981" />,
    },
    {
      type: 'seo',
      name: 'SEO & Rich Content',
      desc: 'Search engine optimized content, brand stories, keyword taxonomy, and rich text.',
      category: 'Brand',
      icon: <Sparkles size={18} color="#6366f1" />,
    },
    {
      type: 'custom-row',
      name: 'Custom Footer Row',
      desc: 'Multi-column container supporting arbitrary layout, custom columns, and nested blocks.',
      category: 'Structure',
      icon: <Box size={18} color="#6366f1" />,
    },
  ];

  const rowPresets = isHeader ? headerRowPresets : footerRowPresets;

  // Single-instance checker (only enforce single primary-nav / footer navigation)
  const isRowAlreadyAdded = (rowType: string): boolean => {
    if (isHeader) {
      if (rowType === 'primary-nav') return true;
    } else {
      if (rowType === 'navigation') return true;
    }
    return false;
  };

  const filteredPresets = rowPresets.filter((row) => {
    const matchesCategory = activeTab === 'all' || row.category === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddRow = (rowType: string, name: string) => {
    if (isHeader) {
      addHeaderRow(rowType as any, name);
    } else {
      addFooterRow(rowType as any, name);
    }
    closeAddComponentModal();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={closeAddComponentModal}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Add {isHeader ? 'Header' : 'Footer'} Section
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Select a section row to add to your {isHeader ? 'header' : 'footer'} layout. Child elements can be added inside each item in the left sidebar.
            </p>
          </div>
          <button
            type="button"
            onClick={closeAddComponentModal}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#64748b',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '12px',
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder={`Search ${isHeader ? 'header' : 'footer'} sections (e.g. Announcement, Utility, Promo, Trust, Newsletter)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '13px',
                color: '#0f172a',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: activeTab === cat.id ? 600 : 500,
                  backgroundColor: activeTab === cat.id ? '#2563eb' : '#ffffff',
                  color: activeTab === cat.id ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: activeTab === cat.id ? '0 1px 2px rgba(37, 99, 235, 0.2)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body — ONLY Main Items (Row Bands) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              marginBottom: '12px',
            }}
          >
            Available Sections ({filteredPresets.length})
          </div>

          {filteredPresets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
              <p style={{ fontSize: '14px', fontWeight: 500 }}>No sections matching &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                style={{
                  marginTop: '8px',
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: '#2563eb',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {filteredPresets.map((row) => {
                const isRowDisabled = isRowAlreadyAdded(row.type);
                return (
                  <div
                    key={row.type}
                    onClick={() => {
                      if (!isRowDisabled) handleAddRow(row.type, row.name);
                    }}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: isRowDisabled ? 'not-allowed' : 'pointer',
                      backgroundColor: isRowDisabled ? '#f8fafc' : '#ffffff',
                      opacity: isRowDisabled ? 0.65 : 1,
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isRowDisabled) {
                        e.currentTarget.style.borderColor = '#93c5fd';
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isRowDisabled) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                    title={isRowDisabled ? 'This section is already in your layout' : `Add ${row.name}`}
                  >
                    <div
                      style={{
                        padding: '8px',
                        backgroundColor: isRowDisabled ? '#f1f5f9' : '#f8fafc',
                        borderRadius: '8px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {row.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: isRowDisabled ? '#64748b' : '#0f172a' }}>
                          {row.name}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 500,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                          }}
                        >
                          {row.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                        {row.desc}
                      </div>
                    </div>
                    {isRowDisabled ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#10b981',
                          backgroundColor: '#ecfdf5',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Check size={12} color="#10b981" /> Added
                      </span>
                    ) : (
                      <div
                        style={{
                          padding: '6px',
                          backgroundColor: '#eff6ff',
                          borderRadius: '6px',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Plus size={15} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
