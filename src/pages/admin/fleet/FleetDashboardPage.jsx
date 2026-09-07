import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bus, 
  Wrench, 
  ClipboardCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  PlusCircle, 
  ShieldAlert,
  Calendar
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
import { useAuth } from '../../../context/AuthContext';
import { BUS_STATUS, DOCUMENT_STATUS, USER_ROLES } from '../../../constants/collections';

export const FleetDashboardPage = () => {
  const { role } = useAuth();
  const isTransport = role === USER_ROLES.TRANSPORT_MANAGER;
  const basePrefix = isTransport ? '/transport/fleet' : '/admin/fleet';

  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [defects, setDefects] = useState([]);

  useEffect(() => {
    const fetchFleetData = async () => {
      setLoading(true);
      try {
        const [busList, mntList, inspList, docList, defectList] = await Promise.all([
          busService.getAll({ max: 200 }),
          maintenanceService.getAll({ max: 200 }),
          inspectionService.getAll({ max: 200 }),
          vehicleDocumentService.getAll({ max: 500 }),
          defectService.getAll({ max: 200 }),
        ]);

        setBuses(busList || []);
        setMaintenanceRecords(mntList || []);
        setInspections(inspList || []);
        setDocuments(docList || []);
        setDefects(defectList || []);
      } catch (err) {
        console.error('Failed to load fleet dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFleetData();
  }, []);

  // Compute fleet status breakdown
  const activeBuses = buses.filter((b) => b.status === BUS_STATUS.AVAILABLE || b.status === BUS_STATUS.ASSIGNED || b.status === BUS_STATUS.IN_SERVICE || b.status === 'active');
  const assignedBuses = buses.filter((b) => b.status === BUS_STATUS.ASSIGNED || b.assignedRouteId);
  const maintenanceBuses = buses.filter((b) => b.status === BUS_STATUS.MAINTENANCE || b.status === 'maintenance');
  const outOfServiceBuses = buses.filter((b) => b.status === BUS_STATUS.OUT_OF_SERVICE || b.status === BUS_STATUS.RETIRED || b.status === 'outOfService' || b.status === 'retired');

  // Open defects
  const openDefects = defects.filter((d) => d.status !== 'resolved');
  const criticalDefects = openDefects.filter((d) => d.severity === 'critical');

  // Expired / Expiring documents
  const expiredDocs = documents.filter((d) => d.status === DOCUMENT_STATUS.EXPIRED);
  const expiringDocs = documents.filter((d) => d.status === DOCUMENT_STATUS.EXPIRING_SOON);

  return (
    <DashboardLayout>
      <FleetNavHeader 
        title="Fleet Operations & Compliance Overview" 
        subtitle="Manage school bus inventory, maintenance schedules, vehicle inspections, and safety document compliance."
      >
        <Link to={`${basePrefix}/maintenance`}>
          <Button variant="primary" icon={Wrench} size="sm">
            Schedule Service
          </Button>
        </Link>
      </FleetNavHeader>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Fleet */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Fleet Inventory</span>
            <div className="p-2 bg-blue-50 text-brand-blue rounded-xl">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-navy">{buses.length}</span>
            <span className="text-xs text-brand-slate">Vehicles</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="text-emerald-600 font-bold">{activeBuses.length} Operational</span>
            <span className="text-amber-600 font-bold">{maintenanceBuses.length} In Shop</span>
            <span className="text-rose-600 font-bold">{outOfServiceBuses.length} Out</span>
          </div>
        </div>

        {/* Maintenance Backlog */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Maintenance Orders</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-navy">
              {maintenanceRecords.filter((m) => m.status !== 'completed').length}
            </span>
            <span className="text-xs text-brand-slate">Open Records</span>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-600">
            {maintenanceBuses.length} bus(es) under active servicing
          </div>
        </div>

        {/* Inspections Status */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Safety Inspections</span>
            <div className="p-2 bg-teal-50 text-brand-teal rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-navy">{inspections.length}</span>
            <span className="text-xs text-brand-slate">Logged</span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-600">
            {inspections.filter((i) => i.result === 'passed').length} passed checks
          </div>
        </div>

        {/* Compliance & Document Expiry */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Compliance Alerts</span>
            <div className={`p-2 rounded-xl ${expiredDocs.length > 0 || criticalDefects.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {expiredDocs.length > 0 || criticalDefects.length > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-navy">{expiredDocs.length + criticalDefects.length}</span>
            <span className="text-xs text-brand-slate">Action Items</span>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">
            {expiredDocs.length} expired docs, {criticalDefects.length} critical defects
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fleet Readiness & Vehicle Master List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-white border border-border rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy">Vehicle Fleet Operational Readiness</h3>
                <p className="text-xs text-brand-slate">Deterministic evaluation of maintenance, safety checks, and document validity.</p>
              </div>
              <Link to={`${basePrefix}/buses`}>
                <Button variant="outline" size="sm" icon={ArrowUpRight}>
                  View All Buses
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : buses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Bus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-brand-navy">No vehicles registered</p>
                <p className="text-xs text-brand-slate mt-1 mb-4">Register your school buses to begin tracking maintenance and compliance.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {buses.slice(0, 5).map((bus) => {
                  const busDocs = documents.filter((d) => d.busId === bus.busId || d.busId === bus.id);
                  const busDefects = defects.filter((d) => d.busId === bus.busId || d.busId === bus.id);
                  const busInspections = inspections.filter((i) => i.busId === bus.busId || i.busId === bus.id);

                  const readiness = evaluateBusReadiness({
                    bus,
                    documents: busDocs,
                    defects: busDefects,
                    inspections: busInspections,
                  });

                  return (
                    <div 
                      key={bus.id || bus.busId}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-brand-teal/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 hover:bg-white"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-teal-50 text-brand-teal font-black text-xs uppercase shrink-0">
                          {bus.busNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-brand-navy">{bus.model || 'Transit Coach'}</span>
                            <Badge variant={
                              bus.status === BUS_STATUS.AVAILABLE ? 'success' :
                              bus.status === BUS_STATUS.MAINTENANCE ? 'warning' :
                              bus.status === BUS_STATUS.OUT_OF_SERVICE ? 'danger' : 'neutral'
                            }>
                              {bus.status || 'available'}
                            </Badge>
                          </div>
                          <div className="text-xs text-brand-slate mt-1 flex flex-wrap items-center gap-3">
                            <span>Plate: <strong className="text-slate-700">{bus.registrationNumber || 'Pending'}</strong></span>
                            <span>•</span>
                            <span>Capacity: <strong className="text-slate-700">{bus.capacity || 30} seats</strong></span>
                            <span>•</span>
                            <span>Year: <strong className="text-slate-700">{bus.year || '2024'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          readiness.isReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {readiness.statusText}
                        </span>
                        <Link to={`${basePrefix}/buses/${bus.id || bus.busId}`}>
                          <Button variant="ghost" size="sm">
                            Inspect
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actionable Fleet Warnings Panel */}
          {(criticalDefects.length > 0 || expiredDocs.length > 0 || expiringDocs.length > 0) && (
            <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-3xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-900">Fleet Attention & Compliance Directives</h3>
              </div>
              <div className="space-y-2">
                {criticalDefects.map((d, idx) => (
                  <div key={idx} className="p-3 bg-white/90 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                    <span className="font-bold uppercase px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px]">
                      Critical Defect
                    </span>
                    <span>Bus <strong>{d.busId}</strong>: {d.description}</span>
                  </div>
                ))}
                {expiredDocs.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-white/90 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                    <span className="font-bold uppercase px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">
                      Expired Document
                    </span>
                    <span>Bus <strong>{doc.busId}</strong>: {doc.documentType} ({doc.documentNumber || 'No #'}) expired on {doc.expiresAt}.</span>
                  </div>
                ))}
                {expiringDocs.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-white/90 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <span className="font-bold uppercase px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px]">
                      Expiring Soon
                    </span>
                    <span>Bus <strong>{doc.busId}</strong>: {doc.documentType} expires on {doc.expiresAt}.</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Quick Modules & Policy Notice */}
        <div className="space-y-4">
          <div className="p-6 bg-white border border-border rounded-3xl shadow-soft">
            <h3 className="text-base font-bold text-brand-navy mb-1">Fleet Quick Launch</h3>
            <p className="text-xs text-brand-slate mb-4">Direct shortcuts to critical maintenance modules.</p>

            <div className="space-y-2.5">
              <Link 
                to={`${basePrefix}/maintenance`}
                className="p-3 rounded-2xl border border-slate-200 hover:border-brand-teal/50 hover:bg-slate-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-navy block">Maintenance Scheduling</span>
                    <span className="text-[11px] text-brand-slate">Work orders & service bookings</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-teal transition-colors" />
              </Link>

              <Link 
                to={`${basePrefix}/inspections`}
                className="p-3 rounded-2xl border border-slate-200 hover:border-brand-teal/50 hover:bg-slate-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 text-brand-teal rounded-xl">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-navy block">Inspection Checklists</span>
                    <span className="text-[11px] text-brand-slate">Pre-trip audits & periodic checks</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-teal transition-colors" />
              </Link>

              <Link 
                to={`${basePrefix}/documents`}
                className="p-3 rounded-2xl border border-slate-200 hover:border-brand-teal/50 hover:bg-slate-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-brand-blue rounded-xl">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-navy block">Document Expiry Audit</span>
                    <span className="text-[11px] text-brand-slate">Registration & insurance tracking</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue transition-colors" />
              </Link>
            </div>
          </div>

          {/* Compliance Disclaimer Notice */}
          <div className="p-6 bg-slate-100/80 border border-slate-200 rounded-3xl text-xs text-brand-slate space-y-2">
            <span className="font-bold text-brand-navy block">Operational Readiness Standard</span>
            <p className="leading-relaxed">
              RouteWise evaluates operational suitability based on stored inspection records, mechanical status, and document expiration dates. Operational readiness does not replace external statutory roadworthiness inspections by certified motor vehicle transport authorities.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FleetDashboardPage;
