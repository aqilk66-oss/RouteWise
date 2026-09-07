import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Activity } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Textual, typography, and CTA action column of the Hero
 */
export const HeroContent = ({ data }) => {
  return (
    <div className="flex flex-col items-start text-left max-w-xl lg:max-w-none">
      {/* Eyebrow Pill */}
      <div className="hero-eyebrow inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-brand-blue/20 text-brand-blue text-xs font-semibold mb-6 shadow-subtle backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
        <span>{data.eyebrow}</span>
      </div>

      {/* Main H1 Headline with Line Clipping Animation Targets */}
      <h1 className="hero-headline text-display text-brand-navy tracking-tight font-extrabold mb-6">
        <span className="block overflow-hidden">
          <span className="hero-line block">{data.headlineLines[0]}</span>
        </span>
        <span className="block overflow-hidden">
          <span className="hero-line block bg-gradient-to-r from-brand-blue to-brand-teal bg-clip-text text-transparent">
            {data.headlineLines[1]}
          </span>
        </span>
        <span className="block overflow-hidden">
          <span className="hero-line block">{data.headlineLines[2]}</span>
        </span>
      </h1>

      {/* Supporting Copy */}
      <p className="hero-description text-body-large text-brand-slate leading-relaxed mb-8 max-w-lg">
        {data.description}
      </p>

      {/* Action Buttons Group */}
      <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-6">
        <Link to="/login" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            className="w-full sm:w-auto shadow-medium hover:shadow-floating transition-all hover:scale-[1.02]"
          >
            Launch Portals
          </Button>
        </Link>
        <Link to="/admin" className="w-full sm:w-auto">
          <Button
            variant="glass"
            size="lg"
            icon={Compass}
            className="w-full sm:w-auto border border-border/80 hover:bg-white transition-all hover:scale-[1.02]"
          >
            School Admin Demo
          </Button>
        </Link>
      </div>

      {/* Quick Portal Switcher Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-8">
        <span className="text-[11px] font-bold text-brand-slate mr-1">Direct Portals:</span>
        <Link to="/super-admin" className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition-colors">
          Super Admin
        </Link>
        <Link to="/admin" className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-blue text-xs font-semibold border border-blue-200 transition-colors">
          School Admin
        </Link>
        <Link to="/parent" className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold border border-teal-200 transition-colors">
          Parent Hub
        </Link>
        <Link to="/driver" className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors">
          Driver HUD
        </Link>
      </div>

      {/* Trust & Status Card Element */}
      <div className="hero-trust pt-6 border-t border-border/70 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-brand-navy">{data.trustBadge.title}</h4>
            <p className="text-[11px] text-brand-slate">{data.trustBadge.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-brand-slate font-medium bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
          <Activity className="w-3.5 h-3.5 text-brand-blue" />
          <span>{data.trustBadge.statusText}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
