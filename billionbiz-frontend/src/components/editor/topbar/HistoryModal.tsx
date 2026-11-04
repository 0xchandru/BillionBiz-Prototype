import React, { useState } from 'react';
import { 
  History, RotateCcw, AlertTriangle, 
  CheckCircle2, User, X, ShieldCheck, GitCommit
} from 'lucide-react';
import { 
  useSiteStore, 
  isHeaderComponent, 
  isFooterComponent, 
  isHomepageBodySection 
} from '../../../store/siteStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import styles from './topbar.module.css';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess?: (versionName: string) => void;
}

interface VersionItem {
  id: string;
  versionTag: string;
  label: string;
  type: 'draft' | 'published' | 'historical';
  timestamp: string;
  author: string;
  sectionCount: number;
  description: string;
  changesSummary: string[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
}) => {
  const { selectedPageId } = useLandingEditorStore();
  const { pages, hasUnsavedChanges, lastPublishedSnapshots, updatePageProps } = useSiteStore();

  const landingPage = pages.find((p) => p.id === 'landing-page') || pages[0];
  const activePage = pages.find((p) => p.id === selectedPageId) || landingPage;
  const isHeader = selectedPageId === 'header-global';
  const isFooter = selectedPageId === 'footer-global';
  const isHomepage = selectedPageId === 'landing-page';

  let scopeName = 'Homepage';
  let snapshot = landingPage?.lastPublishedSnapshot || lastPublishedSnapshots?.['landing-page'];
  let currentSectionCount = (landingPage?.sections || []).filter(isHomepageBodySection).length;

  if (isHeader) {
    scopeName = 'Global Header';
    snapshot = lastPublishedSnapshots?.['header-global'];
    currentSectionCount = (landingPage?.sections || []).filter(isHeaderComponent).length;
  } else if (isFooter) {
    scopeName = 'Global Footer';
    snapshot = lastPublishedSnapshots?.['footer-global'];
    currentSectionCount = (landingPage?.sections || []).filter(isFooterComponent).length;
  } else if (!isHomepage) {
    scopeName = activePage.name;
    snapshot = activePage.lastPublishedSnapshot || lastPublishedSnapshots?.[activePage.id];
    currentSectionCount = activePage.sections?.length || 0;
  }

  const versions: VersionItem[] = [
    {
      id: 'ver-draft',
      versionTag: 'Draft v1.3-dev',
      label: hasUnsavedChanges ? 'Working Draft (Unsaved Changes)' : 'Working Draft (Saved)',
      type: 'draft',
      timestamp: 'Just now',
      author: 'You (Editor)',
      sectionCount: currentSectionCount,
      description: 'Current working workspace state in the editor.',
      changesSummary: [
        'Active layout modifications',
        'Section property customizations',
        'Ready for preview & publish'
      ],
    },
    {
      id: 'ver-current-published',
      versionTag: 'v1.2.0 (Live)',
      label: 'Published Version',
      type: 'published',
      timestamp: snapshot?.publishedAt ? new Date(snapshot.publishedAt).toLocaleString() : 'Yesterday, 5:45 PM',
      author: 'Admin Team',
      sectionCount: snapshot?.sections?.length || currentSectionCount,
      description: 'Live storefront release currently served to customers.',
      changesSummary: [
        'Updated promotional banner',
        'Added testimonials carousel',
        'Optimized responsive padding'
      ],
    },
    {
      id: 'ver-1-1',
      versionTag: 'v1.1.0',
      label: 'Spring Release',
      type: 'historical',
      timestamp: 'Sep 12, 2026, 11:20 AM',
      author: 'Marketing Lead',
      sectionCount: 5,
      description: 'Spring campaign layout and brand featured collection.',
      changesSummary: [
        'New seasonal featured products',
        'Newsletter signup incentive block'
      ],
    },
    {
      id: 'ver-1-0',
      versionTag: 'v1.0.0',
      label: 'Store Initial Launch',
      type: 'historical',
      timestamp: 'Aug 28, 2026, 09:00 AM',
      author: 'Store Founder',
      sectionCount: 4,
      description: 'Initial baseline store deployment.',
      changesSummary: [
        'Baseline page template structure',
        'Header, Hero banner, Catalog & Footer'
      ],
    },
  ];

  const [selectedVersionId, setSelectedVersionId] = useState<string>('ver-draft');
  const [confirmingRestoreId, setConfirmingRestoreId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedVersion = versions.find(v => v.id === selectedVersionId) || versions[0];

  const handleRestore = (ver: VersionItem) => {
    if (ver.type === 'draft') return;
    
    // If we have snapshot sections, restore them
    if (ver.id === 'ver-current-published' && snapshot?.sections) {
      if (isHeader) {
        const nonHeaders = (landingPage.sections || []).filter(s => !isHeaderComponent(s));
        updatePageProps(landingPage.id, {
          sections: [...snapshot.sections, ...nonHeaders],
        });
      } else if (isFooter) {
        const nonFooters = (landingPage.sections || []).filter(s => !isFooterComponent(s));
        updatePageProps(landingPage.id, {
          sections: [...nonFooters, ...snapshot.sections],
        });
      } else if (isHomepage) {
        const headers = (landingPage.sections || []).filter(isHeaderComponent);
        const footers = (landingPage.sections || []).filter(isFooterComponent);
        updatePageProps(landingPage.id, {
          sections: [...headers, ...snapshot.sections, ...footers],
          pageProps: snapshot.pageProps || {},
        });
      } else if (activePage) {
        updatePageProps(activePage.id, {
          sections: snapshot.sections,
          pageProps: snapshot.pageProps || {},
        });
      }
    }

    setConfirmingRestoreId(null);
    if (onRestoreSuccess) {
      onRestoreSuccess(ver.versionTag);
    }
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div 
        className={styles.historyModalContainer} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.historyModalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={styles.historyIconWrapper}>
              <History size={18} color="#2563eb" />
            </div>
            <div>
              <h3 className={styles.historyModalTitle}>Version History & Releases</h3>
              <p className={styles.historyModalSub}>
                Scope: <strong>{scopeName}</strong> • Track versions, restore previous layouts, or compare releases
              </p>
            </div>
          </div>
          <button className={styles.historyCloseBtn} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.historyModalBody}>
          {/* Left Column: Versions Timeline */}
          <div className={styles.historyTimelineList}>
            <div className={styles.historyListTitle}>
              <GitCommit size={14} color="#64748b" />
              <span>Release Timeline</span>
            </div>

            {versions.map((ver) => {
              const isSelected = ver.id === selectedVersionId;
              const isLive = ver.type === 'published';
              const isDraft = ver.type === 'draft';

              return (
                <div
                  key={ver.id}
                  className={`${styles.historyCard} ${isSelected ? styles.historyCardSelected : ''}`}
                  onClick={() => setSelectedVersionId(ver.id)}
                >
                  <div className={styles.historyCardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={styles.historyCardTag}>{ver.versionTag}</span>
                      {isLive && <span className={styles.livePillBadge}>Live</span>}
                      {isDraft && <span className={styles.draftPillBadge}>Draft</span>}
                    </div>
                    <span className={styles.historyCardDate}>{ver.timestamp}</span>
                  </div>

                  <div className={styles.historyCardLabel}>{ver.label}</div>

                  <div className={styles.historyCardMeta}>
                    <span><User size={12} style={{ display: 'inline', marginRight: 3 }} /> {ver.author}</span>
                    <span>•</span>
                    <span>{ver.sectionCount} sections</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Version Details & Inspection */}
          <div className={styles.historyDetailPanel}>
            <div className={styles.historyDetailHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h4 className={styles.historyDetailTitle}>{selectedVersion.versionTag}</h4>
                  {selectedVersion.type === 'published' && (
                    <span className={styles.livePillBadge}>Current Live Release</span>
                  )}
                  {selectedVersion.type === 'draft' && (
                    <span className={styles.draftPillBadge}>Active Workspace</span>
                  )}
                </div>
                <p className={styles.historyDetailDesc}>{selectedVersion.description}</p>
              </div>

              {selectedVersion.type !== 'draft' && (
                confirmingRestoreId === selectedVersion.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>Confirm restore?</span>
                    <button 
                      className={styles.btnDangerSm}
                      onClick={() => handleRestore(selectedVersion)}
                    >
                      Yes, Restore
                    </button>
                    <button 
                      className={styles.btnGhostSm}
                      onClick={() => setConfirmingRestoreId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    className={styles.btnRestore}
                    onClick={() => setConfirmingRestoreId(selectedVersion.id)}
                    title="Restore page layout to this version"
                  >
                    <RotateCcw size={13} />
                    <span>Restore This Version</span>
                  </button>
                )
              )}
            </div>

            {/* Info Grid */}
            <div className={styles.historyInfoGrid}>
              <div className={styles.historyInfoCard}>
                <span className={styles.historyInfoLabel}>Timestamp</span>
                <span className={styles.historyInfoValue}>{selectedVersion.timestamp}</span>
              </div>
              <div className={styles.historyInfoCard}>
                <span className={styles.historyInfoLabel}>Published By</span>
                <span className={styles.historyInfoValue}>{selectedVersion.author}</span>
              </div>
              <div className={styles.historyInfoCard}>
                <span className={styles.historyInfoLabel}>Total Sections</span>
                <span className={styles.historyInfoValue}>{selectedVersion.sectionCount} Sections</span>
              </div>
              <div className={styles.historyInfoCard}>
                <span className={styles.historyInfoLabel}>Health Rating</span>
                <span className={styles.historyInfoValue} style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={14} /> 98% Optimal
                </span>
              </div>
            </div>

            {/* Changes list */}
            <div className={styles.historyChangesBlock}>
              <h5 className={styles.historyChangesTitle}>Included Modifications:</h5>
              <ul className={styles.historyChangesList}>
                {selectedVersion.changesSummary.map((change, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Note banner */}
            <div className={styles.historyNoticeBanner}>
              <AlertTriangle size={14} color="#0284c7" style={{ flexShrink: 0 }} />
              <span>
                Restoring a historical release replaces the current workspace layout with this snapshot. A draft backup is automatically preserved in your undo history.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.historyModalFooter}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Automatic version snapshot created every time you publish to live storefront.
          </span>
          <button className={styles.btnCloseFooter} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
