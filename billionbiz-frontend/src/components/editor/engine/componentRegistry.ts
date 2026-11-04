// ============================================================
// MASTER EDITOR ENGINE — COMPONENT CAPABILITY REGISTRY
// Dynamic capability model driving inspector tabs across Page,
// Header, and Footer editors (spec §14, §15, §72, §76).
// ============================================================

import type {
  ComponentCapability,
  ComponentRegistration,
  EditorType,
} from './types';

export const COMPONENT_REGISTRY: Record<string, ComponentRegistration> = {
  // ────────────────────────────────────────────────────────────
  // 16 COMPOSABLE HEADER ITEMS (World-Class Item Architecture)
  // ────────────────────────────────────────────────────────────

  // 1. Announcement Bar
  'header:announcement-bar': {
    id: 'header:announcement-bar',
    type: 'announcement-bar',
    name: 'Announcement Bar',
    category: 'Information',
    capabilities: ['style', 'content', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Top notification banner with multi-slide rotator, countdowns, and dismiss triggers',
    defaults: {
      layout: 'full',
      alignment: 'center',
      height: 38,
      density: 'comfortable',
      preset: 'standard',
      slides: [
        { text: '✨ Free worldwide shipping on orders over $99. Use code FREESHIP', link: '/offers', cta: 'Shop Now', icon: 'sparkles' },
        { text: '🔥 Flash Sale: 30% off all summer collection items today only', link: '/sale', cta: 'Claim Offer', icon: 'flame' },
      ],
      currentSlide: 0,
      mode: 'slider', // 'static' | 'slider' | 'marquee'
      autoRotate: true,
      rotationSpeed: 5,
      pauseOnHover: true,
      closeable: true,
      dismissPersistence: 'session',
      showCountdown: false,
      countdownTarget: '2026-12-31T23:59:59',
      bgColor: '#1e293b',
      textColor: '#ffffff',
      fontSize: 13,
      fontWeight: 500,
      ctaStyle: 'underline',
      iconStyle: 'subtle',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      shadow: 'none',
      showOnDesktop: true,
      showOnTablet: true,
      showOnMobile: true,
      mobileTextSize: 12,
    },
  },

  // 2. Utility Bar
  'header:utility-bar': {
    id: 'header:utility-bar',
    type: 'utility-bar',
    name: 'Utility Bar',
    category: 'Information',
    capabilities: ['style', 'content', 'layout', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Secondary bar for contact details, order tracking, currency, and customer greeting',
    defaults: {
      preset: 'split',
      density: 'compact',
      height: 34,
      alignment: 'space-between',
      welcomeMessage: 'Welcome to BillionBiz Store',
      phone: '+1 (800) 555-0199',
      email: 'support@billionbiz.io',
      storeLocatorUrl: '/stores',
      trackOrderUrl: '/track-order',
      contactUrl: '/contact',
      showSocialLinks: true,
      showLogin: true,
      showLanguage: true,
      showCurrency: true,
      showRegion: false,
      groupSpacing: 16,
      itemSpacing: 12,
      interactionMode: 'hover',
      bgColor: '#f8fafc',
      textColor: '#64748b',
      fontSize: 12,
      fontWeight: 500,
      divider: true,
      borderColor: '#e2e8f0',
      showOnDesktop: true,
      showOnTablet: true,
      showOnMobile: false,
      mobileCollapse: true,
    },
  },

  // 3. Primary Navigation
  'header:primary-nav': {
    id: 'header:primary-nav',
    type: 'primary-nav',
    name: 'Primary Navigation',
    category: 'Navigation',
    capabilities: ['style', 'menu', 'layout', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Master navigation wrapper combining logo, catalog menu, and shopper actions',
    defaults: {
      navStyle: 'pills',
      preset: 'split',
      density: 'comfortable',
      height: 72,
      alignment: 'space-between',
      linkStyle: 'underline-on-hover',
      activeLinkStyle: 'bold-accent',
      menuSource: 'main-menu',
      logoPosition: 'left',
      navPosition: 'center',
      actionsPosition: 'right',
      gap: 24,
      container: 'constrained',
      interaction: 'hover',
      dropdownDelay: 150,
      megaMenuEnabled: true,
      bgColor: '#ffffff',
      textColor: '#0f172a',
      activeColor: '#2563eb',
      hoverColor: '#3b82f6',
      fontSize: 14,
      fontWeight: 500,
      mobileMenu: 'drawer',
      mobileAlignment: 'left',
    },
  },

  // 4. Logo
  'header:logo': {
    id: 'header:logo',
    type: 'logo',
    name: 'Brand Logo',
    category: 'Brand',
    capabilities: ['style', 'content', 'link', 'responsive', 'advanced'],
    description: 'Scalable brand mark supporting text, SVG, light/dark modes, and mobile variants',
    defaults: {
      logoType: 'text', // 'text' | 'image' | 'both'
      text: 'BillionBiz',
      fontFamily: 'Inter',
      fontSize: 22,
      fontWeight: 800,
      textColor: '#0f172a',
      mainLogoUrl: '',
      lightLogoUrl: '',
      darkLogoUrl: '',
      mobileLogoUrl: '',
      retinaLogoUrl: '',
      altText: 'BillionBiz Store Logo',
      width: 140,
      maxWidth: 220,
      height: 40,
      alignment: 'left',
      fit: 'contain',
      linkTarget: 'home', // 'home' | 'custom'
      customUrl: '/',
      openInNewTab: false,
      desktopWidth: 140,
      tabletWidth: 120,
      mobileWidth: 100,
      showTagline: false,
      taglineText: 'World-Class Commerce',
    },
  },

  // 5. Navigation Menu
  'header:navigation-menu': {
    id: 'header:navigation-menu',
    type: 'navigation-menu',
    name: 'Navigation Menu',
    category: 'Navigation',
    capabilities: ['style', 'items', 'dropdown', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Hierarchical links with hover delay, animated flyouts, and badges',
    defaults: {
      linkStyle: 'default',
      fontSize: 14,
      fontWeight: 500,
      spacing: 24,
      activeState: 'indicator',
      badgeStyle: 'subtle',
      items: [
        { id: 'item-home', label: 'Home', link: '/', badge: '' },
        {
          id: 'item-shop',
          label: 'Shop',
          link: '/shop',
          badge: 'HOT',
          hasDropdown: true,
          dropdownItems: [
            { label: 'Men Collections', link: '/shop/men' },
            { label: 'Women Collections', link: '/shop/women' },
            { label: 'Accessories', link: '/shop/accessories' },
            { label: 'New Arrivals', link: '/shop/new' },
          ],
        },
        { id: 'item-collections', label: 'Collections', link: '/collections', hasMegaMenu: true },
        { id: 'item-about', label: 'About', link: '/about' },
        { id: 'item-contact', label: 'Contact', link: '/contact' },
      ],
      dropdownWidth: 220,
      dropdownColumns: 1,
      dropdownAlignment: 'center',
      dropdownAnimation: 'fade-slide',
      dropdownShadow: 'medium',
      dropdownRadius: 8,
      interaction: 'hover',
      openDirection: 'down',
      closeOnOutsideClick: true,
      textColor: '#1e293b',
      hoverColor: '#2563eb',
      dropdownBg: '#ffffff',
      mobileAccordion: true,
    },
  },

  // 6. Mega Menu
  'header:mega-menu': {
    id: 'header:mega-menu',
    type: 'mega-menu',
    name: 'Mega Menu Block',
    category: 'Navigation',
    capabilities: ['style', 'columns', 'content', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Rich full-width or boxed multi-column catalog with product cards and promo banners',
    defaults: {
      preset: 'columns-with-promo',
      width: 'full-container', // 'full-container' | 'boxed' | '100vw'
      height: 'auto',
      columnCount: 4,
      columnSpacing: 24,
      columns: [
        {
          id: 'col-1',
          heading: 'Top Categories',
          links: [
            { label: 'Outerwear & Jackets', link: '/shop/outerwear' },
            { label: 'Footwear & Boots', link: '/shop/footwear' },
            { label: 'Bags & Luggage', link: '/shop/bags' },
            { label: 'Watches & Jewelry', link: '/shop/watches' },
          ],
        },
        {
          id: 'col-2',
          heading: 'Featured Collections',
          links: [
            { label: 'Autumn / Winter 2026', link: '/shop/winter' },
            { label: 'Minimalist Essentials', link: '/shop/essentials' },
            { label: 'Athleisure Performance', link: '/shop/athleisure' },
            { label: 'Limited Editions', link: '/shop/limited' },
          ],
        },
        {
          id: 'col-3',
          heading: 'Shop By Brand',
          links: [
            { label: 'Apex Studio', link: '/brands/apex' },
            { label: 'Venture Goods', link: '/brands/venture' },
            { label: 'Lumina Tech', link: '/brands/lumina' },
            { label: 'Nordic Craft', link: '/brands/nordic' },
          ],
        },
        {
          id: 'col-4',
          heading: 'Seasonal Special',
          isPromo: true,
          promoTitle: 'Season Finale',
          promoDesc: 'Get an extra 20% off all outerwear collections with code FINAL20',
          promoCta: 'Explore Collection',
          promoLink: '/sale/season-finale',
          promoBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        },
      ],
      interaction: 'hover',
      openAnimation: 'fade-down',
      bgColor: '#ffffff',
      textColor: '#0f172a',
      borderRadius: 12,
      shadow: 'strong',
      paddingY: 32,
      paddingX: 32,
      showOnMobile: false,
    },
  },

  // 7. Secondary Navigation / Category Bar
  'header:secondary-nav': {
    id: 'header:secondary-nav',
    type: 'secondary-nav',
    name: 'Category Bar',
    category: 'Navigation',
    capabilities: ['style', 'content', 'layout', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Horizontal scrollable pills for categories, trending collections, and sales',
    defaults: {
      preset: 'pills-minimal',
      height: 44,
      density: 'comfortable',
      alignment: 'center',
      layout: 'scrollable', // 'horizontal' | 'centered' | 'scrollable' | 'wrapped'
      stickyParticipation: true,
      categories: [
        { label: '⚡ Flash Deals', link: '/sale', highlight: true, icon: 'flame' },
        { label: '✨ New In', link: '/new', icon: 'sparkles' },
        { label: 'Best Sellers', link: '/bestsellers' },
        { label: 'Electronics', link: '/electronics' },
        { label: 'Fashion & Apparel', link: '/fashion' },
        { label: 'Home & Living', link: '/home' },
        { label: 'Beauty & Wellness', link: '/beauty' },
        { label: 'Gift Cards', link: '/gift-cards' },
      ],
      fontSize: 13,
      fontWeight: 500,
      itemGap: 20,
      bgColor: '#f8fafc',
      textColor: '#334155',
      activeColor: '#2563eb',
      borderBottom: true,
      borderColor: '#e2e8f0',
      mobileScrollable: true,
    },
  },

  // 8. Action Group
  'header:action-group': {
    id: 'header:action-group',
    type: 'action-group',
    name: 'Shopper Actions',
    category: 'Commerce',
    capabilities: ['style', 'items', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Compact icon bar for Search, Account, Wishlist, Compare, and Cart triggers',
    defaults: {
      preset: 'icons-with-badges',
      density: 'comfortable',
      iconSize: 20,
      strokeWidth: 1.75,
      itemSpacing: 16,
      showLabels: false,
      showSearch: true,
      showAccount: true,
      showWishlist: true,
      showCompare: false,
      showCart: true,
      cartCount: 3,
      wishlistCount: 2,
      compareCount: 0,
      openBehavior: 'drawer', // 'drawer' | 'dropdown' | 'overlay' | 'modal'
      iconColor: '#334155',
      iconHoverColor: '#2563eb',
      badgeBg: '#2563eb',
      badgeTextColor: '#ffffff',
      compactMobile: true,
    },
  },

  // 9. Search
  'header:search': {
    id: 'header:search',
    type: 'search',
    name: 'Search Engine',
    category: 'Commerce',
    capabilities: ['style', 'content', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Live predictive search field with instant categories, trending tags, and results',
    defaults: {
      mode: 'inline', // 'icon' | 'inline' | 'expanded' | 'overlay' | 'full-screen'
      preset: 'rounded-pill',
      placeholder: 'Search products, collections, brands...',
      width: 280,
      showIcon: true,
      showCta: false,
      instantSearch: true,
      predictive: true,
      hotkey: 'Ctrl+K',
      suggestedCategories: ['Jackets', 'Sneakers', 'Hoodies', 'Watches'],
      recentSearches: ['Wireless headphones', 'Linen shirt', 'Backpack'],
      trendingSearches: ['Waterproof Parka', 'Leather Chelsea Boots', 'Canvas Tote'],
      bgColor: '#f1f5f9',
      borderColor: '#e2e8f0',
      borderRadius: 9999,
      fontSize: 13,
      mobileMode: 'full-screen',
    },
  },

  // 10. CTA
  'header:cta': {
    id: 'header:cta',
    type: 'cta',
    name: 'Header CTA',
    category: 'Conversion',
    capabilities: ['content', 'style', 'behavior', 'design', 'responsive', 'advanced', 'link'],
    description: 'Independent primary action button for signup, booking, shopping, or contact flows',
    defaults: {
      text: 'Shop Now',
      url: '/shop',
      variant: 'primary',
      size: 'sm',
      openInNewTab: false,
    },
  },

  // 11. Account
  'header:account': {
    id: 'header:account',
    type: 'account',
    name: 'Customer Account',
    category: 'Commerce',
    capabilities: ['style', 'content', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'User avatar, sign-in button, and profile dropdown with orders and wishlist',
    defaults: {
      preset: 'icon-only', // 'icon' | 'label' | 'badge' | 'avatar'
      label: 'Sign In',
      isLoggedIn: false,
      userName: 'Alex Chen',
      behavior: 'dropdown', // 'link' | 'dropdown' | 'drawer' | 'modal'
      accountLinks: [
        { label: 'My Orders', link: '/account/orders' },
        { label: 'Saved Wishlist', link: '/account/wishlist' },
        { label: 'Shipping Addresses', link: '/account/addresses' },
        { label: 'Settings', link: '/account/settings' },
        { label: 'Sign Out', link: '/auth/logout' },
      ],
      iconSize: 20,
      textColor: '#334155',
      dropdownBg: '#ffffff',
      showOnMobile: true,
    },
  },

  // 11. Cart
  'header:cart': {
    id: 'header:cart',
    type: 'cart',
    name: 'Shopping Cart',
    category: 'Commerce',
    capabilities: ['style', 'content', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Cart trigger with real-time item counter, total value pill, and mini-cart drawer',
    defaults: {
      preset: 'icon-badge', // 'icon' | 'badge' | 'label' | 'pill-total'
      cartCount: 3,
      cartValue: '$148.50',
      showValue: false,
      label: 'Cart',
      behavior: 'drawer', // 'drawer' | 'mini-cart' | 'overlay' | 'link'
      emptyCartMessage: 'Your cart is currently empty.',
      iconSize: 20,
      iconColor: '#334155',
      badgeBg: '#2563eb',
      badgeColor: '#ffffff',
      showOnMobile: true,
    },
  },

  // 12. Wishlist
  'header:wishlist': {
    id: 'header:wishlist',
    type: 'wishlist',
    name: 'Wishlist Counter',
    category: 'Commerce',
    capabilities: ['style', 'content', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Heart icon badge keeping track of customer saved items and favorites',
    defaults: {
      preset: 'icon-badge',
      count: 2,
      label: 'Wishlist',
      behavior: 'link', // 'link' | 'drawer'
      requiresLogin: false,
      iconSize: 20,
      iconColor: '#334155',
      badgeBg: '#ec4899',
      badgeColor: '#ffffff',
      showOnMobile: true,
    },
  },

  // 13. Language / Currency / Region
  'header:localization': {
    id: 'header:localization',
    type: 'localization',
    name: 'Currency & Language',
    category: 'Information',
    capabilities: ['style', 'content', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Storefront internationalization with multi-currency, flags, and locale picker',
    defaults: {
      style: 'dropdown', // 'dropdown' | 'inline' | 'modal' | 'drawer' | 'compact'
      availableLanguages: [
        { code: 'en', label: 'English (US)', flag: '🇺🇸' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'ja', label: '日本語', flag: '🇯🇵' },
      ],
      selectedLanguage: 'en',
      availableCurrencies: [
        { code: 'USD', symbol: '$', label: 'USD ($)' },
        { code: 'EUR', symbol: '€', label: 'EUR (€)' },
        { code: 'GBP', symbol: '£', label: 'GBP (£)' },
        { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
      ],
      selectedCurrency: 'USD',
      autoDetect: true,
      fontSize: 12,
      textColor: '#64748b',
      showFlags: true,
      showOnMobile: false,
    },
  },

  // 14. Promo / Campaign Bar
  'header:promo-bar': {
    id: 'header:promo-bar',
    type: 'promo-bar',
    name: 'Campaign Promo Bar',
    category: 'Information',
    capabilities: ['style', 'content', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Marketing banner for coupons, timed discounts, and seasonal campaigns',
    defaults: {
      preset: 'centered-countdown',
      heading: 'END OF SEASON CLEARANCE',
      description: 'Up to 50% off select styles. Use code at checkout:',
      coupon: 'SAVE50',
      cta: 'Shop the Sale',
      ctaLink: '/clearance',
      closeable: true,
      showCountdown: true,
      countdownTarget: '2026-10-31T23:59:59',
      bgColor: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
      textColor: '#ffffff',
      fontSize: 13,
      fontWeight: 600,
      showOnMobile: true,
    },
  },

  // 15. Custom Row
  'header:custom-row': {
    id: 'header:custom-row',
    type: 'custom-row',
    name: 'Custom Row Block',
    category: 'Structure',
    capabilities: ['style', 'content', 'layout', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Freeform header row for custom HTML, app embeds, or specialized component layouts',
    defaults: {
      preset: 'flex-row',
      height: 48,
      alignment: 'space-between',
      density: 'comfortable',
      container: 'constrained',
      gap: 16,
      customHtml: '<div class="custom-header-banner">✦ Exclusive Member Perks Available</div>',
      bgColor: '#ffffff',
      borderBottom: true,
      borderColor: '#e2e8f0',
      showOnDesktop: true,
      showOnMobile: true,
    },
  },

  // 16. Header Row
  'header:header-row': {
    id: 'header:header-row',
    type: 'header-row',
    name: 'Header Row Container',
    category: 'Structure',
    capabilities: ['style', 'content', 'layout', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Standard structural header band supporting composable child elements and layout presets',
    defaults: {
      preset: 'standard',
      height: 64,
      density: 'comfortable',
      container: 'constrained',
      alignment: 'space-between',
      gap: 20,
      bgColor: '#ffffff',
      textColor: '#0f172a',
      borderBottom: true,
      borderColor: '#e2e8f0',
      stickyParticipation: true,
      showOnDesktop: true,
      showOnTablet: true,
      showOnMobile: true,
    },
  },

  // ─── Aliases for backwards compatibility ───
  'header:navigation': {
    id: 'header:navigation',
    type: 'navigation',
    name: 'Primary Navigation (Legacy)',
    category: 'Navigation',
    capabilities: ['style', 'menu', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Multi-level storefront menu with hover or click dropdowns and mega menus',
    defaults: {
      menuSource: 'main-menu',
      navStyle: 'pills',
      alignment: 'center',
      gap: 24,
      fontSize: 14,
      fontWeight: 500,
      textColor: '#334155',
      activeColor: '#6366f1',
      hoverBg: '#f1f5f9',
      radius: 6,
      interaction: 'hover',
      megaMenu: true,
      mobileMode: 'hamburger',
    },
  },
  'header:actions': {
    id: 'header:actions',
    type: 'actions',
    name: 'Commerce Actions',
    category: 'Commerce',
    capabilities: ['style', 'items', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Account, Wishlist, Cart badges with item count, CTA button, and quick view triggers',
    defaults: {
      showAccount: true,
      showWishlist: true,
      showCart: true,
      showSearch: true,
      showCta: false,
      ctaText: 'Shop Now',
      ctaLink: '/shop',
      ctaVariant: 'solid',
      showLabels: false,
      iconSize: 20,
      iconColor: '#334155',
      badgeBg: '#6366f1',
      badgeColor: '#ffffff',
      cartStyle: 'icon-badge',
      cartBehavior: 'drawer',
    },
  },
  'header:promo-text': {
    id: 'header:promo-text',
    type: 'promo-text',
    name: 'Announcement / Promo',
    category: 'Information',
    capabilities: ['style', 'content', 'behavior', 'design', 'link', 'responsive', 'advanced'],
    description: 'High-impact banner text for discounts, free shipping or urgent updates',
    defaults: {
      text: '🚀 Free shipping on all international orders over $99! Use code BB99',
      badgeText: 'LIMITED OFFER',
      fontSize: 12,
      fontWeight: 500,
      textColor: '#ffffff',
      linkUrl: '/offers',
      showCountdown: false,
      enableTicker: false,
    },
  },
  'header:utility-links': {
    id: 'header:utility-links',
    type: 'utility-links',
    name: 'Utility Links / Selectors',
    category: 'Information',
    capabilities: ['style', 'content', 'links', 'behavior', 'responsive', 'advanced'],
    description: 'Quick top utility links such as Support, Order Tracking, Currency, Language',
    defaults: {
      items: [
        { label: 'Order Tracking', href: '/orders' },
        { label: 'Support 24/7', href: '/support' },
        { label: 'USD ($)', href: '#currency' },
      ],
      fontSize: 12,
      gap: 16,
      textColor: '#64748b',
    },
  },
  'header:custom-html': {
    id: 'header:custom-html',
    type: 'custom-html',
    name: 'Custom Code / HTML (Legacy)',
    category: 'Advanced',
    capabilities: ['content', 'style', 'responsive', 'advanced'],
    description: 'Embed custom HTML, SVG badges, or third-party tracking widgets',
    defaults: {
      html: '<div class="custom-header-badge">✦ Verified Merchant</div>',
    },
  },

  // ────────────────────────────────────────────────────────────
  // FOOTER COMPONENTS (spec §12, §37–47)
  // ────────────────────────────────────────────────────────────

  // 1. Brand & Contact
  'footer:logo': {
    id: 'footer:logo',
    type: 'logo',
    name: 'Footer Logo',
    category: 'Brand',
    capabilities: ['style', 'content', 'link', 'responsive', 'advanced'],
    description: 'Primary or inverted footer brand logo',
    defaults: {
      sourceType: 'theme',
      text: 'BillionBiz',
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: 800,
      textColor: '#0f172a',
      width: 160,
      href: '/',
      altText: 'BillionBiz Footer Brand',
    },
  },

  'footer:brand-description': {
    id: 'footer:brand-description',
    type: 'brand-description',
    name: 'Brand Bio / Description',
    category: 'Brand',
    capabilities: ['style', 'content', 'design', 'responsive', 'advanced'],
    description: 'Short statement explaining the company mission, values, or elevator pitch',
    defaults: {
      text: 'The all-in-one commercial engine empowering fast-growing digital merchants and visionary retail brands worldwide.',
      fontSize: 14,
      lineHeight: 1.6,
      textColor: '#64748b',
      maxWidth: 320,
    },
  },

  'footer:contact': {
    id: 'footer:contact',
    type: 'contact',
    name: 'Contact Details',
    category: 'Brand',
    capabilities: ['style', 'content', 'design', 'responsive', 'advanced'],
    description: 'Email, telephone, response time and live support touchpoints',
    defaults: {
      email: 'support@billionbiz.io',
      phone: '+1 (800) 555-0199',
      hours: 'Mon - Fri, 9am - 6pm EST',
      showIcons: true,
      fontSize: 13,
      textColor: '#475569',
      linkColor: '#6366f1',
    },
  },

  'footer:address': {
    id: 'footer:address',
    type: 'address',
    name: 'Physical Address',
    category: 'Brand',
    capabilities: ['style', 'content', 'link', 'responsive', 'advanced'],
    description: 'Corporate headquarters or registered business address with map link',
    defaults: {
      address: '742 Evergreen Terrace, Suite 500, Innovation District, CA 94107',
      mapLink: 'https://maps.google.com',
      fontSize: 13,
      textColor: '#64748b',
    },
  },

  // 2. Navigation
  'footer:link-group': {
    id: 'footer:link-group',
    type: 'link-group',
    name: 'Link Column Group',
    category: 'Navigation',
    capabilities: ['style', 'menu', 'design', 'responsive', 'advanced'],
    description: 'Vertical column of related links with a customizable column header',
    defaults: {
      heading: 'Company',
      headingSize: 14,
      headingColor: '#0f172a',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers', badge: 'We are hiring!' },
        { label: 'Press Kit', href: '/press' },
        { label: 'Affiliates', href: '/affiliates' },
        { label: 'Partners', href: '/partners' },
      ],
      fontSize: 14,
      gap: 12,
      textColor: '#64748b',
      hoverColor: '#6366f1',
    },
  },

  'footer:navigation-menu': {
    id: 'footer:navigation-menu',
    type: 'navigation-menu',
    name: 'Navigation Menu',
    category: 'Navigation',
    capabilities: ['style', 'menu', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Full multi-column or horizontal navigation bar synced with store menus',
    defaults: {
      menuHandle: 'footer-menu',
      direction: 'vertical',
      gap: 16,
      fontSize: 14,
      textColor: '#475569',
    },
  },

  // 3. Commerce & Engagement
  'footer:newsletter-form': {
    id: 'footer:newsletter-form',
    type: 'newsletter-form',
    name: 'Newsletter Signup',
    category: 'Commerce',
    capabilities: ['style', 'content', 'form', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Customer email / SMS collection form with GDPR consent and welcome incentives',
    defaults: {
      title: 'Stay ahead of the market',
      subtitle: 'Subscribe to get exclusive product drops, member-only discounts, and market insights.',
      placeholder: 'Enter your business email...',
      buttonText: 'Subscribe',
      buttonVariant: 'primary',
      consentText: 'By subscribing you agree to our Privacy Policy and Terms of Service.',
      showConsent: true,
      successMessage: '🎉 Thank you! Check your inbox for your 15% welcome code.',
      inputBg: '#ffffff',
      inputBorder: '#cbd5e1',
      radius: 8,
    },
  },

  'footer:track-order': {
    id: 'footer:track-order',
    type: 'track-order',
    name: 'Track Order Quick Widget',
    category: 'Commerce',
    capabilities: ['style', 'content', 'form', 'responsive', 'advanced'],
    description: 'Instant package lookup input for customers to enter order tracking numbers',
    defaults: {
      title: 'Track Your Package',
      placeholder: 'Enter Order # or Tracking ID',
      buttonText: 'Track',
      actionUrl: '/track',
    },
  },

  // 4. Social & Community
  'footer:social-links': {
    id: 'footer:social-links',
    type: 'social-links',
    name: 'Social Media Icons',
    category: 'Social',
    capabilities: ['style', 'links', 'design', 'responsive', 'advanced'],
    description: 'Social icon buttons with customizable variants (filled, outline, colored, minimal)',
    defaults: {
      variant: 'minimal',
      size: 20,
      color: '#64748b',
      hoverColor: '#0f172a',
      gap: 16,
      platforms: [
        { platform: 'twitter', url: 'https://twitter.com', enabled: true },
        { platform: 'instagram', url: 'https://instagram.com', enabled: true },
        { platform: 'linkedin', url: 'https://linkedin.com', enabled: true },
        { platform: 'youtube', url: 'https://youtube.com', enabled: true },
        { platform: 'github', url: 'https://github.com', enabled: true },
      ],
    },
  },

  // 5. Trust & Credibility
  'footer:trust-badges': {
    id: 'footer:trust-badges',
    type: 'trust-badges',
    name: 'Trust Badges & Guarantees',
    category: 'Trust',
    capabilities: ['style', 'benefits', 'design', 'responsive', 'advanced'],
    description: 'Customer confidence icons: 30-day money-back guarantee, SSL encryption, 24/7 help',
    defaults: {
      layout: 'grid',
      items: [
        { icon: 'shield-check', title: 'Secure Checkout', description: '256-bit SSL encrypted transactions' },
        { icon: 'truck', title: 'Fast Global Delivery', description: 'Express insured air shipping' },
        { icon: 'refresh-cw', title: '30-Day Free Returns', description: 'Hassle-free replacement policy' },
        { icon: 'headphones', title: '24/7 Dedicated Support', description: 'Expert human reps ready to assist' },
      ],
      iconSize: 24,
      iconColor: '#6366f1',
      titleColor: '#0f172a',
      descColor: '#64748b',
    },
  },

  'footer:payment-methods': {
    id: 'footer:payment-methods',
    type: 'payment-methods',
    name: 'Payment Methods & Cards',
    category: 'Trust',
    capabilities: ['style', 'methods', 'design', 'responsive', 'advanced'],
    description: 'Official logos of accepted payment gateways, cards, wallets, and crypto',
    defaults: {
      variant: 'color',
      size: 'medium',
      methods: [
        { id: 'visa', name: 'Visa', enabled: true },
        { id: 'mastercard', name: 'Mastercard', enabled: true },
        { id: 'amex', name: 'American Express', enabled: true },
        { id: 'apple-pay', name: 'Apple Pay', enabled: true },
        { id: 'google-pay', name: 'Google Pay', enabled: true },
        { id: 'paypal', name: 'PayPal', enabled: true },
        { id: 'stripe', name: 'Stripe', enabled: true },
      ],
      grayscale: false,
      opacity: 0.85,
    },
  },

  // 6. Localization & Utility
  'footer:localization': {
    id: 'footer:localization',
    type: 'localization',
    name: 'Language & Currency Selector',
    category: 'Utility',
    capabilities: ['style', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Country flag dropdown, currency selector, and multi-lingual language picker',
    defaults: {
      showLanguage: true,
      showCurrency: true,
      currentLanguage: 'English (US)',
      currentCurrency: 'USD ($)',
      style: 'dropdown',
    },
  },

  'footer:back-to-top': {
    id: 'footer:back-to-top',
    type: 'back-to-top',
    name: 'Back to Top Button',
    category: 'Utility',
    capabilities: ['style', 'behavior', 'design', 'responsive', 'advanced'],
    description: 'Smooth scroll-to-top floating or inline button with customizable animation',
    defaults: {
      label: 'Back to top',
      style: 'pill',
      iconOnly: false,
      smoothScroll: true,
      bgColor: '#0f172a',
      textColor: '#ffffff',
    },
  },

  'footer:app-download': {
    id: 'footer:app-download',
    type: 'app-download',
    name: 'Mobile App Badges',
    category: 'Utility',
    capabilities: ['style', 'links', 'design', 'responsive', 'advanced'],
    description: 'Official Apple App Store and Google Play Store download buttons with optional QR',
    defaults: {
      title: 'Experience BillionBiz on Mobile',
      iosUrl: 'https://apple.com',
      androidUrl: 'https://google.com',
      showQrCode: true,
      qrSize: 64,
    },
  },

  // 7. Legal & Copyright
  'footer:copyright': {
    id: 'footer:copyright',
    type: 'copyright',
    name: 'Copyright Notice',
    category: 'Legal',
    capabilities: ['style', 'content', 'responsive', 'advanced'],
    description: 'Dynamic automated year and corporate ownership declaration',
    defaults: {
      text: '© {year} BillionBiz Technologies Inc. All rights reserved.',
      fontSize: 12,
      textColor: '#94a3b8',
    },
  },

  'footer:policy-links': {
    id: 'footer:policy-links',
    type: 'policy-links',
    name: 'Policy & Legal Links',
    category: 'Legal',
    capabilities: ['style', 'links', 'responsive', 'advanced'],
    description: 'Inline legal compliance links: Privacy, Terms, Cookie Preferences, Accessibility',
    defaults: {
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Settings', href: '#cookies' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Security', href: '/security' },
      ],
      gap: 16,
      fontSize: 12,
      textColor: '#94a3b8',
      hoverColor: '#0f172a',
    },
  },

  // 8. Custom & Embed
  'footer:custom-html': {
    id: 'footer:custom-html',
    type: 'custom-html',
    name: 'Custom Code / HTML',
    category: 'Advanced',
    capabilities: ['content', 'style', 'responsive', 'advanced'],
    description: 'Inject arbitrary HTML markup, SVG icons, or tracking scripts',
    defaults: {
      html: '<div class="footer-certified-badge">🔒 SOC2 Type II Certified</div>',
    },
  },
};

/**
 * Helper to get components filtered by editor type
 */
export function getComponentsForEditor(editorType: EditorType): ComponentRegistration[] {
  const prefix = editorType === 'header' ? 'header:' : editorType === 'footer' ? 'footer:' : 'page:';
  return Object.values(COMPONENT_REGISTRY).filter((c) => c.id.startsWith(prefix));
}

/**
 * Helper to get a component registration
 */
export function getComponentRegistration(type: string): ComponentRegistration | undefined {
  return COMPONENT_REGISTRY[type];
}

/**
 * Capability tab order defined by spec §15
 */
export const CAPABILITY_ORDER: ComponentCapability[] = [
  'style',
  'content',
  'items',
  'columns',
  'dropdown',
  'structure',
  'layout',
  'menu',
  'form',
  'behavior',
  'design',
  'link',
  'links',
  'accounts',
  'methods',
  'benefits',
  'responsive',
  'advanced',
];

/**
 * Pretty label for capability tabs
 */
export const CAPABILITY_LABELS: Record<ComponentCapability, string> = {
  style: 'Style',
  content: 'Content',
  items: 'Items',
  columns: 'Columns',
  dropdown: 'Dropdown',
  structure: 'Structure',
  layout: 'Layout',
  menu: 'Menu',
  form: 'Form',
  behavior: 'Behavior',
  design: 'Design',
  responsive: 'Responsive',
  advanced: 'Advanced',
  link: 'Link',
  accounts: 'Accounts',
  methods: 'Payment Methods',
  benefits: 'Benefits & Badges',
  links: 'Links',
};
