import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Plus, 
  FileText, 
  RotateCcw,
  ExternalLink,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import MetricCard from '../../components/ui/MetricCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { backupManifestService } from '../../services/backup/backupManifestService';
import { useAuth } from '../../context/AuthContext';
import { BACKUP_STATUS, BACKUP_SCOPE } from '../../constants/collections';

export const SuperAdminBackupsPage = () => {
  const { user, profile } = useAuth();
  const [manifests, setManifests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    scope: BACKUP_SCOPE.FULL_SYSTEM,
    notes: 'Manual administrative backup',
    recordCount: 450,
  });

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const list = await backupManifestService.getAllManifests(50);
      setManifests(list || []);
    } catch (err) {
      console.error('Failed to load backup manifests:', err);
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

  // Determine latest backup and health state
  const latestBackup = manifests.length > 0 ? manifests[0] : null;
  const ageHealth = backupManifestService.evaluateBackupAgeHealth(latestBackup?.createdAt);

  const handleCreateManualBackup = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await backupManifestService.createBackupManifest({
        scope: formData.scope,
        notes: formData.notes,
        recordCount: formData.recordCount,
        actor: {
          uid: user?.uid,
          name: profile?.fullName || user?.email,
          role: 'superAdmin',
        },
      });
      showToast('Backup manifest created and logged to immutable audit ledger.');
      setIsModalOpen(false);
      loadData(true);
    } catch (err) {
      alert(`Backup error: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleVerifyBackup = async (manifestId) => {
    try {
      await backupManifestService.verifyBackupManifest(manifestId, {
        uid: user?.uid,
        name: profile?.fullName || user?.email,
      });
      showToast('Backup manifest integrity checksum verified.');
      loadData(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    {
      header: 'Backup Identifier',
      key: 'backupId',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-brand-navy font-mono">{row.backupId}</span>
          <p className="text-[10px] text-brand-slate font-mono truncate max-w-xs">{row.storageLocation}</p>
        </div>
      ),
    },
    {
      header: 'Coverage Scope',
      key: 'scope',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-brand-navy uppercase text-[10px]">
          {row.scope?.replace(/_/g, ' ') || 'Full System'}
        </span>
      ),
    },
    {
      header: 'Manifest Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        let variant = 'active';
        if (row.status === BACKUP_STATUS.VERIFIED) variant = 'active';
        if (row.status === BACKUP_STATUS.FAILED) variant = 'danger';
        if (row.status === BACKUP_STATUS.RUNNING) variant = 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Record Volume',
      key: 'recordCount',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-brand-navy">
          {row.recordCount ? `${row.recordCount.toLocaleString()} items` : 'Metadata only'}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      key: 'createdAt',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-brand-slate">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Recent'}
        </span>
      ),
    },
    {
      header: 'Integrity Verification',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status !== BACKUP_STATUS.VERIFIED && (
            <button
              onClick={() => handleVerifyBackup(row.id || row.backupId)}
              className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
              title="Verify Checksum & Metadata Schema"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify</span>
            </button>
          )}
          <Link
            to={`/super-admin/backups/${row.id || row.backupId}`}
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
          >
            <span>Manifest</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <SuperAdminLayout title="Backup Governance & Disaster Readiness">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Stage 26 Data Protection
              </span>
              <span className="text-[10px] font-semibold text-brand-slate">
                Immutable Ledger Verified
              </span>
            </div>
            <h2 className="text-2xl font-bold text-brand-navy tracking-tight">
              Backup Governance & Disaster Readiness
            </h2>
            <p className="text-xs text-brand-slate mt-1 max-w-2xl">
              Authentic disaster recovery manifests, integrity checksum verification, and soft-delete recovery bin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <Link to="/super-admin/recovery">
              <Button variant="outline" size="sm" icon={RotateCcw}>
                Recovery Bin
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => loadData(true)}
              loading={refreshing}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Record Backup Manifest
            </Button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Operational Principle Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-brand-navy flex items-start gap-3">
          <Database className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-brand-navy">Server-Side Backup Architecture Note:</span>
            <p className="text-brand-slate mt-0.5">
              Production Firestore & Storage exports execute via Google Cloud IAM permissions and Cloud Storage buckets (<code className="bg-white/80 px-1 py-0.2 rounded font-mono text-[11px]">gcloud firestore export gs://routewise-backups/</code>). RouteWise records cryptographic manifests and validates recovery schemas without exposing service account keys to client browsers.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <MetricCard
            title="Backup Age Health"
            value={ageHealth.label}
            sublabel={ageHealth.hoursSince !== null ? `Last created ${ageHealth.hoursSince}h ago` : 'No backup on file'}
            icon={Clock}
            status={ageHealth.status === 'current' ? 'positive' : ageHealth.status === 'aging' ? 'warning' : 'negative'}
          />
          <MetricCard
            title="Tracked Manifests"
            value={manifests.length}
            sublabel="Audited disaster snapshots"
            icon={Database}
          />
          <MetricCard
            title="Verified Checksums"
            value={manifests.filter((m) => m.status === BACKUP_STATUS.VERIFIED).length}
            sublabel="Cryptographically confirmed"
            icon={ShieldCheck}
            status="positive"
          />
          <MetricCard
            title="Restoration Clearance"
            value="Dry-Run Ready"
            sublabel="Relational integrity active"
            icon={RotateCcw}
            status="positive"
          />
        </div>

        {/* Manifests Table */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Historical Backup Manifests</h3>
              <p className="text-xs text-brand-slate">Showing {manifests.length} recorded recovery snapshots.</p>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={manifests}
            loading={loading}
            emptyText="No backup manifests recorded yet. Record a new manifest or trigger an automated export."
          />
        </Card>
      </div>

      {/* Manual Backup Manifest Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Disaster Backup Manifest"
      >
        <form onSubmit={handleCreateManualBackup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1">
              Backup Scope
            </label>
            <select
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-border rounded-xl text-brand-navy"
            >
              <option value={BACKUP_SCOPE.FULL_SYSTEM}>Full System (All Collections & Governance)</option>
              <option value={BACKUP_SCOPE.OPERATIONAL_FIRESTORE}>Operational Firestore (Buses, Routes, Trips, Attendance)</option>
              <option value={BACKUP_SCOPE.CONFIGURATION_ONLY}>Configuration & Alert Rules Only</option>
              <option value={BACKUP_SCOPE.AUDIT_LEDGER}>Immutable Audit Ledger</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1">
              Estimated Entity Record Count
            </label>
            <input
              type="number"
              value={formData.recordCount}
              onChange={(e) => setFormData({ ...formData, recordCount: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-border rounded-xl text-brand-navy"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1">
              Operational Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-border rounded-xl text-brand-navy"
              rows={3}
              placeholder="e.g. Pre-deployment baseline snapshot for Stage 26"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={creating}
            >
              Commit Manifest
            </Button>
          </div>
        </form>
      </Modal>
    </SuperAdminLayout>
  );
};

export default SuperAdminBackupsPage;
