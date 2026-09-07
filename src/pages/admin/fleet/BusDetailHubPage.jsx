import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Bus, 
  ChevronLeft, 
  Wrench, 
  ClipboardCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Plus, 
  Save, 
  Power 
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { 
  busService, 
  maintenanceService, 
  inspectionService, 
  vehicleDocumentService, 
  defectService 
} from '../../../services/firestore';
import { evaluateBusReadiness } from '../../../services/fleet/busReadinessService';
import { auditService } from '../../../services/admin/auditService';
import { useAuth } from '../../../context/AuthContext';
import { BUS_STATUS, DOCUMENT_STATUS, USER_ROLES } from '../../../constants/collections';

export const BusDetailHubPage = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const { role, user, profile } = useAuth();
  const isTransport = role === USER_ROLES.TRANSPORT_MANAGER;
  const basePrefix = isTransport ? '/transport/fleet' : '/admin/fleet';

  const [loading, setLoading] = useState(true);
  const [bus, setBus] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [defects, setDefects] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // New Maintenance Modal State
  const [isMntModalOpen, setIsMntModalOpen] = useState(false);
  const [mntFormData, setMntFormData] = useState({
    title: '',
    type: 'routine service',
    priority: 'medium',
    scheduledAt: new Date().toISOString().split('T')[0],
    vendor: '',
    cost: '',
    notes: '',
  });

  const loadBusData = async () => {
    setLoading(true);
    try {
      const busDoc = await busService.getById(busId);
      if (!busDoc) {
        navigate(`${basePrefix}/buses`);
        return;
      }

      const [mntList, inspList, docList, defectList] = await Promise.all([
        maintenanceService.getByBusId(busDoc.busId || busId),
        inspectionService.getByBusId(busDoc.busId || busId),
        vehicleDocumentService.getByBusId(busDoc.busId || busId),
        defectService.getOpenByBusId(busDoc.busId || busId),
      ]);

      setBus(busDoc);
      setMaintenance(mntList || []);
      setInspections(inspList || []);
      setDocuments(docList || []);
      setDefects(defectList || []);
    } catch (err) {
      console.error('Failed to load bus detail hub:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusData();
  }, [busId]);

  const readiness = evaluateBusReadiness({
    bus,
    documents,
    defects,
    inspections,
  });

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    if (!mntFormData.title.trim()) return;

    try {
      await maintenanceService.createRecord({
        ...mntFormData,
        busId: bus.busId || busId,
      });

      await auditService.logEvent({
        actorUserId: user?.uid,
        actorName: profile?.fullName || user?.email,
        actorRole: role,
        action: 'MAINTENANCE_SCHEDULED',
        resourceType: 'bus',
        resourceId: bus.busId || busId,
        description: `Scheduled maintenance for Bus ${bus.busNumber}: ${mntFormData.title}.`,
        severity: 'info',
        metadata: mntFormData,
      });

      setIsMntModalOpen(false);
      setToastMessage({ type: 'success', text: 'Maintenance record scheduled and bus flagged in shop.' });
      loadBusData();
    } catch (err) {
      setToastMessage({ type: 'error', text: err.message || 'Failed to schedule maintenance.' });
    }
  };

  const handleToggleStatus = async (newStatus) => {
    try {
      await busService.update(bus.id || busId, { status: newStatus });
      await auditService.logEvent({
        actorUserId: user?.uid,
        actorName: profile?.fullName || user?.email,
        actorRole: role,
        action: 'BUS_STATUS_CHANGED',
        resourceType: 'bus',
        resourceId: bus.busId || busId,
        description: `Bus ${bus.busNumber} status manually changed to ${newStatus}.`,
        severity: newStatus === BUS_STATUS.OUT_OF_SERVICE ? 'warning' : 'info',
      });
      setToastMessage({ type: 'success', text: `Bus status updated to ${newStatus}.` });
      loadBusData();
    } catch (err) {
      setToastMessage({ type: 'error', text: 'Failed to update bus status.' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-brand-slate">Loading vehicle detail hub...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Toast Notification */}
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to={`${basePrefix}/buses`}>
            <button className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-brand-navy" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-brand-navy">Bus {bus.busNumber}</h2>
              <Badge variant={
                bus.status === BUS_STATUS.AVAILABLE ? 'success' :
                bus.status === BUS_STATUS.MAINTENANCE ? 'warning' :
                bus.status === BUS_STATUS.OUT_OF_SERVICE ? 'danger' : 'neutral'
              }>
                {bus.status}
              </Badge>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                readiness.isReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {readiness.statusText}
              </span>
            </div>
            <span className="text-xs text-brand-slate">
              Plate: <strong className="text-slate-700">{bus.registrationNumber}</strong> • Model: {bus.manufacturer} {bus.model} ({bus.year})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {bus.status === BUS_STATUS.MAINTENANCE ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleStatus(BUS_STATUS.AVAILABLE)}
            >
              Mark Maintenance Complete
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={Wrench}
              onClick={() => setIsMntModalOpen(true)}
            >
              Book Service
            </Button>
          )}

          {bus.status === BUS_STATUS.OUT_OF_SERVICE ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleToggleStatus(BUS_STATUS.AVAILABLE)}
            >
              Restore to Service
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleToggleStatus(BUS_STATUS.OUT_OF_SERVICE)}
            >
              Take Out of Service
            </Button>
          )}
        </div>
      </div>

      {/* Main Hub Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Vehicle Specs & Readiness Checklist */}
        <div className="lg:col-span-4 space-y-4">
          {/* Readiness Checklist Card */}
          <div className="p-5 bg-white border border-border rounded-3xl shadow-soft">
            <h3 className="text-sm font-bold text-brand-navy mb-3">Operational Readiness Audit</h3>
            <div className="space-y-2.5">
              {readiness.checks.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-xs">
                  {c.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">{c.label}</span>
                    <span className="text-[10px] text-slate-500">{c.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mechanical Specs Card */}
          <div className="p-5 bg-white border border-border rounded-3xl shadow-soft space-y-3 text-xs">
            <h3 className="text-sm font-bold text-brand-navy">Specifications & Attributes</h3>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Passenger Seating:</span>
                <strong className="text-brand-navy">{bus.capacity} seats</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Manufacturer:</span>
                <strong className="text-brand-navy">{bus.manufacturer || 'Volvo'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Model Designation:</span>
                <strong className="text-brand-navy">{bus.model || 'Standard School Transit Coach'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Registration Year:</span>
                <strong className="text-brand-navy">{bus.year || '2024'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Assigned Route:</span>
                <strong className="text-brand-navy">{bus.assignedRouteId || 'Unassigned'}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Assigned Driver:</span>
                <strong className="text-brand-navy">{bus.assignedDriverId || 'Unassigned'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Column (8 cols): Maintenance History, Inspections & Documents */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Defects Alert */}
          {defects.length > 0 && (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Unresolved Defect Reports ({defects.length})</span>
              </div>
              <div className="space-y-1.5">
                {defects.map((d) => (
                  <div key={d.id || d.defectId} className="p-2.5 bg-white/80 border border-rose-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-800 uppercase text-[10px] mr-2">[{d.severity}]</span>
                      <span className="text-slate-800">{d.description}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{d.reportedAt?.split('T')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Work Orders */}
          <div className="p-6 bg-white border border-border rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy">Maintenance & Work Orders</h3>
                <p className="text-xs text-brand-slate">Service log, mechanical repairs, and scheduled downtime.</p>
              </div>
              <Button size="sm" variant="outline" icon={Plus} onClick={() => setIsMntModalOpen(true)}>
                New Service
              </Button>
            </div>

            {maintenance.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-brand-slate">
                No maintenance records logged for this vehicle.
              </div>
            ) : (
              <div className="space-y-2.5">
                {maintenance.map((m) => (
                  <div key={m.id || m.maintenanceId} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-brand-navy">{m.title}</div>
                      <span className="text-[11px] text-slate-500">
                        Type: {m.type} • Vendor: {m.vendor || 'Internal Workshop'} • Scheduled: {m.scheduledAt?.split('T')[0] || 'N/A'}
                      </span>
                    </div>
                    <Badge variant={m.status === 'completed' ? 'success' : m.status === 'inProgress' ? 'warning' : 'neutral'}>
                      {m.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Inspections */}
          <div className="p-6 bg-white border border-border rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy">Pre-Trip & Safety Inspections</h3>
                <p className="text-xs text-brand-slate">Checklist audit logs submitted by drivers and fleet mechanics.</p>
              </div>
            </div>

            {inspections.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-brand-slate">
                No safety inspections recorded yet for this vehicle.
              </div>
            ) : (
              <div className="space-y-2">
                {inspections.map((insp) => (
                  <div key={insp.id || insp.inspectionId} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-brand-navy block">
                        {insp.inspectionType ? insp.inspectionType.toUpperCase() : 'PRE-TRIP'} CHECKLIST
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Inspector: {insp.inspectorName || 'Driver'} • Date: {insp.inspectionDate?.split('T')[0]}
                      </span>
                    </div>
                    <Badge variant={insp.result === 'passed' ? 'success' : 'danger'}>
                      {insp.result}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={isMntModalOpen}
        onClose={() => setIsMntModalOpen(false)}
        title={`Schedule Maintenance — Bus ${bus.busNumber}`}
      >
        <form onSubmit={handleCreateMaintenance} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-navy block mb-1">Service Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 50,000 Mile Brake & Hydraulic Inspection"
              value={mntFormData.title}
              onChange={(e) => setMntFormData({ ...mntFormData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-navy block mb-1">Service Category</label>
              <select
                value={mntFormData.type}
                onChange={(e) => setMntFormData({ ...mntFormData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="routine service">Routine Service</option>
                <option value="brake inspection">Brake Inspection</option>
                <option value="tire service">Tire Service</option>
                <option value="engine">Engine / Transmission</option>
                <option value="electrical">Electrical / Lights</option>
                <option value="safety equipment">Safety Equipment</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-brand-navy block mb-1">Priority</label>
              <select
                value={mntFormData.priority}
                onChange={(e) => setMntFormData({ ...mntFormData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical (Safety Stop)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-navy block mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={mntFormData.scheduledAt}
                onChange={(e) => setMntFormData({ ...mntFormData, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="font-bold text-brand-navy block mb-1">Service Vendor / Shop</label>
              <input
                type="text"
                placeholder="District Fleet Center"
                value={mntFormData.vendor}
                onChange={(e) => setMntFormData({ ...mntFormData, vendor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-brand-navy block mb-1">Technical Notes</label>
            <textarea
              rows={2}
              placeholder="Provide repair instructions or diagnostic notes."
              value={mntFormData.notes}
              onChange={(e) => setMntFormData({ ...mntFormData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsMntModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm & Book Service
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default BusDetailHubPage;
