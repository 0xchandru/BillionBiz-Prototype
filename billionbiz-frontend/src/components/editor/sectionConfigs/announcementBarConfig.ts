import type { SectionConfig } from './types';

export const announcementBarConfig: SectionConfig = {
  type: 'AnnouncementBar',
  name: 'Announcement Bar',
  category: 'header',
  description: 'Display an important message at the top of your site.',
  layouts: [
    { id: 'single', label: 'Single Message', description: 'A single static announcement' },
    { id: 'single_cta', label: 'Single Message + CTA', description: 'Message alongside a button' },
    { id: 'countdown', label: 'Message + Countdown', description: 'Urgency countdown timer' },
    { id: 'marquee', label: 'Marquee', description: 'Continuous scrolling text' },
    { id: 'slider', label: 'Slide Messages', description: 'Rotating slide announcements' },
  ],
  getTabs: (_selectedLayout = 'single') => {
    return [
      {
        id: 'content',
        label: 'Content',
        groups: [
          {
            id: 'messages',
            label: 'Announcements',
            fields: [
              {
                key: 'text',
                label: 'Message',
                type: 'text',
                defaultValue: 'Free shipping on all orders over $50!',
                showWhen: { field: 'selectedLayout', value: ['single', 'marquee', 'with-cta'] },
              },
              {
                key: 'messages',
                label: 'Multiple Messages',
                type: 'list',
                isStringList: true,
                addLabel: 'Add Message',
                defaultValue: ['Free shipping over $50', 'Save 20% with code WINTER20'],
                showWhen: { field: 'selectedLayout', value: 'carousel' },
              },
              {
                key: 'link',
                label: 'Link',
                type: 'url',
                showWhen: { field: 'selectedLayout', value: ['single', 'marquee'] },
              },
              {
                key: 'buttonText',
                label: 'Button Text',
                type: 'text',
                defaultValue: 'Shop Now',
                showWhen: { field: 'selectedLayout', value: 'with-cta' },
              },
              {
                key: 'buttonLink',
                label: 'Button Link',
                type: 'url',
                showWhen: { field: 'selectedLayout', value: 'with-cta' },
              },
            ],
          },
          {
            id: 'settings',
            label: 'Behavior',
            showWhen: { field: 'selectedLayout', value: ['marquee', 'carousel'] },
            fields: [
              {
                key: 'speed',
                label: 'Animation Speed',
                type: 'slider',
                min: 1,
                max: 20,
                step: 1,
                defaultValue: 5,
                unit: 's',
                showWhen: { field: 'selectedLayout', value: 'marquee' },
              },
              {
                key: 'autoPlaySpeed',
                label: 'Autoplay Speed',
                type: 'slider',
                min: 2,
                max: 10,
                step: 1,
                defaultValue: 3,
                unit: 's',
                showWhen: { field: 'selectedLayout', value: 'carousel' },
              },
              {
                key: 'pauseOnHover',
                label: 'Pause on hover',
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
          {
            id: 'typography',
            label: 'Typography',
            fields: [
              {
                key: 'fontSize',
                label: 'Font Size',
                type: 'segmented',
                options: [
                  { label: 'Small', value: '12px' },
                  { label: 'Medium', value: '14px' },
                  { label: 'Large', value: '16px' },
                ],
                defaultValue: '14px',
              },
              {
                key: 'textAlign',
                label: 'Alignment',
                type: 'segmented',
                options: [
                  { label: 'Left', value: 'left' },
                  { label: 'Center', value: 'center' },
                  { label: 'Right', value: 'right' },
                ],
                defaultValue: 'center',
                showWhen: { field: 'selectedLayout', value: ['single', 'with-cta'] },
              },
            ],
          },
        ],
      },
    ];
  },
  getContentConfigKey: (layout) => {
    // 'single' and 'marquee' share the same content fields (text + link)
    if (layout === 'single' || layout === 'marquee') return 'single-message';
    // 'with-cta' adds button fields to single message
    if (layout === 'with-cta') return 'single-message-cta';
    // 'carousel' uses a completely different content model (messages list)
    if (layout === 'carousel') return 'carousel';
    return layout;
  },
  getContentFieldKeys: (configKey) => {
    if (configKey === 'single-message') return ['text', 'link'];
    if (configKey === 'single-message-cta') return ['text', 'buttonText', 'buttonLink'];
    if (configKey === 'carousel') return ['messages'];
    return ['text'];
  },
  defaultProps: {
    selectedLayout: 'single',
    text: 'Free shipping on all orders over $50!',
    bgColor: 'inherit',
    textColor: 'inherit',
    fontSize: '14px',
    textAlign: 'center',
  },
};
