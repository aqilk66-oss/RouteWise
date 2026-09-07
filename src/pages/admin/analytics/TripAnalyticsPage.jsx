import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Route,
  Bus,
  ArrowUpRight
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { evaluateTripReliability } from '../../../services/analytics/kpiDefinitions';

export const TripAnalyticsPage = () => {
  const [searchParams] = useSearchParams();
  const initialRouteFilter = searchParams.get('routeId') || 'all';

  const [period, setPeriod] = useState('last7days');
  const [routeFilter, setRouteFilter] = useState(initialRouteFilter);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const dateRange = getPeriodDateRange(period);
      const dataset = await analyticsService.fetchAnalyticsDataset({
        startDate: dateRange.startDateStr,
        endDate: dateRange.endDateStr,
      });

      setTrips(dataset.trips);
      setRoutes(dataset.routes);
    } catch (err) {
      console.error('Failed to load trip analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const filteredTrips = trips.filter((t) => {
    if (routeFilter !== 'all' && t.routeId !== routeFilter) return false;
    return true;
  });

  const totalFiltered = filteredTrips.length;
  const completedTrips = filteredTrips.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
  const delayedTrips = filteredTrips.filter((t) => (t.status || '').toLowerCase() === 'delayed' || (t.delayMinutes && t.delayMinutes > 0)).length;
  const cancelledTrips = filteredTrips.filter((t) => (t.status || '').toLowerCase() === 'cancelled').length;

  const handleExportCSV = () => {
    setExporting(true);
    try {
      const rows = filteredTrips.map((t) => ({
        TripId: t.id,
        RouteName: t.routeName || 'N/A',
        BusNumber: t.busNumber || 'N/A',
        DriverName: t.driverName || 'N/A',
        Status: t.status,
        Reliability: evaluateTripReliability(t),
        DelayMinutes: t.delayMinutes || 0,
        ScheduledStartTime: t.scheduledStartTime || 'N/A',
        ActualStartTime: t.actualStartTime || 'N/A',
        Period: period,
      }));
      exportToCSV(rows, `routewise-trips-reliability-${period}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const reliabilityData = [
    { label: 'Completed On Time', value: completedTrips - delayedTrips > 0 ? completedTrips - delayedTrips : 0, color: '#10b981' },
    { label: 'Delayed', value: delayedTrips, color: '#f59e0b' },
    { label: 'Cancelled', value: cancelledTrips, color: '#ef4444' },
    { label: 'Other / Pending', value: totalFiltered - (completedTrips + cancelledTrips) > 0 ? totalFiltered - (completedTrips + cancelledTrips) : 0, color: '#94a3b8' },
  ];

  const columns = [
    {
      header: 'Trip & Route',
      key: 'routeName',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-brand-navy">{row.routeName || 'Campus Corridor'}</span>
          <p className="text-[10px] font-mono text-brand-slate">ID: {row.id?.slice(-8)}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Operator & Bus',
      key: 'busNumber',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-brand-navy">{row.busNumber || 'Bus'}</span>
          <p className="text-brand-slate">{row.driverName || 'Driver'}</p>
        </div>
      ),
    },
    {
      header: 'Schedule Time',
      key: 'scheduledStartTime',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-brand-slate">
          {row.scheduledStartTime ? new Date(row.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unscheduled'}
        </span>
      ),
    },
    {
      header: 'Reliability Assessment',
      key: 'status',
      sortable: true,
      render: (row) => {
        const rel = evaluateTripReliability(row);
        if (rel === 'cancelled') {
          return <Badge variant="danger">Cancelled</Badge>;
        }
        if (rel === 'delayed') {
          return (
            <Badge variant="warning">
              Delayed {row.delayMinutes ? `(+${row.delayMinutes}m)` : ''}
            </Badge>
          );
        }
        if (rel === 'on_schedule') {
          return <Badge variant="active">On Schedule</Badge>;
        }
        return <Badge variant="neutral">{row.status || 'Pending'}</Badge>;
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <Link
          to={`/admin/trips`}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
        >
          <span>Dispatch</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout title="Trip Dispatch & Operational Reliability Analytics">
      <AnalyticsNavHeader
        title="Trip Dispatch & Reliability Analytics"
        subtitle="Chronological review of scheduled journeys, delay durations, and cancellation factors."
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => loadData(true)}
        onExport={handleExportCSV}
        refreshing={refreshing}
        exporting={exporting}
      >
        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-border rounded-xl text-brand-navy"
          aria-label="Filter by Route"
        >
          <option value="all">All Corridors</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name || r.routeName}
            </option>
          ))}
        </select>
      </AnalyticsNavHeader>

      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Eligible Trips"
            value={totalFiltered}
            sublabel="Scheduled journeys in date window"
            icon={Navigation}
          />
          <MetricCard
            title="Delayed Trips"
            value={delayedTrips}
            sublabel={totalFiltered > 0 ? `${Math.round((delayedTrips / totalFiltered) * 100)}% of trips` : '0%'}
            icon={AlertTriangle}
            status={delayedTrips > 0 ? 'warning' : 'positive'}
          />
          <MetricCard
            title="Cancelled Trips"
            value={cancelledTrips}
            sublabel={totalFiltered > 0 ? `${Math.round((cancelledTrips / totalFiltered) * 100)}% cancellation rate` : '0%'}
            icon={XCircle}
            status={cancelledTrips > 0 ? 'negative' : 'positive'}
          />
        </div>

        {/* Breakdown & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-brand-navy mb-1">Dispatch Reliability</h3>
            <p className="text-xs text-brand-slate mb-4">Proportion of on-time versus impacted runs.</p>
            <DonutBreakdown
              data={reliabilityData}
              centerLabel="Trips"
              centerValue={totalFiltered}
            />
          </Card>

          <Card className="p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-brand-navy mb-1">Trip Journey Records</h3>
            <p className="text-xs text-brand-slate mb-4">Showing {filteredTrips.length} journeys for selected corridor.</p>
            <DataTable
              columns={columns}
              data={filteredTrips}
              loading={loading}
              emptyText="No trips recorded for the selected corridor and date range."
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TripAnalyticsPage;
