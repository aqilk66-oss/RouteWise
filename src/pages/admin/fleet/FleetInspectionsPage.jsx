import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Filter,
  Check,
  X
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import FleetNavHeader from '../../../components/fleet/FleetNavHeader';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { inspectionService, busService, STANDARD_INSPECTION_CHECKLIST } from '../../../services/firestore';
import { auditService } from '../../../services/admin/auditService';
import { useAuth } from '../../../context/AuthContext';
import { INSPECTION_RESULT } from '../../../constants/collections';

export const FleetInspectionsPage = () => {
  const { role, user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState([]);
  const [buses, setBuses] = useState([]);
  const [filterResult, setFilterResult] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [selectedBusId, setSelectedBusId] = useState('');
  const [checklistValues, setChecklistValues] = useState(() => {
    const initial = {};
    STANDARD_INSPECTION_CHECKLIST.forEach((item) => {
      initial[item.id] = 'pass';
    });
    return initial;
  });
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inspList, busList] = await Promise.all([
        inspectionService.getAll({ max: 200 }),
        busService.getAll({ max: 200 }),
      ]);
      setInspections(inspList || []);
      setBuses(busList || []);
      if (busList?.length > 0 && !selectedBusId) {
        setSelectedBusId(busList[0].busId || busList[0].id);
      }
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleCheck = (id, val) => {
    setChecklistValues((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!selectedBusId) return;

    // Evaluate result based on failed checklist items
    const failedItems = STANDARD_INSPECTION_CHECKLIST.filter(
      (item) => checklistValues[item.id] === 'fail'
    );
    const hasCriticalFail = failedItems.some((item) => item.critical);
    const overallResult = hasCriticalFail
      ? INSPECTION_RESULT.FAILED
      : failedItems.length > 0
      ? INSPECTION_RESULT.PASSED_WITH_ISSUES
      : INSPECTION_RESULT.PASSED;

    try {
      const created = await inspectionService.createInspection({
        busId: selectedBusId,
        inspectionType: 'periodic',
        inspectorId: user?.uid || 'admin',
        inspectorName: profile?.fullName || user?.email || 'Fleet Inspector',
        result: overallResult,
        checklist: checklistValues,
        notes,
      });

      await auditService.logEvent({
        actorUserId: user?.uid,
        actorName: profile?.fullName || user?.email,
        actorRole: role,
        action: 'INSPECTION_RECORDED',
        resourceType: 'vehicleInspection',
        resourceId: created.id || created.inspectionId,
        description: `Logged periodic safety inspection for bus ${selectedBusId}. Result: ${overallResult}.`,
        severity: overallResult === INSPECTION_RESULT.FAILED ? 'warning' : 'info',
        metadata: {
          result: overallResult,
          failedCount: failedItems.length,
        },
      });

      setIsModalOpen(false);
      setToastMessage({ type: 'success', text: `Inspection logged with result: ${overallResult}.` });
      fetchData();
    } catch (err) {
      setToastMessage({ type: 'error', text: err.message || 'Failed to submit inspection.' });
    }
  };

  const filteredInspections = inspections.filter((i) => {
    if (filterResult === 'all') return true;
    return i.result === filterResult;
  });

  return (
    <DashboardLayout>
      <FleetNavHeader 
        title="Vehicle Safety Inspections" 
        subtitle="Review pre-trip walkaround audits, periodic mechanical checklists, and safety defect logs."
      >
        <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsModalOpen(true)}>
          New Safety Inspection
        </Button>
      </FleetNavHeader>

      {toastMessage && (
        <div className={`p-4 mb-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-soft ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white border border-border rounded-2xl shadow-soft mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-brand-navy">Result Filter:</span>
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-brand-navy bg-white focus:outline-none focus:border-brand-teal"
          >
            <option value="all">All Results</option>
            <option value={INSPECTION_RESULT.PASSED}>Passed</option>
            <option value={INSPECTION_RESULT.PASSED_WITH_ISSUES}>Passed with Issues</option>
            <option value={INSPECTION_RESULT.FAILED}>Failed</option>
          </select>
        </div>

        <span className="text-xs text-brand-slate font-semibold">
          Showing <strong>{filteredInspections.length}</strong> of {inspections.length} inspection logs
        </span>
      </div>

      {/* Inspection List Table */}
      <div className="bg-white border border-border rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-brand-navy">No inspection records found</p>
            <p className="text-xs text-brand-slate mt-1 mb-4">Log safety inspections to verify vehicle operational roadworthiness.</p>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
              Perform Inspection
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Inspection Type</th>
                  <th className="py-3 px-4">Target Vehicle</th>
                  <th className="py-3 px-4">Inspector</th>
                  <th className="py-3 px-4">Inspection Date</th>
                  <th className="py-3 px-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInspections.map((insp) => {
                  const busObj = buses.find((b) => b.busId === insp.busId || b.id === insp.busId);

                  return (
                    <tr key={insp.id || insp.inspectionId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-brand-navy uppercase">
                        {insp.inspectionType || 'Pre-Trip'} Check
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-navy">
                        {busObj ? `Bus ${busObj.busNumber}` : insp.busId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {insp.inspectorName || 'Operator'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {insp.inspectionDate?.split('T')[0] || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={
                          insp.result === 'passed' ? 'success' :
                          insp.result === 'failed' ? 'danger' : 'warning'
                        }>
                          {insp.result}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Safety Inspection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Conduct Vehicle Safety Checklist"
      >
        <form onSubmit={handleSubmitInspection} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-navy block mb-1">Target Vehicle *</label>
            <select
              required
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
            >
              {buses.map((b) => (
                <option key={b.id || b.busId} value={b.busId || b.id}>
                  {b.busNumber} ({b.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <label className="font-bold text-brand-navy block mb-1">Safety Checklist Points</label>
            {STANDARD_INSPECTION_CHECKLIST.map((item) => {
              const currentVal = checklistValues[item.id] || 'pass';

              return (
                <div key={item.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="pr-2">
                    <span className="font-bold text-brand-navy block text-[11px]">
                      {item.label}
                      {item.critical && <span className="text-rose-600 ml-1 font-bold">*Critical</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleCheck(item.id, 'pass')}
                      className={`px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 ${
                        currentVal === 'pass' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Check className="w-3 h-3" /> Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleCheck(item.id, 'fail')}
                      className={`px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 ${
                        currentVal === 'fail' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <X className="w-3 h-3" /> Issue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="font-bold text-brand-navy block mb-1">Inspection Notes</label>
            <textarea
              rows={2}
              placeholder="Report specific findings or observations."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Inspection Log
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default FleetInspectionsPage;
