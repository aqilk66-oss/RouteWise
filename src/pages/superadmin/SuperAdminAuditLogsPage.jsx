import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  X,
  Clock,
  Building2,
  RefreshCw,
  Eye
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { auditService } from '../../services/admin/auditService';
import { schoolService } from '../../services/admin/schoolService';
import Loader from '../../components/ui/Loader';

const SuperAdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [resourceFilter, setResourceFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [schoolFilter, setSchoolFilter] = useState('ALL');

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogsAndSchools = async () => {
    try {
      const [fetchedLogs, fetchedSchools] = await Promise.all([
        auditService.getAuditLogs({ pageSize: 100 }),
        schoolService.getAllSchools()
      ]);
      setLogs(fetchedLogs);
      setSchools(fetchedSchools);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogsAndSchools();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogsAndSchools();
  };

  // CSV Export Functionality
  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No audit logs available to export.');
      return;
    }

    const headers = ['Audit ID', 'Timestamp', 'Actor ID', 'Actor Role', 'Action', 'Resource Type', 'Resource ID', 'Severity', 'Description'];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp?.toDate ? l.timestamp.toDate().toISOString() : ''}"`,
      `"${l.actorUserId || ''}"`,
      `"${l.actorRole || ''}"`,
      `"${l.action || ''}"`,
      `"${l.resourceType || ''}"`,
      `"${l.resourceId || ''}"`,
      `"${l.severity || ''}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `routewise_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logs
  const filteredLogs = logs.filter(l => {
    const desc = (l.description || '').toLowerCase();
    const action = (l.action || '').toLowerCase();
    const actor = (l.actorUserId || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || desc.includes(query) || action.includes(query) || actor.includes(query);

    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    const matchesResource = resourceFilter === 'ALL' || l.resourceType === resourceFilter;
    const matchesSeverity = severityFilter === 'ALL' || l.severity === severityFilter;
    const matchesSchool = schoolFilter === 'ALL' || l.schoolId === schoolFilter;

    return matchesSearch && matchesAction && matchesResource && matchesSeverity && matchesSchool;
  });

  return (
    <SuperAdminLayout title="Immutable System Audit Trail">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-brand-teal text-[10px] font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3 h-3" /> Append-Only Compliance Ledger
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              Immutable System Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
              Cryptographically ordered, tamper-resistant record of administrative and state-changing events.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-brand-navy rounded-xl text-xs font-bold border border-border shadow-soft flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-brand-navy hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-4 rounded-2xl border border-border shadow-soft space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit descriptions, actions, or actor IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full md:w-36 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="ALL">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>

            {/* Resource Type Filter */}
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="w-full md:w-40 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="ALL">All Resources</option>
              <option value="user">User</option>
              <option value="school">School</option>
              <option value="systemConfig">System Config</option>
              <option value="security">Security</option>
              <option value="trip">Trip</option>
              <option value="incident">Incident</option>
            </select>

            {/* School Filter */}
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full md:w-44 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="ALL">All Campuses</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name || s.schoolName || s.id}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader variant="inline" text="Loading ledger history..." />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-navy">No audit events match current criteria</p>
              <p className="text-xs text-brand-slate mt-0.5">Adjust your filters to inspect historical ledger events.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLogs.map((log) => {
                    const dateStr = log.timestamp?.toDate
                      ? log.timestamp.toDate().toLocaleString()
                      : 'Just now';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {dateStr}
                        </td>

                        {/* Action Badge */}
                        <td className="py-3 px-4 font-mono font-bold text-brand-navy whitespace-nowrap">
                          {log.action}
                        </td>

                        {/* Actor */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-700 block">
                            {log.actorRole || 'System'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[120px]">
                            {log.actorUserId || 'N/A'}
                          </span>
                        </td>

                        {/* Resource */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {log.resourceType || 'General'}
                          </span>
                        </td>

                        {/* Severity */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            log.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {log.severity || 'info'}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                          {log.description}
                        </td>

                        {/* Action: Inspect */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 text-slate-500 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition-colors"
                            title="Inspect Audit Event"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Inspection Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-brand-blue">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-navy">Audit Record Inspection</h3>
                    <p className="text-xs text-brand-slate font-mono">ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs pt-2">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500 font-medium">Timestamp</span>
                  <span className="font-mono text-slate-700">
                    {selectedLog.timestamp?.toDate ? selectedLog.timestamp.toDate().toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500 font-medium">Action Performed</span>
                  <span className="font-bold text-brand-navy">{selectedLog.action}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500 font-medium">Actor Role</span>
                  <span className="font-bold text-brand-blue">{selectedLog.actorRole || 'System'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500 font-medium">Actor UID</span>
                  <span className="font-mono text-slate-600">{selectedLog.actorUserId || 'N/A'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500 font-medium">Resource Type / Target</span>
                  <span className="font-mono text-slate-700">
                    {selectedLog.resourceType} : {selectedLog.resourceId || 'N/A'}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500 font-medium">Severity Classification</span>
                  <span className="font-bold uppercase text-slate-700">{selectedLog.severity || 'info'}</span>
                </div>
                <div className="py-2.5">
                  <span className="text-slate-500 font-medium block mb-1">Full Description</span>
                  <p className="p-3 rounded-xl bg-slate-50 text-slate-700 font-medium leading-relaxed">
                    {selectedLog.description}
                  </p>
                </div>
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="py-2.5">
                    <span className="text-slate-500 font-medium block mb-1">Audit Payload Metadata</span>
                    <pre className="p-3 rounded-xl bg-slate-900 text-brand-teal font-mono text-[11px] overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-brand-navy rounded-xl text-xs font-bold transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAuditLogsPage;
