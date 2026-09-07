import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Route as RouteIcon, 
  RefreshCw, 
  CheckCircle2, 
  Navigation,
  Compass,
  Radio,
  Info
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import LiveTrackingCard from '../../components/tracking/LiveTrackingCard';
import TrackingVisualMap from '../../components/tracking/TrackingVisualMap';
import RouteWiseMap from '../../components/map/RouteWiseMap';
import { useStudentTransport } from '../../context/StudentTransportContext';
import trackingService, { TRACKING_STATUS, getTrackingFreshness } from '../../services/tracking/trackingService';
import { TRIP_STATUS } from '../../constants/collections';

export const StudentTransportPage = () => {
  const { 
    studentRecord, 
    assignedBus, 
    assignedRoute, 
    routeStops, 
    pickupInfo, 
    dropoffInfo, 
    todayTrip, 
    loading, 
    refreshData, 
    refreshing 
  } = useStudentTransport();

  // Realtime subscribed trip state
  const [liveTripData, setLiveTripData] = useState(null);

  useEffect(() => {
    const tripId = todayTrip?.id;
    if (!tripId) {
      setLiveTripData(null);
      return;
    }

    const unsubscribe = trackingService.subscribeToTripTracking(
      tripId,
      (updatedTrip) => {
        if (updatedTrip) {
          setLiveTripData(updatedTrip);
        }
      },
      (err) => {
        console.warn('Student tracking subscription note:', err.message);
      }
    );

    return () => unsubscribe();
  }, [todayTrip?.id]);

  const activeTrip = liveTripData || todayTrip;
  const isLive = activeTrip?.status === TRIP_STATUS.IN_PROGRESS || activeTrip?.status === 'inProgress';
  const isDelayed = activeTrip?.status === TRIP_STATUS.DELAYED || activeTrip?.status === 'delayed';

  const currentLocation = activeTrip?.currentLocation || null;
  const trackingStatus = activeTrip?.trackingStatus || (isLive ? TRACKING_STATUS.ACTIVE : TRACKING_STATUS.STOPPED);
  const freshness = getTrackingFreshness(activeTrip?.lastTrackingUpdate || currentLocation?.deviceTimestamp);
  const isStale = freshness === TRACKING_STATUS.STALE;

  return (
    <DashboardLayout title="My Bus & Transit Corridor">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-brand-navy">
                {assignedRoute?.name || 'School Bus Corridor'}
              </h2>
              <Badge variant={isLive ? 'active' : isDelayed ? 'warning' : 'neutral'} size="sm">
                {isLive ? 'En Route Now' : isDelayed ? 'Delayed' : 'Scheduled'}
              </Badge>
            </div>
            <p className="text-xs text-brand-slate mt-0.5">
              Assigned Vehicle: <span className="font-semibold text-brand-blue">{assignedBus?.busNumber || 'Fleet Vehicle'}</span> • 
              Route Code: <span className="font-semibold text-brand-navy">{assignedRoute?.routeCode || 'EXP-14'}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Update Status
          </Button>
        </div>

        {/* Real-time Telemetry Card */}
        <LiveTrackingCard
          bus={assignedBus}
          route={assignedRoute}
          trip={activeTrip}
          trackingStatus={trackingStatus}
          isStale={isStale}
          currentLocation={currentLocation}
          lastUpdated={activeTrip?.lastTrackingUpdate || currentLocation?.deviceTimestamp}
          nextStop={routeStops[0]}
        />

        {/* Geospatial Operational Road Map */}
        <RouteWiseMap
          stops={routeStops}
          school={assignedRoute?.school || null}
          activeBus={currentLocation ? {
            busNumber: assignedBus?.busNumber || 'School Bus',
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            heading: currentLocation.heading,
            speed: currentLocation.speed,
            isLive: isLive && trackingStatus === TRACKING_STATUS.ACTIVE,
            trackingStatus: trackingStatus,
            lastUpdated: activeTrip?.lastTrackingUpdate || currentLocation?.deviceTimestamp
          } : null}
          activeStopIndex={0}
          height="360px"
          fallbackText="Bus location and route will render geographically once coordinates are broadcast."
        />

        {/* Spatial Visual Corridor Map */}
        <TrackingVisualMap
          stops={routeStops}
          currentLocation={currentLocation}
          isLive={isLive && trackingStatus === TRACKING_STATUS.ACTIVE}
          isStale={isStale}
          busNumber={assignedBus?.busNumber || 'School Bus'}
          activeStopIndex={0}
        />

        {/* Detailed Station Timeline */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-blue" />
            Complete Stop Sequence Schedule
          </h3>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
            {routeStops.map((stop, index) => {
              const isMyPickup = stop.name === pickupInfo?.name;
              const isMyDropoff = stop.name === dropoffInfo?.name;

              return (
                <div key={stop.id || index} className="relative flex items-start justify-between gap-4">
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-white shadow-soft ${
                    isMyPickup 
                      ? 'bg-emerald-600 text-white' 
                      : isMyDropoff 
                      ? 'bg-brand-blue text-white' 
                      : 'bg-slate-300 text-slate-700'
                  }`}>
                    {stop.sequence || index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-brand-navy text-sm">{stop.name}</p>
                      {isMyPickup && (
                        <Badge variant="active" size="sm">Your Pickup Point</Badge>
                      )}
                      {isMyDropoff && (
                        <Badge variant="info" size="sm">Your Drop-off Point</Badge>
                      )}
                    </div>
                    <p className="text-brand-slate text-xs mt-0.5">{stop.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-brand-navy">{stop.pickupTime || '07:35 AM'}</p>
                    <p className="text-[10px] text-brand-slate">Afternoon: {stop.dropoffTime || '03:30 PM'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentTransportPage;
