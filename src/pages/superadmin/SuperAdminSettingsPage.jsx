import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Monitor, 
  Eye
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';

const SuperAdminSettingsPage = () => {
  const [preferences, setPreferences] = useState({
    auditPageSize: '50',
    autoRefreshInterval: '30',
    highSeveritySound: true,
    compactTableDensity: false,
    sessionTimeoutWarning: true
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('routewise_superadmin_prefs', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <SuperAdminLayout title="Governance Preferences">
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
            Governance Console Preferences
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
            Configure your individual administrator viewing preferences, refresh intervals, and audit table formatting.
          </p>
        </div>

        {/* Preferences Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-soft space-y-6">
          <div>
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-brand-blue" />
              Console Display & Density
            </h3>

            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-brand-navy">Default Audit Logs per Page</p>
                  <p className="text-[11px] text-brand-slate">Number of ledger rows fetched per query batch</p>
                </div>
                <select
                  value={preferences.auditPageSize}
                  onChange={(e) => setPreferences(prev => ({ ...prev, auditPageSize: e.target.value }))}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
                >
                  <option value="25">25 records</option>
                  <option value="50">50 records</option>
                  <option value="100">100 records</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-brand-navy">Telemetry Auto-Refresh Rate</p>
                  <p className="text-[11px] text-brand-slate">Frequency of background system health pings</p>
                </div>
                <select
                  value={preferences.autoRefreshInterval}
                  onChange={(e) => setPreferences(prev => ({ ...prev, autoRefreshInterval: e.target.value }))}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                  <option value="0">Manual only</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-brand-navy">Compact Table Density</p>
                  <p className="text-[11px] text-brand-slate">Reduce padding on tables for high-density monitoring displays</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.compactTableDensity}
                  onChange={(e) => setPreferences(prev => ({ ...prev, compactTableDensity: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-teal" />
              Security & Session Alerts
            </h3>

            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-brand-navy">Session Inactivity Warning</p>
                  <p className="text-[11px] text-brand-slate">Notify before automatic governance session timeout</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.sessionTimeoutWarning}
                  onChange={(e) => setPreferences(prev => ({ ...prev, sessionTimeoutWarning: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-teal focus:ring-brand-teal border-slate-300"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-brand-navy">Critical Incident Acoustic Warning</p>
                  <p className="text-[11px] text-brand-slate">Chime when a critical driver SOS alert is logged</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.highSeveritySound}
                  onChange={(e) => setPreferences(prev => ({ ...prev, highSeveritySound: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-teal focus:ring-brand-teal border-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {saved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Preferences Saved Locally
              </span>
            ) : <div />}

            <button
              type="submit"
              className="px-6 py-2 bg-brand-navy hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminSettingsPage;
