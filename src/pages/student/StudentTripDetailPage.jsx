import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Bus, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Radio, 
  Info 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useStudentTransport } from '../../context/StudentTransportContext';
import { TRIP_STATUS } from '../../constants/collections';

export const StudentTripDetailPage = () => {
  const { tripId } = useParams();
  const { studentTrips, assignedBus, routeStops, pickupInfo, dropoffInfo } = useStudentTransport();

  const trip = studentTrips.find((t) => t.id === tripId) || studentTrips[0];

  const isLive = trip?.status === TRIP_STATUS.IN_PROGRESS || trip?.status === 'inProgress';
  const isDelayed = trip?.status === TRIP_STATUS.DELAYED || trip?.status === 'delayed';
  const isCompleted = trip?.status === TRIP_STATUS.COMPLETED || trip?.status === 'completed';

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
    <DashboardLayout title={`Trip Details: ${trip?.routeName || 'Transit Run'}`}>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          to="/student/trips"
          className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Trips</span>
        </Link>

        {/* Trip Banner */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-soft ${
              isLive ? 'bg-teal-500 text-white animate-pulse' : 'bg-brand-navy text-white'
            }`}>
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-brand-navy">
                  {trip?.routeName || 'School Bus Route'}
                </h2>
                {getStatusBadge(trip?.status)}
              </div>
              <p className="text-xs text-brand-slate">
                Date: <span className="font-semibold text-brand-navy">{trip?.date || 'Today'}</span> • 
                Vehicle: <span className="font-semibold text-brand-blue">{trip?.busNumber || assignedBus?.busNumber || 'Assigned Bus'}</span> • 
                Operator: <span className="font-semibold text-brand-navy">{trip?.driverName || 'Licensed Driver'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Placeholder */}
        <Card className="p-6 bg-slate-900 text-white border-slate-700">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-teal animate-pulse" />
              Transit Beacon Status
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Live Location: Unavailable
            </span>
          </div>
          <div className="py-4 text-center">
            <Compass className="w-10 h-10 text-brand-teal mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-white">Live Satellite Tracking Ready</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Real-time GPS coordinates connect in a future stage. Your bus schedule and stop arrival windows are listed below.
            </p>
          </div>
        </Card>

        {/* Student's Station Stops Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Pickup Location
              </span>
              <span className="text-xs font-bold text-emerald-700">{pickupInfo?.time || '07:35 AM'}</span>
            </div>
            <p className="text-sm font-bold text-brand-navy">{pickupInfo?.name}</p>
            <p className="text-xs text-brand-slate">{pickupInfo?.address}</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                Drop-off Location
              </span>
              <span className="text-xs font-bold text-brand-navy">{dropoffInfo?.time || '03:30 PM'}</span>
            </div>
            <p className="text-sm font-bold text-brand-navy">{dropoffInfo?.name}</p>
            <p className="text-xs text-brand-slate">{dropoffInfo?.address}</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentTripDetailPage;
