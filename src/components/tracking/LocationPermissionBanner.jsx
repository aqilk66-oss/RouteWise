import React from 'react';
import { ShieldAlert, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

/**
 * LocationPermissionBanner
 * Communicates clearly to the driver why device location is required during an active run,
 * with explicit opt-in controls and browser permission troubleshooting.
 */
export const LocationPermissionBanner = ({
  permissionState = 'prompt',
  onRequestPermission,
  loading = false,
}) => {
  if (permissionState === 'granted') return null;

  const isDenied = permissionState === 'denied';

  return (
    <div className={`p-5 rounded-3xl border ${
      isDenied ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-blue-50 border-blue-200 text-brand-navy'
    } shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
      <div className="flex items-start gap-3.5">
        <div className={`p-2.5 rounded-2xl ${
          isDenied ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-brand-blue'
        } shrink-0`}>
          {isDenied ? <ShieldAlert className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
        </div>
        <div>
          <h4 className="text-sm font-bold">
            {isDenied ? 'Location Permission Blocked' : 'Driver GPS Location Sharing Required'}
          </h4>
          <p className="text-xs text-brand-slate mt-0.5 max-w-xl">
            {isDenied
              ? 'Your browser has blocked location access. Please click the site settings / lock icon in your address bar, enable Location permissions for RouteWise, and refresh the page.'
              : 'RouteWise requires your device location while this trip is in transit to transmit real-time bus arrival milestones to waiting parents, students, and dispatch.'}
          </p>
        </div>
      </div>

      {!isDenied && (
        <Button
          variant="primary"
          size="sm"
          onClick={onRequestPermission}
          loading={loading}
          className="shrink-0 font-bold"
        >
          Enable Location
        </Button>
      )}

      {isDenied && (
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => window.location.reload()}
          className="shrink-0 text-rose-700 border-rose-300 hover:bg-rose-100"
        >
          Reload Page
        </Button>
      )}
    </div>
  );
};

export default LocationPermissionBanner;
