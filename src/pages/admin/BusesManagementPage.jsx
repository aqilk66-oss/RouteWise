import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  PlusCircle, 
  Edit, 
  Archive, 
  RefreshCw, 
  CheckCircle, 
  Wrench, 
  Users, 
  Route as RouteIcon 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { busService, driverService, routeService } from '../../services/firestore';
import { BUS_STATUS, RECORD_STATUS } from '../../constants/collections';

export const BusesManagementPage = () => {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [archivingId, setArchivingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    busNumber: '',
    registrationNumber: '',
    capacity: 32,
    model: '',
    year: new Date().getFullYear(),
    assignedDriverId: '',
    assignedRouteId: '',
    status: BUS_STATUS.AVAILABLE,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [busList, driverList, routeList] = await Promise.all([
        busService.getAll({ max: 100 }),
        driverService.getAll({ max: 100 }),
        routeService.getAll({ max: 100 }),
      ]);
      setBuses(busList);
      setDrivers(driverList);
      setRoutes(routeList);
    } catch (err) {
      console.error('Failed to load buses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingBus(null);
    setFormData({
      busNumber: '',
      registrationNumber: '',
      capacity: 32,
      model: '',
      year: new Date().getFullYear(),
      assignedDriverId: '',
      assignedRouteId: '',
      status: BUS_STATUS.AVAILABLE,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      busNumber: bus.busNumber || '',
      registrationNumber: bus.registrationNumber || '',
      capacity: bus.capacity || 32,
      model: bus.model || '',
      year: bus.year || new Date().getFullYear(),
      assignedDriverId: bus.assignedDriverId || '',
      assignedRouteId: bus.assignedRouteId || '',
      status: bus.status || BUS_STATUS.AVAILABLE,
    });
    setIsFormOpen(true);
  };

  const handleSaveBus = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const assignedDriver = drivers.find((d) => d.id === formData.assignedDriverId);
      const assignedRoute = routes.find((r) => r.id === formData.assignedRouteId);

      const payload = {
        ...formData,
        capacity: Number(formData.capacity) || 30,
        year: Number(formData.year) || new Date().getFullYear(),
        driverName: assignedDriver ? assignedDriver.fullName : '',
        routeName: assignedRoute ? (assignedRoute.name || assignedRoute.routeCode) : '',
      };

      if (editingBus) {
        await busService.update(editingBus.id, payload);
        showToast('Bus fleet record updated.');
      } else {
        await busService.createBus(payload);
        showToast('New school bus added to fleet.');
      }
      setIsFormOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to save bus:', err);
      alert(`Error saving bus: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archivingId) return;
    setSaving(true);
    try {
      await busService.archive(archivingId);
      showToast('Bus decommissioned and archived.');
      setIsConfirmOpen(false);
      setArchivingId(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to archive bus:', err);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case BUS_STATUS.ACTIVE:
      case BUS_STATUS.ASSIGNED:
        return <Badge variant="active">Active</Badge>;
      case BUS_STATUS.MAINTENANCE:
        return <Badge variant="warning">Maintenance</Badge>;
      case BUS_STATUS.RETIRED:
      case RECORD_STATUS.ARCHIVED:
        return <Badge variant="neutral">Retired</Badge>;
      default:
        return <Badge variant="info">Available</Badge>;
    }
  };

  const columns = [
    {
      header: 'Bus Identifier',
      key: 'busNumber',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-brand-navy flex items-center gap-1.5">
            <Bus className="w-3.5 h-3.5 text-brand-blue" />
            {row.busNumber || 'Fleet Vehicle'}
          </p>
          <p className="text-[11px] text-brand-slate">Plate: {row.registrationNumber || 'Pending'}</p>
        </div>
      ),
    },
    {
      header: 'Model / Capacity',
      key: 'model',
      render: (row) => (
        <div>
          <span className="font-medium text-brand-navy">{row.model || 'Standard Coach'}</span>
          <p className="text-[11px] text-brand-slate flex items-center gap-1">
            <Users className="w-3 h-3 text-brand-teal" /> {row.capacity} Seats ({row.year})
          </p>
        </div>
      ),
    },
    {
      header: 'Assigned Driver',
      key: 'driverName',
      render: (row) => (
        <span className="font-medium text-brand-navy text-xs">
          {row.driverName || 'No Driver Assigned'}
        </span>
      ),
    },
    {
      header: 'Assigned Route',
      key: 'routeName',
      render: (row) => (
        <span className="font-medium text-brand-blue text-xs flex items-center gap-1">
          <RouteIcon className="w-3 h-3" />
          {row.routeName || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => getStatusBadge(row.status),
    },
  ];

  return (
    <DashboardLayout title="Fleet Buses & Vehicle Inventory">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Institutional Bus Fleet</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Registration, passenger capacities, maintenance schedules, and assigned line routes.
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
              icon={PlusCircle}
              onClick={handleOpenCreate}
            >
              Add Bus
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={buses}
          loading={loading}
          searchPlaceholder="Search fleet by bus number, plate, or model..."
          searchField={(row, q) =>
            (row.busNumber && row.busNumber.toLowerCase().includes(q)) ||
            (row.registrationNumber && row.registrationNumber.toLowerCase().includes(q)) ||
            (row.model && row.model.toLowerCase().includes(q))
          }
          emptyTitle="No buses in fleet"
          emptyDescription="Register your first school bus to establish transportation lines."
          emptyActionText="Add First Bus"
          onEmptyAction={handleOpenCreate}
          actions={(row) => (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 rounded-lg text-brand-slate hover:bg-slate-100 hover:text-brand-navy transition-colors"
                title="Edit Bus"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              {row.status !== RECORD_STATUS.ARCHIVED && row.status !== BUS_STATUS.RETIRED && (
                <button
                  onClick={() => {
                    setArchivingId(row.id);
                    setIsConfirmOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-brand-slate hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Archive Bus"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        />

        {/* Create / Edit Bus Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingBus ? 'Edit Bus Specifications' : 'Register New Bus'}
          subtitle="Configure vehicle specifications and passenger thresholds."
        >
          <form onSubmit={handleSaveBus} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Bus Number / Code *</label>
                <input
                  type="text"
                  required
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  placeholder="e.g. Bus 42"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Registration Plate *</label>
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="e.g. SCH-9942"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Seating Capacity *</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Vehicle Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g. Blue Bird Vision"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Year</label>
                <input
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Assigned Driver</label>
                <select
                  value={formData.assignedDriverId}
                  onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value="">No Driver Assigned</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
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

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Fleet Operational Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
              >
                <option value={BUS_STATUS.AVAILABLE}>Available (In Depot)</option>
                <option value={BUS_STATUS.ACTIVE}>Active Service</option>
                <option value={BUS_STATUS.ASSIGNED}>Assigned to Route</option>
                <option value={BUS_STATUS.MAINTENANCE}>Under Maintenance</option>
                <option value={BUS_STATUS.RETIRED}>Retired</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={saving}>
                {editingBus ? 'Save Changes' : 'Add Vehicle'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleArchiveConfirm}
          title="Decommission Bus?"
          message="This marks the vehicle as retired and detaches it from active student routes."
          confirmText="Decommission Bus"
          variant="warning"
          loading={saving}
        />
      </div>
    </DashboardLayout>
  );
};

export default BusesManagementPage;
