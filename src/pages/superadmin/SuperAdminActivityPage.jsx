import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Calendar, 
  User, 
  ShieldCheck, 
  Building2, 
  Sliders, 
  FileText,
  Filter,
  RefreshCw
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import { auditService } from '../../services/admin/auditService';
import Loader from '../../components/ui/Loader';

const SuperAdminActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  const fetchActivity = async () => {
    try {
      const logs = await auditService.getAuditLogs({ pageSize: 40 });
      setActivities(logs);
    } catch (error) {
      console.error('Error fetching activity stream:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivity();
  };

  const filtered = activities.filter(a => {
    if (filterType === 'ALL') return true;
    return a.resourceType === filterType;
  });

  return (
    <SuperAdminLayout title="Platform Activity Stream">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              Administrative Activity Stream
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate mt-0.5">
              Chronological operational timeline of governance actions, campus updates, and user modifications.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="ALL">All Event Types</option>
              <option value="user">User Actions</option>
              <option value="school">Campus Updates</option>
              <option value="systemConfig">Configuration</option>
              <option value="security">Security</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-brand-navy rounded-xl text-xs font-bold border border-border shadow-soft flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Timeline Stream */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-soft">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader variant="inline" text="Loading platform activity..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-navy">No activity records found</p>
              <p className="text-xs text-brand-slate mt-0.5">Administrative events will appear in this timeline as they occur.</p>
            </div>
          ) : (
            <div className="relative border-l border-slate-200 ml-4 space-y-8 pl-6">
              {filtered.map((item) => {
                const dateStr = item.timestamp?.toDate
                  ? item.timestamp.toDate().toLocaleString()
                  : 'Recent';

                return (
                  <div key={item.id} className="relative group">
                    {/* Timeline Node */}
                    <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-brand-navy border-2 border-white shadow-soft" />

                    <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-100 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-800">
                            {item.action}
                          </span>
                          <span className="text-xs font-bold text-brand-navy">
                            {item.resourceType} : {item.resourceId || 'System'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {dateStr}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Initiated by: <strong className="text-slate-600">{item.actorRole || 'System'}</strong></span>
                        <span className="font-mono">Audit ID: {item.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminActivityPage;
