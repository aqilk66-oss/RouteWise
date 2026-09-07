import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Route, 
  Navigation, 
  Bus, 
  ClipboardCheck, 
  ShieldAlert, 
  Download, 
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../constants/collections';

/**
 * Reusable Multi-Page Analytics Navigation Header
 * Provides synchronized date filtering, refresh, CSV export, and active sub-navigation tabs.
 */
export const AnalyticsNavHeader = ({
  title = 'Transport Analytics & KPIs',
  subtitle = 'Data-backed operational intelligence, fleet reliability, capacity utilization, and attendance patterns.',
  period = 'last7days',
  onPeriodChange,
  onRefresh,
  onExport,
  refreshing = false,
  exporting = false,
  isSuperAdmin = false,
  children,
}) => {
  const location = useLocation();
  const { role } = useAuth();
  const isTransport = role === USER_ROLES.TRANSPORT_MANAGER;
  
  let basePrefix = '/admin/analytics';
  if (isSuperAdmin) {
    basePrefix = '/super-admin/analytics';
  } else if (isTransport) {
    basePrefix = '/transport/analytics';
  }

  const ANALYTICS_TABS = [
    { label: 'Overview', path: `${basePrefix}`, icon: BarChart3 },
    { label: 'Route Intelligence', path: `${basePrefix}/routes`, icon: Route },
    { label: 'Trips & Reliability', path: `${basePrefix}/trips`, icon: Navigation },
    { label: 'Fleet & Downtime', path: `${basePrefix}/fleet`, icon: Bus },
    { label: 'Attendance Patterns', path: `${basePrefix}/attendance`, icon: ClipboardCheck },
    { label: 'Safety & Incidents', path: `${basePrefix}/safety`, icon: ShieldAlert },
  ];

  if (isSuperAdmin) {
    ANALYTICS_TABS.push({
      label: 'Communications',
      path: `${basePrefix}/communication`,
      icon: MessageSquare,
    });
  }

  const PERIOD_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-brand-blue border border-blue-200">
              Stage 25 Operational Intelligence
            </span>
            <span className="text-[10px] font-semibold text-brand-slate">
              Deterministic KPIs
            </span>
          </div>
          <h2 className="text-2xl font-bold text-brand-navy tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-brand-slate mt-1 max-w-2xl">{subtitle}</p>}
        </div>

        {/* Global Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {onPeriodChange && (
            <select
              value={period}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-border rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              aria-label="Select Analytics Time Period"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={onRefresh}
              loading={refreshing}
              title="Refresh Analytics Dataset"
            >
              Refresh
            </Button>
          )}

          {onExport && (
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={onExport}
              loading={exporting}
              title="Export Current Analytics Table as CSV"
            >
              Export CSV
            </Button>
          )}

          {children}
        </div>
      </div>

      {/* MPA Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/60 rounded-2xl overflow-x-auto custom-scrollbar">
        {ANALYTICS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.path === basePrefix
            ? location.pathname === basePrefix || location.pathname === `${basePrefix}/overview`
            : location.pathname.startsWith(tab.path);

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-white text-brand-navy shadow-soft'
                  : 'text-brand-slate hover:text-brand-navy hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-blue' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsNavHeader;
