import type { SectionConfig } from './types';

export const footerConfig: SectionConfig = {
  type: 'Footer',
  name: 'Footer',
  category: 'footer',
  description: 'Main footer for your site with logo, description, and link columns.',
  layouts: [
    { id: 'standard', label: 'Standard', description: 'Logo left, links right' },
    { id: 'centered', label: 'Centered', description: 'All content centered' },
    { id: 'minimal', label: 'Minimal', description: 'Only copyright and social links' },
  ],
  getTabs: (_selectedLayout = 'standard') => {
    return [
      {
        id: 'content',
        label: 'Content',
        groups: [
          {
            id: 'branding',
            label: 'Branding',
            showWhen: { field: 'selectedLayout', value: ['standard', 'centered'] },
            fields: [
              {
                key: 'logoType',
                label: 'Logo Type',
                type: 'segmented',
                options: [
                  { label: 'Text', value: 'text' },
                  { label: 'Image', value: 'image' },
                  { label: 'Both', value: 'both' },
                ],
                defaultValue: 'text',
              },
              {
                key: 'logo',
                label: 'Logo Text',
                type: 'text',
                defaultValue: 'BillionBiz',
                showWhen: { field: 'logoType', value: ['text', 'both'] },
              },
              {
                key: 'logoImage',
                label: 'Logo Image',
                type: 'image',
                showWhen: { field: 'logoType', value: ['image', 'both'] },
              },
              {
                key: 'logoHeight',
                label: 'Logo Height',
                type: 'slider',
                min: 30,
                max: 95,
                step: 1,
                defaultValue: 70,
                unit: '%',
                showWhen: { field: 'logoType', value: ['image', 'both'] },
              },
              {
                key: 'description',
                label: 'Store Description',
                type: 'textarea',
                defaultValue: 'Empowering creators and builders to make the best digital experiences possible.',
              },
            ],
          },
          {
            id: 'links',
            label: 'Link Columns',
            showWhen: { field: 'selectedLayout', value: ['standard', 'centered'] },
            fields: [
              {
                key: 'columns',
                label: 'Columns',
                type: 'list',
                addLabel: 'Add Column',
                itemLabel: (item: any) => item.title || 'Column',
                defaultItem: {
                  title: 'New Column',
                  links: ['Link 1', 'Link 2'],
                },
                listFields: [
                  {
                    key: 'title',
                    label: 'Column Title',
                    type: 'text',
                  },
                  {
                    key: 'links',
                    label: 'Links',
                    type: 'list',
                    isStringList: true,
                    addLabel: 'Add Link',
                  },
                ],
                defaultValue: [
                  { title: 'Product', links: ['Features', 'Pricing', 'Templates', 'Integrations'] },
                  { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
                  { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Privacy Policy'] },
                ],
              },
            ],
          },
          {
            id: 'bottom',
            label: 'Bottom Bar',
            fields: [
              {
                key: 'copyright',
                label: 'Copyright Text',
                type: 'text',
                defaultValue: '© 2026 BillionBiz. All rights reserved.',
              },
              {
                key: 'showSocial',
                label: 'Show Social Icons',
                type: 'toggle',
                defaultValue: true,
              },
              {
                key: 'showPayment',
                label: 'Show Payment Icons',
                type: 'toggle',
                defaultValue: true,
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
                label: 'Background Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'textColor',
                label: 'Text Color',
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
    logoType: 'text',
    logo: 'BillionBiz',
    description: 'Empowering creators and builders to make the best digital experiences possible.',
    columns: [
      { title: 'Product', links: ['Features', 'Pricing', 'Templates', 'Integrations'] },
      { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
      { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Privacy Policy'] },
    ],
    copyright: '© 2026 BillionBiz. All rights reserved.',
    showSocial: true,
    showPayment: true,
    bgColor: 'inherit',
    textColor: 'inherit',
  },
};
