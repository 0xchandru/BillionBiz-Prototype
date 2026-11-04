import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';
import { useSiteStore, type SectionData } from '../../../store/siteStore';
import { getBlockDefinition } from './registry';
import './builtins';
import { heroBannerBlockDefinitions } from './heroBannerDefinition';
import { isVersionedSection, migrateLegacyHeroBanner } from './documentAdapter';
import type { BlockInstance, JsonValue } from './types';
import styles from './HeroBannerInspector.module.css';

type InspectorTab = 'content' | 'design' | 'responsive';

interface HeroBannerBlockInspectorProps {
  pageId: string;
  section: SectionData;
  onClose: () => void;
}

const createBlockId = (type: string) => {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${type}-${suffix}`;
};

const tokenOptions = [
  { label: 'Inherit from theme', value: 'inherit' },
  { label: 'Brand primary', value: 'token:color.brand.primary' },
  { label: 'Brand secondary', value: 'token:color.brand.secondary' },
  { label: 'Brand accent', value: 'token:color.brand.accent' },
  { label: 'Heading text', value: 'token:color.text.heading' },
  { label: 'Body text', value: 'token:color.text.body' },
  { label: 'Muted text', value: 'token:color.text.muted' },
];

const overrideValue = (value: any): string => {
  if (!value || value === 'inherit') return 'inherit';
  if (typeof value === 'string') return value;
  if (value.mode === 'token') return `token:${value.token}`;
  if (value.mode === 'custom') return String(value.value || '');
  return 'inherit';
};

const toOverride = (value: string): any => {
  if (value === 'inherit') return undefined;
  if (value.startsWith('token:')) return { mode: 'token', token: value.slice(6) };
  return { mode: 'custom', value };
};

export const HeroBannerBlockInspector: React.FC<HeroBannerBlockInspectorProps> = ({
  pageId,
  section,
  onClose
}) => {
  const updateSectionInstance = useSiteStore((state) => state.updateSectionInstance);
  const [activeTab, setActiveTab] = useState<InspectorTab>('content');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const document = useMemo(
    () => isVersionedSection(section) ? section : migrateLegacyHeroBanner(section),
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
      props: document.props || section.props
    });
  }, [document, pageId, section, updateSectionInstance]);

  const blocks = document.blocks || [];
  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) || blocks[0] || null;
  const selectedDefinition = selectedBlock ? getBlockDefinition(selectedBlock.type) : undefined;

  const saveDocument = (patch: Partial<SectionData>) => {
    updateSectionInstance(pageId, section.id, patch);
  };

  const updateSectionSetting = (key: string, value: JsonValue) => {
    saveDocument({ settings: { ...(document.settings || {}), [key]: value } });
  };

  const updateSectionDesign = (key: string, value: any) => {
    const next = { ...(document.designOverrides || {}) };
    if (value === undefined || value === 'inherit') delete next[key];
    else next[key] = value;
    saveDocument({ designOverrides: next });
  };

  const updateBlock = (blockId: string, patch: Partial<BlockInstance>) => {
    const nextBlocks = blocks.map((block) => block.id === blockId ? { ...block, ...patch } : block);
    saveDocument({ blocks: nextBlocks });
  };

  const updateBlockSetting = (blockId: string, key: string, value: JsonValue) => {
    const block = blocks.find((item) => item.id === blockId);
    if (!block) return;
    updateBlock(blockId, {
      settings: { ...block.settings, [key]: value }
    });
  };

  const updateBlockDesign = (blockId: string, key: string, value: any) => {
    const block = blocks.find((item) => item.id === blockId);
    if (!block) return;
    const next = { ...(block.designOverrides || {}) };
    if (value === undefined || value === 'inherit') delete next[key];
    else next[key] = value;
    updateBlock(blockId, { designOverrides: next });
  };

  const addBlock = (type: string) => {
    const definition = getBlockDefinition(type);
    if (!definition) return;
    const count = blocks.filter((block) => block.type === type).length;
    if (definition.maxPerSection !== undefined && count >= definition.maxPerSection) return;

    const block: BlockInstance = {
      id: createBlockId(type),
      type,
      schemaVersion: definition.schemaVersion,
      enabled: true,
      settings: { ...definition.defaultSettings },
      designOverrides: {},
      responsiveOverrides: {}
    };
    const nextBlocks = [...blocks, block];
    saveDocument({ blocks: nextBlocks });
    setSelectedBlockId(block.id);
  };

  const moveBlock = (blockId: string, direction: -1 | 1) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= blocks.length) return;
    const nextBlocks = [...blocks];
    [nextBlocks[index], nextBlocks[nextIndex]] = [nextBlocks[nextIndex], nextBlocks[index]];
    saveDocument({ blocks: nextBlocks });
  };

  const removeBlock = (block: BlockInstance) => {
    // The hero headline is a structural requirement, not a removable decoration.
    if (block.type === 'heading') return;
    const nextBlocks = blocks.filter((item) => item.id !== block.id);
    saveDocument({ blocks: nextBlocks });
    if (selectedBlockId === block.id) setSelectedBlockId(nextBlocks[0]?.id || null);
  };

  const availableBlockDefinitions = heroBannerBlockDefinitions.filter((definition) => {
    const count = blocks.filter((block) => block.type === definition.type).length;
    return definition.maxPerSection === undefined || count < definition.maxPerSection;
  });

  const fieldControl = (block: BlockInstance, field: (typeof heroBannerBlockDefinitions)[number]['settings'][number]) => {
    const value = block.settings[field.key];
    const label = field.label;
    if (field.control === 'toggle') {
      return (
        <label className={styles.row} key={field.key}>
          <span className={styles.label}>{label}</span>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => updateBlockSetting(block.id, field.key, event.target.checked)}
          />
        </label>
      );
    }
    if (field.control === 'select') {
      return (
        <div className={styles.field} key={field.key}>
          <label className={styles.label}>{label}</label>
          <select
            className={styles.select}
            value={String(value ?? field.defaultValue ?? '')}
            onChange={(event) => updateBlockSetting(block.id, field.key, event.target.value)}
          >
            {(field.options || []).map((option) => (
              <option key={String(option.value)} value={String(option.value)}>{option.label}</option>
            ))}
          </select>
        </div>
      );
    }
    if (field.control === 'textarea') {
      return (
        <div className={styles.field} key={field.key}>
          <label className={styles.label}>{label}</label>
          <textarea
            className={styles.textarea}
            maxLength={field.maxLength}
            value={String(value ?? '')}
            onChange={(event) => updateBlockSetting(block.id, field.key, event.target.value)}
          />
        </div>
      );
    }
    return (
      <div className={styles.field} key={field.key}>
        <label className={styles.label}>{label}</label>
        <input
          className={styles.input}
          type={field.control === 'number' ? 'number' : 'text'}
          maxLength={field.maxLength}
          min={field.min}
          max={field.max}
          value={String(value ?? '')}
          onChange={(event) => updateBlockSetting(
            block.id,
            field.key,
            field.control === 'number' ? Number(event.target.value) : event.target.value
          )}
          placeholder={field.control === 'image' ? 'https://… or uploaded asset URL' : undefined}
        />
      </div>
    );
  };

  const selectedColorValue = selectedBlock
    ? overrideValue(selectedBlock.designOverrides?.color)
    : 'inherit';

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <div className={styles.headerTitle}>Hero Banner</div>
          <span className={styles.headerMeta}>Section · Versioned block layout</span>
        </div>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close section inspector">
          <X size={16} />
        </button>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Hero Banner settings">
        {(['content', 'design', 'responsive'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'content' ? 'Content' : tab === 'design' ? 'Design' : 'Responsive'}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {activeTab === 'content' && (
          <>
            <p className={styles.intro}>Add reusable content blocks. Each block has its own content, styling and responsive settings. Reorder blocks to change the reading flow.</p>

            <div className={styles.sectionCard}>
              <div className={styles.field}>
                <label className={styles.label}>Layout</label>
                <select className={styles.select} value={String(document.settings.layout || 'split-right')} onChange={(event) => updateSectionSetting('layout', event.target.value)}>
                  <option value="split-right">Text left · Image right</option>
                  <option value="split-left">Image left · Text right</option>
                  <option value="centered">Centered</option>
                </select>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Content width</label>
                  <select className={styles.select} value={String(document.settings.contentWidth || 'wide')} onChange={(event) => updateSectionSetting('contentWidth', event.target.value)}>
                    <option value="standard">Standard</option>
                    <option value="wide">Wide</option>
                    <option value="full">Full width</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Min. height (px)</label>
                  <input className={styles.input} type="number" min={280} max={900} value={Number(document.settings.minHeight || 520)} onChange={(event) => updateSectionSetting('minHeight', Math.max(280, Math.min(900, Number(event.target.value))))} />
                </div>
              </div>
            </div>

            <div className={styles.divider} />
            <div className={styles.blockList}>
              {blocks.map((block, index) => {
                const definition = getBlockDefinition(block.type);
                const isSelected = selectedBlock?.id === block.id;
                return (
                  <div key={block.id} className={`${styles.blockCard} ${isSelected ? styles.blockCardActive : ''}`}>
                    <div className={styles.blockHeader}>
                      <button type="button" className={styles.blockSelect} onClick={() => setSelectedBlockId(block.id)} aria-expanded={isSelected}>
                        {definition?.label || block.type}
                      </button>
                      <div className={styles.blockActions}>
                        <button type="button" className={styles.iconButton} title="Move up" aria-label="Move block up" disabled={index === 0} onClick={() => moveBlock(block.id, -1)}><ChevronUp size={14} /></button>
                        <button type="button" className={styles.iconButton} title="Move down" aria-label="Move block down" disabled={index === blocks.length - 1} onClick={() => moveBlock(block.id, 1)}><ChevronDown size={14} /></button>
                        <button type="button" className={styles.iconButton} title="Remove block" aria-label="Remove block" disabled={block.type === 'heading'} onClick={() => removeBlock(block)}><Trash2 size={13} /></button>
                      </div>
                    </div>
                    {isSelected && (
                      <div className={styles.blockBody}>
                        {(definition?.settings || []).map((field) => fieldControl(block, field))}
                        {block.type === 'heading' && <div className={styles.hint}>The main heading is required for a meaningful Hero Banner and cannot be removed.</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.field} style={{ marginTop: 12 }}>
              <label className={styles.label}>Add a block</label>
              <select className={styles.select} defaultValue="" onChange={(event) => {
                if (event.target.value) addBlock(event.target.value);
                event.target.value = '';
              }}>
                <option value="">Choose block type…</option>
                {availableBlockDefinitions.map((definition) => (
                  <option key={definition.type} value={definition.type}>{definition.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {activeTab === 'design' && (
          <>
            <p className={styles.intro}>Design values inherit from the store-wide Design system until you explicitly override them.</p>
            <div className={styles.sectionCard}>
              <div className={styles.field}>
                <label className={styles.label}>Section background</label>
                <select className={styles.select} value={overrideValue(document.designOverrides?.sectionBackground)} onChange={(event) => updateSectionDesign('sectionBackground', toOverride(event.target.value))}>
                  {tokenOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Heading color</label>
                <select className={styles.select} value={overrideValue(document.designOverrides?.headingColor)} onChange={(event) => updateSectionDesign('headingColor', toOverride(event.target.value))}>
                  {tokenOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Body color</label>
                <select className={styles.select} value={overrideValue(document.designOverrides?.bodyColor)} onChange={(event) => updateSectionDesign('bodyColor', toOverride(event.target.value))}>
                  {tokenOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            </div>

            {selectedBlock && (
              <>
                <div className={styles.divider} />
                <div className={styles.sectionCard}>
                  <strong style={{ fontSize: 12 }}>Selected block · {selectedDefinition?.label || selectedBlock.type}</strong>
                  <div className={styles.field}>
                    <label className={styles.label}>Text color</label>
                    <select className={styles.select} value={selectedColorValue} onChange={(event) => updateBlockDesign(selectedBlock.id, 'color', toOverride(event.target.value))}>
                      {tokenOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  {selectedBlock.type === 'button' && (
                    <>
                      <div className={styles.field}>
                        <label className={styles.label}>Button background</label>
                        <select className={styles.select} value={overrideValue(selectedBlock.designOverrides?.background)} onChange={(event) => updateBlockDesign(selectedBlock.id, 'background', toOverride(event.target.value))}>
                          {tokenOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                  <button type="button" className={styles.removeButton} onClick={() => {
                    const next = { ...(selectedBlock.designOverrides || {}) };
                    delete next.color;
                    delete next.background;
                    updateBlock(selectedBlock.id, { designOverrides: next });
                  }}>Reset block styling to inherited</button>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'responsive' && (
          <>
            <p className={styles.intro}>Set visibility and block-specific overrides per device. Unset values continue to inherit desktop settings.</p>
            <div className={styles.sectionCard}>
              <div className={styles.field}>
                <label className={styles.label}>Device</label>
                <select className={styles.select} value={device} onChange={(event) => setDevice(event.target.value as typeof device)}>
                  <option value="desktop">Desktop</option>
                  <option value="tablet">Tablet</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
              <label className={styles.row}>
                <span className={styles.label}>Show section on {device}</span>
                <input
                  type="checkbox"
                  checked={(document.responsiveOverrides as any)?.visibility?.[device] !== false}
                  onChange={(event) => {
                    const next = { ...(document.responsiveOverrides || {}) } as any;
                    next.visibility = { ...(next.visibility || {}), [device]: event.target.checked };
                    saveDocument({ responsiveOverrides: next });
                  }}
                />
              </label>
              {selectedBlock && (
                <label className={styles.row}>
                  <span className={styles.label}>Show selected block</span>
                  <input
                    type="checkbox"
                    checked={(selectedBlock.responsiveOverrides as any)?.visible?.[device] !== false}
                    onChange={(event) => {
                      const next = { ...(selectedBlock.responsiveOverrides || {}) } as any;
                      next.visible = { ...(next.visible || {}), [device]: event.target.checked };
                      updateBlock(selectedBlock.id, { responsiveOverrides: next });
                    }}
                  />
                </label>
              )}
            </div>
            <div className={styles.hint}>The preview viewport uses the device's real CSS width. Responsive visibility is stored on the page draft and is included in publications.</div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroBannerBlockInspector;
