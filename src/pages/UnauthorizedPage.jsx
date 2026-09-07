import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import { ShieldX, Home, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, USER_ROLES } from '../constants/collections';

export const UnauthorizedPage = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Attempted destination passed via route guard state
  const attemptedPath = location.state?.from?.pathname || null;

  const getDashboardHome = () => {
    if (role === USER_ROLES.SUPER_ADMIN) return '/super-admin';
    if (role === USER_ROLES.STUDENT) return '/student';
    if (role === USER_ROLES.PARENT) return '/parent';
    if (role === USER_ROLES.DRIVER) return '/driver';
    if (role === USER_ROLES.ADMIN || role === USER_ROLES.TRANSPORT_MANAGER) return '/admin';
    return '/dashboard';
  };

  return (
    <PublicLayout>
      <div className="py-20 sm:py-28 flex items-center justify-center">
        <Container className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-6 shadow-soft">
            <ShieldX className="w-10 h-10" />
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-4">
            Security Policy 403
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight mb-3">
            Access Restricted
          </h1>

          <p className="text-sm text-brand-slate mb-4 leading-relaxed">
            You do not possess the required clearance level or operational credentials to view this terminal.
          </p>

          {attemptedPath && (
            <div className="mb-6 p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-brand-slate break-all">
              <span className="font-semibold text-brand-navy">Attempted Route:</span> {attemptedPath}
            </div>
          )}

          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Logged in as: <strong className="text-brand-navy">{ROLE_LABELS[role] || role}</strong>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  icon={ArrowLeft}
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
                <Link to={getDashboardHome()}>
                  <Button variant="primary" size="md" icon={LayoutDashboard}>
                    Return to Your Portal
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Link to="/login">
                <Button variant="primary" size="md">
                  Sign In to RouteWise
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="md" icon={Home}>
                  Main Site
                </Button>
              </Link>
            </div>
          )}
        </Container>
      </div>
    </PublicLayout>
  );
};

export default UnauthorizedPage;
