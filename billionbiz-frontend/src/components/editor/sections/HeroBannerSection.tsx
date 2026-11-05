import React from 'react';
import styles from './HeroBannerSection.module.css';

type HeroBlock = {
  id: string;
  type: string;
  enabled?: boolean;
  settings?: Record<string, any>;
  designOverrides?: Record<string, any>;
  responsiveOverrides?: Record<string, any>;
};

interface HeroBannerProps {
  props: Record<string, any>;
}

const tokenVariables: Record<string, string> = {
  'color.brand.primary': 'var(--theme-brand-primary)',
  'color.brand.secondary': 'var(--theme-brand-secondary)',
  'color.brand.accent': 'var(--theme-brand-accent)',
  'color.text.heading': 'var(--theme-text-heading)',
  'color.text.body': 'var(--theme-text-body)',
  'color.text.muted': 'var(--theme-text-muted)',
  'color.background.surface': 'var(--theme-bg-surface)',
  'color.background.page': 'var(--theme-bg)',
  'color.border.default': 'var(--theme-border)',
};

const resolveOverride = (value: any, fallback: string): string => {
  if (!value || value === 'inherit') return fallback;
  if (typeof value === 'string') {
    if (value.startsWith('token:')) {
      return tokenVariables[value.slice(6)] || fallback;
    }
    return value;
  }
  if (typeof value === 'object') {
    if (value.mode === 'token' && typeof value.token === 'string') {
      return tokenVariables[value.token] || fallback;
    }
    if (value.mode === 'custom' && typeof value.value === 'string') {
      return value.value;
    }
  }
  return fallback;
};

const createLegacyBlocks = (props: Record<string, any>): HeroBlock[] => [
  { id: 'legacy-eyebrow', type: 'eyebrow', settings: { text: props.badge || '' } },
  { id: 'legacy-heading', type: 'heading', settings: { text: props.heading || 'Make room for what you love.', level: 'h1' } },
  { id: 'legacy-text', type: 'rich-text', settings: { text: props.description || '' } },
  {
    id: 'legacy-primary-button',
    type: 'button',
    settings: {
      label: props.primaryBtn || 'Explore products',
      href: props.primaryBtnLink || '/shop',
      variant: 'primary'
    }
  },
  {
    id: 'legacy-image',
    type: 'image',
    settings: {
      src: props.image || '',
      alt: props.imageAlt || '',
      fit: 'cover'
    }
  }
];

const HeroBannerSection: React.FC<HeroBannerProps> = ({ props }) => {
  const device = props.device || 'desktop';
  const blocks: HeroBlock[] = Array.isArray(props.blocks)
    ? props.blocks.filter((block: HeroBlock) =>
        block &&
        block.enabled !== false &&
        block.responsiveOverrides?.visible?.[device] !== false
      )
    : createLegacyBlocks(props);
  const settings = props.settings || props;
  const designOverrides = props.designOverrides || {};
  const layout = settings.layout || props.selectedLayout || props.layout || 'split-right';
  const verticalAlignment = ['start', 'center', 'end'].includes(settings.verticalAlignment)
    ? settings.verticalAlignment
    : 'center';
  const isCentered = layout === 'centered' || layout === 'center';
  const isSplitLeft = layout === 'split-left' || layout === 'right';

  const eyebrow = blocks.find((block) => block.type === 'eyebrow');
  const heading = blocks.find((block) => block.type === 'heading');
  const description = blocks.find((block) => block.type === 'rich-text');
  const image = blocks.find((block) => block.type === 'image');
  const buttons = blocks.filter((block) => block.type === 'button').slice(0, 2);

  const widthMap: Record<string, string> = {
    standard: '1100px',
    wide: 'var(--theme-container-max-width, 1280px)',
    full: '100%'
  };

  const style = {
    '--hero-background': resolveOverride(
      designOverrides.sectionBackground ?? props.bgColor,
      'var(--theme-bg-section, var(--theme-bg, #ffffff))'
    ),
    '--hero-heading-color': resolveOverride(
      designOverrides.headingColor ?? props.headingColor,
      'var(--theme-text-heading, #0f172a)'
    ),
    '--hero-body-color': resolveOverride(
      designOverrides.bodyColor ?? props.textColor,
      'var(--theme-text-body, #475569)'
    ),
    '--hero-eyebrow-color': resolveOverride(
      designOverrides.eyebrowColor ?? props.badgeColor,
      'var(--theme-brand-secondary, #64748b)'
    ),
    '--hero-content-width': widthMap[settings.contentWidth] || widthMap.wide,
    '--hero-min-height': `${Math.max(280, Math.min(900, Number(settings.minHeight || 520)))}px`,
    '--hero-image-fit': image?.settings?.fit === 'contain' ? 'contain' : 'cover',
    alignItems: verticalAlignment
  } as React.CSSProperties;

  const navigateTo = (event: React.MouseEvent<HTMLAnchorElement>, href: string, openInNewTab: boolean) => {
    if (openInNewTab || !href.startsWith('/') || !props.onNavigate) return;
    event.preventDefault();
    props.onNavigate(href);
  };

  return (
    <section
      className={`${styles.section} ${isCentered ? styles.centered : ''} ${isSplitLeft ? styles.splitLeft : ''}`}
      style={style}
      aria-label="Hero"
    >
      <div className={styles.inner}>
        <div className={styles.content}>
          {eyebrow?.settings?.text ? (
            <p
              className={styles.eyebrow}
              style={{ color: resolveOverride(eyebrow.designOverrides?.color, 'var(--theme-brand-secondary)') }}
            >
              {eyebrow.settings.text}
            </p>
          ) : null}

          {heading?.settings?.text ? (
            heading.settings.level === 'h2' ? (
              <h2
                className={styles.heading}
                style={{
                  color: resolveOverride(heading.designOverrides?.color, 'var(--hero-heading-color)'),
                  fontSize: typeof heading.designOverrides?.fontSize === 'number'
                    ? `clamp(2rem, 4.8vw, ${heading.designOverrides.fontSize}px)`
                    : undefined
                }}
              >
                {heading.settings.text}
              </h2>
            ) : (
              <h1
                className={styles.heading}
                style={{
                  color: resolveOverride(heading.designOverrides?.color, 'var(--hero-heading-color)'),
                  fontSize: typeof heading.designOverrides?.fontSize === 'number'
                    ? `clamp(2rem, 4.8vw, ${heading.designOverrides.fontSize}px)`
                    : undefined
                }}
              >
                {heading.settings.text}
              </h1>
            )
          ) : null}

          {description?.settings?.text ? (
            <p
              className={styles.description}
              style={{ color: resolveOverride(description.designOverrides?.color, 'var(--hero-body-color)') }}
            >
              {description.settings.text}
            </p>
          ) : null}

          {buttons.length > 0 ? (
            <div className={styles.actions}>
              {buttons.map((block) => {
                const href = String(block.settings?.href || '#');
                const variant = String(block.settings?.variant || 'primary');
                const buttonClass = variant === 'secondary'
                  ? styles.secondary
                  : variant === 'text'
                    ? styles.text
                    : styles.primary;
                const openInNewTab = Boolean(block.settings?.openInNewTab);
                return (
                  <a
                    key={block.id}
                    className={`${styles.button} ${buttonClass}`}
                    href={href}
                    target={openInNewTab ? '_blank' : undefined}
                    rel={openInNewTab ? 'noopener noreferrer' : undefined}
                    onClick={(event) => navigateTo(event, href, openInNewTab)}
                    style={{
                      ...(block.designOverrides?.background
                        ? { background: resolveOverride(block.designOverrides.background, 'var(--theme-btn-primary-bg)') }
                        : {}),
                      ...(block.designOverrides?.color
                        ? { color: resolveOverride(block.designOverrides.color, 'var(--theme-btn-primary-text)') }
                        : {}),
                      ...(typeof block.designOverrides?.borderRadius === 'number'
                        ? { borderRadius: `${block.designOverrides.borderRadius}px` }
                        : {})
                    }}
                  >
                    {block.settings?.label || 'Explore'}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className={styles.media}>
            {image?.settings?.src ? (
              <img
                src={String(image.settings.src)}
                alt={String(image.settings.alt || '')}
                loading="eager"
                decoding="async"
              />
            ) : (
              <div
                aria-hidden="true"
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at 72% 28%, var(--theme-brand-accent, #cbd5e1) 0, transparent 34%), radial-gradient(circle at 25% 72%, var(--theme-brand-secondary, #e2e8f0) 0, transparent 38%), linear-gradient(135deg, var(--theme-bg-surface, #f1f5f9), var(--theme-bg-container, #e2e8f0))'
                }}
              />
            )}
        </div>
      </div>
    </section>
  );
};

export default HeroBannerSection;
