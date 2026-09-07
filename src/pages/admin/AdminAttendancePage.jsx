import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  Edit3, 
  Bus, 
  Route, 
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import AttendanceSummaryCards from '../../components/attendance/AttendanceSummaryCards';
import AttendanceCorrectionModal from '../../components/attendance/AttendanceCorrectionModal';
import { attendanceService } from '../../services/firestore/attendanceService';
import { studentService } from '../../services/firestore/studentService';
import { routeService } from '../../services/firestore/routeService';
import { busService } from '../../services/firestore/busService';
import { tripService } from '../../services/firestore/tripService';
import { useAuth } from '../../context/AuthContext';
import { ATTENDANCE_STATUS } from '../../constants/collections';

export const AdminAttendancePage = () => {
  const { user, profile, role } = useAuth();

  const [attendanceList, setAttendanceList] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [routesMap, setRoutesMap] = useState({});
  const [busesMap, setBusesMap] = useState({});
  const [tripsMap, setTripsMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRouteId, setSelectedRouteId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState(null);
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load attendance data and related entities
  const loadAttendanceData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Fetch attendance records, students, routes, buses, and trips in parallel
      const [records, students, routes, buses, trips] = await Promise.all([
        attendanceService.getAll({ max: 200 }),
        studentService.getAll({ max: 200 }),
        routeService.getAll({ max: 100 }),
        busService.getAll({ max: 100 }),
        tripService.getAll({ max: 100 }),
      ]);

      const sMap = {};
      students.forEach(s => { sMap[s.id] = s; });
      setStudentsMap(sMap);

      const rMap = {};
      routes.forEach(r => { rMap[r.id] = r; });
      setRoutesMap(rMap);

      const bMap = {};
      buses.forEach(b => { bMap[b.id] = b; });
      setBusesMap(bMap);

      const tMap = {};
      trips.forEach(t => { tMap[t.id] = t; });
      setTripsMap(tMap);

      setAttendanceList(records);
    } catch (err) {
      console.error('Error loading admin attendance:', err);
      setError('Unable to load fleet attendance logs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, []);

  // Filtered attendance records based on Date, Route, Status, Search
  const filteredRecords = useMemo(() => {
    return attendanceList.filter((rec) => {
      // Date filter
      if (selectedDate && rec.date !== selectedDate) {
        // Fallback: If date field is missing, compare with createdAt date
        const recDate = rec.date || (rec.createdAt ? rec.createdAt.split('T')[0] : null);
        if (recDate !== selectedDate) return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && rec.status !== selectedStatus) {
        return false;
      }

      // Route filter
      if (selectedRouteId !== 'all' && rec.routeId !== selectedRouteId) {
        return false;
      }

      // Search Query (Student Name or Student ID or Trip ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const student = studentsMap[rec.studentId];
        const studentName = (student?.fullName || `${student?.firstName || ''} ${student?.lastName || ''}`).toLowerCase();
        const studentId = (rec.studentId || '').toLowerCase();
        const tripId = (rec.tripId || '').toLowerCase();

        if (!studentName.includes(query) && !studentId.includes(query) && !tripId.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [attendanceList, selectedDate, selectedStatus, selectedRouteId, searchQuery, studentsMap]);

  // Overall summary for current selection
  const summaryMetrics = useMemo(() => {
    let boarded = 0;
    let droppedOff = 0;
    let absent = 0;
    let pending = 0;

    filteredRecords.forEach((rec) => {
      if (rec.status === ATTENDANCE_STATUS.BOARDED) boarded++;
      else if (rec.status === ATTENDANCE_STATUS.DROPPED_OFF) droppedOff++;
      else if (rec.status === ATTENDANCE_STATUS.ABSENT) absent++;
      else pending++;
    });

    return {
      total: filteredRecords.length,
      boarded,
      droppedOff,
      absent,
      pending
    };
  }, [filteredRecords]);

  // Handle Audit Correction Submission
  const handleConfirmCorrection = async ({ attendanceId, newStatus, reason }) => {
    setCorrectionLoading(true);
    try {
      await attendanceService.correctAttendance({
        attendanceId,
        newStatus,
        reason,
        correctedBy: profile?.fullName || user.displayName || user.email || 'Admin User',
        correctedByRole: role,
      });

      showToast('Attendance record corrected and audit trail logged.');
      await loadAttendanceData(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setCorrectionLoading(false);
    }
  };

  // CSV Export for Authorized Admin/Transport Manager
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No attendance records to export for this selection.');
      return;
    }

    const headers = [
      'Date',
      'Student ID',
      'Student Name',
      'Route',
      'Bus',
      'Status',
      'Boarded At',
      'Dropped Off At',
      'Pickup Stop',
      'Drop-off Stop',
      'Absence Reason',
      'Marked By',
      'Audit Corrected',
    ];

    const rows = filteredRecords.map((r) => {
      const student = studentsMap[r.studentId];
      const studentName = student?.fullName || `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || r.studentId;
      const route = routesMap[r.routeId]?.name || r.routeId || '';
      const bus = busesMap[r.busId]?.busNumber || r.busId || '';

      return [
        r.date || '',
        r.studentId || '',
        `"${studentName.replace(/"/g, '""')}"`,
        `"${route.replace(/"/g, '""')}"`,
        `"${bus.replace(/"/g, '""')}"`,
        r.status || 'notRecorded',
        r.boardedAt ? new Date(r.boardedAt).toLocaleTimeString() : '',
        r.droppedOffAt ? new Date(r.droppedOffAt).toLocaleTimeString() : '',
        `"${(r.pickupStopName || '').replace(/"/g, '""')}"`,
        `"${(r.dropoffStopName || '').replace(/"/g, '""')}"`,
        `"${(r.absenceReason || '').replace(/"/g, '""')}"`,
        `"${(r.markedBy || '').replace(/"/g, '""')}"`,
        r.isCorrected ? 'YES' : 'NO',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RouteWise-Attendance-${selectedDate || 'Export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Fleet Transport Attendance & Journey Audit">
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-fade-in shadow-soft">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Operational Header Ribbon */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-brand-navy">
                Transportation Attendance & Passenger Audit
              </h2>
              <Badge variant="primary" size="sm">
                Operations Command
              </Badge>
            </div>
            <p className="text-xs text-brand-slate">
              Real-time boarding tracking, drop-off verification, and auditable record corrections across all routes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => loadAttendanceData(true)}
              loading={refreshing}
            >
              Sync
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
              className="bg-brand-navy hover:bg-slate-800 text-white font-bold"
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Real-time Summary Cards */}
        <AttendanceSummaryCards
          expected={summaryMetrics.total}
          boarded={summaryMetrics.boarded}
          droppedOff={summaryMetrics.droppedOff}
          absent={summaryMetrics.absent}
          pending={summaryMetrics.pending}
          loading={loading}
        />

        {/* Advanced Filters & Search Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-border shadow-soft space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-brand-navy outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-slate shrink-0">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-brand-navy outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            {/* Route Filter */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-slate shrink-0">Route:</span>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-brand-navy bg-white outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                <option value="all">All Fleet Routes</option>
                {Object.values(routesMap).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-slate shrink-0">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-brand-navy bg-white outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                <option value="all">All Statuses</option>
                <option value={ATTENDANCE_STATUS.BOARDED}>Boarded</option>
                <option value={ATTENDANCE_STATUS.DROPPED_OFF}>Dropped Off</option>
                <option value={ATTENDANCE_STATUS.ABSENT}>Absent</option>
                <option value={ATTENDANCE_STATUS.NOT_RECORDED}>Pending / Unrecorded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Master Attendance Data Table */}
        <div className="bg-white rounded-3xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-navy">Attendance Roster & Audit Logs</h3>
            <span className="text-xs font-semibold text-brand-slate">
              Showing {filteredRecords.length} records
            </span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="No attendance records found"
                description="Try broadening your date, route, or status filters."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-navy">
                <thead className="bg-slate-50 border-b border-border text-[10px] uppercase font-bold text-brand-slate tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Route & Bus</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Boarding Time</th>
                    <th className="px-5 py-3">Drop-off Time</th>
                    <th className="px-5 py-3">Stops</th>
                    <th className="px-5 py-3">Audit Details</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRecords.map((rec) => {
                    const student = studentsMap[rec.studentId];
                    const studentName = student?.fullName || `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || rec.studentId;
                    const route = routesMap[rec.routeId];
                    const bus = busesMap[rec.busId];

                    const isBoarded = rec.status === ATTENDANCE_STATUS.BOARDED;
                    const isDropped = rec.status === ATTENDANCE_STATUS.DROPPED_OFF;
                    const isAbsent = rec.status === ATTENDANCE_STATUS.ABSENT;

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Student Name */}
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-brand-navy">{studentName}</div>
                          <div className="text-[10px] text-brand-slate">ID: {rec.studentId}</div>
                        </td>

                        {/* Route & Bus */}
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-brand-navy truncate max-w-[140px]">
                            {route?.name || rec.routeId || 'Transit Run'}
                          </div>
                          <div className="text-[10px] text-brand-slate">
                            Bus: {bus?.busNumber || rec.busId || 'Fleet Unit'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={
                              isDropped
                                ? 'success'
                                : isBoarded
                                ? 'active'
                                : isAbsent
                                ? 'error'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {isDropped
                              ? 'Dropped Off'
                              : isBoarded
                              ? 'Boarded'
                              : isAbsent
                              ? 'Absent'
                              : 'Pending'}
                          </Badge>
                          {rec.isCorrected && (
                            <span className="block text-[9px] font-bold text-purple-700 uppercase tracking-wider mt-0.5">
                              [Corrected]
                            </span>
                          )}
                        </td>

                        {/* Boarding Time */}
                        <td className="px-5 py-3.5 font-medium">
                          {rec.boardedAt ? (
                            new Date(rec.boardedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Drop-off Time */}
                        <td className="px-5 py-3.5 font-medium">
                          {rec.droppedOffAt ? (
                            new Date(rec.droppedOffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Stops */}
                        <td className="px-5 py-3.5 text-[11px] text-brand-slate">
                          <div>Pick: {rec.pickupStopName || student?.pickupStop || 'Scheduled'}</div>
                          <div>Drop: {rec.dropoffStopName || student?.dropoffStop || 'School Entrance'}</div>
                        </td>

                        {/* Audit Details */}
                        <td className="px-5 py-3.5 text-[11px] text-brand-slate">
                          <div>Marked by: {rec.markedBy || 'Driver'}</div>
                          {rec.lastCorrection && (
                            <div className="text-purple-700 font-medium truncate max-w-[160px]" title={rec.lastCorrection.reason}>
                              Audit: {rec.lastCorrection.reason}
                            </div>
                          )}
                        </td>

                        {/* Action: Correct Attendance */}
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Edit3}
                            onClick={() => setCorrectionTarget({ record: rec, studentName })}
                            className="text-xs font-semibold"
                          >
                            Correct
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attendance Correction Modal */}
        <AttendanceCorrectionModal
          isOpen={Boolean(correctionTarget)}
          onClose={() => setCorrectionTarget(null)}
          record={correctionTarget?.record}
          studentName={correctionTarget?.studentName}
          onConfirmCorrection={handleConfirmCorrection}
          loading={correctionLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminAttendancePage;
