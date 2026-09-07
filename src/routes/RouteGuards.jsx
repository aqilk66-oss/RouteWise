import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';
import { USER_ROLES } from '../constants/collections';
import { hasPermission } from '../constants/permissions';

/**
 * Normalizes role string to canonical form
 */
const normalizeRole = (r) => {
  if (r === 'superAdmin') return USER_ROLES.SUPER_ADMIN;
  if (r === 'transportManager') return USER_ROLES.ADMIN;
  return r;
};

/**
 * ProtectedRoute: Requires user to be authenticated and have an active status.
 * If not authenticated, redirects to /login while saving attempted location.
 * If suspended or disabled, redirects to /unauthorized with status reason.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader variant="page" text="Verifying RouteWise session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account status check (active, suspended, disabled, pending)
  const status = profile?.status || 'active';
  if (status === 'suspended' || status === 'disabled') {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location, 
          reason: status === 'suspended' ? 'Your account has been suspended by administration.' : 'Your account is disabled.' 
        }} 
        replace 
      />
    );
  }

  return <Outlet />;
};

/**
 * RoleRoute: Requires user to possess one of the allowed roles.
 * Redirects to /unauthorized if role is not permitted or account is suspended.
 */
export const RoleRoute = ({ allowedRoles = [], requiredPermission = null }) => {
  const { isAuthenticated, role, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader variant="page" text="Verifying role permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const status = profile?.status || 'active';
  if (status === 'suspended' || status === 'disabled') {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location, reason: `Your account is ${status}. Access denied.` }} 
        replace 
      />
    );
  }

  const activeRole = normalizeRole(role);
  const normalizedAllowed = allowedRoles.map(normalizeRole);

  // Super Admin possesses system-wide access
  const isSuper = activeRole === USER_ROLES.SUPER_ADMIN;
  const roleMatch = normalizedAllowed.includes(activeRole);
  const permMatch = requiredPermission ? hasPermission(activeRole, requiredPermission) : true;

  if (!isSuper && (!roleMatch || !permMatch)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * SuperAdminRoute: Strictly restricted to USER_ROLES.SUPER_ADMIN.
 * Normal Admins, Drivers, Parents, and Students are redirected to /unauthorized.
 */
export const SuperAdminRoute = () => {
  const { isAuthenticated, role, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader variant="page" text="Verifying system governance clearance..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const status = profile?.status || 'active';
  if (status === 'suspended' || status === 'disabled') {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location, reason: `Governance access denied: account is ${status}.` }} 
        replace 
      />
    );
  }

  const activeRole = normalizeRole(role);
  if (activeRole !== USER_ROLES.SUPER_ADMIN) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * PublicRoute: For Login / Register pages.
 * If user is already authenticated, redirects directly to /dashboard.
 */
export const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader variant="page" text="Loading RouteWise..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
