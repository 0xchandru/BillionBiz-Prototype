import React from 'react';

export const Skeleton: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '6px',
  style,
  className = ''
}) => {
  return (
    <div
      className={`bbz-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e2e8f0',
        backgroundImage: 'linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
        backgroundSize: '200% 100%',
        animation: 'bbz-shimmer 1.5s infinite',
        ...style
      }}
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Skeleton width="220px" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="340px" height="16px" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Skeleton width="120px" height="36px" borderRadius="8px" />
          <Skeleton width="140px" height="36px" borderRadius="8px" />
        </div>
      </div>

      {/* Metric Cards Grid (4 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Skeleton width="100px" height="14px" />
              <Skeleton width="36px" height="36px" borderRadius="8px" />
            </div>
            <Skeleton width="130px" height="28px" style={{ marginBottom: '8px' }} />
            <Skeleton width="80px" height="14px" />
          </div>
        ))}
      </div>

      {/* Analytics Chart & Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Skeleton width="180px" height="20px" style={{ marginBottom: '20px' }} />
          <Skeleton width="100%" height="280px" borderRadius="8px" />
        </div>
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Skeleton width="140px" height="20px" style={{ marginBottom: '20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Skeleton width="40px" height="40px" borderRadius="8px" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="120px" height="14px" style={{ marginBottom: '6px' }} />
                  <Skeleton width="80px" height="12px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 5 }) => {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Table Header */}
      <div style={{ display: 'flex', gap: '16px', padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} style={{ flex: 1 }}>
            <Skeleton width="70%" height="14px" />
          </div>
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: 'flex',
            gap: '16px',
            padding: '16px 20px',
            borderBottom: rowIdx === rows - 1 ? 'none' : '1px solid #f1f5f9',
            alignItems: 'center'
          }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={colIdx} style={{ flex: 1 }}>
              <Skeleton width={colIdx === 0 ? '85%' : colIdx === columns - 1 ? '50%' : '65%'} height="16px" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <Skeleton width="48px" height="48px" borderRadius="10px" />
            <div style={{ flex: 1 }}>
              <Skeleton width="70%" height="18px" style={{ marginBottom: '8px' }} />
              <Skeleton width="40%" height="14px" />
            </div>
          </div>
          <Skeleton width="100%" height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton width="85%" height="14px" style={{ marginBottom: '16px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="60px" height="24px" borderRadius="6px" />
            <Skeleton width="80px" height="32px" borderRadius="6px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CalendarSkeleton: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
      {/* Date Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Skeleton width="180px" height="24px" />
        <div style={{ display: 'flex', gap: '8px' }}>
          <Skeleton width="80px" height="36px" borderRadius="8px" />
          <Skeleton width="36px" height="36px" borderRadius="8px" />
          <Skeleton width="36px" height="36px" borderRadius="8px" />
        </div>
      </div>

      {/* Horizontal Date Picker Cards */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'hidden', marginBottom: '24px' }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            style={{
              flex: '0 0 110px',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}
          >
            <Skeleton width="40px" height="12px" style={{ margin: '0 auto 8px' }} />
            <Skeleton width="28px" height="22px" style={{ margin: '0 auto' }} />
          </div>
        ))}
      </div>

      {/* Horizontal Time Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Skeleton width="60px" height="16px" />
            <Skeleton width="100%" height="60px" borderRadius="10px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const OrderDetailsSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Skeleton width="200px" height="26px" style={{ marginBottom: '8px' }} />
          <Skeleton width="140px" height="14px" />
        </div>
        <Skeleton width="100px" height="36px" borderRadius="8px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Skeleton width="150px" height="20px" style={{ marginBottom: '16px' }} />
            <TableSkeleton rows={3} columns={4} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Skeleton width="120px" height="20px" style={{ marginBottom: '16px' }} />
            <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
            <Skeleton width="80%" height="16px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PageSkeleton: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Skeleton width="240px" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="380px" height="16px" />
        </div>
        <Skeleton width="120px" height="38px" borderRadius="8px" />
      </div>
      <TableSkeleton rows={6} columns={5} />
    </div>
  );
};

export const SkeletonLoader: React.FC<{ count?: number; height?: number; width?: string | number; style?: React.CSSProperties }> = ({
  count = 3,
  height = 50,
  width = '100%',
  style
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', ...style }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} width={width} height={`${height}px`} borderRadius="8px" />
      ))}
    </div>
  );
};

export default SkeletonLoader;


