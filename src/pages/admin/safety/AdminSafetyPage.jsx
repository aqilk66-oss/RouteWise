import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Phone, 
  FileText, 
  Clock, 
  Search, 
  ArrowRight, 
  RefreshCw,
  Radio,
  CheckCircle2,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import MetricCard from '../../../components/ui/MetricCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import incidentService from '../../../services/safety/incidentService';
import { 
  INCIDENT_SEVERITY, 
  INCIDENT_SEVERITY_LABELS, 
  INCIDENT_STATUS, 
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
  EMERGENCY_DISCLAIMER 
} from '../../../constants/incidentConstants';

export const AdminSafetyPage = () => {
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contacts, setContacts] = useState([]);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [allIncidents, ecList] = await Promise.all([
        incidentService.getIncidents({ limitCount: 50 }),
        incidentService.getEmergencyContacts(),
      ]);

      const activeOnly = allIncidents.filter(
        i => i.status !== INCIDENT_STATUS.RESOLVED && i.status !== INCIDENT_STATUS.CLOSED && i.status !== INCIDENT_STATUS.CANCELLED
      );
      setActiveIncidents(activeOnly);
      setContacts(ecList);
    } catch (e) {
      console.warn('Safety dashboard data notice:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time active incidents
    const unsubscribe = incidentService.subscribeActiveIncidents((items) => {
      setActiveIncidents(items);
    });

    return () => unsubscribe();
  }, []);

  const criticalCount = activeIncidents.filter(i => i.severity === INCIDENT_SEVERITY.CRITICAL).length;
  const highCount = activeIncidents.filter(i => i.severity === INCIDENT_SEVERITY.HIGH).length;

  return (
    <DashboardLayout title="Safety & Emergency Response Center">
      <div className="space-y-6">
        {/* Header Block */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                Operations Security
              </span>
              {criticalCount > 0 && (
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                  {criticalCount} Critical Alert(s) Active
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-brand-navy tracking-tight mt-1">
              Transport Safety Command
            </h1>
            <p className="text-xs text-brand-slate mt-0.5">
              Live fleet incident triage, driver SOS dispatches, and emergency response management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => loadData(true)}
              loading={refreshing}
            >
              Sync Safety State
            </Button>
            <Link to="/admin/incidents">
              <Button variant="primary" size="sm" icon={FileText} className="bg-brand-navy hover:bg-slate-800 text-white font-bold">
                View All Incidents
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Safety Incidents"
            value={activeIncidents.length}
            subtitle={activeIncidents.length === 0 ? 'Fleet operating safely' : 'Requiring review'}
            icon={ShieldAlert}
            status={activeIncidents.length > 0 ? 'warning' : 'healthy'}
          />
          <MetricCard
            title="Critical Distress Alerts"
            value={criticalCount}
            subtitle={criticalCount > 0 ? 'Urgent driver SOS active' : 'No SOS signals'}
            icon={AlertTriangle}
            status={criticalCount > 0 ? 'critical' : 'healthy'}
          />
          <MetricCard
            title="High Severity Events"
            value={highCount}
            subtitle="Collisions or vehicle faults"
            icon={Radio}
            status={highCount > 0 ? 'warning' : 'healthy'}
          />
          <MetricCard
            title="Emergency Hotlines"
            value={contacts.length}
            subtitle="Configured responders"
            icon={Phone}
            status="healthy"
          />
        </div>

        {/* Critical Distress Alert Banner (if any) */}
        {criticalCount > 0 && (
          <div className="p-5 rounded-3xl bg-rose-900 text-white border-2 border-rose-500 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6 text-rose-300 animate-pulse" />
                <h2 className="text-base font-black uppercase tracking-wide">
                  Immediate Priority: Driver SOS In Progress
                </h2>
              </div>
              <Badge variant="danger" size="md">URGENT ACTION</Badge>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed">
              One or more bus drivers have triggered emergency distress broadcasts. Review location and vehicle details immediately.
            </p>
          </div>
        )}

        {/* Active Incidents Table / Cards */}
        <Card className="p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-blue" />
              <h2 className="text-sm font-bold text-brand-navy">Active Fleet Safety Incidents</h2>
            </div>
            <Badge variant={activeIncidents.length > 0 ? 'warning' : 'neutral'} size="sm">
              {activeIncidents.length} Under Review
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : activeIncidents.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-slate space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm text-brand-navy">All Transit Corridors Safe</p>
              <p className="text-[11px] max-w-sm mx-auto">
                No active safety incidents, collisions, or SOS distress calls are currently reported across the district.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    inc.severity === INCIDENT_SEVERITY.CRITICAL 
                      ? 'bg-rose-50/70 border-rose-300' 
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-brand-navy">{inc.incidentId || inc.id}</span>
                      <Badge variant={inc.severity === INCIDENT_SEVERITY.CRITICAL ? 'danger' : 'warning'} size="sm">
                        {INCIDENT_SEVERITY_LABELS[inc.severity] || inc.severity}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {INCIDENT_STATUS_LABELS[inc.status] || inc.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-brand-navy">{INCIDENT_TYPE_LABELS[inc.type] || inc.type}</p>
                    <p className="text-[11px] text-brand-slate line-clamp-1">{inc.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right text-[11px] text-slate-400">
                      <p>Bus: <strong className="text-brand-navy">{inc.busNumber}</strong></p>
                      <p>Driver: <strong className="text-brand-navy">{inc.driverName}</strong></p>
                    </div>

                    <Link to={`/admin/incidents/${inc.id}`}>
                      <Button variant="primary" size="sm" className="bg-brand-navy text-white text-xs font-bold">
                        Triage Incident
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Emergency Contacts & Disclaimer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <Card className="lg:col-span-8 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-teal" />
                <h3 className="text-sm font-bold text-brand-navy">Emergency Responders Directory</h3>
              </div>
              <Link to="/admin/emergency-contacts" className="text-xs font-bold text-brand-blue hover:underline">
                Manage Contacts
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contacts.slice(0, 4).map(c => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-brand-navy block">{c.name}</span>
                    <span className="text-[11px] text-brand-slate">{c.role}</span>
                  </div>
                  <a href={`tel:${c.phone}`} className="font-mono font-bold text-brand-blue hover:underline">
                    {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </Card>

          <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 text-white space-y-3 text-xs leading-relaxed border border-slate-800">
            <div className="flex items-center gap-2 text-brand-teal font-bold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety Governance</span>
            </div>
            <p className="text-slate-300">
              {EMERGENCY_DISCLAIMER}
            </p>
            <p className="text-[11px] text-slate-400">
              Incidents are securely recorded with server timestamps and audit logs to support institutional reviews.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSafetyPage;
