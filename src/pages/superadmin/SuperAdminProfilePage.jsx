import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Building2, 
  Key, 
  Phone
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/collections';

const SuperAdminProfilePage = () => {
  const { user, profile, role, updateProfileData } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      if (updateProfileData) {
        await updateProfileData({
          fullName,
          phone: phoneNumber
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update Super Admin profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout title="Executive Administrator Profile">
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
            Executive Profile & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
            Manage your personal administrator identity and contact details.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-soft space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-navy to-brand-teal text-white flex items-center justify-center font-black text-2xl shadow-soft">
              {(fullName || user?.email || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-navy">{fullName || 'Super Administrator'}</h2>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Tier 1 — {ROLE_LABELS[role] || 'Super Admin'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Official Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Managed via Firebase Auth)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Direct Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Profile Updated
                </span>
              ) : <div />}

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-brand-navy hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminProfilePage;
