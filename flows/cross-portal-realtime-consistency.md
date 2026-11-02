# Cross-Portal Realtime Consistency

## Actor and scope
Merchant Admin, Staff Portal, POS, customer account and analytics may observe the same committed domain changes, but each view receives only data allowed by its role and tenant scope.

## Main flow
1. A command commits a durable transaction and outbox event.
2. Event consumers update read models idempotently and publish a scoped notification.
3. Authorized connected clients invalidate/refetch their relevant query or consume a versioned safe payload.
4. Client indicates fresh, delayed, offline or syncing state.
5. On reconnect, the client resumes from a cursor/version or performs an authoritative refetch.
6. Duplicate/out-of-order events do not duplicate sales, bookings, stock movements, refunds or notifications.
7. Permission revocation invalidates caches/subscriptions and is enforced on subsequent requests.

## Acceptance
Cross-portal freshness objectives are measured per domain; database is authoritative; no client can promote pending or offline data to settled/confirmed state.
