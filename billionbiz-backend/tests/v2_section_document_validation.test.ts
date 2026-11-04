import { describe, expect, it } from 'vitest';
import { validatePageSectionDocument } from '../src/modules/storefront/sectionDocumentValidation.js';

const makeBlock = (id: string, type: string, settings: Record<string, unknown>) => ({
  id,
  type,
  schemaVersion: 1,
  enabled: true,
  settings,
  designOverrides: {},
  responsiveOverrides: {}
});

const validHero = (): any => ({
  id: 'section-hero',
  type: 'HeroBanner',
  name: 'Hero Banner',
  isHidden: false,
  schemaVersion: 1,
  enabled: true,
  settings: {
    layout: 'split-right',
    contentWidth: 'wide',
    verticalAlignment: 'center',
    minHeight: 520
  },
  blocks: [
    makeBlock('eyebrow-1', 'eyebrow', { text: 'New collection' }),
    makeBlock('heading-1', 'heading', { text: 'Make room for what you love.', level: 'h1' }),
    makeBlock('text-1', 'rich-text', { text: 'Discover the collection.' }),
    makeBlock('button-1', 'button', {
      label: 'Explore products',
      href: '/shop',
      variant: 'primary',
      openInNewTab: false
    }),
    makeBlock('image-1', 'image', { src: '', alt: '', fit: 'cover' })
  ],
  designOverrides: {},
  responsiveOverrides: {},
  props: {}
});

describe('BillionBiz versioned section document validation', () => {
  it('accepts a valid versioned Hero Banner', () => {
    const result = validatePageSectionDocument([validHero()]);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('continues to accept legacy sections during incremental migration', () => {
    const result = validatePageSectionDocument([
      { id: 'legacy-hero', type: 'HeroBanner', name: 'Hero', isHidden: false, props: { heading: 'Legacy heading' } },
      { id: 'legacy-footer', type: 'Footer', name: 'Footer', isHidden: false, props: {} }
    ]);
    expect(result.valid).toBe(true);
  });

  it('rejects unknown block types', () => {
    const hero = validHero();
    hero.blocks.push(makeBlock('unknown-1', 'script', { source: 'alert(1)' }));
    const result = validatePageSectionDocument([hero]);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes('not registered'))).toBe(true);
  });

  it('rejects executable or unsupported button destinations', () => {
    const hero = validHero();
    hero.blocks.find((block) => block.type === 'button')!.settings.href = 'javascript:alert(1)';
    const result = validatePageSectionDocument([hero]);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.path.endsWith('.settings.href'))).toBe(true);
  });

  it('rejects duplicate section and block IDs', () => {
    const hero = validHero();
    hero.blocks.push(makeBlock('heading-1', 'rich-text', { text: 'Another copy' }));
    const result = validatePageSectionDocument([hero, { ...hero, type: 'HeroBanner' }]);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes('unique'))).toBe(true);
  });

  it('requires exactly one heading block', () => {
    const hero = validHero();
    hero.blocks = hero.blocks.filter((block) => block.type !== 'heading');
    const result = validatePageSectionDocument([hero]);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes('exactly one heading'))).toBe(true);
  });

  it('rejects overlong text and unsupported style payloads', () => {
    const hero = validHero();
    hero.blocks.find((block) => block.type === 'heading')!.settings.text = 'x'.repeat(181);
    hero.designOverrides = { sectionBackground: 'url(javascript:alert(1))' };
    const result = validatePageSectionDocument([hero]);
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });

  it('rejects duplicate section IDs and excessive section count', () => {
    const hero = validHero();
    const duplicate = validatePageSectionDocument([hero, { ...hero }]);
    expect(duplicate.valid).toBe(false);
    expect(duplicate.issues.some((issue) => issue.message.includes('unique'))).toBe(true);

    const excessive = validatePageSectionDocument(Array.from({ length: 101 }, (_, index) => ({
      id: `legacy-${index}`,
      type: 'Text',
      name: 'Text',
      isHidden: false,
      props: {}
    })));
    expect(excessive.valid).toBe(false);
    expect(excessive.issues[0].message).toContain('100');
  });
});
