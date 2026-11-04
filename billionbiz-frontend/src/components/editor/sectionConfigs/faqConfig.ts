import type { SectionConfig } from './types';

export const faqConfig: SectionConfig = {
  type: 'FAQ',
  name: 'FAQ',
  category: 'content',
  description: 'Frequently asked questions to help your customers.',
  layouts: [
    { id: 'standard', label: 'Standard', description: 'Simple list of questions' },
    { id: 'accordion', label: 'Accordion', description: 'Collapsible questions' },
    { id: 'grid', label: 'Grid', description: 'Questions in a grid layout' },
  ],
  getTabs: (_selectedLayout = 'accordion') => {
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
                defaultValue: 'Frequently Asked Questions',
              },
            ],
          },
          {
            id: 'questions',
            label: 'Questions',
            fields: [
              {
                key: 'items',
                label: 'Questions',
                type: 'list',
                addLabel: 'Add Question',
                itemLabel: (item: any) => item.question || 'Question',
                defaultItem: {
                  question: 'New Question',
                  answer: 'New Answer'
                },
                fields: [
                  {
                    key: 'question',
                    label: 'Question',
                    type: 'text',
                  },
                  {
                    key: 'answer',
                    label: 'Answer',
                    type: 'textarea',
                  },
                ],
                defaultValue: [
                  { question: 'What is your return policy?', answer: 'We offer a 30-day hassle-free return policy.' },
                  { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days.' },
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
                key: 'itemBg',
                label: 'Item Background',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'borderColor',
                label: 'Item Border Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'questionColor',
                label: 'Question Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'textColor',
                label: 'Answer Text Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'iconColor',
                label: 'Icon Color',
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
    selectedLayout: 'accordion',
    heading: 'Frequently Asked Questions',
    bgColor: 'inherit',
    headingColor: 'inherit',
    itemBg: 'inherit',
    borderColor: 'inherit',
    questionColor: 'inherit',
    textColor: 'inherit',
    iconColor: 'inherit',
    items: [
      { question: 'What is your return policy?', answer: 'We offer a 30-day hassle-free return policy.' },
      { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days.' },
    ],
  },
};
