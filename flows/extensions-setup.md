# FL-EXT-001 — Configure Razorpay and Shiprocket

- **Version:** 1.0
- **Actors:** Owner/Admin; Extension service; external provider.
- **Preconditions:** User has extension-management permission.

## Razorpay setup
1. Open Extensions -> Razorpay -> Connect.
2. Select Test or Live mode and review permissions/use cases.
3. Enter credentials over HTTPS in secure backend form.
4. Backend encrypts/stores credentials and performs test operation.
5. Configure webhook URL/subscriptions and verify signature handling.
6. Send sandbox test payment; backend verifies callback/webhook and shows event log.
7. Enable allowed payment methods. Live mode requires authorized business-owner action.

## Shiprocket setup
1. Open Extensions -> Shiprocket -> Connect.
2. Authenticate and verify provider account server-side.
3. Map BillionBiz locations to provider warehouses/pickup locations.
4. Configure packaging defaults and confirm product/variant shipping attributes.
5. Run serviceability/rate test.
6. Configure webhooks/tracking and test event processing.
7. Enable shipment creation for eligible physical orders.

## Failure paths
- Invalid credentials: store no connected state; return safe error.
- Webhook signature invalid: reject/quarantine; alert integration manager; never mutate order/payment.
- Provider timeout: preserve pending operation and reconcile before retry.
- Credential rotation: retain auditable previous reference only as needed; never log secret.
- Provider disconnected: block new provider actions and show current in-flight operation states.

## Invariants
- Credentials never appear in browser responses/logs.
- Test/live mode clearly distinguished.
- Webhook events are authenticated and deduplicated.
- Shipment and payment records are owned by the correct tenant/provider account.

## Traceability
- Requirements: REQ-EXT-001..010
- Tasks: T-022;T-023;T-024
- Tests: TC-EXT-001..008
- Security: SEC-025..SEC-034
