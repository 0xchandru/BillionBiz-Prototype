import React from 'react';
import {
  Search, Share2, Globe2, FileText, PanelLeftClose, PanelLeftOpen,
  ChevronRight, ChartNoAxesCombined
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import styles from '../../../pages/editor/EditorLayout.module.css';

const ITEMS = [
  {
    id: 'global-seo' as const,
    title: 'Search appearance',
    description: 'Default titles, descriptions and canonical settings',
    icon: Search
  },
  {
    id: 'social-sharing' as const,
    title: 'Social previews',
    description: 'How shared links appear across social platforms',
    icon: Share2
  },
  {
    id: 'indexing' as const,
    title: 'Indexing & sitemap',
    description: 'Search visibility and crawler preferences',
    icon: Globe2
  },
  {
    id: 'page-seo' as const,
    title: 'Page metadata',
    description: 'Search snippets for individual storefront pages',
    icon: FileText
  }
];

export const GrowthPanel: React.FC = () => {
  const {
    brandSection,
    setBrandSection,
    setActivePanel,
    isLeftSidebarCollapsed,
    setLeftSidebarCollapsed,
    setRightSidebarOpen
  } = useLandingEditorStore();

  return (
    <div className={styles.contextPanelInner}>
      <div className={styles.contextPanelHeader}>
        <div>
          <h3 className={styles.contextPanelTitle}>Growth</h3>
          <p className={styles.contextPanelDesc}>Search discovery and storefront sharing</p>
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
        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>DISCOVERY</div>
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active = brandSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                onClick={() => {
                  setBrandSection(item.id);
                  setActivePanel('growth');
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

        <div style={{ margin: '12px 12px 0', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--panel-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
            <ChartNoAxesCombined size={15} />
            Growth health
          </div>
          <p style={{ margin: '7px 0 0', fontSize: 11, lineHeight: 1.5, color: 'var(--text-muted)' }}>
            Configure search and sharing metadata here. Traffic and conversion analytics should be connected only after a verified analytics provider is configured.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrowthPanel;
