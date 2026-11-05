import { describe, expect, it } from 'vitest';
import { getDefaultTheme, mergeThemeData, migrateThemeData } from './themePresets';

describe('global store design tokens', () => {
  it('preserves inherited nested tokens when one value is overridden', () => {
    const defaults = getDefaultTheme();
    const next = mergeThemeData(defaults, { typography: { headingFont: 'Georgia, serif' } });
    expect(next.typography.headingFont).toBe('Georgia, serif');
    expect(next.typography.styles.h1).toEqual(defaults.typography.styles.h1);
    expect(next.palette.brand.primary).toBe(defaults.palette.brand.primary);
  });

  it('migrates legacy colors into the versioned global palette', () => {
    const migrated = migrateThemeData({ colors: { primary: '#123456', background: '#fefefe' } });
    expect(migrated.schemaVersion).toBe(1);
    expect(migrated.palette.brand.primary).toBe('#123456');
    expect(migrated.palette.background.background).toBe('#fefefe');
    expect(migrated.typography.styles.body).toBeDefined();
  });
});
