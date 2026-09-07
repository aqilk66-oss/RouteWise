import React, { useState } from 'react';
import { 
  Bus, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  RefreshCw,
  ChevronRight,
  Compass,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useDriverTransport } from '../../context/DriverTransportContext';
import { TRIP_STATUS } from '../../constants/collections';

export const DriverOverviewPage = () => {
  const { 
    driverProfile, 
    assignedBus, 
    assignedRoute, 
    routeStops, 
    activeTrip, 
    attendanceSummary, 
    loading, 
    refreshData, 
    refreshing, 
    startTrip, 
    completeTrip, 
    reportDelay 
  } = useDriverTransport();

  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayReason, setDelayReason] = useState('Traffic Congestion');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const isLive = activeTrip?.status === TRIP_STATUS.IN_PROGRESS || activeTrip?.status === 'inProgress';
  const isScheduled = activeTrip?.status === TRIP_STATUS.SCHEDULED || activeTrip?.status === 'scheduled' || activeTrip?.status === 'ready';
  const isDelayed = activeTrip?.status === TRIP_STATUS.DELAYED || activeTrip?.status === 'delayed';
  const isCompleted = activeTrip?.status === TRIP_STATUS.COMPLETED || activeTrip?.status === 'completed';

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    setActionLoading(true);
    try {
      await startTrip(activeTrip.id);
      showToast('Trip started. Operational GPS beacon initiated.');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeTrip) return;
    if (attendanceSummary.pending > 0) {
      if (!window.confirm(`Notice: ${attendanceSummary.pending} student(s) still have unrecorded attendance status. Conclude trip anyway?`)) {
        return;
      }
    }
    setActionLoading(true);
    try {
      await completeTrip(activeTrip.id);
      showToast('Trip successfully concluded and logged to fleet records.');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelay = async (e) => {
    e.preventDefault();
    if (!activeTrip) return;
    setActionLoading(true);
    try {
      await reportDelay(activeTrip.id, delayReason);
      setIsDelayModalOpen(false);
      showToast('Transit delay advisory broadcast to parents and dispatch.');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <DashboardLayout title="Driver Console & Dispatch Command">
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-fade-in shadow-soft">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Primary Operational Hero Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-soft ${
              isLive ? 'bg-teal-500 text-white animate-pulse' : 'bg-brand-navy text-white'
            }`}>
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h2 className="text-xl font-bold text-brand-navy">
                  {assignedRoute?.name || activeTrip?.routeName || 'Assigned Transit Run'}
                </h2>
                <Badge variant={isLive ? 'active' : isDelayed ? 'warning' : isCompleted ? 'neutral' : 'info'} size="md">
                  {isLive ? 'In Progress' : isDelayed ? 'Delayed' : isCompleted ? 'Run Completed' : 'Scheduled Run'}
                </Badge>
              </div>
              <p className="text-xs text-brand-slate">
                Assigned Bus: <span className="font-bold text-brand-navy">{assignedBus?.busNumber || 'Fleet Vehicle'}</span> • 
                License: <span className="font-semibold text-brand-blue">{driverProfile?.licenseNumber || 'CDL Certified'}</span> • 
                Vehicle Plate: <span className="font-semibold text-brand-slate">{assignedBus?.registrationNumber || 'Inspected'}</span>
              </p>
            </div>
          </div>

          {/* Big, accessible primary driver action buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <Button
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={refreshData}
              loading={refreshing}
            >
              Sync Dispatch
            </Button>

            {isScheduled && (
              <Button
                variant="primary"
                size="md"
                icon={Play}
                onClick={handleStartTrip}
                loading={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-soft"
              >
                Start Trip
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
                  onClick={handleCompleteTrip}
                  loading={actionLoading}
                  className="bg-brand-navy hover:bg-slate-800 text-white font-bold px-6 shadow-soft"
                >
                  Complete Trip
                </Button>
              </>
            )}

            {isDelayed && (
              <Button
                variant="primary"
                size="md"
                icon={CheckCircle2}
                onClick={handleCompleteTrip}
                loading={actionLoading}
                className="bg-brand-navy hover:bg-slate-800 text-white font-bold px-6 shadow-soft"
              >
                Complete Trip
              </Button>
            )}
          </div>
        </div>

        {/* 4-Column Operational Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 space-y-2 hover:shadow-subtle transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">Departure Window</span>
              <Clock className="w-4 h-4 text-brand-blue" />
            </div>
            <p className="text-xl font-bold text-brand-navy">
              {activeTrip?.scheduledStartTime || activeTrip?.scheduledStart || '07:15 AM'}
            </p>
            <p className="text-xs text-brand-slate">
              Return circuit: <span className="font-semibold text-brand-navy">03:30 PM</span>
            </p>
          </Card>

          <Card className="p-5 space-y-2 hover:shadow-subtle transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">Next Station Stop</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-brand-navy truncate">
              {routeStops[0]?.name || 'Depot Terminal'}
            </p>
            <p className="text-xs text-brand-slate">
              {routeStops.length} designated corridor stops
            </p>
          </Card>

          <Card className="p-5 space-y-2 hover:shadow-subtle transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">Student Manifest</span>
              <Users className="w-4 h-4 text-brand-teal" />
            </div>
            <p className="text-xl font-bold text-brand-navy">
              {attendanceSummary.boarded} / {attendanceSummary.total} Boarded
            </p>
            <p className="text-xs text-brand-slate">
              {attendanceSummary.absent} marked absent • {attendanceSummary.pending} waiting
            </p>
          </Card>

          <Card className="p-5 space-y-2 hover:shadow-subtle transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">Transit Line</span>
              <Compass className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-brand-navy">
              {assignedRoute?.routeCode || 'EXP-14'}
            </p>
            <p className="text-xs text-brand-slate">
              {assignedRoute?.estimatedDuration || '35 mins'} • {assignedRoute?.distance || '12.4 mi'}
            </p>
          </Card>
        </div>

        {/* Quick Driver Action Links */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/driver/tracking"
            className="p-4 rounded-2xl bg-white border border-teal-200 hover:border-brand-teal shadow-soft flex items-center justify-between text-xs font-bold text-brand-navy group transition-all"
          >
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-teal animate-pulse" />
              <span>Live GPS Beacon</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/driver/route"
            className="p-4 rounded-2xl bg-white border border-border hover:border-brand-blue/40 shadow-soft flex items-center justify-between text-xs font-bold text-brand-navy group transition-all"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-blue" />
              <span>Inspect Stops</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/driver/attendance"
            className="p-4 rounded-2xl bg-white border border-border hover:border-brand-teal/40 shadow-soft flex items-center justify-between text-xs font-bold text-brand-navy group transition-all"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-teal" />
              <span>Passenger Attendance</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/driver/trips"
            className="p-4 rounded-2xl bg-white border border-border hover:border-purple-400/40 shadow-soft flex items-center justify-between text-xs font-bold text-brand-navy group transition-all"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Upcoming Runs</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/driver/notifications"
            className="p-4 rounded-2xl bg-white border border-border hover:border-amber-400/40 shadow-soft flex items-center justify-between text-xs font-bold text-brand-navy group transition-all"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Fleet Bulletins</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Emergency Safety Protocol Banner */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-rose-950">Driver Safety Protocol & Roadside Dispatch</p>
              <p className="text-rose-800 text-[11px] mt-0.5">
                In case of collision, medical emergency, or severe vehicle breakdown, safely pull over before calling dispatch.
              </p>
            </div>
          </div>
          <a
            href="tel:911"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 self-end sm:self-center shadow-soft transition-colors"
          >
            Emergency 911 / Dispatch
          </a>
        </div>

        {/* Delay Reporting Modal */}
        <Modal
          isOpen={isDelayModalOpen}
          onClose={() => setIsDelayModalOpen(false)}
          title="Broadcast Transit Delay Advisory"
          subtitle="Directly alerts school central dispatch and waiting parents."
        >
          <form onSubmit={handleConfirmDelay} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-brand-navy mb-1.5">Primary Delay Reason *</label>
              <select
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-xs text-brand-navy bg-white focus:ring-2 focus:ring-brand-blue/30 outline-none"
              >
                <option value="Traffic Congestion">Traffic Congestion / Arterial Bottleneck</option>
                <option value="Severe Weather & Road Conditions">Severe Weather & Rain / Road Conditions</option>
                <option value="Mechanical / Vehicle Inspection Hold">Mechanical / Vehicle Inspection Hold</option>
                <option value="Student Boarding / Crosswalk Delay">Student Boarding / Crosswalk Delay</option>
                <option value="Detour / Route Obstruction">Detour / Route Obstruction</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              Delay status will immediately display on guardian mobile route passes. No fabricated ETA countdowns are generated.
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
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

export default DriverOverviewPage;
