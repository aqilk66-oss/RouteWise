import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Search,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import MetricCard from '../../../components/ui/MetricCard';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import ReportNavigationHeader from '../../../components/reports/ReportNavigationHeader';
import ReportPeriodSelector from '../../../components/reports/ReportPeriodSelector';
import DonutBreakdown from '../../../components/charts/DonutBreakdown';
import TrendLineVisualizer from '../../../components/charts/TrendLineVisualizer';
import { reportService, getPeriodDateRange } from '../../../services/reports/reportService';
import { exportToCSV } from '../../../services/reports/exportService';
import { ATTENDANCE_STATUS } from '../../../constants/collections';

export const AttendanceReportsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [baseData, setBaseData] = useState({
    attendance: [],
    students: [],
    trips: [],
  });

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await reportService.fetchAllBaseData();
      setBaseData(data);
    } catch (err) {
      console.error('Failed to load attendance reports data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dateRange = getPeriodDateRange(period, customStart, customEnd);
  const attAnalytics = reportService.computeAttendanceAnalytics(
    baseData.attendance,
    baseData.students,
    baseData.trips,
    dateRange
  );

  // Status donut data
  const statusDonutData = [
    { label: 'Dropped Off', value: attAnalytics.droppedOff, color: '#059669' },
    { label: 'Boarded', value: attAnalytics.boarded, color: '#2563eb' },
    { label: 'Absent', value: attAnalytics.absent, color: '#e11d48' },
    { label: 'Unresolved', value: attAnalytics.unresolved, color: '#d97706' },
  ];

  // Daily boarding trend
  const dailyBoardingTrend = attAnalytics.dailyTrend.map((d) => ({
    label: d.date.slice(5),
    value: d.boarded + d.droppedOff,
  }));

  // Filter attendance table
  const filteredRecords = attAnalytics.recordsList.filter((a) => {
    if (statusFilter !== 'all') {
      if ((a.status || ATTENDANCE_STATUS.NOT_RECORDED) !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sId = (a.studentId || '').toLowerCase();
      const tId = (a.tripId || '').toLowerCase();
      const stop = (a.pickupStopName || a.dropoffStopName || '').toLowerCase();
      if (!sId.includes(q) && !tId.includes(q) && !stop.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Attendance ID', 'Date', 'Student ID', 'Trip ID', 'Status', 'Boarded At', 'Dropped Off At', 'Pickup Stop', 'Drop-off Stop', 'Absence Reason', 'Marked By'];
    const rows = filteredRecords.map((a) => [
      a.id,
      a.date || a.createdAt?.split('T')[0] || '',
      a.studentId || '',
      a.tripId || '',
      a.status || 'notRecorded',
      a.boardedAt ? new Date(a.boardedAt).toLocaleTimeString() : '',
      a.droppedOffAt ? new Date(a.droppedOffAt).toLocaleTimeString() : '',
      a.pickupStopName || '',
      a.dropoffStopName || '',
      a.absenceReason || '',
      a.markedBy || '',
    ]);

    exportToCSV(headers, rows, `routewise-attendance-${dateRange.startDateStr}-to-${dateRange.endDateStr}.csv`);
  };

  return (
    <DashboardLayout title="Passenger Attendance & Boarding Rate Analytics">
      <div className="space-y-6">
        <ReportNavigationHeader
          title="Student Transport Attendance & Boarding Analytics"
          subtitle={`Verified passenger boarding fulfillment, drop-off completion, and absence logs for ${dateRange.startDateStr} to ${dateRange.endDateStr}.`}
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
            Export Attendance CSV
          </Button>
        </ReportNavigationHeader>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Boarding Fulfillment"
            value={`${attAnalytics.boardingRate}%`}
            icon={UserCheck}
            subtitle={`${attAnalytics.boarded + attAnalytics.droppedOff} boarded of ${attAnalytics.expected} expected`}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Drop-off Completion"
            value={`${attAnalytics.dropoffRate}%`}
            icon={CheckCircle2}
            subtitle={`${attAnalytics.droppedOff} safely dropped off`}
            color="emerald"
            loading={loading}
          />
          <MetricCard
            title="Reported Absences"
            value={attAnalytics.absent}
            icon={AlertCircle}
            subtitle={`${attAnalytics.absenceRate}% of expected passengers`}
            color="rose"
            loading={loading}
          />
          <MetricCard
            title="Unresolved Records"
            value={attAnalytics.unresolved}
            icon={Clock}
            subtitle={attAnalytics.unresolved > 0 ? 'Requires operations verification' : 'All records resolved'}
            color={attAnalytics.unresolved > 0 ? 'amber' : 'navy'}
            loading={loading}
          />
        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown Donut */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-blue" />
              Attendance Status Distribution
            </h3>
            <p className="text-xs text-brand-slate">
              Proportion of boarding, safe arrival, and reported absence outcomes.
            </p>
            <DonutBreakdown
              data={statusDonutData}
              centerValue={attAnalytics.totalRecords}
              centerLabel="Logged Records"
              emptyText="No attendance records in this period"
            />
          </Card>

          {/* Daily Boarding Trend Line */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-teal" />
              Daily Passenger Boarding Volume
            </h3>
            <p className="text-xs text-brand-slate">
              Timeline of verified student boarding operations across the period.
            </p>
            <TrendLineVisualizer
              data={dailyBoardingTrend}
              height={180}
              lineColor="#0d9488"
              areaColor="rgba(13, 148, 136, 0.12)"
              emptyText="No daily trend data available for this range"
            />
          </Card>
        </div>

        {/* Unresolved Alert Link Card if any exist */}
        {attAnalytics.unresolved > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-amber-950">
                {attAnalytics.unresolved} attendance records require verification or audit correction
              </p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Visit the live attendance console to audit or mark unresolved students.
              </p>
            </div>
            <Link
              to="/admin/attendance"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shrink-0 shadow-soft transition-colors"
            >
              <span>Audit Attendance</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student ID or stop..."
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
              <option value="all">All Records</option>
              <option value={ATTENDANCE_STATUS.BOARDED}>Boarded</option>
              <option value={ATTENDANCE_STATUS.DROPPED_OFF}>Dropped Off</option>
              <option value={ATTENDANCE_STATUS.ABSENT}>Absent</option>
              <option value={ATTENDANCE_STATUS.NOT_RECORDED}>Pending</option>
            </select>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white rounded-3xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-navy">Attendance Roster Log</h3>
            <span className="text-xs font-semibold text-brand-slate">
              Showing {filteredRecords.length} records
            </span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={UserCheck}
                title="No attendance records found"
                description="Adjust date period or search filters to display passenger attendance."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-navy">
                <thead className="bg-slate-50 border-b border-border text-[10px] uppercase font-bold text-brand-slate tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Student ID</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Boarded Time</th>
                    <th className="px-5 py-3">Drop-off Time</th>
                    <th className="px-5 py-3">Pickup Stop</th>
                    <th className="px-5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRecords.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-semibold text-brand-navy">
                        {a.date || a.createdAt?.split('T')[0] || 'Today'}
                      </td>
                      <td className="px-5 py-3 font-bold text-brand-navy">
                        {a.studentId || '—'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={
                            a.status === ATTENDANCE_STATUS.DROPPED_OFF
                              ? 'success'
                              : a.status === ATTENDANCE_STATUS.BOARDED
                              ? 'active'
                              : a.status === ATTENDANCE_STATUS.ABSENT
                              ? 'error'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {a.status || 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-brand-slate font-medium">
                        {a.boardedAt ? new Date(a.boardedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-3 text-brand-slate font-medium">
                        {a.droppedOffAt ? new Date(a.droppedOffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-3 text-brand-slate">
                        {a.pickupStopName || 'Scheduled Crossing'}
                      </td>
                      <td className="px-5 py-3 text-brand-slate truncate max-w-[140px]">
                        {a.absenceReason || (a.isCorrected ? '[Audit Corrected]' : 'Standard')}
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

export default AttendanceReportsPage;
