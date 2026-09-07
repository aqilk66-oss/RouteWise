import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Settings, 
  FileText, 
  ShieldAlert, 
  Activity, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Sliders, 
  User, 
  LayoutDashboard,
  Server,
  Lock,
  BarChart3,
  Database,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, USER_ROLES } from '../constants/collections';
import notificationService from '../services/firestore/notificationService';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import GlobalSearchModal from '../components/navigation/GlobalSearchModal';
import usePageTitle from '../hooks/usePageTitle';

/**
 * Super Admin Dedicated Layout
 * Provides executive system governance, institutional scoping, audit trail monitoring,
 * and security threat telemetry.
 */
export const SuperAdminLayout = ({ children, title = 'System Governance' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, profile, role, logout, switchRole } = useAuth();

  // Page title synchronization
  usePageTitle(title !== 'System Governance' ? title : null);

  // Global Ctrl+K command shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.uid,
      (notifs) => {
        const unread = notifs.filter((n) => !n.read).length;
        setUnreadCount(unread);
      },
      () => {}
    );
    return () => unsubscribe();
  }, [user?.uid]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  // Super Admin Navigation Taxonomy
  const governanceSections = [
    {
      title: 'Governance & Overview',
      items: [
        { label: 'Executive Console', icon: LayoutDashboard, path: '/super-admin' },
        { label: 'Operational Analytics', icon: BarChart3, path: '/super-admin/analytics' },
        { label: 'System Health', icon: Server, path: '/super-admin/system-health' },
        { label: 'Platform Activity', icon: Activity, path: '/super-admin/activity' },
      ],
    },
    {
      title: 'Access & Institutions',
      items: [
        { label: 'User Directory', icon: Users, path: '/super-admin/users' },
        { label: 'Roles & Permissions', icon: Lock, path: '/super-admin/roles' },
        { label: 'School Districts', icon: Building2, path: '/super-admin/schools' },
      ],
    },
    {
      title: 'Security & Compliance',
      items: [
        { label: 'Immutable Audit Trail', icon: FileText, path: '/super-admin/audit-logs' },
        { label: 'Threat & Security Center', icon: ShieldAlert, path: '/super-admin/security' },
        { label: 'Disaster Backups', icon: Database, path: '/super-admin/backups' },
        { label: 'Operational Recovery Bin', icon: RotateCcw, path: '/super-admin/recovery' },
      ],
    },
    {
      title: 'System Configuration',
      items: [
        { label: 'Platform Configuration', icon: Sliders, path: '/super-admin/configuration' },
        { label: 'Dispatch Alert Rules', icon: Bell, path: '/super-admin/notifications' },
        { label: 'Executive Settings', icon: Settings, path: '/super-admin/settings' },
      ],
    },
  ];

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Super Administrator';

  const isLinkActive = (path) => {
    if (location.pathname === path) return true;
    if (path === '/super-admin') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Skip to Content Accessibility Anchor */}
      <a
        href="#superadmin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-brand-navy text-white font-bold rounded-lg shadow-lg border border-brand-teal"
      >
        Skip to main governance content
      </a>

      {/* Global Quick Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-soft">
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/logo.png" alt="RouteWise" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-white leading-none">RouteWise</span>
            <span className="text-[9px] text-brand-teal font-semibold uppercase tracking-wider">
              Governance OS
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Open Quick Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Governance Drawer"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Super Admin Desktop / Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-slate-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Super Admin Governance Navigation"
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-soft shrink-0">
              <img src="/assets/logo.png" alt="RouteWise" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white leading-tight text-base">RouteWise</span>
              <span className="text-[9px] text-brand-teal uppercase font-bold tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 inline" /> Super Admin
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg"
            aria-label="Close Governance Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Identity Ribbon */}
        <Link
          to="/super-admin/profile"
          className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3 hover:bg-slate-800/80 transition-colors"
          title="Super Admin Profile"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-navy to-brand-teal text-white flex items-center justify-center font-bold text-xs shrink-0 border border-brand-teal/40">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-brand-teal uppercase tracking-wider font-semibold truncate">
              {ROLE_LABELS[role] || 'Super Administrator'}
            </p>
          </div>
        </Link>

        {/* Search Bar Launcher */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-medium transition-colors border border-slate-800"
            aria-label="Quick Search shortcut Ctrl+K"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search system...</span>
            </span>
            <kbd className="text-[10px] font-mono bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
          {governanceSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                {sec.title}
              </p>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-brand-navy to-brand-blue text-white shadow-soft font-bold border border-brand-blue/30'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-teal' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Local Role Simulation Switcher (Dev feature) */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <p className="text-[9px] uppercase font-bold text-slate-500 mb-1.5">Role Simulator</p>
          <div className="flex flex-wrap gap-1">
            {Object.values(USER_ROLES).map((r) => (
              <button
                key={r}
                onClick={() => {
                  switchRole(r);
                  const dest = r === USER_ROLES.SUPER_ADMIN ? '/super-admin' : r === USER_ROLES.TRANSPORT_MANAGER ? '/admin' : `/${r}`;
                  navigate(dest, { replace: true });
                }}
                className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                  role === r ? 'bg-brand-teal text-brand-navy font-bold' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-950">
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            Main Site
          </Link>
        </div>
      </aside>

      {/* Main Governance Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Ribbon */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-border sticky top-0 z-20 shadow-soft">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-brand-teal">
                System Governance
              </span>
              <h1 className="text-base font-bold text-brand-navy leading-tight">{title}</h1>
            </div>
            <Breadcrumbs className="mt-1" />
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Command Palette Launcher */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-brand-slate text-xs font-medium transition-colors border border-slate-200"
              aria-label="Open Governance Command Palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search system...</span>
              <kbd className="text-[10px] font-mono bg-white border border-slate-200 px-1 rounded text-slate-500 shadow-subtle">
                Ctrl K
              </kbd>
            </button>

            <Link
              to="/super-admin/notifications"
              className="p-2 rounded-xl text-brand-slate hover:text-brand-navy hover:bg-slate-100 transition-colors relative"
              aria-label="View system notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue" />
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200" />

            <Link
              to="/super-admin/profile"
              className="flex items-center gap-3 group"
              title="View Super Admin Profile"
            >
              <div className="text-right">
                <p className="text-xs font-bold text-brand-navy leading-none group-hover:text-brand-blue transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] text-brand-teal font-semibold mt-0.5">Super Administrator</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 text-brand-teal flex items-center justify-center font-bold text-xs shadow-soft border border-slate-700 group-hover:border-brand-teal transition-colors">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Main Content Container */}
        <main id="superadmin-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto page-enter">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
