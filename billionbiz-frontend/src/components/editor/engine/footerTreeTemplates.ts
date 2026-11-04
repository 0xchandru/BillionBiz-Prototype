// ============================================================
// FOOTER TREE TEMPLATES
// Data-driven template definitions for the footer editor.
// Each template is a complete FooterTreeNode[] tree.
// Link columns are isolated into individual vertical groups
// for perfectly even gap distribution and responsive alignment.
// All groups are named "Group" consistently.
// ============================================================

import type { FooterTreeTemplate, FooterTreeNode } from './footerTreeTypes';
import { generateNodeId } from './footerTreeTypes';
import { createDefaultFooterTree } from './footerTreeEngine';

export const FOOTER_TREE_TEMPLATES: FooterTreeTemplate[] = [
  // ─── 1. Classic Multi-Column ───────────────────────────────
  {
    id: 'classic-multi-column',
    name: 'Classic Multi-Column',
    description: 'Traditional footer with brand, link columns, newsletter, and bottom bar.',
    category: 'Standard',
    tree: createDefaultFooterTree(),
  },

  // ─── 2. Brand & Newsletter ─────────────────────────────────
  {
    id: 'brand-newsletter',
    name: 'Brand & Newsletter',
    description: 'Prominent brand story with large newsletter section.',
    category: 'Brand-Focused',
    tree: [
      {
        id: 'fg-bn-wrapper',
        nodeType: 'group',
        name: 'Group',
        visible: true,
        children: [
          {
            id: 'fg-bn-top',
            nodeType: 'group',
            name: 'Group',
            visible: true,
            children: [
              {
                id: 'fg-bn-left',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  {
                    id: 'fc-bn-logo',
                    nodeType: 'logo',
                    name: 'Logo',
                    visible: true,
                    props: { sourceType: 'theme', text: 'BillionBiz', fontSize: 28, fontWeight: 800, width: 160, link: '/' },
                  },
                  {
                    id: 'fc-bn-desc',
                    nodeType: 'text',
                    name: 'Brand Story',
                    visible: true,
                    props: { text: 'Empowering digital merchants worldwide with world-class commerce infrastructure and intelligent retail tools.', fontSize: 15, lineHeight: 1.7 },
                  },
                ],
                layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 16, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
              {
                id: 'fc-bn-newsletter',
                nodeType: 'newsletter',
                name: 'Newsletter Signup',
                visible: true,
                props: { heading: 'Join our community', description: 'Get 15% off your first order + early access to sales.', placeholder: 'Email address', buttonText: 'Subscribe', layout: 'horizontal', showConsent: true, consentText: 'By subscribing you agree to our Privacy Policy.' },
              },
            ],
            layout: { direction: 'horizontal', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'space-between', crossAxisAlignment: 'center', gap: 48, padding: { top: 0, right: 0, bottom: 0, left: 0 }, wrap: true },
            responsive: { mobile: { direction: 'vertical', gap: 32 } },
          },
          {
            id: 'fg-bn-links',
            nodeType: 'group',
            name: 'Group',
            visible: true,
            children: [
              {
                id: 'fg-bn-col-1',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  {
                    id: 'fc-bn-links-1',
                    nodeType: 'link-list',
                    name: 'Shop',
                    visible: true,
                    props: { heading: 'Shop', links: [{ label: 'New Arrivals', href: '/new' }, { label: 'Best Sellers', href: '/best-sellers' }, { label: 'Sale', href: '/sale' }, { label: 'Gift Cards', href: '/gift-cards' }], fontSize: 14, gap: 10 },
                  },
                ],
                layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
              {
                id: 'fg-bn-col-2',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  {
                    id: 'fc-bn-links-2',
                    nodeType: 'link-list',
                    name: 'Company',
                    visible: true,
                    props: { heading: 'Company', links: [{ label: 'About Us', href: '/about' }, { label: 'Careers', href: '/careers' }, { label: 'Press', href: '/press' }], fontSize: 14, gap: 10 },
                  },
                ],
                layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
              {
                id: 'fg-bn-col-3',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  {
                    id: 'fc-bn-links-3',
                    nodeType: 'link-list',
                    name: 'Help',
                    visible: true,
                    props: { heading: 'Help', links: [{ label: 'FAQ', href: '/faq' }, { label: 'Contact', href: '/contact' }, { label: 'Shipping', href: '/shipping' }, { label: 'Returns', href: '/returns' }], fontSize: 14, gap: 10 },
                  },
                ],
                layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
              {
                id: 'fg-bn-col-4',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  {
                    id: 'fc-bn-social',
                    nodeType: 'social-links',
                    name: 'Social',
                    visible: true,
                    props: { heading: 'Follow Us', platforms: [{ platform: 'twitter', url: '#', enabled: true }, { platform: 'instagram', url: '#', enabled: true }, { platform: 'facebook', url: '#', enabled: true }], iconSize: 20, gap: 12 },
                  },
                ],
                layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
            ],
            layout: { direction: 'horizontal', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'space-between', crossAxisAlignment: 'start', gap: 32, padding: { top: 0, right: 0, bottom: 0, left: 0 }, wrap: true },
            styling: { bgType: 'inherit' },
            responsive: { mobile: { direction: 'vertical', gap: 24 } },
          },
          {
            id: 'fg-bn-bottom',
            nodeType: 'group',
            name: 'Group',
            visible: true,
            children: [
              { id: 'fc-bn-copyright', nodeType: 'copyright', name: 'Copyright', visible: true, props: { text: '© {year} BillionBiz. All rights reserved.', fontSize: 12 } },
              { id: 'fc-bn-payment', nodeType: 'payment-icons', name: 'Payment Methods', visible: true, props: { methods: [{ id: 'visa', name: 'Visa', enabled: true }, { id: 'mastercard', name: 'Mastercard', enabled: true }, { id: 'paypal', name: 'PayPal', enabled: true }, { id: 'apple-pay', name: 'Apple Pay', enabled: true }], size: 'small', gap: 8 } },
            ],
            layout: { direction: 'horizontal', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'space-between', crossAxisAlignment: 'center', gap: 16, padding: { top: 20, right: 0, bottom: 0, left: 0 } },
            styling: { bgType: 'inherit' },
            responsive: { mobile: { direction: 'vertical', gap: 12, mainAxisDistribution: 'center', crossAxisAlignment: 'center' } },
          },
        ],
        layout: {
          direction: 'vertical',
          width: { mode: 'fill' },
          height: { mode: 'fit' },
          mainAxisDistribution: 'start',
          crossAxisAlignment: 'stretch',
          gap: 36,
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
      },
    ],
  },

  // ─── 3. Minimal ────────────────────────────────────────────
  {
    id: 'minimal-footer',
    name: 'Minimal Footer',
    description: 'Clean, minimalist footer with copyright and social links only.',
    category: 'Minimal',
    tree: [
      {
        id: 'fg-min-main',
        nodeType: 'group',
        name: 'Group',
        visible: true,
        children: [
          { id: 'fc-min-logo', nodeType: 'logo', name: 'Logo', visible: true, props: { sourceType: 'theme', text: 'BillionBiz', fontSize: 20, fontWeight: 700, width: 120, link: '/' } },
          { id: 'fc-min-social', nodeType: 'social-links', name: 'Social Links', visible: true, props: { platforms: [{ platform: 'twitter', url: '#', enabled: true }, { platform: 'instagram', url: '#', enabled: true }, { platform: 'linkedin', url: '#', enabled: true }], iconSize: 18, gap: 16, alignment: 'center' } },
          { id: 'fc-min-copyright', nodeType: 'copyright', name: 'Copyright', visible: true, props: { text: '© {year} BillionBiz. All rights reserved.', fontSize: 12, alignment: 'center' } },
        ],
        layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'center', crossAxisAlignment: 'center', gap: 20, padding: { top: 40, right: 32, bottom: 40, left: 32 } },
      },
    ],
  },

  // ─── 4. Navigation-Focused ─────────────────────────────────
  {
    id: 'navigation-focused',
    name: 'Navigation-Focused',
    description: 'Footer emphasizing extensive link navigation columns.',
    category: 'Standard',
    tree: [
      {
        id: 'fg-nav-wrapper',
        nodeType: 'group',
        name: 'Group',
        visible: true,
        children: [
          {
            id: 'fg-nav-main',
            nodeType: 'group',
            name: 'Group',
            visible: true,
            children: [
              {
                id: 'fg-nav-col-1',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  { id: 'fc-nav-l1', nodeType: 'link-list', name: 'Products', visible: true, props: { heading: 'Products', links: [{ label: 'Features', href: '/features' }, { label: 'Pricing', href: '/pricing' }, { label: 'Enterprise', href: '/enterprise' }, { label: 'Integrations', href: '/integrations' }], fontSize: 14, gap: 10 } },
                ],
                layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
              {
                id: 'fg-nav-col-2',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  { id: 'fc-nav-l2', nodeType: 'link-list', name: 'Resources', visible: true, props: { heading: 'Resources', links: [{ label: 'Documentation', href: '/docs' }, { label: 'API Reference', href: '/api' }, { label: 'Guides', href: '/guides' }, { label: 'Blog', href: '/blog' }], fontSize: 14, gap: 10 } },
                ],
                layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
              {
                id: 'fg-nav-col-3',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  { id: 'fc-nav-l3', nodeType: 'link-list', name: 'Company', visible: true, props: { heading: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Careers', href: '/careers' }, { label: 'Press', href: '/press' }, { label: 'Partners', href: '/partners' }], fontSize: 14, gap: 10 } },
                ],
                layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
              {
                id: 'fg-nav-col-4',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  { id: 'fc-nav-l4', nodeType: 'link-list', name: 'Legal', visible: true, props: { heading: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }, { label: 'Cookie Policy', href: '/cookies' }, { label: 'Accessibility', href: '/accessibility' }], fontSize: 14, gap: 10 } },
                ],
                layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
            ],
            layout: { direction: 'horizontal', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'space-between', crossAxisAlignment: 'start', gap: 40, padding: { top: 0, right: 0, bottom: 0, left: 0 }, wrap: true },
            responsive: { mobile: { direction: 'vertical', gap: 28 } },
          },
          {
            id: 'fg-nav-bottom',
            nodeType: 'group',
            name: 'Group',
            visible: true,
            children: [
              { id: 'fc-nav-copyright', nodeType: 'copyright', name: 'Copyright', visible: true, props: { text: '© {year} BillionBiz. All rights reserved.', fontSize: 12 } },
              { id: 'fc-nav-social', nodeType: 'social-links', name: 'Social Links', visible: true, props: { platforms: [{ platform: 'twitter', url: '#', enabled: true }, { platform: 'instagram', url: '#', enabled: true }, { platform: 'linkedin', url: '#', enabled: true }, { platform: 'youtube', url: '#', enabled: true }], iconSize: 18, gap: 14, alignment: 'right' } },
            ],
            layout: { direction: 'horizontal', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'space-between', crossAxisAlignment: 'center', gap: 16, padding: { top: 20, right: 0, bottom: 0, left: 0 } },
            styling: { bgType: 'inherit' },
            responsive: { mobile: { direction: 'vertical', gap: 12, mainAxisDistribution: 'center', crossAxisAlignment: 'center' } },
          },
        ],
        layout: {
          direction: 'vertical',
          width: { mode: 'fill' },
          height: { mode: 'fit' },
          mainAxisDistribution: 'start',
          crossAxisAlignment: 'stretch',
          gap: 36,
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
      },
    ],
  },

  // ─── 5. Newsletter-Focused ─────────────────────────────────
  {
    id: 'newsletter-focused',
    name: 'Newsletter-Focused',
    description: 'Large newsletter section dominating the footer layout.',
    category: 'Brand-Focused',
    tree: [
      {
        id: 'fg-nl-wrapper',
        nodeType: 'group',
        name: 'Group',
        visible: true,
        children: [
          {
            id: 'fg-nl-hero',
            nodeType: 'group',
            name: 'Group',
            visible: true,
            children: [
              { id: 'fc-nl-heading', nodeType: 'heading', name: 'CTA Heading', visible: true, props: { text: 'Never miss a drop', level: 'h2', fontSize: 28, fontWeight: 800, alignment: 'center' } },
              { id: 'fc-nl-desc', nodeType: 'text', name: 'Subtitle', visible: true, props: { text: 'Join 50,000+ subscribers. Get early access, exclusive deals, and insider tips.', fontSize: 16, alignment: 'center' } },
              { id: 'fc-nl-form', nodeType: 'newsletter', name: 'Newsletter Signup', visible: true, props: { heading: '', description: '', placeholder: 'Your email address', buttonText: 'Subscribe Now', layout: 'horizontal', showConsent: true, consentText: 'We respect your privacy. Unsubscribe at any time.' } },
            ],
            layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'center', crossAxisAlignment: 'center', gap: 16, padding: { top: 16, right: 0, bottom: 16, left: 0 } },
          },
          {
            id: 'fg-nl-bottom',
            nodeType: 'group',
            name: 'Group',
            visible: true,
            children: [
              { id: 'fc-nl-logo', nodeType: 'logo', name: 'Logo', visible: true, props: { sourceType: 'theme', text: 'BillionBiz', fontSize: 18, fontWeight: 700, width: 100, link: '/' } },
              {
                id: 'fg-nl-links-col',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  { id: 'fc-nl-links', nodeType: 'link-list', name: 'Quick Links', visible: true, props: { heading: '', links: [{ label: 'About', href: '/about' }, { label: 'FAQ', href: '/faq' }, { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }], fontSize: 13, gap: 8 } },
                ],
                layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'center', crossAxisAlignment: 'center', gap: 8, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
              { id: 'fc-nl-social', nodeType: 'social-links', name: 'Social Links', visible: true, props: { platforms: [{ platform: 'twitter', url: '#', enabled: true }, { platform: 'instagram', url: '#', enabled: true }], iconSize: 18, gap: 12, alignment: 'right' } },
            ],
            layout: { direction: 'horizontal', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'space-between', crossAxisAlignment: 'center', gap: 24, padding: { top: 20, right: 0, bottom: 0, left: 0 } },
            styling: { bgType: 'inherit' },
            responsive: { mobile: { direction: 'vertical', gap: 20, crossAxisAlignment: 'center' } },
          },
        ],
        layout: {
          direction: 'vertical',
          width: { mode: 'fill' },
          height: { mode: 'fit' },
          mainAxisDistribution: 'start',
          crossAxisAlignment: 'stretch',
          gap: 36,
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
      },
    ],
  },

  // ─── 6. Logo & Social ──────────────────────────────────────
  {
    id: 'logo-social',
    name: 'Logo & Social Links',
    description: 'Centered logo with social icons and minimal links.',
    category: 'Minimal',
    tree: [
      {
        id: 'fg-ls-main',
        nodeType: 'group',
        name: 'Group',
        visible: true,
        children: [
          { id: 'fc-ls-logo', nodeType: 'logo', name: 'Logo', visible: true, props: { sourceType: 'theme', text: 'BillionBiz', fontSize: 28, fontWeight: 800, width: 160, link: '/' } },
          { id: 'fc-ls-divider', nodeType: 'divider', name: 'Divider', visible: true, props: { thickness: 1, style: 'solid', width: '60%', spacing: 8 } },
          { id: 'fc-ls-social', nodeType: 'social-links', name: 'Social Links', visible: true, props: { platforms: [{ platform: 'twitter', url: '#', enabled: true }, { platform: 'instagram', url: '#', enabled: true }, { platform: 'facebook', url: '#', enabled: true }, { platform: 'linkedin', url: '#', enabled: true }, { platform: 'youtube', url: '#', enabled: true }], iconSize: 22, gap: 20, alignment: 'center' } },
          { id: 'fc-ls-copyright', nodeType: 'copyright', name: 'Copyright', visible: true, props: { text: '© {year} BillionBiz. All rights reserved.', fontSize: 12, alignment: 'center' } },
        ],
        layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'center', crossAxisAlignment: 'center', gap: 20, padding: { top: 48, right: 32, bottom: 48, left: 32 } },
      },
    ],
  },

  // ─── 7. Compact Bottom Bar ─────────────────────────────────
  {
    id: 'compact-bar',
    name: 'Compact Bottom Bar',
    description: 'Single-row compact footer with essential links.',
    category: 'Minimal',
    tree: [
      {
        id: 'fg-cb-main',
        nodeType: 'group',
        name: 'Group',
        visible: true,
        children: [
          { id: 'fc-cb-logo', nodeType: 'logo', name: 'Logo', visible: true, props: { sourceType: 'theme', text: 'BillionBiz', fontSize: 16, fontWeight: 700, width: 100, link: '/' } },
          { id: 'fc-cb-links', nodeType: 'link-list', name: 'Links', visible: true, props: { heading: '', links: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }, { label: 'Contact', href: '/contact' }], fontSize: 13, gap: 0 } },
          { id: 'fc-cb-copyright', nodeType: 'copyright', name: 'Copyright', visible: true, props: { text: '© {year} BillionBiz', fontSize: 12 } },
        ],
        layout: { direction: 'horizontal', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'space-between', crossAxisAlignment: 'center', gap: 24, padding: { top: 16, right: 32, bottom: 16, left: 32 } },
        responsive: { mobile: { direction: 'vertical', gap: 12, crossAxisAlignment: 'center' } },
      },
    ],
  },

  // ─── 8. Editorial / Brand Story ────────────────────────────
  {
    id: 'editorial',
    name: 'Editorial / Brand Story',
    description: 'Rich brand narrative with imagery and storytelling.',
    category: 'Brand-Focused',
    tree: [
      {
        id: 'fg-ed-wrapper',
        nodeType: 'group',
        name: 'Group',
        visible: true,
        children: [
          {
            id: 'fg-ed-brand',
            nodeType: 'group',
            name: 'Group',
            visible: true,
            children: [
              {
                id: 'fg-ed-story',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  { id: 'fc-ed-logo', nodeType: 'logo', name: 'Logo', visible: true, props: { sourceType: 'theme', text: 'BillionBiz', fontSize: 32, fontWeight: 800, width: 180, link: '/' } },
                  { id: 'fc-ed-heading', nodeType: 'heading', name: 'Tagline', visible: true, props: { text: 'Commerce, Reimagined.', level: 'h2', fontSize: 22, fontWeight: 600 } },
                  { id: 'fc-ed-text', nodeType: 'text', name: 'Story', visible: true, props: { text: 'We believe great commerce experiences should be accessible to every merchant. Our platform empowers businesses of all sizes to build, launch, and scale their digital storefronts with confidence.', fontSize: 15, lineHeight: 1.7 } },
                  { id: 'fc-ed-btn', nodeType: 'button', name: 'CTA', visible: true, props: { label: 'Our Story', link: '/about', variant: 'primary', size: 'md' } },
                ],
                layout: { direction: 'vertical', width: { mode: 'custom', value: 45, unit: '%' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 16, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
              {
                id: 'fg-ed-nav',
                nodeType: 'group',
                name: 'Group',
                visible: true,
                children: [
                  {
                    id: 'fg-ed-col-1',
                    nodeType: 'group',
                    name: 'Group',
                    visible: true,
                    children: [
                      { id: 'fc-ed-l1', nodeType: 'link-list', name: 'Shop', visible: true, props: { heading: 'Shop', links: [{ label: 'All Products', href: '/shop' }, { label: 'New Arrivals', href: '/new' }, { label: 'Best Sellers', href: '/best-sellers' }], fontSize: 14, gap: 10 } },
                    ],
                    layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
                  },
                  {
                    id: 'fg-ed-col-2',
                    nodeType: 'group',
                    name: 'Group',
                    visible: true,
                    children: [
                      { id: 'fc-ed-l2', nodeType: 'link-list', name: 'About', visible: true, props: { heading: 'About', links: [{ label: 'Our Team', href: '/team' }, { label: 'Careers', href: '/careers' }, { label: 'Press', href: '/press' }], fontSize: 14, gap: 10 } },
                    ],
                    layout: { direction: 'vertical', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'start', crossAxisAlignment: 'start', gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
                  },
                ],
                layout: { direction: 'horizontal', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'space-around', crossAxisAlignment: 'start', gap: 32, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
              },
            ],
            layout: { direction: 'horizontal', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'space-between', crossAxisAlignment: 'start', gap: 48, padding: { top: 0, right: 0, bottom: 0, left: 0 }, wrap: true },
            responsive: { mobile: { direction: 'vertical', gap: 32 } },
          },
          {
            id: 'fg-ed-bottom',
            nodeType: 'group',
            name: 'Group',
            visible: true,
            children: [
              { id: 'fc-ed-copyright', nodeType: 'copyright', name: 'Copyright', visible: true, props: { text: '© {year} BillionBiz. All rights reserved.', fontSize: 12 } },
              { id: 'fc-ed-social', nodeType: 'social-links', name: 'Social Links', visible: true, props: { platforms: [{ platform: 'twitter', url: '#', enabled: true }, { platform: 'instagram', url: '#', enabled: true }], iconSize: 18, gap: 14 } },
              { id: 'fc-ed-payment', nodeType: 'payment-icons', name: 'Payment Methods', visible: true, props: { methods: [{ id: 'visa', name: 'Visa', enabled: true }, { id: 'mastercard', name: 'Mastercard', enabled: true }, { id: 'paypal', name: 'PayPal', enabled: true }], size: 'small', gap: 8 } },
            ],
            layout: { direction: 'horizontal', width: { mode: 'fill' }, height: { mode: 'fit' }, mainAxisDistribution: 'space-between', crossAxisAlignment: 'center', gap: 16, padding: { top: 20, right: 0, bottom: 0, left: 0 } },
            styling: { bgType: 'inherit' },
            responsive: { mobile: { direction: 'vertical', gap: 16, crossAxisAlignment: 'center' } },
          },
        ],
        layout: {
          direction: 'vertical',
          width: { mode: 'fill' },
          height: { mode: 'fit' },
          mainAxisDistribution: 'start',
          crossAxisAlignment: 'stretch',
          gap: 36,
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
      },
    ],
  },
];

/** Get a template by ID */
export function getFooterTemplate(id: string): FooterTreeTemplate | undefined {
  return FOOTER_TREE_TEMPLATES.find((t) => t.id === id);
}

/** Clone a template's tree with fresh IDs to avoid ID collision */
export function cloneTemplateTree(templateId: string): FooterTreeNode[] | null {
  const template = getFooterTemplate(templateId);
  if (!template) return null;

  // Deep-clone with new IDs
  function cloneWithNewIds(node: FooterTreeNode): FooterTreeNode {
    const cloned: FooterTreeNode = {
      ...JSON.parse(JSON.stringify(node)),
      id: generateNodeId(node.nodeType === 'group' ? 'fg' : 'fc'),
    };
    if (cloned.children) {
      cloned.children = cloned.children.map(cloneWithNewIds);
    }
    return cloned;
  }

  return template.tree.map(cloneWithNewIds);
}
