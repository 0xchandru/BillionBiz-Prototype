export interface SectionDocumentValidationResult {
  valid: boolean;
  issues: Array<{ path: string; message: string }>;
}

type AnyRecord = Record<string, any>;

const isRecord = (value: unknown): value is AnyRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isSafeText = (value: unknown, maxLength: number): value is string =>
  typeof value === 'string' && value.length <= maxLength;

const containsControlCharacters = (value: string): boolean =>
  Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  });

const isSafeLink = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= 2000 &&
  !/[\u0000-\u001f]/.test(value) &&
  /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(value) &&
  !/^javascript:/i.test(value);

const isSafeColor = (value: unknown): value is string =>
  typeof value === 'string' &&
  (
    /^#[0-9a-f]{3,8}$/i.test(value) ||
    /^rgba?\(\s*[0-9.% ,]+\)$/i.test(value) ||
    /^hsla?\(\s*[0-9.% ,deg]+\)$/i.test(value) ||
    new Set([
      'transparent', 'currentcolor', 'white', 'black', 'red', 'blue', 'green',
      'gray', 'grey', 'navy', 'teal', 'purple', 'orange', 'pink', 'yellow'
    ]).has(value.toLowerCase())
  );

const allowedTokenReferences = new Set([
  'color.brand.primary',
  'color.brand.secondary',
  'color.brand.accent',
  'color.text.heading',
  'color.text.body',
  'color.text.muted',
  'color.background.surface',
  'color.background.page',
  'color.border.default'
]);

function validateOverride(
  value: unknown,
  path: string,
  issues: SectionDocumentValidationResult['issues']
): void {
  if (value === undefined || value === null) return;
  if (typeof value === 'string') {
    if (value !== 'inherit' && !isSafeColor(value)) {
      issues.push({ path, message: 'Use inherit, a registered token or a valid CSS color value.' });
    }
    return;
  }
  if (!isRecord(value)) {
    issues.push({ path, message: 'A style override must be a token reference or custom value object.' });
    return;
  }
  if (value.mode === 'token') {
    if (typeof value.token !== 'string' || !allowedTokenReferences.has(value.token)) {
      issues.push({ path, message: 'This design token is not registered.' });
    }
  } else if (value.mode === 'custom') {
    if (!isSafeColor(value.value)) {
      issues.push({ path, message: 'Custom style values must be valid colors.' });
    }
  } else {
    issues.push({ path, message: 'Unsupported design override mode.' });
  }
}

function validateHeroBlock(block: unknown, index: number, issues: SectionDocumentValidationResult['issues']): string | null {
  const path = `blocks[${index}]`;
  if (!isRecord(block) || typeof block.id !== 'string' || !block.id || typeof block.type !== 'string') {
    issues.push({ path, message: 'A block requires a non-empty ID and registered type.' });
    return null;
  }
  if (block.schemaVersion !== 1 || typeof block.enabled !== 'boolean' || !isRecord(block.settings)) {
    issues.push({ path, message: 'Block must use schema version 1, an enabled flag and a settings object.' });
    return block.id;
  }

  const settings = block.settings;
  switch (block.type) {
    case 'eyebrow':
      if (!isSafeText(settings.text, 60)) issues.push({ path: `${path}.settings.text`, message: 'Eyebrow text is required and limited to 60 characters.' });
      break;
    case 'heading':
      if (!isSafeText(settings.text, 180) || !settings.text.trim()) issues.push({ path: `${path}.settings.text`, message: 'Heading text is required and limited to 180 characters.' });
      if (!['h1', 'h2'].includes(settings.level)) issues.push({ path: `${path}.settings.level`, message: 'Heading level must be h1 or h2.' });
      break;
    case 'rich-text':
      if (!isSafeText(settings.text, 500)) issues.push({ path: `${path}.settings.text`, message: 'Supporting text must be limited to 500 characters.' });
      break;
    case 'button':
      if (!isSafeText(settings.label, 40) || !settings.label.trim()) issues.push({ path: `${path}.settings.label`, message: 'Button label is required and limited to 40 characters.' });
      if (!isSafeLink(settings.href)) issues.push({ path: `${path}.settings.href`, message: 'Button destination must be http(s), relative, anchor, mailto or tel.' });
      if (!['primary', 'secondary', 'text'].includes(settings.variant)) issues.push({ path: `${path}.settings.variant`, message: 'Button style is not registered.' });
      if (typeof settings.openInNewTab !== 'boolean') issues.push({ path: `${path}.settings.openInNewTab`, message: 'openInNewTab must be boolean.' });
      break;
    case 'image':
      if (
        !isSafeText(settings.src, 2000) ||
        (settings.src && (
          !(settings.src.startsWith('https://') || settings.src.startsWith('http://') || settings.src.startsWith('/')) ||
          containsControlCharacters(settings.src)
        ))
      ) {
        issues.push({ path: `${path}.settings.src`, message: 'Image source must be empty or a valid http(s)/relative URL.' });
      }
      if (!isSafeText(settings.alt, 180)) issues.push({ path: `${path}.settings.alt`, message: 'Image alternative text is limited to 180 characters.' });
      if (!['cover', 'contain'].includes(settings.fit)) issues.push({ path: `${path}.settings.fit`, message: 'Image fit must be cover or contain.' });
      break;
    default:
      issues.push({ path: `${path}.type`, message: `Block type "${block.type}" is not registered for Hero Banner.` });
  }

  if (block.designOverrides !== undefined && !isRecord(block.designOverrides)) {
    issues.push({ path: `${path}.designOverrides`, message: 'Block design overrides must be an object.' });
  } else if (isRecord(block.designOverrides)) {
    for (const key of ['color', 'background']) {
      if (block.designOverrides[key] !== undefined) {
        validateOverride(block.designOverrides[key], `${path}.designOverrides.${key}`, issues);
      }
    }
    if (block.designOverrides.borderRadius !== undefined &&
        (typeof block.designOverrides.borderRadius !== 'number' || block.designOverrides.borderRadius < 0 || block.designOverrides.borderRadius > 48)) {
      issues.push({ path: `${path}.designOverrides.borderRadius`, message: 'Border radius must be between 0 and 48 pixels.' });
    }
    if (block.designOverrides.fontSize !== undefined &&
        (typeof block.designOverrides.fontSize !== 'number' || block.designOverrides.fontSize < 12 || block.designOverrides.fontSize > 120)) {
      issues.push({ path: `${path}.designOverrides.fontSize`, message: 'Font size must be between 12 and 120 pixels.' });
    }
  }

  return block.id;
}

function validateVersionedHeroBanner(
  section: AnyRecord,
  index: number,
  issues: SectionDocumentValidationResult['issues']
): void {
  const path = `sections[${index}]`;
  if (section.schemaVersion !== 1 || typeof section.enabled !== 'boolean') {
    issues.push({ path, message: 'Hero Banner must use schema version 1 and an enabled flag.' });
  }
  if (!isRecord(section.settings)) {
    issues.push({ path: `${path}.settings`, message: 'Hero Banner settings must be an object.' });
  } else {
    const settings = section.settings;
    if (!['split-right', 'split-left', 'centered'].includes(settings.layout)) {
      issues.push({ path: `${path}.settings.layout`, message: 'Hero layout is not registered.' });
    }
    if (!['standard', 'wide', 'full'].includes(settings.contentWidth)) {
      issues.push({ path: `${path}.settings.contentWidth`, message: 'Hero content width is not registered.' });
    }
    if (typeof settings.minHeight !== 'number' || settings.minHeight < 280 || settings.minHeight > 900) {
      issues.push({ path: `${path}.settings.minHeight`, message: 'Hero minimum height must be between 280 and 900 pixels.' });
    }
  }

  if (!Array.isArray(section.blocks)) {
    issues.push({ path: `${path}.blocks`, message: 'Hero Banner blocks must be an array.' });
    return;
  }
  if (section.blocks.length < 1 || section.blocks.length > 12) {
    issues.push({ path: `${path}.blocks`, message: 'Hero Banner must contain between 1 and 12 blocks.' });
  }

  const blockIds = new Set<string>();
  const blockCounts = new Map<string, number>();
  let headings = 0;
  section.blocks.forEach((block: unknown, blockIndex: number) => {
    const blockId = validateHeroBlock(block, blockIndex, issues);
    if (blockId) {
      if (blockIds.has(blockId)) issues.push({ path: `${path}.blocks[${blockIndex}].id`, message: 'Block IDs must be unique within a section.' });
      blockIds.add(blockId);
    }
    if (isRecord(block) && typeof block.type === 'string') {
      blockCounts.set(block.type, (blockCounts.get(block.type) || 0) + 1);
      if (block.type === 'heading') headings += 1;
    }
  });
  if (headings !== 1) {
    issues.push({ path: `${path}.blocks`, message: 'Hero Banner must contain exactly one heading block.' });
  }
  for (const [type, count] of blockCounts) {
    const maximum = type === 'button' ? 2 : ['eyebrow', 'heading', 'rich-text', 'image'].includes(type) ? 1 : 0;
    if (count > maximum) issues.push({ path: `${path}.blocks`, message: `Too many "${type}" blocks.` });
  }

  if (section.designOverrides !== undefined && !isRecord(section.designOverrides)) {
    issues.push({ path: `${path}.designOverrides`, message: 'Section design overrides must be an object.' });
  } else if (isRecord(section.designOverrides)) {
    for (const key of ['sectionBackground', 'headingColor', 'bodyColor', 'eyebrowColor']) {
      if (section.designOverrides[key] !== undefined) {
        validateOverride(section.designOverrides[key], `${path}.designOverrides.${key}`, issues);
      }
    }
  }
}

export function validatePageSectionDocument(sections: unknown): SectionDocumentValidationResult {
  const issues: SectionDocumentValidationResult['issues'] = [];
  if (!Array.isArray(sections)) {
    return { valid: false, issues: [{ path: 'sections', message: 'Sections must be an array.' }] };
  }
  if (sections.length > 100) {
    return { valid: false, issues: [{ path: 'sections', message: 'A page cannot contain more than 100 sections.' }] };
  }

  const sectionIds = new Set<string>();
  sections.forEach((section: unknown, index) => {
    const path = `sections[${index}]`;
    if (!isRecord(section) || typeof section.id !== 'string' || !section.id || typeof section.type !== 'string' || !section.type) {
      issues.push({ path, message: 'Each section requires a non-empty string ID and type.' });
      return;
    }
    if (sectionIds.has(section.id)) issues.push({ path: `${path}.id`, message: 'Section IDs must be unique on the page.' });
    sectionIds.add(section.id);

    // Legacy records remain readable and writable while their editor migration
    // happens. Only the registered, explicitly versioned format is strict.
    if (section.schemaVersion === undefined || section.schemaVersion === null) return;
    if (section.type === 'HeroBanner') {
      validateVersionedHeroBanner(section, index, issues);
    } else {
      issues.push({ path: `${path}.type`, message: `Versioned section type "${section.type}" is not registered yet. Keep it in the legacy format until its vertical slice is implemented.` });
    }
  });

  const serialized = (() => {
    try { return JSON.stringify(sections); } catch { return ''; }
  })();
  if (!serialized || Buffer.byteLength(serialized, 'utf8') > 256 * 1024) {
    issues.push({ path: 'sections', message: 'Page section document is invalid or exceeds the 256 KB limit.' });
  }

  return { valid: issues.length === 0, issues };
}
