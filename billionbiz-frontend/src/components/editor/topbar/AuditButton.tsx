// ============================================================
// MASTER EDITOR ENGINE — AUDIT BUTTON & SHARED AUDIT MODAL
// Topbar audit status indicator badge and detailed issue drawer
// (spec §6, §65, §66).
// ============================================================

import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  RefreshCw,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';

export const AuditButton: React.FC = () => {
  const {
    auditResult,
    runAudit,
    isAuditModalOpen,
    openAuditModal,
    closeAuditModal,
    editorType,
  } = useEditorContextStore();

  useEffect(() => {
    runAudit();
  }, [editorType, runAudit]);

  const errorCount = auditResult?.errorCount || 0;
  const warningCount = auditResult?.warningCount || 0;

  const getStatusBadge = () => {
    if (errorCount > 0) {
      return {
        icon: <XCircle size={14} color="#ef4444" />,
        text: `${errorCount} ${errorCount === 1 ? 'issue' : 'issues'}`,
        bgColor: '#fef2f2',
        borderColor: '#fecaca',
        textColor: '#b91c1c',
      };
    }
    if (warningCount > 0) {
      return {
        icon: <AlertTriangle size={14} color="#f59e0b" />,
        text: `${warningCount} ${warningCount === 1 ? 'warning' : 'warnings'}`,
        bgColor: '#fffbeb',
        borderColor: '#fde68a',
        textColor: '#b45309',
      };
    }
    return {
      icon: <CheckCircle2 size={14} color="#10b981" />,
      text: 'All good',
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      textColor: '#15803d',
    };
  };

  const badge = getStatusBadge();

  return (
    <>
      <button
        type="button"
        onClick={openAuditModal}
        title="View Accessibility, SEO & UX Audit"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: badge.bgColor,
          border: `1px solid ${badge.borderColor}`,
          borderRadius: '20px',
          color: badge.textColor,
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {badge.icon}
        <span>{badge.text}</span>
      </button>

      {/* Audit Modal */}
      {isAuditModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={closeAuditModal}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '80vh',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  {editorType === 'header' ? 'Header Audit' : editorType === 'footer' ? 'Footer Audit' : 'Page Audit'}
                </h3>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: badge.bgColor,
                    color: badge.textColor,
                    border: `1px solid ${badge.borderColor}`,
                  }}
                >
                  {badge.text}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => runAudit()}
                  title="Re-run audit"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: '#64748b',
                    borderRadius: '6px',
                  }}
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  type="button"
                  onClick={closeAuditModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: '#64748b',
                    borderRadius: '6px',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {!auditResult || auditResult.issues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                  <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                    Outstanding quality!
                  </h4>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                    Zero accessibility, SEO, or UX warnings detected in this configuration.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {auditResult.issues.map((issue) => (
                    <div
                      key={issue.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '8px',
                        border:
                          issue.severity === 'error'
                            ? '1px solid #fecaca'
                            : issue.severity === 'warning'
                            ? '1px solid #fde68a'
                            : '1px solid #e2e8f0',
                        backgroundColor:
                          issue.severity === 'error'
                            ? '#fef2f2'
                            : issue.severity === 'warning'
                            ? '#fffbeb'
                            : '#f8fafc',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        {issue.severity === 'error' ? (
                          <XCircle size={16} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                        ) : issue.severity === 'warning' ? (
                          <AlertTriangle size={16} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
                        ) : (
                          <Info size={16} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                color: '#64748b',
                              }}
                            >
                              {issue.category}
                            </span>
                            {issue.componentName && (
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                                • {issue.componentName}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                            {issue.message}
                          </div>
                          {issue.suggestion && (
                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                              💡 {issue.suggestion}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
