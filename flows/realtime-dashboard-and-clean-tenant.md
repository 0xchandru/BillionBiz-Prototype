# Flow: Real Dashboard Data and New-Tenant Empty State

1. User opens Dashboard with authenticated tenant/store/location context.
2. Server checks permissions and queries authorized read models using selected period/timezone.
3. Every metric uses a documented definition and returns value, currency/period, updated-at and freshness state.
4. New store with no activity displays real zero and setup guidance, not sample values.
5. Domain events update read models through outbox/workers and notify authenticated clients.
6. Client refetches authoritative data and marks last-updated time.
7. If API/read-model/realtime fails, UI shows error/stale state and retry; it never silently substitutes mock values.
