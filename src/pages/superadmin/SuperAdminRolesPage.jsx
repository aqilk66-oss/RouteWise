import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Check, 
  X as XIcon, 
  Info, 
  ShieldAlert,
  Users
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { ROLE_PERMISSIONS, PERMISSIONS } from '../../constants/permissions';
import { USER_ROLES, ROLE_LABELS } from '../../constants/collections';

const SuperAdminRolesPage = () => {
  const roles = [
    {
      id: USER_ROLES.SUPER_ADMIN,
      name: ROLE_LABELS[USER_ROLES.SUPER_ADMIN],
      tier: 'Tier 1 — Global Governance',
      description: 'Supreme governance access over system configuration, audit trails, user accounts, and all campus institutions.',
      scope: 'Global System-Wide',
      badgeColor: 'bg-slate-900 text-brand-teal'
    },
    {
      id: USER_ROLES.ADMIN,
      name: ROLE_LABELS[USER_ROLES.ADMIN],
      tier: 'Tier 2 — Operations Oversight',
      description: 'Full transport operational authority: manages drivers, buses, routes, schedules, stops, and safety alerts.',
      scope: 'District / Institutional',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: USER_ROLES.TRANSPORT_MANAGER,
      name: ROLE_LABELS[USER_ROLES.TRANSPORT_MANAGER],
      tier: 'Tier 3 — Fleet Logistics',
      description: 'Fleet and daily transport supervision: updates routes, monitors live tracking, and coordinates driver dispatches.',
      scope: 'Assigned Campus',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: USER_ROLES.DRIVER,
      name: ROLE_LABELS[USER_ROLES.DRIVER],
      tier: 'Tier 4 — Transport Operator',
      description: 'Executes assigned trips, transmits live vehicle telemetry, records boarding/drop-off attendance, and triggers emergency SOS.',
      scope: 'Assigned Bus & Route',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: USER_ROLES.PARENT,
      name: ROLE_LABELS[USER_ROLES.PARENT],
      tier: 'Tier 5 — Guardian Observer',
      description: 'Real-time visibility over enrolled children: live tracking, ETA alerts, attendance verification, and emergency notices.',
      scope: 'Enrolled Children Only',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: USER_ROLES.STUDENT,
      name: ROLE_LABELS[USER_ROLES.STUDENT],
      tier: 'Tier 5 — Passenger Observer',
      description: 'Personal transport dashboard: route schedule, designated bus stop, assigned bus tracking, and safety guidelines.',
      scope: 'Personal Journey Only',
      badgeColor: 'bg-slate-100 text-slate-800'
    }
  ];

  // Group permissions conceptually for clear display
  const permissionCategories = [
    {
      category: 'Governance & Security',
      permissions: [
        { key: PERMISSIONS.SYSTEM_MANAGE, label: 'Platform Configuration', desc: 'Modify global district parameters & maintenance mode' },
        { key: PERMISSIONS.SECURITY_MANAGE, label: 'Security & Access Control', desc: 'Manage role assignments & investigate threats' },
        { key: PERMISSIONS.AUDIT_READ, label: 'Immutable Audit Trail', desc: 'Read immutable ledger and forensic records' },
        { key: PERMISSIONS.SCHOOLS_MANAGE, label: 'School Districts', desc: 'Create, archive, and configure school campuses' },
      ]
    },
    {
      category: 'Identity & Access',
      permissions: [
        { key: PERMISSIONS.USERS_READ, label: 'Read User Directory', desc: 'View accounts, contact info, and clearance tiers' },
        { key: PERMISSIONS.USERS_MANAGE, label: 'Manage Accounts', desc: 'Activate, suspend, or update user records' },
        { key: PERMISSIONS.STUDENTS_READ, label: 'Read Student Records', desc: 'View student transport enrollments' },
        { key: PERMISSIONS.STUDENTS_MANAGE, label: 'Manage Students', desc: 'Enroll students, link parents, and assign stops' },
      ]
    },
    {
      category: 'Fleet & Operations',
      permissions: [
        { key: PERMISSIONS.DRIVERS_MANAGE, label: 'Fleet Drivers', desc: 'Onboard drivers and assign vehicle keys' },
        { key: PERMISSIONS.BUSES_MANAGE, label: 'Bus Assets', desc: 'Register buses, maintenance logs, and seating capacity' },
        { key: PERMISSIONS.ROUTES_MANAGE, label: 'Routes & Stops', desc: 'Design routes, coordinate geofences, and schedule stops' },
        { key: PERMISSIONS.TRIPS_MANAGE, label: 'Trip Operations', desc: 'Dispatch trips, update status, and manage journeys' },
      ]
    },
    {
      category: 'Safety, Tracking & Reports',
      permissions: [
        { key: PERMISSIONS.TRACKING_READ, label: 'Live Telemetry', desc: 'View real-time vehicle GPS coordinates on map' },
        { key: PERMISSIONS.ATTENDANCE_MANAGE, label: 'Attendance Check-in', desc: 'Record boarding and drop-off journey status' },
        { key: PERMISSIONS.SAFETY_MANAGE, label: 'Safety & SOS Incidents', desc: 'Broadcast emergency alerts and resolve incidents' },
        { key: PERMISSIONS.REPORTS_READ, label: 'Operational Analytics', desc: 'Export trip metrics, fuel costs, and attendance logs' },
      ]
    }
  ];

  return (
    <SuperAdminLayout title="Role Governance & Permissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              Role Governance & Permission Matrix
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
              Strict access control hierarchy. Permissions are enforced centrally across both client routes and backend rules.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5" />
            <span>Tamper-Resistant Role Model</span>
          </div>
        </div>

        {/* Roles Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 border border-border shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.badgeColor}`}>
                    {r.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{r.id}</span>
                </div>
                <h3 className="text-sm font-bold text-brand-navy mt-3">{r.tier}</h3>
                <p className="text-xs text-brand-slate mt-1.5 leading-relaxed">{r.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Access Scope:</span>
                <span className="font-bold text-brand-navy">{r.scope}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Permission Matrix Table */}
        <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-brand-navy">Centralized RouteWise Authorization Matrix</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Predefined capability mapping applied by authorization hooks and security services.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[220px]">Capability / Permission</th>
                  {roles.map(r => (
                    <th key={r.id} className="py-3 px-3 text-center min-w-[100px]">
                      <span className="block text-brand-navy font-bold">{r.name}</span>
                      <span className="text-[9px] text-slate-400 font-normal">{r.id}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {permissionCategories.map(cat => (
                  <React.Fragment key={cat.category}>
                    <tr className="bg-slate-100/60 font-bold text-slate-600 text-[11px]">
                      <td colSpan={roles.length + 1} className="py-2 px-4 uppercase tracking-wider">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.permissions.map(perm => (
                      <tr key={perm.key} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-brand-navy">{perm.label}</p>
                          <p className="text-[10px] text-slate-400">{perm.desc}</p>
                        </td>
                        {roles.map(r => {
                          const allowed = ROLE_PERMISSIONS[r.id]?.includes(perm.key);
                          return (
                            <td key={r.id} className="py-3 px-3 text-center">
                              {allowed ? (
                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-300">
                                  <XIcon className="w-3 h-3 stroke-[2]" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-blue shrink-0" />
            <span>
              Arbitrary frontend role escalation is disallowed. Roles and permissions are immutable constants enforced during session authentication and write transactions.
            </span>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminRolesPage;
