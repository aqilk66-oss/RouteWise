import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  Route, 
  Bus, 
  Users,
  CalendarDays
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PlanningNavHeader from '../../../components/planning/PlanningNavHeader';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { 
  scheduleService, 
  routeService, 
  busService, 
  driverService 
} from '../../../services/firestore';
import { detectScheduleConflicts } from '../../../services/planning/conflictService';
import { auditService } from '../../../services/admin/auditService';
import { useAuth } from '../../../context/AuthContext';
import { RECORD_STATUS, USER_ROLES } from '../../../constants/collections';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const SchedulePlanningPage = () => {
  const { role, user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Schedule Form Data
  const [formData, setFormData] = useState({
    routeId: '',
    busId: '',
    driverId: '',
    name: '',
    startTime: '07:15',
    endTime: '08:15',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveUntil: '',
  });

  // Fetch Schedules & Dependencies
  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const [scheduleList, routeList, busList, driverList] = await Promise.all([
        scheduleService.getAll({ max: 200 }),
        routeService.getAll({ max: 200 }),
        busService.getAll({ max: 200 }),
        driverService.getAll({ max: 200 }),
      ]);

      setSchedules(scheduleList || []);
      setRoutes(routeList || []);
      setBuses(busList || []);
      setDrivers(driverList || []);
    } catch (err) {
      console.error('Failed to load schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  // Real-time conflict detection on current form inputs
  const currentFormConflicts = detectScheduleConflicts({
    busId: formData.busId,
    driverId: formData.driverId,
    routeId: formData.routeId,
    startTime: formData.startTime,
    endTime: formData.endTime,
    operatingDays: formData.operatingDays,
    existingSchedules: schedules,
  });

  const toggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.operatingDays.includes(day);
      return {
        ...prev,
        operatingDays: exists
          ? prev.operatingDays.filter((d) => d !== day)
          : [...prev.operatingDays, day],
      };
    });
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!formData.routeId) {
      setToastMessage({ type: 'error', text: 'Please select a transit route.' });
      return;
    }
    if (formData.operatingDays.length === 0) {
      setToastMessage({ type: 'error', text: 'Select at least one operating day.' });
      return;
    }

    try {
      setSaving(true);
      const selectedRoute = routes.find((r) => r.routeId === formData.routeId || r.id === formData.routeId);
      const scheduleName = formData.name.trim() || `${selectedRoute?.name || 'Route'} Schedule`;

      const created = await scheduleService.createSchedule({
        ...formData,
        name: scheduleName,
      });

      // Audit Log
      await auditService.logEvent({
        actorUserId: user?.uid,
        actorName: profile?.fullName || user?.email,
        actorRole: role,
        action: 'SCHEDULE_CREATED',
        resourceType: 'schedule',
        resourceId: created.id || created.scheduleId,
        description: `Created operating schedule for ${scheduleName} (${formData.startTime} - ${formData.endTime}).`,
        severity: currentFormConflicts.hasConflict ? 'warning' : 'info',
        metadata: {
          ...formData,
          conflictsDetected: currentFormConflicts.conflicts,
        },
      });

      setIsModalOpen(false);
      setToastMessage({ type: 'success', text: 'Schedule created successfully.' });
      fetchScheduleData();
    } catch (err) {
      setToastMessage({ type: 'error', text: err.message || 'Failed to create schedule.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await scheduleService.delete(scheduleId);
      await auditService.logEvent({
        actorUserId: user?.uid,
        actorName: profile?.fullName || user?.email,
        actorRole: role,
        action: 'SCHEDULE_DELETED',
        resourceType: 'schedule',
        resourceId: scheduleId,
        description: `Deleted transport schedule ${scheduleId}.`,
        severity: 'info',
      });
      setToastMessage({ type: 'success', text: 'Schedule removed.' });
      fetchScheduleData();
    } catch (err) {
      setToastMessage({ type: 'error', text: 'Failed to delete schedule.' });
    }
  };

  return (
    <DashboardLayout>
      <PlanningNavHeader 
        title="Fleet Scheduling & Conflict Engine" 
        subtitle="Manage operating days, recurring dispatch hours, and detect vehicle or driver schedule overlaps."
      >
        <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsModalOpen(true)}>
          New Schedule
        </Button>
      </PlanningNavHeader>

      {toastMessage && (
        <div className={`p-4 mb-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-soft ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          toastMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
          'bg-blue-50 text-brand-blue border border-blue-200'
        }`}>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Schedules Table */}
      <div className="bg-white border border-border rounded-3xl shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-navy">Active Fleet Schedules ({schedules.length})</h3>
            <p className="text-xs text-brand-slate">Validated recurring operational service profiles.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-brand-navy">No schedules configured</p>
            <p className="text-xs text-brand-slate mt-1 mb-4">Define operating days and dispatch windows to unlock automated trip generation.</p>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
              Create First Schedule
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Schedule / Route</th>
                  <th className="py-3 px-4">Operating Window</th>
                  <th className="py-3 px-4">Operating Days</th>
                  <th className="py-3 px-4">Assigned Fleet</th>
                  <th className="py-3 px-4">Conflict Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {schedules.map((sch) => {
                  const routeObj = routes.find((r) => r.routeId === sch.routeId || r.id === sch.routeId);
                  const busObj = buses.find((b) => b.busId === sch.busId || b.id === sch.busId);
                  const driverObj = drivers.find((d) => d.driverId === sch.driverId || d.id === sch.driverId);

                  const conflictCheck = detectScheduleConflicts({
                    busId: sch.busId,
                    driverId: sch.driverId,
                    routeId: sch.routeId,
                    startTime: sch.startTime,
                    endTime: sch.endTime,
                    operatingDays: sch.operatingDays,
                    existingSchedules: schedules,
                    targetScheduleId: sch.id || sch.scheduleId,
                  });

                  return (
                    <tr key={sch.id || sch.scheduleId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-navy text-sm">{sch.name}</div>
                        <span className="text-[11px] text-brand-slate">
                          {routeObj ? `${routeObj.name} (${routeObj.routeCode})` : sch.routeId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold">
                        <span className="flex items-center gap-1.5 text-brand-navy">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {sch.startTime} - {sch.endTime}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(sch.operatingDays || []).map((day) => (
                            <span 
                              key={day}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold"
                            >
                              {day.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span>Bus: <strong className="text-brand-navy">{busObj?.busNumber || 'Unassigned'}</strong></span>
                          <span>Driver: <strong className="text-brand-navy">{driverObj?.fullName || 'Unassigned'}</strong></span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {conflictCheck.hasConflict ? (
                          <div className="flex items-center gap-1 text-amber-600 font-bold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{conflictCheck.conflicts.length} Overlap(s)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Clear</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSchedule(sch.id || sch.scheduleId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Recurring Transport Schedule"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-navy block mb-1">Schedule Name</label>
            <input
              type="text"
              placeholder="e.g. Morning Inbound Service"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="font-bold text-brand-navy block mb-1">Transit Route *</label>
            <select
              required
              value={formData.routeId}
              onChange={(e) => {
                const rId = e.target.value;
                const r = routes.find((x) => x.routeId === rId || x.id === rId);
                setFormData({
                  ...formData,
                  routeId: rId,
                  busId: r?.assignedBusId || formData.busId,
                  driverId: r?.assignedDriverId || formData.driverId,
                });
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-blue"
            >
              <option value="">Select Route</option>
              {routes.map((r) => (
                <option key={r.id || r.routeId} value={r.routeId || r.id}>
                  {r.name} ({r.routeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-navy block mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="font-bold text-brand-navy block mb-1">End Time *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Operating Days Selector */}
          <div>
            <label className="font-bold text-brand-navy block mb-1.5">Operating Days *</label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const selected = formData.operatingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      selected
                        ? 'bg-brand-blue text-white shadow-soft'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-navy block mb-1">Vehicle</label>
              <select
                value={formData.busId}
                onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-blue"
              >
                <option value="">Unassigned</option>
                {buses.map((b) => (
                  <option key={b.id || b.busId} value={b.busId || b.id}>
                    {b.busNumber} ({b.capacity} Seats)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-brand-navy block mb-1">Driver</label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-blue"
              >
                <option value="">Unassigned</option>
                {drivers.map((d) => (
                  <option key={d.id || d.driverId} value={d.driverId || d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Conflict Preview Banner */}
          {currentFormConflicts.hasConflict && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Schedule Conflict Detected</span>
              </div>
              {currentFormConflicts.conflicts.map((c, i) => (
                <p key={i} className="text-[11px]">{c.message}</p>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default SchedulePlanningPage;
