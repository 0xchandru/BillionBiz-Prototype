# Realtime, Concurrent Access and Offline Synchronization

## 1. Realtime event pattern

Domain transaction -> transactional outbox -> publisher -> broker/pub-sub -> tenant-authorized WebSocket gateway -> client. Outbox record is written in the same database transaction as the domain update. WebSocket delivery is an optimization; the committed domain state remains authoritative.

## 2. Event envelope

```json
{
  "eventId": "uuid",
  "eventType": "booking.confirmed",
  "schemaVersion": 1,
  "occurredAt": "2026-11-02T06:00:00Z",
  "organizationId": "uuid",
  "storeId": "uuid",
  "locationId": "uuid",
  "aggregateType": "booking",
  "aggregateId": "uuid",
  "aggregateVersion": 7,
  "correlationId": "uuid",
  "payload": {}
}
```

Do not include unnecessary customer PII, secrets or complete payment credentials in event payloads.

## 3. Realtime subscriptions

Clients subscribe to allowed resources only: own organization/store/location, assigned resource or permitted record. Validate authorization at connect and when joining/changing channels. Revocation must disconnect or stop delivery. Do not rely on random channel names for security.

## 4. Simultaneous edits

For mutable drafts (page content, product, order notes/settings), include entity version/ETag. Update command supplies expected version. If version changed, return a conflict with current version and let user reload/merge. For financial, booking and inventory operations use domain-specific transactions and constraints, not simple last-write-wins.

## 5. POS offline architecture

- PWA service worker caches the application shell and versioned approved catalog.
- IndexedDB stores encrypted/protected pending sale envelopes, device lease metadata and local sequence.
- Every local sale gets a stable device-generated unique transaction ID.
- Offline authorization lease has device/store scope, expiry, allowed methods and explicit usage limits.
- Initial safe scope is cash-only. Do not queue card/UPI flows as paid while disconnected.
- Local screen shows `Pending sync` and provisional receipt state.
- On reconnect, push durable transactions; server enforces idempotency, tenant/device authorization and lease limits.
- Server returns accepted, duplicate-already-accepted, held-for-review or rejected with reason per transaction.
- Client retains unacknowledged entries and retries safely.
- Inventory conflicts are reconciled through movements and owner review, never silent balance overwrite.

## 6. Job processing

Jobs are persisted with schedule, attempts, status, correlation ID and deduplication key. Workers use bounded exponential backoff with jitter, poison-message handling and dead-letter queue. Scheduled jobs must be safe if two workers run concurrently. Claim due jobs with database locking/leases or queue guarantees; handlers remain idempotent.

## 7. Event catalogue

Maintain `management/flows.csv` and domain docs with event name, producer, payload version, consumer, security scope, retention and failure behavior. Version events; do not silently change payload fields used by deployed consumers.
