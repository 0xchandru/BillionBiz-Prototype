# Environment Variables, Configuration and Secrets Policy

**Revision:** V2.2.0 · **Status:** Mandatory

## 1. Principles

Environment variables configure platform runtime and deployment. They are not a database for merchant accounts or merchant-owned provider credentials. All client/merchant-specific provider secrets belong in tenant-scoped encrypted database connection records (see `merchant-integration-credentials-architecture.md`).

## 2. Environment categories

### Allowed platform/backend environment
- `NODE_ENV`, `PORT`, `HOST`, runtime/logging values.
- `DATABASE_URL` and database pool configuration.
- Redis/queue connection for platform infrastructure.
- Session/token signing secrets and OAuth application secrets owned by BillionBiz.
- KMS key reference / workload identity or local development-only credential-encryption key.
- Platform-owned transactional email provider credentials used for BillionBiz account/store/order notifications.
- Object storage endpoint/bucket and platform access credentials.
- Public canonical app origins and trusted ingress settings.
- Internal webhook/API signing keys owned by the platform.

### Allowed frontend environment
Only values safe for a visitor to inspect: public application origins, public API/proxy path, analytics public ID if approved, and build-time feature metadata. Never place any secret in a variable exposed by `NEXT_PUBLIC_`, `VITE_`, `PUBLIC_` or equivalent browser prefix.

### Forbidden environment values
Do not put merchant-specific Razorpay/Shiprocket/Delhivery/WhatsApp/merchant SMTP/API key/token/password/webhook secret into `.env`, `.env.example`, Vercel project variables or frontend code. Do not add generic `PLUGIN_*`/`EXTENSION_*` credential variables.

## 3. Configuration ownership register

Every variable must record: exact name, purpose, owning app, environment, secret classification, owner (`PLATFORM` or `MERCHANT_CONNECTION`), where stored, rotation method and consumer. If owner is `MERCHANT_CONNECTION`, it must be stored encrypted in the database and must not appear in environment files.

## 4. File creation and safety

Create backend `.env.example` and framework-appropriate frontend `.env.example`. Create ignored local `.env`/`.env.local` only when absent; never overwrite an existing local file or credentials. Keep real values out of generated templates. Check `.gitignore`, Git tracking and build output. Fail startup with a clear message if a required setting is missing; never silently switch production to insecure defaults.

Vercel environment variables are deployment configuration. Frontend variables must contain only public values. Backend secrets belong in the backend runtime secret store, not in a Vercel browser bundle. If a Vercel server-side proxy needs a backend origin, that origin may be server-only configuration; no secret credentials should be embedded in it.

## 5. Environment separation

Use isolated development, preview/staging and production configurations, databases, storage buckets, OAuth callback URLs, integration test/live modes, email identity and credentials. Production must never read preview/test provider data or demo tenants.

## 6. Rotation and incident response

Document key rotation and revocation. Support dual key versions during envelope-encryption rotation. On suspected exposure, revoke provider credentials, invalidate sessions/tokens, rotate platform secrets, inspect audit logs and reconcile webhook/payment state. Never print secret values in diagnostic output.

## 4.1 Forbidden merchant integration variables

Never add merchant-specific provider credentials to backend `.env`, `.env.example`, Vercel variables, CI/CD shared variables or frontend bundles. Specifically forbidden as shared runtime configuration are merchant Razorpay key/secret/webhook signing secret, merchant Shiprocket credentials/token, merchant Delhivery credentials, merchant WhatsApp/marketing/email sender credentials, and generic `PLUGIN_*`/`EXTENSION_*` bags.

These belong in encrypted `integration_connections` records per merchant/store and environment. The only allowed environment values in this area are BillionBiz-owned platform infrastructure secrets (for example KMS key reference, local-only `INTEGRATION_CREDENTIALS_KEK`, shared platform OAuth client secret where required, and BillionBiz transactional email sender credentials). Every secret must have an owner classification `PLATFORM` or `MERCHANT_CONNECTION`; only `PLATFORM` may be configured in environment/secret manager.
