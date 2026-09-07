import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ChevronLeft, 
  AlertTriangle, 
  Send, 
  Bus, 
  CheckCircle2 
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Button from '../../../components/ui/Button';
import { useDriverTransport } from '../../../context/DriverTransportContext';
import { defectService } from '../../../services/firestore';
import { auditService } from '../../../services/admin/auditService';

export const DriverIssueReportPage = () => {
  const navigate = useNavigate();
  const { assignedBus, driverProfile } = useDriverTransport();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    category: 'mechanical',
    severity: 'medium',
    description: '',
  });
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignedBus || !formData.description.trim()) return;

    setSaving(true);
    try {
      const created = await defectService.reportDefect({
        busId: assignedBus.busId || assignedBus.id,
        category: formData.category,
        severity: formData.severity,
        description: formData.description.trim(),
        reportedBy: driverProfile?.fullName || 'Bus Driver',
      });

      await auditService.logEvent({
        actorUserId: driverProfile?.driverId,
        actorName: driverProfile?.fullName || 'Driver',
        actorRole: 'driver',
        action: 'DEFECT_REPORTED_BY_DRIVER',
        resourceType: 'defect',
        resourceId: created.id || created.defectId,
        description: `Driver reported ${formData.severity} defect for Bus ${assignedBus.busNumber}: ${formData.description}.`,
        severity: formData.severity === 'critical' ? 'critical' : 'warning',
        metadata: formData,
      });

      navigate('/driver/vehicle');
    } catch (err) {
      setToast({ type: 'error', text: err.message || 'Failed to submit defect report.' });
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
          <p className="text-xs text-brand-slate mt-1 mb-4">You must have an assigned bus to report issues.</p>
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
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/driver/vehicle">
            <button className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-brand-navy" />
            </button>
          </Link>
          <div>
            <h2 className="text-xl font-black text-brand-navy">Report Vehicle Defect</h2>
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

        <form onSubmit={handleSubmit} className="p-6 bg-white border border-border rounded-3xl shadow-soft space-y-5">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
            <strong>Safety Protocol:</strong> For critical brake, steering, or engine failures, mark severity as <strong>Critical</strong> to notify dispatch immediately and initiate vehicle substitution.
          </div>

          <div>
            <label className="font-bold text-brand-navy text-xs block mb-1">Issue Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy bg-white focus:outline-none focus:border-brand-teal"
            >
              <option value="mechanical">Mechanical (Brakes, Engine, Transmission)</option>
              <option value="electrical">Electrical (Headlights, Signals, Battery)</option>
              <option value="tires">Tires & Suspension</option>
              <option value="interior">Interior (Seats, Belts, Mirrors, Doors)</option>
              <option value="safety equipment">Safety Equipment (Extinguisher, First Aid)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-brand-navy text-xs block mb-1.5">Severity Level *</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'minor', label: 'Minor', desc: 'Cosmetic / Non-urgent' },
                { id: 'medium', label: 'Medium', desc: 'Needs garage look' },
                { id: 'critical', label: 'Critical', desc: 'Unsafe to operate' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: lvl.id })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formData.severity === lvl.id
                      ? lvl.id === 'critical'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold shadow-soft'
                        : 'bg-teal-50 border-brand-teal text-brand-teal font-bold shadow-soft'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold capitalize">{lvl.label}</span>
                  <span className="text-[10px] text-slate-500 font-normal">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-brand-navy text-xs block mb-1">Issue Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe the issue, noise, warning light, or physical symptom observed..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Link to="/driver/vehicle">
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" size="sm" type="submit" icon={Send} disabled={saving}>
              {saving ? 'Submitting...' : 'Transmit Defect Report'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DriverIssueReportPage;
