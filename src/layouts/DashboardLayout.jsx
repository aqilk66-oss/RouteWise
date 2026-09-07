import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bus, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  UserCheck,
  Route,
  Navigation,
  FileBarChart,
  Shield,
  Baby,
  Calendar,
  User,
  ClipboardCheck,
  Radio,
  Search,
  Clock,
  Wrench,
  FileText,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, USER_ROLES } from '../constants/collections';
import notificationService from '../services/firestore/notificationService';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import GlobalSearchModal from '../components/navigation/GlobalSearchModal';
import usePageTitle from '../hooks/usePageTitle';

export const DashboardLayout = ({ children, title = 'Fleet Operations' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, profile, role, logout, switchRole } = useAuth();

  // Automatically update page title
  usePageTitle(title !== 'Fleet Operations' ? title : null);

  // Global Ctrl+K keyboard shortcut for Search
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

  const isAdminOrManager = role === USER_ROLES.ADMIN || role === USER_ROLES.TRANSPORT_MANAGER;
  const isParent = role === USER_ROLES.PARENT;
  const isDriver = role === USER_ROLES.DRIVER;
  const isStudent = role === USER_ROLES.STUDENT;

  // Hierarchical admin sidebar items
  const adminSections = [
    {
      title: 'Main Operations',
      items: [
        { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
        { label: 'Safety & Emergency', icon: ShieldAlert, path: '/admin/safety' },
        { label: 'Fleet Incidents', icon: Shield, path: '/admin/incidents' },
        { label: 'Fleet Tracking', icon: Navigation, path: '/admin/tracking' },
        { label: 'Passenger Attendance', icon: ClipboardCheck, path: '/admin/attendance' },
      ],
    },
    {
      title: 'Transport Planning & Dispatch',
      items: [
        { label: 'Planning Headquarters', icon: Calendar, path: '/admin/planning' },
        { label: 'Route Corridors', icon: Route, path: '/admin/planning/routes' },
        { label: 'Fleet Schedules', icon: Clock, path: '/admin/planning/schedules' },
        { label: 'Trip Generator', icon: Navigation, path: '/admin/planning/trips' },
      ],
    },
    {
      title: 'Fleet Operations & Compliance',
      items: [
        { label: 'Fleet Overview', icon: Bus, path: '/admin/fleet' },
        { label: 'Vehicle Maintenance', icon: Wrench, path: '/admin/fleet/maintenance' },
        { label: 'Safety Inspections', icon: ClipboardCheck, path: '/admin/fleet/inspections' },
        { label: 'Documents & Expiry', icon: FileText, path: '/admin/fleet/documents' },
        { label: 'Compliance Audit', icon: ShieldCheck, path: '/admin/fleet/compliance' },
      ],
    },
    {
      title: 'Fleet Management',
      items: [
        { label: 'Students', icon: Users, path: '/admin/students' },
        { label: 'Parents', icon: UserCheck, path: '/admin/parents' },
        { label: 'Drivers', icon: Shield, path: '/admin/drivers' },
        { label: 'Buses', icon: Bus, path: '/admin/buses' },
        { label: 'Routes', icon: Route, path: '/admin/routes' },
        { label: 'Stops', icon: MapPin, path: '/admin/stops' },
        { label: 'Trips & Dispatch', icon: Navigation, path: '/admin/trips' },
      ],
    },
    {
      title: 'Communications & Analytics',
      items: [
        { label: 'Operational Analytics', icon: BarChart3, path: '/admin/analytics' },
        { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
        { label: 'Reports', icon: FileBarChart, path: '/admin/reports' },
        { label: 'Settings', icon: Settings, path: '/admin/settings' },
      ],
    },
  ];

  // Dedicated Parent Portal navigation
  const parentSections = [
    {
      title: 'Family Transport',
      items: [
        { label: 'Transport Overview', icon: LayoutDashboard, path: '/parent' },
        { label: 'Safety & Assistance', icon: ShieldAlert, path: '/parent/safety' },
        { label: 'Child Attendance', icon: ClipboardCheck, path: '/parent/attendance' },
        { label: 'My Children', icon: Baby, path: '/parent/children' },
        { label: 'Live Route Tracker', icon: Navigation, path: '/parent/tracking' },
        { label: 'Trip History', icon: Calendar, path: '/parent/trips' },
      ],
    },
    {
      title: 'Communications & Account',
      items: [
        { label: 'Fleet Bulletins', icon: Bell, path: '/parent/notifications' },
        { label: 'Guardian Profile', icon: User, path: '/parent/profile' },
        { label: 'Notification Settings', icon: Settings, path: '/parent/settings' },
      ],
    },
  ];

  // Dedicated Driver Portal navigation
  const driverSections = [
    {
      title: 'Trip Operations',
      items: [
        { label: 'Driver Console', icon: LayoutDashboard, path: '/driver' },
        { label: 'Safety & SOS', icon: ShieldAlert, path: '/driver/safety' },
        { label: 'Report Incident', icon: Shield, path: '/driver/incidents' },
        { label: 'Student Attendance', icon: ClipboardCheck, path: '/driver/attendance' },
        { label: 'Live GPS Tracking', icon: Radio, path: '/driver/tracking' },
        { label: 'Assigned Vehicle', icon: Bus, path: '/driver/vehicle' },
        { label: 'Trips Roster', icon: Calendar, path: '/driver/trips' },
        { label: 'Route & Stops', icon: Route, path: '/driver/route' },
        { label: 'Passenger Manifest', icon: Users, path: '/driver/students' },
      ],
    },
    {
      title: 'Communications & Account',
      items: [
        { label: 'Dispatch Bulletins', icon: Bell, path: '/driver/notifications' },
        { label: 'Operator Profile', icon: User, path: '/driver/profile' },
        { label: 'Console Preferences', icon: Settings, path: '/driver/settings' },
      ],
    },
  ];

  // Dedicated Student Portal navigation
  const studentSections = [
    {
      title: 'My Transit',
      items: [
        { label: 'Student Dashboard', icon: LayoutDashboard, path: '/student' },
        { label: 'Rider Safety', icon: ShieldAlert, path: '/student/safety' },
        { label: 'My Attendance', icon: ClipboardCheck, path: '/student/attendance' },
        { label: 'My Bus & Route', icon: Route, path: '/student/transport' },
        { label: 'My Trips', icon: Calendar, path: '/student/trips' },
      ],
    },
    {
      title: 'Account & Settings',
      items: [
        { label: 'School Notices', icon: Bell, path: '/student/notifications' },
        { label: 'My Transit Pass', icon: UserCheck, path: '/student/profile' },
        { label: 'Alert Preferences', icon: Settings, path: '/student/settings' },
      ],
    },
  ];

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'User';

  const getPortalTitle = () => {
    if (isStudent) return 'Student Pass';
    if (isParent) return 'Parent Portal';
    if (isDriver) return 'Driver Console';
    return 'Admin Console';
  };

  const getNotificationLink = () => {
    if (isStudent) return '/student/notifications';
    if (isDriver) return '/driver/notifications';
    if (isParent) return '/parent/notifications';
    return '/admin/notifications';
  };

  const getProfileLink = () => {
    if (isStudent) return '/student/profile';
    if (isDriver) return '/driver/profile';
    if (isParent) return '/parent/profile';
    return '/admin/settings/profile';
  };

  // Helper for active navigation link styling
  const isLinkActive = (path) => {
    if (location.pathname === path) return true;
    // Don't prefix match portal root paths
    if (['/admin', '/parent', '/driver', '/student'].includes(path)) return false;
    return location.pathname.startsWith(path);
  };

  const currentSections = isAdminOrManager
    ? adminSections
    : isDriver
    ? driverSections
    : isParent
    ? parentSections
    : studentSections;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Skip to Main Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-brand-blue text-white font-bold rounded-lg shadow-lg"
      >
        Skip to main content
      </a>

      {/* Global Quick Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Header Bar */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-border sticky top-0 z-30 shadow-soft">
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/logo.png" alt="RouteWise" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-brand-navy leading-none">RouteWise</span>
            <span className="text-[9px] text-brand-teal font-semibold uppercase tracking-wider">
              {getPortalTitle()}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl text-brand-navy hover:bg-slate-100 transition-colors"
            aria-label="Open Quick Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-brand-navy hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Drawer"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop & Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-navy text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-700/60">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-soft shrink-0">
              <img src="/assets/logo.png" alt="RouteWise" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white leading-tight text-base">RouteWise</span>
              <span className="text-[10px] text-brand-teal uppercase font-semibold tracking-wider">
                {isStudent ? 'Student Pass' : isDriver ? 'Driver Portal' : isParent ? 'Guardian Pass' : 'Transport OS'}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg"
            aria-label="Close Navigation Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Chip */}
        <Link
          to={getProfileLink()}
          className="px-5 py-3.5 bg-slate-900/50 border-b border-slate-800 flex items-center gap-3 hover:bg-slate-900/80 transition-colors"
          title="Manage Profile"
        >
          <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-brand-teal uppercase tracking-wider font-semibold truncate">
              {ROLE_LABELS[role] || role}
            </p>
          </div>
        </Link>

        {/* Search Launcher inside Sidebar */}
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            aria-label="Quick Search shortcut Ctrl+K"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
            </span>
            <kbd className="text-[10px] font-mono bg-slate-900/70 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
          {currentSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
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
                        ? 'bg-brand-blue text-white shadow-soft font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Local Role Simulation Switcher (Dev feature) */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800">
          <p className="text-[9px] uppercase font-bold text-slate-400 mb-1.5">Role Simulator</p>
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
                  role === r ? 'bg-brand-teal text-brand-navy font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
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

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Ribbon */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-border sticky top-0 z-20 shadow-soft">
          <div>
            <h1 className="text-base font-bold text-brand-navy leading-tight">{title}</h1>
            {/* Standard Accessible Breadcrumb Navigation */}
            <Breadcrumbs className="mt-1" />
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Command Palette Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-brand-slate text-xs font-medium transition-colors border border-slate-200"
              aria-label="Open Command Palette Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
              <kbd className="text-[10px] font-mono bg-white border border-slate-200 px-1 rounded text-slate-500 shadow-subtle">
                Ctrl K
              </kbd>
            </button>

            <Link
              to={getNotificationLink()}
              className="p-2 rounded-xl text-brand-slate hover:text-brand-navy hover:bg-slate-100 transition-colors relative"
              aria-label="View notifications"
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
              to={getProfileLink()}
              className="flex items-center gap-3 group"
              title="View Profile"
            >
              <div className="text-right">
                <p className="text-xs font-bold text-brand-navy leading-none group-hover:text-brand-blue transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] text-brand-blue font-semibold mt-0.5">{ROLE_LABELS[role] || role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs shadow-soft group-hover:bg-brand-blue transition-colors">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Main Content Container with Subtle MPA Entrance Transition */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto page-enter">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

