// ============================================================
// MASTER EDITOR ENGINE — FOOTER PRESETS & FACTORY
// Structure, Appearance, and Curated Presets for the Footer editor
// (spec §33, §34, §35, §36).
// ============================================================

import type {
  FooterRow,
  GlobalFooterSettings,
  PresetConfig,
  FooterVariant,
  FooterArrangement,
  FooterTemplate,
} from './types';
import { createDefaultFooterTree } from './footerTreeEngine';

// ─── Default Footer Factory ──────────────────────────────────

export function createDefaultFooterStack(): FooterRow[] {
  return [
    {
      id: 'footer-main',
      type: 'navigation',
      name: 'Footer',
      isVisible: true,
      layout: {
        container: 'constrained',
        columns: 4,
        gap: 40,
        alignment: 'stretch',
        verticalAlignment: 'top',
        paddingX: 32,
        paddingY: 64,
      },
      styling: {
        bgType: 'theme',
        bgColor: '#ffffff',
        textColor: '#0f172a',
        borderTop: false,
        borderBottom: false,
        borderColor: '#e2e8f0',
        dividerStyle: 'solid',
        shadow: 'none',
        radius: 0,
        fontSize: 14,
      },
      columns: [],
      children: createDefaultFooterTree(),
    },
  ];
}

export function createDefaultFooterGlobalSettings(): GlobalFooterSettings {
  return {
    animation: 'fade-in',
    backToTop: true,
    backToTopStyle: 'pill',
    backToTopPosition: 'after-scroll',
    density: 'comfortable',
    tokens: {
      bgType: 'theme',
      bgColor: '#ffffff',
      textColorType: 'theme',
      textColor: '#0f172a',
      accentColorType: 'theme',
      accentColor: '#6366f1',
      borderColorType: 'theme',
      borderColor: '#e2e8f0',
      fontFamilyType: 'theme',
      fontFamily: 'Inter',
      buttonRadiusType: 'theme',
      buttonRadius: 8,
      shadowType: 'theme',
      shadow: 'none',
    },
    responsiveRules: {
      desktop: { visible: true, columnCount: 4 },
      tablet: { visible: true, columnCount: 2, layout: 'grid' },
      mobile: {
        visible: true,
        layout: 'accordion',
        columnCount: 1,
        showNewsletter: true,
        showPayment: true,
        showSocial: true,
      },
    },
    displayRules: {
      targetAudience: 'all',
      countries: [],
      devices: ['desktop', 'tablet', 'mobile'],
      scheduleEnabled: false,
      timezone: 'UTC',
    },
    accessibility: {
      ariaLabels: true,
      landmarkRole: 'contentinfo',
      keyboardNavigation: true,
      focusOutline: true,
      skipToContent: true,
    },
    seo: {
      structuredLinks: true,
      logoH1OnHome: false,
      breadcrumbRelationship: false,
    },
    performance: {
      lazyLoadMegaMedia: true,
      optimizeImages: true,
      reduceMotion: false,
      disableExpensiveEffects: false,
    },
    customCss: '',
    customClasses: '',
    customAttributes: '',
    structurePreset: 'classic-multicolumn',
    appearancePreset: 'modern',
    curatedPreset: 'modern-commerce',
  };
}

// ─── Footer Structure Presets (spec §33) ──────────────────────

export const FOOTER_STRUCTURE_PRESETS: PresetConfig[] = [
  {
    id: 'classic-multicolumn',
    name: 'Classic Multi Column',
    type: 'structure',
    category: 'core',
    description: 'Balanced 4-column layout with brand story, shop links, support, and newsletter.',
    diagram: 'Brand Col | Shop Col | Support Col | Newsletter Col',
  },
  {
    id: 'brand-dominant',
    name: 'Brand Dominant',
    type: 'structure',
    category: 'core',
    description: 'Prominent large brand manifesto, high-impact imagery, and compact bottom link matrix.',
    diagram: 'Large Brand Hero Box\nLinks | Social | Legal',
  },
  {
    id: 'centered',
    name: 'Centered Minimalist',
    type: 'structure',
    category: 'core',
    description: 'Symmetric centered logo with elegant horizontal link pills and centered socials.',
    diagram: 'Logo\nLink • Link • Link\nSocials | © Copyright',
  },
  {
    id: 'split',
    name: 'Split 50/50',
    type: 'structure',
    category: 'core',
    description: 'Left side dedicated to brand and email signup; right side dedicated to navigation columns.',
    diagram: 'Brand + Newsletter (50%) | Nav Columns (50%)',
  },
  {
    id: 'newsletter-first',
    name: 'Newsletter First',
    type: 'structure',
    category: 'core',
    description: 'High-conversion email/SMS collection hero row on top, followed by organized footer links.',
    diagram: 'Newsletter Hero Banner\nBrand | Shop | Info | Social',
  },
  {
    id: 'commerce-dense',
    name: 'Commerce Dense',
    type: 'structure',
    category: 'advanced',
    description: 'Multi-category department store layout with category links, trust badges, and order tracking.',
    diagram: 'Categories (8 cols) | Badges | Payments | App Downloads',
  },
  {
    id: 'editorial',
    name: 'Editorial / Magazine',
    type: 'structure',
    category: 'advanced',
    description: 'Sophisticated typography, founder notes, publications, and literary styling.',
    diagram: 'Manifesto Quote | Issue Index | Masthead Credits',
  },
  {
    id: 'minimal',
    name: 'Ultra Minimal',
    type: 'structure',
    category: 'core',
    description: 'Clean single-row footer with essential copyright, legal links, and social handles.',
    diagram: 'Logo | Essential Links | Socials | Copyright',
  },
  {
    id: 'mega-footer',
    name: 'Mega Footer',
    type: 'structure',
    category: 'advanced',
    description: 'Enterprise footer with comprehensive site sitemap, global selectors, and trust certifications.',
    diagram: 'Sitemap Grid | Country Pickers | Compliance Matrix',
  },
  {
    id: 'legal-heavy',
    name: 'Legal & Compliance Heavy',
    type: 'structure',
    category: 'advanced',
    description: 'Designed for regulated industries, fintech, and pharmaceutical stores requiring disclaimers.',
    diagram: 'Disclaimers | Licensure | Policies | Regulatory Badges',
  },
  {
    id: 'side-rail',
    name: 'Side Rail Docked',
    type: 'structure',
    category: 'advanced',
    description: 'Sticky bottom dock or sidebar footer extension for specialized modern experiences.',
    diagram: 'Fixed Utility Rail | Expandable Drawer',
  },
];

// ─── Footer Appearance Presets (spec §34) ─────────────────────

export const FOOTER_APPEARANCE_PRESETS: PresetConfig[] = [
  {
    id: 'modern',
    name: 'Modern Clean',
    type: 'appearance',
    category: 'core',
    description: 'Crisp white surface, subtle slate borders, and sharp indigo accents.',
    styling: {
      bgColor: '#ffffff',
      textColor: '#0f172a',
      borderColor: '#e2e8f0',
      accentColor: '#6366f1',
    },
  },
  {
    id: 'dark',
    name: 'Deep Slate Dark',
    type: 'appearance',
    category: 'core',
    description: 'High-contrast midnight slate background with luminous white typography.',
    styling: {
      bgColor: '#0f172a',
      textColor: '#f8fafc',
      borderColor: '#1e293b',
      accentColor: '#38bdf8',
    },
  },
  {
    id: 'luxury',
    name: 'Luxury Champagne',
    type: 'appearance',
    category: 'advanced',
    description: 'Warm obsidian black with subtle champagne gold borders and refined typography.',
    styling: {
      bgColor: '#141416',
      textColor: '#f5f5f7',
      borderColor: '#2e2c28',
      accentColor: '#d4af37',
    },
  },
  {
    id: 'editorial',
    name: 'Editorial Paper',
    type: 'appearance',
    category: 'advanced',
    description: 'Creamy warm paper tones, serif headings, and ink-black typography.',
    styling: {
      bgColor: '#faf8f5',
      textColor: '#1a1917',
      borderColor: '#e8e5df',
      accentColor: '#b45309',
    },
  },
  {
    id: 'tech',
    name: 'Tech Indigo',
    type: 'appearance',
    category: 'core',
    description: 'Deep indigo-tinted charcoal with vivid violet accents and futuristic badges.',
    styling: {
      bgColor: '#090d16',
      textColor: '#e0e7ff',
      borderColor: '#1e1b4b',
      accentColor: '#818cf8',
    },
  },
  {
    id: 'glass',
    name: 'Frosted Glassmorphism',
    type: 'appearance',
    category: 'advanced',
    description: 'Semi-translucent backdrop blur with soft glowing borders for modern overlays.',
    styling: {
      bgColor: 'rgba(255, 255, 255, 0.85)',
      textColor: '#0f172a',
      borderColor: 'rgba(226, 232, 240, 0.7)',
      accentColor: '#6366f1',
    },
  },
  {
    id: 'minimal',
    name: 'Pure Monochrome',
    type: 'appearance',
    category: 'core',
    description: 'Zero distraction pure black and white typography.',
    styling: {
      bgColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#000000',
      accentColor: '#000000',
    },
  },
];

// ─── Footer Curated Presets (spec §35) ────────────────────────

export const FOOTER_CURATED_PRESETS: PresetConfig[] = [
  {
    id: 'modern-commerce',
    name: 'Modern Commerce',
    type: 'curated',
    category: 'core',
    description: 'Optimized for high-volume retail stores: Trust badges, multi-column navigation, and email capture.',
  },
  {
    id: 'luxury-fashion',
    name: 'Luxury Fashion',
    type: 'curated',
    category: 'advanced',
    description: 'Understated elegance, concierge contact details, atelier bio, and boutique hours.',
  },
  {
    id: 'tech-saas',
    name: 'Tech & SaaS',
    type: 'curated',
    category: 'core',
    description: 'Developer resources, API status link, compliance badges, and dark tech styling.',
  },
  {
    id: 'marketplace',
    name: 'Global Marketplace',
    type: 'curated',
    category: 'advanced',
    description: 'Multi-currency selector, seller registration CTA, extensive category links, and buyer protection.',
  },
  {
    id: 'department-store',
    name: 'Department Store',
    type: 'curated',
    category: 'advanced',
    description: 'Dense directory with 6+ link columns, credit card offers, and order tracking.',
  },
  {
    id: 'minimal-store',
    name: 'Minimal Storefront',
    type: 'curated',
    category: 'core',
    description: 'Clean and lightweight for single-product brands and focused lifestyle studios.',
  },
];

export function createCenteredBrandStack(): FooterRow[] {
  return [
    {
      id: 'row-main-nav',
      type: 'navigation',
      name: 'Centered Brand & Links',
      isVisible: true,
      layout: {
        container: 'boxed',
        columns: 1,
        gap: 20,
        alignment: 'center',
        verticalAlignment: 'center',
        paddingX: 24,
        paddingY: 56,
      },
      styling: {
        bgType: 'theme',
        bgColor: '#ffffff',
        textColor: '#0f172a',
        borderTop: true,
        borderBottom: false,
        borderColor: '#e2e8f0',
        dividerStyle: 'none',
        shadow: 'none',
        radius: 0,
        fontSize: 14,
      },
      columns: [
        {
          id: 'col-centered-brand',
          width: '1fr',
          elements: [
            {
              id: 'el-brand-logo',
              type: 'logo',
              name: 'Store Emblem',
              capabilities: ['style', 'content'],
              props: { text: '✦ BILLIONBIZ ✦', fontSize: 26, fontWeight: 800, textAlign: 'center' },
            },
            {
              id: 'el-brand-bio',
              type: 'brand-description',
              name: 'Atelier Bio',
              capabilities: ['style', 'content'],
              props: { text: 'Crafting premium storefront architectures and curated digital retail goods.', maxWidth: 480 },
            },
            {
              id: 'el-links',
              type: 'link-group',
              name: 'Horizontal Menu',
              capabilities: ['style', 'menu'],
              props: {
                links: [
                  { label: 'Shop All', href: '/products' },
                  { label: 'Collections', href: '/collections' },
                  { label: 'Our Story', href: '/about' },
                  { label: 'Journal', href: '/blog' },
                  { label: 'Customer Care', href: '/contact' },
                ],
              },
            },
            {
              id: 'el-socials',
              type: 'social-links',
              name: 'Social Channels',
              capabilities: ['style', 'links'],
              props: {
                platforms: [
                  { platform: 'instagram', url: 'https://instagram.com', enabled: true },
                  { platform: 'twitter', url: 'https://twitter.com', enabled: true },
                  { platform: 'youtube', url: 'https://youtube.com', enabled: true },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: 'row-bottom-legal',
      type: 'legal',
      name: 'Centered Copyright',
      isVisible: true,
      layout: { container: 'boxed', columns: 1, gap: 12, alignment: 'center', verticalAlignment: 'center', paddingX: 20, paddingY: 20 },
      styling: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#64748b', borderTop: true, borderBottom: false, borderColor: '#e2e8f0', dividerStyle: 'none', shadow: 'none', radius: 0, fontSize: 12 },
      columns: [
        {
          id: 'col-legal-centered',
          width: '1fr',
          elements: [
            {
              id: 'el-copyright',
              type: 'copyright',
              name: 'Copyright Line',
              capabilities: ['style', 'content'],
              props: { text: '© {year} BillionBiz Technologies Inc. All rights reserved.' },
            },
          ],
        },
      ],
    },
  ];
}

export function createNewsletterFirstStack(): FooterRow[] {
  return [
    {
      id: 'row-newsletter-top',
      type: 'newsletter',
      name: 'Newsletter Hero Banner',
      isVisible: true,
      layout: { container: 'constrained', columns: 1, gap: 20, alignment: 'center', verticalAlignment: 'center', paddingX: 32, paddingY: 48 },
      styling: { bgType: 'theme', bgColor: '#0f172a', textColor: '#ffffff', borderTop: true, borderBottom: true, borderColor: '#1e293b', dividerStyle: 'none', shadow: 'none', radius: 0, fontSize: 14 },
      columns: [
        {
          id: 'col-newsletter-banner',
          width: '1fr',
          elements: [
            {
              id: 'el-newsletter-banner',
              type: 'newsletter-form',
              name: 'VIP Newsletter Form',
              capabilities: ['style', 'content', 'form'],
              props: {
                headline: 'Get 15% Off Your First Order',
                description: 'Join our private mailing list for early access to product drops and member pricing.',
                buttonText: 'Subscribe',
                discountCode: 'WELCOME15',
              },
            },
          ],
        },
      ],
    },
    ...createDefaultFooterStack(),
  ];
}

export function createMegaCommerceStack(): FooterRow[] {
  return [
    {
      id: 'row-trust-1',
      type: 'trust',
      name: 'Trust & Confidence Row',
      isVisible: true,
      layout: { container: 'constrained', columns: 1, gap: 24, alignment: 'center', verticalAlignment: 'center', paddingX: 32, paddingY: 24 },
      styling: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a', borderTop: true, borderBottom: true, borderColor: '#e2e8f0', dividerStyle: 'solid', shadow: 'none', radius: 0, fontSize: 14 },
      columns: [
        {
          id: 'col-trust-full',
          width: '1fr',
          elements: [
            {
              id: 'el-trust-1',
              type: 'trust-badges',
              name: 'Customer Guarantees',
              capabilities: ['style', 'content'],
              props: {
                items: [
                  { icon: 'shield-check', title: 'Bank-Grade Security', description: '256-bit SSL encrypted checkout' },
                  { icon: 'truck', title: 'Free Express Shipping', description: 'Orders over $75 qualify' },
                  { icon: 'refresh-cw', title: '30-Day Easy Returns', description: 'Zero hassle refund process' },
                  { icon: 'headphones', title: '24/7 Priority Support', description: 'Instant response guarantee' },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: 'row-main-nav',
      type: 'navigation',
      name: 'Mega Storefront Directory',
      isVisible: true,
      layout: { container: 'constrained', columns: 5, gap: 32, alignment: 'stretch', verticalAlignment: 'top', paddingX: 32, paddingY: 56 },
      styling: { bgType: 'theme', bgColor: '#0f172a', textColor: '#ffffff', borderTop: false, borderBottom: true, borderColor: '#1e293b', dividerStyle: 'solid', shadow: 'none', radius: 0, fontSize: 14 },
      columns: [
        {
          id: 'col-brand',
          width: '1.4fr',
          elements: [
            { id: 'el-logo', type: 'logo', name: 'Logo', capabilities: ['style'], props: { text: 'BillionBiz', fontSize: 24, fontWeight: 800 } },
            { id: 'el-bio', type: 'brand-description', name: 'Bio', capabilities: ['style'], props: { text: 'Your one-stop enterprise marketplace for design assets, components, and tools.' } },
            { id: 'el-socials', type: 'social-links', name: 'Socials', capabilities: ['style'], props: {} },
          ],
        },
        {
          id: 'col-categories',
          width: '1fr',
          elements: [
            { id: 'el-cat-links', type: 'link-group', name: 'Categories', capabilities: ['style'], props: { heading: 'Categories', links: [{ label: 'Clothing', href: '/shop' }, { label: 'Electronics', href: '/shop' }, { label: 'Accessories', href: '/shop' }, { label: 'Home Living', href: '/shop' }] } },
          ],
        },
        {
          id: 'col-collections',
          width: '1fr',
          elements: [
            { id: 'el-col-links', type: 'link-group', name: 'Collections', capabilities: ['style'], props: { heading: 'Collections', links: [{ label: 'Best Sellers', href: '/best', badge: 'HOT' }, { label: 'Summer Drop', href: '/summer', badge: 'NEW' }, { label: 'Clearance', href: '/sale', badge: 'SALE' }] } },
          ],
        },
        {
          id: 'col-support',
          width: '1fr',
          elements: [
            { id: 'el-sup-links', type: 'link-group', name: 'Customer Care', capabilities: ['style'], props: { heading: 'Support', links: [{ label: 'Track Order', href: '/track' }, { label: 'Shipping Info', href: '/shipping' }, { label: 'Returns', href: '/returns' }, { label: 'FAQ', href: '/help' }] } },
          ],
        },
        {
          id: 'col-app',
          width: '1fr',
          elements: [
            { id: 'el-app-card', type: 'app-download', name: 'Get App', capabilities: ['style'], props: { title: 'Mobile App' } },
          ],
        },
      ],
    },
    {
      id: 'row-bottom-legal',
      type: 'legal',
      name: 'Bottom Legal & Payments Bar',
      isVisible: true,
      layout: { container: 'constrained', columns: 2, gap: 16, alignment: 'space-between', verticalAlignment: 'center', paddingX: 32, paddingY: 20 },
      styling: { bgType: 'theme', bgColor: '#090d16', textColor: '#94a3b8', borderTop: false, borderBottom: false, borderColor: '#1e293b', dividerStyle: 'none', shadow: 'none', radius: 0, fontSize: 12 },
      columns: [
        {
          id: 'col-copyright',
          width: '1fr',
          elements: [
            { id: 'el-copy', type: 'copyright', name: 'Copyright', capabilities: ['style'], props: { text: '© {year} BillionBiz Commerce Inc.' } },
          ],
        },
        {
          id: 'col-payments',
          width: '1fr',
          elements: [
            { id: 'el-pmts', type: 'payment-methods', name: 'Payments', capabilities: ['style'], props: {} },
          ],
        },
      ],
    },
  ];
}

export function createMinimalFooterStack(): FooterRow[] {
  return [
    {
      id: 'row-main-nav',
      type: 'navigation',
      name: 'Minimal Clean Footer',
      isVisible: true,
      layout: { container: 'constrained', columns: 3, gap: 20, alignment: 'stretch', verticalAlignment: 'center', paddingX: 32, paddingY: 32 },
      styling: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', borderTop: true, borderBottom: false, borderColor: '#e2e8f0', dividerStyle: 'none', shadow: 'none', radius: 0, fontSize: 13 },
      columns: [
        {
          id: 'col-min-logo',
          width: '1fr',
          elements: [
            { id: 'el-logo', type: 'logo', name: 'Logo', capabilities: ['style'], props: { text: 'BillionBiz', fontSize: 18, fontWeight: 800 } },
          ],
        },
        {
          id: 'col-min-links',
          width: '1.5fr',
          elements: [
            {
              id: 'el-links',
              type: 'link-group',
              name: 'Essential Links',
              capabilities: ['style', 'menu'],
              props: {
                links: [
                  { label: 'Shop', href: '/products' },
                  { label: 'About', href: '/about' },
                  { label: 'Privacy', href: '/privacy' },
                  { label: 'Terms', href: '/terms' },
                ],
              },
            },
          ],
        },
        {
          id: 'col-min-right',
          width: '1fr',
          elements: [
            { id: 'el-copy', type: 'copyright', name: 'Copyright', capabilities: ['style'], props: { text: '© {year} BillionBiz' } },
          ],
        },
      ],
    },
  ];
}

// ─── Footer Variants ──────────────────────────────────────

export const FOOTER_VARIANTS: FooterVariant[] = [
  {
    id: 'classic-multi-column',
    name: 'Classic Multi-Column',
    description: 'Brand bio + 3-4 link columns + newsletter subscription. The standard for commerce.',
    category: 'commerce',
    previewDiagram: '🏷️ Brand Bio  |  Shop  |  Support  |  Company  |  📧 Newsletter\n💳 Payment Methods  |  © Legal  |  🔗 Social',
    rows: createDefaultFooterStack(),
    compatibleArrangementIds: ['standard-multi-column', 'brand-left-links-right', 'stacked'],
    compatibleTemplateIds: ['tpl-modern-commerce', 'tpl-marketplace'],
  },
  {
    id: 'centered-brand',
    name: 'Centered Brand',
    description: 'Centered logo and bio, horizontal links below, legal bottom. Clean and focused.',
    category: 'fashion',
    previewDiagram: '         🏷️ Brand Logo\n    About  |  Shop  |  Contact\n      📧 Newsletter Signup\n      © 2026 All rights reserved',
    rows: createCenteredBrandStack(),
    globalOverrides: { curatedPreset: 'centered-brand' },
    compatibleArrangementIds: ['centered', 'stacked'],
    compatibleTemplateIds: ['tpl-luxury-fashion', 'tpl-editorial'],
  },
  {
    id: 'newsletter-first',
    name: 'Newsletter First',
    description: 'Hero newsletter banner at top, then navigation links and legal. Lead capture focused.',
    category: 'commerce',
    previewDiagram: '📧 Join Our VIP List — Get 15% Off\n   [Enter email]  [Subscribe]\n──────────────────────────────\n🏷️ Brand  |  Shop  |  Support  |  Legal',
    rows: createNewsletterFirstStack(),
    compatibleArrangementIds: ['stacked', 'standard-multi-column'],
    compatibleTemplateIds: ['tpl-modern-commerce', 'tpl-trust-focused'],
  },
  {
    id: 'mega-commerce',
    name: 'Mega Commerce',
    description: 'Dense multi-column with categories, collections, brands, trust badges, and legal.',
    category: 'commerce',
    previewDiagram: '🛡️ Trust Badges\n📂 Categories | 🏷️ Brands | 📦 Collections | 🎁 Gift Cards | 📞 Support\n💳 Payment  |  🔗 Social  |  © Legal',
    rows: createMegaCommerceStack(),
    compatibleArrangementIds: ['standard-multi-column', 'stacked'],
    compatibleTemplateIds: ['tpl-marketplace', 'tpl-modern-commerce'],
  },
  {
    id: 'minimal-footer',
    name: 'Minimal Footer',
    description: 'Single-row compact footer: logo, key links, legal. Maximum content focus.',
    category: 'creative',
    previewDiagram: '🏷️ Logo  |  Shop  About  Contact  |  © 2026  |  🔗 Social',
    rows: createMinimalFooterStack(),
    compatibleArrangementIds: ['centered', 'standard-multi-column'],
    compatibleTemplateIds: ['tpl-minimal'],
  },
  {
    id: 'trust-payments',
    name: 'Trust & Payments',
    description: 'Trust badges prominent at top, payment methods row, then legal. Conversion-focused.',
    category: 'commerce',
    previewDiagram: '🛡️ Secure Payments  |  🚚 Free Shipping  |  🔄 Easy Returns\n💳 Visa  MC  Amex  PayPal  Apple Pay\n© 2026 All rights reserved  |  Privacy  Terms',
    rows: createDefaultFooterStack(),
    compatibleArrangementIds: ['stacked', 'brand-left-links-right'],
    compatibleTemplateIds: ['tpl-trust-focused', 'tpl-modern-commerce'],
  },
  {
    id: 'corporate-footer',
    name: 'Corporate',
    description: 'Formal multi-column layout: About, Services, Resources, Contact. Professional tone.',
    category: 'corporate',
    previewDiagram: '🏢 About Us  |  Services  |  Resources  |  Contact\n📧 Newsletter  |  🔗 Social  |  © Legal',
    rows: createDefaultFooterStack(),
    compatibleArrangementIds: ['brand-left-links-right', 'standard-multi-column'],
    compatibleTemplateIds: ['tpl-corporate', 'tpl-tech-saas'],
  },
  {
    id: 'editorial-footer',
    name: 'Editorial',
    description: 'Large brand presence, curated content links, social prominence. Magazine feel.',
    category: 'editorial',
    previewDiagram: '         ✦ BRAND ✦\n    Stories  |  Shop  |  About\n      🔗 Social Profiles\n    © 2026 All rights reserved',
    rows: createCenteredBrandStack(),
    compatibleArrangementIds: ['centered', 'stacked'],
    compatibleTemplateIds: ['tpl-editorial', 'tpl-luxury-fashion'],
  },
];

// ─── Footer Arrangements ──────────────────────────────────

export const FOOTER_ARRANGEMENTS: FooterArrangement[] = [
  {
    id: 'standard-multi-column',
    name: 'Standard Multi-Column',
    description: 'Even columns side by side. Classic layout for link directories.',
    layout: { container: 'constrained', columns: 4, gap: 40, alignment: 'stretch', verticalAlignment: 'top' },
  },
  {
    id: 'brand-left-links-right',
    name: 'Brand Left + Links Right',
    description: 'Wide brand column on left, narrow link columns on right.',
    layout: { container: 'constrained', columns: 4, gap: 32, alignment: 'stretch', verticalAlignment: 'top' },
  },
  {
    id: 'centered',
    name: 'Centered',
    description: 'Everything centered. Clean, symmetrical layout.',
    layout: { container: 'constrained', columns: 1, gap: 24, alignment: 'center', verticalAlignment: 'center' },
  },
  {
    id: 'stacked',
    name: 'Stacked',
    description: 'Full-width rows stacked vertically. Each section takes the full width.',
    layout: { container: 'constrained', columns: 1, gap: 0, alignment: 'stretch', verticalAlignment: 'top' },
  },
  {
    id: 'mega-grid',
    name: 'Mega Grid',
    description: 'Dense multi-column grid for large catalogs with many link groups.',
    layout: { container: 'constrained', columns: 6, gap: 24, alignment: 'stretch', verticalAlignment: 'top' },
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Tight single-row or two-row layout. Minimal vertical space.',
    layout: { container: 'constrained', columns: 3, gap: 16, alignment: 'stretch', verticalAlignment: 'center', paddingX: 20, paddingY: 16 },
  },
];

// ─── Footer Templates ─────────────────────────────────────

export const FOOTER_TEMPLATES: FooterTemplate[] = [
  {
    id: 'tpl-modern-commerce',
    name: 'Modern Commerce',
    description: 'Full-featured storefront footer with trust, navigation, newsletter, payment, social, and legal.',
    category: 'commerce',
    variantId: 'classic-multi-column',
    arrangementId: 'standard-multi-column',
    rows: createDefaultFooterStack(),
  },
  {
    id: 'tpl-luxury-fashion',
    name: 'Luxury Fashion',
    description: 'Centered brand with elegant serif styling, refined link columns, and premium feel.',
    category: 'fashion',
    variantId: 'centered-brand',
    arrangementId: 'centered',
    rows: createDefaultFooterStack(),
  },
  {
    id: 'tpl-tech-saas',
    name: 'Tech SaaS',
    description: 'Developer-focused footer with resources, API docs, compliance, and dark theme.',
    category: 'saas',
    variantId: 'corporate-footer',
    arrangementId: 'standard-multi-column',
    rows: createDefaultFooterStack(),
  },
  {
    id: 'tpl-marketplace',
    name: 'Marketplace',
    description: 'Dense mega footer with extensive category links, seller info, and buyer protection.',
    category: 'commerce',
    variantId: 'mega-commerce',
    arrangementId: 'mega-grid',
    rows: createDefaultFooterStack(),
  },
  {
    id: 'tpl-editorial',
    name: 'Editorial Brand',
    description: 'Large brand presence, curated content links, social media prominence.',
    category: 'editorial',
    variantId: 'editorial-footer',
    arrangementId: 'centered',
    rows: createDefaultFooterStack(),
  },
  {
    id: 'tpl-minimal',
    name: 'Minimal Store',
    description: 'Clean minimal footer with just essentials. Maximum content focus.',
    category: 'creative',
    variantId: 'minimal-footer',
    arrangementId: 'compact',
    rows: createDefaultFooterStack(),
  },
  {
    id: 'tpl-corporate',
    name: 'Corporate',
    description: 'Professional multi-column footer for business and enterprise sites.',
    category: 'corporate',
    variantId: 'corporate-footer',
    arrangementId: 'brand-left-links-right',
    rows: createDefaultFooterStack(),
  },
  {
    id: 'tpl-trust-focused',
    name: 'Trust-Focused Commerce',
    description: 'Conversion-optimized with prominent trust badges and payment methods.',
    category: 'commerce',
    variantId: 'trust-payments',
    arrangementId: 'stacked',
    rows: createDefaultFooterStack(),
  },
];
