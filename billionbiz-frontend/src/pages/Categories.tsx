import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const CategoriesPage: FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (err: any) {
      setLoadError(err.message || 'Categories could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setActionError(null);
    setShowAddModal(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setName(category.name || '');
    setSlug(category.slug || '');
    setDescription(category.description || '');
    setImageUrl(category.image_url || '');
    setActionError(null);
    setShowAddModal(true);
  };

  const closeCategoryModal = () => {
    if (isSubmitting) return;
    setShowAddModal(false);
    setEditingCategory(null);
    setActionError(null);
  };

  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedName = name.trim();
    const normalizedSlug = (slug.trim() || normalizedName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!normalizedName) {
      setActionError('Category name is required.');
      return;
    }
    if (!normalizedSlug) {
      setActionError('Enter a valid category URL slug.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    try {
      const payload = { name: normalizedName, slug: normalizedSlug, description: description.trim(), imageUrl: imageUrl.trim() || undefined };
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
      } else {
        await api.createCategory(payload);
      }

      setShowAddModal(false);
      setEditingCategory(null);
      setName('');
      setSlug('');
      setDescription('');
      setImageUrl('');
      await fetchCategories();
    } catch (err: any) {
      setActionError(err.message || 'The category could not be saved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: any) => {
    const confirmed = window.confirm(
      `Archive “${category.name}”? Categories linked to products or child categories cannot be archived.`
    );
    if (!confirmed) return;

    setDeletingCategoryId(category.id);
    setActionError(null);
    try {
      await api.deleteCategory(category.id);
      await fetchCategories();
    } catch (err: any) {
      setActionError(err.message || 'The category could not be archived.');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ padding: 'clamp(16px, 2.2vw, 32px)', width: '100%', maxWidth: '1440px', margin: '0 auto', minWidth: 0, fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderTree size={26} color="#083e47" />
            Product Categories & Taxonomy
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Organize catalog products into structured collections for web storefront and POS terminal discovery.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#083e47',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(8, 62, 71, 0.25)'
          }}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search category name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search categories by name or URL slug"
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </div>

      {/* Grid */}
      {actionError && !showAddModal && (
        <div role="alert" style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '9px', background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', fontSize: '13px' }}>{actionError}</div>
      )}
      {loadError ? (
        <div role="alert" style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px', color: '#991b1b' }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px' }}>{loadError}</p>
          <button type="button" onClick={() => void fetchCategories()} style={{ minHeight: '40px', padding: '0 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
        </div>
      ) : loading ? (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <TableSkeleton rows={4} columns={4} />
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title={searchQuery ? 'No matching categories' : 'No product categories configured'}
          description={
            searchQuery
              ? 'No category matched your search.'
              : 'Create categories like Apparel, Electronics, or Home Goods to group your catalog products.'
          }
          actionLabel="Add First Category"
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a', overflowWrap: 'anywhere' }}>
                    {cat.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    aria-label={`Edit ${cat.name}`}
                    title="Edit category"
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                  >
                    <span aria-hidden="true">✎</span>
                  </button>
                  <button
                    type="button"
                    disabled={deletingCategoryId === cat.id}
                    onClick={() => void handleDelete(cat)}
                    aria-label={`Archive ${cat.name}`}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                  Slug: <code style={{ color: '#0d9488', background: '#f0fdfa', padding: '1px 6px', borderRadius: '4px' }}>/{cat.slug}</code>
                </div>

                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  {cat.description || 'General catalog grouping for products.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>
                  {cat.products_count || 0} product(s) linked
                </span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div role="dialog" aria-modal="true" aria-labelledby="category-modal-title" onKeyDown={(event) => { if (event.key === 'Escape') closeCategoryModal(); }} style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', maxHeight: 'calc(100dvh - 40px)', overflowY: 'auto', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.24)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="category-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{editingCategory ? 'Edit Product Category' : 'Add Product Category'}</h2>
              <button type="button" onClick={closeCategoryModal} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label htmlFor="category-name" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Category Name *</label>
                <input
                  id="category-name"
                  type="text"
                  required
                  placeholder="e.g. Footwear & Shoes"
                  maxLength={255}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label htmlFor="category-slug" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>URL Slug</label>
                <input
                  id="category-slug"
                  type="text"
                  placeholder="footwear-shoes"
                  maxLength={255}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="category-image" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Category Image URL</label>
                <input id="category-image" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '14px' }} />
                <label htmlFor="category-image-upload" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Or upload an image</label>
                <input id="category-image-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" disabled={uploadingImage} onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setUploadingImage(true); setActionError(null); try { const result = await api.uploadStoreMedia(file); setImageUrl(result.url); } catch (error: any) { setActionError(error.message || 'Image upload failed.'); } finally { setUploadingImage(false); event.target.value = ''; } }} style={{ width: '100%', marginBottom: 14 }} />
                {uploadingImage && <p style={{ fontSize: 12, color: '#64748b' }}>Uploading image…</p>}
                <label htmlFor="category-description" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Description</label>
                <textarea
                  id="category-description"
                  rows={3}
                  maxLength={2000}
                  placeholder="Summary for storefront SEO..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              {actionError && (
                <div role="alert" style={{ padding: '10px 12px', marginBottom: '14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px' }}>{actionError}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#0d9488', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
