import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Navigation, 
  AlertTriangle, 
  Search,
  Users 
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

export const DriverReportsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [baseData, setBaseData] = useState({
    drivers: [],
    trips: [],
  });

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await reportService.fetchAllBaseData();
      setBaseData(data);
    } catch (err) {
      console.error('Failed to load driver reports data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dateRange = getPeriodDateRange(period, customStart, customEnd);
  const driverAnalytics = reportService.computeDriverAnalytics(
    baseData.drivers,
    baseData.trips,
    dateRange
  );

  // Trips run by driver bar chart
  const driverTripsBars = driverAnalytics.driversList.slice(0, 6).map((d) => ({
    label: d.fullName?.split(' ')[0] || 'Driver',
    value: d.assignedTrips,
    color: 'navy',
  }));

  // Filter drivers table
  const filteredDrivers = driverAnalytics.driversList.filter((d) => {
    if (statusFilter !== 'all') {
      if ((d.status || 'active').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (d.fullName || '').toLowerCase();
      const license = (d.licenseNumber || '').toLowerCase();
      if (!name.includes(q) && !license.includes(q)) return false;
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Driver Name', 'License Number', 'Status', 'Assigned Runs', 'Completed Runs', 'Delayed Runs', 'Cancelled Runs', 'On-Time Rate %'];
    const rows = filteredDrivers.map((d) => [
      d.fullName || '',
      d.licenseNumber || 'CDL',
      d.status || 'active',
      d.assignedTrips,
      d.completedTrips,
      d.delayedTrips,
      d.cancelledTrips,
      `${d.onTimeRate}%`,
    ]);

    exportToCSV(headers, rows, `routewise-drivers-${dateRange.startDateStr}-to-${dateRange.endDateStr}.csv`);
  };

  return (
    <DashboardLayout title="Operator Activity & Driver Dispatch Analytics">
      <div className="space-y-6">
        <ReportNavigationHeader
          title="Operator Dispatch & Operational Activity Analytics"
          subtitle={`Objective dispatch history, run completion rates, and license validity for ${dateRange.startDateStr} to ${dateRange.endDateStr}.`}
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
            Export Drivers CSV
          </Button>
        </ReportNavigationHeader>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Certified Operators"
            value={driverAnalytics.totalDrivers}
            icon={Shield}
            subtitle={`${driverAnalytics.active} actively rostered`}
            color="navy"
            loading={loading}
          />
          <MetricCard
            title="Active Operators on Duty"
            value={driverAnalytics.onDuty || driverAnalytics.active}
            icon={CheckCircle2}
            subtitle="Current dispatch availability"
            color="emerald"
            loading={loading}
          />
          <MetricCard
            title="Total Dispatched Runs"
            value={driverAnalytics.driversList.reduce((acc, d) => acc + d.assignedTrips, 0)}
            icon={Navigation}
            subtitle="Trips logged across period"
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Fleet Adherence Rate"
            value={`${driverAnalytics.totalDrivers > 0 ? Math.round(driverAnalytics.driversList.reduce((acc, d) => acc + d.onTimeRate, 0) / driverAnalytics.totalDrivers) : 100}%`}
            icon={CheckCircle2}
            subtitle="Average on-time execution"
            color="teal"
            loading={loading}
          />
        </div>

        {/* Operator Trip Volume Bar Chart */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <Navigation className="w-4 h-4 text-brand-blue" />
            Dispatch Workload by Driver
          </h3>
          <p className="text-xs text-brand-slate">
            Total transit runs logged by primary operators during the selected reporting timeframe.
          </p>
          <BarChartVisualizer
            data={driverTripsBars}
            height={180}
            emptyText="No driver trip activity recorded in this period"
          />
        </Card>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver by name or license..."
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
              <option value="all">All Operators</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Driver Activity Table */}
        <div className="bg-white rounded-3xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-navy">Driver Activity & Fulfillment Log</h3>
            <span className="text-xs font-semibold text-brand-slate">
              Showing {filteredDrivers.length} operators
            </span>
          </div>

          {filteredDrivers.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Shield}
                title="No operators match search criteria"
                description="Adjust search terms or status dropdown to display drivers."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-navy">
                <thead className="bg-slate-50 border-b border-border text-[10px] uppercase font-bold text-brand-slate tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Operator Name</th>
                    <th className="px-5 py-3">License Number</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Assigned Runs</th>
                    <th className="px-5 py-3">Completed Runs</th>
                    <th className="px-5 py-3">Delays</th>
                    <th className="px-5 py-3 text-right">On-Time %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDrivers.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-bold text-brand-navy">
                        {d.fullName || 'Authorized Driver'}
                      </td>
                      <td className="px-5 py-3 text-brand-slate font-medium">
                        {d.licenseNumber || 'CDL Verified'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={d.status === 'active' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {d.status || 'Active'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 font-semibold text-brand-navy">
                        {d.assignedTrips}
                      </td>
                      <td className="px-5 py-3 text-emerald-800 font-semibold">
                        {d.completedTrips}
                      </td>
                      <td className="px-5 py-3 text-amber-700 font-medium">
                        {d.delayedTrips}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-brand-navy">
                        {d.onTimeRate}%
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

export default DriverReportsPage;
