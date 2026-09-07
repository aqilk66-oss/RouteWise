import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Save, 
  CheckCircle, 
  Lock,
  Baby
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useParentTransport } from '../../context/ParentTransportContext';
import { parentService } from '../../services/firestore';

import ProfilePhotoUploader from '../../components/settings/ProfilePhotoUploader';

export const ParentProfilePage = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { childrenList } = useParentTransport();

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || user?.displayName || '',
    phone: profile?.phone || '',
    emergencyContact: profile?.emergencyContact || '',
    photoURL: profile?.photoURL || null,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (updateProfileData) {
        await updateProfileData({
          fullName: formData.fullName,
          phone: formData.phone,
          emergencyContact: formData.emergencyContact,
          photoURL: formData.photoURL,
        });
      }
      setToastMessage('Guardian profile updated successfully.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Guardian Profile & Emergency Contacts">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Authorized Guardian Account</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Contact credentials used by school transportation dispatch for arrival notifications and emergency alerts.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSaveProfile}
            loading={saving}
          >
            Save Profile
          </Button>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Account Details */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <User className="w-4 h-4 text-brand-blue" />
              Primary Contact Details
            </h3>

            <ProfilePhotoUploader
              currentPhotoURL={formData.photoURL}
              onPhotoChange={(url) => setFormData((prev) => ({ ...prev, photoURL: url }))}
              label="Guardian Photo"
            />

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Primary Email (Account ID)</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-border text-brand-slate font-medium">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user?.email || 'parent@routewise.app'}</span>
                <span className="ml-auto text-[10px] text-slate-400 italic">Auth Verified</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Mobile Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Emergency Secondary Contact</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Alternate guardian or relative phone"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>
          </Card>

          {/* Linked Children & Security */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <Baby className="w-4 h-4 text-brand-teal" />
                Linked Student Dependents
              </h3>
              <p className="text-[11px] text-brand-slate">
                These students are authorized on your account for bus boarding manifests.
              </p>
              <div className="space-y-2">
                {childrenList.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-border flex items-center justify-between">
                    <div>
                      <p className="font-bold text-brand-navy">{c.fullName || `${c.firstName} ${c.lastName}`}</p>
                      <p className="text-[11px] text-brand-slate">Grade: {c.grade || 'Primary'}</p>
                    </div>
                    <Badge variant="active" size="sm">Active Pass</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-blue" />
                Security & Account Role
              </h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-border text-xs">
                <span className="font-semibold text-brand-navy">Authorized Role:</span>
                <Badge variant="info">Parent / Guardian</Badge>
              </div>
              <p className="text-[11px] text-brand-slate leading-relaxed">
                Role modifications and password changes are securely governed by Firebase Authentication and Firestore Security Rules.
              </p>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ParentProfilePage;
