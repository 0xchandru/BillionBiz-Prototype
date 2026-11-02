# Restricted Platform Operations and Support Access

## Actor and scope
Only authorized BillionBiz platform personnel use the operations console. This trust domain is separate from merchant administration.

## Main flow
1. Operator signs in through the privileged identity policy with strong MFA and separate privileged session.
2. Permission and case/incident scope are resolved server-side.
3. Operator searches platform/tenant health without exposing unnecessary merchant PII.
4. To inspect sensitive tenant context, operator submits a reason, scope and time limit; require approval for configured high-risk actions.
5. System shows a persistent support-access banner and records operator, tenant, actions, timestamps and correlation IDs.
6. Access expires automatically or can be revoked; all read/write actions remain auditable.
7. No silent impersonation. Any delegated session must be explicit, time-bound, consent/approval governed and visibly marked.

## Failure and security cases
Merchant credentials cannot reach the console; operators cannot exceed assigned scope; support access cannot persist after expiry; secrets and payment credentials are never shown; break-glass use is exceptional, alerted and reviewed.
