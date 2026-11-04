import React from 'react';

const FeaturedCollectionSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  const heading = props.heading ?? 'Featured Collection';
  const linkText = props.linkText ?? 'View all';
  const columns = props.columns ?? 4;
  const layout = props.selectedLayout ?? props.layout ?? 'grid';
  
  const displayColumns = isMobile ? 1 : (isTablet ? Math.min(2, columns) : columns);

  const items = props.products || props.categories || [
    { name: 'Artisan Ceramic Vase', price: '$89.00', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop' },
    { name: 'Handwoven Throw', price: '$129.00', image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400&h=400&fit=crop' },
    { name: 'Oak Side Table', price: '$249.00', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' },
    { name: 'Linen Cushion Set', price: '$67.00', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop' },
  ];

  const bgColor = props.bgColor || props.backgroundColor || 'var(--theme-bg-section, var(--theme-background))';
  const headingColor = props.headingColor || 'var(--theme-text-heading)';
  const titleColor = props.textColor || props.titleColor || 'var(--theme-text-heading)';
  const priceColor = props.priceColor || 'var(--theme-brand-primary)';
  const cardBg = props.cardBg || 'var(--theme-bg-surface, #f8fafc)';
  const linkColor = props.linkColor || 'var(--theme-brand-link, var(--theme-brand-primary))';

  let listStyle: React.CSSProperties = {};
  if (layout === 'carousel') {
    listStyle = {
      display: 'flex',
      overflowX: 'auto',
      gap: isMobile ? '16px' : '24px',
      paddingBottom: '16px', // For scrollbar
      scrollSnapType: 'x mandatory',
    };
  } else if (layout === 'mosaic' && !isMobile) {
    listStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridAutoRows: 'minmax(200px, auto)',
      gap: '24px',
    };
  } else {
    listStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${displayColumns}, 1fr)`,
      gap: isMobile ? '32px' : '24px',
    };
  }

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
        padding: isMobile ? '40px 24px' : '80px 48px',
        maxWidth: props._layoutWidth ?? '100%',
        margin: '0 auto',
        ...props._paddingStyle,
      }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', marginBottom: '40px', gap: isMobile ? '16px' : '0' }}>
        <h2 style={{
          fontSize: isMobile ? '32px' : '40px',
          fontWeight: 700,
          letterSpacing: '-1px',
          color: headingColor,
          fontFamily: 'var(--theme-font-heading), sans-serif',
        }}>
          {heading}
        </h2>
        <a href={props.linkUrl || '#'} style={{ color: linkColor, fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
          {linkText} →
        </a>
      </div>
      <div style={listStyle}>
        {items.map((item: any, i: number) => {
          
          let itemStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            cursor: 'pointer',
          };

          if (layout === 'carousel') {
            itemStyle.minWidth = isMobile ? '280px' : '320px';
            itemStyle.scrollSnapAlign = 'start';
          } else if (layout === 'mosaic' && !isMobile) {
             if (i === 0) { itemStyle.gridColumn = 'span 2'; itemStyle.gridRow = 'span 2'; }
             else if (i === 1) { itemStyle.gridColumn = 'span 2'; itemStyle.gridRow = 'span 1'; }
          }

          return (
            <div key={i} style={itemStyle}>
              <div style={{
                width: '100%',
                height: (layout === 'mosaic' && !isMobile && i === 0) ? '100%' : 'auto',
                aspectRatio: (layout === 'mosaic' && !isMobile && i === 0) ? 'auto' : '1/1',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: cardBg,
                position: 'relative',
              }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: titleColor, marginBottom: '4px' }}>
                  {item.name}
                </h4>
                {item.price && (
                  <p style={{ fontSize: '15px', fontWeight: 700, color: priceColor }}>
                    {item.price}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollectionSection;
