import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Bus, 
  Route, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  PlusCircle, 
  ArrowRight, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import MetricCard from '../../components/ui/MetricCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { 
  studentService, 
  busService, 
  driverService, 
  routeService, 
  tripService 
} from '../../services/firestore';
import { TRIP_STATUS } from '../../constants/collections';

export const AdminOverviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeBuses: 0,
    activeDrivers: 0,
    activeRoutes: 0,
    todayTrips: 0,
    activeTrips: 0,
  });

  const [activeTripsList, setActiveTripsList] = useState([]);
  const [recentTrips, setRecentTrips] = useState([]);
  const [tripBreakdown, setTripBreakdown] = useState({
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    delayed: 0,
    cancelled: 0,
  });

  const loadDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Parallel fetches through Stage 6 firestore service layer
      const [
        students,
        buses,
        drivers,
        routes,
        trips,
      ] = await Promise.all([
        studentService.getAll({ max: 500 }),
        busService.getAll({ max: 100 }),
        driverService.getAll({ max: 100 }),
        routeService.getAll({ max: 100 }),
        tripService.getAll({ max: 100 }),
      ]);

      // Calculate active metrics strictly from returned records
      const activeBusesCount = buses.filter((b) => b.status === 'active' || b.status === 'assigned').length;
      const activeDriversCount = drivers.filter((d) => d.status === 'active').length;
      const activeRoutesCount = routes.filter((r) => r.status === 'active').length;

      // Active operational trips
      const liveTrips = trips.filter(
        (t) => t.status === TRIP_STATUS.IN_PROGRESS || t.status === 'inProgress'
      );

      // Status breakdown
      const breakdown = {
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        delayed: 0,
        cancelled: 0,
      };

      trips.forEach((t) => {
        const s = t.status || 'scheduled';
        if (breakdown[s] !== undefined) {
          breakdown[s] += 1;
        }
      });

      setMetrics({
        totalStudents: students.length,
        activeBuses: activeBusesCount,
        activeDrivers: activeDriversCount,
        activeRoutes: activeRoutesCount,
        todayTrips: trips.length,
        activeTrips: liveTrips.length,
      });

      setActiveTripsList(liveTrips.slice(0, 5));
      setRecentTrips(trips.slice(0, 5));
      setTripBreakdown(breakdown);
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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
      case TRIP_STATUS.CANCELLED:
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="info">Scheduled</Badge>;
    }
  };

  return (
    <DashboardLayout title="Fleet Operations Command Center">
      <div className="space-y-6">
        {/* Header Ribbon & Refresh */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-brand-navy">Daily Transportation Network Overview</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal">
                Live Data
              </span>
            </div>
            <p className="text-xs text-brand-slate mt-1">
              Real-time monitoring of campus routes, active fleet vehicles, student manifest, and scheduled runs.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => loadDashboardData(true)}
              loading={refreshing}
            >
              Refresh Fleet Data
            </Button>
          </div>
        </div>

        {/* Top Operational KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Students"
            value={metrics.totalStudents}
            icon={Users}
            subtitle="Registered manifests"
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Active Buses"
            value={metrics.activeBuses}
            icon={Bus}
            subtitle="Campus transit fleet"
            color="teal"
            loading={loading}
          />
          <MetricCard
            title="Active Drivers"
            value={metrics.activeDrivers}
            icon={CheckCircle2}
            subtitle="Licensed operators"
            color="emerald"
            loading={loading}
          />
          <MetricCard
            title="Active Routes"
            value={metrics.activeRoutes}
            icon={Route}
            subtitle="Coordinated lines"
            color="navy"
            loading={loading}
          />
          <MetricCard
            title="Today's Trips"
            value={metrics.todayTrips}
            icon={Calendar}
            subtitle="Total runs queued"
            color="amber"
            loading={loading}
          />
          <MetricCard
            title="Active Trips"
            value={metrics.activeTrips}
            icon={Navigation}
            subtitle="Vehicles currently en route"
            color="blue"
            badgeText={metrics.activeTrips > 0 ? 'Live' : 'Idle'}
            loading={loading}
          />
        </div>

        {/* Quick Action Hub */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-3">
            Quick Actions & Management Shortcuts
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              to="/admin/students"
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-brand-blue/5 hover:border-brand-blue/30 border border-border transition-all text-xs font-semibold text-brand-navy group"
            >
              <Users className="w-4 h-4 text-brand-blue group-hover:scale-110 transition-transform" />
              <span>Add Student</span>
            </Link>
            <Link
              to="/admin/buses"
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-brand-teal/5 hover:border-brand-teal/30 border border-border transition-all text-xs font-semibold text-brand-navy group"
            >
              <Bus className="w-4 h-4 text-brand-teal group-hover:scale-110 transition-transform" />
              <span>Add Bus</span>
            </Link>
            <Link
              to="/admin/drivers"
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-emerald-500/5 hover:border-emerald-500/30 border border-border transition-all text-xs font-semibold text-brand-navy group"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>Add Driver</span>
            </Link>
            <Link
              to="/admin/routes"
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-amber-500/5 hover:border-amber-500/30 border border-border transition-all text-xs font-semibold text-brand-navy group"
            >
              <Route className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>Create Route</span>
            </Link>
            <Link
              to="/admin/stops"
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-purple-500/5 hover:border-purple-500/30 border border-border transition-all text-xs font-semibold text-brand-navy group"
            >
              <MapPin className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
              <span>Add Stop</span>
            </Link>
            <Link
              to="/admin/trips"
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-blue-600/5 hover:border-blue-600/30 border border-border transition-all text-xs font-semibold text-brand-navy group"
            >
              <Navigation className="w-4 h-4 text-brand-blue group-hover:scale-110 transition-transform" />
              <span>Queue Trip</span>
            </Link>
          </div>
        </div>

        {/* Operational Status Breakdown & Active Trips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip Status Visual Summary */}
          <div className="p-5 rounded-2xl bg-white border border-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-brand-navy">Trip Status Distribution</h3>
                <Link to="/admin/trips" className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-semibold">
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                  <span className="font-semibold text-brand-blue flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Scheduled
                  </span>
                  <span className="font-bold text-brand-navy">{tripBreakdown.scheduled}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50/70 border border-teal-100">
                  <span className="font-semibold text-brand-teal flex items-center gap-2">
                    <Navigation className="w-4 h-4" /> In Progress (En Route)
                  </span>
                  <span className="font-bold text-brand-navy">{tripBreakdown.inProgress}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="font-semibold text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                  <span className="font-bold text-brand-navy">{tripBreakdown.completed}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                  <span className="font-semibold text-amber-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Delayed
                  </span>
                  <span className="font-bold text-brand-navy">{tripBreakdown.delayed}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/70 border border-red-100">
                  <span className="font-semibold text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Cancelled
                  </span>
                  <span className="font-bold text-brand-navy">{tripBreakdown.cancelled}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-brand-slate">
              <span>Total Logged Trips:</span>
              <span className="font-bold text-brand-navy">{metrics.todayTrips}</span>
            </div>
          </div>

          {/* Active / Current Operational Trips */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-brand-navy">Active Trips In Transit</h3>
                  {activeTripsList.length > 0 && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
                    </span>
                  )}
                </div>
                <Link to="/admin/trips" className="text-xs text-brand-blue hover:underline font-semibold">
                  View All Trips
                </Link>
              </div>

              {activeTripsList.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-border">
                  <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-brand-navy">No Buses Currently En Route</p>
                  <p className="text-[11px] text-brand-slate mt-0.5">
                    Trips marked as &quot;In Progress&quot; will appear here with live route indicators.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeTripsList.map((trip) => (
                    <div
                      key={trip.id}
                      className="p-3 rounded-xl border border-border bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                          <Bus className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-brand-navy">
                            {trip.routeName || trip.routeCode || 'Transit Route'}
                          </p>
                          <p className="text-[11px] text-brand-slate">
                            Bus: <span className="font-semibold text-brand-navy">{trip.busNumber || 'Assigned'}</span> • Driver: {trip.driverName || 'Designated'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-[11px] text-brand-slate">
                          Started: {trip.scheduledStart || trip.date || 'Today'}
                        </span>
                        {getStatusBadge(trip.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transport Activity */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Recent Trip Records
                </h4>
                <span className="text-[11px] text-brand-slate">{recentTrips.length} records</span>
              </div>
              {recentTrips.length === 0 ? (
                <p className="text-xs text-brand-slate py-2">No recent trip records found.</p>
              ) : (
                <div className="divide-y divide-border text-xs">
                  {recentTrips.slice(0, 3).map((r) => (
                    <div key={r.id} className="py-2 flex items-center justify-between">
                      <span className="text-brand-navy font-medium truncate max-w-[200px]">
                        {r.routeName || `Trip ${r.id.substring(0, 6)}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-brand-slate">{r.date || 'Scheduled'}</span>
                        {getStatusBadge(r.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOverviewPage;
