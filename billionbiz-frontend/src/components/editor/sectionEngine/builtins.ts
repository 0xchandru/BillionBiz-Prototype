import { registerBlockDefinition, registerSectionDefinition } from './registry';
import { heroBannerBlockDefinitions, heroBannerSectionDefinition } from './heroBannerDefinition';
import { featuredCollectionBlockDefinitions, featuredCollectionSectionDefinition } from './featuredCollectionDefinition';

let registered = false;

export function registerBuiltInSectionDefinitions(): void {
  if (registered) return;
  heroBannerBlockDefinitions.forEach(registerBlockDefinition);
  featuredCollectionBlockDefinitions.forEach(registerBlockDefinition);
  registerSectionDefinition(heroBannerSectionDefinition);
  registerSectionDefinition(featuredCollectionSectionDefinition);
  registered = true;
}

registerBuiltInSectionDefinitions();
