import React from 'react';
import { 
  Users, 
  MapPin, 
  Bus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Baby
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useDriverTransport } from '../../context/DriverTransportContext';
import { ATTENDANCE_STATUS } from '../../constants/collections';

export const DriverStudentsPage = () => {
  const { routeStudents, attendanceSummary, markAttendance, activeTrip, refreshData, refreshing } = useDriverTransport();

  return (
    <DashboardLayout title="Student Manifest & Passenger Attendance">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Route Passenger Manifest</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Authorized students assigned to your bus corridor for morning and afternoon runs.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Refresh Roster
          </Button>
        </div>

        {/* Attendance Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Total Passengers</span>
            <p className="text-2xl font-bold text-brand-navy">{attendanceSummary.total}</p>
          </Card>
          <Card className="p-4 text-center space-y-1 bg-blue-50/50 border-blue-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">Boarded</span>
            <p className="text-2xl font-bold text-brand-blue">{attendanceSummary.boarded}</p>
          </Card>
          <Card className="p-4 text-center space-y-1 bg-emerald-50/50 border-emerald-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Dropped Off</span>
            <p className="text-2xl font-bold text-emerald-800">{attendanceSummary.droppedOff}</p>
          </Card>
          <Card className="p-4 text-center space-y-1 bg-red-50/50 border-red-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">Marked Absent</span>
            <p className="text-2xl font-bold text-red-800">{attendanceSummary.absent}</p>
          </Card>
        </div>

        {/* Student Manifest Roster */}
        {routeStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students assigned to this route"
            description="Students enrolled in this route by administration will appear here."
          />
        ) : (
          <div className="space-y-3">
            {routeStudents.map((student) => {
              const currentStatus = attendanceSummary.latestStatusByStudent[student.id] || 'pending';
              const isBoarded = currentStatus === ATTENDANCE_STATUS.BOARDED || currentStatus === 'boarded';
              const isAbsent = currentStatus === ATTENDANCE_STATUS.ABSENT || currentStatus === 'absent';
              const isDropped = currentStatus === ATTENDANCE_STATUS.DROPPED_OFF || currentStatus === 'droppedOff';

              return (
                <div
                  key={student.id}
                  className="p-5 rounded-2xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                      {(student.firstName || 'S').charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-brand-navy">
                          {student.fullName || `${student.firstName} ${student.lastName}`}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-brand-navy">
                          {student.grade || 'Primary'}
                        </span>
                      </div>
                      <p className="text-xs text-brand-slate">
                        Pickup: <span className="font-semibold text-brand-navy">{student.pickupStop || 'Scheduled Stop'}</span> • 
                        Drop-off: <span className="font-semibold text-brand-navy">{student.dropoffStop || 'School Entrance'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Attendance Controls */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => markAttendance(student.id, ATTENDANCE_STATUS.BOARDED)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isBoarded 
                          ? 'bg-brand-blue text-white shadow-soft ring-2 ring-brand-blue/30' 
                          : 'bg-slate-100 text-brand-navy hover:bg-slate-200'
                      }`}
                    >
                      Boarded
                    </button>
                    <button
                      onClick={() => markAttendance(student.id, ATTENDANCE_STATUS.ABSENT)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isAbsent 
                          ? 'bg-red-600 text-white shadow-soft ring-2 ring-red-600/30' 
                          : 'bg-slate-100 text-brand-navy hover:bg-slate-200'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => markAttendance(student.id, ATTENDANCE_STATUS.DROPPED_OFF)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isDropped 
                          ? 'bg-emerald-600 text-white shadow-soft ring-2 ring-emerald-600/30' 
                          : 'bg-slate-100 text-brand-navy hover:bg-slate-200'
                      }`}
                    >
                      Dropped Off
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DriverStudentsPage;
