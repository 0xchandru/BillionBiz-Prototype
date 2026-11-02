# Flow: Extension Marketplace Lifecycle

1. Merchant opens Extensions → App marketplace.
2. Catalog shows truthful status; only verified launch connectors are installable.
3. Merchant opens Razorpay or Shiprocket and reviews requested permissions, fees/limitations and supported events.
4. Merchant authorizes/configures credentials with secure server-side handling.
5. System verifies provider identity, test/live environment, webhooks and required settings.
6. Extension becomes ACTIVE only after real verification; otherwise remains CONFIGURING/DEGRADED with diagnostics.
7. Event logs, sync status, retries, reauthorization and disconnect are available.
8. Coming Soon listings cannot be installed and never display fake connected states.
