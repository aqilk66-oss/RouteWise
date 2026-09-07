import React, { useState } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import SiteLoader from '../components/feedback/SiteLoader';
import Hero from '../components/hero/Hero';
import TrustSection from '../sections/home/TrustSection';
import PlatformOverviewSection from '../sections/home/PlatformOverviewSection';
import RouteManagementSection from '../sections/home/RouteManagementSection';
import BusTrackingSection from '../sections/home/BusTrackingSection';
import SafetySection from '../sections/home/SafetySection';
import RoleExperiencesSection from '../sections/home/RoleExperiencesSection';
import HowItWorksSection from '../sections/home/HowItWorksSection';
import StatsSection from '../sections/home/StatsSection';
import TestimonialsSection from '../sections/home/TestimonialsSection';
import FAQSection from '../sections/home/FAQSection';
import FinalCTASection from '../sections/home/FinalCTASection';
import ContactSection from '../sections/home/ContactSection';
import { useGsap } from '../hooks/useGsap';

/**
 * RouteWise Complete Landing Page — Stage 4
 * Features buttery smooth GSAP scroll-triggered entrance animations across all sections.
 */
export const HomePage = () => {
  const [loaderComplete, setLoaderComplete] = useState(false);

  // GSAP scroll trigger animations for seamless buttery scrolling
  useGsap((gsap, ScrollTrigger) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }, []);

  return (
    <>
      {/* Professional Site Loader */}
      <SiteLoader onComplete={() => setLoaderComplete(true)} />

      <PublicLayout>
        {/* Stage 3 Cinematic 3D Hero */}
        <Hero />

        {/* Stage 4 Complete Landing Page Sections with smooth GSAP scroll triggers */}
        <div className="animate-on-scroll"><TrustSection /></div>
        <div className="animate-on-scroll"><PlatformOverviewSection /></div>
        <div className="animate-on-scroll"><RouteManagementSection /></div>
        <div className="animate-on-scroll"><BusTrackingSection /></div>
        <div className="animate-on-scroll"><SafetySection /></div>
        <div className="animate-on-scroll"><RoleExperiencesSection /></div>
        <div className="animate-on-scroll"><HowItWorksSection /></div>
        <div className="animate-on-scroll"><StatsSection /></div>
        <div className="animate-on-scroll"><TestimonialsSection /></div>
        <div className="animate-on-scroll"><FAQSection /></div>
        <div className="animate-on-scroll"><FinalCTASection /></div>
        <div className="animate-on-scroll"><ContactSection /></div>
      </PublicLayout>
    </>
  );
};

export default HomePage;
