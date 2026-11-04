import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PageTabConfig, PageLayoutOption } from '../pageConfigs/types';
import { FieldRenderer, isConditionMet } from './FieldRenderer';
import { CollapsibleGroup } from './CollapsibleGroup';
import { SpacingEditor, SectionWidthEditor } from './SpacingEditor';
import { VisibilityEditor } from './VisibilityEditor';
import { AdvancedEditor } from './AdvancedEditor';
import styles from '../../../pages/editor/EditorLayout.module.css';

interface PageTabRendererProps {
  tabs: PageTabConfig[];
  layouts?: PageLayoutOption[];
  props: Record<string, any>;
  onPropChange: (key: string, value: any) => void;
  pageName: string;
}

export const PageTabRenderer: React.FC<PageTabRendererProps> = ({
  tabs,
  layouts: _layouts,
  props,
  onPropChange,
  pageName: _pageName,
}) => {
  // Build the full list of available tabs (dynamic feature tabs first)
  const allTabs: { id: string; label: string }[] = [];

  // Dynamic tabs from config
  tabs.forEach((tab) => {
    if (tab.showWhen && !isConditionMet(tab.showWhen, props)) return;
    allTabs.push({ id: tab.id, label: tab.label });
  });

  // Universal look & appearance tabs
  allTabs.push({ id: '__look__', label: 'Look' });
  allTabs.push({ id: '__visibility__', label: 'Visibility' });
  allTabs.push({ id: '__advanced__', label: 'Advanced' });

  const [activeTabId, setActiveTabId] = useState(allTabs[0]?.id || '__look__');
  const tabsRef = useRef<HTMLDivElement>(null);

  // Ensure active tab is valid
  const validTabId = allTabs.find((t) => t.id === activeTabId) ? activeTabId : allTabs[0]?.id;

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };

  const renderTabContent = () => {
    // 1. Look & Spacing tab
    if (validTabId === '__look__') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <SectionWidthEditor
            value={props.pageWidth || 'standard'}
            onChange={(v) => onPropChange('pageWidth', v)}
          />
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <SpacingEditor
              label="Page Content Padding"
              value={props._padding || {}}
              onChange={(v) => onPropChange('_padding', v)}
            />
          </div>
        </div>
      );
    }

    // 2. Visibility tab
    if (validTabId === '__visibility__') {
      return (
        <VisibilityEditor
          value={props.visibility || {}}
          onChange={(v) => onPropChange('visibility', v)}
        />
      );
    }

    // 3. Advanced tab
    if (validTabId === '__advanced__') {
      return (
        <AdvancedEditor
          value={props._advanced || {}}
          onChange={(v) => onPropChange('_advanced', v)}
        />
      );
    }

    // 4. Dynamic tab from config
    const tab = tabs.find((t) => t.id === validTabId);
    if (!tab) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {tab.groups.map((group) => {
          if (group.showWhen && !isConditionMet(group.showWhen, props)) return null;
          const visibleFields = group.fields.filter(f => !f.showWhen || isConditionMet(f.showWhen, props));
          if (visibleFields.length === 0) return null;

          return (
            <CollapsibleGroup key={group.id} label={group.label} defaultCollapsed={group.defaultCollapsed}>
              {visibleFields.map((field) => (
                <FieldRenderer
                  key={field.key}
                  field={field as any} // Cast safely since FieldRenderer shares the type
                  value={props[field.key]}
                  onChange={onPropChange}
                  allProps={props}
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
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
        <button onClick={() => scrollTabs('left')} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
          <ChevronLeft size={16} />
        </button>
        <div ref={tabsRef} className={styles.propTabs} style={{ overflowX: 'auto', flexWrap: 'nowrap', borderBottom: 'none', flex: 1 }}>
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
        <button onClick={() => scrollTabs('right')} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={styles.propContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {renderTabContent()}
      </div>
    </>
  );
};
