import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  ShieldAlert, 
  Globe, 
  Mail, 
  Phone, 
  RefreshCw,
  Lock,
  Building
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { systemConfigService } from '../../services/admin/systemConfigService';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/ui/Loader';

const SuperAdminConfigPage = () => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [config, setConfig] = useState({
    platformName: 'RouteWise',
    organizationName: 'RouteWise Educational Transport Network',
    contactEmail: 'governance@routewise.app',
    supportPhone: '+1 (800) 555-0199',
    emergencyHotline: '+1 (800) 911-BUS1',
    defaultTimezone: 'America/New_York',
    allowPublicRegistration: true,
    maintenanceMode: false,
    maintenanceMessage: 'RouteWise is currently undergoing scheduled platform governance maintenance. Operational trips continue in offline logging mode.',
    speedThresholdMph: 45,
    geofenceRadiusMeters: 150,
    etaUpdateIntervalSec: 15
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await systemConfigService.getSystemConfig();
        if (data) {
          setConfig(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Error fetching system config:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await systemConfigService.updateSystemConfig(config, currentUser?.uid);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error) {
      console.error('Failed to update system config:', error);
      alert('Error updating configuration: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    const nextState = !config.maintenanceMode;
    const confirmMsg = nextState
      ? 'WARNING: Enabling Maintenance Mode will restrict ordinary public and parent access across the portal. Authenticated Super Admins will retain access. Continue?'
      : 'Disable Maintenance Mode and restore full public platform access?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await systemConfigService.setMaintenanceMode(nextState, config.maintenanceMessage, currentUser?.uid);
      setConfig(prev => ({ ...prev, maintenanceMode: nextState }));
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout title="Platform Configuration">
        <div className="py-20 flex justify-center">
          <Loader variant="inline" text="Loading platform configuration..." />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout title="Global Platform Configuration">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              Platform & System Configuration
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
              Control global operational parameters, emergency dispatch contacts, and maintenance mode status.
            </p>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configuration Published & Audited</span>
            </div>
          )}
        </div>

        {/* Maintenance Mode Callout */}
        <div className={`p-6 rounded-3xl border transition-all shadow-soft ${
          config.maintenanceMode
            ? 'bg-amber-500/10 border-amber-300'
            : 'bg-white border-border'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl shrink-0 ${
                config.maintenanceMode ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-brand-navy">Platform Maintenance Mode</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    config.maintenanceMode ? 'bg-amber-100 text-amber-900 font-black' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {config.maintenanceMode ? 'ACTIVE' : 'STANDBY'}
                  </span>
                </div>
                <p className="text-xs text-brand-slate mt-1 max-w-xl leading-relaxed">
                  When enabled, non-administrative users encounter a branded maintenance announcement. All state changes are logged to the immutable audit trail.
                </p>
              </div>
            </div>

            <button
              onClick={toggleMaintenanceMode}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-soft shrink-0 ${
                config.maintenanceMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {config.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
            </button>
          </div>

          {config.maintenanceMode && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Public Announcement Banner
              </label>
              <input
                type="text"
                value={config.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          )}
        </div>

        {/* Global Settings Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-soft space-y-6">
          {/* Section 1: Branding & Identity */}
          <div>
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-blue" />
              Platform Branding & Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Platform Name</label>
                <input
                  type="text"
                  required
                  value={config.platformName}
                  onChange={(e) => handleChange('platformName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organization / District Entity</label>
                <input
                  type="text"
                  required
                  value={config.organizationName}
                  onChange={(e) => handleChange('organizationName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Emergency Dispatch */}
          <div>
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-teal" />
              Administrative & Emergency Hotlines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Governance Contact Email</label>
                <input
                  type="email"
                  required
                  value={config.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transport Support Phone</label>
                <input
                  type="tel"
                  value={config.supportPhone}
                  onChange={(e) => handleChange('supportPhone', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">Primary SOS Emergency Line</label>
                <input
                  type="tel"
                  value={config.emergencyHotline}
                  onChange={(e) => handleChange('emergencyHotline', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-rose-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operational Fleet Defaults */}
          <div>
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Operational Telemetry Defaults
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Speed Warning Limit (MPH)</label>
                <input
                  type="number"
                  min="20"
                  max="90"
                  value={config.speedThresholdMph}
                  onChange={(e) => handleChange('speedThresholdMph', Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stop Geofence Radius (Meters)</label>
                <input
                  type="number"
                  min="30"
                  max="1000"
                  value={config.geofenceRadiusMeters}
                  onChange={(e) => handleChange('geofenceRadiusMeters', Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Live ETA Polling Interval (Sec)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={config.etaUpdateIntervalSec}
                  onChange={(e) => handleChange('etaUpdateIntervalSec', Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Public Registration Toggle */}
          <div className="pt-2">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-brand-navy">Allow Public Account Registration</p>
                <p className="text-[11px] text-brand-slate">
                  When enabled, parents and students can register accounts via the public portal.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.allowPublicRegistration}
                onChange={(e) => handleChange('allowPublicRegistration', e.target.checked)}
                className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-navy hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing Changes...' : 'Publish Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminConfigPage;
