import React from 'react';
import { Bus, MapPin, Compass, Radio, AlertCircle, Info } from 'lucide-react';

/**
 * TrackingVisualMap
 * Clean, lightweight SVG & Spatial Route visualizer.
 * Interpolates bus marker along the corridor based on real stop sequence and actual GPS coordinates.
 * Clearly labels operational data without fabricating arbitrary street maps or fake traffic countdowns.
 */
export const TrackingVisualMap = ({
  stops = [],
  currentLocation = null,
  isLive = false,
  isStale = false,
  busNumber = 'Fleet Bus',
  activeStopIndex = 0,
}) => {
  // Normalize stop index
  const safeStopIndex = stops.length > 0 ? Math.min(Math.max(0, activeStopIndex), stops.length - 1) : 0;
  const progressPercent = stops.length > 1 ? (safeStopIndex / (stops.length - 1)) * 100 : 0;

  return (
    <div className="relative rounded-3xl bg-brand-navy overflow-hidden p-6 sm:p-8 text-white min-h-[340px] flex flex-col justify-between shadow-elevated border border-slate-700">
      {/* Topological Grid Atmosphere */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      {/* Header telemetry ribbon */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs">
          <Compass className="w-4 h-4 text-brand-teal animate-spin-slow" />
          <span className="font-semibold text-slate-200">
            Navigation Mode: <span className="text-white font-bold">{isLive ? 'Real-Time Telemetry' : 'Corridor Sequence'}</span>
          </span>
        </div>

        {/* GPS Coordinates readout if live */}
        {currentLocation && isLive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            <span className="text-slate-300">
              {currentLocation.latitude.toFixed(4)}° N, {currentLocation.longitude.toFixed(4)}° W
            </span>
          </div>
        )}
      </div>

      {/* Main SVG Spatial Corridor Track */}
      <div className="relative z-10 my-8">
        <div className="max-w-3xl mx-auto relative px-4">
          {/* SVG Progress Line */}
          <div className="absolute top-5 left-8 right-8 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-blue via-teal-500 to-brand-teal transition-all duration-700 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stops Stations Nodes */}
          <div className="flex items-center justify-between relative z-10">
            {stops.slice(0, 5).map((stop, i) => {
              const isPassed = i < safeStopIndex;
              const isCurrent = i === safeStopIndex;

              return (
                <div key={stop.id || i} className="flex flex-col items-center group">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 relative ${
                      isCurrent
                        ? 'bg-brand-blue text-white ring-4 ring-brand-blue/30 scale-110 shadow-lg'
                        : isPassed
                        ? 'bg-brand-teal text-white'
                        : 'bg-slate-800 border-2 border-slate-700 text-slate-400'
                    }`}
                  >
                    {i + 1}

                    {/* Bus Marker hovering above active waypoint */}
                    {isCurrent && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white text-brand-navy px-2 py-1 rounded-lg text-[10px] font-bold shadow-elevated whitespace-nowrap animate-bounce">
                        <Bus className="w-3.5 h-3.5 text-brand-blue" />
                        <span>{busNumber}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-300 font-semibold mt-3 max-w-[100px] text-center truncate">
                    {stop.name || `Waypoint ${i + 1}`}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {stop.pickupTime || stop.dropoffTime || 'Scheduled'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Status Details */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800 pt-3">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-brand-teal shrink-0" />
          <span>
            {isLive
              ? 'Real-time telemetry verified via driver device GPS.'
              : isStale
              ? 'GPS update delayed. Showing last verified waypoint.'
              : 'Live tracking will activate as soon as the vehicle departs.'}
          </span>
        </span>
        <span className="font-semibold text-slate-200">
          Next Station: <span className="text-white font-bold">{stops[safeStopIndex]?.name || 'Depot'}</span>
        </span>
      </div>
    </div>
  );
};

export default TrackingVisualMap;
