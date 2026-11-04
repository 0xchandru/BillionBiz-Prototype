import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, Eye, EyeOff, Trash2, Lock, MoreVertical, 
  ChevronUp, ChevronDown, Copy, Clock, Smartphone, Monitor, Code, Bookmark 
} from 'lucide-react';
import type { SectionData } from '../../store/siteStore';
import styles from '../../pages/editor/EditorLayout.module.css';

interface SortableItemProps {
  id: string;
  section: SectionData;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
  onInsertClick?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isLocked?: boolean;
}

export const SortableItem: React.FC<SortableItemProps> = ({ 
  id, section, isSelected, onSelect, onToggleVisibility, onRemove, onInsertClick, onMoveUp, onMoveDown, isLocked: propIsLocked 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{top: number | 'auto', bottom?: number | 'auto', left: number, maxHeight?: number}>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : undefined,
    position: isDragging ? 'relative' : undefined,
    boxShadow: isDragging ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : undefined,
  } as React.CSSProperties;

  const isLocked = propIsLocked !== undefined 
    ? propIsLocked 
    : (section.type === 'Header' || section.type === 'Footer');

  return (
    <div
      ref={setNodeRef} 
      style={style}
      className={styles.sortableWrapper}
    >
      <div 
        className={`${styles.sectionItem} ${isSelected ? styles.activeSectionItem : (isMenuOpen ? styles.menuOpenSectionItem : '')}`}
        onClick={onSelect}
      >
        <div className={styles.sectionItemLeft}>
          {isLocked ? (
            <div style={{ width: '16px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
               <Lock size={14} />
            </div>
          ) : (
            <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
              <GripVertical size={16} className={styles.dragIcon} />
            </div>
          )}
          <span 
            className={styles.sectionName}
            style={section.isHidden ? { opacity: 0.5, textDecoration: 'line-through' } : undefined}
          >
            {section.name}
          </span>
        </div>
        <div className={styles.sectionItemRight} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {!isLocked && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(e);
                }}
                title={section.isHidden ? "Show section" : "Hide section"}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  color: section.isHidden ? '#94a3b8' : 'var(--text-muted, #64748b)',
                  transition: 'all 0.12s ease',
                }}
              >
                {section.isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>

              <div style={{ position: 'relative' }} ref={menuRef}>
                <div 
                  style={{ cursor: 'pointer', display: 'flex', padding: '4px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isMenuOpen) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const spaceBelow = window.innerHeight - rect.bottom;
                      // Menu is about 400px tall. If there's less than 400px below and more space above, align to bottom.
                      const useBottom = spaceBelow < 420 && rect.top > spaceBelow;
                      
                      if (useBottom) {
                        setMenuPos({ 
                          top: 'auto',
                          bottom: window.innerHeight - rect.bottom, 
                          left: rect.right + 8,
                          maxHeight: rect.top - 20 // Space above the item
                        });
                      } else {
                        setMenuPos({ 
                          top: rect.top, 
                          bottom: 'auto',
                          left: rect.right + 8,
                          maxHeight: spaceBelow - 20 // Space below the item
                        });
                      }
                    }
                    setIsMenuOpen(!isMenuOpen);
                  }}
                >
                  <MoreVertical size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
                
                {isMenuOpen && createPortal(
                  <div 
                    ref={dropdownRef}
                    className={styles.dropdownMenu} 
                    style={{ 
                      position: 'fixed', 
                      top: menuPos.top, 
                      bottom: menuPos.bottom,
                      left: menuPos.left, 
                      right: 'auto',
                      width: '200px',
                      minWidth: '200px',
                      zIndex: 999999, 
                      margin: 0,
                      maxHeight: menuPos.maxHeight ? `${menuPos.maxHeight}px` : 'calc(100vh - 20px)',
                      overflowY: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      className={styles.dropdownItem} 
                      onClick={() => {
                        setIsMenuOpen(false);
                        onMoveUp?.();
                      }}
                      disabled={!onMoveUp}
                      style={!onMoveUp ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                    >
                      <ChevronUp size={16} /> Move Up
                    </button>
                    <button 
                      className={styles.dropdownItem} 
                      onClick={() => {
                        setIsMenuOpen(false);
                        onMoveDown?.();
                      }}
                      disabled={!onMoveDown}
                      style={!onMoveDown ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                    >
                      <ChevronDown size={16} /> Move Down
                    </button>
                    
                    <div className={styles.dropdownDivider}></div>
                    
                    <button className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                      <Copy size={16} /> Duplicate
                    </button>
                    <button className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                      <Clock size={16} /> Schedule visibility
                    </button>
                    
                    <button className={styles.dropdownItem} onClick={(e) => {
                      onToggleVisibility(e);
                      setIsMenuOpen(false);
                    }}>
                      {section.isHidden ? <Eye size={16} /> : <EyeOff size={16} />} 
                      {section.isHidden ? 'Show' : 'Hide'}
                    </button>
                    
                    <button className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                      <Smartphone size={16} /> Hide on mobile
                    </button>
                    <button className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                      <Monitor size={16} /> Hide on desktop
                    </button>
                    
                    <button className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                      <Code size={16} /> Copy as code
                    </button>
                    <button className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                      <Bookmark size={16} /> Save as snippet
                    </button>
                    <button className={`${styles.dropdownItem} ${styles.disabled}`} disabled>
                      <Bookmark size={16} /> Apply preset
                    </button>
                    
                    <div className={styles.dropdownDivider}></div>
                    
                    <button 
                      className={`${styles.dropdownItem} ${styles.dangerText}`}
                      onClick={(e) => {
                        onRemove(e);
                        setIsMenuOpen(false);
                      }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>,
                  document.body
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {onInsertClick && section.type !== 'Footer' && section.type !== 'AnnouncementBar' && (
        <div className={styles.insertArea}>
           <div className={styles.insertLine}></div>
           <div 
             className={styles.insertBtn} 
             onClick={(e) => {
               e.stopPropagation();
               onInsertClick();
             }}
             style={{ cursor: 'pointer' }}
           >
             + Insert
           </div>
        </div>
      )}
    </div>
  );
};
