import React from 'react';
import PublicLayout from '../../layouts/PublicLayout';
import PlatformOverviewSection from '../../sections/home/PlatformOverviewSection';
import RouteManagementSection from '../../sections/home/RouteManagementSection';
import RoleExperiencesSection from '../../sections/home/RoleExperiencesSection';
import HowItWorksSection from '../../sections/home/HowItWorksSection';
import StatsSection from '../../sections/home/StatsSection';
import FinalCTASection from '../../sections/home/FinalCTASection';
import { useGsap } from '../../hooks/useGsap';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

/**
 * RouteWise Features Page — Dedicated MPA Page (/features)
 */
export const FeaturesPage = () => {
  useGsap((gsap, ScrollTrigger) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const sections = document.querySelectorAll('.animate-feature-section');
    sections.forEach((sec) => {
      gsap.fromTo(
        sec,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
          },
        }
      );
    });
  }, []);

  return (
    <PublicLayout>
      {/* Features Page Hero Banner */}
      <section className="relative pt-16 pb-12 bg-gradient-to-b from-brand-navy/5 via-transparent to-transparent">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h1 className="text-display text-brand-navy font-extrabold tracking-tight mb-4">
            Features engineered for total transport visibility.
          </h1>
          <p className="text-body-large text-brand-slate leading-relaxed mb-6">
            From smart dispatch to sub-second route recalculations, explore how RouteWise transforms modern school transportation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="secondary" size="md" icon={ArrowRight} iconPosition="right">
                Explore Demo Portals
              </Button>
            </Link>
            <Link to="/tracking">
              <Button variant="outline" size="md">
                View Live Tracking
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Sections */}
      <div className="animate-feature-section"><PlatformOverviewSection /></div>
      <div className="animate-feature-section"><RouteManagementSection /></div>
      <div className="animate-feature-section"><RoleExperiencesSection /></div>
      <div className="animate-feature-section"><HowItWorksSection /></div>
      <div className="animate-feature-section"><StatsSection /></div>
      <div className="animate-feature-section"><FinalCTASection /></div>
    </PublicLayout>
  );
};

export default FeaturesPage;
