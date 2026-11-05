import React from 'react';
import {
  CheckCircle2, Globe, Bell, Shield, FileText,
  Plug, Code, Key, LockKeyhole, PanelLeftClose, PanelLeftOpen, ChevronRight, Search
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import type { SettingsSection } from '../../../store/landingEditorStore';
import styles from '../../../pages/editor/EditorLayout.module.css';

interface NavItemDef {
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
  status?: string;
}
interface NavGroupDef {
  title: string;
  items: NavItemDef[];
}

const SETTINGS_GROUPS: NavGroupDef[] = [
  {
    title: 'STORE OPERATIONS',
    items: [
      { id: 'launch-checklist', label: 'Launch readiness', description: 'Setup checks from your current store data', icon: CheckCircle2 },
      { id: 'language-region', label: 'Regional defaults', description: 'Currency and store timezone', icon: Globe },
      { id: 'store-access', label: 'Store access', description: 'Password protection and maintenance mode', icon: LockKeyhole },
      { id: 'notifications', label: 'Announcements', description: 'Storefront announcement bar and messages', icon: Bell },
    ]
  },
  {
    title: 'POLICIES & LEGAL',
    items: [
      { id: 'refund-policy', label: 'Refund & returns', description: 'Customer refund and return policy', icon: Shield },
      { id: 'privacy-policy', label: 'Privacy policy', description: 'Customer privacy and data terms', icon: FileText },
      { id: 'terms-of-service', label: 'Terms of service', description: 'Customer terms and conditions', icon: FileText },
      { id: 'shipping-policy', label: 'Shipping & delivery', description: 'Delivery policy and timeframes', icon: FileText },
    ]
  },
  {
    title: 'CONNECTIONS & DEVELOPER',
    items: [
      { id: 'integrations', label: 'Integrations', description: 'Analytics and marketing providers', icon: Plug, status: 'Not connected' },
      { id: 'custom-code', label: 'Custom code', description: 'Controlled head and body integrations', icon: Code, status: 'Not connected' },
      { id: 'api-webhooks', label: 'API & webhooks', description: 'Developer credentials and event endpoints', icon: Key, status: 'Not connected' },
    ]
  }
];

export const SettingsPanel: React.FC = () => {
  const {
    settingsSection,
    setSettingsSection,
    isLeftSidebarCollapsed,
    setLeftSidebarCollapsed,
    setActivePanel,
  } = useLandingEditorStore();

  const currentSection = settingsSection || 'launch-checklist';

  return (
    <div className={styles.contextPanelInner}>
      <div className={styles.contextPanelHeader}>
        <div>
          <h3 className={styles.contextPanelTitle}>Store setup</h3>
          <p className={styles.contextPanelDesc}>Operational defaults, legal pages and connections</p>
        </div>
        <button
          type="button"
          onClick={() => setLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          className={styles.collapseBtn}
          title={isLeftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isLeftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isLeftSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className={styles.contextPanelScroll}>
        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>DISCOVERY</div>
          <button
            type="button"
            className={styles.navItem}
            onClick={() => setActivePanel('growth')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left', border: 0, background: 'transparent', font: 'inherit', cursor: 'pointer' }}
          >
            <span className={styles.navItemIcon}><Search size={16} /></span>
            <span className={styles.navItemContent}>
              <span className={styles.navItemLabel}>Search & SEO</span>
              <span className={styles.navItemPath}>Search appearance, social previews, and indexing</span>
            </span>
            <ChevronRight size={14} className={styles.navItemChevron} />
          </button>
        </div>
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.title} className={styles.navGroup}>
            <div className={styles.navGroupTitle}>{group.title}</div>
            {group.items.map((item) => {
              const selected = currentSection === item.id ||
                (item.id === 'launch-checklist' && currentSection === 'setup') ||
                (item.id === 'language-region' && currentSection === 'language') ||
                (item.id === 'refund-policy' && currentSection === 'policies');
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.navItem} ${selected ? styles.navItemActive : ''}`}
                  onClick={() => {
                    setSettingsSection(item.id);
                    setActivePanel('settings');
                  }}
                  aria-current={selected ? 'page' : undefined}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    textAlign: 'left',
                    border: 0,
                    background: 'transparent',
                    font: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <span className={`${styles.navItemIcon} ${selected ? styles.navItemIconActive : ''}`}>
                    <Icon size={16} />
                  </span>
                  <span className={styles.navItemContent}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className={`${styles.navItemLabel} ${selected ? styles.navItemLabelActive : ''}`}>{item.label}</span>
                      {item.status && (
                        <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 5, background: '#f1f5f9', color: '#64748b', fontWeight: 650 }}>
                          {item.status}
                        </span>
                      )}
                    </span>
                    <span className={styles.navItemPath}>{item.description}</span>
                  </span>
                  <ChevronRight size={14} className={styles.navItemChevron} />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPanel;
