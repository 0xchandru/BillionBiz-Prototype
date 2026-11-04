import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { syncAuthFromUrlOrCookie } from '../../utils/crossDomainAuth';
import AnimatedLoader from '../common/AnimatedLoader';

interface ProtectedRouteProps {
  requiredRole?: string;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isCheckingAuth, checkAuth, role, user } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  // Run synchronous check in case we arrived via cross-subdomain handoff (?token=...)
  if (typeof window !== 'undefined' && !localStorage.getItem('billionbiz_token')) {
    syncAuthFromUrlOrCookie();
  }

  useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('billionbiz_token') : null;
      if (!user && storedToken) {
        await checkAuth();
      }
      if (isMounted) {
        setAuthChecked(true);
      }
    };
    verify();
    return () => {
      isMounted = false;
    };
  }, [user, checkAuth]);

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('billionbiz_token');

  // If user is actively hydrating with an existing token and checkAuth hasn't finished, wait
  if (isCheckingAuth || (!authChecked && hasToken && !user)) {
    return <AnimatedLoader message="Securing session..." />;
  }

  // Once check completes, if not authenticated or user profile is absent, send to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role && role.toUpperCase() !== requiredRole.toUpperCase() && role !== 'OWNER' && role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
