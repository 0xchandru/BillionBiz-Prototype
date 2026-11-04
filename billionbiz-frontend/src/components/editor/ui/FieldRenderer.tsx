import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, GripVertical, Copy } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SectionFieldConfig, ListItemField, FieldOption } from '../sectionConfigs/types';
import { ThemeOverrideControl } from './ThemeOverrideControl';
import { ColorPickerPopover } from './ColorPickerPopover';
import styles from '../../../pages/editor/EditorLayout.module.css';

// ------------------------------------------------------------------
// Helper: check if a field condition is met
// ------------------------------------------------------------------
export function isConditionMet(
  condition: SectionFieldConfig['showWhen'],
  props: Record<string, any>
): boolean {
  if (!condition) return true;
  const actual = props[condition.field];
  const expected = condition.value;
  const match = Array.isArray(expected) ? expected.includes(actual) : actual === expected;
  return condition.negate ? !match : match;
}

// ------------------------------------------------------------------
// Sortable list item wrapper
// ------------------------------------------------------------------
const SortableListItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 0,
    position: isDragging ? 'relative' : undefined,
    boxShadow: isDragging ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : undefined,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fafbfc',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        style={{ position: 'absolute', top: '10px', left: '8px', cursor: 'grab', color: 'var(--text-muted)', zIndex: 2 }}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </div>
      <div style={{ paddingLeft: '24px' }}>{children}</div>
    </div>
  );
};

// ------------------------------------------------------------------
// List/Repeater Editor
// ------------------------------------------------------------------
interface ListEditorNewProps {
  items: any[];
  onChange: (items: any[]) => void;
  listFields: ListItemField[];
  maxItems?: number;
  addLabel?: string;
  isStringList?: boolean;
}

const ListEditorNew: React.FC<ListEditorNewProps> = ({
  items = [],
  onChange,
  listFields = [],
  maxItems,
  addLabel = 'Add Item',
  isStringList = false,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((_, i) => `item-${i}` === active.id);
      const newIndex = items.findIndex((_, i) => `item-${i}` === over.id);
      const newItems = [...items];
      const [moved] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, moved);
      onChange(newItems);
      if (expandedIndex === oldIndex) setExpandedIndex(newIndex);
    }
  };

  const handleItemChange = (index: number, key: string, value: any) => {
    if (isStringList) {
      const newItems = [...items];
      newItems[index] = value;
      onChange(newItems);
    } else {
      onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
    }
  };

  const addItem = () => {
    if (maxItems && items.length >= maxItems) return;
    if (isStringList) {
      onChange([...items, '']);
    } else {
      const newItem: Record<string, any> = { id: `id-${Date.now()}` };
      listFields.forEach((f) => { newItem[f.key] = f.defaultValue ?? ''; });
      onChange([...items, newItem]);
    }
    setExpandedIndex(items.length);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const duplicateItem = (index: number) => {
    if (maxItems && items.length >= maxItems) return;
    const newItems = [...items];
    const clone = isStringList ? items[index] : { ...items[index], id: `id-${Date.now()}` };
    newItems.splice(index + 1, 0, clone);
    onChange(newItems);
    setExpandedIndex(index + 1);
  };

  const getItemLabel = (item: any, index: number): string => {
    if (isStringList) return item || `Item ${index + 1}`;
    if (listFields.length > 0) {
      const firstField = listFields[0];
      return item[firstField.key] || `Item ${index + 1}`;
    }
    return `Item ${index + 1}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((_, i) => `item-${i}`)} strategy={verticalListSortingStrategy}>
          {items.map((item, i) => (
            <SortableListItem key={`item-${i}`} id={`item-${i}`}>
              <div
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px 10px 4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                }}
              >
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '140px',
                }}>
                  {getItemLabel(item, i)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Copy
                    size={13}
                    style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); duplicateItem(i); }}
                  />
                  <Trash2
                    size={13}
                    style={{ color: '#ef4444', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); removeItem(i); }}
                  />
                  <ChevronDown
                    size={14}
                    style={{
                      transform: expandedIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>
              {expandedIndex === i && (
                <div style={{
                  padding: '12px',
                  marginLeft: '-24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                }}>
                  {isStringList ? (
                    <input
                      type="text"
                      className={styles.inputField}
                      value={item || ''}
                      onChange={(e) => handleItemChange(i, 'value', e.target.value)}
                    />
                  ) : (
                    listFields.map((field) => (
                      <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {field.label}
                        </label>
                        {renderListItemField(field, item[field.key], (v) => handleItemChange(i, field.key, v))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </SortableListItem>
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={addItem}
        disabled={maxItems ? items.length >= maxItems : false}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px',
          border: '1px dashed var(--border-color)',
          borderRadius: '8px',
          background: 'transparent',
          cursor: maxItems && items.length >= maxItems ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--primary)',
          opacity: maxItems && items.length >= maxItems ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
};

// Render a single list item field by type
function renderListItemField(field: ListItemField, value: any, onChange: (v: any) => void): React.ReactNode {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          className={styles.textareaField}
          rows={2}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
    case 'image':
    case 'url':
      return (
        <input
          type="text"
          className={styles.inputField}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'https://...'}
        />
      );
    case 'color':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorPickerPopover
            value={value || '#000000'}
            onChange={onChange}
            size="md"
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{ flex: 1, fontSize: '12px', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontFamily: 'monospace' }}
          />
        </div>
      );
    case 'toggle':
      return (
        <button
          onClick={() => onChange(!value)}
          style={{
            width: '36px', height: '20px', borderRadius: '10px',
            backgroundColor: value ? 'var(--primary)' : '#e2e8f0',
            border: 'none', cursor: 'pointer', position: 'relative', padding: 0,
          }}
        >
          <div style={{
            width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'white',
            position: 'absolute', top: '3px', left: value ? '19px' : '3px',
            transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }} />
        </button>
      );
    case 'number':
      return (
        <input
          type="number"
          className={styles.inputField}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          placeholder={field.placeholder}
        />
      );
    case 'select':
      return (
        <select
          className={styles.inputField}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ cursor: 'pointer' }}
        >
          {(field.options || []).map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
          ))}
        </select>
      );
    case 'icon':
      return (
        <select
          className={styles.inputField}
          value={value || 'Home'}
          onChange={(e) => onChange(e.target.value)}
          style={{ cursor: 'pointer' }}
        >
          {['Home', 'Search', 'ShoppingCart', 'User', 'Settings', 'Heart', 'Menu', 'Grid', 'List', 'Check',
            'Truck', 'Headphones', 'RefreshCw', 'Shield', 'Star', 'MapPin', 'Phone', 'Mail', 'Clock', 'Package'
          ].map((icon) => (
            <option key={icon} value={icon}>{icon}</option>
          ))}
        </select>
      );
    case 'list':
      return (
        <ListEditorNew
          items={Array.isArray(value) ? value : []}
          onChange={onChange}
          listFields={[]}
          isStringList={field.isStringList ?? true}
          addLabel={field.addLabel || 'Add Item'}
        />
      );
    default: // text
      return (
        <input
          type="text"
          className={styles.inputField}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
  }
}

// ------------------------------------------------------------------
// Segmented Control
// ------------------------------------------------------------------
const SegmentedControl: React.FC<{
  options: FieldOption[];
  value: any;
  onChange: (v: any) => void;
}> = ({ options, value, onChange }) => (
  <div style={{
    display: 'flex',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  }}>
    {options.map((opt) => {
      const isActive = value === opt.value;
      return (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          title={opt.description}
          style={{
            flex: 1,
            padding: '8px 6px',
            border: 'none',
            borderRight: '1px solid var(--border-color)',
            backgroundColor: isActive ? 'var(--primary)' : 'transparent',
            color: isActive ? 'white' : 'var(--text-main)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

// ------------------------------------------------------------------
// Main Field Renderer
// ------------------------------------------------------------------
interface FieldRendererProps {
  field: SectionFieldConfig;
  value: any;
  onChange: (key: string, value: any) => void;
  allProps: Record<string, any>;
  sectionType?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  allProps,
  sectionType,
}) => {
  // Check condition
  if (field.showWhen && !isConditionMet(field.showWhen, allProps)) {
    return null;
  }

  const handleChange = (v: any) => onChange(field.key, v);

  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            className={styles.inputField}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <textarea
            className={styles.textareaField}
            rows={3}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              className={styles.inputField}
              value={value ?? ''}
              onChange={(e) => handleChange(e.target.value === '' ? undefined : Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              placeholder={field.placeholder}
              style={{ flex: 1 }}
            />
            {field.unit && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>
                {field.unit}
              </span>
            )}
          </div>
        );

      case 'slider':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {value ?? field.min ?? 0}{field.unit || ''}
              </span>
            </div>
            <input
              type="range"
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              value={value ?? field.min ?? 0}
              onChange={(e) => handleChange(Number(e.target.value))}
              style={{ accentColor: 'var(--primary)', width: '100%' }}
            />
          </div>
        );

      case 'color': {
        const isBg = field.key.toLowerCase().includes('bg') || field.key.toLowerCase().includes('background');
        return (
          <ThemeOverrideControl
            label={field.label}
            value={value}
            onChange={handleChange}
            isBackground={isBg}
            fieldKey={field.key}
            sectionType={sectionType}
          />
        );
      }

      case 'image':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {value && (
              <div style={{ width: '100%', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <input
              type="text"
              className={styles.inputField}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder || 'Enter image URL...'}
            />
          </div>
        );

      case 'url':
        return (
          <input
            type="text"
            className={styles.inputField}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder || 'https://...'}
          />
        );

      case 'toggle':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
              {value ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={() => handleChange(!value)}
              style={{
                width: '44px', height: '24px', borderRadius: '12px',
                backgroundColor: value ? 'var(--primary)' : '#e2e8f0',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background-color 0.2s', padding: 0,
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
                position: 'absolute', top: '3px',
                left: value ? '23px' : '3px',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        );

      case 'select':
        return (
          <select
            value={value ?? (field.options?.[0]?.value ?? '')}
            onChange={(e) => {
              const opt = field.options?.find(o => String(o.value) === e.target.value);
              handleChange(opt ? opt.value : e.target.value);
            }}
            style={{
              width: '100%', padding: '10px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit',
              backgroundColor: '#f8fafc', cursor: 'pointer', outline: 'none',
            }}
          >
            {(field.options || []).map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'segmented':
        return (
          <SegmentedControl
            options={field.options || []}
            value={value}
            onChange={handleChange}
          />
        );

      case 'icon':
        return (
          <select
            className={styles.inputField}
            value={value || 'Home'}
            onChange={(e) => handleChange(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            {['Home', 'Search', 'ShoppingCart', 'User', 'Settings', 'Heart', 'Menu', 'Grid',
              'Truck', 'Headphones', 'RefreshCw', 'Shield', 'Star', 'MapPin', 'Phone', 'Mail', 'Clock', 'Package'
            ].map((icon) => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
        );

      case 'list':
        return (
          <ListEditorNew
            items={Array.isArray(value) ? value : []}
            onChange={(items) => handleChange(items)}
            listFields={field.listFields || (field as any).fields || []}
            maxItems={field.maxItems}
            addLabel={field.addLabel}
            isStringList={field.isStringList}
          />
        );

      default:
        return (
          <input
            type="text"
            className={styles.inputField}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      {/* Label row */}
      {field.type !== 'toggle' && field.type !== 'color' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
            {field.label}
          </span>
          {field.helpText && (
            <span
              title={field.helpText}
              style={{ fontSize: '11px', color: 'var(--text-muted)', cursor: 'help' }}
            >
              ⓘ
            </span>
          )}
        </div>
      )}
      {field.type === 'toggle' && (
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
          {field.label}
        </span>
      )}
      {renderInput()}
    </div>
  );
};
