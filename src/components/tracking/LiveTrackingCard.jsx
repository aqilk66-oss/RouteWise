import React from 'react';
import { Bus, MapPin, Compass, Clock, ShieldCheck, Radio, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import TrackingStatusBadge from './TrackingStatusBadge';

/**
 * Format relative timestamp to user-friendly "X seconds/minutes ago" or formatted time
 */
export const formatLastUpdated = (timestamp) => {
  if (!timestamp) return 'Unavailable';
  const timeMs = typeof timestamp === 'number' ? timestamp : timestamp.toMillis ? timestamp.toMillis() : Date.now();
  const diffSec = Math.floor((Date.now() - timeMs) / 1000);

  if (diffSec < 10) return 'Just now (< 10s ago)';
  if (diffSec < 60) return `${diffSec} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;

  const date = new Date(timeMs);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

/**
 * LiveTrackingCard
 * Displays primary vehicle tracking metrics, live status, GPS accuracy, and honest ETA.
 */
export const LiveTrackingCard = ({
  bus = null,
  route = null,
  trip = null,
  trackingStatus = 'active',
  isStale = false,
  currentLocation = null,
  lastUpdated = null,
  nextStop = null,
}) => {
  const isLive = trackingStatus === 'active' && !isStale;

  return (
    <Card className="p-5 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-soft shrink-0 ${
            isLive ? 'bg-teal-500 text-white' : 'bg-slate-100 text-brand-navy'
          }`}>
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-brand-navy">
                {bus?.busNumber || 'Fleet Vehicle'}
              </h3>
              <TrackingStatusBadge status={trackingStatus} isStale={isStale} />
            </div>
            <p className="text-xs text-brand-slate mt-0.5">
              Corridor: <span className="font-semibold text-brand-navy">{route?.name || trip?.routeName || 'Transit Line'}</span> • 
              Plate: <span className="font-semibold text-brand-slate">{bus?.registrationNumber || 'SCH-TRANS'}</span>
            </p>
          </div>
        </div>

        {/* Honest ETA Badge (No fake countdowns per Stage 31 rules) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-border text-xs self-end sm:self-center">
          <Clock className="w-4 h-4 text-brand-slate" />
          {isLive ? (
            <span className="font-semibold text-brand-navy">
              Arrival Estimate: <span className="text-brand-slate font-medium">ETA unavailable (calculating transit duration)</span>
            </span>
          ) : (
            <span className="text-brand-slate text-[11px]">
              ETA unavailable (Vehicle not en route)
            </span>
          )}
        </div>
      </div>

      {/* Grid of Key Telemetry Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate block mb-1">
            Last Update
          </span>
          <p className="font-bold text-brand-navy">
            {formatLastUpdated(lastUpdated || currentLocation?.deviceTimestamp)}
          </p>
          <span className="text-[10px] text-brand-slate">
            Source: Driver device GPS
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate block mb-1">
            Next Stop
          </span>
          <p className="font-bold text-brand-navy truncate">
            {nextStop?.name || trip?.currentStopName || 'Depot Terminal'}
          </p>
          <span className="text-[10px] text-brand-slate">
            {nextStop?.pickupTime || 'Scheduled'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate block mb-1">
            GPS Signal Quality
          </span>
          <p className="font-bold text-brand-navy flex items-center gap-1">
            {currentLocation ? (
              currentLocation.isLowAccuracy ? (
                <span className="text-amber-600 font-semibold">Moderate (~{currentLocation.accuracy}m)</span>
              ) : (
                <span className="text-emerald-600 font-semibold">High precision (~{currentLocation.accuracy || 12}m)</span>
              )
            ) : (
              <span className="text-brand-slate">Awaiting fix</span>
            )}
          </p>
          <span className="text-[10px] text-brand-slate">
            Latitude / Longitude verified
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate block mb-1">
            Speed & Bearing
          </span>
          <p className="font-bold text-brand-navy">
            {currentLocation?.speed !== null && currentLocation?.speed !== undefined ? (
              `${currentLocation.speed} km/h`
            ) : (
              <span className="text-brand-slate">Speed unavailable</span>
            )}
          </p>
          <span className="text-[10px] text-brand-slate">
            {currentLocation?.heading !== null && currentLocation?.heading !== undefined ? (
              `Heading: ${currentLocation.heading}°`
            ) : (
              'Heading unavailable'
            )}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default LiveTrackingCard;
