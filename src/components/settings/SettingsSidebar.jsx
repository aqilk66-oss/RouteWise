import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  User, 
  Sliders, 
  Bell, 
  SlidersHorizontal, 
  ShieldCheck, 
  Layers, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../constants/collections';

/**
 * Role-aware Settings Navigation Sidebar & Header Bar
 */
export const SettingsSidebar = ({ rolePrefix = '/admin' }) => {
  const { role } = useAuth();
  const isAdmin = role === USER_ROLES.ADMIN;
  const isTransportManager = role === USER_ROLES.TRANSPORT_MANAGER;

  // Define nav links tailored to role
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { label: 'Profile Settings', path: '/admin/settings/profile', icon: User, desc: 'Your account & contact details' },
        { label: 'Transport Settings', path: '/admin/settings/transport', icon: Sliders, desc: 'Operational timings & tracking' },
        { label: 'Notification Settings', path: '/admin/settings/notifications', icon: Bell, desc: 'Trip bulletins & alerts' },
        { label: 'System & School', path: '/admin/settings/system', icon: Layers, desc: 'District info & time preferences' },
        { label: 'Security & Access', path: '/admin/settings/security', icon: ShieldCheck, desc: 'Password & session audits' },
      ];
    }

    if (isTransportManager) {
      return [
        { label: 'Profile Settings', path: '/transport/settings/profile', icon: User, desc: 'Your staff account & phone' },
        { label: 'Transport Rules', path: '/transport/settings/transport', icon: Sliders, desc: 'Fleet timings & thresholds' },
        { label: 'Notification Bulletins', path: '/transport/settings/notifications', icon: Bell, desc: 'Fleet dispatches' },
      ];
    }

    if (role === USER_ROLES.PARENT) {
      return [
        { label: 'Guardian Profile', path: '/parent/profile', icon: User, desc: 'Name, phone & emergency contact' },
        { label: 'Notification Preferences', path: '/parent/settings', icon: Bell, desc: 'Trip & arrival alerts' },
      ];
    }

    if (role === USER_ROLES.DRIVER) {
      return [
        { label: 'Operator Profile', path: '/driver/profile', icon: User, desc: 'Driver credentials & phone' },
        { label: 'Console Preferences', path: '/driver/settings', icon: Bell, desc: 'Dispatch & trip alerts' },
      ];
    }

    if (role === USER_ROLES.STUDENT) {
      return [
        { label: 'Transit Pass Profile', path: '/student/profile', icon: User, desc: 'Student info & contact' },
        { label: 'Notification Preferences', path: '/student/settings', icon: Bell, desc: 'Morning pickup alerts' },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white rounded-3xl border border-border p-4 shadow-soft">
        <div className="px-3 py-2 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-slate">
            Configuration Areas
          </span>
          <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5" aria-label="Settings sub-navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-start gap-3 p-3 rounded-2xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-soft font-bold'
                      : 'text-brand-slate hover:text-brand-navy hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-2 rounded-xl shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'bg-slate-100 text-brand-slate group-hover:bg-slate-200 group-hover:text-brand-navy'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.label}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isActive
                              ? 'text-white translate-x-0.5'
                              : 'text-slate-300 opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 font-normal ${
                          isActive ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default SettingsSidebar;
