import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight } from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useSiteStore } from '../../../store/siteStore';
import { ThemesPanel } from '../theme/panels/ThemesPanel';
import { ColorPalettePanel } from '../theme/panels/ColorPalettePanel';
import { TypographyPanel } from '../theme/panels/TypographyPanel';
import { ButtonsPanel } from '../theme/panels/ButtonsPanel';
import { EffectsPanel } from '../theme/panels/EffectsPanel';
import { CustomCssPanel } from '../theme/panels/CustomCssPanel';
import type { ThemeCategoryType } from '../../../store/landingEditorStore';
import { ThemeResetButton } from '../theme/ui/ThemeResetButton';
import { isCategoryDefault } from '../theme/themeDefaultChecker';
import {
  LoaderSidebarPanel,
  ScrollBehaviorSidebarPanel,
  MobileNavSidebarPanel,
  MobilePwaSidebarPanel,
  MobileAppSidebarPanel,
} from '../DesignRightPanels';
import styles from '../../../pages/editor/EditorLayout.module.css';

interface ThemeEditorRightPanelProps {
  isHidden?: boolean;
}

// Subcomponent for Theme Design System categories (Themes, Colors, Typography, Buttons, Effects, Custom CSS)
const ThemeCategoryRightPanel: React.FC<{ isHidden?: boolean }> = ({ isHidden = false }) => {
  const { closeRightSidebar, selectedThemeCategory } = useLandingEditorStore();
  const { 
    theme, resetAllThemeSettings, resetColorPalette, resetTypography, 
    resetButtons, resetEffects, resetCustomCss 
  } = useSiteStore();
  const [confirmResetCategory, setConfirmResetCategory] = useState<ThemeCategoryType | null>(null);

  const categoryTitles: Record<ThemeCategoryType, string> = {
    themes: 'Themes',
    colors: 'Color Palette',
    typography: 'Typography',
    buttons: 'Buttons',
    effects: 'Effects',
    'custom-css': 'Custom CSS',
  };
  const activeCategory = selectedThemeCategory || 'themes';
  const title = categoryTitles[activeCategory] || 'Theme';

  const categoryResetLabels: Record<ThemeCategoryType, string> = {
    themes: 'Reset All',
    colors: 'Reset Colors',
    typography: 'Reset Typography',
    buttons: 'Reset Buttons',
    effects: 'Reset Effects',
    'custom-css': 'Clear CSS',
  };
  const resetLabel = categoryResetLabels[activeCategory] || 'Reset to default';
  const isCurrentDefault = isCategoryDefault(activeCategory, theme);

  const handleConfirmReset = () => {
    if (!confirmResetCategory) return;
    if (confirmResetCategory === 'themes') {
      resetAllThemeSettings();
    } else if (confirmResetCategory === 'colors') {
      resetColorPalette();
    } else if (confirmResetCategory === 'typography') {
      resetTypography();
    } else if (confirmResetCategory === 'buttons') {
      resetButtons();
    } else if (confirmResetCategory === 'effects') {
      resetEffects();
    } else if (confirmResetCategory === 'custom-css') {
      resetCustomCss();
    }
    setConfirmResetCategory(null);
  };

  const getResetModalContent = (cat: ThemeCategoryType) => {
    const presetName = theme.presetName || 'Modern';
    switch (cat) {
      case 'themes':
        return {
          title: 'Reset All Theme Settings?',
          description: `Are you sure you want to reset all theme customizations back to the "${presetName}" preset defaults? All custom colors, typography, buttons, and effects will be discarded.`,
          confirmLabel: 'Reset All',
        };
      case 'colors':
        return {
          title: 'Reset Color Palette?',
          description: `Are you sure you want to reset the color palette back to the "${presetName}" preset defaults? Your customized brand, background, and text colors will be discarded.`,
          confirmLabel: 'Reset Colors',
        };
      case 'typography':
        return {
          title: 'Reset Typography?',
          description: `Are you sure you want to reset typography back to the "${presetName}" preset defaults? Your font family choices and scale settings will be discarded.`,
          confirmLabel: 'Reset Typography',
        };
      case 'buttons':
        return {
          title: 'Reset Buttons?',
          description: `Are you sure you want to reset button styles back to the "${presetName}" preset defaults? Your button shape and style customizations will be discarded.`,
          confirmLabel: 'Reset Buttons',
        };
      case 'effects':
        return {
          title: 'Reset Effects?',
          description: `Are you sure you want to reset effects back to the "${presetName}" preset defaults? Your radius, shadow, and animation customizations will be discarded.`,
          confirmLabel: 'Reset Effects',
        };
      case 'custom-css':
        return {
          title: 'Clear Custom CSS?',
          description: 'Are you sure you want to clear all custom CSS rules? This will remove all custom stylesheets applied to your store.',
          confirmLabel: 'Clear CSS',
        };
      default:
        return {
          title: 'Reset to Default?',
          description: 'Are you sure you want to reset these settings back to their default values?',
          confirmLabel: 'Reset',
        };
    }
  };

  return (
    <>
      <aside className={`${styles.rightPanel} ${isHidden ? styles.rightPanelHidden : ''}`}>
        <div className={styles.panelHeader} style={{ padding: '14px 18px', gap: '14px' }}>
          <div className={styles.phLeft} style={{ gap: '8px', minWidth: 0, flexShrink: 1 }}>
            <button className={styles.iconBtn} onClick={() => closeRightSidebar()} style={{ flexShrink: 0 }}>
              <ChevronRight size={18} className={styles.backIcon} />
            </button>
            <h3 className={styles.fw600} style={{ margin: 0, fontSize: '15px', whiteSpace: 'nowrap' }}>
              {title}
            </h3>
          </div>
          <ThemeResetButton
            size="sm"
            onClick={() => {
              if (!isCurrentDefault) {
                setConfirmResetCategory(activeCategory);
              }
            }}
            isDefault={isCurrentDefault}
            label={resetLabel}
            title={isCurrentDefault ? 'Already default' : resetLabel}
          />
        </div>
        <div className={styles.propContent} style={{ padding: '16px', overflowY: 'auto' }}>
          {activeCategory === 'themes' && <ThemesPanel />}
          {activeCategory === 'colors' && <ColorPalettePanel />}
          {activeCategory === 'typography' && <TypographyPanel />}
          {activeCategory === 'buttons' && <ButtonsPanel />}
          {activeCategory === 'effects' && <EffectsPanel />}
          {activeCategory === 'custom-css' && <CustomCssPanel />}
        </div>
      </aside>

      {confirmResetCategory && createPortal(
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px',
          }}
          onClick={() => setConfirmResetCategory(null)}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: 600,
              color: '#0f172a',
            }}>
              {getResetModalContent(confirmResetCategory).title}
            </h3>

            <p style={{
              margin: '0 0 24px 0',
              fontSize: '13px',
              lineHeight: 1.5,
              color: '#64748b',
            }}>
              {getResetModalContent(confirmResetCategory).description}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmResetCategory(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                {getResetModalContent(confirmResetCategory).confirmLabel}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// Router component for Design right sidebar - Strictly obeys React Rules of Hooks
export const ThemeEditorRightPanel: React.FC<ThemeEditorRightPanelProps> = ({ isHidden = false }) => {
  const designSection = useLandingEditorStore((s) => s.designSection);

  // Route to dedicated design panels when selected in left sidebar
  if (designSection === 'loader') {
    return <LoaderSidebarPanel key="loader" isHidden={isHidden} />;
  }
  if (designSection === 'scroll-behavior') {
    return <ScrollBehaviorSidebarPanel key="scroll-behavior" isHidden={isHidden} />;
  }
  if (designSection === 'mobile-nav' || designSection === 'mobile') {
    return <MobileNavSidebarPanel key="mobile-nav" isHidden={isHidden} />;
  }
  if (designSection === 'mobile-pwa' || designSection === 'mobile-web') {
    return <MobilePwaSidebarPanel key="mobile-pwa" isHidden={isHidden} />;
  }
  if (designSection === 'mobile-app') {
    return <MobileAppSidebarPanel key="mobile-app" isHidden={isHidden} />;
  }

  return <ThemeCategoryRightPanel key="theme-category" isHidden={isHidden} />;
};
