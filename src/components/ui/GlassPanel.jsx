import React from 'react';

/**
 * Reusable GlassPanel component adhering to RouteWise visual identity
 * Variants: light | elevated | dark | accent
 */
export const GlassPanel = ({
  children,
  variant = 'light',
  className = '',
  ...props
}) => {
  const variantStyles = {
    light: 'glass-panel text-brand-navy',
    elevated: 'glass-panel-elevated text-brand-navy',
    dark: 'glass-panel-dark text-white',
    accent: 'liquid-glass-accent text-brand-navy',
  };

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 ${variantStyles[variant] || variantStyles.light} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
