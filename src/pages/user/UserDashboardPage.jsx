import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  FileText, 
  Bus, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/feedback/Toast';

export const UserDashboardPage = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { addToast } = useToast();

  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  // Demonstration state for public transport application
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicationNotes, setApplicationNotes] = useState('');

  const handlePhoneSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileData({ phone: phoneNumber });
      addToast({
        title: 'Profile Updated',
        message: 'Your contact telephone has been updated.',
        type: 'success',
      });
      setEditingPhone(false);
    } catch (err) {
      addToast({
        title: 'Update Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTransport = (e) => {
    e.preventDefault();
    setApplicationSubmitted(true);
    addToast({
      title: 'Application Lodged',
      message: 'Your transport service registration request has been submitted for administrator review.',
      type: 'success',
    });
  };

  return (
    <DashboardLayout title="Member Portal">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xl">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-brand-navy">
                  {profile?.fullName || user?.displayName || 'Registered Member'}
                </h1>
                <Badge variant="neutral">General User</Badge>
                <Badge variant="active">{profile?.status || 'Active'}</Badge>
              </div>
              <p className="text-xs text-brand-slate mt-1">
                RouteWise Verified Account • User ID: <span className="font-mono">{user?.uid?.substring(0, 10)}...</span>
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Dossier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Account Profile" subtitle="Your verified identity details">
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-brand-slate flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-blue" /> Full Legal Name
                </span>
                <span className="font-semibold text-brand-navy">
                  {profile?.fullName || user?.displayName || 'Not Set'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-brand-slate flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-blue" /> Verified Email
                </span>
                <span className="font-semibold text-brand-navy">{user?.email}</span>
              </div>

              <div className="py-2 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-brand-slate flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-blue" /> Contact Phone
                  </span>
                  {!editingPhone && (
                    <button
                      type="button"
                      onClick={() => setEditingPhone(true)}
                      className="text-brand-blue hover:underline font-semibold"
                    >
                      {profile?.phone || 'Add Phone'}
                    </button>
                  )}
                </div>
                {editingPhone && (
                  <form onSubmit={handlePhoneSave} className="mt-2 flex gap-2">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="flex-1 rounded-lg border border-border px-2.5 py-1 text-xs outline-none focus:border-brand-blue"
                      required
                    />
                    <Button type="submit" size="sm" loading={saving}>Save</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPhone(false)}>Cancel</Button>
                  </form>
                )}
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-brand-slate flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Account Status
                </span>
                <span className="font-semibold text-emerald-700 capitalize">
                  {profile?.status || 'Active'}
                </span>
              </div>
            </div>
          </Card>

          {/* Transport Registration & Applications */}
          <Card title="Transport Enrollment" subtitle="Apply for school bus service or link a student">
            {applicationSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-900">Application Under Review</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Your transport request has been received by school dispatch. Once verified, your account will be provisioned with Guardian access.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                  <Clock className="w-3.5 h-3.5" /> Status: Pending Administrator Verification
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplyTransport} className="space-y-3">
                <p className="text-xs text-brand-slate">
                  If you are a parent or guardian seeking school bus transport for your child, lodge an application below:
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-brand-navy mb-1 uppercase tracking-wider">
                    Student Details & Address Note
                  </label>
                  <textarea
                    rows={3}
                    value={applicationNotes}
                    onChange={(e) => setApplicationNotes(e.target.value)}
                    placeholder="Enter student name, grade, campus, and primary residential pickup address..."
                    className="w-full rounded-xl border border-border p-3 text-xs outline-none focus:border-brand-blue resize-none"
                    required
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" icon={Send} className="w-full">
                  Submit Transport Application
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Public Transport Safety Notice */}
        <div className="p-5 rounded-2xl bg-blue-50/70 border border-brand-blue/20 flex items-start gap-3">
          <Bus className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
          <div className="text-xs text-brand-navy space-y-1">
            <h4 className="font-bold">Public Transport Information & Guidelines</h4>
            <p className="text-brand-slate leading-relaxed">
              RouteWise enforces strict privacy and safety guidelines. Live bus telemetry, GPS breadcrumbs, and student manifests are strictly restricted to verified parents, authorized drivers, and district administrators.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboardPage;
