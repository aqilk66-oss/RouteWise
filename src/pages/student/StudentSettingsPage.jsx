import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  MapPin, 
  Smartphone, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Bus,
  Sparkles
} from 'lucide-react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import settingsService from '../../services/settings/settingsService';

export const StudentSettingsPage = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Student Notification & Transit Pass Preferences
  const [prefs, setPrefs] = useState({
    notifyBusApproaching: true,
    notifyMorningTripStart: true,
    notifyDelays: true,
    notifyDistrictBulletins: true,
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.uid) return;
      try {
        const saved = await settingsService.getUserPreferences(user.uid, prefs);
        setPrefs((prev) => ({ ...prev, ...saved }));
      } catch (e) {
        console.warn('Could not load student preferences:', e.message);
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
      setToastMessage('Student transit preferences updated successfully.');
      setHasChanges(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="Transit Pass & Alerts Preferences"
      subtitle="Customize when you receive alerts for your morning and afternoon bus arrivals."
      toastMessage={toastMessage}
      errorMessage={errorMessage}
      rolePrefix="/student"
    >
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Bell className="w-5 h-5 text-brand-blue" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Bus Arrival & Transit Alerts</h2>
              <p className="text-[11px] text-brand-slate">Choose your personal notification preferences.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyBusApproaching}
                onChange={(e) => handleChange('notifyBusApproaching', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Bus Approaching Stop Notification</span>
                <span className="text-[11px] text-brand-slate">
                  Get notified 3–5 minutes before your school bus arrives at your morning stop.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyMorningTripStart}
                onChange={(e) => handleChange('notifyMorningTripStart', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Morning Bus Departure Alert</span>
                <span className="text-[11px] text-brand-slate">
                  Notifies you when your bus starts its scheduled route from the depot.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyDelays}
                onChange={(e) => handleChange('notifyDelays', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Traffic Delays & Weather Advisories</span>
                <span className="text-[11px] text-brand-slate">
                  Instant notice if your bus is delayed due to heavy traffic or weather conditions.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyDistrictBulletins}
                onChange={(e) => handleChange('notifyDistrictBulletins', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">School Transport Bulletins</span>
                <span className="text-[11px] text-brand-slate">
                  Holiday schedule reminders and administrative safety notices.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Footer */}
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

export default StudentSettingsPage;
