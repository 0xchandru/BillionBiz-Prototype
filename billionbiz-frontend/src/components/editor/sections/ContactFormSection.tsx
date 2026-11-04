import React from 'react';

const ContactFormSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';

  const heading = props.heading ?? 'Get in Touch';
  const description = props.description ?? 'Have a question or need help? Fill out the form below and our team will get back to you within 24 hours.';
  const buttonText = props.buttonText ?? 'Send Message';
  const bgColor = props.bgColor || props.backgroundColor || 'var(--theme-bg-section, var(--theme-background))';
  const headingColor = props.headingColor || 'var(--theme-text-heading)';
  const textColor = props.textColor || 'var(--theme-text-body)';
  const inputBg = props.inputBg || 'var(--theme-bg-surface, #f8fafc)';
  const borderColor = props.borderColor || 'var(--theme-border-border, #e2e8f0)';
  const inputColor = props.inputColor || 'var(--theme-text-body)';
  const buttonBg = props.buttonBg || 'var(--theme-btn-primary-bg, var(--theme-brand-primary))';
  const buttonColor = props.buttonColor || 'var(--theme-btn-primary-text, #ffffff)';

  const inputStyle: React.CSSProperties = {
    padding: '14px 16px',
    borderRadius: '8px',
    border: `1px solid ${borderColor}`,
    fontSize: '15px',
    fontFamily: 'inherit',
    backgroundColor: inputBg,
    color: inputColor,
    outline: 'none',
  };

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
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontSize: isMobile ? '32px' : '40px',
            fontWeight: 700,
            letterSpacing: '-1px',
            color: headingColor,
            marginBottom: '16px',
            fontFamily: 'var(--theme-font-heading), sans-serif',
          }}>
            {heading}
          </h2>
          <p style={{
            fontSize: '17px',
            lineHeight: 1.6,
            color: textColor,
            opacity: 0.85,
          }}>
            {description}
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
            <input
              type="text"
              placeholder="First name"
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="text"
              placeholder="Last name"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <input
            type="email"
            placeholder="Email address"
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Subject"
            style={inputStyle}
          />
          <textarea
            placeholder="Your message"
            rows={5}
            style={{
              ...inputStyle,
              resize: 'vertical',
            }}
          />
          <button style={{
            padding: '16px',
            backgroundColor: buttonBg,
            color: buttonColor,
            border: 'none',
            borderRadius: 'var(--theme-btn-primary-radius, 8px)',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '8px',
          }}>
            {buttonText}
          </button>
        </form>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
