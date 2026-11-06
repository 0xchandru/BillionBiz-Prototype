import { describe, expect, it } from 'vitest';
import { buildVariantMatrix, buildVariantSku } from './variantMatrix';

describe('buildVariantMatrix', () => {
  it('creates each size and colour combination with stable SKU suffixes', () => {
    const variants = buildVariantMatrix([
      { name: 'Size', values: 'S, M' },
      { name: 'Color', values: 'Blue, Red' },
    ]);

    expect(variants).toHaveLength(4);
    expect(variants.map((variant) => variant.optionValues)).toEqual([
      { Size: 'S', Color: 'Blue' },
      { Size: 'S', Color: 'Red' },
      { Size: 'M', Color: 'Blue' },
      { Size: 'M', Color: 'Red' },
    ]);
    expect(buildVariantSku('TEE', variants[0], variants.length)).toMatch(/^TEE-S-BLUE-[A-Z0-9]{7}$/);
  });

  it('ignores blank and duplicate option values', () => {
    expect(buildVariantMatrix([{ name: 'Pack', values: 'Single, Pair, Single, single, ' }])).toHaveLength(2);
  });

  it('rejects duplicate option names and oversized matrices', () => {
    expect(() => buildVariantMatrix([
      { name: 'Size', values: 'S' },
      { name: ' size ', values: 'M' },
    ])).toThrow('Variant option names must be unique.');
    expect(() => buildVariantMatrix([
      { name: 'Size', values: Array.from({ length: 26 }, (_, i) => `S${i}`).join(',') },
      { name: 'Color', values: 'Blue, Red, Green, Black, White, Yellow, Purple, Orange, Pink, Brown' },
    ], 200)).toThrow('Reduce the options to 200 or fewer combinations.');
  });
});
