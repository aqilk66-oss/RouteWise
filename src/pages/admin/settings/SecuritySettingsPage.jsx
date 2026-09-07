import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Send, 
  Lock, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  Laptop
} from 'lucide-react';
import SettingsLayout from '../../../components/settings/SettingsLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuth } from '../../../context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';

export const SecuritySettingsPage = () => {
  const { user, resetPassword, logout } = useAuth();
  const [sendingReset, setSendingReset] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    setErrorMessage(null);
    try {
      await resetPassword(user.email);
      setToastMessage(`A secure password reset link has been dispatched to ${user.email}.`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to transmit password reset email.');
    } finally {
      setSendingReset(false);
    }
  };

  const handleSendEmailVerification = async () => {
    if (!user) return;
    setSendingVerification(true);
    setErrorMessage(null);
    try {
      await sendEmailVerification(user);
      setToastMessage(`A verification link has been sent to ${user.email}.`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to send email verification.');
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <SettingsLayout
      title="Security, Authentication & Audit"
      subtitle="Manage your credentials, verify security channels, and review active session parameters."
      toastMessage={toastMessage}
      errorMessage={errorMessage}
    >
      <div className="space-y-6">
        {/* Section 1: Password & Credential Security */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <KeyRound className="w-5 h-5 text-brand-blue" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Password & Authentication Management</h2>
              <p className="text-[11px] text-brand-slate">
                Encrypted credentials powered by Firebase Authentication. Passwords are never stored in plaintext.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-brand-navy block">Dispatch Password Reset Link</span>
              <span className="text-[11px] text-brand-slate">
                Receive an encrypted reset token at <strong className="text-brand-navy">{user?.email}</strong>.
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Send}
              onClick={handleSendPasswordReset}
              loading={sendingReset}
            >
              Send Reset Email
            </Button>
          </div>
        </Card>

        {/* Section 2: Email Verification Status */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Mail className="w-5 h-5 text-brand-teal" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Email Verification Status</h2>
              <p className="text-[11px] text-brand-slate">Ensures your administrative email is authenticated to receive security bulletins.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${user?.emailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {user?.emailVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-navy">{user?.email}</span>
                  <Badge variant={user?.emailVerified ? 'active' : 'warning'} size="sm">
                    {user?.emailVerified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>
                <span className="text-[11px] text-brand-slate">
                  {user?.emailVerified
                    ? 'Your email address is verified and active for security communications.'
                    : 'Please verify your address to ensure uninterrupted administrative notices.'}
                </span>
              </div>
            </div>

            {!user?.emailVerified && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Mail}
                onClick={handleSendEmailVerification}
                loading={sendingVerification}
              >
                Resend Verification
              </Button>
            )}
          </div>
        </Card>

        {/* Section 3: Active Session Security & Environment */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Laptop className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Active Session & Audit Details</h2>
              <p className="text-[11px] text-brand-slate">Session metadata managed by browser local storage persistence.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-brand-slate block text-[11px]">Last Sign-In Timestamp</span>
              <span className="font-bold text-brand-navy mt-1 block">
                {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Current Session'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-brand-slate block text-[11px]">Account Creation Timestamp</span>
              <span className="font-bold text-brand-navy mt-1 block">
                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-brand-slate">
              To disconnect your session on this device, use the secure sign out control.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={logout}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Sign Out of Session
            </Button>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default SecuritySettingsPage;
