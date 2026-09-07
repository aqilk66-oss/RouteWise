import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Route, 
  PlusCircle, 
  Edit, 
  Archive, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter,
  Bus,
  Users,
  MapPin,
  ArrowUpRight
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PlanningNavHeader from '../../../components/planning/PlanningNavHeader';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { routeService, busService, driverService, stopService, studentService } from '../../../services/firestore';
import { evaluateRouteReadiness } from '../../../services/planning/routeReadinessService';
import { useAuth } from '../../../context/AuthContext';
import { ROUTE_STATUS, USER_ROLES } from '../../../constants/collections';

export const RoutesPlanningListPage = () => {
  const { role } = useAuth();
  const isTransport = role === USER_ROLES.TRANSPORT_MANAGER;
  const basePrefix = isTransport ? '/transport/planning' : '/admin/planning';

  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stops, setStops] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [routeList, busList, driverList, stopList, studentList] = await Promise.all([
          routeService.getAll({ max: 200 }),
          busService.getAll({ max: 200 }),
          driverService.getAll({ max: 200 }),
          stopService.getAll({ max: 500 }),
          studentService.getAll({ max: 500 }),
        ]);

        setRoutes(routeList || []);
        setBuses(busList || []);
        setDrivers(driverList || []);
        setStops(stopList || []);
        setStudents(studentList || []);
      } catch (err) {
        console.error('Failed to load routes planning data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch = 
      route.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.routeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <PlanningNavHeader 
        title="Route Planning & Operational Fleet" 
        subtitle="Manage route definitions, configure stop sequences, evaluate readiness checklists, and assign vehicles."
      >
        <Link to={`${basePrefix}/routes/new`}>
          <Button variant="primary" icon={PlusCircle} size="sm">
            Create Route
          </Button>
        </Link>
      </PlanningNavHeader>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-border rounded-2xl shadow-soft mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by route name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy focus:outline-none focus:border-brand-blue bg-white"
          >
            <option value="all">All Statuses</option>
            <option value={ROUTE_STATUS.ACTIVE}>Active Only</option>
            <option value={ROUTE_STATUS.DRAFT}>Draft Only</option>
            <option value={ROUTE_STATUS.INACTIVE}>Inactive Only</option>
            <option value={ROUTE_STATUS.ARCHIVED}>Archived Only</option>
          </select>
        </div>
      </div>

      {/* Routes List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white border border-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="p-12 text-center bg-white border border-border rounded-3xl shadow-soft">
          <Route className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-base font-bold text-brand-navy">No matching routes found</p>
          <p className="text-xs text-brand-slate mt-1 mb-4">Adjust your search filters or start by creating a new transit route.</p>
          <Link to={`${basePrefix}/routes/new`}>
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Create New Route
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRoutes.map((route) => {
            const assignedBus = buses.find((b) => b.busId === route.assignedBusId || b.id === route.assignedBusId);
            const assignedDriver = drivers.find((d) => d.driverId === route.assignedDriverId || d.id === route.assignedDriverId);
            const routeStops = stops.filter((s) => s.routeId === route.routeId || s.routeId === route.id);
            const routeStudents = students.filter((s) => s.routeId === route.routeId || s.routeId === route.id);

            const readiness = evaluateRouteReadiness({
              route,
              stops: routeStops,
              bus: assignedBus,
              driver: assignedDriver,
              assignedStudentsCount: routeStudents.length,
            });

            return (
              <div 
                key={route.id || route.routeId}
                className="p-5 bg-white border border-border rounded-2xl shadow-soft hover:border-brand-blue/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-brand-blue rounded-2xl font-black text-sm uppercase shrink-0">
                    {route.routeCode || 'RT'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-brand-navy text-base">{route.name}</h4>
                      <Badge 
                        variant={route.status === ROUTE_STATUS.ACTIVE ? 'success' : route.status === ROUTE_STATUS.DRAFT ? 'warning' : 'neutral'}
                      >
                        {route.status}
                      </Badge>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${readiness.isReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {readiness.statusText}
                      </span>
                    </div>

                    <p className="text-xs text-brand-slate mt-1 max-w-xl">
                      {route.description || 'Standard academic transit corridor with sequential student pickups and drop-offs.'}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-brand-slate">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{routeStops.length}</strong> stops configured
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-slate-400" />
                        Bus: <strong className="text-brand-navy">{assignedBus ? `${assignedBus.busNumber} (${assignedBus.capacity} cap)` : 'Unassigned'}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Driver: <strong className="text-brand-navy">{assignedDriver?.fullName || 'Unassigned'}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Students: <strong className="text-brand-navy">{routeStudents.length}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Link to={`${basePrefix}/routes/${route.id || route.routeId}`}>
                    <Button variant="outline" size="sm" icon={Edit}>
                      Plan & Sequence
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default RoutesPlanningListPage;
