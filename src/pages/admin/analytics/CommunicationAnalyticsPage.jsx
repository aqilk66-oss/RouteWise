import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  ShieldCheck,
  Search
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import AnalyticsNavHeader from '../../../components/analytics/AnalyticsNavHeader';
import MetricCard from '../../../components/ui/MetricCard';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import DonutBreakdown from '../../../components/charts/DonutBreakdown';
import BarChartVisualizer from '../../../components/charts/BarChartVisualizer';
import { analyticsService } from '../../../services/analytics/analyticsService';
import { getPeriodDateRange } from '../../../services/reports/reportService';
import { exportToCSV } from '../../../services/reports/exportService';

export const CommunicationAnalyticsPage = () => {
  const [period, setPeriod] = useState('last7days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const dateRange = getPeriodDateRange(period);
      const dataset = await analyticsService.fetchAnalyticsDataset({
        startDate: dateRange.startDateStr,
        endDate: dateRange.endDateStr,
      });

      setNotifications(dataset.notifications || []);
    } catch (err) {
      console.error('Failed to load communication analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const totalNotifications = notifications.length;
  const readNotifications = notifications.filter((n) => n.read).length;
  const unreadNotifications = totalNotifications - readNotifications;
  const readRate = totalNotifications > 0 ? Math.round((readNotifications / totalNotifications) * 100) : null;

  // Type categorization
  const urgentAlerts = notifications.filter((n) => n.priority === 'urgent' || n.type === 'safety' || n.type === 'cancellation').length;
  const delayAlerts = notifications.filter((n) => n.type === 'delay').length;
  const tripAlerts = notifications.filter((n) => n.type === 'trip').length;
  const generalAlerts = totalNotifications - (urgentAlerts + delayAlerts + tripAlerts);

  // EmailJS status check
  const emailJsConfigured = Boolean(
    import.meta.env.VITE_EMAILJS_SERVICE_ID &&
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );

  const handleExportCSV = () => {
    setExporting(true);
    try {
      const rows = notifications.map((n) => ({
        NotificationId: n.id || n.notificationId,
        Title: n.title,
        Type: n.type || 'general',
        Priority: n.priority || 'normal',
        RecipientRole: n.recipientRole || 'all',
        ReadStatus: n.read ? 'Read' : 'Unread',
        CreatedDate: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'N/A',
        Period: period,
      }));
      exportToCSV(rows, `routewise-communications-analytics-${period}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (n.type && n.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (n.recipientRole && n.recipientRole.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categoryData = [
    { label: 'Safety / Urgent', value: urgentAlerts, color: '#ef4444' },
    { label: 'Transit Delay', value: delayAlerts, color: '#f59e0b' },
    { label: 'Trip Departures', value: tripAlerts, color: '#2563eb' },
    { label: 'General Bulletins', value: generalAlerts > 0 ? generalAlerts : 0, color: '#94a3b8' },
  ];

  const columns = [
    {
      header: 'Communication Headline',
      key: 'title',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-brand-navy">{row.title}</span>
          <p className="text-[10px] text-brand-slate line-clamp-1">{row.message}</p>
        </div>
      ),
    },
    {
      header: 'Category & Type',
      key: 'type',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold uppercase text-brand-slate px-2 py-0.5 rounded bg-slate-100">
          {row.type || 'General'}
        </span>
      ),
    },
    {
      header: 'Target Audience',
      key: 'recipientRole',
      render: (row) => (
        <span className="text-xs text-brand-slate font-medium">
          {row.recipientRole || 'All Roles'}
        </span>
      ),
    },
    {
      header: 'Read Acknowledgment',
      key: 'read',
      sortable: true,
      render: (row) => (
        <Badge variant={row.read ? 'neutral' : 'active'}>
          {row.read ? 'Acknowledged' : 'Unread'}
        </Badge>
      ),
    },
    {
      header: 'Date Logged',
      key: 'createdAt',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-brand-slate">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout title="Dispatch Communication & Broadcast Analytics">
      <AnalyticsNavHeader
        title="Communication & Broadcast Analytics"
        subtitle="Transparent audit of platform dispatch advisories, urgent safety alerts, and guardian notification read rates."
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => loadData(true)}
        onExport={handleExportCSV}
        refreshing={refreshing}
        exporting={exporting}
      />

      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <MetricCard
            title="Total Communications"
            value={totalNotifications}
            sublabel="In-app dispatch advisories"
            icon={Bell}
          />
          <MetricCard
            title="Urgent Alerts"
            value={urgentAlerts}
            sublabel="Safety and cancellation notices"
            icon={AlertTriangle}
            status={urgentAlerts > 0 ? 'warning' : 'positive'}
          />
          <MetricCard
            title="Read Acknowledgment"
            value={readRate !== null ? `${readRate}%` : '—'}
            sublabel={`${readNotifications} read of ${totalNotifications}`}
            icon={CheckCircle2}
            status="positive"
          />
          <MetricCard
            title="EmailJS Gateway"
            value={emailJsConfigured ? 'Configured' : 'Not Configured'}
            sublabel={emailJsConfigured ? 'Active external email relay' : 'Credentials unassigned'}
            icon={Mail}
            status={emailJsConfigured ? 'positive' : 'neutral'}
          />
        </div>

        {/* Breakdown and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-brand-navy mb-1">Alert Categories</h3>
            <p className="text-xs text-brand-slate mb-4">Volume breakdown across communication types.</p>
            <DonutBreakdown
              data={categoryData}
              centerLabel="Alerts"
              centerValue={totalNotifications}
            />
          </Card>

          <Card className="p-5 lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Logged Dispatch Communications</h3>
                <p className="text-xs text-brand-slate">Showing {filteredNotifications.length} communications.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search alert title or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-border rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredNotifications}
              loading={loading}
              emptyText="No communications recorded during this period."
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommunicationAnalyticsPage;
