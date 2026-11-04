import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';

  const heading = props.heading ?? 'Frequently Asked Questions';
  const items = props.items || [
    { question: 'What is your return policy?', answer: 'We offer a 30-day hassle-free return policy. If you\'re not completely satisfied with your purchase, simply reach out to our support team and we\'ll arrange a return or exchange.' },
    { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business day delivery. All orders over $99 qualify for free standard shipping.' },
    { question: 'Do you ship internationally?', answer: 'Yes! We ship to over 50 countries worldwide. International shipping typically takes 10-15 business days depending on the destination.' },
    { question: 'How do I track my order?', answer: 'Once your order ships, you\'ll receive an email with a tracking number. You can use this to monitor your package on our website or the carrier\'s tracking page.' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay, and Shop Pay for a seamless checkout experience.' },
  ];

  const bgColor = props.bgColor || props.backgroundColor || 'var(--theme-bg-section, var(--theme-background))';
  const headingColor = props.headingColor || 'var(--theme-text-heading)';
  const itemBg = props.itemBg || 'var(--theme-bg-surface, #ffffff)';
  const borderColor = props.borderColor || 'var(--theme-border-border, #e2e8f0)';
  const questionColor = props.questionColor || 'var(--theme-text-heading)';
  const textColor = props.textColor || 'var(--theme-text-body)';
  const iconColor = props.iconColor || 'var(--theme-brand-primary)';

  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
      <h2 style={{
        fontSize: isMobile ? '32px' : '40px',
        fontWeight: 700,
        letterSpacing: '-1px',
        color: headingColor,
        textAlign: 'center',
        marginBottom: '48px',
        fontFamily: 'var(--theme-font-heading), sans-serif',
      }}>
        {heading}
      </h2>
      <div style={{ maxWidth: '768px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item: any, i: number) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} style={{
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: itemBg,
              transition: 'all 0.2s',
            }}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: questionColor,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                {item.question}
                <ChevronDown
                  size={18}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                    marginLeft: '16px',
                    color: iconColor,
                  }}
                />
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 24px 20px',
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: textColor,
                  opacity: 0.85,
                }}>
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
};

export default FAQSection;
