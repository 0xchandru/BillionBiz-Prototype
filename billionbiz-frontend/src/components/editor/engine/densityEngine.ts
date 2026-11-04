// ============================================================
// MASTER EDITOR ENGINE — DENSITY ENGINE
// Density presets and multipliers for spacing, padding, and
// component scale (spec §68).
// ============================================================

import type { DensityLevel } from './types';

export interface DensityMetrics {
  rowPaddingYMultiplier: number;
  gapMultiplier: number;
  fontSizeOffset: number;
  buttonPaddingMultiplier: number;
  label: string;
}

export const DENSITY_PRESETS: Record<DensityLevel, DensityMetrics> = {
  compact: {
    rowPaddingYMultiplier: 0.65,
    gapMultiplier: 0.75,
    fontSizeOffset: -1,
    buttonPaddingMultiplier: 0.8,
    label: 'Compact',
  },
  comfortable: {
    rowPaddingYMultiplier: 1.0,
    gapMultiplier: 1.0,
    fontSizeOffset: 0,
    buttonPaddingMultiplier: 1.0,
    label: 'Comfortable (Default)',
  },
  spacious: {
    rowPaddingYMultiplier: 1.4,
    gapMultiplier: 1.3,
    fontSizeOffset: 1,
    buttonPaddingMultiplier: 1.25,
    label: 'Spacious',
  },
  custom: {
    rowPaddingYMultiplier: 1.0,
    gapMultiplier: 1.0,
    fontSizeOffset: 0,
    buttonPaddingMultiplier: 1.0,
    label: 'Custom',
  },
};

export function applyDensityToPadding(basePadding: number, density: DensityLevel): number {
  const metrics = DENSITY_PRESETS[density] || DENSITY_PRESETS.comfortable;
  return Math.round(basePadding * metrics.rowPaddingYMultiplier);
}

export function applyDensityToGap(baseGap: number, density: DensityLevel): number {
  const metrics = DENSITY_PRESETS[density] || DENSITY_PRESETS.comfortable;
  return Math.round(baseGap * metrics.gapMultiplier);
}
