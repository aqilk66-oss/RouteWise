import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  RefreshCw, 
  GraduationCap 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import { useStudentTransport } from '../../context/StudentTransportContext';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/firestore/notificationService';

export const StudentNotificationsPage = () => {
  const { user } = useAuth();
  const { studentNotifications: initialNotifs, refreshData, refreshing } = useStudentTransport();

  const [notifications, setNotifications] = useState(initialNotifs);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Subscribe to real-time student notifications
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
        console.warn('Student notifications subscription note:', err.message);
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

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      showToast('Notice marked as read.');
      refreshData();
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (user?.uid) {
        await notificationService.markAllAsRead(user.uid);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('All notices marked as read.');
      refreshData();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <DashboardLayout title="Student Notices & Route Bulletins">
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
            <h2 className="text-lg font-bold text-brand-navy">School Bus Notices</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Important updates about your morning pickup and afternoon drop-off routes.
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

        {/* Notification Feed */}
        <NotificationCenter
          notifications={notifications}
          loading={loading}
          onMarkAsRead={handleMarkRead}
          onMarkAllAsRead={handleMarkAllRead}
          role="student"
        />
      </div>
    </DashboardLayout>
  );
};

export default StudentNotificationsPage;
