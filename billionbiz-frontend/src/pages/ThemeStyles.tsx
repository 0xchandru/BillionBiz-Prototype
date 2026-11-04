import { useState, useEffect } from 'react';
import { 
  Rocket, 
  RotateCcw, 
  Undo,
  Redo,
  CheckCircle2,
  Circle,
  Palette,
  Type,
  Square,
  Layout,
  Search,
  User,
  Menu,
  Droplet
} from 'lucide-react';
import { useSiteStore } from '../store/siteStore';
import { useThemeHistoryStore } from '../store/themeHistoryStore';
import { ColorPickerPopover } from '../components/editor/ui/ColorPickerPopover';
import styles from './ThemeStyles.module.css';

const tabs = ['Presets', 'Colors', 'Typography', 'UI Elements', 'Layout'];

const presets = [
  { id: 'default', name: 'Default', desc: 'Clean & Professional', 
    colors: { primary: '#198754', secondary: '#0d6efd', background: '#ffffff', text: '#0f172a', accent: '#fd7e14', border: '#e2e8f0' },
    typography: { headingFont: 'Outfit, sans-serif', bodyFont: 'Inter, sans-serif', baseSize: 16 },
    ui: { borderRadius: '8px', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', buttonHover: 'lift', glassmorphism: false }
  },
  { id: 'dark', name: 'Cyberpunk', desc: 'Sleek & Dark Mode', 
    colors: { primary: '#0ea5e9', secondary: '#f43f5e', background: '#0f172a', text: '#f8fafc', accent: '#8b5cf6', border: '#334155' },
    typography: { headingFont: 'Space Grotesk, sans-serif', bodyFont: 'Inter, sans-serif', baseSize: 15 },
    ui: { borderRadius: '0px', shadow: 'none', buttonHover: 'glow', glassmorphism: true }
  },
  { id: 'warm', name: 'Warm Minimal', desc: 'Soft & Friendly', 
    colors: { primary: '#9c6644', secondary: '#b08968', background: '#fdfbf7', text: '#4a3f35', accent: '#ddb892', border: '#e6ccb2' },
    typography: { headingFont: 'Playfair Display, serif', bodyFont: 'Lato, sans-serif', baseSize: 18 },
    ui: { borderRadius: '999px', shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', buttonHover: 'lift', glassmorphism: false }
  },
];

const ThemeStyles = () => {
  const { theme, updateTheme, undoTheme, redoTheme } = useSiteStore();
  const { canUndo, canRedo } = useThemeHistoryStore();
  const [activeTab, setActiveTab] = useState('Presets');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName?.toLowerCase();
        if (tagName === 'textarea') return;
        if (tagName === 'input') {
          const inputType = (target as HTMLInputElement).type?.toLowerCase();
          if (['text', 'password', 'search', 'email', 'url', 'number'].includes(inputType)) {
            return;
          }
        }
      }

      const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().includes('MAC');
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (!modifier) return;

      if ((e.key.toLowerCase() === 'y' && !e.shiftKey) || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
        e.preventDefault();
        useSiteStore.getState().redoTheme();
        return;
      }

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        useSiteStore.getState().undoTheme();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const themeStyles = `
    .preview-theme-wrapper {
      --theme-primary: ${theme.colors.primary};
      --theme-secondary: ${theme.colors.secondary};
      --theme-background: ${theme.colors.background};
      --theme-text: ${theme.colors.text};
      --theme-accent: ${theme.colors.accent};
      --theme-border: ${theme.colors.border};
      
      --theme-font-heading: ${theme.typography.headingFont};
      --theme-font-body: ${theme.typography.bodyFont};
      --theme-base-size: ${theme.typography.baseSize}px;
      
      --theme-radius: ${theme.ui.borderRadius};
      --theme-shadow: ${theme.ui.shadow};
      
      font-family: var(--theme-font-body);
      font-size: var(--theme-base-size);
      color: var(--theme-text);
      background-color: var(--theme-background);
    }
    
    .preview-theme-wrapper h1, 
    .preview-theme-wrapper h2, 
    .preview-theme-wrapper h3, 
    .preview-theme-wrapper h4, 
    .preview-theme-wrapper h5, 
    .preview-theme-wrapper h6 {
      font-family: var(--theme-font-heading);
    }

    .preview-glass {
      ${theme.ui.glassmorphism ? 'background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);' : ''}
    }
  `;

  return (
    <div className={styles.container}>
      <style>{themeStyles}</style>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Theme Design System</h1>
          <p className={styles.subtitle}>Customize the look and feel of your store with incredible granularity.</p>
        </div>
      </div>

      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroIconWrap}>
            <Rocket size={32} className={styles.heroIcon} />
          </div>
          <div className={styles.heroTextContent}>
            <h2 className={styles.heroTitle}>Your Brand,<br/>Unleashed</h2>
            <p className={styles.heroDesc}>
              Experience the power of real-time design tokens. Better than Shopify. Fully interactive.
            </p>
            <div className={styles.heroActions}>
              <button 
                className={styles.btnOutline} 
                onClick={undoTheme}
                disabled={!canUndo}
                style={{ opacity: canUndo ? 1 : 0.4, cursor: canUndo ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px' }}
                title={canUndo ? 'Undo theme change (Ctrl+Z)' : 'Nothing to undo'}
              >
                <Undo size={16} />
                <span>Undo</span>
              </button>
              <button 
                className={styles.btnOutline} 
                onClick={redoTheme}
                disabled={!canRedo}
                style={{ opacity: canRedo ? 1 : 0.4, cursor: canRedo ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px' }}
                title={canRedo ? 'Redo theme change (Ctrl+Y / Cmd+Shift+Z)' : 'Nothing to redo'}
              >
                <Redo size={16} />
                <span>Redo</span>
              </button>
              <button className={styles.btnOutline} onClick={() => updateTheme(presets[0], true)}>
                <RotateCcw size={16} />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.contentArea}>
          <div className={styles.tabsWrapper}>
            <ul className={styles.tabs}>
              {tabs.map((tab) => (
                <li 
                  key={tab} 
                  className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            {activeTab === 'Presets' && (
              <>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>1-Click Design Systems</h3>
                    <p className={styles.sectionDesc}>Instantly completely revamp your store's aesthetic.</p>
                  </div>
                </div>
                
                <div className={styles.presetsGrid}>
                  {presets.map(preset => {
                    const isActive = theme.colors.primary === preset.colors.primary && theme.colors.background === preset.colors.background;
                    return (
                      <div 
                        key={preset.id} 
                        className={`${styles.presetCard} ${isActive ? styles.activePresetCard : ''} ${preset.colors.background === '#0f172a' ? styles.darkPresetCard : ''}`}
                        onClick={() => updateTheme(preset)}
                      >
                        <div className={styles.presetHeader}>
                          <div>
                            <h4 className={styles.presetName}>{preset.name}</h4>
                            <p className={styles.presetDesc}>{preset.desc}</p>
                          </div>
                          {isActive ? <CheckCircle2 size={20} className={styles.checkIcon} /> : <Circle size={20} className={styles.circleIcon} />}
                        </div>
                        <div className={styles.presetPreview}>
                          <span className={styles.presetFontSample} style={{color: preset.colors.primary, fontFamily: preset.typography.headingFont}}>Aa</span>
                          <div className={styles.presetColors}>
                            {Object.values(preset.colors).slice(0,5).map((c, i) => (
                              <div key={i} className={styles.presetColorDot} style={{backgroundColor: c}}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'Colors' && (
              <>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>Global Colors</h3>
                    <p className={styles.sectionDesc}>Map colors to specific semantic tokens.</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {Object.entries(theme.colors).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-bg-card)' }}>
                      <span style={{ fontSize: '14px', textTransform: 'capitalize', fontWeight: 600 }}>{key}</span>
                      <ColorPickerPopover 
                        value={value} 
                        onChange={(newVal) => updateTheme({ colors: { ...theme.colors, [key]: newVal } })}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'Typography' && (
              <>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>Typography</h3>
                    <p className={styles.sectionDesc}>Customize the fonts and scale of your content.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ padding: '24px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-bg-card)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Heading Font</label>
                    <select 
                      value={theme.typography.headingFont}
                      onChange={(e) => updateTheme({ typography: { ...theme.typography, headingFont: e.target.value } })}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                    >
                      <option value="Outfit, sans-serif">Outfit</option>
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Playfair Display, serif">Playfair Display</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Space Grotesk, sans-serif">Space Grotesk</option>
                    </select>
                  </div>
                  <div style={{ padding: '24px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-bg-card)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Body Font</label>
                    <select 
                      value={theme.typography.bodyFont}
                      onChange={(e) => updateTheme({ typography: { ...theme.typography, bodyFont: e.target.value } })}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Lato, sans-serif">Lato</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                    </select>
                  </div>
                  <div style={{ padding: '24px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-bg-card)' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 600 }}>
                      <span>Base Font Size</span>
                      <span style={{ color: 'var(--color-primary-dark)' }}>{theme.typography.baseSize}px</span>
                    </label>
                    <input 
                      type="range" min="12" max="24" step="1" 
                      value={theme.typography.baseSize}
                      onChange={(e) => updateTheme({ typography: { ...theme.typography, baseSize: parseInt(e.target.value) } })}
                      style={{ width: '100%', accentColor: 'var(--color-primary-dark)' }}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'UI Elements' && (
              <>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>UI Elements & Effects</h3>
                    <p className={styles.sectionDesc}>Fine-tune borders, shadows, and unique modern effects.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ padding: '24px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-bg-card)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Border Radius</label>
                    <select 
                      value={theme.ui.borderRadius}
                      onChange={(e) => updateTheme({ ui: { ...theme.ui, borderRadius: e.target.value } })}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                    >
                      <option value="0px">Sharp (0px)</option>
                      <option value="4px">Slight (4px)</option>
                      <option value="8px">Rounded (8px)</option>
                      <option value="16px">Extra Rounded (16px)</option>
                      <option value="24px">Soft (24px)</option>
                      <option value="999px">Pill (999px)</option>
                    </select>
                  </div>
                  <div style={{ padding: '24px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-bg-card)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Drop Shadows</label>
                    <select 
                      value={theme.ui.shadow}
                      onChange={(e) => updateTheme({ ui: { ...theme.ui, shadow: e.target.value } })}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                    >
                      <option value="none">None</option>
                      <option value="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)">Soft</option>
                      <option value="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)">Medium</option>
                      <option value="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)">Large</option>
                      <option value="0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)">Extra Large</option>
                    </select>
                  </div>
                  <div style={{ padding: '24px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Droplet size={16} /> Glassmorphism</h4>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Apply a modern frosted glass effect to overlay components.</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={theme.ui.glassmorphism} 
                        onChange={(e) => updateTheme({ ui: { ...theme.ui, glassmorphism: e.target.checked } })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{ 
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                        backgroundColor: theme.ui.glassmorphism ? 'var(--color-primary-dark)' : '#cbd5e1', 
                        transition: '.4s', borderRadius: '24px' 
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                          transform: theme.ui.glassmorphism ? 'translateX(24px)' : 'none'
                        }}></span>
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Layout' && (
              <>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>Layout</h3>
                    <p className={styles.sectionDesc}>Manage global container widths.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ padding: '24px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-bg-card)' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 600 }}>
                      <span>Max Content Width</span>
                      <span style={{ color: 'var(--color-primary-dark)' }}>{theme.layout.maxWidth}px</span>
                    </label>
                    <input 
                      type="range" min="800" max="1600" step="100" 
                      value={theme.layout.maxWidth}
                      onChange={(e) => updateTheme({ layout: { ...theme.layout, maxWidth: parseInt(e.target.value) } })}
                      style={{ width: '100%', accentColor: 'var(--color-primary-dark)' }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarHeader}>
              <h3>Live Preview</h3>
              <p>See how your changes look instantly.</p>
            </div>
            
            <div className={`preview-theme-wrapper`} style={{
              border: `1px solid var(--theme-border)`,
              borderRadius: 'var(--theme-radius)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '300px',
              backgroundColor: 'var(--theme-background)',
              color: 'var(--theme-text)',
              boxShadow: 'var(--theme-shadow)',
              position: 'relative'
            }}>
              <div style={{
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid var(--theme-border)`,
                backgroundColor: theme.ui.glassmorphism ? 'transparent' : 'var(--theme-background)',
                zIndex: 2,
                position: 'relative'
              }} className="preview-glass">
                <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--theme-font-heading)' }}>BillionBiz</span>
                <div style={{ display: 'flex', gap: '12px', opacity: 0.8 }}>
                  <Search size={14} />
                  <User size={14} />
                  <Menu size={14} />
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '24px',
                gap: '16px',
                alignItems: 'flex-start',
                justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  right: '-10%',
                  bottom: '-20%',
                  width: '200px',
                  height: '200px',
                  backgroundColor: 'var(--theme-secondary)',
                  borderRadius: 'var(--theme-radius)',
                  opacity: 0.15,
                  zIndex: 0
                }}></div>
                <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ 
                    backgroundColor: 'var(--theme-secondary)', 
                    color: 'var(--theme-background)', 
                    padding: '4px 8px', 
                    fontSize: '10px', 
                    borderRadius: '999px',
                    fontWeight: 600,
                    width: 'fit-content'
                  }}>
                    New Features
                  </span>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1.1, fontFamily: 'var(--theme-font-heading)' }}>
                    Elevate your<br/>business growth
                  </h3>
                  <p style={{ fontSize: '12px', opacity: 0.7, maxWidth: '200px' }}>
                    Discover the tools that empower professionals.
                  </p>
                  <button style={{
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--theme-background)',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 'var(--theme-radius)',
                    fontFamily: 'var(--theme-font-body)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px',
                    boxShadow: 'var(--theme-shadow)'
                  }}>
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarHeader}>
              <h3>Theme Summary</h3>
              <p>Current configuration active globally.</p>
            </div>
            <div className={styles.summaryList}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}><Palette size={14}/> Primary</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px' }}>{theme.colors.primary}</span>
                  <div style={{ width: '16px', height: '16px', backgroundColor: theme.colors.primary, borderRadius: '4px', border: '1px solid var(--theme-border)' }}></div>
                </div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}><Type size={14}/> Font</div>
                <span className={styles.summaryValue} style={{ fontSize: '12px' }}>{theme.typography.headingFont.split(',')[0]}</span>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}><Square size={14}/> Radius</div>
                <span className={styles.summaryValue} style={{ fontSize: '12px' }}>{theme.ui.borderRadius}</span>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}><Layout size={14}/> Width</div>
                <span className={styles.summaryValue} style={{ fontSize: '12px' }}>{theme.layout.maxWidth}px</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ThemeStyles;
