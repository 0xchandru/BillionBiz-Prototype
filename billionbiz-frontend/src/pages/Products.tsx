import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  X, 
  Box
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';

const formatCurrency = (minor: number) => {
  return '₹' + (minor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [adjustQty, setAdjustQty] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // New product form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('1999');
  const [sku, setSku] = useState('');
  const [initialStock, setInitialStock] = useState('20');
  const [description, setDescription] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [sellingUnit, setSellingUnit] = useState('pcs');
  const [minimumQuantity, setMinimumQuantity] = useState('1');
  const [quantityStep, setQuantityStep] = useState('1');
  const [comparePrice, setComparePrice] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [variantOptionName, setVariantOptionName] = useState('Size');
  const [variantOptionValues, setVariantOptionValues] = useState('');
  const [visibility, setVisibility] = useState('ACTIVE');
  const [uploadingImages, setUploadingImages] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const prodRes = await api.getProducts({ search: search || undefined });
      setProducts(prodRes.products || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProductOptions = async () => {
    const [categoryResult, unitResult] = await Promise.allSettled([api.getCategories(), api.getSellingUnits()]);
    if (categoryResult.status === 'fulfilled') setCategories(categoryResult.value.categories || []);
    if (unitResult.status === 'fulfilled') setUnits((unitResult.value.units || []).filter((unit: any) => unit.is_enabled));
  };

  const resetProductForm = () => {
    setEditingProduct(null); setName(''); setDescription(''); setSku(''); setCategoryIds([]);
    setSellingUnit('pcs'); setMinimumQuantity('1'); setQuantityStep('1'); setComparePrice('');
    setImageUrls(''); setVariantOptionName('Size'); setVariantOptionValues(''); setVisibility('ACTIVE');
  };

  const openProduct = (product?: any) => {
    void loadProductOptions();
    resetProductForm();
    if (product) {
      setEditingProduct(product); setName(product.name || ''); setDescription(product.description || '');
      setSku(product.variants?.[0]?.sku || ''); setCategoryIds((product.categories || []).map((category: any) => category.id));
      setSellingUnit(product.selling_unit || 'pcs'); setMinimumQuantity(String(product.minimum_quantity || 1));
      setQuantityStep(String(product.quantity_step || 1)); setComparePrice(product.variants?.[0]?.compare_at_minor ? String(product.variants[0].compare_at_minor / 100) : '');
      setImageUrls((product.media || []).map((media: any) => typeof media === 'string' ? media : media.url).filter(Boolean).join('\n'));
      setVisibility(product.status || 'ACTIVE');
    }
    setIsCreateOpen(true);
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const priceMinor = Math.round(parseFloat(price) * 100);
      const optionValues = [...new Set(variantOptionValues.split(',').map((value) => value.trim()).filter(Boolean))];
      const createdVariants = optionValues.length ? optionValues.map((value, index) => ({
        sku: optionValues.length === 1 ? (sku || undefined) : `${(sku || name).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)}-${value.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
        optionValues: { [variantOptionName || 'Option']: value }, priceMinor, compareAtMinor: comparePrice ? Math.round(Number(comparePrice) * 100) : null,
        initialStock: Number(initialStock) || 0, barcode: undefined, position: index
      })) : [{ sku: sku || undefined, priceMinor, compareAtMinor: comparePrice ? Math.round(Number(comparePrice) * 100) : null, initialStock: Number(initialStock) || 0 }];
      const payload = {
        name,
        description,
        priceMinor,
        initialStock: Number(initialStock) || 0, categoryIds, sellingUnit, minimumQuantity: Number(minimumQuantity), quantityStep: Number(quantityStep),
        media: imageUrls.split('\n').map((url) => url.trim()).filter(Boolean).map((url) => ({ url })), status: visibility,
        options: optionValues.length ? [{ name: variantOptionName || 'Option', values: optionValues }] : [],
        variants: createdVariants
      };
      if (editingProduct) await api.updateProduct(editingProduct.id, { ...payload, variants: createdVariants.map((variant, index) => ({ ...variant, id: editingProduct.variants?.[index]?.id })) });
      else await api.createProduct(payload);
      setIsCreateOpen(false);
      resetProductForm();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (product: any) => {
    if (!window.confirm(`Deactivate ${product.name}? It will no longer be available in the storefront.`)) return;
    try { await api.deactivateProduct(product.id); await loadData(); } catch (err: any) { alert(err.message || 'Could not deactivate product.'); }
  };
  const reorderImage = (index: number, offset: number) => {
    const items = imageUrls.split('\n').map((value) => value.trim()).filter(Boolean);
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
    setImageUrls(items.join('\n'));
  };

  const handleAdjustInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;
    try {
      setSubmitting(true);
      await api.adjustInventory({
        variantId: selectedVariant.id,
        locationId: 'loc-default',
        adjustmentQty: Number(adjustQty),
        movementType: 'MANUAL_COUNT',
        note: 'Admin manual count reconciliation'
      });
      setIsAdjustOpen(false);
      setSelectedVariant(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to adjust inventory');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>Catalogue</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Products</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Product Catalogue
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
            Manage sellable SKUs, multi-variant options, and storefront pricing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => openProduct()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#0d9488',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Plus size={15} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search products by title, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: '24px' }}>
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Box}
            title="No products in catalog"
            description={search ? 'No products match your search criteria.' : 'Create sellable inventory items, set prices, and configure options.'}
            actionLabel="Add Product"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '14px 18px' }}>Product</th>
                <th style={{ padding: '14px 18px' }}>Category</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Variants</th>
                <th style={{ padding: '14px 18px' }}>Price</th>
                <th style={{ padding: '14px 18px' }}>Stock Available</th>
                <th style={{ padding: '14px 18px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const primaryVariant = p.variants?.[0] || {};
                const totalStock = (p.variants || []).reduce((acc: number, v: any) => acc + (v.stock_available || 0), 0);
                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#f0fdfa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0d9488'
                        }}>
                          <Box size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>SKU: {primaryVariant.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>
                      {p.category_name || 'General Catalog'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: p.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                        color: p.status === 'ACTIVE' ? '#15803d' : '#475569'
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <button type="button" onClick={() => openProduct(p)} style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '5px 9px', background: '#fff', cursor: 'pointer', marginRight: 6 }}>Edit</button>
                      <button type="button" onClick={() => void handleDeactivate(p)} style={{ border: '1px solid #fecaca', borderRadius: 6, padding: '5px 9px', background: '#fff7f7', color: '#b91c1c', cursor: 'pointer' }}>Deactivate</button>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>
                      {p.variants?.length || 1} variant(s)
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                      {formatCurrency(primaryVariant.price_minor || 0)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: totalStock > 5 ? '#dcfce7' : totalStock > 0 ? '#fef3c7' : '#fee2e2',
                        color: totalStock > 5 ? '#15803d' : totalStock > 0 ? '#b45309' : '#b91c1c'
                      }}>
                        {totalStock} in stock
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE PRODUCT MODAL */}
      {isCreateOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleCreate} style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsCreateOpen(false)} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Handmade Ceramic Mug"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Categories (first selected is primary)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 96, overflow: 'auto', padding: 8, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                {categories.map((category) => <label key={category.id} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={categoryIds.includes(category.id)} onChange={(event) => setCategoryIds((current) => event.target.checked ? [...current, category.id] : current.filter((id) => id !== category.id))} />{category.name}</label>)}
                {!categories.length && <span style={{ color: '#64748b', fontSize: 12 }}>No categories yet. Create one in Catalogue → Categories.</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Selling unit
                <select value={sellingUnit} onChange={(event) => setSellingUnit(event.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 9, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  {(units.length ? units : [{ code: 'pcs', label: 'Pieces' }]).map((unit) => <option key={unit.code} value={unit.code}>{unit.label} ({unit.code})</option>)}
                </select>
              </label>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Visibility
                <select value={visibility} onChange={(event) => setVisibility(event.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 9, borderRadius: 8, border: '1px solid #e2e8f0' }}><option value="ACTIVE">Publish now</option><option value="DRAFT">Hidden / draft</option><option value="ARCHIVED">Archived</option></select>
              </label>
            </div>

            {sellingUnit !== 'pcs' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Minimum quantity ({sellingUnit})<input type="number" min="0.001" step="0.001" value={minimumQuantity} onChange={(event) => setMinimumQuantity(event.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 9, border: '1px solid #e2e8f0', borderRadius: 8 }} /></label>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Quantity step ({sellingUnit})<input type="number" min="0.001" step="0.001" value={quantityStep} onChange={(event) => setQuantityStep(event.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 9, border: '1px solid #e2e8f0', borderRadius: 8 }} /></label>
            </div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Price (INR) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Compare price (INR)</label>
                <input type="number" min="0" step="0.01" value={comparePrice} onChange={(event) => setComparePrice(event.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Initial Stock Units</label>
                <input
                  type="number"
                  min="0"
                  step={sellingUnit === 'pcs' ? '1' : '0.001'}
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Primary SKU Code</label>
              <input
                type="text"
                placeholder="e.g. MUG-CER-01 (Auto-generated if blank)"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
            </div>

            {!editingProduct && <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Variant option<input value={variantOptionName} onChange={(e) => setVariantOptionName(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 5, padding: 8, border: '1px solid #e2e8f0', borderRadius: 7 }} /></label>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Variant values (comma separated)<input value={variantOptionValues} onChange={(e) => setVariantOptionValues(e.target.value)} placeholder="Small, Medium, Large" style={{ display: 'block', width: '100%', marginTop: 5, padding: 8, border: '1px solid #e2e8f0', borderRadius: 7 }} /></label>
            </div>}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Product image URLs (one per line; first image is primary)</label>
              <textarea rows={2} value={imageUrls} onChange={(event) => setImageUrls(event.target.value)} placeholder="https://cdn.example.com/product.jpg" style={{ width: '100%', padding: 9, border: '1px solid #e2e8f0', borderRadius: 8, resize: 'vertical' }} />
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple disabled={uploadingImages} onChange={async (event) => { const files = Array.from(event.target.files || []); if (!files.length) return; setUploadingImages(true); try { const uploaded = await Promise.all(files.map((file) => api.uploadStoreMedia(file))); const current = imageUrls.split('\n').map((value) => value.trim()).filter(Boolean); setImageUrls([...current, ...uploaded.map((image) => image.url)].join('\n')); } catch (error: any) { alert(error.message || 'Image upload failed.'); } finally { setUploadingImages(false); event.target.value = ''; } }} style={{ marginTop: 8 }} />
              {uploadingImages && <span style={{ display: 'block', fontSize: 12, color: '#64748b' }}>Uploading product images…</span>}
              <div style={{ display: 'grid', gap: 5, marginTop: 8 }}>{imageUrls.split('\n').map((url) => url.trim()).filter(Boolean).map((url, index, list) => <div key={`${url}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{index === 0 ? 'Primary · ' : ''}{url}</span><button type="button" disabled={index === 0} onClick={() => reorderImage(index, -1)} aria-label="Move image up">↑</button><button type="button" disabled={index === list.length - 1} onClick={() => reorderImage(index, 1)} aria-label="Move image down">↓</button></div>)}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Description</label>
              <textarea
                rows={3}
                placeholder="Key product attributes and dimensions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECONCILE STOCK MODAL */}
      {isAdjustOpen && selectedVariant && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleAdjustInventory} style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Reconcile Stock</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsAdjustOpen(false)} />
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Adjust inventory for SKU: <strong style={{ color: '#0d9488' }}>{selectedVariant.sku}</strong>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Stock Adjustment (+ / - units)
              </label>
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsAdjustOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#0d9488', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                {submitting ? 'Updating...' : 'Confirm Count'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
