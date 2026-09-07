import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Bus, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  ShieldAlert, 
  RefreshCw,
  Radio
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useDriverTransport } from '../../context/DriverTransportContext';
import { TRIP_STATUS, ATTENDANCE_STATUS } from '../../constants/collections';

export const DriverTripDetailPage = () => {
  const { tripId } = useParams();
  const { 
    driverTrips, 
    assignedBus, 
    assignedRoute, 
    routeStops, 
    routeStudents, 
    attendanceSummary, 
    markAttendance, 
    startTrip, 
    completeTrip, 
    reportDelay, 
    updateStopProgression,
    refreshData,
    refreshing 
  } = useDriverTransport();

  const trip = driverTrips.find((t) => t.id === tripId) || driverTrips[0];

  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayReason, setDelayReason] = useState('Traffic Congestion');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const isLive = trip?.status === TRIP_STATUS.IN_PROGRESS || trip?.status === 'inProgress';
  const isScheduled = trip?.status === TRIP_STATUS.SCHEDULED || trip?.status === 'scheduled';
  const isDelayed = trip?.status === TRIP_STATUS.DELAYED || trip?.status === 'delayed';
  const isCompleted = trip?.status === TRIP_STATUS.COMPLETED || trip?.status === 'completed';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStart = async () => {
    if (!trip) return;
    setActionLoading(true);
    try {
      await startTrip(trip.id);
      showToast('Trip started. GPS beacon active.');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!trip) return;
    setActionLoading(true);
    try {
      await completeTrip(trip.id);
      showToast('Trip marked as complete.');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelay = async (e) => {
    e.preventDefault();
    if (!trip) return;
    setActionLoading(true);
    try {
      await reportDelay(trip.id, delayReason);
      setIsDelayModalOpen(false);
      showToast('Delay advisory broadcast.');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvanceStop = async (index) => {
    if (!trip || !routeStops[index]) return;
    setActiveStopIndex(index);
    const stop = routeStops[index];
    await updateStopProgression(trip.id, stop.id, stop.name);
    showToast(`Arrived at Stop ${index + 1}: ${stop.name}`);
  };

  return (
    <DashboardLayout title={`Trip Operations Manifest: ${trip?.routeName || 'Transit Run'}`}>
      <div className="space-y-6">
        {/* Back Link & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/driver/trips"
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trips Roster</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Sync State
          </Button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Big Operational Controller Banner */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-xl font-bold text-brand-navy">
                {trip?.routeName || 'Campus Corridor'}
              </h2>
              <Badge variant={isLive ? 'active' : isDelayed ? 'warning' : isCompleted ? 'neutral' : 'info'} size="md">
                {isLive ? 'En Route' : isDelayed ? 'Delayed' : isCompleted ? 'Completed' : 'Scheduled'}
              </Badge>
            </div>
            <p className="text-xs text-brand-slate">
              Trip ID: <span className="font-semibold text-brand-navy">{trip?.id}</span> • 
              Bus: <span className="font-semibold text-brand-blue">{trip?.busNumber || assignedBus?.busNumber || 'Assigned'}</span> • 
              Start Window: <span className="font-semibold text-brand-navy">{trip?.scheduledStartTime || '07:15 AM'}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {isScheduled && (
              <Button
                variant="primary"
                size="md"
                icon={Play}
                onClick={handleStart}
                loading={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-soft"
              >
                Start Run
              </Button>
            )}

            {isLive && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  icon={AlertTriangle}
                  onClick={() => setIsDelayModalOpen(true)}
                  className="border-amber-300 text-amber-800 hover:bg-amber-50"
                >
                  Report Delay
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={CheckCircle2}
                  onClick={handleComplete}
                  loading={actionLoading}
                  className="bg-brand-navy hover:bg-slate-800 text-white font-bold px-6 shadow-soft"
                >
                  Complete Run
                </Button>
              </>
            )}

            {isDelayed && (
              <Button
                variant="primary"
                size="md"
                icon={CheckCircle2}
                onClick={handleComplete}
                loading={actionLoading}
                className="bg-brand-navy hover:bg-slate-800 text-white font-bold px-6 shadow-soft"
              >
                Complete Run
              </Button>
            )}
          </div>
        </div>

        {/* Real-time GPS Tracking Link Banner */}
        <Card className="p-6 bg-slate-900 text-white border-slate-700">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-teal animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Driver GPS Tracking Telemetry
              </span>
            </div>
            <span className="text-[11px] text-brand-teal font-mono font-semibold">
              Live Console Ready
            </span>
          </div>

          <div className="py-4 text-center">
            <Compass className="w-9 h-9 text-brand-teal mx-auto mb-2 opacity-90" />
            <p className="text-sm font-bold text-white">Live Tracking & GPS Beacon Active</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Broadcast high-accuracy GPS positions and milestone progress directly to student passes and guardians.
            </p>
            <Link to="/driver/tracking">
              <Button variant="primary" size="sm" icon={Radio} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                Launch Live Tracking Console
              </Button>
            </Link>
          </div>
        </Card>

        {/* Route Progression & Stops Sequence */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-blue" />
              Station Waypoints & Driver Stop Progression
            </h3>
            <span className="text-xs font-semibold text-brand-navy">
              Stop {activeStopIndex + 1} of {routeStops.length || 1}
            </span>
          </div>

          <div className="space-y-3">
            {routeStops.map((stop, index) => {
              const isCurrent = index === activeStopIndex;
              const isPassed = index < activeStopIndex;

              return (
                <div
                  key={stop.id || index}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-blue-50/60 border-brand-blue/40 shadow-soft'
                      : isPassed
                      ? 'bg-slate-50/70 border-border opacity-70'
                      : 'bg-white border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCurrent
                        ? 'bg-brand-blue text-white ring-4 ring-brand-blue/20'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-brand-slate'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : stop.sequence || index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy text-xs">{stop.name}</p>
                      <p className="text-[11px] text-brand-slate">{stop.address || 'Corridor waypoint'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs text-brand-slate">
                      {stop.pickupTime || stop.dropoffTime || 'Scheduled'}
                    </span>
                    {isLive && !isPassed && (
                      <Button
                        variant={isCurrent ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleAdvanceStop(index)}
                      >
                        {isCurrent ? 'Arrived at Stop' : 'Check-In'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Student Attendance Manifest */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-teal" />
                Passenger Manifest & Student Attendance
              </h3>
              <p className="text-xs text-brand-slate mt-0.5">
                Mark boarding and drop-off statuses for student passes.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-brand-navy">
                {attendanceSummary.boarded} / {attendanceSummary.total} Boarded
              </span>
            </div>
          </div>

          <div className="divide-y divide-border text-xs">
            {routeStudents.map((student) => {
              const currentStatus = attendanceSummary.latestStatusByStudent[student.id] || 'pending';
              const isBoarded = currentStatus === ATTENDANCE_STATUS.BOARDED || currentStatus === 'boarded';
              const isAbsent = currentStatus === ATTENDANCE_STATUS.ABSENT || currentStatus === 'absent';
              const isDropped = currentStatus === ATTENDANCE_STATUS.DROPPED_OFF || currentStatus === 'droppedOff';

              return (
                <div key={student.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-brand-navy">
                      {student.fullName || `${student.firstName} ${student.lastName}`}
                    </p>
                    <p className="text-[11px] text-brand-slate">
                      Pickup: {student.pickupStop || 'Neighborhood Stop'} • Grade: {student.grade || 'Primary'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => markAttendance(student.id, ATTENDANCE_STATUS.BOARDED)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        isBoarded 
                          ? 'bg-brand-blue text-white shadow-soft' 
                          : 'bg-slate-100 text-brand-navy hover:bg-slate-200'
                      }`}
                    >
                      Boarded
                    </button>
                    <button
                      onClick={() => markAttendance(student.id, ATTENDANCE_STATUS.ABSENT)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        isAbsent 
                          ? 'bg-red-600 text-white shadow-soft' 
                          : 'bg-slate-100 text-brand-navy hover:bg-slate-200'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => markAttendance(student.id, ATTENDANCE_STATUS.DROPPED_OFF)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        isDropped 
                          ? 'bg-emerald-600 text-white shadow-soft' 
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
        </Card>

        {/* Delay Modal */}
        <Modal
          isOpen={isDelayModalOpen}
          onClose={() => setIsDelayModalOpen(false)}
          title="Broadcast Transit Delay Advisory"
          subtitle="Alerts school central dispatch and waiting parents along corridor."
        >
          <form onSubmit={handleDelay} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-brand-navy mb-1.5">Delay Cause *</label>
              <select
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-brand-navy bg-white focus:ring-2 focus:ring-brand-blue/30 outline-none"
              >
                <option value="Traffic Congestion">Traffic Congestion / Arterial Bottleneck</option>
                <option value="Severe Weather & Road Conditions">Severe Weather & Rain</option>
                <option value="Mechanical / Vehicle Hold">Mechanical / Vehicle Inspection Hold</option>
                <option value="Student Boarding Delay">Student Boarding / Crosswalk Hold</option>
              </select>
            </div>
            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDelayModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={actionLoading}>
                Broadcast Delay
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default DriverTripDetailPage;
