import gsap from 'gsap';

/**
 * RouteWise Quick Entrance Animation Module
 * 
 * Sequence:
 *   RouteWise Loader completes -> Loader unmounts
 *   -> Quick GSAP entrance (0.4–0.8s)
 *   -> Interactive website
 * 
 * Hierarchy:
 *   1. Navbar
 *   2. Hero heading
 *   3. Hero description
 *   4. Hero buttons
 *   5. Hero visual / image
 *   6. Main sections
 * 
 * Features:
 *   - Respects prefers-reduced-motion
 *   - Stagger: 0.04s–0.06s
 *   - Subtle motion (opacity, small y: 16px, slight scale: 0.98 -> 1)
 *   - Idempotent and leak-safe with automatic gsap.context
 */
export const runPageEntrance = (scopeElement = null) => {
  if (typeof window === 'undefined') return () => {};

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Ensure everything is visibly positioned with zero animation
    const targets = [
      '.navbar-entrance, header',
      '.hero-eyebrow',
      '.hero-headline, .hero-line',
      '.hero-description',
      '.hero-ctas',
      '.hero-trust',
      '.hero-transport-container, .hero-visual',
      '.page-section-entrance, .animate-on-scroll'
    ];
    targets.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
    return () => {};
  }

  const ctx = gsap.context(() => {
    // 1. Check elements existence
    const navbar = document.querySelector('.navbar-entrance, header');
    const heroEyebrow = document.querySelector('.hero-eyebrow');
    const heroHeadlines = document.querySelectorAll('.hero-line');
    const heroDescription = document.querySelector('.hero-description');
    const heroCtas = document.querySelector('.hero-ctas');
    const heroTrust = document.querySelector('.hero-trust');
    const heroVisual = document.querySelector('.hero-transport-container, .hero-visual');
    const firstSection = document.querySelector('.animate-on-scroll, .page-section-entrance');

    const tl = gsap.timeline({
      defaults: {
        ease: 'power3.out',
        duration: 0.45,
      },
      onComplete: () => {
        // Clear inline transforms on completion to guarantee perfect responsive layout
        [navbar, heroEyebrow, heroDescription, heroCtas, heroTrust, heroVisual, firstSection].forEach((el) => {
          if (el) gsap.set(el, { clearProps: 'transform' });
        });
      }
    });

    // 1. Navbar entrance
    if (navbar) {
      tl.fromTo(
        navbar,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.4 }
      );
    }

    // 2. Hero Heading (eyebrow + headline lines)
    if (heroEyebrow) {
      tl.fromTo(
        heroEyebrow,
        { opacity: 0, y: 12, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35 },
        '-=0.25'
      );
    }

    if (heroHeadlines.length > 0) {
      tl.fromTo(
        heroHeadlines,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.42, stagger: 0.05 },
        '-=0.2'
      );
    } else {
      const fallbackHeading = document.querySelector('.hero-headline, h1');
      if (fallbackHeading) {
        tl.fromTo(
          fallbackHeading,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.42 },
          '-=0.2'
        );
      }
    }

    // 3. Hero Description
    if (heroDescription) {
      tl.fromTo(
        heroDescription,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4 },
        '-=0.25'
      );
    }

    // 4. Hero Buttons / CTAs
    if (heroCtas) {
      tl.fromTo(
        heroCtas,
        { opacity: 0, y: 12, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.38 },
        '-=0.25'
      );
    }

    if (heroTrust) {
      tl.fromTo(
        heroTrust,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        '-=0.2'
      );
    }

    // 5. Hero Visual / Image
    if (heroVisual) {
      tl.fromTo(
        heroVisual,
        { opacity: 0, y: 18, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      );
    }

    // 6. Main First Section
    if (firstSection) {
      tl.fromTo(
        firstSection,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4 },
        '-=0.3'
      );
    }
  }, scopeElement || document.body);

  return () => ctx.revert();
};

export default runPageEntrance;
