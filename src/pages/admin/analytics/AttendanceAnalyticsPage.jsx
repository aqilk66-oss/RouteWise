import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  Route,
  ArrowUpRight
} from 'lucide-react';
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
import { calculateAttendanceRate } from '../../../services/analytics/kpiDefinitions';

export const AttendanceAnalyticsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
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

      setAttendanceRecords(dataset.attendance);
      setRoutes(dataset.routes);
    } catch (err) {
      console.error('Failed to load attendance analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const totalRecords = attendanceRecords.length;
  const boardedCount = attendanceRecords.filter((a) => a.status === 'boarded').length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'absent').length;
  const droppedOffCount = attendanceRecords.filter((a) => a.status === 'droppedOff').length;
  const otherCount = totalRecords - (boardedCount + absentCount + droppedOffCount);

  const verifiedRate = calculateAttendanceRate(boardedCount + droppedOffCount, absentCount, totalRecords);

  const handleExportCSV = () => {
    setExporting(true);
    try {
      const rows = attendanceRecords.map((a) => ({
        RecordId: a.id,
        StudentName: a.studentName || 'Student',
        TripId: a.tripId || 'N/A',
        RouteName: a.routeName || 'N/A',
        Status: a.status,
        Date: a.date || a.timestamp?.split('T')[0] || 'N/A',
        Period: period,
      }));
      exportToCSV(rows, `routewise-attendance-analytics-${period}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const attendanceBreakdown = [
    { label: 'Boarded', value: boardedCount, color: '#2563eb' },
    { label: 'Dropped Off', value: droppedOffCount, color: '#10b981' },
    { label: 'Documented Absence', value: absentCount, color: '#f59e0b' },
    { label: 'Pending / Other', value: otherCount > 0 ? otherCount : 0, color: '#94a3b8' },
  ];

  const columns = [
    {
      header: 'Passenger Name',
      key: 'studentName',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-brand-navy">{row.studentName || 'Student'}</span>
      ),
    },
    {
      header: 'Assigned Corridor',
      key: 'routeName',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-brand-slate">{row.routeName || 'Campus Transit'}</span>
      ),
    },
    {
      header: 'Attendance Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        let variant = 'neutral';
        if (row.status === 'boarded') variant = 'active';
        if (row.status === 'droppedOff') variant = 'neutral';
        if (row.status === 'absent') variant = 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Date & Recorded Time',
      key: 'date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-brand-slate">
          {row.date || (row.timestamp ? new Date(row.timestamp).toLocaleDateString() : 'N/A')}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout title="Passenger Attendance & Boarding Analytics">
      <AnalyticsNavHeader
        title="Passenger Attendance Analytics"
        subtitle="Verification of student passenger boarding, drop-off confirmations, and documented absences."
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
            title="Total Riders Tracked"
            value={totalRecords}
            sublabel="Passenger attendance events"
            icon={Users}
          />
          <MetricCard
            title="Boarding Confirmations"
            value={boardedCount}
            sublabel={`${boardedCount} verified entries`}
            icon={CheckCircle2}
            status="positive"
          />
          <MetricCard
            title="Documented Absences"
            value={absentCount}
            sublabel="Reported leaves / missed runs"
            icon={XCircle}
            status={absentCount > 0 ? 'warning' : 'positive'}
          />
          <MetricCard
            title="Attendance Audit Rate"
            value={verifiedRate !== null ? `${verifiedRate}%` : '—'}
            sublabel="Completeness ratio"
            icon={ClipboardCheck}
            status={verifiedRate >= 90 ? 'positive' : 'warning'}
          />
        </div>

        {/* Breakdown and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-brand-navy mb-1">Status Proportions</h3>
            <p className="text-xs text-brand-slate mb-4">Boarding and absence breakdown across all trips.</p>
            <DonutBreakdown
              data={attendanceBreakdown}
              centerLabel="Records"
              centerValue={totalRecords}
            />
          </Card>

          <Card className="p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-brand-navy mb-1">Recent Attendance Verifications</h3>
            <p className="text-xs text-brand-slate mb-4">Showing {attendanceRecords.length} recorded events.</p>
            <DataTable
              columns={columns}
              data={attendanceRecords}
              loading={loading}
              emptyText="No attendance records recorded during this period."
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceAnalyticsPage;
