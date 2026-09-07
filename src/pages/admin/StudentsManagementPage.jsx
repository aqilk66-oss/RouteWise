import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Archive, 
  RefreshCw, 
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
  studentService, 
  routeService, 
  busService, 
  parentService 
} from '../../services/firestore';
import { RECORD_STATUS } from '../../constants/collections';

export const StudentsManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [archivingId, setArchivingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form inputs
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    className: '',
    parentId: '',
    routeId: '',
    busId: '',
    pickupStop: '',
    dropoffStop: '',
    status: RECORD_STATUS.ACTIVE,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentList, routeList, busList, parentList] = await Promise.all([
        studentService.getAll({ max: 500 }),
        routeService.getAll({ max: 100 }),
        busService.getAll({ max: 100 }),
        parentService.getAll({ max: 100 }),
      ]);
      setStudents(studentList);
      setRoutes(routeList);
      setBuses(busList);
      setParents(parentList);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData({
      firstName: '',
      lastName: '',
      grade: '',
      className: '',
      parentId: parents[0]?.id || '',
      routeId: routes[0]?.id || '',
      busId: buses[0]?.id || '',
      pickupStop: '',
      dropoffStop: '',
      status: RECORD_STATUS.ACTIVE,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      grade: student.grade || '',
      className: student.className || '',
      parentId: student.parentId || '',
      routeId: student.routeId || '',
      busId: student.busId || '',
      pickupStop: student.pickupStop || '',
      dropoffStop: student.dropoffStop || '',
      status: student.status || RECORD_STATUS.ACTIVE,
    });
    setIsFormOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Find friendly names to store alongside IDs for zero-join rendering
      const assignedRoute = routes.find((r) => r.id === formData.routeId);
      const assignedBus = buses.find((b) => b.id === formData.busId);
      const assignedParent = parents.find((p) => p.id === formData.parentId);

      const payload = {
        ...formData,
        routeName: assignedRoute ? (assignedRoute.name || assignedRoute.routeCode) : '',
        busNumber: assignedBus ? assignedBus.busNumber : '',
        parentName: assignedParent ? (assignedParent.fullName || assignedParent.email) : '',
      };

      if (editingStudent) {
        await studentService.update(editingStudent.id, payload);
        showToast('Student record successfully updated.');
      } else {
        await studentService.createStudent(payload);
        showToast('New student successfully enrolled.');
      }
      setIsFormOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to save student:', err);
      alert(`Error saving student: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archivingId) return;
    setSaving(true);
    try {
      await studentService.archive(archivingId);
      showToast('Student record archived.');
      setIsConfirmOpen(false);
      setArchivingId(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to archive student:', err);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const columns = [
    {
      header: 'Student Name',
      key: 'fullName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-brand-navy">
            {row.fullName || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unnamed'}
          </p>
          <p className="text-[11px] text-brand-slate">ID: {row.id.substring(0, 8)}</p>
        </div>
      ),
    },
    {
      header: 'Grade / Class',
      key: 'grade',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-brand-navy">{row.grade || '—'}</span>
          {row.className && (
            <span className="text-[11px] text-brand-slate ml-1">({row.className})</span>
          )}
        </div>
      ),
    },
    {
      header: 'Assigned Route',
      key: 'routeName',
      render: (row) => (
        <span className="font-medium text-brand-blue">
          {row.routeName || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Assigned Bus',
      key: 'busNumber',
      render: (row) => (
        <span className="font-medium text-brand-navy">
          {row.busNumber || 'None'}
        </span>
      ),
    },
    {
      header: 'Pickup Stop',
      key: 'pickupStop',
      render: (row) => (
        <span className="text-brand-slate text-[11px] truncate max-w-[150px] inline-block">
          {row.pickupStop || 'School Entrance'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        const isArchived = row.status === RECORD_STATUS.ARCHIVED || row.status === 'archived';
        return (
          <Badge variant={isArchived ? 'neutral' : 'active'}>
            {row.status || 'Active'}
          </Badge>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Student Manifest & Transport Roster">
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Enrolled Students Manifest</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Manage student bus assignments, emergency pickup stops, and transit authorization status.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={handleOpenCreate}
            >
              Add Student
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={students}
          loading={loading}
          searchPlaceholder="Search students by name, grade, or route..."
          searchField={(row, q) => 
            (row.firstName && row.firstName.toLowerCase().includes(q)) ||
            (row.lastName && row.lastName.toLowerCase().includes(q)) ||
            (row.grade && row.grade.toLowerCase().includes(q)) ||
            (row.routeName && row.routeName.toLowerCase().includes(q))
          }
          emptyTitle="No students registered"
          emptyDescription="Start enrolling students into institutional bus routes."
          emptyActionText="Add First Student"
          onEmptyAction={handleOpenCreate}
          actions={(row) => (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 rounded-lg text-brand-slate hover:bg-slate-100 hover:text-brand-navy transition-colors"
                title="Edit Student"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              {row.status !== RECORD_STATUS.ARCHIVED && (
                <button
                  onClick={() => {
                    setArchivingId(row.id);
                    setIsConfirmOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-brand-slate hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Archive Student"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        />

        {/* Create / Edit Student Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingStudent ? 'Edit Student Record' : 'Enroll New Student'}
          subtitle="All assignments directly update fleet manifests and driver check-in lists."
        >
          <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Emily"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Watson"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Grade Level *</label>
                <input
                  type="text"
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="e.g. Grade 5"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Class / Section</label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="e.g. Section B"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Assigned Route</label>
                <select
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none bg-white"
                >
                  <option value="">No Route Assigned</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || r.routeCode}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Assigned Bus</label>
                <select
                  value={formData.busId}
                  onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none bg-white"
                >
                  <option value="">No Bus Assigned</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.model || 'Standard'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Morning Pickup Stop</label>
                <input
                  type="text"
                  value={formData.pickupStop}
                  onChange={(e) => setFormData({ ...formData, pickupStop: e.target.value })}
                  placeholder="e.g. Maple Ave & 4th"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Afternoon Drop-off</label>
                <input
                  type="text"
                  value={formData.dropoffStop}
                  onChange={(e) => setFormData({ ...formData, dropoffStop: e.target.value })}
                  placeholder="e.g. Lincoln Crossing"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Transport Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none bg-white"
              >
                <option value={RECORD_STATUS.ACTIVE}>Active</option>
                <option value={RECORD_STATUS.INACTIVE}>Inactive</option>
                <option value={RECORD_STATUS.ARCHIVED}>Archived</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={saving}
              >
                {editingStudent ? 'Save Changes' : 'Enroll Student'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Archive Confirmation Dialog */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleArchiveConfirm}
          title="Archive Student Record?"
          message="This will deactivate the student from the active bus roster. Historical attendance records will remain preserved."
          confirmText="Archive Student"
          variant="warning"
          loading={saving}
        />
      </div>
    </DashboardLayout>
  );
};

export default StudentsManagementPage;
