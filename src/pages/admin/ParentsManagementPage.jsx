import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Edit, 
  RefreshCw,
  Baby
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { parentService, studentService } from '../../services/firestore';

export const ParentsManagementPage = () => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    emergencyContact: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [parentList, studentList] = await Promise.all([
        parentService.getAll({ max: 200 }),
        studentService.getAll({ max: 500 }),
      ]);
      setParents(parentList);
      setStudents(studentList);
    } catch (err) {
      console.error('Failed to load parents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (parent) => {
    setSelectedParent(parent);
    setEditFormData({
      fullName: parent.fullName || '',
      phone: parent.phone || '',
      emergencyContact: parent.emergencyContact || '',
    });
    setIsEditOpen(true);
  };

  const handleSaveParent = async (e) => {
    e.preventDefault();
    if (!selectedParent) return;
    setSaving(true);
    try {
      await parentService.update(selectedParent.id, editFormData);
      setToastMessage('Parent contact details updated successfully.');
      setTimeout(() => setToastMessage(null), 4000);
      setIsEditOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to update parent:', err);
      alert(`Error updating parent profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getLinkedStudents = (parentId) => {
    return students.filter((s) => s.parentId === parentId);
  };

  const columns = [
    {
      header: 'Parent / Guardian',
      key: 'fullName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-brand-navy">{row.fullName || 'Guardian'}</p>
          <p className="text-[11px] text-brand-slate flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3 text-slate-400" /> {row.email || 'No email registered'}
          </p>
        </div>
      ),
    },
    {
      header: 'Contact Phone',
      key: 'phone',
      render: (row) => (
        <span className="font-medium text-brand-navy flex items-center gap-1 text-xs">
          <Phone className="w-3 h-3 text-brand-teal" />
          {row.phone || '—'}
        </span>
      ),
    },
    {
      header: 'Linked Children',
      key: 'children',
      render: (row) => {
        const linked = getLinkedStudents(row.id);
        return (
          <div className="flex flex-wrap gap-1">
            {linked.length === 0 ? (
              <span className="text-[11px] text-brand-slate italic">None assigned</span>
            ) : (
              linked.map((s) => (
                <span
                  key={s.id}
                  className="px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue text-[10px] font-semibold border border-blue-100"
                >
                  {s.firstName} {s.lastName}
                </span>
              ))
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'active' : 'neutral'}>
          {row.status || 'Active'}
        </Badge>
      ),
    },
  ];

  return (
    <DashboardLayout title="Parent & Guardian Directory">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Parent & Guardian Accounts</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Verified guardians registered to receive bus arrival notifications and student transit status.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh Directory
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={parents}
          loading={loading}
          searchPlaceholder="Search parents by name, email, or phone..."
          searchField={(row, q) =>
            (row.fullName && row.fullName.toLowerCase().includes(q)) ||
            (row.email && row.email.toLowerCase().includes(q)) ||
            (row.phone && row.phone.toLowerCase().includes(q))
          }
          emptyTitle="No parents registered"
          emptyDescription="Registered guardian accounts will appear here once linked."
          actions={(row) => (
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 rounded-lg text-brand-slate hover:bg-slate-100 hover:text-brand-navy transition-colors"
              title="Edit Profile"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
        />

        {/* Edit Parent Modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Guardian Contact Information"
          subtitle="Password changes must be performed through Firebase Authentication."
        >
          <form onSubmit={handleSaveParent} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-brand-navy mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-brand-navy mb-1">Contact Phone</label>
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-brand-navy mb-1">Emergency Secondary Contact</label>
              <input
                type="text"
                value={editFormData.emergencyContact}
                onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })}
                placeholder="Alternate phone or name"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={saving}>
                Update Guardian Record
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ParentsManagementPage;
