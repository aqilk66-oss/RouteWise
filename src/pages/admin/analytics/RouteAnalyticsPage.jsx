import React, { useState, useEffect } from 'react';
import { 
  Route, 
  Users, 
  Bus, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import AnalyticsNavHeader from '../../../components/analytics/AnalyticsNavHeader';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import BarChartVisualizer from '../../../components/charts/BarChartVisualizer';
import { analyticsService } from '../../../services/analytics/analyticsService';
import { getPeriodDateRange } from '../../../services/reports/reportService';
import { exportToCSV } from '../../../services/reports/exportService';

export const RouteAnalyticsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [routeStats, setRouteStats] = useState([]);
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

      const stats = analyticsService.computeRouteAnalytics(dataset);
      setRouteStats(stats);
    } catch (err) {
      console.error('Failed to load route analytics:', err);
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
      const rows = routeStats.map((r) => ({
        RouteName: r.name,
        RouteCode: r.code,
        Status: r.status,
        TotalTrips: r.totalTrips,
        CompletedTrips: r.completedTrips,
        CompletionRatePct: r.completionRate ?? 'N/A',
        DelayedTrips: r.delayedTrips,
        DelayRatePct: r.delayRate ?? 'N/A',
        AssignedStudents: r.studentCount,
        AssignedBus: r.busNumber,
        BusCapacity: r.busCapacity ?? 'N/A',
        CapacityUtilizationPct: r.capacityUtilization ?? 'N/A',
        IncidentsCount: r.incidentCount,
        Period: period,
      }));
      exportToCSV(rows, `routewise-routes-analytics-${period}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const filteredRoutes = routeStats.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top 5 routes by delay count for chart
  const delayChartData = routeStats
    .filter((r) => r.delayedTrips > 0)
    .sort((a, b) => b.delayedTrips - a.delayedTrips)
    .slice(0, 5)
    .map((r) => ({
      label: r.code || r.name.slice(0, 8),
      value: r.delayedTrips,
      color: 'amber',
    }));

  const columns = [
    {
      header: 'Route Corridor',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-brand-navy">{row.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {row.code}
            </span>
          </div>
          <span className="text-xs text-brand-slate">Bus: {row.busNumber}</span>
        </div>
      ),
    },
    {
      header: 'Scheduled Trips',
      key: 'totalTrips',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-brand-navy">{row.totalTrips}</span>
      ),
    },
    {
      header: 'Completion Rate',
      key: 'completionRate',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-brand-navy">
            {row.completionRate !== null ? `${row.completionRate}%` : '—'}
          </span>
          <span className="text-[10px] text-brand-slate">
            ({row.completedTrips}/{row.totalTrips})
          </span>
        </div>
      ),
    },
    {
      header: 'Delay Rate',
      key: 'delayRate',
      sortable: true,
      render: (row) => (
        <Badge variant={row.delayRate > 20 ? 'warning' : 'neutral'}>
          {row.delayRate !== null ? `${row.delayRate}% (${row.delayedTrips})` : '0%'}
        </Badge>
      ),
    },
    {
      header: 'Capacity Utilization',
      key: 'capacityUtilization',
      sortable: true,
      render: (row) => {
        if (row.capacityStatus === 'unavailable') {
          return <span className="text-xs text-slate-400 italic">No Bus Capacity</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={
                row.capacityStatus === 'over_capacity'
                  ? 'danger'
                  : row.capacityStatus === 'near_capacity'
                  ? 'warning'
                  : 'active'
              }
            >
              {row.capacityUtilization}%
            </Badge>
            <span className="text-xs text-brand-slate">
              {row.studentCount} / {row.busCapacity} seats
            </span>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <Link
          to={`/admin/planning/routes/${row.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
        >
          <span>Planning</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout title="Route Performance & Capacity Intelligence">
      <AnalyticsNavHeader
        title="Route Performance & Capacity Intelligence"
        subtitle="Evaluation of corridor efficiency, student passenger load, and recurring transit delays."
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => loadData(true)}
        onExport={handleExportCSV}
        refreshing={refreshing}
        exporting={exporting}
      />

      {/* Delay Distribution Chart */}
      {delayChartData.length > 0 && (
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Corridors with Recorded Delays</h3>
              <p className="text-xs text-brand-slate">Top routes experiencing transit hold-ups during the period.</p>
            </div>
            <Badge variant="warning">Transit Bottlenecks</Badge>
          </div>
          <BarChartVisualizer data={delayChartData} height={160} />
        </Card>
      )}

      {/* Table Card */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-brand-navy">All Corridors Performance Matrix</h3>
            <p className="text-xs text-brand-slate">Showing {filteredRoutes.length} configured routes.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search route or bus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-border rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredRoutes}
          loading={loading}
          emptyText="No routes match the selected search criteria."
        />
      </Card>
    </DashboardLayout>
  );
};

export default RouteAnalyticsPage;
