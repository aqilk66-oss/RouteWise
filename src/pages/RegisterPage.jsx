import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/forms/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/feedback/Toast';
import { getAuthErrorMessage } from '../services/auth/authErrors';
import { DEFAULT_ROLE } from '../constants/collections';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Safe default role 'user' assigned automatically
      await register({
        fullName: formData.fullName.trim(),
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: DEFAULT_ROLE,
      });

      addToast({
        title: 'Account Created',
        message: 'Welcome to RouteWise! Initializing your workspace.',
        type: 'success',
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register for RouteWise school transport visibility"
    >
      <form onSubmit={handleRegister} className="space-y-3.5">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Full Legal Name"
          name="fullName"
          autoComplete="name"
          placeholder="e.g. Eleanor Vance"
          value={formData.fullName}
          onChange={handleChange}
          icon={User}
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@school.edu"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          required
        />

        <Input
          label="Contact Mobile (Optional)"
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={handleChange}
          icon={Phone}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
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

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={Lock}
          required
        />

        <div className="p-3 rounded-xl bg-blue-50/70 border border-brand-blue/20 text-[11px] text-brand-navy">
          <span>
            Public registration assigns standard <strong>User</strong> access. Privileged roles (Parent, Driver, Student, Admin) are granted through verified school transport enrollment or administrative provisioning.
          </span>
        </div>

        <Button
          type="submit"
          variant="secondary"
          size="md"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
          className="w-full mt-2"
        >
          {loading ? 'Creating Profile...' : 'Complete Registration'}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-brand-slate">
        Already have a RouteWise pass?{' '}
        <Link to="/login" className="text-brand-blue font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
