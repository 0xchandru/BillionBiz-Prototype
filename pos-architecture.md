# Point of Sale / Counter Architecture

## 1. Operating model

POS is a dedicated installable PWA for cashiers/managers, connected to the same commerce backend as storefront orders and appointments. Preserve the existing concepts of counter/register, physical device and staff seat as distinct concepts.

## 2. POS navigation

- Sell / New sale
- Orders (open, held, today/history)
- Customers
- Products / quick search
- Register / cash movements / close
- Restaurant (only when enabled): tables, takeaway, KOT, kitchen rail, QR orders
- Appointments today (only when enabled and role permits)
- Device / connection / sync status

## 3. Device and staff security

- Device is registered/approved and bound to an organization/store/location/counter.
- Cashier signs in with a secure PIN or supported identity flow.
- PIN is hashed with a modern password hashing algorithm and rate-limited; never store plaintext.
- Staff role and current location/counter scope are checked on every command.
- Staff can lock/switch users; idle lock and session revocation are supported.
- Distinguish device, register, counter and staff-seat limits in both UX and data model.

## 4. Sale workflow

1. Start a sale and load active catalog/prices/tax policy.
2. Add variant/service lines using barcode, search or quick keys.
3. Attach customer if needed.
4. Apply permitted discounts with reason/approval.
5. Validate stock and price at server checkout; show conflicts before payment.
6. Select tender and create payment attempt.
7. Verify gateway or record permitted manual/cash tender.
8. Commit order, payment, inventory movements and register movement atomically where internal transaction semantics allow.
9. Issue receipt/invoice and emit outbox events.

Held carts are drafts, not paid orders. Resume must revalidate price, tax, stock and permission; explain changes to cashier before checkout.

## 5. Payment methods

Cash, supported UPI/card provider flows, manual UPI reconciliation and split tenders are configured per store/provider. A browser return URL is not proof of payment. Offline mode rejects payment modes that cannot be safely confirmed offline. Split payment must have individual tender records and a single order balance invariant.

## 6. Register and cash drawer

Register sessions are tied to a counter/location. Record opening float, cash sales, cash refunds, cash in/out, handovers, counts, expected balance and close. Cash variance requires reason and audit. X report is an in-progress snapshot; Z report is a closed-session summary. A cashier handover is recorded explicitly; do not silently assign drawer cash to another user.

## 7. Returns, voids and refunds

Separate sale undo (short-lived, if supported), void, item return and refund operations. Permissions and approval thresholds are backend-enforced. Refund amounts and quantities cannot exceed eligible captured value/line quantity. Restock disposition is explicit. All changes create financial and inventory records.

## 8. Restaurant vertical capability

Retain existing table, dine-in, takeaway, kitchen station/KOT, kitchen acknowledgement and QR ordering workflows where they are in scope. Kitchen ticket state is not the same as payment state. A failed kitchen delivery must not cause duplicate KOT sends; provide a controlled acknowledge/resolve action and audit. Restaurant screens appear only when the store has the capability enabled.

## 9. Offline mode

Initial safe offline scope: prepared catalog + cash-only POS transactions with per-device authorization lease, durable encrypted IndexedDB queue, stable client-generated transaction ID, local receipt/provisional status and clear pending-sync indicator. Do not represent offline sales as server-synchronized before confirmation.

On reconnect:
- Upload batches using idempotent client transaction IDs.
- Server deduplicates, validates lease and limits, and commits each transaction exactly once.
- Show accepted/rejected/held result per bill.
- Reconcile current stock and flag conflicts for owner review; never overwrite inventory balances by last-write-wins.
- Expired leases, invalid signatures, exhausted caps and catalog version mismatch must fail safely.

The old guide's offline limits (cash-only, prepared browser/device and bounded usage) are existing behavior to review, not necessarily the final commercial policy. Make limits configurable and testable; do not silently preserve arbitrary limits without product approval.
