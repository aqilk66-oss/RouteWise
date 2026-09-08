import gsap from 'gsap';

/**
 * RouteWise Fast, Crisp, Professional Entrance Animation Module
 * 
 * Optimized Execution:
 *   - Fast, snappy duration: 0.35s total (crisp, zero unnecessary waiting)
 *   - Tight staggers (0.02s–0.03s)
 *   - Easing: 'power2.out' (instant responsive feel, fast deceleration)
 *   - Snappy subtle transforms (y: 8–10px, subtle scale 0.985 -> 1)
 *   - Automatic gsap.context cleanup with instant clearProps
 */
export const runPageEntrance = (scopeElement = null) => {
  if (typeof window === 'undefined') return () => {};

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    const targets = [
      '.navbar-entrance, header',
      '.hero-eyebrow',
      '.hero-headline, .hero-line',
      '.hero-description',
      '.hero-ctas',
      '.hero-portals',
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
    const navbar = document.querySelector('.navbar-entrance, header');
    const heroEyebrow = document.querySelector('.hero-eyebrow');
    const heroHeadlineLines = document.querySelectorAll('.hero-line');
    const heroDescription = document.querySelector('.hero-description');
    const heroCtas = document.querySelector('.hero-ctas');
    const heroPortals = document.querySelector('.hero-portals, .hero-content-portals');
    const heroTrust = document.querySelector('.hero-trust');
    const heroVisual = document.querySelector('.hero-transport-container, .hero-visual');
    const firstSection = document.querySelector('.animate-on-scroll, .page-section-entrance');

    // Create fast, high-performance master timeline
    const tl = gsap.timeline({
      defaults: {
        ease: 'power2.out',
        duration: 0.28,
      },
      onComplete: () => {
        // Clear inline transforms immediately for instant responsiveness
        [navbar, heroEyebrow, heroDescription, heroCtas, heroPortals, heroTrust, heroVisual, firstSection].forEach((el) => {
          if (el) gsap.set(el, { clearProps: 'transform' });
        });
        if (heroHeadlineLines.length > 0) {
          gsap.set(heroHeadlineLines, { clearProps: 'transform' });
        }
      }
    });

    // 1. Top Navbar (Instant crisp drop)
    if (navbar) {
      tl.fromTo(
        navbar,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.25 }
      );
    }

    // 2. Hero Left Content & Right Visual in fast synchronized overlap
    const heroGroup = [heroEyebrow, heroDescription, heroCtas, heroPortals, heroTrust].filter(Boolean);

    // Fast headline lines
    if (heroHeadlineLines.length > 0) {
      tl.fromTo(
        heroHeadlineLines,
        { opacity: 0, y: '50%' },
        { opacity: 1, y: '0%', duration: 0.28, stagger: 0.03 },
        '-=0.18'
      );
    }

    if (heroGroup.length > 0) {
      tl.fromTo(
        heroGroup,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.02 },
        '-=0.22'
      );
    }

    // 3. Hero Visual (Fast parallel snap-in)
    if (heroVisual) {
      tl.fromTo(
        heroVisual,
        { opacity: 0, y: 10, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3 },
        '-=0.25'
      );
    }

    // 4. Initial Section (Fast subtle settle)
    if (firstSection) {
      tl.fromTo(
        firstSection,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.22 },
        '-=0.18'
      );
    }
  }, scopeElement || document.body);

  return () => ctx.revert();
};

export default runPageEntrance;
