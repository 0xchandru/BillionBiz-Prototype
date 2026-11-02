# Flow: Counter Management and Dedicated POS Login

1. Owner/admin opens Merchant Admin → POS & Counters.
2. Create/select location and counter; configure register, receipt, tenders, devices and offline policy.
3. Assign active staff with explicit POS permissions and counter/location scope.
4. Staff opens `pos.chandraprakash.codes` and signs in individually.
5. Server shows only assigned counters; staff selects one and opens a register session.
6. POS revalidates session, staff membership, device and assignment; cashier UI opens in dedicated POS shell.
7. Sales, payment, inventory, receipt and register events use shared domain services and durable transaction IDs.
8. Staff closes register; cash counts, movements and variance are recorded. Authorized manager approves exceptions.
9. Admin can disable counter/device or revoke assignment; active sessions are rejected/refreshed.
