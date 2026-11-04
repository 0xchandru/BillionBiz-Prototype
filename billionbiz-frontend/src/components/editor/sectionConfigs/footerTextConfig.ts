import type { SectionConfig } from './types';

export const footerTextConfig: SectionConfig = {
  type: 'FooterText',
  name: 'Footer Text',
  category: 'footer',
  description: 'A block of text for your footer.',
  layouts: [
    { id: 'standard', label: 'Standard', description: 'Text block with title' },
  ],
  getTabs: (_selectedLayout = 'standard') => {
    return [
      {
        id: 'content',
        label: 'Content',
        groups: [
          {
            id: 'text',
            label: 'Text',
            fields: [
              {
                key: 'title',
                label: 'Title',
                type: 'text',
                defaultValue: 'About Our Store',
              },
              {
                key: 'text',
                label: 'Content',
                type: 'textarea',
                defaultValue: 'We sell the best products in the world. Enjoy your shopping experience!',
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
            id: 'typography',
            label: 'Typography',
            fields: [
              {
                key: 'alignment',
                label: 'Alignment',
                type: 'segmented',
                options: [
                  { label: 'Left', value: 'left' },
                  { label: 'Center', value: 'center' },
                  { label: 'Right', value: 'right' },
                ],
                defaultValue: 'left',
              },
            ],
          },
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
    selectedLayout: 'standard',
    title: 'About Our Store',
    text: 'We sell the best products in the world. Enjoy your shopping experience!',
    alignment: 'left',
    bgColor: 'inherit',
    textColor: 'inherit',
  },
};
