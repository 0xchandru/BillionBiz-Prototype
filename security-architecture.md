# Security Architecture

## 1. Security objectives

Protect tenant data, customer and employee information, financial transactions, provider credentials, storefront publishing and operational availability. Security is an acceptance criterion for each domain, not a final hardening task.

## 2. Trust boundaries

- Public customer browser is untrusted.
- Merchant/staff browser is authenticated but still untrusted.
- POS device is registered but may be lost, compromised or offline.
- Backend API and workers are trusted only after authentication, authorization and input validation.
- Payment/shipping providers are external systems; verify signatures and reconcile status.
- Storefront content is merchant-controlled data; render through a safe component registry and sanitize advanced custom content.
- AI/coding agent output is untrusted until reviewed and tested.

## 3. Authentication and sessions

Use secure, HttpOnly, SameSite cookies for browser sessions where possible; secure token rotation; session revocation; MFA for sensitive roles/actions; rate-limited OTP/PIN; password hashing with a modern adaptive hash; credential reset and account recovery controls. Avoid long-lived bearer tokens in localStorage. Define CSRF/CORS policy and session expiry.

## 4. Authorization and tenant isolation

- Enforce permissions on every API command/query and worker action.
- Resolve tenant/store/location from authenticated membership.
- Validate parent/child relationships at the same tenant scope.
- Evaluate PostgreSQL RLS as defense in depth.
- Scope WebSocket topics, cache keys, file paths, export jobs and search queries.
- Prevent IDOR by checking access before returning any object.
- Platform support access must be explicit, time-bound, audited and limited.

## 5. Payment and integration security

- Keep provider secrets only in server-side secret storage.
- Never send secret keys to frontend or expose after saving.
- Require HTTPS and verified provider callbacks/webhooks.
- Verify HMAC/signature over exact raw webhook bytes according to current provider documentation.
- Deduplicate event IDs and protect against replay.
- Treat browser redirect as an untrusted signal.
- Record minimum necessary provider payload; redact sensitive values.
- Separate test/live credentials and visually label environment.

## 6. Input/rendering/file security

- Schema validation, output encoding and parameterized DB access.
- Prevent stored/reflected/DOM XSS in merchant content and custom fields.
- Restrict custom CSS and do not execute user-provided JS by default.
- Apply CSP and safe iframe/sandbox policy for previews.
- Validate file content, not only filename/MIME header; use file size limits and malware scanning where available.
- Use short-lived signed upload/download URLs.
- Prevent SSRF in image URL import, webhook test URLs and external URL fetches.
- Escape CSV export values to prevent spreadsheet formula injection.

## 7. Operational security

- Secret manager, rotation and environment separation.
- Dependency/SBOM and vulnerability scanning.
- Static analysis, secret scanning and container scanning in CI.
- Encrypted backups and tested restore.
- Immutable/tamper-evident audit trails for sensitive operations.
- Least privilege for DB, queue, storage and deployments.
- Rate limiting and abuse detection.
- Security logging without passwords, PINs, full card data, provider secrets or unnecessary PII.
- Incident response and credential revocation runbooks.

## 8. Sensitive actions requiring extra controls

Refunds, discounts above threshold, owner transfer, role assignment, staff PIN reset, domain connect/publish, payment credential changes, store publish/restore, inventory adjustment and offline device lease issuance. Add re-authentication or approval when risk warrants, with reason and immutable audit.

## 9. Privacy and compliance discovery

The agent must identify applicable privacy, consumer, tax, payment and data-retention obligations for actual launch geographies with qualified review. Do not claim PCI, ISO, SOC 2 or other certification without completed independent audit/certification. Do not store raw card details. Healthcare-specific protected data is out of initial scope unless separately approved.

## V2.2 tenant-owned integration secret controls

Merchant-owned Razorpay, Shiprocket, Delhivery, WhatsApp/marketing or other provider credentials are `MERCHANT_CONNECTION` secrets stored only as encrypted tenant-scoped database records. They must not appear in frontend bundles, Vercel environment variables, shared `.env` files, logs, traces, analytics, support exports or test fixtures. Only the backend integration adapter may decrypt them in memory for a bounded provider operation.

Use envelope encryption with authenticated encryption (AES-256-GCM or a reviewed equivalent), versioned KMS-managed key in production and backend-only development key for local environments. Bind AAD to organization, store, provider, environment and connection ID. Store ciphertext/nonce/tag/key-version metadata; do not store the master key in the same database. API reads return status and masked metadata only. Writes/rotations are write-only and audited.

Do not expose plaintext credentials to merchant Admin after initial save, platform operators, staff, cashiers or other tenants. Enforce store-scoped RBAC and tenant boundaries before credential decryption. Test/live connections must be separate. Webhooks require signature verification on raw request bytes, replay protection, idempotent event inbox and secret redaction.

`INTEGRATION_CREDENTIALS_KEK` may exist only as a backend-only local development encryption key when a KMS is not available. It is a BillionBiz platform encryption key, not a merchant's payment/shipping provider credential. It must never be prefixed `NEXT_PUBLIC_`/`VITE_` or deployed to Vercel browser environments.
