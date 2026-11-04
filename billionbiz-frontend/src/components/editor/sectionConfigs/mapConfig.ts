import type { SectionConfig } from './types';

export const mapConfig: SectionConfig = {
  type: 'Map',
  name: 'Map',
  category: 'content',
  description: 'Display your physical store location and contact details.',
  layouts: [
    { id: 'standard', label: 'Standard', description: 'Side-by-side details and map' },
  ],
  getTabs: (_selectedLayout = 'standard') => {
    return [
      {
        id: 'content',
        label: 'Content',
        groups: [
          {
            id: 'details',
            label: 'Location Details',
            fields: [
              {
                key: 'heading',
                label: 'Heading Text',
                type: 'text',
                defaultValue: 'Visit Our Store',
              },
              {
                key: 'address',
                label: 'Address',
                type: 'textarea',
                defaultValue: '123 Design Street, Creative District, San Francisco, CA 94102',
              },
              {
                key: 'phone',
                label: 'Phone Number',
                type: 'text',
                defaultValue: '+1 (555) 123-4567',
              },
              {
                key: 'email',
                label: 'Email',
                type: 'text',
                defaultValue: 'hello@billionbiz.com',
              },
              {
                key: 'hours',
                label: 'Business Hours',
                type: 'text',
                defaultValue: 'Mon-Fri: 9am - 6pm | Sat: 10am - 4pm',
              },
              {
                key: 'embedUrl',
                label: 'Google Maps Embed URL',
                type: 'url',
                defaultValue: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977477265785!2d-122.41941528468156!3d37.77492977975903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sTwitter+HQ!5e0!3m2!1sen!2sus!4v1',
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
                label: 'Text Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'accentColor',
                label: 'Accent / Link Color',
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
    heading: 'Visit Our Store',
    address: '123 Design Street, Creative District, San Francisco, CA 94102',
    phone: '+1 (555) 123-4567',
    email: 'hello@billionbiz.com',
    hours: 'Mon-Fri: 9am - 6pm | Sat: 10am - 4pm',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977477265785!2d-122.41941528468156!3d37.77492977975903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sTwitter+HQ!5e0!3m2!1sen!2sus!4v1',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    accentColor: 'inherit',
  },
};
