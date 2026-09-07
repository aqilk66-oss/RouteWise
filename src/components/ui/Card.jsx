import React from 'react';

/**
 * RouteWise Card Component
 * Variants: basic | elevated | glass | interactive | spatial | featured
 */
export const Card = ({
  children,
  variant = 'basic',
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-xl p-6 transition-all duration-300 relative';

  const variantStyles = {
    basic: 'bg-white border border-border text-brand-navy shadow-subtle',
    elevated: 'bg-white border border-border/80 text-brand-navy shadow-soft hover:shadow-medium',
    glass: 'glass-panel text-brand-navy hover:shadow-glass-hover',
    interactive: 'bg-white border border-border text-brand-navy shadow-subtle hover:shadow-medium hover:-translate-y-1 cursor-pointer hover:border-accent/40',
    spatial: 'glass-panel-elevated text-brand-navy shadow-floating hover:-translate-y-1.5 transition-transform duration-300',
    featured: 'liquid-glass-accent text-brand-navy hover:shadow-medium',
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.basic} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
