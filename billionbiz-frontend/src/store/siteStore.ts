/**
 * BillionBiz Platform - SiteStore Migration & Retirement Bridge
 *
 * Notice: SiteStore has been retired in V2.3 in accordance with REQ-SITESTORE-002.
 * All store state, editor drafts, themes, snapshots, and releases are managed
 * natively by `onlineStore.ts`.
 *
 * This file re-exports the native Online Store API to ensure zero disruption
 * to existing editor components during transition.
 */

export * from './onlineStore';
