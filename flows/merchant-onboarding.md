# FL-ONBOARD-001 — Merchant Onboarding and Capability Selection

- **Version:** 1.0
- **Goal:** Create a working store with only relevant business modules enabled.
- **Actors:** Owner; platform onboarding service.
- **Preconditions:** Authenticated user; organization creation permitted.

## Main flow
1. Owner creates organization and enters legal/business name and primary contact.
2. Owner creates first store and selects country, currency, locale and IANA timezone.
3. Owner selects one or both initial capabilities: Products, Appointments.
4. Backend validates plan/entitlement and persists store capability set.
5. Owner chooses Storefront Mode: Commerce, Services or Both from the modes supported by the enabled capabilities. Set the home page (Landing or Booking) separately.
6. Store Editor launches with a capability-aware checklist and compatible templates.
7. Owner chooses a template or skips; preview is read-only.
8. Owner enters branding and navigation.
9. For product commerce: add first product/category and configure inventory/shipping/tax as applicable.
10. For appointments: create service, assign eligible staff/resources and configure working hours/policies.
11. Owner previews enabled customer journeys on desktop/mobile.
12. Owner configures payment/shipping extensions as needed.
13. Owner connects domain and publishes the native store release.

## Alternate/failure paths
- If plan does not allow a capability, explain the required plan and preserve the current setup; do not silently enable it.
- If user skips template/setup, allow saving a draft and resuming later.
- If appointment capability enabled but no service/resource/shift exists, show actionable setup warnings; do not display unavailable time slots as though the engine is broken.
- If only appointments enabled, do not require products, categories, stock or shipping setup.
- If only products enabled, do not require services, staff availability or booking rules.
- Failed publishing leaves prior live release unchanged.

## Security and data invariants
- Owner membership is created atomically with organization/store creation.
- All resources created are scoped to the new tenant.
- Capability changes are audited and permission checked.
- Draft template application does not publish automatically.

## Acceptance
- Product-only, appointment-only and hybrid paths all reach a valid setup state.
- No irrelevant required steps are imposed.
- Setup checklist reflects real persisted configuration.
- Store published version serves only enabled routes.

## Traceability
- Requirements: REQ-ONB-001..006;REQ-CAP-001..004
- Tasks: T-001..T-006
- Tests: TC-ONB-001..006;TC-CAP-001;TC-CAP-002;TC-TEN-001
- Security: SEC-001;SEC-002;SEC-003
