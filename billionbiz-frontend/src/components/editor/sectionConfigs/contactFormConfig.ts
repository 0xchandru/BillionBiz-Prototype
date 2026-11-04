import type { SectionConfig } from './types';

export const contactFormConfig: SectionConfig = {
  type: 'ContactForm',
  name: 'Contact Form',
  category: 'content',
  description: 'Provide an interactive contact form for customer inquiries.',
  layouts: [
    { id: 'standard', label: 'Standard', description: 'Centered form' },
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
                defaultValue: 'Get in Touch',
              },
              {
                key: 'description',
                label: 'Description',
                type: 'textarea',
                defaultValue: 'Have a question or need help? Fill out the form below and our team will get back to you within 24 hours.',
              },
              {
                key: 'buttonText',
                label: 'Button Text',
                type: 'text',
                defaultValue: 'Send Message',
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
                key: 'borderColor',
                label: 'Input Border Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'inputColor',
                label: 'Input Text Color',
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
    heading: 'Get in Touch',
    description: 'Have a question or need help? Fill out the form below and our team will get back to you within 24 hours.',
    buttonText: 'Send Message',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    inputBg: 'inherit',
    borderColor: 'inherit',
    inputColor: 'inherit',
    buttonBg: 'inherit',
    buttonColor: 'inherit',
  },
};
