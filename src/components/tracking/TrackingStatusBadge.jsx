import React from 'react';
import { Radio, Clock, AlertTriangle, WifiOff, MapPin, CheckCircle2 } from 'lucide-react';
import { TRACKING_STATUS } from '../../services/tracking/trackingService';

/**
 * TrackingStatusBadge
 * Communicates live tracking state with icon, text, and accessible semantics.
 */
export const TrackingStatusBadge = ({ status, isStale = false, className = '' }) => {
  if (isStale || status === TRACKING_STATUS.STALE) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping opacity-75" />
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>Location Delayed (Stale)</span>
      </span>
    );
  }

  switch (status) {
    case TRACKING_STATUS.ACTIVE:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 ${className}`}>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
          <span>Live Tracking Active</span>
        </span>
      );

    case TRACKING_STATUS.WAITING:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand-blue border border-blue-200 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-brand-blue animate-spin-slow" />
          <span>Waiting for Location</span>
        </span>
      );

    case TRACKING_STATUS.OFFLINE:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 ${className}`}>
          <WifiOff className="w-3.5 h-3.5 text-rose-600" />
          <span>Connection Interrupted</span>
        </span>
      );

    case TRACKING_STATUS.STOPPED:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Tracking Inactive</span>
        </span>
      );

    case TRACKING_STATUS.PERMISSION_REQUIRED:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>GPS Permission Needed</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Live Location Unavailable</span>
        </span>
      );
  }
};

export default TrackingStatusBadge;
