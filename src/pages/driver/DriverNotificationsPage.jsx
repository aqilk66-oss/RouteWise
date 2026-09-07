import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  RefreshCw, 
  ShieldCheck 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import { useDriverTransport } from '../../context/DriverTransportContext';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/firestore/notificationService';

export const DriverNotificationsPage = () => {
  const { user } = useAuth();
  const { driverNotifications: initialNotifs, refreshData, refreshing } = useDriverTransport();

  const [notifications, setNotifications] = useState(initialNotifs);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Subscribe to real-time driver notifications
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsubscribe = notificationService.subscribeToUserNotifications(
      user.uid,
      (liveNotifs) => {
        if (liveNotifs.length > 0) {
          setNotifications(liveNotifs);
        } else {
          setNotifications(initialNotifs);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Driver notifications subscription note:', err.message);
        setNotifications(initialNotifs);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, initialNotifs]);

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
      showToast('Dispatch notice acknowledged.');
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
      showToast('All dispatch notices acknowledged.');
      refreshData();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <DashboardLayout title="Driver Dispatch Advisories & Route Notices">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-fade-in shadow-soft">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Dispatch Communications & Bulletins</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Urgent fleet advisories, route detour alerts, and schedule changes.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Refresh Notices
          </Button>
        </div>

        {/* Reusable Notification Center */}
        <NotificationCenter
          notifications={notifications}
          loading={loading}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          role="driver"
        />
      </div>
    </DashboardLayout>
  );
};

export default DriverNotificationsPage;
