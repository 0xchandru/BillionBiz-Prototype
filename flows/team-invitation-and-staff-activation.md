# Flow: Team Invitation and Staff Activation

1. Authorized owner/admin selects Team → Members → Invite.
2. Admin chooses role, store/location scope and appointment/resource or POS/counter assignments.
3. Backend validates inviter authority and creates a single-use expiring invitation.
4. Notification service sends invitation link; token is never logged in plaintext.
5. Invitee accepts, authenticates or creates identity, verifies email and establishes required MFA.
6. Membership/assignments activate; staff portal entry becomes available.
7. Audit records inviter, invitee, role, scope, assignments and acceptance.
8. Owner/admin can change/revoke access; sessions and realtime subscriptions are invalidated promptly.
