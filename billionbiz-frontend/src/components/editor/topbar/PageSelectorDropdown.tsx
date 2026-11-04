import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, FileText, Layers, LayoutGrid } from 'lucide-react';
import { useSiteStore } from '../../../store/siteStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { EditorSwitchConfirmModal } from '../ui/EditorSwitchConfirmModal';
import styles from './topbar.module.css';
import { getEditorPath } from '../utils/editorNavigation';

export const PageSelectorDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<{
    targetPageId: string;
    targetName: string;
    currentName: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { pages } = useSiteStore();
  const { selectedPageId, setSelectedPageId, activePanel, setActivePanel, pagesNavLevel, navigateToPage, setRightSidebarOpen } = useLandingEditorStore();

  const activePage = pages.find((p) => p.id === selectedPageId) || pages[0];

  const getPageDisplayName = (pageId: string) => {
    if (pageId === 'header-global') return 'Global Header';
    if (pageId === 'footer-global') return 'Global Footer';
    if (pageId === 'landing-page') return 'Landing Page';
    const found = pages.find((p) => p.id === pageId);
    return found ? found.name : 'Page';
  };

  // Dynamic title based on active page or panel
  const getContextTitle = () => {
    if (activePanel === 'design' || activePanel === 'design-experience') return 'Design';
    if (activePanel === 'brand' || activePanel === 'store-brand') return 'Brand';
    if (activePanel === 'seo-growth') return 'SEO';
    if (activePanel === 'settings') return 'Settings';
    if (pagesNavLevel === 'list') return 'Editor';
    if (selectedPageId === 'header-global') return 'Global Header';
    if (selectedPageId === 'footer-global') return 'Global Footer';
    if (selectedPageId === 'landing-page') return 'Landing Page';
    if (activePage) return activePage.name;
    return 'Editor';
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close dialog on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pendingSwitch) {
        setPendingSwitch(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingSwitch]);

  const executeSwitch = (pageId: string) => {
    setSelectedPageId(pageId);
    setActivePanel('pages');
    navigateToPage(pageId);
    setRightSidebarOpen(true);
    navigate(getEditorPath(pageId));
    setIsOpen(false);
    setPendingSwitch(null);
  };

  const handleSelectPage = (targetPageId: string) => {
    setIsOpen(false);
    if (targetPageId === selectedPageId && pagesNavLevel === 'page-detail') {
      return;
    }

    // If currently editing inside any page editor at detail level, prompt confirmation
    if (pagesNavLevel === 'page-detail' && selectedPageId && selectedPageId !== targetPageId) {
      setPendingSwitch({
        targetPageId,
        targetName: getPageDisplayName(targetPageId),
        currentName: getPageDisplayName(selectedPageId),
      });
      return;
    }

    executeSwitch(targetPageId);
  };

  const currentlyActiveId =
    activePanel !== 'pages'
      ? null
      : pagesNavLevel === 'list'
        ? null
        : selectedPageId;

  const globalItems = [
    { id: 'header-global', name: 'Global Header', icon: Layers },
    { id: 'footer-global', name: 'Global Footer', icon: LayoutGrid },
  ];

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className={styles.pageSelectorTrigger}
        onClick={() => setIsOpen(!isOpen)}
        title={getContextTitle()}
        aria-expanded={isOpen}
      >
        <span className={styles.pageTitleText}>{getContextTitle()}</span>
        <ChevronDown
          size={13}
          className={styles.chevronIcon}
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {isOpen && (
        <div className={`${styles.popoverCard} ${styles.pageSelectorPopover}`}>
          {/* Global Components Section */}
          <div style={{ padding: '4px 8px 6px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Global Components
            </span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            {globalItems.map((item) => {
              const isSelected = item.id === currentlyActiveId;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`${styles.pageItem} ${isSelected ? styles.activePageItem : ''}`}
                  onClick={() => handleSelectPage(item.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <Icon size={13} style={{ opacity: isSelected ? 1 : 0.6, flexShrink: 0, color: '#2563eb' }} />
                    <span style={{ fontWeight: isSelected ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                  </div>
                  {isSelected && <Check size={14} color="#059669" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* Pages Section */}
          <div style={{ padding: '4px 8px 6px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Storefront Pages
            </span>
          </div>

          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {pages.map((p) => {
              const isSelected = p.id === currentlyActiveId;
              const displayName = p.id === 'landing-page' ? 'Landing Page' : p.name;
              return (
                <button
                  key={p.id}
                  className={`${styles.pageItem} ${isSelected ? styles.activePageItem : ''}`}
                  onClick={() => handleSelectPage(p.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <FileText size={13} style={{ opacity: isSelected ? 1 : 0.6, flexShrink: 0 }} />
                    <span style={{ fontWeight: isSelected ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName}
                    </span>
                  </div>
                  {isSelected && <Check size={14} color="#059669" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {pendingSwitch && (
        <EditorSwitchConfirmModal
          currentName={pendingSwitch.currentName}
          targetName={pendingSwitch.targetName}
          onCancel={() => setPendingSwitch(null)}
          onConfirm={() => executeSwitch(pendingSwitch.targetPageId)}
        />
      )}
    </div>
  );
};
