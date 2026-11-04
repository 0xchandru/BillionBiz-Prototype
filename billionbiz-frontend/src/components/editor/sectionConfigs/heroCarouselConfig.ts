import type { SectionConfig } from './types';

export const heroCarouselConfig: SectionConfig = {
  type: 'HeroCarousel',
  name: 'Hero Carousel',
  category: 'hero',
  description: 'A sliding carousel of hero banners.',
  layouts: [
    { id: 'full', label: 'Full Width', description: 'Carousel spans entire width' },
    { id: 'contained', label: 'Contained', description: 'Carousel inside a container' },
  ],
  getTabs: (_selectedLayout = 'full') => {
    return [
      {
        id: 'content',
        label: 'Content',
        groups: [
          {
            id: 'slides',
            label: 'Slides',
            fields: [
              {
                key: 'slides',
                label: 'Slides',
                type: 'list',
                addLabel: 'Add Slide',
                itemLabel: (item: any) => item.heading || 'Slide',
                defaultItem: {
                  heading: 'New Slide',
                  description: 'Description for this slide.',
                  image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=600&fit=crop'
                },
                fields: [
                  {
                    key: 'heading',
                    label: 'Heading',
                    type: 'text',
                  },
                  {
                    key: 'description',
                    label: 'Description',
                    type: 'textarea',
                  },
                  {
                    key: 'image',
                    label: 'Image',
                    type: 'image',
                  },
                  {
                    key: 'buttonText',
                    label: 'Button Text',
                    type: 'text',
                    defaultValue: 'Shop Now'
                  },
                ],
                defaultValue: [
                  { 
                    heading: 'Summer Collection', 
                    description: 'Brighten up your space with our new summer arrivals.', 
                    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=600&fit=crop',
                    buttonText: 'Shop Summer'
                  },
                  { 
                    heading: 'Modern Essentials', 
                    description: 'Clean lines and minimalist design for everyday living.', 
                    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=600&fit=crop',
                    buttonText: 'Shop Modern'
                  },
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
                label: 'Description Color',
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
                key: 'buttonColor',
                label: 'Button Text Color',
                type: 'color',
                defaultValue: 'inherit',
              },
            ],
          },
          {
            id: 'settings',
            label: 'Carousel Settings',
            fields: [
              {
                key: 'autoPlay',
                label: 'Auto Play',
                type: 'toggle',
                defaultValue: true,
              },
              {
                key: 'interval',
                label: 'Slide Interval (s)',
                type: 'slider',
                min: 2,
                max: 10,
                step: 1,
                defaultValue: 5,
                showWhen: { field: 'autoPlay', value: true }
              },
            ],
          },
        ],
      },
    ];
  },
  defaultProps: {
    selectedLayout: 'full',
    autoPlay: true,
    interval: 5,
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    buttonBg: 'inherit',
    buttonColor: 'inherit',
    slides: [
      { 
        heading: 'Summer Collection', 
        description: 'Brighten up your space with our new summer arrivals.', 
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=600&fit=crop',
        buttonText: 'Shop Summer'
      },
      { 
        heading: 'Modern Essentials', 
        description: 'Clean lines and minimalist design for everyday living.', 
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=600&fit=crop',
        buttonText: 'Shop Modern'
      },
    ],
  },
};
