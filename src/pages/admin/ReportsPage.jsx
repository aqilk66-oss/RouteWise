import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  RefreshCw, 
  Bus, 
  Users, 
  Route, 
  Navigation, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import MetricCard from '../../components/ui/MetricCard';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ReportNavigationHeader from '../../components/reports/ReportNavigationHeader';
import ReportPeriodSelector from '../../components/reports/ReportPeriodSelector';
import DonutBreakdown from '../../components/charts/DonutBreakdown';
import BarChartVisualizer from '../../components/charts/BarChartVisualizer';
import TrendLineVisualizer from '../../components/charts/TrendLineVisualizer';
import { reportService, getPeriodDateRange } from '../../services/reports/reportService';
import { exportToCSV } from '../../services/reports/exportService';

export const ReportsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [baseData, setBaseData] = useState({
    students: [],
    buses: [],
    drivers: [],
    routes: [],
    trips: [],
    attendance: [],
  });

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await reportService.fetchAllBaseData();
      setBaseData(data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load base report data:', err);
      setError('Unable to fetch institutional fleet data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dateRange = getPeriodDateRange(period, customStart, customEnd);
  const overview = reportService.computeOverviewMetrics(baseData, dateRange);

  // Trip status donut data
  const tripDonutData = [
    { label: 'Completed', value: overview.completedTrips, color: '#059669' },
    { label: 'Delayed', value: overview.delayedTrips, color: '#d97706' },
    { label: 'Cancelled', value: overview.cancelledTrips, color: '#e11d48' },
    { 
      label: 'Scheduled / In Progress', 
      value: Math.max(0, overview.totalTrips - (overview.completedTrips + overview.delayedTrips + overview.cancelledTrips)), 
      color: '#2563eb' 
    },
  ];

  // Fleet operational readiness bar data
  const fleetBarData = [
    { label: 'Active', value: overview.activeBuses, color: 'emerald' },
    { label: 'Available', value: Math.max(0, overview.totalBuses - overview.activeBuses), color: 'blue' },
    { label: 'Drivers', value: overview.activeDrivers, color: 'teal' },
    { label: 'Routes', value: overview.activeRoutes, color: 'navy' },
  ];

  // CSV Export for Overview Summary
  const handleExportSummaryCSV = () => {
    const headers = ['Metric', 'Value', 'Reporting Period'];
    const rows = [
      ['Total Enrolled Students', overview.totalStudents, period],
      ['Active Students', overview.activeStudents, period],
      ['Total Registered Buses', overview.totalBuses, period],
      ['Active Buses', overview.activeBuses, period],
      ['Total Fleet Capacity (Seats)', overview.totalCapacity, period],
      ['Capacity Utilization', `${overview.capacityUtilization}%`, period],
      ['Total Corridor Routes', overview.totalRoutes, period],
      ['Active Routes', overview.activeRoutes, period],
      ['Total Drivers', overview.totalDrivers, period],
      ['Active Drivers', overview.activeDrivers, period],
      ['Total Trips in Period', overview.totalTrips, period],
      ['Completed Trips', overview.completedTrips, period],
      ['Delayed Trips', overview.delayedTrips, period],
      ['Cancelled Trips', overview.cancelledTrips, period],
      ['Fleet On-Time Rate', `${overview.onTimeRate}%`, period],
      ['Passenger Boarding Rate', `${overview.boardingRate}%`, period],
    ];

    exportToCSV(headers, rows, `routewise-overview-${dateRange.startDateStr}-to-${dateRange.endDateStr}.csv`);
  };

  return (
    <DashboardLayout title="Fleet Analytics & Executive Overview">
      <div className="space-y-6">
        {/* Navigation Bar & Header */}
        <ReportNavigationHeader
          title="Institutional Transportation Intelligence"
          subtitle={`Verified operational metrics for ${dateRange.startDateStr} through ${dateRange.endDateStr}.`}
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
            onClick={handleExportSummaryCSV}
            className="bg-brand-navy hover:bg-slate-800 text-white font-bold"
          >
            Export Summary
          </Button>
        </ReportNavigationHeader>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between text-xs">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => loadData()}>
              Retry
            </Button>
          </div>
        )}

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Fleet Capacity"
            value={overview.totalCapacity}
            icon={Bus}
            subtitle={`${overview.totalBuses} buses (${overview.capacityUtilization}% utilized)`}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Fleet On-Time Rate"
            value={`${overview.onTimeRate}%`}
            icon={TrendingUp}
            subtitle={`${overview.delayedTrips} reported delays`}
            color="emerald"
            loading={loading}
          />
          <MetricCard
            title="Passenger Boarding Rate"
            value={`${overview.boardingRate}%`}
            icon={Users}
            subtitle={`${overview.activeStudents} active passengers`}
            color="teal"
            loading={loading}
          />
          <MetricCard
            title="Active Corridors"
            value={overview.activeRoutes}
            icon={Route}
            subtitle={`${overview.totalRoutes} total routes`}
            color="navy"
            loading={loading}
          />
        </div>

        {/* Analytical Visual Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trip Status Fulfillment Donut */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Navigation className="w-4 h-4 text-brand-blue" />
              Trip Fulfillment Breakdown
            </h3>
            <p className="text-xs text-brand-slate">
              Distribution of transit runs logged across the selected period ({overview.totalTrips} total).
            </p>
            <DonutBreakdown
              data={tripDonutData}
              centerValue={overview.totalTrips}
              centerLabel="Total Trips"
              emptyText="No trips recorded in this period"
            />
          </Card>

          {/* Fleet Deployment Distribution Bar */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Bus className="w-4 h-4 text-brand-teal" />
              Operational Resource Allocation
            </h3>
            <p className="text-xs text-brand-slate">
              Active physical assets deployed vs total capacity.
            </p>
            <BarChartVisualizer
              data={fleetBarData}
              height={180}
              emptyText="No resource deployment data"
            />
          </Card>
        </div>

        {/* Operational Reliability & Attendance Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Fulfillment Ratio</span>
            <p className="text-2xl font-black text-brand-navy">
              {overview.totalTrips > 0 ? Math.round((overview.completedTrips / overview.totalTrips) * 100) : 0}%
            </p>
            <p className="text-xs text-brand-slate">
              {overview.completedTrips} of {overview.totalTrips} runs completed
            </p>
          </Card>

          <Card className="p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Delay Incidence</span>
            <p className="text-2xl font-black text-amber-700">
              {overview.totalTrips > 0 ? Math.round((overview.delayedTrips / overview.totalTrips) * 100) : 0}%
            </p>
            <p className="text-xs text-brand-slate">
              {overview.delayedTrips} traffic or bottleneck alerts
            </p>
          </Card>

          <Card className="p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Data Freshness</span>
            <p className="text-lg font-bold text-brand-navy">
              {lastUpdated ? `Live as of ${lastUpdated}` : 'Current Snapshot'}
            </p>
            <p className="text-xs text-brand-slate">
              Direct authoritative query against Firestore
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
