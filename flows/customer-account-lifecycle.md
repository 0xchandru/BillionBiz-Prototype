# Customer Account and Verified Record Claims

## Actor and scope
A customer operates only within the storefront/store context to which the record belongs. Customer login is separate in policy from merchant/staff membership even if one identity can hold multiple memberships.

## Main flow
1. Customer opens the relevant store account entry from that storefront.
2. Authenticate using the store-supported customer account flow or create an identity after verifying email/phone per policy.
3. Resolve the customer profile for this exact store; do not expose other stores by matching email alone.
4. Display owned orders, shipment status, bookings, receipts/invoices and profile details from persisted data.
5. Allow reschedule/cancel only when booking policy, timing and permissions allow.
6. Guest order/booking claim requires a cryptographically secure, single-use, expiring claim token delivered to the original verified channel.
7. Record account linking, profile changes and sensitive actions in audit history.

## Failure and security cases
Expired/replayed/wrong-recipient claims fail; customer A cannot enumerate customer B; a customer can never self-upgrade to merchant/staff membership; deleted/suspended identities follow documented retention and restore rules.
