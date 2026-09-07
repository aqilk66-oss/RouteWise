import React from 'react';
import { 
  Users, 
  MapPin, 
  Bus, 
  Route, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  PhoneCall,
  Navigation
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import RouteLineTracker from '../../components/tracking/RouteLineTracker';
import { useParentTransport } from '../../context/ParentTransportContext';
import { TRIP_STATUS } from '../../constants/collections';

export const ParentOverviewPage = () => {
  const { 
    childrenList, 
    selectedChild, 
    selectedChildId, 
    setSelectedChildId, 
    childRoute, 
    childBus, 
    routeStops, 
    todayTrip, 
    notifications,
    loading, 
    refreshData, 
    refreshing 
  } = useParentTransport();

  const isTripLive = todayTrip?.status === TRIP_STATUS.IN_PROGRESS || todayTrip?.status === 'inProgress';
  const isDelayed = todayTrip?.status === TRIP_STATUS.DELAYED || todayTrip?.status === 'delayed';

  return (
    <DashboardLayout title="Parent & Guardian Transport Portal">
      <div className="space-y-6">
        {/* Child Selector Tabs for Multi-Child Accounts */}
        {childrenList.length > 1 && (
          <div className="flex items-center gap-2 p-1.5 bg-white border border-border rounded-2xl shadow-soft overflow-x-auto">
            <span className="text-xs font-semibold text-brand-slate px-3 shrink-0">Viewing Child:</span>
            {childrenList.map((child) => {
              const isSelected = child.id === selectedChild?.id;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-brand-blue text-white shadow-soft'
                      : 'text-brand-navy hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-brand-teal' : 'bg-slate-300'}`} />
                  <span>{child.fullName || `${child.firstName} ${child.lastName}`}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Primary Hero Transport Status Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-border shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-soft ${
              isTripLive ? 'bg-teal-500 text-white' : 'bg-brand-navy text-white'
            }`}>
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-brand-navy">
                  {selectedChild ? (selectedChild.fullName || `${selectedChild.firstName} ${selectedChild.lastName}`) : 'Student'} Transport Status
                </h2>
                <Badge variant={isTripLive ? 'active' : isDelayed ? 'warning' : 'neutral'} size="sm">
                  {isTripLive ? 'In Transit to School' : isDelayed ? 'Delayed' : 'Scheduled Morning Run'}
                </Badge>
              </div>
              <p className="text-xs text-brand-slate">
                Grade: <span className="font-semibold text-brand-navy">{selectedChild?.grade || 'Primary'}</span> • 
                School: <span className="font-semibold text-brand-navy">{selectedChild?.schoolName || 'District Campus'}</span> • 
                Assigned Vehicle: <span className="font-bold text-brand-blue">{childBus?.busNumber || 'Fleet Bus'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              loading={refreshing}
            >
              Refresh Status
            </Button>
            <Link to="/parent/tracking">
              <Button variant="primary" size="sm" icon={Navigation}>
                Live Route Tracker
              </Button>
            </Link>
          </div>
        </div>

        {/* Delay / Important Alert Banner if active */}
        {isDelayed && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Transportation Delay Reported</p>
              <p className="text-amber-800 mt-0.5">
                {childBus?.busNumber || 'Assigned bus'} is running approximately 10 minutes behind schedule due to traffic along the arterial corridor. Updated arrival will be reflected upon stop approach.
              </p>
            </div>
          </div>
        )}

        {/* Live Route Progress Tracker */}
        <RouteLineTracker
          stops={routeStops}
          bus={childBus}
          trip={todayTrip}
          pickupStopName={selectedChild?.pickupStop}
          dropoffStopName={selectedChild?.dropoffStop}
        />

        {/* Pickup, Drop-off & Vehicle Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pickup Card */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">Morning Boarding</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-brand-navy">
              {selectedChild?.pickupStop || 'Main Neighborhood Crossing'}
            </p>
            <p className="text-xs text-brand-slate flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Scheduled Pickup: <span className="font-semibold text-brand-navy">07:35 AM</span>
            </p>
          </Card>

          {/* Drop-off Card */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">Afternoon Return</span>
              <MapPin className="w-4 h-4 text-brand-blue" />
            </div>
            <p className="text-sm font-bold text-brand-navy">
              {selectedChild?.dropoffStop || 'School Main Drop-off Zone'}
            </p>
            <p className="text-xs text-brand-slate flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Scheduled Drop-off: <span className="font-semibold text-brand-navy">03:30 PM</span>
            </p>
          </Card>

          {/* Assigned Driver & Vehicle Card */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">Vehicle & Operator</span>
              <ShieldCheck className="w-4 h-4 text-brand-teal" />
            </div>
            <p className="text-sm font-bold text-brand-navy">
              {childBus?.driverName || childRoute?.driverName || 'Licensed School Bus Operator'}
            </p>
            <p className="text-xs text-brand-slate">
              Bus Plate: <span className="font-semibold text-brand-navy">{childBus?.registrationNumber || 'Inspected'}</span> ({childBus?.model || 'Coach'})
            </p>
          </Card>
        </div>

        {/* Daily Schedule & Recent Guardian Bulletins */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Transport Timeline */}
          <Card className="lg:col-span-2 p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-blue" />
              Today&apos;s Transit Schedule Timeline
            </h3>

            <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-teal ring-4 ring-white" />
                <p className="font-bold text-brand-navy">07:15 AM — Fleet Departure</p>
                <p className="text-brand-slate text-[11px]">Bus departs school transportation facility.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-blue ring-4 ring-white" />
                <p className="font-bold text-brand-navy">07:35 AM — Student Boarding Window</p>
                <p className="text-brand-slate text-[11px]">Boarding at {selectedChild?.pickupStop || 'designated bus stop'}.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                <p className="font-bold text-brand-navy">08:15 AM — Campus Arrival & Check-in</p>
                <p className="text-brand-slate text-[11px]">Disembarkation at school entrance gates.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                <p className="font-bold text-brand-navy">03:30 PM — Afternoon Return Circuit</p>
                <p className="text-brand-slate text-[11px]">Scheduled departure for afternoon drop-off stops.</p>
              </div>
            </div>
          </Card>

          {/* Recent Guardian Notices */}
          <Card className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-brand-navy">Guardian Alerts</h3>
                <Link to="/parent/notifications" className="text-xs font-semibold text-brand-blue hover:underline">
                  View All
                </Link>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-brand-slate py-4 text-center">You&apos;re all caught up. No unread transit alerts.</p>
              ) : (
                <div className="divide-y divide-border text-xs">
                  {notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="py-2.5">
                      <p className="font-bold text-brand-navy">{n.title}</p>
                      <p className="text-[11px] text-brand-slate line-clamp-2 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
              <span className="text-brand-slate">Emergency Helpline:</span>
              <span className="font-bold text-brand-navy">+1 (800) 555-BUS1</span>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentOverviewPage;
