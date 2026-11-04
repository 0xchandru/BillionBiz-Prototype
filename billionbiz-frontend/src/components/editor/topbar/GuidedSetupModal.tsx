import React, { useEffect } from 'react';
import { CheckCircle2, Circle, X, Compass } from 'lucide-react';
import styles from './topbar.module.css';

interface GuidedSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedSetupModal: React.FC<GuidedSetupModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = [
    { title: 'Define Brand & Site Name', completed: true },
    { title: 'Customize Global Theme Colors & Typography', completed: true },
    { title: 'Add & Organize Storefront Sections', completed: true },
    { title: 'Configure SEO Titles & Social Meta Tags', completed: false },
    { title: 'Connect Custom Domain & Publish Store', completed: false },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={styles.setupModalOverlay} onClick={onClose}>
      <div className={styles.setupModalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.setupModalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="#0284c7" />
            <span className={styles.setupModalTitle}>Website Launch Guide</span>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.setupModalBody}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>
              {completedCount} of {steps.length} steps completed
            </span>
            <span style={{ fontWeight: 700, color: '#0284c7' }}>
              {progressPercent}%
            </span>
          </div>

          <div className={styles.setupProgressBar}>
            <div 
              className={styles.setupProgressFill} 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>

          <div className={styles.setupStepList}>
            {steps.map((step, idx) => (
              <div key={idx} className={styles.setupStepItem}>
                <div className={styles.setupStepLeft}>
                  {step.completed ? (
                    <CheckCircle2 size={16} className={styles.setupStepDone} />
                  ) : (
                    <Circle size={16} className={styles.setupStepPending} />
                  )}
                  <span className={styles.setupStepText} style={{ textDecoration: step.completed ? 'line-through' : 'none', opacity: step.completed ? 0.7 : 1 }}>
                    {step.title}
                  </span>
                </div>
                {!step.completed && (
                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            💡 Full interactive setup wizard and automatic website setup will be available in future updates.
          </div>
        </div>
      </div>
    </div>
  );
};
