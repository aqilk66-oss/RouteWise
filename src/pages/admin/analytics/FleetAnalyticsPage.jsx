import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Wrench, 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle2, 
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
import BarChartVisualizer from '../../../components/charts/BarChartVisualizer';
import { analyticsService } from '../../../services/analytics/analyticsService';
import { getPeriodDateRange } from '../../../services/reports/reportService';
import { exportToCSV } from '../../../services/reports/exportService';

export const FleetAnalyticsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fleetStats, setFleetStats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const dateRange = getPeriodDateRange(period);
      const dataset = await analyticsService.fetchAnalyticsDataset({
        startDate: dateRange.startDateStr,
        endDate: dateRange.endDateStr,
      });

      const stats = analyticsService.computeFleetAnalytics(dataset);
      setFleetStats(stats);
    } catch (err) {
      console.error('Failed to load fleet analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const handleExportCSV = () => {
    setExporting(true);
    try {
      const rows = fleetStats.map((b) => ({
        BusNumber: b.busNumber,
        LicensePlate: b.plateNumber,
        Status: b.status,
        ConfiguredCapacity: b.capacity ?? 'N/A',
        AssignedRoute: b.assignedRouteName || 'None',
        TotalTrips: b.totalTrips,
        DelayedTrips: b.delayedTrips,
        TotalMaintenanceOrders: b.totalMaintenanceCount,
        ActiveWorkOrders: b.activeWorkOrders,
        TotalInspections: b.totalInspections,
        FailedInspections: b.failedInspections,
        Period: period,
      }));
      exportToCSV(rows, `routewise-fleet-analytics-${period}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const filteredFleet = fleetStats.filter((b) =>
    b.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.assignedRouteName && b.assignedRouteName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalBuses = fleetStats.length;
  const maintenanceBuses = fleetStats.filter((b) => b.status === 'maintenance').length;
  const outOfService = fleetStats.filter((b) => b.status === 'outOfService').length;
  const inspectionFails = fleetStats.reduce((acc, b) => acc + b.failedInspections, 0);

  // Top vehicles with work orders for chart
  const maintenanceChartData = fleetStats
    .filter((b) => b.totalMaintenanceCount > 0)
    .sort((a, b) => b.totalMaintenanceCount - a.totalMaintenanceCount)
    .slice(0, 5)
    .map((b) => ({
      label: b.busNumber,
      value: b.totalMaintenanceCount,
      color: 'amber',
    }));

  const columns = [
    {
      header: 'Vehicle Identifier',
      key: 'busNumber',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-brand-navy">{row.busNumber}</span>
          <p className="text-[10px] font-mono text-brand-slate">{row.plateNumber}</p>
        </div>
      ),
    },
    {
      header: 'Operational Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        let variant = 'active';
        if (row.status === 'maintenance') variant = 'warning';
        if (row.status === 'outOfService' || row.status === 'retired') variant = 'danger';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Assigned Corridor',
      key: 'assignedRouteName',
      render: (row) => (
        <span className="text-xs text-brand-slate">
          {row.assignedRouteName || 'Spare / Unassigned'}
        </span>
      ),
    },
    {
      header: 'Assigned Runs',
      key: 'totalTrips',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-brand-navy">{row.totalTrips}</span>
      ),
    },
    {
      header: 'Maintenance Orders',
      key: 'totalMaintenanceCount',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-brand-navy">{row.totalMaintenanceCount}</span>
          {row.activeWorkOrders > 0 && (
            <Badge variant="warning">{row.activeWorkOrders} Active</Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Inspection Issues',
      key: 'failedInspections',
      sortable: true,
      render: (row) => (
        row.failedInspections > 0 ? (
          <Badge variant="danger">{row.failedInspections} Failed</Badge>
        ) : (
          <span className="text-xs text-emerald-600 font-semibold">Clean</span>
        )
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <Link
          to={`/admin/fleet/buses/${row.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
        >
          <span>Fleet Hub</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout title="Fleet Reliability & Maintenance Analytics">
      <AnalyticsNavHeader
        title="Fleet Reliability & Maintenance Analytics"
        subtitle="School bus downtime, recurring mechanical repairs, and daily pre-trip walkaround audits."
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
            title="Total Fleet Vehicles"
            value={totalBuses}
            sublabel="Active school bus inventory"
            icon={Bus}
          />
          <MetricCard
            title="Maintenance Downtime"
            value={maintenanceBuses}
            sublabel={`${maintenanceBuses} buses currently in shop`}
            icon={Wrench}
            status={maintenanceBuses > 0 ? 'warning' : 'positive'}
          />
          <MetricCard
            title="Out of Service"
            value={outOfService}
            sublabel="Grounded / decommissioned"
            icon={AlertTriangle}
            status={outOfService > 0 ? 'negative' : 'positive'}
          />
          <MetricCard
            title="Inspection Issues"
            value={inspectionFails}
            sublabel="Pre-trip walkaround flags"
            icon={ClipboardCheck}
            status={inspectionFails > 0 ? 'warning' : 'positive'}
          />
        </div>

        {/* Maintenance Frequency Chart */}
        {maintenanceChartData.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Vehicles with Highest Maintenance Logs</h3>
                <p className="text-xs text-brand-slate">Work order distribution across school vehicles.</p>
              </div>
              <Badge variant="warning">Shop Frequency</Badge>
            </div>
            <BarChartVisualizer data={maintenanceChartData} height={160} />
          </Card>
        )}

        {/* Fleet Inventory Table */}
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Vehicle Fleet Operational Registry</h3>
              <p className="text-xs text-brand-slate">Showing {filteredFleet.length} tracked vehicles.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search bus number or plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-border rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredFleet}
            loading={loading}
            emptyText="No vehicles match the selected search criteria."
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FleetAnalyticsPage;
