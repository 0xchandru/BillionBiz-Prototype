# Identity, Signup, Login and Account Lifecycle

## 1. Identity principles

- One canonical identity per human where possible; do not duplicate accounts for each portal.
- Authentication establishes identity; membership/authorization determines access in an organization, store, location, counter or resource.
- Merchant owners, staff, customers and internal platform operators are different principal contexts with different policies.
- Email possession is not strong MFA.
- Never trust a submitted role, tenant ID, counter ID or permission set.

## 2. Initial authentication methods

| Method | Launch decision | Notes |
|---|---|---|
| Email + password | Required | Strong password hashing, rate limiting, verification and secure session handling |
| Google OIDC | Recommended | Authorization Code + PKCE, strict redirect URI matching, state/nonce/issuer validation |
| TOTP MFA | Required for owner/admin policy | Recovery codes, re-authentication and audited enrollment/removal |
| Passkeys/WebAuthn | Preferred enhancement | Add as strong additional sign-in/MFA once base identity is stable |
| Phone OTP as primary login | Defer | SMS cost, SIM-swap and abuse risk; add only with proven need |
| Other social providers | Defer | Add only when analytics/support demonstrate demand |

Use an established OIDC-compatible identity provider or carefully audited framework integration; do not hand-roll OAuth. Hide provider-specific behavior behind an identity adapter.

## 3. Identity and membership states

Identity: `INVITED → PENDING_VERIFICATION → ACTIVE → SUSPENDED → CLOSED`.
Membership: `INVITED`, `ACTIVE`, `SUSPENDED`, `REMOVED`.

A customer record may exist without a login identity. Account linking must verify control of both identities and prevent customer-profile takeover.

## 4. Registration transaction

Registration has two resumable stages: (A) create/verify identity; (B) create organization, owner membership and first store shell in a single database transaction with an idempotency key. If provisioning is interrupted, resume safely without duplicate tenants/stores.

Normalize and reserve slugs. Reserve system names including `admin`, `api`, `pos`, `staff`, `accounts`, `www`, `stores`, `support` and `status`. Reject unsafe or confusing host labels. Store renames require collision checks, redirects and a cooldown policy.

## 5. Session and token model

- Prefer secure, HTTP-only, SameSite cookies for browser sessions; avoid long-lived bearer tokens in local storage.
- Use short-lived credentials and controlled session renewal.
- Rotate session identifiers after login, privilege changes and sensitive re-authentication.
- Revoke sessions on password reset, account suspension and required security events.
- Enforce CSRF defenses on cookie-authenticated state-changing requests.
- Use exact redirect URI allow-lists and validate state, nonce, issuer and PKCE.
- Separate platform-operator sessions from merchant/staff sessions; require stronger MFA and auditing internally.

## 6. Membership authorization context

The server builds context containing verified `user_id`, `organization_id`, `store_id`, `location_id`, membership status, effective permissions, staff/resource/counter assignments, session and risk metadata. All tenant-owned queries, jobs and realtime subscriptions use the same scoping rules.

## 7. Account portal behavior

Provide workspace switcher, profile, verified email, password, MFA/passkeys, sessions, preferences and security activity. Customer account management is store-scoped and cannot access merchant administration. Staff cannot elevate to owner/admin without an explicitly authorized role change and audit.

## 8. Standards references

Use IETF RFC 9700 for OAuth 2.0 security best practice, OWASP Email Validation and Verification guidance for verification/reset/anti-enumeration, and NIST SP 800-63B-4 as an identity assurance reference. Map controls to the selected identity provider and threat model.

- https://www.rfc-editor.org/rfc/rfc9700.html
- https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html
- https://www.nist.gov/publications/nist-sp-800-63b-4digital-identity-guidelines-authentication-and-authenticator
