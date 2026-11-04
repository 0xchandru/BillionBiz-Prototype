// ============================================================
// MASTER EDITOR ENGINE — SELECTION ENGINE
// Unified selection model synced across center preview, left sidebar,
// and right inspector (spec §69, §70).
// ============================================================

import type { SelectedTarget, EditorType, HeaderRow, FooterRow } from './types';

export interface BreadcrumbItem {
  id: string;
  label: string;
  target: SelectedTarget;
  isCurrent: boolean;
}

export function isTargetSelected(a: SelectedTarget, b: SelectedTarget): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'none') return true;
  if (a.type === 'global' && b.type === 'global') return a.editorType === b.editorType;
  if (a.type === 'page' && b.type === 'page') return a.pageId === b.pageId;
  if (a.type === 'section' && b.type === 'section') return a.sectionId === b.sectionId;
  if (a.type === 'row' && b.type === 'row') return a.editorType === b.editorType && a.rowId === b.rowId;
  if (a.type === 'column' && b.type === 'column') return a.rowId === b.rowId && a.columnId === b.columnId;
  if (a.type === 'element' && b.type === 'element') {
    return a.editorType === b.editorType && a.rowId === b.rowId && a.elementId === b.elementId;
  }
  return false;
}

export function getSelectionLabel(
  target: SelectedTarget,
  context: {
    headerRows?: HeaderRow[];
    footerRows?: FooterRow[];
    pageName?: string;
  }
): string {
  switch (target.type) {
    case 'none':
      return 'No Selection';
    case 'global':
      return target.editorType === 'header'
        ? 'Global Header Settings'
        : target.editorType === 'footer'
        ? 'Global Footer Settings'
        : 'Page Global Settings';
    case 'page':
      return `Page: ${context.pageName || 'Home'}`;
    case 'section':
      return `Section: ${target.sectionId}`;
    case 'row': {
      if (target.editorType === 'header') {
        const row = context.headerRows?.find((r) => r.id === target.rowId);
        return row?.name || 'Header Row';
      } else {
        const row = context.footerRows?.find((r) => r.id === target.rowId);
        return row?.name || 'Footer Row';
      }
    }
    case 'column': {
      const row = context.footerRows?.find((r) => r.id === target.rowId);
      const col = row?.columns.find((c) => c.id === target.columnId);
      return col ? `Column (${col.width})` : 'Footer Column';
    }
    case 'element': {
      if (target.editorType === 'header') {
        const row = context.headerRows?.find((r) => r.id === target.rowId);
        const el = row?.elements.find((e) => e.id === target.elementId);
        return el?.name || target.elementType || 'Header Element';
      } else {
        const row = context.footerRows?.find((r) => r.id === target.rowId);
        for (const col of row?.columns || []) {
          const el = col.elements.find((e) => e.id === target.elementId);
          if (el) return el.name;
        }
        return target.elementType || 'Footer Element';
      }
    }
    default:
      return 'Unknown Selection';
  }
}

export function getBreadcrumbHierarchy(
  target: SelectedTarget,
  editorType: EditorType,
  context: {
    headerRows?: HeaderRow[];
    footerRows?: FooterRow[];
    pageName?: string;
  }
): BreadcrumbItem[] {
  const rootLabel = editorType === 'header' ? 'Header' : editorType === 'footer' ? 'Footer' : 'Page';
  const rootTarget: SelectedTarget = { type: 'global', editorType };

  const trail: BreadcrumbItem[] = [
    {
      id: 'root',
      label: rootLabel,
      target: rootTarget,
      isCurrent: target.type === 'global',
    },
  ];

  if (target.type === 'row') {
    const rowLabel = getSelectionLabel(target, context);
    trail.push({
      id: target.rowId,
      label: rowLabel,
      target,
      isCurrent: true,
    });
  } else if (target.type === 'column') {
    const parentRowTarget: SelectedTarget = { type: 'row', editorType: 'footer', rowId: target.rowId };
    trail.push({
      id: target.rowId,
      label: getSelectionLabel(parentRowTarget, context),
      target: parentRowTarget,
      isCurrent: false,
    });
    trail.push({
      id: target.columnId,
      label: 'Column',
      target,
      isCurrent: true,
    });
  } else if (target.type === 'element') {
    const parentRowTarget: SelectedTarget = { type: 'row', editorType: target.editorType, rowId: target.rowId };
    trail.push({
      id: target.rowId,
      label: getSelectionLabel(parentRowTarget, context),
      target: parentRowTarget,
      isCurrent: false,
    });
    trail.push({
      id: target.elementId,
      label: getSelectionLabel(target, context),
      target,
      isCurrent: true,
    });
  }

  return trail;
}
