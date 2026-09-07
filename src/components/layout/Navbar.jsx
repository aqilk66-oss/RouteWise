import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, LogOut, LayoutDashboard, User, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../feedback/Toast';
import { ROLE_LABELS } from '../../constants/collections';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileDrawerRef = useRef(null);

  const { user, profile, role, isAuthenticated, loading, logout } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen && mobileDrawerRef.current) {
      document.body.style.overflow = 'hidden';
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        return () => {
          document.body.style.overflow = '';
        };
      }
      const ctx = gsap.context(() => {
        gsap.fromTo(
          mobileDrawerRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' }
        );
        gsap.fromTo(
          '.mobile-nav-item',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.25, stagger: 0.05, ease: 'power2.out', delay: 0.05 }
        );
      });
      return () => {
        ctx.revert();
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      addToast({
        title: 'Logged Out',
        message: 'Your RouteWise session has safely concluded.',
        type: 'info',
      });
      navigate('/', { replace: true });
    } catch (err) {
      console.warn("Logout error:", err.message);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Live Tracking', path: '/tracking' },
    { name: 'Safety', path: '/safety' },
    { name: 'Super Admin', path: '/super-admin' },
    { name: 'School Admin', path: '/admin' },
    { name: 'Parent Portal', path: '/parent' },
    { name: 'Driver Console', path: '/driver' },
  ];

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'glass-panel-elevated py-3 border-b border-border/70 shadow-soft'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 flex items-center justify-between">
        {/* Brand Identity with Approved Logo */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-subtle group-hover:scale-105 transition-transform duration-200 border border-brand-blue/20 bg-white p-0.5 flex items-center justify-center">
            <img
              src="/assets/logo.png"
              alt="RouteWise Logo"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-brand-navy tracking-tight group-hover:text-brand-blue transition-colors">
              RouteWise
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-slate -mt-1 hidden sm:block">
              Every Route, Under Control
            </span>
          </div>
        </Link>

        {/* Center Navigation Links & MPA Portals Dropdown */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/80 backdrop-blur-md border border-border shadow-subtle" aria-label="Main Navigation">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              location.pathname === '/' ? 'bg-brand-navy text-white shadow-soft' : 'text-brand-slate hover:text-brand-navy hover:bg-slate-100/80'
            }`}
          >
            Home
          </Link>
          <Link
            to="/features"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              location.pathname === '/features' ? 'bg-brand-navy text-white shadow-soft' : 'text-brand-slate hover:text-brand-navy hover:bg-slate-100/80'
            }`}
          >
            Features
          </Link>
          <Link
            to="/tracking"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              location.pathname === '/tracking' ? 'bg-brand-navy text-white shadow-soft' : 'text-brand-slate hover:text-brand-navy hover:bg-slate-100/80'
            }`}
          >
            Live Tracking
          </Link>
          <Link
            to="/safety"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              location.pathname === '/safety' ? 'bg-brand-navy text-white shadow-soft' : 'text-brand-slate hover:text-brand-navy hover:bg-slate-100/80'
            }`}
          >
            Safety
          </Link>

          {/* Dedicated MPA Portals Dropdown Menu */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-blue hover:text-white hover:bg-brand-blue transition-all duration-200 shadow-sm border border-brand-blue/30"
            >
              <span>Portals & Pages</span>
              <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Dropdown Card */}
            <div className="absolute top-full left-0 mt-2 w-64 p-2 bg-white rounded-2xl border border-border shadow-floating opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform -translate-y-1 group-hover:translate-y-0">
              <div className="px-3 py-1.5 text-[10px] font-bold text-brand-slate uppercase tracking-wider border-b border-border/60 mb-1">
                Multi-Page Dashboards
              </div>
              <Link
                to="/super-admin"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <span>🛡️ Super Admin Portal</span>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">System</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-blue-50 hover:text-brand-blue transition-colors"
              >
                <span>🏫 School Admin & Fleet</span>
                <span className="text-[10px] bg-blue-100 text-brand-blue px-1.5 py-0.5 rounded font-bold">Ops</span>
              </Link>
              <Link
                to="/parent"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                <span>👨‍👩‍👦 Parent Live Hub</span>
                <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">Tracking</span>
              </Link>
              <Link
                to="/driver"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-amber-50 hover:text-amber-800 transition-colors"
              >
                <span>🚌 Driver Console & HUD</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Driver</span>
              </Link>
              <Link
                to="/student"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <span>🎓 Student Transit Pass</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Pass</span>
              </Link>
              <Link
                to="/user"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <span>👤 Member Dashboard</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">Member</span>
              </Link>
              <div className="border-t border-border/60 my-1"></div>
              <Link
                to="/login"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-brand-blue hover:bg-brand-blue/10 transition-colors"
              >
                <span>⚡ Switch / Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </nav>

        {/* Right Authentication State Aware Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {loading ? (
            <div className="w-24 h-8 rounded-lg bg-slate-200/70 animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="outline" size="sm" icon={LayoutDashboard} className="font-semibold">
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="text-right">
                  <p className="text-xs font-bold text-brand-navy leading-tight truncate max-w-[120px]">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-brand-blue font-semibold">
                    {ROLE_LABELS[role] || role}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  icon={LogOut}
                  className="text-brand-slate hover:text-red-600 p-2"
                  aria-label="Log Out"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-semibold">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-brand-navy bg-white/80 border border-border shadow-subtle hover:bg-white focus-visible:ring-2 focus-visible:ring-brand-blue transition-all"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          ref={mobileDrawerRef}
          className="lg:hidden absolute top-full left-0 right-0 glass-panel-elevated border-b border-border shadow-floating p-5 transition-all"
        >
          <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isHash = link.path.includes('#');
              if (isHash) {
                return (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-nav-item py-2.5 px-4 rounded-lg text-sm font-semibold text-brand-navy hover:bg-surface-subtle transition-colors flex items-center justify-between"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-4 h-4 text-brand-slate" />
                  </a>
                );
              }
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-nav-item py-2.5 px-4 rounded-lg text-sm font-semibold text-brand-navy hover:bg-surface-subtle transition-colors flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ArrowRight className="w-4 h-4 text-brand-slate" />
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 pt-4 border-t border-border/80 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-blue" />
                    <div>
                      <p className="text-xs font-bold text-brand-navy">{displayName}</p>
                      <p className="text-[10px] text-brand-slate">{ROLE_LABELS[role] || role}</p>
                    </div>
                  </div>
                </div>
                <Link to="/dashboard" className="w-full">
                  <Button variant="primary" size="md" className="w-full" icon={LayoutDashboard}>
                    Open Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="md" onClick={handleLogout} className="w-full text-red-600" icon={LogOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full">
                  <Button variant="outline" size="md" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button variant="secondary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
