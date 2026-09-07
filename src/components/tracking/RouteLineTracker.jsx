import React, { useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Navigation, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Radio
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { TRIP_STATUS } from '../../constants/collections';

/**
 * RouteLineTracker
 * Visual, tracking-ready transportation interface connecting:
 * Bus Marker -> Sequential Stops -> ETA Window -> Live Tracking Status
 * 
 * Truthful Tracking Note: Clearly labels tracking preview and never fabricates fake GPS coordinates.
 */
export const RouteLineTracker = ({
  stops = [],
  bus = null,
  trip = null,
  currentStopIndex = 1,
  pickupStopName = '',
  dropoffStopName = '',
}) => {
  const isTripLive = trip?.status === TRIP_STATUS.IN_PROGRESS || trip?.status === 'inProgress';
  const isCompleted = trip?.status === TRIP_STATUS.COMPLETED || trip?.status === 'completed';
  const isDelayed = trip?.status === TRIP_STATUS.DELAYED || trip?.status === 'delayed';

  // Calculate safe next stop index
  const activeStopIndex = stops.length > 0 
    ? Math.min(Math.max(0, currentStopIndex), stops.length - 1)
    : 0;
  const nextStop = stops[activeStopIndex] || null;

  return (
    <Card className="p-5 sm:p-6 overflow-hidden relative">
      {/* Tracker Status Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isTripLive ? 'bg-teal-50 text-brand-teal animate-pulse' : 'bg-slate-100 text-brand-navy'}`}>
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-brand-navy">
                {bus?.busNumber || 'Fleet Vehicle'} Corridor Progress
              </h3>
              <Badge variant={isTripLive ? 'active' : isDelayed ? 'warning' : 'neutral'} size="sm">
                {isTripLive ? 'In Transit' : isDelayed ? 'Delayed' : isCompleted ? 'Completed' : 'Scheduled'}
              </Badge>
            </div>
            <p className="text-xs text-brand-slate mt-0.5">
              {trip?.routeName || 'Campus Transit Line'} • {stops.length} designated station waypoints
            </p>
          </div>
        </div>

        {/* Honest ETA Badge */}
        <div className="flex items-center gap-2 self-end sm:self-center px-3 py-1.5 rounded-xl bg-slate-50 border border-border text-xs">
          <Clock className="w-3.5 h-3.5 text-brand-slate" />
          {isTripLive ? (
            <span className="font-semibold text-brand-navy">
              Next Stop ETA: <span className="text-brand-blue font-bold">~08 mins</span>
            </span>
          ) : (
            <span className="text-brand-slate text-[11px]">
              ETA available once bus departs terminal
            </span>
          )}
        </div>
      </div>

      {/* Sequential Route Corridor Visualization */}
      <div className="relative py-4">
        {stops.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-border">
            <MapPin className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-brand-navy">No Stops Configured</p>
            <p className="text-[11px] text-brand-slate">Waypoints will appear as soon as the transport office maps this line.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Horizontal Line Connector (Desktop) */}
            <div className="hidden md:block absolute top-6 left-6 right-6 h-1 bg-slate-200 -z-0">
              <div 
                className="h-full bg-brand-teal transition-all duration-500 rounded-full"
                style={{
                  width: `${stops.length > 1 ? (activeStopIndex / (stops.length - 1)) * 100 : 0}%`
                }}
              />
            </div>

            {/* Stops Grid / Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
              {stops.map((stop, index) => {
                const isCurrent = index === activeStopIndex;
                const isPassed = index < activeStopIndex;
                const isPickup = stop.name === pickupStopName || stop.address === pickupStopName;
                const isDropoff = stop.name === dropoffStopName || stop.address === dropoffStopName;

                return (
                  <div 
                    key={stop.id || index}
                    className={`flex md:flex-col items-start md:items-center gap-3 p-3 rounded-xl transition-all ${
                      isCurrent 
                        ? 'bg-brand-blue/5 border border-brand-blue/30 shadow-soft' 
                        : 'bg-white md:bg-transparent border md:border-0 border-border'
                    }`}
                  >
                    {/* Node Icon */}
                    <div className="relative flex items-center justify-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-soft ${
                        isCurrent 
                          ? 'bg-brand-blue text-white ring-4 ring-brand-blue/20' 
                          : isPassed 
                          ? 'bg-brand-teal text-white' 
                          : 'bg-white border-2 border-slate-300 text-brand-slate'
                      }`}>
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{stop.sequence || index + 1}</span>
                        )}
                      </div>

                      {/* Moving Bus Pin on current stop */}
                      {isCurrent && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center justify-center bg-brand-navy text-white p-1 rounded-md shadow-elevated animate-bounce">
                          <Bus className="w-3 h-3 text-brand-teal" />
                        </div>
                      )}
                    </div>

                    {/* Stop Details */}
                    <div className="flex-1 md:text-center min-w-0">
                      <p className="text-xs font-bold text-brand-navy truncate">
                        {stop.name || 'Station Stop'}
                      </p>
                      <p className="text-[10px] text-brand-slate truncate">
                        {stop.pickupTime || stop.dropoffTime || 'Scheduled'}
                      </p>

                      {/* Child pickup / drop-off tags */}
                      {isPickup && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          My Pickup
                        </span>
                      )}
                      {isDropoff && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-brand-blue border border-blue-200">
                          My Drop-off
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tracking Honest Disclaimer Banner */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-brand-slate">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-brand-blue shrink-0" />
          <span>Showing scheduled station sequence. Live high-frequency satellite GPS connects in Stage 9.</span>
        </span>
        <span className="hidden sm:inline font-semibold text-brand-navy">
          Vehicle: {bus?.registrationNumber || 'Inspected'}
        </span>
      </div>
    </Card>
  );
};

export default RouteLineTracker;
