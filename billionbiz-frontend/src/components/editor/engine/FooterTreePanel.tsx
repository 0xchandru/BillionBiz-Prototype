// ============================================================
// FOOTER TREE PANEL — Left Sidebar Component Tree
// Compact, expandable tree representing the recursive Footer structure.
// Full drag-and-drop reordering across groups, inside groups, & root.
// All groups strictly named "Group". Auto-expands on click.
// Hover insert button between items, "+ Add Block" in every group
// and at tree bottom.
// ============================================================

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  PlusCircle,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  MoreVertical,
  GripVertical,
  LayoutGrid,
  Heading,
  AlignLeft,
  Image,
  Scan,
  Sparkles,
  Link,
  Share2,
  SquareCheck,
  Mail,
  Minus,
  MoveVertical,
  CreditCard,
  Copyright,
  Sliders,
  Folder,
  FolderOpen,
  PhoneCall,
  ShieldCheck,
  Smartphone,
  Globe,
  Code,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import type { FooterTreeNode } from './footerTreeTypes';
import { findNodeById } from './footerTreeEngine';

const NODE_ICON_MAP: Record<string, React.FC<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  group: Folder,
  heading: Heading,
  text: AlignLeft,
  image: Image,
  logo: Scan,
  icon: Sparkles,
  'link-list': Link,
  'social-links': Share2,
  button: SquareCheck,
  newsletter: Mail,
  divider: Minus,
  spacer: MoveVertical,
  'payment-icons': CreditCard,
  copyright: Copyright,
  'contact-info': PhoneCall,
  'trust-badge': ShieldCheck,
  'app-download': Smartphone,
  localization: Globe,
  'custom-html': Code,
};

// ─── INSERT DIVIDER BETWEEN TREE ITEMS ───────────────────────

interface InsertDividerProps {
  parentId: string | null;
  targetIndex: number;
  depth: number;
}

const InsertDivider: React.FC<InsertDividerProps> = ({ parentId, targetIndex, depth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const openFooterComponentPicker = useEditorContextStore((s) => s.openFooterComponentPicker);
  const moveFooterTreeNode = useEditorContextStore((s) => s.moveFooterTreeNode);
  const paddingLeft = 8 + depth * 14;

  const isActive = isHovered || isDragOver;

  useEffect(() => {
    const handleDragEnd = () => setIsDragOver(false);
    window.addEventListener('dragend', handleDragEnd);
    return () => window.removeEventListener('dragend', handleDragEnd);
  }, []);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        const draggedId = (window as any).__bb_dragged_footer_node_id;
        if (draggedId) {
          setIsDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const draggedId = (window as any).__bb_dragged_footer_node_id;
        if (draggedId) {
          moveFooterTreeNode(draggedId, parentId, targetIndex);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        openFooterComponentPicker(parentId, targetIndex);
      }}
      style={{
        height: isActive ? '18px' : '10px',
        margin: isActive ? '-5px 0' : '-3px 0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: `${paddingLeft}px`,
        paddingRight: '8px',
        cursor: isDragOver ? 'copy' : 'pointer',
        zIndex: 25,
        transition: 'all 0.12s ease',
      }}
      title={isDragOver ? 'Drop to place here' : 'Insert block here'}
    >
      <div
        style={{
          width: '100%',
          height: isActive ? (isDragOver ? '3px' : '2px') : '0px',
          backgroundColor: isActive ? '#2563eb' : 'transparent',
          borderRadius: isDragOver ? '2px' : '0px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.12s ease',
        }}
      >
        {isDragOver ? (
          <div
            style={{
              position: 'absolute',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '9999px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.45)',
              transform: 'scale(0.95)',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            <Plus size={10} />
            <span>Drop here</span>
          </div>
        ) : isHovered ? (
          <div
            style={{
              position: 'absolute',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '9999px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.35)',
              transform: 'scale(0.95)',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            <Plus size={10} />
            <span>Insert</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ─── TREE NODE ROW ───────────────────────────────────────────

interface TreeNodeRowProps {
  node: FooterTreeNode;
  depth: number;
  parentId: string | null;
}

const TreeNodeRow: React.FC<TreeNodeRowProps> = ({ node, depth, parentId }) => {
  const {
    selectedFooterNodeId,
    selectFooterNode,
    footerExpandedNodeIds,
    toggleFooterNodeExpanded,
    openFooterComponentPicker,
    deleteFooterTreeNode,
    duplicateFooterTreeNode,
    updateFooterTreeNode,
    moveFooterTreeNode,
    footerTree,
  } = useEditorContextStore();

  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const autoExpandedRef = useRef<boolean>(false);

  const isSelected = selectedFooterNodeId === node.id;
  const isGroup = node.nodeType === 'group';
  const isExpanded = footerExpandedNodeIds.includes(node.id);
  const children = node.children || [];
  const IconComp = isGroup
    ? (isExpanded ? FolderOpen : Folder)
    : (NODE_ICON_MAP[node.nodeType] || LayoutGrid);

  // Group items display their name or default "Group".
  // Component items display compact clean names
  let displayName = isGroup ? (node.name || 'Group') : node.name;
  if (!isGroup) {
    if (node.nodeType === 'link-list') {
      displayName = node.props?.heading && node.props.heading !== 'Menu' ? `Menu: ${node.props.heading}` : (node.props?.heading || 'Menu');
    } else if (node.nodeType === 'text') {
      displayName = 'Text';
    } else if (node.nodeType === 'heading') {
      displayName = node.props?.text && node.props.text !== 'Heading' ? `Heading: ${node.props.text}` : 'Heading';
    } else if (node.nodeType === 'logo') {
      displayName = 'Logo';
    } else if (node.nodeType === 'button') {
      displayName = node.props?.label && node.props.label !== 'Button' ? `Button: ${node.props.label}` : 'Button';
    } else if (node.nodeType === 'newsletter') {
      displayName = 'Newsletter';
    } else if (node.nodeType === 'social-links') {
      displayName = 'Social Links';
    } else if (node.nodeType === 'payment-icons') {
      displayName = 'Payment Icons';
    } else if (node.nodeType === 'copyright') {
      displayName = 'Copyright';
    } else if (node.nodeType === 'divider') {
      displayName = 'Divider';
    } else if (node.nodeType === 'spacer') {
      displayName = 'Spacer';
    } else if (node.nodeType === 'contact-info') {
      displayName = node.props?.heading && node.props.heading !== 'Contact' ? `Contact: ${node.props.heading}` : 'Contact Info';
    } else if (node.nodeType === 'trust-badge') {
      displayName = 'Trust Badges';
    } else if (node.nodeType === 'app-download') {
      displayName = 'App Download';
    } else if (node.nodeType === 'localization') {
      displayName = 'Localization';
    } else if (node.nodeType === 'custom-html') {
      displayName = 'Custom HTML';
    }
  }

  // Auto-scroll into view when selected
  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  // Close context menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  // Global dragend listener: ensures timer is cancelled and auto-expanded group is collapsed
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      if (isGroup && autoExpandedRef.current) {
        autoExpandedRef.current = false;
        const currentlyExpanded = useEditorContextStore.getState().footerExpandedNodeIds.includes(node.id);
        if (currentlyExpanded) {
          toggleFooterNodeExpanded(node.id);
        }
      }
      setDropPosition(null);
    };

    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isGroup, node.id, toggleFooterNodeExpanded]);

  // Find index in parent to determine move up / down availability and accurate drop index
  const nodeIndex = useMemo(() => {
    if (!parentId) {
      return footerTree.findIndex((n) => n.id === node.id);
    }
    const parentNode = findNodeById(footerTree, parentId);
    return parentNode?.children ? parentNode.children.findIndex((n) => n.id === node.id) : -1;
  }, [footerTree, parentId, node.id]);

  const parent = useMemo(() => {
    return parentId ? findNodeById(footerTree, parentId) : null;
  }, [footerTree, parentId]);

  const parentChildrenCount = parent ? (parent.children?.length || 0) : footerTree.length;

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeIndex > 0) {
      moveFooterTreeNode(node.id, parentId, nodeIndex - 1);
    }
    setMenuOpen(false);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeIndex < parentChildrenCount - 1) {
      moveFooterTreeNode(node.id, parentId, nodeIndex + 1);
    }
    setMenuOpen(false);
  };

  // ─── Drag & Drop Event Handlers ───
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', node.id);
    (window as any).__bb_dragged_footer_node_id = node.id;
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);

    // When dragging a group, automatically collapse it so that it is not opened
    if (isGroup && isExpanded) {
      toggleFooterNodeExpanded(node.id);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    (window as any).__bb_dragged_footer_node_id = null;
    setIsDragging(false);
    setDropPosition(null);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    const draggedId = (window as any).__bb_dragged_footer_node_id;
    if (!draggedId || draggedId === node.id) return;

    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;

      if (isGroup) {
        if (offsetY < rect.height * 0.35) {
          setDropPosition('before');
          if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
          }
        } else if (offsetY > rect.height * 0.65) {
          setDropPosition('after');
          if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
          }
        } else {
          setDropPosition('inside');
          // When hovering inside a group: if currently collapsed, start timer to auto-expand only this group
          if (!isExpanded && !hoverTimerRef.current) {
            hoverTimerRef.current = window.setTimeout(() => {
              const currentlyExpanded = useEditorContextStore.getState().footerExpandedNodeIds.includes(node.id);
              if (!currentlyExpanded) {
                autoExpandedRef.current = true;
                toggleFooterNodeExpanded(node.id);
              }
              hoverTimerRef.current = null;
            }, 600);
          }
        }
      } else {
        if (offsetY < rect.height * 0.5) {
          setDropPosition('before');
        } else {
          setDropPosition('after');
        }
      }
    }
  };

  const handleRowDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDropPosition(null);
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    // If moving to a child element inside this container, do not collapse
    if (e.relatedTarget && containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      // If coordinates are still within container bounds, do not collapse
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return;
      }
    }

    // Cancel pending expand timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    // If this group was auto-expanded during hover, collapse it back
    if (isGroup && autoExpandedRef.current) {
      autoExpandedRef.current = false;
      const currentlyExpanded = useEditorContextStore.getState().footerExpandedNodeIds.includes(node.id);
      if (currentlyExpanded) {
        toggleFooterNodeExpanded(node.id);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = (window as any).__bb_dragged_footer_node_id;
    const targetPos = dropPosition;
    setDropPosition(null);

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Item dropped successfully into this tree branch, keep it expanded
    autoExpandedRef.current = false;

    if (!draggedId || draggedId === node.id) return;

    const safeIndex = nodeIndex >= 0 ? nodeIndex : 0;

    if (targetPos === 'inside' && isGroup) {
      moveFooterTreeNode(draggedId, node.id, children.length);
      if (!isExpanded) toggleFooterNodeExpanded(node.id);
    } else if (targetPos === 'before') {
      moveFooterTreeNode(draggedId, parentId, safeIndex);
    } else if (targetPos === 'after') {
      moveFooterTreeNode(draggedId, parentId, safeIndex + 1);
    }
  };

  const paddingLeft = 8 + depth * 14;

  return (
    <div
      ref={containerRef}
      onDragLeave={handleContainerDragLeave}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}
    >
      <div
        ref={rowRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleRowDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          selectFooterNode(node.id);
          // If clicking any group, open its tree to show all inside items
          if (isGroup && !isExpanded) {
            toggleFooterNodeExpanded(node.id);
          }
          const landingStore = useLandingEditorStore.getState();
          landingStore.setSelectedPageId('footer-global');
          landingStore.setActivePanel('pages');
          landingStore.setRightSidebarOpen(true);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '5px 8px',
          paddingLeft: `${paddingLeft}px`,
          backgroundColor:
            dropPosition === 'inside'
              ? '#eff6ff'
              : isSelected
              ? '#eff6ff'
              : isHovered
              ? '#f8fafc'
              : 'transparent',
          borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent',
          borderTop: dropPosition === 'before' ? '2px solid #2563eb' : 'none',
          borderBottom: dropPosition === 'after' ? '2px solid #2563eb' : 'none',
          outline: dropPosition === 'inside' ? '2px dashed #2563eb' : 'none',
          outlineOffset: '-2px',
          borderRadius: '6px',
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: isDragging ? 0.35 : 1,
          position: 'relative',
          transition: 'all 0.12s ease',
          userSelect: 'none',
          minHeight: '32px',
        }}
      >
        {/* 1. Chevron Icon for Group */}
        {isGroup && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleFooterNodeExpanded(node.id);
            }}
            style={{
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              color: '#64748b',
              flexShrink: 0,
            }}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        )}

        {/* 2. Item Icon / Drag & Drop Grip Icon on hover */}
        <div
          style={{
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSelected ? '#2563eb' : isHovered ? '#2563eb' : '#64748b',
            flexShrink: 0,
            pointerEvents: 'none',
            transition: 'color 0.12s ease',
          }}
          title={isHovered ? 'Drag to reorder' : displayName}
        >
          {isHovered ? <GripVertical size={14} /> : <IconComp size={14} />}
        </div>

        {/* 3. Compact Item Name */}
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: '12.5px',
            fontWeight: isSelected ? 600 : 500,
            color: isSelected ? '#1d4ed8' : '#0f172a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            opacity: node.visible === false ? 0.5 : 1,
            pointerEvents: 'none',
          }}
          title={displayName}
        >
          {displayName}
        </span>

        {/* 4. Rightside Actions: Eye, Delete, Three-Dot (ONLY on hover or open menu) */}
        {(isHovered || menuOpen) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              flexShrink: 0,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Add block inside group */}
            {isGroup && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openFooterComponentPicker(node.id);
                  if (!isExpanded) toggleFooterNodeExpanded(node.id);
                }}
                title="Add block inside"
                style={{
                  padding: '3px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  color: '#2563eb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Plus size={13} />
              </button>
            )}

            {/* Eye Visibility Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateFooterTreeNode(node.id, { visible: node.visible === false ? true : false });
              }}
              title={node.visible === false ? 'Show component' : 'Hide component'}
              style={{
                padding: '3px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: node.visible === false ? '#94a3b8' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {node.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>

            {/* Delete Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteFooterTreeNode(node.id);
              }}
              title="Delete block"
              style={{
                padding: '3px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Trash2 size={13} />
            </button>

            {/* 3-Dot Overflow Menu */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                title="More actions"
                style={{
                  padding: '3px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: menuOpen ? '#e2e8f0' : 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                onMouseLeave={(e) => !menuOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <MoreVertical size={13} />
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    width: '160px',
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isGroup && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        openFooterComponentPicker(node.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: '#1e293b',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Plus size={13} color="#2563eb" />
                      <span>Add Block Inside</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      duplicateFooterTreeNode(node.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      color: '#1e293b',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Copy size={13} color="#64748b" />
                    <span>Duplicate</span>
                  </button>

                  {nodeIndex > 0 && (
                    <button
                      type="button"
                      onClick={handleMoveUp}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: '#1e293b',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <ArrowUp size={13} color="#64748b" />
                      <span>Move Up</span>
                    </button>
                  )}

                  {nodeIndex < parentChildrenCount - 1 && (
                    <button
                      type="button"
                      onClick={handleMoveDown}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: '#1e293b',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <ArrowDown size={13} color="#64748b" />
                      <span>Move Down</span>
                    </button>
                  )}

                  <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '2px 0' }} />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      deleteFooterTreeNode(node.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Trash2 size={13} color="#ef4444" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Render Children Recursively if Expanded */}
      {isGroup && isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
          {children.map((child, cIdx) => (
            <React.Fragment key={child.id}>
              <InsertDivider parentId={node.id} targetIndex={cIdx} depth={depth + 1} />
              <TreeNodeRow node={child} depth={depth + 1} parentId={node.id} />
            </React.Fragment>
          ))}

          {/* Trailing InsertDivider at bottom of children inside group */}
          <InsertDivider parentId={node.id} targetIndex={children.length} depth={depth + 1} />

          {/* Under every opened group: "Add block" button at bottom of children */}
          <div
            onDragOver={(e) => e.stopPropagation()}
            style={{
              paddingLeft: `${paddingLeft + 14}px`,
              paddingTop: '3px',
              paddingBottom: '3px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openFooterComponentPicker(node.id);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '3px 4px',
                border: 'none',
                borderRadius: '4px',
                background: 'transparent',
                color: '#2563eb',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PlusCircle size={15} color="#2563eb" />
              </div>
              <span>Add block</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN FOOTER TREE PANEL ──────────────────────────────────

export const FooterTreePanel: React.FC = () => {
  const {
    footerTree,
    selectFooterNode,
    openFooterComponentPicker,
  } = useEditorContextStore();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* Tree Content Area (Scrollable) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Tree Nodes List */}
        {footerTree.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <LayoutGrid size={28} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Footer is empty
            </p>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>
              Add a Group container or choose a pre-built template to get started.
            </p>
            <button
              type="button"
              onClick={() => openFooterComponentPicker(null)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <PlusCircle size={15} /> Add block
            </button>
          </div>
        ) : (
          <>
            {footerTree.map((node, rIdx) => (
              <React.Fragment key={node.id}>
                <InsertDivider parentId={null} targetIndex={rIdx} depth={0} />
                <TreeNodeRow node={node} depth={0} parentId={null} />
              </React.Fragment>
            ))}

            {/* Trailing InsertDivider right above root "Add block" button */}
            <InsertDivider parentId={null} targetIndex={footerTree.length} depth={0} />

            {/* Root "Add block" button */}
            <div
              onDragOver={(e) => e.stopPropagation()}
              style={{
                padding: '4px 6px 12px 6px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                onClick={() => openFooterComponentPicker(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: '#2563eb',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <PlusCircle size={15} color="#2563eb" />
                <span>Add block</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Controls: Footer Settings / Templates Only */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={() => {
            selectFooterNode(null);
            const landingStore = useLandingEditorStore.getState();
            landingStore.setSelectedPageId('footer-global');
            landingStore.setActivePanel('pages');
            landingStore.setRightSidebarOpen(true);
          }}
          style={{
            width: '100%',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.borderColor = '#94a3b8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
        >
          <Sliders size={14} color="#475569" />
          <span>Footer Settings / Templates</span>
        </button>
      </div>
    </div>
  );
};
