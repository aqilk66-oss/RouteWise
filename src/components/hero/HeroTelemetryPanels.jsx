import React from 'react';
import { Bus, MapPin, ShieldCheck, Clock, Navigation } from 'lucide-react';
import Badge from '../ui/Badge';

/**
 * Spatial UI floating info panels layered seamlessly around the 3D scene
 */
export const HeroTelemetryPanels = ({ telemetry }) => {
  return (
    <>
      {/* Top Left Floating Panel: Bus Status */}
      <div className="hero-telemetry-panel absolute top-4 sm:top-8 left-2 sm:left-6 z-20 glass-panel-elevated p-3.5 sm:p-4 rounded-2xl max-w-[210px] sm:max-w-[230px] border border-white/80 shadow-floating transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-brand-navy">{telemetry.busId}</span>
          </div>
          <Badge variant="active" size="sm" dot>{telemetry.status}</Badge>
        </div>
        <div className="space-y-1 text-[11px] text-brand-slate">
          <div className="flex items-center justify-between">
            <span>Speed</span>
            <span className="font-semibold text-brand-navy">{telemetry.speed}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Next Arrival</span>
            <span className="font-semibold text-brand-blue font-mono">{telemetry.eta}</span>
          </div>
        </div>
      </div>

      {/* Bottom Right Floating Panel: Route Waypoint & Security */}
      <div className="hero-telemetry-panel absolute bottom-4 sm:bottom-8 right-2 sm:right-6 z-20 glass-panel-elevated p-3.5 sm:p-4 rounded-2xl max-w-[220px] sm:max-w-[250px] border border-white/80 shadow-floating transition-transform hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-brand-teal">{telemetry.safetyStatus}</p>
            <p className="text-xs font-bold text-brand-navy leading-tight">{telemetry.destination}</p>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-slate-50/90 border border-slate-100 flex items-center gap-2 text-[11px] text-brand-slate">
          <MapPin className="w-3.5 h-3.5 text-brand-blue shrink-0" />
          <span className="truncate">Approaching: {telemetry.nextStop}</span>
        </div>
      </div>

      {/* Central Floating Micro Status Chip */}
      <div className="hero-telemetry-panel absolute top-4 sm:top-6 right-4 sm:right-10 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-accent shadow-soft text-xs font-semibold text-brand-navy">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Live Telemetry Broadcast</span>
      </div>
    </>
  );
};

export default HeroTelemetryPanels;
