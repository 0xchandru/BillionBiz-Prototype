# Flow: Password Recovery and MFA

1. User requests password reset from the correct portal.
2. Respond with generic wording that does not reveal account existence.
3. If eligible, send a cryptographically random single-use token with short expiry.
4. User redeems token; backend validates and rate-limits, updates password and revokes relevant sessions.
5. Notify user of the security change.
6. Owner/admin enrolls TOTP and/or passkey; recovery codes are displayed once and stored only as hashes.
7. Sensitive actions require recent authentication/MFA; enrollment, removal and recovery are audited.
