import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * RouteWise Professional Loader & Loading States
 * Incorporates brand logo, SVG route pulse, and smooth animations.
 * Variants:
 *  - 'page': Full-page branded loading overlay with RouteWise logo and pulse
 *  - 'component': Contained loading indicator for sections/cards
 *  - 'inline' / 'button': Minimal inline spinner
 *  - 'skeleton': Placeholder loading pulse
 */
export const Loader = ({
  size = 'md',
  variant = 'component',
  text = 'Loading...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (variant === 'page') {
    return (
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all duration-300 ${className}`}
        role="status"
        aria-label={text}
      >
        <div className="relative flex flex-col items-center p-8 rounded-3xl bg-white shadow-elevated border border-border max-w-xs w-full mx-4 text-center animate-fade-in">
          {/* Logo with pulsing ring */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-brand-blue/15 animate-ping" />
            <div className="relative w-14 h-14 rounded-2xl bg-brand-navy p-2 flex items-center justify-center shadow-soft">
              <img 
                src="/assets/logo.png" 
                alt="RouteWise" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-base text-brand-navy tracking-tight">RouteWise</span>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-teal/15 text-brand-teal tracking-wider">
              Transit
            </span>
          </div>

          <p className="text-xs text-brand-slate font-medium leading-relaxed mb-4">
            {text}
          </p>

          {/* Sleek progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-blue via-brand-teal to-brand-blue rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse bg-slate-200/75 rounded-xl ${className}`} />
    );
  }

  return (
    <div className={`flex items-center justify-center gap-2.5 text-brand-slate py-4 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-brand-blue`} />
      {text && <span className="text-xs font-semibold text-brand-navy">{text}</span>}
    </div>
  );
};

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200/75 rounded-xl ${className}`} />
);

export default Loader;
