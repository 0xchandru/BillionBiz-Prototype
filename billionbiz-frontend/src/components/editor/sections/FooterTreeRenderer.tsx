// ============================================================
// FOOTER TREE RENDERER — Central Preview & Storefront Renderer
// Fully recursive renderer for FooterTreeNode[] structures.
// Supports responsive overrides, hover/selection outlines,
// interactive click-to-select, and live functional components.
// ============================================================

import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  LayoutGrid,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  RotateCcw,
  Truck,
  Headphones,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import type { FooterTreeNode } from '../engine/footerTreeTypes';

// ─── SOCIAL ICONS ─────────────────────────────────────────────

const SocialIconRenderer: React.FC<{ platform: string; size?: number }> = ({ platform, size = 18 }) => {
  const p = platform.toLowerCase();
  switch (p) {
    case 'twitter':
    case 'x':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.054-2.797 2.68v1.291h4.156l-.558 3.667h-3.598v7.98h-4.566z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return <ExternalLink size={size} />;
  }
};

// ─── PAYMENT BADGES ──────────────────────────────────────────

const PaymentBadgeRenderer: React.FC<{ provider: string; size?: 'small' | 'medium' | 'large' }> = ({
  provider,
  size = 'medium',
}) => {
  const p = (provider || '').toLowerCase().replace(/[-_\s]/g, '');
  const height = size === 'small' ? '20px' : size === 'large' ? '28px' : '24px';
  const padding = size === 'small' ? '2px 6px' : '3px 8px';

  return (
    <div
      style={{
        height,
        padding,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        boxSizing: 'border-box',
      }}
    >
      {p === 'visa' && (
        <span style={{ fontWeight: 800, fontStyle: 'italic', fontSize: '12px', color: '#1a1f71', letterSpacing: '0.04em' }}>
          VISA
        </span>
      )}
      {p === 'mastercard' && (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eb001b', display: 'inline-block' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f79e1b', display: 'inline-block', marginLeft: '-5px', opacity: 0.9 }} />
        </div>
      )}
      {p === 'paypal' && (
        <span style={{ fontWeight: 800, fontSize: '11px', color: '#003087' }}>
          Pay<span style={{ color: '#0079c1' }}>Pal</span>
        </span>
      )}
      {(p === 'applepay' || p === 'apple') && (
        <span style={{ fontWeight: 700, fontSize: '11px', color: '#000000' }}>
          Pay
        </span>
      )}
      {(p === 'googlepay' || p === 'gpay') && (
        <span style={{ fontWeight: 700, fontSize: '11px', color: '#5f6368' }}>
          GPay
        </span>
      )}
      {(p === 'amex' || p === 'americanexpress') && (
        <span style={{ fontWeight: 800, fontSize: '10px', color: '#006fcf' }}>
          AMEX
        </span>
      )}
      {p === 'discover' && (
        <span style={{ fontWeight: 800, fontSize: '10px', color: '#ff6000' }}>
          DISCOVER
        </span>
      )}
      {p === 'stripe' && (
        <span style={{ fontWeight: 800, fontSize: '11px', color: '#635bff' }}>
          stripe
        </span>
      )}
      {!['visa', 'mastercard', 'paypal', 'applepay', 'apple', 'googlepay', 'gpay', 'amex', 'americanexpress', 'discover', 'stripe'].includes(p) && (
        <span style={{ fontWeight: 700, fontSize: '10px', color: '#475569', textTransform: 'uppercase' }}>
          {provider}
        </span>
      )}
    </div>
  );
};

// ─── NEWSLETTER COMPONENT RENDERER ───────────────────────────

const NewsletterBlock: React.FC<{ props: any; isInteractive?: boolean }> = ({ props }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    // Real asynchronous subscription simulation with validation
    setTimeout(() => {
      setStatus('success');
      setMessage('Thank you for subscribing! Check your inbox for updates.');
      setEmail('');
    }, 700);
  };

  const isVertical = props.layout === 'vertical';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        height: 'fit-content',
        maxWidth: props.maxWidth ? `${props.maxWidth}px` : '100%',
        boxSizing: 'border-box',
      }}
    >
      {props.heading && (
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'inherit' }}>
          {props.heading}
        </h4>
      )}
      {props.description && (
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.8, lineHeight: 1.5 }}>
          {props.description}
        </p>
      )}

      {status === 'success' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: '#16a34a',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            alignItems: isVertical ? 'stretch' : 'center',
            gap: '8px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder={props.placeholder || 'Your email address'}
            disabled={status === 'loading'}
            style={{
              flex: isVertical ? 'none' : '1 1 0px',
              minWidth: 0,
              width: isVertical ? '100%' : '100%',
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              lineHeight: '40px',
              padding: '0 14px',
              borderRadius: '6px',
              border: status === 'error' ? '1px solid #ef4444' : '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              padding: '0 18px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              width: isVertical ? '100%' : 'auto',
              boxSizing: 'border-box',
            }}
          >
            {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : props.buttonText || 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <span style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> {message}
        </span>
      )}

      {props.showConsent && props.consentText && (
        <p style={{ margin: '2px 0 0 0', fontSize: '11px', opacity: 0.65 }}>
          {props.consentText}
        </p>
      )}
    </div>
  );
};

// ─── RECURSIVE NODE RENDERER ─────────────────────────────────

interface NodeRendererProps {
  node: FooterTreeNode;
  parentDirection?: 'horizontal' | 'vertical';
  isEditorInteractive?: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
  selectedId: string | null;
  hoveredId: string | 'root' | null;
  onSelect: (nodeId: string) => void;
  onHover: (nodeId: string | null) => void;
  onAddChild: (parentId: string) => void;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({
  node,
  parentDirection = 'horizontal',
  isEditorInteractive,
  device,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onAddChild,
}) => {
  const isSelected = selectedId === node.id;
  const isNodeHovered = hoveredId === node.id;
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  // Apply responsive overrides if present
  const baseLayout = node.layout || {
    direction: 'horizontal',
    width: { mode: 'fill' },
    height: { mode: 'fit' },
    mainAxisDistribution: 'start',
    crossAxisAlignment: 'stretch',
    gap: 24,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  const responsive = node.responsive || {};
  const activeOverride = isMobile ? responsive.mobile : isTablet ? responsive.tablet : undefined;

  // If node is explicitly hidden on this breakpoint, do not render
  if (activeOverride?.visible === false) return null;

  const direction: 'horizontal' | 'vertical' = activeOverride?.direction || baseLayout.direction || 'horizontal';
  const gap = activeOverride?.gap ?? baseLayout.gap ?? 24;
  const mainAxis = activeOverride?.mainAxisDistribution || baseLayout.mainAxisDistribution || 'start';
  const crossAxis = activeOverride?.crossAxisAlignment || baseLayout.crossAxisAlignment || 'stretch';
  const padding = activeOverride?.padding || baseLayout.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const widthMode = activeOverride?.width?.mode || baseLayout.width?.mode || 'fill';

  // Flexbox CSS translation
  const justifyContentMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
    'space-around': 'space-around',
    'space-evenly': 'space-evenly',
  };

  const alignItemsMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };

  const isHorizontalParent = parentDirection === 'horizontal';

  // Group container rendering
  if (node.nodeType === 'group') {
    const children = node.children || [];
    const styling = node.styling || { bgType: 'inherit' };

    let computedFlex = 'none';
    let computedWidth = 'auto';
    let computedMinWidth: string | number = 0;

    if (widthMode === 'fill') {
      if (isHorizontalParent) {
        // In a horizontal parent (row):
        if (isMobile) {
          computedFlex = '1 1 100%';
          computedWidth = '100%';
          computedMinWidth = '100%';
        } else if (isTablet) {
          computedFlex = '1 1 calc(50% - 16px)';
          computedWidth = 'auto';
          computedMinWidth = '180px';
        } else {
          // Desktop: flexible column with 200px basis so 5+ columns wrap gracefully to next row instead of crushing to 0px
          computedFlex = '1 1 200px';
          computedWidth = 'auto';
          computedMinWidth = '180px';
        }
      } else {
        // In a vertical parent: stretch full width (100%)
        computedFlex = '0 0 auto';
        computedWidth = '100%';
        computedMinWidth = 0;
      }
    } else if (widthMode === 'fit') {
      computedFlex = isHorizontalParent ? '0 1 auto' : '0 0 auto';
      computedWidth = 'auto';
      computedMinWidth = 0;
    } else if (widthMode === 'custom' && baseLayout.width?.value) {
      const customVal = `${baseLayout.width.value}${baseLayout.width.unit || 'px'}`;
      if (isHorizontalParent) {
        if (isMobile) {
          computedFlex = '1 1 100%';
          computedWidth = '100%';
          computedMinWidth = '100%';
        } else if (isTablet) {
          computedFlex = '1 1 calc(50% - 16px)';
          computedWidth = 'auto';
          computedMinWidth = '180px';
        } else {
          computedFlex = '0 0 auto';
          computedWidth = customVal;
          computedMinWidth = '180px';
        }
      } else {
        computedFlex = '0 0 auto';
        computedWidth = customVal;
        computedMinWidth = 0;
      }
    }

    const maxWidthVal = activeOverride?.maxWidth ?? baseLayout.maxWidth;
    const computedMaxWidth = maxWidthVal ? `${maxWidthVal}px` : undefined;

    const groupStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: direction === 'horizontal' ? (isMobile ? 'column' : 'row') : 'column',
      justifyContent: justifyContentMap[mainAxis] || 'flex-start',
      alignItems: alignItemsMap[crossAxis] || (direction === 'horizontal' ? (isMobile ? 'stretch' : 'center') : 'stretch'),
      gap: `${gap}px`,
      paddingTop: `${padding.top}px`,
      paddingRight: `${padding.right}px`,
      paddingBottom: `${padding.bottom}px`,
      paddingLeft: `${padding.left}px`,
      flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap',
      width: computedWidth,
      flex: computedFlex,
      maxWidth: computedMaxWidth || '100%',
      minWidth: computedMinWidth,
      boxSizing: 'border-box',
      position: 'relative',
      borderRadius: styling.borderRadius ? `${styling.borderRadius}px` : undefined,
      borderWidth: styling.borderWidth ? `${styling.borderWidth}px` : undefined,
      borderColor: styling.borderColor || undefined,
      borderStyle: styling.borderWidth ? (styling.borderStyle || 'solid') : undefined,
      backgroundColor: styling.bgType === 'color' ? styling.bgColor : undefined,
      boxShadow: styling.boxShadow || undefined,
    };

    // Editor outline styles — 2px solid when selected, 2px dashed when hovered
    const editorOutlineStyle: React.CSSProperties = isEditorInteractive
      ? {
          outline: isSelected ? '2px solid #2563eb' : isNodeHovered ? '2px dashed #2563eb' : 'none',
          outlineOffset: '-2px',
          cursor: 'pointer',
        }
      : {};

    return (
      <div
        style={{ ...groupStyle, ...editorOutlineStyle }}
        onMouseOver={(e) => {
          if (!isEditorInteractive) return;
          e.stopPropagation();
          onHover(node.id);
        }}
        onMouseOut={(e) => {
          if (!isEditorInteractive) return;
          e.stopPropagation();
          onHover(null);
        }}
        onClick={(e) => {
          if (!isEditorInteractive) return;
          e.stopPropagation();
          onSelect(node.id);
        }}
      >
        {/* Shopify-style Group tag badge on top of selected group */}
        {isSelected && isEditorInteractive && (
          <div
            style={{
              position: 'absolute',
              top: '-22px',
              left: '-2px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 30,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <LayoutGrid size={11} />
            <span>Group</span>
          </div>
        )}

        {children.map((child) => (
          <NodeRenderer
            key={child.id}
            node={child}
            parentDirection={direction}
            isEditorInteractive={isEditorInteractive}
            device={device}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={onSelect}
            onHover={onHover}
            onAddChild={onAddChild}
          />
        ))}
      </div>
    );
  }

  // Leaf component rendering
  const props = node.props || {};
  const isLeafHovered = hoveredId === node.id;

  const isNaturalFit = [
    'heading',
    'text',
    'copyright',
    'payment-icons',
    'button',
    'social-links',
    'logo',
    'icon',
    'trust-badge',
    'app-download',
    'localization',
  ].includes(node.nodeType);

  const effectiveWidthMode = props.widthMode || (isNaturalFit ? 'fit' : 'fill');

  let leafFlex: string | undefined = undefined;
  let leafWidth: string = 'auto';
  let leafMinWidth: string | number = 0;

  if (isHorizontalParent) {
    if (effectiveWidthMode === 'fill') {
      if (isMobile) {
        leafFlex = '1 1 100%';
        leafWidth = '100%';
        leafMinWidth = '100%';
      } else if (isTablet) {
        leafFlex = '1 1 calc(50% - 12px)';
        leafWidth = 'auto';
        leafMinWidth = '140px';
      } else {
        leafFlex = '1 1 160px';
        leafWidth = 'auto';
        leafMinWidth = '140px';
      }
    } else if (effectiveWidthMode === 'custom' && props.customWidth) {
      leafFlex = '0 0 auto';
      leafWidth = `${props.customWidth}px`;
      leafMinWidth = 0;
    } else {
      // fit
      leafFlex = '0 0 auto';
      leafWidth = 'auto';
      leafMinWidth = 0;
    }
  } else {
    // Vertical parent: elements stack top-to-bottom
    if (effectiveWidthMode === 'fill') {
      leafFlex = '0 0 auto';
      leafWidth = '100%';
      leafMinWidth = 0;
    } else if (effectiveWidthMode === 'custom' && props.customWidth) {
      leafFlex = '0 0 auto';
      leafWidth = `${props.customWidth}px`;
      leafMinWidth = 0;
    } else {
      // fit
      leafFlex = '0 0 auto';
      leafWidth = 'fit-content';
      leafMinWidth = 0;
    }
  }

  const leafAlignSelf = effectiveWidthMode === 'fill'
    ? 'stretch'
    : (crossAxis === 'stretch'
        ? (isHorizontalParent ? 'stretch' : 'flex-start')
        : (crossAxis === 'center' ? 'center' : (crossAxis === 'end' ? 'flex-end' : 'flex-start')));

  const leafContainerStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    position: 'relative',
    flex: leafFlex,
    width: leafWidth,
    minWidth: leafMinWidth,
    alignSelf: leafAlignSelf,
    height: node.nodeType === 'newsletter' ? 'fit-content' : undefined,
    maxWidth: props.maxWidth ? `${props.maxWidth}px` : '100%',
    backgroundColor: props.bgColor || undefined,
    borderRadius: props.borderRadius ? `${props.borderRadius}px` : '4px',
    borderWidth: props.borderWidth ? `${props.borderWidth}px` : undefined,
    borderColor: props.borderColor || undefined,
    borderStyle: props.borderWidth ? 'solid' : undefined,
    padding: props.padding ? `${props.padding}px` : undefined,
    margin: props.margin ? `${props.margin}px` : undefined,
    opacity: props.opacity !== undefined ? Number(props.opacity) : undefined,
    ...(isEditorInteractive
      ? {
          outline: isSelected ? '2px solid #2563eb' : isLeafHovered ? '2px dashed #2563eb' : 'none',
          outlineOffset: '2px',
          cursor: 'pointer',
        }
      : {}),
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive) return;
    e.stopPropagation();
    onSelect(node.id);
  };

  const renderLeafContent = () => {
    switch (node.nodeType) {
      case 'heading': {
        const validLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
        const Tag = (validLevels.includes(props.level) ? props.level : 'h3') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        return (
          <Tag
            style={{
              margin: 0,
              fontSize: `${props.fontSize || 16}px`,
              fontWeight: props.fontWeight || 700,
              color: props.color || 'inherit',
              textAlign: props.alignment || 'left',
              lineHeight: 1.3,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {props.text || 'Heading'}
          </Tag>
        );
      }

      case 'text':
        return (
          <p
            style={{
              margin: 0,
              fontSize: `${props.fontSize || 14}px`,
              lineHeight: props.lineHeight || 1.6,
              color: props.color || 'inherit',
              textAlign: props.alignment || 'left',
              opacity: 0.85,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {props.text || ''}
          </p>
        );

      case 'logo': {
        const logoType = props.logoType || (props.sourceType === 'image' || props.src || props.imageUrl ? (props.text ? 'both' : 'image') : 'both');
        const isTwoLines = Boolean(props.isTwoLines);
        const upperText = props.upperText || props.text || props.brandName || 'BILLION';
        const lowerText = props.lowerText || 'BIZ COUTURE';
        const logoText = props.text || props.brandName || 'BillionBiz';

        const logoHeight = props.logoHeight || props.height || 40;
        const logoWidth = props.logoWidth || props.desktopWidth || props.width || 140;
        const imageUrl = props.imageUrl || props.image || props.src;

        const shape = props.shape || 'none';
        const borderRadius =
          shape === 'circle'
            ? '50%'
            : shape === 'pill'
            ? '9999px'
            : shape === 'rounded'
            ? `${props.borderRadius ?? 8}px`
            : shape === 'square'
            ? '4px'
            : '0px';

        const border =
          props.borderStyle && props.borderStyle !== 'none'
            ? `${props.borderWidth || 1}px ${props.borderStyle} ${props.borderColor || '#cbd5e1'}`
            : 'none';

        const shadow =
          props.shadow === 'soft'
            ? '0 2px 8px rgba(0,0,0,0.06)'
            : props.shadow === 'medium'
            ? '0 4px 14px rgba(0,0,0,0.12)'
            : props.shadow === 'strong'
            ? '0 8px 24px rgba(0,0,0,0.18)'
            : 'none';

        const imagePadding = props.imagePadding ? `${props.imagePadding}px` : '0px';
        const imageBg = props.imageBg || 'transparent';

        const firstLineSize = props.firstLineSize || props.fontSize || 20;
        const firstLineWeight = props.firstLineWeight || props.fontWeight || 800;
        const firstLineColor = props.firstLineColor || props.textColor || props.color || 'inherit';
        const firstLineSpacing = props.firstLineSpacing || '-0.02em';

        const secondLineSize =
          props.secondLineSize || Math.max(10, Math.round(firstLineSize * 0.58));
        const secondLineWeight = props.secondLineWeight || 600;
        const secondLineColor = props.secondLineColor || props.lowerTextColor || '#64748b';
        const secondLineSpacing = props.secondLineSpacing || '0.08em';

        const logoGap = props.logoGap !== undefined ? `${props.logoGap}px` : '8px';
        const destLink = props.url || props.link || '/';
        const openInNewTab = Boolean(props.openInNewTab);

        return (
          <a
            href={destLink}
            target={openInNewTab ? '_blank' : undefined}
            rel={openInNewTab ? 'noopener noreferrer' : undefined}
            onClick={(e) => {
              if (isEditorInteractive) e.preventDefault();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: logoGap,
              textDecoration: 'none',
              color: 'inherit',
              cursor: isEditorInteractive ? 'pointer' : 'default',
            }}
          >
            {(logoType === 'image' || logoType === 'both') && imageUrl && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: imagePadding,
                  backgroundColor: imageBg,
                  borderRadius,
                  border,
                  boxShadow: shadow,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={imageUrl}
                  alt={logoText}
                  style={{
                    maxWidth: `${logoWidth}px`,
                    maxHeight: `${logoHeight}px`,
                    height: `${logoHeight}px`,
                    objectFit: props.objectFit || 'contain',
                    borderRadius: shape === 'circle' ? '50%' : 'inherit',
                    display: 'block',
                  }}
                />
              </div>
            )}
            {(logoType === 'text' || logoType === 'both' || !imageUrl) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {isTwoLines ? (
                  <>
                    <span
                      style={{
                        fontSize: `${firstLineSize}px`,
                        fontWeight: firstLineWeight,
                        color: firstLineColor,
                        letterSpacing: firstLineSpacing,
                        lineHeight: 1.15,
                        fontFamily: props.fontFamily || 'inherit',
                      }}
                    >
                      {upperText}
                    </span>
                    <span
                      style={{
                        fontSize: `${secondLineSize}px`,
                        fontWeight: secondLineWeight,
                        color: secondLineColor,
                        letterSpacing: secondLineSpacing,
                        lineHeight: 1.2,
                        fontFamily: props.fontFamily || 'inherit',
                        textTransform: 'uppercase',
                      }}
                    >
                      {lowerText}
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      fontSize: `${firstLineSize}px`,
                      fontWeight: firstLineWeight,
                      color: firstLineColor,
                      letterSpacing: firstLineSpacing,
                      lineHeight: 1.15,
                      fontFamily: props.fontFamily || 'inherit',
                    }}
                  >
                    {logoText}
                  </span>
                )}
              </div>
            )}
          </a>
        );
      }

      case 'image':
        return props.src ? (
          <img
            src={props.src}
            alt={props.alt || ''}
            style={{
              width: typeof props.width === 'number' ? `${props.width}px` : props.width || '100%',
              height: typeof props.height === 'number' ? `${props.height}px` : props.height || 'auto',
              objectFit: props.objectFit || 'contain',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: `${props.width || 200}px`,
              height: '80px',
              backgroundColor: '#f1f5f9',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontSize: '12px',
            }}
          >
            Image placeholder
          </div>
        );

      case 'link-list': {
        const links = props.links || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            {props.heading && (
              <h4
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {props.heading}
              </h4>
            )}
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: `${props.gap ?? 8}px`,
              }}
            >
              {links.map((link: any, idx: number) => (
                <li key={idx}>
                  <a
                    href={link.href || '#'}
                    onClick={(e) => {
                      if (isEditorInteractive) e.preventDefault();
                    }}
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      fontSize: `${props.fontSize || 13}px`,
                      opacity: 0.75,
                      transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'newsletter':
        return <NewsletterBlock props={props} isInteractive={isEditorInteractive} />;

      case 'button':
        return (
          <a
            href={props.link || '#'}
            onClick={(e) => {
              if (isEditorInteractive) e.preventDefault();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '9px 18px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '13px',
              backgroundColor: props.variant === 'secondary' ? '#f1f5f9' : props.variant === 'outline' ? 'transparent' : '#2563eb',
              color: props.variant === 'secondary' ? '#0f172a' : props.variant === 'outline' ? '#2563eb' : '#ffffff',
              border: props.variant === 'outline' ? '1.5px solid #2563eb' : 'none',
              cursor: 'pointer',
            }}
          >
            {props.label || 'Button'}
          </a>
        );

      case 'social-links': {
        const platforms = (props.platforms || []).filter((p: any) => p.enabled);
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${props.gap ?? 14}px`,
              justifyContent: props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start',
            }}
          >
            {platforms.map((p: any, idx: number) => (
              <a
                key={idx}
                href={p.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (isEditorInteractive) e.preventDefault();
                }}
                style={{
                  color: 'inherit',
                  opacity: 0.75,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.75';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <SocialIconRenderer platform={p.platform} size={props.iconSize || 18} />
              </a>
            ))}
          </div>
        );
      }

      case 'payment-icons': {
        const methods = (props.methods && Array.isArray(props.methods))
          ? props.methods.filter((m: any) => m.enabled !== false)
          : (Array.isArray(props.icons)
              ? props.icons.map((id: string) => ({ id, name: id, enabled: true }))
              : [
                  { id: 'visa', name: 'Visa', enabled: true },
                  { id: 'mastercard', name: 'Mastercard', enabled: true },
                  { id: 'amex', name: 'American Express', enabled: true },
                  { id: 'paypal', name: 'PayPal', enabled: true },
                  { id: 'apple-pay', name: 'Apple Pay', enabled: true },
                  { id: 'google-pay', name: 'Google Pay', enabled: true },
                ]);

        const justify =
          props.alignment === 'center'
            ? 'center'
            : props.alignment === 'right'
            ? 'flex-end'
            : 'flex-start';

        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: justify,
              flexWrap: 'wrap',
              gap: `${props.gap ?? 8}px`,
              width: effectiveWidthMode === 'fill' ? '100%' : 'auto',
            }}
          >
            {methods.map((m: any, idx: number) => (
              <PaymentBadgeRenderer key={m.id || idx} provider={m.id || m} size={props.size || 'medium'} />
            ))}
          </div>
        );
      }

      case 'copyright': {
        const currentYear = new Date().getFullYear().toString();
        const rawText = props.text || '© {year} BillionBiz. All rights reserved.';
        const text = rawText.replace('{year}', currentYear);
        const align = props.alignment || 'left';
        return (
          <div
            style={{
              width: effectiveWidthMode === 'fill' ? '100%' : 'auto',
              textAlign: align,
            }}
          >
            <span
              style={{
                fontSize: `${props.fontSize || 12}px`,
                color: props.color || 'inherit',
                opacity: props.color ? 1 : 0.65,
                display: 'inline-block',
                whiteSpace: effectiveWidthMode === 'fit' ? 'nowrap' : 'normal',
                lineHeight: 1.5,
              }}
            >
              {text}
            </span>
          </div>
        );
      }

      case 'contact-info': {
        const gap = props.gap ?? 10;
        const fontSize = props.fontSize || 13;
        const showIcons = props.showIcons !== false;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, width: '100%' }}>
            {props.heading && (
              <h4
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {props.heading}
              </h4>
            )}
            {props.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: `${fontSize}px`, opacity: 0.85, lineHeight: 1.4 }}>
                {showIcons && <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px', opacity: 0.7 }} />}
                <span>{props.address}</span>
              </div>
            )}
            {props.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: `${fontSize}px`, opacity: 0.85 }}>
                {showIcons && <Phone size={15} style={{ flexShrink: 0, opacity: 0.7 }} />}
                <a
                  href={`tel:${props.phone.replace(/[^+\d]/g, '')}`}
                  onClick={(e) => { if (isEditorInteractive) e.preventDefault(); }}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {props.phone}
                </a>
              </div>
            )}
            {props.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: `${fontSize}px`, opacity: 0.85 }}>
                {showIcons && <Mail size={15} style={{ flexShrink: 0, opacity: 0.7 }} />}
                <a
                  href={`mailto:${props.email}`}
                  onClick={(e) => { if (isEditorInteractive) e.preventDefault(); }}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {props.email}
                </a>
              </div>
            )}
            {props.hours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: `${fontSize}px`, opacity: 0.85 }}>
                {showIcons && <Clock size={15} style={{ flexShrink: 0, opacity: 0.7 }} />}
                <span>{props.hours}</span>
              </div>
            )}
          </div>
        );
      }

      case 'trust-badge': {
        const badges = (props.badges || []).filter((b: any) => b.enabled !== false);
        const isHoriz = props.layout !== 'vertical';
        const justify =
          props.alignment === 'center'
            ? 'center'
            : props.alignment === 'right'
            ? 'flex-end'
            : 'flex-start';

        const getTrustIcon = (iconName: string) => {
          switch (iconName) {
            case 'shield':
              return <ShieldCheck size={18} style={{ color: '#10b981', flexShrink: 0 }} />;
            case 'check':
              return <CheckCircle2 size={18} style={{ color: '#2563eb', flexShrink: 0 }} />;
            case 'truck':
              return <Truck size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />;
            case 'headphones':
              return <Headphones size={18} style={{ color: '#8b5cf6', flexShrink: 0 }} />;
            case 'return':
              return <RotateCcw size={18} style={{ color: '#06b6d4', flexShrink: 0 }} />;
            default:
              return <ShieldCheck size={18} style={{ color: '#10b981', flexShrink: 0 }} />;
          }
        };

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: isHoriz ? 'row' : 'column',
              flexWrap: 'wrap',
              gap: `${props.gap ?? 16}px`,
              alignItems: 'center',
              justifyContent: justify,
              width: effectiveWidthMode === 'fill' ? '100%' : 'auto',
            }}
          >
            {badges.map((b: any, idx: number) => (
              <div
                key={b.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(226, 232, 240, 0.15)',
                  minWidth: 0,
                }}
              >
                {getTrustIcon(b.icon)}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.2, color: 'inherit' }}>
                    {b.title}
                  </span>
                  {b.subtitle && (
                    <span style={{ fontSize: '11px', opacity: 0.7, lineHeight: 1.2, color: 'inherit' }}>
                      {b.subtitle}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'app-download': {
        const isRow = props.layout !== 'column';
        const justify =
          props.alignment === 'center'
            ? 'center'
            : props.alignment === 'right'
            ? 'flex-end'
            : 'flex-start';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: effectiveWidthMode === 'fill' ? '100%' : 'auto' }}>
            {props.heading && (
              <h4
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'inherit',
                  textAlign: props.alignment || 'left',
                }}
              >
                {props.heading}
              </h4>
            )}
            {props.subheading && (
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  opacity: 0.75,
                  textAlign: props.alignment || 'left',
                }}
              >
                {props.subheading}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: isRow ? 'row' : 'column',
                flexWrap: 'wrap',
                gap: `${props.gap ?? 10}px`,
                justifyContent: justify,
                alignItems: 'center',
              }}
            >
              {props.showApple !== false && (
                <a
                  href={props.appleUrl || '#'}
                  onClick={(e) => { if (isEditorInteractive) e.preventDefault(); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.64-.78 1.08-1.87.96-2.96-1.01.04-2.22.67-2.92 1.48-.61.7-.97 1.83-.83 2.89 1.13.09 2.15-.63 2.79-1.41z" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontSize: '9px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
                      Download on the
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>
                      App Store
                    </span>
                  </div>
                </a>
              )}
              {props.showGoogle !== false && (
                <a
                  href={props.googleUrl || '#'}
                  onClick={(e) => { if (isEditorInteractive) e.preventDefault(); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186c-.368-.387-.61-.958-.61-1.636V3.45c0-.678.242-1.249.61-1.636zM15.207 13.414l2.586 2.586-11.834 6.83 9.248-9.416zm0-2.828L5.959 1.17 17.793 8l-2.586 2.586zm1.414 1.414l3.535-2.04c.883-.51.883-1.336 0-1.846l-3.535-2.04-1.414 1.414 1.414 4.512z" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontSize: '9px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
                      GET IT ON
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>
                      Google Play
                    </span>
                  </div>
                </a>
              )}
            </div>
          </div>
        );
      }

      case 'localization': {
        const justify =
          props.alignment === 'center'
            ? 'center'
            : props.alignment === 'right'
            ? 'flex-end'
            : 'flex-start';
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: `${props.gap ?? 10}px`,
              justifyContent: justify,
              width: effectiveWidthMode === 'fill' ? '100%' : 'auto',
            }}
          >
            {props.showCountry !== false && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isEditorInteractive ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
              >
                <Globe size={14} style={{ opacity: 0.8 }} />
                <span>{props.currentCountry || 'United States (USD $)'}</span>
                <ChevronDown size={12} style={{ opacity: 0.6 }} />
              </div>
            )}
            {props.showLanguage !== false && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(226, 232, 240, 0.2)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isEditorInteractive ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
              >
                <span>{props.currentLanguage || 'English (US)'}</span>
                <ChevronDown size={12} style={{ opacity: 0.6 }} />
              </div>
            )}
          </div>
        );
      }

      case 'custom-html':
        return (
          <div
            style={{ width: effectiveWidthMode === 'fill' ? '100%' : 'auto' }}
            dangerouslySetInnerHTML={{ __html: props.html || '<div>Custom HTML Block</div>' }}
          />
        );

      case 'divider':
        return (
          <hr
            style={{
              margin: `${props.spacing ?? 12}px 0`,
              border: 'none',
              borderTop: `${props.thickness || 1}px ${props.style || 'solid'} ${props.color || 'rgba(226, 232, 240, 0.8)'}`,
              width: props.width || '100%',
            }}
          />
        );

      case 'spacer':
        return (
          <div
            style={{
              height: `${props.height || 24}px`,
              width: '100%',
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={leafContainerStyle}
      onClick={handleClick}
      onMouseOver={(e) => {
        if (!isEditorInteractive) return;
        e.stopPropagation();
        onHover(node.id);
      }}
      onMouseOut={(e) => {
        if (!isEditorInteractive) return;
        e.stopPropagation();
        onHover(null);
      }}
    >
      {renderLeafContent()}
    </div>
  );
};

// ─── MAIN FOOTER TREE RENDERER ───────────────────────────────

interface FooterTreeRendererProps {
  tree?: FooterTreeNode[];
  isEditorInteractive?: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
}

export const FooterTreeRenderer: React.FC<FooterTreeRendererProps> = ({
  tree: explicitTree,
  isEditorInteractive = false,
  device = 'desktop',
}) => {
  const store = useEditorContextStore();
  const {
    footerTree,
    pendingFooterTree,
    selectedFooterNodeId,
    selectFooterNode,
    openFooterComponentPicker,
    footerRows,
  } = store;

  const [hoveredId, setHoveredId] = useState<string | 'root' | null>(null);

  // Use explicitTree if provided, or pending template tree during preview, or store footerTree
  const effectiveTree = explicitTree || pendingFooterTree || footerTree;

  // Retrieve root row styling & layout
  const rootRow = footerRows.find((r) => r.id === 'footer-main') || footerRows[0];
  const layout = rootRow?.layout;
  const styling = rootRow?.styling;

  const bgColor = styling?.bgColor || '#ffffff';
  const textColor = styling?.textColor || '#0f172a';
  const borderColor = styling?.borderColor || '#e2e8f0';
  const containerMode = layout?.container || 'constrained';

  const paddingY = layout?.paddingY ?? 64;
  const paddingX = layout?.paddingX ?? 32;

  const isRootSelected = isEditorInteractive && selectedFooterNodeId === null;
  const isRootHovered = isEditorInteractive && hoveredId === 'root';

  return (
    <footer
      role="contentinfo"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderTop: styling?.borderTop ? `1px solid ${borderColor}` : undefined,
        borderBottom: styling?.borderBottom ? `1px solid ${borderColor}` : undefined,
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        ...(isEditorInteractive
          ? {
              outline: isRootSelected ? '2px solid #2563eb' : isRootHovered ? '2px dashed #2563eb' : undefined,
              outlineOffset: '-2px',
            }
          : {}),
      }}
      onMouseOver={() => {
        if (!isEditorInteractive) return;
        setHoveredId('root');
      }}
      onMouseOut={() => {
        if (!isEditorInteractive) return;
        setHoveredId(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isEditorInteractive) {
          selectFooterNode(null);
          const landingStore = useLandingEditorStore.getState();
          landingStore.setSelectedPageId('footer-global');
          landingStore.setActivePanel('pages');
          landingStore.setRightSidebarOpen(true);
        }
      }}
    >
      <div
        style={{
          maxWidth: containerMode === 'full' ? '100%' : '1280px',
          margin: '0 auto',
          padding: `${paddingY}px ${paddingX}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {effectiveTree.length === 0 && isEditorInteractive ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              openFooterComponentPicker(null);
            }}
            style={{
              padding: '48px 24px',
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#64748b',
              cursor: 'pointer',
              backgroundColor: 'rgba(248, 250, 252, 0.5)',
              width: '100%',
            }}
          >
            <Plus size={24} color="#2563eb" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
              Footer is empty
            </p>
            <p style={{ margin: 0, fontSize: '12px' }}>
              Click here to add your first Group or Component
            </p>
          </div>
        ) : (
          effectiveTree.map((node) => (
            <NodeRenderer
              key={node.id}
              node={node}
              parentDirection="vertical"
              isEditorInteractive={isEditorInteractive}
              device={device}
              selectedId={selectedFooterNodeId}
              hoveredId={hoveredId}
              onSelect={(id) => {
                selectFooterNode(id);
                const landingStore = useLandingEditorStore.getState();
                landingStore.setSelectedPageId('footer-global');
                landingStore.setActivePanel('pages');
                landingStore.setRightSidebarOpen(true);
              }}
              onHover={setHoveredId}
              onAddChild={(parentId) => openFooterComponentPicker(parentId)}
            />
          ))
        )}
      </div>
    </footer>
  );
};
