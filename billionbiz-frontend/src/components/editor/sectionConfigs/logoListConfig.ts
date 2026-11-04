import type { SectionConfig } from './types';

export const logoListConfig: SectionConfig = {
  type: 'LogoList',
  name: 'Logo List',
  category: 'content',
  description: 'Display brand logos and partner emblems.',
  layouts: [
    { id: 'standard', label: 'Standard', description: 'Inline logo list' },
  ],
  getTabs: (_selectedLayout = 'standard') => {
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
                defaultValue: 'Trusted by Leading Brands',
              },
            ],
          },
          {
            id: 'logos',
            label: 'Logos',
            fields: [
              {
                key: 'logos',
                label: 'Brands',
                type: 'list',
                addLabel: 'Add Brand',
                itemLabel: (item: any) => item.name || 'Brand',
                defaultItem: {
                  name: 'New Brand',
                  image: '',
                },
                fields: [
                  { key: 'name', label: 'Brand Name', type: 'text' },
                  { key: 'image', label: 'Logo Image (optional)', type: 'image' },
                ],
                defaultValue: [
                  { name: 'Airbnb' },
                  { name: 'Spotify' },
                  { name: 'Stripe' },
                  { name: 'Notion' },
                  { name: 'Figma' },
                  { name: 'Slack' },
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
                key: 'textColor',
                label: 'Logo Text Color',
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
    heading: 'Trusted by Leading Brands',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    logos: [
      { name: 'Airbnb' },
      { name: 'Spotify' },
      { name: 'Stripe' },
      { name: 'Notion' },
      { name: 'Figma' },
      { name: 'Slack' },
    ],
  },
};
