import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import SettingsSidebar from './SettingsSidebar';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * SettingsLayout
 * Reusable layout wrapper for all MPA settings pages.
 * Displays title, subtitle, breadcrumbs, responsive sidebar/stacked tabs,
 * toast notifications, and main content area.
 */
export const SettingsLayout = ({
  title = 'Settings & Configuration',
  subtitle = 'Manage preferences, institutional profiles, and operational parameters.',
  children,
  toastMessage = null,
  errorMessage = null,
  rolePrefix = '/admin',
}) => {
  return (
    <DashboardLayout title={title}>
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-fade-in shadow-soft">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-fade-in shadow-soft">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Header Title Block */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand-navy tracking-tight">{title}</h1>
            <p className="text-xs text-brand-slate mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Two-Column Responsive Layout (Sidebar + Main Content) */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <SettingsSidebar rolePrefix={rolePrefix} />

          {/* Main Content Workspace */}
          <main className="flex-1 w-full min-w-0" role="region" aria-label="Settings Form Workspace">
            {children}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsLayout;
