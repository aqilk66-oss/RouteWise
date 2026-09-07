import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Route, 
  Bus, 
  Users, 
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PlanningNavHeader from '../../../components/planning/PlanningNavHeader';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  scheduleService, 
  routeService, 
  busService, 
  tripService, 
  studentService 
} from '../../../services/firestore';
import { tripGenerationService } from '../../../services/planning/tripGenerationService';
import { useAuth } from '../../../context/AuthContext';
import { USER_ROLES } from '../../../constants/collections';

export const TripGenerationPage = () => {
  const { role, user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [existingTrips, setExistingTrips] = useState([]);
  const [students, setStudents] = useState([]);

  // Wizard state
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });

  const [previewItems, setPreviewItems] = useState([]);
  const [generationSummary, setGenerationSummary] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [schList, rList, bList, tList, sList] = await Promise.all([
          scheduleService.getAll({ max: 200 }),
          routeService.getAll({ max: 200 }),
          busService.getAll({ max: 200 }),
          tripService.getAll({ max: 500 }),
          studentService.getAll({ max: 500 }),
        ]);

        setSchedules(schList || []);
        setRoutes(rList || []);
        setBuses(bList || []);
        setExistingTrips(tList || []);
        setStudents(sList || []);

        if (schList?.length > 0) {
          setSelectedScheduleId(schList[0].id || schList[0].scheduleId);
        }
      } catch (err) {
        console.error('Failed to load data for trip generator:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeSchedule = schedules.find(
    (s) => (s.id || s.scheduleId) === selectedScheduleId
  );
  const activeRoute = routes.find(
    (r) => (r.routeId || r.id) === activeSchedule?.routeId
  );
  const assignedBus = buses.find(
    (b) => (b.busId || b.id) === activeSchedule?.busId
  );

  // Recalculate preview when schedule or date range changes
  useEffect(() => {
    if (activeSchedule && startDate && endDate) {
      const preview = tripGenerationService.previewTripGeneration({
        schedule: activeSchedule,
        startDate,
        endDate,
        existingTrips,
      });
      setPreviewItems(preview);
      setGenerationSummary(null); // Clear previous confirmation
    } else {
      setPreviewItems([]);
    }
  }, [selectedScheduleId, startDate, endDate, existingTrips]);

  const toCreateCount = previewItems.filter((p) => p.status === 'to_create').length;
  const duplicateCount = previewItems.filter((p) => p.status === 'duplicate_skipped').length;

  // Execute batch trip generation
  const handleExecuteGeneration = async () => {
    if (!activeSchedule || toCreateCount === 0) return;

    try {
      setGenerating(true);
      // Associate students assigned to this route
      const enrolledStudents = students
        .filter((st) => st.routeId === activeSchedule.routeId)
        .map((st) => st.id || st.studentId);

      const result = await tripGenerationService.generateTrips({
        schedule: activeSchedule,
        previewItems,
        studentIds: enrolledStudents,
        actor: {
          uid: user?.uid,
          name: profile?.fullName || user?.email,
          role,
        },
      });

      setGenerationSummary(result);
      // Refresh stored trips
      const updatedTrips = await tripService.getAll({ max: 500 });
      setExistingTrips(updatedTrips);
    } catch (err) {
      console.error('Batch generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <PlanningNavHeader 
        title="Trip Dispatch & Bulk Generator" 
        subtitle="Transform recurring schedules into individual dated operational dispatches with duplicate prevention."
      />

      {/* Generation Summary Alert */}
      {generationSummary && (
        <div className="p-5 mb-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-xs text-emerald-800 flex items-start justify-between shadow-soft">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-emerald-900 mb-1">Batch Generation Completed</h4>
              <p>
                Successfully dispatched <strong>{generationSummary.createdCount}</strong> new trip records into the operational system.
                {generationSummary.skippedCount > 0 && ` (${generationSummary.skippedCount} duplicates preserved).`}
              </p>
            </div>
          </div>
          <button onClick={() => setGenerationSummary(null)} className="underline text-emerald-700">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Parameter Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white border border-border rounded-3xl shadow-soft space-y-4">
            <h3 className="text-base font-bold text-brand-navy">Generator Parameters</h3>

            {/* Select Schedule */}
            <div>
              <label className="text-[11px] font-bold text-brand-slate uppercase block mb-1">Target Schedule *</label>
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy bg-white focus:outline-none focus:border-brand-blue"
              >
                {schedules.map((s) => (
                  <option key={s.id || s.scheduleId} value={s.id || s.scheduleId}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule Context Card */}
            {activeSchedule && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 text-brand-slate">
                <div className="font-bold text-brand-navy">
                  Route: {activeRoute?.name || activeSchedule.routeId}
                </div>
                <div>Vehicle: {assignedBus?.busNumber || 'Unassigned'}</div>
                <div>Hours: {activeSchedule.startTime} - {activeSchedule.endTime}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(activeSchedule.operatingDays || []).map((d) => (
                    <span key={d} className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold">
                      {d.slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-brand-slate uppercase block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy focus:outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-brand-slate uppercase block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs text-brand-blue space-y-1">
              <span className="font-bold block">Deterministic Safety Rule</span>
              <p className="text-[11px] leading-relaxed">
                Dates with existing trips for this route and time window are automatically identified and skipped to prevent redundant dispatches.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={Send}
              className="w-full"
              disabled={generating || toCreateCount === 0}
              onClick={handleExecuteGeneration}
            >
              {generating ? 'Writing Dispatches...' : `Generate ${toCreateCount} Trip(s)`}
            </Button>
          </div>
        </div>

        {/* Right Column (7 cols): Trip Generation Preview Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 bg-white border border-border rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy">Dispatch Generation Preview</h3>
                <p className="text-xs text-brand-slate">Calendar calculations for specified timeframe.</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                  {toCreateCount} New
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold">
                  {duplicateCount} Skipped
                </span>
              </div>
            </div>

            {previewItems.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-brand-navy">No Matching Operating Days</p>
                <p className="text-[11px] text-brand-slate mt-0.5">
                  The schedule operating days do not intersect with the selected calendar range.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {previewItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 font-bold flex flex-col items-center justify-center text-[10px] text-brand-navy shrink-0">
                        <span>{item.dayOfWeek.slice(0, 3)}</span>
                      </div>
                      <div>
                        <span className="font-bold text-brand-navy block">{item.date}</span>
                        <span className="text-[11px] text-brand-slate flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.scheduledStartTime} - {item.scheduledEndTime}
                        </span>
                      </div>
                    </div>

                    <div>
                      {item.status === 'to_create' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Ready to Create
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600" title={`Existing ID: ${item.existingTripId}`}>
                          Duplicate Skipped
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TripGenerationPage;
