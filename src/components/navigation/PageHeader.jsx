import React from 'react';
import Breadcrumbs from './Breadcrumbs';

/**
 * RouteWise Standard PageHeader Component (Stage 29 Standard)
 * Provides standardized title, subtitle, breadcrumb trail, and action button bar.
 */
export const PageHeader = ({
  title,
  description,
  breadcrumbs = true,
  customTrail = null,
  actions,
  badge,
  className = '',
}) => {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {breadcrumbs && <Breadcrumbs customTrail={customTrail} className="mb-2.5" />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-navy tracking-tight">
              {title}
            </h1>
            {badge && <span>{badge}</span>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-brand-slate mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
