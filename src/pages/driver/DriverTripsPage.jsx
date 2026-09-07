import React, { useState } from 'react';
import { 
  Calendar, 
  Bus, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  Navigation
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useDriverTransport } from '../../context/DriverTransportContext';
import { TRIP_STATUS } from '../../constants/collections';

export const DriverTripsPage = () => {
  const { driverTrips, loading, refreshData, refreshing } = useDriverTransport();
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'inProgress' | 'scheduled' | 'completed'

  const filteredTrips = driverTrips.filter((t) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'inProgress') return t.status === TRIP_STATUS.IN_PROGRESS || t.status === 'inProgress' || t.status === TRIP_STATUS.DELAYED;
    if (filterTab === 'scheduled') return t.status === TRIP_STATUS.SCHEDULED || t.status === 'scheduled';
    if (filterTab === 'completed') return t.status === TRIP_STATUS.COMPLETED || t.status === 'completed';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case TRIP_STATUS.IN_PROGRESS:
      case 'inProgress':
        return <Badge variant="active">In Progress</Badge>;
      case TRIP_STATUS.COMPLETED:
      case 'completed':
        return <Badge variant="neutral">Completed</Badge>;
      case TRIP_STATUS.DELAYED:
      case 'delayed':
        return <Badge variant="warning">Delayed</Badge>;
      default:
        return <Badge variant="info">Scheduled</Badge>;
    }
  };

  return (
    <DashboardLayout title="Assigned Trips & Dispatch History">
      <div className="space-y-6">
        {/* Header Ribbon & Refresh */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Driver Dispatch Roster</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Review assigned runs, departure windows, and historical completion manifests.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Refresh Roster
          </Button>
        </div>

        {/* Filter Segment Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-border rounded-2xl shadow-soft overflow-x-auto">
          {[
            { id: 'all', label: `All Runs (${driverTrips.length})` },
            { id: 'inProgress', label: 'In Transit / Delayed' },
            { id: 'scheduled', label: 'Scheduled Ahead' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterTab === tab.id
                  ? 'bg-brand-blue text-white shadow-soft'
                  : 'text-brand-navy hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No trips match this filter"
            description="Active assignments from the transportation manager will appear here."
          />
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-5 rounded-2xl bg-white border border-border shadow-soft hover:shadow-subtle transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                    <Bus className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-1">
                      <h3 className="text-base font-bold text-brand-navy">
                        {trip.routeName || `Corridor ${trip.routeCode || 'EXP'}`}
                      </h3>
                      {getStatusBadge(trip.status)}
                    </div>
                    <p className="text-xs text-brand-slate">
                      Date: <span className="font-semibold text-brand-navy">{trip.date || 'Today'}</span> • 
                      Vehicle: <span className="font-semibold text-brand-blue">{trip.busNumber || 'Fleet Bus'}</span> • 
                      Start Window: <span className="font-semibold text-brand-navy">{trip.scheduledStartTime || trip.scheduledStart || '07:15 AM'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <Link to={`/driver/trips/${trip.id}`}>
                    <Button variant="outline" size="sm" icon={Eye}>
                      Operational View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DriverTripsPage;
