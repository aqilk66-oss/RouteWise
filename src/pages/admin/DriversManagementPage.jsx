import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  UserPlus, 
  Edit, 
  Archive, 
  RefreshCw, 
  Phone, 
  Award, 
  Bus, 
  Route, 
  CheckCircle 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { driverService, busService, routeService } from '../../services/firestore';
import { RECORD_STATUS } from '../../constants/collections';

export const DriversManagementPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [archivingId, setArchivingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    assignedBusId: '',
    assignedRouteId: '',
    status: RECORD_STATUS.ACTIVE,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [driverList, busList, routeList] = await Promise.all([
        driverService.getAll({ max: 100 }),
        busService.getAll({ max: 100 }),
        routeService.getAll({ max: 100 }),
      ]);
      setDrivers(driverList);
      setBuses(busList);
      setRoutes(routeList);
    } catch (err) {
      console.error('Failed to load drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingDriver(null);
    setFormData({
      fullName: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      assignedBusId: '',
      assignedRouteId: '',
      status: RECORD_STATUS.ACTIVE,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      fullName: driver.fullName || '',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry || '',
      assignedBusId: driver.assignedBusId || '',
      assignedRouteId: driver.assignedRouteId || '',
      status: driver.status || RECORD_STATUS.ACTIVE,
    });
    setIsFormOpen(true);
  };

  const handleSaveDriver = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const assignedBus = buses.find((b) => b.id === formData.assignedBusId);
      const assignedRoute = routes.find((r) => r.id === formData.assignedRouteId);

      const payload = {
        ...formData,
        busNumber: assignedBus ? assignedBus.busNumber : '',
        routeName: assignedRoute ? (assignedRoute.name || assignedRoute.routeCode) : '',
      };

      if (editingDriver) {
        await driverService.update(editingDriver.id, payload);
        showToast('Driver profile updated successfully.');
      } else {
        await driverService.createDriver(payload);
        showToast('New driver registered to fleet.');
      }
      setIsFormOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to save driver:', err);
      alert(`Error saving driver: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archivingId) return;
    setSaving(true);
    try {
      await driverService.archive(archivingId);
      showToast('Driver status archived.');
      setIsConfirmOpen(false);
      setArchivingId(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to archive driver:', err);
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
      header: 'Driver Name',
      key: 'fullName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-brand-navy">{row.fullName || 'Operator'}</p>
          <p className="text-[11px] text-brand-slate flex items-center gap-1">
            <Phone className="w-3 h-3 text-brand-teal" /> {row.phone || 'No phone'}
          </p>
        </div>
      ),
    },
    {
      header: 'License & Credential',
      key: 'licenseNumber',
      render: (row) => (
        <div>
          <span className="font-medium text-brand-navy">{row.licenseNumber || 'CDL-Pending'}</span>
          {row.licenseExpiry && (
            <p className="text-[10px] text-brand-slate">Exp: {row.licenseExpiry}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Assigned Bus',
      key: 'busNumber',
      render: (row) => (
        <span className="font-medium text-brand-blue flex items-center gap-1">
          <Bus className="w-3.5 h-3.5" />
          {row.busNumber || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Assigned Route',
      key: 'routeName',
      render: (row) => (
        <span className="text-brand-slate text-[11px]">
          {row.routeName || 'Standby'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const isArchived = row.status === RECORD_STATUS.ARCHIVED;
        return (
          <Badge variant={isArchived ? 'neutral' : row.status === 'active' ? 'active' : 'warning'}>
            {row.status || 'Active'}
          </Badge>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Fleet Drivers & Operator Rosters">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Authorized Bus Operators</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Certifications, commercial driver licenses, and vehicle route pairings.
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
              Add Driver
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={drivers}
          loading={loading}
          searchPlaceholder="Search drivers by name, license, or bus..."
          searchField={(row, q) =>
            (row.fullName && row.fullName.toLowerCase().includes(q)) ||
            (row.licenseNumber && row.licenseNumber.toLowerCase().includes(q)) ||
            (row.busNumber && row.busNumber.toLowerCase().includes(q))
          }
          emptyTitle="No drivers registered"
          emptyDescription="Add licensed drivers to begin vehicle assignments."
          emptyActionText="Add First Driver"
          onEmptyAction={handleOpenCreate}
          actions={(row) => (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 rounded-lg text-brand-slate hover:bg-slate-100 hover:text-brand-navy transition-colors"
                title="Edit Driver"
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
                  title="Archive Driver"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        />

        {/* Create / Edit Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingDriver ? 'Edit Driver Profile' : 'Register New Driver'}
          subtitle="Assign certified drivers to operational school buses."
        >
          <form onSubmit={handleSaveDriver} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-brand-navy mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Marcus Vance"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 349-2910"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">CDL License Number *</label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="e.g. CDL-8829410"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Assigned Bus</label>
                <select
                  value={formData.assignedBusId}
                  onChange={(e) => setFormData({ ...formData, assignedBusId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value="">No Bus Assigned (Standby)</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.model || 'Standard'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Assigned Route</label>
                <select
                  value={formData.assignedRouteId}
                  onChange={(e) => setFormData({ ...formData, assignedRouteId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value="">No Route Assigned</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || r.routeCode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">License Expiry Date</label>
                <input
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Operator Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value={RECORD_STATUS.ACTIVE}>Active</option>
                  <option value={RECORD_STATUS.INACTIVE}>Inactive</option>
                  <option value={RECORD_STATUS.ARCHIVED}>Archived</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={saving}>
                {editingDriver ? 'Save Changes' : 'Register Driver'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Archive Confirmation */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleArchiveConfirm}
          title="Archive Driver Record?"
          message="This removes the driver from active assignment rosters. Historical transit logs remain recorded."
          confirmText="Archive Driver"
          variant="warning"
          loading={saving}
        />
      </div>
    </DashboardLayout>
  );
};

export default DriversManagementPage;
