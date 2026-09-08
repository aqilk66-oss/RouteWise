import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bus, 
  Play, 
  Square, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Radio, 
  RefreshCw, 
  ShieldCheck, 
  Compass, 
  Clock, 
  AlertCircle,
  Navigation
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import TrackingStatusBadge from '../../components/tracking/TrackingStatusBadge';
import LiveTrackingCard from '../../components/tracking/LiveTrackingCard';
import LocationPermissionBanner from '../../components/tracking/LocationPermissionBanner';
import TrackingVisualMap from '../../components/tracking/TrackingVisualMap';
import RouteWiseMap from '../../components/map/RouteWiseMap';
import { useDriverTransport } from '../../context/DriverTransportContext';
import locationManager, { LOCATION_ERROR_CODES } from '../../services/tracking/locationManager';
import trackingService, { TRACKING_STATUS } from '../../services/tracking/trackingService';
import { TRIP_STATUS } from '../../constants/collections';

export const DriverTrackingPage = () => {
  const { 
    driverProfile,
    assignedBus, 
    assignedRoute, 
    routeStops, 
    activeTrip, 
    loading, 
    refreshData, 
    refreshing 
  } = useDriverTransport();

  // Local state
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState(TRACKING_STATUS.STOPPED);
  const [permissionState, setPermissionState] = useState('prompt');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [lastTransmitted, setLastTransmitted] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeStopIndex, setActiveStopIndex] = useState(0);

  const isTripActive = activeTrip?.status === TRIP_STATUS.IN_PROGRESS || activeTrip?.status === 'inProgress';

  // Check initial permission state
  useEffect(() => {
    locationManager.getPermissionStatus().then((status) => {
      setPermissionState(status);
    });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  /**
   * Handle incoming validated coordinates from LocationManager
   */
  const handleLocationUpdate = useCallback(async (locationData) => {
    setCurrentLocation(locationData);
    setTrackingStatus(TRACKING_STATUS.ACTIVE);
    setErrorMessage(null);

    if (activeTrip?.id) {
      try {
        await trackingService.publishDriverLocation(activeTrip.id, locationData, {
          busId: assignedBus?.id,
          driverId: driverProfile?.id || activeTrip?.driverId,
          routeId: assignedRoute?.id || activeTrip?.routeId,
          schoolId: activeTrip?.schoolId || assignedRoute?.schoolId,
        });
        setLastTransmitted(Date.now());
      } catch (err) {
        console.warn('Driver tracking transmission error:', err.message);
        setErrorMessage('Location acquired, but transmission to dispatch failed. Retrying...');
      }
    }
  }, [activeTrip, assignedBus?.id, assignedRoute?.id, driverProfile?.id]);

  /**
   * Handle LocationManager errors
   */
  const handleLocationError = useCallback((error) => {
    if (error.code === LOCATION_ERROR_CODES.PERMISSION_DENIED) {
      setPermissionState('denied');
      setTrackingStatus(TRACKING_STATUS.PERMISSION_REQUIRED);
    } else {
      setTrackingStatus(TRACKING_STATUS.OFFLINE);
    }
    setErrorMessage(error.message);
  }, []);

  /**
   * Start Live Tracking explicitly
   */
  const handleStartTracking = () => {
    if (!isTripActive) {
      alert('You must have an active trip in transit before starting live tracking.');
      return;
    }

    setErrorMessage(null);
    setTrackingStatus(TRACKING_STATUS.WAITING);

    const watchId = locationManager.startWatching({
      onLocationUpdate: handleLocationUpdate,
      onError: handleLocationError,
    });

    if (watchId !== null) {
      setIsTracking(true);
      setPermissionState('granted');
      showToast('Live GPS tracking initiated. Location streaming to dispatch.');
    }
  };

  /**
   * Stop Live Tracking explicitly
   */
  const handleStopTrackingConfirm = async () => {
    setIsStopConfirmOpen(false);
    setActionLoading(true);

    try {
      locationManager.stopWatching();
      setIsTracking(false);
      setTrackingStatus(TRACKING_STATUS.STOPPED);

      if (activeTrip?.id) {
        await trackingService.stopTripTracking(activeTrip.id);
      }
      showToast('Live tracking paused. Bus location will no longer broadcast.');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Safe cleanup on unmount or when leaving the page
  useEffect(() => {
    return () => {
      locationManager.stopWatching();
    };
  }, []);

  // If trip ends externally, automatically stop watcher
  useEffect(() => {
    if (!isTripActive && isTracking) {
      locationManager.stopWatching();
      setIsTracking(false);
      setTrackingStatus(TRACKING_STATUS.STOPPED);
    }
  }, [isTripActive, isTracking]);

  return (
    <DashboardLayout title="Live Bus GPS & Driver Tracking Console">
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-fade-in shadow-soft">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Permission Advisory Banner */}
        <LocationPermissionBanner
          permissionState={permissionState}
          onRequestPermission={handleStartTracking}
          loading={actionLoading}
        />

        {/* Primary Controller Hero Card */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-soft ${
              isTracking ? 'bg-teal-500 text-white animate-pulse' : 'bg-brand-navy text-white'
            }`}>
              <Radio className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h2 className="text-xl font-bold text-brand-navy">
                  {assignedRoute?.name || activeTrip?.routeName || 'Transit Route'}
                </h2>
                <TrackingStatusBadge status={trackingStatus} />
              </div>
              <p className="text-xs text-brand-slate">
                Bus: <span className="font-bold text-brand-navy">{assignedBus?.busNumber || 'Assigned'}</span> • 
                Trip ID: <span className="font-semibold text-brand-blue">{activeTrip?.id || 'No Active Trip'}</span> • 
                Plate: <span className="font-semibold text-brand-slate">{assignedBus?.registrationNumber || 'SCH-9921'}</span>
              </p>
            </div>
          </div>

          {/* Big, accessible Start / Stop controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <Button
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={refreshData}
              loading={refreshing}
            >
              Sync State
            </Button>

            {!isTracking ? (
              <Button
                variant="primary"
                size="md"
                icon={Play}
                onClick={handleStartTracking}
                disabled={!isTripActive}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-7 shadow-soft"
              >
                Start Live Tracking
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                icon={Square}
                onClick={() => setIsStopConfirmOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-7 shadow-soft"
              >
                Stop Live Tracking
              </Button>
            )}
          </div>
        </div>

        {/* Error Notification banner if GPS or network dropped */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Geospatial Operational Road Map */}
        <RouteWiseMap
          stops={routeStops}
          school={assignedRoute?.school || null}
          activeBus={currentLocation ? {
            busNumber: assignedBus?.busNumber || 'Assigned',
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            heading: currentLocation.heading,
            speed: currentLocation.speed,
            accuracy: currentLocation.accuracy,
            isLive: isTracking,
            trackingStatus: trackingStatus,
            lastUpdated: lastTransmitted
          } : null}
          activeStopIndex={activeStopIndex}
          height="380px"
          fallbackText="Vehicle live GPS coordinates and route will render here once tracking begins."
        />

        {/* Spatial Visual Route Visualizer */}
        <TrackingVisualMap
          stops={routeStops}
          currentLocation={currentLocation}
          isLive={isTracking}
          isStale={false}
          busNumber={assignedBus?.busNumber || 'Fleet Vehicle'}
          activeStopIndex={activeStopIndex}
        />

        {/* Telemetry Detail Card */}
        <LiveTrackingCard
          bus={assignedBus}
          route={assignedRoute}
          trip={activeTrip}
          trackingStatus={trackingStatus}
          currentLocation={currentLocation}
          lastUpdated={lastTransmitted}
          nextStop={routeStops[activeStopIndex]}
        />

        {/* Driver Safety Protocol Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-teal shrink-0" />
            <div>
              <p className="font-bold">Safe Mobile Operating Protocol</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Keep phone securely mounted. Do not interact with tracking controls while the vehicle is in motion.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            GPS Transmission Rate: Controlled (6–25s)
          </span>
        </div>

        {/* Stop Tracking Confirmation Modal */}
        <Modal
          isOpen={isStopConfirmOpen}
          onClose={() => setIsStopConfirmOpen(false)}
          title="Stop Live Bus Tracking?"
          subtitle="Authorized users will no longer receive your current bus location."
        >
          <div className="space-y-4 text-xs">
            <p className="text-brand-slate leading-relaxed">
              Pausing live tracking disables GPS updates. If your run is still in transit, waiting parents and students will see your vehicle status as stationary or delayed.
            </p>
            <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsStopConfirmOpen(false)}>
                Continue Tracking
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStopTrackingConfirm}
                loading={actionLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Confirm Stop
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default DriverTrackingPage;
