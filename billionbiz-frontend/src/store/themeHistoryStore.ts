import { create } from 'zustand';
import type { GlobalThemeData } from '../components/editor/theme/themePresets';

const MAX_HISTORY = 50;
const DEBOUNCE_MS = 450;

interface ThemeHistoryState {
  past: GlobalThemeData[];
  future: GlobalThemeData[];
  canUndo: boolean;
  canRedo: boolean;
  pushState: (themeSnapshot: GlobalThemeData, force?: boolean) => void;
  undo: (currentTheme: GlobalThemeData) => GlobalThemeData | null;
  redo: (currentTheme: GlobalThemeData) => GlobalThemeData | null;
  clear: () => void;
}

let lastPushTime = 0;

export const useThemeHistoryStore = create<ThemeHistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushState: (themeSnapshot: GlobalThemeData, force = false) => {
    if (!themeSnapshot) return;
    const now = Date.now();
    const cloned = JSON.parse(JSON.stringify(themeSnapshot));

    // If within debounce window and not forced, do not push redundant snapshot
    if (!force && now - lastPushTime < DEBOUNCE_MS && get().past.length > 0) {
      return;
    }

    lastPushTime = now;
    set((state) => {
      if (state.past.length > 0) {
        const top = state.past[state.past.length - 1];
        if (JSON.stringify(top) === JSON.stringify(cloned)) {
          return state;
        }
      }

      const newPast = [...state.past, cloned];
      if (newPast.length > MAX_HISTORY) {
        newPast.shift();
      }
      return {
        past: newPast,
        future: [],
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: (currentTheme: GlobalThemeData) => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const currentCloned = JSON.parse(JSON.stringify(currentTheme));
    const newPast = [...past];
    const previousTheme = newPast.pop()!;

    lastPushTime = 0;
    set({
      past: newPast,
      future: [currentCloned, ...future],
      canUndo: newPast.length > 0,
      canRedo: true,
    });

    return previousTheme;
  },

  redo: (currentTheme: GlobalThemeData) => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const currentCloned = JSON.parse(JSON.stringify(currentTheme));
    const newFuture = [...future];
    const nextTheme = newFuture.shift()!;

    lastPushTime = 0;
    set({
      past: [...past, currentCloned],
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });

    return nextTheme;
  },

  clear: () => {
    lastPushTime = 0;
    set({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },
}));
