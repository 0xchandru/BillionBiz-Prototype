import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, CheckCircle2, AlertTriangle, 
  ExternalLink, X, ArrowRight, Compass, Rocket,
  Check, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useLandingEditorStore, type EditorPanelType } from '../../../store/landingEditorStore';
import styles from './topbar.module.css';

interface HealthIssue {
  id: string;
  title: string;
  category: 'seo' | 'performance' | 'design' | 'content';
  severity: 'critical' | 'warning' | 'good';
  description: string;
  actionText?: string;
  actionTarget?: {
    panel: EditorPanelType;
    subSection?: string;
  };
}

interface HealthScorePopoversProps {
  onOpenSetup?: () => void;
}

export const HealthScorePopovers: React.FC<HealthScorePopoversProps> = ({ onOpenSetup }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'health'>('setup');
  const [activeFilter, setActiveFilter] = useState<'all' | 'warnings' | 'good'>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { 
    setActivePanel, 
    setStoreBrandSection,
    setDesignSection,
    setSettingsSection,
  } = useLandingEditorStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const issues: HealthIssue[] = [
    {
      id: 'h-1',
      title: 'Meta Title & Description',
      category: 'seo',
      severity: 'good',
      description: 'Page has optimal meta title (54 chars) and description (142 chars).',
    },
    {
      id: 'h-2',
      title: 'Open Graph Social Sharing',
      category: 'seo',
      severity: 'warning',
      description: 'Custom social preview image has not been configured yet.',
      actionText: 'Configure Social Image',
      actionTarget: { panel: 'store-brand', subSection: 'seo' },
    },
    {
      id: 'h-3',
      title: 'Core Web Vitals (LCP & CLS)',
      category: 'performance',
      severity: 'good',
      description: 'LCP 0.8s and CLS 0.01 are well within green thresholds.',
    },
    {
      id: 'h-4',
      title: 'Mobile Touch Targets',
      category: 'design',
      severity: 'good',
      description: 'All buttons and interactive links meet minimum 48px tap targets.',
    },
    {
      id: 'h-5',
      title: 'Store WhatsApp & Contact Link',
      category: 'content',
      severity: 'warning',
      description: 'Support contact number has not been linked to chat widget.',
      actionText: 'Setup WhatsApp Widget',
      actionTarget: { panel: 'store-brand', subSection: 'socials' },
    },
    {
      id: 'h-6',
      title: 'Broken Link Detector',
      category: 'seo',
      severity: 'good',
      description: 'All 24 navigation links and CTA buttons resolve properly.',
    }
  ];

  const setupSteps = [
    {
      id: 'step-domain',
      title: 'Connect Custom Domain',
      status: 'completed',
      detail: 'store.billionbiz.com (SSL Active)',
    },
    {
      id: 'step-products',
      title: 'Add Store Products',
      status: 'completed',
      detail: '12 products in catalog',
    },
    {
      id: 'step-payments',
      title: 'Payment Gateway Setup',
      status: 'completed',
      detail: 'Stripe & Credit Card active',
    },
    {
      id: 'step-policies',
      title: 'Set Store Legal Policies',
      status: 'pending',
      detail: 'Refund, privacy & shipping policies',
      actionText: 'Configure',
      target: { panel: 'settings' as const, subSection: 'policies' },
    },
    {
      id: 'step-shipping',
      title: 'Shipping & Delivery Rates',
      status: 'pending',
      detail: 'Set zones & delivery estimates',
      target: { panel: 'settings' as const, subSection: 'setup' },
    },
  ];

  const handleAction = (target: { panel: EditorPanelType; subSection?: string }) => {
    setIsOpen(false);
    setActivePanel(target.panel);
    if (target.subSection) {
      if (target.panel === 'brand' || target.panel === 'store-brand') {
        setStoreBrandSection(target.subSection as any);
      } else if (target.panel === 'design' || target.panel === 'design-experience') {
        setDesignSection(target.subSection as any);
      } else if (target.panel === 'settings') {
        setSettingsSection(target.subSection as any);
      }
    }
    const route = target.panel === 'store-brand' ? 'brand' : target.panel === 'design-experience' ? 'design' : target.panel;
    navigate(`/editor/${route}`);
  };

  const filteredIssues = issues.filter((issue) => {
    if (activeFilter === 'warnings') return issue.severity === 'warning';
    if (activeFilter === 'good') return issue.severity === 'good';
    return true;
  });

  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const completedStepsCount = setupSteps.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedStepsCount / setupSteps.length) * 100);

  return (
    <div ref={containerRef} className={styles.scoresContainer}>
      {/* Sleek, Compact Topbar Readiness Capsule */}
      <button
        className={`${styles.readinessPillTrigger} ${isOpen ? styles.readinessPillActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Store Launch Readiness: 3/5 Setup Steps • 94% Health"
      >
        <div className={styles.readinessPulseRing}>
          <Activity size={12} color="#059669" />
        </div>
        <span className={styles.readinessHealthValue}>94%</span>
        <span className={styles.readinessSetupDivider} />
        <span className={styles.readinessSetupLabel}>3/5 Setup</span>
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className={`${styles.popoverCard} ${styles.healthPopover}`}>
          {/* Popover Header */}
          <div className={styles.popoverHeader}>
            <div>
              <span className={styles.popoverTitle}>Store Readiness</span>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '1px' }}>
                Launch checklist & search health audit
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className={styles.popoverCloseBtn}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Segmented Tab Switcher */}
          <div className={styles.popoverTabRow}>
            <button
              className={`${styles.popoverTabBtn} ${activeTab === 'setup' ? styles.popoverTabBtnActive : ''}`}
              onClick={() => setActiveTab('setup')}
            >
              <Rocket size={13} />
              <span>Launch Setup ({completedStepsCount}/{setupSteps.length})</span>
            </button>
            <button
              className={`${styles.popoverTabBtn} ${activeTab === 'health' ? styles.popoverTabBtnActive : ''}`}
              onClick={() => setActiveTab('health')}
            >
              <ShieldCheck size={13} />
              <span>Store Health (94%)</span>
            </button>
          </div>

          {/* TAB 1: LAUNCH SETUP CHECKLIST */}
          {activeTab === 'setup' && (
            <div className={styles.popoverBody}>
              {/* Progress Summary Card */}
              <div className={styles.setupProgressCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0369a1' }}>
                    {progressPercent}% Launch Readiness
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7' }}>
                    {completedStepsCount} of {setupSteps.length} Steps
                  </span>
                </div>
                <div className={styles.setupProgressBarTrack}>
                  <div className={styles.setupProgressBarFill} style={{ width: `${progressPercent}%` }} />
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '10.5px', color: '#64748b' }}>
                  Complete 2 remaining steps to launch your store with full confidence.
                </p>
              </div>

              {/* Steps List */}
              <div className={styles.setupStepsList}>
                {setupSteps.map((step, idx) => (
                  <div key={step.id} className={styles.setupStepRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      <div className={step.status === 'completed' ? styles.stepCheckCircleDone : styles.stepCheckCirclePending}>
                        {step.status === 'completed' ? <Check size={11} strokeWidth={3} /> : idx + 1}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>
                          {step.title}
                        </span>
                        <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                          {step.detail}
                        </span>
                      </div>
                    </div>
                    {step.status === 'completed' ? (
                      <span className={styles.stepBadgeDone}>Done</span>
                    ) : (
                      step.actionText && step.target && (
                        <button
                          className={styles.stepActionLink}
                          onClick={() => handleAction(step.target!)}
                        >
                          <span>{step.actionText}</span>
                          <ChevronRight size={11} />
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>

              {/* Footer CTA */}
              {onOpenSetup && (
                <div className={styles.popoverFooterAction}>
                  <button
                    className={styles.fullWidthSetupBtn}
                    onClick={() => {
                      setIsOpen(false);
                      onOpenSetup();
                    }}
                  >
                    <Compass size={13} />
                    <span>Open Guided Launch Wizard</span>
                    <ArrowRight size={12} style={{ marginLeft: 'auto' }} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STORE HEALTH & AUDIT */}
          {activeTab === 'health' && (
            <div className={styles.popoverBody}>
              {/* Score Snapshot */}
              <div style={{ display: 'flex', gap: '8px', padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ flex: 1, padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>98%</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Performance</div>
                </div>
                <div style={{ flex: 1, padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb' }}>100%</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Mobile UX</div>
                </div>
                <div style={{ flex: 1, padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#d97706' }}>92%</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>SEO & Meta</div>
                </div>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', padding: '8px 14px', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`${styles.filterPill} ${activeFilter === 'all' ? styles.filterPillActive : ''}`}
                >
                  All ({issues.length})
                </button>
                <button
                  onClick={() => setActiveFilter('warnings')}
                  className={`${styles.filterPill} ${activeFilter === 'warnings' ? styles.filterPillActive : ''}`}
                >
                  Needs Attention ({warningCount})
                </button>
                <button
                  onClick={() => setActiveFilter('good')}
                  className={`${styles.filterPill} ${activeFilter === 'good' ? styles.filterPillActive : ''}`}
                >
                  Passed ({issues.length - warningCount})
                </button>
              </div>

              {/* Issues List */}
              <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '4px 14px' }}>
                {filteredIssues.map((issue) => (
                  <div key={issue.id} className={styles.issueItemRow}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {issue.severity === 'good' ? (
                          <CheckCircle2 size={13} color="#10b981" />
                        ) : (
                          <AlertTriangle size={13} color="#f59e0b" />
                        )}
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                          {issue.title}
                        </span>
                      </div>
                      <span className={issue.severity === 'good' ? styles.badgeGood : styles.badgeWarning}>
                        {issue.severity === 'good' ? 'Passed' : 'Warning'}
                      </span>
                    </div>

                    <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748b', paddingLeft: '19px' }}>
                      {issue.description}
                    </p>

                    {issue.actionText && issue.actionTarget && (
                      <div style={{ paddingLeft: '19px', marginTop: '4px' }}>
                        <button
                          onClick={() => handleAction(issue.actionTarget!)}
                          className={styles.fixNowLink}
                        >
                          <span>{issue.actionText}</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className={styles.popoverFooterAction}>
                <button 
                  className={styles.linkBtn}
                  onClick={() => {
                    setActivePanel('brand');
                    setStoreBrandSection('seo');
                    setIsOpen(false);
                    navigate('/editor/brand');
                  }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Open Full SEO &amp; Growth Hub</span>
                  <ExternalLink size={11} style={{ marginLeft: 4 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
