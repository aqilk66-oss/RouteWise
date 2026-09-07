import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Bus, 
  Wrench, 
  FileText, 
  ClipboardCheck 
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import FleetNavHeader from '../../../components/fleet/FleetNavHeader';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  busService, 
  maintenanceService, 
  inspectionService, 
  vehicleDocumentService, 
  defectService 
} from '../../../services/firestore';
import { evaluateBusReadiness } from '../../../services/fleet/busReadinessService';
import { DOCUMENT_STATUS } from '../../../constants/collections';

export const FleetCompliancePage = () => {
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [defects, setDefects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bList, iList, dList, defctList] = await Promise.all([
          busService.getAll({ max: 200 }),
          inspectionService.getAll({ max: 200 }),
          vehicleDocumentService.getAll({ max: 500 }),
          defectService.getAll({ max: 200 }),
        ]);
        setBuses(bList || []);
        setInspections(iList || []);
        setDocuments(dList || []);
        setDefects(defctList || []);
      } catch (err) {
        console.error('Failed to load fleet compliance audit:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <FleetNavHeader 
        title="Fleet Compliance & Safety Audit Matrix" 
        subtitle="Deterministic validation of vehicle readiness, valid documentation, and critical safety preconditions."
      />

      {/* Compliance Overview Notice */}
      <div className="p-5 bg-teal-50/70 border border-teal-200 rounded-3xl mb-6 text-xs text-brand-navy flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-brand-navy">Operational Compliance Integrity</h4>
          <p className="text-slate-600 leading-relaxed">
            This matrix deterministically audits every active vehicle against stored safety inspections, current defect reports, and expiration dates. A vehicle is flagged <strong className="text-emerald-700">Compliant</strong> only when zero critical defects exist, safety inspections are passed, and all mandatory documentation is current.
          </p>
        </div>
      </div>

      {/* Fleet Compliance Table */}
      <div className="bg-white border border-border rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Bus Identifier</th>
                  <th className="py-3.5 px-4">Operational Status</th>
                  <th className="py-3.5 px-4">Latest Inspection</th>
                  <th className="py-3.5 px-4">Document Expiration</th>
                  <th className="py-3.5 px-4">Critical Defects</th>
                  <th className="py-3.5 px-4 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {buses.map((bus) => {
                  const busDocs = documents.filter((d) => d.busId === bus.busId || d.busId === bus.id);
                  const busDefects = defects.filter((d) => d.busId === bus.busId || d.busId === bus.id);
                  const busInspections = inspections.filter((i) => i.busId === bus.busId || i.busId === bus.id);

                  const readiness = evaluateBusReadiness({
                    bus,
                    documents: busDocs,
                    defects: busDefects,
                    inspections: busInspections,
                  });

                  const hasExpiredDoc = busDocs.some((d) => d.status === DOCUMENT_STATUS.EXPIRED);
                  const hasCriticalDefect = busDefects.some((d) => d.severity === 'critical' && d.status !== 'resolved');
                  const latestInsp = busInspections[0];

                  return (
                    <tr key={bus.id || bus.busId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-navy">Bus {bus.busNumber}</div>
                        <span className="text-[11px] text-slate-500">{bus.registrationNumber}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={
                          bus.status === 'available' || bus.status === 'active' ? 'success' :
                          bus.status === 'maintenance' ? 'warning' : 'danger'
                        }>
                          {bus.status || 'available'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        {latestInsp ? (
                          <div className="flex items-center gap-1.5 font-semibold">
                            {latestInsp.result === 'passed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span className="capitalize">{latestInsp.result}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">No inspection</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {hasExpiredDoc ? (
                          <span className="text-rose-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Expired
                          </span>
                        ) : busDocs.length > 0 ? (
                          <span className="text-emerald-700 font-bold">Valid ({busDocs.length} on file)</span>
                        ) : (
                          <span className="text-slate-400">Pending upload</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {hasCriticalDefect ? (
                          <span className="text-rose-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Safety Stop
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">0 Critical</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          readiness.isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {readiness.isReady ? 'Compliant' : 'Attention Required'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FleetCompliancePage;
