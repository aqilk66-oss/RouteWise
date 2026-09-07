import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Bus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  AlertTriangle,
  Radio,
  CheckCheck,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import AttendanceSummaryCards from '../../components/attendance/AttendanceSummaryCards';
import { useDriverTransport } from '../../context/DriverTransportContext';
import { ATTENDANCE_STATUS, TRIP_STATUS } from '../../constants/collections';

export const DriverAttendancePage = () => {
  const { 
    driverProfile,
    assignedBus,
    assignedRoute,
    routeStops,
    activeTrip,
    routeStudents,
    attendanceSummary,
    attendanceRecords,
    refreshData,
    refreshing,
    markBoarded,
    markAbsent,
    markDroppedOff,
    markBulkBoarded,
    completeTrip
  } = useDriverTransport();

  const [selectedFilter, setSelectedFilter] = useState('all'); // all | pending | boarded | droppedOff | absent
  const [activeStopFilter, setActiveStopFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [isUnresolvedModalOpen, setIsUnresolvedModalOpen] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const isTripActive = activeTrip?.status === TRIP_STATUS.IN_PROGRESS || activeTrip?.status === 'inProgress' || activeTrip?.status === TRIP_STATUS.DELAYED || activeTrip?.status === 'delayed';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Action handlers with double-click defense & error toast
  const handleMarkBoarded = async (student) => {
    if (!isTripActive) {
      alert('Trip must be active to record passenger boarding.');
      return;
    }
    setActionLoadingId(`board-${student.id}`);
    try {
      await markBoarded(student.id, {
        stopName: student.pickupStop || 'Assigned Stop',
        stopId: student.pickupStopId || null
      });
      showToast(`${student.fullName || student.firstName || 'Student'} marked boarded.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkDroppedOff = async (student) => {
    if (!isTripActive) {
      alert('Trip must be active to record passenger drop-off.');
      return;
    }
    setActionLoadingId(`drop-${student.id}`);
    try {
      await markDroppedOff(student.id, {
        stopName: student.dropoffStop || 'School Drop-off',
        stopId: student.dropoffStopId || null
      });
      showToast(`${student.fullName || student.firstName || 'Student'} marked dropped off.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAbsent = async (student) => {
    if (!isTripActive) {
      alert('Trip must be active to record absence.');
      return;
    }
    if (!window.confirm(`Mark ${student.fullName || student.firstName} absent for this run?`)) return;

    setActionLoadingId(`absent-${student.id}`);
    try {
      await markAbsent(student.id, 'Reported absent at stop');
      showToast(`${student.fullName || student.firstName || 'Student'} marked absent.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter students based on UI selections
  const filteredStudents = routeStudents.filter((student) => {
    const record = attendanceSummary.recordByStudentId?.[student.id];
    const status = record?.status || ATTENDANCE_STATUS.NOT_RECORDED;

    // Status filter
    if (selectedFilter === 'pending' && status !== ATTENDANCE_STATUS.NOT_RECORDED) return false;
    if (selectedFilter === 'boarded' && status !== ATTENDANCE_STATUS.BOARDED) return false;
    if (selectedFilter === 'droppedOff' && status !== ATTENDANCE_STATUS.DROPPED_OFF) return false;
    if (selectedFilter === 'absent' && status !== ATTENDANCE_STATUS.ABSENT) return false;

    // Stop filter
    if (activeStopFilter !== 'all') {
      if (student.pickupStop !== activeStopFilter && student.dropoffStop !== activeStopFilter) {
        return false;
      }
    }

    return true;
  });

  // Students eligible for bulk boarding at selected stop
  const eligibleForBulkBoarding = filteredStudents.filter((student) => {
    const status = attendanceSummary.recordByStudentId?.[student.id]?.status || ATTENDANCE_STATUS.NOT_RECORDED;
    return status === ATTENDANCE_STATUS.NOT_RECORDED;
  });

  const handleBulkBoarding = async () => {
    if (eligibleForBulkBoarding.length === 0) return;
    if (!window.confirm(`Mark all ${eligibleForBulkBoarding.length} eligible students as boarded?`)) return;

    setActionLoadingId('bulk-board');
    try {
      const ids = eligibleForBulkBoarding.map(s => s.id);
      await markBulkBoarded(ids, {
        stopName: activeStopFilter !== 'all' ? activeStopFilter : 'Scheduled Stop'
      });
      showToast(`Bulk boarded ${ids.length} students.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTripCompletionCheck = async () => {
    if (attendanceSummary.pending > 0) {
      setIsUnresolvedModalOpen(true);
    } else {
      setCompleteLoading(true);
      try {
        await completeTrip(activeTrip.id);
        showToast('Trip concluded successfully with 100% attendance resolved.');
      } catch (err) {
        alert(err.message);
      } finally {
        setCompleteLoading(false);
      }
    }
  };

  const handleConfirmCompletionWithUnresolved = async () => {
    setIsUnresolvedModalOpen(false);
    setCompleteLoading(true);
    try {
      await completeTrip(activeTrip.id);
      showToast('Trip concluded. Unresolved attendance notice logged.');
    } catch (err) {
      alert(err.message);
    } finally {
      setCompleteLoading(false);
    }
  };

  return (
    <DashboardLayout title="Passenger Attendance & Journey Manifest">
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-fade-in shadow-soft">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Operational Header Ribbon */}
        <div className="p-5 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-soft ${
              isTripActive ? 'bg-teal-500 text-white animate-pulse' : 'bg-brand-navy text-white'
            }`}>
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-brand-navy">
                  {assignedRoute?.name || activeTrip?.routeName || 'Campus Transit Run'}
                </h2>
                <Badge variant={isTripActive ? 'active' : 'neutral'} size="sm">
                  {isTripActive ? 'Live Run Active' : 'Trip Standby'}
                </Badge>
              </div>
              <p className="text-xs text-brand-slate">
                Bus: <span className="font-bold text-brand-navy">{assignedBus?.busNumber || 'Fleet Vehicle'}</span> • 
                Operator: <span className="font-semibold text-brand-blue">{driverProfile?.fullName || 'Certified Driver'}</span> • 
                Active Stop: <span className="font-semibold text-brand-navy">{activeTrip?.currentStopName || 'Depot'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={refreshData}
              loading={refreshing}
            >
              Sync
            </Button>

            {isTripActive && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={handleTripCompletionCheck}
                loading={completeLoading}
                className="bg-brand-navy hover:bg-slate-800 text-white font-bold"
              >
                Conclude Trip
              </Button>
            )}
          </div>
        </div>

        {/* Real-time Summary Cards */}
        <AttendanceSummaryCards
          expected={attendanceSummary.expected}
          boarded={attendanceSummary.boarded}
          droppedOff={attendanceSummary.droppedOff}
          absent={attendanceSummary.absent}
          pending={attendanceSummary.pending}
        />

        {/* Operational Filter & Action Bar */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All (${attendanceSummary.expected})` },
              { id: 'pending', label: `Pending (${attendanceSummary.pending})` },
              { id: 'boarded', label: `Boarded (${attendanceSummary.boarded})` },
              { id: 'droppedOff', label: `Dropped (${attendanceSummary.droppedOff})` },
              { id: 'absent', label: `Absent (${attendanceSummary.absent})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedFilter === tab.id
                    ? 'bg-brand-navy text-white shadow-soft'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stop selector & Bulk Action */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={activeStopFilter}
              onChange={(e) => setActiveStopFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-white text-brand-navy font-medium outline-none focus:ring-2 focus:ring-brand-blue/30 text-xs"
            >
              <option value="all">All Route Stops</option>
              {routeStops.map((stop) => (
                <option key={stop.id} value={stop.name}>
                  {stop.name}
                </option>
              ))}
            </select>

            {eligibleForBulkBoarding.length > 0 && isTripActive && (
              <Button
                variant="outline"
                size="sm"
                icon={UserCheck}
                onClick={handleBulkBoarding}
                loading={actionLoadingId === 'bulk-board'}
                className="bg-blue-50 border-blue-200 text-brand-blue hover:bg-blue-100 font-bold"
              >
                Board {eligibleForBulkBoarding.length}
              </Button>
            )}
          </div>
        </div>

        {/* Student Attendance Cards List */}
        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students match selected criteria"
            description="Adjust your status filter or stop selection to view route passengers."
          />
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const record = attendanceSummary.recordByStudentId?.[student.id];
              const status = record?.status || ATTENDANCE_STATUS.NOT_RECORDED;

              const isBoarded = status === ATTENDANCE_STATUS.BOARDED;
              const isDroppedOff = status === ATTENDANCE_STATUS.DROPPED_OFF;
              const isAbsent = status === ATTENDANCE_STATUS.ABSENT;
              const isPending = status === ATTENDANCE_STATUS.NOT_RECORDED;

              const isLoadingThis = actionLoadingId?.includes(student.id);

              return (
                <div
                  key={student.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-soft transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isDroppedOff
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isBoarded
                      ? 'border-blue-200 bg-blue-50/20'
                      : isAbsent
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-border'
                  }`}
                >
                  {/* Student Details */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                      isDroppedOff
                        ? 'bg-emerald-100 text-emerald-800'
                        : isBoarded
                        ? 'bg-blue-100 text-blue-800'
                        : isAbsent
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-brand-navy'
                    }`}>
                      {(student.firstName || 'S').charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-brand-navy">
                          {student.fullName || `${student.firstName} ${student.lastName}`}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-brand-slate">
                          {student.grade || 'Student'}
                        </span>
                        {/* Status Badge */}
                        <Badge
                          variant={
                            isDroppedOff
                              ? 'success'
                              : isBoarded
                              ? 'active'
                              : isAbsent
                              ? 'error'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {isDroppedOff
                            ? 'Dropped Off'
                            : isBoarded
                            ? 'Boarded'
                            : isAbsent
                            ? 'Absent'
                            : 'Pending'}
                        </Badge>
                      </div>

                      <p className="text-xs text-brand-slate">
                        Pickup: <span className="font-semibold text-brand-navy">{student.pickupStop || 'Scheduled Stop'}</span> • 
                        Drop-off: <span className="font-semibold text-brand-navy">{student.dropoffStop || 'School Terminal'}</span>
                      </p>

                      {/* Timestamps */}
                      {(record?.boardedAt || record?.droppedOffAt || record?.absenceReason) && (
                        <p className="text-[11px] text-brand-blue font-medium mt-1">
                          {record.boardedAt && (
                            <span>Boarded: {new Date(record.boardedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                          {record.droppedOffAt && (
                            <span className="ml-2">Dropped: {new Date(record.droppedOffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                          {record.absenceReason && (
                            <span className="text-rose-700">Reason: {record.absenceReason}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Primary Touch Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* Mark Boarded Action */}
                    {isPending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkBoarded(student)}
                          loading={isLoadingThis && actionLoadingId === `board-${student.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold border-blue-600 shadow-soft"
                        >
                          Mark Boarded
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAbsent(student)}
                          loading={isLoadingThis && actionLoadingId === `absent-${student.id}`}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                        >
                          Absent
                        </Button>
                      </>
                    )}

                    {/* Mark Dropped Off Action */}
                    {isBoarded && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleMarkDroppedOff(student)}
                        loading={isLoadingThis && actionLoadingId === `drop-${student.id}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-soft"
                      >
                        Mark Dropped Off
                      </Button>
                    )}

                    {/* Terminal States */}
                    {isDroppedOff && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <CheckCheck className="w-4 h-4" />
                        <span>Completed</span>
                      </span>
                    )}

                    {isAbsent && (
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200">
                        <XCircle className="w-4 h-4" />
                        <span>Absent</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Unresolved Attendance Warning Modal */}
        <Modal
          isOpen={isUnresolvedModalOpen}
          onClose={() => setIsUnresolvedModalOpen(false)}
          title="Unresolved Attendance Notice"
          subtitle="Review before concluding transport run"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">
                  {attendanceSummary.pending} student(s) remain unrecorded.
                </p>
                <p className="text-[11px] mt-1 leading-relaxed">
                  Ending this trip with unrecorded students will log an operations warning and notify central administration. If the students were absent, please mark them as Absent before concluding.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUnresolvedModalOpen(false)}
              >
                Return to Manifest
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCompletionWithUnresolved}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                Conclude Trip with Unresolved
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default DriverAttendancePage;
