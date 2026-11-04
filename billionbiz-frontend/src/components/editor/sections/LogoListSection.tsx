import React from 'react';

const LogoListSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';

  const heading = props.heading ?? 'Trusted by Leading Brands';
  const logos = props.logos || [
    { name: 'Airbnb' },
    { name: 'Spotify' },
    { name: 'Stripe' },
    { name: 'Notion' },
    { name: 'Figma' },
    { name: 'Slack' },
  ];

  const bgColor = props.bgColor || 'var(--theme-bg-surface, var(--theme-background, #f8fafc))';
  const headingColor = props.headingColor || 'var(--theme-text-muted, var(--theme-text, #64748b))';
  const textColor = props.textColor || 'var(--theme-text-muted, var(--theme-text, #64748b))';

  return (
    <section style={{
      width: '100%',
      backgroundColor: bgColor,
      position: 'relative',
      overflow: 'hidden',
      ...props._marginStyle,
    }}>
      <div style={{
        padding: isMobile ? '40px 24px' : '60px 48px',
        textAlign: 'center',
        maxWidth: props._layoutWidth ?? '100%',
        margin: '0 auto',
        ...props._paddingStyle,
      }}>
        {heading && (
          <p style={{
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: headingColor,
            opacity: 0.6,
            marginBottom: '32px',
          }}>
            {heading}
          </p>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isMobile ? '24px' : '48px',
          flexWrap: 'wrap',
        }}>
          {logos.map((logo: any, i: number) => (
            <div key={i} style={{
              fontSize: '24px',
              fontWeight: 800,
              color: textColor,
              opacity: 0.35,
              letterSpacing: '-0.5px',
              fontFamily: 'var(--theme-font-heading), sans-serif',
            }}>
              {logo.image ? (
                <img src={logo.image} alt={logo.name} style={{ height: '32px', objectFit: 'contain', opacity: 0.5 }} />
              ) : (
                logo.name
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoListSection;
