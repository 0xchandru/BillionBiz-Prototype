import React from 'react';

const GallerySection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  const heading = props.heading ?? 'Gallery';
  const columns = props.columns ?? 3;
  const images = props.images || [
    { src: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop', alt: 'Gallery 1' },
    { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop', alt: 'Gallery 2' },
    { src: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&h=600&fit=crop', alt: 'Gallery 3' },
    { src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', alt: 'Gallery 4' },
    { src: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&h=600&fit=crop', alt: 'Gallery 5' },
    { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', alt: 'Gallery 6' },
  ];

  const bgColor = props.bgColor || 'var(--theme-bg-section, var(--theme-background, #ffffff))';
  const headingColor = props.headingColor || 'var(--theme-text-heading, var(--theme-text, #0f172a))';

  return (
    <section style={{ 
      width: '100%', 
      backgroundColor: bgColor,
      position: 'relative',
      overflow: 'hidden',
      ...props._marginStyle,
    }}>
      <div style={{
        padding: isMobile ? '40px 24px' : '80px 48px',
        maxWidth: props._layoutWidth ?? '100%',
        margin: '0 auto',
        ...props._paddingStyle,
      }}>
      <h2 style={{
        fontSize: isMobile ? '32px' : '40px',
        fontWeight: 700,
        letterSpacing: '-1px',
        color: headingColor,
        textAlign: 'center',
        marginBottom: '40px',
        fontFamily: 'var(--theme-font-heading), sans-serif',
      }}>
        {heading}
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${isMobile ? 1 : (isTablet ? 2 : columns)}, 1fr)`,
        gap: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {images.map((img: any, i: number) => (
          <div key={i} style={{
            aspectRatio: '1/1',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'pointer',
          }}>
            <img
              src={img.src}
              alt={img.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s',
              }}
            />
          </div>
        ))}
      </div>
      </div>
    </section>
  );
};

export default GallerySection;
