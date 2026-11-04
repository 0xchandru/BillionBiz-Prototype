import type { SectionConfig } from './types';

export const utilityBarConfig: SectionConfig = {
  type: 'UtilityBar',
  name: 'Utility Bar',
  category: 'header',
  description: 'Secondary top bar for support info, language, or currency.',
  layouts: [
    { id: 'left-right', label: 'Left & Right', description: 'Info on left, settings on right' },
    { id: 'centered', label: 'Centered', description: 'All items centered together' },
    { id: 'three-column', label: '3 Columns', description: 'Left, center, and right alignment' },
  ],
  getTabs: (_selectedLayout = 'left-right') => {
    return [
      {
        id: 'content',
        label: 'Content',
        groups: [
          {
            id: 'support-info',
            label: 'Support Info',
            fields: [
              {
                key: 'supportEmail',
                label: 'Support Email',
                type: 'text',
                defaultValue: 'support@billionbiz.in',
              },
              {
                key: 'supportPhone',
                label: 'Support Phone',
                type: 'text',
                defaultValue: '+1 (555) 123-4567',
              },
            ],
          },
          {
            id: 'settings',
            label: 'Store Settings',
            fields: [
              {
                key: 'showLanguage',
                label: 'Show Language Selector',
                type: 'toggle',
                defaultValue: true,
              },
              {
                key: 'language',
                label: 'Default Language',
                type: 'text',
                defaultValue: 'English',
                showWhen: { field: 'showLanguage', value: true },
              },
              {
                key: 'showCurrency',
                label: 'Show Currency Selector',
                type: 'toggle',
                defaultValue: true,
              },
              {
                key: 'currency',
                label: 'Default Currency',
                type: 'text',
                defaultValue: 'USD',
                showWhen: { field: 'showCurrency', value: true },
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
                label: 'Background Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'textColor',
                label: 'Text Color',
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
    selectedLayout: 'left-right',
    supportEmail: 'support@billionbiz.in',
    supportPhone: '+1 (555) 123-4567',
    showLanguage: true,
    language: 'English',
    showCurrency: true,
    currency: 'USD',
    bgColor: 'inherit',
    textColor: 'inherit',
  },
};
