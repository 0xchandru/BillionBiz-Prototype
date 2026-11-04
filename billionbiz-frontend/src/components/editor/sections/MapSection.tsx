import React from 'react';

const MapSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  const heading = props.heading ?? 'Visit Our Store';
  const address = props.address ?? '123 Design Street, Creative District, San Francisco, CA 94102';
  const embedUrl = props.embedUrl ?? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977477265785!2d-122.41941528468156!3d37.77492977975903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sTwitter+HQ!5e0!3m2!1sen!2sus!4v1';
  const phone = props.phone ?? '+1 (555) 123-4567';
  const email = props.email ?? 'hello@billionbiz.com';
  const hours = props.hours ?? 'Mon-Fri: 9am - 6pm | Sat: 10am - 4pm';

  const bgColor = props.bgColor || 'var(--theme-bg-section, var(--theme-background, #ffffff))';
  const headingColor = props.headingColor || 'var(--theme-text-heading, var(--theme-text, #0f172a))';
  const textColor = props.textColor || 'var(--theme-text-body, var(--theme-text, #334155))';
  const accentColor = props.accentColor || 'var(--theme-brand-primary, #6366f1)';

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
      <div style={{ display: 'flex', flexDirection: isMobile || isTablet ? 'column' : 'row', gap: '48px', alignItems: 'stretch' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{
            fontSize: isMobile ? '32px' : '40px',
            fontWeight: 700,
            letterSpacing: '-1px',
            color: headingColor,
            fontFamily: 'var(--theme-font-heading), sans-serif',
          }}>
            {heading}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: textColor, opacity: 0.6, marginBottom: '8px' }}>Address</p>
              <p style={{ fontSize: '16px', lineHeight: 1.6, color: textColor }}>{address}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: textColor, opacity: 0.6, marginBottom: '8px' }}>Phone</p>
              <p style={{ fontSize: '16px', color: accentColor, fontWeight: 500 }}>{phone}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: textColor, opacity: 0.6, marginBottom: '8px' }}>Email</p>
              <p style={{ fontSize: '16px', color: accentColor, fontWeight: 500 }}>{email}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: textColor, opacity: 0.6, marginBottom: '8px' }}>Hours</p>
              <p style={{ fontSize: '16px', lineHeight: 1.6, color: textColor }}>{hours}</p>
            </div>
          </div>
        </div>
        <div style={{
          flex: 1.5,
          borderRadius: '16px',
          overflow: 'hidden',
          minHeight: '400px',
          boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
        }}>
          <iframe
            src={embedUrl}
            title="Store location"
            style={{ width: '100%', height: '100%', border: 'none', minHeight: '400px' }}
            loading="lazy"
          />
        </div>
      </div>
      </div>
    </section>
  );
};

export default MapSection;
