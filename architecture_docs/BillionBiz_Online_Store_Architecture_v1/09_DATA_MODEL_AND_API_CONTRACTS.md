# 09 — Data Model, Tenant Ownership and API Contracts

> Logical entities/contracts only. Map them to the current ORM/database. Do not create duplicate models when an equivalent source already exists.

## 1. Core logical entities

| Entity | Important fields | Owner / purpose |
|---|---|---|
| `Tenant` | id, status, createdAt | Isolation boundary |
| `Store` | id, tenantId, name, handle, mode, status, activePublicationId | Merchant storefront root |
| `StoreMembership` | tenantId, userId, role, permissions | Auth/RBAC mapping |
| `StoreDomain` | id, tenantId, storeId, host, type, isPrimary, status, verification, sslStatus | Default/custom domains |
| `StoreBrandProfile` | tenantId, storeId, displayName, tagline, description, logoAssetId, faviconAssetId, socialProfiles | Public brand |
| `Theme` | id, tenantId, storeId, name, status, activeDraftVersionId | Theme identity |
| `ThemeVersion` | id, themeId, version, tokensJson, compatibilityVersion | Immutable theme version |
| `StorePage` | id, tenantId, storeId, pageType, sourceType, title, handle, route, isSystem, isRequired, status | Page registry, not product data |
| `PageTemplateAssignment` | storeId, pageType/resource selector, templateVersionId | Page type/resource → template |
| `Template` | id, tenant/store scope or platform registry key, type, name | Template definition |
| `TemplateVersion` | id, templateId, version, configJson, schemaVersion | Immutable presentation version |
| `NavigationMenu` | id, tenantId, storeId, location, name, version | Menu source of truth |
| `NavigationItem` | id, menuId, parentId, targetType, targetId/url, label, order | Menu hierarchy |
| `MediaAsset` | id, tenantId, storageKey, mimeType, size, dimensions, altText, focalPoint, checksum | Tenant asset library |
| `StorefrontSettings` | tenantId, storeId, settingsJson/version | Online Store-only settings |
| `UrlRedirect` | tenantId, storeId, sourcePath, destinationPath, statusCode, active | Redirects |
| `Publication` | id, tenantId, storeId, version, snapshotRef, status, createdBy, createdAt | Immutable live versions |
| `DraftWorkspace` | tenantId, storeId, revision, basePublicationId, state, updatedBy | Draft config |
| `PublishEvent` / Outbox | id, tenantId, storeId, publicationId, status, retryCount | Durable event delivery |
| `EditorAuditEvent` | tenantId, actorId, action, resourceType/id, timestamp, before/after metadata | Audit trail |

Future Phase 2 concepts: `SectionDefinition`, `BlockDefinition`, `SectionInstance`, `BlockInstance`. They may be represented within immutable template JSON or normalized tables depending on the existing app model. Do not store duplicate copies in both shapes as competing sources of truth.

## 2. Data ownership boundary

Do not store product title/price/stock as duplicate editable page/block values. Store binding metadata and styling only:

```json
{
  "blockType": "product-title",
  "source": { "kind": "context", "path": "product.title" },
  "settings": { "alignment": "left", "level": "h1" }
}
```

Catalogue provides actual title/price/stock/variants. Likewise, collection membership stays in Catalogue; order state in Orders; identity in People/identity; booking slots in Appointments; payment/shipping/tax in Admin Settings and server integration records.

## 3. Isolation requirements

- Tenant ID on every tenant-owned table/resource.
- Compound unique constraints scoped by tenant/store, e.g. `(tenantId, storeId, handle)`.
- Every API query explicitly uses authenticated/resolved tenant context.
- Never accept browser-supplied tenant ID as authorization. Resolve via membership or trusted host resolver.
- Apply DB row-level security where suitable and test it; do not assume it exists.
- Tenant-scope storage, cache keys, job payloads, search indexes, event topics and audits.
- Cross-tenant ID enumeration must fail closed.

## 4. Suggested API capabilities

Adapt to actual conventions (REST, tRPC, GraphQL, server actions, etc.). These are capabilities, not forced endpoint names.

### Store / Brand
- Read/update storefront brand profile.
- Read store mode, handle and domain state.
- Upload/select logo and favicon via tenant media service.

### Pages
- List/filter/search pages; read detail and template assignment.
- Create custom content page.
- Update custom page title/handle/SEO/visibility.
- Duplicate custom page.
- Archive/delete only after reference validation.
- Change template among compatible types.
- Read system page definitions and allowed actions.

### Themes / Design
- List platform and tenant themes.
- Read active theme draft/version.
- Update theme draft tokens.
- Apply/duplicate/reset preset to draft.
- Create and compare theme revisions.

### Navigation
- List/create/update/delete menu items tenant-scoped.
- Validate internal target existence, route, parent, nesting depth and loops.

### Online Store Settings
- Read/update domain preference and visibility.
- Start custom domain verification; read DNS/SSL status.
- Read/update SEO defaults and redirects.
- Read sitemap/robots status.

### Preview / Publishing
- Create signed preview token.
- Read draft preview.
- Validate draft.
- Publish draft revision.
- Read publication history and rollback.
- Read publish status/diagnostics.

### Runtime
- Resolve host to active store/domain/publication.
- Resolve path to page type/resource/template.
- Load public tenant-scoped presentation.
- Load real dynamic data through owning module adapters.

## 5. API security/behavior

Idempotent provisioning/publish; strong server validation; rate limits for preview/upload/publish/domain verification; permission checks; audit publish/domain/restore actions; safe 404/403 behavior without leaking other tenant records; signed upload URLs; never expose secret provider credentials in theme/page JSON.

## 6. Tenant-scoped durable events

Examples:
- `store.publication.activated`
- `store.domain.status_changed`
- `store.theme.updated`
- `store.page.updated`
- `catalog.product.updated`
- `catalog.collection.updated`
- `appointments.availability.updated`

Use idempotent consumers and retryable outbox processing. Do not depend only on in-memory events that disappear when a process restarts.
