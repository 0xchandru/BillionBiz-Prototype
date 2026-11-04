import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  ShoppingBag,
  Type,
  Link as LinkIcon,
  Check,
  Trash2,
  X,
  GripVertical,
  Box,
  Menu,
  EyeOff,
} from 'lucide-react';
import {
  HEADER_VARIANTS,
  HEADER_ARRANGEMENTS,
  ANNOUNCEMENT_VARIANTS,
  createResponsiveArrangement,
  createDefaultHeaderStack,
} from './headerPresets';
import { ThemeOverrideControl } from '../ui/ThemeOverrideControl';
import { DeviceSelector, type DeviceType } from '../ui/DeviceSelector';
import { SpacingEditor, SectionWidthEditor } from '../ui/SpacingEditor';
import type { ThemeOverrideValue } from '../theme/themeResolver';
import type { HeaderRow, HeaderElement, HeaderElementType, HeaderResponsiveArrangement, HeaderSlotArrangement } from './types';
import { useEditorContextStore } from '../../../store/editorContextStore';
import styles from '../../../pages/editor/EditorLayout.module.css';

export const CATEGORY_BAR_VARIANTS = [
  {
    id: 'text-links',
    name: 'Clean Text Links',
    description: 'Minimal text links with active color indicator and underline',
  },
  {
    id: 'pills',
    name: 'Pill Chips',
    description: 'Modern rounded capsule buttons with active solid background',
  },
  {
    id: 'badges',
    name: 'Icon & Badges',
    description: 'Category links with badge highlights (NEW, HOT, SALE)',
  },
  {
    id: 'underline',
    name: 'Underline Tabs',
    description: 'Tab-style links with bottom indicator bar',
  },
];

export const UTILITY_BAR_VARIANTS = [
  {
    id: 'split',
    name: 'Split Support & Tracking',
    description: 'Phone and store hours on left, order tracking & currency on right',
  },
  {
    id: 'centered',
    name: 'Centered Customer Care',
    description: 'Centered support hotline and customer service email',
  },
  {
    id: 'minimal',
    name: 'Compact Minimal',
    description: 'Streamlined contact numbers and help links',
  },
];

interface HeaderSectionInspectorProps {
  row: HeaderRow;
  onClose: () => void;
}

// ─── Visual Wireframe Diagram for Arrangements ─────────────
const ArrangementWireframe: React.FC<{ arrId: string }> = ({ arrId }) => {
  const pill = (bg: string, fg: string): React.CSSProperties => ({
    backgroundColor: bg,
    color: fg,
    fontSize: '9px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
  });

  switch (arrId) {
    case 'center-split':
    case 'floating-center-brand':
    case 'transparent-center-split':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', gap: '4px' }}>
          <span style={pill('#e2e8f0', '#475569')}>Nav Links</span>
          <span style={pill('#2563eb', '#ffffff')}>Logo</span>
          <span style={pill('#e2e8f0', '#475569')}>Actions</span>
        </div>
      );
    case 'center-split-inverse':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', gap: '4px' }}>
          <span style={pill('#e2e8f0', '#475569')}>Actions</span>
          <span style={pill('#2563eb', '#ffffff')}>Logo</span>
          <span style={pill('#e2e8f0', '#475569')}>Nav Links</span>
        </div>
      );
    case 'split-navigation':
    case 'floating-split-nav':
    case 'transparent-split-nav':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', gap: '3px' }}>
          <span style={pill('#e2e8f0', '#475569')}>Nav 1/2</span>
          <span style={pill('#2563eb', '#ffffff')}>Logo</span>
          <span style={pill('#e2e8f0', '#475569')}>Nav 2/2</span>
          <span style={pill('#cbd5e1', '#334155')}>Actions</span>
        </div>
      );
    case 'inverse-general':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', gap: '4px' }}>
          <span style={pill('#e2e8f0', '#475569')}>Actions</span>
          <span style={pill('#e2e8f0', '#475569')}>Nav Links</span>
          <span style={pill('#2563eb', '#ffffff')}>Logo</span>
        </div>
      );
    case 'logo-nav-left':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', gap: '4px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={pill('#2563eb', '#ffffff')}>Logo</span>
            <span style={pill('#e2e8f0', '#475569')}>Nav Links</span>
          </div>
          <span style={pill('#e2e8f0', '#475569')}>Actions</span>
        </div>
      );
    case 'hamburger-right':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', gap: '4px' }}>
          <span style={pill('#2563eb', '#ffffff')}>Logo</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={pill('#e2e8f0', '#475569')}>☰ Menu</span>
            <span style={pill('#e2e8f0', '#475569')}>🛒</span>
          </div>
        </div>
      );
    case 'hamburger-left-logo-center':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', gap: '4px' }}>
          <span style={pill('#e2e8f0', '#475569')}>☰ Menu</span>
          <span style={pill('#2563eb', '#ffffff')}>Logo</span>
          <span style={pill('#e2e8f0', '#475569')}>🛒</span>
        </div>
      );
    case 'hamburger-left-logo-right':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', gap: '4px' }}>
          <span style={pill('#e2e8f0', '#475569')}>☰ Menu</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={pill('#e2e8f0', '#475569')}>🛒</span>
            <span style={pill('#2563eb', '#ffffff')}>Logo</span>
          </div>
        </div>
      );
    case 'rail-stacked':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', padding: '5px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <span style={pill('#2563eb', '#ffffff')}>Logo</span>
          <span style={pill('#e2e8f0', '#475569')}>Nav Links</span>
          <span style={pill('#e2e8f0', '#475569')}>Actions</span>
        </div>
      );
    case 'rail-compact-icons':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', padding: '5px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <span style={pill('#2563eb', '#ffffff')}>Icon</span>
          <span style={pill('#e2e8f0', '#475569')}>Links</span>
          <span style={pill('#e2e8f0', '#475569')}>Profile</span>
        </div>
      );
    case 'rail-nav-top':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', padding: '5px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <span style={pill('#e2e8f0', '#475569')}>Nav Links</span>
          <span style={pill('#e2e8f0', '#475569')}>Actions</span>
          <span style={pill('#2563eb', '#ffffff')}>Logo</span>
        </div>
      );
    default:
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', gap: '4px' }}>
          <span style={pill('#2563eb', '#ffffff')}>Logo</span>
          <span style={pill('#e2e8f0', '#475569')}>Nav Links</span>
          <span style={pill('#e2e8f0', '#475569')}>Actions</span>
        </div>
      );
  }
};

// ─── Visual Wireframe Diagram for Presets ───────────────────
const PresetWireframe: React.FC<{
  presetId: string;
  category?: string;
  isAnnouncement?: boolean;
  isCategoryBar?: boolean;
  isUtilityBar?: boolean;
}> = ({
  presetId,
  isAnnouncement,
  isCategoryBar,
  isUtilityBar,
}) => {
  if (isAnnouncement) {
    if (presetId.includes('countdown')) {
      return (
        <div style={{ background: '#f8fafc', borderRadius: '5px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '24px' }}>
          <div style={{ width: '45%', height: '5px', borderRadius: '2px', backgroundColor: '#64748b' }} />
          <div style={{ display: 'flex', gap: '3px' }}>
            <div style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: '#ef4444' }} />
            <div style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: '#ef4444' }} />
            <div style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: '#ef4444' }} />
          </div>
        </div>
      );
    }
    if (presetId.includes('cta') || presetId.includes('button')) {
      return (
        <div style={{ background: '#f8fafc', borderRadius: '5px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '24px' }}>
          <div style={{ width: '50%', height: '5px', borderRadius: '2px', backgroundColor: '#64748b' }} />
          <div style={{ width: '22px', height: '10px', borderRadius: '3px', backgroundColor: '#2563eb' }} />
        </div>
      );
    }
    if (presetId.includes('split') || presetId.includes('multi')) {
      return (
        <div style={{ background: '#f8fafc', borderRadius: '5px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '24px' }}>
          <div style={{ width: '30%', height: '5px', borderRadius: '2px', backgroundColor: '#94a3b8' }} />
          <div style={{ width: '30%', height: '5px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
          <div style={{ width: '20%', height: '5px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
        </div>
      );
    }
    return (
      <div style={{ background: '#f8fafc', borderRadius: '5px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', height: '24px' }}>
        <div style={{ width: '60%', height: '5px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
      </div>
    );
  }

  if (isCategoryBar) {
    if (presetId === 'pills') {
      return (
        <div style={{ background: '#f8fafc', borderRadius: '5px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #e2e8f0', height: '24px' }}>
          <div style={{ width: '18px', height: '8px', borderRadius: '999px', backgroundColor: '#2563eb' }} />
          <div style={{ width: '18px', height: '8px', borderRadius: '999px', backgroundColor: '#e2e8f0' }} />
          <div style={{ width: '18px', height: '8px', borderRadius: '999px', backgroundColor: '#e2e8f0' }} />
        </div>
      );
    }
    return (
      <div style={{ background: '#f8fafc', borderRadius: '5px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0', height: '24px' }}>
        <div style={{ width: '20px', height: '4px', borderRadius: '1px', backgroundColor: '#2563eb' }} />
        <div style={{ width: '20px', height: '4px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
        <div style={{ width: '20px', height: '4px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
      </div>
    );
  }

  if (isUtilityBar) {
    return (
      <div style={{ background: '#f8fafc', borderRadius: '5px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '24px' }}>
        <div style={{ width: '35%', height: '4px', borderRadius: '1px', backgroundColor: '#64748b' }} />
        <div style={{ width: '25%', height: '4px', borderRadius: '1px', backgroundColor: '#2563eb' }} />
      </div>
    );
  }

  // Header Wireframes
  switch (presetId) {
    case 'classic-standard':
    case 'standard':
      return (
        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '34px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
            <div style={{ width: '22px', height: '5px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '4px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
            <div style={{ width: '14px', height: '4px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
            <div style={{ width: '12px', height: '4px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706' }} />
          </div>
        </div>
      );

    case 'inline-nav-left':
      return (
        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '34px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
              <div style={{ width: '18px', height: '5px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
            </div>
            <div style={{ width: '1px', height: '10px', backgroundColor: '#cbd5e1' }} />
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '10px', height: '4px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
              <div style={{ width: '12px', height: '4px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            <div style={{ width: '16px', height: '8px', borderRadius: '3px', backgroundColor: '#2563eb' }} />
          </div>
        </div>
      );

    case 'centered-brand':
      return (
        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '34px' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '4px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
            <div style={{ width: '12px', height: '4px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <div style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
            <div style={{ width: '24px', height: '6px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706' }} />
          </div>
        </div>
      );

    case 'prominent-search':
      return (
        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '34px', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
            <div style={{ width: '16px', height: '5px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
          </div>
          <div style={{ flex: 1, height: '14px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', padding: '0 4px', gap: '3px' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
            <div style={{ width: '28px', height: '3px', borderRadius: '1px', backgroundColor: '#cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706' }} />
          </div>
        </div>
      );

    case 'floating-pill':
    case 'floating':
      return (
        <div style={{ background: '#e2e8f0', borderRadius: '6px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', height: '34px' }}>
          <div style={{ width: '94%', height: '22px', borderRadius: '11px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 5px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
              <div style={{ width: '16px', height: '4px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '10px', height: '3px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
              <div style={{ width: '10px', height: '3px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#d97706' }} />
            </div>
          </div>
        </div>
      );

    case 'minimalist-clean':
    case 'minimal-hamburger':
      return (
        <div style={{ background: '#ffffff', borderRadius: '6px', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '34px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
            <div style={{ width: '22px', height: '5px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ width: '11px', height: '2px', borderRadius: '1px', backgroundColor: '#0f172a' }} />
              <div style={{ width: '8px', height: '2px', borderRadius: '1px', backgroundColor: '#0f172a' }} />
              <div style={{ width: '11px', height: '2px', borderRadius: '1px', backgroundColor: '#0f172a' }} />
            </div>
          </div>
        </div>
      );

    case 'two-tier-stacked':
      return (
        <div style={{ background: '#ffffff', borderRadius: '6px', padding: '3px 6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '34px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ width: '20px', height: '4px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
            <div style={{ width: '28px', height: '6px', borderRadius: '2px', backgroundColor: '#e2e8f0' }} />
            <div style={{ width: '12px', height: '5px', borderRadius: '2px', backgroundColor: '#d97706' }} />
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: '#f1f5f9' }} />
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '12px', height: '3px', borderRadius: '1px', backgroundColor: '#2563eb' }} />
            <div style={{ width: '14px', height: '3px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
            <div style={{ width: '12px', height: '3px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
            <div style={{ width: '14px', height: '3px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
          </div>
        </div>
      );

    case 'full-width-edge':
      return (
        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '5px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #cbd5e1', height: '34px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
            <div style={{ width: '18px', height: '4px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
          </div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <div style={{ width: '14px', height: '3px', borderRadius: '1px', backgroundColor: '#64748b' }} />
            <div style={{ width: '16px', height: '3px', borderRadius: '1px', backgroundColor: '#64748b' }} />
            <div style={{ width: '14px', height: '3px', borderRadius: '1px', backgroundColor: '#64748b' }} />
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#d97706' }} />
          </div>
        </div>
      );

    default: // classic-standard
      return (
        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', height: '34px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
            <div style={{ width: '22px', height: '4px', borderRadius: '2px', backgroundColor: '#0f172a' }} />
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '3px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
            <div style={{ width: '14px', height: '3px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
            <div style={{ width: '12px', height: '3px', borderRadius: '1px', backgroundColor: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <div style={{ width: '10px', height: '5px', borderRadius: '2px', backgroundColor: '#e2e8f0' }} />
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#d97706' }} />
          </div>
        </div>
      );
  }
};

// ─── Main HeaderSectionInspector Component ──────────────────
export const HeaderSectionInspector: React.FC<HeaderSectionInspectorProps> = ({
  row: propRow,
  onClose,
}) => {
  const {
    activeTab,
    setActiveTab,
    updateHeaderRow,
    updateHeaderElement,
    updateHeaderSettings,
    selectTarget,
    previewVariant,
    cancelPreview,
    headerRows,
    headerSettings,
    presetPreview,
  } = useEditorContextStore();

  const isPresetPreviewActive = Boolean(presetPreview?.isActive && presetPreview?.editorType === 'header');
  const effectiveHeaderRows = isPresetPreviewActive && presetPreview?.previewRows
    ? (presetPreview.previewRows as HeaderRow[])
    : headerRows;

  // Derive row reactively from effectiveHeaderRows
  const row = (effectiveHeaderRows && effectiveHeaderRows.length > 0
    ? (effectiveHeaderRows.find((r: HeaderRow) => r.id === propRow.id) || effectiveHeaderRows.find((r: HeaderRow) => r.type === propRow.type))
    : undefined) || propRow;

  const isPrimaryNav = row.type === 'primary-nav' || row.id === 'row-primary-nav' || (row.type as string) === 'header';
  const isAnnouncement = row.type === 'announcement' || row.id.includes('announcement');
  const isUtilityBar = row.type === 'utility' || row.id.includes('utility');
  const isCategoryBar = row.type === 'secondary-nav' || row.id.includes('secondary') || row.id.includes('category');

  const updateHeaderRowAndStudio = (rowId: string, updates: Partial<HeaderRow>) => {
    updateHeaderRow(rowId, updates);
  };

  const updateHeaderElementAndStudio = (rowId: string, elementId: string, updates: Partial<HeaderElement>) => {
    updateHeaderElement(rowId, elementId, updates);
  };

  // ─── Tabs tailored per row type ───
  const primaryTabs = isPrimaryNav
    ? [
        { id: 'presets', label: 'Look' },
        { id: 'content', label: 'Components' },
        { id: 'design', label: 'Design' },
        { id: 'behavior', label: 'Behavior' },
        { id: 'responsive', label: 'Responsive' },
        { id: 'advanced', label: 'Advanced' },
      ]
    : isCategoryBar
    ? [
        { id: 'presets', label: 'Styles' },
        { id: 'content', label: 'Categories' },
        { id: 'layout', label: 'Layout' },
        { id: 'design', label: 'Design' },
        { id: 'behavior', label: 'Behavior' },
      ]
    : isUtilityBar
    ? [
        { id: 'presets', label: 'Layouts' },
        { id: 'content', label: 'Details' },
        { id: 'layout', label: 'Layout' },
        { id: 'design', label: 'Design' },
        { id: 'behavior', label: 'Behavior' },
      ]
    : [
        { id: 'presets', label: 'Presets' },
        { id: 'content', label: 'Content' },
        { id: 'layout', label: 'Layout' },
        { id: 'design', label: 'Design' },
        { id: 'behavior', label: 'Behavior' },
      ];

  // Map legacy active tabs if any
  let effectiveTab = activeTab;
  if (effectiveTab === 'look') effectiveTab = 'presets';
  if (effectiveTab === 'visibility') effectiveTab = 'behavior';
  const currentTab = primaryTabs.some((t) => t.id === effectiveTab) ? effectiveTab : 'presets';

  // Tabs scroll reference exactly like EditorRightSidebar.tsx / TabRenderer.tsx
  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };

  // Responsive device selectors for layout tab
  const [heightDevice, setHeightDevice] = useState<DeviceType>('desktop');
  const [gapDevice, setGapDevice] = useState<DeviceType>('desktop');
  const [arrangementDevice, setArrangementDevice] = useState<DeviceType>('desktop');
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<keyof HeaderSlotArrangement | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ─── Content Tab Quick Add Modal State ───
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [componentSearch, setComponentSearch] = useState('');

  // ─── Design Tab Accordion Sections ───
  const [openSections, setOpenSections] = useState({
    surface: true,
    typography: false,
    shape: false,
    effects: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ─── Behavior Tab Accordions ───
  const [openBehaviorSections, setOpenBehaviorSections] = useState({
    visibility: true,
    sticky: true,
    scroll: false,
    accessibility: false,
    advanced: false,
  });

  const toggleBehaviorSection = (key: keyof typeof openBehaviorSections) => {
    setOpenBehaviorSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fallbackArrangement: HeaderResponsiveArrangement = {
    desktop: { left: ['logo'], center: ['navigation'], right: ['actions'], disabled: ['search', 'cta'] },
    tablet: { left: ['logo'], center: ['navigation'], right: ['actions'], disabled: ['search', 'cta'] },
    mobile: { left: ['menu'], center: ['logo'], right: ['actions'], disabled: ['search', 'cta'] },
  };

  const currentResponsiveArrangement: HeaderResponsiveArrangement = {
    desktop: { ...fallbackArrangement.desktop, ...row.layout?.responsiveArrangement?.desktop, disabled: row.layout?.responsiveArrangement?.desktop?.disabled || fallbackArrangement.desktop.disabled },
    tablet: { ...fallbackArrangement.tablet, ...row.layout?.responsiveArrangement?.tablet, disabled: row.layout?.responsiveArrangement?.tablet?.disabled || fallbackArrangement.tablet.disabled },
    mobile: { ...fallbackArrangement.mobile, ...row.layout?.responsiveArrangement?.mobile, disabled: row.layout?.responsiveArrangement?.mobile?.disabled || fallbackArrangement.mobile.disabled },
  };
  const updateArrangementSlot = (componentKey: string, slot: keyof HeaderSlotArrangement, insertAt?: number) => {
    const nextArrangement = JSON.parse(JSON.stringify(currentResponsiveArrangement)) as HeaderResponsiveArrangement;
    const currentSlot = nextArrangement[arrangementDevice];
    (['left', 'center', 'right', 'disabled'] as const).forEach((candidateSlot) => {
      currentSlot[candidateSlot] = currentSlot[candidateSlot].filter((key) => key !== componentKey);
    });
    const nextSlot = [...currentSlot[slot]];
    nextSlot.splice(insertAt === undefined ? nextSlot.length : insertAt, 0, componentKey);
    currentSlot[slot] = nextSlot;
    updateHeaderRowAndStudio(row.id, { layout: { ...row.layout, responsiveArrangement: nextArrangement } });
  };

  const moveArrangementComponent = (componentKey: string, direction: -1 | 1) => {
    const nextArrangement = JSON.parse(JSON.stringify(currentResponsiveArrangement)) as HeaderResponsiveArrangement;
    const currentSlot = nextArrangement[arrangementDevice];
    const slot = (['left', 'center', 'right'] as const).find((candidateSlot) => currentSlot[candidateSlot].includes(componentKey));
    if (!slot) return;
    const index = currentSlot[slot].indexOf(componentKey);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= currentSlot[slot].length) return;
    [currentSlot[slot][index], currentSlot[slot][nextIndex]] = [currentSlot[slot][nextIndex], currentSlot[slot][index]];
    updateHeaderRowAndStudio(row.id, { layout: { ...row.layout, responsiveArrangement: nextArrangement } });
  };

  // ─── Preset Application with Content Preservation & Fixed Height ───
  const handleApplyVariant = (variant: any) => {
    const currentHeight = row.layout?.height ?? 64;
    const currentIsCompact = Boolean(row.layout?.isCompact);

    if (isPrimaryNav) {
      const variantPrimary = variant.rows?.find((candidate: HeaderRow) => candidate.type === 'primary-nav');
      const defaultArrangementId = variant.compatibleArrangementIds?.[0] || variantPrimary?.layout?.arrangementId || 'general';
      const arrangementObj = HEADER_ARRANGEMENTS.find((a) => a.id === defaultArrangementId);
      const arrangementLayout = arrangementObj?.layout;

      // Prioritize the variant's exact responsive arrangement
      const nextResponsiveArrangement = variantPrimary?.layout?.responsiveArrangement
        ? JSON.parse(JSON.stringify(variantPrimary.layout.responsiveArrangement))
        : createResponsiveArrangement(
            currentResponsiveArrangement,
            arrangementLayout || variantPrimary?.layout || {},
            { variantId: variant.id },
          );

      // Ensure all standard core elements (logo, navigation, search, actions) exist in row.elements
      const defaultElements = createDefaultHeaderStack().find((r: HeaderRow) => r.type === 'primary-nav')?.elements || [];
      let updatedElements = [...row.elements];

      const hasLogo = updatedElements.some((e: HeaderElement) => e.type === 'logo');
      const hasNav = updatedElements.some((e: HeaderElement) => e.type === 'navigation' || e.type === 'primary-nav' || e.type === 'navigation-menu');
      const hasSearch = updatedElements.some((e: HeaderElement) => e.type === 'search');
      const hasActions = updatedElements.some((e: HeaderElement) => e.type === 'actions' || e.type === 'action-group');

      if (!hasLogo) {
        const defLogo = defaultElements.find((e: HeaderElement) => e.type === 'logo');
        if (defLogo) updatedElements.unshift(defLogo);
      }
      if (!hasNav) {
        const defNav = defaultElements.find((e: HeaderElement) => e.type === 'navigation');
        if (defNav) updatedElements.push(defNav);
      }
      if (!hasSearch) {
        const defSearch = defaultElements.find((e: HeaderElement) => e.type === 'search');
        if (defSearch) updatedElements.push(defSearch);
      }
      if (!hasActions) {
        const defActions = defaultElements.find((e: HeaderElement) => e.type === 'actions');
        if (defActions) updatedElements.push(defActions);
      }

      // If switching to prominent-search, ensure search element is visible and mode is large-inline
      if (variant.id === 'prominent-search') {
        updatedElements = updatedElements.map((el) => {
          if (el.type === 'search') {
            return {
              ...el,
              isVisible: true,
              props: {
                ...el.props,
                mode: 'large-inline',
                placeholder: el.props?.placeholder || 'Search products, collections, brands...',
                showCategoryFilter: true,
              },
            };
          }
          return el;
        });
      }

      // If switching to any variant that uses navigation, ensure navigation is visible
      if (variant.id !== 'minimalist-clean' && variant.id !== 'minimal-hamburger') {
        updatedElements = updatedElements.map((el) => {
          if (el.type === 'navigation' || el.type === 'primary-nav' || el.type === 'navigation-menu') {
            return { ...el, isVisible: true };
          }
          return el;
        });
      }

      const newLayout = {
        ...row.layout,
        variantId: variant.id,
        arrangementId: variantPrimary?.layout?.arrangementId || defaultArrangementId,
        alignment: variantPrimary?.layout?.alignment || arrangementObj?.layout?.alignment || row.layout?.alignment || 'space-between',
        logoPosition: variantPrimary?.layout?.logoPosition || arrangementObj?.layout?.logoPosition || row.layout?.logoPosition || 'left',
        navPosition: variantPrimary?.layout?.navPosition || arrangementObj?.layout?.navPosition || row.layout?.navPosition || 'center',
        actionsPosition: variantPrimary?.layout?.actionsPosition || arrangementObj?.layout?.actionsPosition || row.layout?.actionsPosition || 'right',
        container: variantPrimary?.layout?.container || row.layout?.container || 'constrained',
        paddingX: variantPrimary?.layout?.paddingX ?? row.layout?.paddingX,
        paddingY: variantPrimary?.layout?.paddingY ?? row.layout?.paddingY,
        gap: variantPrimary?.layout?.gap ?? row.layout?.gap,
        responsiveArrangement: nextResponsiveArrangement,
        // CRITICAL CONSTRAINT: Preserve fixed height and compact mode — NEVER alter height or compact mode based on variant!
        height: currentHeight,
        isCompact: currentIsCompact,
      };

      const presetStyling = variantPrimary?.styling;
      const inheritedStyling = presetStyling
        ? {
            ...row.styling,
            radius: presetStyling.radius ?? 0,
            shadow: presetStyling.shadow ?? 'none',
            borderBottom: presetStyling.borderBottom ?? true,
            borderColor: presetStyling.borderColor || row.styling.borderColor,
            fontSize: presetStyling.fontSize || row.styling.fontSize || 14,
            fontWeight: presetStyling.fontWeight || row.styling.fontWeight || 600,
            bgColor: row.styling.bgColor,
            textColor: row.styling.textColor,
            bgGradient: row.styling.bgGradient,
            bgImage: row.styling.bgImage,
            bgVideo: row.styling.bgVideo,
          }
        : row.styling;

      updateHeaderRowAndStudio(row.id, {
        layout: newLayout,
        styling: inheritedStyling,
        elements: updatedElements,
      });

      // Clear all variant-specific global overrides and apply the new variant's overrides
      const baseGlobalOverrides = {
        positioning: (variant.id === 'floating' || variant.id === 'floating-pill' ? 'floating' : (variant.id === 'transparent' ? 'overlay' : 'static')) as any,
        heroAwareMode: (variant.id === 'transparent' ? 'transparent-hero' : 'standard') as any,
      };
      const finalGlobalOverrides = {
        ...baseGlobalOverrides,
        ...variant.globalOverrides,
      };
      useEditorContextStore.getState().updateHeaderSettings(finalGlobalOverrides);
    } else if (isAnnouncement) {
      if (row.elements[0]) {
        updateHeaderRowAndStudio(row.id, {
          layout: {
            ...row.layout,
            variantId: variant.id,
            height: row.layout?.height ?? 38,
            isCompact: currentIsCompact,
          },
        });
        updateHeaderElementAndStudio(row.id, row.elements[0].id, {
          props: { ...row.elements[0].props, ...variant.defaultProps },
        });
      }
    }

    if (isPrimaryNav) {
      cancelPreview();
    }
  };

  // ─── Arrangement Selection with Fixed Height ───
  const handleSelectArrangement = (arr: any) => {
    const currentHeight = row.layout?.height ?? 64;
    const currentIsCompact = Boolean(row.layout?.isCompact);

    // Ensure all standard core elements exist
    const defaultElements = createDefaultHeaderStack().find((r: HeaderRow) => r.type === 'primary-nav')?.elements || [];
    let updatedElements = [...row.elements];

    const hasLogo = updatedElements.some((e: HeaderElement) => e.type === 'logo');
    const hasNav = updatedElements.some((e: HeaderElement) => e.type === 'navigation' || e.type === 'primary-nav' || e.type === 'navigation-menu');
    const hasSearch = updatedElements.some((e: HeaderElement) => e.type === 'search');
    const hasActions = updatedElements.some((e: HeaderElement) => e.type === 'actions' || e.type === 'action-group');

    if (!hasLogo) {
      const defLogo = defaultElements.find((e: HeaderElement) => e.type === 'logo');
      if (defLogo) updatedElements.unshift(defLogo);
    }
    if (!hasNav) {
      const defNav = defaultElements.find((e: HeaderElement) => e.type === 'navigation');
      if (defNav) updatedElements.push(defNav);
    }
    if (!hasSearch) {
      const defSearch = defaultElements.find((e: HeaderElement) => e.type === 'search');
      if (defSearch) updatedElements.push(defSearch);
    }
    if (!hasActions) {
      const defActions = defaultElements.find((e: HeaderElement) => e.type === 'actions');
      if (defActions) updatedElements.push(defActions);
    }

    // If arrangement has center search, configure search element as large-inline
    const isSearchHub = arr.id === 'search-center' || arr.layout?.searchPosition === 'center' || arr.layout?.responsiveArrangement?.desktop?.center?.includes('search');
    if (isSearchHub) {
      updatedElements = updatedElements.map((el) => {
        if (el.type === 'search') {
          return {
            ...el,
            isVisible: true,
            props: {
              ...el.props,
              mode: 'large-inline',
              placeholder: el.props?.placeholder || 'Search products, collections, brands...',
              showCategoryFilter: true,
            },
          };
        }
        return el;
      });
    }

    // Ensure navigation is visible for all arrangements except hamburger-right
    if (arr.id !== 'hamburger-right') {
      updatedElements = updatedElements.map((el) => {
        if (el.type === 'navigation' || el.type === 'primary-nav' || el.type === 'navigation-menu') {
          return { ...el, isVisible: true };
        }
        return el;
      });
    }

    const nextResponsiveArrangement = arr.layout?.responsiveArrangement
      ? JSON.parse(JSON.stringify(arr.layout.responsiveArrangement))
      : createResponsiveArrangement(currentResponsiveArrangement, arr.layout, { variantId: row.layout?.variantId });

    updateHeaderRowAndStudio(row.id, {
      layout: {
        ...row.layout,
        ...arr.layout,
        arrangementId: arr.id,
        responsiveArrangement: nextResponsiveArrangement,
        // CRITICAL CONSTRAINT: Preserve fixed height and compact mode — NEVER alter height or compact mode based on arrangement!
        height: currentHeight,
        isCompact: currentIsCompact,
      },
      elements: updatedElements,
    });

    cancelPreview();
    setToastMessage(`✓ Arrangement "${arr.name}" selected.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ─── Quick Add Categorized Components ───
  const componentCatalog: { category: string; items: { type: HeaderElementType; label: string; desc: string; icon: any }[] }[] = [
    {
      category: 'Branding',
      items: [
        { type: 'logo', label: 'Brand Logo', desc: 'Image or text logo with typography controls', icon: Type },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { type: 'navigation', label: 'Navigation Menu', desc: 'Main links, dropdowns, and mega menus', icon: LinkIcon },
        { type: 'menu', label: 'Menu Button', desc: 'Mobile navigation drawer trigger', icon: Menu },
      ],
    },
    {
      category: 'Commerce & Search',
      items: [
        { type: 'search', label: 'Search Bar', desc: 'Instant product search input or expanding search', icon: Search },
        { type: 'actions', label: 'Cart & Actions', desc: 'Shopping cart counter, wishlist, and account icon', icon: ShoppingBag },
        { type: 'cta', label: 'Call to Action', desc: 'Primary conversion button with destination and style', icon: Plus },
      ],
    },
  ];

  const isComponentAdded = (type: HeaderElementType) => {
    return row.elements.some((el: HeaderElement) => {
      if (type === 'logo') return el.type === 'logo';
      if (type === 'navigation' || type === 'primary-nav') {
        return el.type === 'navigation' || el.type === 'primary-nav' || el.type === 'navigation-menu';
      }
      if (type === 'actions') {
        return el.type === 'actions' || el.type === 'action-group';
      }
      if (type === 'search') return el.type === 'search';
      if (type === 'cta') return el.type === 'cta';
      return el.type === type;
    });
  };

  const handleAddComponentFromCatalog = (type: HeaderElementType, label: string) => {
    if (isComponentAdded(type)) return;

    let defaultProps: Record<string, any> = {};
    switch (type) {
      case 'logo':
        defaultProps = {
          logoType: 'both',
          text: 'BillionBiz',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
          desktopWidth: 140,
          tabletWidth: 120,
          mobileWidth: 100,
          maxHeight: 36,
          isTwoLines: false,
        };
        break;
      case 'navigation':
      case 'primary-nav':
        defaultProps = {
          items: [
            { id: '1', label: 'Home', url: '/' },
            { id: '2', label: 'Shop', url: '/products' },
            { id: '3', label: 'Collections', url: '/collections' },
            { id: '4', label: 'About', url: '/about' },
            { id: '5', label: 'Contact', url: '/contact' },
          ],
        };
        break;
      case 'actions':
        defaultProps = {
          showCart: true,
          showAccount: true,
          showWishlist: true,
          showSearch: true,
          showCta: false,
          ctaText: 'Get Started',
          ctaUrl: '/products',
        };
        break;
      case 'search':
        defaultProps = {
          placeholder: 'Search products, collections...',
          inputWidth: 240,
        };
        break;
      case 'cta':
        defaultProps = {
          text: 'Shop Now',
          url: '/shop',
          variant: 'primary',
          size: 'sm',
        };
        break;
      default:
        defaultProps = { text: 'Custom Element' };
    }

    const newElement: HeaderElement = {
      id: `el-${Date.now()}`,
      type,
      name: label,
      isVisible: true,
      props: defaultProps,
    };

    const componentKey = type === 'navigation' || type === 'primary-nav' || type === 'navigation-menu'
      ? 'navigation'
      : type === 'actions' || type === 'action-group'
      ? 'actions'
      : type;
    const nextArrangement = JSON.parse(JSON.stringify(currentResponsiveArrangement)) as HeaderResponsiveArrangement;
    (['desktop', 'tablet', 'mobile'] as const).forEach((device) => {
      const slots = nextArrangement[device];
      (['left', 'center', 'right', 'disabled'] as const).forEach((slot) => {
        slots[slot] = slots[slot].filter((key) => key !== componentKey);
      });
      slots.right = [...slots.right, componentKey];
    });

    updateHeaderRowAndStudio(row.id, {
      elements: [...row.elements, newElement],
      layout: { ...row.layout, responsiveArrangement: nextArrangement },
    });

    setIsAddModalOpen(false);

    selectTarget({
      type: 'element',
      editorType: 'header',
      rowId: row.id,
      elementId: newElement.id,
      elementType: newElement.type,
    });
  };

  // ─── Reconstruct ThemeOverrideValue objects for ThemeOverrideControl ───
  const currentBgOverride: ThemeOverrideValue = (row.styling as any)?.bgOverride || {
    mode: (row.styling?.bgType as any) || 'inherit',
    color: row.styling?.bgColor,
    gradientCss: row.styling?.bgGradient,
    image: row.styling?.bgImage ? {
      url: row.styling.bgImage,
      position: (row.styling as any).bgPosition || 'center',
      size: (row.styling as any).bgSize || 'cover',
      overlayColor: '#000000',
      overlayOpacity: ((row.styling as any).bgOpacity ?? 100) / 100,
    } : undefined,
    video: row.styling?.bgVideo ? {
      url: row.styling.bgVideo,
      overlayColor: '#000000',
      overlayOpacity: ((row.styling as any).bgOpacity ?? 30) / 100,
    } : undefined,
  };

  const currentTextOverride: ThemeOverrideValue = (row.styling as any)?.textOverride || {
    mode: (row.styling?.textColorMode as any) || (row.styling?.textColor ? 'color' : 'inherit'),
    color: row.styling?.textColor,
    gradientCss: row.styling?.textGradient,
  };

  const currentBorderOverride: ThemeOverrideValue = (row.styling as any)?.borderOverride || {
    mode: (row.styling?.borderColorMode as any) || (row.styling?.borderColor ? 'color' : 'inherit'),
    color: row.styling?.borderColor,
  };

  const handleBgOverrideChange = (val: ThemeOverrideValue) => {
    let bgColor = val.color || '';
    let bgGradient = val.gradientCss;
    if (!bgGradient && val.gradient) {
      bgGradient = val.gradient.type === 'radial'
        ? `radial-gradient(circle, ${val.gradient.color1}, ${val.gradient.color2})`
        : `linear-gradient(${val.gradient.angle || '135deg'}, ${val.gradient.color1}, ${val.gradient.color2})`;
    }
    updateHeaderRowAndStudio(row.id, {
      styling: {
        ...row.styling,
        bgType: val.mode,
        bgColor: val.mode === 'color' ? bgColor : val.mode === 'inherit' ? '' : (row.styling.bgColor || ''),
        bgGradient: val.mode === 'gradient' ? bgGradient : undefined,
        bgImage: val.mode === 'image' ? val.image?.url : undefined,
        bgSize: val.mode === 'image' ? (val.image?.size as any) : undefined,
        bgPosition: val.mode === 'image' ? val.image?.position : undefined,
        bgVideo: val.mode === 'video' ? val.video?.url : undefined,
        bgOpacity: val.mode === 'video' ? Math.round((val.video?.overlayOpacity ?? 0.3) * 100) : (val.mode === 'image' ? Math.round((val.image?.overlayOpacity ?? 0.3) * 100) : 100),
        bgOverride: val,
      },
    });
  };

  const handleTextOverrideChange = (val: ThemeOverrideValue) => {
    updateHeaderRowAndStudio(row.id, {
      styling: {
        ...row.styling,
        textColorMode: val.mode as any,
        textColor: val.mode === 'color' ? (val.color || '') : val.mode === 'inherit' ? '' : (row.styling.textColor || ''),
        textGradient: val.mode === 'gradient' ? (val.gradientCss || (val.gradient ? `linear-gradient(135deg, ${val.gradient.color1}, ${val.gradient.color2})` : undefined)) : undefined,
        textOverride: val,
      },
    });
  };

  const handleBorderOverrideChange = (val: ThemeOverrideValue) => {
    updateHeaderRowAndStudio(row.id, {
      styling: {
        ...row.styling,
        borderColorMode: val.mode as any,
        borderColor: val.mode === 'color' ? (val.color || '') : val.mode === 'inherit' ? '' : (row.styling.borderColor || ''),
        borderOverride: val,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', position: 'relative' }}>
      {/* ─── Top Header Bar ─── */}
      <div className={styles.panelHeader}>
        <div className={styles.phLeft}>
          <button className={styles.iconBtn} onClick={onClose} title="Collapse sidebar">
            <ChevronRight size={20} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600}>
            {isAnnouncement
              ? 'Announcement Bar'
              : isUtilityBar
              ? 'Utility Bar'
              : isCategoryBar
              ? 'Category Bar'
              : 'Header Navbar'}
          </h3>
        </div>
      </div>

      {/* ─── Exact EditorRightSidebar Tabs Header with Chevron Scroll Buttons ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        background: '#f8fafc',
      }}>
        <button
          onClick={() => scrollTabs('left')}
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
          title="Scroll tabs left"
        >
          <ChevronLeft size={16} />
        </button>
        <div
          ref={tabsRef}
          className={styles.propTabs}
          style={{ overflowX: 'auto', flexWrap: 'nowrap', borderBottom: 'none', flex: 1 }}
        >
          {primaryTabs.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.propTab} ${currentTab === tab.id ? styles.activePropTab : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
              style={{ flex: '0 0 auto', padding: '12px 14px', whiteSpace: 'nowrap', cursor: 'pointer' }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <button
          onClick={() => scrollTabs('right')}
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
          title="Scroll tabs right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── Success Toast Message ─── */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '84px',
            left: '16px',
            right: '16px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            zIndex: 150,
          }}
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ─── Scrollable Tab Content ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* ══════════════════════════════════════════════════════
            1. PRESETS TAB (Compact 2-Column Grid, Real Wireframes, Safe Hover)
           ══════════════════════════════════════════════════════ */}
        {currentTab === 'presets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* ── HEADER VARIANTS / ANNOUNCEMENT VARIANTS ── */}
            {/* ── HEADER / ANNOUNCEMENT / CATEGORY / UTILITY VARIANTS ── */}
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                {isAnnouncement
                  ? 'Announcement Bar Style'
                  : isCategoryBar
                  ? 'Category Bar Style'
                  : isUtilityBar
                  ? 'Utility Bar Style'
                  : 'Header Type'}
              </h4>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#64748b' }}>
                {isAnnouncement
                  ? 'Choose the layout and animation style for this announcement bar.'
                  : isCategoryBar
                  ? 'Choose the display style and chip layout for the category navigation bar.'
                  : isUtilityBar
                  ? 'Choose the contact layout style for this utility bar.'
                  : 'Choose the structural style for your header navbar.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(isAnnouncement
                  ? ANNOUNCEMENT_VARIANTS
                  : isCategoryBar
                  ? CATEGORY_BAR_VARIANTS
                  : isUtilityBar
                  ? UTILITY_BAR_VARIANTS
                  : HEADER_VARIANTS
                ).map((variant) => {
                  const currentVariantId =
                    row.layout?.variantId ||
                    (isAnnouncement ? 'single' : isCategoryBar ? 'text-links' : isUtilityBar ? 'split' : 'standard');
                  const isSelected = currentVariantId === variant.id;

                  return (
                    <div
                      key={variant.id}
                      onClick={() => handleApplyVariant(variant)}
                      onMouseEnter={() => {
                        if (isPrimaryNav) previewVariant('header', variant.id, true);
                      }}
                      onMouseLeave={() => {
                        if (isPrimaryNav) cancelPreview();
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                      }}
                    >
                      {/* Wireframe Preview */}
                      <div style={{ width: '100px', flexShrink: 0 }}>
                        <PresetWireframe
                          presetId={variant.id}
                          category={(variant as any).category}
                          isAnnouncement={isAnnouncement}
                          isCategoryBar={isCategoryBar}
                          isUtilityBar={isUtilityBar}
                        />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#1e40af' : '#0f172a' }}>
                            {variant.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {variant.description}
                        </div>
                      </div>

                      {/* Action */}
                      <div style={{ flexShrink: 0 }}>
                        {isSelected ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                            <Check size={12} /> Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyVariant(variant);
                            }}
                            style={{
                              padding: '4px 10px', borderRadius: '4px', border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff', color: '#0f172a', fontSize: '11px', fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            2. ARRANGEMENT TAB (Dynamic Variant-Specific Arrangements)
           ══════════════════════════════════════════════════════ */}
        {currentTab === 'arrangement' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  HEADER ARRANGEMENT
                </h4>
                {(() => {
                  const currentVariantId = row.layout?.variantId || 'standard';
                  const activeVariant = HEADER_VARIANTS.find((v) => v.id === currentVariantId);
                  return (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '999px' }}>
                      {activeVariant?.name || 'Standard'}
                    </span>
                  );
                })()}
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#64748b' }}>
                Select how components are arranged for this header variant. The arrangement automatically controls item order.
              </p>

              {(() => {
                const currentVariantId = row.layout?.variantId || 'standard';
                const activeVariant = HEADER_VARIANTS.find((v) => v.id === currentVariantId);
                const compatibleIds = activeVariant?.compatibleArrangementIds || ['general'];
                const compatibleArrangements = HEADER_ARRANGEMENTS.filter((a) => compatibleIds.includes(a.id));
                const arrangementsToShow = compatibleArrangements.length > 0 ? compatibleArrangements : HEADER_ARRANGEMENTS.slice(0, 6);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {arrangementsToShow.map((arr) => {
                      const isArrActive = (row.layout?.arrangementId || arrangementsToShow[0]?.id) === arr.id;

                      return (
                        <div
                          key={arr.id}
                          onClick={() => handleSelectArrangement(arr)}
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: isArrActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isArrActive ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            transition: 'all 0.15s ease',
                            boxShadow: isArrActive ? '0 2px 8px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                          }}
                        >
                          {/* Visual Layout Diagram */}
                          <ArrangementWireframe arrId={arr.id} />

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: isArrActive ? 700 : 600, color: isArrActive ? '#1e40af' : '#0f172a' }}>
                                {arr.name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                {arr.description}
                              </div>
                            </div>
                            {isArrActive && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
                                <Check size={13} /> Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            3. LAYOUT TAB (Dedicated Layout Controls, Device Selectors, Compact Mode)
           ══════════════════════════════════════════════════════ */}
        {(currentTab === 'layout' || currentTab === 'responsive') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Compact Mode Toggle */}
            <div style={{
              padding: '12px 14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Compact Mode</span>
                  {row.layout?.isCompact && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '1px 6px', borderRadius: '4px' }}>
                      Active
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                  Reduces header height, padding, and component spacing for a streamlined high-density look across all variants and arrangements.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateHeaderRowAndStudio(row.id, {
                    layout: {
                      ...row.layout,
                      isCompact: !row.layout?.isCompact,
                    },
                  });
                }}
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '999px',
                  backgroundColor: row.layout?.isCompact ? '#2563eb' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s ease',
                  padding: '2px',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  transition: 'transform 0.2s ease',
                  transform: row.layout?.isCompact ? 'translateX(18px)' : 'translateX(0)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            {/* Container Width (Separated by line) */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <SectionWidthEditor
                value={row.layout?.container || 'full'}
                onChange={(val) => {
                  updateHeaderRowAndStudio(row.id, {
                    layout: { ...row.layout, container: val as any },
                  });
                }}
              />
            </div>

            {/* Header Height with Device Selector */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                  Header Height
                </span>
                <DeviceSelector value={heightDevice} onChange={setHeightDevice} compact />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={
                    heightDevice === 'mobile'
                      ? (row.layout?.mobileHeight ?? row.layout?.height ?? 56)
                      : heightDevice === 'tablet'
                      ? (row.layout?.tabletHeight ?? row.layout?.height ?? 64)
                      : (row.layout?.desktopHeight ?? row.layout?.height ?? 70)
                  }
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    const updates: any = {};
                    if (heightDevice === 'mobile') updates.mobileHeight = num;
                    else if (heightDevice === 'tablet') updates.tabletHeight = num;
                    else {
                      updates.desktopHeight = num;
                      updates.height = num;
                    }
                    updateHeaderRowAndStudio(row.id, {
                      layout: { ...row.layout, ...updates },
                    });
                  }}
                  style={{ flex: 1 }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: '6px',
                  backgroundColor: '#f8fafc',
                  width: '64px',
                  padding: '4px 6px',
                }}>
                  <input
                    type="number"
                    value={
                      heightDevice === 'mobile'
                        ? (row.layout?.mobileHeight ?? row.layout?.height ?? 56)
                        : heightDevice === 'tablet'
                        ? (row.layout?.tabletHeight ?? row.layout?.height ?? 64)
                        : (row.layout?.desktopHeight ?? row.layout?.height ?? 70)
                    }
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      const updates: any = {};
                      if (heightDevice === 'mobile') updates.mobileHeight = num;
                      else if (heightDevice === 'tablet') updates.tabletHeight = num;
                      else {
                        updates.desktopHeight = num;
                        updates.height = num;
                      }
                      updateHeaderRowAndStudio(row.id, {
                        layout: { ...row.layout, ...updates },
                      });
                    }}
                    style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: 600, outline: 'none' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>px</span>
                </div>
              </div>
            </div>

            {/* Padding with SpacingEditor (Matches User Screenshot) */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <SpacingEditor
                label="Padding"
                value={row.layout?.responsivePadding || {
                  desktop: { top: row.layout?.paddingY ?? 12, bottom: row.layout?.paddingY ?? 12, left: row.layout?.paddingX ?? 24, right: row.layout?.paddingX ?? 24 },
                  tablet: { top: 10, bottom: 10, left: 16, right: 16 },
                  mobile: { top: 8, bottom: 8, left: 12, right: 12 },
                }}
                onChange={(val) => {
                  updateHeaderRowAndStudio(row.id, {
                    layout: {
                      ...row.layout,
                      responsivePadding: val,
                      paddingX: val.desktop?.left ?? row.layout?.paddingX ?? 24,
                      paddingY: val.desktop?.top ?? row.layout?.paddingY ?? 12,
                    },
                  });
                }}
                showLeftRight={true}
              />
            </div>

            {/* Margin with SpacingEditor (Matches User Screenshot) */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <SpacingEditor
                label="Margin"
                value={row.layout?.responsiveMargin || {
                  desktop: { top: 0, bottom: 0 },
                  tablet: { top: 0, bottom: 0 },
                  mobile: { top: 0, bottom: 0 },
                }}
                onChange={(val) => {
                  updateHeaderRowAndStudio(row.id, {
                    layout: {
                      ...row.layout,
                      responsiveMargin: val,
                    },
                  });
                }}
                showLeftRight={false}
              />
            </div>

            {/* Component Gap with Device Selector */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                  Component Gap
                </span>
                <DeviceSelector value={gapDevice} onChange={setGapDevice} compact />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min="4"
                  max="64"
                  value={
                    gapDevice === 'mobile'
                      ? (row.layout?.mobileGap ?? 12)
                      : gapDevice === 'tablet'
                      ? (row.layout?.tabletGap ?? 16)
                      : (row.layout?.desktopGap ?? row.layout?.gap ?? 20)
                  }
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    const updates: any = {};
                    if (gapDevice === 'mobile') updates.mobileGap = num;
                    else if (gapDevice === 'tablet') updates.tabletGap = num;
                    else {
                      updates.desktopGap = num;
                      updates.gap = num;
                    }
                    updateHeaderRowAndStudio(row.id, {
                      layout: { ...row.layout, ...updates },
                    });
                  }}
                  style={{ flex: 1 }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: '6px',
                  backgroundColor: '#f8fafc',
                  width: '64px',
                  padding: '4px 6px',
                }}>
                  <input
                    type="number"
                    value={
                      gapDevice === 'mobile'
                        ? (row.layout?.mobileGap ?? 12)
                        : gapDevice === 'tablet'
                        ? (row.layout?.tabletGap ?? 16)
                        : (row.layout?.desktopGap ?? row.layout?.gap ?? 20)
                    }
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      const updates: any = {};
                      if (gapDevice === 'mobile') updates.mobileGap = num;
                      else if (gapDevice === 'tablet') updates.tabletGap = num;
                      else {
                        updates.desktopGap = num;
                        updates.gap = num;
                      }
                      updateHeaderRowAndStudio(row.id, {
                        layout: { ...row.layout, ...updates },
                      });
                    }}
                    style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: 600, outline: 'none' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>px</span>
                </div>
              </div>
            </div>

            {/* Alignment & Distribution */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)', marginBottom: '8px' }}>
                Content Alignment
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { id: 'space-between', label: 'Spread' },
                  { id: 'center', label: 'Center' },
                  { id: 'left', label: 'Left' },
                  { id: 'right', label: 'Right' },
                ].map((al) => {
                  const isSel = (row.layout?.alignment || 'space-between') === al.id;
                  return (
                    <button
                      key={al.id}
                      type="button"
                      onClick={() => {
                        updateHeaderRowAndStudio(row.id, {
                          layout: { ...row.layout, alignment: al.id as any },
                        });
                      }}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '6px',
                        border: isSel ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isSel ? '#eff6ff' : '#ffffff',
                        color: isSel ? '#2563eb' : '#475569',
                        fontSize: '12px',
                        fontWeight: isSel ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {al.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            3. CONTENT TAB (Header Components for Primary-Nav, Direct Field Editing for Announcement/Utility)
           ══════════════════════════════════════════════════════ */}
        {currentTab === 'content' && (
          isPrimaryNav ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    HEADER CONTENT
                  </h4>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>
                  {row.elements.length} Components
                </span>
              </div>

              <div style={{ padding: '0', background: 'transparent', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <DeviceSelector value={arrangementDevice} onChange={setArrangementDevice} compact />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                  {(['left', 'center', 'right', 'disabled'] as const).map((slot) => (
                    <div key={slot} onDragOver={(event) => { event.preventDefault(); setDragOverSlot(slot); }} onDragLeave={() => setDragOverSlot(null)} onDrop={() => { if (draggedComponent) { updateArrangementSlot(draggedComponent, slot); setDraggedComponent(null); } setDragOverSlot(null); }} style={{ minHeight: slot === 'disabled' ? '86px' : '78px', padding: '12px', border: slot === 'disabled' ? '1px dashed #94a3b8' : `1.5px solid ${dragOverSlot === slot ? '#2563eb' : '#cbd5e1'}`, borderRadius: '8px', background: dragOverSlot === slot ? '#dbeafe' : slot === 'disabled' ? '#f8fafc' : '#ffffff', boxShadow: dragOverSlot === slot ? '0 0 0 3px rgba(37,99,235,0.14)' : 'none', transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: dragOverSlot === slot ? '#1d4ed8' : '#475569', textTransform: 'uppercase', marginBottom: '8px' }}><span>{slot}</span>{dragOverSlot === slot && <span style={{ fontSize: '10px', textTransform: 'none', fontWeight: 700 }}>Release to place here</span>}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {currentResponsiveArrangement[arrangementDevice][slot].map((key, index) => (
                          <div key={`${key}-${index}`} draggable onDragStart={() => setDraggedComponent(key)} onDragEnd={() => { setDraggedComponent(null); setDragOverSlot(null); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 11px', background: slot === 'disabled' ? '#e2e8f0' : '#eff6ff', borderRadius: '6px', color: slot === 'disabled' ? '#64748b' : '#1d4ed8', fontSize: '12px', fontWeight: 700, cursor: 'grab' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><GripVertical size={15} /><Box size={15} />{key === 'menu' ? 'Menu' : key === 'navigation' ? 'Navigation' : key === 'actions' ? 'Actions' : key === 'search' ? 'Search' : key === 'cta' ? 'Call to Action' : key === 'logo' ? 'Logo & Brandname' : key}</span>
                            {slot !== 'disabled' && <span style={{ display: 'flex', gap: '1px' }}>
                              <button type="button" onClick={() => moveArrangementComponent(key, -1)} aria-label={`Move ${key} up`} style={{ border: 0, background: 'transparent', color: '#1d4ed8', cursor: 'pointer', padding: '0 2px' }}>↑</button>
                              <button type="button" onClick={() => moveArrangementComponent(key, 1)} aria-label={`Move ${key} down`} style={{ border: 0, background: 'transparent', color: '#1d4ed8', cursor: 'pointer', padding: '0 2px' }}>↓</button>
                            </span>}
                          </div>
                        ))}
                        {currentResponsiveArrangement[arrangementDevice][slot].length === 0 && <span style={{ color: '#94a3b8', fontSize: '10px' }}>{slot === 'disabled' ? 'Release to disable' : 'Empty container — space-between used for active containers'}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isAnnouncement ? (
            /* Direct Variant Content Editing for Announcement Bar — No child items */
            (() => {
              const primaryEl = row.elements[0];
              const elProps = primaryEl?.props || {};
              const variantId = row.layout?.variantId || elProps.variant || elProps.stylePreset || 'single';
              const isMarquee = variantId === 'marquee';
              const isCarousel = variantId === 'carousel';
              const isCountdown = variantId === 'countdown' || Boolean(elProps.showCountdown);

              const rawList = elProps.announcements || elProps.slides || (
                elProps.text
                  ? [{ text: elProps.text, link: elProps.ctaLink || elProps.link, badge: elProps.badge }]
                  : [
                      { text: '✨ Summer Festive Sale: Up to 40% OFF with code BILLION40', link: '/collections/sale', badge: 'SALE' },
                      { text: '🚚 Free Express Shipping across all orders over $99', link: '/shipping', badge: 'FREE' },
                    ]
              );
              const announcements = Array.isArray(rawList) ? rawList : [{ text: String(rawList) }];

              const updateProps = (updates: Record<string, any>) => {
                if (primaryEl) {
                  updateHeaderElementAndStudio(row.id, primaryEl.id, {
                    props: { ...primaryEl.props, ...updates },
                  });
                }
              };

              const handleItemChange = (idx: number, field: string, val: string) => {
                const next = [...announcements];
                next[idx] = { ...next[idx], [field]: val };
                updateProps({
                  announcements: next,
                  text: next[0]?.text || '',
                });
              };

              const handleAddItem = () => {
                const next = [...announcements, { text: 'New special notice', link: '/shop', badge: 'NEW' }];
                updateProps({ announcements: next });
              };

              const handleRemoveItem = (idx: number) => {
                if (announcements.length <= 1) return;
                const next = announcements.filter((_, i) => i !== idx);
                updateProps({ announcements: next, text: next[0]?.text || '' });
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        ANNOUNCEMENT CONTENT
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Edit messages, badges, links & ticker settings for this variant
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                      {variantId}
                    </span>
                  </div>

                  {/* Message Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      {isMarquee || isCarousel ? 'Promotional Messages' : 'Primary Message'}
                    </div>

                    {announcements.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                            Notice {idx + 1}
                          </span>
                          {announcements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                              title="Remove notice"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Message Text</label>
                          <input
                            type="text"
                            value={item.text || ''}
                            onChange={(e) => handleItemChange(idx, 'text', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '7px 10px',
                              fontSize: '12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              boxSizing: 'border-box',
                            }}
                            placeholder="Announcement message..."
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Badge (optional)</label>
                            <input
                              type="text"
                              value={item.badge || ''}
                              onChange={(e) => handleItemChange(idx, 'badge', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                fontSize: '12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                boxSizing: 'border-box',
                              }}
                              placeholder="e.g. SALE"
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Link URL</label>
                            <input
                              type="text"
                              value={item.link || ''}
                              onChange={(e) => handleItemChange(idx, 'link', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                fontSize: '12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                boxSizing: 'border-box',
                              }}
                              placeholder="/shop"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {(isMarquee || isCarousel) && (
                      <button
                        type="button"
                        onClick={handleAddItem}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: '#ffffff',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          color: '#2563eb',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Plus size={14} /> Add Another Notice
                      </button>
                    )}
                  </div>

                  {/* Marquee Speed */}
                  {isMarquee && (
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Marquee Speed</label>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>{elProps.speed || 25}s</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        value={elProps.speed || 25}
                        onChange={(e) => updateProps({ speed: parseInt(e.target.value, 10) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  {/* Countdown Target Date */}
                  {isCountdown && (
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Countdown Target Date</label>
                      <input
                        type="datetime-local"
                        value={(elProps.countdownTarget || '2026-12-31T23:59').slice(0, 16)}
                        onChange={(e) => updateProps({ countdownTarget: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          fontSize: '12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}

                  {/* Call to Action Button */}
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Call to Action (CTA)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>CTA Text</label>
                        <input
                          type="text"
                          value={elProps.ctaText || ''}
                          onChange={(e) => updateProps({ ctaText: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            fontSize: '12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            boxSizing: 'border-box',
                          }}
                          placeholder="Shop Now"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>CTA Link</label>
                        <input
                          type="text"
                          value={elProps.ctaLink || ''}
                          onChange={(e) => updateProps({ ctaLink: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            fontSize: '12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            boxSizing: 'border-box',
                          }}
                          placeholder="/shop"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : isCategoryBar ? (
            /* Direct Variant Content Editing for Category Bar */
            (() => {
              const primaryEl = row.elements[0];
              const elProps = primaryEl?.props || {};
              const rawCategories = elProps.categories || [
                { label: 'All Products', icon: 'grid', link: '/shop' },
                { label: 'New In', icon: 'sparkles', link: '/shop?filter=new', badge: 'NEW' },
                { label: 'Best Sellers', icon: 'flame', link: '/shop?filter=bestsellers', badge: 'HOT' },
                { label: 'Apparel', icon: 'shirt', link: '/shop?cat=apparel' },
                { label: 'Footwear', icon: 'package', link: '/shop?cat=shoes' },
                { label: 'Sale %', icon: 'tag', link: '/shop?cat=sale', badge: 'SALE' },
              ];

              const updateProps = (updates: Record<string, any>) => {
                if (primaryEl) {
                  updateHeaderElementAndStudio(row.id, primaryEl.id, {
                    props: { ...primaryEl.props, ...updates },
                  });
                }
              };

              const handleCategoryChange = (idx: number, field: string, val: string) => {
                const next = [...rawCategories];
                next[idx] = { ...next[idx], [field]: val };
                updateProps({ categories: next });
              };

              const handleAddCategory = () => {
                const next = [
                  ...rawCategories,
                  { label: 'New Category', link: '/collections', badge: '' },
                ];
                updateProps({ categories: next });
              };

              const handleRemoveCategory = (idx: number) => {
                if (rawCategories.length <= 1) return;
                const next = rawCategories.filter((_: any, i: number) => i !== idx);
                updateProps({ categories: next });
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        CATEGORY BAR ITEMS
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Manage storefront quick navigation categories, links, and promo badges
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={13} /> Add Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {rawCategories.map((cat: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                            Item {idx + 1}
                          </span>
                          {rawCategories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(idx)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                              title="Delete category"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Label</label>
                            <input
                              type="text"
                              value={cat.label || ''}
                              onChange={(e) => handleCategoryChange(idx, 'label', e.target.value)}
                              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Badge (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. HOT, NEW, SALE"
                              value={cat.badge || ''}
                              onChange={(e) => handleCategoryChange(idx, 'badge', e.target.value)}
                              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Destination Link</label>
                          <input
                            type="text"
                            value={cat.link || cat.href || ''}
                            onChange={(e) => handleCategoryChange(idx, 'link', e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            /* Direct Variant Content Editing for Utility Bar */
            (() => {
              const primaryEl = row.elements[0];
              const elProps = primaryEl?.props || {};

              const updateProps = (updates: Record<string, any>) => {
                if (primaryEl) {
                  updateHeaderElementAndStudio(row.id, primaryEl.id, {
                    props: { ...primaryEl.props, ...updates },
                  });
                }
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      UTILITY BAR CONTENT
                    </h4>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Manage customer support contact details, secondary alerts & currencies
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Support Phone Number
                      </label>
                      <input
                        type="text"
                        value={elProps.phone || ''}
                        onChange={(e) => updateProps({ phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '13px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                        }}
                        placeholder="+1 (800) 555-0199"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Support Email Address
                      </label>
                      <input
                        type="email"
                        value={elProps.email || ''}
                        onChange={(e) => updateProps({ email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '13px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                        }}
                        placeholder="support@store.com"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Secondary Notice / Message
                      </label>
                      <input
                        type="text"
                        value={elProps.announcement || elProps.secondaryNotice || ''}
                        onChange={(e) => updateProps({ announcement: e.target.value, secondaryNotice: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '13px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                        }}
                        placeholder="VIP Member Club Active"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Currency / Store Locale
                      </label>
                      <select
                        value={elProps.currency || 'USD ($)'}
                        onChange={(e) => updateProps({ currency: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '13px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                        <option value="INR (₹)">INR (₹)</option>
                        <option value="CAD ($)">CAD ($)</option>
                        <option value="AUD ($)">AUD ($)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })()
          )
        )}

        {/* ══════════════════════════════════════════════════════
            4. DESIGN TAB (Surface, Typography, Shape, Effects - No Box Outlines)
           ══════════════════════════════════════════════════════ */}
        {currentTab === 'design' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. SURFACE (Colors & Background) */}
            <div>
              <div
                onClick={() => toggleSection('surface')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Surface & Colors
                </span>
                {openSections.surface ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>

              {openSections.surface && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
                  <ThemeOverrideControl
                    label="Background Fill"
                    value={currentBgOverride}
                    onChange={handleBgOverrideChange}
                    isBackground={true}
                    fieldKey="bgColor"
                    sectionType={row.type}
                  />

                  <ThemeOverrideControl
                    label="Text & Foreground Color"
                    value={currentTextOverride}
                    onChange={handleTextOverrideChange}
                    isBackground={false}
                    fieldKey="textColor"
                    sectionType={row.type}
                  />

                  <ThemeOverrideControl
                    label="Bottom Border Color"
                    value={currentBorderOverride}
                    onChange={handleBorderOverrideChange}
                    isBackground={false}
                    fieldKey="borderColor"
                    sectionType={row.type}
                  />
                </div>
              )}
            </div>

            {/* 2. TYPOGRAPHY (Divided by line) */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <div
                onClick={() => toggleSection('typography')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Typography
                </span>
                {openSections.typography ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>

              {openSections.typography && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: '#475569' }}>Navigation Font Size</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.styling?.fontSize || 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="11"
                      max="20"
                      value={row.styling?.fontSize || 14}
                      onChange={(e) => {
                        updateHeaderRowAndStudio(row.id, {
                          styling: { ...row.styling, fontSize: Number(e.target.value) },
                        });
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                      Font Weight
                    </span>
                    <select
                      value={row.styling?.fontWeight || 500}
                      onChange={(e) => {
                        updateHeaderRowAndStudio(row.id, {
                          styling: { ...row.styling, fontWeight: Number(e.target.value) },
                        });
                      }}
                      style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value={400}>Regular (400)</option>
                      <option value={500}>Medium (500)</option>
                      <option value={600}>Semi-Bold (600)</option>
                      <option value={700}>Bold (700)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 3. SHAPE & BORDERS (Divided by line) */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <div
                onClick={() => toggleSection('shape')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Shape & Borders
                </span>
                {openSections.shape ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>

              {openSections.shape && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#334155' }}>Divider Border Bottom</span>
                    <input
                      type="checkbox"
                      checked={row.styling?.borderBottom !== false}
                      onChange={(e) => {
                        updateHeaderRowAndStudio(row.id, {
                          styling: { ...row.styling, borderBottom: e.target.checked },
                        });
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: '#475569' }}>Corner Radius</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.styling?.radius || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={row.styling?.radius || 0}
                      onChange={(e) => {
                        updateHeaderRowAndStudio(row.id, {
                          styling: { ...row.styling, radius: Number(e.target.value) },
                        });
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. EFFECTS (Divided by line) */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <div
                onClick={() => toggleSection('effects')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Effects & Elevation
                </span>
                {openSections.effects ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>

              {openSections.effects && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Glassmorphism Blur</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Frosted glass backdrop effect</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(row.styling?.bgGlass)}
                      onChange={(e) => {
                        updateHeaderRowAndStudio(row.id, {
                          styling: { ...row.styling, bgGlass: e.target.checked },
                        });
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                      Elevation Shadow
                    </span>
                    <select
                      value={row.styling?.shadow || 'none'}
                      onChange={(e) => {
                        updateHeaderRowAndStudio(row.id, {
                          styling: { ...row.styling, shadow: e.target.value as any },
                        });
                      }}
                      style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="none">None</option>
                      <option value="soft">Soft Subtle</option>
                      <option value="medium">Medium Standard</option>
                      <option value="strong">Elevated Floating</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            5. BEHAVIOR TAB (Sticky, Scroll Dynamics, Interactions - No Box Outlines)
           ══════════════════════════════════════════════════════ */}
        {currentTab === 'behavior' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. VISIBILITY */}
            <div>
              <div
                onClick={() => toggleBehaviorSection('visibility')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Device Visibility
                </span>
                {openBehaviorSections.visibility ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>

              {openBehaviorSections.visibility && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ flex: 1, padding: '6px', textAlign: 'center', background: '#f0fdf4', color: '#16a34a', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                      Desktop ✓
                    </span>
                    <span style={{ flex: 1, padding: '6px', textAlign: 'center', background: '#f0fdf4', color: '#16a34a', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                      Tablet ✓
                    </span>
                    <span style={{ flex: 1, padding: '6px', textAlign: 'center', background: '#f0fdf4', color: '#16a34a', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                      Mobile ✓
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                    The global storefront header is responsive and renders across all standard device viewports.
                  </span>
                </div>
              )}
            </div>

            {/* 2. POSITION & STICKY HEADER (Divided by line) */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <div
                onClick={() => toggleBehaviorSection('sticky')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Sticky Position Mode
                </span>
                {openBehaviorSections.sticky ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>

              {openBehaviorSections.sticky && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                  {[
                    { id: 'sticky', label: 'Sticky Header (Pinned)', desc: 'Stays pinned at top of viewport when scrolling' },
                    { id: 'smart', label: 'Smart Hide & Reveal', desc: 'Hides when scrolling down, reappears when scrolling up' },
                    { id: 'static', label: 'Static (Scrolls With Page)', desc: 'Standard flow, header scrolls away with page' },
                  ].map((mode) => {
                    const isCurrent = mode.id === 'sticky'
                      ? (row.styling?.sticky !== false)
                      : mode.id === 'smart'
                      ? false
                      : (row.styling?.sticky === false);

                    return (
                      <div
                        key={mode.id}
                        onClick={() => {
                          updateHeaderRowAndStudio(row.id, {
                            styling: {
                              ...row.styling,
                              sticky: mode.id !== 'static',
                            },
                          });
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isCurrent ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: isCurrent ? '#1e40af' : '#0f172a' }}>
                            {mode.label}
                          </span>
                          {isCurrent && <Check size={14} color="#2563eb" />}
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748b' }}>
                          {mode.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. SCROLL DYNAMICS & HERO OVERLAY (Divided by line) */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <div
                onClick={() => toggleBehaviorSection('scroll')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Scroll Dynamics & Hero
                </span>
                {openBehaviorSections.scroll ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>

              {openBehaviorSections.scroll && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Transparent Over Hero</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Header overlays hero banner at top</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean((row.styling as any)?.overlayHero)}
                      onChange={(e) => {
                        updateHeaderRowAndStudio(row.id, {
                          styling: { ...row.styling, overlayHero: e.target.checked } as any,
                        });
                      }}

                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Compact Shrink on Scroll</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Reduces height when page scrolls</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={row.layout?.height ? row.layout.height > 60 : true}
                      onChange={(e) => {
                        updateHeaderRowAndStudio(row.id, {
                          styling: { ...row.styling, shrinkOnScroll: e.target.checked } as any,
                        });
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Interaction & Mobile
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '12px', color: '#475569' }}>
                  Navigation trigger
                  <select value={headerSettings.navInteraction || 'hover'} onChange={(event) => updateHeaderSettings({ navInteraction: event.target.value as any })} style={{ display: 'block', width: '100%', marginTop: '4px', padding: '7px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', background: '#ffffff' }}>
                    <option value="hover">Open on hover</option>
                    <option value="click">Open on click</option>
                    <option value="hybrid">Hover + click</option>
                  </select>
                </label>
                <label style={{ fontSize: '12px', color: '#475569' }}>
                  Mobile menu presentation
                  <select value={headerSettings.mobileMenuType || 'drawer'} onChange={(event) => updateHeaderSettings({ mobileMenuType: event.target.value as any })} style={{ display: 'block', width: '100%', marginTop: '4px', padding: '7px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', background: '#ffffff' }}>
                    <option value="drawer">Slide-out drawer</option>
                    <option value="full-screen">Full-screen menu</option>
                    <option value="dropdown">Compact dropdown</option>
                  </select>
                </label>
                <label style={{ fontSize: '12px', color: '#475569' }}>
                  Search behavior
                  <select value={headerSettings.searchMode || 'dropdown'} onChange={(event) => updateHeaderSettings({ searchMode: event.target.value as any })} style={{ display: 'block', width: '100%', marginTop: '4px', padding: '7px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', background: '#ffffff' }}>
                    <option value="inline">Inline search</option>
                    <option value="dropdown">Dropdown search</option>
                    <option value="modal">Full-screen search</option>
                  </select>
                </label>
              </div>
            </div>

            {/* 4. ACCESSIBILITY (Divided by line) */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <div
                onClick={() => toggleBehaviorSection('accessibility')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Accessibility
                </span>
                {openBehaviorSections.accessibility ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>

              {openBehaviorSections.accessibility && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Header Role Landmark</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Includes ARIA banner role</div>
                    </div>
                    <input type="checkbox" defaultChecked={true} style={{ width: '18px', height: '18px' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Skip to Content Link</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Keyboard accessible shortcut</div>
                    </div>
                    <input type="checkbox" defaultChecked={true} style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
              )}
            </div>

            {/* 5. ADVANCED (Divided by line) */}
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '16px' }}>
              <div
                onClick={() => toggleBehaviorSection('advanced')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Advanced Settings
                </span>
                {openBehaviorSections.advanced ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>

              {openBehaviorSections.advanced && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Custom CSS Class</label>
                    <input
                      type="text"
                      placeholder="e.g. global-header-custom"
                      value={row.styling?.customClass || ''}
                      onChange={(e) => {
                        updateHeaderRowAndStudio(row.id, { styling: { ...row.styling, customClass: e.target.value } });
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Z-Index Layering</label>
                    <select
                      value={(row.styling as any)?.zIndex || 50}
                      onChange={(e) => {
                        updateHeaderRowAndStudio(row.id, { styling: { ...row.styling, zIndex: Number(e.target.value) } as any });
                      }}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value={100}>Top Priority (100)</option>
                      <option value={50}>Standard Header (50)</option>
                      <option value={10}>Natural Document Flow (10)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'advanced' && isPrimaryNav && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>ADVANCED HEADER SETTINGS</h4>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Validation, page conditions, accessibility, and custom attributes.</span>
            </div>
            <div style={{ padding: '12px', border: '1px solid #fde68a', borderRadius: '8px', background: '#fffbeb' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>Validation</div>
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#78350f' }}>
                {row.elements.some((element) => element.type === 'logo') ? 'Logo configured' : 'Add a logo component'} · {row.elements.some((element) => element.type === 'navigation' || element.type === 'navigation-menu') ? 'Navigation configured' : 'Add navigation'}
              </div>
            </div>
            <label style={{ fontSize: '12px', color: '#475569' }}>
              Custom data attribute
              <input value={(row.styling as any)?.customAttribute || ''} onChange={(event) => updateHeaderRowAndStudio(row.id, { styling: { ...row.styling, customAttribute: event.target.value } as any })} placeholder="data-header-version" style={{ display: 'block', width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
              Enable keyboard skip navigation
              <input type="checkbox" checked={(row.styling as any)?.skipNavigation !== false} onChange={(event) => updateHeaderRowAndStudio(row.id, { styling: { ...row.styling, skipNavigation: event.target.checked } as any })} />
            </label>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          MODAL: ADD HEADER COMPONENT (Categorized Quick Add)
         ══════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 200,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: '340px',
              width: '100%',
              maxHeight: '85%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                ADD HEADER COMPONENT
              </h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              value={componentSearch}
              onChange={(e) => setComponentSearch(e.target.value)}
              placeholder="Search components..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                marginBottom: '12px',
              }}
            />

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {componentCatalog.map((cat) => {
                const filteredItems = cat.items.filter((item) =>
                  componentSearch === '' ||
                  item.label.toLowerCase().includes(componentSearch.toLowerCase()) ||
                  item.desc.toLowerCase().includes(componentSearch.toLowerCase())
                );
                if (filteredItems.length === 0) return null;

                return (
                  <div key={cat.category}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {cat.category}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isAlreadyAdded = isComponentAdded(item.type);
                        return (
                          <div
                            key={item.type}
                            onClick={() => {
                              if (!isAlreadyAdded) {
                                handleAddComponentFromCatalog(item.type, item.label);
                              }
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: isAlreadyAdded ? '1px solid #e2e8f0' : '1px solid #e2e8f0',
                              backgroundColor: isAlreadyAdded ? '#f8fafc' : '#ffffff',
                              cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                              opacity: isAlreadyAdded ? 0.65 : 1,
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isAlreadyAdded) {
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                e.currentTarget.style.borderColor = '#93c5fd';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isAlreadyAdded) {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                              <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                backgroundColor: isAlreadyAdded ? '#f1f5f9' : '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <Icon size={15} color={isAlreadyAdded ? '#94a3b8' : '#2563eb'} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: isAlreadyAdded ? '#64748b' : '#0f172a' }}>{item.label}</div>
                                <div style={{ fontSize: '11px', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.desc}</div>
                              </div>
                            </div>

                            {isAlreadyAdded ? (
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#16a34a',
                                backgroundColor: '#dcfce7',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                flexShrink: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}>
                                ✓ Added
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#2563eb',
                                backgroundColor: '#eff6ff',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                flexShrink: 0,
                              }}>
                                + Add
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {row.isVisible === false && (
        <div style={{ margin: '16px', padding: '12px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ffeeba' }}>
          <EyeOff size={16} style={{ flexShrink: 0 }} />
          <span>This section is currently hidden.</span>
        </div>
      )}
    </div>
  );
};


