import { registerBlockDefinition, registerSectionDefinition } from './registry';
import { heroBannerBlockDefinitions, heroBannerSectionDefinition } from './heroBannerDefinition';

let registered = false;

export function registerBuiltInSectionDefinitions(): void {
  if (registered) return;
  heroBannerBlockDefinitions.forEach(registerBlockDefinition);
  registerSectionDefinition(heroBannerSectionDefinition);
  registered = true;
}

registerBuiltInSectionDefinitions();
