import { create } from 'zustand';

// ============================================================
// CONTENT STATE STORE
// Tracks per-section, per-content-configuration content state
// so that switching layouts preserves edited/cleared content.
// ============================================================

export type ContentStatus = 'default' | 'customized' | 'cleared';

export interface ContentConfigState {
  /** Current status of this content configuration */
  status: ContentStatus;
  /** The stored content values (populated when customized; empty object when cleared) */
  values: Record<string, any>;
}

interface ContentStateStore {
  /**
   * Nested map: sectionId → contentConfigKey → ContentConfigState
   * If a config key is absent, it means "default" (never edited or cleared).
   */
  states: Record<string, Record<string, ContentConfigState>>;

  // ---- Getters ----

  /** Get the stored state for a specific section + content config. Returns undefined if default. */
  getContentState: (sectionId: string, contentConfigKey: string) => ContentConfigState | undefined;

  // ---- Mutations ----

  /** Mark a content config as customized and store the current content field values. */
  setContentCustomized: (
    sectionId: string,
    contentConfigKey: string,
    values: Record<string, any>
  ) => void;

  /** Mark a content config as cleared (user explicitly cleared default content). */
  setContentCleared: (sectionId: string, contentConfigKey: string) => void;

  /** Delete ALL stored content states for a section (used on section deletion). */
  deleteSectionStates: (sectionId: string) => void;
}

export const useContentStateStore = create<ContentStateStore>((set, get) => ({
  states: {},

  getContentState: (sectionId, contentConfigKey) => {
    return get().states[sectionId]?.[contentConfigKey];
  },

  setContentCustomized: (sectionId, contentConfigKey, values) =>
    set((state) => ({
      states: {
        ...state.states,
        [sectionId]: {
          ...state.states[sectionId],
          [contentConfigKey]: {
            status: 'customized' as const,
            values: { ...values },
          },
        },
      },
    })),

  setContentCleared: (sectionId, contentConfigKey) =>
    set((state) => ({
      states: {
        ...state.states,
        [sectionId]: {
          ...state.states[sectionId],
          [contentConfigKey]: {
            status: 'cleared' as const,
            values: {},
          },
        },
      },
    })),

  deleteSectionStates: (sectionId) =>
    set((state) => {
      const { [sectionId]: _, ...rest } = state.states;
      return { states: rest };
    }),
}));
