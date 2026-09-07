import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ClipboardCheck, 
  ChevronLeft, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  Bus 
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Button from '../../../components/ui/Button';
import { useDriverTransport } from '../../../context/DriverTransportContext';
import { inspectionService, defectService, STANDARD_INSPECTION_CHECKLIST } from '../../../services/firestore';
import { auditService } from '../../../services/admin/auditService';
import { INSPECTION_RESULT, BUS_STATUS } from '../../../constants/collections';

export const DriverPreTripInspectionPage = () => {
  const navigate = useNavigate();
  const { assignedBus, driverProfile } = useDriverTransport();

  const [saving, setSaving] = useState(false);
  const [checklist, setChecklist] = useState(() => {
    const init = {};
    STANDARD_INSPECTION_CHECKLIST.forEach((item) => {
      init[item.id] = 'pass';
    });
    return init;
  });
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(null);

  const toggleCheck = (id, val) => {
    setChecklist((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignedBus) return;

    setSaving(true);
    try {
      const failedItems = STANDARD_INSPECTION_CHECKLIST.filter(
        (item) => checklist[item.id] === 'fail'
      );
      const hasCritical = failedItems.some((item) => item.critical);
      const overallResult = hasCritical 
        ? INSPECTION_RESULT.FAILED 
        : failedItems.length > 0 
        ? INSPECTION_RESULT.PASSED_WITH_ISSUES 
        : INSPECTION_RESULT.PASSED;

      // 1. Record Inspection
      const created = await inspectionService.createInspection({
        busId: assignedBus.busId || assignedBus.id,
        inspectionType: 'pre-trip',
        inspectorId: driverProfile?.driverId || 'driver',
        inspectorName: driverProfile?.fullName || 'Bus Driver',
        result: overallResult,
        checklist,
        notes,
      });

      // 2. If failures, automatically create defect records
      for (const failed of failedItems) {
        await defectService.reportDefect({
          busId: assignedBus.busId || assignedBus.id,
          inspectionId: created.id || created.inspectionId,
          category: failed.category,
          severity: failed.critical ? 'critical' : 'medium',
          description: `Pre-Trip Inspection Flag: ${failed.label}`,
          reportedBy: driverProfile?.fullName || 'Bus Driver',
        });
      }

      // 3. Audit Log
      await auditService.logEvent({
        actorUserId: driverProfile?.driverId,
        actorName: driverProfile?.fullName || 'Driver',
        actorRole: 'driver',
        action: 'PRE_TRIP_INSPECTION_SUBMITTED',
        resourceType: 'vehicleInspection',
        resourceId: created.id || created.inspectionId,
        description: `Pre-trip inspection submitted for bus ${assignedBus.busNumber}. Result: ${overallResult}.`,
        severity: overallResult === INSPECTION_RESULT.FAILED ? 'warning' : 'info',
        metadata: {
          result: overallResult,
          failedCount: failedItems.length,
        },
      });

      navigate('/driver/vehicle');
    } catch (err) {
      setToast({ type: 'error', text: err.message || 'Failed to submit inspection.' });
    } finally {
      setSaving(false);
    }
  };

  if (!assignedBus) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto p-10 text-center bg-white border border-border rounded-3xl shadow-soft">
          <Bus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-brand-navy">No Bus Assigned</h3>
          <p className="text-xs text-brand-slate mt-1 mb-4">You must have an assigned bus to perform pre-trip inspections.</p>
          <Link to="/driver">
            <Button variant="outline" size="sm">
              Return to Console
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/driver/vehicle">
            <button className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-brand-navy" />
            </button>
          </Link>
          <div>
            <h2 className="text-xl font-black text-brand-navy">Daily Pre-Trip Inspection</h2>
            <p className="text-xs text-brand-slate">
              Bus {assignedBus.busNumber} • {assignedBus.registrationNumber}
            </p>
          </div>
        </div>

        {toast && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold">
            {toast.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 bg-white border border-border rounded-3xl shadow-soft space-y-5">
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs text-brand-teal font-semibold">
            Tap <strong>Pass</strong> or <strong>Issue</strong> for each safety check item. Critical items with defects will flag the vehicle for maintenance review.
          </div>

          <div className="space-y-2.5">
            {STANDARD_INSPECTION_CHECKLIST.map((item) => {
              const current = checklist[item.id] || 'pass';

              return (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-brand-navy text-xs block">
                      {item.label}
                      {item.critical && <span className="text-rose-600 font-bold ml-1.5">*Critical</span>}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">{item.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id, 'pass')}
                      className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1 transition-all ${
                        current === 'pass'
                          ? 'bg-emerald-600 text-white shadow-soft'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id, 'fail')}
                      className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1 transition-all ${
                        current === 'fail'
                          ? 'bg-rose-600 text-white shadow-soft'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" /> Issue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="font-bold text-brand-navy text-xs block mb-1">Driver Observations / Notes</label>
            <textarea
              rows={2}
              placeholder="Any additional feedback or minor observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Link to="/driver/vehicle">
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? 'Submitting...' : 'Complete Pre-Trip Check'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DriverPreTripInspectionPage;
