import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  CheckCircle2, 
  Archive, 
  Edit3, 
  X,
  AlertCircle,
  Globe
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { schoolService } from '../../services/admin/schoolService';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/ui/Loader';

const SuperAdminSchoolsPage = () => {
  const { user: currentUser } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    contactEmail: '',
    contactPhone: '',
    principalName: '',
    timezone: 'America/New_York'
  });
  const [saving, setSaving] = useState(false);

  const fetchSchools = async () => {
    try {
      const data = await schoolService.getAllSchools();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleOpenCreate = () => {
    setEditingSchool(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      contactEmail: '',
      contactPhone: '',
      principalName: '',
      timezone: 'America/New_York'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name || school.schoolName || '',
      code: school.code || '',
      address: school.address || '',
      city: school.city || '',
      contactEmail: school.contactEmail || '',
      contactPhone: school.contactPhone || '',
      principalName: school.principalName || '',
      timezone: school.timezone || 'America/New_York'
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('School campus name is required.');

    setSaving(true);
    try {
      if (editingSchool) {
        await schoolService.updateSchool(editingSchool.id, formData, currentUser?.uid);
      } else {
        await schoolService.createSchool(formData, currentUser?.uid);
      }
      setModalOpen(false);
      fetchSchools();
    } catch (error) {
      console.error('Failed to save school campus:', error);
      alert('Error saving school: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (school) => {
    const newStatus = (school.status === 'active' || !school.status) ? 'inactive' : 'active';
    const confirmMsg = newStatus === 'inactive'
      ? `Archive "${school.name || school.schoolName}"? Operational history will remain intact, but new trip scheduling will be disabled.`
      : `Reactivate "${school.name || school.schoolName}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await schoolService.setSchoolStatus(school.id, newStatus, currentUser?.uid);
      fetchSchools();
    } catch (error) {
      console.error('Error toggling school status:', error);
      alert('Error changing status: ' + error.message);
    }
  };

  // Filter schools
  const filteredSchools = schools.filter(s => {
    const name = (s.name || s.schoolName || '').toLowerCase();
    const code = (s.code || '').toLowerCase();
    const city = (s.city || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || name.includes(query) || code.includes(query) || city.includes(query);
    const matchesStatus = statusFilter === 'ALL' || (s.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SuperAdminLayout title="School Campuses & Districts">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              School Campuses & Institutional Scoping
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
              Manage participating educational institutions, campus boundaries, and institutional contact profiles.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-brand-teal hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Campus</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-border shadow-soft flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campuses by name, code, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Archived / Inactive</option>
          </select>
        </div>

        {/* Schools Cards Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader variant="inline" text="Retrieving campus records..." />
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-soft space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-brand-navy">No School Campuses Found</h3>
            <p className="text-xs text-brand-slate max-w-md mx-auto">
              {schools.length === 0 
                ? 'Get started by creating your first school campus to scope transport routes and student rosters.'
                : 'No campuses match your current search and filter settings.'}
            </p>
            {schools.length === 0 && (
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-brand-teal text-white rounded-xl text-xs font-bold shadow-soft"
              >
                Register First Campus
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchools.map((school) => {
              const isActive = school.status !== 'inactive' && school.status !== 'archived';
              return (
                <div 
                  key={school.id} 
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-soft flex flex-col justify-between ${
                    isActive ? 'border-border hover:border-brand-teal/50' : 'border-slate-200 bg-slate-50/50 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isActive ? 'Active Campus' : 'Archived'}
                      </span>
                      {school.code && (
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {school.code}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-brand-navy mt-3 line-clamp-1">
                      {school.name || school.schoolName || 'Unnamed Campus'}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      {(school.address || school.city) && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{school.address ? `${school.address}, ` : ''}{school.city}</span>
                        </p>
                      )}
                      {school.contactEmail && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{school.contactEmail}</span>
                        </p>
                      )}
                      {school.contactPhone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{school.contactPhone}</span>
                        </p>
                      )}
                      {school.principalName && (
                        <p className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Lead: {school.principalName}</span>
                        </p>
                      )}
                      {school.timezone && (
                        <p className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <Globe className="w-3 h-3 shrink-0" />
                          <span>{school.timezone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleStatus(school)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                        isActive 
                          ? 'text-rose-600 hover:bg-rose-50' 
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {isActive ? 'Archive Campus' : 'Restore Campus'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(school)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-brand-navy rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Campus Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-50 text-brand-teal">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-navy">
                      {editingSchool ? 'Edit Campus Profile' : 'Register New Campus'}
                    </h3>
                    <p className="text-xs text-brand-slate">Institutional scoping parameters</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campus / Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Oakridge Elementary Campus"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Campus Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., OAK-01"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                    >
                      <option value="America/New_York">Eastern (ET)</option>
                      <option value="America/Chicago">Central (CT)</option>
                      <option value="America/Denver">Mountain (MT)</option>
                      <option value="America/Los_Angeles">Pacific (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Karachi">Pakistan (PKT)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 104 Campus Blvd"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Springfield"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="transport@campus.edu"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Principal / Transport Liaison Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Eleanor Vance"
                    value={formData.principalName}
                    onChange={(e) => setFormData(prev => ({ ...prev, principalName: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={saving}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-brand-teal hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-soft transition-colors"
                  >
                    {saving ? 'Saving...' : (editingSchool ? 'Save Changes' : 'Register Campus')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminSchoolsPage;
