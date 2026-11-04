import React from 'react';
import styles from '../../../pages/editor/EditorLayout.module.css';

// Premium Card Header component — extracted from StoreBrandRenderer/SettingsRenderer
// to eliminate duplication and provide a shared component for all card-based panels.
export const CardHeader: React.FC<{
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  description: string;
  badgeText?: string;
  badgeType?: 'active' | 'pending' | 'optional';
}> = ({ icon, title, description, badgeText, badgeType = 'active' }) => (
  <div className={styles.cardHeader}>
    <div className={styles.cardHeaderIcon}>
      {icon}
    </div>
    <div className={styles.cardHeaderMeta}>
      <div className={styles.cardHeaderTitleRow}>
        <h3>{title}</h3>
        {badgeText && (
          <span className={`${styles.cardStatusBadge} ${badgeType === 'active' ? styles.active : badgeType === 'pending' ? styles.pending : styles.optional}`}>
            {badgeText}
          </span>
        )}
      </div>
      <p>{description}</p>
    </div>
  </div>
);
