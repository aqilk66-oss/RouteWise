import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Key, 
  Users, 
  ShieldCheck, 
  Activity,
  ArrowUpRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { auditService } from '../../services/admin/auditService';
import { adminUserService } from '../../services/admin/adminUserService';
import { USER_ROLES } from '../../constants/collections';
import Loader from '../../components/ui/Loader';

const SuperAdminSecurityPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [suspendedCount, setSuspendedCount] = useState(0);
  const [superAdminCount, setSuperAdminCount] = useState(0);

  const fetchSecurityData = async () => {
    try {
      // Fetch high severity or security-related audit logs
      const [allAudits, allUsers] = await Promise.all([
        auditService.getAuditLogs({ pageSize: 50 }),
        adminUserService.getAllUsers()
      ]);

      const secAudits = allAudits.filter(l => 
        l.resourceType === 'security' || 
        l.severity === 'critical' || 
        l.severity === 'warning' ||
        l.action.includes('SUSPEND') ||
        l.action.includes('ROLE_CHANGED') ||
        l.action.includes('UNAUTHORIZED')
      );

      const suspended = allUsers.filter(u => u.status === 'suspended').length;
      const superAdmins = allUsers.filter(u => u.role === USER_ROLES.SUPER_ADMIN).length;

      setSecurityEvents(secAudits);
      setSuspendedCount(suspended);
      setSuperAdminCount(superAdmins);
    } catch (error) {
      console.error('Error fetching security telemetry:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
  };

  return (
    <SuperAdminLayout title="Security & Threat Center">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-brand-teal text-[10px] font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" /> Perimeter Telemetry & Access Monitoring
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              Platform Security & Threat Center
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
              Monitor privilege escalations, unauthorized route requests, and account suspension events.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-brand-navy rounded-xl text-xs font-bold border border-border shadow-soft flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Security Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-border shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-brand-slate tracking-wider">Super Admins</span>
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-brand-teal flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-brand-navy mt-3">{superAdminCount}</p>
            <p className="text-[11px] text-brand-slate mt-1">Tier 1 governance holders</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-border shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-brand-slate tracking-wider">Suspended Accounts</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-brand-navy mt-3">{suspendedCount}</p>
            <p className="text-[11px] text-brand-slate mt-1">Access revoked by administrator</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-border shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-brand-slate tracking-wider">Security Incidents</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-brand-navy mt-3">{securityEvents.length}</p>
            <p className="text-[11px] text-brand-slate mt-1">Flagged audit events on record</p>
          </div>
        </div>

        {/* Security Policy Standards */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-teal text-slate-950">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Active Defense & Role Guard Architecture</h3>
              <p className="text-xs text-slate-400">RouteWise security policies active on this production build</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs font-bold text-brand-teal">Centralized SuperAdminRoute</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Direct URL attempts to /super-admin by non-superAdmin roles are terminated at the router level and routed to /unauthorized.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs font-bold text-brand-teal">Immutable Audit Ledger</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                No update or delete endpoints exist in auditService. All administrative modifications are append-only.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs font-bold text-brand-teal">Zero Registration Privilege Escalation</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Super Admin role is excluded from public registration and profile edits. Privileged tier is strictly governed.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Security Audit Events */}
        <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Security-Relevant Audit Events</h3>
              <p className="text-xs text-brand-slate mt-0.5">Automated logging of high-risk or administrative state transitions</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              High Severity Only
            </span>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader variant="inline" text="Gathering security events..." />
            </div>
          ) : securityEvents.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-navy">No Security Alerts Detected</p>
              <p className="text-xs text-brand-slate mt-0.5">System access controls are operating normally.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {securityEvents.map((evt) => (
                <div key={evt.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {evt.action}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {evt.timestamp?.toDate ? evt.timestamp.toDate().toLocaleString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-slate-800 font-semibold">{evt.description}</p>
                    <p className="text-[11px] text-slate-500">
                      Actor: {evt.actorRole || 'Unknown'} (UID: {evt.actorUserId || 'N/A'}) • Target: {evt.resourceType} ({evt.resourceId || 'N/A'})
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    ID: {evt.id.slice(0, 8)}...
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stage 27 Compliance Readiness & Security Posture Checklist */}
        <div className="bg-white rounded-2xl border border-border shadow-soft p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-brand-navy">Compliance Readiness & Privacy Posture</h3>
              <p className="text-xs text-brand-slate mt-0.5">
                Evaluated against enterprise student transportation data governance standards. Statuses are empirical and reflect technical controls, not legal guarantees.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-teal bg-brand-teal/10 px-3 py-1 rounded-full border border-brand-teal/20 self-start sm:self-auto">
              Stage 27 Baseline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                category: 'Authentication & Role Escalation',
                status: 'Implemented',
                statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                detail: 'SuperAdminRoute and RoleRoute verify identity; self-assignment of privileged roles is rejected by Firestore rules.',
              },
              {
                category: 'Data Minimization & Telematics',
                status: 'Implemented',
                statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                detail: 'GPS telematics collected strictly during active trips. Background tracking terminates on trip end and session logout.',
              },
              {
                category: 'Immutable Audit Trail',
                status: 'Implemented',
                statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                detail: 'Audit logs collection prohibits update and delete operations in rules. All security state transitions are append-only.',
              },
              {
                category: 'Content Security Policy & Headers',
                status: 'Implemented',
                statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                detail: 'CSP restricts scripts, styles, and fonts to verified CDNs and Firebase endpoints; frame-ancestors denied to prevent clickjacking.',
              },
              {
                category: 'Multi-School District Scoping',
                status: 'Needs Configuration',
                statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
                detail: 'Database schema supports schoolId association. Institutional isolation rules active for student and staff records.',
              },
              {
                category: 'District Data Protection Agreements (DPA)',
                status: 'Needs Legal Review',
                statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
                detail: 'Formal student privacy agreements (e.g. FERPA / COPPA school contract riders) require external institutional legal review.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-navy">{item.category}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminSecurityPage;
