import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Bus, 
  Info, 
  Calendar, 
  Radio, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import { NOTIFICATION_TYPE, NOTIFICATION_PRIORITY } from '../../constants/collections';

/**
 * Format relative time (e.g. "5 mins ago", "Today at 07:45 AM")
 */
const formatNotificationTime = (createdAt) => {
  if (!createdAt) return 'Recent';
  const timeMs = typeof createdAt === 'number' 
    ? createdAt 
    : createdAt.seconds 
    ? createdAt.seconds * 1000 
    : createdAt.toMillis 
    ? createdAt.toMillis() 
    : Date.now();

  const diffSec = Math.floor((Date.now() - timeMs) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const date = new Date(timeMs);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Reusable, Accessible Notification Center Component
 */
export const NotificationCenter = ({
  notifications = [],
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  role = 'parent',
}) => {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unread' | 'urgent' | 'trip'

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filterTab === 'unread') return !n.read;
      if (filterTab === 'urgent') return n.priority === NOTIFICATION_PRIORITY.URGENT || n.type === NOTIFICATION_TYPE.DELAY || n.type === NOTIFICATION_TYPE.SAFETY;
      if (filterTab === 'trip') return n.type === NOTIFICATION_TYPE.TRIP || n.type === NOTIFICATION_TYPE.ARRIVAL;
      return true;
    });
  }, [notifications, filterTab]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const getTypeIcon = (type, priority) => {
    if (priority === NOTIFICATION_PRIORITY.URGENT || type === NOTIFICATION_TYPE.SAFETY) {
      return <ShieldAlert className="w-5 h-5 text-rose-600" />;
    }
    if (type === NOTIFICATION_TYPE.DELAY || type === NOTIFICATION_TYPE.CANCELLATION) {
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    }
    if (type === NOTIFICATION_TYPE.TRIP || type === NOTIFICATION_TYPE.ARRIVAL) {
      return <Bus className="w-5 h-5 text-brand-blue" />;
    }
    return <Info className="w-5 h-5 text-brand-teal" />;
  };

  const getPriorityBadge = (priority) => {
    if (priority === NOTIFICATION_PRIORITY.URGENT) {
      return <Badge variant="danger" size="sm">Urgent</Badge>;
    }
    if (priority === NOTIFICATION_PRIORITY.IMPORTANT) {
      return <Badge variant="warning" size="sm">Important</Badge>;
    }
    return null;
  };

  const getRelatedDestination = (n) => {
    if (n.relatedTripId) {
      if (role === 'driver') return `/driver/trips/${n.relatedTripId}`;
      if (role === 'student') return `/student/trips/${n.relatedTripId}`;
      return `/parent/tracking`;
    }
    if (role === 'driver') return `/driver/route`;
    if (role === 'student') return `/student/transport`;
    return `/parent/tracking`;
  };

  return (
    <div className="space-y-4">
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white border border-border rounded-2xl shadow-soft">
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'urgent', label: 'Urgent & Delays' },
            { id: 'trip', label: 'Transit Runs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterTab === tab.id
                  ? 'bg-brand-blue text-white shadow-soft'
                  : 'text-brand-navy hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mark All As Read */}
        {unreadCount > 0 && onMarkAllAsRead && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={onMarkAllAsRead}
            className="shrink-0 self-end sm:self-center text-brand-navy"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications Body */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-border space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="No unread transport alerts, delay notices, or bulletins for your account."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.read;
            const destination = getRelatedDestination(notif);

            return (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isUnread
                    ? 'bg-blue-50/50 border-blue-200/90 shadow-soft'
                    : 'bg-white border-border shadow-soft opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 shadow-soft ${
                    notif.priority === NOTIFICATION_PRIORITY.URGENT 
                      ? 'bg-rose-50 border border-rose-200' 
                      : 'bg-white border border-border'
                  }`}>
                    {getTypeIcon(notif.type, notif.priority)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-brand-navy truncate">
                        {notif.title || 'Transportation Bulletin'}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0 animate-pulse" />
                      )}
                      {getPriorityBadge(notif.priority)}
                    </div>
                    <p className="text-xs text-brand-slate leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-brand-slate/80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatNotificationTime(notif.createdAt)}
                      </span>
                      {notif.relatedTripId && (
                        <Link
                          to={destination}
                          className="text-brand-blue font-semibold hover:underline flex items-center gap-0.5"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {isUnread && onMarkAsRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={CheckCheck}
                    onClick={() => onMarkAsRead(notif.id)}
                    className="self-end sm:self-center shrink-0"
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
