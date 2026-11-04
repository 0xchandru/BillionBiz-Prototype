import { registerBlockDefinition, registerSectionDefinition } from './registry';
import { heroBannerBlockDefinitions, heroBannerSectionDefinition } from './heroBannerDefinition';
import { featuredCollectionBlockDefinitions, featuredCollectionSectionDefinition } from './featuredCollectionDefinition';
import { categoryListBlockDefinitions, categoryListSectionDefinition } from './categoryListDefinition';

let registered = false;

export function registerBuiltInSectionDefinitions(): void {
  if (registered) return;
  heroBannerBlockDefinitions.forEach(registerBlockDefinition);
  featuredCollectionBlockDefinitions.forEach(registerBlockDefinition);
  categoryListBlockDefinitions.forEach(registerBlockDefinition);
  registerSectionDefinition(heroBannerSectionDefinition);
  registerSectionDefinition(featuredCollectionSectionDefinition);
  registerSectionDefinition(categoryListSectionDefinition);
  registered = true;
}

registerBuiltInSectionDefinitions();
