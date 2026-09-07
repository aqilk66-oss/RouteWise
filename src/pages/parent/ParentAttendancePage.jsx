import React from 'react';
import { 
  Baby, 
  Calendar, 
  Clock, 
  MapPin, 
  Bus, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import JourneyTimeline from '../../components/attendance/JourneyTimeline';
import { useParentTransport } from '../../context/ParentTransportContext';
import { ATTENDANCE_STATUS } from '../../constants/collections';

export const ParentAttendancePage = () => {
  const { 
    childrenList,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    childRoute,
    childBus,
    todayTrip,
    childAttendanceHistory,
    todayAttendanceRecord,
    loading,
    refreshing,
    refreshData
  } = useParentTransport();

  const childName = selectedChild?.fullName || selectedChild?.firstName || 'Child';

  return (
    <DashboardLayout title="Child Transport Attendance & Journey Status">
      <div className="space-y-6">
        {/* Header Ribbon & Child Switcher */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-brand-navy">
                {childName}'s Transport Journey
              </h2>
              <Badge variant="info" size="sm">
                Guardian Pass
              </Badge>
            </div>
            <p className="text-xs text-brand-slate">
              Authoritative boarding and drop-off verification recorded directly by certified drivers.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Multi-child Switcher */}
            {childrenList.length > 1 && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
                {childrenList.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedChildId === child.id
                        ? 'bg-white text-brand-navy shadow-soft'
                        : 'text-slate-600 hover:text-brand-navy'
                    }`}
                  >
                    {child.firstName || child.fullName}
                  </button>
                ))}
              </div>
            )}

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
        </div>

        {/* Child Transport Overview Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Assigned Route</span>
            <p className="text-base font-bold text-brand-navy truncate">
              {childRoute?.name || 'Assigned Transit Run'}
            </p>
            <p className="text-[11px] text-brand-slate">Code: {childRoute?.routeCode || 'RTE-1'}</p>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Designated Bus</span>
            <p className="text-base font-bold text-brand-navy">
              {childBus?.busNumber || 'Fleet Vehicle'}
            </p>
            <p className="text-[11px] text-brand-slate">License: {childBus?.registrationNumber || 'Verified'}</p>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Designated Stops</span>
            <p className="text-xs font-semibold text-brand-navy truncate">
              Pickup: {selectedChild?.pickupStop || 'Scheduled Stop'}
            </p>
            <p className="text-xs font-semibold text-brand-slate truncate">
              Drop: {selectedChild?.dropoffStop || 'School Gate'}
            </p>
          </Card>
        </div>

        {/* Live Journey Timeline for Today */}
        <JourneyTimeline
          attendanceRecord={todayAttendanceRecord}
          trip={todayTrip}
          pickupStop={selectedChild?.pickupStop || 'Morning Stop'}
          dropoffStop={selectedChild?.dropoffStop || 'School Terminal'}
        />

        {/* Historical Attendance Records */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Past Transport Attendance Log</h3>
              <p className="text-xs text-brand-slate mt-0.5">
                Verified arrival and departure records for {childName}.
              </p>
            </div>
            <span className="text-xs text-brand-slate font-semibold">
              {childAttendanceHistory.length} Recorded Trips
            </span>
          </div>

          {childAttendanceHistory.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No historical attendance records yet"
              description="Confirmed boarding and drop-off logs will accumulate here as your child rides the bus."
            />
          ) : (
            <div className="divide-y divide-border">
              {childAttendanceHistory.map((rec) => {
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
                          {rec.pickupStopName ? `Pickup: ${rec.pickupStopName}` : 'Standard Pickup'} • {rec.dropoffStopName ? `Drop: ${rec.dropoffStopName}` : 'Campus Drop'}
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
                        {isDropped ? 'Dropped Off' : isBoarded ? 'Boarded' : isAbsent ? 'Absent' : 'Pending'}
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

export default ParentAttendancePage;
