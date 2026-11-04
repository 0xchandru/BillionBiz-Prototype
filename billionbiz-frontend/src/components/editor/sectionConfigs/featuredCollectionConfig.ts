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
            id: 'products',
            label: 'Products',
            fields: [
              {
                key: 'products',
                label: 'Selected Products',
                type: 'list',
                addLabel: 'Add Product',
                itemLabel: (item: any) => item.name || 'Product',
                defaultItem: {
                  name: 'New Product',
                  price: '$99.00',
                  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
                },
                fields: [
                  {
                    key: 'name',
                    label: 'Product Name',
                    type: 'text',
                  },
                  {
                    key: 'price',
                    label: 'Price',
                    type: 'text',
                  },
                  {
                    key: 'image',
                    label: 'Image',
                    type: 'image',
                  },
                ],
                defaultValue: [
                  { name: 'Artisan Ceramic Vase', price: '$89.00', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop' },
                  { name: 'Handwoven Throw', price: '$129.00', image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400&h=400&fit=crop' },
                  { name: 'Oak Side Table', price: '$249.00', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' },
                  { name: 'Linen Cushion Set', price: '$67.00', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop' },
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
    products: [
      { name: 'Artisan Ceramic Vase', price: '$89.00', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop' },
      { name: 'Handwoven Throw', price: '$129.00', image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400&h=400&fit=crop' },
      { name: 'Oak Side Table', price: '$249.00', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' },
      { name: 'Linen Cushion Set', price: '$67.00', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop' },
    ],
  },
};
