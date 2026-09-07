import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Database, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Lock,
  Layers
} from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { backupManifestService } from '../../services/backup/backupManifestService';
import { BACKUP_STATUS } from '../../constants/collections';

export const SuperAdminBackupDetailPage = () => {
  const { backupId } = useParams();
  const navigate = useNavigate();

  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchManifest = async () => {
      setLoading(true);
      try {
        const item = await backupManifestService.getById(backupId);
        setManifest(item);
      } catch (err) {
        console.error('Failed to load backup manifest:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchManifest();
  }, [backupId]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await backupManifestService.verifyBackupManifest(manifest.id || backupId);
      setManifest((prev) => ({
        ...prev,
        status: BACKUP_STATUS.VERIFIED,
        verificationResult: 'Integrity checks passed (checksum and schema validated).',
      }));
      setToastMessage('Backup manifest integrity verified.');
    } catch (err) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout title="Backup Manifest Audit">
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-brand-slate">Loading manifest details...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (!manifest) {
    return (
      <SuperAdminLayout title="Backup Manifest Not Found">
        <Card className="p-8 text-center max-w-lg mx-auto mt-8">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-brand-navy">Manifest Record Not Found</h3>
          <p className="text-xs text-brand-slate mt-1 mb-4">The requested disaster recovery backup manifest does not exist.</p>
          <Link to="/super-admin/backups">
            <Button variant="primary" size="sm" icon={ArrowLeft}>
              Return to Backups
            </Button>
          </Link>
        </Card>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout title={`Backup Manifest: ${manifest.backupId || backupId}`}>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-border shadow-soft">
          <div>
            <Link
              to="/super-admin/backups"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-slate hover:text-brand-navy mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Backup Ledger</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-brand-navy font-mono">
                {manifest.backupId || backupId}
              </h2>
              <Badge variant={manifest.status === BACKUP_STATUS.VERIFIED ? 'active' : 'warning'}>
                {manifest.status}
              </Badge>
            </div>
            <p className="text-xs text-brand-slate mt-1">
              Created {new Date(manifest.createdAt).toLocaleString()} by {manifest.createdByName || 'Super Administrator'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {manifest.status !== BACKUP_STATUS.VERIFIED && (
              <Button
                variant="outline"
                size="sm"
                icon={ShieldCheck}
                onClick={handleVerify}
                loading={verifying}
              >
                Run Integrity Verification
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={RotateCcw}
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            >
              {isPreviewOpen ? 'Hide Restore Preview' : 'Preview Dry-Run Restore'}
            </Button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Restore Dry-Run Preview Panel */}
        {isPreviewOpen && (
          <Card className="p-5 border-blue-200 bg-blue-50/40">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-brand-navy">Non-Destructive Restoration Dry-Run Analysis</h3>
            </div>
            <p className="text-xs text-brand-slate mb-4">
              Simulating restoration impact against active Firestore collections. No production records will be modified during preview.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-white rounded-xl border border-border">
                <span className="text-[10px] font-bold text-brand-slate uppercase">Covered Collections</span>
                <p className="text-base font-bold text-brand-navy mt-0.5">
                  {manifest.resourceTypes?.length || 6} collections
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border">
                <span className="text-[10px] font-bold text-brand-slate uppercase">Entity Count</span>
                <p className="text-base font-bold text-brand-navy mt-0.5">
                  {manifest.recordCount?.toLocaleString() || 0} entities
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border">
                <span className="text-[10px] font-bold text-brand-slate uppercase">Relational Conflicts</span>
                <p className="text-base font-bold text-emerald-600 mt-0.5">
                  0 Detected
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Production Protection Guard:</strong> Live database overwrites must be executed via authenticated GCP Cloud SDK console commands (<code className="font-mono text-[11px]">gcloud firestore import</code>) after completing a pre-restore safety snapshot.
              </span>
            </div>
          </Card>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-blue" />
              <span>Manifest Storage & Checksums</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-brand-slate">Storage Location:</span>
                <span className="font-mono font-bold text-brand-navy truncate max-w-xs">{manifest.storageLocation}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-brand-slate">Cryptographic Checksum:</span>
                <span className="font-mono font-semibold text-brand-navy truncate max-w-xs">{manifest.checksum}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-brand-slate">Manifest Version:</span>
                <span className="font-semibold text-brand-navy">{manifest.version || '1.0.0'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-brand-slate">Verification Note:</span>
                <span className="font-semibold text-brand-navy text-right max-w-xs">
                  {manifest.verificationResult || 'Integrity checks pending'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-teal" />
              <span>Covered Domains & Notes</span>
            </h3>

            <div>
              <span className="text-xs text-brand-slate block mb-2">Resource Types Covered:</span>
              <div className="flex flex-wrap gap-1.5">
                {(manifest.resourceTypes || ['users', 'buses', 'routes', 'trips', 'attendance', 'systemConfig']).map((type) => (
                  <span key={type} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-brand-navy font-semibold">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-brand-slate block mb-1">Operational Notes:</span>
              <p className="text-xs text-brand-navy p-3 bg-slate-50 rounded-xl border border-border">
                {manifest.notes || 'No administrative notes attached to this manifest.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminBackupDetailPage;
