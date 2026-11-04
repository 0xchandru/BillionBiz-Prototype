// ============================================================
// MASTER EDITOR ENGINE — VERSION COMPARE & RESTORE MODAL
// Visual history comparison and rollback engine (spec §64).
// ============================================================

import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import type { HistoryEntry } from './types';

interface VersionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionCompareModal: React.FC<VersionCompareModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { history, editorType } = useEditorContextStore();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  if (!isOpen) return null;

  const allEntries: HistoryEntry[] = [
    ...(history.present ? [history.present] : []),
    ...[...history.past].reverse(),
  ];

  const selectedEntry = allEntries.find((e) => e.id === selectedEntryId) || allEntries[0];

  const handleRestore = (entry: HistoryEntry) => {
    const store = useEditorContextStore.getState();
    if (entry.snapshot.headerRows) {
      store.headerRows = entry.snapshot.headerRows;
    }
    if (entry.snapshot.headerSettings) {
      store.headerSettings = entry.snapshot.headerSettings;
    }
    if (entry.snapshot.footerRows) {
      store.footerRows = entry.snapshot.footerRows;
    }
    if (entry.snapshot.footerSettings) {
      store.footerSettings = entry.snapshot.footerSettings;
    }
    store.pushSnapshot(`Restored version from ${entry.timeLabel}`);
    setRestoreSuccess(true);
    setTimeout(() => {
      setRestoreSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
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
            <History size={20} color="#2563eb" />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Version History &amp; Rollbacks
              </h3>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Scope: {editorType === 'header' ? 'Header Editor' : editorType === 'footer' ? 'Footer Editor' : 'Page Editor'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        {restoreSuccess && (
          <div
            style={{
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              borderBottom: '1px solid #bbf7d0',
            }}
          >
            <CheckCircle2 size={16} /> Version restored successfully!
          </div>
        )}

        {/* Body Split */}
        <div style={{ display: 'flex', flex: 1, minHeight: '380px', overflow: 'hidden' }}>
          {/* Entries List */}
          <div
            style={{
              width: '280px',
              borderRight: '1px solid #e2e8f0',
              overflowY: 'auto',
              backgroundColor: '#f8fafc',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', marginBottom: '8px' }}>
              Recorded Revisions ({allEntries.length})
            </div>

            {allEntries.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#94a3b8', padding: '16px 0', textAlign: 'center' }}>
                No past revisions recorded in this session.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {allEntries.map((entry, idx) => {
                  const isSelected = selectedEntry?.id === entry.id;
                  const isCurrent = idx === 0;

                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntryId(entry.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb' }}>
                          {entry.timeLabel}
                        </span>
                        {isCurrent && (
                          <span style={{ fontSize: '10px', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                            Current
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#0f172a', lineHeight: 1.3 }}>
                        {entry.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Revision Preview Details */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {selectedEntry ? (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Snapshot Details
                  </div>
                  <h4 style={{ margin: '4px 0 2px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    {selectedEntry.description}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                    <Clock size={13} />
                    <span>Recorded at {selectedEntry.timeLabel}</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                    Snapshot Content Summary
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedEntry.snapshot.headerRows && (
                      <div>• Header Rows: {selectedEntry.snapshot.headerRows.length} active rows</div>
                    )}
                    {selectedEntry.snapshot.headerSettings && (
                      <div>• Positioning: {selectedEntry.snapshot.headerSettings.positioning}</div>
                    )}
                    {selectedEntry.snapshot.footerRows && (
                      <div>• Footer Rows: {selectedEntry.snapshot.footerRows.length} active rows</div>
                    )}
                    {selectedEntry.snapshot.footerSettings && (
                      <div>• Density: {selectedEntry.snapshot.footerSettings.density}</div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRestore(selectedEntry)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Restore This Version</span>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8', fontSize: '13px' }}>
                Select a revision to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
