import React from 'react';

const HeroBannerSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  const layout = props.selectedLayout ?? props.layout ?? 'left';
  const bgColor = props.bgColor || props.backgroundColor || 'var(--theme-bg-section, var(--theme-background))';
  const headingColor = props.headingColor || 'var(--theme-text-heading)';
  const textColor = props.textColor || 'var(--theme-text-body)';
  const badgeBg = props.badgeBg || 'var(--theme-brand-secondary)';
  const badgeColor = props.badgeColor || 'var(--theme-text-inverse, #ffffff)';
  const primaryBtnBg = props.primaryBtnBg || 'var(--theme-btn-primary-bg)';
  const primaryBtnColor = props.primaryBtnColor || 'var(--theme-btn-primary-text)';
  const secondaryBtnBg = props.secondaryBtnBg || 'var(--theme-btn-secondary-bg, transparent)';
  const secondaryBtnColor = props.secondaryBtnColor || 'var(--theme-btn-secondary-text, var(--theme-brand-primary))';

  const badge = props.badge ?? 'New Arrival';
  const heading = props.heading ?? 'Elevate Your Creative Workflow';
  const description = props.description ?? 'Discover the tools that empower professionals to build stunning digital experiences with ease.';
  const primaryBtn = props.primaryBtn ?? 'Start Building Now';
  const secondaryBtn = props.secondaryBtn ?? 'Explore Templates';
  const image = props.image ?? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=1000&fit=crop';

  const isCenter = layout === 'center';

  const imageBlock = (
    <div style={{ flex: 1, display: 'flex', justifyContent: isMobile || isTablet ? 'center' : (layout === 'right' ? 'flex-start' : 'flex-end'), width: '100%' }}>
      <div style={{
        width: isMobile ? '100%' : '90%',
        height: isMobile ? '320px' : (isTablet ? '480px' : '640px'),
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderTopLeftRadius: layout === 'right' ? '0' : '400px',
        borderTopRightRadius: layout === 'right' ? '400px' : '400px',
        borderBottomLeftRadius: layout === 'right' ? '400px' : '0',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
      }} />
    </div>
  );

  return (
    <section style={{
      width: '100%',
      backgroundColor: bgColor,
      background: bgColor,
      position: 'relative',
      overflow: 'hidden',
      ...props._marginStyle,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isCenter ? 'column' : (isMobile || isTablet ? 'column' : 'row'),
        alignItems: 'center',
        padding: isCenter 
          ? (isMobile ? '60px 24px' : '100px 40px')
          : (isMobile ? '60px 24px' : '80px 48px'),
        gap: isMobile ? '32px' : '48px',
        textAlign: isCenter ? 'center' : (isMobile || isTablet ? 'center' : 'left'),
        maxWidth: props._layoutWidth ?? '100%',
        margin: '0 auto',
        ...props._paddingStyle,
      }}>
      {layout === 'right' && !isMobile && !isTablet && imageBlock}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: isCenter ? 'center' : (isMobile || isTablet ? 'center' : 'flex-start'),
        maxWidth: isCenter ? '720px' : 'none',
        width: '100%',
      }}>
        <span style={{
          backgroundColor: badgeBg,
          color: badgeColor,
          fontSize: '13px',
          fontWeight: 600,
          padding: '8px 16px',
          borderRadius: '999px',
          marginBottom: '24px',
          letterSpacing: '0.5px',
        }}>
          {badge}
        </span>
        <h1 style={{
          fontSize: isMobile ? '40px' : (isCenter ? '64px' : '72px'),
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-2px',
          marginBottom: '24px',
          color: headingColor,
          fontFamily: 'var(--theme-font-heading), sans-serif',
        }}>
          {heading}
        </h1>
        <p style={{
          fontSize: isMobile ? '16px' : '20px',
          color: textColor,
          opacity: 0.85,
          lineHeight: 1.6,
          marginBottom: '40px',
          fontWeight: 400,
          maxWidth: '560px',
        }}>
          {description}
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: isMobile || isTablet || isCenter ? 'center' : 'flex-start' }}>
          <button style={{
            backgroundColor: primaryBtnBg,
            color: primaryBtnColor,
            padding: '16px 32px',
            borderRadius: 'var(--theme-btn-primary-radius, var(--theme-radius))',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.2s',
          }}>
            {primaryBtn}
          </button>
          <button style={{
            backgroundColor: secondaryBtnBg,
            border: `1px solid ${secondaryBtnColor}`,
            color: secondaryBtnColor,
            padding: '16px 32px',
            borderRadius: 'var(--theme-btn-secondary-radius, var(--theme-radius))',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            {secondaryBtn}
          </button>
        </div>
      </div>

      {!isCenter && layout !== 'right' && (
        <div style={{ flex: 1, display: 'flex', justifyContent: isMobile || isTablet ? 'center' : 'flex-end', width: '100%' }}>
          <div style={{
            width: isMobile ? '100%' : '90%',
            height: isMobile ? '320px' : (isTablet ? '480px' : '640px'),
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderTopLeftRadius: '400px',
            borderTopRightRadius: '400px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
          }} />
        </div>
      )}
      </div>
    </section>
  );
};

export default HeroBannerSection;
