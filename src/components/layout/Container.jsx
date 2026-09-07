import React from 'react';

/**
 * Reusable layout Container with responsive fluid padding and max width
 */
export const Container = ({
  children,
  className = '',
  size = 'content',
  ...props
}) => {
  const sizeClasses = {
    content: 'max-w-[1440px]',
    narrow: 'max-w-[1024px]',
    wide: 'max-w-[1600px]',
    full: 'max-w-full',
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 ${sizeClasses[size] || sizeClasses.content} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
