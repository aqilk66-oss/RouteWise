import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  CheckCheck, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  Bus, 
  CheckCircle 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { notificationService } from '../../services/firestore';
import { NOTIFICATION_TYPE } from '../../constants/collections';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: NOTIFICATION_TYPE.GENERAL,
    recipientRole: 'all', // 'all' | 'parent' | 'driver'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await notificationService.getAll({ max: 200 });
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      showToast('Notification marked as read.');
      await fetchData();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await notificationService.createNotification({
        ...formData,
        read: false,
        timestamp: new Date().toISOString(),
      });
      showToast('Broadcast dispatched across parent and driver channels.');
      setIsBroadcastOpen(false);
      setFormData({
        title: '',
        message: '',
        type: NOTIFICATION_TYPE.GENERAL,
        recipientRole: 'all',
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to send broadcast:', err);
      alert(`Error broadcasting alert: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPE.SAFETY:
        return <ShieldAlert className="w-4 h-4 text-status-danger" />;
      case NOTIFICATION_TYPE.DELAY:
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case NOTIFICATION_TYPE.TRIP:
        return <Bus className="w-4 h-4 text-brand-blue" />;
      default:
        return <Info className="w-4 h-4 text-brand-teal" />;
    }
  };

  const columns = [
    {
      header: 'Alert & Headline',
      key: 'title',
      sortable: true,
      render: (row) => (
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
            {getTypeIcon(row.type)}
          </div>
          <div>
            <p className="font-bold text-brand-navy">{row.title || 'Platform Notification'}</p>
            <p className="text-xs text-brand-slate max-w-md mt-0.5 line-clamp-2">
              {row.message || 'No additional message details provided.'}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Audience',
      key: 'recipientRole',
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-brand-navy uppercase text-[10px]">
          {row.recipientRole || 'Broadcast'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'read',
      render: (row) => (
        <Badge variant={row.read ? 'neutral' : 'active'}>
          {row.read ? 'Acknowledged' : 'Unread'}
        </Badge>
      ),
    },
    {
      header: 'Time Dispatched',
      key: 'createdAt',
      render: (row) => (
        <span className="text-[11px] text-brand-slate">
          {row.createdAt?.seconds 
            ? new Date(row.createdAt.seconds * 1000).toLocaleDateString()
            : 'Recent'}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout title="Notification Center & Emergency Broadcasts">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Communications & Fleet Bulletins</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Send delay advisories, safety bulletins, and route change announcements directly to parents.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => setIsBroadcastOpen(true)}
            >
              Send Broadcast
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={notifications}
          loading={loading}
          searchPlaceholder="Search bulletins by title or message..."
          searchField={(row, q) =>
            (row.title && row.title.toLowerCase().includes(q)) ||
            (row.message && row.message.toLowerCase().includes(q))
          }
          emptyTitle="No notification bulletins"
          emptyDescription="Broadcast announcements will appear in the portal and mobile client feeds."
          emptyActionText="Send Announcement"
          onEmptyAction={() => setIsBroadcastOpen(true)}
          actions={(row) =>
            !row.read && (
              <button
                onClick={() => handleMarkAsRead(row.id)}
                className="p-1.5 rounded-lg text-brand-slate hover:bg-slate-100 hover:text-brand-navy transition-colors flex items-center gap-1 text-[11px]"
                title="Mark Read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-brand-teal" />
                <span>Mark Read</span>
              </button>
            )
          }
        />

        {/* Broadcast Modal */}
        <Modal
          isOpen={isBroadcastOpen}
          onClose={() => setIsBroadcastOpen(false)}
          title="Dispatch Fleet Bulletin"
          subtitle="Real-time alert message routed to active guardian mobile passes."
        >
          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-brand-navy mb-1">Alert Headline *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Weather Delay Advisory: Corridor 14"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value={NOTIFICATION_TYPE.GENERAL}>General Notice</option>
                  <option value={NOTIFICATION_TYPE.DELAY}>Delay Advisory</option>
                  <option value={NOTIFICATION_TYPE.SAFETY}>Safety Notice</option>
                  <option value={NOTIFICATION_TYPE.TRIP}>Transit Update</option>
                  <option value={NOTIFICATION_TYPE.CANCELLATION}>Cancellation</option>
                  <option value={NOTIFICATION_TYPE.SCHEDULE}>Schedule Change</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Target Audience</label>
                <select
                  value={formData.recipientRole}
                  onChange={(e) => setFormData({ ...formData, recipientRole: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value="all">All Stakeholders</option>
                  <option value="parent">Parents Only</option>
                  <option value="driver">Drivers Only</option>
                  <option value="student">Students Only</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Priority</label>
                <select
                  value={formData.priority || 'normal'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white font-semibold"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Bulletin Message *</label>
              <textarea
                rows="3"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter detailed instructions or explanation..."
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none resize-none"
              />
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBroadcastOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={saving}>
                Dispatch Bulletin
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
