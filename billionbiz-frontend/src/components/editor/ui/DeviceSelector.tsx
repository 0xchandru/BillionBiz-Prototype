import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceSelectorProps {
  value: DeviceType;
  onChange: (device: DeviceType) => void;
  compact?: boolean;
}

const devices: { id: DeviceType; icon: React.FC<any>; label: string }[] = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  value,
  onChange,
  compact = false,
}) => {
  return (
    <div style={{
      display: 'inline-flex',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      backgroundColor: '#f8fafc',
      overflow: 'hidden',
    }}>
      {devices.map((device) => {
        const isActive = value === device.id;
        const Icon = device.icon;
        return (
          <button
            key={device.id}
            onClick={() => onChange(device.id)}
            title={device.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: compact ? '4px 8px' : '6px 10px',
              border: 'none',
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <Icon size={compact ? 12 : 14} />
            {!compact && (
              <span>{device.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
