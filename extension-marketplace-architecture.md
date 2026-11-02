# Extensions Marketplace and Provider Lifecycle

## 1. Marketplace status model

- `AVAILABLE`: can be installed now with a complete tested setup flow.
- `COMING_SOON`: visible catalogue listing only; install disabled; no fake setup/success state.
- `DEPRECATED`: existing installations have a migration/removal path.

Razorpay and Shiprocket are the only initial marketplace candidates, and only after sandbox/provider readiness is verified. Email marketing, WhatsApp and Delhivery may appear as Coming soon. Core transactional email/in-app messaging is platform infrastructure, independent of the marketplace.

## 2. Categories

- Payments: Razorpay and future providers.
- Shipping/fulfilment: Shiprocket, Delhivery (Coming soon until delivered).
- Communication: email marketing and WhatsApp (Coming soon as merchant extensions); core transactional email remains separate.
- Marketing/analytics.
- Productivity/automation.
- Developer tools/webhooks.

Only show categories with catalogue content. Never manufacture extension counts, ratings or reviews.

## 3. Install lifecycle

`DISCOVERED → CONSENTED → CONFIGURING → CONNECTING → ACTIVE → DEGRADED → REAUTH_REQUIRED → DISCONNECTED → UNINSTALLED`.

State required permissions/data scopes before authorization. Keep credentials encrypted in managed secret storage; never send saved secrets to the browser. Validate provider account identity, test/live environment, webhook setup and required settings before marking active.

## 4. Operational requirements

Provider adapter/version boundary; least-privilege scopes; secure OAuth/API key handling and rotation; webhook signature verification/replay protection/idempotency; health/last-sync state; truthful connection tests; retry/dead-letter/reconciliation; uninstall impact preview; preservation of historical transactions; audit for install, grant, rotation, connect/disconnect and uninstall.

## 5. Launch gates

Razorpay: order creation, provider-side amount/currency checks, signature/webhook validation, idempotency, status reconciliation, refunds and sandbox evidence.

Shiprocket: authentication, pickup/warehouse mapping, serviceability/rates, shipment, AWB/label/tracking, supported cancellations/returns, COD and provider-failure reconciliation.

A mock provider adapter is not proof of live integration. Record sandbox and live evidence separately. Do not show ACTIVE without real verification and required event delivery.
