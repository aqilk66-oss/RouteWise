import React from 'react';

/**
 * Skeleton Loader Component
 * Smooth shimmer placeholder for in-page data loading states.
 */
export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
