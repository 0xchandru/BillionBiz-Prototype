import React from 'react';
import { 
  Sparkles, 
  Palette, 
  Type, 
  MousePointerClick, 
  Wand2, 
  Code2,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useLandingEditorStore, type ThemeCategoryType } from '../../../store/landingEditorStore';
import { useSiteStore } from '../../../store/siteStore';
import { 
  isPaletteDefault, 
  isTypographyDefault, 
  isButtonsDefault, 
  isEffectsDefault 
} from './themeDefaultChecker';

interface CategoryItem {
  id: ThemeCategoryType;
  label: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'themes',
    label: 'Themes',
    description: 'Predefined presets & design styles',
    icon: Sparkles,
  },
  {
    id: 'colors',
    label: 'Color Palette',
    description: 'Brand, background, text & border colors',
    icon: Palette,
  },
  {
    id: 'typography',
    label: 'Typography',
    description: 'Heading, body fonts & scale styles',
    icon: Type,
  },
  {
    id: 'buttons',
    label: 'Buttons',
    description: 'Primary, secondary, shapes & states',
    icon: MousePointerClick,
  },
  {
    id: 'effects',
    label: 'Effects',
    description: 'Radius, shadows & animations',
    icon: Wand2,
  },
  {
    id: 'custom-css',
    label: 'Custom CSS',
    description: 'Add custom stylesheets & overrides',
    icon: Code2,
  },
];

export const ThemeSecondaryNav: React.FC = () => {
  const { 
    selectedThemeCategory, 
    setSelectedThemeCategory, 
    isRightSidebarOpen, 
    setRightSidebarOpen,
    isLeftSidebarCollapsed, 
    setLeftSidebarCollapsed 
  } = useLandingEditorStore();
  const { theme } = useSiteStore();

  const isItemModified = (id: ThemeCategoryType): boolean => {
    switch (id) {
      case 'colors':
        return !isPaletteDefault(theme);
      case 'typography':
        return !isTypographyDefault(theme);
      case 'buttons':
        return !isButtonsDefault(theme);
      case 'effects':
        return !isEffectsDefault(theme);
      case 'custom-css':
        return Boolean(theme.customCss && theme.customCss.trim().length > 0);
      case 'themes':
      default:
        return false;
    }
  };

  const handleCategoryClick = (id: ThemeCategoryType) => {
    setSelectedThemeCategory(id);
    setRightSidebarOpen(true);
  };

  const activeCategoryId = selectedThemeCategory || 'themes';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: '#ffffff' }}>
      {/* Top Header */}
      <div style={{
        padding: '20px 16px 12px',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            color: '#0f172a',
            fontFamily: '"Outfit", sans-serif'
          }}>
            Theme
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
            Global design system & tokens
          </p>
        </div>

        <button
          onClick={() => setLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          style={{ 
            background: isLeftSidebarCollapsed ? 'var(--primary-light, #eff6ff)' : 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            color: isLeftSidebarCollapsed ? 'var(--primary, #2563eb)' : 'var(--text-muted, #64748b)', 
            display: 'flex', 
            alignItems: 'center', 
            padding: '4px', 
            borderRadius: '4px', 
            transition: 'all 0.2s' 
          }}
          title={isLeftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isLeftSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Main Content Area - Category Items List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategoryId === cat.id && isRightSidebarOpen;
            const isCategoryModified = isItemModified(cat.id);

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid var(--primary, #2563eb)' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#f0f7ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.08)' : '0 1px 2px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#93c5fd';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#dbeafe' : '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#1d4ed8' : 'var(--primary, #2563eb)',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isSelected ? '#1d4ed8' : '#0f172a'
                      }}>
                        {cat.label}
                      </h4>
                      {isCategoryModified && (
                        <span style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          letterSpacing: '0.2px',
                          lineHeight: '1.2',
                          whiteSpace: 'nowrap',
                        }}>
                          Modified
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                      {cat.description}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} color={isSelected ? '#2563eb' : '#94a3b8'} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
