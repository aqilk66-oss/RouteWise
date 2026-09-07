import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Save, 
  Calendar, 
  Lock,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import SettingsLayout from '../../../components/settings/SettingsLayout';
import ProfilePhotoUploader from '../../../components/settings/ProfilePhotoUploader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuth } from '../../../context/AuthContext';

export const AdminProfilePage = () => {
  const { user, profile, updateProfileData } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || user?.displayName || '',
    phone: profile?.phone || '',
    photoURL: profile?.photoURL || null,
  });

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      if (updateProfileData) {
        await updateProfileData({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          photoURL: formData.photoURL,
        });
      }
      setToastMessage('Profile information saved successfully.');
      setHasChanges(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'We could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="Admin Profile & Identity"
      subtitle="Manage your administrative credentials, contact details, and display avatar."
      toastMessage={toastMessage}
      errorMessage={errorMessage}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 md:p-8 space-y-6">
          {/* Avatar Section */}
          <ProfilePhotoUploader
            currentPhotoURL={formData.photoURL}
            onPhotoChange={(url) => handleChange('photoURL', url)}
            label="Administrative Display Photo"
          />

          <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-brand-navy mb-1.5">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand-blue/30 outline-none pl-9 font-medium"
                  placeholder="e.g. Eleanor Vance"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label className="block text-xs font-bold text-brand-navy mb-1.5 flex items-center justify-between">
                <span>Account Email Address</span>
                <span className="text-[10px] text-brand-slate font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Managed via Auth
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || profile?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 pl-9 cursor-not-allowed font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-brand-navy mb-1.5">
                Direct Contact Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand-blue/30 outline-none pl-9 font-medium"
                  placeholder="+1 (555) 000-0000"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Role & Status (Non-Editable Metadata) */}
            <div>
              <label className="block text-xs font-bold text-brand-navy mb-1.5">
                Role & Privilege Level
              </label>
              <div className="flex items-center gap-3 pt-1">
                <Badge variant="active" size="md" className="capitalize font-bold">
                  {profile?.role || 'Administrator'}
                </Badge>
                <span className="text-xs text-brand-slate flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Full Operational Authority
                </span>
              </div>
            </div>
          </div>

          {/* Account Status / Metadata Callout */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-brand-navy font-semibold">
              <Calendar className="w-4 h-4 text-brand-blue" />
              <span>
                Account Active since{' '}
                <strong className="text-brand-slate">
                  {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                </strong>
              </span>
            </div>
            <div className="text-[11px] text-brand-slate">
              Email Verified:{' '}
              <strong className={user?.emailVerified ? 'text-emerald-600' : 'text-amber-600'}>
                {user?.emailVerified ? 'Verified' : 'Pending Verification'}
              </strong>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <p className="text-xs text-brand-slate">
              {hasChanges ? (
                <span className="text-amber-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All settings synchronized
                </span>
              )}
            </p>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              loading={saving}
              disabled={!hasChanges && !saving}
              className="bg-brand-navy hover:bg-slate-800 text-white font-bold px-6 shadow-soft"
            >
              Save Profile
            </Button>
          </div>
        </Card>
      </form>
    </SettingsLayout>
  );
};

export default AdminProfilePage;
