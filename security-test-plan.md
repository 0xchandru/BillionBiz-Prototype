# Security Test Plan

## 1. Purpose and execution

This plan is mandatory for the platform's threat model. The security test definition register is `management/security-tests.csv`; append each execution and retest to `management/security-test-runs.csv`. Test in isolated staging environments using synthetic data and authorized tools only. Never test against third-party systems or production without explicit authorization and an agreed scope.

## 2. Security testing layers

- SAST, dependency/SBOM scan, secret scan and container/image scan in CI.
- API authorization and tenant isolation tests.
- Web application tests for XSS, CSRF, injection, SSRF and upload handling.
- Provider integration signature/replay/idempotency tests.
- POS device/session/offline tampering tests.
- Booking and inventory concurrency/abuse tests.
- WebSocket and cache isolation tests.
- Backup/restore and operational access tests.
- Manual review of sensitive flows and production configuration before release.

## 3. Mandatory security suites

### Identity and access
- Brute-force OTP, password and staff PIN attempts; lockout/rate-limit behavior.
- Session fixation, expiry, rotation and revocation.
- MFA bypass and recovery abuse.
- Role escalation, custom-role privilege escalation and owner transfer edge cases.
- IDOR across organization/store/location/resource scopes.
- Background worker authorization and revoked membership handling.

### Tenant isolation
- Substitute IDs in path/body/query and nested IDs.
- Cross-tenant foreign key attempts.
- Cache key collisions and search index filter bypass.
- Export/download signed URL access by another tenant.
- WebSocket subscription to another store's private channel.
- Preview token misuse and live/draft data leakage.

### Web application and content
- Stored/reflected/DOM XSS in product fields, page content, reviews, notes and intake responses.
- HTML/CSS injection and unsafe custom CSS/iframe behavior.
- CSRF on state-changing operations and CORS misconfiguration.
- SQL/NoSQL injection where relevant; parameterized query checks.
- SSRF in image import, webhook test, domain validation and URL preview.
- Malicious upload, MIME spoofing, oversized/decompression bomb and path traversal.
- CSV formula injection in exports.
- Host-header poisoning, cache poisoning and domain takeover.

### Financial and commerce
- Client price/discount/tax tampering.
- Duplicate checkout idempotency key and replay.
- Payment callback with invalid signature.
- Webhook invalid signature, duplicate event, replay, out-of-order and altered body.
- Refund over original capture and parallel refund race.
- Appointment deposit double-counting in POS.
- Inventory oversell race and unauthorized stock adjustment.
- Offline transaction modification, copied device lease and transaction replay.

### Appointments
- Same exclusive resource/time confirmed concurrently.
- Group capacity exceeded concurrently.
- Expired/foreign booking hold confirmation.
- Cross-resource reschedule race and reservation leak.
- Guest manage-booking token brute force, replay, overlong lifetime and unauthorized action.
- Timezone boundary/DST ambiguity abuse.

### Integrations and operations
- Razorpay secret exposure, raw-body HMAC verification and webhook event dedupe.
- Shiprocket credential leakage, cross-account provider reference access and duplicate shipment after timeout.
- Queue poison message, retry amplification and dead-letter access.
- Logs/traces/metrics leakage of credentials, PINs, card data or PII.
- Backup encryption, access control and restore verification.
- Supply-chain dependency compromise and vulnerable image/dependency policy.

## 4. Release blocking

P0: any cross-tenant data disclosure, unauthorized access to money/refunds, duplicate capture, systemic overbooking/oversell, secret exposure, unsafe domain takeover or irreversible data loss. P1: exploitable privilege escalation, persistent XSS affecting privileged users, webhook forgery, payment/shipping integrity failure or material session compromise. Lower severities require documented risk acceptance and owner.

## 5. Evidence

Record test ID, target build/commit, environment, authorized scope, tester, timestamp, steps, sanitized request/response, trace ID, result and remediation ticket in `security-test-runs.csv`. Keep the original failed run when recording a passing retest. Do not store live credentials, payment details or unnecessary personal data in evidence.


## V2 security additions

Run the new SEC-050 through SEC-073 checks for signup tenant isolation, OAuth protocol validation, reset enumeration, portal role escalation, Quick Find leakage, Staff Portal object scope, POS counter/device scope, assignment revocation, email webhook replay, notification privacy, Coming Soon install blocking, tenant-domain takeover, custom-domain proof, forwarded-host spoofing, analytics aggregate isolation, realtime channel authorization, settings permissions and secret masking. New records are NOT_RUN until evidence exists.
