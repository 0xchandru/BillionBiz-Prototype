# FL-POS-001 — POS Checkout, Register and Offline Recovery

- **Version:** 1.0
- **Actors:** Cashier; POS PWA; Order/Inventory/Finance services; Manager.
- **Preconditions:** Approved device and counter; active staff session; correct location.

## Online checkout
1. Cashier signs in with permitted PIN/identity and selects assigned counter.
2. Cashier starts a new cart and adds product variants by barcode/search/quick keys.
3. Cashier attaches customer if needed and applies permitted discount/reason.
4. POS sends cart/version to server for authoritative price, tax, stock and policy validation.
5. Cashier selects cash/card/UPI/split tender available for this store/device.
6. Backend creates payment attempt for provider methods or records permitted cash tender.
7. Provider payment is verified server-side; browser success alone is not authoritative.
8. Backend commits order, lines, inventory movements/reservations, payment transactions, register movements and outbox events atomically where internal state allows.
9. POS displays receipt with committed server order reference and offers print/share.

## Offline checkout
1. Device was previously approved and prepared online; local catalog and lease are valid.
2. Connection drops; POS clearly displays Offline mode.
3. Cashier creates a new offline cart; drafts started online are not silently reused unless explicit merge support exists.
4. Only supported offline tenders (initially cash) are allowed.
5. Device stores transaction in protected IndexedDB with stable client transaction ID and provisional receipt.
6. UI shows pending-sync count/value and does not claim server acceptance.
7. On reconnect, client uploads pending records idempotently.
8. Server validates device, lease, catalog/policy constraints and deduplicates.
9. Server returns accepted/duplicate/held/rejected result per bill.
10. Accepted records update order, inventory, finance and register; conflicts enter owner review.
11. Client retains unacknowledged records and allows safe retry.

## Failure paths
- Lease expired/cap reached: block offline selling and explain reconnect/preparation required.
- UPI/card while offline: block; do not queue as paid.
- Upload timeout: retry with same client transaction ID.
- Duplicate upload: return prior result; no duplicate order/payment/stock movement.
- Stock conflict: record/flag reconciliation; do not last-write-wins inventory.

## Invariants
- One effective order per offline transaction ID.
- No offline provider payment marked captured.
- Cash drawer and sale totals reconcile by register session.
- Staff permissions enforced online and on locally available action scope.

## Traceability
- Requirements: REQ-POS-001..020
- Tasks: T-029;T-030;T-031;T-032;T-033;T-034
- Tests: TC-POS-001..015
- Security: SEC-036..SEC-042
