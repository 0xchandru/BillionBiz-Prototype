import React from 'react';
import {
  Building2, Paintbrush, FileText, Link2, MessageCircle, Globe,
  Search, Share2, ShieldCheck, Layers,
  PanelLeftClose, PanelLeftOpen, ChevronRight,
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import type { BrandSection } from '../../../store/landingEditorStore';
import styles from '../../../pages/editor/EditorLayout.module.css';

interface NavItemDef {
  id: BrandSection;
  label: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
  tag?: string;
}

interface NavGroupDef {
  title: string;
  items: NavItemDef[];
}

const BRAND_GROUPS: NavGroupDef[] = [
  {
    title: 'Identity',
    items: [
      { id: 'store-profile', label: 'Store Profile', description: 'Name, tagline, description & contacts', icon: Building2 },
      { id: 'logo-favicon', label: 'Logo & Favicon', description: 'Store logos, browser favicon & brand marks', icon: Paintbrush },
      { id: 'business-details', label: 'Business Details', description: 'Legal name, address & operating hours', icon: FileText },
    ]
  },
  {
    title: 'Online Presence',
    items: [
      { id: 'social-profiles', label: 'Social Profiles', description: 'Instagram, Facebook, X, YouTube & LinkedIn', icon: Link2 },
      { id: 'whatsapp', label: 'WhatsApp Widget', description: 'Floating chat button & greeting message', icon: MessageCircle },
      { id: 'domain-urls', label: 'Domain & URLs', description: 'Custom domain & storefront links', icon: Globe },
    ]
  },
  {
    title: 'SEO & Discovery',
    items: [
      { id: 'global-seo', label: 'Global SEO', description: 'Meta title, description, keywords & canonical', icon: Search },
      { id: 'social-sharing', label: 'Social Sharing (OG)', description: 'Open Graph preview & social cards', icon: Share2 },
      { id: 'indexing', label: 'Indexing & Sitemap', description: 'Robots.txt, XML sitemap & search bots', icon: ShieldCheck },
      { id: 'page-seo', label: 'Per-Page SEO', description: 'Page metadata & search engine overrides', icon: Layers },
    ]
  }
];

export const BrandPanel: React.FC = () => {
  const {
    brandSection, storeBrandSection, setBrandSection,
    isLeftSidebarCollapsed, setLeftSidebarCollapsed,
    setActivePanel,
  } = useLandingEditorStore();

  const currentSection = brandSection || storeBrandSection || 'store-profile';

  return (
    <div className={styles.contextPanelInner}>
      <div className={styles.contextPanelHeader}>
        <div>
          <h3 className={styles.contextPanelTitle}>Brand &amp; Identity</h3>
          <p className={styles.contextPanelDesc}>Identity, online presence &amp; SEO discovery</p>
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
        {BRAND_GROUPS.map((grp, idx) => (
          <div key={idx} className={styles.navGroup}>
            <div className={styles.navGroupTitle}>{grp.title}</div>
            {grp.items.map(item => {
              const isSelected = 
                currentSection === item.id ||
                (item.id === 'store-profile' && currentSection === 'general') ||
                (item.id === 'logo-favicon' && currentSection === 'branding') ||
                (item.id === 'social-profiles' && currentSection === 'socials') ||
                (item.id === 'global-seo' && currentSection === 'seo');
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`${styles.navItem} ${isSelected ? styles.navItemActive : ''}`}
                  onClick={() => {
                    setBrandSection(item.id);
                    setActivePanel('brand');
                  }}
                >
                  <div className={`${styles.navItemIcon} ${isSelected ? styles.navItemIconActive : ''}`}>
                    <Icon size={16} />
                  </div>
                  <div className={styles.navItemContent}>
                    <span className={`${styles.navItemLabel} ${isSelected ? styles.navItemLabelActive : ''}`}>{item.label}</span>
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
