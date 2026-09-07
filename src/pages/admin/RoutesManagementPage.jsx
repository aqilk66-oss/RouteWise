import React, { useState, useEffect } from 'react';
import { 
  Route as RouteIcon, 
  PlusCircle, 
  Edit, 
  Archive, 
  RefreshCw, 
  CheckCircle, 
  MapPin, 
  Bus, 
  Clock 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { routeService, busService, driverService, stopService } from '../../services/firestore';
import { ROUTE_STATUS, RECORD_STATUS } from '../../constants/collections';

export const RoutesManagementPage = () => {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [archivingId, setArchivingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    routeCode: '',
    name: '',
    description: '',
    assignedBusId: '',
    assignedDriverId: '',
    estimatedDuration: '',
    distance: '',
    status: ROUTE_STATUS.ACTIVE,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routeList, busList, driverList, stopList] = await Promise.all([
        routeService.getAll({ max: 100 }),
        busService.getAll({ max: 100 }),
        driverService.getAll({ max: 100 }),
        stopService.getAll({ max: 500 }),
      ]);
      setRoutes(routeList);
      setBuses(busList);
      setDrivers(driverList);
      setStops(stopList);
    } catch (err) {
      console.error('Failed to load routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingRoute(null);
    setFormData({
      routeCode: '',
      name: '',
      description: '',
      assignedBusId: '',
      assignedDriverId: '',
      estimatedDuration: '30 mins',
      distance: '10 miles',
      status: ROUTE_STATUS.ACTIVE,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      routeCode: route.routeCode || '',
      name: route.name || '',
      description: route.description || '',
      assignedBusId: route.assignedBusId || '',
      assignedDriverId: route.assignedDriverId || '',
      estimatedDuration: route.estimatedDuration || '',
      distance: route.distance || '',
      status: route.status || ROUTE_STATUS.ACTIVE,
    });
    setIsFormOpen(true);
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const assignedBus = buses.find((b) => b.id === formData.assignedBusId);
      const assignedDriver = drivers.find((d) => d.id === formData.assignedDriverId);

      const payload = {
        ...formData,
        busNumber: assignedBus ? assignedBus.busNumber : '',
        driverName: assignedDriver ? assignedDriver.fullName : '',
      };

      if (editingRoute) {
        await routeService.update(editingRoute.id, payload);
        showToast('Route configuration saved.');
      } else {
        await routeService.createRoute(payload);
        showToast('New transportation route created.');
      }
      setIsFormOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to save route:', err);
      alert(`Error saving route: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archivingId) return;
    setSaving(true);
    try {
      await routeService.archive(archivingId);
      showToast('Route archived.');
      setIsConfirmOpen(false);
      setArchivingId(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to archive route:', err);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getStopCount = (routeId) => {
    return stops.filter((s) => s.routeId === routeId).length;
  };

  const columns = [
    {
      header: 'Route Line & Code',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-brand-navy flex items-center gap-1.5">
            <RouteIcon className="w-3.5 h-3.5 text-brand-blue" />
            {row.name || 'Unnamed Route'}
          </p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-brand-blue border border-blue-100">
            {row.routeCode || 'RTE-NEW'}
          </span>
        </div>
      ),
    },
    {
      header: 'Vehicle & Driver',
      key: 'busNumber',
      render: (row) => (
        <div>
          <p className="font-medium text-brand-navy text-xs flex items-center gap-1">
            <Bus className="w-3 h-3 text-brand-teal" />
            {row.busNumber || 'No Bus Assigned'}
          </p>
          <p className="text-[11px] text-brand-slate">{row.driverName || 'No Driver'}</p>
        </div>
      ),
    },
    {
      header: 'Stops',
      key: 'stops',
      render: (row) => {
        const count = getStopCount(row.id);
        return (
          <span className="font-semibold text-brand-navy text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3 text-purple-600" />
            {count} {count === 1 ? 'Stop' : 'Stops'}
          </span>
        );
      },
    },
    {
      header: 'Duration / Length',
      key: 'estimatedDuration',
      render: (row) => (
        <span className="text-[11px] text-brand-slate flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-500" />
          {row.estimatedDuration || '—'} ({row.distance || '—'})
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const isArchived = row.status === ROUTE_STATUS.ARCHIVED || row.status === RECORD_STATUS.ARCHIVED;
        return (
          <Badge variant={isArchived ? 'neutral' : row.status === 'active' ? 'active' : 'info'}>
            {row.status || 'Active'}
          </Badge>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Campus Routes & Transit Lines">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Coordinated School Transit Corridors</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Geographic bus circuits connecting residential neighborhoods with school drop-off gates.
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
              Create Route
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={routes}
          loading={loading}
          searchPlaceholder="Search routes by name or route code..."
          searchField={(row, q) =>
            (row.name && row.name.toLowerCase().includes(q)) ||
            (row.routeCode && row.routeCode.toLowerCase().includes(q)) ||
            (row.busNumber && row.busNumber.toLowerCase().includes(q))
          }
          emptyTitle="No transit routes defined"
          emptyDescription="Create your first transport corridor to schedule student pickups."
          emptyActionText="Create First Route"
          onEmptyAction={handleOpenCreate}
          actions={(row) => (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 rounded-lg text-brand-slate hover:bg-slate-100 hover:text-brand-navy transition-colors"
                title="Edit Route"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              {row.status !== ROUTE_STATUS.ARCHIVED && (
                <button
                  onClick={() => {
                    setArchivingId(row.id);
                    setIsConfirmOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-brand-slate hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Archive Route"
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
          title={editingRoute ? 'Edit Route Corridor' : 'Create Transit Route'}
          subtitle="Define path metadata and link default fleet resources."
        >
          <form onSubmit={handleSaveRoute} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Route Code *</label>
                <input
                  type="text"
                  required
                  value={formData.routeCode}
                  onChange={(e) => setFormData({ ...formData, routeCode: e.target.value })}
                  placeholder="e.g. EXP-14"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Route Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. North Campus Express"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Description / Corridor Summary</label>
              <textarea
                rows="2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key neighborhood streets and landmarks served..."
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Default Bus</label>
                <select
                  value={formData.assignedBusId}
                  onChange={(e) => setFormData({ ...formData, assignedBusId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value="">No Default Bus</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Default Driver</label>
                <select
                  value={formData.assignedDriverId}
                  onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value="">No Default Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Estimated Duration</label>
                <input
                  type="text"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                  placeholder="e.g. 42 mins"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Corridor Distance</label>
                <input
                  type="text"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  placeholder="e.g. 15.4 miles"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={saving}>
                {editingRoute ? 'Save Changes' : 'Create Route'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Archive Modal */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleArchiveConfirm}
          title="Archive Transport Route?"
          message="This deactivates the route corridor. All existing student and trip history remains safe."
          confirmText="Archive Route"
          variant="warning"
          loading={saving}
        />
      </div>
    </DashboardLayout>
  );
};

export default RoutesManagementPage;
