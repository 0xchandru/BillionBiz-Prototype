import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useSiteStore, type SectionData } from '../../../store/siteStore';
import { getBlockDefinition } from './registry';
import { isVersionedSection, migrateLegacyFeaturedCollection } from './documentAdapter';
import './builtins';
import { featuredCollectionBlockDefinitions } from './featuredCollectionDefinition';
import type { BlockInstance, JsonValue, SectionInstance } from './types';

type InspectorTab = 'content' | 'design' | 'responsive';

interface FeaturedCollectionInspectorProps {
  pageId: string;
  section: SectionData;
  onClose: () => void;
}

const TOKEN_OPTIONS = [
  { label: 'Inherit from theme', value: 'inherit' },
  { label: 'Brand primary', value: 'token:color.brand.primary' },
  { label: 'Brand secondary', value: 'token:color.brand.secondary' },
  { label: 'Brand accent', value: 'token:color.brand.accent' },
  { label: 'Heading text', value: 'token:color.text.heading' },
  { label: 'Body text', value: 'token:color.text.body' },
  { label: 'Muted text', value: 'token:color.text.muted' },
  { label: 'Surface background', value: 'token:color.background.surface' }
];

const controlStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 10px',
  border: '1px solid var(--theme-border, #dbe1ea)',
  borderRadius: 8,
  background: 'var(--theme-bg, #ffffff)',
  color: 'var(--theme-text-body, #172033)',
  font: 'inherit',
  fontSize: 12
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  color: 'var(--theme-text-muted, #64748b)',
  fontSize: 11,
  fontWeight: 650
};

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 12,
  border: '1px solid var(--theme-border, #e2e8f0)',
  borderRadius: 10,
  background: 'var(--theme-bg, #ffffff)'
};

const introStyle: React.CSSProperties = {
  margin: '0 0 14px',
  color: 'var(--theme-text-muted, #64748b)',
  fontSize: 11,
  lineHeight: 1.55
};

const toSelectValue = (value: any): string => {
  if (!value || value === 'inherit') return 'inherit';
  if (typeof value === 'string') return value;
  if (value.mode === 'token') return `token:${value.token}`;
  return 'inherit';
};

const toOverrideValue = (value: string): any => {
  if (value === 'inherit') return undefined;
  if (value.startsWith('token:')) return { mode: 'token', token: value.slice(6) };
  return { mode: 'custom', value };
};

export const FeaturedCollectionInspector: React.FC<FeaturedCollectionInspectorProps> = ({
  pageId,
  section,
  onClose
}) => {
  const updateSectionInstance = useSiteStore((state) => state.updateSectionInstance);
  const [tab, setTab] = useState<InspectorTab>('content');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const document = useMemo(
    () => (isVersionedSection(section) ? section : migrateLegacyFeaturedCollection(section)) as SectionData & SectionInstance,
    [section]
  );

  useEffect(() => {
    if (isVersionedSection(section)) return;
    updateSectionInstance(pageId, section.id, {
      schemaVersion: document.schemaVersion,
      enabled: document.enabled,
      settings: document.settings,
      blocks: document.blocks,
      designOverrides: document.designOverrides,
      responsiveOverrides: document.responsiveOverrides,
      props: {}
    });
  }, [document, pageId, section, updateSectionInstance]);

  const blocks = (document.blocks || []) as BlockInstance[];
  const cardBlock = blocks.find((block) => block.type === 'product-card-template');
  const cardDefinition = (cardBlock ? getBlockDefinition(cardBlock.type) : undefined) ?? featuredCollectionBlockDefinitions[0]!;

  const save = (patch: Partial<SectionData>) => {
    updateSectionInstance(pageId, section.id, patch);
  };

  const updateSetting = (key: string, value: JsonValue) => {
    save({ settings: { ...(document.settings || {}), [key]: value } });
  };

  const updateDesign = (key: string, value: any) => {
    const next = { ...(document.designOverrides || {}) };
    if (value === undefined || value === 'inherit') delete next[key];
    else next[key] = value;
    save({ designOverrides: next });
  };

  const updateCardSetting = (key: string, value: boolean) => {
    if (!cardBlock) return;
    const nextBlocks = blocks.map((block) => block.id === cardBlock.id
      ? { ...block, settings: { ...block.settings, [key]: value } }
      : block
    );
    save({ blocks: nextBlocks });
  };

  const Field = ({
    label,
    value,
    onChange,
    type = 'text',
    min,
    max,
    maxLength,
    rows
  }: {
    label: string;
    value: any;
    onChange: (next: string) => void;
    type?: 'text' | 'number' | 'url' | 'textarea';
    min?: number;
    max?: number;
    maxLength?: number;
    rows?: number;
  }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          rows={rows || 3}
          maxLength={maxLength}
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          style={{ ...controlStyle, resize: 'vertical', lineHeight: 1.45 }}
        />
      ) : (
        <input
          type={type}
          min={min}
          max={max}
          maxLength={maxLength}
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          style={controlStyle}
        />
      )}
    </div>
  );

  const SelectField = ({
    label,
    value,
    options,
    onChange
  }: {
    label: string;
    value: string;
    options: Array<{ label: string; value: string }>;
    onChange: (next: string) => void;
  }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} style={controlStyle}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );

  const ToggleField = ({
    label,
    checked,
    onChange
  }: {
    label: string;
    checked: boolean;
    onChange: (next: boolean) => void;
  }) => (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, color: 'var(--theme-text-body, #334155)', fontSize: 12, fontWeight: 550 }}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--theme-bg, #fff)', color: 'var(--theme-text-body, #172033)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--theme-border, #e2e8f0)' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Featured Collection</div>
          <div style={{ marginTop: 3, color: 'var(--theme-text-muted, #64748b)', fontSize: 10 }}>Live catalogue section · Versioned</div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close Featured Collection inspector" style={{ width: 32, height: 32, border: '1px solid var(--theme-border, #e2e8f0)', borderRadius: 8, background: 'transparent', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      <div role="tablist" aria-label="Featured Collection settings" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 8, borderBottom: '1px solid var(--theme-border, #e2e8f0)' }}>
        {(['content', 'design', 'responsive'] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            style={{
              padding: '9px 5px',
              border: 0,
              borderRadius: 7,
              background: tab === item ? 'var(--theme-bg-surface, #f1f5f9)' : 'transparent',
              color: tab === item ? 'var(--theme-brand-primary, #1d4ed8)' : 'var(--theme-text-muted, #64748b)',
              fontSize: 12,
              fontWeight: 650,
              cursor: 'pointer'
            }}
          >
            {item === 'content' ? 'Content' : item === 'design' ? 'Design' : 'Responsive'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tab === 'content' && (
          <>
            <p style={introStyle}>This section reads live products from your store catalogue. Product names, prices, variants and stock are not copied into the page document.</p>
            <div style={cardStyle}>
              <Field label="Heading" value={document.settings.heading} maxLength={100} onChange={(value) => updateSetting('heading', value)} />
              <Field label="Description" type="textarea" rows={3} value={document.settings.description} maxLength={300} onChange={(value) => updateSetting('description', value)} />
              <Field label="View-all label" value={document.settings.linkText} maxLength={30} onChange={(value) => updateSetting('linkText', value)} />
              <Field label="View-all destination" type="url" value={document.settings.linkUrl} maxLength={500} onChange={(value) => updateSetting('linkUrl', value)} />
            </div>
            <div style={cardStyle}>
              <SelectField
                label="Layout"
                value={String(document.settings.layout || 'grid')}
                options={[{ label: 'Grid', value: 'grid' }, { label: 'Horizontal carousel', value: 'carousel' }]}
                onChange={(value) => updateSetting('layout', value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Desktop columns" type="number" min={2} max={5} value={document.settings.columns} onChange={(value) => updateSetting('columns', Math.max(2, Math.min(5, Number(value))) as JsonValue)} />
                <Field label="Products to show" type="number" min={1} max={24} value={document.settings.productLimit} onChange={(value) => updateSetting('productLimit', Math.max(1, Math.min(24, Number(value))) as JsonValue)} />
              </div>
              <Field label="Empty-state message" type="textarea" rows={3} maxLength={240} value={document.settings.emptyStateText} onChange={(value) => updateSetting('emptyStateText', value)} />
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Product card</div>
              {cardDefinition.settings.map((field) => (
                <ToggleField
                  key={field.key}
                  label={field.label}
                  checked={cardBlock?.settings[field.key] !== false}
                  onChange={(value) => updateCardSetting(field.key, value)}
                />
              ))}
            </div>
          </>
        )}

        {tab === 'design' && (
          <>
            <p style={introStyle}>Each value inherits from your active store theme until you select an explicit token override. Resetting returns the control to inherited mode.</p>
            <div style={cardStyle}>
              {[
                ['sectionBackground', 'Section background'],
                ['headingColor', 'Heading text'],
                ['bodyColor', 'Description text'],
                ['cardBackground', 'Product card background'],
                ['priceColor', 'Price'],
                ['linkColor', 'Links']
              ].map(([key, label]) => (
                <SelectField
                  key={key}
                  label={label}
                  value={toSelectValue(document.designOverrides?.[key])}
                  options={TOKEN_OPTIONS}
                  onChange={(value) => updateDesign(key, toOverrideValue(value))}
                />
              ))}
            </div>
            <div style={{ color: 'var(--theme-text-muted, #64748b)', fontSize: 10, lineHeight: 1.5 }}>
              For a custom design, change the corresponding semantic colour in the store Design system. This section will inherit it automatically.
            </div>
          </>
        )}

        {tab === 'responsive' && (
          <>
            <p style={introStyle}>Unspecified device values inherit the desktop design. The preview uses the selected logical device width.</p>
            <div style={cardStyle}>
              <SelectField
                label="Device"
                value={device}
                options={[
                  { label: 'Desktop', value: 'desktop' },
                  { label: 'Tablet', value: 'tablet' },
                  { label: 'Mobile', value: 'mobile' }
                ]}
                onChange={(value) => setDevice(value as typeof device)}
              />
              <ToggleField
                label={`Show section on ${device}`}
                checked={(document.responsiveOverrides as any)?.visibility?.[device] !== false}
                onChange={(checked) => {
                  const next = { ...(document.responsiveOverrides || {}) } as any;
                  next.visibility = { ...(next.visibility || {}), [device]: checked };
                  save({ responsiveOverrides: next });
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeaturedCollectionInspector;
