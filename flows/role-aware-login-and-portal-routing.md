# Flow: Role-Aware Login and Portal Routing

1. User opens Merchant Admin, Staff Portal, POS or a customer account entry point.
2. Request redirects to configured identity entry with an allow-listed return path.
3. User authenticates; MFA/step-up applies by role and risk policy.
4. Server resolves identity, memberships, tenant, store/location scopes, roles, counter/resource assignments and account status.
5. One permitted destination routes directly; multiple memberships prompt workspace selection.
6. Staff-only users go to Staff Portal; cashier-only users see assigned counters/POS; customers return to their originating storefront account; merchants go to Merchant Admin.
7. All subsequent APIs and realtime subscriptions repeat authorization; changing a frontend route cannot elevate access.
8. Logout revokes the relevant session and redirects to a safe public page.

**Failure rules:** no membership → safe access-denied/onboarding screen; suspended account → no access; expired invitation → request a new invitation; invalid return URL → default portal home.
