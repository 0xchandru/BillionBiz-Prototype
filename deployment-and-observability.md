# Deployment, Observability and Reliability Architecture

## 1. Deployment model

Begin with a cloud-agnostic, stateless application deployment that runs a modular monolith API and separately scalable worker/realtime processes from the same versioned codebase. Keep domain boundaries in code; do not split into microservices until measured scaling, blast-radius or independent deployment needs justify it.

Runtime roles:
- **Web/API**: authenticated merchant/customer endpoints and query APIs.
- **Storefront renderer**: render active immutable store releases; may be co-deployed initially, then scale independently.
- **POS/booking clients**: PWA/customer web apps; no backend authority in the client.
- **Realtime gateway**: authenticated tenant-scoped WebSocket connections.
- **Workers**: imports, notifications, payment/shipping reconciliation, scheduled booking jobs, image processing and analytics projections.
- **Scheduler/dispatcher**: creates durable jobs; workers claim jobs with database/queue idempotency.

## 2. Environment separation

Maintain distinct development, automated-test, staging and production environments. Each has independent database, Redis namespace, object-storage bucket/prefix, domains, provider credentials, webhook secrets and observability. Production data must not be copied into lower environments without an approved anonymization process.

Use separate test/live credentials for Razorpay and Shiprocket. Sandbox mode must be visible in UI and backend connection state. Never let a local/staging client send a production charge or shipment request due to an environment-variable mistake.

## 3. Data infrastructure

- PostgreSQL is the transactional source of truth. Use managed HA, automated backups, point-in-time recovery and tested restores.
- Redis is for ephemeral cache, rate limits, presence, short-lived coordination and pub/sub; it is not the only source of truth for money, bookings, inventory or job history.
- Object storage holds assets, exports and generated documents; use signed URLs, encryption, lifecycle policies and access scopes.
- CDN serves public published assets/releases using immutable release-versioned cache keys. Draft previews use short-lived signed access and noindex rules.
- Add read replicas/search/analytics stores only when query load or measured latency justifies them. Eventual-consistency read models must be labeled and reconciled against transactional records.

## 4. Delivery and migration safety

- Build, lint, typecheck, unit, integration, API-contract, security and container scans run in CI.
- Deploy immutable images/artifacts with version and commit metadata.
- Prefer canary or blue/green release for high-risk application changes.
- Use expand -> migrate/backfill -> verify -> switch reads/writes -> contract schema migration. Never deploy a destructive schema change that old application versions cannot tolerate.
- Feature flags support controlled rollout by environment/tenant/capability. Flag evaluation is server-side for access/security decisions.
- Storefront publishing is its own data-plane operation: new release is immutable and the active-release pointer switches atomically.
- SiteStore cutover requires migration report, checksum reconciliation, sample renders, traffic cutover, rollback target and human approval.

## 5. Observability

Implement structured JSON logs, metrics and distributed traces with correlation IDs across request, transaction, outbox event, worker job and provider API operation. Redact credentials, PINs, payment details and unnecessary PII.

Minimum metrics:
- API latency/error rate by route/domain/tenant cohort (never expose tenant PII in labels).
- DB pool saturation, slow queries, locks, deadlocks, replication lag and backup health.
- Queue age, pending/failed/dead-letter counts, worker retry rate and job duration.
- WebSocket connections, reconnects, event lag and authorization rejects.
- Payment attempts, webhook lag, signature failures, reconciliation gaps and refund failures.
- Booking hold expiry, booking conflict rates, double-booking prevention events, reminder lag.
- Inventory reservation conflicts, oversell rejection, movement/balance reconciliation.
- Shipment booking failures, provider rate limits, tracking event lag and exception counts.
- Offline POS queue depth, lease expiry, sync failures and owner-review cases.
- Storefront publish failures, active release version and CDN cache behavior.

## 6. Initial service objectives (targets, not achieved claims)

Set and verify initial targets with representative load tests. Suggested starting objectives:
- API availability: 99.9% monthly for core authenticated operations after production maturity.
- Common catalog read p95: < 250 ms at target load.
- Availability search p95: < 400 ms at target load.
- Realtime event delivery p95: < 1 second under normal load.
- No lost committed financial transactions or confirmed reservations.
- Recovery point objective and recovery time objective must be approved by business owners and tested.

Do not promise these SLOs before instrumentation and operational evidence exist. Define error budgets and service-specific exclusions before publishing commitments.

## 7. Backup and recovery

- Automated encrypted database backups and point-in-time recovery.
- Object storage versioning/replication as required by retention and cost policy.
- Restore drills on a schedule; verify database plus object references plus encryption-key availability.
- Recovery runbook must describe DNS, secrets, provider webhooks, queues, outbox replay, active store release pointers and tenant access validation.
- Financial, booking and inventory recovery must reconcile rather than infer state from UI caches.

## 8. Incident response

Maintain runbooks for: payment provider outage, webhook backlog, duplicate charge suspicion, refund backlog, booking contention, inventory oversell, Shiprocket API outage, queue poison message, Redis outage, database failover, PWA offline sync conflict, compromised staff device, credential rotation, data leak and failed storefront publish. Record incident owner, impact, timeline, mitigation, data integrity verification and follow-up tasks.
