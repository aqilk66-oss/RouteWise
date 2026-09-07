import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  Smartphone, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Navigation,
  ShieldCheck,
  Radio
} from 'lucide-react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import settingsService from '../../services/settings/settingsService';

export const DriverSettingsPage = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Driver Operator Console Preferences
  const [prefs, setPrefs] = useState({
    notifyNewTripAssignment: true,
    notifyScheduleChanges: true,
    notifyPassengerRosterUpdates: true,
    enableAudibleAlerts: true,
    autoAdvanceStopsOnGeofence: true,
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.uid) return;
      try {
        const saved = await settingsService.getUserPreferences(user.uid, prefs);
        setPrefs((prev) => ({ ...prev, ...saved }));
      } catch (e) {
        console.warn('Could not load driver preferences:', e.message);
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
      setToastMessage('Driver operator console preferences saved successfully.');
      setHasChanges(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Error saving operator settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="Driver Console Preferences"
      subtitle="Configure dispatch bulletin alerts, audible notifications, and stop progression preferences."
      toastMessage={toastMessage}
      errorMessage={errorMessage}
      rolePrefix="/driver"
    >
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Bell className="w-5 h-5 text-brand-blue" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Dispatch & Route Bulletins</h2>
              <p className="text-[11px] text-brand-slate">Operational notifications sent to your driver console.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyNewTripAssignment}
                onChange={(e) => handleChange('notifyNewTripAssignment', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">New Trip & Route Assignments</span>
                <span className="text-[11px] text-brand-slate">
                  Receive an instant alert whenever administration assigns a new run or bus to your profile.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyScheduleChanges}
                onChange={(e) => handleChange('notifyScheduleChanges', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Dispatch Schedule Changes</span>
                <span className="text-[11px] text-brand-slate">
                  Alerts when scheduled departure times or route stops are updated by dispatch.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.notifyPassengerRosterUpdates}
                onChange={(e) => handleChange('notifyPassengerRosterUpdates', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Passenger Manifest Modifications</span>
                <span className="text-[11px] text-brand-slate">
                  Notifies when students are added or marked as absent before you commence your run.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Section 2: Audio & Operational Feedback */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Volume2 className="w-5 h-5 text-brand-teal" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Audio & Transit Interaction</h2>
              <p className="text-[11px] text-brand-slate">In-cab feedback settings to assist hands-free driving focus.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.enableAudibleAlerts}
                onChange={(e) => handleChange('enableAudibleAlerts', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Audible Chime on Stop Arrival</span>
                <span className="text-[11px] text-brand-slate">
                  Play a subtle chime sound when vehicle enters the 150m stop geofence zone.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={prefs.autoAdvanceStopsOnGeofence}
                onChange={(e) => handleChange('autoAdvanceStopsOnGeofence', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Highlight Next Stop Automatically</span>
                <span className="text-[11px] text-brand-slate">
                  Automatically set next scheduled stop as the active waypoint upon departure.
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
            Save Console Settings
          </Button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default DriverSettingsPage;
