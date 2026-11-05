import { useEffect, useState } from 'react';
import { Check, Monitor, Smartphone, Tablet, WandSparkles } from 'lucide-react';
import { themePresets } from '../components/editor/theme/themePresets';
import { WebsitePreview } from '../components/editor/WebsitePreview';
import { useSiteStore } from '../store/siteStore';
import styles from './ThemeLibraryPage.module.css';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const PRESET_DETAILS: Record<string, { label: string; description: string }> = {
  Modern: { label: 'Modern', description: 'Clean product storytelling with crisp contrast.' },
  Minimal: { label: 'Minimal', description: 'Quiet surfaces, generous space, and refined type.' },
  Warm: { label: 'Warm', description: 'Soft neutrals and a welcoming editorial feel.' },
  Bold: { label: 'Bold', description: 'High contrast colors for energetic brands.' },
};

export default function ThemeLibraryPage() {
  const { theme, updateTheme, saveThemeToBackend, fetchLiveStoreData, isLoading } = useSiteStore();
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const presets = Object.entries(themePresets);

  useEffect(() => { void fetchLiveStoreData(); }, [fetchLiveStoreData]);

  const applyTheme = async (id: string) => {
    const preset = themePresets[id];
    if (!preset) return;
    setPendingId(id);
    setMessage('');
    setError('');
    const nextTheme = { ...preset, presetName: id, schemaVersion: 1 as const };
    updateTheme(nextTheme, true);
    try {
      await saveThemeToBackend(nextTheme);
      setMessage(`${PRESET_DETAILS[id]?.label || id} is now applied to your store.`);
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : 'Unable to save this theme. Try again.');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <main style={{ minHeight: '100%', padding: '28px clamp(16px, 3vw, 40px)', background: '#f8fafc' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: 26, fontWeight: 750 }}>Store themes</h1>
          <p style={{ margin: '7px 0 0', color: '#64748b', fontSize: 14 }}>Preview every page with your real store data, then apply a consistent visual system.</p>
        </div>
        <div aria-label="Preview size" style={{ display: 'flex', gap: 4, padding: 4, border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff' }}>
          {([
            ['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone],
          ] as const).map(([mode, Icon]) => (
            <button key={mode} type="button" onClick={() => setDevice(mode)} aria-pressed={device === mode} title={`${mode} preview`} style={{ width: 36, height: 34, display: 'grid', placeItems: 'center', border: 0, borderRadius: 7, background: device === mode ? '#e0e7ff' : 'transparent', color: device === mode ? '#4338ca' : '#64748b', cursor: 'pointer' }}>
              <Icon size={17} />
            </button>
          ))}
        </div>
      </header>

      {message && <div role="status" style={{ marginBottom: 16, padding: '10px 13px', borderRadius: 9, background: '#ecfdf5', color: '#047857', fontSize: 13 }}>{message}</div>}
      {error && <div role="alert" style={{ marginBottom: 16, padding: '10px 13px', borderRadius: 9, background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>{error}</div>}

      <div className={styles.layout}>
        <section aria-label="Theme library" style={{ display: 'grid', gap: 12 }}>
          {presets.map(([id, preset]) => {
            const selected = !isLoading && theme.presetName === id;
            const details = PRESET_DETAILS[id] || { label: id, description: preset.description };
            const colors = [preset.palette.brand.primary, preset.palette.brand.secondary, preset.palette.brand.accent, preset.palette.background.background, preset.palette.text.heading];
            return (
              <article key={id} style={{ padding: 14, border: `1px solid ${selected ? '#6366f1' : '#e2e8f0'}`, borderRadius: 13, background: '#fff', boxShadow: selected ? '0 0 0 2px rgba(99,102,241,.12)' : '0 1px 2px rgba(15,23,42,.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>{details.label}</h2>
                    <p style={{ margin: '5px 0 10px', color: '#64748b', fontSize: 12, lineHeight: 1.45 }}>{details.description}</p>
                  </div>
                  {selected && <Check aria-label="Applied" size={17} color="#4f46e5" />}
                </div>
                <div aria-label="Theme colors" style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
                  {colors.map((color, index) => <span key={`${color}-${index}`} style={{ width: 23, height: 23, borderRadius: 7, background: color, border: '1px solid rgba(15,23,42,.1)' }} />)}
                  <span style={{ alignSelf: 'center', marginLeft: 5, color: '#475569', fontFamily: preset.typography.headingFont, fontSize: 17, fontWeight: 700 }}>Aa</span>
                </div>
                <button type="button" disabled={isLoading || pendingId !== null || selected} onClick={() => void applyTheme(id)} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, border: 0, borderRadius: 8, padding: '9px 12px', background: selected ? '#eef2ff' : '#111827', color: selected ? '#4338ca' : '#fff', fontSize: 12, fontWeight: 700, cursor: isLoading || pendingId !== null || selected ? 'default' : 'pointer', opacity: pendingId && pendingId !== id ? .55 : 1 }}>
                  <WandSparkles size={14} />{pendingId === id ? 'Applying…' : selected ? 'Current theme' : 'Apply theme'}
                </button>
              </article>
            );
          })}
          <p style={{ margin: '2px 3px', color: '#64748b', fontSize: 11, lineHeight: 1.5 }}>Themes update global colors, typography, buttons, spacing, and surface styling. Your page content and section order stay in place.</p>
        </section>

        <section aria-label="Live full-store preview" style={{ minWidth: 0, border: '1px solid #e2e8f0', borderRadius: 14, background: '#fff', padding: 14, boxShadow: '0 8px 24px rgba(15,23,42,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div><h2 style={{ margin: 0, color: '#0f172a', fontSize: 14 }}>Live store preview</h2><p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 11 }}>Uses your current store pages and catalog.</p></div>
            <span style={{ whiteSpace: 'nowrap', color: '#475569', fontSize: 11 }}>{device[0].toUpperCase() + device.slice(1)}</span>
          </div>
          <div style={{ minHeight: 600, maxHeight: 'calc(100vh - 210px)', overflow: 'auto', borderRadius: 9, background: '#f1f5f9', padding: 12 }}>
            <WebsitePreview overrideDevice={device} style={{ minHeight: 580, alignItems: 'flex-start' }} />
          </div>
        </section>
      </div>
    </main>
  );
}
