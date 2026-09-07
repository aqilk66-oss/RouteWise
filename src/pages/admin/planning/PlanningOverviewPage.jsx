import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Route, 
  Calendar, 
  Bus, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  ArrowUpRight, 
  ShieldAlert,
  Send,
  HelpCircle
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PlanningNavHeader from '../../../components/planning/PlanningNavHeader';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { routeService, busService, driverService, scheduleService, tripService, studentService } from '../../../services/firestore';
import { detectScheduleConflicts } from '../../../services/planning/conflictService';
import { validateCapacity } from '../../../services/planning/capacityService';
import { evaluateRouteReadiness } from '../../../services/planning/routeReadinessService';
import { useAuth } from '../../../context/AuthContext';
import { ROUTE_STATUS, USER_ROLES } from '../../../constants/collections';

export const PlanningOverviewPage = () => {
  const { role } = useAuth();
  const isTransport = role === USER_ROLES.TRANSPORT_MANAGER;
  const basePrefix = isTransport ? '/transport/planning' : '/admin/planning';

  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchPlanningData = async () => {
      setLoading(true);
      try {
        const [
          routeList,
          busList,
          driverList,
          scheduleList,
          studentList,
          tripList
        ] = await Promise.all([
          routeService.getAll({ max: 200 }),
          busService.getAll({ max: 200 }),
          driverService.getAll({ max: 200 }),
          scheduleService.getAll({ max: 200 }),
          studentService.getAll({ max: 500 }),
          tripService.getAll({ max: 500 }),
        ]);

        setRoutes(routeList || []);
        setBuses(busList || []);
        setDrivers(driverList || []);
        setSchedules(scheduleList || []);
        setStudents(studentList || []);
        setTrips(tripList || []);
      } catch (err) {
        console.error('Failed to load planning overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanningData();
  }, []);

  // Compute deterministic metrics
  const activeRoutes = routes.filter((r) => r.status === ROUTE_STATUS.ACTIVE);
  const draftRoutes = routes.filter((r) => r.status === ROUTE_STATUS.DRAFT);
  const inactiveRoutes = routes.filter((r) => r.status === ROUTE_STATUS.INACTIVE || r.status === ROUTE_STATUS.ARCHIVED);

  const assignedBuses = buses.filter((b) => b.assignedRouteId || routes.some((r) => r.assignedBusId === b.busId || r.assignedBusId === b.id));
  const availableBuses = buses.filter((b) => !assignedBuses.includes(b) && b.status !== 'retired');

  const assignedDrivers = drivers.filter((d) => d.assignedRouteId || routes.some((r) => r.assignedDriverId === d.driverId || r.assignedDriverId === d.id));
  const availableDrivers = drivers.filter((d) => !assignedDrivers.includes(d) && d.status !== 'suspended');

  // Audit conflicts across all active schedules
  const globalConflicts = [];
  schedules.forEach((sch) => {
    const conflictResult = detectScheduleConflicts({
      busId: sch.busId,
      driverId: sch.driverId,
      routeId: sch.routeId,
      startTime: sch.startTime,
      endTime: sch.endTime,
      operatingDays: sch.operatingDays,
      existingSchedules: schedules,
      targetScheduleId: sch.id || sch.scheduleId,
    });
    if (conflictResult.hasConflict) {
      conflictResult.conflicts.forEach((c) => {
        // Prevent duplicate bilateral conflict messages
        if (!globalConflicts.some((existing) => existing.message === c.message)) {
          globalConflicts.push(c);
        }
      });
    }
  });

  // Audit capacity warnings across routes
  const capacityAlerts = [];
  routes.forEach((route) => {
    const assignedBus = buses.find((b) => b.busId === route.assignedBusId || b.id === route.assignedBusId);
    const routeStudents = students.filter((s) => s.routeId === route.routeId || s.routeId === route.id);
    if (assignedBus) {
      const capCheck = validateCapacity({
        busCapacity: assignedBus.capacity,
        assignedStudentsCount: routeStudents.length,
      });
      if (capCheck.isOverCapacity || capCheck.isNearCapacity) {
        capacityAlerts.push({
          route,
          bus: assignedBus,
          count: routeStudents.length,
          capacity: assignedBus.capacity,
          isOver: capCheck.isOverCapacity,
        });
      }
    }
  });

  return (
    <DashboardLayout>
      <PlanningNavHeader 
        title="Transport Planning & Dispatch Headquarters" 
        subtitle="Deterministic route creation, vehicle assignment, capacity validation, and schedule conflict prevention."
      >
        <Link to={`${basePrefix}/routes/new`}>
          <Button variant="primary" icon={PlusCircle} size="sm">
            Create Route
          </Button>
        </Link>
      </PlanningNavHeader>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Route Statuses */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Route Fleet</span>
            <div className="p-2 bg-blue-50 text-brand-blue rounded-xl">
              <Route className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-navy">{routes.length}</span>
            <span className="text-xs text-brand-slate">Total</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="text-emerald-600 font-bold">{activeRoutes.length} Active</span>
            <span className="text-amber-600 font-bold">{draftRoutes.length} Draft</span>
            <span className="text-slate-400 font-medium">{inactiveRoutes.length} Inactive</span>
          </div>
        </div>

        {/* Fleet Vehicles */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Bus Allocation</span>
            <div className="p-2 bg-teal-50 text-brand-teal rounded-xl">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-navy">{assignedBuses.length}</span>
            <span className="text-xs text-brand-slate">/ {buses.length} Assigned</span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-600">
            {availableBuses.length} spare / unassigned vehicle(s)
          </div>
        </div>

        {/* Drivers Crew */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Driver Crew</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-navy">{assignedDrivers.length}</span>
            <span className="text-xs text-brand-slate">/ {drivers.length} On Duty</span>
          </div>
          <div className="mt-2 text-xs font-medium text-brand-blue">
            {availableDrivers.length} available driver(s)
          </div>
        </div>

        {/* Operational Issues & Conflicts */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Dispatch Audits</span>
            <div className={`p-2 rounded-xl ${globalConflicts.length > 0 || capacityAlerts.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {globalConflicts.length > 0 || capacityAlerts.length > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-navy">{globalConflicts.length + capacityAlerts.length}</span>
            <span className="text-xs text-brand-slate">Action Items</span>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">
            {globalConflicts.length} schedule conflict(s), {capacityAlerts.length} capacity alert(s)
          </div>
        </div>
      </div>

      {/* Main Operational Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Actionable Route Readiness List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-white border border-border rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Route Planning & Readiness Status</h3>
                <p className="text-xs text-brand-slate">Deterministic audit of route requirements before operational activation.</p>
              </div>
              <Link to={`${basePrefix}/routes`}>
                <Button variant="outline" size="sm" icon={ArrowUpRight}>
                  View All
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : routes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Route className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-brand-navy">No routes planned yet</p>
                <p className="text-xs text-brand-slate mt-1 mb-4">Create your first transit route to begin configuring stops and assignments.</p>
                <Link to={`${basePrefix}/routes/new`}>
                  <Button variant="primary" size="sm" icon={PlusCircle}>
                    New Route
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {routes.slice(0, 5).map((route) => {
                  const assignedBus = buses.find((b) => b.busId === route.assignedBusId || b.id === route.assignedBusId);
                  const assignedDriver = drivers.find((d) => d.driverId === route.assignedDriverId || d.id === route.assignedDriverId);
                  const routeStopsCount = (route.stopIds || []).length;
                  const routeStudents = students.filter((s) => s.routeId === route.routeId || s.routeId === route.id);

                  const readiness = evaluateRouteReadiness({
                    route,
                    stops: Array(routeStopsCount).fill({ sequence: 1, latitude: 40.7, longitude: -74.0 }), // placeholder evaluation for overview
                    bus: assignedBus,
                    driver: assignedDriver,
                    assignedStudentsCount: routeStudents.length,
                  });

                  return (
                    <div 
                      key={route.id || route.routeId}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-brand-blue/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 hover:bg-white"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-brand-blue font-bold text-xs uppercase shrink-0">
                          {route.routeCode || 'RT'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-brand-navy">{route.name}</span>
                            <Badge 
                              variant={route.status === ROUTE_STATUS.ACTIVE ? 'success' : route.status === ROUTE_STATUS.DRAFT ? 'warning' : 'neutral'}
                            >
                              {route.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-brand-slate mt-1 flex flex-wrap items-center gap-3">
                            <span>Bus: <strong className="text-slate-700">{assignedBus?.busNumber || 'Unassigned'}</strong></span>
                            <span>•</span>
                            <span>Driver: <strong className="text-slate-700">{assignedDriver?.fullName || 'Unassigned'}</strong></span>
                            <span>•</span>
                            <span>Students: <strong className="text-slate-700">{routeStudents.length}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${readiness.isReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {readiness.statusText}
                        </span>
                        <Link to={`${basePrefix}/routes/${route.id || route.routeId}`}>
                          <Button variant="ghost" size="sm">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Conflict & Warning Inspector */}
          {(globalConflicts.length > 0 || capacityAlerts.length > 0) && (
            <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-3xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-900">Active Dispatch Warnings Requiring Action</h3>
              </div>
              <div className="space-y-2">
                {globalConflicts.map((conflict, idx) => (
                  <div key={idx} className="p-3 bg-white/90 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <span className="font-bold uppercase px-1.5 py-0.5 bg-amber-100 rounded text-[10px]">
                      {conflict.type}
                    </span>
                    <span>{conflict.message}</span>
                  </div>
                ))}
                {capacityAlerts.map((alert, idx) => (
                  <div key={idx} className="p-3 bg-white/90 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                    <span className="font-bold uppercase px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">
                      {alert.isOver ? 'Over Capacity' : 'Near Capacity'}
                    </span>
                    <span>
                      Route <strong>{alert.route.name}</strong> ({alert.count} students on {alert.capacity}-seat bus {alert.bus.busNumber}).
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Quick Planning Operations Panel */}
        <div className="space-y-4">
          <div className="p-6 bg-white border border-border rounded-3xl shadow-soft">
            <h3 className="text-base font-bold text-brand-navy mb-1">Planning Quick Launch</h3>
            <p className="text-xs text-brand-slate mb-4">Direct shortcuts to critical planning submodules.</p>

            <div className="space-y-2.5">
              <Link 
                to={`${basePrefix}/routes/new`}
                className="p-3 rounded-2xl border border-slate-200 hover:border-brand-blue/50 hover:bg-slate-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-brand-blue rounded-xl">
                    <Route className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-navy block">New Route Workspace</span>
                    <span className="text-[11px] text-brand-slate">Design corridor & map stops</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue transition-colors" />
              </Link>

              <Link 
                to={`${basePrefix}/schedules`}
                className="p-3 rounded-2xl border border-slate-200 hover:border-brand-blue/50 hover:bg-slate-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 text-brand-teal rounded-xl">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-navy block">Schedule Matrix</span>
                    <span className="text-[11px] text-brand-slate">Operating days & hours</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-teal transition-colors" />
              </Link>

              <Link 
                to={`${basePrefix}/trips`}
                className="p-3 rounded-2xl border border-slate-200 hover:border-brand-blue/50 hover:bg-slate-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-navy block">Bulk Trip Generator</span>
                    <span className="text-[11px] text-brand-slate">Create operational dispatches</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Operational Policy Guide */}
          <div className="p-6 bg-slate-100/80 border border-slate-200 rounded-3xl text-xs text-brand-slate space-y-2">
            <div className="flex items-center gap-2 font-bold text-brand-navy">
              <HelpCircle className="w-4 h-4 text-brand-blue" />
              <span>Route Readiness Standard</span>
            </div>
            <p>
              In RouteWise, routes remain in <strong className="text-slate-800">Draft</strong> status until all stops possess validated coordinates, minimum 2 waypoints exist, and active vehicle and driver assignments are confirmed with zero dispatch conflicts.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlanningOverviewPage;
