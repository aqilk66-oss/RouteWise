import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Calendar, 
  Bus,
  ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import FleetNavHeader from '../../../components/fleet/FleetNavHeader';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { vehicleDocumentService, busService } from '../../../services/firestore';
import { auditService } from '../../../services/admin/auditService';
import { useAuth } from '../../../context/AuthContext';
import { DOCUMENT_STATUS } from '../../../constants/collections';

export const FleetDocumentsPage = () => {
  const { role, user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [buses, setBuses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    busId: '',
    documentType: 'Registration',
    documentNumber: '',
    issuedAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docList, busList] = await Promise.all([
        vehicleDocumentService.getAll({ max: 500 }),
        busService.getAll({ max: 200 }),
      ]);
      setDocuments(docList || []);
      setBuses(busList || []);
      if (busList?.length > 0 && !formData.busId) {
        setFormData((prev) => ({ ...prev, busId: busList[0].busId || busList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load fleet documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!formData.busId || !formData.documentType) return;

    try {
      const created = await vehicleDocumentService.createDocument({
        ...formData,
        uploadedBy: profile?.fullName || user?.email || 'Admin',
      });

      await auditService.logEvent({
        actorUserId: user?.uid,
        actorName: profile?.fullName || user?.email,
        actorRole: role,
        action: 'VEHICLE_DOCUMENT_REGISTERED',
        resourceType: 'vehicleDocument',
        resourceId: created.id || created.documentId,
        description: `Registered ${formData.documentType} for bus ${formData.busId} (Expires: ${formData.expiresAt || 'N/A'}).`,
        severity: 'info',
        metadata: formData,
      });

      setIsModalOpen(false);
      setToastMessage({ type: 'success', text: 'Document record stored and expiration indexed.' });
      fetchData();
    } catch (err) {
      setToastMessage({ type: 'error', text: err.message || 'Failed to save document.' });
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (filterStatus === 'all') return true;
    return d.status === filterStatus;
  });

  return (
    <DashboardLayout>
      <FleetNavHeader 
        title="Vehicle Documents & Expiry Tracking" 
        subtitle="Manage state registrations, fleet insurance policies, annual inspection certs, and statutory renewals."
      >
        <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsModalOpen(true)}>
          Add Document Record
        </Button>
      </FleetNavHeader>

      {toastMessage && (
        <div className={`p-4 mb-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-soft ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white border border-border rounded-2xl shadow-soft mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-brand-navy">Validity Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-brand-navy bg-white focus:outline-none focus:border-brand-teal"
          >
            <option value="all">All Documents</option>
            <option value={DOCUMENT_STATUS.VALID}>Valid</option>
            <option value={DOCUMENT_STATUS.EXPIRING_SOON}>Expiring Soon (≤30 Days)</option>
            <option value={DOCUMENT_STATUS.EXPIRED}>Expired</option>
          </select>
        </div>

        <span className="text-xs text-brand-slate font-semibold">
          Showing <strong>{filteredDocs.length}</strong> of {documents.length} records
        </span>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-border rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-brand-navy">No vehicle documents found</p>
            <p className="text-xs text-brand-slate mt-1 mb-4">Register vehicle registration, insurance, or inspection papers to prevent compliance gaps.</p>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
              Register Document
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Document / Policy #</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4">Expires At</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDocs.map((doc) => {
                  const busObj = buses.find((b) => b.busId === doc.busId || b.id === doc.busId);

                  return (
                    <tr key={doc.id || doc.documentId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-brand-navy">
                        {busObj ? `Bus ${busObj.busNumber}` : doc.busId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-navy">
                        {doc.documentType}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {doc.documentNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {doc.issuedAt || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {doc.expiresAt || 'No Expiration'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={
                          doc.status === DOCUMENT_STATUS.VALID ? 'success' :
                          doc.status === DOCUMENT_STATUS.EXPIRING_SOON ? 'warning' : 'danger'
                        }>
                          {doc.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Document Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Vehicle Document"
      >
        <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-navy block mb-1">Target Vehicle *</label>
            <select
              required
              value={formData.busId}
              onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
            >
              {buses.map((b) => (
                <option key={b.id || b.busId} value={b.busId || b.id}>
                  {b.busNumber} ({b.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-navy block mb-1">Document Type *</label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="Registration">Vehicle Registration</option>
                <option value="Insurance">Fleet Insurance Policy</option>
                <option value="Inspection Certificate">Annual Safety Inspection</option>
                <option value="Permit">Transit Operational Permit</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-brand-navy block mb-1">Policy / Document #</label>
              <input
                type="text"
                placeholder="e.g. POL-98231-X"
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-navy block mb-1">Issued Date</label>
              <input
                type="date"
                value={formData.issuedAt}
                onChange={(e) => setFormData({ ...formData, issuedAt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="font-bold text-brand-navy block mb-1">Expiration Date *</label>
              <input
                type="date"
                required
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Document Record
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default FleetDocumentsPage;
