import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../constants/collections';
import Loader from '../components/ui/Loader';

/**
 * Smart role-based dashboard router redirecting authenticated users to their dedicated workspace
 */
export const DashboardPage = () => {
  const { role, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      switch (role) {
        case USER_ROLES.SUPER_ADMIN:
          navigate('/super-admin', { replace: true });
          break;
        case USER_ROLES.ADMIN:
        case USER_ROLES.TRANSPORT_MANAGER:
          navigate('/admin', { replace: true });
          break;
        case USER_ROLES.DRIVER:
          navigate('/driver', { replace: true });
          break;
        case USER_ROLES.STUDENT:
          navigate('/student', { replace: true });
          break;
        case USER_ROLES.PARENT:
        default:
          navigate('/parent', { replace: true });
          break;
      }
    }
  }, [role, loading, user, navigate]);

  return <Loader variant="page" text="Routing to your authorized RouteWise workspace..." />;
};

export default DashboardPage;
