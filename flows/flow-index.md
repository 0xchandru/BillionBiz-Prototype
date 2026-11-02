# Workflow Index

| Flow ID | Flow | Main actor | Domain | Spec |
|---|---|---|---|---|
| FL-ONBOARD-001 | Merchant onboarding and capability selection | Owner | Tenancy/Storefront | `merchant-onboarding.md` |
| FL-STORE-001 | Template preview, apply, draft, publish and restore | Owner/Admin | Storefront | `store-template-publish.md` |
| FL-CAT-001 | Product creation and variant publishing | Catalog manager | Catalog | `product-create.md` |
| FL-ORDER-001 | Order fulfillment and Shiprocket shipment | Fulfillment staff | Orders/Extensions | `order-shipment.md` |
| FL-RETURN-001 | Return and refund | Manager/Support | Orders/Finance | `return-refund.md` |
| FL-BOOK-001 | Appointment booking and concurrency | Customer/Staff | Appointments | `appointment-booking.md` |
| FL-POS-001 | POS checkout, register and offline recovery | Cashier/Manager | POS/Finance | `pos-checkout-offline.md` |
| FL-TEAM-001 | Invite staff and assign scoped roles | Owner/Admin | Team | `team-invite-role.md` |
| FL-EXT-001 | Connect Razorpay and Shiprocket | Owner/Admin | Extensions | `extensions-setup.md` |
| FL-CAP-001 | Enable/disable store capabilities | Owner | Tenancy/Storefront | `capability-change-settings.md` |
| FL-MODE-001 | Switch storefront mode (Commerce, Services, Both) | Owner | Storefront | `storefront-mode-change.md` |
| FL-QUAL-001 | Quality, security, performance and release gate | QA/Security/SRE | Cross-cutting | `quality-release-gate.md` |

When a workflow changes, update this index, the relevant requirement, task and test traceability.


## V2 platform experience flows
- `public-signup-and-store-provisioning.md` — account and first-store provisioning.
- `role-aware-login-and-portal-routing.md` — portal resolution.
- `password-recovery-and-mfa.md` — recovery and strong authentication.
- `team-invitation-and-staff-activation.md` — invitation-only staff onboarding.
- `counter-management-and-pos-access.md` — resource admin and separate cashier portal.
- `store-and-user-transactional-email.md` — core lifecycle email.
- `custom-domain-activation.md` — host verification and TLS.
- `extensions-marketplace-lifecycle.md` — available versus Coming Soon states.
- `realtime-dashboard-and-clean-tenant.md` — real-data dashboards and freshness.

- `customer-account-lifecycle.md` — store-scoped customer accounts and secure guest record claims.
- `platform-operations-support-access.md` — privileged internal support access and audit.
- `cross-portal-realtime-consistency.md` — committed state propagation across admin/staff/POS/customer portals.
