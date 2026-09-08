import React from 'react';
import { Bus, MapPin, ShieldCheck } from 'lucide-react';
import Badge from '../ui/Badge';

/**
 * Polished Telemetry Overlay Panels
 * 
 * Design Standards:
 * - Restrained glass surface with subtle borders and gentle shadows
 * - Explicitly labeled "DEMO TELEMETRY" to preserve data integrity and prevent deception
 * - Carefully positioned to avoid overlapping headline, CTA, or bus roof
 */
export const HeroTelemetryPanels = ({ telemetry }) => {
  return (
    <>
      {/* Top Left Floating Panel: Bus Status & Arrival */}
      <div 
        className="hero-telemetry-panel absolute top-3 sm:top-6 left-2 sm:left-6 z-20 glass-panel-elevated p-3 sm:p-3.5 rounded-2xl max-w-[190px] sm:max-w-[210px] border border-white/80 shadow-floating transition-transform hover:-translate-y-0.5"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <Bus className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-brand-navy">{telemetry?.busId || 'Bus 24'}</span>
          </div>
          <Badge variant="active" size="sm" dot>{telemetry?.status || 'On Route'}</Badge>
        </div>
        <div className="space-y-1 text-[11px] text-brand-slate">
          <div className="flex items-center justify-between">
            <span>Speed</span>
            <span className="font-semibold text-brand-navy font-mono">{telemetry?.speed || '28 mph'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Next Arrival</span>
            <span className="font-semibold text-brand-blue font-mono">{telemetry?.eta || '08 min'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Right Floating Panel: Route Waypoint & Protected Status */}
      <div 
        className="hero-telemetry-panel absolute bottom-3 sm:bottom-6 right-2 sm:right-6 z-20 glass-panel-elevated p-3 sm:p-3.5 rounded-2xl max-w-[200px] sm:max-w-[230px] border border-white/80 shadow-floating transition-transform hover:-translate-y-0.5"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-wider text-brand-teal">{telemetry?.safetyStatus || 'Trip Protected'}</p>
            <p className="text-xs font-bold text-brand-navy leading-tight truncate">{telemetry?.destination || 'Campus Terminal'}</p>
          </div>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-50/90 border border-slate-100 flex items-center gap-1.5 text-[10px] text-brand-slate">
          <MapPin className="w-3 h-3 text-brand-blue shrink-0" />
          <span className="truncate">Next: {telemetry?.nextStop || 'Lincoln Station'}</span>
        </div>
      </div>

      {/* Top Right System Badge: Transparent Demo Indicator */}
      <div className="hero-telemetry-panel absolute top-3 sm:top-6 right-3 sm:right-6 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-accent shadow-soft text-[11px] font-semibold text-brand-navy border border-white/80">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="tracking-wide">ROUTEWISE NETWORK DEMO</span>
      </div>
    </>
  );
};

export default HeroTelemetryPanels;
