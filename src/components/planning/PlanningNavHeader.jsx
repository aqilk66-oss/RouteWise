import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Route, 
  Calendar, 
  Send, 
  PlusCircle, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../constants/collections';

export const PlanningNavHeader = ({ 
  title = 'Transport Planning & Scheduling', 
  subtitle = 'Deterministic route design, stop sequencing, capacity audit & trip dispatch.',
  children 
}) => {
  const location = useLocation();
  const { role } = useAuth();
  const isTransport = role === USER_ROLES.TRANSPORT_MANAGER;
  const basePrefix = isTransport ? '/transport/planning' : '/admin/planning';

  const PLANNING_TABS = [
    { label: 'Overview', path: `${basePrefix}`, icon: LayoutDashboard },
    { label: 'Routes & Stops', path: `${basePrefix}/routes`, icon: Route },
    { label: 'Schedules & Conflicts', path: `${basePrefix}/schedules`, icon: Calendar },
    { label: 'Trip Dispatch Generator', path: `${basePrefix}/trips`, icon: Send },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
              Stage 22 Operational Layer
            </span>
          </div>
          <h2 className="text-2xl font-bold text-brand-navy tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-brand-slate mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {children}
        </div>
      </div>

      {/* MPA Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/60 rounded-2xl overflow-x-auto custom-scrollbar">
        {PLANNING_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.path === basePrefix
            ? location.pathname === basePrefix
            : location.pathname.startsWith(tab.path);

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

export default PlanningNavHeader;
