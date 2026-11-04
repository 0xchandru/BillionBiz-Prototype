import type {
  BlockDefinition,
  BlockInstance,
  SectionDefinition,
  SectionInstance,
  SettingDefinition,
  ValidationIssue,
} from './types';

const sectionDefinitions = new Map<string, SectionDefinition>();
const blockDefinitions = new Map<string, BlockDefinition>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function registerSectionDefinition(definition: SectionDefinition): void {
  if (!definition.type || !definition.renderer || definition.schemaVersion < 1) {
    throw new Error('A section definition requires a stable type, renderer key and positive schema version.');
  }
  if (sectionDefinitions.has(definition.type)) {
    throw new Error(`Section definition "${definition.type}" is already registered.`);
  }
  sectionDefinitions.set(definition.type, Object.freeze(definition));
}

export function registerBlockDefinition(definition: BlockDefinition): void {
  if (!definition.type || definition.schemaVersion < 1) {
    throw new Error('A block definition requires a stable type and positive schema version.');
  }
  if (blockDefinitions.has(definition.type)) {
    throw new Error(`Block definition "${definition.type}" is already registered.`);
  }
  blockDefinitions.set(definition.type, Object.freeze(definition));
}

export const getSectionDefinition = (type: string): SectionDefinition | undefined =>
  sectionDefinitions.get(type);

export const getBlockDefinition = (type: string): BlockDefinition | undefined =>
  blockDefinitions.get(type);

export const getSectionDefinitions = (): SectionDefinition[] =>
  Array.from(sectionDefinitions.values());

export const getBlockDefinitions = (): BlockDefinition[] =>
  Array.from(blockDefinitions.values());

function validateSettingValue(
  definition: SettingDefinition,
  value: unknown,
  path: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fail = (message: string) => issues.push({
    path,
    code: 'invalid-setting',
    message
  });

  if (value === undefined || value === null) {
    if (definition.required) {
      issues.push({ path, code: 'missing-setting', message: `"${definition.label}" is required.` });
    }
    return issues;
  }

  switch (definition.control) {
    case 'text':
    case 'textarea':
    case 'image':
    case 'url':
    case 'color':
    case 'token':
      if (typeof value !== 'string') fail(`"${definition.label}" must be text.`);
      else if (definition.maxLength && value.length > definition.maxLength) {
        fail(`"${definition.label}" exceeds ${definition.maxLength} characters.`);
      } else if (definition.control === 'url' && value && !/^(https?:\/\/|\/|#)/i.test(value)) {
        fail(`"${definition.label}" must be an http(s), relative or anchor URL.`);
      }
      break;
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) fail(`"${definition.label}" must be a finite number.`);
      else if (definition.min !== undefined && value < definition.min) fail(`"${definition.label}" is below its minimum.`);
      else if (definition.max !== undefined && value > definition.max) fail(`"${definition.label}" is above its maximum.`);
      break;
    case 'toggle':
      if (typeof value !== 'boolean') fail(`"${definition.label}" must be true or false.`);
      break;
    case 'select':
      if (!definition.options?.some((option) => option.value === value)) {
        fail(`"${definition.label}" is not an allowed option.`);
      }
      break;
    case 'spacing':
      if (!isRecord(value)) fail(`"${definition.label}" must be a spacing object.`);
      break;
  }

  return issues;
}

function validateSettings(
  schema: SettingDefinition[],
  settings: unknown,
  prefix: string
): ValidationIssue[] {
  if (!isRecord(settings)) {
    return [{ path: prefix, code: 'invalid-shape', message: 'Settings must be an object.' }];
  }

  const issues: ValidationIssue[] = [];
  const allowedKeys = new Set(schema.map((field) => field.key));
  for (const key of Object.keys(settings)) {
    if (!allowedKeys.has(key)) {
      issues.push({
        path: `${prefix}.${key}`,
        code: 'invalid-setting',
        message: 'This setting is not registered for the current schema.'
      });
    }
  }
  for (const field of schema) {
    issues.push(...validateSettingValue(field, settings[field.key], `${prefix}.${field.key}`));
  }
  return issues;
}

export function validateSectionInstance(
  instance: unknown,
  pageType?: string
): ValidationIssue[] {
  if (!isRecord(instance) || typeof instance.id !== 'string' || typeof instance.type !== 'string') {
    return [{ path: 'section', code: 'invalid-shape', message: 'A section needs a string ID and registered type.' }];
  }

  const definition = sectionDefinitions.get(instance.type);
  if (!definition) {
    return [{
      path: 'section.type',
      code: 'unknown-section',
      message: `Section type "${instance.type}" is not registered.`
    }];
  }

  const issues: ValidationIssue[] = [];
  if (Number(instance.schemaVersion) !== definition.schemaVersion) {
    issues.push({
      path: 'section.schemaVersion',
      code: 'invalid-shape',
      message: `Expected schema version ${definition.schemaVersion}.`
    });
  }
  if (pageType && definition.allowedPageTypes.length > 0 && !definition.allowedPageTypes.includes(pageType)) {
    issues.push({
      path: 'section.type',
      code: 'invalid-shape',
      message: `"${definition.label}" is not allowed on page type "${pageType}".`
    });
  }

  issues.push(...validateSettings(definition.settings, instance.settings, 'section.settings'));

  if (!Array.isArray(instance.blocks)) {
    issues.push({ path: 'section.blocks', code: 'invalid-shape', message: 'Blocks must be an ordered array.' });
    return issues;
  }

  if (definition.minBlocks !== undefined && instance.blocks.length < definition.minBlocks) {
    issues.push({ path: 'section.blocks', code: 'too-few-blocks', message: `At least ${definition.minBlocks} blocks are required.` });
  }
  if (definition.maxBlocks !== undefined && instance.blocks.length > definition.maxBlocks) {
    issues.push({ path: 'section.blocks', code: 'too-many-blocks', message: `At most ${definition.maxBlocks} blocks are allowed.` });
  }

  const ids = new Set<string>();
  const counts = new Map<string, number>();
  instance.blocks.forEach((rawBlock, index) => {
    if (!isRecord(rawBlock) || typeof rawBlock.id !== 'string' || typeof rawBlock.type !== 'string') {
      issues.push({ path: `section.blocks[${index}]`, code: 'invalid-shape', message: 'A block needs a string ID and type.' });
      return;
    }
    const blockId = rawBlock.id as string;
    const blockType = rawBlock.type as string;
    if (ids.has(blockId)) {
      issues.push({ path: `section.blocks[${index}].id`, code: 'duplicate-id', message: 'Block IDs must be unique within a section.' });
    }
    ids.add(blockId);

    if (!definition.allowedBlocks.includes(blockType)) {
      issues.push({ path: `section.blocks[${index}].type`, code: 'unknown-block', message: `Block "${blockType}" is not allowed in ${definition.label}.` });
      return;
    }
    const blockDefinition = blockDefinitions.get(blockType);
    if (!blockDefinition || !blockDefinition.allowedSections.includes(instance.type)) {
      issues.push({ path: `section.blocks[${index}].type`, code: 'unknown-block', message: 'No compatible block definition is registered.' });
      return;
    }
    counts.set(blockType, (counts.get(blockType) || 0) + 1);
    if (!isRecord(rawBlock.settings)) {
      issues.push({
        path: `section.blocks[${index}].settings`,
        code: 'invalid-shape',
        message: 'Block settings must be an object.'
      });
      return;
    }
    issues.push(...validateSettings(
      blockDefinition.settings,
      rawBlock.settings,
      `section.blocks[${index}].settings`
    ));
  });

  for (const [type, count] of counts) {
    const maximum = blockDefinitions.get(type)?.maxPerSection;
    if (maximum !== undefined && count > maximum) {
      issues.push({
        path: 'section.blocks',
        code: 'too-many-blocks',
        message: `At most ${maximum} "${type}" blocks are allowed in this section.`
      });
    }
  }

  return issues;
}

export function validateSectionInstances(
  instances: unknown[],
  pageType?: string
): ValidationIssue[] {
  const ids = new Set<string>();
  const issues: ValidationIssue[] = [];
  instances.forEach((instance, index) => {
    if (isRecord(instance) && typeof instance.id === 'string') {
      if (ids.has(instance.id)) {
        issues.push({ path: `sections[${index}].id`, code: 'duplicate-id', message: 'Section IDs must be unique on a page.' });
      }
      ids.add(instance.id);
    }
    issues.push(...validateSectionInstance(instance, pageType).map((issue) => ({
      ...issue,
      path: `sections[${index}].${issue.path}`
    })));
  });
  return issues;
}

export function isSectionInstance(value: unknown): value is SectionInstance {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    typeof value.schemaVersion === 'number' &&
    typeof value.enabled === 'boolean' &&
    isRecord(value.settings) &&
    Array.isArray(value.blocks);
}

export function isBlockInstance(value: unknown): value is BlockInstance {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    typeof value.schemaVersion === 'number' &&
    typeof value.enabled === 'boolean' &&
    isRecord(value.settings);
}
