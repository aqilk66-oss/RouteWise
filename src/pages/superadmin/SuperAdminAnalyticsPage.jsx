import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Building2, 
  Bus, 
  Route, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Server,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import AnalyticsNavHeader from '../../components/analytics/AnalyticsNavHeader';
import MetricCard from '../../components/ui/MetricCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import DonutBreakdown from '../../components/charts/DonutBreakdown';
import BarChartVisualizer from '../../components/charts/BarChartVisualizer';
import { analyticsService } from '../../services/analytics/analyticsService';
import { getPeriodDateRange } from '../../services/reports/reportService';
import { exportToCSV } from '../../services/reports/exportService';

export const SuperAdminAnalyticsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dataset, setDataset] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [attentionItems, setAttentionItems] = useState([]);

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const dateRange = getPeriodDateRange(period);
      const data = await analyticsService.fetchAnalyticsDataset({
        startDate: dateRange.startDateStr,
        endDate: dateRange.endDateStr,
      });

      const overviewKPIs = analyticsService.computeOverviewKPIs(data);
      const items = analyticsService.generateOperationalAttentionItems(data);

      setDataset(data);
      setKpis(overviewKPIs);
      setAttentionItems(items);
    } catch (err) {
      console.error('Failed to load SuperAdmin analytics:', err);
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
        { Domain: 'Trips', Total: kpis.trips.total, CompletionRate: `${kpis.trips.completionRate}%`, Delayed: kpis.trips.delayed, Cancelled: kpis.trips.cancelled },
        { Domain: 'Fleet', TotalBuses: kpis.fleet.total, Available: kpis.fleet.available, InShop: kpis.fleet.maintenance, OutOfService: kpis.fleet.outOfService },
        { Domain: 'Attendance', TotalEvents: kpis.attendance.totalRecords, Boarded: kpis.attendance.boarded, Absences: kpis.attendance.absent, Rate: `${kpis.attendance.completionRate}%` },
        { Domain: 'Safety', TotalIncidents: kpis.safety.totalIncidents, Unresolved: kpis.safety.unresolved },
      ];
      exportToCSV(exportRows, `routewise-system-governance-analytics-${period}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const reliabilityData = kpis ? [
    { label: 'On Schedule', value: kpis.trips.reliabilityCounts.on_schedule, color: '#10b981' },
    { label: 'Delayed', value: kpis.trips.reliabilityCounts.delayed, color: '#f59e0b' },
    { label: 'Cancelled', value: kpis.trips.reliabilityCounts.cancelled, color: '#ef4444' },
    { label: 'Incomplete', value: kpis.trips.reliabilityCounts.incomplete, color: '#94a3b8' },
  ] : [];

  return (
    <SuperAdminLayout title="System-Wide Operational Intelligence & Analytics">
      <AnalyticsNavHeader
        title="Multi-District Operational Intelligence"
        subtitle="System-level governance metrics, institutional vehicle utilization, and cross-campus compliance."
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => loadData(true)}
        onExport={handleExportCSV}
        refreshing={refreshing}
        exporting={exporting}
        isSuperAdmin={true}
      />

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-brand-slate">Compiling governance analytics...</p>
        </div>
      ) : kpis ? (
        <div className="space-y-6">
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="System-Wide Trips"
              value={kpis.trips.total}
              sublabel={`${kpis.trips.completionRate ?? 0}% completed successfully`}
              icon={BarChart3}
              status="positive"
            />
            <MetricCard
              title="Fleet Size"
              value={kpis.fleet.total}
              sublabel={`${kpis.fleet.maintenance} in shop downtime`}
              icon={Bus}
              status={kpis.fleet.maintenance > 0 ? 'warning' : 'positive'}
            />
            <MetricCard
              title="Attendance Audit"
              value={kpis.attendance.completionRate !== null ? `${kpis.attendance.completionRate}%` : '—'}
              sublabel={`${kpis.attendance.boarded} student boardings logged`}
              icon={Users}
              status="positive"
            />
            <MetricCard
              title="Threats & Incidents"
              value={kpis.safety.totalIncidents}
              sublabel={`${kpis.safety.unresolved} pending investigation`}
              icon={AlertTriangle}
              status={kpis.safety.unresolved > 0 ? 'warning' : 'positive'}
            />
          </div>

          {/* Attention Items */}
          {attentionItems.length > 0 && (
            <Card className="p-5 border-amber-200 bg-amber-50/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-brand-navy">
                    Executive Governance Attention Items ({attentionItems.length})
                  </h3>
                </div>
                <Badge variant="warning">System Flags</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attentionItems.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-white border border-border shadow-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-brand-navy">{item.title}</span>
                      <Badge variant={item.severity === 'critical' ? 'danger' : 'warning'}>
                        {item.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-brand-slate">{item.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-brand-navy mb-1">Network Reliability</h3>
              <p className="text-xs text-brand-slate mb-4">Trip execution across all registered school districts.</p>
              <DonutBreakdown
                data={reliabilityData}
                centerLabel="Trips"
                centerValue={kpis.trips.total}
              />
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-brand-navy mb-1">Fleet Inventory State</h3>
              <p className="text-xs text-brand-slate mb-4">Readiness of vehicles currently on platform.</p>
              <BarChartVisualizer
                data={[
                  { label: 'Available', value: kpis.fleet.available, color: 'teal' },
                  { label: 'Assigned', value: kpis.fleet.assigned, color: 'blue' },
                  { label: 'Shop', value: kpis.fleet.maintenance, color: 'amber' },
                  { label: 'Grounded', value: kpis.fleet.outOfService, color: 'rose' },
                ]}
                height={200}
              />
            </Card>
          </div>
        </div>
      ) : null}
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalyticsPage;
