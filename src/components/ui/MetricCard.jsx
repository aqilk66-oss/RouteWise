import React from 'react';
import Card from './Card';

/**
 * MetricCard component for displaying real KPI counts with loading skeleton
 */
export const MetricCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  badgeText,
  badgeVariant = 'neutral',
  color = 'blue', // 'blue' | 'teal' | 'emerald' | 'amber' | 'navy'
  loading = false,
  className = '',
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-brand-blue border-blue-100',
    teal: 'bg-teal-50 text-brand-teal border-teal-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    navy: 'bg-slate-100 text-brand-navy border-slate-200',
  };

  if (loading) {
    return (
      <Card className={`p-5 flex flex-col justify-between animate-pulse ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
        </div>
        <div>
          <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-slate-100 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-5 flex flex-col justify-between hover:shadow-subtle transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-brand-slate uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
              {value ?? 0}
            </span>
            {badgeText && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {badgeText}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-brand-slate/90 truncate">{subtitle}</p>
      )}
    </Card>
  );
};

export default MetricCard;
