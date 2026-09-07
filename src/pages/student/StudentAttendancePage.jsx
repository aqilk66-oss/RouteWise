import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Bus, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  UserCheck,
  Shield
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import JourneyTimeline from '../../components/attendance/JourneyTimeline';
import { useStudentTransport } from '../../context/StudentTransportContext';
import { ATTENDANCE_STATUS } from '../../constants/collections';

export const StudentAttendancePage = () => {
  const { 
    studentRecord,
    assignedBus,
    assignedRoute,
    todayTrip,
    attendanceHistory,
    todayAttendance,
    loading,
    refreshing,
    refreshData
  } = useStudentTransport();

  const studentName = studentRecord?.fullName || studentRecord?.firstName || 'Student';

  return (
    <DashboardLayout title="My Transit Attendance & Journey Pass">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-brand-navy">
                My Transportation Attendance
              </h2>
              <Badge variant="info" size="sm">
                Student Pass
              </Badge>
            </div>
            <p className="text-xs text-brand-slate">
              Real-time boarding confirmation and your personal school transit history.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Refresh
          </Button>
        </div>

        {/* Transit Pass Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Assigned Route</span>
            <p className="text-base font-bold text-brand-navy truncate">
              {assignedRoute?.name || 'Assigned Transit Corridor'}
            </p>
            <p className="text-[11px] text-brand-slate">Line Code: {assignedRoute?.routeCode || 'CORR-01'}</p>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Bus Number</span>
            <p className="text-base font-bold text-brand-navy">
              {assignedBus?.busNumber || 'Designated Vehicle'}
            </p>
            <p className="text-[11px] text-brand-slate">Vehicle Plate: {assignedBus?.registrationNumber || 'Authorized'}</p>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Assigned Stops</span>
            <p className="text-xs font-semibold text-brand-navy truncate">
              Pickup: {studentRecord?.pickupStop || 'Scheduled Stop'}
            </p>
            <p className="text-xs font-semibold text-brand-slate truncate">
              Drop: {studentRecord?.dropoffStop || 'School Entrance'}
            </p>
          </Card>
        </div>

        {/* Live Journey Timeline for Today */}
        <JourneyTimeline
          attendanceRecord={todayAttendance}
          trip={todayTrip}
          pickupStop={studentRecord?.pickupStop || 'Morning Stop'}
          dropoffStop={studentRecord?.dropoffStop || 'Campus Terminal'}
        />

        {/* Attendance History */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">My Recent Rides</h3>
              <p className="text-xs text-brand-slate mt-0.5">
                Past recorded boarding and drop-off milestones.
              </p>
            </div>
            <span className="text-xs text-brand-slate font-semibold">
              {attendanceHistory.length} Trips
            </span>
          </div>

          {attendanceHistory.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No past transit rides recorded"
              description="Your attendance logs will appear here each day you board the school bus."
            />
          ) : (
            <div className="divide-y divide-border">
              {attendanceHistory.map((rec) => {
                const isBoarded = rec.status === ATTENDANCE_STATUS.BOARDED;
                const isDropped = rec.status === ATTENDANCE_STATUS.DROPPED_OFF;
                const isAbsent = rec.status === ATTENDANCE_STATUS.ABSENT;

                return (
                  <div key={rec.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isDropped 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isBoarded 
                          ? 'bg-blue-100 text-blue-800' 
                          : isAbsent 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-brand-navy">
                          {rec.date ? new Date(rec.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Transit Trip'}
                        </p>
                        <p className="text-[11px] text-brand-slate">
                          {rec.pickupStopName ? `Boarded: ${rec.pickupStopName}` : 'Pickup Stop'} • {rec.dropoffStopName ? `Drop: ${rec.dropoffStopName}` : 'School Gate'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant={
                          isDropped ? 'success' : isBoarded ? 'active' : isAbsent ? 'error' : 'neutral'
                        }
                        size="sm"
                      >
                        {isDropped ? 'Completed' : isBoarded ? 'Boarded' : isAbsent ? 'Absent' : 'Pending'}
                      </Badge>
                      <p className="text-[10px] text-brand-slate mt-1 font-medium">
                        {rec.droppedOffAt 
                          ? new Date(rec.droppedOffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : rec.boardedAt 
                          ? new Date(rec.boardedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : 'Recorded'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendancePage;
