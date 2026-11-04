import type { SectionConfig } from './types';

export const testimonialsConfig: SectionConfig = {
  type: 'Testimonials',
  name: 'Testimonials',
  category: 'content',
  description: 'Showcase customer reviews and testimonials.',
  layouts: [
    { id: 'grid', label: 'Grid', description: 'Testimonials in a grid' },
    { id: 'carousel', label: 'Carousel', description: 'Scrollable testimonials' },
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
                defaultValue: 'What Our Customers Say',
              },
            ],
          },
          {
            id: 'testimonials',
            label: 'Testimonials',
            fields: [
              {
                key: 'testimonials',
                label: 'Testimonials',
                type: 'list',
                addLabel: 'Add Testimonial',
                itemLabel: (item: any) => item.name || 'Testimonial',
                defaultItem: {
                  name: 'New Customer',
                  role: 'Customer',
                  quote: 'Great product!',
                  rating: 5,
                  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
                },
                fields: [
                  {
                    key: 'quote',
                    label: 'Quote',
                    type: 'textarea',
                  },
                  {
                    key: 'name',
                    label: 'Name',
                    type: 'text',
                  },
                  {
                    key: 'role',
                    label: 'Role',
                    type: 'text',
                  },
                  {
                    key: 'rating',
                    label: 'Rating (1-5)',
                    type: 'slider',
                    min: 1,
                    max: 5,
                    step: 1,
                  },
                  {
                    key: 'avatar',
                    label: 'Avatar',
                    type: 'image',
                  },
                ],
                defaultValue: [
                  { name: 'Sarah Johnson', role: 'Interior Designer', quote: 'The quality of these products is outstanding.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
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
                key: 'textColor',
                label: 'Quote Text Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'nameColor',
                label: 'Author Name Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'starColor',
                label: 'Star Rating Color',
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
    heading: 'What Our Customers Say',
    bgColor: 'inherit',
    headingColor: 'inherit',
    cardBg: 'inherit',
    borderColor: 'inherit',
    textColor: 'inherit',
    nameColor: 'inherit',
    starColor: 'inherit',
    testimonials: [
      { name: 'Sarah Johnson', role: 'Interior Designer', quote: 'The quality of these products is outstanding.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
    ],
  },
};
