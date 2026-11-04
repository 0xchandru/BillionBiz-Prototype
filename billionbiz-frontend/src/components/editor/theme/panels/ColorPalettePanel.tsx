import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSiteStore } from '../../../../store/siteStore';
import type { ThemeColorPalette } from '../themePresets';
import { ColorPickerPopover } from '../../ui/ColorPickerPopover';

interface ColorItemProps {
  label: string;
  tokenKey: string;
  value: string;
  onChange: (newValue: string) => void;
  description?: string;
}

const ColorItem: React.FC<ColorItemProps> = ({ label, value, onChange, description }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ColorPickerPopover
          value={value}
          onChange={onChange}
          size="md"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{label}</span>
          {description && (
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{description}</span>
          )}
        </div>
      </div>

      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        style={{
          width: '78px',
          padding: '5px 7px',
          fontSize: '12px',
          fontFamily: 'monospace',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          color: '#334155',
          backgroundColor: '#ffffff',
          textAlign: 'center',
        }}
      />
    </div>
  );
};

export const ColorPalettePanel: React.FC = () => {
  const { theme, updateTheme } = useSiteStore();
  const palette = theme.palette;

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    brand: false,
    background: false,
    text: false,
    border: false,
    states: true,
  });

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePaletteSection = <K extends keyof ThemeColorPalette>(
    section: K,
    key: keyof ThemeColorPalette[K],
    val: string
  ) => {
    const updated = {
      ...palette,
      [section]: {
        ...palette[section],
        [key]: val,
      },
    };
    updateTheme({ palette: updated });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
        Customize global color tokens. Inherited section properties will immediately update. Overridden sections are not affected.
      </p>

      {/* 1. BRAND */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <div
          onClick={() => toggleGroup('brand')}
          style={{
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Brand</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Core brand accents</span>
          </div>
          {collapsedGroups.brand ? <ChevronRight size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
        {!collapsedGroups.brand && (
          <div style={{ padding: '4px 14px 8px', backgroundColor: '#ffffff' }}>
            <ColorItem
              label="Primary"
              tokenKey="brand.primary"
              value={palette.brand.primary}
              onChange={(v) => updatePaletteSection('brand', 'primary', v)}
              description="Primary action buttons, active highlights"
            />
            <ColorItem
              label="Secondary"
              tokenKey="brand.secondary"
              value={palette.brand.secondary}
              onChange={(v) => updatePaletteSection('brand', 'secondary', v)}
              description="Secondary badges, auxiliary buttons"
            />
            <ColorItem
              label="Accent"
              tokenKey="brand.accent"
              value={palette.brand.accent}
              onChange={(v) => updatePaletteSection('brand', 'accent', v)}
              description="Callout highlights, badges, tags"
            />
            <ColorItem
              label="Link"
              tokenKey="brand.link"
              value={palette.brand.link}
              onChange={(v) => updatePaletteSection('brand', 'link', v)}
              description="Hyperlinks and clickable text"
            />
          </div>
        )}
      </div>

      {/* 2. BACKGROUND */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <div
          onClick={() => toggleGroup('background')}
          style={{
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Background</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Surfaces & containers</span>
          </div>
          {collapsedGroups.background ? <ChevronRight size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
        {!collapsedGroups.background && (
          <div style={{ padding: '4px 14px 8px', backgroundColor: '#ffffff' }}>
            <ColorItem
              label="Background"
              tokenKey="background.background"
              value={palette.background.background}
              onChange={(v) => updatePaletteSection('background', 'background', v)}
              description="Base website canvas color"
            />
            <ColorItem
              label="Surface"
              tokenKey="background.surface"
              value={palette.background.surface}
              onChange={(v) => updatePaletteSection('background', 'surface', v)}
              description="Cards, panels, dropdown popovers"
            />
            <ColorItem
              label="Section Background"
              tokenKey="background.sectionBg"
              value={palette.background.sectionBg}
              onChange={(v) => updatePaletteSection('background', 'sectionBg', v)}
              description="Default background for page sections"
            />
            <ColorItem
              label="Container Background"
              tokenKey="background.containerBg"
              value={palette.background.containerBg}
              onChange={(v) => updatePaletteSection('background', 'containerBg', v)}
              description="Inner card & content wrappers"
            />
            <ColorItem
              label="Footer Background"
              tokenKey="background.footerBg"
              value={palette.background.footerBg || '#0f172a'}
              onChange={(v) => updatePaletteSection('background', 'footerBg', v)}
              description="Default background for site footer"
            />
          </div>
        )}
      </div>

      {/* 3. TEXT */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <div
          onClick={() => toggleGroup('text')}
          style={{
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Text</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Headings & paragraphs</span>
          </div>
          {collapsedGroups.text ? <ChevronRight size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
        {!collapsedGroups.text && (
          <div style={{ padding: '4px 14px 8px', backgroundColor: '#ffffff' }}>
            <ColorItem
              label="Heading"
              tokenKey="text.heading"
              value={palette.text.heading}
              onChange={(v) => updatePaletteSection('text', 'heading', v)}
              description="Titles, hero headers, section titles"
            />
            <ColorItem
              label="Subheading"
              tokenKey="text.subheading"
              value={palette.text.subheading}
              onChange={(v) => updatePaletteSection('text', 'subheading', v)}
              description="Subtitle text and group labels"
            />
            <ColorItem
              label="Body"
              tokenKey="text.body"
              value={palette.text.body}
              onChange={(v) => updatePaletteSection('text', 'body', v)}
              description="Standard copy and paragraphs"
            />
            <ColorItem
              label="Muted"
              tokenKey="text.muted"
              value={palette.text.muted}
              onChange={(v) => updatePaletteSection('text', 'muted', v)}
              description="Captions, timestamps, placeholders"
            />
            <ColorItem
              label="Inverse"
              tokenKey="text.inverse"
              value={palette.text.inverse}
              onChange={(v) => updatePaletteSection('text', 'inverse', v)}
              description="Text on dark/contrasting backgrounds"
            />
            <ColorItem
              label="Footer Text"
              tokenKey="text.footerText"
              value={palette.text.footerText || '#ffffff'}
              onChange={(v) => updatePaletteSection('text', 'footerText', v)}
              description="Text and links inside site footer"
            />
          </div>
        )}
      </div>

      {/* 4. BORDER */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <div
          onClick={() => toggleGroup('border')}
          style={{
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Border</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Outlines & lines</span>
          </div>
          {collapsedGroups.border ? <ChevronRight size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
        {!collapsedGroups.border && (
          <div style={{ padding: '4px 14px 8px', backgroundColor: '#ffffff' }}>
            <ColorItem
              label="Border"
              tokenKey="border.border"
              value={palette.border.border}
              onChange={(v) => updatePaletteSection('border', 'border', v)}
              description="Card borders, inputs, buttons"
            />
            <ColorItem
              label="Divider"
              tokenKey="border.divider"
              value={palette.border.divider}
              onChange={(v) => updatePaletteSection('border', 'divider', v)}
              description="Horizontal rules and separators"
            />
          </div>
        )}
      </div>

      {/* 5. STATES */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <div
          onClick={() => toggleGroup('states')}
          style={{
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>States</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Feedback & status</span>
          </div>
          {collapsedGroups.states ? <ChevronRight size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
        {!collapsedGroups.states && (
          <div style={{ padding: '4px 14px 8px', backgroundColor: '#ffffff' }}>
            <ColorItem
              label="Success"
              tokenKey="states.success"
              value={palette.states.success}
              onChange={(v) => updatePaletteSection('states', 'success', v)}
              description="Confirmation, positive badges, stock"
            />
            <ColorItem
              label="Warning"
              tokenKey="states.warning"
              value={palette.states.warning}
              onChange={(v) => updatePaletteSection('states', 'warning', v)}
              description="Alerts, pending state"
            />
            <ColorItem
              label="Error"
              tokenKey="states.error"
              value={palette.states.error}
              onChange={(v) => updatePaletteSection('states', 'error', v)}
              description="Errors, destructive buttons, validation"
            />
            <ColorItem
              label="Info"
              tokenKey="states.info"
              value={palette.states.info}
              onChange={(v) => updatePaletteSection('states', 'info', v)}
              description="Informational tips and badges"
            />
          </div>
        )}
      </div>
    </div>
  );
};
