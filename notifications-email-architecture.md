# Transactional Email, Messaging and Notification Architecture

## 1. Core platform messaging is not an optional plugin

BillionBiz must deliver essential transactional emails from its own notification service. This is independent from a merchant-facing email marketing extension. Email marketing may be Coming soon in the marketplace, but store creation, account verification, invitations, receipts, bookings and order updates cannot depend on a future plugin.

## 2. Delivery architecture

Domain event → transactional outbox → notification orchestrator → template/localization renderer → provider adapter → delivery attempt record → provider webhook feedback → notification history.

- Business transaction commits first; message publication is durable through an outbox.
- Every send has a unique idempotency/deduplication key.
- Retry transient failures using bounded exponential backoff and jitter.
- Classify permanent bounce, complaint, suppression and invalid-recipient failures; do not retry indefinitely.
- Provider webhooks are authenticated and idempotent.
- Record provider message ID, template version, recipient reference, delivery status, timestamps, retry count and sanitized error.
- Do not log full message bodies, secrets or unnecessary personal data by default.
- Email outage must not roll back a completed store/order transaction.

## 3. Required transactional templates

### Identity/access
- Verify email; welcome/account created; password reset.
- New login/security alert and session change.
- MFA enrollment/recovery event.
- Staff/team invitation, expiry and acceptance.
- Role/access change and account suspension notice.

### Store lifecycle
- Store workspace created (include merchant-admin link and next setup actions).
- Store published/publication failed.
- Domain verification required/domain active/domain issue.
- Store ownership or critical setting change.

### Commerce/finance
- Order placed/confirmed.
- Payment pending/succeeded/failed according to provider truth.
- Shipment created/tracking update/delivery exception.
- Cancellation, return and refund status.
- Invoice/receipt availability.
- POS receipt by email only when requested or policy permits.

### Appointments
- Booking requested/confirmed.
- Deposit/payment required/received/failed.
- Reminder based on store timezone and policy.
- Reschedule/cancellation/no-show update.
- Staff assignment or schedule change.

### Platform operations
- Integration disconnected/reauthentication required.
- Webhook failure/reconciliation required.
- Security/permission alert to the appropriate authorized owner/admin.

## 4. Merchant settings

Merchants can manage allowed customer-facing templates, branding, language and notification preferences, preview test messages and inspect delivery status. Platform-required security/legal messages cannot be silently disabled. Do not allow untrusted raw HTML/scripts in email templates; sanitize or constrain the editor.

## 5. Email domain and deliverability

Use a transactional email provider behind an adapter. It must support verified sending domains, authenticated APIs/webhooks, bounce/complaint events, suppression management, logs and relevant privacy/region requirements. Configure SPF, DKIM and DMARC before production sending. Prefer a subdomain such as `notify.chandraprakash.codes` or `mail.chandraprakash.codes` for sender identity so root-domain mail policy is not accidentally overwritten. Exact DNS records come from the chosen provider and must not be invented.

Example sender `notifications@notify.chandraprakash.codes` is only valid after provider/domain verification. Do not assume root-domain email hosting exists.

## 6. Channels

- Email: required core platform channel.
- In-app notifications: required for merchant/staff with durable unread/read state.
- SMS: optional, provider-backed, consent-aware and subject to cost/regulation.
- WhatsApp: marketplace extension/Coming soon until provider, templates, consent and policy are implemented.
- Push: optional later capability.

## 7. Consent, privacy and preferences

Separate transactional and marketing messages. Marketing subscription requires consent capture and unsubscribe handling. Respect locale/timezone, quiet hours for non-critical reminders and retention rules. Avoid sensitive customer details in subject lines.

## 8. Monitoring

Track accepted, delivered, deferred, bounced, complained, suppressed, retried and permanently failed messages. Provide an internal queue dashboard and merchant-visible delivery history only within tenant scope. Alert on provider outage, queue lag, bounce spike, invalid credentials and webhook failures. Enqueue success is not proof of delivery.
