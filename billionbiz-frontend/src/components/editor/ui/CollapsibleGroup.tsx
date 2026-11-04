import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleGroupProps {
  label: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

export const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({
  label,
  defaultCollapsed = false,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div style={{
      borderBottom: '1px solid var(--border-color)',
      paddingBottom: '16px',
      marginBottom: '16px',
    }}>
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '4px 0',
          marginBottom: isCollapsed ? 0 : '12px',
          userSelect: 'none',
        }}
      >
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-main)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {label}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-muted)',
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </div>
      {!isCollapsed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'fadeIn 0.15s ease',
        }}>
          {children}
        </div>
      )}
    </div>
  );
};
