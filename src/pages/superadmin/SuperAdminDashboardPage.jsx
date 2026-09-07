import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Bus, 
  Route as RouteIcon, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight,
  TrendingUp,
  Server,
  Activity,
  Sliders,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { auditService } from '../../services/admin/auditService';
import { adminUserService } from '../../services/admin/adminUserService';
import { schoolService } from '../../services/admin/schoolService';
import { systemConfigService } from '../../services/admin/systemConfigService';
import { USER_ROLES } from '../../constants/collections';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Loader from '../../components/ui/Loader';

const SuperAdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    admins: 0,
    transportManagers: 0,
    drivers: 0,
    students: 0,
    parents: 0,
    schools: 0,
    buses: 0,
    routes: 0,
    incidents: 0,
    recentAuditCount: 0
  });
  const [recentAudits, setRecentAudits] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Users
      const users = await adminUserService.getAllUsers();
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active' || !u.status).length;
      const suspendedUsers = users.filter(u => u.status === 'suspended').length;
      const admins = users.filter(u => u.role === USER_ROLES.ADMIN || u.role === USER_ROLES.SUPER_ADMIN).length;
      const transportManagers = users.filter(u => u.role === USER_ROLES.TRANSPORT_MANAGER).length;
      const drivers = users.filter(u => u.role === USER_ROLES.DRIVER).length;
      const students = users.filter(u => u.role === USER_ROLES.STUDENT).length;
      const parents = users.filter(u => u.role === USER_ROLES.PARENT).length;

      // 2. Fetch Schools
      const schools = await schoolService.getAllSchools();

      // 3. Operational Counts (buses, routes, incidents)
      let busesCount = 0;
      let routesCount = 0;
      let incidentsCount = 0;
      let incidentsList = [];

      try {
        const busesSnap = await getDocs(collection(db, 'buses'));
        busesCount = busesSnap.size;
      } catch (err) {
        console.warn('Could not read buses collection count:', err);
      }

      try {
        const routesSnap = await getDocs(collection(db, 'routes'));
        routesCount = routesSnap.size;
      } catch (err) {
        console.warn('Could not read routes collection count:', err);
      }

      try {
        const incidentsSnap = await getDocs(collection(db, 'incidents'));
        incidentsCount = incidentsSnap.size;
        incidentsList = incidentsSnap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 4);
      } catch (err) {
        console.warn('Could not read incidents collection count:', err);
      }

      // 4. Audit logs
      const audits = await auditService.getAuditLogs({ pageSize: 6 });

      // 5. Config
      const config = await systemConfigService.getSystemConfig();

      setStats({
        totalUsers,
        activeUsers,
        suspendedUsers,
        admins,
        transportManagers,
        drivers,
        students,
        parents,
        schools: schools.length,
        buses: busesCount,
        routes: routesCount,
        incidents: incidentsCount,
        recentAuditCount: audits.length
      });

      setRecentAudits(audits);
      setRecentIncidents(incidentsList);
      setMaintenanceMode(Boolean(config?.maintenanceMode));
    } catch (error) {
      console.error('Error loading Super Admin Dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <SuperAdminLayout title="Governance Console">
        <div className="py-20 flex justify-center">
          <Loader variant="inline" text="Gathering system telemetry..." />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout title="System Governance Console">
      <div className="space-y-6">
        {/* Maintenance Mode Banner if active */}
        {maintenanceMode && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900">Maintenance Mode Active</p>
                <p className="text-xs text-amber-700">The platform is currently operating in restricted maintenance mode for public users.</p>
              </div>
            </div>
            <Link 
              to="/super-admin/configuration"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Configure
            </Link>
          </div>
        )}

        {/* Executive Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-brand-teal text-xs font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5" /> High-Level Platform Overview
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Institutional Governance Terminal
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Real-time audit telemetry, user identity distribution, institutional school scoping, and platform health metrics across the RouteWise network.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 shadow-soft disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
            <Link
              to="/super-admin/audit-logs"
              className="px-4 py-2.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-soft"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Ledger</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Users */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-brand-slate tracking-wider">Total Accounts</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-brand-navy">{stats.totalUsers}</p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-brand-slate font-medium">
                <span className="text-emerald-600 font-bold flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5 inline" /> {stats.activeUsers} Active
                </span>
                {stats.suspendedUsers > 0 && (
                  <span className="text-rose-600 font-bold">
                    • {stats.suspendedUsers} Suspended
                  </span>
                )}
              </div>
            </div>
            <Link 
              to="/super-admin/users"
              className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-blue hover:text-blue-700"
            >
              <span>Manage Directory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Schools & Districts */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-brand-slate tracking-wider">School Campuses</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-brand-navy">{stats.schools}</p>
              <p className="mt-1.5 text-xs text-brand-slate font-medium">
                {stats.schools === 0 ? 'No campuses registered yet' : 'Active institutions under governance'}
              </p>
            </div>
            <Link 
              to="/super-admin/schools"
              className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-teal hover:text-teal-700"
            >
              <span>Manage Schools</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Fleet & Transit Assets */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-brand-slate tracking-wider">Transit Operations</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bus className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-brand-navy">{stats.buses}</p>
                <span className="text-xs font-bold text-brand-slate">Buses</span>
                <span className="text-slate-300">/</span>
                <p className="text-xl font-bold text-brand-navy">{stats.routes}</p>
                <span className="text-xs font-bold text-brand-slate">Routes</span>
              </div>
              <p className="mt-1.5 text-xs text-brand-slate font-medium">
                {stats.drivers} licensed drivers deployed
              </p>
            </div>
            <Link 
              to="/admin/buses"
              className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Transport Overview</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Platform Security & Incidents */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-brand-slate tracking-wider">Safety & Audit</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-brand-navy">{stats.incidents}</p>
              <p className="mt-1.5 text-xs text-brand-slate font-medium">
                {stats.recentAuditCount} immutable ledger entries recorded
              </p>
            </div>
            <Link 
              to="/super-admin/security"
              className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              <span>Security Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Role Breakdown Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-border shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-brand-navy">Identity & Role Distribution</h2>
              <p className="text-xs text-brand-slate mt-0.5">Real-time breakdown of user classifications across all institutions</p>
            </div>
            <Link 
              to="/super-admin/roles"
              className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
            >
              <span>Permissions Matrix</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-brand-slate">Administrators</p>
              <p className="text-2xl font-black text-brand-navy mt-1">{stats.admins}</p>
              <p className="text-[10px] text-slate-500 mt-1">Super & Ops Admins</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-brand-slate">Transport Managers</p>
              <p className="text-2xl font-black text-brand-navy mt-1">{stats.transportManagers}</p>
              <p className="text-[10px] text-slate-500 mt-1">Fleet Supervisors</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-brand-slate">Drivers</p>
              <p className="text-2xl font-black text-brand-navy mt-1">{stats.drivers}</p>
              <p className="text-[10px] text-slate-500 mt-1">Transport Operators</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-brand-slate">Parents & Guardians</p>
              <p className="text-2xl font-black text-brand-navy mt-1">{stats.parents}</p>
              <p className="text-[10px] text-slate-500 mt-1">Family Observers</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-brand-slate">Students</p>
              <p className="text-2xl font-black text-brand-navy mt-1">{stats.students}</p>
              <p className="text-[10px] text-slate-500 mt-1">Enrolled Passengers</p>
            </div>
          </div>
        </div>

        {/* Two-Column Section: Recent Audit Entries & Safety Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Recent Audit Events */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-brand-blue">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-navy">Immutable Audit Trail</h3>
                    <p className="text-xs text-brand-slate">Latest recorded governance operations</p>
                  </div>
                </div>
                <Link
                  to="/super-admin/audit-logs"
                  className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {recentAudits.length === 0 ? (
                  <div className="py-8 text-center">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-brand-slate font-medium">No audit records logged yet.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Actions like user updates and config changes will appear here.</p>
                  </div>
                ) : (
                  recentAudits.map((log) => (
                    <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            log.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium mt-1 truncate">
                          {log.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase shrink-0">
                        {log.resourceType}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Append-only ledger enforced. Records cannot be edited or destroyed.
              </p>
            </div>
          </div>

          {/* Right Column: Platform Quick Links & Health Status */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-50 text-brand-teal">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-navy">Governance Hub</h3>
                    <p className="text-xs text-brand-slate">Core administrative control panels</p>
                  </div>
                </div>
                <Link
                  to="/super-admin/system-health"
                  className="text-xs font-bold text-brand-teal hover:text-teal-700 flex items-center gap-1"
                >
                  Diagnostics <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <Link
                  to="/super-admin/users"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-blue hover:bg-blue-50/30 transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-brand-blue">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-navy">User Management</p>
                    <p className="text-[10px] text-brand-slate">Suspensions & activations</p>
                  </div>
                </Link>

                <Link
                  to="/super-admin/schools"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-teal hover:bg-teal-50/30 transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-teal-50 text-brand-teal">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-navy">Campus Scoping</p>
                    <p className="text-[10px] text-brand-slate">Districts & institutions</p>
                  </div>
                </Link>

                <Link
                  to="/super-admin/configuration"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-navy">Platform Config</p>
                    <p className="text-[10px] text-brand-slate">Maintenance & parameters</p>
                  </div>
                </Link>

                <Link
                  to="/super-admin/security"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-600 hover:bg-amber-50/30 transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-navy">Threat Telemetry</p>
                    <p className="text-[10px] text-brand-slate">Access logs & warnings</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Platform Infrastructure</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboardPage;
