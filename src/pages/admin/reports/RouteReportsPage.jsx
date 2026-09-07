import React, { useState, useEffect } from 'react';
import { 
  Route, 
  Download, 
  RefreshCw, 
  MapPin, 
  Users, 
  Navigation, 
  AlertTriangle, 
  Search,
  CheckCircle2 
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import MetricCard from '../../../components/ui/MetricCard';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import ReportNavigationHeader from '../../../components/reports/ReportNavigationHeader';
import ReportPeriodSelector from '../../../components/reports/ReportPeriodSelector';
import BarChartVisualizer from '../../../components/charts/BarChartVisualizer';
import { reportService, getPeriodDateRange } from '../../../services/reports/reportService';
import { exportToCSV } from '../../../services/reports/exportService';

export const RouteReportsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [baseData, setBaseData] = useState({
    routes: [],
    trips: [],
    students: [],
    stops: [],
  });

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await reportService.fetchAllBaseData();
      setBaseData(data);
    } catch (err) {
      console.error('Failed to load route reports data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dateRange = getPeriodDateRange(period, customStart, customEnd);
  const routeAnalytics = reportService.computeRouteAnalytics(
    baseData.routes,
    baseData.trips,
    baseData.students,
    baseData.stops || [],
    dateRange
  );

  // Passenger load by route bar chart
  const passengerBars = routeAnalytics.routesList.slice(0, 6).map((r) => ({
    label: r.routeCode || r.name?.slice(0, 10) || 'Route',
    value: r.studentsCount,
    color: 'teal',
  }));

  // Filter routes table
  const filteredRoutes = routeAnalytics.routesList.filter((r) => {
    if (statusFilter !== 'all') {
      if ((r.status || 'active').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (r.name || '').toLowerCase();
      const code = (r.routeCode || '').toLowerCase();
      if (!name.includes(q) && !code.includes(q)) return false;
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Route Code', 'Route Name', 'Status', 'Stops Count', 'Assigned Students', 'Trips in Period', 'Delays in Period', 'On-Time Rate %'];
    const rows = filteredRoutes.map((r) => [
      r.routeCode || '',
      r.name || '',
      r.status || 'active',
      r.stopsCount,
      r.studentsCount,
      r.tripsCount,
      r.delaysCount,
      `${r.onTimeRate}%`,
    ]);

    exportToCSV(headers, rows, `routewise-routes-${dateRange.startDateStr}-to-${dateRange.endDateStr}.csv`);
  };

  return (
    <DashboardLayout title="Corridor Route Performance & Stop Density Analytics">
      <div className="space-y-6">
        <ReportNavigationHeader
          title="Transit Corridor & Route Performance Analytics"
          subtitle={`Route passenger load, corridor dispatch density, and schedule on-time rates for ${dateRange.startDateStr} to ${dateRange.endDateStr}.`}
        >
          <ReportPeriodSelector
            selectedPeriod={period}
            onPeriodChange={setPeriod}
            customStart={customStart}
            customEnd={customEnd}
            onCustomDateChange={(start, end) => {
              setCustomStart(start);
              setCustomEnd(end);
            }}
          />

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => loadData(true)}
            loading={refreshing}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            className="bg-brand-navy hover:bg-slate-800 text-white font-bold"
          >
            Export Routes CSV
          </Button>
        </ReportNavigationHeader>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Transit Corridors"
            value={routeAnalytics.totalRoutes}
            icon={Route}
            subtitle={`${routeAnalytics.active} currently active`}
            color="navy"
            loading={loading}
          />
          <MetricCard
            title="Corridor Coverage"
            value={`${routeAnalytics.totalRoutes > 0 ? Math.round((routeAnalytics.active / routeAnalytics.totalRoutes) * 100) : 100}%`}
            icon={CheckCircle2}
            subtitle="Operational readiness ratio"
            color="emerald"
            loading={loading}
          />
          <MetricCard
            title="Total Designated Stops"
            value={baseData.stops?.length || 0}
            icon={MapPin}
            subtitle="Sequential pickup stations"
            color="teal"
            loading={loading}
          />
          <MetricCard
            title="Enrolled Passengers"
            value={baseData.students.length}
            icon={Users}
            subtitle="Assigned corridor riders"
            color="blue"
            loading={loading}
          />
        </div>

        {/* Route Passenger Load Chart */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-blue" />
            Passenger Ridership by Corridor
          </h3>
          <p className="text-xs text-brand-slate">
            Comparison of enrolled students assigned to major transit lines.
          </p>
          <BarChartVisualizer
            data={passengerBars}
            height={180}
            emptyText="No corridor passenger assignments available"
          />
        </Card>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search route name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-brand-navy outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-brand-slate">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-white text-brand-navy outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Corridors</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Routes Performance Table */}
        <div className="bg-white rounded-3xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-navy">Corridor Operational Log</h3>
            <span className="text-xs font-semibold text-brand-slate">
              Showing {filteredRoutes.length} corridors
            </span>
          </div>

          {filteredRoutes.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Route}
                title="No routes match search criteria"
                description="Adjust search query or status filter to display corridors."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-navy">
                <thead className="bg-slate-50 border-b border-border text-[10px] uppercase font-bold text-brand-slate tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Corridor Name</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Stops</th>
                    <th className="px-5 py-3">Enrolled Riders</th>
                    <th className="px-5 py-3">Trips Run</th>
                    <th className="px-5 py-3">Delays</th>
                    <th className="px-5 py-3 text-right">On-Time %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRoutes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-bold text-brand-blue">
                        {r.routeCode || 'RTE'}
                      </td>
                      <td className="px-5 py-3 font-semibold text-brand-navy truncate max-w-[160px]">
                        {r.name || 'Transit Route'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={r.status === 'active' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {r.status || 'Active'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-brand-slate">
                        {r.stopsCount} stops
                      </td>
                      <td className="px-5 py-3 font-semibold text-brand-navy">
                        {r.studentsCount} students
                      </td>
                      <td className="px-5 py-3 text-brand-slate font-medium">
                        {r.tripsCount}
                      </td>
                      <td className="px-5 py-3 text-amber-700 font-medium">
                        {r.delaysCount}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-brand-navy">
                        {r.onTimeRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RouteReportsPage;
