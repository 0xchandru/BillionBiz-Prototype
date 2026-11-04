import type { SectionConfig } from './types';

export const videoConfig: SectionConfig = {
  type: 'Video',
  name: 'Video',
  category: 'content',
  description: 'Embed a YouTube or Vimeo video.',
  layouts: [
    { id: 'full', label: 'Full Width', description: 'Video spans entire width' },
    { id: 'contained', label: 'Contained', description: 'Video inside a container' },
  ],
  getTabs: (_selectedLayout = 'full') => {
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
                defaultValue: 'See it in Action',
              },
              {
                key: 'description',
                label: 'Description',
                type: 'textarea',
                defaultValue: 'Watch how our products transform everyday spaces.',
              },
            ],
          },
          {
            id: 'video',
            label: 'Video',
            fields: [
              {
                key: 'videoUrl',
                label: 'Video URL (YouTube/Vimeo)',
                type: 'url',
                defaultValue: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
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
            ],
          },
        ],
      },
    ];
  },
  defaultProps: {
    selectedLayout: 'full',
    heading: 'See it in Action',
    description: 'Watch how our products transform everyday spaces.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
  },
};
