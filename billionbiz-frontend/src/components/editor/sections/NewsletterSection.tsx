import React from 'react';

const NewsletterSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';

  const heading = props.heading ?? 'Stay in the Loop';
  const description = props.description ?? 'Subscribe to our newsletter and get 10% off your first order, plus exclusive access to new arrivals and special deals.';
  const buttonText = props.buttonText ?? 'Subscribe';
  const bgColor = props.bgColor || props.backgroundColor || 'var(--theme-bg-surface, #0f172a)';
  const headingColor = props.headingColor || props.textColor || 'var(--theme-text-heading, #ffffff)';
  const textColor = props.textColor || 'var(--theme-text-body, #ffffff)';
  const inputBg = props.inputBg || 'var(--theme-bg-container, rgba(255,255,255,0.1))';
  const buttonBg = props.buttonBg || 'var(--theme-btn-primary-bg, var(--theme-brand-primary))';
  const buttonColor = props.buttonColor || 'var(--theme-btn-primary-text, #ffffff)';

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
        textAlign: 'center',
        maxWidth: props._layoutWidth ?? '100%',
        margin: '0 auto',
        ...props._paddingStyle,
      }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: isMobile ? '28px' : '36px',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          color: headingColor,
          marginBottom: '16px',
          fontFamily: 'var(--theme-font-heading), sans-serif',
        }}>
          {heading}
        </h2>
        <p style={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: textColor,
          opacity: 0.85,
          marginBottom: '32px',
        }}>
          {description}
        </p>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          maxWidth: '480px',
          margin: '0 auto',
        }}>
          <input
            type="email"
            placeholder="Enter your email address"
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: inputBg,
              color: textColor,
              fontSize: '15px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button style={{
            padding: '14px 28px',
            backgroundColor: buttonBg,
            color: buttonColor,
            border: 'none',
            borderRadius: 'var(--theme-btn-primary-radius, 8px)',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            {buttonText}
          </button>
        </div>
      </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
