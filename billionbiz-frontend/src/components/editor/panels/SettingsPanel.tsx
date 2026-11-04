import React from 'react';
import {
  CheckCircle2, Globe, Bell, Shield, FileText,
  Plug, Code, Key,
  PanelLeftClose, PanelLeftOpen, ChevronRight,
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import type { SettingsSection } from '../../../store/landingEditorStore';
import styles from '../../../pages/editor/EditorLayout.module.css';

interface NavItemDef {
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
  tag?: string;
}

interface NavGroupDef {
  title: string;
  items: NavItemDef[];
}

const SETTINGS_GROUPS: NavGroupDef[] = [
  {
    title: 'STORE OPERATIONS',
    items: [
      { id: 'launch-checklist', label: 'Launch readiness', description: 'Setup checks based on your store data', icon: CheckCircle2 },
      { id: 'language-region', label: 'Regional defaults', description: 'Store currency and timezone', icon: Globe },
      { id: 'notifications', label: 'Announcements', description: 'Storefront announcement bar and messages', icon: Bell },
    ]
  },
  {
    title: 'POLICIES & LEGAL',
    items: [
      { id: 'refund-policy', label: 'Refund & Returns', description: 'Return conditions & refund rules', icon: Shield },
      { id: 'privacy-policy', label: 'Privacy Policy', description: 'Data privacy & cookies consent', icon: FileText },
      { id: 'terms-of-service', label: 'Terms of Service', description: 'Customer terms & conditions', icon: FileText },
      { id: 'shipping-policy', label: 'Shipping & Delivery', description: 'Zones, timeframes & shipping policy', icon: FileText },
    ]
  },
  {
    title: 'CONNECTIONS & DEVELOPER',
    items: [
      { id: 'integrations', label: 'Integrations', description: 'Connected analytics and marketing providers', icon: Plug, tag: 'Not connected' },
      { id: 'custom-code', label: 'Custom code', description: 'Controlled head and body integrations', icon: Code, tag: 'Not connected' },
      { id: 'api-webhooks', label: 'API & webhooks', description: 'Developer credentials and event endpoints', icon: Key, tag: 'Not connected' },
    ]
  }
];

export const SettingsPanel: React.FC = () => {
  const {
    settingsSection, setSettingsSection,
    isLeftSidebarCollapsed, setLeftSidebarCollapsed,
    setActivePanel,
  } = useLandingEditorStore();

  const currentSection = settingsSection || 'launch-checklist';

  return (
    <div className={styles.contextPanelInner}>
      <div className={styles.contextPanelHeader}>
        <div>
          <h3 className={styles.contextPanelTitle}>Store setup</h3>
          <p className={styles.contextPanelDesc}>Regional behavior, legal pages and platform connections</p>
        </div>
        <button
          onClick={() => setLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          className={styles.collapseBtn}
          title={isLeftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isLeftSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className={styles.contextPanelScroll}>
        {SETTINGS_GROUPS.map((grp, idx) => (
          <div key={idx} className={styles.navGroup}>
            <div className={styles.navGroupTitle}>{grp.title}</div>
            {grp.items.map(item => {
              const isSelected = 
                currentSection === item.id ||
                (item.id === 'launch-checklist' && currentSection === 'setup') ||
                (item.id === 'language-region' && currentSection === 'language') ||
                (item.id === 'refund-policy' && currentSection === 'policies');
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`${styles.navItem} ${isSelected ? styles.navItemActive : ''}`}
                  onClick={() => {
                    setSettingsSection(item.id);
                    setActivePanel('settings');
                  }}
                >
                  <div className={`${styles.navItemIcon} ${isSelected ? styles.navItemIconActive : ''}`}>
                    <Icon size={16} />
                  </div>
                  <div className={styles.navItemContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`${styles.navItemLabel} ${isSelected ? styles.navItemLabelActive : ''}`}>{item.label}</span>
                      {item.tag && (
                        <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <span className={styles.navItemPath}>{item.description}</span>
                  </div>
                  <ChevronRight size={14} className={styles.navItemChevron} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
