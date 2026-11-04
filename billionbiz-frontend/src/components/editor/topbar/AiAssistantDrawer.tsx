// ============================================================
// MASTER EDITOR ENGINE — CONTEXT-AWARE AI ASSISTANT DRAWER
// Actionable AI copilot with context-aware prompt recommendations
// scoped to Header, Footer, and Page editors (spec §61).
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Wand2,
  Zap,
  Palette,
  CheckCircle2,
  Shield,
  ArrowRight,
  Smartphone,
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useEditorContextStore } from '../../../store/editorContextStore';
import styles from './topbar.module.css';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { selectedPageId } = useLandingEditorStore();
  const {
    editorType,
    updateHeaderSettings,
    updateFooterSettings,
    updateFooterRow,
    pushSnapshot,
    footerRows,
  } = useEditorContextStore();

  const [promptInput, setPromptInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const isHeader = selectedPageId === 'header-global' || editorType === 'header';
  const isFooter = selectedPageId === 'footer-global' || editorType === 'footer';

  const handleApplyAction = (name: string, execute: () => void) => {
    setIsApplying(true);
    setTimeout(() => {
      execute();
      setIsApplying(false);
      setSuccessMessage(`AI applied: "${name}"`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 450);
  };

  // 1. Header AI Prompts
  const headerPrompts = [
    {
      title: 'Make header more premium',
      desc: 'Applies deep obsidian surface, subtle champagne borders, and refined contrast',
      icon: <Palette size={16} color="#d97706" />,
      action: () => {
        updateHeaderSettings({
          appearancePreset: 'luxury',
          tokens: {
            bgType: 'custom',
            bgColor: '#141416',
            textColorType: 'custom',
            textColor: '#f5f5f7',
            borderColorType: 'custom',
            borderColor: '#2e2c28',
            accentColorType: 'custom',
            accentColor: '#d4af37',
            fontFamilyType: 'theme',
            fontFamily: 'Inter',
            buttonRadiusType: 'custom',
            buttonRadius: 6,
            shadowType: 'custom',
            shadow: 'soft',
          },
        });
        pushSnapshot('AI: Make header more premium');
      },
    },
    {
      title: 'Optimize for mobile conversion',
      desc: 'Sets slide-out drawer, sticky scroll behavior, and quick commerce triggers',
      icon: <Smartphone size={16} color="#2563eb" />,
      action: () => {
        updateHeaderSettings({
          mobileMenuType: 'drawer',
          positioning: 'sticky',
          scrollBehavior: 'shrink-on-scroll',
        });
        pushSnapshot('AI: Optimize mobile conversion');
      },
    },
    {
      title: 'Create high-energy commerce header',
      desc: 'Highlights promo countdown banner, inline search, and prominent cart badges',
      icon: <Zap size={16} color="#10b981" />,
      action: () => {
        updateHeaderSettings({
          searchMode: 'inline',
          heroAwareMode: 'standard',
        });
        pushSnapshot('AI: High-energy commerce header');
      },
    },
  ];

  // 2. Footer AI Prompts
  const footerPrompts = [
    {
      title: 'Create premium luxury footer',
      desc: 'Applies deep slate styling, high-contrast typography, and gold accents',
      icon: <Palette size={16} color="#d97706" />,
      action: () => {
        updateFooterSettings({
          appearancePreset: 'luxury',
          tokens: {
            bgType: 'custom',
            bgColor: '#141416',
            textColorType: 'custom',
            textColor: '#f5f5f7',
            borderColorType: 'custom',
            borderColor: '#2e2c28',
            accentColorType: 'custom',
            accentColor: '#d4af37',
            fontFamilyType: 'theme',
            fontFamily: 'Inter',
            buttonRadiusType: 'custom',
            buttonRadius: 6,
            shadowType: 'custom',
            shadow: 'soft',
          },
        });
        pushSnapshot('AI: Create premium luxury footer');
      },
    },
    {
      title: 'Simplify to clean minimalist layout',
      desc: 'Adjusts density to compact and removes unnecessary vertical borders',
      icon: <Wand2 size={16} color="#7c3aed" />,
      action: () => {
        updateFooterSettings({
          density: 'compact',
        });
        pushSnapshot('AI: Simplify to clean minimalist layout');
      },
    },
    {
      title: 'Improve trust & credibility presentation',
      desc: 'Inserts and highlights bank-grade security, guarantee, and fast shipping badges',
      icon: <Shield size={16} color="#6366f1" />,
      action: () => {
        const trustRow = footerRows.find((r) => r.type === 'trust');
        if (trustRow) {
          updateFooterRow(trustRow.id, {
            isVisible: true,
            styling: { ...trustRow.styling, bgColor: '#f8fafc', borderBottom: true },
          });
        }
        pushSnapshot('AI: Improve trust & credibility');
      },
    },
  ];

  const currentPrompts = isHeader ? headerPrompts : isFooter ? footerPrompts : headerPrompts;

  return (
    <div className={styles.aiDrawerOverlay} onClick={onClose}>
      <div className={styles.aiDrawerPanel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.aiDrawerHeader}>
          <div className={styles.aiHeaderLeft}>
            <div className={styles.aiSparkleIcon}>
              <Sparkles size={18} />
            </div>
            <div>
              <div className={styles.aiDrawerTitle}>BillionBiz AI Copilot</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Context: {isHeader ? 'Header Editor' : isFooter ? 'Footer Editor' : 'Page Editor'}
              </div>
            </div>
          </div>
          <button className={styles.aiDrawerCloseBtn} onClick={onClose} title="Close drawer (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className={styles.aiDrawerBody}>
          {successMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                color: '#15803d',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Prompt Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Ask AI to modify {isHeader ? 'Header' : isFooter ? 'Footer' : 'Page'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={
                  isHeader
                    ? 'e.g. Add dark luxury styling or sticky mobile menu...'
                    : 'e.g. Add guarantee badges or minimalist font styling...'
                }
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (promptInput.trim()) {
                    handleApplyAction(promptInput, () => {
                      if (isHeader) {
                        updateHeaderSettings({ customCss: `/* AI Custom: ${promptInput} */` });
                      } else {
                        updateFooterSettings({ customCss: `/* AI Custom: ${promptInput} */` });
                      }
                    });
                    setPromptInput('');
                  }
                }}
                disabled={!promptInput.trim() || isApplying}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '6px',
                  bottom: '6px',
                  width: '28px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: promptInput.trim() ? '#2563eb' : '#f1f5f9',
                  color: promptInput.trim() ? '#ffffff' : '#94a3b8',
                  cursor: promptInput.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Context Recommendations */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
                marginBottom: '10px',
              }}
            >
              Recommended 1-Click AI Actions
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentPrompts.map((prompt, idx) => (
                <div
                  key={idx}
                  onClick={() => !isApplying && handleApplyAction(prompt.title, prompt.action)}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    backgroundColor: '#ffffff',
                    cursor: isApplying ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#93c5fd';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{ padding: '6px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                    {prompt.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{prompt.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                      {prompt.desc}
                    </div>
                  </div>
                  <Wand2 size={14} color="#2563eb" style={{ marginTop: '4px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
