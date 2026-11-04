import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, Image as FolderImage, Compass, 
  Command, HelpCircle, LifeBuoy, X
} from 'lucide-react';
import styles from './topbar.module.css';

interface MoreOptionsMenuProps {
  onNotify: (msg: string) => void;
}

export const MoreOptionsMenu: React.FC<MoreOptionsMenuProps> = ({ onNotify }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleOptionClick = (key: string, label: string) => {
    setIsOpen(false);
    if (key === 'shortcuts') {
      setShowShortcutsModal(true);
    } else {
      onNotify(`${label} is scheduled for an upcoming release.`);
    }
  };

  const shortcutsList = [
    { key: 'Ctrl + Z / ⌘Z', desc: 'Undo theme or styling changes' },
    { key: 'Ctrl + Y / ⌘⇧Z', desc: 'Redo previously undone change' },
    { key: 'Ctrl + K / ⌘K', desc: 'Open Command Palette & section search' },
    { key: 'Escape', desc: 'Close modals, drawers, or active popovers' },
  ];

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button 
        className={styles.btnMoreMenu} 
        onClick={() => setIsOpen(!isOpen)}
        title="More Options"
        aria-expanded={isOpen}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className={`${styles.popoverCard} ${styles.moreMenuPopover}`}>
          <button 
            className={styles.menuItem} 
            onClick={() => handleOptionClick('assets', 'Asset Library')}
          >
            <FolderImage size={15} color="#64748b" />
            <span>Asset Library</span>
          </button>

          <button 
            className={styles.menuItem} 
            onClick={() => handleOptionClick('tour', 'Interactive Tour')}
          >
            <Compass size={15} color="#64748b" />
            <span>Take the tour</span>
          </button>

          <button 
            className={styles.menuItem} 
            onClick={() => handleOptionClick('shortcuts', 'Keyboard shortcuts')}
          >
            <Command size={15} color="#64748b" />
            <span>Keyboard shortcuts</span>
          </button>

          <div className={styles.menuDivider} />

          <button 
            className={styles.menuItem} 
            onClick={() => handleOptionClick('help', 'Help Center')}
          >
            <HelpCircle size={15} color="#64748b" />
            <span>Help center</span>
          </button>

          <button 
            className={styles.menuItem} 
            onClick={() => handleOptionClick('support', 'Contact Support')}
          >
            <LifeBuoy size={15} color="#64748b" />
            <span>Contact support</span>
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      {showShortcutsModal && (
        <div className={styles.setupModalOverlay} onClick={() => setShowShortcutsModal(false)}>
          <div className={styles.setupModalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.setupModalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Command size={18} color="#475569" />
                <span className={styles.setupModalTitle}>Editor Keyboard Shortcuts</span>
              </div>
              <button 
                onClick={() => setShowShortcutsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {shortcutsList.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '13px', color: '#334155' }}>{item.desc}</span>
                    <span className={styles.shortcutKey}>{item.key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
