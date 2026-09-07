import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/forms/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/feedback/Toast';
import { getAuthErrorMessage } from '../services/auth/authErrors';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ type: null, message: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const { login, resetPassword, switchRole } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await login(email.trim(), password);
      addToast({
        title: 'Welcome Back',
        message: 'Successfully authenticated to RouteWise.',
        type: 'success',
      });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetStatus({ type: 'error', message: 'Please enter your account email address.' });
      return;
    }

    try {
      await resetPassword(resetEmail.trim());
      setResetStatus({
        type: 'success',
        message: 'Password reset link has been dispatched if an account matches this email.',
      });
      setTimeout(() => {
        setResetModalOpen(false);
        setResetStatus({ type: null, message: '' });
      }, 3000);
    } catch (err) {
      setResetStatus({ type: 'error', message: getAuthErrorMessage(err) });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your RouteWise school transport workspace"
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Institutional Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@school.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-brand-slate hover:text-brand-navy p-1 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-brand-slate select-none">
            <input type="checkbox" defaultChecked className="rounded text-brand-blue" />
            <span>Stay signed in</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setResetEmail(email);
              setResetModalOpen(true);
            }}
            className="text-brand-blue hover:underline font-semibold"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
          className="w-full mt-2"
        >
          {loading ? 'Authenticating...' : 'Sign In to Portal'}
        </Button>
      </form>

      {/* Instant Demo Role Switcher (1-Click Workspace Preview for any Role) */}
      <div className="mt-6 pt-5 border-t border-border">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">
            One-Click Demo Roles
          </span>
          <span className="text-[10px] bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full font-bold">
            Interactive MPA
          </span>
        </div>
        <p className="text-[11px] text-brand-slate mb-3">
          Click any role below to instantly enter that portal workspace without typing credentials:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Super Admin', role: 'superAdmin', path: '/super-admin', color: 'hover:border-purple-400 hover:bg-purple-50/50' },
            { label: 'School Admin', role: 'admin', path: '/admin', color: 'hover:border-blue-400 hover:bg-blue-50/50' },
            { label: 'Transport Mgr', role: 'transportManager', path: '/admin', color: 'hover:border-sky-400 hover:bg-sky-50/50' },
            { label: 'Bus Driver', role: 'driver', path: '/driver', color: 'hover:border-amber-400 hover:bg-amber-50/50' },
            { label: 'Parent Portal', role: 'parent', path: '/parent', color: 'hover:border-teal-400 hover:bg-teal-50/50' },
            { label: 'Student Pass', role: 'student', path: '/student', color: 'hover:border-emerald-400 hover:bg-emerald-50/50' },
          ].map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => {
                const demoEmail = `${item.role.toLowerCase()}@routewise.school`;
                setEmail(demoEmail);
                setPassword('RouteWise2026!');
                // Auto-fill and execute role switch
                if (typeof switchRole === 'function') {
                  switchRole(item.role);
                }
                addToast({
                  title: `${item.label} Activated`,
                  message: `Switched session to ${item.label}. Navigating to workspace...`,
                  type: 'info',
                });
                navigate(item.path, { replace: true });
              }}
              className={`p-2.5 text-left border border-border rounded-xl text-xs font-bold text-brand-navy transition-all ${item.color} flex items-center justify-between group`}
            >
              <span>{item.label}</span>
              <ArrowRight className="w-3 h-3 text-brand-slate group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Forgot Password Dialogue */}
      {resetModalOpen && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-xs font-bold text-brand-navy mb-1">Reset Account Password</h4>
          <p className="text-[11px] text-brand-slate mb-3">
            Enter your registered email to receive secure recovery instructions.
          </p>

          {resetStatus.message && (
            <div
              className={`p-2.5 rounded-lg text-xs mb-3 flex items-center gap-2 ${
                resetStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {resetStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{resetStatus.message}</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="name@school.edu"
              className="flex-1 rounded-lg text-xs border border-border px-3 py-2 outline-none focus:border-brand-blue"
            />
            <Button variant="outline" size="sm" onClick={handleResetPassword}>
              Send Link
            </Button>
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="text-xs text-brand-slate hover:text-brand-navy px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-brand-slate">
        Need a school transport account?{' '}
        <Link to="/register" className="text-brand-blue font-semibold hover:underline">
          Register New Account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
