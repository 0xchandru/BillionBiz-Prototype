# FL-TEAM-001 — Invite Staff and Assign Scoped Roles

- **Version:** 1.0
- **Actors:** Owner/Admin; invited staff user.
- **Preconditions:** Store exists; inviter can manage team.

## Main flow
1. Owner opens Team -> Invite member.
2. Enters email/phone and selects store/location scope.
3. Selects default role or creates a custom role from explicit permission list.
4. Backend checks inviter may grant every selected permission (no privilege escalation).
5. Backend creates pending membership/invitation and sends secure expiring invite.
6. Staff accepts invite, authenticates or creates user identity, and joins the existing organization/store membership.
7. Owner links staff profile to person resource if appointment capability is enabled.
8. Owner assigns counter/device access separately if POS role permits.
9. Audit event records invitation, acceptance, scope and role.

## Alternate paths
- Existing user: link existing identity; do not create duplicate login.
- Expired/revoked invite: reject and allow authorized resend.
- Last owner removal or owner transfer: require elevated confirmation and safe handover.
- Invalid custom role: reject permissions inviter cannot grant.
- Staff deactivated: revoke sessions and access; preserve historical orders/bookings/audit.

## Invariants
- Identity differs from staff profile and resource.
- Permissions cannot be escalated by client payload.
- All location/resource access is scoped.
- Deactivation does not delete historical financial or booking records.

## Traceability
- Requirements: REQ-TEAM-001..012
- Tasks: T-010..T-019
- Tests: TC-TEAM-001..008
- Security: SEC-001..SEC-009
