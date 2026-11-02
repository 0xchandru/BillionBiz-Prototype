# Real-Time Operations, Data Integrity and Mock-Data Elimination

## 1. Production data rule

Production must display actual tenant-scoped records and computed metrics from the authoritative database/read models. Remove hardcoded sample metrics, static fake activity, mock chart arrays, placeholder customer/order/booking lists and frontend-generated success states—especially from Dashboard.

Demo fixtures are allowed only in tests, local development or an explicitly labelled demo tenant. Production builds must never fall back to demo data when an API fails.

## 2. Dashboard data contracts

Each dashboard tile/chart documents: metric name/definition; source domain/table/read model; time-window and timezone semantics; currency/tax/refund/deposit/void treatment; tenant/store/location/channel filters; required permission; refresh mechanism; and last-updated/freshness state.

A real zero differs from unavailable data. Loading, authorization failure, source lag and calculation error must not render as zero. On error show retry and, if stale data is shown, its last-known timestamp.

## 3. Realtime event path

Committed DB transaction → transactional outbox → durable queue → worker/read-model update → authenticated WebSocket/SSE notification → client cache invalidation/refetch.

Database remains authoritative. Push is a signal to refetch, not authority to change balances or states. Events carry stable ID, version, tenant/store scope, aggregate ID, event type, timestamps and schema version. Consumers are idempotent and tolerate duplicates/out-of-order delivery.

## 4. Realtime domains

Prioritize orders/payment/fulfilment; appointment booking/reschedule/cancel/capacity/staff schedule; POS register and inventory; notification inbox; team invitation/assignment; and store publication/domain/integration health. Use polling/refetch when streaming adds no meaningful value.

## 5. Freshness objectives

Set measurable SLOs after baseline. Initial load-test targets, not guarantees: connected operational event propagation p95 ≤ 2 seconds; dashboard/list reads p95 ≤ 400 ms at an agreed baseline; stale state detected/recovered after reconnect; queue lag visible and alertable. Revise from realistic load tests and deployment capacity.

Show `Live`, `Updated at`, `Syncing`, `Offline`, `Delayed` or `Needs attention` where useful. Use store/location timezone for business periods.

## 6. Concurrency and idempotency

- Booking holds/capacity use server-side atomic locks/constraints and expiry; simultaneous requests cannot overbook.
- Inventory uses authoritative reservations/ledger and transactional updates.
- Payments, refunds, POS sales and webhooks use idempotency keys/provider references.
- Publishing uses versioned snapshots and atomic pointer changes; failed publish leaves current published version intact.
- Conflicts return clear version conflict/retry; never silently overwrite another user's update.

## 7. Offline POS

Offline behavior is deliberately bounded by risk. Persist encrypted/signed local queue data where feasible, unique operation IDs, device/user/counter scope, expiry and sequence. Show provisional state and policy limits. Reconcile with conflict handling and immutable audit. Never show queued payment as provider-confirmed. Define allowed offline tenders/actions; high-risk refunds/voids may be blocked.

## 8. Mock-data elimination controls

- Search production routes/imports for `mock`, `fake`, `sample`, `demo`, hardcoded arrays and random chart generators.
- Replace them with server queries and documented read models.
- Keep seed scripts under explicit development/test commands; prohibit production execution.
- Test dashboards against inserted DB fixtures and verify no demo records appear for a clean tenant.
- Add build/runtime guardrails for demo mode.
- A clean store shows honest zero/empty states and onboarding actions, not fabricated sales.

## 9. Platform-wide realtime contract

Every feature must provide timely, consistent visibility of committed changes across every authorized portal. This does **not** mean sending every static settings page over a WebSocket. It means: after a successful write, the authoritative database is updated; relevant authorized views are invalidated/refreshed or receive an event within a documented freshness target; and other sessions/devices do not remain silently stale.

- Operational domains (orders, payments, inventory, bookings, POS registers/sales, staff assignments, notifications, store publish/domain/integration health) use event-driven updates where they materially improve the workflow.
- Low-change reference/settings pages may use request/response reads with an explicit refresh and optimistic concurrency/version check.
- Every mutation returns a durable record/version or a clear pending state. Never optimistically claim provider settlement, email delivery, shipment creation, booking confirmation or offline reconciliation before authoritative confirmation.
- Realtime subscriptions are scoped by authenticated user, tenant, store, location, role, assigned resource/counter and permission version. Revocation must invalidate access promptly.
- Reconnect performs a cursor/version-based catch-up or authoritative refetch; missed events must not cause permanent divergence.
- Cross-portal consistency is required: a booking updated by staff appears to the merchant; a sale committed at POS updates inventory/orders/analytics; an admin changes counter assignment and the cashier session is revoked or refreshed according to policy.
- Define and monitor per-domain freshness SLOs. Report queue lag, dropped/dead-letter events, stale client versions and failed reconciliation.

