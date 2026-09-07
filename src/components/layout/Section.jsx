import React from 'react';
import Container from './Container';

/**
 * Reusable Section wrapper with standard fluid vertical padding and heading options
 */
export const Section = ({
  id,
  children,
  className = '',
  title,
  subtitle,
  badge,
  align = 'center',
  containerSize = 'content',
}) => {
  const alignmentClasses = {
    center: 'text-center mx-auto items-center',
    left: 'text-left items-start',
  };

  return (
    <section id={id} className={`py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden ${className}`}>
      <Container size={containerSize}>
        {(title || subtitle || badge) && (
          <div className={`mb-10 sm:mb-14 max-w-3xl flex flex-col ${alignmentClasses[align] || alignmentClasses.center}`}>
            {badge && <div className="mb-3">{badge}</div>}
            {title && <h2 className="text-h1 text-brand-navy tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-3 text-body-large text-brand-slate">{subtitle}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
};

export default Section;
