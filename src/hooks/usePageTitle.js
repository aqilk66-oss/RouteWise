import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMetadata } from '../routes/routeConfig';

/**
 * usePageTitle hook:
 * Automatically updates document.title whenever route pathname changes
 * using central route registry metadata.
 */
export function usePageTitle(customTitle = null) {
  const location = useLocation();

  useEffect(() => {
    if (customTitle) {
      document.title = `${customTitle} | RouteWise`;
      return;
    }

    const meta = getRouteMetadata(location.pathname);
    if (meta && meta.title) {
      document.title = meta.title;
    } else {
      document.title = 'RouteWise — School Transport & Bus Tracking';
    }
  }, [location.pathname, customTitle]);
}

export default usePageTitle;
