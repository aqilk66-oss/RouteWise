import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  AlertTriangle, 
  Send, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert,
  Info
} from 'lucide-react';
import SettingsLayout from '../../../components/settings/SettingsLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import settingsService, { DEFAULT_SETTINGS } from '../../../services/settings/settingsService';
import { emailNotificationService } from '../../../services/email/emailNotificationService';
import { useAuth } from '../../../context/AuthContext';

export const NotificationSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS.notifications);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSettingsCategory('notifications');
        setSettings(data);
      } catch (err) {
        setErrorMessage('Failed to load notification configurations.');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleReset = () => {
    if (window.confirm('Reset notification rules to defaults?')) {
      setSettings(DEFAULT_SETTINGS.notifications);
      setHasChanges(true);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      await settingsService.updateSettingsCategory('notifications', settings, user?.email || user?.uid);
      setToastMessage('Notification dispatch rules updated successfully.');
      setHasChanges(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Error updating notifications configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="System Notification Policies"
      subtitle="Configure fleet-wide dispatch alerts, automated delay notices, and email delivery rules."
      toastMessage={toastMessage}
      errorMessage={errorMessage}
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Automated Operational Bulletins */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Bell className="w-5 h-5 text-brand-blue" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Automated Operational Transit Alerts</h2>
              <p className="text-[11px] text-brand-slate">Controls which events automatically trigger in-app bulletins to parents and riders.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.enableTripStartAlerts}
                onChange={(e) => handleChange('enableTripStartAlerts', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Trip Departure Announcements</span>
                <span className="text-[11px] text-brand-slate">
                  Notify assigned parents and students as soon as a bus leaves depot for morning or afternoon runs.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.enableDelayAlerts}
                onChange={(e) => handleChange('enableDelayAlerts', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Automated Delay Alerts</span>
                <span className="text-[11px] text-brand-slate">
                  Broadcast notification when a trip runs past the configured delay threshold.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.enableCancellationAlerts}
                onChange={(e) => handleChange('enableCancellationAlerts', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Trip Cancellation & Route Divergence Alerts</span>
                <span className="text-[11px] text-brand-slate">
                  Instant high-priority alerts if weather or emergency halts a scheduled route.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.enableEmergencyBulletins}
                onChange={(e) => handleChange('enableEmergencyBulletins', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">District Safety Bulletins</span>
                <span className="text-[11px] text-brand-slate">
                  Allow transport dispatchers to issue district-wide safety advisories.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Section 2: Email Delivery Architecture */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-brand-teal" />
              <div>
                <h2 className="text-sm font-bold text-brand-navy">Email Notification Subsystem (EmailJS)</h2>
                <p className="text-[11px] text-brand-slate">Electronic mail delivery status and operational rules.</p>
              </div>
            </div>

            <Badge
              variant={emailNotificationService.isConfigured() ? 'active' : 'warning'}
              size="md"
              className="font-mono text-[11px]"
            >
              {emailNotificationService.isConfigured() ? 'EmailJS Connected' : 'Demo Mode Fallback'}
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.enableEmailDigest}
                onChange={(e) => handleChange('enableEmailDigest', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Transmit Critical Transit Alerts via Email</span>
                <span className="text-[11px] text-brand-slate">
                  Send email copies of delays, route closures, and trip completions to registered guardian mailboxes.
                </span>
              </div>
            </label>

            <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 flex items-start gap-3 text-xs text-brand-slate">
              <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
              <p>
                EmailJS templates are configured for transit dispatch, contact enquiries, and delay broadcasts.
                Critical security notices (such as password reset requests) always transmit regardless of notification toggles.
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border shadow-soft">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleReset}
            disabled={saving}
          >
            Reset Rules
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
            loading={saving}
            disabled={!hasChanges && !saving}
            className="bg-brand-navy hover:bg-slate-800 text-white font-bold px-6 shadow-soft"
          >
            Save Notification Policies
          </Button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default NotificationSettingsPage;
