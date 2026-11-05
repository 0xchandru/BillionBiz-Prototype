import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { parseSubdomain, getPortalUrl, isLocalOrPreview } from '../../utils/subdomain';
import { useAuthStore } from '../../store/authStore';

// Layout & Route Guards
import AppLayout from '../layout/AppLayout';
import ProtectedRoute from '../layout/ProtectedRoute';
import AnimatedLoader from '../common/AnimatedLoader';
// 404 Not Found Page
const NotFoundPage = lazy(() => import('../../pages/NotFoundPage'));

// Marketing App (Root Domain / www)
const LandingPage = lazy(() => import('../../pages/LandingPage'));

// Auth Pages
const LoginPage = lazy(() => import('../../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../../pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('../../pages/auth/VerifyEmailPage'));

// Merchant Admin App
const Dashboard = lazy(() => import('../../pages/Dashboard'));
const Pages = lazy(() => import('../../pages/Pages'));
const OrdersPage = lazy(() => import('../../pages/Orders'));
const InvoicesPage = lazy(() => import('../../pages/Invoices'));
const AbandonedCartsPage = lazy(() => import('../../pages/AbandonedCarts'));
const ReturnsRefundsPage = lazy(() => import('../../pages/ReturnsRefunds'));
const ShipmentsPage = lazy(() => import('../../pages/Shipments'));
const WarehousesPage = lazy(() => import('../../pages/Warehouses'));
const QuotesPage = lazy(() => import('../../pages/Quotes'));

const AppointmentsPage = lazy(() => import('../../pages/Appointments'));
const OfferingsPage = lazy(() => import('../../pages/Offerings'));
const StaffPage = lazy(() => import('../../pages/Staff'));
const WorkingHoursPage = lazy(() => import('../../pages/WorkingHours'));
const BookingSettingsPage = lazy(() => import('../../pages/BookingSettings'));
const ResourcesPage = lazy(() => import('../../pages/Resources'));

const ProductsPage = lazy(() => import('../../pages/Products'));
const CategoriesPage = lazy(() => import('../../pages/Categories'));
const InventoryPage = lazy(() => import('../../pages/Inventory'));
const PriceListsPage = lazy(() => import('../../pages/PriceLists'));

const PeoplePage = lazy(() => import('../../pages/People'));
const CustomerTicketsPage = lazy(() => import('../../pages/CustomerTickets'));

const TeamPage = lazy(() => import('../../pages/Team'));
const RolesPermissionsPage = lazy(() => import('../../pages/RolesPermissions'));
const ResponsibilitiesPage = lazy(() => import('../../pages/Responsibilities'));

const POSCountersPage = lazy(() => import('../../pages/POSCounters'));
const POSShiftsPage = lazy(() => import('../../pages/POSShifts'));

const StoreNavigationPage = lazy(() => import('../../pages/StoreNavigation'));
const ExtensionsPage = lazy(() => import('../../pages/Extensions'));
const GeneralSettingsPage = lazy(() => import('../../pages/GeneralSettings'));
const AccountSettingsPage = lazy(() => import('../../pages/AccountSettings'));
const SecuritySettingsPage = lazy(() => import('../../pages/SecuritySettings'));
const PreferencesSettingsPage = lazy(() => import('../../pages/PreferencesSettings'));
const PaymentsSettingsPage = lazy(() => import('../../pages/PaymentsSettings'));
const FulfillmentSettingsPage = lazy(() => import('../../pages/FulfillmentSettings'));
const NotificationsSettingsPage = lazy(() => import('../../pages/NotificationsSettings'));
const IntegrationsSettingsPage = lazy(() => import('../../pages/IntegrationsSettings'));
const ThemeLibraryPage = lazy(() => import('../../pages/ThemeLibraryPage'));
const OnlineStoreOverview = lazy(() => import('../../pages/OnlineStoreOverview'));
const EditorLayout = lazy(() => import('../../pages/editor/EditorLayout'));

// Dedicated Subdomain Portals
const StaffPortalPage = lazy(() => import('../../pages/StaffPortalPage'));
const OpsPortalPage = lazy(() => import('../../pages/OpsPortalPage'));
const POSPage = lazy(() => import('../../pages/POS'));
const StorefrontPage = lazy(() => import('../../pages/StorefrontPage'));
const CustomerPortalPage = lazy(() => import('../../pages/CustomerPortalPage').then((module) => ({ default: module.CustomerPortalPage })));

export const RouteLoadingFallback: React.FC = () => (
  <div className="route-loading-shell" role="status" aria-live="polite" aria-label="Loading page">
    <div className="route-loading-topbar" />
    <div className="route-loading-content">
      <div className="route-loading-title" />
      <div className="route-loading-subtitle" />
      <div className="route-loading-cards"><span /><span /><span /></div>
      <div className="route-loading-panel" />
    </div>
  </div>
);

/**
 * Animated redirect component for cross-origin domain hops
 */
const ExternalRedirect: React.FC<{ to: string }> = ({ to }) => {
  React.useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return <AnimatedLoader message="Navigating to portal..." />;
};

/**
 * Common Merchant Admin Route Tree Component
 * Reused for both local/preview and production admin subdomain
 */
export const renderAdminRoutes = (): React.ReactElement => (
  <Route element={<Suspense fallback={<RouteLoadingFallback />}><ProtectedRoute /></Suspense>}>
    <Route element={<AppLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Orders Section - Dedicated Individual Pages */}
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/all" element={<OrdersPage />} />
      <Route path="/orders/invoices" element={<InvoicesPage />} />
      <Route path="/orders/invoices/new" element={<InvoicesPage />} />
      <Route path="/orders/abandoned-carts" element={<AbandonedCartsPage />} />
      <Route path="/orders/returns-refunds" element={<ReturnsRefundsPage />} />
      <Route path="/orders/shipments" element={<ShipmentsPage />} />
      <Route path="/orders/warehouses" element={<WarehousesPage />} />
      <Route path="/orders/quotes" element={<QuotesPage />} />
      <Route path="/orders/returns" element={<ReturnsRefundsPage />} />

      {/* Appointments Section - Dedicated Individual Pages */}
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/appointments/new" element={<AppointmentsPage />} />
      <Route path="/appointments/offerings" element={<OfferingsPage />} />
      <Route path="/appointments/staff" element={<StaffPage />} />
      <Route path="/appointments/working-hours" element={<WorkingHoursPage />} />
      <Route path="/appointments/settings" element={<BookingSettingsPage />} />
      <Route path="/appointments/availability" element={<WorkingHoursPage />} />
      <Route path="/appointments/resources" element={<ResourcesPage />} />

      {/* Products & Catalogue Section - Dedicated Individual Pages */}
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/categories" element={<CategoriesPage />} />
      <Route path="/products/inventory" element={<InventoryPage />} />
      <Route path="/products/pricelists" element={<PriceListsPage />} />

      {/* People & CRM Section - Dedicated Individual Pages */}
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/people/tickets" element={<CustomerTicketsPage />} />

      {/* Team Management - Dedicated Individual Pages */}
      <Route path="/team" element={<TeamPage />} />
      <Route path="/team/roles" element={<RolesPermissionsPage />} />
      <Route path="/team/responsibilities" element={<ResponsibilitiesPage />} />

      {/* POS Counters & Shifts - Dedicated Individual Pages */}
      <Route path="/pos-counters" element={<POSCountersPage />} />
      <Route path="/pos-counters/shifts" element={<POSShiftsPage />} />

      {/* Online Store & Themes - Dedicated Individual Pages */}
      <Route path="/online-store" element={<OnlineStoreOverview />} />
      <Route path="/online-store/overview" element={<OnlineStoreOverview />} />
      <Route path="/pages" element={<Pages />} />
      <Route path="/online-store/pages" element={<Pages />} />
      <Route path="/online-store/themes" element={<Navigate to="/theme" replace />} />
      <Route path="/online-store/navigation" element={<StoreNavigationPage />} />
      <Route path="/theme" element={<ThemeLibraryPage />} />

      {/* Plugins & Marketplace */}
      <Route path="/plugins" element={<ExtensionsPage defaultTab="all" />} />
      <Route path="/plugins/installed" element={<ExtensionsPage defaultTab="installed" />} />
      <Route path="/plugins/marketplace" element={<ExtensionsPage defaultTab="marketplace" />} />
      <Route path="/extensions" element={<ExtensionsPage defaultTab="all" />} />

      {/* Settings Section - Dedicated Individual Pages */}
      <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
      <Route path="/settings/general" element={<GeneralSettingsPage />} />
      <Route path="/settings/account" element={<AccountSettingsPage />} />
      <Route path="/settings/security" element={<SecuritySettingsPage />} />
      <Route path="/settings/preferences" element={<PreferencesSettingsPage />} />
      <Route path="/settings/payments" element={<PaymentsSettingsPage />} />
      <Route path="/settings/fulfillment" element={<FulfillmentSettingsPage />} />
      <Route path="/settings/notifications" element={<NotificationsSettingsPage />} />
      <Route path="/settings/integrations" element={<IntegrationsSettingsPage />} />
      <Route path="/settings/locations" element={<FulfillmentSettingsPage />} />
      <Route path="/settings/taxes" element={<PaymentsSettingsPage />} />
      <Route path="/settings/domains" element={<IntegrationsSettingsPage />} />
      <Route path="/settings/:tab" element={<Navigate to="/settings/general" replace />} />
    </Route>

    {/* Native Online Store Editor */}
    <Route path="/editor/store-brand" element={<Navigate to="/editor/brand" replace />} />
    <Route path="/editor/design-experience" element={<Navigate to="/editor/design" replace />} />
    <Route path="/editor/seo-growth" element={<Navigate to="/editor/brand" replace />} />
    <Route path="/editor" element={<Navigate to="/editor/pages" replace />} />
    <Route path="/editor/:tab" element={<EditorLayout />} />

    {/* Embedded POS Preview in Admin */}
    <Route path="/pos" element={<Navigate to="/pos-counters" replace />} />
  </Route>
);

/**
 * Strict Page-Based & Host-Dispatched Routing Architecture
 */
export const HostDispatcher: React.FC = () => {
  const subInfo = parseSubdomain();
  const { isAuthenticated } = useAuthStore();
  const isLocal = isLocalOrPreview() && subInfo.type === 'local';
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();
  const adminPortalHost = `admin.${rootDomain}`;
  const mainPortalHost = `www.${rootDomain}`;

  // 1. LOCAL / PREVIEW / SINGLE-ORIGIN RUNTIME (Unified root dev mode)
  if (isLocal) {
    return (
      <Routes>
        {/* Public Homepage */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Pages */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Full Merchant Admin Workspace */}
        {renderAdminRoutes()}

        {/* Standalone Local Portals */}
        <Route path="/pos-app" element={<POSPage />} />
        <Route path="/staff-app" element={<StaffPortalPage />} />
        <Route path="/accounts" element={<CustomerPortalPage />} />
        <Route path="/customer" element={<CustomerPortalPage />} />
        <Route path="/ops" element={<OpsPortalPage />} />

        {/* Store preview route */}
        <Route path="/store/:slug" element={<StorefrontPage />} />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage message="The page you requested could not be found." />} />
      </Routes>
    );
  }

  // 2. PUBLIC MARKETING WEBSITE (Root Domain / www)
  if (subInfo.type === 'root') {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<ExternalRedirect to={getPortalUrl('admin', '/login')} />} />
        <Route path="/forgot-password" element={<ExternalRedirect to={getPortalUrl('admin', '/forgot-password')} />} />

        {/* If user navigates to /dashboard on root domain, seamlessly redirect to admin portal */}
        <Route
          path="/dashboard"
          element={<ExternalRedirect to={getPortalUrl('admin', '/dashboard')} />}
        />
        <Route
          path="/orders/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/orders"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/products/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/products"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/appointments/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/appointments"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/people/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/people"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/team/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/team"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/pos-counters/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/pos-counters"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/online-store/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/pages/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/pages"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/theme"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/plugins/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/plugins"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/extensions/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/extensions"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/settings/*"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/settings"
          element={<NotFoundPage message={`Merchant Admin is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/editor/*"
          element={<NotFoundPage message={`Store Editor is only available on ${adminPortalHost}`} />}
        />
        <Route
          path="/editor"
          element={<NotFoundPage message={`Store Editor is only available on ${adminPortalHost}`} />}
        />

        <Route path="*" element={<NotFoundPage message="The page you are looking for does not exist on this site." />} />
      </Routes>
    );
  }

  // 0. APEX DOMAIN REDIRECT
  if (subInfo.type === 'redirect') {
    return <AnimatedLoader message={`Redirecting to ${mainPortalHost}...`} />;
  }

  // 3. DEDICATED CUSTOMER ACCOUNTS PORTAL
  if (subInfo.type === 'accounts') {
    return (
      <Routes>
        <Route path="*" element={<CustomerPortalPage />} />
      </Routes>
    );
  }

  // 4. DEDICATED CASHIER POS PORTAL
  if (subInfo.type === 'pos') {
    return (
      <Routes>
        <Route path="*" element={<POSPage />} />
      </Routes>
    );
  }

  // 5. DEDICATED STAFF WORK PORTAL
  if (subInfo.type === 'staff') {
    return (
      <Routes>
        <Route path="*" element={<StaffPortalPage />} />
      </Routes>
    );
  }

  // 6. RESTRICTED INTERNAL PLATFORM OPERATIONS
  if (subInfo.type === 'ops') {
    return (
      <Routes>
        <Route
          path="/dashboard"
          element={<NotFoundPage message="Merchant dashboard is not available on the internal Ops portal." />}
        />
        <Route path="*" element={<OpsPortalPage />} />
      </Routes>
    );
  }

  // 7. BACKEND API HOST
  if (subInfo.type === 'api') {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <NotFoundPage
              message={`api.${rootDomain} is the backend REST API and serves JSON endpoints exclusively. Please visit https://${mainPortalHost} for web applications.`}
            />
          }
        />
      </Routes>
    );
  }

  // 8. RESERVED PLATFORM SUBDOMAIN
  if (subInfo.type === 'reserved') {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <NotFoundPage
              message={`The subdomain "${subInfo.subdomain}" is reserved by the BillionBiz platform and cannot host a storefront.`}
            />
          }
        />
      </Routes>
    );
  }

  // 9. UNKNOWN / UNCONFIGURED HOSTNAME
  if (subInfo.type === 'unknown') {
    return (
      <Routes>
        <Route
          path="*"
          element={<NotFoundPage message="The requested domain is not configured on BillionBiz." />}
        />
      </Routes>
    );
  }

  // 7. NATIVE MERCHANT STOREFRONT RUNTIME
  if (subInfo.type === 'store') {
    return (
      <Routes>
        <Route
          path="/login"
          element={<NotFoundPage message={`Admin login is not available on customer storefronts. Please visit ${adminPortalHost}.`} />}
        />
        <Route
          path="/register"
          element={<NotFoundPage message={`Store registration is only available on the main website (${rootDomain}/register).`} />}
        />
        <Route
          path="/dashboard"
          element={<NotFoundPage message={`Merchant dashboard is only available on ${adminPortalHost}.`} />}
        />
        {/* Admin workspace routes are strictly NOT accessible on storefronts -> 404 */}
        <Route path="/orders/*" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/orders" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/products/*" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/products" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/appointments/*" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/appointments" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/people/*" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/people" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/team/*" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/team" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/settings/*" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/settings" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/editor/*" element={<NotFoundPage message={`Store Editor is only available on ${adminPortalHost}.`} />} />
        <Route path="/editor" element={<NotFoundPage message={`Store Editor is only available on ${adminPortalHost}.`} />} />
        <Route path="/plugins/*" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/plugins" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/pos-counters/*" element={<NotFoundPage message="Page not available on customer storefront." />} />
        <Route path="/pos-counters" element={<NotFoundPage message="Page not available on customer storefront." />} />

        <Route path="*" element={<StorefrontPage slug={subInfo.storeSlug} />} />
      </Routes>
    );
  }

  // 8. MERCHANT ADMIN WORKSPACE
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      {/* Registration is strictly NOT available on the Admin subdomain -> 404 */}
      <Route
        path="/register"
        element={<NotFoundPage message={`Store registration is only available on the main website. Please visit https://${rootDomain}/register.`} />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Root of admin: redirect to dashboard if authenticated, else login */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Full Merchant Admin Workspace */}
      {renderAdminRoutes()}

      {/* Store preview route inside admin */}
      <Route path="/store/:slug" element={<StorefrontPage />} />

      {/* Admin 404 fallback */}
      <Route path="*" element={<NotFoundPage message="The requested page was not found in the Merchant Admin workspace." />} />
    </Routes>
  );
};

export default HostDispatcher;
