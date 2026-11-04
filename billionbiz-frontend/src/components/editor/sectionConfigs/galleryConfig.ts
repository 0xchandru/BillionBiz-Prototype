import type { SectionConfig } from './types';

export const galleryConfig: SectionConfig = {
  type: 'Gallery',
  name: 'Gallery',
  category: 'content',
  description: 'Showcase photos and graphics in an image gallery.',
  layouts: [
    { id: 'grid', label: 'Grid', description: 'Standard photo grid' },
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
                defaultValue: 'Gallery',
              },
            ],
          },
          {
            id: 'images',
            label: 'Images',
            fields: [
              {
                key: 'images',
                label: 'Images',
                type: 'list',
                addLabel: 'Add Image',
                itemLabel: (item: any) => item.alt || 'Gallery Image',
                defaultItem: {
                  src: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
                  alt: 'New Gallery Image',
                },
                fields: [
                  { key: 'src', label: 'Image URL', type: 'image' },
                  { key: 'alt', label: 'Alt Text', type: 'text' },
                ],
                defaultValue: [
                  { src: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop', alt: 'Gallery 1' },
                  { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop', alt: 'Gallery 2' },
                  { src: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&h=600&fit=crop', alt: 'Gallery 3' },
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
            ],
          },
          {
            id: 'layout-settings',
            label: 'Grid Settings',
            fields: [
              {
                key: 'columns',
                label: 'Columns',
                type: 'slider',
                min: 2,
                max: 5,
                step: 1,
                defaultValue: 3,
              },
            ],
          },
        ],
      },
    ];
  },
  defaultProps: {
    selectedLayout: 'grid',
    heading: 'Gallery',
    columns: 3,
    bgColor: 'inherit',
    headingColor: 'inherit',
    images: [
      { src: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop', alt: 'Gallery 1' },
      { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop', alt: 'Gallery 2' },
      { src: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&h=600&fit=crop', alt: 'Gallery 3' },
    ],
  },
};
