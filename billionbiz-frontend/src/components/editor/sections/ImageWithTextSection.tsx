import React from 'react';

const ImageWithTextSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  const heading = props.heading ?? 'Crafted with Purpose';
  const body = props.body ?? 'Every piece in our collection is thoughtfully designed and ethically made. We work directly with artisans around the world to bring you unique, high-quality products that tell a story.';
  const image = props.image ?? 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&h=700&fit=crop';
  const imagePosition = props.imagePosition ?? 'left';
  const buttonText = props.buttonText ?? 'Learn More';
  const buttonLink = props.buttonLink ?? '#';
  const bgColor = props.bgColor || props.backgroundColor || 'var(--theme-bg-section, var(--theme-background))';
  const headingColor = props.headingColor || 'var(--theme-text-heading)';
  const textColor = props.textColor || 'var(--theme-text-body)';
  const buttonColor = props.buttonColor || 'var(--theme-brand-link, var(--theme-brand-primary))';

  const isRight = imagePosition === 'right';

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
        flexDirection: isMobile || isTablet ? 'column' : (isRight ? 'row' : 'row-reverse'),
        alignItems: 'center',
        padding: isMobile ? '40px 24px' : '80px 48px',
        gap: isMobile ? '32px' : '64px',
        textAlign: isMobile || isTablet ? 'center' : 'left',
        maxWidth: props._layoutWidth ?? '100%',
        margin: '0 auto',
        ...props._paddingStyle,
      }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', alignItems: isMobile || isTablet ? 'center' : 'flex-start' }}>
        <h2 style={{
          fontSize: isMobile ? '32px' : '40px',
          fontWeight: 700,
          letterSpacing: '-1px',
          color: headingColor,
          lineHeight: 1.2,
          fontFamily: 'var(--theme-font-heading), sans-serif',
        }}>
          {heading}
        </h2>
        <p style={{
          fontSize: '17px',
          lineHeight: 1.7,
          color: textColor,
          opacity: 0.85,
        }}>
          {body}
        </p>
        {buttonText && (
          <a href={buttonLink} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: buttonColor,
            fontSize: '16px',
            fontWeight: 600,
            textDecoration: 'none',
            marginTop: '8px',
          }}>
            {buttonText} →
          </a>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          width: '100%',
          aspectRatio: '1/1',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
        }}>
          <img src={image} alt={heading} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
      </div>
    </section>
  );
};

export default ImageWithTextSection;
