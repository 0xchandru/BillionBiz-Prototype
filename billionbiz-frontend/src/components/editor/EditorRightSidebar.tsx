/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  UploadCloud,
  Plus,
  Trash2,
  Calendar,
  Edit2,
  Monitor,
  Eye,
  EyeOff,
  GripVertical,
  Bell,
  Cookie,
  Sparkles,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Phone,
  Mail,
  MessageSquare,
  Truck,
  Gift,
  Tag,
  Globe,
  MapPin,
  Headphones,
  Shield,
  ShieldCheck,
  Clock,
  Star,
  Heart,
  User,
  ShoppingBag,
  Store,
  Share2,
  HelpCircle,
  CreditCard,
  Smartphone,
  Search,
  Copy,
  Lock,
  Sliders,
  Package,
  Zap,
  Flame,
  Download,
  QrCode,
  Play,
  ExternalLink,
  LayoutGrid,
  X,
} from 'lucide-react';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore } from '../../store/siteStore';
import { useEditorContextStore } from '../../store/editorContextStore';
import { FooterRightEditor } from './engine/FooterRightEditor';
import {
  ANNOUNCEMENT_LOOKS,
  TIMEZONE_OPTIONS,
  ICON_OPTIONS,
  resolveAnnouncementBarData,
  switchAnnouncementLook,
  resetAnnouncementBarDesign,
  getInheritedThemeColors,
  type AnnouncementLook,
  type AnnouncementBarData,
  type AnnouncementItem,
} from './engine/announcementBarModel';
import {
  UTILITY_BAR_LOOKS,
  resolveUtilityBarData,
  switchUtilityBarLook,
  getDefaultContentForLook,
  getDefaultLayoutForLook,
  getDefaultBehaviorForLook,
  getDefaultDesign as getDefaultUtilityDesign,
  getDefaultResponsive as getDefaultUtilityResponsive,
  getDefaultVisibility as getDefaultUtilityVisibility,
  getDefaultAdvanced as getDefaultUtilityAdvanced,
  getInheritedUtilityColors,
  type UtilityBarLook,
  type UtilityBarData,
  type UtilityItem,
  type UtilityIconConfig,
  type UtilityTabId,
} from './engine/utilityBarModel';
import {
  SECONDARY_NAV_LOOKS,
  resolveSecondaryNavData,
  switchSecondaryNavLook,
  getDefaultContentForLook as getDefaultSecNavContent,
  getDefaultLayoutForLook as getDefaultSecNavLayout,
  getDefaultBehaviorForLook as getDefaultSecNavBehavior,
  getDefaultDesign as getDefaultSecNavDesign,
  getDefaultResponsive as getDefaultSecNavResponsive,
  getDefaultVisibility as getDefaultSecNavVisibility,
  getDefaultAdvanced as getDefaultSecNavAdvanced,
  getInheritedSecondaryNavColors,
  type SecondaryNavLook,
  type SecondaryNavData,
  type NavigationItem,
  type SecondaryNavTabId,
  type LookCapabilities,
  type MegaMenuColumn,
} from './engine/secondaryNavModel';
import { getSectionConfig } from './sectionConfigs';
import { getDefaultTheme } from './theme/themePresets';
import { TabRenderer } from './ui/TabRenderer';
import { PageTabRenderer } from './ui/PageTabRenderer';
import { getPageConfig } from './pageConfigs';
import { ThemeEditorRightPanel } from './right/ThemeEditorRightPanel';
import { BrandRightPanel } from './right/BrandRightPanel';
import { SettingsRightPanel } from './right/SettingsRightPanel';
import { ColorPickerPopover } from './ui/ColorPickerPopover';
import { CapabilityInspector } from './engine/CapabilityInspector';

import styles from '../../pages/editor/EditorLayout.module.css';

// --- Editor field config types ---
type FieldType = 'text' | 'textarea' | 'color' | 'image' | 'toggle' | 'select' | 'number' | 'url' | 'list';

interface EditorField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select
  listFields?: { key: string; label: string; type: 'text' | 'textarea' | 'url' | 'icon' }[]; // for list items
}

// --- Section editor configs ---
const sectionEditorConfigs: Record<string, EditorField[]> = {
  HeroBanner: [
    { key: 'badge', label: 'Badge Text', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'primaryBtn', label: 'Primary Button', type: 'text' },
    { key: 'secondaryBtn', label: 'Secondary Button', type: 'text' },
    { key: 'image', label: 'Hero Image URL', type: 'image' },
    { key: 'layout', label: 'Layout', type: 'select', options: ['left', 'center', 'right'] },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
  ],
  FeaturedCollection: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'linkText', label: 'Link Text', type: 'text' },
    { key: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4'] },
    {
      key: 'products', label: 'Products', type: 'list', listFields: [
        { key: 'name', label: 'Product Name', type: 'text' },
        { key: 'price', label: 'Price', type: 'text' },
        { key: 'image', label: 'Image URL', type: 'url' },
      ]
    },
  ],
  ImageWithText: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Body Text', type: 'textarea' },
    { key: 'image', label: 'Image URL', type: 'image' },
    { key: 'imagePosition', label: 'Image Position', type: 'select', options: ['left', 'right'] },
    { key: 'buttonText', label: 'Button Text', type: 'text' },
    { key: 'buttonLink', label: 'Button Link', type: 'url' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
  ],
  RichText: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Body Text', type: 'textarea' },
    { key: 'alignment', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
  ],
  Newsletter: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'buttonText', label: 'Button Text', type: 'text' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
    { key: 'textColor', label: 'Text Color', type: 'color' },
  ],
  Testimonials: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'testimonials', label: 'Testimonials', type: 'list', listFields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'role', label: 'Role', type: 'text' },
        { key: 'quote', label: 'Quote', type: 'textarea' },
        { key: 'avatar', label: 'Avatar URL', type: 'url' },
      ]
    },
  ],
  LogoList: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'logos', label: 'Logos', type: 'list', listFields: [
        { key: 'name', label: 'Brand Name', type: 'text' },
        { key: 'image', label: 'Logo Image URL (optional)', type: 'url' },
      ]
    },
  ],
  Video: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'videoUrl', label: 'Video URL', type: 'url' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
  ],
  FAQ: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'items', label: 'FAQ Items', type: 'list', listFields: [
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer', label: 'Answer', type: 'textarea' },
      ]
    },
  ],
  ContactForm: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'buttonText', label: 'Button Text', type: 'text' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
  ],
  BlogPosts: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'posts', label: 'Blog Posts', type: 'list', listFields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
        { key: 'image', label: 'Image URL', type: 'url' },
        { key: 'date', label: 'Date', type: 'text' },
      ]
    },
  ],
  Gallery: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4'] },
    {
      key: 'images', label: 'Images', type: 'list', listFields: [
        { key: 'src', label: 'Image URL', type: 'url' },
        { key: 'alt', label: 'Alt Text', type: 'text' },
      ]
    },
  ],
  Map: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'hours', label: 'Business Hours', type: 'text' },
    { key: 'embedUrl', label: 'Google Maps Embed URL', type: 'url' },
  ],
  PricingTable: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'plans', label: 'Pricing Plans', type: 'list', listFields: [
        { key: 'name', label: 'Plan Name', type: 'text' },
        { key: 'price', label: 'Price', type: 'text' },
        { key: 'period', label: 'Period', type: 'text' },
        { key: 'buttonText', label: 'Button Text', type: 'text' },
      ]
    },
  ],
};

// --- Reusable field components ---

const FieldInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    className={styles.inputField}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
);

const FieldTextarea: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <textarea
    className={styles.textareaField}
    rows={3}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
);

const FieldColor: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
    <ColorPickerPopover
      value={value}
      onChange={onChange}
      size="md"
    />
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{ flex: 1, fontSize: '13px', padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'monospace' }}
    />
  </div>
);

const FieldImage: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {value && (
      <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )}
    <input
      type="text"
      className={styles.inputField}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter image URL..."
    />
  </div>
);

const FieldToggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      backgroundColor: value ? 'var(--primary)' : '#e2e8f0',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background-color 0.2s',
      padding: 0,
    }}
  >
    <div style={{
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: 'white',
      position: 'absolute',
      top: '3px',
      left: value ? '23px' : '3px',
      transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </button>
);

const FieldSelect: React.FC<{ value: string; onChange: (v: string) => void; options: string[] }> = ({ value, onChange, options }) => (
  <select
    value={value || options[0]}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: '100%',
      padding: '10px 14px',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily: 'inherit',
      backgroundColor: '#f8fafc',
      cursor: 'pointer',
      outline: 'none',
      textTransform: 'capitalize',
    }}
  >
    {options.map(opt => (
      <option key={opt} value={opt} style={{ textTransform: 'capitalize' }}>{opt}</option>
    ))}
  </select>
);

// --- List editor for repeater fields ---

const SortableListItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 0,
    position: isDragging ? 'relative' : undefined,
    boxShadow: isDragging ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : undefined,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ position: 'absolute', top: '10px', left: '8px', cursor: 'grab', color: 'var(--text-muted)' }} {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>
      <div style={{ paddingLeft: '24px' }}>
        {children}
      </div>
    </div>
  );
};

interface ListEditorProps {
  items: any[];
  onChange: (items: any[]) => void;
  listFields?: { key: string; label: string; type: 'text' | 'textarea' | 'url' | 'icon' }[];
  maxItems?: number;
  isStringList?: boolean;
}

export const ListEditor: React.FC<ListEditorProps> = ({ items, onChange, listFields = [], maxItems, isStringList }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((_, i) => `item-${i}` === active.id);
      const newIndex = items.findIndex((_, i) => `item-${i}` === over.id);

      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);
      onChange(newItems);

      if (expandedIndex === oldIndex) setExpandedIndex(newIndex);
      else if (expandedIndex === newIndex) setExpandedIndex(oldIndex);
    }
  };

  const handleItemChange = (index: number, key: string, value: string) => {
    if (isStringList) {
      const newItems = [...items];
      newItems[index] = value;
      onChange(newItems);
    } else {
      const newItems = items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      );
      onChange(newItems);
    }
  };

  const addItem = () => {
    if (maxItems && items.length >= maxItems) {
      alert(`You can only add up to ${maxItems} items.`);
      return;
    }
    if (isStringList) {
      onChange([...items, 'New Link']);
    } else {
      const newItem: Record<string, string> = { id: `id-${Date.now()}` };
      listFields.forEach(f => { newItem[f.key] = ''; });
      onChange([...items, newItem]);
    }
    setExpandedIndex(items.length);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
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
                <span>{isStringList ? item : (item[listFields[0]?.key] || `Item ${i + 1}`)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trash2
                    size={14}
                    style={{ color: '#ef4444', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); removeItem(i); }}
                  />
                  <ChevronDown
                    size={14}
                    style={{
                      transform: expandedIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>
              </div>
              {expandedIndex === i && (
                <div style={{ padding: '12px', marginLeft: '-24px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                  {isStringList ? (
                    <input
                      type="text"
                      className={styles.inputField}
                      value={item || ''}
                      onChange={(e) => handleItemChange(i, 'value', e.target.value)}
                    />
                  ) : (
                    listFields.map(field => (
                      <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.label}</span>
                        {field.type === 'textarea' ? (
                          <textarea
                            className={styles.textareaField}
                            rows={2}
                            value={item[field.key] || ''}
                            onChange={(e) => handleItemChange(i, field.key, e.target.value)}
                          />
                        ) : field.type === 'icon' ? (
                          <select
                            className={styles.inputField}
                            value={item[field.key] || 'Home'}
                            onChange={(e) => handleItemChange(i, field.key, e.target.value)}
                          >
                            {['Home', 'Search', 'ShoppingCart', 'User', 'Settings', 'Heart', 'Menu', 'Grid', 'List', 'Check'].map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className={styles.inputField}
                            value={item[field.key] || ''}
                            onChange={(e) => handleItemChange(i, field.key, e.target.value)}
                          />
                        )}
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
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px',
          border: '1px dashed var(--border-color)',
          borderRadius: '8px',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--primary)',
          transition: 'all 0.2s',
        }}
      >
        <Plus size={14} /> Add Item
      </button>
    </div>
  );
};


// --- Main Component ---

const GlobalUtilityPanel: React.FC<{ type: 'cookie' | 'toaster' }> = ({ type }) => {
  const { settings, updateSettings } = useSiteStore();
  const isCookie = type === 'cookie';
  const Icon = isCookie ? Cookie : Bell;
  const title = isCookie ? 'Cookie Consent' : 'Notifications & Toasts';
  const enabledKey = isCookie ? 'cookieConsentEnabled' : 'toasterEnabled';
  const textKey = isCookie ? 'cookieConsentText' : 'toasterDefaultMessage';
  const enabled = settings[enabledKey] !== false;

  return (
    <aside className={styles.rightPanel}>
      <div className={styles.panelHeader}>
        <div className={styles.phLeft}>
          <Icon size={16} color="#2563eb" />
          <h3 className={styles.fw600}>{title}</h3>
        </div>
      </div>
      <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '13px', fontWeight: 600 }}>
          <span>Enabled</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => updateSettings({ [enabledKey]: event.target.checked })}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
          {isCookie ? 'Consent message' : 'Default notification message'}
          <textarea
            rows={4}
            value={settings[textKey] || (isCookie ? 'We use cookies to improve your experience.' : 'Your changes have been saved.')}
            onChange={(event) => updateSettings({ [textKey]: event.target.value })}
            className={styles.textareaField}
          />
        </label>
        {isCookie ? (
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
            Privacy policy URL
            <input
              type="url"
              value={settings.cookieConsentPolicyUrl || '/privacy-policy'}
              onChange={(event) => updateSettings({ cookieConsentPolicyUrl: event.target.value })}
              className={styles.inputField}
            />
          </label>
        ) : (
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
            Position
            <select
              value={settings.toasterPosition || 'bottom-right'}
              onChange={(event) => updateSettings({ toasterPosition: event.target.value })}
              className={styles.inputField}
            >
              <option value="top-right">Top right</option>
              <option value="top-center">Top center</option>
              <option value="bottom-right">Bottom right</option>
              <option value="bottom-center">Bottom center</option>
            </select>
          </label>
        )}
      </div>
    </aside>
  );
};

// ─── Visual Wireframe Diagram for Announcement Looks ────────
const AnnouncementLookWireframe: React.FC<{ lookId: AnnouncementLook }> = ({ lookId }) => {
  switch (lookId) {
    case 'single':
      return (
        <div style={{ background: '#0f172a', borderRadius: '6px', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '28px' }}>
          <span style={{ fontSize: '10px' }}>✨</span>
          <div style={{ height: '4px', width: '60%', borderRadius: '2px', background: 'rgba(255,255,255,0.75)' }} />
        </div>
      );
    case 'single_cta':
      return (
        <div style={{ background: '#1e1b4b', borderRadius: '6px', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', height: '28px' }}>
          <div style={{ height: '4px', width: '50%', borderRadius: '2px', background: 'rgba(255,255,255,0.75)' }} />
          <div style={{ height: '14px', padding: '0 6px', borderRadius: '3px', background: '#6366f1', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>CTA</div>
        </div>
      );
    case 'countdown':
      return (
        <div style={{ background: '#18181b', borderRadius: '6px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', height: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '9px', color: '#ea580c' }}>🔥</span>
            <div style={{ height: '4px', width: '30px', borderRadius: '2px', background: 'rgba(255,255,255,0.65)' }} />
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, background: 'rgba(255,255,255,0.22)', padding: '1px 3px', borderRadius: '2px', color: '#fff' }}>02d</span>
            <span style={{ fontSize: '8px', fontWeight: 700, background: 'rgba(255,255,255,0.22)', padding: '1px 3px', borderRadius: '2px', color: '#fff' }}>14h</span>
          </div>
        </div>
      );
    case 'marquee':
      return (
        <div style={{ background: '#09090b', borderRadius: '6px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', height: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', opacity: 0.9 }}>
            <span style={{ fontSize: '8px', color: '#f59e0b', fontWeight: 700 }}>SALE</span>
            <div style={{ height: '4px', width: '28px', borderRadius: '2px', background: '#fff' }} />
            <span style={{ fontSize: '8px', color: '#f59e0b' }}>★</span>
            <span style={{ fontSize: '8px', color: '#38bdf8', fontWeight: 700 }}>FREE</span>
            <div style={{ height: '4px', width: '32px', borderRadius: '2px', background: '#fff' }} />
          </div>
        </div>
      );
    case 'slider':
      return (
        <div style={{ background: '#0f766e', borderRadius: '6px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '28px' }}>
          <span style={{ fontSize: '9px', color: '#fff', opacity: 0.7 }}>‹</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{ height: '4px', width: '50px', borderRadius: '2px', background: '#fff' }} />
            <div style={{ display: 'flex', gap: '2px' }}>
              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#fff' }} />
              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
            </div>
          </div>
          <span style={{ fontSize: '9px', color: '#fff', opacity: 0.7 }}>›</span>
        </div>
      );
  }
};

// ─── Sortable Marquee Item with Drag-and-Drop ───────────────
const SortableMarqueeItem: React.FC<{
  item: AnnouncementItem;
  idx: number;
  total: number;
  onUpdate: (patch: Partial<AnnouncementItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}> = ({ item, idx, total, onUpdate, onRemove, onMoveUp, onMoveDown }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id || `m-${idx}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    padding: '12px',
    background: '#f8fafc',
    border: isDragging ? '1px dashed #2563eb' : '1px solid #e2e8f0',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            {...attributes}
            {...listeners}
            style={{
              cursor: 'grab',
              background: 'transparent',
              border: 'none',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              color: '#94a3b8',
              touchAction: 'none',
            }}
            title="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
            Notice #{idx + 1}
          </span>
          {item.badge && (
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '1px 5px', borderRadius: '4px' }}>
              {item.badge}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={idx === 0}
            style={{ padding: '3px', background: 'transparent', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 0.8 }}
            title="Move up"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={idx === total - 1}
            style={{ padding: '3px', background: 'transparent', border: 'none', cursor: idx === total - 1 ? 'default' : 'pointer', opacity: idx === total - 1 ? 0.3 : 0.8 }}
            title="Move down"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={total <= 1}
            style={{ padding: '3px', background: 'transparent', border: 'none', cursor: total <= 1 ? 'default' : 'pointer', color: '#ef4444', opacity: total <= 1 ? 0.3 : 0.8 }}
            title="Remove item"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <input
        type="text"
        className={styles.inputField}
        value={item.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Announcement copy..."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
        <input
          type="text"
          className={styles.inputField}
          value={item.badge || ''}
          onChange={(e) => onUpdate({ badge: e.target.value })}
          placeholder="Badge (SALE)"
          style={{ fontSize: '11px' }}
        />
        <input
          type="text"
          className={styles.inputField}
          value={item.link || ''}
          onChange={(e) => onUpdate({ link: e.target.value })}
          placeholder="Link (/shop)"
          style={{ fontSize: '11px' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#64748b' }}>Icon:</span>
        <select
          className={styles.inputField}
          value={item.icon || 'Sparkles'}
          onChange={(e) => onUpdate({ icon: e.target.value })}
          style={{ fontSize: '11px', padding: '3px 6px' }}
        >
          {ICON_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.emoji ? `${opt.emoji} ` : ''}{opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ─── Sortable Slide Item with Drag-and-Drop ─────────────────
const SortableSlideItem: React.FC<{
  slide: AnnouncementItem;
  idx: number;
  total: number;
  onUpdate: (patch: Partial<AnnouncementItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}> = ({ slide, idx, total, onUpdate, onRemove, onMoveUp, onMoveDown }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id || `s-${idx}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    padding: '12px',
    background: '#f8fafc',
    border: isDragging ? '1px dashed #2563eb' : '1px solid #e2e8f0',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            {...attributes}
            {...listeners}
            style={{
              cursor: 'grab',
              background: 'transparent',
              border: 'none',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              color: '#94a3b8',
              touchAction: 'none',
            }}
            title="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
            Slide #{idx + 1}
          </span>
          {slide.badge && (
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#0f766e', background: '#ccfbf1', padding: '1px 5px', borderRadius: '4px' }}>
              {slide.badge}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={idx === 0}
            style={{ padding: '3px', background: 'transparent', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 0.8 }}
            title="Move up"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={idx === total - 1}
            style={{ padding: '3px', background: 'transparent', border: 'none', cursor: idx === total - 1 ? 'default' : 'pointer', opacity: idx === total - 1 ? 0.3 : 0.8 }}
            title="Move down"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={total <= 1}
            style={{ padding: '3px', background: 'transparent', border: 'none', cursor: total <= 1 ? 'default' : 'pointer', color: '#ef4444', opacity: total <= 1 ? 0.3 : 0.8 }}
            title="Remove slide"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <input
        type="text"
        className={styles.inputField}
        value={slide.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Slide promotion text..."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <input
          type="text"
          className={styles.inputField}
          value={slide.ctaText || ''}
          onChange={(e) => onUpdate({ ctaText: e.target.value })}
          placeholder="CTA text (Shop Now)"
          style={{ fontSize: '11px' }}
        />
        <input
          type="text"
          className={styles.inputField}
          value={slide.ctaLink || ''}
          onChange={(e) => onUpdate({ ctaLink: e.target.value })}
          placeholder="CTA link (/sale)"
          style={{ fontSize: '11px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          className={styles.inputField}
          value={slide.badge || ''}
          onChange={(e) => onUpdate({ badge: e.target.value })}
          placeholder="Badge (SPECIAL)"
          style={{ fontSize: '11px' }}
        />
        <select
          className={styles.inputField}
          value={slide.icon || 'Sparkles'}
          onChange={(e) => onUpdate({ icon: e.target.value })}
          style={{ fontSize: '11px', padding: '3px 6px' }}
        >
          {ICON_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.emoji ? `${opt.emoji} ` : ''}{opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ─── Announcement Icon Picker (Preset Icons | Upload Icon | Input) ───
interface AnnouncementIconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
}

const AnnouncementIconPicker: React.FC<AnnouncementIconPickerProps> = ({
  value,
  onChange,
  label = 'Icon',
}) => {
  const isUpload = value?.startsWith('data:image') || value?.startsWith('http://') || value?.startsWith('https://');
  const isPreset = ICON_OPTIONS.some((o) => o.id === value);
  const [mode, setMode] = useState<'preset' | 'upload' | 'input'>(() => {
    if (isUpload) return 'upload';
    if (isPreset || !value) return 'preset';
    return 'input';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result;
      if (typeof result === 'string') {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', margin: 0 }}>
          {label}
        </label>
        {/* Segmented Button: Preset | Upload | Input */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('preset')}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: mode === 'preset' ? 600 : 500,
              borderRadius: '4px',
              border: 'none',
              backgroundColor: mode === 'preset' ? '#ffffff' : 'transparent',
              color: mode === 'preset' ? '#2563eb' : '#64748b',
              boxShadow: mode === 'preset' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={11} />
            Preset
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: mode === 'upload' ? 600 : 500,
              borderRadius: '4px',
              border: 'none',
              backgroundColor: mode === 'upload' ? '#ffffff' : 'transparent',
              color: mode === 'upload' ? '#2563eb' : '#64748b',
              boxShadow: mode === 'upload' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <UploadCloud size={11} />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('input')}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: mode === 'input' ? 600 : 500,
              borderRadius: '4px',
              border: 'none',
              backgroundColor: mode === 'input' ? '#ffffff' : 'transparent',
              color: mode === 'input' ? '#2563eb' : '#64748b',
              boxShadow: mode === 'input' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Edit2 size={11} />
            Input
          </button>
        </div>
      </div>

      {/* Mode 1: Preset Icons */}
      {mode === 'preset' && (
        <select
          className={styles.inputField}
          value={isPreset ? value : 'Sparkles'}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontSize: '12px', padding: '6px 8px' }}
        >
          {ICON_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.emoji ? `${opt.emoji} ` : ''}{opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Mode 2: Upload Icon */}
      {mode === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.svg"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <UploadCloud size={14} />
              Choose File...
            </button>

            {isUpload && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                <img
                  src={value}
                  alt="Icon Preview"
                  style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff' }}
                />
                <button
                  type="button"
                  onClick={() => onChange('Sparkles')}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#fee2e2',
                    color: '#ef4444',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <input
            type="text"
            className={styles.inputField}
            value={isUpload ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image / SVG URL (https://...)"
            style={{ fontSize: '11px' }}
          />
        </div>
      )}

      {/* Mode 3: Custom Input (Emoji or Text) */}
      {mode === 'input' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input
            type="text"
            className={styles.inputField}
            value={!isUpload && !isPreset ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type emoji or text (e.g. 🔥, ⚡ 50% OFF, SALE)"
            style={{ fontSize: '12px' }}
          />
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['🔥', '✨', '⚡', '🎉', '🎁', '🏷️', '🚚', '⭐', '❤️', '📢'].map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => onChange(em)}
                style={{
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Dynamic 2-Line Color Option Row ────────────────────────
// Line 1: Label on left + [ Mode Dropdown ] on right
// Line 2: Dynamic input based on mode (inherit, color, gradient, image, video)
interface DynamicColorOptionRowProps {
  label: string;
  allowedModes: Array<'inherit' | 'color' | 'gradient' | 'image' | 'video'>;
  currentMode: 'inherit' | 'color' | 'gradient' | 'image' | 'video';
  onModeChange: (mode: 'inherit' | 'color' | 'gradient' | 'image' | 'video') => void;
  // Inherit details
  inheritedColor: string;
  inheritedTokenName: string;
  // Solid color
  customColor?: string;
  onColorChange?: (color: string) => void;
  // Gradient details
  gradient?: {
    type?: 'linear' | 'radial';
    angle?: number;
    from: string;
    to: string;
  };
  onGradientChange?: (grad: { type: 'linear' | 'radial'; angle: number; from: string; to: string }) => void;
  // Image details
  image?: {
    url: string;
    opacity?: number;
    overlayColor?: string;
  };
  onImageChange?: (img: { url: string; opacity: number; overlayColor: string }) => void;
  // Video details
  video?: {
    url: string;
    opacity?: number;
  };
  onVideoChange?: (vid: { url: string; opacity?: number }) => void;
}

const DynamicColorOptionRow: React.FC<DynamicColorOptionRowProps> = ({
  label,
  allowedModes,
  currentMode,
  onModeChange,
  inheritedColor,
  inheritedTokenName,
  customColor,
  onColorChange,
  gradient,
  onGradientChange,
  image,
  onImageChange,
  video,
  onVideoChange,
}) => {
  const modeLabels: Record<string, string> = {
    inherit: 'Inherit (Palette)',
    color: 'Custom Color',
    gradient: 'Gradient',
    image: 'Background Image',
    video: 'Background Video',
  };

  const currentGrad = {
    type: (gradient?.type || 'linear') as 'linear' | 'radial',
    angle: gradient?.angle ?? 90,
    from: gradient?.from || '#1e293b',
    to: gradient?.to || '#0f172a',
  };

  const currentImg = {
    url: image?.url || '',
    opacity: image?.opacity ?? 0.8,
    overlayColor: image?.overlayColor || 'rgba(15, 23, 42, 0.75)',
  };

  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageChange) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result;
      if (typeof res === 'string') {
        onImageChange({ ...currentImg, url: res });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
      {/* ── Line 1: Label on left + [ Mode Dropdown ] on right ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          {label}
        </span>
        <select
          value={currentMode}
          onChange={(e) => onModeChange(e.target.value as any)}
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {allowedModes.map((m) => (
            <option key={m} value={m}>
              {modeLabels[m] || m}
            </option>
          ))}
        </select>
      </div>

      {/* ── Line 2: Dynamic Input based on Selected Type ── */}
      {/* Mode A: Inherit */}
      {currentMode === 'inherit' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '7px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '5px',
                backgroundColor: inheritedColor,
                border: '1px solid rgba(0,0,0,0.15)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                {inheritedTokenName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                {inheritedColor}
              </div>
            </div>
          </div>

          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#059669',
              backgroundColor: '#ecfdf5',
              padding: '2px 7px',
              borderRadius: '999px',
              border: '1px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Check size={10} />
            Inherited
          </span>
        </div>
      )}

      {/* Mode B: Solid Custom Color */}
      {currentMode === 'color' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '7px',
          }}
        >
          <ColorPickerPopover
            value={customColor || inheritedColor}
            onChange={(hex) => onColorChange?.(hex)}
            size="md"
          />
          <input
            type="text"
            className={styles.inputField}
            value={customColor || inheritedColor}
            onChange={(e) => onColorChange?.(e.target.value)}
            placeholder={inheritedColor}
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              flex: 1,
              padding: '5px 8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
            }}
          />
        </div>
      )}

      {/* Mode C: Gradient */}
      {currentMode === 'gradient' && onGradientChange && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '7px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>From</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ColorPickerPopover
                  value={currentGrad.from}
                  onChange={(hex) => onGradientChange({ ...currentGrad, from: hex })}
                  size="sm"
                />
                <input
                  type="text"
                  value={currentGrad.from}
                  onChange={(e) => onGradientChange({ ...currentGrad, from: e.target.value })}
                  className={styles.inputField}
                  style={{ fontSize: '11px', padding: '4px 6px', fontFamily: 'monospace' }}
                />
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>To</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ColorPickerPopover
                  value={currentGrad.to}
                  onChange={(hex) => onGradientChange({ ...currentGrad, to: hex })}
                  size="sm"
                />
                <input
                  type="text"
                  value={currentGrad.to}
                  onChange={(e) => onGradientChange({ ...currentGrad, to: e.target.value })}
                  className={styles.inputField}
                  style={{ fontSize: '11px', padding: '4px 6px', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
              <span>Angle</span>
              <span>{currentGrad.angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={currentGrad.angle}
              onChange={(e) => onGradientChange({ ...currentGrad, angle: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
          </div>
        </div>
      )}

      {/* Mode D: Background Image */}
      {currentMode === 'image' && onImageChange && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '7px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="file"
              ref={imageFileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <button
              type="button"
              onClick={() => imageFileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <UploadCloud size={13} /> Upload Image
            </button>
            <input
              type="text"
              className={styles.inputField}
              value={currentImg.url}
              onChange={(e) => onImageChange({ ...currentImg, url: e.target.value })}
              placeholder="Or image URL (https://...)"
              style={{ fontSize: '11px', flex: 1 }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
              <span>Image Opacity</span>
              <span>{Math.round(currentImg.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round(currentImg.opacity * 100)}
              onChange={(e) => onImageChange({ ...currentImg, opacity: (parseInt(e.target.value) || 80) / 100 })}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
          </div>
        </div>
      )}

      {/* Mode E: Background Video */}
      {currentMode === 'video' && onVideoChange && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '7px',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Video URL (MP4 / WebM)</span>
            <input
              type="text"
              className={styles.inputField}
              value={video?.url || ''}
              onChange={(e) => onVideoChange({ ...(video || { url: '', opacity: 0.6 }), url: e.target.value })}
              placeholder="https://assets.example.com/ambient-loop.mp4"
              style={{ fontSize: '11px' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
              <span>Video Opacity</span>
              <span>{Math.round((video?.opacity ?? 0.6) * 100)}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round((video?.opacity ?? 0.6) * 100)}
              onChange={(e) => onVideoChange({ ...(video || { url: '', opacity: 0.6 }), opacity: parseInt(e.target.value) / 100 })}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Full Announcement Bar Right Sidebar Editor ─────────────
export const AnnouncementBarRightEditor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const editorStore = useEditorContextStore();
  const headerRows = editorStore.headerRows || [];
  const announcementRow = headerRows.find(
    (r) => r.type === 'announcement' || r.id === 'row-announcement' || r.id === 'announcement-bar' || r.id.includes('announcement')
  );
  const siteStore = useSiteStore();
  const themePalette = siteStore.theme?.palette || (siteStore.theme as any)?.colors || getDefaultTheme().palette;

  const { themeBg, themeText, themeAccent, themeCtaBg, themeCtaText, themeBorder } = getInheritedThemeColors(themePalette);

  const landingPage = siteStore.pages.find((p) => p.id === 'landing-page') || siteStore.pages[0];
  const announcementSection = landingPage?.sections.find(
    (s) => s.type === 'AnnouncementBar' || s.id === 'announcement-bar' || s.id.includes('announcement')
  );

  const [activeTab, setActiveTab] = useState<'look' | 'content' | 'design' | 'behavior'>('look');

  // Accordion state in design tab (background merged into colors)
  const [designSections, setDesignSections] = useState({
    colors: true,
    typography: false,
    layout: false,
    border: false,
    lookSpecific: true,
  });

  const toggleDesignSection = (key: keyof typeof designSections) => {
    setDesignSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Resolve current data with theme color palette
  const barData: AnnouncementBarData = useMemo(() => {
    return resolveAnnouncementBarData(announcementRow, announcementSection?.props, themePalette);
  }, [announcementRow, announcementSection?.props, themePalette]);

  const { look, content, design, behavior } = barData;

  // Central update dispatcher
  const updateBarData = (nextData: AnnouncementBarData) => {
    const store = useEditorContextStore.getState();
    const rows = store.headerRows || [];
    const targetRow = rows.find(
      (r) => r.type === 'announcement' || r.id === 'row-announcement' || r.id === 'announcement-bar' || r.id.includes('announcement')
    );

    if (targetRow) {
      const el = targetRow.elements?.[0];
      const elId = el?.id || 'el-announcement-content';

      store.updateHeaderRow(targetRow.id, {
        layout: {
          ...targetRow.layout,
          variantId: nextData.look,
          height: nextData.design.barHeight,
          paddingY: nextData.design.paddingY,
          paddingX: nextData.design.paddingX,
        },
        styling: {
          ...targetRow.styling,
          bgColor: nextData.design.bgColor,
          textColor: nextData.design.textColor,
          borderColor: nextData.design.borderColor,
          bgColorMode: (nextData.design.bgColorMode === 'custom' ? 'color' : 'inherit') as any,
          textColorMode: nextData.design.textColorMode === 'custom' ? 'color' : 'inherit',
          borderColorMode: nextData.design.borderColorMode === 'custom' ? 'color' : 'inherit',
          fontSize: nextData.design.fontSize,
          fontWeight: Number(nextData.design.fontWeight) || 500,
          borderBottom: nextData.design.borderPosition !== 'none',
        },
      });

      store.updateHeaderElement(targetRow.id, elId, {
        props: {
          ...el?.props,
          announcementBar: nextData,
          variant: nextData.look,
          stylePreset: nextData.look,
          showCountdown: nextData.look === 'countdown',
          countdownTarget: nextData.content.countdownTarget,
          text: nextData.content.message,
          ctaText: nextData.content.ctaLabel,
          ctaLink: nextData.content.ctaLink,
          announcements: nextData.content.marqueeItems,
          slides: nextData.content.slides,
          speed: nextData.behavior.marqueeSpeed,
          pauseOnHover: nextData.behavior.marqueePauseOnHover,
        },
      });

      store.syncHeaderToSiteStore();
    }

    const currentSiteStore = useSiteStore.getState();
    currentSiteStore.pages.forEach((page) => {
      const sec = page.sections.find(
        (s) => s.type === 'AnnouncementBar' || s.id === 'announcement-bar' || s.id.includes('announcement')
      );
      if (sec) {
        currentSiteStore.updateSectionProps(page.id, sec.id, {
          announcementBar: nextData,
          variant: nextData.look,
          stylePreset: nextData.look,
          showCountdown: nextData.look === 'countdown',
          countdownTarget: nextData.content.countdownTarget,
          text: nextData.content.message,
          ctaText: nextData.content.ctaLabel,
          ctaLink: nextData.content.ctaLink,
          announcements: nextData.content.marqueeItems,
          slides: nextData.content.slides,
          bgColor: nextData.design.bgColor,
          textColor: nextData.design.textColor,
          speed: nextData.behavior.marqueeSpeed,
          pauseOnHover: nextData.behavior.marqueePauseOnHover,
        });
      }
    });
  };

  const handleSelectLook = (newLook: AnnouncementLook) => {
    const nextData = switchAnnouncementLook(barData, newLook, themePalette);
    updateBarData(nextData);
    // Silent instant preview update - NO toast notification!
  };

  const handleResetDesign = () => {
    const nextData = resetAnnouncementBarDesign(barData, themePalette);
    updateBarData(nextData);
  };

  const updateContent = (patch: Partial<typeof content>) => {
    updateBarData({
      ...barData,
      content: { ...barData.content, ...patch },
    });
  };

  const updateDesign = (patch: Partial<typeof design>) => {
    updateBarData({
      ...barData,
      design: { ...barData.design, ...patch },
      customOverrides: { ...barData.customOverrides, ...patch },
    });
  };

  const updateBehavior = (patch: Partial<typeof behavior>) => {
    updateBarData({
      ...barData,
      behavior: { ...barData.behavior, ...patch },
    });
  };

  // DnD sensors for reordering
  const dndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleMarqueeDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = [...(content.marqueeItems || [])];
    const oldIndex = items.findIndex((item, i) => (item.id || `m-${i}`) === active.id);
    const newIndex = items.findIndex((item, i) => (item.id || `m-${i}`) === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const [moved] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, moved);
      updateContent({ marqueeItems: items });
    }
  };

  const handleSlideDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = [...(content.slides || [])];
    const oldIndex = items.findIndex((item, i) => (item.id || `s-${i}`) === active.id);
    const newIndex = items.findIndex((item, i) => (item.id || `s-${i}`) === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const [moved] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, moved);
      updateContent({ slides: items });
    }
  };

  // Marquee item helpers
  const handleAddMarqueeItem = () => {
    const newItem: AnnouncementItem = {
      id: `m-${Date.now()}`,
      text: '✨ New promotion message',
      badge: 'SALE',
      link: '/shop',
    };
    updateContent({
      marqueeItems: [...(content.marqueeItems || []), newItem],
    });
  };

  const handleRemoveMarqueeItem = (idx: number) => {
    if ((content.marqueeItems?.length || 0) <= 1) return;
    const next = content.marqueeItems.filter((_, i) => i !== idx);
    updateContent({ marqueeItems: next });
  };

  const handleMoveMarqueeItem = (idx: number, direction: 'up' | 'down') => {
    const items = [...(content.marqueeItems || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const [moved] = items.splice(idx, 1);
    items.splice(targetIdx, 0, moved);
    updateContent({ marqueeItems: items });
  };

  const handleUpdateMarqueeItem = (idx: number, patch: Partial<AnnouncementItem>) => {
    const items = [...(content.marqueeItems || [])];
    if (!items[idx]) return;
    items[idx] = { ...items[idx], ...patch };
    updateContent({ marqueeItems: items });
  };

  // Slide item helpers
  const handleAddSlide = () => {
    const newSlide: AnnouncementItem = {
      id: `s-${Date.now()}`,
      text: '✨ New promotional slide',
      badge: 'SPECIAL',
      ctaText: 'Shop Now',
      ctaLink: '/collections/sale',
    };
    updateContent({
      slides: [...(content.slides || []), newSlide],
    });
  };

  const handleRemoveSlide = (idx: number) => {
    if ((content.slides?.length || 0) <= 1) return;
    const next = content.slides.filter((_, i) => i !== idx);
    updateContent({ slides: next });
  };

  const handleMoveSlide = (idx: number, direction: 'up' | 'down') => {
    const items = [...(content.slides || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const [moved] = items.splice(idx, 1);
    items.splice(targetIdx, 0, moved);
    updateContent({ slides: items });
  };

  const handleUpdateSlide = (idx: number, patch: Partial<AnnouncementItem>) => {
    const items = [...(content.slides || [])];
    if (!items[idx]) return;
    items[idx] = { ...items[idx], ...patch };
    updateContent({ slides: items });
  };

  const ANNOUNCEMENT_TABS = [
    { id: 'look', label: 'Look' },
    { id: 'content', label: 'Content' },
    { id: 'design', label: 'Design' },
    { id: 'behavior', label: 'Behavior' },
  ] as const;

  const tabsRef = useRef<HTMLDivElement>(null);

  const handlePrevTab = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const handleNextTab = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Panel Header */}
      <div className={styles.panelHeader}>
        <div className={styles.phLeft}>
          <button type="button" className={styles.iconBtn} onClick={onClose} title="Collapse sidebar">
            <ChevronRight size={20} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600}>Announcement Bar</h3>
        </div>
      </div>

      {/* 4 Tabs: Look -> Content -> Design -> Behavior with Left & Right Chevron Arrows */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e2e8f0)', background: '#f8fafc', position: 'relative' }}>
        <button
          type="button"
          onClick={handlePrevTab}
          style={{
            padding: '8px 10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted, #64748b)',
            flexShrink: 0,
            transition: 'color 0.15s ease',
          }}
          title="Previous tab"
          aria-label="Previous tab"
        >
          <ChevronLeft size={16} />
        </button>
        <div
          ref={tabsRef}
          className={styles.propTabs}
          style={{
            overflowX: 'auto',
            flexWrap: 'nowrap',
            borderBottom: 'none',
            flex: 1,
            display: 'flex',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {ANNOUNCEMENT_TABS.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.propTab} ${activeTab === tab.id ? styles.activePropTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '1 0 auto',
                padding: '12px 10px',
                textAlign: 'center',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleNextTab}
          style={{
            padding: '8px 10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted, #64748b)',
            flexShrink: 0,
            transition: 'color 0.15s ease',
          }}
          title="Next tab"
          aria-label="Next tab"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── TAB 1: LOOK ─── */}
      {activeTab === 'look' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Announcement Look
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
              Select layout structure. Your content and custom colors are preserved.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ANNOUNCEMENT_LOOKS.map((l) => {
              const isSelected = look === l.id;
              return (
                <div
                  key={l.id}
                  onClick={() => handleSelectLook(l.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                        {l.name}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: isSelected ? '#2563eb' : '#64748b', background: isSelected ? '#dbeafe' : '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                        {l.badge}
                      </span>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid #2563eb' : '2px solid #cbd5e1',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }} />
                  </div>

                  <div>
                    <AnnouncementLookWireframe lookId={l.id} />
                  </div>

                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.3 }}>
                    {l.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: CONTENT ─── */}
      {activeTab === 'content' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          {/* LOOK: SINGLE MESSAGE */}
          {look === 'single' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Message Text
                </label>
                <textarea
                  rows={2}
                  className={styles.textareaField}
                  value={content.message}
                  onChange={(e) => updateContent({ message: e.target.value })}
                  placeholder="e.g. Free worldwide shipping on orders over $50"
                />
              </div>

              <AnnouncementIconPicker
                label="Optional Icon"
                value={content.icon || 'Sparkles'}
                onChange={(icon) => updateContent({ icon })}
              />

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Link URL (Optional)
                </label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={content.link || ''}
                  onChange={(e) => updateContent({ link: e.target.value })}
                  placeholder="/collections/sale"
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(content.openInNewTab)}
                  onChange={(e) => updateContent({ openInNewTab: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                />
                <span>Open link in new tab</span>
              </label>
            </>
          )}

          {/* LOOK: SINGLE MESSAGE + CTA */}
          {look === 'single_cta' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Announcement Message
                </label>
                <textarea
                  rows={2}
                  className={styles.textareaField}
                  value={content.message}
                  onChange={(e) => updateContent({ message: e.target.value })}
                  placeholder="e.g. Mid-Season Sale is live!"
                />
              </div>

              <AnnouncementIconPicker
                label="Optional Icon"
                value={content.icon || 'Sparkles'}
                onChange={(icon) => updateContent({ icon })}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={content.ctaLabel || 'Shop Now'}
                    onChange={(e) => updateContent({ ctaLabel: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    CTA Link URL
                  </label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={content.ctaLink || '/collections/sale'}
                    onChange={(e) => updateContent({ ctaLink: e.target.value })}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(content.ctaOpenInNewTab)}
                  onChange={(e) => updateContent({ ctaOpenInNewTab: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                />
                <span>Open CTA in new tab</span>
              </label>
            </>
          )}

          {/* LOOK: COUNTDOWN */}
          {look === 'countdown' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Notice Headline
                </label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={content.message}
                  onChange={(e) => updateContent({ message: e.target.value })}
                  placeholder="🔥 Flash Sale Ends In:"
                />
              </div>

              <AnnouncementIconPicker
                label="Optional Icon"
                value={content.icon || 'Flame'}
                onChange={(icon) => updateContent({ icon })}
              />

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Target End Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  className={styles.inputField}
                  value={content.countdownTarget || '2026-12-31T23:59'}
                  onChange={(e) => updateContent({ countdownTarget: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Timezone
                </label>
                <select
                  className={styles.inputField}
                  value={content.timezone || 'store'}
                  onChange={(e) => updateContent({ timezone: e.target.value })}
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Countdown Display Format
                </label>
                <select
                  className={styles.inputField}
                  value={content.countdownFormat || 'dhms'}
                  onChange={(e) => updateContent({ countdownFormat: e.target.value as any })}
                >
                  <option value="dhms">Days : Hours : Mins : Secs (02d : 14h : 22m : 45s)</option>
                  <option value="hms">Hours : Mins : Secs (14h : 22m : 45s)</option>
                  <option value="compact">Compact (2d 14h 22m)</option>
                  <option value="boxes">High-Impact Number Cards</option>
                </select>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={content.showCountdownCta !== false}
                    onChange={(e) => updateContent({ showCountdownCta: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                  <span>Show Action Button</span>
                </label>

                {content.showCountdownCta !== false && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>CTA Label</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={content.countdownCtaText || 'Claim Offer'}
                        onChange={(e) => updateContent({ countdownCtaText: e.target.value })}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>CTA Link</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={content.countdownCtaLink || '/collections/sale'}
                        onChange={(e) => updateContent({ countdownCtaLink: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  ⏳ Expiration behavior (e.g. hide bar or show conclusion text) is configured under the <strong>Behavior</strong> tab.
                </span>
              </div>
            </>
          )}

          {/* LOOK: MARQUEE */}
          {look === 'marquee' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                    Marquee Items ({(content.marqueeItems || []).length})
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Drag handle or use buttons to reorder items
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddMarqueeItem}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>

              <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleMarqueeDragEnd}>
                <SortableContext
                  items={(content.marqueeItems || []).map((m, i) => m.id || `m-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(content.marqueeItems || []).map((item, idx) => (
                      <SortableMarqueeItem
                        key={item.id || `m-${idx}`}
                        item={item}
                        idx={idx}
                        total={(content.marqueeItems || []).length}
                        onUpdate={(patch) => handleUpdateMarqueeItem(idx, patch)}
                        onRemove={() => handleRemoveMarqueeItem(idx)}
                        onMoveUp={() => handleMoveMarqueeItem(idx, 'up')}
                        onMoveDown={() => handleMoveMarqueeItem(idx, 'down')}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          )}

          {/* LOOK: SLIDE MESSAGES */}
          {look === 'slider' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                    Slides List ({(content.slides || []).length})
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Drag handle or use buttons to reorder slides
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={13} /> Add Slide
                </button>
              </div>

              <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleSlideDragEnd}>
                <SortableContext
                  items={(content.slides || []).map((s, i) => s.id || `s-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(content.slides || []).map((slide, idx) => (
                      <SortableSlideItem
                        key={slide.id || `s-${idx}`}
                        slide={slide}
                        idx={idx}
                        total={(content.slides || []).length}
                        onUpdate={(patch) => handleUpdateSlide(idx, patch)}
                        onRemove={() => handleRemoveSlide(idx)}
                        onMoveUp={() => handleMoveSlide(idx, 'up')}
                        onMoveDown={() => handleMoveSlide(idx, 'down')}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          )}
        </div>
      )}

      {/* ─── TAB 3: DESIGN ─── */}
      {activeTab === 'design' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
          {/* Reset to Look Defaults Button at top */}
          <button
            type="button"
            onClick={handleResetDesign}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.15s ease',
            }}
          >
            <RotateCcw size={14} />
            Reset to Look Defaults
          </button>

          {/* Section: Colors (with dynamic 2-line mode choosing for background and all colors) */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: designSections.colors ? '12px' : 0 }}
              onClick={() => toggleDesignSection('colors')}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: '#1e293b' }}>COLORS</span>
              {designSections.colors ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>

            {designSections.colors && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* 1. Background Color */}
                <DynamicColorOptionRow
                  label="Background Color"
                  allowedModes={['inherit', 'color', 'gradient', 'image', 'video']}
                  currentMode={
                    design.bgType === 'gradient'
                      ? 'gradient'
                      : design.bgType === 'image'
                        ? 'image'
                        : design.bgType === 'video'
                          ? 'video'
                          : design.bgColorMode === 'inherit'
                            ? 'inherit'
                            : 'color'
                  }
                  onModeChange={(m) => {
                    if (m === 'inherit') {
                      updateDesign({ bgType: 'solid', bgColorMode: 'inherit', bgColor: themeBg });
                    } else if (m === 'color') {
                      updateDesign({ bgType: 'solid', bgColorMode: 'custom', bgColor: design.bgColor || themeBg });
                    } else if (m === 'gradient') {
                      updateDesign({
                        bgType: 'gradient',
                        bgColorMode: 'gradient',
                        bgGradient: design.bgGradient || { type: 'linear', angle: 90, from: '#1e293b', to: '#0f172a' },
                      });
                    } else if (m === 'image') {
                      updateDesign({
                        bgType: 'image',
                        bgColorMode: 'image',
                        bgImage: design.bgImage || { url: '', opacity: 0.8, overlayColor: 'rgba(15, 23, 42, 0.75)' },
                      });
                    } else if (m === 'video') {
                      updateDesign({
                        bgType: 'video',
                        bgColorMode: 'video',
                        bgVideo: (design as any).bgVideo || { url: '', opacity: 0.6 },
                      });
                    }
                  }}
                  inheritedColor={themeBg}
                  inheritedTokenName="Theme Background / Primary"
                  customColor={design.bgColor}
                  onColorChange={(hex) => updateDesign({ bgType: 'solid', bgColorMode: 'custom', bgColor: hex })}
                  gradient={design.bgGradient}
                  onGradientChange={(grad) => updateDesign({ bgType: 'gradient', bgGradient: grad })}
                  image={design.bgImage}
                  onImageChange={(img) => updateDesign({ bgType: 'image', bgImage: img })}
                  video={(design as any).bgVideo}
                  onVideoChange={(vid) => updateDesign({ bgType: 'video', bgVideo: vid } as any)}
                />

                {/* 2. Text Color */}
                <DynamicColorOptionRow
                  label="Text Color"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.textColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ textColorMode: m === 'inherit' ? 'inherit' : 'custom', textColor: m === 'inherit' ? themeText : design.textColor })}
                  inheritedColor={themeText}
                  inheritedTokenName="Theme Inverse / Text"
                  customColor={design.textColor}
                  onColorChange={(hex) => updateDesign({ textColorMode: 'custom', textColor: hex })}
                />

                {/* 3. Accent Color */}
                <DynamicColorOptionRow
                  label="Accent Color"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.accentColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ accentColorMode: m === 'inherit' ? 'inherit' : 'custom', accentColor: m === 'inherit' ? themeAccent : design.accentColor })}
                  inheritedColor={themeAccent}
                  inheritedTokenName="Brand Accent"
                  customColor={design.accentColor}
                  onColorChange={(hex) => updateDesign({ accentColorMode: 'custom', accentColor: hex })}
                />

                {/* 4. CTA Button Colors (if applicable) */}
                {(look === 'single_cta' || look === 'countdown' || look === 'slider') && (
                  <>
                    <DynamicColorOptionRow
                      label="CTA Button Background"
                      allowedModes={['inherit', 'color', 'gradient']}
                      currentMode={
                        design.ctaBgColorMode === 'gradient'
                          ? 'gradient'
                          : design.ctaBgColorMode === 'custom'
                            ? 'color'
                            : 'inherit'
                      }
                      onModeChange={(m) => {
                        if (m === 'inherit') {
                          updateDesign({ ctaBgColorMode: 'inherit', ctaBgColor: themeCtaBg });
                        } else if (m === 'color') {
                          updateDesign({ ctaBgColorMode: 'custom', ctaBgColor: design.ctaBgColor || themeCtaBg });
                        } else if (m === 'gradient') {
                          updateDesign({
                            ctaBgColorMode: 'gradient',
                            bgGradient: design.bgGradient || { type: 'linear', angle: 90, from: themeCtaBg, to: '#1d4ed8' },
                          });
                        }
                      }}
                      inheritedColor={themeCtaBg}
                      inheritedTokenName="Brand Primary"
                      customColor={design.ctaBgColor}
                      onColorChange={(hex) => updateDesign({ ctaBgColorMode: 'custom', ctaBgColor: hex })}
                      gradient={design.bgGradient}
                      onGradientChange={(grad) => updateDesign({ ctaBgColorMode: 'gradient', bgGradient: grad })}
                    />

                    <DynamicColorOptionRow
                      label="CTA Button Text"
                      allowedModes={['inherit', 'color']}
                      currentMode={design.ctaTextColorMode === 'custom' ? 'color' : 'inherit'}
                      onModeChange={(m) => updateDesign({ ctaTextColorMode: m === 'inherit' ? 'inherit' : 'custom', ctaTextColor: m === 'inherit' ? themeCtaText : design.ctaTextColor })}
                      inheritedColor={themeCtaText}
                      inheritedTokenName="Theme Inverse Text"
                      customColor={design.ctaTextColor}
                      onColorChange={(hex) => updateDesign({ ctaTextColorMode: 'custom', ctaTextColor: hex })}
                    />
                  </>
                )}

                {/* 5. Border Color */}
                <DynamicColorOptionRow
                  label="Border Color"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.borderColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ borderColorMode: m === 'inherit' ? 'inherit' : 'custom', borderColor: m === 'inherit' ? themeBorder : design.borderColor })}
                  inheritedColor={themeBorder}
                  inheritedTokenName="Theme Border"
                  customColor={design.borderColor}
                  onColorChange={(hex) => updateDesign({ borderColorMode: 'custom', borderColor: hex })}
                />
              </div>
            )}
          </div>

          {/* Section 3: Typography */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: designSections.typography ? '12px' : 0 }}
              onClick={() => toggleDesignSection('typography')}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: '#1e293b' }}>TYPOGRAPHY</span>
              {designSections.typography ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>

            {designSections.typography && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Font Family</span>
                  <select
                    className={styles.inputField}
                    value={design.fontFamily || 'Inter, system-ui, sans-serif'}
                    onChange={(e) => updateDesign({ fontFamily: e.target.value })}
                  >
                    <option value="Inter, system-ui, sans-serif">Inter (Modern Clean)</option>
                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                    <option value="'Outfit', sans-serif">Outfit (Geometric)</option>
                    <option value="'Playfair Display', serif">Playfair Display (Luxury Serif)</option>
                    <option value="'Cinzel', serif">Cinzel (Jewelry)</option>
                    <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                    <option value="inherit">Inherit Brand Theme</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    <span>Font Size</span>
                    <span>{design.fontSize || 12}px</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={18}
                    value={design.fontSize || 12}
                    onChange={(e) => updateDesign({ fontSize: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Font Weight</span>
                  <select
                    className={styles.inputField}
                    value={String(design.fontWeight || '500')}
                    onChange={(e) => updateDesign({ fontWeight: e.target.value })}
                  >
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold (700)</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    <span>Line Height</span>
                    <span>{design.lineHeight || 1.3}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={2}
                    step={0.1}
                    value={design.lineHeight || 1.3}
                    onChange={(e) => updateDesign({ lineHeight: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    <span>Letter Spacing</span>
                    <span>{design.letterSpacing || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={3}
                    step={0.5}
                    value={design.letterSpacing || 0}
                    onChange={(e) => updateDesign({ letterSpacing: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Layout & Spacing */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: designSections.layout ? '12px' : 0 }}
              onClick={() => toggleDesignSection('layout')}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: '#1e293b' }}>LAYOUT &amp; SPACING</span>
              {designSections.layout ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>

            {designSections.layout && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Alignment</span>
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => updateDesign({ alignment: align })}
                        style={{
                          flex: 1,
                          padding: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: 'none',
                          background: design.alignment === align ? '#ffffff' : 'transparent',
                          color: design.alignment === align ? '#0f172a' : '#64748b',
                          boxShadow: design.alignment === align ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                        }}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    <span>Bar Height</span>
                    <span>{design.barHeight || 38}px</span>
                  </div>
                  <input
                    type="range"
                    min={28}
                    max={64}
                    value={design.barHeight || 38}
                    onChange={(e) => updateDesign({ barHeight: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <span>Padding Y</span>
                      <span>{design.paddingY || 8}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={20}
                      value={design.paddingY || 8}
                      onChange={(e) => updateDesign({ paddingY: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <span>Padding X</span>
                      <span>{design.paddingX || 16}px</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={48}
                      value={design.paddingX || 16}
                      onChange={(e) => updateDesign({ paddingX: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                </div>

                {(look === 'marquee' || look === 'slider') && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <span>Message Gap / Spacing</span>
                      <span>{design.messageSpacing || 28}px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={64}
                      value={design.messageSpacing || 28}
                      onChange={(e) => updateDesign({ messageSpacing: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Border */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: designSections.border ? '12px' : 0 }}
              onClick={() => toggleDesignSection('border')}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: '#1e293b' }}>BORDER</span>
              {designSections.border ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>

            {designSections.border && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Style</span>
                    <select
                      className={styles.inputField}
                      value={design.borderType || 'solid'}
                      onChange={(e) => updateDesign({ borderType: e.target.value as any })}
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Position</span>
                    <select
                      className={styles.inputField}
                      value={design.borderPosition || 'bottom'}
                      onChange={(e) => updateDesign({ borderPosition: e.target.value as any })}
                    >
                      <option value="bottom">Bottom Divider</option>
                      <option value="top">Top Divider</option>
                      <option value="all">Box Outline</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    <span>Border Width</span>
                    <span>{design.borderWidth || 1}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={design.borderWidth || 1}
                    onChange={(e) => updateDesign({ borderWidth: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    <span>Border Radius</span>
                    <span>{design.borderRadius || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={24}
                    value={design.borderRadius || 0}
                    onChange={(e) => updateDesign({ borderRadius: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Look-Specific Styling */}
          <div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: designSections.lookSpecific ? '12px' : 0 }}
              onClick={() => toggleDesignSection('lookSpecific')}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: '#1e293b' }}>LOOK-SPECIFIC STYLING</span>
              {designSections.lookSpecific ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>

            {designSections.lookSpecific && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {look === 'single' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                        <span>Icon Size</span>
                        <span>{design.iconSize || 14}px</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={24}
                        value={design.iconSize || 14}
                        onChange={(e) => updateDesign({ iconSize: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: '#2563eb' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                        <span>Icon Spacing</span>
                        <span>{design.iconSpacing || 8}px</span>
                      </div>
                      <input
                        type="range"
                        min={4}
                        max={20}
                        value={design.iconSpacing || 8}
                        onChange={(e) => updateDesign({ iconSpacing: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: '#2563eb' }}
                      />
                    </div>
                  </div>
                )}

                {look === 'single_cta' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>CTA Style</span>
                        <select
                          className={styles.inputField}
                          value={design.ctaStyle || 'solid'}
                          onChange={(e) => updateDesign({ ctaStyle: e.target.value as any })}
                        >
                          <option value="solid">Solid Fill</option>
                          <option value="outline">Outline</option>
                          <option value="ghost">Ghost (Underline)</option>
                        </select>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>CTA Size</span>
                        <select
                          className={styles.inputField}
                          value={design.ctaSize || 'sm'}
                          onChange={(e) => updateDesign({ ctaSize: e.target.value as any })}
                        >
                          <option value="sm">Small</option>
                          <option value="md">Medium</option>
                          <option value="lg">Large</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                          <span>Corner Radius</span>
                          <span>{design.ctaRadius || 6}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={24}
                          value={design.ctaRadius || 6}
                          onChange={(e) => updateDesign({ ctaRadius: parseInt(e.target.value) })}
                          style={{ width: '100%', accentColor: '#2563eb' }}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                          <span>Button Spacing</span>
                          <span>{design.ctaSpacing || 14}px</span>
                        </div>
                        <input
                          type="range"
                          min={6}
                          max={32}
                          value={design.ctaSpacing || 14}
                          onChange={(e) => updateDesign({ ctaSpacing: parseInt(e.target.value) })}
                          style={{ width: '100%', accentColor: '#2563eb' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {look === 'countdown' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Number Style</span>
                        <select
                          className={styles.inputField}
                          value={design.countdownNumberStyle || 'card'}
                          onChange={(e) => updateDesign({ countdownNumberStyle: e.target.value as any })}
                        >
                          <option value="card">Rounded Card</option>
                          <option value="pill">Pill Box</option>
                          <option value="plain">Plain Text</option>
                        </select>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Separator</span>
                        <select
                          className={styles.inputField}
                          value={design.countdownSeparatorStyle || 'colon'}
                          onChange={(e) => updateDesign({ countdownSeparatorStyle: e.target.value as any })}
                        >
                          <option value="colon">Colon ( : )</option>
                          <option value="dot">Dot ( • )</option>
                          <option value="slash">Slash ( / )</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '12px', color: '#334155' }}>Digit Box Background</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ColorPickerPopover
                          value={design.countdownDigitBg || 'rgba(255, 255, 255, 0.18)'}
                          onChange={(hex) => updateDesign({ countdownDigitBg: hex })}
                          size="sm"
                        />
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>{design.countdownDigitBg}</span>
                      </div>
                    </div>
                  </>
                )}

                {look === 'marquee' && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Ticker Item Separator</span>
                    <select
                      className={styles.inputField}
                      value={design.marqueeSeparatorStyle || 'star'}
                      onChange={(e) => updateDesign({ marqueeSeparatorStyle: e.target.value as any })}
                    >
                      <option value="star">Star ( ★ )</option>
                      <option value="bullet">Bullet ( • )</option>
                      <option value="dash">Dash ( — )</option>
                      <option value="slash">Slash ( / )</option>
                      <option value="emoji">Fire Emoji ( 🔥 )</option>
                      <option value="none">None (Spacing only)</option>
                    </select>
                  </div>
                )}

                {look === 'slider' && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Navigation Controls</span>
                    <select
                      className={styles.inputField}
                      value={design.slideNavStyle || 'both'}
                      onChange={(e) => updateDesign({ slideNavStyle: e.target.value as any })}
                    >
                      <option value="both">Both Arrows &amp; Dots</option>
                      <option value="arrows">Arrows Only</option>
                      <option value="dots">Dots Only</option>
                      <option value="none">None (Clean Slide)</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: BEHAVIOR ─── */}
      {activeTab === 'behavior' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          {/* Bar Position & Sticky Behavior */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
              BAR POSITION BEHAVIOR
            </span>
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => updateBehavior({ isSticky: false, position: 'normal' })}
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  background: !behavior.isSticky && behavior.position !== 'sticky' ? '#ffffff' : 'transparent',
                  color: !behavior.isSticky && behavior.position !== 'sticky' ? '#0f172a' : '#64748b',
                  boxShadow: !behavior.isSticky && behavior.position !== 'sticky' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Normal Flow
              </button>
              <button
                type="button"
                onClick={() => updateBehavior({ isSticky: true, position: 'sticky' })}
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  background: behavior.isSticky || behavior.position === 'sticky' ? '#ffffff' : 'transparent',
                  color: behavior.isSticky || behavior.position === 'sticky' ? '#0f172a' : '#64748b',
                  boxShadow: behavior.isSticky || behavior.position === 'sticky' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Sticky Top
              </button>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#64748b' }}>
              {behavior.isSticky || behavior.position === 'sticky'
                ? 'The bar stays pinned to the top of the viewport when scrolling.'
                : 'The bar scrolls naturally with page content.'}
            </p>
          </div>

          {/* Visibility & Scheduling */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
              VISIBILITY &amp; SCHEDULE
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Display Mode</span>
                <select
                  className={styles.inputField}
                  value={behavior.visibilityMode || 'always'}
                  onChange={(e) => updateBehavior({ visibilityMode: e.target.value as any })}
                >
                  <option value="always">Always Visible</option>
                  <option value="scheduled">Scheduled Date Window</option>
                </select>
              </div>

              {behavior.visibilityMode === 'scheduled' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Start Time</span>
                    <input
                      type="datetime-local"
                      className={styles.inputField}
                      value={behavior.startDate || ''}
                      onChange={(e) => updateBehavior({ startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>End Time</span>
                    <input
                      type="datetime-local"
                      className={styles.inputField}
                      value={behavior.endDate || ''}
                      onChange={(e) => updateBehavior({ endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Store Timezone</span>
                    <select
                      className={styles.inputField}
                      value={behavior.timezone || 'store'}
                      onChange={(e) => updateBehavior({ timezone: e.target.value })}
                    >
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dismissible & Memory (Defaultly unchecked) */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
              DISMISSAL CONTROLS
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(behavior.dismissible)}
                  onChange={(e) => updateBehavior({ dismissible: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                />
                <span>Allow visitor to dismiss (Show close button)</span>
              </label>

              {Boolean(behavior.dismissible) && (
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Remember Dismissal</span>
                  <select
                    className={styles.inputField}
                    value={behavior.rememberDismissal || 'session'}
                    onChange={(e) => updateBehavior({ rememberDismissal: e.target.value as any })}
                  >
                    <option value="session">Session Only (Re-appears on next visit)</option>
                    <option value="persistent">Persistent (Saved in localStorage)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Look-Specific Dynamic Behavior */}
          {look === 'marquee' && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                MARQUEE SCROLL DYNAMICS
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Direction</span>
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                    <button
                      type="button"
                      onClick={() => updateBehavior({ marqueeDirection: 'ltr' })}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: 'none',
                        background: behavior.marqueeDirection !== 'rtl' ? '#ffffff' : 'transparent',
                        color: behavior.marqueeDirection !== 'rtl' ? '#0f172a' : '#64748b',
                        boxShadow: behavior.marqueeDirection !== 'rtl' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Left to Right
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBehavior({ marqueeDirection: 'rtl' })}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: 'none',
                        background: behavior.marqueeDirection === 'rtl' ? '#ffffff' : 'transparent',
                        color: behavior.marqueeDirection === 'rtl' ? '#0f172a' : '#64748b',
                        boxShadow: behavior.marqueeDirection === 'rtl' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Right to Left
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    <span>Loop Duration (Speed)</span>
                    <span>{behavior.marqueeSpeed || 25}s</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    value={behavior.marqueeSpeed || 25}
                    onChange={(e) => updateBehavior({ marqueeSpeed: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                    <span>Faster (5s)</span>
                    <span>Slower (60s)</span>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={behavior.marqueePauseOnHover !== false}
                    onChange={(e) => updateBehavior({ marqueePauseOnHover: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                  <span>Pause ticker when mouse hovers</span>
                </label>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Accessibility Reduced Motion</span>
                  <select
                    className={styles.inputField}
                    value={behavior.marqueeReducedMotion || 'pause'}
                    onChange={(e) => updateBehavior({ marqueeReducedMotion: e.target.value as any })}
                  >
                    <option value="pause">Pause animation</option>
                    <option value="slow">Slow down ticker (50%)</option>
                    <option value="static">Show static first announcement</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {look === 'slider' && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                ROTATION &amp; TRANSITIONS
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={behavior.slideAutoplay !== false}
                    onChange={(e) => updateBehavior({ slideAutoplay: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                  <span>Autoplay rotating slides</span>
                </label>

                {behavior.slideAutoplay !== false && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <span>Slide Interval</span>
                      <span>{behavior.slideInterval || 4}s</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={15}
                      value={behavior.slideInterval || 4}
                      onChange={(e) => updateBehavior({ slideInterval: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Transition Effect</span>
                    <select
                      className={styles.inputField}
                      value={behavior.slideTransition || 'slide'}
                      onChange={(e) => updateBehavior({ slideTransition: e.target.value as any })}
                    >
                      <option value="slide">Slide</option>
                      <option value="fade">Fade</option>
                    </select>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Direction</span>
                    <select
                      className={styles.inputField}
                      value={behavior.slideDirection || 'horizontal'}
                      onChange={(e) => updateBehavior({ slideDirection: e.target.value as any })}
                    >
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                    </select>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={behavior.slidePauseOnHover !== false}
                    onChange={(e) => updateBehavior({ slidePauseOnHover: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                  <span>Pause rotation when mouse hovers</span>
                </label>
              </div>
            </div>
          )}

          {look === 'countdown' && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                EXPIRATION ACTION
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>When Countdown Reaches 0</span>
                  <select
                    className={styles.inputField}
                    value={behavior.countdownEndAction || 'offer_ended'}
                    onChange={(e) => updateBehavior({ countdownEndAction: e.target.value as any })}
                  >
                    <option value="offer_ended">Keep visible showing 'Offer Concluded'</option>
                    <option value="hide">Hide announcement bar completely</option>
                    <option value="replacement_message">Display replacement message</option>
                    <option value="keep_visible">Keep bar visible with 00:00:00</option>
                  </select>
                </div>

                {behavior.countdownEndAction === 'replacement_message' && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Replacement Message</span>
                    <textarea
                      rows={2}
                      className={styles.textareaField}
                      value={behavior.countdownReplacementMessage || ''}
                      onChange={(e) => updateBehavior({ countdownReplacementMessage: e.target.value })}
                      placeholder="e.g. This special promotion has concluded. Stay tuned for future offers!"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {(announcementRow?.isVisible === false || announcementSection?.isHidden) && (
        <div style={{ margin: '16px', padding: '12px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ffeeba' }}>
          <EyeOff size={16} style={{ flexShrink: 0 }} />
          <span>This section is currently hidden.</span>
        </div>
      )}
    </>
  );
};

// ─── Brand Icons for Utility Bar & Social Links ─────────────
const BrandInstagramIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
);
const BrandFacebookIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const BrandTwitterIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
);
const BrandYoutubeIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
);
const BrandWhatsAppIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
);

const renderUtilityIconByName = (name: string, size = 14, color?: string, strokeWidth = 2): React.ReactNode => {
  const s = size;
  const style = color ? { color } : undefined;
  switch (name?.toLowerCase()) {
    case 'instagram': return <BrandInstagramIcon size={s} />;
    case 'facebook': return <BrandFacebookIcon size={s} />;
    case 'twitter':
    case 'x': return <BrandTwitterIcon size={s} />;
    case 'youtube': return <BrandYoutubeIcon size={s} />;
    case 'whatsapp': return <BrandWhatsAppIcon size={s} />;
    case 'phone': return <Phone size={s} style={style} strokeWidth={strokeWidth} />;
    case 'mail': return <Mail size={s} style={style} strokeWidth={strokeWidth} />;
    case 'messagesquare':
    case 'message': return <MessageSquare size={s} style={style} strokeWidth={strokeWidth} />;
    case 'truck': return <Truck size={s} style={style} strokeWidth={strokeWidth} />;
    case 'gift': return <Gift size={s} style={style} strokeWidth={strokeWidth} />;
    case 'tag': return <Tag size={s} style={style} strokeWidth={strokeWidth} />;
    case 'globe': return <Globe size={s} style={style} strokeWidth={strokeWidth} />;
    case 'mappin': return <MapPin size={s} style={style} strokeWidth={strokeWidth} />;
    case 'headphones': return <Headphones size={s} style={style} strokeWidth={strokeWidth} />;
    case 'shield': return <Shield size={s} style={style} strokeWidth={strokeWidth} />;
    case 'shieldcheck': return <ShieldCheck size={s} style={style} strokeWidth={strokeWidth} />;
    case 'clock': return <Clock size={s} style={style} strokeWidth={strokeWidth} />;
    case 'star': return <Star size={s} style={style} strokeWidth={strokeWidth} />;
    case 'heart': return <Heart size={s} style={style} strokeWidth={strokeWidth} />;
    case 'user': return <User size={s} style={style} strokeWidth={strokeWidth} />;
    case 'shoppingbag': return <ShoppingBag size={s} style={style} strokeWidth={strokeWidth} />;
    case 'store': return <Store size={s} style={style} strokeWidth={strokeWidth} />;
    case 'share2': return <Share2 size={s} style={style} strokeWidth={strokeWidth} />;
    case 'helpcircle': return <HelpCircle size={s} style={style} strokeWidth={strokeWidth} />;
    case 'creditcard': return <CreditCard size={s} style={style} strokeWidth={strokeWidth} />;
    case 'smartphone': return <Smartphone size={s} style={style} strokeWidth={strokeWidth} />;
    case 'sparkles': return <Sparkles size={s} style={style} strokeWidth={strokeWidth} />;
    case 'flame': return <Flame size={s} style={style} strokeWidth={strokeWidth} />;
    case 'zap': return <Zap size={s} style={style} strokeWidth={strokeWidth} />;
    case 'package': return <Package size={s} style={style} strokeWidth={strokeWidth} />;
    case 'download': return <Download size={s} style={style} strokeWidth={strokeWidth} />;
    case 'qrcode': return <QrCode size={s} style={style} strokeWidth={strokeWidth} />;
    case 'play': return <Play size={s} style={style} strokeWidth={strokeWidth} />;
    case 'lock': return <Lock size={s} style={style} strokeWidth={strokeWidth} />;
    case 'bell': return <Bell size={s} style={style} strokeWidth={strokeWidth} />;
    default: return <Sparkles size={s} style={style} strokeWidth={strokeWidth} />;
  }
};

// ─── Universal Icon System Component ────────────────────────
const UTILITY_ICON_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'contact', label: 'Contact', icons: ['Phone', 'Mail', 'MessageSquare', 'WhatsApp', 'Smartphone'] },
  { id: 'commerce', label: 'Commerce', icons: ['ShoppingBag', 'Tag', 'Gift', 'CreditCard'] },
  { id: 'shipping', label: 'Shipping', icons: ['Truck', 'Package', 'MapPin'] },
  { id: 'support', label: 'Support', icons: ['Headphones', 'HelpCircle', 'Clock'] },
  { id: 'social', label: 'Social', icons: ['Instagram', 'Facebook', 'YouTube', 'Twitter', 'Share2'] },
  { id: 'location', label: 'Location', icons: ['MapPin', 'Globe'] },
  { id: 'security', label: 'Security', icons: ['Shield', 'ShieldCheck', 'Lock'] },
  { id: 'promotion', label: 'Promotion', icons: ['Sparkles', 'Flame', 'Zap', 'Star', 'Gift'] },
  { id: 'app', label: 'App', icons: ['Smartphone', 'Download', 'QrCode', 'Play'] },
] as const;

export const UtilityIconPicker: React.FC<{
  label?: string;
  value?: UtilityIconConfig;
  onChange: (config: UtilityIconConfig) => void;
  showSettings?: boolean;
}> = ({ label = 'Icon', value, onChange, showSettings = true }) => {
  const currentConfig: UtilityIconConfig = value || { source: 'library', iconName: 'Sparkles', size: 14, strokeWidth: 2, position: 'left', gap: 6 };
  const currentSource = currentConfig.source || 'library';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result;
      if (typeof res === 'string') {
        onChange({ ...currentConfig, source: 'upload', customSvgOrUrl: res });
      }
    };
    reader.readAsDataURL(file);
  };

  const allAvailableIcons = useMemo(() => {
    const set = new Set<string>();
    UTILITY_ICON_CATEGORIES.forEach((cat) => {
      if ('icons' in cat) {
        cat.icons.forEach((ic) => set.add(ic));
      }
    });
    return Array.from(set);
  }, []);

  const filteredIcons = useMemo(() => {
    let list = allAvailableIcons;
    if (activeCategory !== 'all') {
      const cat = UTILITY_ICON_CATEGORIES.find((c) => c.id === activeCategory);
      if (cat && 'icons' in cat) {
        list = [...cat.icons];
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((ic) => ic.toLowerCase().includes(q));
    }
    return list;
  }, [allAvailableIcons, activeCategory, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{label}</span>
        {showSettings && currentSource !== 'none' && (
          <button
            type="button"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              color: '#2563eb',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sliders size={11} /> Settings
          </button>
        )}
      </div>

      {/* Source selector: None | Library | Custom | Upload */}
      <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '6px' }}>
        {(['none', 'library', 'custom', 'upload'] as const).map((src) => {
          const isSelected = currentSource === src;
          return (
            <button
              key={src}
              type="button"
              onClick={() => onChange({ ...currentConfig, source: src })}
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '11px',
                fontWeight: isSelected ? 600 : 500,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: isSelected ? '#ffffff' : 'transparent',
                color: isSelected ? '#2563eb' : '#64748b',
                boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {src === 'none' ? 'None' : src === 'library' ? 'Library' : src === 'custom' ? 'Custom' : 'Upload'}
            </button>
          );
        })}
      </div>

      {/* Mode 1: Library */}
      {currentSource === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '8px', top: '8px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search icons (phone, truck, heart...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px 6px 28px',
                fontSize: '11px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {UTILITY_ICON_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: activeCategory === cat.id ? 600 : 500,
                  whiteSpace: 'nowrap',
                  border: activeCategory === cat.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: activeCategory === cat.id ? '#eff6ff' : '#ffffff',
                  color: activeCategory === cat.id ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '6px',
              maxHeight: '140px',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            {filteredIcons.map((ic) => {
              const isChosen = currentConfig.iconName === ic;
              return (
                <button
                  key={ic}
                  type="button"
                  onClick={() => onChange({ ...currentConfig, iconName: ic })}
                  title={ic}
                  style={{
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '5px',
                    border: isChosen ? '2px solid #2563eb' : '1px solid #f1f5f9',
                    backgroundColor: isChosen ? '#eff6ff' : '#f8fafc',
                    color: isChosen ? '#2563eb' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  {renderUtilityIconByName(ic, 15)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Custom Icon URL / SVG */}
      {currentSource === 'custom' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Paste Icon URL (https://...) or raw SVG"
            value={currentConfig.customSvgOrUrl || ''}
            onChange={(e) => onChange({ ...currentConfig, customSvgOrUrl: e.target.value })}
            style={{ fontSize: '11px' }}
          />
          {currentConfig.customSvgOrUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', backgroundColor: '#ffffff', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Preview:</span>
              <img
                src={currentConfig.customSvgOrUrl}
                alt="Custom icon"
                style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Upload Icon */}
      {currentSource === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="file"
            ref={uploadInputRef}
            accept=".svg,.png,.webp,image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          {currentConfig.customSvgOrUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={currentConfig.customSvgOrUrl}
                  alt="Uploaded preview"
                  style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px', background: '#f1f5f9', padding: '2px' }}
                />
                <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 500 }}>Icon uploaded</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  style={{ fontSize: '10px', padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', cursor: 'pointer' }}
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...currentConfig, customSvgOrUrl: '' })}
                  style={{ fontSize: '10px', padding: '3px 6px', border: '1px solid #fca5a5', borderRadius: '4px', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                borderRadius: '6px',
                border: '1px dashed #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <UploadCloud size={14} /> Upload Icon (SVG, PNG, WebP)
            </button>
          )}
        </div>
      )}

      {/* Expandable Settings Drawer */}
      {showSettings && showSettingsDrawer && currentSource !== 'none' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', marginTop: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                <span>Size</span>
                <span>{currentConfig.size || 14}px</span>
              </div>
              <input
                type="range"
                min={10}
                max={24}
                value={currentConfig.size || 14}
                onChange={(e) => onChange({ ...currentConfig, size: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                <span>Gap</span>
                <span>{currentConfig.gap || 6}px</span>
              </div>
              <input
                type="range"
                min={2}
                max={16}
                value={currentConfig.gap || 6}
                onChange={(e) => onChange({ ...currentConfig, gap: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Position</span>
              <select
                className={styles.inputField}
                value={currentConfig.position || 'left'}
                onChange={(e) => onChange({ ...currentConfig, position: e.target.value as 'left' | 'right' })}
                style={{ fontSize: '10px', padding: '3px 6px' }}
              >
                <option value="left">Left of Label</option>
                <option value="right">Right of Label</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Stroke Width</span>
              <select
                className={styles.inputField}
                value={currentConfig.strokeWidth || 2}
                onChange={(e) => onChange({ ...currentConfig, strokeWidth: Number(e.target.value) })}
                style={{ fontSize: '10px', padding: '3px 6px' }}
              >
                <option value="1">1px (Thin)</option>
                <option value="1.5">1.5px (Light)</option>
                <option value="2">2px (Regular)</option>
                <option value="2.5">2.5px (Bold)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sortable Utility Item Row ──────────────────────────────
export const SortableUtilityItemRow: React.FC<{
  item: UtilityItem;
  onUpdate: (patch: Partial<UtilityItem>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}> = ({ item, onUpdate, onDuplicate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const rowStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    border: isExpanded ? '1px solid #2563eb' : '1px solid #e2e8f0',
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    marginBottom: '8px',
    overflow: 'hidden',
    boxShadow: isExpanded ? '0 2px 6px rgba(37, 99, 235, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
  };

  return (
    <div ref={setNodeRef} style={rowStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          backgroundColor: isExpanded ? '#f8fafc' : '#ffffff',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'grab', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
            title="Drag to reorder"
          >
            <GripVertical size={14} />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ enabled: !item.enabled });
            }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: item.enabled ? '#059669' : '#94a3b8' }}
            title={item.enabled ? 'Click to hide' : 'Click to show'}
          >
            {item.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {item.icon && item.icon.source !== 'none' && (
            <div style={{ color: '#475569', display: 'flex', alignItems: 'center' }}>
              {item.icon.source === 'upload' && item.icon.customSvgOrUrl ? (
                <img src={item.icon.customSvgOrUrl} alt="icon" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />
              ) : (
                renderUtilityIconByName(item.icon.iconName || 'Sparkles', 13)
              )}
            </div>
          )}

          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: item.enabled ? '#1e293b' : '#94a3b8',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label || item.value || 'Untitled Item'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onDuplicate}
            style={{ padding: '3px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
            title="Duplicate item"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            style={{ padding: '3px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            title="Delete item"
          >
            <Trash2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ padding: '3px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#ffffff' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Label
            </label>
            <input
              type="text"
              className={styles.inputField}
              value={item.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="e.g. Phone, Track Order, Help"
              style={{ fontSize: '11px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Value / Subtext (Optional)
            </label>
            <input
              type="text"
              className={styles.inputField}
              value={item.value || ''}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder="e.g. +91 98765 43210 or support@store.com"
              style={{ fontSize: '11px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Link URL
              </label>
              <input
                type="text"
                className={styles.inputField}
                value={item.link || ''}
                onChange={(e) => onUpdate({ link: e.target.value })}
                placeholder="tel:... or /track or https://..."
                style={{ fontSize: '11px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Target
              </label>
              <select
                className={styles.inputField}
                value={item.target || '_self'}
                onChange={(e) => onUpdate({ target: e.target.value as '_self' | '_blank' })}
                style={{ fontSize: '11px', padding: '4px' }}
              >
                <option value="_self">Same Tab</option>
                <option value="_blank">New Tab</option>
              </select>
            </div>
          </div>

          <UtilityIconPicker
            label="Item Icon"
            value={item.icon}
            onChange={(icon) => onUpdate({ icon })}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={item.separator !== false}
                onChange={(e) => onUpdate({ separator: e.target.checked })}
                style={{ accentColor: '#2563eb' }}
              />
              Show divider after item
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(item.hideOnMobile)}
                onChange={(e) => onUpdate({ hideOnMobile: e.target.checked })}
                style={{ accentColor: '#2563eb' }}
              />
              Hide on mobile
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Full Utility Bar Right Sidebar Editor ──────────────────
export const UtilityBarRightEditor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const editorStore = useEditorContextStore();
  const headerRows = editorStore.headerRows || [];
  const utilityRow = headerRows.find(
    (r) => r.type === 'utility' || r.id === 'row-utility' || r.id === 'utility-bar' || r.id.includes('utility')
  );
  const siteStore = useSiteStore();
  const themePalette = siteStore.theme?.palette || (siteStore.theme as any)?.colors || getDefaultTheme().palette;

  const semanticColors = getInheritedUtilityColors(themePalette);

  const landingPage = siteStore.pages.find((p) => p.id === 'landing-page') || siteStore.pages[0];
  const utilitySection = landingPage?.sections.find(
    (s) => s.type === 'UtilityBar' || s.id === 'utility-bar' || s.id.includes('utility')
  );

  const [activeTab, setActiveTab] = useState<UtilityTabId>('look');

  // Accordion states in design tab
  const [designSections, setDesignSections] = useState({
    colors: true,
    typography: false,
    borders: false,
    buttons: false,
  });

  const toggleDesignSection = (key: keyof typeof designSections) => {
    setDesignSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Resolve current data
  const barData: UtilityBarData = useMemo(() => {
    return resolveUtilityBarData(utilityRow, utilitySection?.props, themePalette);
  }, [utilityRow, utilitySection?.props, themePalette]);

  const { look, content, layout, behavior, design, responsive, visibility, advanced } = barData;

  const currentLookMeta = UTILITY_BAR_LOOKS.find((l) => l.id === look) || UTILITY_BAR_LOOKS[0];

  // Dynamic tab strip: Look and Content always first, then remaining supported tabs
  const availableTabs: { id: UtilityTabId; label: string }[] = useMemo(() => {
    const ALL_ORDER: { id: UtilityTabId; label: string }[] = [
      { id: 'look', label: 'Look' },
      { id: 'content', label: 'Content' },
      { id: 'layout', label: 'Layout' },
      { id: 'behavior', label: 'Behavior' },
      { id: 'design', label: 'Design' },
      { id: 'responsive', label: 'Responsive' },
      { id: 'visibility', label: 'Visibility' },
      { id: 'advanced', label: 'Advanced' },
    ];
    return ALL_ORDER.filter((tab) => {
      if (tab.id === 'look' || tab.id === 'content') return true;
      return currentLookMeta.supportedTabs.includes(tab.id);
    });
  }, [currentLookMeta]);

  const tabsRef = useRef<HTMLDivElement>(null);

  const handlePrevTab = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const handleNextTab = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  // Central update dispatcher
  const updateBarData = (nextData: UtilityBarData) => {
    const store = useEditorContextStore.getState();
    const rows = store.headerRows || [];
    const targetRow = rows.find(
      (r) => r.type === 'utility' || r.id === 'row-utility' || r.id === 'utility-bar' || r.id.includes('utility')
    );

    if (targetRow) {
      const el = targetRow.elements?.[0];
      const elId = el?.id || 'el-utility-content';

      store.updateHeaderRow(targetRow.id, {
        layout: {
          ...targetRow.layout,
          variantId: nextData.look,
          height: nextData.layout.barHeight,
          paddingY: nextData.layout.paddingY,
          paddingX: nextData.layout.paddingX,
        },
        styling: {
          ...targetRow.styling,
          bgColor: nextData.design.bgColor,
          textColor: nextData.design.textColor,
          borderColor: nextData.design.borderColor || '#e2e8f0',
          bgColorMode: (nextData.design.bgColorMode === 'custom' ? 'color' : 'inherit') as any,
          textColorMode: nextData.design.textColorMode === 'custom' ? 'color' : 'inherit',
          borderColorMode: nextData.design.borderColorMode === 'custom' ? 'color' : 'inherit',
          fontSize: nextData.design.fontSize,
          fontWeight: Number(nextData.design.fontWeight) || 500,
          borderBottom: nextData.design.borderPosition !== 'none',
        },
      });

      store.updateHeaderElement(targetRow.id, elId, {
        props: {
          ...el?.props,
          utilityBar: nextData,
          look: nextData.look,
          variant: nextData.look,
          height: nextData.layout.barHeight,
        },
      });

      store.syncHeaderToSiteStore();
    }

    const currentSiteStore = useSiteStore.getState();
    currentSiteStore.pages.forEach((page) => {
      const sec = page.sections.find(
        (s) => s.type === 'UtilityBar' || s.id === 'utility-bar' || s.id.includes('utility')
      );
      if (sec) {
        currentSiteStore.updateSectionProps(page.id, sec.id, {
          utilityBar: nextData,
          look: nextData.look,
          variant: nextData.look,
          height: nextData.layout.barHeight,
        });
      }
    });
  };

  const handleSelectLook = (newLook: UtilityBarLook) => {
    const nextData = switchUtilityBarLook(barData, newLook, themePalette);
    updateBarData(nextData);
    const newLookMeta = UTILITY_BAR_LOOKS.find((l) => l.id === newLook) || UTILITY_BAR_LOOKS[0];
    if (!newLookMeta.supportedTabs.includes(activeTab)) {
      setActiveTab('content');
    }
  };

  const updateContent = (patch: Partial<typeof content>) => {
    updateBarData({ ...barData, content: { ...barData.content, ...patch } });
  };

  const updateLayout = (patch: Partial<typeof layout>) => {
    updateBarData({ ...barData, layout: { ...barData.layout, ...patch } });
  };

  const updateBehavior = (patch: Partial<typeof behavior>) => {
    updateBarData({ ...barData, behavior: { ...barData.behavior, ...patch } });
  };

  const updateDesign = (patch: Partial<typeof design>) => {
    updateBarData({
      ...barData,
      design: { ...barData.design, ...patch },
      customOverrides: { ...barData.customOverrides, ...patch },
    });
  };

  const updateResponsive = (patch: Partial<typeof responsive>) => {
    updateBarData({ ...barData, responsive: { ...barData.responsive, ...patch } });
  };

  const updateVisibility = (patch: Partial<typeof visibility>) => {
    updateBarData({ ...barData, visibility: { ...barData.visibility, ...patch } });
  };

  const updateAdvanced = (patch: Partial<typeof advanced>) => {
    updateBarData({ ...barData, advanced: { ...barData.advanced, ...patch } });
  };

  // Tab reset handlers
  const handleResetContent = () => {
    updateBarData({ ...barData, content: getDefaultContentForLook(barData.look) });
  };
  const handleResetLayout = () => {
    updateBarData({ ...barData, layout: getDefaultLayoutForLook(barData.look) });
  };
  const handleResetBehavior = () => {
    updateBarData({ ...barData, behavior: getDefaultBehaviorForLook(barData.look) });
  };
  const handleResetDesign = () => {
    updateBarData({ ...barData, design: getDefaultUtilityDesign(themePalette), customOverrides: {} });
  };
  const handleResetResponsive = () => {
    updateBarData({ ...barData, responsive: getDefaultUtilityResponsive() });
  };
  const handleResetVisibility = () => {
    updateBarData({ ...barData, visibility: getDefaultUtilityVisibility() });
  };
  const handleResetAdvanced = () => {
    updateBarData({ ...barData, advanced: getDefaultUtilityAdvanced() });
  };
  const handleResetFull = () => {
    const nextData = switchUtilityBarLook(barData, barData.look, themePalette);
    updateBarData(nextData);
  };

  // DnD Sensors for item reordering
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleGenericItemDragEnd = (listKey: any, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const currentList = [...((content as any)[listKey] || [])] as UtilityItem[];
    const oldIdx = currentList.findIndex((it) => it.id === active.id);
    const newIdx = currentList.findIndex((it) => it.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      const [moved] = currentList.splice(oldIdx, 1);
      currentList.splice(newIdx, 0, moved);
      updateContent({ [listKey]: currentList });
    }
  };

  return (
    <>
      {/* Panel Header */}
      <div className={styles.panelHeader}>
        <div className={styles.phLeft}>
          <button type="button" className={styles.iconBtn} onClick={onClose} title="Collapse sidebar">
            <ChevronRight size={20} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600}>Utility Bar</h3>
        </div>
      </div>

      {/* 8 Dynamic Tabs: Look | Content | Layout | Behavior | Design | Responsive | Visibility | Advanced */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e2e8f0)', background: '#f8fafc', position: 'relative' }}>
        <button
          type="button"
          onClick={handlePrevTab}
          style={{
            padding: '8px 10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted, #64748b)',
            flexShrink: 0,
            transition: 'color 0.15s ease',
          }}
          title="Scroll tabs left"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft size={16} />
        </button>
        <div
          ref={tabsRef}
          className={styles.propTabs}
          style={{
            overflowX: 'auto',
            flexWrap: 'nowrap',
            borderBottom: 'none',
            flex: 1,
            display: 'flex',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {availableTabs.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.propTab} ${activeTab === tab.id ? styles.activePropTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '1 0 auto',
                padding: '12px 10px',
                textAlign: 'center',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleNextTab}
          style={{
            padding: '8px 10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted, #64748b)',
            flexShrink: 0,
            transition: 'color 0.15s ease',
          }}
          title="Scroll tabs right"
          aria-label="Scroll tabs right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── TAB 1: LOOK ─── */}
      {activeTab === 'look' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Utility Bar Looks
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
              Choose a template. Content structure, alignment, and semantic styles adapt dynamically.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {UTILITY_BAR_LOOKS.map((l) => {
              const isSelected = look === l.id;
              return (
                <div
                  key={l.id}
                  onClick={() => handleSelectLook(l.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                        {l.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                          color: isSelected ? '#1e40af' : '#475569',
                        }}
                      >
                        {l.badge}
                      </span>
                    </div>

                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: isSelected ? '5px solid #2563eb' : '2px solid #cbd5e1',
                        background: '#fff',
                        boxSizing: 'border-box',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    />
                  </div>

                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                    {l.description}
                  </p>

                  <div
                    style={{
                      padding: '6px 8px',
                      borderRadius: '5px',
                      backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '10px',
                      color: isSelected ? '#1e40af' : '#334155',
                      fontFamily: 'monospace',
                    }}
                  >
                    {l.example}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: CONTENT ─── */}
      {activeTab === 'content' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          {/* Header with Look Badge & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Current Look</span>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{currentLookMeta.name}</div>
            </div>
            <button
              type="button"
              onClick={handleResetContent}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Reset Content to look defaults"
            >
              <RotateCcw size={11} /> Reset Content
            </button>
          </div>

          {/* General Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Enable Utility Bar</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Show or hide row on storefront</span>
            </div>
            <input
              type="checkbox"
              checked={content.enabled !== false}
              onChange={(e) => updateContent({ enabled: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
            />
          </div>

          {/* Dynamic Content by Look */}
          {/* LOOK: SPLIT SUPPORT & TRACKING */}
          {look === 'split_support' && (
            <>
              {/* Left Side Items */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>LEFT SIDE ITEMS</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newItem: UtilityItem = {
                        id: `item-${Date.now()}`,
                        enabled: true,
                        label: 'Support Link',
                        value: '',
                        link: '/support',
                        separator: true,
                        icon: { source: 'library', iconName: 'HelpCircle', size: 13, position: 'left' },
                      };
                      updateContent({ leftItems: [...(content.leftItems || []), newItem] });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: '1px solid #bfdbfe',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGenericItemDragEnd('leftItems', e)}>
                  <SortableContext items={(content.leftItems || []).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {(content.leftItems || []).map((item, idx) => (
                      <SortableUtilityItemRow
                        key={item.id}
                        item={item}
                        onUpdate={(patch) => {
                          const next = [...(content.leftItems || [])];
                          next[idx] = { ...next[idx], ...patch };
                          updateContent({ leftItems: next });
                        }}
                        onDuplicate={() => {
                          const dup: UtilityItem = { ...item, id: `item-${Date.now()}` };
                          const next = [...(content.leftItems || [])];
                          next.splice(idx + 1, 0, dup);
                          updateContent({ leftItems: next });
                        }}
                        onDelete={() => {
                          const next = (content.leftItems || []).filter((_, i) => i !== idx);
                          updateContent({ leftItems: next });
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              {/* Right Side Items */}
              <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>RIGHT SIDE ITEMS</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newItem: UtilityItem = {
                        id: `item-${Date.now()}`,
                        enabled: true,
                        label: 'Track Order',
                        value: '',
                        link: '/track-order',
                        separator: true,
                        icon: { source: 'library', iconName: 'Truck', size: 13, position: 'left' },
                      };
                      updateContent({ rightItems: [...(content.rightItems || []), newItem] });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: '1px solid #bfdbfe',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGenericItemDragEnd('rightItems', e)}>
                  <SortableContext items={(content.rightItems || []).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {(content.rightItems || []).map((item, idx) => (
                      <SortableUtilityItemRow
                        key={item.id}
                        item={item}
                        onUpdate={(patch) => {
                          const next = [...(content.rightItems || [])];
                          next[idx] = { ...next[idx], ...patch };
                          updateContent({ rightItems: next });
                        }}
                        onDuplicate={() => {
                          const dup: UtilityItem = { ...item, id: `item-${Date.now()}` };
                          const next = [...(content.rightItems || [])];
                          next.splice(idx + 1, 0, dup);
                          updateContent({ rightItems: next });
                        }}
                        onDelete={() => {
                          const next = (content.rightItems || []).filter((_, i) => i !== idx);
                          updateContent({ rightItems: next });
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </>
          )}

          {/* LOOK: CONTACT & SUPPORT */}
          {look === 'contact_support' && (
            <>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  CUSTOMER CARE CONTACT ITEMS
                </span>
                <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGenericItemDragEnd('items', e)}>
                  <SortableContext items={(content.items || []).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {(content.items || []).map((item, idx) => (
                      <SortableUtilityItemRow
                        key={item.id}
                        item={item}
                        onUpdate={(patch) => {
                          const next = [...(content.items || [])];
                          next[idx] = { ...next[idx], ...patch };
                          updateContent({ items: next });
                        }}
                        onDuplicate={() => {
                          const dup: UtilityItem = { ...item, id: `item-${Date.now()}` };
                          const next = [...(content.items || [])];
                          next.splice(idx + 1, 0, dup);
                          updateContent({ items: next });
                        }}
                        onDelete={() => {
                          const next = (content.items || []).filter((_, i) => i !== idx);
                          updateContent({ items: next });
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              {/* Business Hours Settings */}
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Business Hours Display</span>
                  <input
                    type="checkbox"
                    checked={content.businessHours?.enabled !== false}
                    onChange={(e) => updateContent({ businessHours: { ...content.businessHours, enabled: e.target.checked } })}
                    style={{ accentColor: '#2563eb' }}
                  />
                </div>

                {content.businessHours?.enabled !== false && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Open Time</span>
                        <input
                          type="time"
                          className={styles.inputField}
                          value={content.businessHours?.openingTime || '09:00'}
                          onChange={(e) => updateContent({ businessHours: { ...content.businessHours, openingTime: e.target.value } })}
                          style={{ fontSize: '11px' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Close Time</span>
                        <input
                          type="time"
                          className={styles.inputField}
                          value={content.businessHours?.closingTime || '18:00'}
                          onChange={(e) => updateContent({ businessHours: { ...content.businessHours, closingTime: e.target.value } })}
                          style={{ fontSize: '11px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Active Days</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={content.businessHours?.days || 'Mon - Sat'}
                        onChange={(e) => updateContent({ businessHours: { ...content.businessHours, days: e.target.value } })}
                        placeholder="Mon - Sat"
                        style={{ fontSize: '11px' }}
                      />
                    </div>

                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      🌐 Store Timezone: <strong>{content.businessHours?.timezone || 'Asia/Kolkata'}</strong>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* LOOK: PROMO + CTA */}
          {look === 'promo_cta' && (
            <>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  PROMOTION CALLOUT
                </span>
                <input
                  type="text"
                  className={styles.inputField}
                  value={content.promotion?.text || ''}
                  onChange={(e) => updateContent({ promotion: { ...content.promotion, text: e.target.value } })}
                  placeholder="e.g. Special Holiday Sale: Get 10% OFF"
                  style={{ marginBottom: '8px' }}
                />
                <UtilityIconPicker
                  label="Promo Icon"
                  value={content.promotion?.icon}
                  onChange={(icon) => updateContent({ promotion: { ...content.promotion, icon } })}
                />
              </div>

              {/* Coupon Copy Box */}
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Coupon Code Badge</span>
                  <input
                    type="checkbox"
                    checked={content.coupon?.enabled !== false}
                    onChange={(e) => updateContent({ coupon: { ...content.coupon, enabled: e.target.checked } })}
                    style={{ accentColor: '#2563eb' }}
                  />
                </div>

                {content.coupon?.enabled !== false && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Code</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={content.coupon?.code || 'SAVE10'}
                        onChange={(e) => updateContent({ coupon: { ...content.coupon, code: e.target.value } })}
                        placeholder="SAVE10"
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Copy Button Label</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={content.coupon?.copyButtonText || 'Copy'}
                        onChange={(e) => updateContent({ coupon: { ...content.coupon, copyButtonText: e.target.value } })}
                        placeholder="Copy"
                        style={{ fontSize: '11px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Action Button */}
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>CTA Action Button</span>
                  <input
                    type="checkbox"
                    checked={content.cta?.enabled !== false}
                    onChange={(e) => updateContent({ cta: { ...content.cta, enabled: e.target.checked } })}
                    style={{ accentColor: '#2563eb' }}
                  />
                </div>

                {content.cta?.enabled !== false && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Button Text</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={content.cta?.text || 'Shop Now'}
                        onChange={(e) => updateContent({ cta: { ...content.cta, text: e.target.value } })}
                        placeholder="Shop Now"
                        style={{ fontSize: '11px' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Link URL</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={content.cta?.url || '/collections/sale'}
                        onChange={(e) => updateContent({ cta: { ...content.cta, url: e.target.value } })}
                        placeholder="/collections/sale"
                        style={{ fontSize: '11px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* LOOK: FREE SHIPPING + TRUST */}
          {look === 'free_shipping_trust' && (
            <>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  TRUST BADGES &amp; PERKS
                </span>
                <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGenericItemDragEnd('trustItems', e)}>
                  <SortableContext items={(content.trustItems || []).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {(content.trustItems || []).map((item, idx) => (
                      <SortableUtilityItemRow
                        key={item.id}
                        item={item}
                        onUpdate={(patch) => {
                          const next = [...(content.trustItems || [])];
                          next[idx] = { ...next[idx], ...patch };
                          updateContent({ trustItems: next });
                        }}
                        onDuplicate={() => {
                          const dup: UtilityItem = { ...item, id: `item-${Date.now()}` };
                          const next = [...(content.trustItems || [])];
                          next.splice(idx + 1, 0, dup);
                          updateContent({ trustItems: next });
                        }}
                        onDelete={() => {
                          const next = (content.trustItems || []).filter((_, i) => i !== idx);
                          updateContent({ trustItems: next });
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Free Shipping Minimum Order
                </span>
                <input
                  type="text"
                  className={styles.inputField}
                  value={content.freeShippingThreshold || '₹999'}
                  onChange={(e) => updateContent({ freeShippingThreshold: e.target.value })}
                  placeholder="e.g. ₹999 or $50"
                />
              </div>
            </>
          )}

          {/* LOOK: LANGUAGE / COUNTRY / CURRENCY */}
          {look === 'currency_language' && (
            <>
              {/* Language Selector */}
              <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Language Selector</span>
                  <input
                    type="checkbox"
                    checked={content.languageSelector?.enabled !== false}
                    onChange={(e) => updateContent({ languageSelector: { ...content.languageSelector, enabled: e.target.checked } })}
                    style={{ accentColor: '#2563eb' }}
                  />
                </div>
                {content.languageSelector?.enabled !== false && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Default Language</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={content.languageSelector?.defaultLanguage || 'English'}
                        onChange={(e) => updateContent({ languageSelector: { ...content.languageSelector, defaultLanguage: e.target.value } })}
                        style={{ fontSize: '11px' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Display Mode</span>
                      <select
                        className={styles.inputField}
                        value={content.languageSelector?.displayMode || 'text'}
                        onChange={(e) => updateContent({ languageSelector: { ...content.languageSelector, displayMode: e.target.value as any } })}
                        style={{ fontSize: '11px', padding: '4px' }}
                      >
                        <option value="text">Text (English)</option>
                        <option value="flag_text">Flag + Text</option>
                        <option value="flag_only">Flag Only</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Currency Selector */}
              <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Currency Selector</span>
                  <input
                    type="checkbox"
                    checked={content.currencySelector?.enabled !== false}
                    onChange={(e) => updateContent({ currencySelector: { ...content.currencySelector, enabled: e.target.checked } })}
                    style={{ accentColor: '#2563eb' }}
                  />
                </div>
                {content.currencySelector?.enabled !== false && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Default Currency</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={content.currencySelector?.defaultCurrency || 'INR (₹)'}
                        onChange={(e) => updateContent({ currencySelector: { ...content.currencySelector, defaultCurrency: e.target.value } })}
                        style={{ fontSize: '11px' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Format</span>
                      <select
                        className={styles.inputField}
                        value={content.currencySelector?.format || 'symbol_code'}
                        onChange={(e) => updateContent({ currencySelector: { ...content.currencySelector, format: e.target.value as any } })}
                        style={{ fontSize: '11px', padding: '4px' }}
                      >
                        <option value="symbol_code">Code + Symbol (INR ₹)</option>
                        <option value="code_only">Code Only (INR)</option>
                        <option value="symbol_only">Symbol Only (₹)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* LOOK: SOCIAL + PROMOTION */}
          {look === 'social_promo' && (
            <>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  SOCIAL MEDIA CHANNELS
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(content.socialLinks || []).map((soc, idx) => (
                    <div
                      key={soc.platform}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={soc.enabled !== false}
                        onChange={(e) => {
                          const next = [...(content.socialLinks || [])];
                          next[idx] = { ...next[idx], enabled: e.target.checked };
                          updateContent({ socialLinks: next });
                        }}
                        style={{ accentColor: '#2563eb' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '90px' }}>
                        {renderUtilityIconByName(soc.platform, 13)}
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{soc.platform}</span>
                      </div>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={soc.url}
                        onChange={(e) => {
                          const next = [...(content.socialLinks || [])];
                          next[idx] = { ...next[idx], url: e.target.value };
                          updateContent({ socialLinks: next });
                        }}
                        placeholder="https://..."
                        style={{ fontSize: '11px', flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  PROMOTION CALLOUT
                </span>
                <input
                  type="text"
                  className={styles.inputField}
                  value={content.promotion?.text || ''}
                  onChange={(e) => updateContent({ promotion: { ...content.promotion, text: e.target.value } })}
                  placeholder="e.g. Follow Us &amp; Get 10% OFF"
                  style={{ marginBottom: '8px' }}
                />
              </div>
            </>
          )}

          {/* LOOK: MULTI-MESSAGE SLIDER */}
          {look === 'slider' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>ROTATING SLIDES</span>
                <button
                  type="button"
                  onClick={() => {
                    const newSlide: UtilityItem = {
                      id: `slide-${Date.now()}`,
                      enabled: true,
                      label: 'Free Worldwide Shipping',
                      value: '',
                      link: '/shipping',
                      icon: { source: 'library', iconName: 'Truck', size: 13, position: 'left' },
                    };
                    updateContent({ slides: [...(content.slides || []), newSlide] });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid #bfdbfe',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={12} /> Add Slide
                </button>
              </div>

              <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGenericItemDragEnd('slides', e)}>
                <SortableContext items={(content.slides || []).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  {(content.slides || []).map((slide, idx) => (
                    <SortableUtilityItemRow
                      key={slide.id}
                      item={slide}
                      onUpdate={(patch) => {
                        const next = [...(content.slides || [])];
                        next[idx] = { ...next[idx], ...patch };
                        updateContent({ slides: next });
                      }}
                      onDuplicate={() => {
                        const dup: UtilityItem = { ...slide, id: `slide-${Date.now()}` };
                        const next = [...(content.slides || [])];
                        next.splice(idx + 1, 0, dup);
                        updateContent({ slides: next });
                      }}
                      onDelete={() => {
                        const next = (content.slides || []).filter((_, i) => i !== idx);
                        updateContent({ slides: next });
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* LOOK: COUNTDOWN PROMOTION */}
          {look === 'countdown' && (
            <>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  HEADLINE NOTICE
                </span>
                <input
                  type="text"
                  className={styles.inputField}
                  value={content.countdown?.label || '⚡ Flash Sale — 50% OFF'}
                  onChange={(e) => updateContent({ countdown: { ...content.countdown, label: e.target.value } })}
                  placeholder="⚡ Flash Sale — 50% OFF"
                  style={{ marginBottom: '8px' }}
                />
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  TARGET END DATE &amp; TIME
                </span>
                <input
                  type="datetime-local"
                  className={styles.inputField}
                  value={content.countdown?.endDate ? `${content.countdown.endDate}T${content.countdown.endTime || '23:59'}` : '2026-12-31T23:59'}
                  onChange={(e) => {
                    const [d, t] = e.target.value.split('T');
                    updateContent({ countdown: { ...content.countdown, endDate: d, endTime: t || '23:59' } });
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  DISPLAY FORMAT
                </span>
                <select
                  className={styles.inputField}
                  value={content.countdown?.format || 'dhms'}
                  onChange={(e) => updateContent({ countdown: { ...content.countdown, format: e.target.value as any } })}
                >
                  <option value="dhms">Days : Hours : Mins : Secs (02 : 14 : 36 : 10)</option>
                  <option value="hms">Hours : Mins : Secs (14 : 36 : 10)</option>
                  <option value="compact">Compact (2d 14h 36m)</option>
                  <option value="boxes">High-Impact Card Tiles</option>
                </select>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  ⏳ Expiration behavior (e.g. auto-hide or replacement text) can be configured under the <strong>Behavior</strong> tab.
                </span>
              </div>
            </>
          )}

          {/* LOOK: MARQUEE UTILITY */}
          {look === 'marquee' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>TICKER MESSAGES</span>
                <button
                  type="button"
                  onClick={() => {
                    const newMsg: UtilityItem = {
                      id: `msg-${Date.now()}`,
                      enabled: true,
                      label: 'Free Worldwide Express Shipping on Orders Over $75',
                      separator: true,
                      icon: { source: 'library', iconName: 'Sparkles', size: 13, position: 'left' },
                    };
                    updateContent({ marqueeMessages: [...(content.marqueeMessages || []), newMsg] });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid #bfdbfe',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={12} /> Add Message
                </button>
              </div>

              <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGenericItemDragEnd('marqueeMessages', e)}>
                <SortableContext items={(content.marqueeMessages || []).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  {(content.marqueeMessages || []).map((msg, idx) => (
                    <SortableUtilityItemRow
                      key={msg.id}
                      item={msg}
                      onUpdate={(patch) => {
                        const next = [...(content.marqueeMessages || [])];
                        next[idx] = { ...next[idx], ...patch };
                        updateContent({ marqueeMessages: next });
                      }}
                      onDuplicate={() => {
                        const dup: UtilityItem = { ...msg, id: `msg-${Date.now()}` };
                        const next = [...(content.marqueeMessages || [])];
                        next.splice(idx + 1, 0, dup);
                        updateContent({ marqueeMessages: next });
                      }}
                      onDelete={() => {
                        const next = (content.marqueeMessages || []).filter((_, i) => i !== idx);
                        updateContent({ marqueeMessages: next });
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* LOOK: TWO-TIER UTILITY */}
          {look === 'two_tier' && (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    TOP TIER ITEMS (CONTACT &amp; SERVICE)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentTop = content.topTierItems || content.topRowItems || [];
                      const newItem: UtilityItem = {
                        id: `item-${Date.now()}`,
                        enabled: true,
                        label: 'Support Link',
                        value: '',
                        link: '/support',
                        separator: true,
                        icon: { source: 'library', iconName: 'HelpCircle', size: 12, position: 'left' },
                      };
                      const next = [...currentTop, newItem];
                      updateContent({ topTierItems: next, topRowItems: next });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: '1px solid #bfdbfe',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGenericItemDragEnd('topTierItems', e)}>
                  <SortableContext items={(content.topTierItems || content.topRowItems || []).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {(content.topTierItems || content.topRowItems || []).map((item, idx) => (
                      <SortableUtilityItemRow
                        key={item.id}
                        item={item}
                        onUpdate={(patch) => {
                          const currentTop = [...(content.topTierItems || content.topRowItems || [])];
                          currentTop[idx] = { ...currentTop[idx], ...patch };
                          updateContent({ topTierItems: currentTop, topRowItems: currentTop });
                        }}
                        onDuplicate={() => {
                          const currentTop = [...(content.topTierItems || content.topRowItems || [])];
                          const dup: UtilityItem = { ...item, id: `item-${Date.now()}` };
                          currentTop.splice(idx + 1, 0, dup);
                          updateContent({ topTierItems: currentTop, topRowItems: currentTop });
                        }}
                        onDelete={() => {
                          const currentTop = (content.topTierItems || content.topRowItems || []).filter((_, i) => i !== idx);
                          updateContent({ topTierItems: currentTop, topRowItems: currentTop });
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    BOTTOM TIER ITEMS (PROMO &amp; SHIPPING)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentBottom = content.bottomTierItems || content.bottomRowItems || [];
                      const newItem: UtilityItem = {
                        id: `item-${Date.now()}`,
                        enabled: true,
                        label: '✨ Special Offer: Free Shipping',
                        value: '',
                        link: '/shipping',
                        separator: true,
                        icon: { source: 'library', iconName: 'Truck', size: 12, position: 'left' },
                      };
                      const next = [...currentBottom, newItem];
                      updateContent({ bottomTierItems: next, bottomRowItems: next });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: '1px solid #bfdbfe',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGenericItemDragEnd('bottomTierItems', e)}>
                  <SortableContext items={(content.bottomTierItems || content.bottomRowItems || []).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {(content.bottomTierItems || content.bottomRowItems || []).map((item, idx) => (
                      <SortableUtilityItemRow
                        key={item.id}
                        item={item}
                        onUpdate={(patch) => {
                          const currentBottom = [...(content.bottomTierItems || content.bottomRowItems || [])];
                          currentBottom[idx] = { ...currentBottom[idx], ...patch };
                          updateContent({ bottomTierItems: currentBottom, bottomRowItems: currentBottom });
                        }}
                        onDuplicate={() => {
                          const currentBottom = [...(content.bottomTierItems || content.bottomRowItems || [])];
                          const dup: UtilityItem = { ...item, id: `item-${Date.now()}` };
                          currentBottom.splice(idx + 1, 0, dup);
                          updateContent({ bottomTierItems: currentBottom, bottomRowItems: currentBottom });
                        }}
                        onDelete={() => {
                          const currentBottom = (content.bottomTierItems || content.bottomRowItems || []).filter((_, i) => i !== idx);
                          updateContent({ bottomTierItems: currentBottom, bottomRowItems: currentBottom });
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </>
          )}

          {/* LOOK: APP DOWNLOAD */}
          {look === 'app_download' && (
            <>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  APP HEADLINE
                </span>
                <input
                  type="text"
                  className={styles.inputField}
                  value={content.appDownload?.headline || 'Download our app for exclusive VIP offers'}
                  onChange={(e) => updateContent({ appDownload: { ...content.appDownload, headline: e.target.value } })}
                  placeholder="Download our app for exclusive VIP offers"
                  style={{ marginBottom: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>iOS App Store URL</span>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={content.appDownload?.iosUrl || ''}
                    onChange={(e) => updateContent({ appDownload: { ...content.appDownload, iosUrl: e.target.value } })}
                    placeholder="https://apps.apple.com/..."
                    style={{ fontSize: '11px' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Android Play Store URL</span>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={content.appDownload?.androidUrl || ''}
                    onChange={(e) => updateContent({ appDownload: { ...content.appDownload, androidUrl: e.target.value } })}
                    placeholder="https://play.google.com/..."
                    style={{ fontSize: '11px' }}
                  />
                </div>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Display QR Code Badge</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Allow shoppers to scan and install quickly</span>
                </div>
                <input
                  type="checkbox"
                  checked={content.appDownload?.showQrCode !== false}
                  onChange={(e) => updateContent({ appDownload: { ...content.appDownload, showQrCode: e.target.checked } })}
                  style={{ accentColor: '#2563eb' }}
                />
              </div>
            </>
          )}

          {/* LOOK: MINIMAL */}
          {look === 'minimal' && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                MINIMAL SINGLE MESSAGE
              </span>
              <input
                type="text"
                className={styles.inputField}
                value={content.minimalText || 'Free shipping on orders over ₹999'}
                onChange={(e) => updateContent({ minimalText: e.target.value })}
                placeholder="Free shipping on orders over ₹999"
                style={{ marginBottom: '8px' }}
              />
              <UtilityIconPicker
                label="Optional Icon"
                value={content.promotion?.icon}
                onChange={(icon) => updateContent({ promotion: { ...content.promotion, icon } })}
              />
            </div>
          )}

          {/* LOOK: CUSTOM / FLEXIBLE */}
          {look === 'custom' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>CUSTOM ITEMS</span>
                <button
                  type="button"
                  onClick={() => {
                    const newItem: UtilityItem = {
                      id: `item-${Date.now()}`,
                      enabled: true,
                      label: 'Custom Item',
                      value: '',
                      link: '/',
                      separator: true,
                      icon: { source: 'library', iconName: 'Sparkles', size: 13, position: 'left' },
                    };
                    updateContent({ items: [...(content.items || []), newItem] });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid #bfdbfe',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>

              <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGenericItemDragEnd('items', e)}>
                <SortableContext items={(content.items || []).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  {(content.items || []).map((item, idx) => (
                    <SortableUtilityItemRow
                      key={item.id}
                      item={item}
                      onUpdate={(patch) => {
                        const next = [...(content.items || [])];
                        next[idx] = { ...next[idx], ...patch };
                        updateContent({ items: next });
                      }}
                      onDuplicate={() => {
                        const dup: UtilityItem = { ...item, id: `item-${Date.now()}` };
                        const next = [...(content.items || [])];
                        next.splice(idx + 1, 0, dup);
                        updateContent({ items: next });
                      }}
                      onDelete={() => {
                        const next = (content.items || []).filter((_, i) => i !== idx);
                        updateContent({ items: next });
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: LAYOUT ─── */}
      {activeTab === 'layout' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Layout Structure</span>
            <button
              type="button"
              onClick={handleResetLayout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={11} /> Reset Layout
            </button>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Alignment
            </span>
            <select
              className={styles.inputField}
              value={layout.alignment || 'space-between'}
              onChange={(e) => updateLayout({ alignment: e.target.value as any })}
            >
              <option value="space-between">Space Between</option>
              <option value="center">Centered</option>
              <option value="left">Left Aligned</option>
              <option value="right">Right Aligned</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          {/* Item Spacing */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
              <span>Item Spacing</span>
              <span>{layout.itemGap || 14}px</span>
            </div>
            <input
              type="range"
              min={6}
              max={32}
              value={layout.itemGap || 14}
              onChange={(e) => updateLayout({ itemGap: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
          </div>

          {/* Dimensions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                <span>Bar Height</span>
                <span>{layout.barHeight || 34}px</span>
              </div>
              <input
                type="range"
                min={26}
                max={56}
                value={layout.barHeight || 34}
                onChange={(e) => updateLayout({ barHeight: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>Container Width</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => updateLayout({ contentMaxWidth: 'full' })}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: layout.contentMaxWidth === 'full' ? 600 : 500,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: layout.contentMaxWidth === 'full' ? '#2563eb' : '#e2e8f0',
                    color: layout.contentMaxWidth === 'full' ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Full Width
                </button>
                <button
                  type="button"
                  onClick={() => updateLayout({ contentMaxWidth: 'contained' })}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: layout.contentMaxWidth !== 'full' ? 600 : 500,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: layout.contentMaxWidth !== 'full' ? '#2563eb' : '#e2e8f0',
                    color: layout.contentMaxWidth !== 'full' ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Contained
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: BEHAVIOR ─── */}
      {activeTab === 'behavior' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Interactive Behavior</span>
            <button
              type="button"
              onClick={handleResetBehavior}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={11} /> Reset Behavior
            </button>
          </div>

          {/* Sticky Setting (strictly isolated to utility bar) */}
          <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
              Sticky Position
            </span>
            <select
              className={styles.inputField}
              value={behavior.stickyPosition || 'none'}
              onChange={(e) => updateBehavior({ stickyPosition: e.target.value as any })}
            >
              <option value="none">None (Scrolls with page)</option>
              <option value="top">Top (Always pinned to top)</option>
              <option value="header_relative">Header-Relative</option>
            </select>
            <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#64748b' }}>
              Note: This sticky setting only applies to the Utility Bar itself and does not force the rest of the header to be sticky.
            </p>
          </div>

          {/* Dismiss Controls */}
          <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Enable Close / Dismiss</span>
              <input
                type="checkbox"
                checked={Boolean(behavior.dismissible)}
                onChange={(e) => updateBehavior({ dismissible: e.target.checked })}
                style={{ accentColor: '#2563eb' }}
              />
            </div>

            {behavior.dismissible && (
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Show Again After</span>
                <select
                  className={styles.inputField}
                  value={behavior.dismissDuration || 'session'}
                  onChange={(e) => updateBehavior({ dismissDuration: e.target.value as any })}
                  style={{ fontSize: '11px' }}
                >
                  <option value="session">Browser Session</option>
                  <option value="1_day">1 Day</option>
                  <option value="7_days">7 Days</option>
                  <option value="30_days">30 Days</option>
                  <option value="never">Never Show Again</option>
                </select>
              </div>
            )}
          </div>

          {/* Slider Behavior */}
          {look === 'slider' && (
            <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Slider Settings</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#334155' }}>Autoplay</span>
                <input
                  type="checkbox"
                  checked={behavior.sliderAutoplay !== false}
                  onChange={(e) => updateBehavior({ sliderAutoplay: e.target.checked })}
                  style={{ accentColor: '#2563eb' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  <span>Interval</span>
                  <span>{behavior.sliderInterval || 4}s</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={behavior.sliderInterval || 4}
                  onChange={(e) => updateBehavior({ sliderInterval: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={behavior.sliderArrows !== false}
                    onChange={(e) => updateBehavior({ sliderArrows: e.target.checked })}
                    style={{ accentColor: '#2563eb' }}
                  />
                  Show Arrows
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(behavior.sliderDots)}
                    onChange={(e) => updateBehavior({ sliderDots: e.target.checked })}
                    style={{ accentColor: '#2563eb' }}
                  />
                  Show Dots
                </label>
              </div>
            </div>
          )}

          {/* Marquee Behavior */}
          {look === 'marquee' && (
            <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Ticker Speed &amp; Direction</span>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  <span>Duration (Loop Speed)</span>
                  <span>{behavior.marqueeSpeed || 25}s</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={behavior.marqueeSpeed || 25}
                  onChange={(e) => updateBehavior({ marqueeSpeed: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={behavior.marqueePauseOnHover !== false}
                  onChange={(e) => updateBehavior({ marqueePauseOnHover: e.target.checked })}
                  style={{ accentColor: '#2563eb' }}
                />
                Pause on hover
              </label>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 5: DESIGN ─── */}
      {activeTab === 'design' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Design &amp; Styling</span>
            <button
              type="button"
              onClick={handleResetDesign}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={11} /> Reset Design
            </button>
          </div>

          {/* Accordion 1: Semantic Color Architecture */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: designSections.colors ? '12px' : 0 }}
              onClick={() => toggleDesignSection('colors')}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: '#1e293b' }}>INDEPENDENT SEMANTIC COLORS</span>
              {designSections.colors ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>

            {designSections.colors && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 1. Background */}
                <DynamicColorOptionRow
                  label="Utility Background"
                  allowedModes={['inherit', 'color', 'gradient', 'image']}
                  currentMode={
                    design.bgGradient
                      ? 'gradient'
                      : design.bgImage?.url
                        ? 'image'
                        : design.bgColorMode === 'custom'
                          ? 'color'
                          : 'inherit'
                  }
                  onModeChange={(m) => {
                    if (m === 'inherit') {
                      updateDesign({ bgColorMode: 'inherit', bgColor: semanticColors.bg, bgGradient: undefined, bgImage: undefined });
                    } else if (m === 'color') {
                      updateDesign({ bgColorMode: 'custom', bgColor: design.bgColor || semanticColors.bg, bgGradient: undefined, bgImage: undefined });
                    } else if (m === 'gradient') {
                      updateDesign({
                        bgColorMode: 'gradient',
                        bgGradient: design.bgGradient || { type: 'linear', angle: 90, from: '#0f172a', to: '#1e293b' },
                        bgImage: undefined,
                      });
                    } else if (m === 'image') {
                      updateDesign({
                        bgColorMode: 'image',
                        bgImage: design.bgImage || { url: '', opacity: 0.8 },
                        bgGradient: undefined,
                      });
                    }
                  }}
                  inheritedColor={semanticColors.bg}
                  inheritedTokenName="Theme Surface / Background"
                  customColor={design.bgColor}
                  onColorChange={(hex) => updateDesign({ bgColorMode: 'custom', bgColor: hex })}
                  gradient={design.bgGradient}
                  onGradientChange={(grad) => updateDesign({ bgColorMode: 'gradient', bgGradient: grad })}
                  image={design.bgImage}
                  onImageChange={(img) => updateDesign({ bgColorMode: 'image', bgImage: img })}
                />

                {/* 2. Primary Text */}
                <DynamicColorOptionRow
                  label="Primary Text"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.textColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ textColorMode: m === 'inherit' ? 'inherit' : 'custom', textColor: m === 'inherit' ? semanticColors.text : design.textColor })}
                  inheritedColor={semanticColors.text}
                  inheritedTokenName="Text Primary"
                  customColor={design.textColor}
                  onColorChange={(hex) => updateDesign({ textColorMode: 'custom', textColor: hex })}
                />

                {/* 3. Secondary / Muted Text */}
                <DynamicColorOptionRow
                  label="Secondary / Muted Text"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.mutedTextColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ mutedTextColorMode: m === 'inherit' ? 'inherit' : 'custom', mutedTextColor: m === 'inherit' ? semanticColors.mutedText : design.mutedTextColor })}
                  inheritedColor={semanticColors.mutedText}
                  inheritedTokenName="Text Secondary"
                  customColor={design.mutedTextColor}
                  onColorChange={(hex) => updateDesign({ mutedTextColorMode: 'custom', mutedTextColor: hex })}
                />

                {/* 4. Brand Accent */}
                <DynamicColorOptionRow
                  label="Brand Accent"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.accentColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ accentColorMode: m === 'inherit' ? 'inherit' : 'custom', accentColor: m === 'inherit' ? semanticColors.accent : design.accentColor })}
                  inheritedColor={semanticColors.accent}
                  inheritedTokenName="Brand Accent"
                  customColor={design.accentColor}
                  onColorChange={(hex) => updateDesign({ accentColorMode: 'custom', accentColor: hex })}
                />

                {/* 5. Links */}
                <DynamicColorOptionRow
                  label="Links"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.linkColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ linkColorMode: m === 'inherit' ? 'inherit' : 'custom', linkColor: m === 'inherit' ? semanticColors.link : design.linkColor })}
                  inheritedColor={semanticColors.link}
                  inheritedTokenName="Brand Link"
                  customColor={design.linkColor}
                  onColorChange={(hex) => updateDesign({ linkColorMode: 'custom', linkColor: hex })}
                />

                {/* 6. Icons */}
                <DynamicColorOptionRow
                  label="Icons"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.iconColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ iconColorMode: m === 'inherit' ? 'inherit' : 'custom', iconColor: m === 'inherit' ? semanticColors.icon : design.iconColor })}
                  inheritedColor={semanticColors.icon}
                  inheritedTokenName="Theme Icon"
                  customColor={design.iconColor}
                  onColorChange={(hex) => updateDesign({ iconColorMode: 'custom', iconColor: hex })}
                />

                {/* 7. Dividers & Separators */}
                <DynamicColorOptionRow
                  label="Dividers / Separators"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.dividerColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ dividerColorMode: m === 'inherit' ? 'inherit' : 'custom', dividerColor: m === 'inherit' ? semanticColors.divider : design.dividerColor })}
                  inheritedColor={semanticColors.divider}
                  inheritedTokenName="Divider / Border Subtle"
                  customColor={design.dividerColor}
                  onColorChange={(hex) => updateDesign({ dividerColorMode: 'custom', dividerColor: hex })}
                />

                {/* 8. Button Background */}
                <DynamicColorOptionRow
                  label="CTA Button Background"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.buttonBgColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ buttonBgColorMode: m === 'inherit' ? 'inherit' : 'custom', buttonBgColor: m === 'inherit' ? semanticColors.buttonBg : design.buttonBgColor })}
                  inheritedColor={semanticColors.buttonBg}
                  inheritedTokenName="Brand Primary Button"
                  customColor={design.buttonBgColor}
                  onColorChange={(hex) => updateDesign({ buttonBgColorMode: 'custom', buttonBgColor: hex })}
                />

                {/* 9. Button Text */}
                <DynamicColorOptionRow
                  label="CTA Button Text"
                  allowedModes={['inherit', 'color']}
                  currentMode={design.buttonTextColorMode === 'custom' ? 'color' : 'inherit'}
                  onModeChange={(m) => updateDesign({ buttonTextColorMode: m === 'inherit' ? 'inherit' : 'custom', buttonTextColor: m === 'inherit' ? semanticColors.buttonText : design.buttonTextColor })}
                  inheritedColor={semanticColors.buttonText}
                  inheritedTokenName="Inverse Text"
                  customColor={design.buttonTextColor}
                  onColorChange={(hex) => updateDesign({ buttonTextColorMode: 'custom', buttonTextColor: hex })}
                />
              </div>
            )}
          </div>

          {/* Accordion 2: Typography */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: designSections.typography ? '12px' : 0 }}
              onClick={() => toggleDesignSection('typography')}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: '#1e293b' }}>TYPOGRAPHY</span>
              {designSections.typography ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>

            {designSections.typography && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Font Family</span>
                  <select
                    className={styles.inputField}
                    value={design.fontFamily || 'Inter, system-ui, sans-serif'}
                    onChange={(e) => updateDesign({ fontFamily: e.target.value })}
                  >
                    <option value="Inter, system-ui, sans-serif">Inter (Modern Clean)</option>
                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                    <option value="'Outfit', sans-serif">Outfit (Geometric)</option>
                    <option value="'Playfair Display', serif">Playfair Display (Luxury)</option>
                    <option value="'Cinzel', serif">Cinzel (Jewelry)</option>
                    <option value="inherit">Inherit Global Theme</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <span>Size</span>
                      <span>{design.fontSize || 11}px</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={15}
                      value={design.fontSize || 11}
                      onChange={(e) => updateDesign({ fontSize: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Weight</span>
                    <select
                      className={styles.inputField}
                      value={design.fontWeight || '500'}
                      onChange={(e) => updateDesign({ fontWeight: e.target.value as any })}
                      style={{ fontSize: '11px', padding: '3px 6px' }}
                    >
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semibold (600)</option>
                      <option value="700">Bold (700)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Borders & Dividers */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: designSections.borders ? '12px' : 0 }}
              onClick={() => toggleDesignSection('borders')}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: '#1e293b' }}>BORDERS &amp; DIVIDERS</span>
              {designSections.borders ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>

            {designSections.borders && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Border Position</span>
                    <select
                      className={styles.inputField}
                      value={design.borderPosition || 'bottom'}
                      onChange={(e) => updateDesign({ borderPosition: e.target.value as any })}
                      style={{ fontSize: '11px', padding: '4px' }}
                    >
                      <option value="bottom">Bottom Line</option>
                      <option value="top">Top Line</option>
                      <option value="both">Top &amp; Bottom</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Separator Style</span>
                    <select
                      className={styles.inputField}
                      value={design.separatorType || 'line'}
                      onChange={(e) => updateDesign({ separatorType: e.target.value as any })}
                      style={{ fontSize: '11px', padding: '4px' }}
                    >
                      <option value="line">Vertical Bar ( | )</option>
                      <option value="dot">Dot ( • )</option>
                      <option value="slash">Slash ( / )</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 6: RESPONSIVE ─── */}
      {activeTab === 'responsive' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Mobile &amp; Responsive</span>
            <button
              type="button"
              onClick={handleResetResponsive}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={11} /> Reset Responsive
            </button>
          </div>

          <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Show on Mobile Devices</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Disable if header is crowded on phones</span>
            </div>
            <input
              type="checkbox"
              checked={responsive.showOnMobile !== false}
              onChange={(e) => updateResponsive({ showOnMobile: e.target.checked })}
              style={{ accentColor: '#2563eb' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
              <span>Mobile Font Size</span>
              <span>{responsive.mobileFontSize || 10}px</span>
            </div>
            <input
              type="range"
              min={9}
              max={13}
              value={responsive.mobileFontSize || 10}
              onChange={(e) => updateResponsive({ mobileFontSize: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(responsive.hideMobileIcons)}
              onChange={(e) => updateResponsive({ hideMobileIcons: e.target.checked })}
              style={{ accentColor: '#2563eb' }}
            />
            Hide icons on mobile view
          </label>
        </div>
      )}

      {/* ─── TAB 7: VISIBILITY ─── */}
      {activeTab === 'visibility' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Visibility &amp; Targeting</span>
            <button
              type="button"
              onClick={handleResetVisibility}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={11} /> Reset Visibility
            </button>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Page Visibility
            </span>
            <select
              className={styles.inputField}
              value={visibility.displayOnPages || 'all'}
              onChange={(e) => updateVisibility({ displayOnPages: e.target.value as any })}
            >
              <option value="all">All Storefront Pages</option>
              <option value="homepage">Homepage Only</option>
              <option value="product">Product Pages Only</option>
              <option value="collection">Collection / Shop Pages</option>
              <option value="cart">Cart Page</option>
              <option value="checkout">Checkout Page</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Target Devices
            </span>
            <select
              className={styles.inputField}
              value={visibility.device || 'all'}
              onChange={(e) => updateVisibility({ device: e.target.value as any })}
            >
              <option value="all">All Devices (Desktop, Tablet, Mobile)</option>
              <option value="desktop">Desktop Only</option>
              <option value="mobile">Mobile Devices Only</option>
              <option value="tablet">Tablet Only</option>
            </select>
          </div>

          {/* Scheduling */}
          <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Campaign Date Scheduling</span>
              <input
                type="checkbox"
                checked={Boolean(visibility.schedulingEnabled)}
                onChange={(e) => updateVisibility({ schedulingEnabled: e.target.checked })}
                style={{ accentColor: '#2563eb' }}
              />
            </div>

            {visibility.schedulingEnabled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Start</span>
                  <input
                    type="datetime-local"
                    className={styles.inputField}
                    value={visibility.startDate ? `${visibility.startDate}T${visibility.startTime || '00:00'}` : ''}
                    onChange={(e) => {
                      const [d, t] = e.target.value.split('T');
                      updateVisibility({ startDate: d, startTime: t });
                    }}
                    style={{ fontSize: '10px' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>End</span>
                  <input
                    type="datetime-local"
                    className={styles.inputField}
                    value={visibility.endDate ? `${visibility.endDate}T${visibility.endTime || '23:59'}` : ''}
                    onChange={(e) => {
                      const [d, t] = e.target.value.split('T');
                      updateVisibility({ endDate: d, endTime: t });
                    }}
                    style={{ fontSize: '10px' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 8: ADVANCED ─── */}
      {activeTab === 'advanced' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Advanced Controls</span>
            <button
              type="button"
              onClick={handleResetAdvanced}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={11} /> Reset Advanced
            </button>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Custom CSS
            </span>
            <textarea
              rows={3}
              className={styles.textareaField}
              value={advanced.customCss || ''}
              onChange={(e) => updateAdvanced({ customCss: e.target.value })}
              placeholder=".utility-bar { letter-spacing: 0.5px; }"
              style={{ fontFamily: 'monospace', fontSize: '11px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>HTML ID</span>
              <input
                type="text"
                className={styles.inputField}
                value={advanced.htmlId || ''}
                onChange={(e) => updateAdvanced({ htmlId: e.target.value })}
                placeholder="store-utility-bar"
                style={{ fontSize: '11px' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>CSS Class</span>
              <input
                type="text"
                className={styles.inputField}
                value={advanced.cssClass || ''}
                onChange={(e) => updateAdvanced({ cssClass: e.target.value })}
                placeholder="custom-utility-strip"
                style={{ fontSize: '11px' }}
              />
            </div>
          </div>


          {/* Full Reset Button */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={handleResetFull}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={13} /> Reset Utility Bar to Default
            </button>
          </div>
        </div>
      )}
      {(utilityRow?.isVisible === false || utilitySection?.isHidden) && (
        <div style={{ margin: '16px', padding: '12px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ffeeba' }}>
          <EyeOff size={16} style={{ flexShrink: 0 }} />
          <span>This section is currently hidden.</span>
        </div>
      )}
    </>
  );
};

// Color control with inherit/custom toggle
const ColorControl: React.FC<{
  label: string;
  mode: string;
  color: string;
  inheritedColor: string;
  onModeChange: (m: 'inherit' | 'custom') => void;
  onColorChange: (c: string) => void;
}> = ({ label, mode, color, inheritedColor, onModeChange, onColorChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'block' }}>{label}</span>
      <div style={{ display: 'flex', gap: '2px', backgroundColor: '#f1f5f9', borderRadius: '4px', padding: '2px' }}>
        <button type="button" onClick={() => onModeChange('inherit')} style={{
          padding: '2px 6px', fontSize: '10px', fontWeight: mode === 'inherit' ? 600 : 400,
          borderRadius: '3px', border: 'none', cursor: 'pointer',
          backgroundColor: mode === 'inherit' ? '#fff' : 'transparent', color: mode === 'inherit' ? '#2563eb' : '#64748b',
          boxShadow: mode === 'inherit' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
        }}>Palette</button>
        <button type="button" onClick={() => onModeChange('custom')} style={{
          padding: '2px 6px', fontSize: '10px', fontWeight: mode === 'custom' ? 600 : 400,
          borderRadius: '3px', border: 'none', cursor: 'pointer',
          backgroundColor: mode === 'custom' ? '#fff' : 'transparent', color: mode === 'custom' ? '#2563eb' : '#64748b',
          boxShadow: mode === 'custom' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
        }}>Custom</button>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
      <ColorPickerPopover value={mode === 'custom' ? color : inheritedColor} onChange={onColorChange} size="md" />
      <input type="text" value={mode === 'custom' ? color : inheritedColor} onChange={(e) => { onModeChange('custom'); onColorChange(e.target.value); }}
        style={{ flex: 1, fontSize: '12px', padding: '3px 6px', border: '1px solid #e2e8f0', borderRadius: '4px', fontFamily: 'monospace' }} />
      {mode === 'inherit' && <span style={{ fontSize: '9px', color: '#2563eb', fontWeight: 600 }}>PALETTE</span>}
    </div>
  </div>
);

// ─── Full Secondary Navigation Right Sidebar Editor ─────────
export const SecondaryNavRightEditor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const editorStore = useEditorContextStore();
  const headerRows = editorStore.headerRows || [];
  const secNavRow = headerRows.find(
    (r) => r.type === 'secondary-nav' || r.id === 'row-secondary-nav' || r.id.includes('secondary') || r.id.includes('category')
  );
  const siteStore = useSiteStore();
  const themePalette = siteStore.theme?.palette || (siteStore.theme as any)?.colors || getDefaultTheme().palette;

  const semanticColors = getInheritedSecondaryNavColors(themePalette);

  const landingPage = siteStore.pages.find((p) => p.id === 'landing-page') || siteStore.pages[0];
  const categorySection = landingPage?.sections.find(
    (s) => s.type === 'CategoryBar' || s.id === 'category-bar' || s.id.includes('category')
  );

  const [activeTab, setActiveTab] = useState<SecondaryNavTabId>('look');
  const [showAddItemWidget, setShowAddItemWidget] = useState<boolean>(false);

  // Design accordion state
  const [designSections, setDesignSections] = useState({
    colors: true,
    typography: false,
    indicator: false,
    borders: false,
    dropdown: false,
  });
  const toggleDesignSection = (key: keyof typeof designSections) => {
    setDesignSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Resolve current data
  const navData: SecondaryNavData = useMemo(() => {
    return resolveSecondaryNavData(secNavRow, categorySection?.props, themePalette);
  }, [secNavRow, categorySection?.props, themePalette]);

  const { look, content, layout, behavior, design, responsive, visibility, advanced } = navData;

  const currentLookMeta = SECONDARY_NAV_LOOKS.find((l) => l.id === look) || SECONDARY_NAV_LOOKS[0];

  // Dynamic tab strip
  const availableTabs: { id: SecondaryNavTabId; label: string }[] = useMemo(() => {
    const ALL_ORDER: { id: SecondaryNavTabId; label: string }[] = [
      { id: 'look', label: 'Look' },
      { id: 'content', label: 'Content' },
      { id: 'layout', label: 'Layout' },
      { id: 'behavior', label: 'Behavior' },
      { id: 'design', label: 'Design' },
      { id: 'responsive', label: 'Responsive' },
      { id: 'visibility', label: 'Visibility' },
      { id: 'advanced', label: 'Advanced' },
    ];
    return ALL_ORDER.filter((tab) => {
      if (tab.id === 'look' || tab.id === 'content') return true;
      return currentLookMeta.supportedTabs.includes(tab.id);
    });
  }, [currentLookMeta]);

  const tabsRef = useRef<HTMLDivElement>(null);

  const handlePrevTab = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const handleNextTab = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  // Central update dispatcher
  const updateNavData = (nextData: SecondaryNavData) => {
    const store = useEditorContextStore.getState();
    const rows = store.headerRows || [];
    const targetRow = rows.find(
      (r) => r.type === 'secondary-nav' || r.id === 'row-secondary-nav' || r.id.includes('secondary') || r.id.includes('category')
    );

    if (targetRow) {
      const el = targetRow.elements?.[0];
      const elId = el?.id || 'el-secondary-nav-content';

      store.updateHeaderRow(targetRow.id, {
        layout: {
          ...targetRow.layout,
          variantId: nextData.look,
          height: nextData.layout.barHeight,
          paddingY: nextData.layout.paddingY,
          paddingX: nextData.layout.paddingX,
        },
        styling: {
          ...targetRow.styling,
          bgColor: nextData.design.bgColor,
          textColor: nextData.design.textColor,
          borderColor: nextData.design.borderColor || '#e2e8f0',
          bgColorMode: (nextData.design.bgColorMode === 'custom' ? 'color' : 'inherit') as any,
          textColorMode: nextData.design.textColorMode === 'custom' ? 'color' : 'inherit',
          borderColorMode: nextData.design.borderColorMode === 'custom' ? 'color' : 'inherit',
          fontSize: nextData.design.fontSize,
          fontWeight: Number(nextData.design.fontWeight) || 500,
          borderBottom: nextData.design.borderPosition !== 'none',
        },
      });

      if (el) {
        store.updateHeaderElement(targetRow.id, elId, {
          props: {
            ...el?.props,
            secondaryNav: nextData,
            look: nextData.look,
            variant: nextData.look,
            height: nextData.layout.barHeight,
          },
        });
      }

      // Keep target explicitly selected on secondary navigation
      store.selectTarget({ type: 'row', editorType: 'header', rowId: targetRow.id });
      useLandingEditorStore.getState().setSelectedSectionId('category-bar');
    }

    const currentSiteStore = useSiteStore.getState();
    currentSiteStore.pages.forEach((page) => {
      const sec = page.sections.find(
        (s) => s.type === 'CategoryBar' || s.id === 'category-bar' || s.id.includes('category')
      );
      if (sec) {
        currentSiteStore.updateSectionProps(page.id, sec.id, {
          secondaryNav: nextData,
          look: nextData.look,
          variant: nextData.look,
          height: nextData.layout.barHeight,
        });
      }
    });
  };

  const handleSelectLook = (newLook: SecondaryNavLook) => {
    const nextData = switchSecondaryNavLook(navData, newLook, themePalette);
    updateNavData(nextData);
    const newLookMeta = SECONDARY_NAV_LOOKS.find((l) => l.id === newLook) || SECONDARY_NAV_LOOKS[0];
    if (!newLookMeta.supportedTabs.includes(activeTab)) {
      setActiveTab('content');
    }
  };

  const updateContent = (patch: Partial<typeof content>) => {
    updateNavData({ ...navData, content: { ...navData.content, ...patch } });
  };

  const updateLayout = (patch: Partial<typeof layout>) => {
    updateNavData({ ...navData, layout: { ...navData.layout, ...patch } });
  };

  const updateBehavior = (patch: Partial<typeof behavior>) => {
    updateNavData({ ...navData, behavior: { ...navData.behavior, ...patch } });
  };

  const updateDesign = (patch: Partial<typeof design>) => {
    updateNavData({
      ...navData,
      design: { ...navData.design, ...patch },
      customOverrides: { ...navData.customOverrides, ...patch },
    });
  };

  const updateResponsive = (patch: Partial<typeof responsive>) => {
    updateNavData({ ...navData, responsive: { ...navData.responsive, ...patch } });
  };

  const updateVisibility = (patch: Partial<typeof visibility>) => {
    updateNavData({ ...navData, visibility: { ...navData.visibility, ...patch } });
  };

  const updateAdvanced = (patch: Partial<typeof advanced>) => {
    updateNavData({ ...navData, advanced: { ...navData.advanced, ...patch } });
  };

  // Reset handlers
  const handleResetContent = () => { updateNavData({ ...navData, content: getDefaultSecNavContent(navData.look) }); };
  const handleResetLayout = () => { updateNavData({ ...navData, layout: getDefaultSecNavLayout(navData.look) }); };
  const handleResetBehavior = () => { updateNavData({ ...navData, behavior: getDefaultSecNavBehavior(navData.look) }); };
  const handleResetDesign = () => { updateNavData({ ...navData, design: getDefaultSecNavDesign(themePalette), customOverrides: {} }); };
  const handleResetResponsive = () => { updateNavData({ ...navData, responsive: getDefaultSecNavResponsive() }); };
  const handleResetVisibility = () => { updateNavData({ ...navData, visibility: getDefaultSecNavVisibility() }); };
  const handleResetAdvanced = () => { updateNavData({ ...navData, advanced: getDefaultSecNavAdvanced() }); };
  const handleResetFull = () => {
    const nextData = switchSecondaryNavLook(navData, navData.look, themePalette);
    updateNavData(nextData);
  };

  // DnD Sensors for item reordering
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const currentItems = [...content.items];
    const oldIdx = currentItems.findIndex((it) => it.id === active.id);
    const newIdx = currentItems.findIndex((it) => it.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      const [moved] = currentItems.splice(oldIdx, 1);
      currentItems.splice(newIdx, 0, moved);
      updateContent({ items: currentItems });
    }
  };

  // Shared label/control style helpers
  const sectionLabel = { fontSize: '12px', fontWeight: 700 as const, color: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
  const fieldLabel = { fontSize: '11px', fontWeight: 600 as const, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '4px', display: 'block' as const };
  const resetBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '5px',
    border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
  };

  return (
    <>
      {/* Panel Header */}
      <div className={styles.panelHeader}>
        <div className={styles.phLeft}>
          <button type="button" className={styles.iconBtn} onClick={onClose} title="Collapse sidebar">
            <ChevronRight size={20} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600}>Secondary Navigation</h3>
        </div>
      </div>

      {/* 8 Dynamic Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e2e8f0)', background: '#f8fafc', position: 'relative' }}>
        <button type="button" onClick={handlePrevTab} style={{
          padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted, #64748b)', flexShrink: 0,
        }} title="Scroll tabs left" aria-label="Scroll tabs left">
          <ChevronLeft size={16} />
        </button>
        <div ref={tabsRef} className={styles.propTabs} style={{
          overflowX: 'auto', flexWrap: 'nowrap', borderBottom: 'none', flex: 1, display: 'flex',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {availableTabs.map((tab) => (
            <div key={tab.id} className={`${styles.propTab} ${activeTab === tab.id ? styles.activePropTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ flex: '1 0 auto', padding: '12px 10px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab.id ? 700 : 500, whiteSpace: 'nowrap' }}>
              {tab.label}
            </div>
          ))}
        </div>
        <button type="button" onClick={handleNextTab} style={{
          padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted, #64748b)', flexShrink: 0,
        }} title="Scroll tabs right" aria-label="Scroll tabs right">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── TAB 1: LOOK ─── */}
      {activeTab === 'look' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Secondary Navigation Looks</h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Choose a style. Items, controls, and design adapt dynamically.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SECONDARY_NAV_LOOKS.map((l) => {
              const isSelected = look === l.id;
              return (
                <div key={l.id} onClick={() => handleSelectLook(l.id)} style={{
                  padding: '12px', borderRadius: '8px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#1d4ed8' : '#0f172a' }}>{l.name}</span>
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                        backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9', color: isSelected ? '#1e40af' : '#475569',
                      }}>{l.badge}</span>
                    </div>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: isSelected ? '5px solid #2563eb' : '2px solid #cbd5e1',
                      background: '#fff', boxSizing: 'border-box', flexShrink: 0,
                    }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>{l.description}</p>
                  <div style={{
                    padding: '6px 8px', borderRadius: '5px',
                    backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                    border: '1px solid #e2e8f0', fontSize: '10px',
                    color: isSelected ? '#1e40af' : '#334155', fontFamily: 'monospace', whiteSpace: 'pre-wrap',
                  }}>{l.example}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: CONTENT ─── */}
      {activeTab === 'content' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Current Look</span>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{currentLookMeta.name}</div>
            </div>
            <button type="button" onClick={handleResetContent} style={resetBtnStyle} title="Reset Content to look defaults">
              <RotateCcw size={11} /> Reset Content
            </button>
          </div>

          {/* Enable Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Enable Secondary Navigation</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Show or hide on storefront</span>
            </div>
            <input type="checkbox" checked={content.enabled !== false} onChange={(e) => updateContent({ enabled: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }} />
          </div>

          {/* Source */}
          <div>
            <span style={fieldLabel}>Navigation Source</span>
            <select className={styles.inputField} value={content.source} onChange={(e) => updateContent({ source: e.target.value as any })}>
              <option value="manual">Manual</option>
              <option value="product_categories">Product Categories</option>
              <option value="collections">Collections</option>
              <option value="pages">Pages</option>
              <option value="custom_links">Custom Links</option>
              <option value="dynamic">Dynamic Platform Data</option>
            </select>
          </div>

          {/* Navigation Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={sectionLabel}>NAVIGATION ITEMS</span>
              <button
                type="button"
                onClick={() => setShowAddItemWidget(!showAddItemWidget)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px',
                  borderRadius: '5px', border: showAddItemWidget ? '1px solid #2563eb' : '1px solid #cbd5e1',
                  background: showAddItemWidget ? '#eff6ff' : '#fff',
                  color: '#2563eb', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {showAddItemWidget ? <X size={11} /> : <Plus size={11} />}
                {showAddItemWidget ? 'Close' : 'Add Item'}
              </button>
            </div>

            {/* Interactive Add Item Type Selector Widget */}
            {showAddItemWidget && (
              <div style={{
                marginBottom: '12px',
                padding: '12px',
                background: '#ffffff',
                border: '1.5px solid #2563eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Choose Link Type to Add</span>
                  <button type="button" onClick={() => setShowAddItemWidget(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}>
                    <X size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    {
                      type: 'internal' as const,
                      label: 'Internal Store Page',
                      desc: 'Link to Shop, Products, Collections, About, Contact, Home',
                      icon: <Globe size={16} color="#2563eb" />,
                      factory: (): NavigationItem => ({
                        id: `nav-${Date.now()}`,
                        label: 'Shop All',
                        href: '/collections/all',
                        linkType: 'internal',
                        enabled: true,
                        icon: { source: 'library', iconName: 'ShoppingBag', size: 16 },
                      }),
                    },
                    {
                      type: 'external' as const,
                      label: 'External Web Link',
                      desc: 'Link to an external website, blog, social media, or partner URL',
                      icon: <ExternalLink size={16} color="#059669" />,
                      factory: (): NavigationItem => ({
                        id: `nav-${Date.now()}`,
                        label: 'Blog / External',
                        href: 'https://',
                        target: '_blank',
                        linkType: 'external',
                        enabled: true,
                        icon: { source: 'library', iconName: 'Globe', size: 16 },
                      }),
                    },
                    {
                      type: 'dropdown' as const,
                      label: 'Dropdown Menu',
                      desc: 'Parent category with a list of child subcategories',
                      icon: <ChevronDown size={16} color="#7c3aed" />,
                      factory: (): NavigationItem => ({
                        id: `nav-${Date.now()}`,
                        label: 'Categories',
                        href: '#',
                        linkType: 'dropdown',
                        enabled: true,
                        icon: { source: 'library', iconName: 'Grid', size: 16 },
                        children: [
                          { id: `sub-${Date.now()}-1`, label: 'Men', href: '/collections/men', enabled: true },
                          { id: `sub-${Date.now()}-2`, label: 'Women', href: '/collections/women', enabled: true },
                          { id: `sub-${Date.now()}-3`, label: 'Accessories', href: '/collections/accessories', enabled: true },
                        ],
                      }),
                    },
                    {
                      type: 'mega_menu' as const,
                      label: 'Mega Menu',
                      desc: 'Full-width multi-column menu with promotional banner card',
                      icon: <LayoutGrid size={16} color="#d97706" />,
                      factory: (): NavigationItem => ({
                        id: `nav-${Date.now()}`,
                        label: 'Mega Catalog',
                        href: '#',
                        linkType: 'mega_menu',
                        enabled: true,
                        icon: { source: 'library', iconName: 'Store', size: 16 },
                        megaColumns: [
                          {
                            id: `col-${Date.now()}-1`,
                            title: 'Clothing',
                            links: [
                              { label: 'T-Shirts & Polos', href: '/collections/tshirts' },
                              { label: 'Jackets & Coats', href: '/collections/jackets' },
                              { label: 'Pants & Jeans', href: '/collections/jeans' },
                            ],
                            width: '33%',
                            alignment: 'left',
                            itemSpacing: 8,
                          },
                          {
                            id: `col-${Date.now()}-2`,
                            title: 'Shoes & Bags',
                            links: [
                              { label: 'Sneakers & Boots', href: '/collections/shoes' },
                              { label: 'Backpacks & Bags', href: '/collections/bags' },
                              { label: 'Wallets & Belts', href: '/collections/accessories' },
                            ],
                            width: '33%',
                            alignment: 'left',
                            itemSpacing: 8,
                          },
                        ],
                        megaPromo: {
                          heading: 'Featured Deal',
                          description: 'Discover the latest seasonal arrivals and save up to 40%.',
                          ctaText: 'Shop New In',
                          ctaUrl: '/collections/new',
                        },
                      }),
                    },
                    {
                      type: 'category' as const,
                      label: 'Product Category / Card',
                      desc: 'Category with thumbnail image, count, badge, and custom link',
                      icon: <Tag size={16} color="#e11d48" />,
                      factory: (): NavigationItem => ({
                        id: `nav-${Date.now()}`,
                        label: 'Trending',
                        href: '/collections/trending',
                        linkType: 'category',
                        enabled: true,
                        badge: 'HOT',
                        badgeColor: '#ef4444',
                        count: 64,
                        image: {
                          url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=160&auto=format&fit=crop&q=80',
                          alt: 'Trending',
                          borderRadius: 8,
                          hoverZoom: true,
                        },
                        icon: { source: 'library', iconName: 'Flame', size: 16 },
                      }),
                    },
                  ].map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => {
                        const newItem = opt.factory();
                        updateContent({ items: [...content.items, newItem] });
                        setShowAddItemWidget(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                    >
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>{opt.icon}</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{opt.label}</span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{opt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
              <SortableContext items={content.items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
                {content.items.map((item, idx) => (
                  <SecondaryNavItemRow
                    key={item.id}
                    item={item}
                    look={look}
                    capabilities={currentLookMeta.capabilities}
                    onUpdate={(patch) => {
                      const newItems = content.items.map((it) => it.id === item.id ? { ...it, ...patch } : it);
                      updateContent({ items: newItems });
                    }}
                    onRemove={() => {
                      updateContent({ items: content.items.filter((it) => it.id !== item.id) });
                    }}
                    onDuplicate={() => {
                      const dup: NavigationItem = { ...item, id: `nav-${Date.now()}`, label: `${item.label} (Copy)` };
                      const newItems = [...content.items];
                      newItems.splice(idx + 1, 0, dup);
                      updateContent({ items: newItems });
                    }}
                    onToggle={() => {
                      const newItems = content.items.map((it) => it.id === item.id ? { ...it, enabled: !it.enabled } : it);
                      updateContent({ items: newItems });
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Secondary Row Items (two_row look) */}
          {look === 'two_row' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={sectionLabel}>SECONDARY ROW ITEMS</span>
                <button type="button" onClick={() => {
                  const newItem: NavigationItem = {
                    id: `nav-sec-${Date.now()}`, label: 'Sub Category', href: '/collections/sub', enabled: true,
                  };
                  updateContent({ secondaryItems: [...(content.secondaryItems || []), newItem] });
                }} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px',
                  borderRadius: '5px', border: '1px solid #cbd5e1', background: '#fff',
                  color: '#2563eb', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                }}>
                  <Plus size={11} /> Add Item
                </button>
              </div>
              {(content.secondaryItems || []).map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '6px' }}>
                  <input type="text" className={styles.inputField} value={item.label} onChange={(e) => {
                    const updated = (content.secondaryItems || []).map((it) => it.id === item.id ? { ...it, label: e.target.value } : it);
                    updateContent({ secondaryItems: updated });
                  }} style={{ flex: 1, fontSize: '12px' }} />
                  <button type="button" onClick={() => {
                    updateContent({ secondaryItems: (content.secondaryItems || []).filter((it) => it.id !== item.id) });
                  }} style={{ padding: '2px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: LAYOUT ─── */}
      {activeTab === 'layout' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={sectionLabel}>Layout Controls</span>
            <button type="button" onClick={handleResetLayout} style={resetBtnStyle}><RotateCcw size={11} /> Reset</button>
          </div>

          {/* Width */}
          <div>
            <span style={fieldLabel}>Width</span>
            <select className={styles.inputField} value={layout.width} onChange={(e) => updateLayout({ width: e.target.value as any })}>
              <option value="full">Full Width</option>
              <option value="contained">Container Width</option>
              <option value="custom">Custom Width</option>
            </select>
          </div>

          {/* Position */}
          <div>
            <span style={fieldLabel}>Position</span>
            <select className={styles.inputField} value={layout.position} onChange={(e) => updateLayout({ position: e.target.value as any })}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="space_between">Space Between</option>
              <option value="space_evenly">Space Evenly</option>
            </select>
          </div>

          {/* Gap Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <span style={fieldLabel}>Item Gap</span>
              <input type="number" className={styles.inputField} value={layout.itemGap} onChange={(e) => updateLayout({ itemGap: Number(e.target.value) })} min={0} max={60} />
            </div>
            <div>
              <span style={fieldLabel}>Bar Height</span>
              <input type="number" className={styles.inputField} value={layout.barHeight} onChange={(e) => updateLayout({ barHeight: Number(e.target.value) })} min={30} max={200} />
            </div>
          </div>

          {/* Padding */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <span style={fieldLabel}>Horizontal Padding</span>
              <input type="number" className={styles.inputField} value={layout.paddingX} onChange={(e) => updateLayout({ paddingX: Number(e.target.value) })} min={0} max={60} />
            </div>
            <div>
              <span style={fieldLabel}>Vertical Padding</span>
              <input type="number" className={styles.inputField} value={layout.paddingY} onChange={(e) => updateLayout({ paddingY: Number(e.target.value) })} min={0} max={40} />
            </div>
          </div>

          {/* Item Padding */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <span style={fieldLabel}>Item Padding X</span>
              <input type="number" className={styles.inputField} value={layout.itemPaddingX} onChange={(e) => updateLayout({ itemPaddingX: Number(e.target.value) })} min={0} max={40} />
            </div>
            <div>
              <span style={fieldLabel}>Item Padding Y</span>
              <input type="number" className={styles.inputField} value={layout.itemPaddingY} onChange={(e) => updateLayout({ itemPaddingY: Number(e.target.value) })} min={0} max={40} />
            </div>
          </div>

          {/* Icon specific layout (for icon looks) */}
          {currentLookMeta.capabilities.icons && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={fieldLabel}>Icon Size</span>
                <input type="number" className={styles.inputField} value={layout.iconSize} onChange={(e) => updateLayout({ iconSize: Number(e.target.value) })} min={10} max={48} />
              </div>
              <div>
                <span style={fieldLabel}>Icon → Label Gap</span>
                <input type="number" className={styles.inputField} value={layout.iconLabelGap} onChange={(e) => updateLayout({ iconLabelGap: Number(e.target.value) })} min={0} max={24} />
              </div>
            </div>
          )}

          {/* Overflow */}
          <div>
            <span style={fieldLabel}>Overflow</span>
            <select className={styles.inputField} value={layout.overflow} onChange={(e) => updateLayout({ overflow: e.target.value as any })}>
              <option value="scroll">Horizontal Scroll</option>
              <option value="wrap">Wrap</option>
              <option value="clip">Clip</option>
              <option value="more_button">More Button</option>
            </select>
          </div>

          {/* Scroll Controls */}
          {layout.overflow === 'scroll' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Show Left Arrow</span>
                <input type="checkbox" checked={layout.showLeftArrow} onChange={(e) => updateLayout({ showLeftArrow: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Show Right Arrow</span>
                <input type="checkbox" checked={layout.showRightArrow} onChange={(e) => updateLayout({ showRightArrow: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
              </div>
            </div>
          )}

          {/* Mobile Edge-to-Edge & Mobile Padding */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={fieldLabel}>Mobile Layout</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#334155' }}>Edge-to-Edge Scroll on Mobile</span>
              <input type="checkbox" checked={layout.mobileEdgeToEdge !== false} onChange={(e) => updateLayout({ mobileEdgeToEdge: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Mobile Padding X (px)</span>
                <input type="number" className={styles.inputField} value={layout.mobilePaddingX ?? 16} onChange={(e) => updateLayout({ mobilePaddingX: Number(e.target.value) })} min={0} max={50} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Mobile Padding Y (px)</span>
                <input type="number" className={styles.inputField} value={layout.mobilePaddingY ?? 6} onChange={(e) => updateLayout({ mobilePaddingY: Number(e.target.value) })} min={0} max={30} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: BEHAVIOR ─── */}
      {activeTab === 'behavior' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={sectionLabel}>Behavior Controls</span>
            <button type="button" onClick={handleResetBehavior} style={resetBtnStyle}><RotateCcw size={11} /> Reset</button>
          </div>

          {/* Sticky */}
          {currentLookMeta.capabilities.sticky && (
            <>
              <div>
                <span style={fieldLabel}>Sticky Behavior</span>
                <select className={styles.inputField} value={behavior.stickyMode} onChange={(e) => updateBehavior({ stickyMode: e.target.value as any })}>
                  <option value="normal">Normal (Scrolls with page)</option>
                  <option value="sticky_header">Sticky with Header Navbar</option>
                  <option value="sticky_top">Sticky to Top of Screen</option>
                  <option value="fixed">Fixed to Top</option>
                </select>
              </div>
              {behavior.stickyMode !== 'normal' && behavior.stickyMode !== 'static' && (
                <div>
                  <span style={fieldLabel}>Sticky Trigger</span>
                  <select className={styles.inputField} value={behavior.stickyTrigger} onChange={(e) => updateBehavior({ stickyTrigger: e.target.value as any })}>
                    <option value="immediately">Immediately</option>
                    <option value="after_header">After Header</option>
                    <option value="after_scroll">After Scrolling</option>
                    <option value="custom">Custom Scroll Distance</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Hover Effect */}
          <div>
            <span style={fieldLabel}>Hover Effect</span>
            <select className={styles.inputField} value={behavior.hoverEffect} onChange={(e) => updateBehavior({ hoverEffect: e.target.value as any })}>
              <option value="none">None</option>
              <option value="color_change">Color Change</option>
              <option value="underline">Underline</option>
              <option value="background">Background</option>
              <option value="scale">Scale</option>
              <option value="icon_animation">Icon Animation</option>
            </select>
          </div>

          {/* Dropdown Behavior (for dropdown/mega looks) */}
          {(currentLookMeta.capabilities.dropdown || currentLookMeta.capabilities.megaMenu) && (
            <>
              <div>
                <span style={fieldLabel}>Dropdown Trigger</span>
                <select className={styles.inputField} value={behavior.dropdownTrigger} onChange={(e) => updateBehavior({ dropdownTrigger: e.target.value as any })}>
                  <option value="hover">Hover to Open</option>
                  <option value="click">Click to Open</option>
                  <option value="touch">Touch to Open</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={fieldLabel}>Open Delay (ms)</span>
                  <input type="number" className={styles.inputField} value={behavior.openDelay} onChange={(e) => updateBehavior({ openDelay: Number(e.target.value) })} min={0} max={1000} />
                </div>
                <div>
                  <span style={fieldLabel}>Close Delay (ms)</span>
                  <input type="number" className={styles.inputField} value={behavior.closeDelay} onChange={(e) => updateBehavior({ closeDelay: Number(e.target.value) })} min={0} max={1000} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Close on Outside Click</span>
                <input type="checkbox" checked={behavior.closeOnOutsideClick} onChange={(e) => updateBehavior({ closeOnOutsideClick: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
              </div>
            </>
          )}

          {/* Mobile Scroll */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <span style={sectionLabel}>Mobile Scroll</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Swipe Enabled</span>
              <input type="checkbox" checked={behavior.swipeEnabled} onChange={(e) => updateBehavior({ swipeEnabled: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Snap to Item</span>
              <input type="checkbox" checked={behavior.snapToItem} onChange={(e) => updateBehavior({ snapToItem: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: DESIGN ─── */}
      {activeTab === 'design' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={sectionLabel}>Design</span>
            <button type="button" onClick={handleResetDesign} style={resetBtnStyle}><RotateCcw size={11} /> Reset</button>
          </div>

          {/* Colors Section */}
          <div style={{ borderBottom: '1px solid #e2e8f0' }}>
            <div onClick={() => toggleDesignSection('colors')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>COLORS</span>
              {designSections.colors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            {designSections.colors && (
              <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <ColorControl label="Background" mode={design.bgColorMode} color={design.bgColor} inheritedColor={semanticColors.bg}
                  onModeChange={(m) => updateDesign({ bgColorMode: m })} onColorChange={(c) => updateDesign({ bgColor: c, bgColorMode: 'custom' })} />
                <ColorControl label="Text" mode={design.textColorMode} color={design.textColor} inheritedColor={semanticColors.text}
                  onModeChange={(m) => updateDesign({ textColorMode: m })} onColorChange={(c) => updateDesign({ textColor: c, textColorMode: 'custom' })} />
                <ColorControl label="Active Text" mode={design.activeTextColorMode} color={design.activeTextColor} inheritedColor={semanticColors.activeText}
                  onModeChange={(m) => updateDesign({ activeTextColorMode: m })} onColorChange={(c) => updateDesign({ activeTextColor: c, activeTextColorMode: 'custom' })} />
                <ColorControl label="Active Background" mode={design.activeBgColorMode} color={design.activeBgColor} inheritedColor={semanticColors.activeBg}
                  onModeChange={(m) => updateDesign({ activeBgColorMode: m })} onColorChange={(c) => updateDesign({ activeBgColor: c, activeBgColorMode: 'custom' })} />
                <ColorControl label="Indicator" mode={design.indicatorColorMode} color={design.indicatorColor} inheritedColor={semanticColors.indicator}
                  onModeChange={(m) => updateDesign({ indicatorColorMode: m })} onColorChange={(c) => updateDesign({ indicatorColor: c, indicatorColorMode: 'custom' })} />
                {currentLookMeta.capabilities.icons && (
                  <>
                    <ColorControl label="Icon" mode={design.iconColorMode} color={design.iconColor} inheritedColor={semanticColors.icon}
                      onModeChange={(m) => updateDesign({ iconColorMode: m })} onColorChange={(c) => updateDesign({ iconColor: c, iconColorMode: 'custom' })} />
                    <ColorControl label="Icon Active" mode={design.iconActiveColorMode} color={design.iconActiveColor} inheritedColor={semanticColors.iconActive}
                      onModeChange={(m) => updateDesign({ iconActiveColorMode: m })} onColorChange={(c) => updateDesign({ iconActiveColor: c, iconActiveColorMode: 'custom' })} />
                  </>
                )}
                <ColorControl label="Border" mode={design.borderColorMode} color={design.borderColor} inheritedColor={semanticColors.border}
                  onModeChange={(m) => updateDesign({ borderColorMode: m })} onColorChange={(c) => updateDesign({ borderColor: c, borderColorMode: 'custom' })} />
                <ColorControl label="Divider" mode={design.dividerColorMode} color={design.dividerColor} inheritedColor={semanticColors.divider}
                  onModeChange={(m) => updateDesign({ dividerColorMode: m })} onColorChange={(c) => updateDesign({ dividerColor: c, dividerColorMode: 'custom' })} />
                {(currentLookMeta.capabilities.dropdown || currentLookMeta.capabilities.megaMenu) && (
                  <>
                    <ColorControl label="Dropdown Background" mode={design.dropdownBgColorMode} color={design.dropdownBgColor} inheritedColor={semanticColors.dropdownBg}
                      onModeChange={(m) => updateDesign({ dropdownBgColorMode: m })} onColorChange={(c) => updateDesign({ dropdownBgColor: c, dropdownBgColorMode: 'custom' })} />
                    <ColorControl label="Dropdown Text" mode={design.dropdownTextColorMode} color={design.dropdownTextColor} inheritedColor={semanticColors.dropdownText}
                      onModeChange={(m) => updateDesign({ dropdownTextColorMode: m })} onColorChange={(c) => updateDesign({ dropdownTextColor: c, dropdownTextColorMode: 'custom' })} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Typography Section */}
          <div style={{ borderBottom: '1px solid #e2e8f0' }}>
            <div onClick={() => toggleDesignSection('typography')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>TYPOGRAPHY</span>
              {designSections.typography ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            {designSections.typography && (
              <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><span style={fieldLabel}>Font Size</span><input type="number" className={styles.inputField} value={design.fontSize} onChange={(e) => updateDesign({ fontSize: Number(e.target.value) })} min={9} max={24} /></div>
                  <div><span style={fieldLabel}>Font Weight</span>
                    <select className={styles.inputField} value={design.fontWeight} onChange={(e) => updateDesign({ fontWeight: Number(e.target.value) })}>
                      <option value={400}>Regular (400)</option><option value={500}>Medium (500)</option><option value={600}>Semi-Bold (600)</option><option value={700}>Bold (700)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><span style={fieldLabel}>Line Height</span><input type="number" className={styles.inputField} value={design.lineHeight} onChange={(e) => updateDesign({ lineHeight: Number(e.target.value) })} min={1} max={3} step={0.1} /></div>
                  <div><span style={fieldLabel}>Letter Spacing</span><input type="number" className={styles.inputField} value={design.letterSpacing} onChange={(e) => updateDesign({ letterSpacing: Number(e.target.value) })} min={-1} max={5} step={0.1} /></div>
                </div>
                <div><span style={fieldLabel}>Text Transform</span>
                  <select className={styles.inputField} value={design.textTransform} onChange={(e) => updateDesign({ textTransform: e.target.value as any })}>
                    <option value="none">None</option><option value="uppercase">Uppercase</option><option value="capitalize">Capitalize</option><option value="lowercase">Lowercase</option>
                  </select>
                </div>
                <div><span style={fieldLabel}>Active Font Weight</span>
                  <select className={styles.inputField} value={design.activeFontWeight} onChange={(e) => updateDesign({ activeFontWeight: Number(e.target.value) })}>
                    <option value={500}>Medium (500)</option><option value={600}>Semi-Bold (600)</option><option value={700}>Bold (700)</option><option value={800}>Extra Bold (800)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Active Indicator Section */}
          {currentLookMeta.capabilities.activeIndicator && (
            <div style={{ borderBottom: '1px solid #e2e8f0' }}>
              <div onClick={() => toggleDesignSection('indicator')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>ACTIVE INDICATOR</span>
                {designSections.indicator ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              {designSections.indicator && (
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div><span style={fieldLabel}>Indicator Type</span>
                    <select className={styles.inputField} value={design.indicatorType} onChange={(e) => updateDesign({ indicatorType: e.target.value as any })}>
                      <option value="none">None</option><option value="underline">Underline</option><option value="bottom_border">Bottom Border</option>
                      <option value="top_border">Top Border</option><option value="background">Background</option><option value="pill">Pill</option>
                      <option value="dot">Dot</option><option value="side">Side Indicator</option>
                    </select>
                  </div>
                  {design.indicatorType !== 'none' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div><span style={fieldLabel}>Thickness</span><input type="number" className={styles.inputField} value={design.indicatorThickness} onChange={(e) => updateDesign({ indicatorThickness: Number(e.target.value) })} min={1} max={6} /></div>
                      <div><span style={fieldLabel}>Radius</span><input type="number" className={styles.inputField} value={design.indicatorRadius} onChange={(e) => updateDesign({ indicatorRadius: Number(e.target.value) })} min={0} max={20} /></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Borders Section */}
          <div style={{ borderBottom: '1px solid #e2e8f0' }}>
            <div onClick={() => toggleDesignSection('borders')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>BORDERS & SHADOW</span>
              {designSections.borders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            {designSections.borders && (
              <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><span style={fieldLabel}>Border Position</span>
                  <select className={styles.inputField} value={design.borderPosition} onChange={(e) => updateDesign({ borderPosition: e.target.value as any })}>
                    <option value="none">None</option><option value="bottom">Bottom</option><option value="top">Top</option><option value="both">Top & Bottom</option><option value="all">All</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><span style={fieldLabel}>Border Width</span><input type="number" className={styles.inputField} value={design.borderWidth} onChange={(e) => updateDesign({ borderWidth: Number(e.target.value) })} min={0} max={4} /></div>
                  <div><span style={fieldLabel}>Box Shadow</span>
                    <select className={styles.inputField} value={design.boxShadow} onChange={(e) => updateDesign({ boxShadow: e.target.value as any })}>
                      <option value="none">None</option><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 6: RESPONSIVE ─── */}
      {activeTab === 'responsive' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={sectionLabel}>Responsive</span>
            <button type="button" onClick={handleResetResponsive} style={resetBtnStyle}><RotateCcw size={11} /> Reset</button>
          </div>

          {/* Desktop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>🖥 Desktop</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><span style={fieldLabel}>Gap</span><input type="number" className={styles.inputField} value={responsive.desktop.gap} onChange={(e) => updateResponsive({ desktop: { ...responsive.desktop, gap: Number(e.target.value) } })} min={0} max={60} /></div>
              <div><span style={fieldLabel}>Font Size</span><input type="number" className={styles.inputField} value={responsive.desktop.fontSize} onChange={(e) => updateResponsive({ desktop: { ...responsive.desktop, fontSize: Number(e.target.value) } })} min={9} max={24} /></div>
              {currentLookMeta.capabilities.icons && (
                <div><span style={fieldLabel}>Icon Size</span><input type="number" className={styles.inputField} value={responsive.desktop.iconSize} onChange={(e) => updateResponsive({ desktop: { ...responsive.desktop, iconSize: Number(e.target.value) } })} min={10} max={48} /></div>
              )}
            </div>
          </div>

          {/* Tablet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>📱 Tablet</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><span style={fieldLabel}>Gap</span><input type="number" className={styles.inputField} value={responsive.tablet.gap} onChange={(e) => updateResponsive({ tablet: { ...responsive.tablet, gap: Number(e.target.value) } })} min={0} max={40} /></div>
              {currentLookMeta.capabilities.icons && (
                <div><span style={fieldLabel}>Icon Size</span><input type="number" className={styles.inputField} value={responsive.tablet.iconSize} onChange={(e) => updateResponsive({ tablet: { ...responsive.tablet, iconSize: Number(e.target.value) } })} min={10} max={40} /></div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Horizontal Scroll</span>
              <input type="checkbox" checked={responsive.tablet.horizontalScroll} onChange={(e) => updateResponsive({ tablet: { ...responsive.tablet, horizontalScroll: e.target.checked } })}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
            </div>
          </div>

          {/* Mobile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>📲 Mobile</span>
            <div><span style={fieldLabel}>Navigation Mode</span>
              <select className={styles.inputField} value={responsive.mobile.navigationMode} onChange={(e) => updateResponsive({ mobile: { ...responsive.mobile, navigationMode: e.target.value as any } })}>
                <option value="scroll">Horizontal Scroll</option><option value="dropdown">Dropdown</option><option value="grid">Grid</option>
                <option value="compact_tabs">Compact Tabs</option><option value="icon_rail">Icon Rail</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><span style={fieldLabel}>Gap</span><input type="number" className={styles.inputField} value={responsive.mobile.gap} onChange={(e) => updateResponsive({ mobile: { ...responsive.mobile, gap: Number(e.target.value) } })} min={0} max={40} /></div>
              <div><span style={fieldLabel}>Text Size</span><input type="number" className={styles.inputField} value={responsive.mobile.textSize} onChange={(e) => updateResponsive({ mobile: { ...responsive.mobile, textSize: Number(e.target.value) } })} min={9} max={18} /></div>
              {currentLookMeta.capabilities.icons && (
                <div><span style={fieldLabel}>Icon Size</span><input type="number" className={styles.inputField} value={responsive.mobile.iconSize} onChange={(e) => updateResponsive({ mobile: { ...responsive.mobile, iconSize: Number(e.target.value) } })} min={10} max={36} /></div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Show Arrows</span>
              <input type="checkbox" checked={responsive.mobile.showArrows} onChange={(e) => updateResponsive({ mobile: { ...responsive.mobile, showArrows: e.target.checked } })}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 7: VISIBILITY ─── */}
      {activeTab === 'visibility' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={sectionLabel}>Visibility</span>
            <button type="button" onClick={handleResetVisibility} style={resetBtnStyle}><RotateCcw size={11} /> Reset</button>
          </div>

          {/* Pages */}
          <div><span style={fieldLabel}>Show on Pages</span>
            <select className={styles.inputField} value={visibility.displayOnPages} onChange={(e) => updateVisibility({ displayOnPages: e.target.value as any })}>
              <option value="all">All Pages</option><option value="homepage_only">Homepage Only</option><option value="product_pages">Product Pages</option>
              <option value="collection_pages">Collection Pages</option><option value="cart">Cart</option><option value="search">Search</option><option value="selected">Selected Pages</option>
            </select>
          </div>

          {/* Devices */}
          <div><span style={fieldLabel}>Show on Devices</span>
            <select className={styles.inputField} value={visibility.device} onChange={(e) => updateVisibility({ device: e.target.value as any })}>
              <option value="all">All Devices</option><option value="desktop">Desktop Only</option><option value="tablet">Tablet Only</option><option value="mobile">Mobile Only</option>
            </select>
          </div>

          {/* Customer */}
          <div><span style={fieldLabel}>Customer Visibility</span>
            <select className={styles.inputField} value={visibility.customerVisibility} onChange={(e) => updateVisibility({ customerVisibility: e.target.value as any })}>
              <option value="everyone">Everyone</option><option value="logged_in">Logged-in Customers</option><option value="guest">Guest Customers</option>
            </select>
          </div>

          {/* Scheduling */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Enable Scheduling</span>
            <input type="checkbox" checked={visibility.schedulingEnabled} onChange={(e) => updateVisibility({ schedulingEnabled: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
          </div>
          {visibility.schedulingEnabled && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><span style={fieldLabel}>Start Date</span><input type="date" className={styles.inputField} value={visibility.startDate || ''} onChange={(e) => updateVisibility({ startDate: e.target.value })} /></div>
              <div><span style={fieldLabel}>End Date</span><input type="date" className={styles.inputField} value={visibility.endDate || ''} onChange={(e) => updateVisibility({ endDate: e.target.value })} /></div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 8: ADVANCED ─── */}
      {activeTab === 'advanced' && (
        <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={sectionLabel}>Advanced</span>
            <button type="button" onClick={handleResetAdvanced} style={resetBtnStyle}><RotateCcw size={11} /> Reset</button>
          </div>

          {/* HTML */}
          <div><span style={fieldLabel}>Custom ID</span><input type="text" className={styles.inputField} value={advanced.htmlId || ''} onChange={(e) => updateAdvanced({ htmlId: e.target.value })} placeholder="e.g. secondary-nav" /></div>
          <div><span style={fieldLabel}>Custom CSS Class</span><input type="text" className={styles.inputField} value={advanced.cssClass || ''} onChange={(e) => updateAdvanced({ cssClass: e.target.value })} placeholder="e.g. my-custom-nav" /></div>

          {/* Accessibility */}
          <div><span style={fieldLabel}>ARIA Label</span><input type="text" className={styles.inputField} value={advanced.ariaLabel || ''} onChange={(e) => updateAdvanced({ ariaLabel: e.target.value })} /></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Keyboard Navigation</span>
            <input type="checkbox" checked={advanced.keyboardNavigation} onChange={(e) => updateAdvanced({ keyboardNavigation: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
          </div>

          {/* Analytics */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={sectionLabel}>Analytics</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Enable Click Tracking</span>
              <input type="checkbox" checked={advanced.enableClickTracking} onChange={(e) => updateAdvanced({ enableClickTracking: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
            </div>
            {advanced.enableClickTracking && (
              <div><span style={fieldLabel}>Event Name</span><input type="text" className={styles.inputField} value={advanced.eventName || ''} onChange={(e) => updateAdvanced({ eventName: e.target.value })} placeholder="secondary_nav_click" /></div>
            )}
          </div>

          {/* Custom CSS */}
          <div><span style={fieldLabel}>Custom CSS</span>
            <textarea className={styles.textareaField} rows={5} value={advanced.customCss || ''} onChange={(e) => updateAdvanced({ customCss: e.target.value })} placeholder="/* Custom CSS overrides */" />
          </div>

          {/* Full Reset */}
          <div style={{ paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={handleResetFull} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%',
              padding: '10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff5f5',
              color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}>
              <RotateCcw size={13} /> Reset Secondary Navigation to Default
            </button>
          </div>
        </div>
      )}
      {(secNavRow?.isVisible === false || categorySection?.isHidden) && (
        <div style={{ margin: '16px', padding: '12px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ffeeba' }}>
          <EyeOff size={16} style={{ flexShrink: 0 }} />
          <span>This section is currently hidden.</span>
        </div>
      )}
    </>
  );
};

// ─── Sortable Navigation Item Row ───────────────────────────
const SecondaryNavItemRow: React.FC<{
  item: NavigationItem;
  look: SecondaryNavLook;
  capabilities: LookCapabilities;
  onUpdate: (patch: Partial<NavigationItem>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
}> = ({ item, look, capabilities, onUpdate, onRemove, onDuplicate, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    marginBottom: '6px',
    background: '#f8fafc',
    border: isDragging ? '1px dashed #2563eb' : '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button type="button" {...attributes} {...listeners} style={{ cursor: 'grab', background: 'transparent', border: 'none', padding: '2px', display: 'flex', alignItems: 'center', color: '#94a3b8', touchAction: 'none' }}>
            <GripVertical size={13} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: item.enabled ? '#0f172a' : '#94a3b8', textDecoration: item.enabled ? 'none' : 'line-through' }}>{item.label}</span>
          {item.badge && <span style={{ fontSize: '9px', fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '1px 5px', borderRadius: '4px' }}>{item.badge}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ padding: '2px', border: 'none', background: 'transparent', cursor: 'pointer', color: item.enabled ? '#2563eb' : '#94a3b8' }}>
            {item.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} style={{ padding: '2px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
            <Copy size={13} />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ padding: '2px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
            <Trash2 size={13} />
          </button>
          <ChevronDown size={13} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', background: '#ffffff' }}>
          <div><span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Label</span>
            <input type="text" className={styles.inputField} value={item.label} onChange={(e) => onUpdate({ label: e.target.value })} />
          </div>
          <div><span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URL</span>
            <input type="text" className={styles.inputField} value={item.href} onChange={(e) => onUpdate({ href: e.target.value })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Open in New Tab</span>
            <input type="checkbox" checked={item.target === '_blank'} onChange={(e) => onUpdate({ target: e.target.checked ? '_blank' : '_self' })}
              style={{ width: '14px', height: '14px', accentColor: '#2563eb' }} />
          </div>

          {/* Icon (for icon-supporting looks) */}
          {capabilities.icons && (
            <div style={{ paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
              <UtilityIconPicker
                label="Item Icon"
                value={(item.icon as any) || { source: 'library', iconName: 'Grid', size: 18 }}
                onChange={(ic) => onUpdate({ icon: ic as any })}
                showSettings={true}
              />
            </div>
          )}

          {/* Category Image (for image-supporting looks like Image Categories & Category Cards) */}
          {capabilities.images && (
            <div style={{ paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category Image</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className={styles.inputField}
                  value={item.image?.url || ''}
                  onChange={(e) => onUpdate({ image: { ...item.image, url: e.target.value } })}
                  placeholder="https://... image URL"
                  style={{ fontSize: '11px' }}
                />
                {item.image?.url && (
                  <img src={item.image.url} alt="" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }} />
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Border Radius</span>
                  <input
                    type="number"
                    className={styles.inputField}
                    value={item.image?.borderRadius ?? 8}
                    onChange={(e) => onUpdate({ image: { ...item.image, url: item.image?.url || '', borderRadius: Number(e.target.value) } })}
                    min={0}
                    max={9999}
                    style={{ fontSize: '11px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px' }}>
                  <input
                    type="checkbox"
                    id={`hoverZoom-${item.id}`}
                    checked={item.image?.hoverZoom !== false}
                    onChange={(e) => onUpdate({ image: { ...item.image, url: item.image?.url || '', hoverZoom: e.target.checked } })}
                    style={{ width: '13px', height: '13px', accentColor: '#2563eb' }}
                  />
                  <label htmlFor={`hoverZoom-${item.id}`} style={{ fontSize: '11px', color: '#475569', cursor: 'pointer' }}>Hover Zoom</label>
                </div>
              </div>
            </div>
          )}

          {/* Product count for category cards */}
          {look === 'category_cards' && (
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Item Count</span>
              <input
                type="number"
                className={styles.inputField}
                value={item.count ?? ''}
                onChange={(e) => onUpdate({ count: Number(e.target.value) })}
                placeholder="e.g. 128"
                style={{ fontSize: '11px' }}
              />
            </div>
          )}

          {/* Nested Subcategories (for dropdown & multi-level looks) */}
          {capabilities.nestedItems && (
            <div style={{ paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Subcategories ({(item.children || []).length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newChild: NavigationItem = {
                      id: `sub-${Date.now()}`,
                      label: 'New Category',
                      href: '#',
                      enabled: true,
                    };
                    onUpdate({ children: [...(item.children || []), newChild] });
                  }}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: '#2563eb',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  + Add
                </button>
              </div>
              {(item.children || []).map((sub, sIdx) => (
                <div key={sub.id} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={sub.label}
                    onChange={(e) => {
                      const updated = [...(item.children || [])];
                      updated[sIdx] = { ...updated[sIdx], label: e.target.value };
                      onUpdate({ children: updated });
                    }}
                    placeholder="Name"
                    style={{ fontSize: '11px', flex: 1 }}
                  />
                  <input
                    type="text"
                    className={styles.inputField}
                    value={sub.href}
                    onChange={(e) => {
                      const updated = [...(item.children || [])];
                      updated[sIdx] = { ...updated[sIdx], href: e.target.value };
                      onUpdate({ children: updated });
                    }}
                    placeholder="URL"
                    style={{ fontSize: '11px', flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (item.children || []).filter((_, i) => i !== sIdx);
                      onUpdate({ children: updated });
                    }}
                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Mega Menu Visual Builder */}
          {(capabilities.megaMenu || item.linkType === 'mega_menu' || Boolean(item.megaColumns && item.megaColumns.length > 0)) && (
            <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mega Menu Columns ({(item.megaColumns || []).length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newCol: MegaMenuColumn = {
                      id: `col-${Date.now()}`,
                      title: 'New Column',
                      links: [
                        { label: 'Category Link 1', href: '#' },
                        { label: 'Category Link 2', href: '#' },
                      ],
                      width: '25%',
                      alignment: 'left',
                      itemSpacing: 8,
                    };
                    onUpdate({ megaColumns: [...(item.megaColumns || []), newCol] });
                  }}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: '#2563eb',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  + Add Column
                </button>
              </div>

              {/* Columns List */}
              {(item.megaColumns || []).map((col, cIdx) => (
                <div key={col.id} style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, marginRight: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>COL {cIdx + 1}</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={col.title}
                        onChange={(e) => {
                          const updated = [...(item.megaColumns || [])];
                          updated[cIdx] = { ...updated[cIdx], title: e.target.value };
                          onUpdate({ megaColumns: updated });
                        }}
                        placeholder="Column Title (e.g. Men)"
                        style={{ fontSize: '11px', fontWeight: 600 }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (item.megaColumns || []).filter((_, i) => i !== cIdx);
                        onUpdate({ megaColumns: updated });
                      }}
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      title="Delete Column"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Column links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', borderLeft: '2px solid #cbd5e1' }}>
                    {col.links.map((lnk, lIdx) => (
                      <div key={lIdx} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className={styles.inputField}
                          value={lnk.label}
                          onChange={(e) => {
                            const updatedCols = [...(item.megaColumns || [])];
                            const updatedLinks = [...updatedCols[cIdx].links];
                            updatedLinks[lIdx] = { ...updatedLinks[lIdx], label: e.target.value };
                            updatedCols[cIdx] = { ...updatedCols[cIdx], links: updatedLinks };
                            onUpdate({ megaColumns: updatedCols });
                          }}
                          placeholder="Link label"
                          style={{ fontSize: '10px', flex: 1 }}
                        />
                        <input
                          type="text"
                          className={styles.inputField}
                          value={lnk.href}
                          onChange={(e) => {
                            const updatedCols = [...(item.megaColumns || [])];
                            const updatedLinks = [...updatedCols[cIdx].links];
                            updatedLinks[lIdx] = { ...updatedLinks[lIdx], href: e.target.value };
                            updatedCols[cIdx] = { ...updatedCols[cIdx], links: updatedLinks };
                            onUpdate({ megaColumns: updatedCols });
                          }}
                          placeholder="/path"
                          style={{ fontSize: '10px', flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedCols = [...(item.megaColumns || [])];
                            updatedCols[cIdx] = {
                              ...updatedCols[cIdx],
                              links: updatedCols[cIdx].links.filter((_, i) => i !== lIdx),
                            };
                            onUpdate({ megaColumns: updatedCols });
                          }}
                          style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '1px' }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const updatedCols = [...(item.megaColumns || [])];
                        updatedCols[cIdx] = {
                          ...updatedCols[cIdx],
                          links: [...updatedCols[cIdx].links, { label: 'New Link', href: '#' }],
                        };
                        onUpdate({ megaColumns: updatedCols });
                      }}
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: '2px',
                        padding: '1px 6px',
                        fontSize: '9px',
                        background: '#ffffff',
                        border: '1px dashed #94a3b8',
                        borderRadius: '3px',
                        color: '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      + Add Link
                    </button>
                  </div>
                </div>
              ))}

              {/* Promotional Banner Card for Mega Menu */}
              <div style={{ marginTop: '4px', padding: '8px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mega Menu Promotional Banner
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={item.megaPromo?.heading || ''}
                    onChange={(e) => onUpdate({ megaPromo: { ...item.megaPromo, heading: e.target.value } })}
                    placeholder="Banner Heading (e.g. Summer Sale)"
                    style={{ fontSize: '11px', background: '#fff' }}
                  />
                  <input
                    type="text"
                    className={styles.inputField}
                    value={item.megaPromo?.description || ''}
                    onChange={(e) => onUpdate({ megaPromo: { ...item.megaPromo, description: e.target.value } })}
                    placeholder="Description (e.g. Up to 50% off styles)"
                    style={{ fontSize: '11px', background: '#fff' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={item.megaPromo?.ctaText || ''}
                      onChange={(e) => onUpdate({ megaPromo: { ...item.megaPromo, ctaText: e.target.value } })}
                      placeholder="Button Text (e.g. Shop Now)"
                      style={{ fontSize: '11px', background: '#fff' }}
                    />
                    <input
                      type="text"
                      className={styles.inputField}
                      value={item.megaPromo?.ctaUrl || ''}
                      onChange={(e) => onUpdate({ megaPromo: { ...item.megaPromo, ctaUrl: e.target.value } })}
                      placeholder="Button URL (/sale)"
                      style={{ fontSize: '11px', background: '#fff' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Badge */}
          {capabilities.badges && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Badge</span>
                <input type="text" className={styles.inputField} value={item.badge || ''} onChange={(e) => onUpdate({ badge: e.target.value })} placeholder="NEW" style={{ fontSize: '11px' }} />
              </div>
              <div><span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Badge Color</span>
                <input type="text" className={styles.inputField} value={item.badgeColor || '#ef4444'} onChange={(e) => onUpdate({ badgeColor: e.target.value })} style={{ fontSize: '11px' }} />
              </div>
            </div>
          )}

          {/* Tooltip (for icon-only looks) */}
          {capabilities.tooltips && (
            <div><span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Tooltip</span>
              <input type="text" className={styles.inputField} value={item.tooltip || ''} onChange={(e) => onUpdate({ tooltip: e.target.value })} placeholder="Tooltip text" />
            </div>
          )}

          {/* Optional */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div><span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>CSS Class</span>
              <input type="text" className={styles.inputField} value={item.cssClass || ''} onChange={(e) => onUpdate({ cssClass: e.target.value })} style={{ fontSize: '11px' }} />
            </div>
            <div><span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Custom ID</span>
              <input type="text" className={styles.inputField} value={item.customId || ''} onChange={(e) => onUpdate({ customId: e.target.value })} style={{ fontSize: '11px' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export const EditorRightSidebar: React.FC = () => {
  const {
    isRightSidebarOpen, closeRightSidebar, selectedSectionId, selectedPageId,
    isColorWidgetOpen, setColorWidgetOpen, isTypographyWidgetOpen, setTypographyWidgetOpen,
    activePanel, pagesNavLevel
  } = useLandingEditorStore();
  const {
    pages, updateSectionProps, theme, updateTheme, updatePageProps
  } = useSiteStore();
  const editorStore = useEditorContextStore();

  const [activeEditorTab, setActiveEditorTab] = useState<'content' | 'design' | 'visibility' | 'advanced' | 'abtest' | 'personalize'>('content');
  const [visibilitySectionsOpen, setVisibilitySectionsOpen] = useState({ devices: true, schedule: true, audience: true, segment: true });

  const landingPage = pages.find((p) => p.id === 'landing-page') || pages[0];
  const activePage = pages.find((p) => p.id === selectedPageId) || landingPage;
  const isGlobalComponent = ['header-global', 'footer-global', 'cookie-consent-global', 'toaster-global'].includes(selectedPageId);
  const activeSection = (isGlobalComponent ? landingPage : activePage)?.sections.find((s) => s.id === selectedSectionId);

  const HEADER_TYPES = ['AnnouncementBar', 'UtilityBar', 'Header', 'CategoryBar'];
  const FOOTER_TYPES = [
    'FooterTrust',
    'FooterNewsletter',
    'FooterMain',
    'FooterSocial',
    'FooterApp',
    'FooterContact',
    'FooterPayment',
    'FooterBottom',
    'Footer',
    'FooterMenu',
    'FooterText',
  ];

  // Enforce section ownership isolation: header sections are editable ONLY in header-global,
  // footer sections are editable ONLY in footer-global.
  if (activeSection) {
    if (HEADER_TYPES.includes(activeSection.type) && selectedPageId !== 'header-global') return null;
    if (FOOTER_TYPES.includes(activeSection.type) && selectedPageId !== 'footer-global') return null;
  }

  const isHidden = !isRightSidebarOpen && !isColorWidgetOpen && !isTypographyWidgetOpen;

  // 1. Hide if right sidebar is closed
  if (isHidden) {
    return null;
  }

  // 2. In Brand tab: render contextual brand panel
  if (activePanel === 'brand' || activePanel === 'store-brand' || activePanel === 'seo-growth') {
    return <BrandRightPanel />;
  }

  // 3. In Settings tab: render contextual settings panel
  if (activePanel === 'settings') {
    return <SettingsRightPanel />;
  }

  // 4. In pages tab: if at the list level (All Pages list) and not editing global header/footer, hide right sidebar
  if (activePanel === 'pages' && pagesNavLevel === 'list' && !isGlobalComponent) {
    return null;
  }

  // Shared capability inspector for global header and footer editors.
  if (activePanel === 'pages' && selectedPageId === 'cookie-consent-global') {
    return <GlobalUtilityPanel type="cookie" />;
  }

  if (activePanel === 'pages' && selectedPageId === 'toaster-global') {
    return <GlobalUtilityPanel type="toaster" />;
  }

  const isHeaderScope = selectedPageId === 'header-global';
  const isFooterScope = selectedPageId === 'footer-global';
  const isTargetFooter = (editorStore.selectedTarget as any)?.editorType === 'footer';
  const isTargetHeader = (editorStore.selectedTarget as any)?.editorType === 'header';

  // Announcement Bar selection check: handles header-global and standalone announcement bar sections
  const selectedRowId = editorStore.selectedTarget?.type === 'row' ? editorStore.selectedTarget.rowId : undefined;
  const selectedRow = selectedRowId ? editorStore.headerRows?.find((r) => r.id === selectedRowId) : undefined;
  const isAnnouncementSelected =
    !isFooterScope &&
    !isTargetFooter &&
    (selectedSectionId === 'announcement-bar' ||
      (editorStore.selectedTarget?.type === 'row' &&
        (editorStore.selectedTarget.rowId === 'announcement-bar' ||
          editorStore.selectedTarget.rowId === 'row-announcement' ||
          (isTargetHeader && editorStore.selectedTarget.rowId?.includes('announcement')) ||
          selectedRow?.type === 'announcement')) ||
      (editorStore.selectedTarget?.type === 'element' &&
        (editorStore.selectedTarget.elementType === 'announcement-bar' ||
          editorStore.selectedTarget.elementType === 'promo-text' ||
          editorStore.selectedTarget.elementId === 'el-announcement-content' ||
          selectedRow?.type === 'announcement')) ||
      activeSection?.type === 'AnnouncementBar');

  if (activePanel === 'pages' && isAnnouncementSelected && (isHeaderScope || activeSection?.type === 'AnnouncementBar')) {
    if (isHidden) return null;
    return (
      <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
        <AnnouncementBarRightEditor onClose={closeRightSidebar} />
      </aside>
    );
  }

  // Utility Bar selection check: handles header-global and standalone utility bar sections
  const isUtilitySelected =
    !isFooterScope &&
    !isTargetFooter &&
    (selectedSectionId === 'utility-bar' ||
      (editorStore.selectedTarget?.type === 'row' &&
        (editorStore.selectedTarget.rowId === 'utility-bar' ||
          editorStore.selectedTarget.rowId === 'row-utility' ||
          (isTargetHeader && editorStore.selectedTarget.rowId?.includes('utility')) ||
          selectedRow?.type === 'utility')) ||
      (editorStore.selectedTarget?.type === 'element' &&
        (editorStore.selectedTarget.elementType === 'utility-bar' ||
          editorStore.selectedTarget.elementType === 'utility-nav' ||
          editorStore.selectedTarget.elementId === 'el-utility-content' ||
          selectedRow?.type === 'utility')) ||
      activeSection?.type === 'UtilityBar');

  if (activePanel === 'pages' && isUtilitySelected && (isHeaderScope || activeSection?.type === 'UtilityBar')) {
    if (isHidden) return null;
    return (
      <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
        <UtilityBarRightEditor onClose={closeRightSidebar} />
      </aside>
    );
  }

  // Secondary Navigation / CategoryBar selection check
  const isCategoryBarSelected =
    !isFooterScope &&
    !isTargetFooter &&
    (selectedSectionId === 'category-bar' ||
      (editorStore.selectedTarget?.type === 'row' &&
        (editorStore.selectedTarget.rowId === 'category-bar' ||
          editorStore.selectedTarget.rowId === 'row-secondary-nav' ||
          (isTargetHeader &&
            (editorStore.selectedTarget.rowId?.includes('secondary') ||
              editorStore.selectedTarget.rowId?.includes('category'))) ||
          selectedRow?.type === 'secondary-nav')) ||
      (editorStore.selectedTarget?.type === 'element' &&
        (editorStore.selectedTarget.elementType === 'secondary-nav' ||
          editorStore.selectedTarget.elementType === 'category-bar' ||
          editorStore.selectedTarget.elementId === 'el-secondary-nav-content' ||
          selectedRow?.type === 'secondary-nav')) ||
      activeSection?.type === 'CategoryBar');

  if (activePanel === 'pages' && isCategoryBarSelected && (isHeaderScope || activeSection?.type === 'CategoryBar')) {
    if (isHidden) return null;
    return (
      <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
        <SecondaryNavRightEditor onClose={closeRightSidebar} />
      </aside>
    );
  }

  if (activePanel === 'pages' && selectedPageId === 'footer-global') {
    if (isHidden) return null;
    return (
      <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
        <FooterRightEditor onClose={closeRightSidebar} />
      </aside>
    );
  }

  if (activePanel === 'pages' && isGlobalComponent) {
    if (isHidden) return null;
    return (
      <aside className={styles.rightPanel}>
        <CapabilityInspector />
      </aside>
    );
  }

  // If in 'theme' tab, render theme category editing panel in the right sidebar
  if (activePanel === 'design' || activePanel === 'design-experience') {
    return <ThemeEditorRightPanel isHidden={isHidden} />;
  }

  // 5. Default pages other than Homepage (Shop, Product Details, Cart, Checkout, 404, Maintenance, Legal, etc.)
  // When no section on the page is selected, render the page configuration settings
  if (activePanel === 'pages' && selectedPageId !== 'landing-page' && !isGlobalComponent && !activeSection) {
    let pageConfig = getPageConfig(activePage.type) || getPageConfig(activePage.id.replace('-page', ''));

    // Fallback config for pages without a registered config
    if (!pageConfig) {
      pageConfig = {
        type: activePage.type,
        name: activePage.name,
        category: activePage.category,
        path: activePage.path,
        description: 'Manage page settings',
        defaultSections: [],
        layouts: [],
        getTabs: () => []
      } as any;
    }

    if (pageConfig) {
      return (
        <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
          <div className={styles.panelHeader}>
            <div className={styles.phLeft}>
              <button className={styles.iconBtn} onClick={() => closeRightSidebar()}>
                <ChevronRight size={20} className={styles.backIcon} />
              </button>
              <h3 className={styles.fw600}>{pageConfig.name} Settings</h3>
            </div>
          </div>
          <div className={styles.propContent} style={{ padding: 0 }}>
            <PageTabRenderer
              tabs={pageConfig.getTabs(activePage.pageProps?._selectedLayout, activePage.pageProps)}
              layouts={pageConfig.layouts}
              props={activePage.pageProps || {}}
              onPropChange={(key, value) => updatePageProps(activePage.id, {
                pageProps: { ...activePage.pageProps, [key]: value }
              })}
              pageName={pageConfig.name}
            />
          </div>
        </aside>
      );
    }
  }

  // If in homepage landing-page and no section is selected, hide right sidebar
  if (activePanel === 'pages' && selectedPageId === 'landing-page' && !activeSection) {
    return null;
  }

  const handlePropChange = (key: string, value: any) => {
    if (activeSection) {
      const targetPageId = isGlobalComponent ? landingPage.id : activePage.id;
      updateSectionProps(targetPageId, activeSection.id, { [key]: value });
    }
  };



  const presets = [
    { name: 'Default', colors: { primary: '#198754', secondary: '#ff6b00', background: '#ffffff', text: '#0f172a', accent: '#22c55e', border: '#e2e8f0' } },
    { name: 'Ocean', colors: { primary: '#0ea5e9', secondary: '#0284c7', background: '#f0f9ff', text: '#082f49', accent: '#38bdf8', border: '#bae6fd' } },
    { name: 'Luxury', colors: { primary: '#000000', secondary: '#4b5563', background: '#fafafa', text: '#111111', accent: '#d4af37', border: '#e5e5e5' } },
    { name: 'Forest', colors: { primary: '#16a34a', secondary: '#854d0e', background: '#fefce8', text: '#1a2e05', accent: '#22c55e', border: '#dcfce7' } },
    { name: 'Midnight', colors: { primary: '#8b5cf6', secondary: '#ec4899', background: '#0f0f23', text: '#e2e8f0', accent: '#c084fc', border: '#334155' } },
  ];

  const fonts = [
    { name: 'Modern Sans', style: { fontFamily: 'Inter, sans-serif' } },
    { name: 'Classic Serif', style: { fontFamily: 'Georgia, serif' } },
    { name: 'Mono Space', style: { fontFamily: 'monospace' } },
    { name: 'Elegant', style: { fontFamily: '"Playfair Display", serif' } },
  ];

  // Render field by type
  const renderField = (field: EditorField) => {
    const value = activeSection?.props?.[field.key];

    return (
      <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{field.label}</span>
        </div>
        {field.type === 'text' && <FieldInput value={value} onChange={(v) => handlePropChange(field.key, v)} />}
        {field.type === 'textarea' && <FieldTextarea value={value} onChange={(v) => handlePropChange(field.key, v)} />}
        {field.type === 'color' && <FieldColor value={value} onChange={(v) => handlePropChange(field.key, v)} />}
        {field.type === 'image' && <FieldImage value={value} onChange={(v) => handlePropChange(field.key, v)} />}
        {field.type === 'url' && <FieldInput value={value} onChange={(v) => handlePropChange(field.key, v)} placeholder="https://..." />}
        {field.type === 'toggle' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{value ? 'Enabled' : 'Disabled'}</span>
            <FieldToggle value={!!value} onChange={(v) => handlePropChange(field.key, v)} />
          </div>
        )}
        {field.type === 'number' && (
          <input
            type="number"
            className={styles.inputField}
            value={value || 0}
            onChange={(e) => handlePropChange(field.key, Number(e.target.value))}
          />
        )}
        {field.type === 'select' && field.options && <FieldSelect value={value} onChange={(v) => handlePropChange(field.key, field.key === 'columns' ? Number(v) : v)} options={field.options} />}
        {field.type === 'list' && field.listFields && (
          <ListEditor
            items={Array.isArray(value) ? value : []}
            listFields={field.listFields}
            onChange={(items) => handlePropChange(field.key, items)}
            isStringList={field.key === 'links'}
          />
        )}
      </div>
    );
  };

  // Get editor config for the active section
  const editorConfig = activeSection ? sectionEditorConfigs[activeSection.type] : null;
  // Get new config-driven section config (takes priority over legacy editorConfig)
  const sectionConfig = activeSection ? getSectionConfig(activeSection.type) : undefined;

  return (
    <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
      {isColorWidgetOpen ? (
        <>
          <div className={styles.panelHeader}>
            <div className={styles.phLeft}>
              <button className={styles.iconBtn} onClick={() => setColorWidgetOpen(false)}>
                <ChevronRight size={20} className={styles.backIcon} />
              </button>
              <h3 className={styles.fw600}>Color Palette</h3>
            </div>
          </div>
          <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '8px' }}>Presets</h4>
            {presets.map((t, i) => (
              <div
                key={i}
                className={`${styles.themeCard} ${theme.presetName === t.name ? styles.tcActive : ''}`}
                style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px' }}
                onClick={() => updateTheme({ presetName: t.name, colors: t.colors })}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                  <span className={styles.tcName} style={{ fontSize: '14px' }}>{t.name}</span>
                  {theme.presetName === t.name && <Check size={16} color="var(--primary)" />}
                </div>
                <div className={styles.tcColors} style={{ gap: '8px', width: '100%' }}>
                  {Object.values(t.colors).map((c, j) => (
                    <span key={j} style={{ backgroundColor: c as string, width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }}></span>
                  ))}
                </div>
              </div>
            ))}

            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>Custom Colors</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['primary', 'secondary', 'background', 'text'].map(key => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ColorPickerPopover
                      value={theme.colors?.[key as keyof typeof theme.colors] || '#000000'}
                      onChange={(val: string) => updateTheme({ presetName: 'Custom', colors: { ...theme.colors, [key]: val } as any })}
                      size="sm"
                    />
                    <span style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' }}>{key}</span>
                  </div>
                  <input
                    type="text"
                    value={theme.colors?.[key as keyof typeof theme.colors] || '#000000'}
                    onChange={(e) => updateTheme({ presetName: 'Custom', colors: { ...theme.colors, [key]: e.target.value } as any })}
                    style={{ width: '70px', fontSize: '12px', padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'monospace' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : isTypographyWidgetOpen ? (
        <>
          <div className={styles.panelHeader}>
            <div className={styles.phLeft}>
              <button className={styles.iconBtn} onClick={() => setTypographyWidgetOpen(false)}>
                <ChevronRight size={20} className={styles.backIcon} />
              </button>
              <h3 className={styles.fw600}>Typography</h3>
            </div>
          </div>
          <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {fonts.map((t, i) => (
              <div
                key={i}
                className={`${styles.themeCard} ${theme.typography?.headingFont === t.style.fontFamily ? styles.tcActive : ''}`}
                style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => updateTheme({ typography: { ...theme.typography, headingFont: t.style.fontFamily, bodyFont: t.style.fontFamily } })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', width: '32px', textAlign: 'center', color: 'var(--text-main)', ...t.style }}>Ag</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{t.name}</span>
                  </div>
                </div>
                {theme.typography?.headingFont === t.style.fontFamily && <Check size={16} color="var(--primary)" />}
              </div>
            ))}

            <div
              className={styles.themeCard}
              style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', borderStyle: 'dashed', backgroundColor: '#f8fafc', marginTop: '16px' }}
            >
              <UploadCloud size={24} color="var(--primary)" />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>Upload Custom Font</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>.ttf or .woff2 files</span>
              </div>
              <button style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '4px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                Browse files
              </button>
            </div>
          </div>
        </>
      ) : activeSection && sectionConfig ? (
        /* ======= NEW CONFIG-DRIVEN EDITOR ======= */
        <>
          <div className={styles.panelHeader}>
            <div className={styles.phLeft}>
              <button className={styles.iconBtn} onClick={closeRightSidebar}>
                <ChevronRight size={20} className={styles.backIcon} />
              </button>
              <h3 className={styles.fw600}>{activeSection.name}</h3>
            </div>
          </div>

          <TabRenderer
            tabs={sectionConfig.getTabs(
              activeSection.props?.selectedLayout || sectionConfig.layouts?.[0]?.id,
              activeSection.props
            )}
            layouts={sectionConfig.layouts}
            props={activeSection.props || {}}
            onPropChange={handlePropChange}
            sectionName={activeSection.name}
            sectionId={activeSection.id}
            sectionType={activeSection.type}
          />

          {activeSection.isHidden && (
            <div style={{ margin: '16px', padding: '12px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ffeeba' }}>
              <EyeOff size={16} style={{ flexShrink: 0 }} />
              <span>This section is currently hidden.</span>
            </div>
          )}
        </>
      ) : activeSection && editorConfig ? (
        /* ======= LEGACY FLAT EDITOR (fallback for unmigrated sections) ======= */
        <>
          <div className={styles.panelHeader}>
            <div className={styles.phLeft}>
              <button className={styles.iconBtn} onClick={closeRightSidebar}>
                <ChevronRight size={20} className={styles.backIcon} />
              </button>
              <h3 className={styles.fw600}>{activeSection.name}</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                const tabs = ['content', 'design', 'visibility', 'advanced', 'abtest', 'personalize'] as const;
                const idx = tabs.indexOf(activeEditorTab);
                setActiveEditorTab(tabs[(idx - 1 + tabs.length) % tabs.length]);
              }}
              style={{ padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}
              title="Previous tab"
              aria-label="Previous tab"
            >
              <ChevronLeft size={16} />
            </button>
            <div className={styles.propTabs} style={{ overflowX: 'auto', flexWrap: 'nowrap', borderBottom: 'none', flex: 1, display: 'flex', scrollbarWidth: 'none' }}>
              {[
                { id: 'content', label: 'Content' },
                { id: 'design', label: 'Design' },
                { id: 'visibility', label: 'Visibility' },
                { id: 'advanced', label: 'Advanced' },
                { id: 'abtest', label: 'A/B test' },
                { id: 'personalize', label: 'Personalize' },
              ].map(tab => (
                <div
                  key={tab.id}
                  className={`${styles.propTab} ${activeEditorTab === tab.id ? styles.activePropTab : ''}`}
                  onClick={() => setActiveEditorTab(tab.id as any)}
                  style={{ flex: '1 0 auto', padding: '12px 10px', cursor: 'pointer', textAlign: 'center', fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  {tab.label}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const tabs = ['content', 'design', 'visibility', 'advanced', 'abtest', 'personalize'] as const;
                const idx = tabs.indexOf(activeEditorTab);
                setActiveEditorTab(tabs[(idx + 1) % tabs.length]);
              }}
              style={{ padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}
              title="Next tab"
              aria-label="Next tab"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeEditorTab === 'content' ? (
              <>
                {editorConfig
                  .filter(f => f.type !== 'color')
                  .map(field => renderField(field))
                }
              </>
            ) : activeEditorTab === 'design' ? (
              <>
                <div className={styles.propSection}>
                  <h4 className={styles.fw600} style={{ marginBottom: '12px' }}>Layout Options</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Content Width</span>
                      <select
                        className={styles.inputField}
                        style={{ padding: '8px' }}
                        value={activeSection?.props?.layout?.width || 'full'}
                        onChange={(e) => handlePropChange('layout', { ...activeSection?.props?.layout, width: e.target.value })}
                      >
                        <option value="narrow">Narrow (640px)</option>
                        <option value="standard">Standard (1024px)</option>
                        <option value="wide">Wide (1280px)</option>
                        <option value="full">Full Width (100%)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.propSection} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <h4 className={styles.fw600} style={{ marginBottom: '12px' }}>Spacing (Padding)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Top (px)</span>
                      <input
                        type="number" className={styles.inputField} placeholder="e.g. 64"
                        value={activeSection?.props?.spacing?.paddingTop || ''}
                        onChange={(e) => handlePropChange('spacing', { ...activeSection?.props?.spacing, paddingTop: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bottom (px)</span>
                      <input
                        type="number" className={styles.inputField} placeholder="e.g. 64"
                        value={activeSection?.props?.spacing?.paddingBottom || ''}
                        onChange={(e) => handlePropChange('spacing', { ...activeSection?.props?.spacing, paddingBottom: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.propSection} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <h4 className={styles.fw600} style={{ marginBottom: '12px' }}>Section Colors</h4>
                  {editorConfig
                    .filter(f => f.type === 'color')
                    .map(field => renderField(field))
                  }
                  {editorConfig.filter(f => f.type === 'color').length === 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>This section uses the global theme colors.</p>
                  )}
                </div>
              </>
            ) : activeEditorTab === 'visibility' ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Devices */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: visibilitySectionsOpen.devices ? '16px' : '0' }}
                    onClick={() => setVisibilitySectionsOpen(prev => ({ ...prev, devices: !prev.devices }))}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Monitor size={16} />
                      <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>DEVICES</span>
                    </div>
                    {visibilitySectionsOpen.devices ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {visibilitySectionsOpen.devices && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['desktop', 'tablet', 'mobile'].map((dev) => (
                        <div key={dev} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            onClick={() => {
                              const currentVis = activeSection?.props?.visibility || {};
                              const devKey = dev as 'desktop' | 'tablet' | 'mobile';
                              const currentVal = currentVis[devKey] !== false;
                              handlePropChange('visibility', { ...currentVis, [devKey]: !currentVal });
                            }}
                            style={{
                              width: '40px', height: '22px', borderRadius: '12px',
                              backgroundColor: (activeSection?.props?.visibility?.[dev as any] !== false) ? 'var(--primary)' : '#e2e8f0',
                              border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s'
                            }}
                          >
                            <div style={{
                              width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white',
                              position: 'absolute', top: '3px',
                              left: (activeSection?.props?.visibility?.[dev as any] !== false) ? '21px' : '3px',
                              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }} />
                          </button>
                          <span style={{ fontSize: '14px', textTransform: 'capitalize', color: 'var(--text-main)' }}>{dev}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: visibilitySectionsOpen.schedule ? '12px' : '0' }}
                    onClick={() => setVisibilitySectionsOpen(prev => ({ ...prev, schedule: !prev.schedule }))}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>SCHEDULE</span>
                    </div>
                    {visibilitySectionsOpen.schedule ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {visibilitySectionsOpen.schedule && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Leave blank to show always. ISO date-time (e.g. 2025-12-31T00:00:00Z).</p>

                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-8px', left: '12px', background: 'white', padding: '0 4px', fontSize: '11px', color: 'var(--text-muted)' }}>Show from</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                          <input type="text" placeholder="mm/dd/yyyy, --:-- --" style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }}
                            value={activeSection?.props?.visibility?.showFrom || ''}
                            onChange={(e) => handlePropChange('visibility', { ...activeSection?.props?.visibility, showFrom: e.target.value })}
                          />
                          <Calendar size={16} style={{ color: 'var(--text-main)' }} />
                        </div>
                      </div>

                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-8px', left: '12px', background: 'white', padding: '0 4px', fontSize: '11px', color: 'var(--text-muted)' }}>Hide after</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                          <input type="text" placeholder="mm/dd/yyyy, --:-- --" style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }}
                            value={activeSection?.props?.visibility?.hideAfter || ''}
                            onChange={(e) => handlePropChange('visibility', { ...activeSection?.props?.visibility, hideAfter: e.target.value })}
                          />
                          <Calendar size={16} style={{ color: 'var(--text-main)' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Audience */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: visibilitySectionsOpen.audience ? '12px' : '0' }}
                    onClick={() => setVisibilitySectionsOpen(prev => ({ ...prev, audience: !prev.audience }))}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>AUDIENCE</span>
                    </div>
                    {visibilitySectionsOpen.audience ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {visibilitySectionsOpen.audience && (
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '-8px', left: '12px', background: 'white', padding: '0 4px', fontSize: '11px', color: 'var(--text-muted)' }}>Show to</span>
                      <select
                        style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '14px', appearance: 'none', backgroundColor: 'transparent' }}
                        value={activeSection?.props?.visibility?.audience || 'everyone'}
                        onChange={(e) => handlePropChange('visibility', { ...activeSection?.props?.visibility, audience: e.target.value })}
                      >
                        <option value="everyone">Everyone</option>
                        <option value="logged-in">Logged in users</option>
                        <option value="guests">Guests (not logged in)</option>
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '14px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                    </div>
                  )}
                </div>

                {/* Segment */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>SEGMENT</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>Everyone</span>
                    </div>
                    <Edit2 size={14} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  This tab is coming soon.
                </p>
              </div>
            )}
          </div>

          {activeSection.isHidden && (
            <div style={{ margin: '16px', padding: '12px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ffeeba' }}>
              <EyeOff size={16} style={{ flexShrink: 0 }} />
              <span>This section is currently hidden.</span>
            </div>
          )}
        </>
      ) : null}
    </aside>
  );
};
