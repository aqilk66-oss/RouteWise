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
      <div className="hero-eyebrow inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-brand-blue/20 text-brand-blue text-xs font-semibold mb-6 shadow-[0_2px_12px_rgba(2,132,199,0.08)] backdrop-blur-md transition-all duration-300 hover:border-brand-blue/40">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal" />
        </span>
        <span className="font-semibold tracking-wide text-[11px] uppercase">{data.eyebrow}</span>
      </div>

      {/* Main H1 Headline with Refined Gradient & Leading */}
      <h1 className="hero-headline text-display text-brand-navy tracking-tight font-extrabold mb-6 leading-[1.08]">
        <span className="block overflow-hidden">
          <span className="hero-line block">{data.headlineLines[0]}</span>
        </span>
        <span className="block overflow-hidden">
          <span className="hero-line block bg-gradient-to-r from-brand-blue via-cyan-500 to-brand-teal bg-clip-text text-transparent">
            {data.headlineLines[1]}
          </span>
        </span>
        <span className="block overflow-hidden">
          <span className="hero-line block text-slate-800">{data.headlineLines[2]}</span>
        </span>
      </h1>

      {/* Supporting Copy */}
      <p className="hero-description text-body-large text-brand-slate leading-relaxed mb-8 max-w-xl font-normal">
        {data.description}
      </p>

      {/* Action Buttons Group with Glassmorphism & Shadow Depth */}
      <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-8">
        <Link to="/login" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            className="w-full sm:w-auto px-7 py-3.5 shadow-[0_10px_25px_-5px_rgba(2,132,199,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(2,132,199,0.45)] transition-all hover:scale-[1.02] font-semibold text-sm rounded-xl"
          >
            Launch Portals
          </Button>
        </Link>
        <Link to="/admin" className="w-full sm:w-auto">
          <Button
            variant="glass"
            size="lg"
            icon={Compass}
            className="w-full sm:w-auto px-7 py-3.5 border border-slate-200/90 bg-white/80 hover:bg-white text-brand-navy shadow-sm hover:shadow-md transition-all hover:scale-[1.02] font-semibold text-sm rounded-xl"
          >
            School Admin Demo
          </Button>
        </Link>
      </div>

      {/* Quick Portal Switcher Pills with Modern Micro-Interactions */}
      <div className="hero-portals flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-2xl bg-slate-50/90 border border-slate-200/60 backdrop-blur-sm">
        <span className="text-[11px] font-bold text-brand-slate uppercase tracking-wider px-2">Portals:</span>
        <Link to="/super-admin" className="px-3 py-1 rounded-xl bg-purple-50/90 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200/80 transition-all hover:scale-[1.03] shadow-xs">
          Super Admin
        </Link>
        <Link to="/admin" className="px-3 py-1 rounded-xl bg-blue-50/90 hover:bg-blue-100 text-brand-blue text-xs font-semibold border border-blue-200/80 transition-all hover:scale-[1.03] shadow-xs">
          School Admin
        </Link>
        <Link to="/parent" className="px-3 py-1 rounded-xl bg-teal-50/90 hover:bg-teal-100 text-teal-700 text-xs font-semibold border border-teal-200/80 transition-all hover:scale-[1.03] shadow-xs">
          Parent Hub
        </Link>
        <Link to="/driver" className="px-3 py-1 rounded-xl bg-amber-50/90 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200/80 transition-all hover:scale-[1.03] shadow-xs">
          Driver HUD
        </Link>
      </div>

      {/* Trust & Status Card Element with Real-Time Indicator */}
      <div className="hero-trust pt-6 border-t border-border/80 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-brand-teal/25 text-brand-teal flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-brand-navy tracking-tight">{data.trustBadge.title}</h4>
            <p className="text-[11px] text-brand-slate mt-0.5">{data.trustBadge.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-[11px] text-brand-navy font-semibold bg-white/95 px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] shrink-0">
          <Activity className="w-3.5 h-3.5 text-brand-blue animate-pulse" />
          <span>{data.trustBadge.statusText}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
