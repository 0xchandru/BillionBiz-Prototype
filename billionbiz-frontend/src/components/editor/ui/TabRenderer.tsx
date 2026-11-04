import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { SectionTabConfig, SectionLayoutOption } from '../sectionConfigs/types';
import { FieldRenderer, isConditionMet } from './FieldRenderer';
import { CollapsibleGroup } from './CollapsibleGroup';
import { LayoutSelector } from './LayoutSelector';
import { SpacingEditor, SectionWidthEditor } from './SpacingEditor';
import { VisibilityEditor } from './VisibilityEditor';
import { AdvancedEditor } from './AdvancedEditor';
import { getDefaultPadding } from '../SectionRenderer';
import { useContentState } from '../../../hooks/useContentState';
import styles from '../../../pages/editor/EditorLayout.module.css';

interface TabRendererProps {
  /** Dynamic tabs from the section config */
  tabs: SectionTabConfig[];
  /** Available layouts (if any) */
  layouts?: SectionLayoutOption[];
  /** Current section props */
  props: Record<string, any>;
  /** Callback to update a prop */
  onPropChange: (key: string, value: any) => void;
  /** Section name for display */
  sectionName: string;
  /** Section instance ID (for content state tracking) */
  sectionId?: string;
  /** Section type key (for content state tracking) */
  sectionType?: string;
}

export const TabRenderer: React.FC<TabRendererProps> = ({
  tabs,
  layouts,
  props,
  onPropChange,
  sectionName: _sectionName,
  sectionId,
  sectionType,
}) => {
  // ---- Content State Hook ----
  const contentState = useContentState({
    sectionId: sectionId || '',
    sectionType: sectionType || '',
    props,
    onPropChange,
  });

  // Wrap onPropChange to auto-detect manual edits to content fields
  const wrappedOnPropChange = useCallback(
    (key: string, value: any) => {
      onPropChange(key, value);
      // If the edited field is a content field and status is still 'default',
      // mark the content config as customized so the Clear button disappears
      if (
        sectionId &&
        sectionType &&
        contentState.contentStatus === 'default' &&
        contentState.contentFieldKeys.includes(key)
      ) {
        // Pass the updated value immediately instead of using a timeout
        // which might capture a stale closure of props
        contentState.markAsCustomized({ [key]: value });
      }
    },
    [onPropChange, sectionId, sectionType, contentState]
  );

  // Build the full list of available tabs
  const allTabs: { id: string; label: string }[] = [];

  // Templates tab for Header and Footer
  if (sectionType === 'Header' || sectionType === 'Footer') {
    allTabs.push({ id: '__templates__', label: 'Templates' });
  }

  // Always have a Look tab since we're merging Spacing into it
  allTabs.push({ id: '__look__', label: 'Look' });

  // Dynamic tabs from config (filtered by conditions)
  tabs.forEach((tab) => {
    if (tab.showWhen && !isConditionMet(tab.showWhen, props)) return;
    allTabs.push({ id: tab.id, label: tab.label });
  });

  // Universal tabs
  allTabs.push({ id: '__visibility__', label: 'Visibility' });
  allTabs.push({ id: '__advanced__', label: 'Advanced' });

  const [activeTabId, setActiveTabId] = useState(allTabs[0]?.id || '__look__');
  const tabsRef = useRef<HTMLDivElement>(null);

  // Ensure active tab is valid
  const validTabId = allTabs.find((t) => t.id === activeTabId) ? activeTabId : allTabs[0]?.id;

  // Check if the current tab is a "content" tab (for showing the Clear button)
  const isContentTab = validTabId === 'content';

  // Only show Clear button when content is in default (untouched) state
  const isHeaderOrFooter = sectionType ? ['Header', 'Footer', 'AnnouncementBar', 'UtilityBar', 'FooterMenu', 'FooterText'].includes(sectionType) : false;
  const showClearButton = isContentTab && sectionId && sectionType && !isHeaderOrFooter && contentState.contentStatus === 'default';

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };

  // Handle layout change through the content state system
  const handleLayoutChange = (layoutId: string) => {
    if (sectionId && sectionType) {
      contentState.handleLayoutChange(layoutId);
    } else {
      // Fallback for sections without content state tracking
      onPropChange('selectedLayout', layoutId);
    }
  };

  // Render the content of the active tab
  const renderTabContent = () => {
    // Templates tab for Header and Footer
    if (validTabId === '__templates__') {
      if (sectionType === 'Header') {
        return (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
                Header Templates &amp; Variants
              </span>
              <div className={styles.globalPresetGrid}>
                {[
                  { id: 'classic', layoutId: 'logo-left', title: 'Classic Brand', desc: 'Left logo & right navigation' },
                  { id: 'centered', layoutId: 'logo-center', title: 'Centered Split', desc: 'Logo center & split menu' },
                  { id: 'mega-menu', layoutId: 'nav-below', title: 'Mega Menu', desc: 'Category-rich commerce' },
                  { id: 'compact', layoutId: 'minimal', title: 'Minimal Sticky', desc: 'Clean single-row bar' }
                ].map((preset) => {
                  const isPresetActive = (props?.preset || 'classic') === preset.id || props?.selectedLayout === preset.layoutId;
                  return (
                    <div 
                      key={preset.id}
                      className={`${styles.globalPresetCard} ${isPresetActive ? styles.globalPresetCardActive : ''}`}
                      onClick={() => {
                        onPropChange('preset', preset.id);
                        handleLayoutChange(preset.layoutId);
                      }}
                    >
                      <span className={styles.globalPresetTitle}>{preset.title}</span>
                      <span className={styles.globalPresetDesc}>{preset.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Feature Toggles for Header */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
                Header Options
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Sticky on Scroll</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Keep header visible while scrolling</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={props?.sticky !== false}
                    onChange={(e) => onPropChange('sticky', e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Search Bar / Icon</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Storefront product search</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={props?.showSearch !== false}
                    onChange={(e) => onPropChange('showSearch', e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Shopping Cart</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Cart badge &amp; drawer link</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={props?.showCart !== false}
                    onChange={(e) => onPropChange('showCart', e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Customer Account</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Profile icon &amp; sign in link</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={props?.showAccount !== false}
                    onChange={(e) => onPropChange('showAccount', e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      } else if (sectionType === 'Footer') {
        return (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
                Footer Templates &amp; Variants
              </span>
              <div className={styles.globalPresetGrid}>
                {[
                  { id: 'multi-column', layoutId: 'standard', title: 'Multi-Column', desc: 'Corporate 4-column layout' },
                  { id: 'minimal', layoutId: 'minimal', title: 'Minimalist', desc: 'Clean copyright & socials' },
                  { id: 'newsletter', layoutId: 'centered', title: 'Newsletter Focus', desc: 'Centered lead capture' },
                  { id: 'app-style', layoutId: 'split', title: 'Modern App', desc: 'Badge cards & links' }
                ].map((preset) => {
                  const isPresetActive = (props?.preset || 'multi-column') === preset.id || props?.selectedLayout === preset.layoutId;
                  return (
                    <div 
                      key={preset.id}
                      className={`${styles.globalPresetCard} ${isPresetActive ? styles.globalPresetCardActive : ''}`}
                      onClick={() => {
                        onPropChange('preset', preset.id);
                        handleLayoutChange(preset.layoutId);
                      }}
                    >
                      <span className={styles.globalPresetTitle}>{preset.title}</span>
                      <span className={styles.globalPresetDesc}>{preset.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Feature Toggles for Footer */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
                Footer Options
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Payment Badges</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Visa, Mastercard, PayPal &amp; UPI icons</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={props?.showPaymentIcons !== false && props?.showPayment !== false}
                    onChange={(e) => {
                      onPropChange('showPaymentIcons', e.target.checked);
                      onPropChange('showPayment', e.target.checked);
                    }}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Social Media Icons</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Instagram, Facebook, Twitter links</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={props?.showSocials !== false && props?.showSocial !== false}
                    onChange={(e) => {
                      onPropChange('showSocials', e.target.checked);
                      onPropChange('showSocial', e.target.checked);
                    }}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    // Look tab (now includes Spacing and Global Theme elements)
    if (validTabId === '__look__') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {layouts && layouts.length > 0 && (
            <LayoutSelector
              layouts={layouts}
              value={props.selectedLayout || layouts[0]?.id || ''}
              onChange={handleLayoutChange}
            />
          )}

          {layouts && layouts.length > 0 && <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }} />}
          
          <SectionWidthEditor
            value={props.sectionWidth || 'wide'}
            onChange={(v) => onPropChange('sectionWidth', v)}
          />
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <SpacingEditor
              label="Padding"
              value={props._padding || getDefaultPadding(sectionType || '')}
              onChange={(v) => onPropChange('_padding', v)}
            />
          </div>
          <SpacingEditor
            label="Margin"
            value={props._margin || {}}
            onChange={(v) => onPropChange('_margin', v)}
            showLeftRight={false}
          />
        </div>
      );
    }

    // Visibility tab
    if (validTabId === '__visibility__') {
      return (
        <VisibilityEditor
          value={props.visibility || {}}
          onChange={(v) => onPropChange('visibility', v)}
        />
      );
    }

    // Advanced tab
    if (validTabId === '__advanced__') {
      return (
        <AdvancedEditor
          value={props._advanced || {}}
          onChange={(v) => onPropChange('_advanced', v)}
        />
      );
    }

    // Dynamic tab from config
    const tab = tabs.find((t) => t.id === validTabId);
    if (!tab) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {tab.groups.map((group) => {
          // Check group-level condition
          if (group.showWhen && !isConditionMet(group.showWhen, props)) return null;

          // Filter fields by condition
          const visibleFields = group.fields.filter(
            (f) => !f.showWhen || isConditionMet(f.showWhen, props)
          );

          if (visibleFields.length === 0) return null;

          return (
            <CollapsibleGroup
              key={group.id}
              label={group.label}
              defaultCollapsed={group.defaultCollapsed}
            >
              {visibleFields.map((field) => (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  value={props[field.key]}
                  onChange={wrappedOnPropChange}
                  allProps={props}
                  sectionType={sectionType}
                />
              ))}
            </CollapsibleGroup>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        background: '#f8fafc',
      }}>
        <button
          onClick={() => scrollTabs('left')}
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <div
          ref={tabsRef}
          className={styles.propTabs}
          style={{ overflowX: 'auto', flexWrap: 'nowrap', borderBottom: 'none', flex: 1 }}
        >
          {allTabs.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.propTab} ${validTabId === tab.id ? styles.activePropTab : ''}`}
              onClick={() => setActiveTabId(tab.id)}
              style={{ flex: '0 0 auto', padding: '12px 14px', whiteSpace: 'nowrap' }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <button
          onClick={() => scrollTabs('right')}
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Tab content */}
      <div className={styles.propContent} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {renderTabContent()}
      </div>

      {/* Clear Default Content button — only visible when content is in default (untouched) state */}
      {showClearButton && (
        <div style={{
          position: 'sticky',
          bottom: 0,
          padding: '12px 16px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: '#fafbfc',
          zIndex: 5,
        }}>
          <button
            onClick={contentState.clearContent}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              backgroundColor: '#fff',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            <Trash2 size={14} />
            Clear Default Content
          </button>
        </div>
      )}
    </>
  );
};
