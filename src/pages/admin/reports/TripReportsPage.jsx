import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Download, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Search,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import MetricCard from '../../../components/ui/MetricCard';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import ReportNavigationHeader from '../../../components/reports/ReportNavigationHeader';
import ReportPeriodSelector from '../../../components/reports/ReportPeriodSelector';
import DonutBreakdown from '../../../components/charts/DonutBreakdown';
import BarChartVisualizer from '../../../components/charts/BarChartVisualizer';
import TrendLineVisualizer from '../../../components/charts/TrendLineVisualizer';
import { reportService, getPeriodDateRange } from '../../../services/reports/reportService';
import { exportToCSV } from '../../../services/reports/exportService';
import { TRIP_STATUS } from '../../../constants/collections';

export const TripReportsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [baseData, setBaseData] = useState({
    trips: [],
    routes: [],
    buses: [],
    drivers: [],
  });

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await reportService.fetchAllBaseData();
      setBaseData(data);
    } catch (err) {
      console.error('Failed to load trip reports data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dateRange = getPeriodDateRange(period, customStart, customEnd);
  const tripAnalytics = reportService.computeTripAnalytics(
    baseData.trips,
    baseData.routes,
    baseData.buses,
    baseData.drivers,
    dateRange
  );

  // Status donut data
  const statusDonutData = [
    { label: 'Completed', value: tripAnalytics.completed, color: '#059669' },
    { label: 'Delayed', value: tripAnalytics.delayed, color: '#d97706' },
    { label: 'In Progress', value: tripAnalytics.inProgress, color: '#0d9488' },
    { label: 'Scheduled', value: tripAnalytics.scheduled, color: '#2563eb' },
    { label: 'Cancelled', value: tripAnalytics.cancelled, color: '#e11d48' },
  ];

  // Daily trend data formatted for TrendLineVisualizer
  const trendLineData = tripAnalytics.dailyTrend.map((d) => ({
    label: d.date.slice(5), // MM-DD
    value: d.total,
  }));

  // Delay reasons bar chart data
  const delayReasonBars = Object.entries(tripAnalytics.delayReasons).map(([reason, count]) => ({
    label: reason.length > 12 ? reason.slice(0, 10) + '...' : reason,
    value: count,
    color: 'amber',
  }));

  // Filter trips table
  const filteredTrips = tripAnalytics.tripsList.filter((t) => {
    if (statusFilter !== 'all') {
      if ((t.status || 'scheduled') !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const rName = (t.routeName || '').toLowerCase();
      const bNum = (t.busNumber || '').toLowerCase();
      const dName = (t.driverName || '').toLowerCase();
      const tId = (t.id || '').toLowerCase();
      if (!rName.includes(q) && !bNum.includes(q) && !dName.includes(q) && !tId.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Trip ID', 'Date', 'Route', 'Bus', 'Driver', 'Status', 'Start Time', 'End Time', 'Delay Reason'];
    const rows = filteredTrips.map((t) => [
      t.id,
      t.date || t.createdAt?.split('T')[0] || '',
      t.routeName || '',
      t.busNumber || '',
      t.driverName || '',
      t.status || 'scheduled',
      t.actualStartTime || t.scheduledStartTime || '',
      t.actualEndTime || '',
      t.delayReason || '',
    ]);

    exportToCSV(headers, rows, `routewise-trips-${dateRange.startDateStr}-to-${dateRange.endDateStr}.csv`);
  };

  return (
    <DashboardLayout title="Trip Operations & Schedule Fulfillment Analytics">
      <div className="space-y-6">
        <ReportNavigationHeader
          title="Trip Performance & Fulfillment Analytics"
          subtitle={`Schedule execution, delay categorization, and trip dispatch analytics for ${dateRange.startDateStr} to ${dateRange.endDateStr}.`}
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
            Export Trips CSV
          </Button>
        </ReportNavigationHeader>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Dispatched Trips"
            value={tripAnalytics.total}
            icon={Navigation}
            subtitle={`${tripAnalytics.completed} completed runs`}
            color="navy"
            loading={loading}
          />
          <MetricCard
            title="Completion Rate"
            value={`${tripAnalytics.completionRate}%`}
            icon={CheckCircle2}
            subtitle={`${tripAnalytics.completed} successfully finished`}
            color="emerald"
            loading={loading}
          />
          <MetricCard
            title="Delay Incidence"
            value={`${tripAnalytics.delayRate}%`}
            icon={AlertTriangle}
            subtitle={`${tripAnalytics.delayed} reported transit delays`}
            color="amber"
            loading={loading}
          />
          <MetricCard
            title="Cancellation Rate"
            value={`${tripAnalytics.cancellationRate}%`}
            icon={XCircle}
            subtitle={`${tripAnalytics.cancelled} cancelled runs`}
            color="rose"
            loading={loading}
          />
        </div>

        {/* Two Visual Breakdown Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trip Status Donut */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Navigation className="w-4 h-4 text-brand-blue" />
              Trip Status Breakdown
            </h3>
            <p className="text-xs text-brand-slate">
              Proportional distribution of active and logged transit runs.
            </p>
            <DonutBreakdown
              data={statusDonutData}
              centerValue={tripAnalytics.total}
              centerLabel="Trips"
              emptyText="No trips found in this date range"
            />
          </Card>

          {/* Daily Dispatch Trend */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-teal" />
              Daily Transit Run Volume
            </h3>
            <p className="text-xs text-brand-slate">
              Timeline of trips dispatched per day over selected period.
            </p>
            <TrendLineVisualizer
              data={trendLineData}
              height={180}
              emptyText="No daily trend data available for this range"
            />
          </Card>
        </div>

        {/* Delay Reason Breakdown if any delays exist */}
        {delayReasonBars.length > 0 && (
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Categorized Transit Delay Advisories
            </h3>
            <p className="text-xs text-brand-slate">
              Direct causes logged by drivers and dispatch during transit operations.
            </p>
            <BarChartVisualizer
              data={delayReasonBars}
              height={160}
              title="Reported Delay Frequency by Category"
            />
          </Card>
        )}

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search route, bus, or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-brand-navy outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-brand-slate">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-white text-brand-navy outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Trips</option>
              <option value={TRIP_STATUS.COMPLETED}>Completed</option>
              <option value={TRIP_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={TRIP_STATUS.DELAYED}>Delayed</option>
              <option value={TRIP_STATUS.SCHEDULED}>Scheduled</option>
              <option value={TRIP_STATUS.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Trips Data Table */}
        <div className="bg-white rounded-3xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-navy">Trips Audit Log</h3>
            <span className="text-xs font-semibold text-brand-slate">
              Showing {filteredTrips.length} of {tripAnalytics.total} trips
            </span>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Navigation}
                title="No trips match criteria"
                description="Try expanding your period range or changing search filters."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-navy">
                <thead className="bg-slate-50 border-b border-border text-[10px] uppercase font-bold text-brand-slate tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Route</th>
                    <th className="px-5 py-3">Bus</th>
                    <th className="px-5 py-3">Driver</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Timing</th>
                    <th className="px-5 py-3">Advisory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTrips.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-semibold text-brand-navy">
                        {t.date || t.createdAt?.split('T')[0] || 'Scheduled Run'}
                      </td>
                      <td className="px-5 py-3 font-bold text-brand-navy truncate max-w-[140px]">
                        {t.routeName || 'Corridor Run'}
                      </td>
                      <td className="px-5 py-3 font-medium text-brand-slate">
                        {t.busNumber || 'Fleet Unit'}
                      </td>
                      <td className="px-5 py-3 font-medium text-brand-slate truncate max-w-[120px]">
                        {t.driverName || 'Assigned Operator'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={
                            t.status === TRIP_STATUS.COMPLETED || t.status === 'completed'
                              ? 'success'
                              : t.status === TRIP_STATUS.IN_PROGRESS || t.status === 'inProgress'
                              ? 'active'
                              : t.status === TRIP_STATUS.DELAYED || t.status === 'delayed'
                              ? 'warning'
                              : t.status === TRIP_STATUS.CANCELLED || t.status === 'cancelled'
                              ? 'error'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {t.status || 'Scheduled'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-brand-slate">
                        {t.actualStartTime || t.scheduledStartTime || '—'}
                        {t.actualEndTime && ` → ${t.actualEndTime}`}
                      </td>
                      <td className="px-5 py-3 text-brand-slate truncate max-w-[140px]">
                        {t.delayReason || 'Normal Transit'}
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

export default TripReportsPage;
