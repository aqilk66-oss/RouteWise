import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * RouteWise Button Component
 * Supports: primary | secondary | outline | ghost | glass | danger | success | icon | link
 * Sizes: sm | md | lg
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]',
    icon: 'p-2 min-h-[40px] min-w-[40px]',
  };

  const variantStyles = {
    primary: 'bg-brand-navy hover:bg-primary-hover text-white shadow-soft hover:shadow-medium focus-visible:ring-brand-blue',
    secondary: 'bg-accent hover:bg-accent-hover text-white shadow-soft hover:shadow-medium focus-visible:ring-accent',
    outline: 'border border-border bg-white hover:bg-surface-subtle text-brand-navy focus-visible:ring-brand-blue',
    ghost: 'text-brand-navy hover:bg-surface-subtle focus-visible:ring-brand-blue',
    glass: 'glass-panel hover:bg-white/90 text-brand-navy border border-white/80 shadow-soft focus-visible:ring-brand-blue',
    danger: 'bg-status-danger hover:bg-red-600 text-white shadow-soft focus-visible:ring-red-500',
    success: 'bg-status-success hover:bg-emerald-600 text-white shadow-soft focus-visible:ring-emerald-500',
    link: 'text-accent hover:underline p-0 min-h-0 bg-transparent shadow-none',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
