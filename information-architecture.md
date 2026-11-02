# BillionBiz Admin Information Architecture and Interaction Design — V2

## 1. Experience shells

| Shell | Host / entry | Users | Purpose |
|---|---|---|---|
| Marketing | `chandraprakash.codes` | Visitors | Product discovery, Start free, Log in |
| Merchant Admin | `admin.chandraprakash.codes` | Owner, manager, authorized operator | Configure and operate business/store |
| Staff Portal | `staff.chandraprakash.codes` | Service providers and assigned staff | Personal schedule and assigned work |
| Counter/POS | `pos.chandraprakash.codes` | Assigned cashiers | Fast billing, register and receipts |
| Storefronts | `{store}.stores.chandraprakash.codes` or verified custom domain | Customers | Shop, book and customer account |
| API | `api.chandraprakash.codes` | Authorized clients/services | Versioned application APIs |
| Platform Operations | Restricted internal host/path | BillionBiz operators | Platform/tenant/support control plane |

These hosts are proposed targets, not live DNS proof. See `domains-routing-architecture.md`.

## 2. Merchant Admin global shell

### Top bar
1. BillionBiz logo at far left; click returns to selected store's admin home.
2. Workspace/store selector near the logo when the user has multiple workspaces.
3. Global **Quick Find** search/command bar in the center; `Ctrl+K` / `Cmd+K` shortcut.
4. Optional Help/Support entry.
5. Notification bell with unread count from real notification records.
6. User avatar/profile menu: profile, security, preferences, switch workspace and sign out.

Keep the header consistent across admin modules. Store Editor may have a focused toolbar but must preserve brand and safe navigation back to admin.

### Expandable left navigation

Use a Shopify-style expandable/collapsible left navigation. Primary groups open nested links; do not render a flat row of links.

- Expand/collapse groups with keyboard and screen-reader support.
- Active route and active parent must be obvious.
- Persist expansion preference per user/device where useful.
- Collapsed rail uses recognizable icons with accessible tooltips.
- Capability- and permission-aware visibility; never render a dead link as an action.
- Badges/counts come from live authorized server queries; hide zero counts unless zero is meaningful.
- Mobile uses an accessible drawer with the same hierarchy.

### Navigation tree

**Home**
- Overview
- Activity / alerts (only when backed by durable activity data)

**Orders**
- All orders
- Draft orders / quotes (only if the actual workflow is implemented and enabled)
- Fulfillment & shipments
- Returns
- Refunds
- Payment exceptions / reconciliation

**Appointments** — show only when appointment capability and permission are enabled
- Calendar
- All bookings
- New booking
- Offerings
- Availability & working hours
- Staff & resources
- Blocked time / time off
- Booking policies
- Booking settings

**Catalogue** — show only when product commerce and permission are enabled
- Products
- Categories
- Collections
- Bundles
- Inventory
- Import / export

**People** — use this exact primary label for customer management
- All customers
- Segments
- Customer activity
- Reviews / feedback (only if a real review feature is delivered)
- Import / export
- Privacy requests and consent records, as applicable

**Online Store**
- Overview
- Pages Editor
- Theme
- Templates
- Navigation / menus
- Blog / content (only when implemented)
- Domains
- SEO and social sharing
- Storefront preferences

Preserve the existing Store Editor: page tree, section canvas, inspector, reusable section registry, theme controls, preview, draft, snapshot, atomic Publish all, discard, undo/history and restore. This navigation wraps and extends the existing editor; it is not a replacement page builder.

**POS & Counters** — merchant configuration only
- Overview
- Locations
- Counters
- Registers / cash drawers
- Devices and peripherals
- Staff assignments
- Register sessions / cash management
- Receipts and printing
- POS settings

The **Open POS** action launches the separate POS experience at `pos.chandraprakash.codes`. Do not render the cashier billing screen inside the ordinary Merchant Admin shell.

**Extensions**
- App marketplace
- Installed extensions
- Connection health / event logs

Only Razorpay and Shiprocket are installable at launch if their integrations pass end-to-end verification. Email marketing, WhatsApp and Delhivery may appear as **Coming soon**, with install disabled. Transactional email needed by BillionBiz is core infrastructure, not a future plugin. See `extension-marketplace-architecture.md` and `notifications-email-architecture.md`.

**Team**
- Members
- Invitations
- Roles & permissions
- Staff profiles
- Appointment/resource assignments
- POS/counter assignments
- Shifts / working schedules

**Analytics**
- Overview
- Sales and payments
- Orders and fulfilment
- Product and inventory performance
- Appointments and utilization
- People/customer insights
- POS and register reports

**Settings**
- Business / organization
- Store profile and storefront capabilities
- Locations and regional preferences
- Domains
- Payments and taxes
- Checkout and customer accounts
- Shipping and delivery
- Appointments and booking policies
- POS and registers
- Notifications and email
- Team and access
- Security and sessions
- Extensions and API/webhooks
- Data import/export and privacy
- Plans and billing only if a billing subsystem exists
- Audit log and advanced preferences

Full hierarchy: `settings-control-plane.md`.

## 3. Dedicated portal shells

### Staff Portal
- My day / schedule.
- My assigned bookings.
- Booking details and permitted status actions.
- Assigned location/resource.
- Availability, shifts and time-off requests where permitted.
- Work notifications.
- Profile, security and sessions.

### POS Portal
- Select only assigned location/counter when more than one exists.
- Open/close register session.
- Fast product/service lookup where enabled, cart/bill, authorized discount, tender/payment, receipt, hold/resume bill, returns/voids by permission.
- Clear device/printer/payment/sync health.
- Offline mode with explicit queue and reconciliation status.

POS has a focused cashier shell with no merchant-wide configuration. Counter resources, staff assignments, devices and settings stay in Merchant Admin.

## 4. Shared list/detail patterns

Operational lists share search, filters, sorting, pagination, bulk selection with preview/confirmation, consistent status semantics, row actions, detail timeline, loading/empty/error/no-results states and deep links that preserve filter context.

## 5. Quick Find

Search products, orders, customers/People, bookings, pages, team members, counters and settings actions only when the current user has relevant permissions. Debounce, paginate, rank exact IDs/SKUs/email/name sensibly and support keyboard navigation. Never return cross-tenant or hidden records. Recent searches are user-specific and clearable.

## 6. Visual consistency and accessibility

Use `design-system-architecture.md` for palette, spacing, typography, controls, elevations and responsive rules. No page may introduce unrelated primary colors. Target WCAG 2.2 AA; never use color as the sole state indicator.

## V2.2 host-to-navigation contract

Navigation is specific to the host and user role. `admin` is the merchant operating system; `staff` is assigned-work only; `pos` is cashier checkout only; `ops` is BillionBiz internal operations only; public storefronts show the merchant's public site. Do not reuse the same sidebar/topbar/content page on all hosts. StoreSite/SiteStore navigation is prohibited; retain the native Online Store editor and its Pages, Theme, Templates, Navigation, Domains and publishing workflows.
