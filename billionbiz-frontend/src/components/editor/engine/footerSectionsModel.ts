// ============================================================
// MASTER FOOTER ARCHITECTURE — FOOTER STACK SECTIONS MODEL
// Presets, Looks, Capabilities, and Defaults for all 7 independent
// Footer Stack sections (excluding locked Footer Directory).
// ============================================================

export type FooterStackSectionType =
  | 'trust'
  | 'newsletter'
  | 'social'
  | 'app'
  | 'contact'
  | 'payment'
  | 'legal'
  | 'seo'
  | 'category-links';

export interface SectionLookDefinition {
  id: string;
  name: string;
  description: string;
  category?: 'standard' | 'modern' | 'compact' | 'promotional' | 'custom';
  capabilities: {
    cards?: boolean;
    icons?: boolean;
    images?: boolean;
    links?: boolean;
    form?: boolean;
    social?: boolean;
    map?: boolean;
    badges?: boolean;
    animation?: boolean;
    autoScroll?: boolean;
    feed?: boolean;
    qr?: boolean;
    localization?: boolean;
    responsiveModes?: string[];
  };
  supportedTabs: Array<'look' | 'content' | 'layout' | 'behavior' | 'design' | 'responsive' | 'visibility' | 'advanced'>;
  defaults: {
    layout: Record<string, any>;
    design: Record<string, any>;
    behavior?: Record<string, any>;
    responsive?: Record<string, any>;
  };
}

// ────────────────────────────────────────────────────────────
// 1. TRUST & GUARANTEES LOOKS (10 LOOKS)
// ────────────────────────────────────────────────────────────
export const TRUST_LOOKS: SectionLookDefinition[] = [
  {
    id: 'horizontal-benefits',
    name: '1. Horizontal Benefits',
    description: 'Clean single-row strip with icons and concise reassuring trust guarantees.',
    capabilities: { icons: true, links: true, badges: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 4, gap: 24, alignment: 'center', paddingX: 32, paddingY: 24, itemsPerRow: 4 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a', iconColor: '#6366f1', borderTop: true, borderBottom: true, borderColor: '#e2e8f0' },
      responsive: { desktopColumns: 4, tabletColumns: 2, mobileLayout: 'stack' }
    }
  },
  {
    id: 'icon-text-cards',
    name: '2. Icon + Text Cards',
    description: 'Card-based containers with prominent colored icons, bold titles, and reassuring descriptions.',
    capabilities: { icons: true, cards: true, links: true, badges: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 4, gap: 20, alignment: 'stretch', paddingX: 32, paddingY: 36, cardPadding: 20 },
      design: { bgType: 'theme', bgColor: '#ffffff', cardBg: '#f8fafc', textColor: '#0f172a', iconColor: '#2563eb', cardBorder: true, cardRadius: 10 },
      behavior: { hoverAnimation: 'lift', autoScroll: false },
      responsive: { desktopColumns: 4, tabletColumns: 2, mobileLayout: '2-columns' }
    }
  },
  {
    id: 'four-equal-cards',
    name: '3. Four Equal Cards',
    description: 'Four balanced symmetrical benefit blocks across the footer container.',
    capabilities: { icons: true, cards: true, links: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 4, gap: 20, alignment: 'center', paddingX: 32, paddingY: 32 },
      design: { bgType: 'theme', bgColor: '#f1f5f9', cardBg: '#ffffff', textColor: '#0f172a', iconColor: '#10b981', cardRadius: 8 },
      behavior: { hoverAnimation: 'scale' },
      responsive: { desktopColumns: 4, tabletColumns: 2, mobileLayout: 'stack' }
    }
  },
  {
    id: 'three-large-benefits',
    name: '4. Three Large Benefits',
    description: 'Spacious high-impact 3-column layout giving maximum prominence to key customer promises.',
    capabilities: { icons: true, cards: true, links: true, badges: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 3, gap: 32, alignment: 'center', paddingX: 32, paddingY: 40 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', iconColor: '#6366f1', borderTop: true, borderColor: '#e2e8f0' },
      responsive: { desktopColumns: 3, tabletColumns: 3, mobileLayout: 'stack' }
    }
  },
  {
    id: 'compact-trust-strip',
    name: '5. Compact Trust Strip',
    description: 'Single-line ultra-compact inline ribbon with subtle divider dots.',
    capabilities: { icons: true, links: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'full', columns: 4, gap: 16, alignment: 'center', paddingX: 24, paddingY: 14 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#475569', iconColor: '#64748b', fontSize: 12 },
      responsive: { mobileLayout: 'compact-strip' }
    }
  },
  {
    id: 'centered-trust',
    name: '6. Centered Trust',
    description: 'Centered icons and guarantee headlines grouped gracefully across the horizontal axis.',
    capabilities: { icons: true, links: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 3, gap: 36, alignment: 'center', paddingX: 32, paddingY: 36 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', iconColor: '#0ea5e9' },
      responsive: { mobileLayout: 'stack' }
    }
  },
  {
    id: 'highlighted-trust-cards',
    name: '7. Highlighted Trust Cards',
    description: 'Premium accented cards with illuminated borders and subtle drop shadows.',
    capabilities: { icons: true, cards: true, links: true, badges: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 4, gap: 24, alignment: 'stretch', paddingX: 32, paddingY: 40 },
      design: { bgType: 'theme', bgColor: '#ffffff', cardBg: '#f8fafc', cardBorderColor: '#6366f1', cardRadius: 12, shadow: 'soft' },
      behavior: { hoverAnimation: 'glow' },
      responsive: { mobileLayout: '2-columns' }
    }
  },
  {
    id: 'dark-trust-strip',
    name: '8. Dark Trust Strip',
    description: 'High-contrast nocturnal banner with vibrant neon-tinted icons.',
    capabilities: { icons: true, links: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'full', columns: 4, gap: 28, alignment: 'center', paddingX: 32, paddingY: 28 },
      design: { bgType: 'custom', bgColor: '#0f172a', textColor: '#f8fafc', iconColor: '#38bdf8', borderColor: '#1e293b' },
      responsive: { mobileLayout: 'horizontal-scroll' }
    }
  },
  {
    id: 'split-trust',
    name: '9. Split Trust',
    description: 'Hero USP badge on the left alongside supporting warranty and shipping promises on the right.',
    capabilities: { icons: true, cards: true, links: true, badges: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 2, gap: 40, alignment: 'space-between', paddingX: 32, paddingY: 36 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', iconColor: '#f59e0b' },
      responsive: { mobileLayout: 'stack' }
    }
  },
  {
    id: 'custom-trust',
    name: '10. Fully Custom',
    description: 'Bespoke layout configuration with unrestricted styling and ordering.',
    capabilities: { icons: true, cards: true, links: true, badges: true, animation: true, autoScroll: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 4, gap: 20, alignment: 'center', paddingX: 32, paddingY: 30 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', iconColor: '#6366f1' },
      behavior: { autoScroll: false, pauseOnHover: true },
      responsive: { mobileLayout: 'horizontal-scroll' }
    }
  }
];

// ────────────────────────────────────────────────────────────
// 2. NEWSLETTER / EMAIL SIGNUP LOOKS (11 LOOKS)
// ────────────────────────────────────────────────────────────
export const NEWSLETTER_LOOKS: SectionLookDefinition[] = [
  {
    id: 'centered-signup',
    name: '1. Centered Signup',
    description: 'Focused hero subscription block with centered heading, incentive copy, and high-contrast email CTA.',
    capabilities: { form: true, badges: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', paddingX: 32, paddingY: 48, formWidth: 480 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a', buttonBg: '#2563eb', buttonColor: '#ffffff', radius: 8 },
      behavior: { submitAction: 'inline-success', preventDuplicates: true }
    }
  },
  {
    id: 'split-newsletter',
    name: '2. Split Newsletter',
    description: 'Left column dedicated to newsletter pitch and incentives; right column holds input and submit button.',
    capabilities: { form: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', paddingX: 32, paddingY: 40, splitRatio: '50-50' },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', buttonBg: '#0f172a', buttonColor: '#ffffff' },
      behavior: { submitAction: 'inline-success' }
    }
  },
  {
    id: 'large-cta-banner',
    name: '3. Large CTA Banner',
    description: 'Expansive promotional banner with generous padding, background aura, and prominent conversion focus.',
    capabilities: { form: true, badges: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', paddingX: 40, paddingY: 64, formWidth: 540 },
      design: { bgType: 'custom', bgColor: '#4338ca', textColor: '#ffffff', buttonBg: '#ffffff', buttonColor: '#4338ca', radius: 12 },
      behavior: { submitAction: 'inline-success' }
    }
  },
  {
    id: 'minimal-inline',
    name: '4. Minimal Inline',
    description: 'Sleek horizontal inline format connecting input and arrow button in a single fluid container.',
    capabilities: { form: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', paddingX: 24, paddingY: 24, formWidth: 420 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', buttonBg: '#2563eb', buttonColor: '#ffffff', borderTop: true, borderColor: '#e2e8f0' }
    }
  },
  {
    id: 'dark-premium',
    name: '5. Dark Premium',
    description: 'Sophisticated deep obsidian panel with slate typography and illuminated emerald or gold button.',
    capabilities: { form: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'full', alignment: 'center', paddingX: 32, paddingY: 52, formWidth: 500 },
      design: { bgType: 'custom', bgColor: '#090d16', textColor: '#f8fafc', buttonBg: '#10b981', buttonColor: '#ffffff', radius: 8 },
      behavior: { submitAction: 'inline-success' }
    }
  },
  {
    id: 'image-newsletter',
    name: '6. Image + Newsletter',
    description: 'Lifestyle imagery or product preview card on one flank, subscription incentive on the opposite flank.',
    capabilities: { form: true, images: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', paddingX: 32, paddingY: 44, splitRatio: '45-55' },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', buttonBg: '#2563eb', buttonColor: '#ffffff' }
    }
  },
  {
    id: 'discount-signup',
    name: '7. Discount Signup',
    description: 'High-conversion coupon code giveaway (e.g. 10% or $15 off first order) with copyable coupon badge.',
    capabilities: { form: true, badges: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', paddingX: 32, paddingY: 48, formWidth: 480 },
      design: { bgType: 'custom', bgColor: '#fef2f2', textColor: '#991b1b', buttonBg: '#ef4444', buttonColor: '#ffffff', radius: 8 },
      behavior: { submitAction: 'show-coupon', couponCode: 'SAVE10' }
    }
  },
  {
    id: 'newsletter-social',
    name: '8. Newsletter + Social',
    description: 'Email capture form combined with community follower count badges and social links.',
    capabilities: { form: true, social: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', paddingX: 32, paddingY: 40, formWidth: 460 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a', buttonBg: '#2563eb', buttonColor: '#ffffff' }
    }
  },
  {
    id: 'full-width-promo',
    name: '9. Full Width Promo',
    description: 'Edge-to-edge full bleed promotional subscription band with subtle gradient backdrop.',
    capabilities: { form: true, badges: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'full', alignment: 'center', paddingX: 32, paddingY: 48, formWidth: 520 },
      design: { bgType: 'custom', bgColor: '#1e1b4b', textColor: '#ffffff', buttonBg: '#6366f1', buttonColor: '#ffffff' },
      behavior: { submitAction: 'inline-success' }
    }
  },
  {
    id: 'compact-mobile',
    name: '10. Compact Mobile',
    description: 'Space-saving slim inline banner optimized for high tap accuracy and small screens.',
    capabilities: { form: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', paddingX: 20, paddingY: 20, formWidth: 360 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', buttonBg: '#0f172a', buttonColor: '#ffffff', fontSize: 13 }
    }
  },
  {
    id: 'custom-newsletter',
    name: '11. Custom',
    description: 'Fully customizable layout with configurable input types, button states, and privacy toggles.',
    capabilities: { form: true, badges: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', paddingX: 32, paddingY: 40, formWidth: 480 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a', buttonBg: '#2563eb', buttonColor: '#ffffff' },
      behavior: { submitAction: 'inline-success' }
    }
  }
];

// ────────────────────────────────────────────────────────────
// 3. SOCIAL / COMMUNITY LOOKS (11 LOOKS)
// ────────────────────────────────────────────────────────────
export const SOCIAL_LOOKS: SectionLookDefinition[] = [
  {
    id: 'icon-row',
    name: '1. Icon Row',
    description: 'Clean horizontal row of social icons with subtle hover glow.',
    capabilities: { social: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 16, iconSize: 22, paddingX: 32, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#ffffff', iconColor: '#64748b', hoverColor: '#2563eb' },
      behavior: { hoverEffect: 'glow' }
    }
  },
  {
    id: 'social-text',
    name: '2. Social + Text',
    description: 'Header text (e.g. "Join our 250k+ community") alongside social profile badges.',
    capabilities: { social: true, links: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 24, paddingX: 32, paddingY: 28 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a', iconColor: '#475569' }
    }
  },
  {
    id: 'large-social-cta',
    name: '3. Large Social CTA',
    description: 'Full width invitation banner with community perks and prominent social buttons.',
    capabilities: { social: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 20, paddingX: 32, paddingY: 44 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', iconColor: '#6366f1' },
      behavior: { hoverEffect: 'lift' }
    }
  },
  {
    id: 'social-newsletter',
    name: '4. Social + Newsletter',
    description: 'Social presence integrated beside an email capture callout.',
    capabilities: { social: true, form: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 32, paddingX: 32, paddingY: 32 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a', iconColor: '#2563eb' }
    }
  },
  {
    id: 'community-cards',
    name: '5. Community Cards',
    description: 'Individual cards for Discord, Instagram, YouTube and X with follower counts.',
    capabilities: { social: true, cards: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 16, paddingX: 32, paddingY: 36, cardPadding: 16 },
      design: { bgType: 'theme', bgColor: '#ffffff', cardBg: '#f8fafc', cardRadius: 8, cardBorder: true },
      behavior: { hoverEffect: 'scale' }
    }
  },
  {
    id: 'social-feed',
    name: '6. Social Feed',
    description: 'Visual Instagram or TikTok grid preview strip with clickable posts.',
    capabilities: { social: true, feed: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'full', alignment: 'center', gap: 12, feedColumns: 6, paddingX: 16, paddingY: 28 },
      design: { bgType: 'theme', bgColor: '#0f172a', textColor: '#f8fafc' },
      behavior: { hoverEffect: 'zoom', openLightbox: true }
    }
  },
  {
    id: 'social-brand-message',
    name: '7. Social + Brand Message',
    description: 'Tagline & brand hashtag (e.g. #MadeWithBillionBiz) above stylish rounded buttons.',
    capabilities: { social: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 20, paddingX: 32, paddingY: 32 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', iconColor: '#0ea5e9' }
    }
  },
  {
    id: 'dark-social-panel',
    name: '8. Dark Social Panel',
    description: 'High-contrast nocturnal strip with frosted glass circular icon badges.',
    capabilities: { social: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'full', alignment: 'center', gap: 18, paddingX: 32, paddingY: 28 },
      design: { bgType: 'custom', bgColor: '#0b0f19', textColor: '#f8fafc', iconColor: '#38bdf8' },
      behavior: { hoverEffect: 'glow' }
    }
  },
  {
    id: 'centered-social',
    name: '9. Centered Social',
    description: 'Minimalist centered social icons with equal horizontal distribution.',
    capabilities: { social: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 24, paddingX: 32, paddingY: 20 },
      design: { bgType: 'theme', bgColor: '#ffffff', iconColor: '#64748b' }
    }
  },
  {
    id: 'compact-social-strip',
    name: '10. Compact Social Strip',
    description: 'Slimline single-row social icons with compact padding.',
    capabilities: { social: true, animation: false },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 12, iconSize: 18, paddingX: 20, paddingY: 12 },
      design: { bgType: 'theme', bgColor: '#f8fafc', iconColor: '#94a3b8' }
    }
  },
  {
    id: 'custom-social',
    name: '11. Custom',
    description: 'Tailored layout supporting bespoke platforms, custom SVG badges, and community metrics.',
    capabilities: { social: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 16, paddingX: 32, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#ffffff', iconColor: '#2563eb' },
      behavior: { hoverEffect: 'lift' }
    }
  }
];

// ────────────────────────────────────────────────────────────
// 4. APP DOWNLOAD LOOKS (10 LOOKS)
// ────────────────────────────────────────────────────────────
export const APP_LOOKS: SectionLookDefinition[] = [
  {
    id: 'simple-app-cta',
    name: '1. Simple App CTA',
    description: 'Clean title, brief value pitch, and official App Store and Google Play store badges.',
    capabilities: { images: true, links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 20, paddingX: 32, paddingY: 36 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a' }
    }
  },
  {
    id: 'split-app-promo',
    name: '2. Split App Promo',
    description: 'Headline and description on the left; store badges and QR code on the right.',
    capabilities: { qr: true, links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 36, paddingX: 32, paddingY: 40 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a' }
    }
  },
  {
    id: 'phone-mockup',
    name: '3. Phone Mockup',
    description: 'Realistic smartphone bezel graphic previewing the store mobile app in action.',
    capabilities: { images: true, links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 40, paddingX: 32, paddingY: 52 },
      design: { bgType: 'theme', bgColor: '#f1f5f9', textColor: '#0f172a' }
    }
  },
  {
    id: 'qr-app-badges',
    name: '4. QR + App Badges',
    description: 'Instant scan-to-install QR code alongside App Store and Google Play badges.',
    capabilities: { qr: true, links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 28, paddingX: 32, paddingY: 36, qrSize: 100 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a' }
    }
  },
  {
    id: 'large-app-banner',
    name: '5. Large App Banner',
    description: 'High-impact full width promotional hero showcasing app exclusivity incentives.',
    capabilities: { images: true, links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'full', alignment: 'center', gap: 32, paddingX: 40, paddingY: 60 },
      design: { bgType: 'custom', bgColor: '#1e1b4b', textColor: '#ffffff' }
    }
  },
  {
    id: 'dark-app-promo',
    name: '6. Dark App Promo',
    description: 'Deep midnight backdrop with illuminated neon store badges.',
    capabilities: { links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 24, paddingX: 32, paddingY: 44 },
      design: { bgType: 'custom', bgColor: '#0f172a', textColor: '#f8fafc' }
    }
  },
  {
    id: 'app-benefits',
    name: '7. App + Benefits',
    description: 'Highlights app-exclusive benefits like 1-click checkout, notifications, and VIP sales.',
    capabilities: { icons: true, links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 32, paddingX: 32, paddingY: 40 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a' }
    }
  },
  {
    id: 'compact-app-strip',
    name: '8. Compact App Strip',
    description: 'Slimline single-line app reminder with store badges.',
    capabilities: { links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 16, paddingX: 24, paddingY: 16 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#475569' }
    }
  },
  {
    id: 'mobile-first-app-cta',
    name: '9. Mobile-First App CTA',
    description: 'Optimized touch CTA with direct deep-linking detection for mobile users.',
    capabilities: { links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 16, paddingX: 20, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a' }
    }
  },
  {
    id: 'custom-app',
    name: '10. Custom',
    description: 'Fully custom app download section with configurable buttons and asset uploads.',
    capabilities: { images: true, qr: true, links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 24, paddingX: 32, paddingY: 36 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a' }
    }
  }
];

// ────────────────────────────────────────────────────────────
// 5. CONTACT / STORE INFORMATION LOOKS (10 LOOKS)
// ────────────────────────────────────────────────────────────
export const CONTACT_LOOKS: SectionLookDefinition[] = [
  {
    id: 'contact-list',
    name: '1. Contact List',
    description: 'Direct list of telephone, email, physical address, and instant messaging handles.',
    capabilities: { icons: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 28, paddingX: 32, paddingY: 32 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a', iconColor: '#2563eb' }
    }
  },
  {
    id: 'contact-cards',
    name: '2. Contact Cards',
    description: 'Cards grouping phone, email, and location with 1-click contact actions.',
    capabilities: { icons: true, cards: true, links: true, animation: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 3, gap: 20, alignment: 'stretch', paddingX: 32, paddingY: 36, cardPadding: 20 },
      design: { bgType: 'theme', bgColor: '#ffffff', cardBg: '#f8fafc', cardRadius: 8, cardBorder: true, iconColor: '#6366f1' },
      behavior: { hoverEffect: 'lift' }
    }
  },
  {
    id: 'contact-business-hours',
    name: '3. Contact + Business Hours',
    description: 'Contact details paired with retail store opening hours and live open/closed indicator.',
    capabilities: { icons: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 2, gap: 32, alignment: 'space-between', paddingX: 32, paddingY: 36 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', iconColor: '#10b981' }
    }
  },
  {
    id: 'store-info-grid',
    name: '4. Store Information Grid',
    description: 'Comprehensive 4-column directory for physical retail outlets, phone, and coordinates.',
    capabilities: { icons: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 4, gap: 24, alignment: 'start', paddingX: 32, paddingY: 40 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a', iconColor: '#0ea5e9' }
    }
  },
  {
    id: 'store-locator-cta',
    name: '5. Store Locator CTA',
    description: 'Find a store callout with zip code search and map pin icon.',
    capabilities: { icons: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 24, paddingX: 32, paddingY: 36 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a', iconColor: '#f97316' }
    }
  },
  {
    id: 'contact-map',
    name: '6. Contact + Map',
    description: 'Embedded Google Maps frame beside contact details and driving directions.',
    capabilities: { icons: true, map: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 2, gap: 36, alignment: 'space-between', paddingX: 32, paddingY: 44 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a' }
    }
  },
  {
    id: 'contact-whatsapp',
    name: '7. Contact + WhatsApp',
    description: 'Featured 1-click WhatsApp support button with average response time guarantee.',
    capabilities: { icons: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 20, paddingX: 32, paddingY: 32 },
      design: { bgType: 'custom', bgColor: '#f0fdf4', textColor: '#166534', iconColor: '#22c55e' }
    }
  },
  {
    id: 'split-contact',
    name: '8. Split Contact',
    description: 'Editorial brand note on the left; structured support channels on the right.',
    capabilities: { icons: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 2, gap: 40, alignment: 'space-between', paddingX: 32, paddingY: 36 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a' }
    }
  },
  {
    id: 'compact-contact-strip',
    name: '9. Compact Contact Strip',
    description: 'Single-line contact ribbon displaying phone, email and hours.',
    capabilities: { icons: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 20, paddingX: 24, paddingY: 14 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#475569', fontSize: 13 }
    }
  },
  {
    id: 'custom-contact',
    name: '10. Custom',
    description: 'Customizable contact matrix with arbitrary communication channels.',
    capabilities: { icons: true, links: true, map: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 24, paddingX: 32, paddingY: 32 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a' }
    }
  }
];

// ────────────────────────────────────────────────────────────
// 6. PAYMENT & SECURITY LOOKS (10 LOOKS)
// ────────────────────────────────────────────────────────────
export const PAYMENT_LOOKS: SectionLookDefinition[] = [
  {
    id: 'payment-logos',
    name: '1. Payment Logos',
    description: 'Row of recognized payment method badges (Visa, Mastercard, Amex, PayPal, Apple Pay).',
    capabilities: { badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 12, paddingX: 32, paddingY: 20, badgeSize: 'small' },
      design: { bgType: 'theme', bgColor: '#ffffff', logoOpacity: 0.85 }
    }
  },
  {
    id: 'payment-security',
    name: '2. Payment + Security',
    description: 'Payment icons paired with SSL 256-bit encryption badge and safe checkout statement.',
    capabilities: { badges: true, icons: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 24, paddingX: 32, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#475569' }
    }
  },
  {
    id: 'security-badge-row',
    name: '3. Security Badge Row',
    description: 'Emphasizes compliance, PCI-DSS security, McAfee Secure, and Norton seals.',
    capabilities: { badges: true, icons: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 20, paddingX: 32, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a' }
    }
  },
  {
    id: 'payments-trust-message',
    name: '4. Payments + Trust Message',
    description: 'Headline "Shop with confidence. 100% verified authentic & encrypted" above badges.',
    capabilities: { badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 16, paddingX: 32, paddingY: 28 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a' }
    }
  },
  {
    id: 'compact-payment-strip',
    name: '5. Compact Payment Strip',
    description: 'Slimline single-line payment strip with grayscale or monochrome badges.',
    capabilities: { badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 8, paddingX: 20, paddingY: 12 },
      design: { bgType: 'theme', bgColor: '#ffffff', logoOpacity: 0.7 }
    }
  },
  {
    id: 'centered-payment-section',
    name: '6. Centered Payment Section',
    description: 'Centered payment options grouped in a clean bordered frame.',
    capabilities: { badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 14, paddingX: 32, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#ffffff', borderTop: true, borderColor: '#f1f5f9' }
    }
  },
  {
    id: 'dark-security-section',
    name: '7. Dark Security Section',
    description: 'High-contrast nocturnal strip highlighting illuminated security badges.',
    capabilities: { badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'full', alignment: 'center', gap: 16, paddingX: 32, paddingY: 24 },
      design: { bgType: 'custom', bgColor: '#090d16', textColor: '#94a3b8' }
    }
  },
  {
    id: 'payment-cards',
    name: '8. Payment Cards',
    description: 'Individual cards for cards, digital wallets, buy-now-pay-later (Klarna, Afterpay).',
    capabilities: { badges: true, cards: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 16, paddingX: 32, paddingY: 28 },
      design: { bgType: 'theme', bgColor: '#f8fafc', cardBg: '#ffffff', cardBorder: true, cardRadius: 6 }
    }
  },
  {
    id: 'payment-cod',
    name: '9. Payment + COD',
    description: 'Prominently features Cash on Delivery (COD) badge alongside online card gateways.',
    capabilities: { badges: true, icons: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 20, paddingX: 32, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#0f172a' }
    }
  },
  {
    id: 'custom-payment',
    name: '10. Custom',
    description: 'Fully custom payment and security showcase with arbitrary method icons and badges.',
    capabilities: { badges: true, icons: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 12, paddingX: 32, paddingY: 20 },
      design: { bgType: 'theme', bgColor: '#ffffff' }
    }
  }
];

// ────────────────────────────────────────────────────────────
// 7. LEGAL & BOTTOM BAR LOOKS (10 LOOKS)
// ────────────────────────────────────────────────────────────
export const LEGAL_LOOKS: SectionLookDefinition[] = [
  {
    id: 'classic-bottom-bar',
    name: '1. Classic Bottom Bar',
    description: 'Copyright statement on the left; privacy, terms, and refund policy links on the right.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 20, paddingX: 32, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#64748b', fontSize: 12 }
    }
  },
  {
    id: 'legal-payment',
    name: '2. Legal + Payment',
    description: 'Copyright & policy links on the left with payment method icons on the right.',
    capabilities: { links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 20, paddingX: 32, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#64748b', borderTop: true, borderColor: '#f1f5f9' }
    }
  },
  {
    id: 'three-part-bottom-bar',
    name: '3. Three-Part Bottom Bar',
    description: 'Three balanced sections: Copyright (left), Legal policies (center), and Localization (right).',
    capabilities: { links: true, localization: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 24, paddingX: 32, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#64748b' }
    }
  },
  {
    id: 'minimal-bottom',
    name: '4. Minimal',
    description: 'Clean single-line copyright and essential policies separated by subtle bullet dots.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 16, paddingX: 24, paddingY: 16 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#94a3b8', fontSize: 12 }
    }
  },
  {
    id: 'centered-bottom',
    name: '5. Centered',
    description: 'Everything centered: copyright line on top, policy links below in balanced symmetry.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 12, paddingX: 32, paddingY: 24, direction: 'column' },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#64748b' }
    }
  },
  {
    id: 'full-utility-bottom-bar',
    name: '6. Full Utility Bottom Bar',
    description: 'Copyright, legal links, language switcher, country selector, currency picker, and back to top.',
    capabilities: { links: true, localization: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 24, paddingX: 32, paddingY: 28 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#475569' }
    }
  },
  {
    id: 'legal-social',
    name: '7. Legal + Social',
    description: 'Copyright & policy links beside compact social profile handles.',
    capabilities: { links: true, social: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 20, paddingX: 32, paddingY: 20 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#64748b' }
    }
  },
  {
    id: 'dark-premium-bottom',
    name: '8. Dark Premium',
    description: 'Deep black background with muted gray legal typography and subtle hover brightness.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'full', alignment: 'space-between', gap: 20, paddingX: 32, paddingY: 24 },
      design: { bgType: 'custom', bgColor: '#090d16', textColor: '#64748b', borderColor: '#1e293b', borderTop: true }
    }
  },
  {
    id: 'compact-mobile-bottom',
    name: '9. Compact Mobile',
    description: 'Stacked mobile-first legal ribbon with large touch-friendly policy pills.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'center', gap: 12, paddingX: 20, paddingY: 16, direction: 'column' },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#94a3b8', fontSize: 11.5 }
    }
  },
  {
    id: 'custom-bottom',
    name: '10. Custom',
    description: 'Completely customizable bottom bar with user-defined arrangement and disclosures.',
    capabilities: { links: true, badges: true, localization: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', alignment: 'space-between', gap: 20, paddingX: 32, paddingY: 24 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#64748b' }
    }
  }
];

// ────────────────────────────────────────────────────────────
// 8. SEO / RICH CONTENT LOOKS (10 LOOKS)
// ────────────────────────────────────────────────────────────
export const SEO_LOOKS: SectionLookDefinition[] = [
  {
    id: 'keyword-story',
    name: '1. Keyword Story & Brand Bio',
    description: 'Rich editorial narrative optimized for search visibility with highlighted keywords and brand mission.',
    capabilities: { links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 36, alignment: 'left', maxWidth: 960 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#475569', fontSize: 13, borderTop: true, borderColor: '#e2e8f0' },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'category-cloud',
    name: '2. Category & Keyword Cloud',
    description: 'Pill-shaped indexed taxonomy tags for rapid indexing of top product categories and collections.',
    capabilities: { badges: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 28, alignment: 'center', gap: 10 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#334155', borderTop: true, borderColor: '#e2e8f0' },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'expandable-seo',
    name: '3. Expandable Read More SEO Block',
    description: 'High-density commercial search text with smooth truncated "Read More / Show Less" toggle.',
    capabilities: { animation: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 32, alignment: 'left' },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#64748b', fontSize: 12.5, borderTop: true, borderColor: '#e2e8f0' },
      behavior: { defaultCollapsed: true, collapsedHeight: 70 },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'faq-accordion',
    name: '4. Rich FAQ SEO Accordion',
    description: 'Frequently Asked Questions with JSON-LD schema compatibility for search engine rich results.',
    capabilities: { animation: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 40, alignment: 'left' },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#0f172a', borderTop: true, borderColor: '#e2e8f0' },
      behavior: { accordionMode: true, allowMultipleOpen: false },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'two-column-rich',
    name: '5. Two-Column Rich Overview',
    description: 'Split architecture: Store introduction & certifications on the left, popular searches on the right.',
    capabilities: { cards: true, links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 2, paddingX: 32, paddingY: 36, gap: 40, alignment: 'left' },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#334155', borderTop: true, borderColor: '#e2e8f0' },
      responsive: { desktopColumns: 2, tabletColumns: 1, mobileLayout: 'stack' },
    },
  },
  {
    id: 'dense-links-grid',
    name: '6. Dense SEO Link Directory',
    description: 'Shopify / Amazon style multi-category link grid maximizing organic page-rank distribution.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', columns: 5, paddingX: 32, paddingY: 32, gap: 20, alignment: 'left' },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#475569', fontSize: 11.5, borderTop: true, borderColor: '#e2e8f0' },
      responsive: { desktopColumns: 5, tabletColumns: 3, mobileLayout: 'stack' },
    },
  },
  {
    id: 'breadcrumb-seo',
    name: '7. Breadcrumb Taxonomy & Cities',
    description: 'Geographical store presence & regional search index for local and international SEO.',
    capabilities: { links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 24, alignment: 'left', gap: 12 },
      design: { bgType: 'theme', bgColor: '#ffffff', textColor: '#64748b', fontSize: 12, borderTop: true, borderColor: '#cbd5e1' },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'minimal-seo-bar',
    name: '8. Minimal SEO Disclaimer',
    description: 'Subtle, low-contrast footer text band for legal and organic search compliance without visual clutter.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 18, alignment: 'center' },
      design: { bgType: 'theme', bgColor: 'transparent', textColor: '#94a3b8', fontSize: 11, borderTop: true, borderColor: '#f1f5f9' },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'rich-snippet-summary',
    name: '9. Rich Snippet & Certifications',
    description: 'Google Rich Snippet trust cards, customer star ratings, and certified organic merchant verification.',
    capabilities: { badges: true, cards: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 28, alignment: 'center', gap: 24 },
      design: { bgType: 'theme', bgColor: '#f8fafc', textColor: '#1e293b', borderTop: true, borderColor: '#e2e8f0' },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'custom-seo-html',
    name: '10. Custom Structured Data / HTML',
    description: 'Raw HTML & microdata script injection for custom JSON-LD schemas and advanced search optimization.',
    capabilities: { form: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'full', paddingX: 32, paddingY: 24, alignment: 'left' },
      design: { bgType: 'custom', bgColor: '#ffffff', textColor: '#334155', borderTop: true, borderColor: '#e2e8f0' },
      responsive: { mobileLayout: 'stack' },
    },
  },
];

// ────────────────────────────────────────────────────────────
// 9. CATEGORY DIRECTORY LINKS LOOKS (6 LOOKS)
// ────────────────────────────────────────────────────────────
export const CATEGORY_LINKS_LOOKS: SectionLookDefinition[] = [
  {
    id: 'classic-inline-comma',
    name: '1. Classic Inline Comma',
    description: 'Clean uppercase category titles with horizontal wrapping text links separated by commas.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 36, categoryGap: 24, titleGap: 8, alignment: 'left' },
      design: { bgType: 'theme', bgColor: '#ffffff', titleColor: '#0f172a', linkColor: '#64748b', linkHoverColor: '#0f172a', separatorColor: '#94a3b8', fontSize: 13, titleFontSize: 13, borderTop: true, borderColor: '#e2e8f0' },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'modern-bullet-dot',
    name: '2. Modern Bullet Dot',
    description: 'Muted bullet dot (•) separator between links with refined hover transitions.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 36, categoryGap: 24, titleGap: 8, alignment: 'left' },
      design: { bgType: 'theme', bgColor: '#f8fafc', titleColor: '#0f172a', linkColor: '#475569', linkHoverColor: '#2563eb', separatorColor: '#cbd5e1', fontSize: 13, titleFontSize: 13, borderTop: true, borderColor: '#e2e8f0' },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'pill-chips-shelf',
    name: '3. Pill Chips Shelves',
    description: 'Modern badge chips layout where each link has a rounded pill container and subtle background.',
    capabilities: { links: true, badges: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 36, categoryGap: 26, titleGap: 10, alignment: 'left' },
      design: { bgType: 'theme', bgColor: '#ffffff', titleColor: '#0f172a', linkColor: '#334155', linkHoverColor: '#1d4ed8', pillBg: '#f1f5f9', pillHoverBg: '#e2e8f0', fontSize: 12.5, titleFontSize: 13, borderTop: true, borderColor: '#e2e8f0' },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'pipe-minimalist',
    name: '4. Pipe Delimited Minimalist',
    description: 'Refined vertical pipe (|) separated links with high contrast typography.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 32, categoryGap: 22, titleGap: 8, alignment: 'left' },
      design: { bgType: 'theme', bgColor: '#ffffff', titleColor: '#0f172a', linkColor: '#64748b', linkHoverColor: '#000000', separatorColor: '#cbd5e1', fontSize: 12.5, titleFontSize: 13, borderTop: true, borderColor: '#e2e8f0' },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'split-two-col',
    name: '5. Two-Column Category Shelves',
    description: 'Category name positioned in a left header column with horizontal links flowing on the right.',
    capabilities: { links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 36, categoryGap: 28, titleGap: 16, alignment: 'left' },
      design: { bgType: 'theme', bgColor: '#ffffff', titleColor: '#0f172a', linkColor: '#64748b', linkHoverColor: '#2563eb', separatorColor: '#cbd5e1', fontSize: 13, titleFontSize: 13, borderTop: true, borderColor: '#e2e8f0' },
      responsive: { mobileLayout: 'stack' },
    },
  },
  {
    id: 'boxed-card-shelves',
    name: '6. Card Shelves / Boxed Categories',
    description: 'Each category group enclosed within a clean card container with subtle borders.',
    capabilities: { cards: true, links: true },
    supportedTabs: ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'],
    defaults: {
      layout: { container: 'constrained', paddingX: 32, paddingY: 36, categoryGap: 16, titleGap: 10, alignment: 'left' },
      design: { bgType: 'theme', bgColor: '#f8fafc', cardBg: '#ffffff', titleColor: '#0f172a', linkColor: '#475569', linkHoverColor: '#2563eb', separatorColor: '#94a3b8', fontSize: 12.5, titleFontSize: 13, borderTop: true, borderColor: '#e2e8f0' },
      responsive: { mobileLayout: 'stack' },
    },
  },
];

// ────────────────────────────────────────────────────────────
// REGISTRY MAP FOR EASY LOOKUP
// ────────────────────────────────────────────────────────────
export const FOOTER_STACK_SECTION_REGISTRY: Record<
  FooterStackSectionType,
  {
    name: string;
    description: string;
    looks: SectionLookDefinition[];
    defaultLookId: string;
  }
> = {
  trust: {
    name: 'Trust & Guarantees',
    description: 'Communicates security, shipping speed, returns policy, and customer reassurance.',
    looks: TRUST_LOOKS,
    defaultLookId: 'horizontal-benefits'
  },
  newsletter: {
    name: 'Newsletter / Email Signup',
    description: 'Dedicated customer acquisition & email collection subscription strip.',
    looks: NEWSLETTER_LOOKS,
    defaultLookId: 'centered-signup'
  },
  social: {
    name: 'Social / Community',
    description: 'Brand social links, community follow CTAs, and feed previews.',
    looks: SOCIAL_LOOKS,
    defaultLookId: 'icon-row'
  },
  app: {
    name: 'App Download',
    description: 'Store mobile app download links, App Store / Google Play badges, and QR codes.',
    looks: APP_LOOKS,
    defaultLookId: 'simple-app-cta'
  },
  contact: {
    name: 'Contact / Store Information',
    description: 'Customer contact channels, physical address, business hours, and store locator.',
    looks: CONTACT_LOOKS,
    defaultLookId: 'contact-list'
  },
  payment: {
    name: 'Payment & Security',
    description: 'Payment gateway logos, SSL certifications, and transaction trust assurances.',
    looks: PAYMENT_LOOKS,
    defaultLookId: 'payment-logos'
  },
  legal: {
    name: 'Legal & Bottom Bar',
    description: 'Copyright notices, legal policy links, localization pickers, and back-to-top utilities.',
    looks: LEGAL_LOOKS,
    defaultLookId: 'classic-bottom-bar'
  },
  seo: {
    name: 'SEO / Rich Content',
    description: 'Search engine optimized content, brand stories, keyword taxonomy, and rich text.',
    looks: SEO_LOOKS,
    defaultLookId: 'keyword-story'
  },
  'category-links': {
    name: 'Category Directory Links',
    description: 'Comprehensive category taxonomy with horizontal wrapping keyword links.',
    looks: CATEGORY_LINKS_LOOKS,
    defaultLookId: 'classic-inline-comma'
  }
};

/**
 * Switch a section look while strictly preserving existing user content,
 * items, copy, links, platform selections, and manual styling overrides.
 */
export function switchSectionLook(
  row: any,
  sectionType: FooterStackSectionType,
  newLookId: string
): any {
  const registry = FOOTER_STACK_SECTION_REGISTRY[sectionType];
  if (!registry) return row;

  const targetLook = registry.looks.find((l) => l.id === newLookId) || registry.looks[0];
  if (!targetLook) return row;

  const updatedLayout = {
    ...targetLook.defaults.layout,
    ...row.layout,
    variantId: newLookId
  };

  const updatedStyling = {
    ...targetLook.defaults.design,
    ...row.styling
  };

  const updatedBehavior = {
    ...targetLook.defaults.behavior,
    ...row.behavior,
  };

  return {
    ...row,
    layout: updatedLayout,
    styling: updatedStyling,
    behavior: updatedBehavior
  };
}

/**
 * Retrieve supported tabs for a section and look.
 * Behavior tab is only included when the look has interactive/animated capabilities.
 */
export function getSectionSupportedTabs(
  sectionType: FooterStackSectionType,
  lookId?: string
): Array<'look' | 'content' | 'layout' | 'behavior' | 'design' | 'responsive' | 'visibility' | 'advanced'> {
  const registry = FOOTER_STACK_SECTION_REGISTRY[sectionType];
  if (!registry) {
    return ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'];
  }

  const look = registry.looks.find((l) => l.id === lookId) || registry.looks[0];
  return look?.supportedTabs || ['look', 'content', 'layout', 'design', 'responsive', 'visibility', 'advanced'];
}
