import React from 'react';
import { Monitor, Tablet, Smartphone, Eye, EyeOff } from 'lucide-react';
import { CollapsibleGroup } from './CollapsibleGroup';

interface DeviceVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

interface VisibilityValue {
  enabled?: boolean;
  devices?: DeviceVisibility;
  showFrom?: string;
  hideAfter?: string;
  audience?: string;
}

interface VisibilityEditorProps {
  value: VisibilityValue;
  onChange: (value: VisibilityValue) => void;
}

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; size?: 'sm' | 'md' }> = ({
  value,
  onChange,
  size = 'md',
}) => {
  const w = size === 'sm' ? 36 : 44;
  const h = size === 'sm' ? 20 : 24;
  const dot = size === 'sm' ? 14 : 18;
  const pad = size === 'sm' ? 3 : 3;
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: `${h / 2}px`,
        backgroundColor: value ? 'var(--primary)' : '#e2e8f0',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s',
        padding: 0,
        flexShrink: 0,
      }}
    >
      <div style={{
        width: `${dot}px`,
        height: `${dot}px`,
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'absolute',
        top: `${pad}px`,
        left: value ? `${w - dot - pad}px` : `${pad}px`,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
};

// Device presets
const devicePresets = [
  { id: 'all', label: 'Show on all devices', devices: { desktop: true, tablet: true, mobile: true } },
  { id: 'desktop-only', label: 'Desktop only', devices: { desktop: true, tablet: false, mobile: false } },
  { id: 'tablet-only', label: 'Tablet only', devices: { desktop: false, tablet: true, mobile: false } },
  { id: 'mobile-only', label: 'Mobile only', devices: { desktop: false, tablet: false, mobile: true } },
  { id: 'custom', label: 'Custom', devices: null },
];

function getPresetId(devices: DeviceVisibility): string {
  const { desktop, tablet, mobile } = devices;
  if (desktop && tablet && mobile) return 'all';
  if (desktop && !tablet && !mobile) return 'desktop-only';
  if (!desktop && tablet && !mobile) return 'tablet-only';
  if (!desktop && !tablet && mobile) return 'mobile-only';
  return 'custom';
}

export const VisibilityEditor: React.FC<VisibilityEditorProps> = ({
  value = {},
  onChange,
}) => {
  const devices: DeviceVisibility = value.devices || { desktop: true, tablet: true, mobile: true };
  const isEnabled = value.enabled !== false;
  const currentPreset = getPresetId(devices);

  const handleDeviceToggle = (device: keyof DeviceVisibility) => {
    onChange({
      ...value,
      devices: {
        ...devices,
        [device]: !devices[device],
      },
    });
  };

  const handlePresetChange = (presetId: string) => {
    const preset = devicePresets.find(p => p.id === presetId);
    if (preset?.devices) {
      onChange({
        ...value,
        devices: { ...preset.devices },
      });
    }
  };

  const deviceItems: { key: keyof DeviceVisibility; label: string; icon: React.FC<any> }[] = [
    { key: 'desktop', label: 'Desktop', icon: Monitor },
    { key: 'tablet', label: 'Tablet', icon: Tablet },
    { key: 'mobile', label: 'Mobile', icon: Smartphone },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Section Enable/Disable */}
      <CollapsibleGroup label="Section Visibility">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          backgroundColor: isEnabled ? 'rgba(25, 135, 84, 0.04)' : '#fef2f2',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEnabled ? <Eye size={16} color="var(--primary)" /> : <EyeOff size={16} color="#ef4444" />}
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                {isEnabled ? 'Section Enabled' : 'Section Hidden'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {isEnabled ? 'Visible on your website' : 'Hidden from visitors'}
              </span>
            </div>
          </div>
          <Toggle
            value={isEnabled}
            onChange={(v) => onChange({ ...value, enabled: v })}
          />
        </div>
      </CollapsibleGroup>

      {/* Device Visibility */}
      <CollapsibleGroup label="Device Visibility">
        {/* Device preset selector */}
        <select
          value={currentPreset}
          onChange={(e) => handlePresetChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'inherit',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            outline: 'none',
            fontWeight: 500,
          }}
        >
          {devicePresets.map((preset) => (
            <option key={preset.id} value={preset.id}>{preset.label}</option>
          ))}
        </select>

        {/* Individual device toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {deviceItems.map((item) => {
            const Icon = item.icon;
            const isOn = devices[item.key];
            return (
              <div key={item.key} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${isOn ? 'var(--border-color)' : '#fecaca'}`,
                backgroundColor: isOn ? '#f8fafc' : '#fef2f2',
                transition: 'all 0.15s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={isOn ? 'var(--primary)' : '#ef4444'} />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-main)',
                  }}>
                    {item.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isOn ? 'var(--primary)' : '#ef4444',
                  }}>
                    {isOn ? 'Visible' : 'Hidden'}
                  </span>
                  <Toggle value={isOn} onChange={() => handleDeviceToggle(item.key)} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleGroup>

      {/* Schedule */}
      <CollapsibleGroup label="Schedule" defaultCollapsed>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          Set when this section is visible. Leave blank to show always.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Show from</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
            }}>
              <input
                type="datetime-local"
                value={value.showFrom || ''}
                onChange={(e) => onChange({ ...value, showFrom: e.target.value })}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  backgroundColor: 'transparent',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Hide after</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
            }}>
              <input
                type="datetime-local"
                value={value.hideAfter || ''}
                onChange={(e) => onChange({ ...value, hideAfter: e.target.value })}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  backgroundColor: 'transparent',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        </div>
      </CollapsibleGroup>

      {/* Audience */}
      <CollapsibleGroup label="Audience" defaultCollapsed>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Show to</span>
          <select
            value={value.audience || 'everyone'}
            onChange={(e) => onChange({ ...value, audience: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'inherit',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="everyone">Everyone</option>
            <option value="logged-in">Logged in users</option>
            <option value="guests">Guests (not logged in)</option>
          </select>
        </div>
      </CollapsibleGroup>
    </div>
  );
};
