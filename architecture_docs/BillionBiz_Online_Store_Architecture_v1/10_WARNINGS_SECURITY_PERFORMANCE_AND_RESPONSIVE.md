# 10 — Setup Warnings, Security, Performance and Responsive Requirements

## 1. Actionable setup warning center

Show relevant warnings in Online Store → Overview and the applicable Settings group. Each warning includes severity, reason, affected feature, action and resolution state.

| Warning | Severity | Blocking? | Action |
|---|---|---|---|
| Platform wildcard subdomain not configured | Critical platform issue | Blocks public subdomain readiness | Platform operator fixes DNS/deployment; not merchant |
| Default store subdomain not resolving | Critical | Blocks public-ready status | Check host mapping/deployment domain |
| Custom domain not connected | Info/Warning | No; default host remains active | Connect domain wizard |
| Custom domain DNS unverified | Warning | Blocks custom primary domain | Show exact required records |
| SSL pending/failed | Warning/Critical | Blocks HTTPS activation on that host | Retry provider verification; keep default host |
| No published version | Critical | Blocks public storefront | Publish starter site |
| Store name missing | Warning | May block starter provisioning | Edit Brand |
| Logo/favicon missing | Info | No | Upload assets; use clean fallback |
| SEO title/meta missing | Warning | No | Edit global/page SEO |
| Required policy not reviewed | Warning | May block launch where mandatory | Open correct policy owner in Admin |
| No products/collections | Info for Commerce | No; show truthful empty state | Add in Catalogue |
| Payments not configured | Warning for Commerce | Blocks actual payment checkout, not preview | Admin → Settings → Payments |
| Shipping not configured | Warning when physical goods need it | Blocks applicable shipping options | Admin → Settings → Shipping |
| Tax configuration incomplete | Warning where applicable | Depends on tax/business rules | Admin → Settings → Taxes |
| Services/availability missing | Warning for Services mode | Blocks booking creation | Admin → Appointments |
| Public contact details not selected | Info/Warning | No | Select safe public fields from Admin business profile |
| Mobile overflow detected | Critical quality issue | Block publish if severe content loss | Fix template/theme/responsive issue |
| Broken navigation link | Warning | Block if system-critical; otherwise report clearly | Fix Navigation item |
| Missing meaningful image alt text | Warning | Block where required | Add alt text |
| Unknown/invalid template schema | Critical | Block publish | Repair/migrate template |

Do not label an optional custom domain as required when the platform subdomain works. Keep platform-operational warnings separate from merchant setup warnings.

## 2. Security

### Tenant isolation
- Enforce tenant context server-side from authenticated membership or trusted host/domain resolution.
- Never trust client-supplied tenant IDs.
- Test route IDs, preview tokens, media, navigation, theme and page APIs for cross-tenant access.

### Preview/editor
- Short-lived signed preview tokens scoped to store/tenant/user/revision.
- Validate iframe message origins and payload schemas if used.
- No draft access in public runtime without valid token.
- Sanitize rich text and URLs.
- No arbitrary script execution, `eval`, dynamic imports or raw React code from merchant content.

### Media/upload
- Enforce MIME/type/size/dimension limits.
- Sanitize SVG or disallow untrusted SVG until sanitizer exists.
- Malware scan where supported.
- Signed uploads/downloads; tenant-scoped object paths; prevent traversal.
- Preserve alt/focal metadata.

### Domains
- Verify custom domain ownership before activation.
- Prevent one custom domain from mapping to two stores.
- Validate DNS/provider callbacks.
- Protect against Host header poisoning and dangling-domain takeover.
- Canonicalize scheme/host safely.

### Permissions
- Read-only staff cannot publish/change domains unless granted.
- Audit publish, brand/domain changes and restore actions.
- Use existing RBAC; don't create a parallel permission engine.

### Application security
- CSRF protection for cookie-authenticated mutations.
- CSP and output encoding.
- Rate limits for publish, domain verification, uploads and forms.
- Contact/newsletter spam controls.
- Avoid SSRF when importing remote media.

## 3. Accessibility and visual quality

Target WCAG 2.2 AA where applicable; at minimum meet applicable WCAG 2.1 AA criteria. Require keyboard navigation, visible focus, semantic controls, accessible names, contrast, reduced-motion support, useful image alt text, field-associated errors and no color-only meaning. Animation must not flash/strobe or obscure important actions.

## 4. Customer storefront at 300px

Product requirement: customer storefront usable at **300 CSS px** minimum.

Test widths: 300, 320, 360, 375, 390, 430, 768, 1024, 1280 and 1440.

At 300px:
- Header collapses to accessible mobile nav; search/cart/account remain reachable.
- Logo scales without crushing controls.
- Main content reflows to one column where appropriate.
- Product grid becomes one column unless a compact two-column layout remains legible/tappable.
- Product detail stacks image and purchase controls; variant/quantity controls remain usable.
- Cart/checkout fields fit; labels/buttons are not clipped.
- Account tables become cards or controlled internal overflow.
- Dialogs fit viewport and scroll internally without hiding actions.
- Touch targets remain usable.
- No horizontal page overflow, overlapping controls, clipped text, sticky overlays blocking content or broken mobile image crop.
- Decorations do not reduce tap accuracy/readability.

WCAG 2.1 reflow uses 320 CSS px as an important reference; BillionBiz's requirement is stricter at 300px, so test both.

## 5. Performance budgets

Set and measure budgets against actual hosting/runtime:
- Avoid layout shifts from images/fonts/widgets; reserve image dimensions.
- Optimize LCP with responsive images, compressed assets and correct loading priority.
- Keep content pages lean; load cart/account/booking features only where required.
- Avoid loading a large section library on pages that do not need it.
- Use compositor-friendly animation; stop offscreen canvas work.
- Cache immutable page/theme config by tenant publication version.
- Never publicly cache private cart/account/checkout/booking data.
- Monitor LCP, INP, CLS, API latency, publish propagation and error rates without leaking PII.

## 6. Reliability

No blank screen for missing template/image/domain data. Every page has loading/error/empty states. Draft save and publish have retries. Use durable outbox for cache invalidation. Provisioning is idempotent. Migrations have rollback/forward-fix plans. Verify backups and restores.
