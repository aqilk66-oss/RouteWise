import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  UserX,
  UserCheck
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { adminUserService } from '../../services/admin/adminUserService';
import { schoolService } from '../../services/admin/schoolService';
import { auditService } from '../../services/admin/auditService';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, USER_ROLES, USER_STATUS } from '../../constants/collections';
import Loader from '../../components/ui/Loader';

const SuperAdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [targetUser, setTargetUser] = useState(null);
  const [schools, setSchools] = useState([]);
  const [userAudits, setUserAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [updatingSchool, setUpdatingSchool] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);

  useEffect(() => {
    const fetchUserDossier = async () => {
      try {
        const [userData, schoolList, audits] = await Promise.all([
          adminUserService.getUserById(userId),
          schoolService.getAllSchools(),
          auditService.getAuditLogs({ resourceId: userId, pageSize: 10 })
        ]);

        setTargetUser(userData);
        setSchools(schoolList);
        setUserAudits(audits);
        setSelectedSchoolId(userData?.schoolId || '');
      } catch (error) {
        console.error('Error fetching user dossier:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDossier();
    }
  }, [userId]);

  const handleSchoolAssignment = async () => {
    if (!targetUser) return;
    setUpdatingSchool(true);
    try {
      await adminUserService.updateUserSchool(
        targetUser.id,
        selectedSchoolId || null,
        currentUser?.uid
      );
      setTargetUser(prev => ({ ...prev, schoolId: selectedSchoolId || null }));
      alert('Institutional school association updated.');
    } catch (error) {
      console.error('Failed to assign school:', error);
      alert('Failed to update school: ' + error.message);
    } finally {
      setUpdatingSchool(false);
    }
  };

  const handleToggleStatus = async (newStatus) => {
    if (!targetUser) return;
    setActionProcessing(true);
    try {
      await adminUserService.setUserStatus(
        targetUser.id,
        newStatus,
        currentUser?.uid,
        `Status toggled to ${newStatus} from User Dossier page.`
      );
      setTargetUser(prev => ({ ...prev, status: newStatus }));
      
      // Refresh user audits
      const refreshedAudits = await auditService.getAuditLogs({ resourceId: userId, pageSize: 10 });
      setUserAudits(refreshedAudits);
    } catch (error) {
      console.error('Error modifying user status:', error);
      alert('Error updating status: ' + error.message);
    } finally {
      setActionProcessing(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout title="User Account Dossier">
        <div className="py-20 flex justify-center">
          <Loader variant="inline" text="Retrieving identity metadata..." />
        </div>
      </SuperAdminLayout>
    );
  }

  if (!targetUser) {
    return (
      <SuperAdminLayout title="User Account Dossier">
        <div className="bg-white rounded-3xl p-12 text-center border border-border shadow-soft max-w-lg mx-auto space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-brand-navy">User Record Not Located</h2>
          <p className="text-xs text-brand-slate">
            The requested user ID does not exist in the RouteWise authentication or Firestore records.
          </p>
          <Link
            to="/super-admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-xs font-bold rounded-xl shadow-soft"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>
      </SuperAdminLayout>
    );
  }

  const status = targetUser.status || 'active';
  const isSelf = targetUser.id === currentUser?.uid;
  const isSuperAdmin = targetUser.role === USER_ROLES.SUPER_ADMIN;
  const currentSchool = schools.find(s => s.id === targetUser.schoolId);

  return (
    <SuperAdminLayout title={`User Dossier: ${targetUser.fullName || targetUser.displayName || targetUser.email}`}>
      <div className="space-y-6 max-w-5xl">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/super-admin/users"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to User Directory
          </Link>
          <span className="text-xs text-slate-400 font-mono">UID: {targetUser.id}</span>
        </div>

        {/* Identity Overview Hero */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-border shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-navy to-brand-blue text-white flex items-center justify-center font-black text-2xl shadow-soft">
              {(targetUser.fullName || targetUser.displayName || targetUser.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-brand-navy">
                  {targetUser.fullName || targetUser.displayName || 'Unnamed User'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                  status === 'suspended' ? 'bg-rose-100 text-rose-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 inline" /> {targetUser.email}
              </p>
            </div>
          </div>

          {!isSelf && !isSuperAdmin && (
            <div className="flex items-center gap-3">
              {status !== 'suspended' ? (
                <button
                  onClick={() => handleToggleStatus(USER_STATUS.SUSPENDED)}
                  disabled={actionProcessing}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-200 transition-colors"
                >
                  <UserX className="w-4 h-4" /> Suspend Account
                </button>
              ) : (
                <button
                  onClick={() => handleToggleStatus(USER_STATUS.ACTIVE)}
                  disabled={actionProcessing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-soft transition-colors"
                >
                  <UserCheck className="w-4 h-4" /> Reactivate Account
                </button>
              )}
            </div>
          )}
        </div>

        {/* Two-Column Grid: Account Metadata & Campus Scoping */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Account Classification */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-blue" />
              Role & Clearance Classification
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Assigned Role</span>
                <span className="font-bold text-brand-navy">{ROLE_LABELS[targetUser.role] || targetUser.role}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Clearance Tier</span>
                <span className="font-bold text-brand-blue">
                  {targetUser.role === USER_ROLES.SUPER_ADMIN ? 'Tier 1 — Global Governance' :
                   targetUser.role === USER_ROLES.ADMIN ? 'Tier 2 — Operations Management' :
                   targetUser.role === USER_ROLES.TRANSPORT_MANAGER ? 'Tier 3 — Fleet Oversight' :
                   'Tier 4 — Standard Access'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Registration Date</span>
                <span className="text-slate-700 font-medium">
                  {targetUser.createdAt?.toDate ? targetUser.createdAt.toDate().toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Last Profile Sync</span>
                <span className="text-slate-700 font-medium">
                  {targetUser.updatedAt?.toDate ? targetUser.updatedAt.toDate().toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Campus / School Scoping */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-teal" />
              Institutional Campus Association
            </h3>

            <p className="text-xs text-brand-slate leading-relaxed">
              Scope this user to a specific school campus or district. Transport managers, drivers, and parents will only receive notifications and trip access within their assigned campus.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
              >
                <option value="">-- No Campus Assigned (Global Scope) --</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.schoolName || s.id}</option>
                ))}
              </select>

              <button
                onClick={handleSchoolAssignment}
                disabled={updatingSchool}
                className="px-4 py-2 bg-brand-teal hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-colors shadow-soft disabled:opacity-50"
              >
                {updatingSchool ? 'Saving...' : 'Assign'}
              </button>
            </div>

            {currentSchool && (
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-[11px] text-teal-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
                <span>Currently associated with <strong>{currentSchool.name || currentSchool.schoolName}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Audit History Related to this User */}
        <div className="bg-white rounded-2xl p-6 border border-border shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-blue" />
                Audit Trail for User ID: {targetUser.id}
              </h3>
              <p className="text-xs text-brand-slate mt-0.5">Recorded administrative and state-changing events targeting this user</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Immutable Records
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {userAudits.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-brand-slate font-medium">No dedicated audit events for this user yet.</p>
              </div>
            ) : (
              userAudits.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium mt-1">
                      {log.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase shrink-0">
                    Actor: {log.actorRole || 'System'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminUserDetailPage;
