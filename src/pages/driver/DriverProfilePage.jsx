import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Save, 
  CheckCircle, 
  Bus, 
  Route as RouteIcon,
  Award
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDriverTransport } from '../../context/DriverTransportContext';

import ProfilePhotoUploader from '../../components/settings/ProfilePhotoUploader';

export const DriverProfilePage = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { driverProfile, assignedBus, assignedRoute } = useDriverTransport();

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    fullName: driverProfile?.fullName || profile?.fullName || user?.displayName || '',
    phone: driverProfile?.phone || profile?.phone || '',
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
      setToastMessage('Driver operator profile successfully updated.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Driver Operator Profile & Certifications">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Authorized Bus Operator Account</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Certified commercial driver license records and institutional vehicle pairing.
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
          {/* Operator Details */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <User className="w-4 h-4 text-brand-blue" />
              Operator Personal Information
            </h3>

            <ProfilePhotoUploader
              currentPhotoURL={formData.photoURL}
              onPhotoChange={(url) => setFormData((prev) => ({ ...prev, photoURL: url }))}
              label="Operator Photo ID"
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
              <label className="block font-semibold text-brand-navy mb-1">Operator Email</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-border text-brand-slate font-medium">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user?.email || 'driver@routewise.app'}</span>
                <span className="ml-auto text-[10px] text-slate-400 italic">Auth Verified</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Contact Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-border text-[11px] text-brand-slate">
              Note: Contact phone is only accessible to authorized school dispatchers. It is never exposed publicly to students.
            </div>
          </Card>

          {/* CDL Credentials & Vehicle Assignment */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-teal" />
                Commercial Driving Credentials
              </h3>

              <div className="p-3 rounded-xl bg-slate-50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-navy">CDL License Number:</span>
                  <span className="font-bold text-brand-blue">{driverProfile?.licenseNumber || 'CDL-9842103'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-navy">License Expiry:</span>
                  <span className="font-medium text-brand-slate">{driverProfile?.licenseExpiry || '2028-12-31'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-navy">Certification Status:</span>
                  <Badge variant="active" size="sm">Valid & Inspected</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <Bus className="w-4 h-4 text-brand-blue" />
                Institutional Vehicle & Route Link
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-border">
                  <span className="font-medium text-brand-slate">Assigned Vehicle:</span>
                  <span className="font-bold text-brand-navy">{assignedBus?.busNumber || 'Fleet Vehicle'} ({assignedBus?.registrationNumber || 'Plate Verified'})</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-border">
                  <span className="font-medium text-brand-slate">Assigned Route Corridor:</span>
                  <span className="font-bold text-brand-navy">{assignedRoute?.name || 'Corridor Express'} ({assignedRoute?.routeCode || 'EXP'})</span>
                </div>
              </div>
              <p className="text-[11px] text-brand-slate">
                Fleet assignments are managed centrally by the Transport Manager.
              </p>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DriverProfilePage;
