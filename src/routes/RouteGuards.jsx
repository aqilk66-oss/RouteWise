import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';
import { USER_ROLES } from '../constants/collections';

/**
 * ProtectedRoute: Requires user to be authenticated.
 * If not authenticated, redirects to /login while saving the attempted location.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader variant="page" text="Verifying RouteWise session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * RoleRoute: Requires user to possess one of the allowed roles.
 * Redirects to /dashboard if authorized role is missing.
 */
export const RoleRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader variant="page" text="Verifying role permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super Admin has global access to all role areas; Admin has access to allowed operational areas
  const hasAccess = role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN || allowedRoles.includes(role);

  if (!hasAccess) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * SuperAdminRoute: Strictly restricted to USER_ROLES.SUPER_ADMIN.
 * Ordinary Admins, Managers, and other roles are redirected to /unauthorized.
 */
export const SuperAdminRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader variant="page" text="Verifying system governance clearance..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== USER_ROLES.SUPER_ADMIN) {
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
