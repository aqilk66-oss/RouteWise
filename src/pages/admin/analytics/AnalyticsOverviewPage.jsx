import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Navigation, 
  Bus, 
  Users, 
  Route, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import AnalyticsNavHeader from '../../../components/analytics/AnalyticsNavHeader';
import MetricCard from '../../../components/ui/MetricCard';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import DonutBreakdown from '../../../components/charts/DonutBreakdown';
import BarChartVisualizer from '../../../components/charts/BarChartVisualizer';
import TrendLineVisualizer from '../../../components/charts/TrendLineVisualizer';
import { analyticsService } from '../../../services/analytics/analyticsService';
import { getPeriodDateRange } from '../../../services/reports/reportService';
import { exportToCSV } from '../../../services/reports/exportService';

export const AnalyticsOverviewPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [attentionItems, setAttentionItems] = useState([]);
  const [error, setError] = useState(null);

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const dateRange = getPeriodDateRange(period);
      const dataset = await analyticsService.fetchAnalyticsDataset({
        startDate: dateRange.startDateStr,
        endDate: dateRange.endDateStr,
      });

      const overviewKPIs = analyticsService.computeOverviewKPIs(dataset);
      const items = analyticsService.generateOperationalAttentionItems(dataset);

      setData(dataset);
      setKpis(overviewKPIs);
      setAttentionItems(items);
    } catch (err) {
      console.error('Failed to load analytics overview:', err);
      setError('Unable to fetch operational analytics data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const handleExportCSV = () => {
    if (!kpis) return;
    setExporting(true);
    try {
      const exportRows = [
        { Metric: 'Total Scheduled Trips', Value: kpis.trips.total, Period: period },
        { Metric: 'Completed Trips', Value: kpis.trips.completed, Period: period },
        { Metric: 'Trip Completion Rate (%)', Value: kpis.trips.completionRate ?? 'N/A', Period: period },
        { Metric: 'Delayed Trips', Value: kpis.trips.delayed, Period: period },
        { Metric: 'Trip Delay Rate (%)', Value: kpis.trips.delayRate ?? 'N/A', Period: period },
        { Metric: 'Average Delay (mins)', Value: kpis.trips.averageDelay ?? 'N/A', Period: period },
        { Metric: 'Cancelled Trips', Value: kpis.trips.cancelled, Period: period },
        { Metric: 'Trip Cancellation Rate (%)', Value: kpis.trips.cancellationRate ?? 'N/A', Period: period },
        { Metric: 'Fleet Total Buses', Value: kpis.fleet.total, Period: period },
        { Metric: 'Buses Available / Assigned', Value: kpis.fleet.available + kpis.fleet.assigned, Period: period },
        { Metric: 'Buses Under Maintenance', Value: kpis.fleet.maintenance, Period: period },
        { Metric: 'Attendance Verified Rate (%)', Value: kpis.attendance.completionRate ?? 'N/A', Period: period },
        { Metric: 'Total Safety Incidents', Value: kpis.safety.totalIncidents, Period: period },
        { Metric: 'Unresolved Safety Incidents', Value: kpis.safety.unresolved, Period: period },
      ];
      exportToCSV(exportRows, `routewise-analytics-summary-${period}.csv`);
    } finally {
      setExporting(false);
    }
  };

  // Chart data formatting
  const reliabilityData = kpis ? [
    { label: 'On Schedule', value: kpis.trips.reliabilityCounts.on_schedule, color: '#10b981' },
    { label: 'Delayed', value: kpis.trips.reliabilityCounts.delayed, color: '#f59e0b' },
    { label: 'Cancelled', value: kpis.trips.reliabilityCounts.cancelled, color: '#ef4444' },
    { label: 'Incomplete / Pending', value: kpis.trips.reliabilityCounts.incomplete, color: '#94a3b8' },
  ] : [];

  const fleetStatusData = kpis ? [
    { label: 'Available', value: kpis.fleet.available, color: 'teal' },
    { label: 'Assigned', value: kpis.fleet.assigned, color: 'blue' },
    { label: 'Maintenance', value: kpis.fleet.maintenance, color: 'amber' },
    { label: 'Out of Service', value: kpis.fleet.outOfService, color: 'rose' },
  ] : [];

  return (
    <DashboardLayout title="Analytics & Operational Intelligence Overview">
      <AnalyticsNavHeader
        title="Operational Intelligence Overview"
        subtitle="Transparent KPIs derived from genuine trip telemetry, vehicle work orders, and student attendance."
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => loadData(true)}
        onExport={handleExportCSV}
        refreshing={refreshing}
        exporting={exporting}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-brand-slate">Aggregating operational intelligence...</p>
        </div>
      ) : kpis ? (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Trip Completion Rate"
              value={kpis.trips.completionRate !== null ? `${kpis.trips.completionRate}%` : '—'}
              sublabel={`${kpis.trips.completed} of ${kpis.trips.total} trips completed`}
              icon={CheckCircle2}
              trend={kpis.trips.completionRate !== null ? `${kpis.trips.total} eligible trips` : 'No data'}
              status={kpis.trips.completionRate >= 90 ? 'positive' : 'warning'}
            />

            <MetricCard
              title="Operational Delay Rate"
              value={kpis.trips.delayRate !== null ? `${kpis.trips.delayRate}%` : '—'}
              sublabel={kpis.trips.averageDelay !== null ? `Avg delay: ${kpis.trips.averageDelay} min` : 'Delay timestamps missing'}
              icon={Clock}
              status={kpis.trips.delayRate > 20 ? 'negative' : 'neutral'}
            />

            <MetricCard
              title="Fleet Availability"
              value={kpis.fleet.availabilityRate !== null ? `${kpis.fleet.availabilityRate}%` : '—'}
              sublabel={`${kpis.fleet.available + kpis.fleet.assigned} of ${kpis.fleet.total} vehicles operational`}
              icon={Bus}
              status={kpis.fleet.maintenance > 0 ? 'warning' : 'positive'}
            />

            <MetricCard
              title="Attendance Verification"
              value={kpis.attendance.completionRate !== null ? `${kpis.attendance.completionRate}%` : '—'}
              sublabel={`${kpis.attendance.boarded} boarded, ${kpis.attendance.absent} absent`}
              icon={Users}
              status={kpis.attendance.completionRate >= 85 ? 'positive' : 'warning'}
            />
          </div>

          {/* Operational Attention Panel */}
          {attentionItems.length > 0 && (
            <Card className="p-5 border-amber-200 bg-amber-50/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-brand-navy">
                    Deterministic Operational Attention Items ({attentionItems.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attentionItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white border border-border shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-brand-navy">{item.title}</span>
                        <Badge variant={item.severity === 'critical' ? 'danger' : 'warning'}>
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-brand-slate">{item.message}</p>
                    </div>
                    <Link
                      to={item.drillDownUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-blue-700 mt-3 self-start"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Visual Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-brand-navy">Trip Reliability Breakdown</h3>
                  <p className="text-xs text-brand-slate">Categorized delivery for {kpis.trips.total} scheduled runs.</p>
                </div>
                <Link to="/admin/analytics/trips" className="text-xs font-bold text-brand-blue hover:underline">
                  Trip Details →
                </Link>
              </div>
              <DonutBreakdown
                data={reliabilityData}
                centerLabel="Trips"
                centerValue={kpis.trips.total}
              />
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-brand-navy">Fleet Status Distribution</h3>
                  <p className="text-xs text-brand-slate">Active inventory allocation across {kpis.fleet.total} vehicles.</p>
                </div>
                <Link to="/admin/analytics/fleet" className="text-xs font-bold text-brand-blue hover:underline">
                  Fleet Logs →
                </Link>
              </div>
              <BarChartVisualizer
                data={fleetStatusData}
                height={200}
              />
            </Card>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default AnalyticsOverviewPage;
