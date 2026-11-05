
import React from 'react';
import {
  Building2, Image, Globe, PanelLeftClose, PanelLeftOpen,
  ChevronRight, Store, Share2
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import type { BrandSection } from '../../../store/landingEditorStore';
import styles from '../../../pages/editor/EditorLayout.module.css';

interface NavItem {
  id: BrandSection;
  title: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const GROUPS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'STORE IDENTITY',
    items: [
      { id: 'store-profile', title: 'Brand profile', description: 'Public name, tagline and brand voice', icon: Store },
      { id: 'business-details', title: 'Business identity', description: 'The legal store identity and account details', icon: Building2 },
      { id: 'logo-favicon', title: 'Brand assets', description: 'Logo, favicon and image assets', icon: Image },
    ]
  },
  {
    title: 'CONNECTED CHANNELS',
    items: [
      { id: 'social-profiles', title: 'Social profiles', description: 'Connect public social destinations', icon: Share2 },
      { id: 'domain-urls', title: 'Domains', description: 'Store subdomain and custom domains', icon: Globe },
    ]
  }
];

export const BrandPanel: React.FC = () => {
  const {
    brandSection,
    setBrandSection,
    setActivePanel,
    setRightSidebarOpen,
    isLeftSidebarCollapsed,
    setLeftSidebarCollapsed
  } = useLandingEditorStore();

  return (
    <div className={styles.contextPanelInner}>
      <div className={styles.contextPanelHeader}>
        <div>
          <h3 className={styles.contextPanelTitle}>Identity</h3>
          <p className={styles.contextPanelDesc}>How customers recognize and reach your store</p>
        </div>
        <button
          type="button"
          onClick={() => setLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          className={styles.collapseBtn}
          title={isLeftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isLeftSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className={styles.contextPanelScroll}>
        {GROUPS.map((group) => (
          <div key={group.title} className={styles.navGroup}>
            <div className={styles.navGroupTitle}>{group.title}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = brandSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                  onClick={() => {
                    setBrandSection(item.id);
                    setActivePanel('brand');
                    setRightSidebarOpen(true);
                  }}
                  style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 0 }}
                >
                  <span className={`${styles.navItemIcon} ${active ? styles.navItemIconActive : ''}`}>
                    <Icon size={16} />
                  </span>
                  <span className={styles.navItemContent}>
                    <span className={`${styles.navItemLabel} ${active ? styles.navItemLabelActive : ''}`}>{item.title}</span>
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

export default BrandPanel;
