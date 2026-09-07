import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Bus, 
  Clock, 
  ShieldCheck, 
  Radio, 
  RefreshCw,
  Compass,
  AlertCircle,
  Users
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LiveTrackingCard from '../../components/tracking/LiveTrackingCard';
import TrackingVisualMap from '../../components/tracking/TrackingVisualMap';
import RouteLineTracker from '../../components/tracking/RouteLineTracker';
import RouteWiseMap from '../../components/map/RouteWiseMap';
import { useParentTransport } from '../../context/ParentTransportContext';
import trackingService, { TRACKING_STATUS, getTrackingFreshness } from '../../services/tracking/trackingService';
import { TRIP_STATUS } from '../../constants/collections';

export const TrackingPage = () => {
  const { 
    selectedChild, 
    childBus, 
    childRoute, 
    routeStops, 
    todayTrip, 
    loading, 
    refreshData, 
    refreshing 
  } = useParentTransport();

  // Real-time subscribed trip state
  const [liveTripData, setLiveTripData] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);

  // Subscribe to real-time tracking updates when todayTrip is active
  useEffect(() => {
    const tripId = todayTrip?.id;
    if (!tripId) {
      setLiveTripData(null);
      setIsSubscribed(false);
      return;
    }

    setIsSubscribed(true);
    const unsubscribe = trackingService.subscribeToTripTracking(
      tripId,
      (updatedTrip) => {
        if (updatedTrip) {
          setLiveTripData(updatedTrip);
        }
      },
      (err) => {
        console.warn('Parent tracking subscription warning:', err.message);
        setSubscriptionError('Real-time connection interrupted. Showing cached state.');
      }
    );

    // Guaranteed unmount cleanup
    return () => {
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [todayTrip?.id]);

  // Merge static trip data with real-time Firestore document updates
  const activeTrip = liveTripData || todayTrip;
  const isTripLive = activeTrip?.status === TRIP_STATUS.IN_PROGRESS || activeTrip?.status === 'inProgress';
  const isCompleted = activeTrip?.status === TRIP_STATUS.COMPLETED || activeTrip?.status === 'completed';
  const isDelayed = activeTrip?.status === TRIP_STATUS.DELAYED || activeTrip?.status === 'delayed';

  const currentLocation = activeTrip?.currentLocation || null;
  const trackingStatus = activeTrip?.trackingStatus || (isTripLive ? TRACKING_STATUS.ACTIVE : TRACKING_STATUS.STOPPED);

  // Check freshness (stale detection)
  const freshness = getTrackingFreshness(activeTrip?.lastTrackingUpdate || currentLocation?.deviceTimestamp);
  const isStale = freshness === TRACKING_STATUS.STALE;

  return (
    <DashboardLayout title="Live Transit Route & Bus Progress">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-brand-navy">
                {selectedChild?.fullName || 'Student'}&apos;s Transit Bus
              </h2>
              {isTripLive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal" />
                </span>
              )}
            </div>
            <p className="text-xs text-brand-slate mt-0.5">
              Corridor: <span className="font-semibold text-brand-navy">{childRoute?.name || 'Express Line'}</span> • 
              Vehicle: <span className="font-semibold text-brand-blue">{childBus?.busNumber || 'Fleet Vehicle'}</span> • 
              Passenger: <span className="font-semibold text-brand-navy">{selectedChild?.pickupStop || 'Scheduled Stop'}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Update Location
          </Button>
        </div>

        {/* Real-Time Telemetry Card */}
        <LiveTrackingCard
          bus={childBus}
          route={childRoute}
          trip={activeTrip}
          trackingStatus={trackingStatus}
          isStale={isStale}
          currentLocation={currentLocation}
          lastUpdated={activeTrip?.lastTrackingUpdate || currentLocation?.deviceTimestamp}
          nextStop={routeStops[0]}
        />

        {/* Geospatial Operational Map */}
        <RouteWiseMap
          stops={routeStops}
          school={childRoute?.school || null}
          activeBus={currentLocation ? {
            busNumber: childBus?.busNumber || 'Fleet',
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            heading: currentLocation.heading,
            speed: currentLocation.speed,
            isLive: isTripLive && trackingStatus === TRACKING_STATUS.ACTIVE,
            trackingStatus: trackingStatus,
            lastUpdated: activeTrip?.lastTrackingUpdate || currentLocation?.deviceTimestamp
          } : null}
          activeStopIndex={0}
          height="380px"
          fallbackText="Vehicle live tracking and stops will render geographically once GPS coordinates are broadcast."
        />

        {/* Spatial Route Map Corridor */}
        <TrackingVisualMap
          stops={routeStops}
          currentLocation={currentLocation}
          isLive={isTripLive && trackingStatus === TRACKING_STATUS.ACTIVE}
          isStale={isStale}
          busNumber={childBus?.busNumber || 'Fleet Bus'}
          activeStopIndex={1}
        />

        {/* Detailed Route Waypoint Sequence Component */}
        <RouteLineTracker
          stops={routeStops}
          bus={childBus}
          trip={activeTrip}
          pickupStopName={selectedChild?.pickupStop}
          dropoffStopName={selectedChild?.dropoffStop}
        />
      </div>
    </DashboardLayout>
  );
};

export default TrackingPage;
