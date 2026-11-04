import type { SectionConfig } from './types';

export const headerConfig: SectionConfig = {
  type: 'Header',
  name: 'Header',
  category: 'header',
  description: 'Main navigation header for your site.',
  layouts: [
    { id: 'logo-left', label: 'Logo Left', description: 'Logo left, Nav center, Actions right' },
    { id: 'logo-center', label: 'Logo Center', description: 'Nav left, Logo center, Actions right' },
    { id: 'nav-below', label: 'Nav Below', description: 'Logo and Actions top, Nav below' },
    { id: 'minimal', label: 'Minimal', description: 'Logo left, Hamburger menu right' },
  ],
  getTabs: (_selectedLayout = 'logo-left') => {
    return [
      {
        id: 'content',
        label: 'Content',
        groups: [
          {
            id: 'branding',
            label: 'Branding',
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
            ],
          },
          {
            id: 'navigation',
            label: 'Navigation',
            fields: [
              {
                key: 'links',
                label: 'Menu Links',
                type: 'list',
                isStringList: true,
                addLabel: 'Add Link',
                defaultValue: ['Home', 'Shop', 'Collections', 'About', 'Contact'],
              },
            ],
          },
          {
            id: 'actions',
            label: 'Action Buttons',
            fields: [
              {
                key: 'showSearch',
                label: 'Show Search',
                type: 'toggle',
                defaultValue: true,
              },
              {
                key: 'showCart',
                label: 'Show Cart',
                type: 'toggle',
                defaultValue: true,
              },
              {
                key: 'showAccount',
                label: 'Show Account',
                type: 'toggle',
                defaultValue: true,
              },
              {
                key: 'ctaEnabled',
                label: 'Enable CTA Button',
                type: 'toggle',
                defaultValue: false,
              },
              {
                key: 'ctaText',
                label: 'CTA Text',
                type: 'text',
                defaultValue: 'Sign Up',
                showWhen: { field: 'ctaEnabled', value: true },
              },
              {
                key: 'ctaLink',
                label: 'CTA Link',
                type: 'url',
                showWhen: { field: 'ctaEnabled', value: true },
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
                key: 'transparent',
                label: 'Transparent Background',
                type: 'toggle',
                defaultValue: false,
                helpText: 'Makes the header transparent over the section below it.',
              },
              {
                key: 'bgColor',
                label: 'Background Color',
                type: 'color',
                defaultValue: 'inherit',
                showWhen: { field: 'transparent', value: false },
              },
              {
                key: 'textColor',
                label: 'Text Color',
                type: 'color',
                defaultValue: 'inherit',
              },
            ],
          },
          {
            id: 'behavior',
            label: 'Behavior',
            fields: [
              {
                key: 'sticky',
                label: 'Sticky Header',
                type: 'toggle',
                defaultValue: true,
                helpText: 'Header stays at the top when scrolling',
              },
              {
                key: 'hideOnScroll',
                label: 'Hide on scroll down',
                type: 'toggle',
                defaultValue: false,
                showWhen: { field: 'sticky', value: true },
              },
            ],
          },
        ],
      },
    ];
  },
  defaultProps: {
    selectedLayout: 'logo-left',
    logoType: 'text',
    logo: 'BillionBiz',
    links: ['Home', 'Shop', 'Collections', 'About', 'Contact'],
    showSearch: true,
    showCart: true,
    showAccount: true,
    ctaEnabled: false,
    transparent: false,
    bgColor: 'inherit',
    textColor: 'inherit',
    sticky: true,
  },
};
