# Release Readiness and Production Checklist

## Before staging release
- [ ] Code review and ADR updates complete.
- [ ] Database migrations run on a clean DB and representative copy.
- [ ] Unit/integration/API/E2E suites pass.
- [ ] P0/P1 security tests pass or approved risk record exists.
- [ ] Tenant isolation tests pass.
- [ ] Concurrent payment, refund, booking, inventory and publish tests pass.
- [ ] Provider sandbox integration tests pass.
- [ ] Offline POS sync/recovery tests pass where feature enabled.
- [ ] Accessibility/responsive smoke tests pass.
- [ ] Monitoring dashboards and alerts are live.

## Before production cutover
- [ ] Backup complete and restore tested.
- [ ] Rollback version and routing procedure documented.
- [ ] Data migration counts/checksums approved.
- [ ] SiteStore canary validation complete.
- [ ] Domain/SSL/CDN checks pass.
- [ ] Payment and shipping credentials verified by authorized merchant/admin.
- [ ] Webhook signatures, callback URLs and provider event subscriptions verified.
- [ ] No secrets or test credentials in production bundle/logs.
- [ ] Support/on-call runbook and incident contact assigned.
- [ ] Human owner approval recorded for production migration/domain switch.

## After cutover
- [ ] Verify public storefront routes and editor preview.
- [ ] Verify product order, appointment booking and POS transaction if enabled using controlled test process.
- [ ] Verify provider webhook delivery and shipment tracking.
- [ ] Monitor error rate, latency, DB connections, queue lag and websocket connections.
- [ ] Confirm no requests/assets are served by SiteStore after observation window.
- [ ] Document incidents, rollback decision and final sign-off.


## V2 experience release checks
- Landing CTAs, signup provisioning, verification, recovery, Google OIDC and role-aware routing pass end-to-end.
- Merchant topbar/nav and all portal shells pass responsive/accessibility checks.
- Staff and POS permissions are server-enforced; cashier UI is separate from admin.
- Core transactional email has verified sender domain, SPF/DKIM/DMARC, retries, webhooks and delivery evidence.
- Host routing, tenant verification and TLS pass staging; production DNS cutover is separately authorized.
- Dashboard values match persisted tenant data; clean tenant shows real empty states; no production mock fallback.
- Brand tokens pass contrast checks; settings are functional/scoped/audited; Coming Soon extensions cannot be installed.
