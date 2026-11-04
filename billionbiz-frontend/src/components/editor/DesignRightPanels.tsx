import React, { useState } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { 
  ChevronRight, Trash2, Plus, RotateCcw, Check, Eye, 
  MoveUp, MoveDown, Play
} from 'lucide-react';
import styles from '../../pages/editor/EditorLayout.module.css';

interface DesignRightPanelProps {
  isHidden?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 1. LOADER ANIMATION SIDEBAR PANEL
// ─────────────────────────────────────────────────────────────
export const LoaderSidebarPanel: React.FC<DesignRightPanelProps> = ({ isHidden = false }) => {
  const { settings, updateSettings } = useSiteStore();
  const { closeRightSidebar } = useLandingEditorStore();
  const [isSimulating, setIsSimulating] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const loaderStyle = settings.loaderStyle || 'spinner';
  const loaderSize = settings.loaderSize || 'medium';
  const loaderBg = settings.loaderBg || 'blur';
  const loaderCustomBg = settings.loaderCustomBg || '#ffffff';
  const loaderShowText = settings.loaderShowText !== false;
  const loaderText = settings.loaderLoadingText || 'Loading...';
  const loaderShowLogo = settings.loaderShowLogo || false;
  const loaderColor = settings.loaderColor || '#2563eb';
  const loaderSpeed = settings.loaderSpeed || 'normal';

  const handleUpdate = (updates: Record<string, any>) => {
    updateSettings(updates);
  };

  const handleReset = () => {
    updateSettings({
      loaderStyle: 'spinner',
      loaderSize: 'medium',
      loaderBg: 'blur',
      loaderCustomBg: '#ffffff',
      loaderShowText: true,
      loaderLoadingText: 'Loading...',
      loaderShowLogo: false,
      loaderColor: '#2563eb',
      loaderSpeed: 'normal',
    });
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  const triggerSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2500);
  };

  const sizeMap: Record<string, string> = { small: '26px', medium: '42px', large: '58px' };
  const spinnerSize = sizeMap[loaderSize] || '42px';
  const speedSec = loaderSpeed === 'fast' ? '0.5s' : loaderSpeed === 'slow' ? '1.4s' : '0.85s';

  return (
    <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
      <div className={styles.panelHeader} style={{ padding: '14px 18px', gap: '14px' }}>
        <div className={styles.phLeft} style={{ gap: '8px', minWidth: 0, flexShrink: 1 }}>
          <button className={styles.iconBtn} onClick={closeRightSidebar} title="Close Panel" style={{ flexShrink: 0 }}>
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, fontSize: '15px', whiteSpace: 'nowrap' }}>
            Loader Animation
          </h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: resetSuccess ? '#ecfdf5' : '#f8fafc',
            color: resetSuccess ? '#059669' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Reset to default loader settings"
        >
          {resetSuccess ? <Check size={12} /> : <RotateCcw size={12} />}
          <span>{resetSuccess ? 'Reset!' : 'Reset'}</span>
        </button>
      </div>

      <div className={styles.propContent} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Live Simulator Card */}
        <div style={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '12px',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={14} color="#2563eb" /> Live Simulator
            </span>
            <button
              type="button"
              onClick={triggerSimulation}
              disabled={isSimulating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
                background: isSimulating ? '#dbeafe' : '#eff6ff',
                color: '#2563eb',
                fontSize: '11px',
                fontWeight: 600,
                cursor: isSimulating ? 'default' : 'pointer',
              }}
            >
              <Play size={11} fill={isSimulating ? '#2563eb' : 'none'} />
              {isSimulating ? 'Simulating...' : 'Test Fullscreen'}
            </button>
          </div>

          <div style={{
            height: '140px',
            borderRadius: '9px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: loaderBg === 'transparent' ? 'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 50% / 12px 12px' :
                        loaderBg === 'solid' ? loaderCustomBg : 'rgba(248,250,252,0.85)',
            backdropFilter: loaderBg === 'blur' ? 'blur(10px)' : 'none',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {loaderShowLogo && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${loaderColor}, #7c3aed)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '15px',
                boxShadow: `0 3px 8px ${loaderColor}40`,
              }}>
                B
              </div>
            )}

            {loaderStyle === 'spinner' && (
              <div style={{
                width: spinnerSize,
                height: spinnerSize,
                border: `3px solid #e2e8f0`,
                borderTopColor: loaderColor,
                borderRadius: '50%',
                animation: `spin ${speedSec} linear infinite`,
              }} />
            )}

            {loaderStyle === 'dots' && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: loaderColor, animation: `pulse ${speedSec} infinite 0s` }} />
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: loaderColor, animation: `pulse ${speedSec} infinite 0.2s` }} />
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: loaderColor, animation: `pulse ${speedSec} infinite 0.4s` }} />
              </div>
            )}

            {loaderStyle === 'pulse' && (
              <div style={{
                width: spinnerSize,
                height: spinnerSize,
                borderRadius: '50%',
                background: `${loaderColor}33`,
                border: `2px solid ${loaderColor}`,
                animation: `ping ${speedSec} cubic-bezier(0, 0, 0.2, 1) infinite`,
              }} />
            )}

            {loaderStyle === 'progress' && (
              <div style={{ width: '120px', height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '50%', height: '100%', background: loaderColor, borderRadius: '999px', animation: `indeterminate ${speedSec} infinite ease-in-out` }} />
              </div>
            )}

            {loaderShowText && (
              <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 600 }}>
                {loaderText}
              </span>
            )}
          </div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }
            @keyframes ping { 75%, 100% { transform: scale(1.5); opacity: 0; } }
            @keyframes indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
          `}</style>
        </div>

        {/* Style Presets */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
            Animation Style Preset
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {[
              { id: 'spinner', label: 'Circular Spinner' },
              { id: 'dots', label: 'Three Dots Wave' },
              { id: 'pulse', label: 'Pulse Radar' },
              { id: 'progress', label: 'Progress Bar' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleUpdate({ loaderStyle: s.id })}
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: `1.5px solid ${loaderStyle === s.id ? '#2563eb' : '#e2e8f0'}`,
                  background: loaderStyle === s.id ? '#eff6ff' : '#ffffff',
                  color: loaderStyle === s.id ? '#1d4ed8' : '#334155',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  textAlign: 'left',
                  transition: 'all 0.12s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Backdrop Background */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
            Backdrop Screen
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'blur', label: 'Glass Blur' },
              { id: 'solid', label: 'Solid Color' },
              { id: 'transparent', label: 'Transparent' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleUpdate({ loaderBg: b.id })}
                style={{
                  flex: 1,
                  padding: '7px 6px',
                  borderRadius: '6px',
                  border: `1.5px solid ${loaderBg === b.id ? '#2563eb' : '#e2e8f0'}`,
                  background: loaderBg === b.id ? '#eff6ff' : '#ffffff',
                  color: loaderBg === b.id ? '#1d4ed8' : '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
          {loaderBg === 'solid' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <input
                type="color"
                value={loaderCustomBg}
                onChange={(e) => handleUpdate({ loaderCustomBg: e.target.value })}
                style={{ width: '28px', height: '26px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 500 }}>{loaderCustomBg}</span>
            </div>
          )}
        </div>

        {/* Animation Scale & Speed */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
            Scale &amp; Speed
          </label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            {[
              { id: 'small', label: 'Small' },
              { id: 'medium', label: 'Medium' },
              { id: 'large', label: 'Large' },
            ].map((sz) => (
              <button
                key={sz.id}
                type="button"
                onClick={() => handleUpdate({ loaderSize: sz.id })}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: '6px',
                  border: `1.5px solid ${loaderSize === sz.id ? '#2563eb' : '#e2e8f0'}`,
                  background: loaderSize === sz.id ? '#eff6ff' : '#ffffff',
                  color: loaderSize === sz.id ? '#1d4ed8' : '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {sz.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'slow', label: 'Slow (1.4s)' },
              { id: 'normal', label: 'Normal (0.8s)' },
              { id: 'fast', label: 'Fast (0.5s)' },
            ].map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => handleUpdate({ loaderSpeed: sp.id })}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: '6px',
                  border: `1.5px solid ${loaderSpeed === sp.id ? '#2563eb' : '#e2e8f0'}`,
                  background: loaderSpeed === sp.id ? '#eff6ff' : '#ffffff',
                  color: loaderSpeed === sp.id ? '#1d4ed8' : '#475569',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
            Loader Color
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0f172a'].map((col) => (
              <div
                key={col}
                onClick={() => handleUpdate({ loaderColor: col })}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: col,
                  cursor: 'pointer',
                  border: loaderColor === col ? '2px solid #000' : '2px solid transparent',
                  transform: loaderColor === col ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                }}
              />
            ))}
            <input
              type="color"
              value={loaderColor}
              onChange={(e) => handleUpdate({ loaderColor: e.target.value })}
              style={{ width: '26px', height: '26px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Content Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Branded Content</label>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block' }}>Display Brand Logo</span>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>Show monogram badge above animation</span>
            </div>
            <input
              type="checkbox"
              checked={loaderShowLogo}
              onChange={(e) => handleUpdate({ loaderShowLogo: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Show Loading Text</span>
            <input
              type="checkbox"
              checked={loaderShowText}
              onChange={(e) => handleUpdate({ loaderShowText: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          {loaderShowText && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Message Text</label>
              <input
                type="text"
                value={loaderText}
                onChange={(e) => handleUpdate({ loaderLoadingText: e.target.value })}
                placeholder="Loading..."
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen simulation overlay */}
      {isSimulating && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          background: loaderBg === 'transparent' ? 'rgba(255,255,255,0.92)' :
                      loaderBg === 'solid' ? loaderCustomBg : 'rgba(255,255,255,0.85)',
          backdropFilter: loaderBg === 'blur' ? 'blur(16px)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {loaderShowLogo && (
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${loaderColor}, #7c3aed)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '20px',
              boxShadow: `0 4px 14px ${loaderColor}40`,
            }}>
              B
            </div>
          )}

          {loaderStyle === 'spinner' && (
            <div style={{
              width: spinnerSize,
              height: spinnerSize,
              border: `3px solid #e2e8f0`,
              borderTopColor: loaderColor,
              borderRadius: '50%',
              animation: `spin ${speedSec} linear infinite`,
            }} />
          )}

          {loaderStyle === 'dots' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: loaderColor, animation: `pulse ${speedSec} infinite 0s` }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: loaderColor, animation: `pulse ${speedSec} infinite 0.2s` }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: loaderColor, animation: `pulse ${speedSec} infinite 0.4s` }} />
            </div>
          )}

          {loaderStyle === 'pulse' && (
            <div style={{
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: '50%',
              background: `${loaderColor}33`,
              border: `2px solid ${loaderColor}`,
              animation: `ping ${speedSec} cubic-bezier(0, 0, 0.2, 1) infinite`,
            }} />
          )}

          {loaderStyle === 'progress' && (
            <div style={{ width: '160px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: '50%', height: '100%', background: loaderColor, borderRadius: '999px', animation: `indeterminate ${speedSec} infinite ease-in-out` }} />
            </div>
          )}

          {loaderShowText && (
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
              {loaderText}
            </span>
          )}
        </div>
      )}
    </aside>
  );
};


// ─────────────────────────────────────────────────────────────
// 2. SCROLLBAR BEHAVIOUR SIDEBAR PANEL
// ─────────────────────────────────────────────────────────────
export const ScrollBehaviorSidebarPanel: React.FC<DesignRightPanelProps> = ({ isHidden = false }) => {
  const { settings, updateSettings } = useSiteStore();
  const { closeRightSidebar } = useLandingEditorStore();
  const [resetSuccess, setResetSuccess] = useState(false);

  const scrollbarPreset = settings.scrollbarPreset || 'minimal';
  const scrollbarWidth = settings.scrollbarWidth || '6px';
  const scrollbarThumbColor = settings.scrollbarThumbColor || '#94a3b8';
  const scrollbarTrackColor = settings.scrollbarTrackColor || 'transparent';
  const scrollbarRadius = settings.scrollbarRadius || '999px';
  const smoothScroll = settings.smoothScroll !== false;
  const showBackToTop = settings.showBackToTop !== false;
  const backToTopPosition = settings.backToTopPosition || 'right';
  const backToTopShape = settings.backToTopShape || 'circle';
  const showReadingProgress = settings.showReadingProgressBar || false;

  const handleUpdate = (updates: Record<string, any>) => {
    updateSettings(updates);
  };

  const applyPreset = (preset: string) => {
    if (preset === 'minimal') {
      handleUpdate({
        scrollbarPreset: 'minimal',
        scrollbarWidth: '6px',
        scrollbarThumbColor: '#cbd5e1',
        scrollbarTrackColor: 'transparent',
        scrollbarRadius: '999px',
      });
    } else if (preset === 'brand') {
      handleUpdate({
        scrollbarPreset: 'brand',
        scrollbarWidth: '8px',
        scrollbarThumbColor: '#2563eb',
        scrollbarTrackColor: '#eff6ff',
        scrollbarRadius: '999px',
      });
    } else if (preset === 'dark') {
      handleUpdate({
        scrollbarPreset: 'dark',
        scrollbarWidth: '8px',
        scrollbarThumbColor: '#334155',
        scrollbarTrackColor: '#f1f5f9',
        scrollbarRadius: '4px',
      });
    } else if (preset === 'pill') {
      handleUpdate({
        scrollbarPreset: 'pill',
        scrollbarWidth: '10px',
        scrollbarThumbColor: '#64748b',
        scrollbarTrackColor: '#f8fafc',
        scrollbarRadius: '999px',
      });
    } else if (preset === 'hidden') {
      handleUpdate({
        scrollbarPreset: 'hidden',
        scrollbarWidth: '0px',
        scrollbarThumbColor: 'transparent',
        scrollbarTrackColor: 'transparent',
        scrollbarRadius: '0px',
      });
    }
  };

  const handleReset = () => {
    updateSettings({
      scrollbarPreset: 'minimal',
      scrollbarWidth: '6px',
      scrollbarThumbColor: '#cbd5e1',
      scrollbarTrackColor: 'transparent',
      scrollbarRadius: '999px',
      smoothScroll: true,
      showBackToTop: true,
      backToTopPosition: 'right',
      backToTopShape: 'circle',
      showReadingProgressBar: false,
    });
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
      <div className={styles.panelHeader} style={{ padding: '14px 18px', gap: '14px' }}>
        <div className={styles.phLeft} style={{ gap: '8px', minWidth: 0, flexShrink: 1 }}>
          <button className={styles.iconBtn} onClick={closeRightSidebar} title="Close Panel" style={{ flexShrink: 0 }}>
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, fontSize: '15px', whiteSpace: 'nowrap' }}>
            Scrollbar Behaviour
          </h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: resetSuccess ? '#ecfdf5' : '#f8fafc',
            color: resetSuccess ? '#059669' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Reset to default scrollbar settings"
        >
          {resetSuccess ? <Check size={12} /> : <RotateCcw size={12} />}
          <span>{resetSuccess ? 'Reset!' : 'Reset'}</span>
        </button>
      </div>

      <div className={styles.propContent} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Interactive Scrollbar Demo */}
        <div style={{
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '12px',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
            Live Scrollbar Preview
          </span>
          <div
            id="demo-scrollbar-container"
            style={{
              height: '85px',
              overflowY: 'scroll',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '11.5px',
              lineHeight: 1.6,
              color: '#64748b',
            }}
          >
            <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#334155' }}>
              Scroll test area: Drag or scroll this box to inspect your live scrollbar aesthetics.
            </p>
            <p style={{ margin: '0 0 6px 0' }}>
              Custom scrollbars provide a sleek, polished feel for shoppers navigating long product lists and descriptions.
            </p>
            <p style={{ margin: 0 }}>
              Adjust thumb color, track tint, corner roundness, and scrollbar thickness below to match your store identity.
            </p>
          </div>
          <style>{`
            #demo-scrollbar-container::-webkit-scrollbar {
              width: ${scrollbarWidth};
            }
            #demo-scrollbar-container::-webkit-scrollbar-track {
              background: ${scrollbarTrackColor};
            }
            #demo-scrollbar-container::-webkit-scrollbar-thumb {
              background: ${scrollbarThumbColor};
              border-radius: ${scrollbarRadius};
            }
          `}</style>
        </div>

        {/* Scrollbar Style Preset */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
            Scrollbar Aesthetic Preset
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {[
              { id: 'minimal', label: 'Minimal Slim' },
              { id: 'brand', label: 'Brand Color' },
              { id: 'dark', label: 'Dark Contrast' },
              { id: 'pill', label: 'Curved Pill' },
              { id: 'hidden', label: 'Hidden (Clean)' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: `1.5px solid ${scrollbarPreset === p.id ? '#2563eb' : '#e2e8f0'}`,
                  background: scrollbarPreset === p.id ? '#eff6ff' : '#ffffff',
                  color: scrollbarPreset === p.id ? '#1d4ed8' : '#334155',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Thickness / Width */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
            Scrollbar Thickness
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: '4px', label: 'Ultra Slim (4px)' },
              { id: '6px', label: 'Thin (6px)' },
              { id: '9px', label: 'Regular (9px)' },
            ].map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => handleUpdate({ scrollbarWidth: w.id, scrollbarPreset: 'custom' })}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: '6px',
                  border: `1.5px solid ${scrollbarWidth === w.id ? '#2563eb' : '#e2e8f0'}`,
                  background: scrollbarWidth === w.id ? '#eff6ff' : '#ffffff',
                  color: scrollbarWidth === w.id ? '#1d4ed8' : '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* Thumb & Track Color */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
            Scrollbar Colors
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Thumb Color</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={scrollbarThumbColor === 'transparent' ? '#94a3b8' : scrollbarThumbColor}
                  onChange={(e) => handleUpdate({ scrollbarThumbColor: e.target.value, scrollbarPreset: 'custom' })}
                  style={{ width: '26px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>{scrollbarThumbColor}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Track Color</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={scrollbarTrackColor === 'transparent' ? '#f1f5f9' : scrollbarTrackColor}
                  onChange={(e) => handleUpdate({ scrollbarTrackColor: e.target.value, scrollbarPreset: 'custom' })}
                  style={{ width: '26px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
                <button
                  type="button"
                  onClick={() => handleUpdate({ scrollbarTrackColor: 'transparent', scrollbarPreset: 'custom' })}
                  style={{ padding: '3px 6px', fontSize: '10.5px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Smooth Scroll & Mechanics */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Page Scrolling Mechanics</label>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Smooth Page Scrolling</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Smooth glide on anchor jumps and wheel scroll</span>
            </div>
            <input
              type="checkbox"
              checked={smoothScroll}
              onChange={(e) => handleUpdate({ smoothScroll: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          {/* Floating Back to Top Button */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showBackToTop ? '10px' : 0 }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Floating Back-to-Top Button</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Appears when customer scrolls down</span>
              </div>
              <input
                type="checkbox"
                checked={showBackToTop}
                onChange={(e) => handleUpdate({ showBackToTop: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
            </div>

            {showBackToTop && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Position</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'right', label: 'Bottom Right' },
                      { id: 'left', label: 'Bottom Left' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => handleUpdate({ backToTopPosition: pos.id })}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: `1.5px solid ${backToTopPosition === pos.id ? '#2563eb' : '#e2e8f0'}`,
                          background: backToTopPosition === pos.id ? '#eff6ff' : '#ffffff',
                          color: backToTopPosition === pos.id ? '#1d4ed8' : '#475569',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Button Shape</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'circle', label: 'Circle' },
                      { id: 'square', label: 'Rounded Square' },
                      { id: 'pill', label: 'Pill Label' },
                    ].map((sh) => (
                      <button
                        key={sh.id}
                        type="button"
                        onClick={() => handleUpdate({ backToTopShape: sh.id })}
                        style={{
                          flex: 1,
                          padding: '6px 4px',
                          borderRadius: '6px',
                          border: `1.5px solid ${backToTopShape === sh.id ? '#2563eb' : '#e2e8f0'}`,
                          background: backToTopShape === sh.id ? '#eff6ff' : '#ffffff',
                          color: backToTopShape === sh.id ? '#1d4ed8' : '#475569',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {sh.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reading Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Reading Progress Bar</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Thin colored line at top showing scroll progress</span>
            </div>
            <input
              type="checkbox"
              checked={showReadingProgress}
              onChange={(e) => handleUpdate({ showReadingProgressBar: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};


// ─────────────────────────────────────────────────────────────
// 3. MOBILE NAVIGATION SIDEBAR PANEL
// ─────────────────────────────────────────────────────────────
interface BottomNavItem {
  id: string;
  icon: string;
  text: string;
  link: string;
  badge?: string;
}

const DEFAULT_BOTTOM_NAV: BottomNavItem[] = [
  { id: '1', icon: 'Home', text: 'Home', link: '/' },
  { id: '2', icon: 'ShoppingBag', text: 'Catalog', link: '/shop' },
  { id: '3', icon: 'ShoppingCart', text: 'Cart', link: '/cart', badge: '3' },
  { id: '4', icon: 'Heart', text: 'Saved', link: '/wishlist' },
  { id: '5', icon: 'User', text: 'Account', link: '/account' },
];

export const MobileNavSidebarPanel: React.FC<DesignRightPanelProps> = ({ isHidden = false }) => {
  const { settings, updateSettings } = useSiteStore();
  const { closeRightSidebar } = useLandingEditorStore();
  const [resetSuccess, setResetSuccess] = useState(false);

  const bottomNavItems: BottomNavItem[] = settings.bottomNavLinks && settings.bottomNavLinks.length > 0
    ? settings.bottomNavLinks
    : DEFAULT_BOTTOM_NAV;

  const bottomNavStyle = settings.bottomNavStyle || 'pill';
  const bottomNavPosition = settings.bottomNavPosition || 'floating';
  const bottomNavActiveColor = settings.bottomNavActiveColor || '#2563eb';
  const mobileMenuAnimation = settings.mobileMenuAnimation || 'slide-left';

  const saveBottomNavItems = (items: BottomNavItem[]) => {
    updateSettings({ bottomNavLinks: items });
  };

  const handleAddItem = () => {
    if (bottomNavItems.length >= 5) return;
    const newItem: BottomNavItem = {
      id: Date.now().toString(),
      icon: 'Search',
      text: 'Search',
      link: '/search',
    };
    saveBottomNavItems([...bottomNavItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    saveBottomNavItems(bottomNavItems.filter((item) => item.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bottomNavItems.length) return;
    const items = [...bottomNavItems];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    saveBottomNavItems(items);
  };

  const handleReset = () => {
    updateSettings({
      showBottomNav: true,
      bottomNavStyle: 'pill',
      bottomNavPosition: 'floating',
      bottomNavActiveColor: '#2563eb',
      bottomNavLinks: DEFAULT_BOTTOM_NAV,
      mobileMenuAnimation: 'slide-left',
    });
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
      <div className={styles.panelHeader} style={{ padding: '14px 18px', gap: '14px' }}>
        <div className={styles.phLeft} style={{ gap: '8px', minWidth: 0, flexShrink: 1 }}>
          <button className={styles.iconBtn} onClick={closeRightSidebar} title="Close Panel" style={{ flexShrink: 0 }}>
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, fontSize: '15px', whiteSpace: 'nowrap' }}>
            Mobile Navigation
          </h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: resetSuccess ? '#ecfdf5' : '#f8fafc',
            color: resetSuccess ? '#059669' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Reset to default navigation tabs"
        >
          {resetSuccess ? <Check size={12} /> : <RotateCcw size={12} />}
          <span>{resetSuccess ? 'Reset!' : 'Reset'}</span>
        </button>
      </div>

      <div className={styles.propContent} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Master Bottom Nav Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', display: 'block' }}>Bottom Navigation Bar</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Sticky tab navigation on mobile viewport</span>
          </div>
          <input
            type="checkbox"
            checked={settings.showBottomNav !== false}
            onChange={(e) => updateSettings({ showBottomNav: e.target.checked })}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
        </div>

        {settings.showBottomNav !== false && (
          <>
            {/* Style Presets */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Navbar Visual Preset
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[
                  { id: 'pill', label: 'Floating Pill' },
                  { id: 'solid', label: 'Edge-to-Edge Solid' },
                  { id: 'blur', label: 'Frosted Glass' },
                  { id: 'minimal', label: 'Minimal Flat' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateSettings({ bottomNavStyle: s.id })}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: `1.5px solid ${bottomNavStyle === s.id ? '#2563eb' : '#e2e8f0'}`,
                      background: bottomNavStyle === s.id ? '#eff6ff' : '#ffffff',
                      color: bottomNavStyle === s.id ? '#1d4ed8' : '#334155',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Navbar Position
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'floating', label: 'Floating (with margin)' },
                  { id: 'docked', label: 'Docked (flush to bottom)' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => updateSettings({ bottomNavPosition: pos.id })}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: '6px',
                      border: `1.5px solid ${bottomNavPosition === pos.id ? '#2563eb' : '#e2e8f0'}`,
                      background: bottomNavPosition === pos.id ? '#eff6ff' : '#ffffff',
                      color: bottomNavPosition === pos.id ? '#1d4ed8' : '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Color */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Active Tab Accent Color
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0f172a'].map((col) => (
                  <div
                    key={col}
                    onClick={() => updateSettings({ bottomNavActiveColor: col })}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: col,
                      cursor: 'pointer',
                      border: bottomNavActiveColor === col ? '2px solid #000' : '2px solid transparent',
                      transform: bottomNavActiveColor === col ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={bottomNavActiveColor}
                  onChange={(e) => updateSettings({ bottomNavActiveColor: e.target.value })}
                  style={{ width: '26px', height: '26px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Tab Items Manager */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Navigation Tabs ({bottomNavItems.length}/5)
                </label>
                {bottomNavItems.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={13} /> Add Tab
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {bottomNavItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 8px',
                      background: '#f8fafc',
                      borderRadius: '7px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', width: '12px' }}>{idx + 1}</span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => {
                        const updated = [...bottomNavItems];
                        updated[idx] = { ...item, text: e.target.value };
                        saveBottomNavItems(updated);
                      }}
                      style={{ width: '70px', padding: '5px 6px', fontSize: '11.5px', border: '1px solid #cbd5e1', borderRadius: '5px' }}
                      placeholder="Label"
                    />
                    <select
                      value={item.icon}
                      onChange={(e) => {
                        const updated = [...bottomNavItems];
                        updated[idx] = { ...item, icon: e.target.value };
                        saveBottomNavItems(updated);
                      }}
                      style={{ padding: '5px 4px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '5px', maxWidth: '78px' }}
                    >
                      <option value="Home">Home</option>
                      <option value="ShoppingBag">Shop</option>
                      <option value="ShoppingCart">Cart</option>
                      <option value="Heart">Saved</option>
                      <option value="User">Account</option>
                      <option value="Search">Search</option>
                      <option value="Bell">Alerts</option>
                      <option value="Menu">Menu</option>
                    </select>
                    <input
                      type="text"
                      value={item.link}
                      onChange={(e) => {
                        const updated = [...bottomNavItems];
                        updated[idx] = { ...item, link: e.target.value };
                        saveBottomNavItems(updated);
                      }}
                      style={{ flex: 1, padding: '5px 6px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '5px' }}
                      placeholder="/link"
                    />
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                          title="Move up"
                        >
                          <MoveUp size={12} />
                        </button>
                      )}
                      {idx < bottomNavItems.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                          title="Move down"
                        >
                          <MoveDown size={12} />
                        </button>
                      )}
                      {bottomNavItems.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                          title="Delete tab"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Mobile Menu Drawer Animation */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
            Menu Drawer Transition
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {[
              { id: 'slide-left', label: 'Slide from Left' },
              { id: 'slide-right', label: 'Slide from Right' },
              { id: 'fullscreen', label: 'Fullscreen Modal' },
              { id: 'fade', label: 'Smooth Fade' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => updateSettings({ mobileMenuAnimation: m.id })}
                style={{
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: `1.5px solid ${mobileMenuAnimation === m.id ? '#2563eb' : '#e2e8f0'}`,
                  background: mobileMenuAnimation === m.id ? '#eff6ff' : '#ffffff',
                  color: mobileMenuAnimation === m.id ? '#1d4ed8' : '#334155',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};


// ─────────────────────────────────────────────────────────────
// 4. MOBILE WEB & PWA SIDEBAR PANEL
// ─────────────────────────────────────────────────────────────
export const MobilePwaSidebarPanel: React.FC<DesignRightPanelProps> = ({ isHidden = false }) => {
  const { settings, updateSettings } = useSiteStore();
  const { closeRightSidebar } = useLandingEditorStore();
  const [resetSuccess, setResetSuccess] = useState(false);

  const mobileStickyBuy = settings.mobileStickyBuy !== false;
  const mobileSearchMode = settings.mobileSearchMode || 'expandable';
  const mobileCartBehavior = settings.mobileCartBehavior || 'drawer';
  const mobileFontScale = settings.mobileFontScale || 100;
  const mobileSectionSpacing = settings.mobileSectionSpacing || 24;
  const appInstallBanner = settings.appInstallBanner !== false;
  const pwaAppName = settings.pwaAppName || settings.storeName || 'BillionBiz Store';
  const pwaShortName = settings.pwaShortName || 'BillionBiz';

  const handleUpdate = (updates: Record<string, any>) => {
    updateSettings(updates);
  };

  const handleReset = () => {
    updateSettings({
      mobileStickyBuy: true,
      mobileSearchMode: 'expandable',
      mobileCartBehavior: 'drawer',
      mobileFontScale: 100,
      mobileSectionSpacing: 24,
      appInstallBanner: true,
      pwaAppName: 'BillionBiz Store',
      pwaShortName: 'BillionBiz',
    });
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
      <div className={styles.panelHeader} style={{ padding: '14px 18px', gap: '14px' }}>
        <div className={styles.phLeft} style={{ gap: '8px', minWidth: 0, flexShrink: 1 }}>
          <button className={styles.iconBtn} onClick={closeRightSidebar} title="Close Panel" style={{ flexShrink: 0 }}>
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, fontSize: '15px', whiteSpace: 'nowrap' }}>
            Mobile Web &amp; PWA
          </h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: resetSuccess ? '#ecfdf5' : '#f8fafc',
            color: resetSuccess ? '#059669' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Reset to default Mobile Web & PWA settings"
        >
          {resetSuccess ? <Check size={12} /> : <RotateCcw size={12} />}
          <span>{resetSuccess ? 'Reset!' : 'Reset'}</span>
        </button>
      </div>

      <div className={styles.propContent} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Mobile Web Browser Optimizations */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '10px' }}>
            Mobile Web Optimizations
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Sticky Buy Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Sticky Mobile Buy Bar</span>
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>Persistent 1-click checkout bar at bottom of product pages</span>
              </div>
              <input
                type="checkbox"
                checked={mobileStickyBuy}
                onChange={(e) => handleUpdate({ mobileStickyBuy: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
            </div>

            {/* Search Presentation */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Mobile Search Presentation
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'expandable', label: 'Expand Icon' },
                  { id: 'fixed-bar', label: 'Sticky Bar' },
                  { id: 'modal', label: 'Overlay' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleUpdate({ mobileSearchMode: s.id })}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: '6px',
                      border: `1.5px solid ${mobileSearchMode === s.id ? '#2563eb' : '#e2e8f0'}`,
                      background: mobileSearchMode === s.id ? '#eff6ff' : '#ffffff',
                      color: mobileSearchMode === s.id ? '#1d4ed8' : '#334155',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Behavior */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Mobile Cart Action
              </label>
              <select
                value={mobileCartBehavior}
                onChange={(e) => handleUpdate({ mobileCartBehavior: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
              >
                <option value="drawer">Slide-Over Cart Drawer (Instant)</option>
                <option value="page">Redirect to Full /cart Page</option>
                <option value="popup">Toast Notification Pop-up</option>
              </select>
            </div>

            {/* Font Scaling */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Mobile Font Scale</label>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563eb' }}>{mobileFontScale}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="125"
                value={mobileFontScale}
                onChange={(e) => handleUpdate({ mobileFontScale: parseInt(e.target.value) })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Section Spacing */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Section Gap Spacing</label>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563eb' }}>{mobileSectionSpacing}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="48"
                value={mobileSectionSpacing}
                onChange={(e) => handleUpdate({ mobileSectionSpacing: parseInt(e.target.value) })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* PWA & Installation Banner */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>PWA Home Screen Setup</label>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Install App Smart Banner</span>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>Prompt mobile visitors to add store to home screen</span>
            </div>
            <input
              type="checkbox"
              checked={appInstallBanner}
              onChange={(e) => handleUpdate({ appInstallBanner: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>App Title on Home Screen</label>
            <input
              type="text"
              value={pwaAppName}
              onChange={(e) => handleUpdate({ pwaAppName: e.target.value })}
              placeholder="Store Name"
              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Icon Short Label</label>
            <input
              type="text"
              value={pwaShortName}
              onChange={(e) => handleUpdate({ pwaShortName: e.target.value })}
              placeholder="Short Name"
              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};


// ─────────────────────────────────────────────────────────────
// 5. MOBILE APP SHELL SIDEBAR PANEL
// ─────────────────────────────────────────────────────────────
export const MobileAppSidebarPanel: React.FC<DesignRightPanelProps> = ({ isHidden = false }) => {
  const { settings, updateSettings } = useSiteStore();
  const { closeRightSidebar } = useLandingEditorStore();
  const [resetSuccess, setResetSuccess] = useState(false);

  const iosSafeArea = settings.iosSafeArea !== false;
  const appSplashScreen = settings.appSplashScreen || false;
  const splashBg = settings.splashBg || '#0f172a';
  const splashDuration = settings.splashDuration || '2.0s';
  const statusBarMode = settings.statusBarMode || 'auto';
  const pullToRefresh = settings.pullToRefresh !== false;

  const handleUpdate = (updates: Record<string, any>) => {
    updateSettings(updates);
  };

  const handleReset = () => {
    updateSettings({
      iosSafeArea: true,
      appSplashScreen: false,
      splashBg: '#0f172a',
      splashDuration: '2.0s',
      statusBarMode: 'auto',
      pullToRefresh: true,
    });
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
      <div className={styles.panelHeader} style={{ padding: '14px 18px', gap: '14px' }}>
        <div className={styles.phLeft} style={{ gap: '8px', minWidth: 0, flexShrink: 1 }}>
          <button className={styles.iconBtn} onClick={closeRightSidebar} title="Close Panel" style={{ flexShrink: 0 }}>
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, fontSize: '15px', whiteSpace: 'nowrap' }}>
            Mobile App Shell
          </h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: resetSuccess ? '#ecfdf5' : '#f8fafc',
            color: resetSuccess ? '#059669' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Reset to default Mobile App Shell settings"
        >
          {resetSuccess ? <Check size={12} /> : <RotateCcw size={12} />}
          <span>{resetSuccess ? 'Reset!' : 'Reset'}</span>
        </button>
      </div>

      <div className={styles.propContent} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Native Safe Area Insets */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>iOS Safe Area Insets</span>
            <span style={{ fontSize: '10.5px', color: '#64748b' }}>Dynamic notch and home indicator padding</span>
          </div>
          <input
            type="checkbox"
            checked={iosSafeArea}
            onChange={(e) => handleUpdate({ iosSafeArea: e.target.checked })}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
        </div>

        {/* Status Bar Appearance */}
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
            Status Bar Appearance
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'auto', label: 'Auto (Adaptive)' },
              { id: 'light', label: 'Light Content' },
              { id: 'dark', label: 'Dark Content' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleUpdate({ statusBarMode: m.id })}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  borderRadius: '6px',
                  border: `1.5px solid ${statusBarMode === m.id ? '#2563eb' : '#e2e8f0'}`,
                  background: statusBarMode === m.id ? '#eff6ff' : '#ffffff',
                  color: statusBarMode === m.id ? '#1d4ed8' : '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pull to Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Pull to Refresh</span>
            <span style={{ fontSize: '10.5px', color: '#64748b' }}>Native downward swipe to reload catalog items</span>
          </div>
          <input
            type="checkbox"
            checked={pullToRefresh}
            onChange={(e) => handleUpdate({ pullToRefresh: e.target.checked })}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
        </div>

        {/* App Splash Screen */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'block' }}>App Launch Splash Screen</span>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>Show monogram splash when app opens</span>
            </div>
            <input
              type="checkbox"
              checked={appSplashScreen}
              onChange={(e) => handleUpdate({ appSplashScreen: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          {appSplashScreen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Splash Background</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={splashBg}
                    onChange={(e) => handleUpdate({ splashBg: e.target.value })}
                    style={{ width: '28px', height: '26px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '11.5px', color: '#475569' }}>{splashBg}</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Duration</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['1.5s', '2.0s', '3.0s'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleUpdate({ splashDuration: d })}
                      style={{
                        flex: 1,
                        padding: '5px',
                        borderRadius: '5px',
                        border: `1.5px solid ${splashDuration === d ? '#2563eb' : '#e2e8f0'}`,
                        background: splashDuration === d ? '#eff6ff' : '#ffffff',
                        color: splashDuration === d ? '#1d4ed8' : '#475569',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

// Aliases for compatibility
export const MobileExperienceSidebarPanel = MobileNavSidebarPanel;
export const MobileWebSidebarPanel = MobilePwaSidebarPanel;
