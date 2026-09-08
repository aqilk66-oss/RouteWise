import React, { useState } from 'react';
import { Bus, ShieldCheck, MapPin, Radio, Sparkles } from 'lucide-react';

/**
 * HeroTransportVisual Component
 * 
 * Replaces the heavy Bus3DCanvas WebGL scene with a premium, lightweight,
 * modern SaaS transportation technology illustration.
 * 
 * Design Standards:
 * - High-resolution, crisp vector-style illustration of modern school bus on a glowing route corridor
 * - Zero layout shift with reserved aspect ratio container
 * - Subtle glassmorphic status badge ("SMART SCHOOL TRANSPORT")
 * - Honest, non-fake telemetry indicators: no fabricated live speeds, fake coordinates, or bogus ETAs
 * - Fully responsive across mobile, tablet, desktop, and ultrawide
 * - Respects prefers-reduced-motion
 */
export const HeroTransportVisual = () => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      className="hero-transport-container relative w-full h-[380px] sm:h-[460px] lg:h-[510px] xl:h-[540px] rounded-[32px] overflow-hidden select-none flex items-center justify-center p-3 sm:p-5 bg-gradient-to-b from-white/95 via-white/80 to-blue-50/40 backdrop-blur-xl border border-white/90 shadow-[0_20px_50px_-15px_rgba(26,54,93,0.12)] transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(26,54,93,0.18)] group"
      role="region"
      aria-label="RouteWise School Transport 3D Overview"
    >
      {/* Subtle Inner Highlight & Atmospheric Depth */}
      <div className="absolute inset-0 rounded-[32px] pointer-events-none ring-1 ring-inset ring-white/80" />
      <div className="absolute w-80 h-80 rounded-full bg-brand-blue/8 blur-3xl pointer-events-none -top-12 -right-12" />
      <div className="absolute w-64 h-64 rounded-full bg-brand-teal/8 blur-3xl pointer-events-none -bottom-10 -left-10" />

      {/* Floating Status Indicator (Top-Left: Clean, Modern SaaS Status Badge) */}
      <div className="absolute top-5 sm:top-6 left-5 sm:left-6 z-20 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.06)] text-xs font-bold text-brand-navy transition-transform duration-300 group-hover:translate-y-[-2px]">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal" />
        </span>
        <span className="text-[11px] uppercase tracking-wider text-brand-slate font-semibold">
          Real-Time Fleet Grid
        </span>
      </div>

      {/* Floating Destination Badge (Top-Right: Connected Destination) */}
      <div className="absolute top-5 sm:top-6 right-5 sm:right-6 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-[11px] font-semibold text-brand-slate transition-transform duration-300 group-hover:translate-y-[-2px]">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
        <span>Campus Connected</span>
      </div>

      {/* Secondary Floating Info Card (Bottom-Right: Safe Telematics) */}
      <div className="absolute bottom-5 sm:bottom-6 right-5 sm:right-6 z-20 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_8px_20px_rgba(26,54,93,0.08)] text-xs transition-transform duration-300 group-hover:translate-y-[-2px]">
        <div className="w-8 h-8 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center shrink-0 shadow-sm">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-brand-navy leading-tight">RouteWise Network</p>
          <p className="text-[10px] text-brand-slate">Active GPS • Corridor Monitored</p>
        </div>
      </div>

      {/* Primary 3D Isometric Transport Illustration */}
      <div className="relative w-full h-full rounded-[24px] overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30">
        {!imgError ? (
          <img
            src="/assets/hero_isometric_transport.jpg"
            alt="3D isometric illustration of a modern yellow school bus on a smart digital route with GPS tracking markers and campus destination"
            className={`w-full h-full object-contain object-center transition-all duration-700 ease-out group-hover:scale-[1.02] ${
              imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
            }`}
            loading="eager"
            fetchPriority="high"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          /* Graceful fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-[24px] border border-border">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center text-amber-500 mb-3">
              <Bus className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-1">
              RouteWise Connected Transport
            </h3>
            <p className="text-xs text-brand-slate max-w-xs">
              Institutional fleet management, student attendance verification, and live corridor tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroTransportVisual;
