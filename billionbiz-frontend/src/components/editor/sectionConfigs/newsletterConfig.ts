import type { SectionConfig } from './types';

export const newsletterConfig: SectionConfig = {
  type: 'Newsletter',
  name: 'Newsletter',
  category: 'conversion',
  description: 'Capture emails with a newsletter signup form.',
  layouts: [
    { id: 'standard', label: 'Standard', description: 'Center-aligned signup' },
    { id: 'split', label: 'Split', description: 'Text on left, form on right' },
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
                defaultValue: 'Stay in the Loop',
              },
              {
                key: 'description',
                label: 'Description',
                type: 'textarea',
                defaultValue: 'Subscribe to our newsletter and get 10% off your first order.',
              },
            ],
          },
          {
            id: 'form',
            label: 'Form Settings',
            fields: [
              {
                key: 'buttonText',
                label: 'Button Text',
                type: 'text',
                defaultValue: 'Subscribe',
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
                key: 'inputBg',
                label: 'Input Background',
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
        ],
      },
    ];
  },
  defaultProps: {
    selectedLayout: 'standard',
    heading: 'Stay in the Loop',
    description: 'Subscribe to our newsletter and get 10% off your first order.',
    buttonText: 'Subscribe',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    inputBg: 'inherit',
    buttonBg: 'inherit',
    buttonColor: 'inherit',
  },
};
