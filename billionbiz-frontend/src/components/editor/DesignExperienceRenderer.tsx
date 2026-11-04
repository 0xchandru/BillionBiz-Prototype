import React, { useState } from 'react';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore } from '../../store/siteStore';
import { ThemesPanel } from './theme/panels/ThemesPanel';
import { ColorPalettePanel } from './theme/panels/ColorPalettePanel';
import { TypographyPanel } from './theme/panels/TypographyPanel';
import { ButtonsPanel } from './theme/panels/ButtonsPanel';
import { EffectsPanel } from './theme/panels/EffectsPanel';
import { CustomCssPanel } from './theme/panels/CustomCssPanel';
import styles from '../../pages/editor/EditorLayout.module.css';
import { 
  Eye, Smartphone, Layers, Check, RefreshCw, 
  Home, ShoppingBag, ShoppingCart, Heart, User, Search, Bell, Menu, Plus, Trash2, Globe 
} from 'lucide-react';

export const DesignExperienceRenderer: React.FC = () => {
  const { designSection } = useLandingEditorStore();

  if (designSection === 'loader') {
    return <LoaderView />;
  }

  if (designSection === 'mobile' || designSection === 'mobile-web' || designSection === 'mobile-app') {
    return <MobileExperienceView />;
  }

  // Theme section — render the appropriate theme panel in the canvas
  return <ThemeCanvasView />;
};// ─── THEME CANVAS VIEW ───
const ThemeCanvasView: React.FC = () => {
  const { selectedThemeCategory } = useLandingEditorStore();
  const { pages, updatePageProps } = useSiteStore();
  const [resetSuccess, setResetSuccess] = useState(false);

  // Helper to count localized section overrides across pages
  const overriddenSectionsCount = pages.reduce((acc, p) => {
    return acc + (p.sections || []).filter(s => 
      s.props?.bgColor || s.props?.backgroundColor || s.props?.textColor || s.props?.themeOverride
    ).length;
  }, 0);

  const handleResetOverrides = () => {
    // Clear local color/style overrides on all sections of pages
    pages.forEach(p => {
      const updated = (p.sections || []).map(s => {
        const nextProps = { ...s.props };
        delete nextProps.bgColor;
        delete nextProps.backgroundColor;
        delete nextProps.textColor;
        delete nextProps.themeOverride;
        return { ...s, props: nextProps };
      });
      updatePageProps(p.id, { sections: updated });
    });
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>Design & Experience — Theme</h2>
          <p>Customize your global design system tokens, typography, button variants, and color palettes.</p>
        </div>

        {/* Global vs Section Override Notice */}
        <div style={{
          margin: '0 24px 20px',
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
          border: '1px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Global Theme vs Section Overrides</span>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  Active System
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#14532d', maxWidth: '580px', lineHeight: 1.4 }}>
                Theme changes automatically cascade to all pages and sections. Custom colors or styles modified on an individual section take priority as <strong>manual overrides</strong> and are preserved when changing themes.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {overriddenSectionsCount > 0 && (
              <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 600, background: '#ffffffcc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                {overriddenSectionsCount} section{overriddenSectionsCount > 1 ? 's' : ''} with overrides
              </span>
            )}
            <button
              onClick={handleResetOverrides}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: resetSuccess ? '#16a34a' : '#ffffff',
                color: resetSuccess ? '#ffffff' : '#15803d',
                border: '1px solid #86efac',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              title="Reverts any custom section styles so all sections inherit 100% from the global theme"
            >
              {resetSuccess ? <Check size={14} /> : <RefreshCw size={14} />}
              <span>{resetSuccess ? 'Overrides Reset!' : 'Reset All Overrides'}</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '0 24px 24px', maxWidth: '850px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            {selectedThemeCategory === 'themes' && <ThemesPanel />}
            {selectedThemeCategory === 'colors' && <ColorPalettePanel />}
            {selectedThemeCategory === 'typography' && <TypographyPanel />}
            {selectedThemeCategory === 'buttons' && <ButtonsPanel />}
            {selectedThemeCategory === 'effects' && <EffectsPanel />}
            {selectedThemeCategory === 'custom-css' && <CustomCssPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── LOADER VIEW ───
const LoaderView: React.FC = () => {
  const { settings, updateSettings } = useSiteStore();
  const [previewKey, setPreviewKey] = useState(0);

  const loaderStyle = settings.loaderStyle || 'spinner';
  const loaderSize = settings.loaderSize || 'medium';
  const loaderBg = settings.loaderBg || 'blur';
  const loaderCustomBg = settings.loaderCustomBg || '#ffffff';
  const loaderShowText = settings.loaderShowText !== false;
  const loaderText = settings.loaderLoadingText || 'Loading...';
  const loaderShowLogo = settings.loaderShowLogo || false;

  const handleUpdate = (updates: Record<string, any>) => {
    updateSettings(updates);
    setPreviewKey(k => k + 1);
  };

  // Loader animation styles
  const sizeMap = { small: '24px', medium: '40px', large: '56px' };
  const spinnerSize = sizeMap[loaderSize as keyof typeof sizeMap] || '40px';

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>Design & Experience — Loader Animation</h2>
          <p>Customize the branded loading transition displayed while customer pages are rendering.</p>
        </div>

        <div className={styles.scGrid}>
          {/* Live Preview Card */}
          <div className={styles.scCardFull}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}><Eye size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />Live Loader Preview</h3>
              <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>Real-time simulator</span>
            </div>
            <div key={previewKey} style={{
              height: '220px', borderRadius: '12px', border: '1px solid #e2e8f0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px',
              background: loaderBg === 'transparent' ? 'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 50% / 16px 16px' :
                          loaderBg === 'solid' ? loaderCustomBg :
                          'rgba(255,255,255,0.85)',
              backdropFilter: loaderBg === 'blur' ? 'blur(10px)' : 'none',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.03)',
              position: 'relative', overflow: 'hidden',
            }}>
              {loaderShowLogo && (
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '18px', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                  B
                </div>
              )}

              {/* Dynamic Loader Animation styles */}
              {loaderStyle === 'spinner' && (
                <div style={{
                  width: spinnerSize, height: spinnerSize,
                  border: `3px solid #e2e8f0`,
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              )}

              {loaderStyle === 'dots' && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', animation: 'pulse 1s infinite 0s' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', animation: 'pulse 1s infinite 0.2s' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', animation: 'pulse 1s infinite 0.4s' }} />
                </div>
              )}

              {loaderStyle === 'pulse' && (
                <div style={{
                  width: spinnerSize, height: spinnerSize,
                  borderRadius: '50%',
                  background: 'rgba(37, 99, 235, 0.2)',
                  border: '2px solid #2563eb',
                  animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite'
                }} />
              )}

              {loaderStyle === 'progress' && (
                <div style={{ width: '140px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, #2563eb, #3b82f6)', borderRadius: '999px', animation: 'indeterminate 1.5s infinite ease-in-out' }} />
                </div>
              )}

              {loaderShowText && (
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600, letterSpacing: '0.01em' }}>{loaderText}</span>
              )}
            </div>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
              @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
              @keyframes ping { 75%, 100% { transform: scale(1.6); opacity: 0; } }
              @keyframes indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
            `}</style>
          </div>

          <div className={styles.scCol}>
            {/* Loader Style Selector */}
            <div className={styles.scCard}>
              <h3>Loader Style Preset</h3>
              <p>Choose the visual animation style</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '12px' }}>
                {[
                  { id: 'spinner', label: 'Circular Spinner' },
                  { id: 'dots', label: 'Three Dots Wave' },
                  { id: 'pulse', label: 'Pulse Radar' },
                  { id: 'progress', label: 'Progress Bar' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleUpdate({ loaderStyle: s.id })}
                    style={{
                      padding: '10px 12px', borderRadius: '8px',
                      border: `1.5px solid ${loaderStyle === s.id ? '#2563eb' : '#e2e8f0'}`,
                      background: loaderStyle === s.id ? '#eff6ff' : '#ffffff',
                      color: loaderStyle === s.id ? '#1d4ed8' : '#334155',
                      cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Style */}
            <div className={styles.scCard} style={{ marginTop: '16px' }}>
              <h3>Background Backdrop</h3>
              <p>Screen overlay background while loading</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {[
                  { id: 'blur', label: 'Frosted Glass (Blur)' },
                  { id: 'solid', label: 'Solid Color' },
                  { id: 'transparent', label: 'Transparent' },
                ].map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => handleUpdate({ loaderBg: bg.id })}
                    style={{
                      flex: 1,
                      padding: '8px 10px', borderRadius: '7px',
                      border: `1.5px solid ${loaderBg === bg.id ? '#2563eb' : '#e2e8f0'}`,
                      background: loaderBg === bg.id ? '#eff6ff' : '#ffffff',
                      color: loaderBg === bg.id ? '#1d4ed8' : '#475569',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    }}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
              {loaderBg === 'solid' && (
                <div className={styles.scFormGroup} style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>Solid Color:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="color" value={loaderCustomBg} onChange={(e) => handleUpdate({ loaderCustomBg: e.target.value })} style={{ width: '36px', height: '32px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }} />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{loaderCustomBg}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.scCol}>
            {/* Size */}
            <div className={styles.scCard}>
              <h3>Animation Size</h3>
              <p>Scale of the spinner or icon</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {[
                  { id: 'small', label: 'Small (24px)' },
                  { id: 'medium', label: 'Medium (40px)' },
                  { id: 'large', label: 'Large (56px)' },
                ].map(size => (
                  <button
                    key={size.id}
                    onClick={() => handleUpdate({ loaderSize: size.id })}
                    style={{
                      flex: 1, padding: '9px 6px', borderRadius: '8px',
                      border: `1.5px solid ${loaderSize === size.id ? '#2563eb' : '#e2e8f0'}`,
                      background: loaderSize === size.id ? '#eff6ff' : '#ffffff',
                      color: loaderSize === size.id ? '#1d4ed8' : '#475569',
                      cursor: 'pointer', fontSize: '11.5px', fontWeight: 600,
                    }}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Details */}
            <div className={styles.scCard} style={{ marginTop: '16px' }}>
              <h3>Loader Content</h3>
              <p>Optional text and branding on loading screen</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>Show Loading Text</span>
                  <input type="checkbox" checked={loaderShowText} onChange={(e) => handleUpdate({ loaderShowText: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                </div>
                {loaderShowText && (
                  <div className={styles.scFormGroup}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Custom Message</label>
                    <input type="text" value={loaderText} onChange={(e) => handleUpdate({ loaderLoadingText: e.target.value })} placeholder="Loading your store..." />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block' }}>Display Brand Logo</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Show monogram above animation</span>
                  </div>
                  <input type="checkbox" checked={loaderShowLogo} onChange={(e) => handleUpdate({ loaderShowLogo: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MOBILE EXPERIENCE VIEW (Unified Mobile Web & Native App Experience) ───
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

const MobileExperienceView: React.FC = () => {
  const { settings, updateSettings } = useSiteStore();
  const [activeTab, setActiveTab] = useState<'web' | 'app'>('web');
  const [activeNavTab, setActiveNavTab] = useState('Home');

  const bottomNavItems: BottomNavItem[] = settings.bottomNavLinks && settings.bottomNavLinks.length > 0 
    ? settings.bottomNavLinks 
    : DEFAULT_BOTTOM_NAV;

  const bottomNavStyle = settings.bottomNavStyle || 'pill';
  const bottomNavPosition = settings.bottomNavPosition || 'floating';
  const bottomNavActiveColor = settings.bottomNavActiveColor || '#2563eb';
  const mobileSearchMode = settings.mobileSearchMode || 'expandable';
  const mobileStickyBuy = settings.mobileStickyBuy !== false;
  const mobileMenuAnimation = settings.mobileMenuAnimation || 'slide-left';
  const appInstallBanner = settings.appInstallBanner !== false;
  const iosSafeArea = settings.iosSafeArea !== false;
  const appSplashScreen = settings.appSplashScreen || false;

  const saveBottomNavItems = (items: BottomNavItem[]) => {
    updateSettings({ bottomNavLinks: items });
  };

  const handleAddItem = () => {
    if (bottomNavItems.length >= 5) return;
    const newItem: BottomNavItem = {
      id: Date.now().toString(),
      icon: 'Search',
      text: 'Search',
      link: '/search'
    };
    saveBottomNavItems([...bottomNavItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    saveBottomNavItems(bottomNavItems.filter(item => item.id !== id));
  };

  const renderIcon = (iconName: string, size = 16) => {
    switch (iconName.toLowerCase()) {
      case 'home': return <Home size={size} />;
      case 'shoppingbag':
      case 'shop': return <ShoppingBag size={size} />;
      case 'shoppingcart':
      case 'cart': return <ShoppingCart size={size} />;
      case 'heart':
      case 'wishlist': return <Heart size={size} />;
      case 'user':
      case 'account': return <User size={size} />;
      case 'search': return <Search size={size} />;
      case 'bell': return <Bell size={size} />;
      default: return <Menu size={size} />;
    }
  };

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>Mobile Experience — Mobile Web &amp; App</h2>
          <p>Configure sticky bottom navigation bar, mobile web browser viewports, responsive optimizations, and PWA mobile shell.</p>
        </div>

        <div className={styles.scGrid}>
          {/* Left Column: Interactive Mobile Mockup */}
          <div className={styles.scCol}>
            <div className={styles.scCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Preview Mode Switcher */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                  <button
                    onClick={() => setActiveTab('web')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: activeTab === 'web' ? '#ffffff' : 'transparent',
                      color: activeTab === 'web' ? '#0f172a' : '#64748b',
                      boxShadow: activeTab === 'web' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Globe size={13} /> Mobile Web
                  </button>
                  <button
                    onClick={() => setActiveTab('app')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: activeTab === 'app' ? '#ffffff' : 'transparent',
                      color: activeTab === 'app' ? '#0f172a' : '#64748b',
                      boxShadow: activeTab === 'app' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Smartphone size={13} /> Mobile App Shell
                  </button>
                </div>

                <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', background: '#ecfdf5', padding: '3px 8px', borderRadius: '12px' }}>
                  Live Interactive
                </span>
              </div>

              {/* Smartphone Shell Frame */}
              <div style={{
                width: '280px',
                height: '500px',
                borderRadius: '36px',
                border: '9px solid #1e293b',
                background: '#f8fafc',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Dynamic island / Notch for App mode */}
                {activeTab === 'app' && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '84px',
                    height: '18px',
                    background: '#0f172a',
                    borderRadius: '12px',
                    zIndex: 15
                  }} />
                )}

                {/* Status Bar */}
                <div style={{
                  height: activeTab === 'app' ? '44px' : 'auto',
                  background: '#ffffff',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: activeTab === 'app' ? '16px 14px 4px' : '10px 14px 8px',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>9:41</span>
                    <span>5G • 100%</span>
                  </div>

                  {/* Browser URL Bar if Web mode */}
                  {activeTab === 'web' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f1f5f9',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      color: '#475569',
                      fontWeight: 500,
                      gap: '4px'
                    }}>
                      <span style={{ color: '#16a34a' }}>🔒</span>
                      <span>store.billionbiz.com</span>
                    </div>
                  )}
                </div>

                {/* Mobile Header */}
                <div style={{
                  padding: '8px 12px',
                  background: '#ffffff',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Menu size={16} color="#334155" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>BillionBiz</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={14} color="#64748b" />
                    <div style={{ position: 'relative' }}>
                      <ShoppingCart size={14} color="#64748b" />
                      <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#2563eb', color: '#fff', fontSize: '8px', fontWeight: 700, borderRadius: '999px', padding: '1px 3px' }}>2</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Scrollable Viewport */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeTab === 'app' && appInstallBanner && (
                    <div style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>B</div>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#1e40af' }}>Install BillionBiz App</span>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#2563eb' }}>GET</span>
                    </div>
                  )}

                  {/* Mobile Hero Banner */}
                  <div style={{
                    height: '95px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                    padding: '12px',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                  }}>
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>Mobile Collection</span>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>Exclusive Drops 40% OFF</span>
                  </div>

                  {/* Product Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {[1, 2].map((i) => (
                      <div key={i} style={{ borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ height: '56px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag size={18} color="#94a3b8" />
                        </div>
                        <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#1e293b' }}>Product #{i}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb' }}>$49.00</span>
                          <span style={{ fontSize: '8.5px', padding: '1px 4px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#64748b' }}>+Add</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sticky Fast Checkout in Web mode preview */}
                  {activeTab === 'web' && mobileStickyBuy && (
                    <div style={{
                      padding: '8px 10px',
                      background: '#1e293b',
                      borderRadius: '8px',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '4px'
                    }}>
                      <span style={{ fontSize: '10px', fontWeight: 600 }}>⚡ Instant Checkout</span>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, background: '#2563eb', padding: '3px 7px', borderRadius: '5px' }}>Buy Now</span>
                    </div>
                  )}
                </div>

                {/* UNIFIED BOTTOM NAVBAR (Active on both Mobile Web & App) */}
                {settings.showBottomNav !== false && (
                  <div style={{
                    padding: bottomNavPosition === 'floating' ? '0 10px 10px' : '0',
                    width: '100%',
                    boxSizing: 'border-box',
                    zIndex: 20
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      padding: '7px 4px',
                      background: bottomNavStyle === 'blur' ? 'rgba(255, 255, 255, 0.88)' : '#ffffff',
                      backdropFilter: bottomNavStyle === 'blur' ? 'blur(12px)' : 'none',
                      borderRadius: bottomNavStyle === 'pill' ? '24px' : '0',
                      border: bottomNavStyle === 'pill' ? '1px solid #cbd5e1' : 'none',
                      borderTop: bottomNavStyle !== 'pill' ? '1px solid #e2e8f0' : 'none',
                      boxShadow: bottomNavStyle === 'pill' ? '0 10px 20px -5px rgba(0,0,0,0.15)' : '0 -2px 10px rgba(0,0,0,0.03)',
                    }}>
                      {bottomNavItems.map(item => {
                        const isSelected = activeNavTab === item.text;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveNavTab(item.text)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 6px',
                              color: isSelected ? bottomNavActiveColor : '#94a3b8',
                              position: 'relative',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ position: 'relative' }}>
                              {renderIcon(item.icon, 16)}
                              {item.badge && (
                                <span style={{
                                  position: 'absolute',
                                  top: '-4px',
                                  right: '-6px',
                                  background: '#ef4444',
                                  color: '#fff',
                                  fontSize: '8px',
                                  fontWeight: 700,
                                  borderRadius: '999px',
                                  padding: '1px 3px',
                                  minWidth: '10px',
                                  textAlign: 'center'
                                }}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '9px', fontWeight: isSelected ? 700 : 500, letterSpacing: '-0.01em' }}>
                              {item.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Mobile Configuration Controls */}
          <div className={styles.scCol}>
            {/* Card 1: Bottom Navigation Bar */}
            <div className={styles.scCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block' }}>Bottom Navigation Bar</span>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>Active on both Mobile Web and Mobile App Shell</span>
                </div>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={settings.showBottomNav !== false}
                  onChange={(e) => updateSettings({ showBottomNav: e.target.checked })}
                />
              </div>

              {settings.showBottomNav !== false && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Navbar Style Preset</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                      {[
                        { id: 'pill', label: 'Floating Pill' },
                        { id: 'solid', label: 'Edge-to-Edge Solid' },
                        { id: 'blur', label: 'Frosted Glass' },
                        { id: 'minimal', label: 'Minimal Flat' }
                      ].map(s => (
                        <button
                          key={s.id}
                          onClick={() => updateSettings({ bottomNavStyle: s.id })}
                          style={{
                            padding: '8px', borderRadius: '6px',
                            border: `1.5px solid ${bottomNavStyle === s.id ? '#2563eb' : '#e2e8f0'}`,
                            background: bottomNavStyle === s.id ? '#eff6ff' : '#ffffff',
                            color: bottomNavStyle === s.id ? '#1d4ed8' : '#334155',
                            fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'center'
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, margin: 0 }}>Navigation Tabs ({bottomNavItems.length}/5)</label>
                      {bottomNavItems.length < 5 && (
                        <button
                          onClick={handleAddItem}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <Plus size={12} /> Add Tab
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {bottomNavItems.map((item, idx) => (
                        <div
                          key={item.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        >
                          <select
                            value={item.icon}
                            onChange={(e) => {
                              const next = [...bottomNavItems];
                              next[idx].icon = e.target.value;
                              saveBottomNavItems(next);
                            }}
                            style={{ padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', fontWeight: 600 }}
                          >
                            <option value="Home">Home</option>
                            <option value="ShoppingBag">Shop</option>
                            <option value="ShoppingCart">Cart</option>
                            <option value="Heart">Wishlist</option>
                            <option value="User">Account</option>
                            <option value="Search">Search</option>
                            <option value="Bell">Alerts</option>
                          </select>

                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => {
                              const next = [...bottomNavItems];
                              next[idx].text = e.target.value;
                              saveBottomNavItems(next);
                            }}
                            placeholder="Label"
                            style={{ width: '70px', padding: '5px 8px', fontSize: '11.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />

                          <input
                            type="text"
                            value={item.link}
                            onChange={(e) => {
                              const next = [...bottomNavItems];
                              next[idx].link = e.target.value;
                              saveBottomNavItems(next);
                            }}
                            placeholder="/destination"
                            style={{ flex: 1, padding: '5px 8px', fontSize: '11.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />

                          {bottomNavItems.length > 2 && (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              style={{ padding: '5px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              title="Delete tab"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Card 2: Mobile Web & Responsive Experience */}
            <div className={styles.scCard} style={{ marginTop: '16px' }}>
              <h3>Mobile Web Browser Optimizations</h3>
              <p>Tailor responsive rendering, sticky actions, and mobile drawer transitions</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Sticky Mobile Buy Bar</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Persistent 1-click checkout bar at bottom of product pages</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mobileStickyBuy}
                    onChange={(e) => updateSettings({ mobileStickyBuy: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                <div className={styles.scFormGroup}>
                  <label>Mobile Search Presentation</label>
                  <select
                    value={mobileSearchMode}
                    onChange={(e) => updateSettings({ mobileSearchMode: e.target.value })}
                  >
                    <option value="expandable">Expandable Search Icon in Header</option>
                    <option value="overlay">Full-Screen Search Overlay</option>
                    <option value="persistent">Always-Visible Search Bar Under Header</option>
                  </select>
                </div>

                <div className={styles.scFormGroup}>
                  <label>Mobile Menu Drawer Animation</label>
                  <select
                    value={mobileMenuAnimation}
                    onChange={(e) => updateSettings({ mobileMenuAnimation: e.target.value })}
                  >
                    <option value="slide-left">Slide from Left</option>
                    <option value="slide-right">Slide from Right</option>
                    <option value="push">Push Canvas</option>
                  </select>
                </div>

                <div className={styles.scFormGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Mobile Font Scaling</label>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>{settings.mobileFontScale || 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="125"
                    value={settings.mobileFontScale || 100}
                    onChange={(e) => updateSettings({ mobileFontScale: parseInt(e.target.value) })}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                <div className={styles.scFormGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Mobile Section Spacing</label>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>{settings.mobileSectionSpacing || 24}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    value={settings.mobileSectionSpacing || 24}
                    onChange={(e) => updateSettings({ mobileSectionSpacing: parseInt(e.target.value) })}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: PWA & Native App Shell */}
            <div className={styles.scCard} style={{ marginTop: '16px' }}>
              <h3>PWA &amp; App Shell Features</h3>
              <p>Home screen installation and mobile device wrappers</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Install App Smart Banner</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Prompt mobile visitors to add store to home screen</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appInstallBanner}
                    onChange={(e) => updateSettings({ appInstallBanner: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>iOS Safe-Area Insets</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Dynamic notch and home indicator padding</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={iosSafeArea}
                    onChange={(e) => updateSettings({ iosSafeArea: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>App Launch Splash Screen</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Show monogram splash when app opens</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSplashScreen}
                    onChange={(e) => updateSettings({ appSplashScreen: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
