# Flow: Public Signup and Automatic Store Workspace Provisioning

**Actors:** Visitor, Identity Service, Merchant Admin, Notification Service.

1. Visitor lands on the marketing site and selects Start free.
2. Visitor chooses email/password or Google OIDC.
3. Identity is created/validated, verification requirements are enforced and abuse controls run.
4. Visitor enters business/store display name and desired store slug.
5. System checks reserved words, slug uniqueness and policy.
6. In an idempotent transaction create organization, owner membership, store shell, default location, initial capability selection and onboarding record.
7. Persist a draft storefront host mapping only when host routing is available; do not claim public DNS/certificate is active before verification.
8. Enqueue welcome, account verification and store-workspace-created transactional messages.
9. Route to the new Merchant Admin workspace with checklist items derived from actual stored data.
10. Store remains private/draft until required setup is complete and the owner explicitly publishes.

**Failure rules:** retries must not create duplicate stores. If provisioning fails, identity must resume safely; show a recovery path and trace ID. Mail outage does not roll back store creation. Never expose another user's slug/email existence through validation.
