# Flow: Store and User Transactional Email

1. A committed identity/store/team/order/booking event writes an outbox record in the same database transaction.
2. Worker claims event and derives recipients from authorized domain records.
3. Notification orchestrator selects template, locale, tenant branding and required system content.
4. Provider adapter sends with an idempotency key.
5. Delivery attempt and provider message ID are persisted.
6. Provider webhook verifies signature and updates delivery/bounce/complaint status idempotently.
7. Merchant/admin sees status only within authorized scope; platform operations sees provider health.
8. Transient failures retry with backoff; permanent bounces/suppression are not retried repeatedly.

Required examples: verification, welcome, store-created, staff invite, password reset, security alert, order/payment/shipping, appointment confirmation/reminder/reschedule/cancellation and receipts.
