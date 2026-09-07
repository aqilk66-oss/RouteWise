import React from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Calendar, 
  Route as RouteIcon, 
  Navigation, 
  ChevronRight, 
  Bell, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useStudentTransport } from '../../context/StudentTransportContext';
import { TRIP_STATUS } from '../../constants/collections';

export const StudentOverviewPage = () => {
  const { user, profile } = useAuth();
  const { 
    studentRecord, 
    assignedBus, 
    assignedRoute, 
    pickupInfo, 
    dropoffInfo, 
    todayTrip, 
    studentNotifications, 
    loading, 
    refreshData, 
    refreshing 
  } = useStudentTransport();

  const isLive = todayTrip?.status === TRIP_STATUS.IN_PROGRESS || todayTrip?.status === 'inProgress';
  const isDelayed = todayTrip?.status === TRIP_STATUS.DELAYED || todayTrip?.status === 'delayed';
  const isCompleted = todayTrip?.status === TRIP_STATUS.COMPLETED || todayTrip?.status === 'completed';

  const firstName = studentRecord?.firstName || profile?.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Student';

  return (
    <DashboardLayout title="Student Transit Pass & My Bus">
      <div className="space-y-6">
        {/* Welcome Greeting Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-brand-navy">
                Good morning, {firstName} 👋
              </h2>
              {isLive && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-teal"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-brand-slate mt-1">
              Grade: <span className="font-semibold text-brand-navy">{studentRecord?.grade || 'Class 5'}</span> • 
              School: <span className="font-semibold text-brand-navy">{studentRecord?.schoolName || 'Main Campus'}</span> • 
              Pass ID: <span className="font-semibold text-brand-blue">{studentRecord?.studentId || 'STU-ACTIVE'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={refreshData}
              loading={refreshing}
            >
              Sync Pass
            </Button>
            <Link to="/student/transport">
              <Button variant="primary" size="sm" icon={Navigation}>
                View My Route
              </Button>
            </Link>
          </div>
        </div>

        {/* Delay Advisory Alert if flagged */}
        {isDelayed && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 animate-fade-in shadow-soft">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Bus Delay Notice</p>
              <p className="text-amber-800 mt-0.5">
                {assignedBus?.busNumber || 'Your bus'} is running approximately 10 minutes late due to traffic along the route.
              </p>
            </div>
          </div>
        )}

        {/* Most Important Hero Card: Today's Transport */}
        <Card className="p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-soft ${
                isLive ? 'bg-teal-500 text-white animate-pulse' : 'bg-brand-navy text-white'
              }`}>
                <Bus className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">
                  Today&apos;s School Bus
                </span>
                <h3 className="text-2xl font-bold text-brand-navy tracking-tight">
                  {assignedBus?.busNumber || 'Assigned Bus #24'}
                </h3>
                <p className="text-xs text-brand-slate mt-0.5">
                  Route: <span className="font-bold text-brand-blue">{assignedRoute?.name || 'Express Corridor'}</span> ({assignedRoute?.routeCode || 'EXP'})
                </p>
              </div>
            </div>

            <Badge 
              variant={isLive ? 'active' : isDelayed ? 'warning' : isCompleted ? 'neutral' : 'info'} 
              size="md"
            >
              {isLive ? 'On Route Now' : isDelayed ? 'Delayed' : isCompleted ? 'Trip Completed' : 'Scheduled Morning Run'}
            </Badge>
          </div>

          {/* Pickup and Dropoff Spotlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Morning Pickup */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  My Morning Pickup
                </span>
                <span className="text-xs font-bold text-emerald-700">{pickupInfo?.time || '07:35 AM'}</span>
              </div>
              <p className="text-sm font-bold text-brand-navy">{pickupInfo?.name}</p>
              <p className="text-xs text-brand-slate truncate">{pickupInfo?.address}</p>
            </div>

            {/* Afternoon Drop-off */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                  My Afternoon Drop-off
                </span>
                <span className="text-xs font-bold text-brand-navy">{dropoffInfo?.time || '03:30 PM'}</span>
              </div>
              <p className="text-sm font-bold text-brand-navy">{dropoffInfo?.name}</p>
              <p className="text-xs text-brand-slate truncate">{dropoffInfo?.address}</p>
            </div>
          </div>
        </Card>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/student/transport"
            className="p-4 rounded-2xl bg-white border border-border hover:border-brand-blue/40 shadow-soft flex items-center justify-between text-xs font-bold text-brand-navy group transition-all"
          >
            <span className="flex items-center gap-2">
              <RouteIcon className="w-4 h-4 text-brand-blue" />
              <span>Full Route</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/student/trips"
            className="p-4 rounded-2xl bg-white border border-border hover:border-brand-teal/40 shadow-soft flex items-center justify-between text-xs font-bold text-brand-navy group transition-all"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-teal" />
              <span>Trip Schedule</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/student/notifications"
            className="p-4 rounded-2xl bg-white border border-border hover:border-purple-400/40 shadow-soft flex items-center justify-between text-xs font-bold text-brand-navy group transition-all"
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-600" />
              <span>Notices</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/student/profile"
            className="p-4 rounded-2xl bg-white border border-border hover:border-amber-400/40 shadow-soft flex items-center justify-between text-xs font-bold text-brand-navy group transition-all"
          >
            <span className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-amber-500" />
              <span>My Transit Pass</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Daily Schedule Timeline & School Bulletins */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2 p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-blue" />
              Today&apos;s Transit Schedule
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-teal ring-4 ring-white" />
                <p className="font-bold text-brand-navy">07:15 AM — Bus Leaves Depot</p>
                <p className="text-brand-slate text-[11px]">Bus starts its morning route.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-blue ring-4 ring-white" />
                <p className="font-bold text-brand-navy">{pickupInfo?.time || '07:35 AM'} — Boarding Window</p>
                <p className="text-brand-slate text-[11px]">Be at {pickupInfo?.name || 'your stop'} 5 minutes early.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                <p className="font-bold text-brand-navy">08:15 AM — School Gate Arrival</p>
                <p className="text-brand-slate text-[11px]">Bus arrives safely at campus.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                <p className="font-bold text-brand-navy">{dropoffInfo?.time || '03:30 PM'} — Afternoon Return</p>
                <p className="text-brand-slate text-[11px]">Bus departs campus for return stops.</p>
              </div>
            </div>
          </Card>

          {/* Quick Notice Card */}
          <Card className="p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-brand-navy">School Bulletins</h3>
                <Link to="/student/notifications" className="text-xs font-semibold text-brand-blue hover:underline">
                  View All
                </Link>
              </div>

              {studentNotifications.length === 0 ? (
                <p className="text-xs text-brand-slate py-4 text-center">
                  You&apos;re all caught up! No active notices.
                </p>
              ) : (
                <div className="divide-y divide-border text-xs">
                  {studentNotifications.slice(0, 2).map((n) => (
                    <div key={n.id} className="py-2">
                      <p className="font-bold text-brand-navy truncate">{n.title}</p>
                      <p className="text-[11px] text-brand-slate line-clamp-2 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-border text-[11px] text-brand-slate">
              Need to change your pickup stop? Ask your parent or guardian to update the school office.
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentOverviewPage;
