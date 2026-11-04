import React from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeftRight, ArrowRight, X } from 'lucide-react';

interface EditorSwitchConfirmModalProps {
  currentName: string;
  targetName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const EditorSwitchConfirmModal: React.FC<EditorSwitchConfirmModalProps> = ({
  currentName,
  targetName,
  onConfirm,
  onCancel,
}) => createPortal(
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
    }}
    onClick={onCancel}
  >
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        width: '420px',
        maxWidth: '92vw',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
      }}
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-switch-title"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
          }}>
            <ArrowLeftRight size={20} />
          </div>
          <div>
            <h3 id="editor-switch-title" style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
              Switch to {targetName}?
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Currently in {currentName}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
          title="Close dialog"
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>
      </div>

      <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#475569', lineHeight: 1.55 }}>
        This section belongs to <span style={{ color: '#2563eb', fontWeight: 600 }}>{targetName}</span>. Switch editors to continue editing it?
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', cursor: 'pointer', fontWeight: 600, fontSize: '13px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Switch to {targetName}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  </div>,
  document.body,
);
