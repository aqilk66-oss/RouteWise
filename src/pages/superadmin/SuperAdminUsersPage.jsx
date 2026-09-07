import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  AlertOctagon, 
  ArrowUpDown,
  Mail,
  Calendar,
  Building2,
  X
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { adminUserService } from '../../services/admin/adminUserService';
import { schoolService } from '../../services/admin/schoolService';
import { auditService } from '../../services/admin/auditService';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES, ROLE_LABELS, USER_STATUS } from '../../constants/collections';
import Loader from '../../components/ui/Loader';

const SuperAdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Confirmation Modal state
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    user: null,
    action: null, // 'activate', 'suspend', 'deactivate'
    reason: '',
    processing: false
  });

  const loadData = async () => {
    try {
      const [fetchedUsers, fetchedSchools] = await Promise.all([
        adminUserService.getAllUsers(),
        schoolService.getAllSchools()
      ]);
      setUsers(fetchedUsers);
      setSchools(fetchedSchools);
    } catch (error) {
      console.error('Error fetching users and schools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChangeClick = (user, targetAction) => {
    setActionModal({
      isOpen: true,
      user,
      action: targetAction,
      reason: '',
      processing: false
    });
  };

  const confirmStatusChange = async () => {
    if (!actionModal.user || !actionModal.action) return;

    setActionModal(prev => ({ ...prev, processing: true }));
    try {
      const targetStatus = 
        actionModal.action === 'activate' ? USER_STATUS.ACTIVE :
        actionModal.action === 'suspend' ? USER_STATUS.SUSPENDED :
        USER_STATUS.INACTIVE;

      await adminUserService.setUserStatus(
        actionModal.user.id,
        targetStatus,
        currentUser?.uid,
        actionModal.reason || `Status updated to ${targetStatus} by Super Admin`
      );

      // Refresh list locally
      setUsers(prev => prev.map(u => 
        u.id === actionModal.user.id ? { ...u, status: targetStatus } : u
      ));

      setActionModal({ isOpen: false, user: null, action: null, reason: '', processing: false });
    } catch (error) {
      console.error('Failed to change user status:', error);
      alert('Error updating user status: ' + error.message);
      setActionModal(prev => ({ ...prev, processing: false }));
    }
  };

  // Filtering & Sorting
  const filteredUsers = users.filter(u => {
    const name = (u.fullName || u.displayName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || name.includes(query) || email.includes(query);

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || (u.status || 'active') === statusFilter;
    const matchesSchool = schoolFilter === 'ALL' || u.schoolId === schoolFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesSchool;
  }).sort((a, b) => {
    let valA = (a.fullName || a.displayName || a.email || '').toLowerCase();
    let valB = (b.fullName || b.displayName || b.email || '').toLowerCase();
    if (sortField === 'email') {
      valA = (a.email || '').toLowerCase();
      valB = (b.email || '').toLowerCase();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <SuperAdminLayout title="System User Directory">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              User Identity & Access Directory
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
              Inspect, suspend, activate, and manage clearance for all accounts across RouteWise.
            </p>
          </div>
          <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-border shadow-soft self-start sm:self-auto">
            Total Accounts: <span className="text-brand-navy font-black">{users.length}</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-border shadow-soft space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or email address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-44 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="ALL">All Roles</option>
              {Object.entries(ROLE_LABELS).map(([rKey, rLabel]) => (
                <option key={rKey} value={rKey}>{rLabel}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-36 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* School Filter */}
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full md:w-48 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="ALL">All Campuses</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name || s.schoolName || s.id}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader variant="inline" text="Loading registered accounts..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-navy">No accounts match your query</p>
              <p className="text-xs text-brand-slate mt-0.5">Try loosening your search query or reset the role and status filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role Classification</th>
                    <th className="py-3 px-4">Campus Association</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.map((u) => {
                    const status = u.status || 'active';
                    const isSuperAdminUser = u.role === USER_ROLES.SUPER_ADMIN;
                    const isSelf = u.id === currentUser?.uid;
                    const schoolName = schools.find(s => s.id === u.schoolId)?.name || 'Unassigned';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* User identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-brand-navy flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                              {(u.fullName || u.displayName || u.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-brand-navy truncate">
                                {u.fullName || u.displayName || 'Unnamed User'}
                              </p>
                              <p className="text-slate-400 text-[11px] truncate flex items-center gap-1">
                                <Mail className="w-3 h-3 inline" /> {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === USER_ROLES.SUPER_ADMIN ? 'bg-slate-900 text-brand-teal' :
                            u.role === USER_ROLES.ADMIN ? 'bg-blue-100 text-blue-800' :
                            u.role === USER_ROLES.TRANSPORT_MANAGER ? 'bg-indigo-100 text-indigo-800' :
                            u.role === USER_ROLES.DRIVER ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role === USER_ROLES.SUPER_ADMIN && <ShieldCheck className="w-3 h-3 inline" />}
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>

                        {/* Campus */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[140px]">{schoolName}</span>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'suspended' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              status === 'active' ? 'bg-emerald-500' :
                              status === 'suspended' ? 'bg-rose-500' :
                              'bg-slate-400'
                            }`} />
                            {status}
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-3 px-4 text-slate-500">
                          {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/super-admin/users/${u.id}`}
                              className="px-2.5 py-1 text-[11px] font-bold text-brand-navy hover:text-brand-blue bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              Dossier
                            </Link>

                            {!isSelf && !isSuperAdminUser && (
                              <>
                                {status !== 'suspended' ? (
                                  <button
                                    onClick={() => handleStatusChangeClick(u, 'suspend')}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Suspend User Account"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStatusChangeClick(u, 'activate')}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Reactivate User Account"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {actionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${
                    actionModal.action === 'suspend' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {actionModal.action === 'suspend' ? <AlertOctagon className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-navy">
                      {actionModal.action === 'suspend' ? 'Suspend User Account' : 'Reactivate Account'}
                    </h3>
                    <p className="text-xs text-brand-slate">Target: {actionModal.user?.fullName || actionModal.user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActionModal({ isOpen: false, user: null, action: null, reason: '', processing: false })}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {actionModal.action === 'suspend' 
                  ? 'Suspending this account will immediately revoke access to all transport portals and live sessions. An immutable audit record will be created.'
                  : 'Reactivating this account will restore access according to their assigned role and school permissions.'
                }
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Action (Recorded in Audit Log)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Seasonal leave, policy review, verification completed..."
                  value={actionModal.reason}
                  onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setActionModal({ isOpen: false, user: null, action: null, reason: '', processing: false })}
                  disabled={actionModal.processing}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={actionModal.processing}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-soft transition-colors ${
                    actionModal.action === 'suspend'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {actionModal.processing ? 'Processing...' : (actionModal.action === 'suspend' ? 'Confirm Suspension' : 'Confirm Reactivation')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminUsersPage;
