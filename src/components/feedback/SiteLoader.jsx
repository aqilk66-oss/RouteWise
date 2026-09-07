import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * RouteWise Professional Site Loader
 * Lightweight SVG & GSAP animation:
 * 1. Road spline draws forward
 * 2. GPS pinpoint pulses
 * 3. Stylized mini school bus travels along the path
 * 4. RouteWise brand logo and title resolve
 * 5. Smooth curtain slide-up reveal of the application
 */
export const SiteLoader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const [isFinished, setIsFinished] = useState(() => {
    try {
      return sessionStorage.getItem('routewise_loader_shown') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (isFinished) {
      if (onComplete) onComplete();
      return;
    }

    // Respect user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsFinished(true);
      try {
        sessionStorage.setItem('routewise_loader_shown', 'true');
      } catch (e) {}
      if (onComplete) onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsFinished(true);
          try {
            sessionStorage.setItem('routewise_loader_shown', 'true');
          } catch (e) {}
          if (onComplete) onComplete();
        },
      });

      // Step 1: Draw route SVG stroke
      tl.fromTo(
        '.loader-route-line',
        { strokeDashoffset: 400, strokeDasharray: 400 },
        { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }
      )
      // Step 2: Bus marker moves along
      .fromTo(
        '.loader-bus-marker',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' },
        '-=0.6'
      )
      // Step 3: Logo & Brand resolve
      .fromTo(
        '.loader-brand-content',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      )
      // Step 4: Short hold then curtain slide exit
      .to('.loader-content', {
        opacity: 0,
        scale: 0.96,
        duration: 0.35,
        delay: 0.25,
        ease: 'power2.in',
      })
      .to(containerRef.current, {
        yPercent: -100,
        duration: 0.6,
        ease: 'power4.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  if (isFinished) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-navy text-white overflow-hidden pointer-events-auto"
    >
      {/* Subtle background glow */}
      <div className="absolute w-[500px] h-[500px] bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

      <div className="loader-content relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Transit SVG Route & Waypoint */}
        <div className="relative w-48 h-24 mb-6 flex items-center justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
            {/* Background faint path */}
            <path
              d="M 10 70 Q 70 10, 100 50 T 190 30"
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Animated Teal Route line */}
            <path
              className="loader-route-line"
              d="M 10 70 Q 70 10, 100 50 T 190 30"
              fill="none"
              stroke="#14B8A6"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          {/* Bus Waypoint Marker */}
          <div className="loader-bus-marker absolute top-5 right-3 w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-floating border border-white/60">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          </div>
        </div>

        {/* RouteWise Logo & Wordmark */}
        <div className="loader-brand-content flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-floating mb-3 flex items-center justify-center border border-brand-teal/40">
            <img src="/assets/logo.png" alt="RouteWise" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">RouteWise</h2>
          <p className="text-xs text-brand-teal font-semibold tracking-wider uppercase mt-0.5">
            Every Route, Under Control
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
            <span>Connecting Transport Grid...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteLoader;
