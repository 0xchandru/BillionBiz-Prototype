import type { SectionConfig } from './types';

export const pricingTableConfig: SectionConfig = {
  type: 'PricingTable',
  name: 'Pricing Table',
  category: 'content',
  description: 'Showcase multiple pricing tiers and plans.',
  layouts: [
    { id: 'grid', label: 'Grid', description: 'Tiered pricing cards' },
  ],
  getTabs: (_selectedLayout = 'grid') => {
    return [
      {
        id: 'content',
        label: 'Content',
        groups: [
          {
            id: 'heading',
            label: 'Heading',
            fields: [
              {
                key: 'heading',
                label: 'Heading Text',
                type: 'text',
                defaultValue: 'Simple, Transparent Pricing',
              },
            ],
          },
          {
            id: 'plans',
            label: 'Pricing Plans',
            fields: [
              {
                key: 'plans',
                label: 'Plans',
                type: 'list',
                addLabel: 'Add Plan',
                itemLabel: (item: any) => item.name || 'Plan',
                defaultItem: {
                  name: 'New Plan',
                  price: '$49',
                  period: '/month',
                  features: ['Feature 1', 'Feature 2'],
                  buttonText: 'Get Started',
                  highlighted: false,
                },
                fields: [
                  { key: 'name', label: 'Plan Name', type: 'text' },
                  { key: 'price', label: 'Price', type: 'text' },
                  { key: 'period', label: 'Billing Period', type: 'text' },
                  { key: 'buttonText', label: 'Button Text', type: 'text' },
                  { key: 'highlighted', label: 'Highlight Plan', type: 'toggle' },
                ],
                defaultValue: [
                  { name: 'Starter', price: '$29', period: '/month', features: ['Up to 100 products', '2 staff accounts', 'Basic analytics'], buttonText: 'Start Free Trial', highlighted: false },
                  { name: 'Professional', price: '$79', period: '/month', features: ['Unlimited products', '5 staff accounts', 'Advanced analytics'], buttonText: 'Start Free Trial', highlighted: true },
                  { name: 'Enterprise', price: '$299', period: '/month', features: ['Unlimited everything', '15 staff accounts', 'Custom reports'], buttonText: 'Contact Sales', highlighted: false },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'design',
        label: 'Design',
        groups: [
          {
            id: 'colors',
            label: 'Colors',
            fields: [
              {
                key: 'bgColor',
                label: 'Section Background',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'headingColor',
                label: 'Heading Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'cardBg',
                label: 'Card Background',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'borderColor',
                label: 'Card Border Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'titleColor',
                label: 'Plan Title Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'priceColor',
                label: 'Price Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'textColor',
                label: 'Features Text Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'buttonBg',
                label: 'Button Background',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'highlightedBg',
                label: 'Highlighted Card Background',
                type: 'color',
                defaultValue: 'inherit',
              },
            ],
          },
        ],
      },
    ];
  },
  defaultProps: {
    selectedLayout: 'grid',
    heading: 'Simple, Transparent Pricing',
    bgColor: 'inherit',
    headingColor: 'inherit',
    cardBg: 'inherit',
    borderColor: 'inherit',
    titleColor: 'inherit',
    priceColor: 'inherit',
    textColor: 'inherit',
    buttonBg: 'inherit',
    highlightedBg: 'inherit',
    plans: [
      { name: 'Starter', price: '$29', period: '/month', features: ['Up to 100 products', '2 staff accounts', 'Basic analytics', 'Email support', '2% transaction fee'], buttonText: 'Start Free Trial', highlighted: false },
      { name: 'Professional', price: '$79', period: '/month', features: ['Unlimited products', '5 staff accounts', 'Advanced analytics', 'Priority support', '1% transaction fee'], buttonText: 'Start Free Trial', highlighted: true },
      { name: 'Enterprise', price: '$299', period: '/month', features: ['Unlimited everything', '15 staff accounts', 'Custom reports', 'Dedicated manager'], buttonText: 'Contact Sales', highlighted: false },
    ],
  },
};
