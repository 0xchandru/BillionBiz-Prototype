import React from 'react';

import type { SectionData } from '../../store/siteStore';
import { resolveSectionProps } from './theme/themeResolver';
import AnnouncementBarSection from './sections/AnnouncementBarSection';
import HeaderNavbarSection from './sections/HeaderNavbarSection';
import UtilityBarSection from './sections/UtilityBarSection';
import CategoryBarSection from './sections/CategoryBarSection';
import FooterTrustSection from './sections/FooterTrustSection';
import FooterNewsletterSection from './sections/FooterNewsletterSection';
import FooterMainSection from './sections/FooterMainSection';
import FooterSocialSection from './sections/FooterSocialSection';
import FooterBottomSection from './sections/FooterBottomSection';
import { FooterAppSection } from './sections/FooterAppSection';
import { FooterContactSection } from './sections/FooterContactSection';
import { FooterPaymentSection } from './sections/FooterPaymentSection';
import FooterSeoSection from './sections/FooterSeoSection';
import FooterCategoryLinksSection from './sections/FooterCategoryLinksSection';

// Import all section components
import HeroBannerSection from './sections/HeroBannerSection';
import FeaturedCollectionSection from './sections/FeaturedCollectionSection';
import ImageWithTextSection from './sections/ImageWithTextSection';
import RichTextSection from './sections/RichTextSection';
import NewsletterSection from './sections/NewsletterSection';
import TestimonialsSection from './sections/TestimonialsSection';
import LogoListSection from './sections/LogoListSection';
import VideoSection from './sections/VideoSection';
import FAQSection from './sections/FAQSection';
import ContactFormSection from './sections/ContactFormSection';
import BlogPostsSection from './sections/BlogPostsSection';
import GallerySection from './sections/GallerySection';
import MapSection from './sections/MapSection';
import PricingTableSection from './sections/PricingTableSection';

// --- Generic Helpers ---
export const getDefaultPadding = (sectionType: string): any => {
  const edgeToEdgeSections = ['Gallery', 'AnnouncementBar', 'UtilityBar', 'Footer', 'Video', 'Map'];
  const isEdgeToEdge = edgeToEdgeSections.includes(sectionType);

  return {
    desktop: { top: 80, bottom: 80, left: isEdgeToEdge ? 0 : 48, right: isEdgeToEdge ? 0 : 48 },
    tablet: { top: 60, bottom: 60, left: isEdgeToEdge ? 0 : 32, right: isEdgeToEdge ? 0 : 32 },
    mobile: { top: 40, bottom: 40, left: isEdgeToEdge ? 0 : 24, right: isEdgeToEdge ? 0 : 24 },
  };
};

// --- Page Header Section ---
const PageHeaderSection: React.FC<{ props: any }> = ({ props }) => {
  const heading = props.heading || props.title || props.name || 'Page Title';
  const description = props.description || '';
  const alignment = props.alignment || props.textAlign || 'center';
  const bgColor = props.bgColor || 'var(--theme-bg-surface, #f8fafc)';
  const headingColor = props.headingColor || 'var(--theme-text-heading, #0f172a)';
  const textColor = props.textColor || 'var(--theme-text-muted, #64748b)';

  return (
    <div style={{
      padding: '40px 24px',
      backgroundColor: bgColor,
      borderBottom: '1px solid var(--theme-border-divider, #e2e8f0)',
      textAlign: alignment,
      boxSizing: 'border-box',
    }}>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 800, color: headingColor, fontFamily: 'var(--theme-font-heading), sans-serif', letterSpacing: '-0.5px' }}>
        {heading}
      </h1>
      {description && (
        <p style={{ margin: 0, fontSize: '15px', color: textColor, maxWidth: '640px', marginLeft: alignment === 'center' ? 'auto' : 0, marginRight: alignment === 'center' ? 'auto' : 0 }}>
          {description}
        </p>
      )}
    </div>
  );
};

// --- Generic Placeholder Section ---
const PlaceholderSection: React.FC<{ props: any }> = ({ props }) => {
  const bgColor = props.bgColor || 'var(--theme-bg-surface, var(--theme-bg, #f8fafc))';
  const headingColor = props.headingColor || 'var(--theme-text-heading, var(--theme-text, #333))';
  const textColor = props.textColor || 'var(--theme-text-muted, #64748b)';

  return (
    <div style={{
      padding: '40px 20px',
      backgroundColor: bgColor,
      border: '1px dashed var(--theme-border-default, #cbd5e1)',
      borderRadius: '8px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '160px',
      margin: 0,
      boxSizing: 'border-box',
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: headingColor }}>
        {props.name || 'Section Placeholder'}
      </h3>
      <p style={{ margin: 0, fontSize: '13.5px', color: textColor }}>
        This section is generated dynamically based on your store's data and layout settings.
      </p>
    </div>
  );
};

// --- Built-in Announcement Bar, Header, Footer ---

const AnnouncementBar: React.FC<{ props: any }> = ({ props }) => {
  return (
    <AnnouncementBarSection
      props={props}
      device={props.device}
      isEditorInteractive={props.isEditorInteractive === true}
      useEditorModel={props.useEditorModel === true}
    />
  );
};

const Header: React.FC<{ props: any }> = ({ props }) => {
  return (
    <HeaderNavbarSection
      props={props}
      device={props.device}
      isEditorInteractive={props.isEditorInteractive === true}
      useEditorModel={props.useEditorModel === true}
    />
  );
};

const UtilityBar: React.FC<{ props: any }> = ({ props }) => {
  return (
    <UtilityBarSection
      props={props}
      device={props.device}
      isEditorInteractive={props.isEditorInteractive === true}
      useEditorModel={props.useEditorModel === true}
    />
  );
};

const CategoryBar: React.FC<{ props: any }> = ({ props }) => {
  return (
    <CategoryBarSection
      props={props}
      device={props.device}
      isEditorInteractive={props.isEditorInteractive === true}
      useEditorModel={props.useEditorModel === true}
    />
  );
};

const FooterTrust: React.FC<{ props: any }> = ({ props }) => (
  <FooterTrustSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);

const FooterNewsletter: React.FC<{ props: any }> = ({ props }) => (
  <FooterNewsletterSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);

const FooterMain: React.FC<{ props: any }> = ({ props }) => (
  <FooterMainSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);

const FooterSocial: React.FC<{ props: any }> = ({ props }) => (
  <FooterSocialSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);

const FooterBottom: React.FC<{ props: any }> = ({ props }) => (
  <FooterBottomSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);

const FooterApp: React.FC<{ props: any }> = ({ props }) => (
  <FooterAppSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);

const FooterContact: React.FC<{ props: any }> = ({ props }) => (
  <FooterContactSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);

const FooterPayment: React.FC<{ props: any }> = ({ props }) => (
  <FooterPaymentSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);

const FooterSeo: React.FC<{ props: any }> = ({ props }) => (
  <FooterSeoSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);

const FooterCategoryLinks: React.FC<{ props: any }> = ({ props }) => (
  <FooterCategoryLinksSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);

const Footer: React.FC<{ props: any }> = ({ props }) => (
  <FooterMainSection
    props={props}
    device={props.device}
    isEditorInteractive={props.isEditorInteractive === true}
    useEditorModel={props.useEditorModel === true}
  />
);


// --- Section Map ---
const sectionMap: Record<string, React.FC<{ props: any }>> = {
  AnnouncementBar,
  UtilityBar,
  Header,
  CategoryBar,
  HeroBanner: HeroBannerSection,
  HeroCarousel: HeroBannerSection, // Fallback
  FeaturedCollection: FeaturedCollectionSection,
  CategoryList: FeaturedCollectionSection, // Fallback
  ImageWithText: ImageWithTextSection,
  RichText: RichTextSection,
  Newsletter: NewsletterSection,
  Testimonials: TestimonialsSection,
  LogoList: LogoListSection,
  Video: VideoSection,
  FAQ: FAQSection,
  ContactForm: ContactFormSection,
  BlogPosts: BlogPostsSection,
  Gallery: GallerySection,
  Map: MapSection,
  PricingTable: PricingTableSection,
  FooterTrust,
  FooterNewsletter,
  FooterMain,
  FooterSocial,
  FooterApp,
  FooterContact,
  FooterPayment,
  FooterSeo,
  FooterCategoryLinks,
  FooterBottom,
  Footer,
  FooterMenu: FooterMain,
  FooterText: FooterMain,
  PageHeader: PageHeaderSection,
  Breadcrumbs: PlaceholderSection,
  ProductListing: PlaceholderSection,
  ProductDetails: PlaceholderSection,
  ProductRecommendations: PlaceholderSection,
  CartItems: PlaceholderSection,
  CartSummary: PlaceholderSection,
  CheckoutContent: PlaceholderSection,
  CollectionGrid: PlaceholderSection,
  CollectionHero: PlaceholderSection,
  LoginForm: PlaceholderSection,
  RegisterForm: PlaceholderSection,
  OrderList: PlaceholderSection,
  OrderInfo: PlaceholderSection,
  OrderItems: PlaceholderSection,
};

// --- Default Props Map ---
// Used by addSection to provide rich defaults for every section type
export const defaultPropsMap: Record<string, Record<string, any>> = {
  AnnouncementBar: { text: 'Free shipping on all orders over $50!' },
  UtilityBar: { supportEmail: 'support@billionbiz.in', supportPhone: '+1 (555) 123-4567', language: 'English', currency: 'USD' },
  Header: {
    logo: 'BillionBiz',
    links: ['Home', 'Shop', 'Collections', 'About', 'Contact'],
    showSearch: true,
    ctaText: 'Sign Up',
    bottomNavLinks: [
      { id: 'home', icon: 'Home', text: 'Home', link: '/' },
      { id: 'shop', icon: 'Grid', text: 'Shop', link: '/collections/all' },
      { id: 'cart', icon: 'ShoppingCart', text: 'Cart', link: '/cart' },
      { id: 'profile', icon: 'User', text: 'Profile', link: '/profile' }
    ]
  },
  HeroBanner: {
    badge: 'New Arrival',
    heading: 'Elevate Your Creative Workflow',
    description: 'Discover the tools that empower professionals to build stunning digital experiences with ease.',
    primaryBtn: 'Start Building Now',
    secondaryBtn: 'Explore Templates',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=1000&fit=crop',
    layout: 'left',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    badgeBg: 'inherit',
    badgeColor: 'inherit',
    primaryBtnBg: 'inherit',
    primaryBtnColor: 'inherit',
    secondaryBtnBg: 'inherit',
    secondaryBtnColor: 'inherit',
  },
  HeroCarousel: {
    autoPlay: true,
    interval: 5,
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    buttonBg: 'inherit',
    buttonColor: 'inherit',
    slides: [
      { heading: 'Summer Collection', description: 'Brighten up your space with our new summer arrivals.', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=600&fit=crop', buttonText: 'Shop Summer' }
    ]
  },
  FeaturedCollection: {
    heading: 'Featured Collection',
    linkText: 'View all',
    columns: 4,
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    priceColor: 'inherit',
    cardBg: 'inherit',
    linkColor: 'inherit',
    products: [
      { name: 'Artisan Ceramic Vase', price: '$89.00', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop' },
      { name: 'Handwoven Throw', price: '$129.00', image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400&h=400&fit=crop' },
      { name: 'Oak Side Table', price: '$249.00', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' },
      { name: 'Linen Cushion Set', price: '$67.00', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop' },
    ],
  },
  CategoryList: {
    heading: 'Shop by Category',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    cardBg: 'inherit',
    categories: [
      { name: 'Furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' },
      { name: 'Decor', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop' },
      { name: 'Lighting', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop' },
    ]
  },
  ImageWithText: {
    heading: 'Crafted with Purpose',
    body: 'Every piece in our collection is thoughtfully designed and ethically made. We work directly with artisans around the world to bring you unique, high-quality products that tell a story.',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&h=700&fit=crop',
    imagePosition: 'left',
    buttonText: 'Learn More',
    buttonLink: '#',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    buttonColor: 'inherit',
  },
  RichText: {
    heading: 'Our Mission',
    body: 'We believe in creating products that are both beautiful and functional. Our team of designers and engineers work together to push the boundaries of what\'s possible.',
    alignment: 'center',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
  },
  Newsletter: {
    heading: 'Stay in the Loop',
    description: 'Subscribe to our newsletter and get 10% off your first order, plus exclusive access to new arrivals.',
    buttonText: 'Subscribe',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    inputBg: 'inherit',
    buttonBg: 'inherit',
    buttonColor: 'inherit',
  },
  Testimonials: {
    heading: 'What Our Customers Say',
    bgColor: 'inherit',
    headingColor: 'inherit',
    cardBg: 'inherit',
    borderColor: 'inherit',
    textColor: 'inherit',
    nameColor: 'inherit',
    starColor: 'inherit',
    testimonials: [
      { name: 'Sarah Johnson', role: 'Interior Designer', quote: 'The quality of these products is outstanding. Every piece feels like a work of art.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', rating: 5 },
      { name: 'Michael Chen', role: 'Architect', quote: 'I\'ve been a loyal customer for 3 years. The attention to detail is unmatched.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', rating: 5 },
      { name: 'Emily Parker', role: 'Home Stylist', quote: 'Fast shipping, beautiful packaging, and the products always exceed expectations.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', rating: 5 },
    ],
  },
  LogoList: {
    heading: 'Trusted by Leading Brands',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    logos: [
      { name: 'Airbnb' }, { name: 'Spotify' }, { name: 'Stripe' },
      { name: 'Notion' }, { name: 'Figma' }, { name: 'Slack' },
    ],
  },
  Video: {
    heading: 'See it in Action',
    description: 'Watch how our products transform everyday spaces into extraordinary experiences.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
  },
  FAQ: {
    heading: 'Frequently Asked Questions',
    bgColor: 'inherit',
    headingColor: 'inherit',
    itemBg: 'inherit',
    borderColor: 'inherit',
    questionColor: 'inherit',
    textColor: 'inherit',
    iconColor: 'inherit',
    items: [
      { question: 'What is your return policy?', answer: 'We offer a 30-day hassle-free return policy. Simply reach out to our support team.' },
      { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days. Express shipping is 2-3 business days.' },
      { question: 'Do you ship internationally?', answer: 'Yes! We ship to over 50 countries worldwide.' },
      { question: 'How do I track my order?', answer: 'Once your order ships, you\'ll receive an email with a tracking number.' },
      { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay.' },
    ],
  },
  ContactForm: {
    heading: 'Get in Touch',
    description: 'Have a question? Fill out the form below and we\'ll get back to you within 24 hours.',
    buttonText: 'Send Message',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    inputBg: 'inherit',
    borderColor: 'inherit',
    buttonBg: 'inherit',
    buttonColor: 'inherit',
  },
  BlogPosts: {
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
      { title: '10 Tips for Styling Your Living Room', excerpt: 'Discover expert interior design tips to transform your space.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop', date: 'Dec 15, 2025' },
      { title: 'The Art of Sustainable Living', excerpt: 'Learn how to make eco-friendly choices without compromising on style.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop', date: 'Dec 10, 2025' },
      { title: 'Color Trends for the New Year', excerpt: 'Explore the colors that will define home decor this year.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop', date: 'Dec 5, 2025' },
    ],
  },
  Gallery: {
    heading: 'Gallery',
    columns: 3,
    bgColor: 'inherit',
    headingColor: 'inherit',
    images: [
      { src: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop', alt: 'Gallery 1' },
      { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop', alt: 'Gallery 2' },
      { src: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&h=600&fit=crop', alt: 'Gallery 3' },
      { src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', alt: 'Gallery 4' },
      { src: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&h=600&fit=crop', alt: 'Gallery 5' },
      { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', alt: 'Gallery 6' },
    ],
  },
  Map: {
    heading: 'Visit Our Store',
    address: '123 Business Avenue, Tech District, San Francisco, CA 94107',
    zoom: 14,
    phone: '+1 (555) 123-4567',
    email: 'hello@billionbiz.com',
    hours: 'Mon-Fri: 9am - 6pm | Sat: 10am - 4pm',
    bgColor: 'inherit',
    headingColor: 'inherit',
    textColor: 'inherit',
    accentColor: 'inherit',
  },
  PricingTable: {
    heading: 'Simple, transparent pricing',
    subheading: 'Choose the perfect plan for your business.',
    bgColor: 'inherit',
    headingColor: 'inherit',
    cardBg: 'inherit',
    borderColor: 'inherit',
    titleColor: 'inherit',
    priceColor: 'inherit',
    textColor: 'inherit',
    buttonBg: 'inherit',
    highlightedBg: 'inherit',
    plans: [
      { name: 'Starter', price: '$29', period: '/month', features: ['Up to 100 products', '2 staff accounts', 'Basic analytics', 'Email support', '2% transaction fee'], buttonText: 'Start Free Trial', highlighted: false },
      { name: 'Professional', price: '$79', period: '/month', features: ['Unlimited products', '5 staff accounts', 'Advanced analytics', 'Priority support', '1% transaction fee', 'Custom domain', 'Gift cards'], buttonText: 'Start Free Trial', highlighted: true },
      { name: 'Enterprise', price: '$299', period: '/month', features: ['Unlimited everything', '15 staff accounts', 'Custom reports', 'Dedicated manager', '0.5% transaction fee', 'Custom domain', 'Advanced API access'], buttonText: 'Contact Sales', highlighted: false },
    ],
  },
  FooterTrust: {},
  FooterNewsletter: { heading: 'Stay in the loop', description: 'Subscribe to receive exclusive offers and the latest updates.', placeholder: 'Enter your email address', buttonText: 'Subscribe', bgColor: 'inherit', textColor: 'inherit' },
  FooterMain: {
    logo: 'BillionBiz',
    description: 'Empowering creators and builders to make the best digital experiences possible.',
    columns: [
      { title: 'Product', links: ['Features', 'Pricing', 'Templates', 'Integrations'] },
      { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
      { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Privacy Policy'] },
    ],
    bgColor: 'inherit',
    textColor: 'inherit',
  },
  FooterSocial: { heading: 'Follow Us' },
  FooterBottom: { copyright: '© {year} BillionBiz. All rights reserved.' },
  FooterMenu: { title: 'Quick Links', links: ['Home', 'Shop', 'About Us', 'Contact'], bgColor: 'inherit', textColor: 'inherit' },
  FooterText: { title: 'About Our Store', text: 'We sell the best products in the world. Enjoy your shopping experience!', bgColor: 'inherit', textColor: 'inherit' },
  Footer: {
    logo: 'BillionBiz',
    description: 'Empowering creators and builders to make the best digital experiences possible.',
    copyright: '© 2026 BillionBiz. All rights reserved.',
    columns: [
      { title: 'Product', links: ['Features', 'Pricing', 'Templates', 'Integrations'] },
      { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
      { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Privacy Policy'] },
    ],
    bgColor: 'inherit',
    textColor: 'inherit',
  },
  PageHeader: { heading: 'Page Title', description: 'Page description goes here.' },
  Breadcrumbs: {},
  ProductListing: {},
  ProductDetails: {},
  ProductRecommendations: {},
  CartItems: {},
  CartSummary: {},
  CheckoutContent: {},
  CollectionGrid: {},
  CollectionHero: {},
  LoginForm: {},
  RegisterForm: {},
  OrderList: {},
  OrderInfo: {},
  OrderItems: {},
};

// --- Section name map ---
export const sectionNameMap: Record<string, string> = {
  AnnouncementBar: 'Announcement Bar',
  UtilityBar: 'Utility Bar',
  Header: 'Header',
  CategoryBar: 'Category Bar',
  HeroBanner: 'Hero Banner',
  HeroCarousel: 'Hero Carousel',
  FeaturedCollection: 'Featured Collection',
  CategoryList: 'Category List',
  ImageWithText: 'Image with Text',
  RichText: 'Rich Text',
  Newsletter: 'Newsletter',
  FooterTrust: 'Footer Trust & Badges',
  FooterNewsletter: 'Footer Newsletter',
  FooterMain: 'Footer Directory',
  FooterSocial: 'Footer Social Showcase',
  FooterBottom: 'Footer Bottom & Copyright',
  FooterSeo: 'SEO / Rich Content',
  FooterCategoryLinks: 'Category Directory Links',
  FooterMenu: 'Footer Menu',
  FooterText: 'Footer Text',
  Footer: 'Footer',
  Testimonials: 'Testimonials',
  LogoList: 'Logo List',
  Video: 'Video',
  FAQ: 'FAQ',
  ContactForm: 'Contact Form',
  BlogPosts: 'Blog Posts',
  Gallery: 'Gallery',
  Map: 'Map',
  PricingTable: 'Pricing Table',
  CheckoutContent: 'Checkout Content',
  CollectionGrid: 'Collection Grid',
  CollectionHero: 'Collection Hero',
  LoginForm: 'Login Form',
  RegisterForm: 'Register Form',
  OrderList: 'Order List',
  OrderInfo: 'Order Info',
  OrderItems: 'Order Items',
};

// --- Renderer ---
export const SectionRenderer: React.FC<{
  section: SectionData;
  overrideDevice?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}> = ({ section, overrideDevice, isEditorInteractive = false, useEditorModel = false }) => {
  const device = overrideDevice || 'desktop';

  if (section.isHidden) return null;

  // Visibility Rules
  if (section.props.visibility) {
    if (device === 'desktop' && section.props.visibility.desktop === false) return null;
    if (device === 'tablet' && section.props.visibility.tablet === false) return null;
    if (device === 'mobile' && section.props.visibility.mobile === false) return null;

    // Note: Schedule and Audience visibility are not strictly enforced in the visual editor 
    // to allow the user to see the section they are working on, but they would be enforced on the live site.
  }

  const Component = sectionMap[section.type];
  if (!Component) {
    return (
      <div style={{
        padding: '40px',
        border: '2px dashed #e2e8f0',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '14px',
        margin: '8px',
      }}>
        Unknown section type: <strong>{section.type}</strong>
      </div>
    );
  }

  // Layout & Spacing
  const layoutMap = {
    narrow: '720px',
    standard: '1100px',
    wide: '1400px',
    full: '100%',
  };

  const widthProp = section.props.sectionWidth || section.props.pageWidth || section.props.layout?.width;
  const layoutWidth = widthProp ? layoutMap[widthProp as keyof typeof layoutMap] || layoutMap['wide'] : layoutMap['wide'];

  const devicePadding = section.props._padding?.[device] || getDefaultPadding(section.type)[device];

  const paddingStyle: React.CSSProperties = {
    paddingTop: devicePadding.top !== undefined ? `${devicePadding.top}px` : undefined,
    paddingBottom: devicePadding.bottom !== undefined ? `${devicePadding.bottom}px` : undefined,
    paddingLeft: devicePadding.left !== undefined ? `${devicePadding.left}px` : undefined,
    paddingRight: devicePadding.right !== undefined ? `${devicePadding.right}px` : undefined,
  };

  const marginStyle: React.CSSProperties = section.props._margin ? {
    marginTop: section.props._margin.top !== undefined ? `${section.props._margin.top}px` : undefined,
    marginBottom: section.props._margin.bottom !== undefined ? `${section.props._margin.bottom}px` : undefined,
  } : {};

  const resolvedProps = resolveSectionProps(section.props, section.type);

  return (
    <Component props={{
      ...resolvedProps,
      device,
      isEditorInteractive,
      useEditorModel,
      _layoutWidth: layoutWidth,
      _paddingStyle: paddingStyle,
      _marginStyle: marginStyle
    }} />
  );
};
