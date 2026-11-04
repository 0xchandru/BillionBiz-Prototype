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
    title: 'Store Operations',
    items: [
      { id: 'launch-checklist', label: 'Launch Checklist', description: 'Readiness progress & essential setup', icon: CheckCircle2 },
      { id: 'language-region', label: 'Language & Region', description: 'Display language, currency & units', icon: Globe },
      { id: 'notifications', label: 'Alerts & Notifications', description: 'Announcement banners & order alerts', icon: Bell },
    ]
  },
  {
    title: 'Policies & Legal',
    items: [
      { id: 'refund-policy', label: 'Refund & Returns', description: 'Return conditions & refund rules', icon: Shield },
      { id: 'privacy-policy', label: 'Privacy Policy', description: 'Data privacy & cookies consent', icon: FileText },
      { id: 'terms-of-service', label: 'Terms of Service', description: 'Customer terms & conditions', icon: FileText },
      { id: 'shipping-policy', label: 'Shipping & Delivery', description: 'Zones, timeframes & shipping policy', icon: FileText },
    ]
  },
  {
    title: 'Advanced',
    items: [
      { id: 'integrations', label: 'Integrations', description: 'Google Analytics & Meta Pixel', icon: Plug, tag: 'Soon' },
      { id: 'custom-code', label: 'Custom Code', description: 'Head & body script injection', icon: Code, tag: 'Soon' },
      { id: 'api-webhooks', label: 'API & Webhooks', description: 'Developer keys & endpoints', icon: Key, tag: 'Soon' },
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
          <h3 className={styles.contextPanelTitle}>Store Settings</h3>
          <p className={styles.contextPanelDesc}>Operations, legal policies &amp; advanced config</p>
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
