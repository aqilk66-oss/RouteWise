import React, { useRef } from 'react';
import gsap from 'gsap';
import Container from '../layout/Container';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import HeroTransportVisual from './HeroTransportVisual';
import { HERO_DATA } from '../../data/heroData';
import { useGsap } from '../../hooks/useGsap';

/**
 * RouteWise World-Class Hero Section
 * Orchestrates typography, GSAP master entrance timeline, and premium transport visual.
 */
export const Hero = () => {
  const heroRef = useRef(null);

  // Note: Entrance sequence is master orchestrated right after the RouteWise loader finishes via runPageEntrance()

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

          {/* Right Column: Premium Transport Visual */}
          <div className="lg:col-span-7 xl:col-span-7 z-10 w-full">
            <HeroTransportVisual />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
