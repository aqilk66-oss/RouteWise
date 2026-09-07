import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Navigation, 
  UserCheck, 
  Bus, 
  Route, 
  Users, 
  Shield 
} from 'lucide-react';

const REPORT_TABS = [
  { label: 'Overview', path: '/admin/reports', icon: BarChart3 },
  { label: 'Trips', path: '/admin/reports/trips', icon: Navigation },
  { label: 'Attendance', path: '/admin/reports/attendance', icon: UserCheck },
  { label: 'Buses', path: '/admin/reports/buses', icon: Bus },
  { label: 'Routes', path: '/admin/reports/routes', icon: Route },
  { label: 'Drivers', path: '/admin/reports/drivers', icon: Shield },
  { label: 'Students', path: '/admin/reports/students', icon: Users },
];

export const ReportNavigationHeader = ({ title = 'Operational Reports', subtitle = '', children }) => {
  const location = useLocation();

  return (
    <div className="space-y-4">
      {/* Top Header Card with Action Controls */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
          {subtitle && <p className="text-xs text-brand-slate mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {children}
        </div>
      </div>

      {/* MPA Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/60 rounded-2xl overflow-x-auto custom-scrollbar">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.path === '/admin/reports'
            ? location.pathname === '/admin/reports' || location.pathname === '/admin/reports/overview'
            : location.pathname === tab.path;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-brand-navy shadow-soft'
                  : 'text-brand-slate hover:text-brand-navy hover:bg-white/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-blue' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ReportNavigationHeader;
