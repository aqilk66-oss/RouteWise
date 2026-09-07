import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  RefreshCw, 
  ShieldAlert, 
  AlertTriangle,
  Clock,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import incidentService from '../../../services/safety/incidentService';
import { exportService } from '../../../services/reports/exportService';
import { 
  INCIDENT_TYPES, 
  INCIDENT_TYPE_LABELS, 
  INCIDENT_SEVERITY, 
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS,
  INCIDENT_STATUS_LABELS 
} from '../../../constants/incidentConstants';

export const AdminIncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadIncidents = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await incidentService.getIncidents({
        type: filterType,
        severity: filterSeverity,
        status: filterStatus,
        limitCount: 100,
      });
      setIncidents(data);
    } catch (err) {
      console.warn('Incident load notice:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [filterType, filterSeverity, filterStatus]);

  // Client-side text filter on top of queries
  const filteredList = incidents.filter(i => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      (i.incidentId || '').toLowerCase().includes(q) ||
      (i.busNumber || '').toLowerCase().includes(q) ||
      (i.routeName || '').toLowerCase().includes(q) ||
      (i.driverName || '').toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const headers = [
      { key: 'incidentId', label: 'Incident ID' },
      { key: 'type', label: 'Type' },
      { key: 'severity', label: 'Severity' },
      { key: 'status', label: 'Status' },
      { key: 'busNumber', label: 'Bus' },
      { key: 'routeName', label: 'Route' },
      { key: 'driverName', label: 'Driver' },
      { key: 'description', label: 'Description' },
      { key: 'reportedTime', label: 'Reported Time' },
      { key: 'resolvedTime', label: 'Resolved Time' },
    ];

    const formattedData = filteredList.map(item => ({
      incidentId: item.incidentId || item.id,
      type: INCIDENT_TYPE_LABELS[item.type] || item.type,
      severity: INCIDENT_SEVERITY_LABELS[item.severity] || item.severity,
      status: INCIDENT_STATUS_LABELS[item.status] || item.status,
      busNumber: item.busNumber || 'N/A',
      routeName: item.routeName || 'N/A',
      driverName: item.driverName || 'N/A',
      description: item.description || '',
      reportedTime: item.createdAt ? new Date(item.createdAt?.seconds ? item.createdAt.seconds * 1000 : item.createdAt).toISOString() : '',
      resolvedTime: item.resolvedAt || 'N/A',
    }));

    exportService.exportToCsv('incidents_log', formattedData, headers);
  };

  const getSeverityBadgeVariant = (severity) => {
    switch (severity) {
      case INCIDENT_SEVERITY.CRITICAL: return 'danger';
      case INCIDENT_SEVERITY.HIGH: return 'warning';
      case INCIDENT_SEVERITY.MEDIUM: return 'info';
      default: return 'neutral';
    }
  };

  return (
    <DashboardLayout title="Transport Incident Records & History">
      <div className="space-y-6">
        {/* Header Block */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand-navy tracking-tight">Fleet Incident Register</h1>
            <p className="text-xs text-brand-slate mt-0.5">
              Comprehensive log of transport accidents, mechanical faults, medical issues, and driver distress alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => loadIncidents(true)}
              loading={refreshing}
            >
              Sync Records
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleExportCsv}
              disabled={filteredList.length === 0}
              className="bg-brand-navy hover:bg-slate-800 text-white font-bold"
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search ID, bus, driver, or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border font-medium focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white font-medium focus:ring-2 focus:ring-brand-blue/30 outline-none"
            >
              <option value="all">All Incident Classifications</option>
              {Object.entries(INCIDENT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white font-medium focus:ring-2 focus:ring-brand-blue/30 outline-none"
            >
              <option value="all">All Severity Levels</option>
              <option value={INCIDENT_SEVERITY.CRITICAL}>Critical (SOS / Severe)</option>
              <option value={INCIDENT_SEVERITY.HIGH}>High</option>
              <option value={INCIDENT_SEVERITY.MEDIUM}>Medium</option>
              <option value={INCIDENT_SEVERITY.LOW}>Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white font-medium focus:ring-2 focus:ring-brand-blue/30 outline-none"
            >
              <option value="all">All Lifecycles</option>
              <option value={INCIDENT_STATUS.REPORTED}>Reported (New)</option>
              <option value={INCIDENT_STATUS.ACKNOWLEDGED}>Acknowledged</option>
              <option value={INCIDENT_STATUS.INVESTIGATING}>Investigating</option>
              <option value={INCIDENT_STATUS.RESPONDING}>Responding</option>
              <option value={INCIDENT_STATUS.RESOLVED}>Resolved</option>
              <option value={INCIDENT_STATUS.CLOSED}>Closed</option>
            </select>
          </div>
        </Card>

        {/* Table View */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-brand-slate uppercase font-bold text-[11px] tracking-wider">
                  <th className="p-4">Incident ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Bus / Route</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reported</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Loading incident records...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-400">
                      No incidents match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-brand-navy">
                        {item.incidentId || item.id}
                      </td>
                      <td className="p-4 font-bold text-brand-navy">
                        {INCIDENT_TYPE_LABELS[item.type] || item.type}
                      </td>
                      <td className="p-4">
                        <Badge variant={getSeverityBadgeVariant(item.severity)} size="sm">
                          {INCIDENT_SEVERITY_LABELS[item.severity] || item.severity}
                        </Badge>
                      </td>
                      <td className="p-4 text-brand-slate">
                        <span className="font-bold text-brand-navy block">{item.busNumber}</span>
                        <span className="text-[11px]">{item.routeName}</span>
                      </td>
                      <td className="p-4 text-brand-navy font-semibold">
                        {item.driverName}
                      </td>
                      <td className="p-4">
                        <Badge variant={item.status === INCIDENT_STATUS.RESOLVED ? 'active' : item.status === INCIDENT_STATUS.CLOSED ? 'neutral' : 'warning'} size="sm">
                          {INCIDENT_STATUS_LABELS[item.status] || item.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {item.createdAt ? new Date(item.createdAt?.seconds ? item.createdAt.seconds * 1000 : item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                      </td>
                      <td className="p-4 text-right">
                        <Link to={`/admin/incidents/${item.id}`}>
                          <Button variant="outline" size="sm" icon={Eye}>
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminIncidentsPage;
