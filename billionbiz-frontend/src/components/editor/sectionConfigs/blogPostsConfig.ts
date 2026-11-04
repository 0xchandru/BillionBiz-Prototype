import type { SectionConfig } from './types';

export const blogPostsConfig: SectionConfig = {
  type: 'BlogPosts',
  name: 'Blog Posts',
  category: 'content',
  description: 'Display recent articles from your blog.',
  layouts: [
    { id: 'grid', label: 'Grid', description: 'Standard article grid' },
    { id: 'list', label: 'List', description: 'Horizontal list of articles' },
  ],
  getTabs: (_selectedLayout = 'grid') => {
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
                defaultValue: 'Latest from Our Blog',
              },
            ],
          },
          {
            id: 'posts',
            label: 'Posts',
            fields: [
              {
                key: 'posts',
                label: 'Articles',
                type: 'list',
                addLabel: 'Add Article',
                itemLabel: (item: any) => item.title || 'Article',
                defaultItem: {
                  title: 'New Article',
                  excerpt: 'Short excerpt describing the article content.',
                  date: 'Today',
                  image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
                },
                fields: [
                  { key: 'title', label: 'Title', type: 'text' },
                  { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
                  { key: 'date', label: 'Date', type: 'text' },
                  { key: 'image', label: 'Image', type: 'image' },
                ],
                defaultValue: [
                  { title: '10 Tips for Styling Your Living Room', excerpt: 'Discover our expert interior design tips.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop', date: 'Dec 15, 2025' },
                  { title: 'The Art of Sustainable Living', excerpt: 'Learn how to make eco-friendly choices.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop', date: 'Dec 10, 2025' },
                  { title: 'Color Trends for the New Year', excerpt: 'Explore the colors that will define home decor.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop', date: 'Dec 5, 2025' },
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
                key: 'cardBg',
                label: 'Article Card Background',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'borderColor',
                label: 'Card Border Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'titleColor',
                label: 'Article Title Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'textColor',
                label: 'Excerpt Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'dateColor',
                label: 'Date Color',
                type: 'color',
                defaultValue: 'inherit',
              },
              {
                key: 'linkColor',
                label: 'Link Color',
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
    selectedLayout: 'grid',
    heading: 'Latest from Our Blog',
    bgColor: 'inherit',
    headingColor: 'inherit',
    cardBg: 'inherit',
    borderColor: 'inherit',
    titleColor: 'inherit',
    textColor: 'inherit',
    dateColor: 'inherit',
    linkColor: 'inherit',
    posts: [
      { title: '10 Tips for Styling Your Living Room', excerpt: 'Discover our expert interior design tips.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop', date: 'Dec 15, 2025' },
      { title: 'The Art of Sustainable Living', excerpt: 'Learn how to make eco-friendly choices.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop', date: 'Dec 10, 2025' },
      { title: 'Color Trends for the New Year', excerpt: 'Explore the colors that will define home decor.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop', date: 'Dec 5, 2025' },
    ],
  },
};
