import type { SectionConfig } from './types';

export const footerMenuConfig: SectionConfig = {
  type: 'FooterMenu',
  name: 'Footer Menu',
  category: 'footer',
  description: 'A list of links for your footer.',
  layouts: [
    { id: 'vertical', label: 'Vertical', description: 'Links stacked vertically' },
    { id: 'horizontal', label: 'Horizontal', description: 'Links side by side' },
  ],
  getTabs: (_selectedLayout = 'vertical') => {
    return [
      {
        id: 'content',
        label: 'Content',
        groups: [
          {
            id: 'menu',
            label: 'Menu',
            fields: [
              {
                key: 'title',
                label: 'Menu Title',
                type: 'text',
                defaultValue: 'Quick Links',
              },
              {
                key: 'links',
                label: 'Menu Links',
                type: 'list',
                isStringList: true,
                addLabel: 'Add Link',
                defaultValue: ['Home', 'Shop', 'About Us', 'Contact'],
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
    selectedLayout: 'vertical',
    title: 'Quick Links',
    links: ['Home', 'Shop', 'About Us', 'Contact'],
    alignment: 'left',
    bgColor: 'inherit',
    textColor: 'inherit',
  },
};
