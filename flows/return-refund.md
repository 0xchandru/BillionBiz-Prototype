# FL-RETURN-001 — Return and Refund

- **Version:** 1.0
- **Actors:** Customer (request), Manager/Support (approval), Inventory, Finance, payment provider.
- **Preconditions:** Existing order; return/refund policy can be evaluated; user has permitted action.

## Main flow
1. User opens order and chooses Return items.
2. System displays eligible items, quantities and policy deadline.
3. User selects quantities and reason; optional images/notes are uploaded safely.
4. Backend validates eligibility and creates return request.
5. Authorized manager approves/rejects with reason.
6. Returned goods are received and inspected.
7. Staff selects disposition per item: restock, damaged, repair, dispose or other supported state.
8. Finance calculates maximum refundable amount based on original captured transactions and previous refunds.
9. User confirms refund tender/provider method.
10. Backend records refund intent and calls provider using idempotency key.
11. Provider result is verified/reconciled; refund state and ledger update.
12. Inventory movement is created only for items accepted back into sellable stock.
13. Customer and merchant receive status update; audit timeline records all steps.

## Alternate/failure paths
- Quantity exceeds eligible remaining quantity: reject.
- Refund would exceed captured amount: reject or require an explicit, approved credit workflow.
- Provider timeout: leave pending/reconciliation-required; do not mark refunded.
- Return received but item damaged: do not restock.
- Refund without physical return: only when policy and permission permit, with reason.

## Invariants
- Returned quantity <= purchased quantity - previously returned quantity.
- Refunded total <= eligible captured value - previously refunded amount.
- Restock movement only on approved disposition.
- Refund and return states are separate.

## Traceability
- Requirements: REQ-RET-001..009
- Tasks: T-020;T-021;T-024
- Tests: TC-RET-001..008
- Security: SEC-035..SEC-038
