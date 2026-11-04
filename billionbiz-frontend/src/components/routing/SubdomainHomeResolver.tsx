import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { parseSubdomain } from '../../utils/subdomain';
import LandingPage from '../../pages/LandingPage';
import StorefrontPage from '../../pages/StorefrontPage';

/**
 * Resolves the root `/` path dynamically based on the active domain or subdomain:
 *
 * - admin.chandraprakash.codes        -> /dashboard (if authenticated) or /login (if unauthenticated)
 * - accounts.chandraprakash.codes     -> /login (or /dashboard if already logged in)
 * - pos.chandraprakash.codes          -> /pos (if authenticated) or /login (if unauthenticated)
 * - staff.chandraprakash.codes        -> /appointments (if authenticated) or /login (if unauthenticated)
 * - ops.chandraprakash.codes          -> /dashboard (if authenticated) or /login (if unauthenticated)
 * - {slug}.chandraprakash.codes -> Customer Storefront
 * - chandraprakash.codes / www        -> Public Marketing Homepage
 */
export const SubdomainHomeResolver: React.FC = () => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  const subInfo = parseSubdomain();

  // If checking authentication token from storage on app boot
  if (isCheckingAuth && subInfo.type !== 'root' && subInfo.type !== 'store') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Resolving BillionBiz portal...</span>
        </div>
      </div>
    );
  }

  switch (subInfo.type) {
    case 'admin':
      return isAuthenticated ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Navigate to="/login" replace />
      );

    case 'accounts':
      return isAuthenticated ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Navigate to="/login" replace />
      );

    case 'pos':
      return isAuthenticated ? (
        <Navigate to="/pos" replace />
      ) : (
        <Navigate to="/login" state={{ from: { pathname: '/pos' } }} replace />
      );

    case 'staff':
      return isAuthenticated ? (
        <Navigate to="/appointments" replace />
      ) : (
        <Navigate to="/login" state={{ from: { pathname: '/appointments' } }} replace />
      );

    case 'ops':
      return isAuthenticated ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Navigate to="/login" replace />
      );

    case 'store':
      return <StorefrontPage slug={subInfo.storeSlug} />;

    case 'root':
    default:
      return <LandingPage />;
  }
};

export default SubdomainHomeResolver;

