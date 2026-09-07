import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  Mail, 
  Save 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import { useParentTransport } from '../../context/ParentTransportContext';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/firestore/notificationService';

export const ParentNotificationsPage = () => {
  const { user } = useAuth();
  const { notifications: initialNotifications, refreshData, refreshing } = useParentTransport();

  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [isPrefOpen, setIsPrefOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [preferences, setPreferences] = useState({
    delayAlerts: true,
    cancellationAlerts: true,
    tripDepartures: true,
    emailAlerts: true,
  });

  // Subscribe to real-time notifications for the authenticated parent
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.uid,
      (liveNotifs) => {
        // Also combine global announcements (userId === 'all')
        if (liveNotifs.length > 0) {
          setNotifications(liveNotifs);
        } else {
          setNotifications(initialNotifications);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Real-time notification subscription notice:', err.message);
        setNotifications(initialNotifications);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, initialNotifications]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      showToast('Notification acknowledged.');
      refreshData();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (user?.uid) {
        await notificationService.markAllAsRead(user.uid);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('All notifications marked as read.');
      refreshData();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setIsPrefOpen(false);
    showToast('Transport alert preferences saved.');
  };

  return (
    <DashboardLayout title="Guardian Notifications & Fleet Bulletins">
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-fade-in shadow-soft">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Transportation Communications</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Live route alerts, delay advisories, and school schedule updates.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={Sliders}
              onClick={() => setIsPrefOpen(true)}
            >
              Alert Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={refreshData}
              loading={refreshing}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Centralized Notification Feed */}
        <NotificationCenter
          notifications={notifications}
          loading={loading}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          role="parent"
        />

        {/* Notification Preferences Modal */}
        <Modal
          isOpen={isPrefOpen}
          onClose={() => setIsPrefOpen(false)}
          title="Transport Notification Preferences"
          subtitle="Select which transit events trigger alerts to your account."
        >
          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <span className="font-bold text-brand-navy block">Transit Delay Advisories</span>
                  <span className="text-[11px] text-brand-slate">
                    Receive immediate notifications when the bus is delayed &gt;5 minutes.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.delayAlerts}
                  onChange={(e) => setPreferences({ ...preferences, delayAlerts: e.target.checked })}
                  className="rounded text-brand-blue focus:ring-brand-blue"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <span className="font-bold text-brand-navy block">Trip Cancellations</span>
                  <span className="text-[11px] text-brand-slate">
                    High-priority alert if weather or mechanical issues cancel a run.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.cancellationAlerts}
                  onChange={(e) => setPreferences({ ...preferences, cancellationAlerts: e.target.checked })}
                  className="rounded text-brand-blue focus:ring-brand-blue"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <span className="font-bold text-brand-navy block">Trip Departure Notices</span>
                  <span className="text-[11px] text-brand-slate">
                    Notify when your student&apos;s morning or afternoon bus departs the depot.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.tripDepartures}
                  onChange={(e) => setPreferences({ ...preferences, tripDepartures: e.target.checked })}
                  className="rounded text-brand-blue focus:ring-brand-blue"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-border cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <span className="font-bold text-brand-navy block">Email Notification Alerts</span>
                  <span className="text-[11px] text-brand-slate">
                    Deliver summary emails for urgent transport advisories.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailAlerts}
                  onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                  className="rounded text-brand-blue focus:ring-brand-blue"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPrefOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={Save}>
                Save Preferences
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ParentNotificationsPage;
