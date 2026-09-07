import React, { useRef } from 'react';
import gsap from 'gsap';
import Container from '../layout/Container';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import Hero3DViewer from './Hero3DViewer';
import { HERO_DATA } from '../../data/heroData';
import { useGsap } from '../../hooks/useGsap';

/**
 * RouteWise World-Class Hero Section
 * Orchestrates typography, GSAP master entrance timeline, and Three.js 3D transportation viewer.
 */
export const Hero = () => {
  const heroRef = useRef(null);

  // Master GSAP Hero entrance timeline
  useGsap((gsapInstance) => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tl = gsapInstance.timeline({
      defaults: { ease: 'power3.out' },
    });

    tl.fromTo(
      '.hero-eyebrow',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.1 }
    )
    .fromTo(
      '.hero-line',
      { y: '100%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 0.7, stagger: 0.12 },
      '-=0.3'
    )
    .fromTo(
      '.hero-description',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .fromTo(
      '.hero-ctas',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.3'
    )
    .fromTo(
      '.hero-trust',
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      '-=0.2'
    )
    .fromTo(
      '.hero-3d-container',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' },
      '-=0.7'
    )
    .fromTo(
      '.hero-telemetry-panel',
      { opacity: 0, y: 15, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.2)' },
      '-=0.4'
    );
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[calc(100vh-80px)] flex items-center justify-center pt-8 pb-16 lg:py-16 overflow-hidden"
    >
      {/* Visual atmospheric depth background */}
      <HeroBackground />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Typography, Copy, CTAs */}
          <div className="lg:col-span-5 xl:col-span-5 z-20">
            <HeroContent data={HERO_DATA} />
          </div>

          {/* Right Column: 3D Transportation Scene & Spatial Telemetry Panels */}
          <div className="lg:col-span-7 xl:col-span-7 z-10 w-full">
            <Hero3DViewer telemetry={HERO_DATA.telemetry} />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
