import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import AnalyticsNavHeader from '../../../components/analytics/AnalyticsNavHeader';
import MetricCard from '../../../components/ui/MetricCard';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import DonutBreakdown from '../../../components/charts/DonutBreakdown';
import { analyticsService } from '../../../services/analytics/analyticsService';
import { getPeriodDateRange } from '../../../services/reports/reportService';
import { exportToCSV } from '../../../services/reports/exportService';

export const SafetyAnalyticsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [incidents, setIncidents] = useState([]);

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const dateRange = getPeriodDateRange(period);
      const dataset = await analyticsService.fetchAnalyticsDataset({
        startDate: dateRange.startDateStr,
        endDate: dateRange.endDateStr,
      });

      setIncidents(dataset.incidents);
    } catch (err) {
      console.error('Failed to load safety analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter((i) => (i.severity || '').toLowerCase() === 'critical').length;
  const highCount = incidents.filter((i) => (i.severity || '').toLowerCase() === 'high').length;
  const mediumCount = incidents.filter((i) => (i.severity || '').toLowerCase() === 'medium').length;
  const minorCount = incidents.filter((i) => (i.severity || '').toLowerCase() === 'low' || (i.severity || '').toLowerCase() === 'minor').length;

  const resolvedCount = incidents.filter((i) => (i.status || '').toLowerCase() === 'resolved' || (i.status || '').toLowerCase() === 'closed').length;
  const unresolvedCount = totalIncidents - resolvedCount;

  const handleExportCSV = () => {
    setExporting(true);
    try {
      const rows = incidents.map((i) => ({
        IncidentId: i.id || i.incidentId,
        Type: i.type || 'General',
        Severity: i.severity,
        Status: i.status,
        RouteName: i.routeName || 'N/A',
        BusNumber: i.busNumber || 'N/A',
        ReportedDate: i.date || (i.reportedAt ? new Date(i.reportedAt).toLocaleDateString() : 'N/A'),
        Period: period,
      }));
      exportToCSV(rows, `routewise-safety-incidents-${period}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const severityData = [
    { label: 'Critical', value: criticalCount, color: '#ef4444' },
    { label: 'High', value: highCount, color: '#f97316' },
    { label: 'Medium', value: mediumCount, color: '#f59e0b' },
    { label: 'Minor / Low', value: minorCount, color: '#3b82f6' },
  ];

  const columns = [
    {
      header: 'Incident Code & Type',
      key: 'type',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-brand-navy">{row.type || 'Incident'}</span>
          <p className="text-[10px] font-mono text-brand-slate">{row.incidentId || row.id?.slice(-8)}</p>
        </div>
      ),
    },
    {
      header: 'Severity Level',
      key: 'severity',
      sortable: true,
      render: (row) => {
        let variant = 'neutral';
        if (row.severity === 'critical') variant = 'danger';
        if (row.severity === 'high') variant = 'warning';
        return <Badge variant={variant}>{row.severity || 'Normal'}</Badge>;
      },
    },
    {
      header: 'Investigation Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        const isClosed = (row.status || '').toLowerCase() === 'resolved' || (row.status || '').toLowerCase() === 'closed';
        return (
          <Badge variant={isClosed ? 'neutral' : 'active'}>
            {row.status || 'Reported'}
          </Badge>
        );
      },
    },
    {
      header: 'Route / Vehicle',
      key: 'busNumber',
      render: (row) => (
        <span className="text-xs text-brand-slate">
          {row.routeName ? `${row.routeName} (${row.busNumber || 'Bus'})` : row.busNumber || 'Fleet Vehicle'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <Link
          to={`/admin/incidents/${row.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
        >
          <span>Investigation</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout title="Safety Events & Incident Risk Analytics">
      <AnalyticsNavHeader
        title="Safety Events & Incident Analytics"
        subtitle="Tracking emergency SOS alarms, vehicle breakdowns, road obstacles, and investigation resolution."
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => loadData(true)}
        onExport={handleExportCSV}
        refreshing={refreshing}
        exporting={exporting}
      />

      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <MetricCard
            title="Total Incidents"
            value={totalIncidents}
            sublabel="Reported transit safety events"
            icon={ShieldAlert}
          />
          <MetricCard
            title="Critical Alarms"
            value={criticalCount}
            sublabel="Urgent safety/medical flags"
            icon={AlertTriangle}
            status={criticalCount > 0 ? 'negative' : 'positive'}
          />
          <MetricCard
            title="Active Investigations"
            value={unresolvedCount}
            sublabel="Awaiting supervisor clearance"
            icon={Clock}
            status={unresolvedCount > 0 ? 'warning' : 'positive'}
          />
          <MetricCard
            title="Resolution Velocity"
            value={totalIncidents > 0 ? `${Math.round((resolvedCount / totalIncidents) * 100)}%` : '100%'}
            sublabel={`${resolvedCount} resolved cases`}
            icon={ShieldCheck}
            status="positive"
          />
        </div>

        {/* Breakdown and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-brand-navy mb-1">Severity Distribution</h3>
            <p className="text-xs text-brand-slate mb-4">Risk stratification across recorded safety logs.</p>
            <DonutBreakdown
              data={severityData}
              centerLabel="Events"
              centerValue={totalIncidents}
            />
          </Card>

          <Card className="p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-brand-navy mb-1">Safety Log Register</h3>
            <p className="text-xs text-brand-slate mb-4">Showing {incidents.length} safety incident reports.</p>
            <DataTable
              columns={columns}
              data={incidents}
              loading={loading}
              emptyText="Zero safety incidents recorded during this operational period."
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SafetyAnalyticsPage;
