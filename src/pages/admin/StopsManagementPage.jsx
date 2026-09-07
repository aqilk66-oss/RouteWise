import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  PlusCircle, 
  Edit, 
  Trash2, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  CheckCircle,
  Route as RouteIcon
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { stopService, routeService } from '../../services/firestore';
import { STOP_STATUS } from '../../constants/collections';

export const StopsManagementPage = () => {
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('all');
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    routeId: '',
    sequence: 1,
    pickupTime: '07:30 AM',
    dropoffTime: '03:30 PM',
    latitude: 40.7128,
    longitude: -74.006,
    status: STOP_STATUS.ACTIVE,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stopList, routeList] = await Promise.all([
        stopService.getAll({ max: 500 }),
        routeService.getAll({ max: 100 }),
      ]);
      setStops(stopList);
      setRoutes(routeList);
    } catch (err) {
      console.error('Failed to load stops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStops = selectedRouteId === 'all' 
    ? stops 
    : stops.filter((s) => s.routeId === selectedRouteId);

  // Sort stops by sequence within route
  const sortedStops = [...filteredStops].sort((a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0));

  const handleOpenCreate = () => {
    setEditingStop(null);
    const nextSeq = sortedStops.length + 1;
    setFormData({
      name: '',
      address: '',
      routeId: selectedRouteId !== 'all' ? selectedRouteId : (routes[0]?.id || ''),
      sequence: nextSeq,
      pickupTime: '07:30 AM',
      dropoffTime: '03:30 PM',
      latitude: 40.7128,
      longitude: -74.006,
      status: STOP_STATUS.ACTIVE,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (stop) => {
    setEditingStop(stop);
    setFormData({
      name: stop.name || '',
      address: stop.address || '',
      routeId: stop.routeId || '',
      sequence: stop.sequence || 1,
      pickupTime: stop.pickupTime || '',
      dropoffTime: stop.dropoffTime || '',
      latitude: stop.latitude || 40.7128,
      longitude: stop.longitude || -74.006,
      status: stop.status || STOP_STATUS.ACTIVE,
    });
    setIsFormOpen(true);
  };

  const handleSaveStop = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parentRoute = routes.find((r) => r.id === formData.routeId);
      const payload = {
        ...formData,
        sequence: Number(formData.sequence) || 1,
        latitude: Number(formData.latitude) || 0,
        longitude: Number(formData.longitude) || 0,
        routeName: parentRoute ? (parentRoute.name || parentRoute.routeCode) : '',
      };

      if (editingStop) {
        await stopService.update(editingStop.id, payload);
        showToast('Stop station updated.');
      } else {
        await stopService.createStop(payload);
        showToast('New stop added to route.');
      }
      setIsFormOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to save stop:', err);
      alert(`Error saving stop: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Reorder stop sequence up or down
  const handleMoveSequence = async (stop, direction) => {
    const currentSeq = Number(stop.sequence) || 1;
    const newSeq = direction === 'up' ? Math.max(1, currentSeq - 1) : currentSeq + 1;
    if (newSeq === currentSeq) return;

    try {
      await stopService.update(stop.id, { sequence: newSeq });
      await fetchData();
    } catch (err) {
      console.error('Failed to reorder sequence:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setSaving(true);
    try {
      await stopService.delete(deletingId);
      showToast('Stop removed from route.');
      setIsConfirmOpen(false);
      setDeletingId(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete stop:', err);
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
      header: 'Seq #',
      key: 'sequence',
      sortable: true,
      className: 'w-16',
      render: (row) => (
        <div className="flex items-center gap-1">
          <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {row.sequence ?? 1}
          </span>
          <div className="flex flex-col">
            <button
              onClick={() => handleMoveSequence(row, 'up')}
              className="text-slate-400 hover:text-brand-blue"
              title="Move Up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleMoveSequence(row, 'down')}
              className="text-slate-400 hover:text-brand-blue"
              title="Move Down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      header: 'Stop Name & Address',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-brand-navy flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-purple-600" />
            {row.name || 'Unnamed Stop'}
          </p>
          <p className="text-[11px] text-brand-slate">{row.address || 'Address pending'}</p>
        </div>
      ),
    },
    {
      header: 'Transit Route',
      key: 'routeName',
      render: (row) => (
        <span className="font-medium text-brand-blue text-xs">
          {row.routeName || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Pickup / Drop-off Time',
      key: 'pickupTime',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-emerald-700">{row.pickupTime || '07:30 AM'}</span>
          <span className="text-brand-slate mx-1.5">•</span>
          <span className="font-semibold text-brand-navy">{row.dropoffTime || '03:30 PM'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === STOP_STATUS.ACTIVE ? 'active' : 'neutral'}>
          {row.status || 'Active'}
        </Badge>
      ),
    },
  ];

  return (
    <DashboardLayout title="Route Stops & Sequential Station Waypoints">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Station Stops & Waypoints</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Sequence-ordered pickup points, arrival windows, and passenger boarding zones.
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
              Add Stop
            </Button>
          </div>
        </div>

        {/* Route Filter Dropdown */}
        <div className="p-4 bg-white border border-border rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold text-brand-navy flex items-center gap-1.5">
            <RouteIcon className="w-4 h-4 text-brand-blue" />
            Filter by Corridor:
          </label>
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border text-xs text-brand-navy bg-slate-50 focus:ring-2 focus:ring-brand-blue/30 outline-none"
          >
            <option value="all">All Corridors ({stops.length} stops)</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name || r.routeCode}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={sortedStops}
          loading={loading}
          searchPlaceholder="Search stops by name or street address..."
          searchField={(row, q) =>
            (row.name && row.name.toLowerCase().includes(q)) ||
            (row.address && row.address.toLowerCase().includes(q)) ||
            (row.routeName && row.routeName.toLowerCase().includes(q))
          }
          emptyTitle="No stops registered for this route"
          emptyDescription="Add pickup stops along this corridor to build the route sequence."
          emptyActionText="Add First Stop"
          onEmptyAction={handleOpenCreate}
          actions={(row) => (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 rounded-lg text-brand-slate hover:bg-slate-100 hover:text-brand-navy transition-colors"
                title="Edit Stop"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setDeletingId(row.id);
                  setIsConfirmOpen(true);
                }}
                className="p-1.5 rounded-lg text-brand-slate hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Delete Stop"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        />

        {/* Create / Edit Stop Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingStop ? 'Edit Stop Waypoint' : 'Add Stop Waypoint'}
          subtitle="Define stop location coordinates and scheduled arrival window."
        >
          <form onSubmit={handleSaveStop} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-brand-navy mb-1">Stop Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Maple Ave & 4th Street"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-brand-navy mb-1">Street Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 400 Maple Ave, Lincoln Park"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Assigned Route *</label>
                <select
                  required
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value="">Select Route Corridor</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || r.routeCode}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Sequence Order *</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  required
                  value={formData.sequence}
                  onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Pickup Time</label>
                <input
                  type="text"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  placeholder="07:35 AM"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Drop-off Time</label>
                <input
                  type="text"
                  value={formData.dropoffTime}
                  onChange={(e) => setFormData({ ...formData, dropoffTime: e.target.value })}
                  placeholder="03:30 PM"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={saving}>
                {editingStop ? 'Save Changes' : 'Add Stop'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Remove Stop Station?"
          message="Are you sure you want to remove this stop from the route schedule?"
          confirmText="Delete Stop"
          variant="danger"
          loading={saving}
        />
      </div>
    </DashboardLayout>
  );
};

export default StopsManagementPage;
