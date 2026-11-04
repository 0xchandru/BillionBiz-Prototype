// ============================================================
// MASTER EDITOR ENGINE — HISTORY & VERSION CONTROL ENGINE
// Unified undo, redo, snapshot and revision history engine
// (spec §63, §64).
// ============================================================

import type { HistoryEntry, EditorType, HeaderRow, FooterRow, GlobalHeaderSettings, GlobalFooterSettings } from './types';
import type { FooterTreeNode } from './footerTreeTypes';

export interface HistoryState {
  past: HistoryEntry[];
  present: HistoryEntry | null;
  future: HistoryEntry[];
  maxEntries: number;
}

export function createInitialHistoryState(maxEntries = 50): HistoryState {
  return {
    past: [],
    present: null,
    future: [],
    maxEntries,
  };
}

export function createSnapshot(
  editorType: EditorType,
  description: string,
  data: {
    headerRows?: HeaderRow[];
    headerSettings?: GlobalHeaderSettings;
    footerRows?: FooterRow[];
    footerSettings?: GlobalFooterSettings;
    footerTree?: FooterTreeNode[];
  }
): HistoryEntry {
  const now = Date.now();
  const timeLabel = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(now);

  return {
    id: `hist-${now}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: now,
    timeLabel,
    description,
    editorType,
    snapshot: JSON.parse(JSON.stringify(data)),
  };
}

export function pushHistoryEntry(
  history: HistoryState,
  entry: HistoryEntry
): HistoryState {
  const newPast = history.present ? [...history.past, history.present] : [...history.past];

  // Trim to maxEntries
  if (newPast.length > history.maxEntries) {
    newPast.shift();
  }

  return {
    past: newPast,
    present: entry,
    future: [], // clear future on new change
    maxEntries: history.maxEntries,
  };
}

export function undoHistory(history: HistoryState): {
  newHistory: HistoryState;
  entryToRestore: HistoryEntry | null;
} {
  if (history.past.length === 0 || !history.present) {
    return { newHistory: history, entryToRestore: null };
  }

  const previous = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, -1);
  const newFuture = [history.present, ...history.future];

  return {
    newHistory: {
      past: newPast,
      present: previous,
      future: newFuture,
      maxEntries: history.maxEntries,
    },
    entryToRestore: previous,
  };
}

export function redoHistory(history: HistoryState): {
  newHistory: HistoryState;
  entryToRestore: HistoryEntry | null;
} {
  if (history.future.length === 0) {
    return { newHistory: history, entryToRestore: null };
  }

  const next = history.future[0];
  const newFuture = history.future.slice(1);
  const newPast = history.present ? [...history.past, history.present] : [...history.past];

  return {
    newHistory: {
      past: newPast,
      present: next,
      future: newFuture,
      maxEntries: history.maxEntries,
    },
    entryToRestore: next,
  };
}
