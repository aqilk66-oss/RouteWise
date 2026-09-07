import React, { useState } from 'react';
import { 
  Calendar, 
  Bus, 
  Clock, 
  MapPin, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useStudentTransport } from '../../context/StudentTransportContext';
import { TRIP_STATUS } from '../../constants/collections';

export const StudentTripsPage = () => {
  const { studentTrips, pickupInfo, loading, refreshData, refreshing } = useStudentTransport();
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'upcoming' | 'past'

  const filteredTrips = studentTrips.filter((t) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'upcoming') {
      return t.status === TRIP_STATUS.SCHEDULED || t.status === 'scheduled' || t.status === TRIP_STATUS.IN_PROGRESS || t.status === 'inProgress' || t.status === TRIP_STATUS.DELAYED;
    }
    if (filterTab === 'past') {
      return t.status === TRIP_STATUS.COMPLETED || t.status === 'completed';
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case TRIP_STATUS.IN_PROGRESS:
      case 'inProgress':
        return <Badge variant="active">In Transit</Badge>;
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
    <DashboardLayout title="My Bus Trips & Schedule">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Trip Schedule & History</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Scheduled morning pickup runs and afternoon campus returns.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Refresh Trips
          </Button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-border rounded-2xl shadow-soft">
          {[
            { id: 'all', label: `All Trips (${studentTrips.length})` },
            { id: 'upcoming', label: 'Upcoming & Active' },
            { id: 'past', label: 'Past Trips' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
            title="No trips found"
            description="Your scheduled school bus trips will appear here."
          />
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-5 rounded-2xl bg-white border border-border shadow-soft hover:shadow-subtle transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                    <Bus className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-brand-navy">
                        {trip.routeName || 'School Bus Run'}
                      </h3>
                      {getStatusBadge(trip.status)}
                    </div>
                    <p className="text-xs text-brand-slate">
                      Date: <span className="font-semibold text-brand-navy">{trip.date || 'Today'}</span> • 
                      Vehicle: <span className="font-semibold text-brand-blue">{trip.busNumber || 'Assigned Bus'}</span> • 
                      Boarding Time: <span className="font-semibold text-brand-navy">{pickupInfo?.time || '07:35 AM'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <Link to={`/student/trips/${trip.id}`}>
                    <Button variant="outline" size="sm" icon={Eye}>
                      Trip Details
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

export default StudentTripsPage;
