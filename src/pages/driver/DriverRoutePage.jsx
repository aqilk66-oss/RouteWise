import React from 'react';
import { 
  Route as RouteIcon, 
  MapPin, 
  Bus, 
  Clock, 
  RefreshCw, 
  Navigation, 
  Compass,
  CheckCircle2
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useDriverTransport } from '../../context/DriverTransportContext';

export const DriverRoutePage = () => {
  const { assignedRoute, assignedBus, routeStops, loading, refreshData, refreshing } = useDriverTransport();

  return (
    <DashboardLayout title="Assigned Transit Route & Station Sequence">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-brand-navy">
                {assignedRoute?.name || 'Corridor Route'} ({assignedRoute?.routeCode || 'EXP'})
              </h2>
              <Badge variant="active" size="sm">Active Line</Badge>
            </div>
            <p className="text-xs text-brand-slate mt-0.5">
              Assigned Vehicle: <span className="font-semibold text-brand-blue">{assignedBus?.busNumber || 'Fleet Bus'}</span> • 
              Estimated Run: <span className="font-semibold text-brand-navy">{assignedRoute?.estimatedDuration || '38 mins'}</span> • 
              Length: {assignedRoute?.distance || '14.2 miles'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Refresh Route
          </Button>
        </div>

        {/* Route Specification Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">Corridor Code</span>
            <p className="text-xl font-bold text-brand-navy">{assignedRoute?.routeCode || 'EXP-14'}</p>
            <p className="text-xs text-brand-slate">District Assigned Identifier</p>
          </Card>
          <Card className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">Designated Stops</span>
            <p className="text-xl font-bold text-brand-navy">{routeStops.length} Station Waypoints</p>
            <p className="text-xs text-brand-slate">Sequential student pickup points</p>
          </Card>
          <Card className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">Target Run Window</span>
            <p className="text-xl font-bold text-brand-navy">{assignedRoute?.estimatedDuration || '35 mins'}</p>
            <p className="text-xs text-brand-slate">From depot start to campus arrival</p>
          </Card>
        </div>

        {/* Visual Route Stop Progression Timeline */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-blue" />
            Station Stop Schedule & Geographic Sequence
          </h3>

          {routeStops.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No stops configured for this corridor"
              description="Contact fleet dispatch if your route stops are not loaded."
            />
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {routeStops.map((stop, index) => (
                <div key={stop.id || index} className="relative flex items-start justify-between gap-4 text-xs">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center ring-4 ring-white shadow-soft">
                    {stop.sequence || index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy text-sm">{stop.name}</h4>
                    <p className="text-brand-slate text-xs mt-0.5">{stop.address || 'Corridor waypoint'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-brand-blue">{stop.pickupTime || '07:35 AM'}</p>
                    <p className="text-[11px] text-brand-slate">Drop-off: {stop.dropoffTime || '03:30 PM'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DriverRoutePage;
