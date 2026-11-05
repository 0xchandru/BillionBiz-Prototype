import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Plus, 
  Edit2, 
  FileText,
  Home,
  CheckCircle2,
  Lock,
  Search,
  Copy,
  Sliders,
  X,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Pages.module.css';
import { getEditorPath } from '../components/editor/utils/editorNavigation';
import { apiClient } from '../api/client';
import { Skeleton } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';

const RESERVED_SYSTEM_PATHS = [
  '/',
  '/shop',
  '/products',
  '/collections',
  '/cart',
  '/checkout',
  '/account',
  '/account/login',
  '/search',
  '/booking',
  '/policies/privacy',
  '/policies/terms',
  '/policies/refund',
  '/contact',
  '/404',
  '/password'
];

export const Pages = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'system' | 'custom'>('all');
  const [livePages, setLivePages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPageForEdit, setSelectedPageForEdit] = useState<any>(null);
  const [deleteConfirmPage, setDeleteConfirmPage] = useState<any>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Add Page Form state
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageTemplate, setNewPageTemplate] = useState('standard');
  const [newPageSeoDesc, setNewPageSeoDesc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Page Form state
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editTemplate, setEditTemplate] = useState('standard');
  const [editSeoTitle, setEditSeoTitle] = useState('');
  const [editSeoDesc, setEditSeoDesc] = useState('');

  const fetchPages = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await apiClient<any>('/storefront/pages');
      if (res && Array.isArray(res.pages)) {
        setLivePages(res.pages);
      } else {
        throw new Error('The server returned an invalid pages list.');
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load your store pages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const triggerToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleTitleChange = (val: string) => {
    setNewPageTitle(val);
    const derived = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setNewPageSlug(derived);
    if (formError) setFormError(null);
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) {
      setFormError('Page title is required');
      return;
    }

    let cleanPath = newPageSlug.trim();
    if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;

    if (RESERVED_SYSTEM_PATHS.includes(cleanPath.toLowerCase())) {
      setFormError(`'${cleanPath}' is a reserved system path. Please choose a custom route.`);
      return;
    }

    try {
      await apiClient('/storefront/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPageTitle.trim(),
          path: cleanPath,
          templateKey: newPageTemplate,
          seoDescription: newPageSeoDesc.trim()
        })
      });

      triggerToast(`Custom page '${newPageTitle}' created successfully.`);
      setIsAddModalOpen(false);
      setNewPageTitle('');
      setNewPageSlug('');
      setNewPageSeoDesc('');
      fetchPages();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create page');
    }
  };

  const handleDuplicatePage = async (page: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient(`/storefront/pages/${page.id}/duplicate`, { method: 'POST' });
      triggerToast(`Page duplicated successfully.`);
      fetchPages();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to duplicate page');
    }
  };

  const openEditModal = (page: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPageForEdit(page);
    setEditTitle(page.name || '');
    setEditSlug(page.path || '');
    setEditTemplate(page.template_key || 'standard');
    setEditSeoTitle(page.seo_title || '');
    setEditSeoDesc(page.seo_description || '');
    setIsEditModalOpen(true);
  };

  const handleSavePageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPageForEdit) return;

    try {
      await apiClient(`/storefront/pages/${selectedPageForEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editTitle,
          path: selectedPageForEdit.is_locked ? undefined : editSlug,
          templateKey: editTemplate,
          seoTitle: editSeoTitle,
          seoDescription: editSeoDesc
        })
      });

      triggerToast(`Page '${editTitle}' settings updated.`);
      setIsEditModalOpen(false);
      setSelectedPageForEdit(null);
      fetchPages();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to update page');
    }
  };

  const handleDeletePage = async () => {
    if (!deleteConfirmPage) return;
    try {
      await apiClient(`/storefront/pages/${deleteConfirmPage.id}`, { method: 'DELETE' });
      triggerToast(`Page '${deleteConfirmPage.name}' deleted.`);
      setDeleteConfirmPage(null);
      fetchPages();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to delete page');
    }
  };

  const PAGE_PRIORITY_MAP: Record<string, number> = {
    '/': 1,
    'landing-page': 1,
    'landing': 1,
    '/shop': 2,
    'shop': 2,
    'shop-page': 2,
    '/products': 3,
    'product-details': 3,
    'product-details-page': 3,
    '/collections': 4,
    'collections': 4,
    'collections-page': 4,
    '/cart': 5,
    'cart': 5,
    'cart-page': 5,
    '/checkout': 6,
    'checkout': 6,
    'checkout-page': 6,
    '/wishlist': 7,
    'wishlist': 7,
    'wishlist-page': 7,
    '/booking': 8,
    '/book': 8,
    'booking': 8,
    'booking-page': 8,
    '/account': 9,
    'account': 9,
    'account-page': 9,
    '/order-history': 10,
    'order-history': 10,
    'order-history-page': 10,
    '/order-tracking': 11,
    'order-tracking': 11,
    'order-tracking-page': 11,
    '/policies/privacy': 12,
    '/privacy': 12,
    'privacy-policy': 12,
    'privacy-policy-page': 12,
    '/policies/terms': 13,
    '/terms': 13,
    'terms-conditions': 13,
    'terms-conditions-page': 13,
    '/policies/refund': 14,
    '/refund': 14,
    'refund-policy': 14,
    'refund-policy-page': 14,
    '/policies/shipping': 15,
    '/shipping': 15,
    'shipping-policy': 15,
    'shipping-policy-page': 15,
    '/contact': 16,
    'contact': 16,
    'contact-page': 16,
    '/maintenance': 17,
    'maintenance': 17,
    'maintenance-page': 17,
    '/404': 18,
    'not-found-page': 18
  };

  const systemPages = livePages.filter(p => p.is_system);
  const customPages = livePages.filter(p => !p.is_system);

  const displayList = (filterTab === 'system' ? systemPages : filterTab === 'custom' ? customPages : livePages);

  const filteredPages = displayList
    .filter(p => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.path?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const priorityA = PAGE_PRIORITY_MAP[a.path] || PAGE_PRIORITY_MAP[a.id] || 99;
      const priorityB = PAGE_PRIORITY_MAP[b.path] || PAGE_PRIORITY_MAP[b.id] || 99;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return (a.name || '').localeCompare(b.name || '');
    });

  return (
    <div className={styles.pagesContainer}>
      {/* Toast Notification */}
      {actionMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pages &amp; Templates Manager</h1>
          <p className={styles.subtitle}>
            Manage system-locked commerce routes, add custom content pages, duplicate, and configure SEO.
          </p>
        </div>
        <div className={styles.headerActions}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search all pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 14px 8px 34px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)',
                fontSize: '13px',
                outline: 'none',
                width: '220px',
              }}
            />
          </div>
          <button
            className={styles.btnOutline}
            onClick={fetchPages}
            title="Refresh pages list"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            className={styles.btnOutline}
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Add Custom Page</span>
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate('/editor/pages')}>
            <Edit2 size={16} />
            <span>Open Store Editor</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setFilterTab('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: filterTab === 'all' ? '#18181b' : 'transparent',
            color: filterTab === 'all' ? '#ffffff' : 'var(--color-text-muted)'
          }}
        >
          All Pages ({livePages.length})
        </button>
        <button
          onClick={() => setFilterTab('system')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: filterTab === 'system' ? '#18181b' : 'transparent',
            color: filterTab === 'system' ? '#ffffff' : 'var(--color-text-muted)'
          }}
        >
          System Pages ({systemPages.length})
        </button>
        <button
          onClick={() => setFilterTab('custom')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: filterTab === 'custom' ? '#18181b' : 'transparent',
            color: filterTab === 'custom' ? '#ffffff' : 'var(--color-text-muted)'
          }}
        >
          Custom Pages ({customPages.length})
        </button>
      </div>

      {/* Pages Table / Responsive Grid */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 2fr) minmax(140px, 1.5fr) minmax(120px, 1fr) minmax(100px, 1fr) 140px',
          padding: '12px 18px',
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <div>Page Title &amp; Status</div>
          <div>Route / Path</div>
          <div>Template</div>
          <div>Type</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {loading && livePages.length === 0 ? (
          <div style={{ display: 'grid', gap: 1, padding: '14px 18px' }} aria-label="Loading pages">
            {[0, 1, 2, 3, 4].map((row) => <div key={row} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 140px', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Skeleton width={32} height={32} /><div style={{ flex: 1 }}><Skeleton width="55%" height={14} /><Skeleton width="35%" height={11} style={{ marginTop: 6 }} /></div></div>
              <Skeleton width="65%" height={13} /><Skeleton width="55%" height={13} /><Skeleton width="40%" height={13} /><Skeleton width="100%" height={30} />
            </div>)}
          </div>
        ) : loadError && livePages.length === 0 ? (
          <ErrorState title="Pages couldn’t load" message={loadError} onRetry={() => void fetchPages()} />
        ) : filteredPages.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            {loadError ? <><p style={{ marginTop: 0 }}>Your last saved pages are shown, but refresh failed: {loadError}</p><button type="button" onClick={() => void fetchPages()} className={styles.btnOutline}>Retry</button></> : searchQuery || filterTab !== 'all' ? 'No pages match this filter.' : 'No pages are available for this store yet.'}
          </div>
        ) : (
          filteredPages.map((page) => (
            <div
              key={page.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(200px, 2fr) minmax(140px, 1.5fr) minmax(120px, 1fr) minmax(100px, 1fr) 140px',
                padding: '14px 18px',
                alignItems: 'center',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '13px',
                transition: 'background-color 0.15s ease'
              }}
              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
            >
              {/* Title & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: page.is_system ? '#eff6ff' : '#f0fdf4',
                  color: page.is_system ? '#2563eb' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {page.path === '/' ? <Home size={16} /> : page.is_system ? <Lock size={15} /> : <FileText size={16} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{page.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {page.is_system ? (
                      <span style={{ color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Lock size={10} /> System Locked
                      </span>
                    ) : (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>Custom Page</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Route */}
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                {page.path}
              </div>

              {/* Template */}
              <div style={{ textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>
                {page.template_key || 'Standard'}
              </div>

              {/* Category */}
              <div>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  textTransform: 'uppercase'
                }}>
                  {page.category || 'Store'}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                <button
                  onClick={() => navigate(getEditorPath(page.id))}
                  title="Edit in Store Editor"
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--color-text-main)'
                  }}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={(e) => handleDuplicatePage(page, e)}
                  title="Duplicate Page"
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--color-text-main)'
                  }}
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={(e) => openEditModal(page, e)}
                  title="SEO & Settings"
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--color-text-main)'
                  }}
                >
                  <Sliders size={13} />
                </button>
                {!page.is_system && !page.is_locked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmPage(page);
                    }}
                    title="Delete Custom Page"
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      border: '1px solid #fee2e2',
                      backgroundColor: '#fef2f2',
                      cursor: 'pointer',
                      color: '#ef4444'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Page Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add Custom Store Page</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePage} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>
                  {formError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Page Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brand Story, Sustainability, Size Guide"
                  value={newPageTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  URL Path / Slug
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                  <span style={{ padding: '9px 12px', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', borderRight: '1px solid #cbd5e1' }}>/</span>
                  <input
                    type="text"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', border: 'none', fontSize: '13px', outline: 'none' }}
                    required
                  />
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0' }}>Reserved routes (e.g. /shop, /cart, /checkout) are protected.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Template Layout
                </label>
                <select
                  value={newPageTemplate}
                  onChange={(e) => setNewPageTemplate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="standard">Standard (Content with Sidebar / Balanced)</option>
                  <option value="full-width">Full Width (Edge-to-edge layout)</option>
                  <option value="minimal">Minimalist (Distraction-free focus)</option>
                  <option value="split">Modern Split (Editorial showcase)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  SEO Meta Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary for search engines..."
                  value={newPageSeoDesc}
                  onChange={(e) => setNewPageSeoDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#18181b', color: '#ffffff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Edit SEO & Template Modal */}
      {isEditModalOpen && selectedPageForEdit && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Page Settings &amp; SEO</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{selectedPageForEdit.name}</span>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePageSettings} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Page Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  URL Route Path
                </label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  disabled={selectedPageForEdit.is_locked}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: selectedPageForEdit.is_locked ? '#f1f5f9' : '#ffffff',
                    cursor: selectedPageForEdit.is_locked ? 'not-allowed' : 'text'
                  }}
                />
                {selectedPageForEdit.is_locked && (
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={11} /> Required system page route is protected and cannot be modified.
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Template Layout
                </label>
                <select
                  value={editTemplate}
                  onChange={(e) => setEditTemplate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="standard">Standard Template</option>
                  <option value="full-width">Full Width Template</option>
                  <option value="minimal">Minimalist Template</option>
                  <option value="split">Modern Split Template</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={editSeoTitle}
                  onChange={(e) => setEditSeoTitle(e.target.value)}
                  placeholder="Appears in browser tab and search results"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  SEO Meta Description
                </label>
                <textarea
                  rows={2}
                  value={editSeoDesc}
                  onChange={(e) => setEditSeoDesc(e.target.value)}
                  placeholder="Description snippet for search engines..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#18181b', color: '#ffffff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#b91c1c' }}>Delete Page</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#475569' }}>
              Are you sure you want to delete custom page <strong>'{deleteConfirmPage.name}'</strong> ({deleteConfirmPage.path})? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirmPage(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePage}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                Delete Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;
