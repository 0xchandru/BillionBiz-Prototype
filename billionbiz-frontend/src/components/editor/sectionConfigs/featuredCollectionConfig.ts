import type { SectionConfig } from './types';

export const featuredCollectionConfig: SectionConfig = {
  type: 'FeaturedCollection',
  name: 'Featured Collection',
  category: 'commerce',
  description: 'Display a grid or carousel of products.',
  layouts: [
    { id: 'grid', label: 'Grid', description: 'Standard product grid' },
    { id: 'carousel', label: 'Carousel', description: 'Horizontal scrollable list' },
    { id: 'mosaic', label: 'Mosaic', description: 'Alternating sized cards' },
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
                defaultValue: 'Featured Collection',
              },
              {
                key: 'linkText',
                label: 'View All Link Text',
                type: 'text',
                defaultValue: 'View all',
              },
              {
                key: 'linkUrl',
                label: 'View All Link',
                type: 'url',
              },
            ],
          },
          {
            id: 'data-source',
            label: 'Catalogue source',
            fields: [
              {
                key: 'productLimit',
                label: 'Number of products',
                type: 'slider',
                min: 1,
                max: 24,
                step: 1,
                defaultValue: 8,
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
                label: 'Product Title Color',
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
                key: 'cardBg',
                label: 'Product Card Background',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'linkColor',
                label: 'View All Link Color',
                type: 'color',
                defaultValue: 'inherit',
              },
            ],
          },
          {
            id: 'grid-settings',
            label: 'Grid Settings',
            showWhen: { field: 'selectedLayout', value: 'grid' },
            fields: [
              {
                key: 'columns',
                label: 'Columns (Desktop)',
                type: 'slider',
                min: 2,
                max: 5,
                step: 1,
                defaultValue: 4,
              },
            ],
          },
        ],
      },
    ];
  },
  defaultProps: {
    selectedLayout: 'grid',
    heading: 'Featured Collection',
    linkText: 'View all',
    columns: 4,
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    priceColor: 'inherit',
    cardBg: 'inherit',
    linkColor: 'inherit',
  },
};
