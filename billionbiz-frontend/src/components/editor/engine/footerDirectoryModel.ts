// ============================================================
// FOOTER DIRECTORY ARCHITECTURE & ENGINE MODEL
// 20 Looks, Inline Columns Management, Capability-Driven Child Controls,
// Scoped & Singleton Component Registry, Global Palette Semantic Tokens
// ============================================================

import type { FooterColumn, FooterElement, FooterRow } from './types';

// ─── 20 Recommended Footer Looks ─────────────────────────────
export type FooterLook =
  | 'classic_4_col'        // 1. Classic 4 Column: Brand, Shop, Support, Company
  | 'classic_3_col'        // 2. Classic 3 Column: Brand, Shop, Support
  | 'brand_3_dir'          // 3. Brand + 3 Directories: Large Brand | Shop | Support | Company
  | 'brand_2_dir'          // 4. Brand + 2 Directories: Large Brand Area | Shop | Support
  | 'five_col_commerce'    // 5. 5 Column Commerce: Brand | Shop | Categories | Support | Company
  | 'large_brand'          // 6. Large Brand Footer: Brand / Description over Shop | Support | Company
  | 'minimal'              // 7. Minimal Footer: Logo, Description, Links
  | 'centered'             // 8. Centered Footer: Logo, Brand Bio, Link Groups / Links
  | 'editorial'            // 9. Editorial Footer: Large brand area with spacious link directories
  | 'premium_luxury'       // 10. Premium / Luxury: Large logo, minimal links, large spacing, strong typography
  | 'dense_commerce'       // 11. Dense Commerce: High link density with compact spacing
  | 'asymmetric'           // 12. Asymmetric: Brand 2fr | Shop 1fr | Support 1fr | Company 1fr
  | 'wide_brand_grid'      // 13. Wide Brand + Directory Grid: Brand 2fr over Shop | Support | Company
  | 'bento'                // 14. Bento Footer: Unequal column/container card arrangement
  | 'dark_premium'         // 15. Dark Premium: Dark visual treatment with configurable columns
  | 'full_width_modern'    // 16. Full Width Modern: Full-width footer with contained inner content
  | 'mobile_accordion'     // 17. Mobile Accordion Footer: Expandable sections on mobile
  | 'compact_mobile'       // 18. Compact Mobile Footer: Condensed layout optimized for mobile
  | 'split_footer'         // 19. Split Footer: Brand Area | Directory Grid
  | 'fully_custom';        // 20. Fully Custom: No structural restrictions

export interface FooterLookDefinition {
  id: FooterLook;
  name: string;
  category: 'Classic' | 'Commerce' | 'Brand-Led' | 'Modern & Bento' | 'Mobile-First' | 'Custom';
  description: string;
  columns: number;
  columnWidths: string[];
  mobileBehavior: 'accordion' | 'stacked' | 'compact' | 'expanded';
  badge?: string;
  alignment?: 'start' | 'center' | 'end';
}

export const FOOTER_LOOKS: FooterLookDefinition[] = [
  {
    id: 'classic_4_col',
    name: 'Classic 4 Column',
    category: 'Classic',
    description: 'High-converting traditional retail directory: Brand identity, Shop catalog, Customer support, and Company info.',
    columns: 4,
    columnWidths: ['1.4fr', '1fr', '1fr', '1fr'],
    mobileBehavior: 'accordion',
    badge: 'Standard',
  },
  {
    id: 'classic_3_col',
    name: 'Classic 3 Column',
    category: 'Classic',
    description: 'Balanced three-column structure: Brand story on left, Shop catalog in center, Support directory on right.',
    columns: 3,
    columnWidths: ['1.5fr', '1fr', '1.2fr'],
    mobileBehavior: 'accordion',
  },
  {
    id: 'brand_3_dir',
    name: 'Brand + 3 Directories',
    category: 'Brand-Led',
    description: 'Generous brand and bio showcase (1.8fr) alongside three compact directory columns.',
    columns: 4,
    columnWidths: ['1.8fr', '1fr', '1fr', '1fr'],
    mobileBehavior: 'accordion',
    badge: 'Popular',
  },
  {
    id: 'brand_2_dir',
    name: 'Brand + 2 Directories',
    category: 'Brand-Led',
    description: 'Strong brand statement and contact details followed by two wide navigation link groups.',
    columns: 3,
    columnWidths: ['2fr', '1fr', '1fr'],
    mobileBehavior: 'stacked',
  },
  {
    id: 'five_col_commerce',
    name: '5 Column Commerce',
    category: 'Commerce',
    description: 'Deep departmental categorization: Brand | Shop | Categories | Support | Company.',
    columns: 5,
    columnWidths: ['1.2fr', '1fr', '1fr', '1fr', '1fr'],
    mobileBehavior: 'accordion',
    badge: 'Enterprise',
  },
  {
    id: 'large_brand',
    name: 'Large Brand Footer',
    category: 'Brand-Led',
    description: 'Full-width top brand headline & narrative with 3 link directories grouped underneath.',
    columns: 4,
    columnWidths: ['1.6fr', '1fr', '1fr', '1fr'],
    mobileBehavior: 'accordion',
  },
  {
    id: 'minimal',
    name: 'Minimal Footer',
    category: 'Classic',
    description: 'Understated clean layout: Store logo, single-paragraph bio, and concise inline links.',
    columns: 2,
    columnWidths: ['1.5fr', '1fr'],
    mobileBehavior: 'stacked',
    badge: 'Minimal',
  },
  {
    id: 'centered',
    name: 'Centered Footer',
    category: 'Brand-Led',
    description: 'Symmetrical centered layout: Logo, brand bio, and centered multi-group link columns.',
    columns: 1,
    columnWidths: ['1fr'],
    mobileBehavior: 'compact',
    alignment: 'center',
  },
  {
    id: 'editorial',
    name: 'Editorial Footer',
    category: 'Brand-Led',
    description: 'Spacious editorial storytelling with prominent serif typography and airy link clusters.',
    columns: 4,
    columnWidths: ['1.8fr', '1fr', '1fr', '1.2fr'],
    mobileBehavior: 'expanded',
  },
  {
    id: 'premium_luxury',
    name: 'Premium / Luxury',
    category: 'Brand-Led',
    description: 'Subtle elegance: Grand logo presentation, understated curated links, and generous white space.',
    columns: 3,
    columnWidths: ['1.6fr', '1fr', '1fr'],
    mobileBehavior: 'stacked',
    badge: 'Luxury',
  },
  {
    id: 'dense_commerce',
    name: 'Dense Commerce',
    category: 'Commerce',
    description: 'Optimized link density with tight row gaps for hyper-fast discovery across large catalog inventories.',
    columns: 5,
    columnWidths: ['1fr', '1fr', '1fr', '1fr', '1fr'],
    mobileBehavior: 'accordion',
  },
  {
    id: 'asymmetric',
    name: 'Asymmetric (2fr : 1fr : 1fr : 1fr)',
    category: 'Modern & Bento',
    description: 'Distinctive visual hierarchy with double-weight anchor column and three secondary directories.',
    columns: 4,
    columnWidths: ['2fr', '1fr', '1fr', '1fr'],
    mobileBehavior: 'accordion',
  },
  {
    id: 'wide_brand_grid',
    name: 'Wide Brand + Directory Grid',
    category: 'Brand-Led',
    description: 'Spanned primary brand identity card balanced against an evenly distributed grid.',
    columns: 4,
    columnWidths: ['2fr', '1fr', '1fr', '1.2fr'],
    mobileBehavior: 'accordion',
  },
  {
    id: 'bento',
    name: 'Bento Footer',
    category: 'Modern & Bento',
    description: 'Modern glassmorphic bento cards with distinct surface highlights and asymmetric proportions.',
    columns: 4,
    columnWidths: ['1.5fr', '1fr', '1fr', '1.2fr'],
    mobileBehavior: 'compact',
    badge: 'Bento',
  },
  {
    id: 'dark_premium',
    name: 'Dark Premium',
    category: 'Modern & Bento',
    description: 'High-contrast dark obsidian canvas with tailored glowing accents and border definition.',
    columns: 4,
    columnWidths: ['1.4fr', '1fr', '1fr', '1fr'],
    mobileBehavior: 'accordion',
  },
  {
    id: 'full_width_modern',
    name: 'Full Width Modern',
    category: 'Modern & Bento',
    description: 'Edge-to-edge footer canvas containing a neatly proportioned inner grid with dynamic padding.',
    columns: 4,
    columnWidths: ['1.5fr', '1fr', '1fr', '1fr'],
    mobileBehavior: 'accordion',
  },
  {
    id: 'mobile_accordion',
    name: 'Mobile Accordion Footer',
    category: 'Mobile-First',
    description: 'Standard desktop directory that automatically collapses columns into expandable accordions on touchscreens.',
    columns: 4,
    columnWidths: ['1.4fr', '1fr', '1fr', '1fr'],
    mobileBehavior: 'accordion',
    badge: 'Responsive',
  },
  {
    id: 'compact_mobile',
    name: 'Compact Mobile Footer',
    category: 'Mobile-First',
    description: 'Ultra-condensed mobile-first footprint eliminating unnecessary vertical scroll.',
    columns: 3,
    columnWidths: ['1.2fr', '1fr', '1fr'],
    mobileBehavior: 'compact',
  },
  {
    id: 'split_footer',
    name: 'Split Footer',
    category: 'Modern & Bento',
    description: 'Half-screen brand hero block paired with a half-screen directory grid.',
    columns: 3,
    columnWidths: ['1.8fr', '1fr', '1fr'],
    mobileBehavior: 'stacked',
  },
  {
    id: 'fully_custom',
    name: 'Fully Custom',
    category: 'Custom',
    description: 'Unconstrained canvas: Configure arbitrary column counts, widths, and placements freely.',
    columns: 4,
    columnWidths: ['1fr', '1fr', '1fr', '1fr'],
    mobileBehavior: 'accordion',
    badge: 'Flexible',
  },
];

// ─── Component Scope & Registry ──────────────────────────────
export type FooterComponentScope = 'footer-directory';

export type FooterComponentType =
  // BRAND
  | 'logo'
  | 'brand-description'
  | 'brand-story'
  | 'brand-rating'
  // NAVIGATION
  | 'link-group'
  | 'featured-link'
  | 'legal-link-group'
  // CONTACT
  | 'contact'
  | 'business-hours'
  | 'store-locator'
  | 'whatsapp-contact'
  | 'support-cta'
  // COMMERCE & TRUST
  | 'payment-methods'
  | 'trust-badges'
  | 'guarantees'
  | 'shipping-highlights'
  | 'cod-availability'
  | 'security-badges'
  // ENGAGEMENT
  | 'newsletter-form'
  | 'social-links'
  | 'community-cta'
  // APP
  | 'app-download'
  | 'app-store-badge'
  | 'google-play-badge'
  | 'qr-code'
  // CONTENT
  | 'rich-text'
  | 'image'
  | 'image-text'
  | 'promo-card'
  | 'custom-html'
  // LEGAL
  | 'copyright'
  // LAYOUT
  | 'group'
  | 'column-heading'
  | 'divider'
  | 'spacer';

export type FooterComponentCategory =
  | 'BRAND'
  | 'NAVIGATION'
  | 'CONTACT'
  | 'COMMERCE & TRUST'
  | 'ENGAGEMENT'
  | 'APP'
  | 'CONTENT'
  | 'LEGAL'
  | 'LAYOUT';

export interface ComponentPickerItem {
  id: string;
  type: FooterComponentType;
  name: string;
  category: FooterComponentCategory;
  description: string;
  scope: FooterComponentScope;
  singleton?: boolean;
  preset?: string;
  icon: string;
  defaults: Record<string, any>;
}

export const FOOTER_DIRECTORY_COMPONENTS: ComponentPickerItem[] = [
  // ═══════════════════════════════════════════════════════
  // ██ BRAND
  // ═══════════════════════════════════════════════════════
  {
    id: 'store-logo',
    type: 'logo',
    name: 'Store Logo',
    category: 'BRAND',
    description: 'Logo, Logo + Brand Name, or Brand Name only with sizing & link controls.',
    scope: 'footer-directory',
    singleton: true,
    icon: 'Sparkles',
    defaults: {
      logoType: 'both',
      brandName: 'BillionBiz',
      text: 'BillionBiz',
      sourceType: 'text',
      fontSize: 22,
      fontWeight: 800,
      textColor: '#0f172a',
      width: 140,
      height: 38,
      href: '/',
      openInNewTab: false,
      alignment: 'left',
      opacity: 100,
      hoverOpacity: 85,
      radius: 0,
    },
  },
  {
    id: 'brand-bio',
    type: 'brand-description',
    name: 'Brand Bio',
    category: 'BRAND',
    description: 'Short merchant description summarizing your brand mission and value.',
    scope: 'footer-directory',
    icon: 'FileText',
    defaults: {
      brandName: '',
      text: 'Empowering modern online merchants with frictionless store infrastructure, intelligent workflows, and conversion-optimized retail tools.',
      tagline: 'Crafted for high-growth commerce',
      fontSize: 13,
      textColor: '#64748b',
      maxWidth: 320,
      alignment: 'left',
      ctaText: 'Learn More',
      ctaHref: '/about',
      showCta: false,
    },
  },
  {
    id: 'brand-story',
    type: 'brand-story',
    name: 'Brand Story',
    category: 'BRAND',
    description: 'Long-form brand/company description highlighting craftsmanship or merchant ethos.',
    scope: 'footer-directory',
    icon: 'BookOpen',
    defaults: {
      heading: 'Our Story',
      text: 'We set out with a simple purpose: to design enduring essentials that elevate everyday routines while upholding sustainable, ethical craftsmanship.',
      fontSize: 13,
      textColor: '#64748b',
      alignment: 'left',
    },
  },
  {
    id: 'brand-rating',
    type: 'brand-rating',
    name: 'Brand Rating / Trust',
    category: 'BRAND',
    description: 'Display rating, review count, trust message, or badge (e.g. 4.8/5 • 10,000+ Customers).',
    scope: 'footer-directory',
    icon: 'Star',
    defaults: {
      rating: 4.8,
      maxRating: 5,
      reviewCount: 10000,
      trustMessage: 'Trusted by 10,000+ happy customers',
      showStars: true,
      showCount: true,
      showMessage: true,
      starColor: '#f59e0b',
      fontSize: 13,
      textColor: '#64748b',
      alignment: 'left',
    },
  },

  // ═══════════════════════════════════════════════════════
  // ██ NAVIGATION
  // ═══════════════════════════════════════════════════════
  {
    id: 'footer-link-group',
    type: 'link-group',
    name: 'Footer Link Group',
    category: 'NAVIGATION',
    description: 'Generic configurable navigation group with heading and links.',
    scope: 'footer-directory',
    icon: 'Menu',
    preset: 'Custom',
    defaults: {
      heading: 'Directory',
      headingSize: 14,
      headingColor: '#0f172a',
      links: [
        { label: 'Featured Collection', href: '/collections' },
        { label: 'New Arrivals', href: '/new' },
        { label: 'Customer Reviews', href: '/reviews' },
        { label: 'Help Desk', href: '/help' },
      ],
      fontSize: 13,
      textColor: '#64748b',
      hoverColor: '#2563eb',
      gap: 10,
    },
  },
  {
    id: 'shop-links',
    type: 'link-group',
    name: 'Shop Links',
    category: 'NAVIGATION',
    description: 'Commerce-focused predefined links to products, new arrivals, sales.',
    scope: 'footer-directory',
    preset: 'Shop',
    icon: 'ShoppingBag',
    defaults: {
      heading: 'Shop',
      headingSize: 14,
      headingColor: '#0f172a',
      links: [
        { label: 'All Products', href: '/products' },
        { label: 'New Arrivals', href: '/new', badge: 'NEW' },
        { label: 'Best Sellers', href: '/best-sellers' },
        { label: 'Seasonal Sale', href: '/sale', badge: 'SALE' },
        { label: 'Gift Cards', href: '/gift-cards' },
      ],
      fontSize: 13,
      textColor: '#64748b',
      hoverColor: '#2563eb',
      gap: 10,
    },
  },
  {
    id: 'category-links',
    type: 'link-group',
    name: 'Category Links',
    category: 'NAVIGATION',
    description: 'Product/category navigation links organized by department.',
    scope: 'footer-directory',
    preset: 'Category',
    icon: 'Layers',
    defaults: {
      heading: 'Categories',
      headingSize: 14,
      headingColor: '#0f172a',
      links: [
        { label: 'Apparel & Wear', href: '/categories/apparel' },
        { label: 'Accessories', href: '/categories/accessories' },
        { label: 'Footwear', href: '/categories/footwear' },
        { label: 'Home Goods', href: '/categories/home' },
      ],
      fontSize: 13,
      textColor: '#64748b',
      hoverColor: '#2563eb',
      gap: 10,
    },
  },
  {
    id: 'collection-links',
    type: 'link-group',
    name: 'Collection Links',
    category: 'NAVIGATION',
    description: 'Useful for Shopify-style stores to link to curated collections.',
    scope: 'footer-directory',
    preset: 'Collection',
    icon: 'LayoutGrid',
    defaults: {
      heading: 'Collections',
      headingSize: 14,
      headingColor: '#0f172a',
      links: [
        { label: 'Summer Collection', href: '/collections/summer' },
        { label: 'Winter Essentials', href: '/collections/winter' },
        { label: 'Limited Edition', href: '/collections/limited', badge: 'LIMITED' },
        { label: 'Staff Picks', href: '/collections/staff-picks' },
      ],
      fontSize: 13,
      textColor: '#64748b',
      hoverColor: '#2563eb',
      gap: 10,
    },
  },
  {
    id: 'support-links',
    type: 'link-group',
    name: 'Support Links',
    category: 'NAVIGATION',
    description: 'Help Center, Track Order, Returns, Shipping, FAQs, Contact.',
    scope: 'footer-directory',
    preset: 'Support',
    icon: 'HelpCircle',
    defaults: {
      heading: 'Support',
      headingSize: 14,
      headingColor: '#0f172a',
      links: [
        { label: 'Help Center & FAQ', href: '/help' },
        { label: 'Track Your Order', href: '/track' },
        { label: 'Shipping & Delivery', href: '/shipping' },
        { label: 'Returns & Exchanges', href: '/returns' },
        { label: 'Contact Support', href: '/contact' },
      ],
      fontSize: 13,
      textColor: '#64748b',
      hoverColor: '#2563eb',
      gap: 10,
    },
  },
  {
    id: 'company-links',
    type: 'link-group',
    name: 'Company Links',
    category: 'NAVIGATION',
    description: 'About, Careers, Press, Our Story, Sustainability, Stores.',
    scope: 'footer-directory',
    preset: 'Company',
    icon: 'Building2',
    defaults: {
      heading: 'Company',
      headingSize: 14,
      headingColor: '#0f172a',
      links: [
        { label: 'About Our Brand', href: '/about' },
        { label: 'Careers & Team', href: '/careers' },
        { label: 'Press & Media', href: '/press' },
        { label: 'Sustainability', href: '/sustainability' },
        { label: 'Store Locations', href: '/stores' },
      ],
      fontSize: 13,
      textColor: '#64748b',
      hoverColor: '#2563eb',
      gap: 10,
    },
  },
  {
    id: 'resource-links',
    type: 'link-group',
    name: 'Resource Links',
    category: 'NAVIGATION',
    description: 'Guides, Blog, Size Guide, Documentation, Community, Tutorials.',
    scope: 'footer-directory',
    preset: 'Resource',
    icon: 'Compass',
    defaults: {
      heading: 'Resources',
      headingSize: 14,
      headingColor: '#0f172a',
      links: [
        { label: 'Size & Fit Guide', href: '/size-guide' },
        { label: 'Product Care', href: '/care' },
        { label: 'Community Forum', href: '/community' },
        { label: 'Merchant Stories', href: '/stories' },
      ],
      fontSize: 13,
      textColor: '#64748b',
      hoverColor: '#2563eb',
      gap: 10,
    },
  },
  {
    id: 'custom-link-group',
    type: 'link-group',
    name: 'Custom Link Group',
    category: 'NAVIGATION',
    description: 'Completely merchant-defined navigation with custom headers and URLs.',
    scope: 'footer-directory',
    preset: 'Custom',
    icon: 'ListPlus',
    defaults: {
      heading: 'Custom Group',
      headingSize: 14,
      headingColor: '#0f172a',
      links: [
        { label: 'Custom Page 1', href: '#' },
        { label: 'Custom Page 2', href: '#' },
      ],
      fontSize: 13,
      textColor: '#64748b',
      hoverColor: '#2563eb',
      gap: 10,
    },
  },
  {
    id: 'featured-link',
    type: 'featured-link',
    name: 'Featured Link / CTA',
    category: 'NAVIGATION',
    description: 'A visually emphasized navigation item like "New Collection →" or "Shop Now →".',
    scope: 'footer-directory',
    icon: 'ExternalLink',
    defaults: {
      label: 'Shop Now',
      href: '/shop',
      suffix: '→',
      fontSize: 14,
      fontWeight: 600,
      textColor: '#2563eb',
      hoverColor: '#1d4ed8',
      openInNewTab: false,
      showBadge: false,
      badgeText: 'NEW',
      badgeBg: '#ef4444',
      badgeColor: '#ffffff',
    },
  },
  {
    id: 'legal-link-group',
    type: 'legal-link-group',
    name: 'Legal Link Group',
    category: 'NAVIGATION',
    description: 'Privacy, Terms, Cookies, Refund, Shipping — distinct styling from general navigation.',
    scope: 'footer-directory',
    icon: 'Shield',
    defaults: {
      heading: '',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Refund Policy', href: '/refund-policy' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
      ],
      fontSize: 12,
      textColor: '#94a3b8',
      hoverColor: '#64748b',
      separator: '·',
      layout: 'inline',
      gap: 12,
    },
  },

  // ═══════════════════════════════════════════════════════
  // ██ CONTACT
  // ═══════════════════════════════════════════════════════
  {
    id: 'contact-info',
    type: 'contact',
    name: 'Contact Information',
    category: 'CONTACT',
    description: 'Phone, Email, Address, WhatsApp — direct communication channels.',
    scope: 'footer-directory',
    icon: 'PhoneCall',
    defaults: {
      heading: 'Contact Us',
      phone: '+1 (800) 555-0199',
      email: 'support@yourstore.com',
      address: '100 Commerce Boulevard, Suite 400',
      whatsapp: '+1 (800) 555-0198',
      contactUrl: '/contact',
      fontSize: 13,
      textColor: '#64748b',
      showIcons: true,
      iconColor: '#38bdf8',
      gap: 8,
    },
  },
  {
    id: 'business-hours',
    type: 'business-hours',
    name: 'Business Hours',
    category: 'CONTACT',
    description: 'Operating hours, weekend schedules, and live open/closed indicator.',
    scope: 'footer-directory',
    icon: 'Clock',
    defaults: {
      heading: 'Business Hours',
      layout: 'column',
      schedules: [
        { days: 'Monday – Friday', hours: '9:00 AM – 7:00 PM EST' },
        { days: 'Saturday', hours: '10:00 AM – 5:00 PM EST' },
        { days: 'Sunday', hours: 'Closed' },
      ],
      showLiveStatus: true,
      fontSize: 13,
      textColor: '#64748b',
      accentColor: '#10b981',
      gap: 8,
    },
  },
  {
    id: 'store-locator',
    type: 'store-locator',
    name: 'Store Locator',
    category: 'CONTACT',
    description: 'Find a Store / View Locations CTA with optional zip code input.',
    scope: 'footer-directory',
    icon: 'MapPin',
    defaults: {
      heading: 'Find a Store',
      description: 'Visit one of our locations near you.',
      ctaText: 'View Locations',
      ctaHref: '/stores',
      showSearch: false,
      searchPlaceholder: 'Enter ZIP code',
      fontSize: 13,
      textColor: '#64748b',
      ctaColor: '#2563eb',
      iconColor: '#f97316',
    },
  },
  {
    id: 'whatsapp-contact',
    type: 'whatsapp-contact',
    name: 'WhatsApp Contact',
    category: 'CONTACT',
    description: 'Dedicated WhatsApp CTA with quick-connect button.',
    scope: 'footer-directory',
    icon: 'MessageCircle',
    defaults: {
      heading: 'Chat with us',
      description: 'Get instant help via WhatsApp',
      phoneNumber: '+1234567890',
      message: 'Hi! I need help with my order.',
      ctaText: 'Chat on WhatsApp',
      bgColor: '#25d366',
      textColor: '#ffffff',
      fontSize: 13,
    },
  },
  {
    id: 'support-cta',
    type: 'support-cta',
    name: 'Support CTA',
    category: 'CONTACT',
    description: 'Need help? Talk to our support team → styled call-to-action.',
    scope: 'footer-directory',
    icon: 'Headphones',
    defaults: {
      heading: 'Need help?',
      description: 'Our support team is here for you',
      ctaText: 'Talk to Support →',
      ctaHref: '/support',
      ctaStyle: 'link',
      fontSize: 13,
      textColor: '#64748b',
      ctaColor: '#2563eb',
    },
  },

  // ═══════════════════════════════════════════════════════
  // ██ COMMERCE & TRUST
  // ═══════════════════════════════════════════════════════
  {
    id: 'payment-methods-col',
    type: 'payment-methods',
    name: 'Payment Methods',
    category: 'COMMERCE & TRUST',
    description: 'Visa, Mastercard, Amex, UPI, PayPal, Apple Pay, Google Pay, Razorpay, COD.',
    scope: 'footer-directory',
    icon: 'CreditCard',
    defaults: {
      heading: 'Payment Options',
      showHeading: true,
      providers: ['visa', 'mastercard', 'amex', 'paypal', 'applepay', 'googlepay'],
      iconStyle: 'badge',
      iconSize: 20,
      gap: 6,
    },
  },
  {
    id: 'trust-badges-col',
    type: 'trust-badges',
    name: 'Trust Badges',
    category: 'COMMERCE & TRUST',
    description: 'Secure Checkout, SSL Secure, Verified Store — security reassurance.',
    scope: 'footer-directory',
    icon: 'ShieldCheck',
    defaults: {
      heading: 'Guaranteed Safe Checkout',
      showHeading: false,
      items: [
        { icon: 'shield-check', title: '256-Bit SSL Protection' },
        { icon: 'lock', title: 'Secure Checkout' },
        { icon: 'badge-check', title: 'Verified Store' },
      ],
      iconColor: '#10b981',
      fontSize: 12.5,
      gap: 8,
    },
  },
  {
    id: 'guarantees',
    type: 'guarantees',
    name: 'Guarantees',
    category: 'COMMERCE & TRUST',
    description: '30-Day Guarantee, Easy Returns, Authentic Products.',
    scope: 'footer-directory',
    icon: 'Award',
    defaults: {
      items: [
        { icon: 'rotate-ccw', title: '30-Day Money Back', description: 'No questions asked' },
        { icon: 'refresh-cw', title: 'Easy Returns', description: 'Free return shipping' },
        { icon: 'badge-check', title: 'Authentic Products', description: '100% genuine items' },
      ],
      layout: 'row',
      showIcons: true,
      iconColor: '#10b981',
      fontSize: 12.5,
      textColor: '#64748b',
      gap: 16,
    },
  },
  {
    id: 'shipping-highlights',
    type: 'shipping-highlights',
    name: 'Shipping Highlights',
    category: 'COMMERCE & TRUST',
    description: 'Free Shipping, Fast Delivery, Worldwide Shipping.',
    scope: 'footer-directory',
    icon: 'Truck',
    defaults: {
      items: [
        { icon: 'truck', title: 'Free Shipping', description: 'On orders over $50' },
        { icon: 'zap', title: 'Fast Delivery', description: '2-3 business days' },
        { icon: 'globe', title: 'Worldwide Shipping', description: 'Ship to 120+ countries' },
      ],
      layout: 'row',
      showIcons: true,
      iconColor: '#0ea5e9',
      fontSize: 12.5,
      textColor: '#64748b',
      gap: 16,
    },
  },
  {
    id: 'cod-availability',
    type: 'cod-availability',
    name: 'COD Availability',
    category: 'COMMERCE & TRUST',
    description: 'Cash on Delivery Available — especially useful for Indian ecommerce.',
    scope: 'footer-directory',
    icon: 'Banknote',
    defaults: {
      heading: 'Cash on Delivery Available',
      description: 'Pay when you receive your order. Available in select areas.',
      showIcon: true,
      iconColor: '#10b981',
      fontSize: 13,
      textColor: '#64748b',
    },
  },
  {
    id: 'security-badges',
    type: 'security-badges',
    name: 'Security Badges',
    category: 'COMMERCE & TRUST',
    description: 'Security and certification marks like PCI-DSS, McAfee Secure, Norton.',
    scope: 'footer-directory',
    icon: 'Lock',
    defaults: {
      items: [
        { icon: 'shield', title: 'PCI-DSS Compliant' },
        { icon: 'lock', title: 'SSL Encrypted' },
        { icon: 'shield-check', title: 'McAfee Secure' },
      ],
      iconSize: 18,
      iconColor: '#64748b',
      fontSize: 11,
      gap: 12,
      layout: 'inline',
    },
  },

  // ═══════════════════════════════════════════════════════
  // ██ ENGAGEMENT
  // ═══════════════════════════════════════════════════════
  {
    id: 'newsletter-signup-col',
    type: 'newsletter-form',
    name: 'Newsletter Signup',
    category: 'ENGAGEMENT',
    description: 'Email signup with heading, description, button, consent, success & error messages.',
    scope: 'footer-directory',
    icon: 'Mail',
    defaults: {
      title: 'Stay in the loop',
      subtitle: 'Subscribe for weekly releases, stories & member perks.',
      placeholder: 'Enter your email address...',
      buttonText: 'Subscribe',
      buttonStyle: 'solid',
      layout: 'stacked',
      showDisclaimer: true,
      disclaimerText: 'By subscribing you agree to our Privacy Policy.',
      successMessage: 'Thanks for subscribing!',
      errorMessage: 'Something went wrong. Please try again.',
      fontSize: 14,
      buttonBg: '#2563eb',
      buttonColor: '#ffffff',
    },
  },
  {
    id: 'social-links-col',
    type: 'social-links',
    name: 'Social Links',
    category: 'ENGAGEMENT',
    description: 'Instagram, Facebook, YouTube, X, TikTok, Pinterest, LinkedIn, WhatsApp, Threads.',
    scope: 'footer-directory',
    icon: 'Share2',
    defaults: {
      heading: 'Connect With Us',
      showHeading: true,
      variant: 'circles',
      size: 16,
      gap: 8,
      iconColor: 'currentColor',
      hoverColor: '#2563eb',
      platforms: [
        { platform: 'instagram', url: 'https://instagram.com', enabled: true },
        { platform: 'twitter', url: 'https://twitter.com', enabled: true },
        { platform: 'facebook', url: 'https://facebook.com', enabled: true },
        { platform: 'youtube', url: 'https://youtube.com', enabled: true },
        { platform: 'tiktok', url: 'https://tiktok.com', enabled: false },
        { platform: 'linkedin', url: 'https://linkedin.com', enabled: false },
        { platform: 'pinterest', url: 'https://pinterest.com', enabled: false },
        { platform: 'whatsapp', url: 'https://wa.me/', enabled: false },
        { platform: 'threads', url: 'https://threads.net', enabled: false },
      ],
    },
  },
  {
    id: 'community-cta',
    type: 'community-cta',
    name: 'Community CTA',
    category: 'ENGAGEMENT',
    description: 'Join our community / Follow us for updates → engagement call-to-action.',
    scope: 'footer-directory',
    icon: 'Users',
    defaults: {
      heading: 'Join our community',
      description: 'Follow us for the latest updates, tips, and exclusive offers.',
      ctaText: 'Follow us →',
      ctaHref: '#',
      fontSize: 13,
      textColor: '#64748b',
      ctaColor: '#2563eb',
    },
  },

  // ═══════════════════════════════════════════════════════
  // ██ APP
  // ═══════════════════════════════════════════════════════
  {
    id: 'app-download-col',
    type: 'app-download',
    name: 'App Download',
    category: 'APP',
    description: 'Heading, description, Apple App Store, Google Play, and optional QR Code.',
    scope: 'footer-directory',
    icon: 'Smartphone',
    defaults: {
      heading: 'Download Our App',
      description: 'Shop on the go with our mobile app.',
      showHeading: true,
      showAppStore: true,
      showGooglePlay: true,
      showQRCode: false,
      appStoreUrl: '#',
      googlePlayUrl: '#',
      qrCodeValue: '',
    },
  },
  {
    id: 'app-store-badge',
    type: 'app-store-badge',
    name: 'App Store Badge',
    category: 'APP',
    description: 'Standalone Apple App Store download badge.',
    scope: 'footer-directory',
    icon: 'Apple',
    defaults: {
      appStoreUrl: '#',
      width: 135,
      height: 40,
      alignment: 'left',
    },
  },
  {
    id: 'google-play-badge',
    type: 'google-play-badge',
    name: 'Google Play Badge',
    category: 'APP',
    description: 'Standalone Google Play Store download badge.',
    scope: 'footer-directory',
    icon: 'Play',
    defaults: {
      googlePlayUrl: '#',
      width: 135,
      height: 40,
      alignment: 'left',
    },
  },
  {
    id: 'qr-code',
    type: 'qr-code',
    name: 'QR Code',
    category: 'APP',
    description: 'Standalone QR code component for app download or any URL.',
    scope: 'footer-directory',
    icon: 'QrCode',
    defaults: {
      value: 'https://yourstore.com/app',
      size: 120,
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      includeMargin: true,
      alignment: 'left',
    },
  },

  // ═══════════════════════════════════════════════════════
  // ██ CONTENT
  // ═══════════════════════════════════════════════════════
  {
    id: 'rich-text',
    type: 'rich-text',
    name: 'Rich Text',
    category: 'CONTENT',
    description: 'Heading, paragraph, bold, italic, links, lists — formatted text content.',
    scope: 'footer-directory',
    icon: 'Type',
    defaults: {
      heading: 'About Our Quality',
      content: 'Every product is hand-inspected in our workshop before dispatch to guarantee lasting satisfaction.',
      alignment: 'left',
      fontSize: 13,
      textColor: '#64748b',
    },
  },
  {
    id: 'image-block',
    type: 'image',
    name: 'Image',
    category: 'CONTENT',
    description: 'Certification badge, brand image, workshop, store image, or trust seal.',
    scope: 'footer-directory',
    icon: 'Image',
    defaults: {
      imageUrl: '',
      altText: 'Footer illustration',
      linkUrl: '',
      width: 220,
      height: 120,
      radius: 6,
      objectFit: 'cover',
      alignment: 'left',
    },
  },
  {
    id: 'image-text',
    type: 'image-text',
    name: 'Image + Text',
    category: 'CONTENT',
    description: 'Image alongside text — useful for premium editorial footers.',
    scope: 'footer-directory',
    icon: 'LayoutList',
    defaults: {
      imageUrl: '',
      altText: 'Footer image',
      heading: 'Made with care',
      text: 'Each piece is crafted by hand in our studios, using only the finest materials.',
      imagePosition: 'left',
      imageWidth: 80,
      imageHeight: 80,
      imageRadius: 8,
      fontSize: 13,
      textColor: '#64748b',
      gap: 16,
    },
  },
  {
    id: 'promo-card',
    type: 'promo-card',
    name: 'Promo Card',
    category: 'CONTENT',
    description: 'Card with image, eyebrow, heading, description, and CTA button.',
    scope: 'footer-directory',
    icon: 'Megaphone',
    defaults: {
      imageUrl: '',
      eyebrow: 'Limited Time',
      heading: 'Season Sale',
      description: 'Up to 40% off on selected items.',
      ctaText: 'Shop Sale',
      ctaHref: '/sale',
      bgColor: '#f8fafc',
      borderRadius: 12,
      padding: 20,
      fontSize: 13,
      textColor: '#0f172a',
      ctaColor: '#2563eb',
    },
  },
  {
    id: 'custom-html',
    type: 'custom-html',
    name: 'Custom HTML',
    category: 'CONTENT',
    description: 'Raw HTML/SVG for third-party widgets, trust seals, or custom badges.',
    scope: 'footer-directory',
    icon: 'Code',
    defaults: {
      html: '<div class="custom-badge">Verified Merchant Guarantee</div>',
      cssClass: '',
      dataAttributes: '',
    },
  },

  // ═══════════════════════════════════════════════════════
  // ██ LEGAL
  // ═══════════════════════════════════════════════════════
  {
    id: 'copyright-col',
    type: 'copyright',
    name: 'Copyright & Notice',
    category: 'LEGAL',
    description: '© 2026 Your Store — dynamic year, brand name, custom text.',
    scope: 'footer-directory',
    icon: 'FileText',
    defaults: {
      text: '© {year} BillionBiz, Inc. All rights reserved.',
      dynamicYear: true,
      brandName: 'BillionBiz',
      customText: '',
      fontSize: 12,
      textColor: '#94a3b8',
    },
  },

  // ═══════════════════════════════════════════════════════
  // ██ LAYOUT
  // ═══════════════════════════════════════════════════════
  {
    id: 'group',
    type: 'group',
    name: 'Group',
    category: 'LAYOUT',
    description: 'Layout helper — arrange child components in a row, column, or wrap pattern.',
    scope: 'footer-directory',
    icon: 'GroupIcon',
    defaults: {
      direction: 'row',
      wrap: true,
      gap: 12,
      alignment: 'start',
      distribution: 'start',
      width: 'auto',
      maxWidth: '',
      elements: [],
    },
  },
  {
    id: 'column-heading',
    type: 'column-heading',
    name: 'Column Heading',
    category: 'LAYOUT',
    description: 'Standalone heading for a column — useful when you want a heading without a link group.',
    scope: 'footer-directory',
    icon: 'Heading',
    defaults: {
      text: 'Section Title',
      fontSize: 14,
      fontWeight: 700,
      textColor: '#0f172a',
      alignment: 'left',
      marginBottom: 12,
    },
  },
  {
    id: 'divider',
    type: 'divider',
    name: 'Divider',
    category: 'LAYOUT',
    description: 'Horizontal or vertical separator line (solid, dashed, dotted).',
    scope: 'footer-directory',
    icon: 'Minus',
    defaults: {
      style: 'solid',
      direction: 'horizontal',
      color: '#e2e8f0',
      thickness: 1,
      marginTop: 12,
      marginBottom: 12,
      width: '100%',
    },
  },
  {
    id: 'spacer',
    type: 'spacer',
    name: 'Spacer',
    category: 'LAYOUT',
    description: 'Vertical whitespace — Small, Medium, Large, or Custom.',
    scope: 'footer-directory',
    icon: 'Maximize2',
    defaults: {
      height: 20,
      size: 'medium',
    },
  },
];

// Helper to look up component metadata by type or ID
export function getFooterComponentMeta(type: string): ComponentPickerItem | undefined {
  return FOOTER_DIRECTORY_COMPONENTS.find((c) => c.type === type || c.id === type);
}

// ─── Semantic CSS Variables for Footer Directory ──────────────
export interface FooterPaletteVariables {
  '--footer-bg': string;
  '--footer-heading': string;
  '--footer-text': string;
  '--footer-muted-text': string;
  '--footer-link': string;
  '--footer-link-hover': string;
  '--footer-icon': string;
  '--footer-border': string;
  '--footer-divider': string;
  '--footer-accent': string;
  '--footer-input-bg': string;
  '--footer-input-border': string;
  '--footer-input-text': string;
}

export function computeFooterPaletteVariables(styling: any, theme?: any): FooterPaletteVariables {
  const bg = styling?.bgColor || (styling?.bgType === 'dark' ? '#0f172a' : '#ffffff');
  const isDark = isColorDark(bg);

  const defaultBg = bg;
  const defaultHeading = styling?.headingColor || (isDark ? '#f8fafc' : '#0f172a');
  const defaultText = styling?.textColor || (isDark ? '#cbd5e1' : '#334155');
  const defaultMuted = styling?.mutedTextColor || (isDark ? '#94a3b8' : '#64748b');
  const defaultLink = styling?.linkColor || defaultText;
  const defaultLinkHover = styling?.linkHoverColor || theme?.colors?.primary || '#2563eb';
  const defaultIcon = styling?.iconColor || (isDark ? '#94a3b8' : '#64748b');
  const defaultBorder = styling?.borderColor || (isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0');
  const defaultDivider = styling?.dividerColor || defaultBorder;
  const defaultAccent = styling?.accentColor || theme?.colors?.primary || '#2563eb';
  const defaultInputBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc';
  const defaultInputBorder = isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1';
  const defaultInputText = defaultHeading;

  return {
    '--footer-bg': defaultBg,
    '--footer-heading': defaultHeading,
    '--footer-text': defaultText,
    '--footer-muted-text': defaultMuted,
    '--footer-link': defaultLink,
    '--footer-link-hover': defaultLinkHover,
    '--footer-icon': defaultIcon,
    '--footer-border': defaultBorder,
    '--footer-divider': defaultDivider,
    '--footer-accent': defaultAccent,
    '--footer-input-bg': defaultInputBg,
    '--footer-input-border': defaultInputBorder,
    '--footer-input-text': defaultInputText,
  };
}

export function isColorDark(color?: string): boolean {
  if (!color) return false;
  const trimmed = color.trim().toLowerCase();
  if (trimmed === 'black' || trimmed === 'dark' || trimmed === '#000' || trimmed === '#000000') return true;
  if (trimmed.startsWith('rgb')) {
    const match = trimmed.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0], 10);
      const g = parseInt(match[1], 10);
      const b = parseInt(match[2], 10);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
    }
  }
  if (!trimmed.startsWith('#')) return false;
  const c = trimmed.replace('#', '');
  if (c.length !== 3 && c.length !== 6) return false;
  const r = parseInt(c.length === 3 ? c[0] + c[0] : c.substring(0, 2), 16);
  const g = parseInt(c.length === 3 ? c[1] + c[1] : c.substring(2, 4), 16);
  const b = parseInt(c.length === 3 ? c[2] + c[2] : c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// ─── Look Switching With Child Preservation ──────────────────
export function switchFooterLook(currentRow: FooterRow, newLookId: FooterLook, replaceContent: boolean = false): FooterRow {
  const lookDef = FOOTER_LOOKS.find((l) => l.id === newLookId) || FOOTER_LOOKS[0];

  // Collect all existing elements across all columns to preserve merchant content
  const existingElements: FooterElement[] = [];
  if (!replaceContent) {
    (currentRow.columns || []).forEach((col) => {
      (col.elements || []).forEach((el) => {
        existingElements.push(el);
      });
    });
  }

  const newColumnCount = lookDef.columns;
  const newColumns: FooterColumn[] = [];

  for (let i = 0; i < newColumnCount; i++) {
    const width = lookDef.columnWidths[i] || '1fr';
    newColumns.push({
      id: `col-dir-${i + 1}-${Date.now().toString(36)}`,
      width,
      elements: [],
    });
  }

  // Distribute existing elements into new columns sensibly
  if (existingElements.length > 0) {
    existingElements.forEach((el, index) => {
      // Branding elements (logo, bio, story) prefer Column 1
      if (el.type === 'logo' || el.type === 'brand-description' || el.type === 'brand-story') {
        newColumns[0].elements.push(el);
      } else {
        // Distribute other components evenly across remaining columns (or all columns if only 1 column)
        const targetColIdx = newColumnCount === 1 ? 0 : 1 + ((index - 1 + newColumnCount - 1) % (newColumnCount - 1));
        const safeIdx = Math.min(targetColIdx, newColumnCount - 1);
        newColumns[safeIdx].elements.push(el);
      }
    });
  } else {
    // Fallback: Populate with defaults if no elements existed
    newColumns[0].elements.push({
      id: `el-ftr-logo-${Date.now().toString(36)}`,
      type: 'logo',
      name: 'Store Logo',
      isLocked: false,
      capabilities: ['style', 'content', 'link', 'responsive', 'advanced'],
      props: FOOTER_DIRECTORY_COMPONENTS[0].defaults,
    });
    newColumns[0].elements.push({
      id: `el-ftr-bio-${Date.now().toString(36)}`,
      type: 'brand-description',
      name: 'Brand Bio',
      capabilities: ['style', 'content', 'design', 'responsive', 'advanced'],
      props: FOOTER_DIRECTORY_COMPONENTS[1].defaults,
    });

    if (newColumnCount > 1) {
      newColumns[1].elements.push({
        id: `el-ftr-shop-${Date.now().toString(36)}`,
        type: 'link-group',
        name: 'Shop Links',
        capabilities: ['style', 'menu', 'design', 'responsive', 'advanced'],
        props: FOOTER_DIRECTORY_COMPONENTS[4].defaults,
      });
    }
    if (newColumnCount > 2) {
      newColumns[2].elements.push({
        id: `el-ftr-support-${Date.now().toString(36)}`,
        type: 'link-group',
        name: 'Support Links',
        capabilities: ['style', 'menu', 'design', 'responsive', 'advanced'],
        props: FOOTER_DIRECTORY_COMPONENTS[6].defaults,
      });
    }
    if (newColumnCount > 3) {
      newColumns[3].elements.push({
        id: `el-ftr-company-${Date.now().toString(36)}`,
        type: 'link-group',
        name: 'Company Links',
        capabilities: ['style', 'menu', 'design', 'responsive', 'advanced'],
        props: FOOTER_DIRECTORY_COMPONENTS[7].defaults,
      });
    }
  }

  return {
    ...currentRow,
    layout: {
      ...currentRow.layout,
      columns: newColumnCount,
      variantId: newLookId,
    },
    columns: newColumns,
    responsive: {
      ...currentRow.responsive,
      mobileLayout: lookDef.mobileBehavior === 'accordion' ? 'accordion' : 'stack',
    },
  };
}
