import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Bus,
  Route
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { recoveryBinService } from '../../services/backup/recoveryBinService';
import { useAuth } from '../../context/AuthContext';

export const SuperAdminRecoveryPage = () => {
  const { user, profile } = useAuth();
  const [binItems, setBinItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const list = await recoveryBinService.getAll({
        sortBy: 'archivedAt',
        sortDirection: 'desc',
        max: 100,
      });
      setBinItems(list || []);
    } catch (err) {
      console.error('Failed to load recovery bin items:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRestore = async (binRecordId) => {
    setRestoringId(binRecordId);
    try {
      await recoveryBinService.restoreEntityFromRecoveryBin(binRecordId, {
        uid: user?.uid,
        name: profile?.fullName || user?.email,
        role: 'superAdmin',
      });
      showToast('Record restored successfully to active operations with verified relationships.');
      loadData(true);
    } catch (err) {
      alert(`Restoration blocked: ${err.message}`);
    } finally {
      setRestoringId(null);
    }
  };

  const filteredItems = binItems.filter((item) =>
    (item.entityType && item.entityType.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.entityId && item.entityId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.reason && item.reason.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns = [
    {
      header: 'Entity Classification',
      key: 'entityType',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-brand-navy capitalize">{row.entityType}</span>
          <p className="text-[10px] font-mono text-brand-slate">ID: {row.entityId}</p>
        </div>
      ),
    },
    {
      header: 'Archival Reason',
      key: 'reason',
      render: (row) => (
        <span className="text-xs text-brand-slate">{row.reason || 'Manual deletion'}</span>
      ),
    },
    {
      header: 'Archived Timestamp',
      key: 'archivedAt',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-brand-slate">
          {row.archivedAt ? new Date(row.archivedAt).toLocaleString() : 'Recent'}
        </span>
      ),
    },
    {
      header: 'State',
      key: 'restored',
      sortable: true,
      render: (row) => (
        <Badge variant={row.restored ? 'neutral' : 'warning'}>
          {row.restored ? 'Restored' : 'Archived in Bin'}
        </Badge>
      ),
    },
    {
      header: 'Relational Recovery',
      key: 'actions',
      render: (row) => (
        row.restored ? (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active</span>
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={() => handleRestore(row.id)}
            loading={restoringId === row.id}
          >
            Restore Entity
          </Button>
        )
      ),
    },
  ];

  return (
    <SuperAdminLayout title="Operational Recovery Bin & Soft-Delete Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Link
              to="/super-admin/backups"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-slate hover:text-brand-navy mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Backup Ledger</span>
            </Link>
            <h2 className="text-2xl font-bold text-brand-navy tracking-tight">
              Operational Recovery Bin
            </h2>
            <p className="text-xs text-brand-slate mt-1 max-w-2xl">
              Restore soft-deleted buses, routes, and operational profiles with relational dependency verification.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => loadData(true)}
            loading={refreshing}
          >
            Refresh Bin
          </Button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Table Card */}
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Archived Entity Inventory</h3>
              <p className="text-xs text-brand-slate">Showing {filteredItems.length} soft-deleted records.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search entity ID or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-border rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredItems}
            loading={loading}
            emptyText="Recovery Bin is empty. No archived entities require restoration."
          />
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminRecoveryPage;
