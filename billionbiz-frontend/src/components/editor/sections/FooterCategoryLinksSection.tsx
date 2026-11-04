import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { getEditorPath } from '../utils/editorNavigation';
import styles from './FooterSections.module.css';

interface CategoryLinkItem {
  label: string;
  url: string;
}

interface CategoryGroup {
  id: string;
  name: string;
  links: CategoryLinkItem[];
}

interface FooterCategoryLinksSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

export const FooterCategoryLinksSection: React.FC<FooterCategoryLinksSectionProps> = ({
  props = {},
  device = 'desktop',
  isEditorInteractive = false,
  useEditorModel = true,
}) => {
  const store = useEditorContextStore();
  const { selectedTarget, selectTarget } = store;
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Derive row from store if in editor context
  const activeRow = (store.footerRows || []).find(
    (r) => r.type === 'category-links' || r.id === props.rowId
  );

  const styling = activeRow?.styling || props.styling || {};
  const layout = activeRow?.layout || props.layout || {};
  const element = activeRow?.columns?.[0]?.elements?.[0] || props.element || {};
  const elProps = element.props || props.props || {};

  const currentLookId = layout.variantId || 'classic-inline-comma';

  const defaultCategories: CategoryGroup[] = [
    {
      id: 'cat-1',
      name: 'KITCHEN',
      links: [
        { label: 'Storage Jars', url: '#' },
        { label: 'Storage Containers', url: '#' },
        { label: 'Lunch Boxes', url: '#' },
        { label: 'Casseroles', url: '#' },
        { label: 'Lunch Bags', url: '#' },
        { label: 'Kitchen Tools', url: '#' },
        { label: 'Baking Dishes', url: '#' },
        { label: 'Kitchen Racks', url: '#' },
        { label: 'Cookware', url: '#' },
        { label: 'Cooking Pots', url: '#' },
        { label: 'Stainless Steel Cookware', url: '#' },
        { label: 'Aprons', url: '#' },
      ],
    },
    {
      id: 'cat-2',
      name: 'DINING',
      links: [
        { label: 'Plates', url: '#' },
        { label: 'Platters', url: '#' },
        { label: 'Bowls', url: '#' },
        { label: 'Snack Bowls', url: '#' },
        { label: 'Table Linen', url: '#' },
        { label: 'Tea Cups', url: '#' },
        { label: 'Coffee Mugs', url: '#' },
        { label: 'Water Bottles', url: '#' },
        { label: 'Wine Glasses', url: '#' },
        { label: 'Champagne Glasses', url: '#' },
        { label: 'Tumblers', url: '#' },
        { label: 'Table Mats', url: '#' },
        { label: 'Cake Stands', url: '#' },
        { label: 'Serving Bowls', url: '#' },
        { label: 'Dinner Plates', url: '#' },
        { label: 'Section Plates', url: '#' },
        { label: 'Drinkware', url: '#' },
      ],
    },
    {
      id: 'cat-3',
      name: 'DECOR',
      links: [
        { label: 'Puja Essentials', url: '#' },
        { label: 'Showpieces', url: '#' },
        { label: 'Photo Frames', url: '#' },
        { label: 'Baskets', url: '#' },
        { label: 'Mirrors', url: '#' },
        { label: 'Candles', url: '#' },
        { label: 'Candle Stands', url: '#' },
        { label: "Kids' Collection", url: '#' },
        { label: 'Vases', url: '#' },
        { label: 'Tissue Boxes', url: '#' },
        { label: 'Decorative Trays', url: '#' },
        { label: 'Table Accents', url: '#' },
        { label: 'Decorative Bowls', url: '#' },
      ],
    },
    {
      id: 'cat-4',
      name: 'BATH',
      links: [
        { label: 'Floor Mats', url: '#' },
        { label: 'Dustbins', url: '#' },
        { label: 'Bathroom Accessories', url: '#' },
        { label: 'Bathroom Sets', url: '#' },
        { label: 'Dispensers', url: '#' },
      ],
    },
    {
      id: 'cat-5',
      name: 'BAGS AND ACCESSORIES',
      links: [
        { label: 'Car Accessories', url: '#' },
        { label: 'Jewellery', url: '#' },
        { label: 'Earrings', url: '#' },
        { label: 'Rings', url: '#' },
        { label: 'Makeup Pouches', url: '#' },
        { label: 'Jewellery Organisers', url: '#' },
        { label: 'Tote Bags', url: '#' },
        { label: 'Travel Bags', url: '#' },
        { label: 'Sling Bags', url: '#' },
        { label: 'Handbags', url: '#' },
      ],
    },
    {
      id: 'cat-6',
      name: 'SOFT FURNISHINGS',
      links: [
        { label: 'Throw Blankets', url: '#' },
        { label: 'Cushions And Cushion Covers', url: '#' },
        { label: 'Bedsheets', url: '#' },
        { label: 'Rugs', url: '#' },
      ],
    },
  ];

  const categories: CategoryGroup[] = elProps.categories || defaultCategories;

  // Custom Separator based on look or user prop
  let separator = elProps.separator;
  if (!separator) {
    if (currentLookId === 'modern-bullet-dot') separator = '  •  ';
    else if (currentLookId === 'pipe-minimalist') separator = '  |  ';
    else if (currentLookId === 'pill-chips-shelf') separator = '';
    else separator = ' , ';
  }

  const titleTransform = elProps.titleTransform || 'uppercase';

  const bgColor = styling.bgColor || '#ffffff';
  const titleColor = styling.titleColor || '#0f172a';
  const linkColor = styling.linkColor || '#64748b';
  const linkHoverColor = styling.linkHoverColor || '#0f172a';
  const separatorColor = styling.separatorColor || '#94a3b8';
  const pillBg = styling.pillBg || '#f1f5f9';
  const pillHoverBg = styling.pillHoverBg || '#e2e8f0';
  const cardBg = styling.cardBg || '#ffffff';
  const borderColor = styling.borderColor || '#e2e8f0';

  const paddingY = layout.paddingY ?? 36;
  const paddingX = layout.paddingX ?? 32;
  const categoryGap = layout.categoryGap ?? 24;
  const titleGap = layout.titleGap ?? 8;
  const alignment = layout.alignment || 'left';
  const containerMode = layout.container || 'constrained';

  const fontSize = styling.fontSize ?? (currentLookId === 'pill-chips-shelf' ? 12.5 : 13);
  const titleFontSize = styling.titleFontSize ?? 13;

  const navigate = useNavigate();
  const { selectedPageId, navigateToPage, setRightSidebarOpen, setSelectedSectionId, requestEditorSwitch } = useLandingEditorStore();

  const isRowSelected =
    selectedTarget.type === 'row' &&
    selectedTarget.editorType === 'footer' &&
    selectedTarget.rowId === activeRow?.id;

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive && !useEditorModel) return;
    e.stopPropagation();

    const executeSelect = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', activeRow?.id || 'footer-category-links');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-category-links'));
        store.setEditorType('footer');
      }
      if (activeRow) {
        selectTarget({ type: 'row', editorType: 'footer', rowId: activeRow.id });
        setSelectedSectionId(activeRow.id);
        setRightSidebarOpen(true);
      }
    };

    if (selectedPageId !== 'footer-global') {
      requestEditorSwitch({
        targetPageId: 'footer-global',
        targetSectionId: activeRow?.id || 'footer-category-links',
        targetName: 'Footer Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const isMobile = device === 'mobile';

  return (
    <div
      onClick={handleRowClick}
      className={`${styles.footerSection} ${isRowSelected ? styles.selectedSection : ''}`}
      data-section-type="FooterCategoryLinks"
      data-row-id={activeRow?.id}
      style={{
        backgroundColor: bgColor,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
        paddingLeft: `${isMobile ? 16 : paddingX}px`,
        paddingRight: `${isMobile ? 16 : paddingX}px`,
        borderTop: styling.borderTop !== false ? `1px solid ${borderColor}` : undefined,
        borderBottom: styling.borderBottom ? `1px solid ${borderColor}` : undefined,
        cursor: isEditorInteractive || useEditorModel ? 'pointer' : 'default',
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: containerMode === 'constrained' ? '1280px' : containerMode === 'boxed' ? '1024px' : '100%',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: `${categoryGap}px`,
          textAlign: alignment as any,
        }}
      >
        {categories.map((category, catIdx) => {
          // Look 5: Two-column split
          if (currentLookId === 'split-two-col' && !isMobile) {
            return (
              <div
                key={category.id || `cat-${catIdx}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr',
                  gap: '24px',
                  alignItems: 'baseline',
                  paddingBottom: catIdx < categories.length - 1 ? `${Math.round(categoryGap / 2)}px` : undefined,
                  borderBottom: catIdx < categories.length - 1 ? `1px dashed ${borderColor}` : undefined,
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: `${titleFontSize}px`,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: titleColor,
                    textTransform: titleTransform as any,
                  }}
                >
                  {category.name}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    lineHeight: '1.9',
                    fontSize: `${fontSize}px`,
                  }}
                >
                  {category.links.map((link, lIdx) => {
                    const linkKey = `${category.id}-${lIdx}`;
                    const isHovered = hoveredLink === linkKey;
                    return (
                      <React.Fragment key={linkKey}>
                        <a
                          href={link.url || '#'}
                          onClick={(e) => {
                            if (isEditorInteractive) e.preventDefault();
                          }}
                          onMouseEnter={() => setHoveredLink(linkKey)}
                          onMouseLeave={() => setHoveredLink(null)}
                          style={{
                            color: isHovered ? linkHoverColor : linkColor,
                            textDecoration: isHovered ? 'underline' : 'none',
                            transition: 'color 0.15s ease',
                            cursor: 'pointer',
                          }}
                        >
                          {link.label}
                        </a>
                        {lIdx < category.links.length - 1 && (
                          <span style={{ color: separatorColor, whiteSpace: 'pre', userSelect: 'none' }}>
                            {separator}
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Look 6: Boxed Card Shelves
          if (currentLookId === 'boxed-card-shelves') {
            return (
              <div
                key={category.id || `cat-${catIdx}`}
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  padding: '18px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${titleGap}px`,
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: `${titleFontSize}px`,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: titleColor,
                    textTransform: titleTransform as any,
                  }}
                >
                  {category.name}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    lineHeight: '1.85',
                    fontSize: `${fontSize}px`,
                    justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {category.links.map((link, lIdx) => {
                    const linkKey = `${category.id}-${lIdx}`;
                    const isHovered = hoveredLink === linkKey;
                    return (
                      <React.Fragment key={linkKey}>
                        <a
                          href={link.url || '#'}
                          onClick={(e) => {
                            if (isEditorInteractive) e.preventDefault();
                          }}
                          onMouseEnter={() => setHoveredLink(linkKey)}
                          onMouseLeave={() => setHoveredLink(null)}
                          style={{
                            color: isHovered ? linkHoverColor : linkColor,
                            textDecoration: isHovered ? 'underline' : 'none',
                            transition: 'color 0.15s ease',
                            cursor: 'pointer',
                          }}
                        >
                          {link.label}
                        </a>
                        {lIdx < category.links.length - 1 && (
                          <span style={{ color: separatorColor, whiteSpace: 'pre', userSelect: 'none' }}>
                            {separator}
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Look 3: Pill Chips Shelves
          if (currentLookId === 'pill-chips-shelf') {
            return (
              <div
                key={category.id || `cat-${catIdx}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${titleGap}px`,
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: `${titleFontSize}px`,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: titleColor,
                    textTransform: titleTransform as any,
                  }}
                >
                  {category.name}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center',
                    justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {category.links.map((link, lIdx) => {
                    const linkKey = `${category.id}-${lIdx}`;
                    const isHovered = hoveredLink === linkKey;
                    return (
                      <a
                        key={linkKey}
                        href={link.url || '#'}
                        onClick={(e) => {
                          if (isEditorInteractive) e.preventDefault();
                        }}
                        onMouseEnter={() => setHoveredLink(linkKey)}
                        onMouseLeave={() => setHoveredLink(null)}
                        style={{
                          backgroundColor: isHovered ? pillHoverBg : pillBg,
                          color: isHovered ? linkHoverColor : linkColor,
                          border: `1px solid ${isHovered ? borderColor : 'transparent'}`,
                          padding: '4px 11px',
                          borderRadius: '999px',
                          fontSize: `${fontSize}px`,
                          fontWeight: 500,
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                          cursor: 'pointer',
                        }}
                      >
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Standard Flowing Looks (Classic Comma, Modern Bullet Dot, Pipe Minimalist)
          return (
            <div
              key={category.id || `cat-${catIdx}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${titleGap}px`,
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: titleColor,
                  textTransform: titleTransform as any,
                }}
              >
                {category.name}
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  lineHeight: '1.9',
                  fontSize: `${fontSize}px`,
                  justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
                }}
              >
                {category.links.map((link, lIdx) => {
                  const linkKey = `${category.id}-${lIdx}`;
                  const isHovered = hoveredLink === linkKey;
                  return (
                    <React.Fragment key={linkKey}>
                      <a
                        href={link.url || '#'}
                        onClick={(e) => {
                          if (isEditorInteractive) e.preventDefault();
                        }}
                        onMouseEnter={() => setHoveredLink(linkKey)}
                        onMouseLeave={() => setHoveredLink(null)}
                        style={{
                          color: isHovered ? linkHoverColor : linkColor,
                          textDecoration: isHovered ? 'underline' : 'none',
                          transition: 'color 0.15s ease',
                          cursor: 'pointer',
                        }}
                      >
                        {link.label}
                      </a>
                      {lIdx < category.links.length - 1 && (
                        <span style={{ color: separatorColor, whiteSpace: 'pre', userSelect: 'none' }}>
                          {separator}
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FooterCategoryLinksSection;
