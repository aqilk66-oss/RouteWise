import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbTrail } from '../../routes/routeConfig';
import { useAuth } from '../../context/AuthContext';

/**
 * Accessible Breadcrumb Navigation Component
 * Adheres to WAI-ARIA Breadcrumb Pattern:
 * <nav aria-label="Breadcrumb"> with <ol> and aria-current="page"
 */
export const Breadcrumbs = ({ className = '', customTrail = null }) => {
  const location = useLocation();
  const { role } = useAuth();

  const trail = customTrail || generateBreadcrumbTrail(location.pathname, role);

  if (!trail || trail.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs text-brand-slate overflow-hidden ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        {trail.map((item, index) => {
          const isLast = item.isCurrent || index === trail.length - 1;

          return (
            <li key={item.path} className="inline-flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-slate-300 shrink-0"
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  className="font-semibold text-brand-navy truncate max-w-[180px] sm:max-w-[260px]"
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-brand-blue transition-colors truncate max-w-[140px] sm:max-w-[200px]"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
