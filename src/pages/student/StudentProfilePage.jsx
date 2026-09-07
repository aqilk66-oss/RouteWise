import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Bus, 
  Route as RouteIcon, 
  MapPin, 
  ShieldCheck, 
  Save, 
  CheckCircle 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useStudentTransport } from '../../context/StudentTransportContext';

import ProfilePhotoUploader from '../../components/settings/ProfilePhotoUploader';

export const StudentProfilePage = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { studentRecord, assignedBus, assignedRoute, pickupInfo, dropoffInfo } = useStudentTransport();

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    fullName: studentRecord?.fullName || profile?.fullName || user?.displayName || '',
    phone: profile?.phone || '',
    photoURL: profile?.photoURL || null,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (updateProfileData) {
        await updateProfileData({
          fullName: formData.fullName,
          phone: formData.phone,
          photoURL: formData.photoURL,
        });
      }
      setToastMessage('Profile updated successfully.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert(`Error saving profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Student Profile & Digital Transit Pass">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in shadow-soft">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Student Account Information</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Personal details and authorized institutional bus credentials.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSave}
            loading={saving}
          >
            Save Profile
          </Button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Personal Info */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <User className="w-4 h-4 text-brand-blue" />
              Personal Profile
            </h3>

            <ProfilePhotoUploader
              currentPhotoURL={formData.photoURL}
              onPhotoChange={(url) => setFormData((prev) => ({ ...prev, photoURL: url }))}
              label="Student Transit Pass Photo"
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
              <label className="block font-semibold text-brand-navy mb-1">Account Email</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-border text-brand-slate font-medium">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user?.email || 'student@routewise.app'}</span>
                <span className="ml-auto text-[10px] text-slate-400 italic">Auth Verified</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Grade / Section</label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-border text-brand-navy font-semibold">
                {studentRecord?.grade || 'Class 5'} {studentRecord?.className ? `(${studentRecord.className})` : ''}
              </div>
            </div>
          </Card>

          {/* Transport Credentials (Read-only) */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <Bus className="w-4 h-4 text-brand-teal" />
                Authorized Transit Assignment
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-border">
                  <span className="font-medium text-brand-slate">Assigned Vehicle:</span>
                  <span className="font-bold text-brand-navy">{assignedBus?.busNumber || 'Fleet Vehicle #24'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-border">
                  <span className="font-medium text-brand-slate">Transit Route:</span>
                  <span className="font-bold text-brand-navy">{assignedRoute?.name || 'Express Corridor'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-border">
                  <span className="font-medium text-brand-slate">Morning Pickup:</span>
                  <span className="font-bold text-emerald-700 truncate max-w-[180px]">{pickupInfo?.name}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-border">
                  <span className="font-medium text-brand-slate">Afternoon Drop-off:</span>
                  <span className="font-bold text-brand-navy truncate max-w-[180px]">{dropoffInfo?.name}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-brand-blue flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-brand-blue" />
                <span>Bus and stop assignments are read-only and governed by school transport dispatch.</span>
              </div>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-blue" />
                Pass Security
              </h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-border text-xs">
                <span className="font-semibold text-brand-navy">Pass Status:</span>
                <Badge variant="active">Active Pass</Badge>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;
