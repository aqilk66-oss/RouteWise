import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Clock, 
  MapPin, 
  Radio, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import SettingsLayout from '../../../components/settings/SettingsLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import settingsService, { DEFAULT_SETTINGS } from '../../../services/settings/settingsService';
import { useAuth } from '../../../context/AuthContext';

export const TransportSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS.transport);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSettingsCategory('transport');
        setSettings(data);
      } catch (err) {
        setErrorMessage('Failed to load transport parameters from database.');
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
    if (window.confirm('Reset all transport settings to safe system defaults?')) {
      setSettings(DEFAULT_SETTINGS.transport);
      setHasChanges(true);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validation
    if (settings.trackingFreshnessSeconds < 10 || settings.trackingFreshnessSeconds > 300) {
      setErrorMessage('Tracking Freshness Threshold must be between 10 and 300 seconds.');
      return;
    }
    if (settings.maxSpeedLimitMph < 15 || settings.maxSpeedLimitMph > 85) {
      setErrorMessage('Speed Limit Threshold must be between 15 and 85 MPH.');
      return;
    }
    if (settings.geofenceRadiusMeters < 30 || settings.geofenceRadiusMeters > 1000) {
      setErrorMessage('Geofence Radius must be between 30 and 1000 meters.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      await settingsService.updateSettingsCategory('transport', settings, user?.email || user?.uid);
      setToastMessage('Transport operational rules and tracking thresholds saved successfully.');
      setHasChanges(false);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      setErrorMessage(err.message || 'Error updating transport settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="Transport & Fleet Rules"
      subtitle="Define operational windows, GPS tracking freshness, safety thresholds, and journey completion policies."
      toastMessage={toastMessage}
      errorMessage={errorMessage}
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Trip Dispatch & Arrival Windows */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Clock className="w-5 h-5 text-brand-blue" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Dispatch Windows & Schedule Timings</h2>
              <p className="text-[11px] text-brand-slate">Control buffer windows for bus departures and guardian arrival alerts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Default Pickup Window (Mins)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={settings.pickupWindowMins}
                onChange={(e) => handleChange('pickupWindowMins', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
              />
              <p className="text-[11px] text-brand-slate mt-1">Arrival buffer window before scheduled stop.</p>
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Drop-Off Window (Mins)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={settings.dropoffWindowMins}
                onChange={(e) => handleChange('dropoffWindowMins', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
              />
              <p className="text-[11px] text-brand-slate mt-1">Estimated drop-off time buffer.</p>
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Delay Warning Threshold (Mins)
              </label>
              <input
                type="number"
                min="2"
                max="30"
                value={settings.etaDelayThresholdMins}
                onChange={(e) => handleChange('etaDelayThresholdMins', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
              />
              <p className="text-[11px] text-brand-slate mt-1">Triggers automated delay bulletin if exceeded.</p>
            </div>
          </div>
        </Card>

        {/* Section 2: Real-Time GPS Tracking Telemetry */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Radio className="w-5 h-5 text-brand-teal" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">GPS Tracking & Telemetry Freshness</h2>
              <p className="text-[11px] text-brand-slate">Operational thresholds actively consumed by the tracking engine.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Tracking Freshness Stale Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={settings.trackingFreshnessSeconds}
                  onChange={(e) => handleChange('trackingFreshnessSeconds', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
                />
                <span className="absolute right-3 top-2.5 text-xs text-brand-slate">Seconds</span>
              </div>
              <p className="text-[11px] text-brand-slate mt-1">
                Marks location as stale if no GPS ping received within this window.
              </p>
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Geofence Stop Radius
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={settings.geofenceRadiusMeters}
                  onChange={(e) => handleChange('geofenceRadiusMeters', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
                />
                <span className="absolute right-3 top-2.5 text-xs text-brand-slate">Meters</span>
              </div>
              <p className="text-[11px] text-brand-slate mt-1">Radius for automated stop arrival detection.</p>
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Safety Speed Limit
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="75"
                  value={settings.maxSpeedLimitMph}
                  onChange={(e) => handleChange('maxSpeedLimitMph', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
                />
                <span className="absolute right-3 top-2.5 text-xs text-brand-slate">MPH</span>
              </div>
              <p className="text-[11px] text-brand-slate mt-1">Vehicle speed safety warning threshold.</p>
            </div>
          </div>
        </Card>

        {/* Section 3: Attendance & Journey Safety Policies */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Attendance & Safety Enforcement</h2>
              <p className="text-[11px] text-brand-slate">Mandate student verification procedures prior to closing runs.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.requireAttendanceBeforeTripComplete}
                onChange={(e) => handleChange('requireAttendanceBeforeTripComplete', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Require Attendance Roster Completion Before Ending Run</span>
                <span className="text-[11px] text-brand-slate leading-relaxed">
                  Prevents drivers from marking a trip as Completed if there are still students marked as Boarded without recorded Drop-Off.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.allowDriverDelayReports}
                onChange={(e) => handleChange('allowDriverDelayReports', e.target.checked)}
                className="mt-0.5 rounded text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <div>
                <span className="font-bold text-brand-navy block">Permit One-Click Driver Delay Broadcasts</span>
                <span className="text-[11px] text-brand-slate leading-relaxed">
                  Allows bus operators to declare unexpected traffic or mechanical delays directly from their console.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Action Footer */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border shadow-soft">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleReset}
            disabled={saving}
          >
            Reset to Defaults
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              loading={saving}
              disabled={!hasChanges && !saving}
              className="bg-brand-navy hover:bg-slate-800 text-white font-bold px-6 shadow-soft"
            >
              Save Transport Rules
            </Button>
          </div>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default TransportSettingsPage;
