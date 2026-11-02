# Extensions Architecture — Razorpay and Shiprocket

## 1. Extensions framework

An extension is an integration connection with manifest, scopes, configuration schema, credential reference, health, events, capabilities and operational logs. Provider-specific logic belongs behind a typed adapter; shared order/payment/shipment domains own the business record.

Required extension UI:
- Browse/available integrations (if marketplace exists).
- Installed/connected integrations.
- Connect/setup wizard.
- Test connection.
- Capability and permission disclosure.
- Credential rotation/reconnect/disconnect.
- Webhook status and event history.
- Recent operations and errors.
- Retry/reconcile controls where safe.

Never display stored secrets after save. Store encrypted credentials in a secret manager or encrypted database column with key management; avoid logs, analytics and frontend payloads containing secrets.

## 2. Razorpay integration

### Setup flow
1. Select Razorpay extension.
2. Explain supported use cases: online checkout, payment links (if supported), refunds and reconciliation.
3. Merchant enters test or live Key ID/Secret through secure form.
4. Backend stores secrets securely and performs a test operation.
5. Register/verify webhook endpoint and subscribed event types.
6. Test signature validation and event receipt.
7. Show connection health and mode clearly (Test/Live).
8. Enable selected payment methods only after verification.

### Runtime behavior
- Create provider order/payment server-side using backend-calculated amount/currency/reference.
- Never trust a client-supplied paid flag or amount.
- Verify checkout callback signatures server-side.
- Verify webhook HMAC against the original raw request body using the configured webhook secret. Preserve raw body before JSON parsing.
- Deduplicate webhook events by provider event ID; store durable inbox payload/reference and processing status.
- Handle duplicate, retry, delayed and out-of-order deliveries.
- Reconcile stale pending attempts by querying provider status.
- Verify refund API outcome before marking refund complete.
- Rotate keys and webhook secret without interrupting valid in-flight reconciliation.

Security references: Razorpay security guidance requires protecting API keys, HTTPS, backend verification, callback/webhook signature checks and secure use of captured-payment state. Verify the provider's current API/version documentation during implementation.

## 3. Shiprocket integration

### Setup flow
1. Select Shiprocket extension.
2. Merchant authenticates using supported provider method/credentials.
3. Verify account/connection from backend.
4. Configure pickup/warehouse locations and map them to BillionBiz locations.
5. Confirm default package dimensions/weight and shipping preferences.
6. Test serviceability/rate lookup for sample destination and parcel.
7. Configure shipping label/manifest/pickup operations and webhook/tracking callbacks.
8. Enable provider for eligible physical products/order locations.

### Product integration
- Product/variant supports weight, dimensions, shipping-required flag and package class.
- Missing parcel data must be flagged before booking a shipment; don't invent values silently.
- Bundle parcel data must be calculated or explicitly configured.
- Appointment/service-only orders must not be offered a Shiprocket label.

### Order integration
- Only unfulfilled physical order quantities are eligible for shipment.
- Support partial fulfillment, multiple packages and multiple shipments where supported.
- Send authoritative ship-from, ship-to, line item, quantity, value, weight and dimensions.
- Save provider shipment ID, AWB, tracking reference, label, manifest and pickup information.
- Provider status events are normalized into BillionBiz shipment statuses while retaining the original provider status and raw reference.
- Handle NDR, RTO, delivery exceptions, cancellation and return-to-origin as explicit workflows.
- Never create a second shipment after an ambiguous timeout until existing provider shipment state is queried/reconciled.

## 4. Webhook and provider resilience

Use a shared provider webhook inbox with signature verification, event ID dedupe, tenant/provider account mapping, processing state, retry policy, dead-letter state and audit. Provider webhooks must not trust tenant IDs supplied in unsigned payload fields; resolve ownership from authenticated provider connection and stored provider references.

## 5. Operational safety

- Separate test and live credentials.
- No secrets in source control, client bundles or logs.
- Least-privilege provider permissions where available.
- Rate-limit provider calls and respect quotas.
- Use idempotency keys for operations where provider supports them.
- Add timeouts, bounded retries with backoff and circuit breakers.
- Reconcile stale/missing events.
- Show connection health and last successful sync.
- Document provider API version and required webhook subscriptions.
