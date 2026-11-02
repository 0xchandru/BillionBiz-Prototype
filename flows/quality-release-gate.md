# FL-QUAL-001 — Quality, Security, Performance and Release Gate

- **Version:** 1.0
- **Goal:** Prevent release of a platform build that has unresolved critical functional, security, concurrency, accessibility, performance or recovery failures.
- **Actors:** Engineering, QA, Security, SRE, Release Manager and authorized product owner.
- **Scope:** Cross-cutting quality gate for all domains; this flow is not a substitute for domain-specific workflows.

## Preconditions
- Release candidate is identified by immutable commit/build ID.
- Required environments and synthetic test tenants exist.
- Functional, integration, concurrency and security test registers are current.
- Production credentials and destructive production operations are not used in ordinary test runs.

## Main flow
1. Freeze the release candidate and capture branch, commit, build and migration versions.
2. Resolve the applicable test set from changed requirements, domains and dependencies; run unit, contract, integration, E2E, concurrency and regression tests.
3. Run the security suite in authorized staging, including tenant isolation, access control, payment/webhook integrity, provider isolation, upload/content security, realtime channels, offline queue and operational access.
4. Run load, soak, failure-injection, backup/restore, timezone, accessibility, responsive and browser/PWA suites.
5. Store every result in `management/test-runs.csv` or `management/security-test-runs.csv`; update the master test definition status without deleting prior execution records.
6. Create/maintain defects for failures and link evidence, commits, requirement IDs, flow IDs and test IDs.
7. The release evaluator blocks on unresolved P0/P1 defects and missing mandatory evidence, unless an authorized documented risk acceptance applies to a specific non-prohibited risk.
8. Verify deployment/rollback readiness, migration compatibility, provider health and post-deploy smoke tests.
9. An authorized release owner approves production cutover. The rollout is monitored and can be rolled back using the documented process.

## Failure and recovery paths
- Test runner/environment unavailable: mark affected cases `BLOCKED`, capture owner and unblock action; do not mark as passed.
- Flaky test: retain execution history, investigate and quarantine only through approved policy; do not silently delete or skip it.
- P0/P1 defect: stop the affected release gate, create/triage defect and continue unrelated safe engineering work.
- Backup restore fails: release is blocked until a successful restore drill is demonstrated.
- Live provider credentials, DNS or destructive data migration need human approval; the agent can continue sandbox and unrelated work while approval is pending.

## Invariants
- A test definition and an execution record are different records.
- A later passing retest never deletes the original failure evidence.
- No status is `PASS` without build, environment, timestamp and evidence.
- No production action is performed by implication from this flow.
- A release gate cannot be satisfied by mock integrations or frontend-only screens.

## Traceability
- Requirements: `REQ-QUAL-001`;`REQ-QUAL-002`;`REQ-QUAL-003`;`REQ-QUAL-004`;`REQ-QUAL-005`;`REQ-QUAL-006`;`REQ-QUAL-007`;`REQ-QUAL-008`;`REQ-QUAL-009`;`REQ-QUAL-010`;`REQ-QUAL-011`;`REQ-QUAL-012`;`REQ-REL-001`;`REQ-REL-002`;`REQ-REL-003`;`REQ-REL-004`;`REQ-REL-005`;`REQ-REL-006`
- Tasks: `T-038`; `T-039`; `T-040`.
- Tests: `TC-QUAL-001`;`TC-QUAL-002`;`TC-QUAL-003`;`TC-QUAL-004`;`TC-QUAL-005`;`TC-QUAL-006`;`TC-QUAL-007`;`TC-QUAL-008`;`TC-QUAL-009`;`TC-QUAL-010`;`TC-QUAL-011`;`TC-QUAL-012`;`TC-REL-001`;`TC-REL-002`
- Security: `SEC-001`;`SEC-002`;`SEC-003`;`SEC-004`;`SEC-005`;`SEC-006`;`SEC-007`;`SEC-008`;`SEC-009`;`SEC-010`;`SEC-011`;`SEC-012`;`SEC-013`;`SEC-014`;`SEC-015`;`SEC-016`;`SEC-017`;`SEC-018`;`SEC-019`;`SEC-020`;`SEC-021`;`SEC-022`;`SEC-023`;`SEC-024`;`SEC-025`;`SEC-026`;`SEC-027`;`SEC-028`;`SEC-029`;`SEC-030`;`SEC-031`;`SEC-032`;`SEC-033`;`SEC-034`;`SEC-035`;`SEC-036`;`SEC-037`;`SEC-038`;`SEC-039`;`SEC-040`;`SEC-041`;`SEC-042`;`SEC-043`;`SEC-044`;`SEC-045`;`SEC-046`;`SEC-047`;`SEC-048`;`SEC-049`
