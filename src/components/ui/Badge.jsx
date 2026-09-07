import React from 'react';

/**
 * RouteWise Badge Component
 * Status variants: default | success | warning | danger | info | active | onroute | delayed
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const variantStyles = {
    default: 'bg-surface-subtle text-brand-navy border border-border',
    success: 'bg-status-success-bg text-status-success border border-status-success/20',
    warning: 'bg-status-warning-bg text-status-warning border border-status-warning/20',
    danger: 'bg-status-danger-bg text-status-danger border border-status-danger/20',
    info: 'bg-status-info-bg text-status-info border border-status-info/20',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    onroute: 'bg-blue-50 text-blue-700 border border-blue-200',
    delayed: 'bg-amber-50 text-amber-700 border border-amber-200',
  };

  const dotColors = {
    default: 'bg-brand-slate',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger: 'bg-status-danger',
    info: 'bg-status-info',
    active: 'bg-emerald-500',
    onroute: 'bg-blue-500',
    delayed: 'bg-amber-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.default} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.default}`} />}
      {children}
    </span>
  );
};

export default Badge;
