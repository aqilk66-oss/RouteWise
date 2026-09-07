import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  AlertTriangle, 
  Save, 
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import SettingsLayout from '../../../components/settings/SettingsLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import settingsService, { DEFAULT_SETTINGS } from '../../../services/settings/settingsService';
import { useAuth } from '../../../context/AuthContext';

export const SystemSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS.system);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSettingsCategory('system');
        setSettings(data);
      } catch (err) {
        setErrorMessage('Failed to load system settings.');
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
    if (window.confirm('Reset school & district settings to default values?')) {
      setSettings(DEFAULT_SETTINGS.system);
      setHasChanges(true);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!settings.institutionName.trim()) {
      setErrorMessage('School / District Name cannot be empty.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      await settingsService.updateSettingsCategory('system', settings, user?.email || user?.uid);
      setToastMessage('Institutional profile and system preferences saved successfully.');
      setHasChanges(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Error updating system settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="System & Institutional Configuration"
      subtitle="District parameters, operational operating hours, localized time formats, and maintenance controls."
      toastMessage={toastMessage}
      errorMessage={errorMessage}
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Core Institutional Details */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Building className="w-5 h-5 text-brand-blue" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">School District Information</h2>
              <p className="text-[11px] text-brand-slate">Institutional identity rendered across official manifests, reports, and emails.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                District / School Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.institutionName}
                onChange={(e) => handleChange('institutionName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Official Campus Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.schoolAddress}
                  onChange={(e) => handleChange('schoolAddress', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none pl-9 font-medium"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Transport Dispatch Contact Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={settings.schoolPhone}
                  onChange={(e) => handleChange('schoolPhone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none pl-9 font-medium"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Dispatch Email Inquiries
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={settings.schoolEmail}
                  onChange={(e) => handleChange('schoolEmail', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none pl-9 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Operating Hours & Timezone */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Clock className="w-5 h-5 text-brand-teal" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Transit Operating Hours & Localization</h2>
              <p className="text-[11px] text-brand-slate">Define daily active transit hours and time representation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Morning Depot Dispatch Start
              </label>
              <input
                type="time"
                value={settings.operatingHoursStart}
                onChange={(e) => handleChange('operatingHoursStart', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Evening Depot Return End
              </label>
              <input
                type="time"
                value={settings.operatingHoursEnd}
                onChange={(e) => handleChange('operatingHoursEnd', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1.5">
                Time Format Display
              </label>
              <select
                value={settings.timeFormat}
                onChange={(e) => handleChange('timeFormat', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white font-medium"
              >
                <option value="12h">12-Hour (07:30 AM)</option>
                <option value="24h">24-Hour (07:30)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 3: Brand Identity & Maintenance Mode */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">RouteWise Brand Platform & System Controls</h2>
              <p className="text-[11px] text-brand-slate">Controlled maintenance barrier and core application branding.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-brand-navy text-sm block">RouteWise</span>
                <span className="text-[11px] text-brand-slate">Every Route, Under Control. (Core Brand Identity Protected)</span>
              </div>
              <Badge variant="active" size="md">RouteWise v1.0 Production</Badge>
            </div>

            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Activate System Maintenance Mode
                  </span>
                  <span className="text-[11px] text-amber-700">
                    When active, presents a branded maintenance notice to unprivileged roles while administrators maintain full console access.
                  </span>
                </div>
              </label>

              {settings.maintenanceMode && (
                <div className="pt-2">
                  <label className="block font-bold text-amber-900 mb-1">
                    Public Maintenance Notice Banner
                  </label>
                  <input
                    type="text"
                    value={settings.maintenanceMessage}
                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                  />
                </div>
              )}
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
            Reset Settings
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
            Save System Settings
          </Button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default SystemSettingsPage;
