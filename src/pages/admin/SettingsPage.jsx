import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Sliders, 
  Bell, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Info,
  Clock,
  Radio
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../constants/collections';

export const SettingsPage = () => {
  const { role } = useAuth();
  const isAdmin = role === USER_ROLES.ADMIN;
  const isTransportManager = role === USER_ROLES.TRANSPORT_MANAGER;
  const prefix = isAdmin ? '/admin' : '/transport';

  const sections = [
    {
      title: 'Profile Settings',
      description: 'Update your display name, contact phone, and avatar photo.',
      path: `${prefix}/settings/profile`,
      icon: User,
      color: 'bg-blue-50 text-brand-blue border-blue-200',
      badge: 'Account',
    },
    {
      title: 'Transport & Fleet Rules',
      description: 'Configure pickup/dropoff windows, geofence radius, tracking telemetry, and attendance policies.',
      path: `${prefix}/settings/transport`,
      icon: Sliders,
      color: 'bg-teal-50 text-brand-teal border-teal-200',
      badge: 'Operational',
    },
    {
      title: 'Notification Policies',
      description: 'Set up automated bus departure bulletins, delay broadcasts, and EmailJS delivery rules.',
      path: `${prefix}/settings/notifications`,
      icon: Bell,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: 'Communications',
    },
    ...(isAdmin ? [
      {
        title: 'System & District Profile',
        description: 'District contact info, transit operating hours, time formats, and controlled maintenance mode.',
        path: '/admin/settings/system',
        icon: Layers,
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        badge: 'Institutional',
      },
      {
        title: 'Security & Access',
        description: 'Manage passwords, check email verification status, and audit active session details.',
        path: '/admin/settings/security',
        icon: ShieldCheck,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'Security',
      },
    ] : []),
  ];

  return (
    <DashboardLayout title="Settings & System Configuration">
      <div className="space-y-6">
        {/* Header Block */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand-navy tracking-tight">System & Account Configuration</h1>
            <p className="text-xs text-brand-slate mt-1">
              Centralized administrative controls, fleet parameters, notification defaults, and security policies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="active" size="md" className="capitalize">
              {role || 'Administrator'} Role
            </Badge>
          </div>
        </div>

        {/* Directory Grid of Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Link
                key={sec.path}
                to={sec.path}
                className="group block"
              >
                <Card className="p-6 h-full flex flex-col justify-between border-border hover:border-brand-blue/40 hover:shadow-card transition-all rounded-3xl">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl border ${sec.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="neutral" size="sm">
                        {sec.badge}
                      </Badge>
                    </div>

                    <h2 className="text-sm font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                      {sec.title}
                    </h2>
                    <p className="text-xs text-brand-slate mt-1.5 leading-relaxed">
                      {sec.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                    <span>Manage Parameters</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Operational Telemetry Card */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 text-brand-teal">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Tracking Telemetry Engine</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic freshness windows and GPS sync rates are actively monitored.
              </p>
            </div>
          </div>
          <Link
            to={`${prefix}/settings/transport`}
            className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
          >
            <span>Review GPS Thresholds</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
