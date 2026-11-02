# Shared Team, Identity and Permissions Architecture

## 1. Separate identity from business role

- `user`: a login identity.
- `staff_profile`: business-specific employee record and profile metadata.
- `organization_membership`: relationship between user and organization.
- `store_membership` / `location_assignment`: narrower scopes.
- `role`: named collection of permissions, system or custom.
- `role_assignment`: binds a user/membership to a role and scope.
- `resource`: person, room, chair, machine or equipment that can be scheduled.
- `staff_resource_link`: connects a person resource to a staff profile.
- `device_access`: approved POS/browser/device assignment.

A person can have one login and multiple capabilities: cashier, manager, service provider, stock manager, etc. Do not create duplicate user identities for POS and appointments.

## 2. Permission model

Use RBAC with scoped grants and optional attribute/context checks. Example permission IDs:

- `dashboard.view`
- `orders.view`, `orders.create`, `orders.edit`, `orders.cancel`
- `fulfillment.create`, `shipment.create`, `shipment.cancel`
- `returns.approve`, `refund.issue`
- `catalog.product.create`, `catalog.product.edit`, `catalog.inventory.adjust`
- `store.page.edit`, `store.publish`, `store.domain.manage`
- `appointments.booking.view`, `.create`, `.cancel`, `.reschedule`, `.check_in`, `.complete`
- `appointments.offering.manage`, `appointments.resource.manage`, `appointments.settings.manage`
- `pos.sale.create`, `pos.discount.apply`, `pos.refund`, `pos.register.open`, `pos.register.close`
- `team.member.invite`, `team.role.assign`, `team.shift.manage`
- `payments.view`, `payments.reconcile`, `reports.financial.view`, `settings.manage`, `extensions.manage`

Permissions are checked in API command handlers and background jobs. UI visibility is a convenience only.

## 3. Scope hierarchy

Organization -> Store -> Location -> Assigned resource/record. A role may be organization-wide, store-specific, location-specific or assigned-resource-only. Resolve scope from authenticated membership, not caller-supplied scope fields alone.

## 4. Default role templates

Provide starter roles (Owner, Admin, Manager, Cashier, Appointment Coordinator, Service Provider, Fulfillment Staff, Catalog Manager, Accountant, Read-only Analyst) that merchants can customize. Owner transfer and last-owner removal require guarded flows. Custom roles must not grant platform-operator permissions.

## 5. Team features

Invite/resend/revoke; activate/deactivate; staff profile; location assignment; role assignment; staff PIN; device sessions; schedules and availability; leave; internal notes; activity audit; team calendar. Attendance/payroll should be represented only as future extension points unless separately scoped.

## 6. Auditing

Log role creation/change, access grant/revocation, staff invitation, PIN reset, device approval/revocation, high-value actions and access to sensitive settings. Audit records include actor, action, scoped resource, timestamp, request/correlation ID and before/after summary without secrets or full payment credentials.
