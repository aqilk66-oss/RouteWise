import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Wrench, 
  Users, 
  Search,
  AlertTriangle 
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
import { reportService, getPeriodDateRange } from '../../../services/reports/reportService';
import { exportToCSV } from '../../../services/reports/exportService';

export const BusReportsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [baseData, setBaseData] = useState({
    buses: [],
    trips: [],
    students: [],
  });

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await reportService.fetchAllBaseData();
      setBaseData(data);
    } catch (err) {
      console.error('Failed to load bus reports data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dateRange = getPeriodDateRange(period, customStart, customEnd);
  const busAnalytics = reportService.computeBusAnalytics(
    baseData.buses,
    baseData.trips,
    baseData.students,
    dateRange
  );

  // Status donut data
  const statusDonutData = [
    { label: 'Active', value: busAnalytics.active, color: '#059669' },
    { label: 'Available', value: busAnalytics.available, color: '#2563eb' },
    { label: 'Assigned', value: busAnalytics.assigned, color: '#0d9488' },
    { label: 'Maintenance', value: busAnalytics.maintenance, color: '#d97706' },
    { label: 'Retired', value: busAnalytics.retired, color: '#64748b' },
  ];

  // Top utilized buses bar chart data
  const utilizationBars = busAnalytics.busesList.slice(0, 6).map((b) => ({
    label: b.busNumber || 'Bus',
    value: b.utilizationPct,
    color: b.utilizationPct > 85 ? 'amber' : 'teal',
  }));

  // Filter buses table
  const filteredBuses = busAnalytics.busesList.filter((b) => {
    if (statusFilter !== 'all') {
      if ((b.status || 'available').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const bNum = (b.busNumber || '').toLowerCase();
      const plate = (b.registrationNumber || b.licensePlate || '').toLowerCase();
      const model = (b.model || '').toLowerCase();
      if (!bNum.includes(q) && !plate.includes(q) && !model.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Bus Number', 'Plate / License', 'Model', 'Status', 'Total Capacity', 'Assigned Students', 'Capacity Utilization %', 'Trips in Period'];
    const rows = filteredBuses.map((b) => [
      b.busNumber || '',
      b.registrationNumber || b.licensePlate || '',
      b.model || '',
      b.status || 'available',
      b.capacityNumber,
      b.enrolledStudents,
      `${b.utilizationPct}%`,
      b.tripsInPeriod,
    ]);

    exportToCSV(headers, rows, `routewise-buses-${dateRange.startDateStr}-to-${dateRange.endDateStr}.csv`);
  };

  return (
    <DashboardLayout title="Fleet Utilization & Operational Capacity Analytics">
      <div className="space-y-6">
        <ReportNavigationHeader
          title="Bus Fleet Readiness & Utilization Analytics"
          subtitle={`Operational capacity, seat enrollment ratios, and maintenance logs for ${dateRange.startDateStr} to ${dateRange.endDateStr}.`}
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
            Export Buses CSV
          </Button>
        </ReportNavigationHeader>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Registered Fleet"
            value={busAnalytics.totalBuses}
            icon={Bus}
            subtitle={`${busAnalytics.active + busAnalytics.assigned} in operational service`}
            color="navy"
            loading={loading}
          />
          <MetricCard
            title="Total Seat Capacity"
            value={busAnalytics.totalCapacity}
            icon={Users}
            subtitle={`${busAnalytics.overallUtilization}% overall enrollment utilization`}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Fleet Readiness"
            value={`${busAnalytics.totalBuses > 0 ? Math.round(((busAnalytics.active + busAnalytics.available + busAnalytics.assigned) / busAnalytics.totalBuses) * 100) : 0}%`}
            icon={CheckCircle2}
            subtitle={`${busAnalytics.available} spare/standby vehicles`}
            color="emerald"
            loading={loading}
          />
          <MetricCard
            title="Maintenance & Hold"
            value={busAnalytics.maintenance}
            icon={Wrench}
            subtitle={`${busAnalytics.retired} decommissioned`}
            color={busAnalytics.maintenance > 0 ? 'amber' : 'teal'}
            loading={loading}
          />
        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown Donut */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Bus className="w-4 h-4 text-brand-blue" />
              Fleet Status Distribution
            </h3>
            <p className="text-xs text-brand-slate">
              Proportional view of active, spare, and maintenance fleet assets.
            </p>
            <DonutBreakdown
              data={statusDonutData}
              centerValue={busAnalytics.totalBuses}
              centerLabel="Vehicles"
              emptyText="No buses registered in system"
            />
          </Card>

          {/* Bus Capacity Utilization Bar */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-teal" />
              Seat Capacity Utilization by Vehicle (%)
            </h3>
            <p className="text-xs text-brand-slate">
              Enrolled student passengers versus rated vehicle seat capacity.
            </p>
            <BarChartVisualizer
              data={utilizationBars}
              height={180}
              emptyText="No bus utilization metrics available"
            />
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by bus number or model..."
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
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>

        {/* Bus Roster Table */}
        <div className="bg-white rounded-3xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-navy">Vehicle Fleet Roster & Capacity Metrics</h3>
            <span className="text-xs font-semibold text-brand-slate">
              Showing {filteredBuses.length} vehicles
            </span>
          </div>

          {filteredBuses.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Bus}
                title="No vehicles match filter criteria"
                description="Adjust search terms or status dropdown to display buses."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-navy">
                <thead className="bg-slate-50 border-b border-border text-[10px] uppercase font-bold text-brand-slate tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Bus Number</th>
                    <th className="px-5 py-3">Plate / Details</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Capacity</th>
                    <th className="px-5 py-3">Assigned Students</th>
                    <th className="px-5 py-3">Utilization</th>
                    <th className="px-5 py-3 text-right">Trips in Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBuses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-bold text-brand-navy">
                        {b.busNumber || 'Fleet Bus'}
                      </td>
                      <td className="px-5 py-3 text-brand-slate">
                        <div>{b.registrationNumber || b.licensePlate || 'Inspected'}</div>
                        <div className="text-[10px]">{b.model || 'Standard School Bus'}</div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={
                            b.status === 'active' || b.status === 'assigned'
                              ? 'success'
                              : b.status === 'maintenance'
                              ? 'warning'
                              : b.status === 'retired'
                              ? 'error'
                              : 'info'
                          }
                          size="sm"
                        >
                          {b.status || 'Available'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 font-medium text-brand-navy">
                        {b.capacityNumber} seats
                      </td>
                      <td className="px-5 py-3 font-medium text-brand-navy">
                        {b.enrolledStudents} students
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                b.utilizationPct > 85 ? 'bg-amber-500' : 'bg-brand-teal'
                              }`}
                              style={{ width: `${b.utilizationPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px]">{b.utilizationPct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-brand-navy">
                        {b.tripsInPeriod}
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

export default BusReportsPage;
