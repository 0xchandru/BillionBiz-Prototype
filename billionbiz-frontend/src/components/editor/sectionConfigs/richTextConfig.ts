import type { SectionConfig } from './types';

export const richTextConfig: SectionConfig = {
  type: 'RichText',
  name: 'Rich Text',
  category: 'content',
  description: 'A block of text to tell your brand story.',
  layouts: [
    { id: 'standard', label: 'Standard', description: 'Center aligned text' },
    { id: 'left', label: 'Left Aligned', description: 'Left aligned text' },
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
                key: 'heading',
                label: 'Heading',
                type: 'text',
                defaultValue: 'Our Mission',
              },
              {
                key: 'body',
                label: 'Body Text',
                type: 'textarea',
                defaultValue: 'We believe in creating products that are both beautiful and functional.',
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
            ],
          },
        ],
      },
    ];
  },
  defaultProps: {
    selectedLayout: 'standard',
    heading: 'Our Mission',
    body: 'We believe in creating products that are both beautiful and functional.',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
  },
};
