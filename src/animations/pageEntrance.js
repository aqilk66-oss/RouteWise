import gsap from 'gsap';

/**
 * RouteWise Premium GSAP Master Entrance Animation Module
 * 
 * Execution Sequence:
 *   RouteWise Loader finishes & smoothly hides
 *         ↓
 *   Professional Staggered Entrance (0.4s–0.8s max total):
 *     1. Top Navigation Bar (soft slide-down from -18px + opacity 0 -> 1)
 *     2. Hero Eyebrow Pill (subtle scale 0.96 -> 1 + fade)
 *     3. Hero Headline Lines (buttery mask-clip wipe up: y '100%' -> '0%' with stagger 0.06s)
 *     4. Hero Supporting Description (subtle y: 14px -> 0px + opacity)
 *     5. Hero Action Buttons / CTAs (micro-scale 0.98 -> 1 + y: 12px -> 0px)
 *     6. Direct Portal Switcher Bar (soft fade-in + y: 8px -> 0px)
 *     7. Hero Trust & Telematics Status Bar (soft fade-in + y: 8px -> 0px)
 *     8. Hero 3D Transport Visual & HUD Badges (smooth scale: 0.96 -> 1 + subtle y: 16px -> 0px + badges stagger)
 *     9. Initial Main Content Section (gentle fade-in + y: 16px -> 0px)
 *         ↓
 *   Website becomes immediately fully interactive with zero layout shifts
 * 
 * Specifications:
 *   - Respects 'prefers-reduced-motion: reduce'
 *   - High-performance transforms only (y, opacity, scale)
 *   - Easing: 'power3.out' / 'power2.out' for ultra-smooth velocity deceleration
 *   - Total active duration: ~0.65 seconds
 *   - Automatic gsap.context cleanup and clearProps upon completion
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
    const heroHudPills = document.querySelectorAll('.hero-transport-container > div');
    const firstSection = document.querySelector('.animate-on-scroll, .page-section-entrance');

    // Create high-velocity, cinematic GSAP timeline
    const tl = gsap.timeline({
      defaults: {
        ease: 'power3.out',
        duration: 0.46,
      },
      onComplete: () => {
        // Clear inline transforms on completion to guarantee perfect responsive layout & native performance
        [navbar, heroEyebrow, heroDescription, heroCtas, heroPortals, heroTrust, heroVisual, firstSection].forEach((el) => {
          if (el) gsap.set(el, { clearProps: 'transform' });
        });
        if (heroHeadlineLines.length > 0) {
          gsap.set(heroHeadlineLines, { clearProps: 'transform' });
        }
      }
    });

    // 1. Top Navigation Bar (Sleek slide-down)
    if (navbar) {
      tl.fromTo(
        navbar,
        { opacity: 0, y: -18 },
        { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out' }
      );
    }

    // 2. Hero Eyebrow Live Badge
    if (heroEyebrow) {
      tl.fromTo(
        heroEyebrow,
        { opacity: 0, y: 12, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'power3.out' },
        '-=0.28'
      );
    }

    // 3. Hero Headline Lines (Crisp mask-clip reveal)
    if (heroHeadlineLines.length > 0) {
      tl.fromTo(
        heroHeadlineLines,
        { opacity: 0, y: '85%' },
        { opacity: 1, y: '0%', duration: 0.48, stagger: 0.06, ease: 'power3.out' },
        '-=0.24'
      );
    } else {
      const fallbackHeading = document.querySelector('.hero-headline, h1');
      if (fallbackHeading) {
        tl.fromTo(
          fallbackHeading,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
          '-=0.24'
        );
      }
    }

    // 4. Hero Supporting Description
    if (heroDescription) {
      tl.fromTo(
        heroDescription,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out' },
        '-=0.3'
      );
    }

    // 5. Hero Action Buttons / CTAs
    if (heroCtas) {
      tl.fromTo(
        heroCtas,
        { opacity: 0, y: 14, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' },
        '-=0.28'
      );
    }

    // 6. Direct Portals Switcher Bar
    if (heroPortals) {
      tl.fromTo(
        heroPortals,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        '-=0.26'
      );
    }

    // 7. Trust Badge & Live Institutional Activity Bar
    if (heroTrust) {
      tl.fromTo(
        heroTrust,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' },
        '-=0.24'
      );
    }

    // 8. Hero 3D Transport Visual & Glassmorphic Container
    if (heroVisual) {
      tl.fromTo(
        heroVisual,
        { opacity: 0, y: 20, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.58, ease: 'power2.out' },
        '-=0.48'
      );

      // Micro-stagger for HUD badges overlay inside the transport container
      if (heroHudPills.length > 0) {
        tl.fromTo(
          heroHudPills,
          { opacity: 0, scale: 0.92, y: 8 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' },
          '-=0.32'
        );
      }
    }

    // 9. Initial Main Content Section (Smooth handoff to scroll-driven content)
    if (firstSection) {
      tl.fromTo(
        firstSection,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out' },
        '-=0.3'
      );
    }
  }, scopeElement || document.body);

  return () => ctx.revert();
};

export default runPageEntrance;
