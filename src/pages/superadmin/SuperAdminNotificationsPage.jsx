import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Send, 
  Info,
  Sliders
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { systemConfigService } from '../../services/admin/systemConfigService';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/ui/Loader';

const SuperAdminNotificationsPage = () => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Global Notification Rules
  const [rules, setRules] = useState({
    tripStartAlert: true,
    tripDelayAlert: true,
    tripCancellationAlert: true,
    studentBoardingAlert: true,
    studentDropoffAlert: true,
    incidentSosAlert: true,
    systemAnnouncements: true,
    emailNotificationsEnabled: false, // Default false until explicitly configured
  });

  // Test EmailJS status
  const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const isEmailConfigured = Boolean(emailJsServiceId && emailJsTemplateId && emailJsPublicKey);

  useEffect(() => {
    const fetchNotificationRules = async () => {
      try {
        const config = await systemConfigService.getSystemConfig();
        if (config?.notificationRules) {
          setRules(prev => ({ ...prev, ...config.notificationRules }));
        }
      } catch (error) {
        console.error('Error fetching notification rules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotificationRules();
  }, []);

  const handleToggle = (key) => {
    setRules(prev => ({ ...prev, [key]: !prev[key] }));
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await systemConfigService.updateSystemConfig({ notificationRules: rules }, currentUser?.uid);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (error) {
      console.error('Failed to save notification rules:', error);
      alert('Error saving rules: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout title="Dispatch Alert Rules">
        <div className="py-20 flex justify-center">
          <Loader variant="inline" text="Loading dispatch rules..." />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout title="Global Notification & Dispatch Rules">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              Global Notification & Alert Dispatch Rules
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
              Control system-wide alert dispatch parameters, automated guardian notifications, and EmailJS gateway status.
            </p>
          </div>
          {savedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Rules Saved & Audited</span>
            </div>
          )}
        </div>

        {/* EmailJS Gateway Health Card */}
        <div className="bg-white rounded-3xl p-6 border border-border shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${
              isEmailConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
            }`}>
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-brand-navy">EmailJS Gateway Integration</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  isEmailConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isEmailConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <p className="text-xs text-brand-slate mt-1 max-w-xl leading-relaxed">
                {isEmailConfigured
                  ? 'EmailJS credentials detected in environment variables. Automated dispatch for critical incidents is active.'
                  : 'EmailJS environment keys are absent. In-app notifications will continue operating; external email forwarding remains disabled.'
                }
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-mono text-slate-400 block">Service: {emailJsServiceId || 'None'}</span>
            <span className="text-[11px] font-mono text-slate-400 block">Template: {emailJsTemplateId || 'None'}</span>
          </div>
        </div>

        {/* Dispatch Rules Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-soft space-y-6">
          <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-blue" />
            Automated Journey & Transport Triggers
          </h3>

          <div className="space-y-4">
            {/* Rule 1 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-brand-navy">Trip Start Broadcasting</p>
                <p className="text-[11px] text-brand-slate">
                  Automatically broadcast in-app alerts to parents when a driver commences an assigned route.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rules.tripStartAlert}
                onChange={() => handleToggle('tripStartAlert')}
                className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300"
              />
            </div>

            {/* Rule 2 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-brand-navy">Route Delay Threshold Alerts</p>
                <p className="text-[11px] text-brand-slate">
                  Trigger delay warnings to parents when transit schedule deviates by more than 10 minutes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rules.tripDelayAlert}
                onChange={() => handleToggle('tripDelayAlert')}
                className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300"
              />
            </div>

            {/* Rule 3 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-brand-navy">Trip Cancellation Immediate Dispatch</p>
                <p className="text-[11px] text-brand-slate">
                  High-priority broadcast to administrators and affected guardians upon route cancellation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rules.tripCancellationAlert}
                onChange={() => handleToggle('tripCancellationAlert')}
                className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300"
              />
            </div>

            {/* Rule 4 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-brand-navy">Student Boarding Confirmation</p>
                <p className="text-[11px] text-brand-slate">
                  Notify guardians instantly when driver marks student as boarded at designated stop.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rules.studentBoardingAlert}
                onChange={() => handleToggle('studentBoardingAlert')}
                className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300"
              />
            </div>

            {/* Rule 5 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-brand-navy">Student Drop-Off Confirmation</p>
                <p className="text-[11px] text-brand-slate">
                  Notify guardians instantly upon safe arrival and passenger disembarkation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rules.studentDropoffAlert}
                onChange={() => handleToggle('studentDropoffAlert')}
                className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300"
              />
            </div>

            {/* Rule 6 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
              <div>
                <p className="text-xs font-bold text-rose-900">Emergency SOS Incident Escalation</p>
                <p className="text-[11px] text-rose-700">
                  Critical alerts broadcast immediately across all portal headers upon driver SOS trigger.
                </p>
              </div>
              <input
                type="checkbox"
                checked={rules.incidentSosAlert}
                onChange={() => handleToggle('incidentSosAlert')}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-brand-navy hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating Rules...' : 'Save Notification Rules'}</span>
            </button>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminNotificationsPage;
