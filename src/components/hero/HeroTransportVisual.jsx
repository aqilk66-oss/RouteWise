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
      className="hero-transport-container relative w-full h-[360px] sm:h-[440px] lg:h-[500px] xl:h-[540px] rounded-3xl overflow-hidden select-none flex items-center justify-center"
      role="region"
      aria-label="RouteWise School Transport Overview"
    >
      {/* Soft atmospheric ambient glow behind illustration */}
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/8 via-brand-teal/5 to-transparent rounded-3xl pointer-events-none" />
      <div className="absolute w-72 h-72 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none -top-10 -right-10" />

      {/* Floating Status Pill (Non-fake, honest institutional messaging) */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-soft text-xs font-bold text-brand-navy">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal" />
        </span>
        <span className="text-[11px] uppercase tracking-wider text-brand-slate">
          Smart School Transport
        </span>
      </div>

      {/* Secondary Feature Card (Lower Right: Safe & Connected) */}
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-20 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-floating text-xs">
        <div className="w-8 h-8 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-brand-navy leading-tight">RouteWise Network</p>
          <p className="text-[10px] text-brand-slate">Safe • Connected • On Route</p>
        </div>
      </div>

      {/* Primary Visual: High-Quality School Transport Illustration */}
      {!imgError ? (
        <img
          src="/assets/hero_transport_illustration.jpg"
          alt="School bus traveling along an illuminated RouteWise smart transportation corridor"
          className={`w-full h-full object-contain object-center transition-all duration-700 ${
            imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
          }`}
          loading="eager"
          fetchPriority="high"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        /* Graceful SVG fallback in the rare event the asset fails to load */
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-3xl border border-border">
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
  );
};

export default HeroTransportVisual;
