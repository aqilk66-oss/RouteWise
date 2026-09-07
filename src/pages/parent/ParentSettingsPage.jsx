import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import settingsService from '../../services/settings/settingsService';

export const ParentSettingsPage = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Guardian Notification Preferences
  const [prefs, setPrefs] = useState({
    notifyTripStarted: true,
    notifyBusApproaching: true,
    notifyDelayAlerts: true,
    notifyStudentBoarded: true,
    notifyStudentDroppedOff: true,
    enableEmailDigest: true,
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.uid) return;
      try {
        const saved = await settingsService.getUserPreferences(user.uid, prefs);
        setPrefs((prev) => ({ ...prev, ...saved }));
      } catch (e) {
        console.warn('Could not load parent preferences:', e.message);
      }
    };
    loadPreferences();
  }, [user?.uid]);

  const handleChange = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      await settingsService.updateUserPreferences(user.uid, prefs);
      setToastMessage('Guardian notification preferences updated successfully.');
      setHasChanges(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="Guardian Notification Preferences"
      subtitle="Customize instant transit updates, boarding confirmations, and arrival alerts for your children."
      toastMessage={toastMessage}
      errorMessage={errorMessage}
      rolePrefix="/parent"
    >
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Bell className="w-5 h-5 text-brand-blue" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Transit Journey & Safety Bulletins</h2>
              <p className="text-[11px] text-brand-slate">Choose which real-time event updates you wish to receive.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyTripStarted}
                onChange={(e) => handleChange('notifyTripStarted', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Bus Departure Bulletins</span>
                <span className="text-[11px] text-brand-slate">
                  Receive an alert as soon as the morning pickup or afternoon return run departs.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyBusApproaching}
                onChange={(e) => handleChange('notifyBusApproaching', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Stop Approaching Advisory (500m geofence)</span>
                <span className="text-[11px] text-brand-slate">
                  Notifies you 3–5 minutes before the bus pulls up to your assigned stop.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyStudentBoarded}
                onChange={(e) => handleChange('notifyStudentBoarded', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Student Boarding Confirmation</span>
                <span className="text-[11px] text-brand-slate">
                  Instant confirmation the moment your child steps on the vehicle and is marked Boarded by the driver.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyStudentDroppedOff}
                onChange={(e) => handleChange('notifyStudentDroppedOff', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Safe Drop-Off Confirmation</span>
                <span className="text-[11px] text-brand-slate">
                  Immediate confirmation when your child arrives at school or safely disembarks at home.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyDelayAlerts}
                onChange={(e) => handleChange('notifyDelayAlerts', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Traffic Delays & Mechanical Advisories</span>
                <span className="text-[11px] text-brand-slate">
                  Alerts if transit falls behind schedule by more than 5 minutes.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Section 2: Email Channel */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Mail className="w-5 h-5 text-brand-teal" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Email Notification Channel</h2>
              <p className="text-[11px] text-brand-slate">Manage copies sent to your registered guardian email inbox.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.enableEmailDigest}
                onChange={(e) => handleChange('enableEmailDigest', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Send Critical Transit Alerts to {user?.email}</span>
                <span className="text-[11px] text-brand-slate">
                  Receive email delivery for unexpected delays, emergency schedule adjustments, and route cancellations.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border shadow-soft">
          <p className="text-xs text-brand-slate">
            {hasChanges ? 'You have unsaved changes.' : 'Preferences are synchronized.'}
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
            Save Preferences
          </Button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default ParentSettingsPage;
