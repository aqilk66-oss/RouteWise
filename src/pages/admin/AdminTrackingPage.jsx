import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Bus, 
  MapPin, 
  RefreshCw, 
  Clock, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Users,
  Compass,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LiveTrackingCard from '../../components/tracking/LiveTrackingCard';
import TrackingVisualMap from '../../components/tracking/TrackingVisualMap';
import TrackingStatusBadge from '../../components/tracking/TrackingStatusBadge';
import RouteWiseMap from '../../components/map/RouteWiseMap';
import { tripService, busService, routeService, stopService } from '../../services/firestore';
import trackingService, { TRACKING_STATUS, getTrackingFreshness } from '../../services/tracking/trackingService';
import { TRIP_STATUS } from '../../constants/collections';

export const AdminTrackingPage = () => {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'live' | 'stale' | 'scheduled'

  // Subscribed live trip details
  const [liveSelectedTrip, setLiveSelectedTrip] = useState(null);

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [tripList, busList, routeList, stopList] = await Promise.all([
        tripService.getAll({ max: 100 }),
        busService.getAll({ max: 100 }),
        routeService.getAll({ max: 100 }),
        stopService.getAll({ max: 100 }),
      ]);

      setTrips(tripList);
      setBuses(busList);
      setRoutes(routeList);
      setStops(stopList);

      // Default select the first active trip if none selected
      if (!selectedTripId && tripList.length > 0) {
        const live = tripList.find((t) => t.status === TRIP_STATUS.IN_PROGRESS || t.status === 'inProgress');
        setSelectedTripId(live ? live.id : tripList[0].id);
      }
    } catch (err) {
      console.error('Failed to load fleet tracking data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Subscribe to the selected trip's live telemetry
  useEffect(() => {
    if (!selectedTripId) {
      setLiveSelectedTrip(null);
      return;
    }

    const unsubscribe = trackingService.subscribeToTripTracking(
      selectedTripId,
      (updatedTrip) => {
        if (updatedTrip) {
          setLiveSelectedTrip(updatedTrip);
        }
      },
      (err) => {
        console.warn('Admin trip tracking listener warning:', err.message);
      }
    );

    return () => unsubscribe();
  }, [selectedTripId]);

  // Selected trip entity
  const currentTrip = liveSelectedTrip || trips.find((t) => t.id === selectedTripId) || null;
  const currentBus = buses.find((b) => b.id === currentTrip?.busId || b.busNumber === currentTrip?.busNumber) || null;
  const currentRoute = routes.find((r) => r.id === currentTrip?.routeId) || null;
  const relevantStops = stops.filter((s) => s.routeId === currentTrip?.routeId).sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

  const isLive = currentTrip?.status === TRIP_STATUS.IN_PROGRESS || currentTrip?.status === 'inProgress';
  const currentLocation = currentTrip?.currentLocation || null;
  const trackingStatus = currentTrip?.trackingStatus || (isLive ? TRACKING_STATUS.ACTIVE : TRACKING_STATUS.STOPPED);
  const freshness = getTrackingFreshness(currentTrip?.lastTrackingUpdate || currentLocation?.deviceTimestamp);
  const isStale = freshness === TRACKING_STATUS.STALE;

  // Filtered trips list
  const filteredTrips = trips.filter((t) => {
    const isEnRoute = t.status === TRIP_STATUS.IN_PROGRESS || t.status === 'inProgress';
    if (filterTab === 'live') return isEnRoute;
    if (filterTab === 'stale') return isEnRoute && t.trackingStatus === 'stale';
    if (filterTab === 'scheduled') return t.status === TRIP_STATUS.SCHEDULED || t.status === 'scheduled';
    return true;
  });

  return (
    <DashboardLayout title="Fleet Tracking & Real-Time Telemetry Command">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-brand-navy">Institutional Fleet Live Tracking</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal">
                Real-Time Telemetry
              </span>
            </div>
            <p className="text-xs text-brand-slate mt-0.5">
              Live bus positions, driver GPS beacons, corridor milestones, and delay status tracking.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchData(true)}
            loading={refreshing}
          >
            Sync Fleet State
          </Button>
        </div>

        {/* 2-Column Split: Active Trips Roster (Left) vs Selected Bus Realtime Telemetry & Map (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Fleet Bus Roster */}
          <div className="space-y-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-border rounded-xl shadow-soft">
              {[
                { id: 'all', label: `All (${trips.length})` },
                { id: 'live', label: 'En Route' },
                { id: 'scheduled', label: 'Scheduled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                    filterTab === tab.id
                      ? 'bg-brand-blue text-white shadow-soft'
                      : 'text-brand-navy hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List of Trip Cards */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {filteredTrips.length === 0 ? (
                <div className="py-8 text-center bg-white rounded-2xl border border-border p-4">
                  <p className="text-xs font-semibold text-brand-navy">No trips match this filter</p>
                </div>
              ) : (
                filteredTrips.map((trip) => {
                  const isSelected = trip.id === selectedTripId;
                  const isTripEnRoute = trip.status === TRIP_STATUS.IN_PROGRESS || trip.status === 'inProgress';

                  return (
                    <div
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-blue/5 border-brand-blue ring-2 ring-brand-blue/20 shadow-soft'
                          : 'bg-white border-border hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-brand-navy flex items-center gap-1.5">
                          <Bus className="w-3.5 h-3.5 text-brand-blue" />
                          {trip.busNumber || 'Fleet Vehicle'}
                        </span>
                        <Badge variant={isTripEnRoute ? 'active' : 'info'} size="sm">
                          {isTripEnRoute ? 'En Route' : 'Scheduled'}
                        </Badge>
                      </div>
                      <p className="font-semibold text-xs text-brand-navy truncate">
                        {trip.routeName || 'Campus Corridor'}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-brand-slate">
                        <span>Driver: {trip.driverName || 'Operator'}</span>
                        <span className="font-mono text-[10px]">
                          {trip.scheduledStart || '07:30 AM'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Bus Live Telemetry & Visualizer */}
          <div className="lg:col-span-2 space-y-6">
            {currentTrip ? (
              <>
                {/* Geospatial Interactive Map */}
                <RouteWiseMap
                  stops={relevantStops}
                  school={currentRoute?.school || null}
                  activeBus={currentLocation ? {
                    busNumber: currentTrip.busNumber || 'Fleet',
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    heading: currentLocation.heading,
                    speed: currentLocation.speed,
                    isLive: isLive && trackingStatus === TRACKING_STATUS.ACTIVE,
                    trackingStatus: trackingStatus,
                    lastUpdated: currentTrip.lastTrackingUpdate || currentLocation?.deviceTimestamp
                  } : null}
                  activeStopIndex={0}
                  height="420px"
                  fallbackText="Bus location telemetry will appear on the map as the driver transmits GPS coordinates."
                />

                {/* Visual Route Corridor Track */}
                <TrackingVisualMap
                  stops={relevantStops}
                  currentLocation={currentLocation}
                  isLive={isLive && trackingStatus === TRACKING_STATUS.ACTIVE}
                  isStale={isStale}
                  busNumber={currentTrip.busNumber || 'Fleet Bus'}
                  activeStopIndex={0}
                />

                {/* Live Telemetry Card */}
                <LiveTrackingCard
                  bus={currentBus}
                  route={currentRoute}
                  trip={currentTrip}
                  trackingStatus={trackingStatus}
                  isStale={isStale}
                  currentLocation={currentLocation}
                  lastUpdated={currentTrip.lastTrackingUpdate || currentLocation?.deviceTimestamp}
                  nextStop={relevantStops[0]}
                />
              </>
            ) : (
              <EmptyState
                icon={Navigation}
                title="No Trip Selected"
                description="Select a transit vehicle from the roster to inspect live telemetry."
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTrackingPage;
