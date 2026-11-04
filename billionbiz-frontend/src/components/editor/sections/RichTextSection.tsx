import React from 'react';

const RichTextSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';

  const heading = props.heading ?? 'Our Mission';
  const body = props.body ?? 'We believe in creating products that are both beautiful and functional. Our team of designers and engineers work together to push the boundaries of what\'s possible, crafting experiences that delight and inspire.';
  const alignment = props.alignment ?? 'center';
  const bgColor = props.bgColor || props.backgroundColor || 'var(--theme-bg-section, var(--theme-background))';
  const headingColor = props.headingColor || 'var(--theme-text-heading)';
  const textColor = props.textColor || 'var(--theme-text-body)';

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
        textAlign: alignment as any,
        maxWidth: props._layoutWidth ?? '100%',
        margin: '0 auto',
        ...props._paddingStyle,
      }}>
      <div style={{ maxWidth: '800px', margin: alignment === 'center' ? '0 auto' : '0' }}>
        <h2 style={{
          fontSize: isMobile ? '32px' : '40px',
          fontWeight: 700,
          letterSpacing: '-1px',
          color: headingColor,
          marginBottom: '24px',
          lineHeight: 1.2,
          fontFamily: 'var(--theme-font-heading), sans-serif',
        }}>
          {heading}
        </h2>
        <p style={{
          fontSize: isMobile ? '16px' : '18px',
          lineHeight: 1.8,
          color: textColor,
          opacity: 0.85,
        }}>
          {body}
        </p>
      </div>
      </div>
    </section>
  );
};

export default RichTextSection;
