import React from 'react';
import { Check } from 'lucide-react';

const PricingTableSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  const heading = props.heading ?? 'Simple, Transparent Pricing';
  const plans = props.plans || [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      features: ['Up to 100 products', '2 staff accounts', 'Basic analytics', 'Email support', '2% transaction fee'],
      buttonText: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      features: ['Unlimited products', '5 staff accounts', 'Advanced analytics', 'Priority support', '1% transaction fee', 'Custom domain', 'Gift cards'],
      buttonText: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: '$299',
      period: '/month',
      features: ['Unlimited everything', '15 staff accounts', 'Custom reports', 'Dedicated manager', '0.5% transaction fee', 'Custom domain', 'Advanced API access'],
      buttonText: 'Contact Sales',
      highlighted: false,
    },
  ];

  const bgColor = props.bgColor || 'var(--theme-bg-section, var(--theme-background, #ffffff))';
  const headingColor = props.headingColor || 'var(--theme-text-heading, var(--theme-text, #0f172a))';
  const cardBg = props.cardBg || 'var(--theme-bg-card, var(--theme-surface, #ffffff))';
  const borderColor = props.borderColor || 'var(--theme-border-default, #e2e8f0)';
  const titleColor = props.titleColor || 'var(--theme-text-heading, var(--theme-text, #0f172a))';
  const priceColor = props.priceColor || 'var(--theme-text-heading, var(--theme-text, #0f172a))';
  const textColor = props.textColor || 'var(--theme-text-body, var(--theme-text, #334155))';
  const buttonBg = props.buttonBg || 'var(--theme-brand-primary, #6366f1)';
  const highlightedBg = props.highlightedBg || 'var(--theme-brand-primary, #6366f1)';

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
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: isMobile ? '32px' : '40px',
            fontWeight: 700,
            letterSpacing: '-1px',
            color: headingColor,
            fontFamily: 'var(--theme-font-heading), sans-serif',
          }}>
            {heading}
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${isMobile ? 1 : (isTablet ? 2 : Math.min(plans.length, 3))}, 1fr)`,
          gap: '24px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}>
          {plans.map((plan: any, i: number) => {
            const isHl = plan.highlighted;
            const currentCardBg = isHl ? highlightedBg : cardBg;
            const currentTextColor = isHl ? 'var(--theme-text-inverse, #ffffff)' : textColor;
            const currentTitleColor = isHl ? 'var(--theme-text-inverse, #ffffff)' : titleColor;
            const currentPriceColor = isHl ? 'var(--theme-text-inverse, #ffffff)' : priceColor;

            return (
              <div key={i} style={{
                borderRadius: '20px',
                border: isHl ? `2px solid ${highlightedBg}` : `1px solid ${borderColor}`,
                padding: '40px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                backgroundColor: currentCardBg,
                color: currentTextColor,
                position: 'relative',
                boxShadow: isHl ? '0 20px 40px -10px rgba(0,0,0,0.15)' : 'none',
                transform: isHl && !isMobile && !isTablet ? 'scale(1.05)' : 'none',
              }}>
                {isHl && (
                  <span style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--theme-brand-secondary, #4f46e5)',
                    color: 'var(--theme-text-inverse, #ffffff)',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 16px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: currentTitleColor }}>
                    {plan.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', color: currentPriceColor }}>
                      {plan.price}
                    </span>
                    <span style={{ fontSize: '16px', opacity: 0.7 }}>{plan.period}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {plan.features.map((feature: string, j: number) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: currentTextColor }}>
                      <Check size={16} style={{ flexShrink: 0, color: isHl ? 'var(--theme-text-inverse, #ffffff)' : buttonBg }} />
                      {feature}
                    </div>
                  ))}
                </div>
                <button style={{
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isHl ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${buttonBg}`,
                  backgroundColor: isHl ? '#ffffff' : 'transparent',
                  color: isHl ? highlightedBg : buttonBg,
                  transition: 'all 0.2s',
                }}>
                  {plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingTableSection;
