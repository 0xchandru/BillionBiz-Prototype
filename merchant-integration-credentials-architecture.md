# Merchant Integration Credentials and Provider Connection Architecture

**Revision:** V2.2.0 · **Status:** Mandatory; supersedes environment-based client plugin credentials

## 1. Requirement

BillionBiz Merchant Admin is used by BillionBiz clients (merchants) to connect their own provider accounts. Razorpay, Shiprocket and any future merchant-owned provider credentials must be configured inside the relevant merchant/store integration setup flow and stored as tenant-scoped encrypted database records.

**Do not place client-specific Razorpay, Shiprocket, Delhivery, WhatsApp, SMTP or other merchant provider credentials in frontend or backend `.env` files, Vercel environment variables, source code or a shared global configuration.** Remove merchant/plugin credential variables from the environment templates and runtime configuration.

## 2. Connection ownership

Default ownership is one `integration_connection` per store and provider. The application may support organization-level shared connections only as a deliberate, explicit feature with clear inherited scope and authorization. Do not silently share one store's connection across another store.

A connection record includes:
- `id`, `organization_id`, `store_id` (required for store-scoped connections)
- `provider_key` (for example `razorpay`, `shiprocket`)
- `environment` (`TEST` or `LIVE`)
- `status` (`NOT_CONNECTED`, `PENDING_VERIFICATION`, `ACTIVE`, `DEGRADED`, `REAUTH_REQUIRED`, `DISCONNECTED`)
- provider account/merchant identifier (non-secret metadata)
- granted scopes and connection configuration (non-secret, validated)
- encrypted credential envelope (ciphertext, nonce/IV, authentication tag, wrapped data key/key version)
- webhook secret reference/ciphertext where provider requires merchant-specific webhook signing secret
- `last_verified_at`, `last_error_code` (sanitized), `last_sync_at`, credential expiry/rotation timestamps
- created/updated/deleted timestamps and actor references

Use separate secret records or an encrypted JSON structure with a strict provider-specific schema. Do not create an untyped arbitrary key/value bucket that permits accidental secret leakage.

## 3. Encryption and key management

- Encrypt credentials before writing to the database using envelope encryption and an authenticated encryption algorithm (for example AES-256-GCM).
- In production, prefer a managed KMS/HSM or secret-management service. The database stores ciphertext and key-version metadata, not master keys.
- Local development may use a dedicated backend-only `INTEGRATION_CREDENTIALS_KEK` supplied through an ignored local `.env`; never commit it and never expose it to the browser. This is a platform encryption key, not a provider/plugin credential.
- Bind encryption context/AAD to `organization_id`, `store_id`, provider, environment and record ID to prevent ciphertext swapping across tenants/providers.
- Decrypt only in backend memory for a provider operation; do not return plaintext to any API caller after save.
- Mask secrets in the UI; support write/rotate/test/disconnect, not reveal-existing-secret.
- Rotation must support key versioning and background re-encryption without losing active connections.

## 4. Merchant Admin setup UX

For each provider card:
1. Show provider name, purpose, availability and permissions.
2. Let an authorized owner enter credentials via secure write-only fields or complete the provider's supported OAuth authorization flow.
3. Select TEST or LIVE environment explicitly.
4. Explain requested scopes and data usage.
5. Save encrypted credentials through the backend.
6. Run a real provider connection test.
7. Configure provider webhook endpoint and verify the signature secret/event delivery as required.
8. Mark connection ACTIVE only after validation and required webhook verification succeed.
9. Show account identifier, last verified time, sanitized health and re-auth state.
10. Provide rotate, disconnect and uninstall with impact preview and audit.

The browser must never read plaintext provider credentials from the database or receive them back from the API.

## 5. Environment-variable policy

Remove variables such as the following from `.env`, `.env.example`, Vercel variables and client bundles when they represent merchant-owned credentials:
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, merchant Razorpay webhook secret
- `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, merchant Shiprocket API token
- Merchant-specific `DELHIVERY_*`, `WHATSAPP_*`, marketing provider API keys, client SMTP credentials

Do not add generic `PLUGIN_*` or `EXTENSION_*` environment variable bags.

Allowed platform-level environment/secret-manager values may include:
- Database connection string and application runtime configuration.
- KMS key ID/ARN and workload identity configuration.
- Local-only backend `INTEGRATION_CREDENTIALS_KEK` for development encryption when KMS is unavailable.
- Platform-owned transactional email provider credentials used to send BillionBiz system emails (not a merchant's own marketing sender credentials).
- OAuth application client ID/secret owned by BillionBiz when the provider requires one for the platform's shared OAuth application. Per-merchant refresh/access tokens still belong in encrypted connection records.
- Platform signing keys, session secrets and webhook infrastructure secrets that belong to BillionBiz itself.

The environment policy must name the owner of every secret: `PLATFORM` or `MERCHANT_CONNECTION`. A `MERCHANT_CONNECTION` secret is forbidden in environment configuration.

## 6. Security and access rules

- Only backend integration services can decrypt and use a connection secret.
- Merchant owners and explicitly permitted integration managers can configure/rotate connections for their own store.
- Other stores, staff, cashiers, customers and platform operators do not get plaintext access.
- Platform operators see status/metadata only unless a separately approved, reason-coded, time-limited support workflow is required; no silent secret reveal.
- Enforce tenant scoping, RBAC, CSRF protection, rate limiting, audit, secret redaction and strict log filtering.
- Verify webhook signatures on the exact raw request bytes; deduplicate event IDs and prevent replay.
- Use separate TEST and LIVE records/secrets. Never silently switch a connection from test to live.
- On disconnect, revoke/delete usable ciphertext and tokens according to retention policy while retaining non-secret audit and transaction history.

## 7. Data model

Recommended tables:
- `integration_connections`
- `integration_credential_versions`
- `integration_scopes`
- `integration_webhook_endpoints`
- `integration_webhook_inbox`
- `integration_health_checks`
- `integration_audit_events`

Add composite tenant foreign keys, unique constraints such as `(store_id, provider_key, environment)`, status and credential key version indexes, and encrypted backup coverage. Keep the raw provider credential out of generic event payloads.

## 8. Provider launch rules

A provider can be listed as AVAILABLE only when a merchant can connect their own account, the secret is stored encrypted and tenant-scoped, provider operations are implemented, webhook verification is active and sandbox evidence passes. Otherwise show COMING_SOON or SETUP_REQUIRED truthfully. Marketplace display does not imply provider readiness.
