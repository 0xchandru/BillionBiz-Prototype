export interface VariantOptionInput {
  name: string;
  values: string;
}

export interface VariantCombination {
  optionValues: Record<string, string>;
  skuSuffix: string;
}

const normalizeOptionValues = (values: string): string[] => {
  const seen = new Set<string>();
  return values.split(',').map((value) => value.trim()).filter((value) => {
    const normalized = value.toLocaleLowerCase();
    if (!value || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

/** Builds a deterministic, bounded Cartesian product for purchasable variants. */
export function buildVariantMatrix(options: VariantOptionInput[], maximumVariants = 250): VariantCombination[] {
  const normalized = options
    .map((option) => ({
      name: option.name.trim(),
      values: normalizeOptionValues(option.values),
    }))
    .filter((option) => option.name && option.values.length > 0);

  if (normalized.length === 0) return [];
  const names = normalized.map((option) => option.name.toLowerCase());
  if (new Set(names).size !== names.length) throw new Error('Variant option names must be unique.');

  const total = normalized.reduce((count, option) => count * option.values.length, 1);
  if (total > maximumVariants) {
    throw new Error(`This product creates ${total} variants. Reduce the options to ${maximumVariants} or fewer combinations.`);
  }

  return normalized.reduce<VariantCombination[]>(
    (combinations, option) => combinations.flatMap((combination) => option.values.map((value) => {
      const optionValues = { ...combination.optionValues, [option.name]: value };
      const suffix = Object.values(optionValues)
        .map((part) => part.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
        .filter(Boolean)
        .join('-');
      return { optionValues, skuSuffix: suffix };
    })),
    [{ optionValues: {}, skuSuffix: '' }],
  );
}

export function buildVariantSku(baseSku: string, combination: VariantCombination, variantCount: number): string {
  const base = baseSku.trim().toUpperCase().replace(/[^A-Z0-9-]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 37);
  if (variantCount === 1) return base;
  const signature = JSON.stringify(combination.optionValues);
  let hash = 2166136261;
  for (let index = 0; index < signature.length; index += 1) {
    hash ^= signature.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const stableHash = (hash >>> 0).toString(36).toUpperCase().padStart(7, '0');
  const suffix = combination.skuSuffix.replace(/-+$/g, '').slice(0, 18) || 'VARIANT';
  return `${base || 'SKU'}-${suffix}-${stableHash}`.slice(0, 64);
}
