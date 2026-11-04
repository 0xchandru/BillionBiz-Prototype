import type { SectionConfig } from './types';

export const imageWithTextConfig: SectionConfig = {
  type: 'ImageWithText',
  name: 'Image with Text',
  category: 'content',
  description: 'An image paired with explanatory text.',
  layouts: [
    { id: 'image-left', label: 'Image Left', description: 'Image on left, text on right' },
    { id: 'image-right', label: 'Image Right', description: 'Image on right, text on left' },
  ],
  getTabs: (_selectedLayout = 'image-left') => {
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
                key: 'heading',
                label: 'Heading',
                type: 'text',
                defaultValue: 'Crafted with Purpose',
              },
              {
                key: 'body',
                label: 'Body Text',
                type: 'textarea',
                defaultValue: 'Every piece in our collection is thoughtfully designed.',
              },
              {
                key: 'buttonText',
                label: 'Button Text',
                type: 'text',
                defaultValue: 'Learn More',
              },
              {
                key: 'buttonLink',
                label: 'Button Link',
                type: 'url',
              },
            ],
          },
          {
            id: 'image',
            label: 'Image',
            fields: [
              {
                key: 'image',
                label: 'Image',
                type: 'image',
                defaultValue: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&h=700&fit=crop',
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
                label: 'Body Text Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'buttonColor',
                label: 'Button / Link Color',
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
    selectedLayout: 'image-left',
    heading: 'Crafted with Purpose',
    body: 'Every piece in our collection is thoughtfully designed.',
    buttonText: 'Learn More',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&h=700&fit=crop',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    buttonColor: 'inherit',
  },
};
