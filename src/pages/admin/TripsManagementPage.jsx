import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  PlusCircle, 
  Edit, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Bus, 
  Route as RouteIcon, 
  CheckCircle,
  XCircle
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { tripService, routeService, busService, driverService } from '../../services/firestore';
import { transportAlerts } from '../../services/tracking/transportAlerts';
import { TRIP_STATUS } from '../../constants/collections';

export const TripsManagementPage = () => {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status and detail view state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    routeId: '',
    busId: '',
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    scheduledStart: '07:30 AM',
    scheduledEnd: '08:15 AM',
    type: 'morning_pickup', // 'morning_pickup' | 'afternoon_dropoff'
    status: TRIP_STATUS.SCHEDULED,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripList, routeList, busList, driverList] = await Promise.all([
        tripService.getAll({ max: 200 }),
        routeService.getAll({ max: 100 }),
        busService.getAll({ max: 100 }),
        driverService.getAll({ max: 100 }),
      ]);
      setTrips(tripList);
      setRoutes(routeList);
      setBuses(busList);
      setDrivers(driverList);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    const defaultRoute = routes[0];
    setFormData({
      routeId: defaultRoute?.id || '',
      busId: defaultRoute?.assignedBusId || buses[0]?.id || '',
      driverId: defaultRoute?.assignedDriverId || drivers[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      scheduledStart: '07:30 AM',
      scheduledEnd: '08:15 AM',
      type: 'morning_pickup',
      status: TRIP_STATUS.SCHEDULED,
    });
    setIsFormOpen(true);
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedRoute = routes.find((r) => r.id === formData.routeId);
      const selectedBus = buses.find((b) => b.id === formData.busId);
      const selectedDriver = drivers.find((d) => d.id === formData.driverId);

      const payload = {
        ...formData,
        routeName: selectedRoute ? (selectedRoute.name || selectedRoute.routeCode) : 'Express Route',
        routeCode: selectedRoute ? selectedRoute.routeCode : 'EXP',
        busNumber: selectedBus ? selectedBus.busNumber : 'Bus 10',
        driverName: selectedDriver ? selectedDriver.fullName : 'Operator',
      };

      await tripService.createTrip(payload);
      showToast('New trip queued on dispatch calendar.');
      setIsFormOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to queue trip:', err);
      alert(`Error creating trip: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Change Trip Operational Status
  const handleUpdateStatus = async (tripId, newStatus) => {
    try {
      await tripService.updateStatus(tripId, newStatus);
      const trip = trips.find((t) => t.id === tripId);
      
      if (trip) {
        if (newStatus === TRIP_STATUS.IN_PROGRESS) {
          await transportAlerts.notifyTripStarted(trip, {
            routeName: trip.routeName,
            busNumber: trip.busNumber,
          });
        } else if (newStatus === TRIP_STATUS.DELAYED) {
          await transportAlerts.notifyTripDelayed(trip, 'Dispatcher Schedule Hold', {
            routeName: trip.routeName,
            busNumber: trip.busNumber,
          });
        } else if (newStatus === TRIP_STATUS.COMPLETED) {
          await transportAlerts.notifyTripCompleted(trip, {
            routeName: trip.routeName,
            busNumber: trip.busNumber,
          });
        }
      }

      showToast(`Trip status changed to ${newStatus}.`);
      await fetchData();
      if (selectedTrip && selectedTrip.id === tripId) {
        setSelectedTrip({ ...selectedTrip, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update trip status:', err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case TRIP_STATUS.IN_PROGRESS:
      case 'inProgress':
        return <Badge variant="active">In Progress</Badge>;
      case TRIP_STATUS.COMPLETED:
      case 'completed':
        return <Badge variant="neutral">Completed</Badge>;
      case TRIP_STATUS.DELAYED:
      case 'delayed':
        return <Badge variant="warning">Delayed</Badge>;
      case TRIP_STATUS.CANCELLED:
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="info">Scheduled</Badge>;
    }
  };

  const columns = [
    {
      header: 'Trip Corridor',
      key: 'routeName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-brand-navy flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-brand-blue" />
            {row.routeName || 'School Corridor'}
          </p>
          <span className="text-[10px] text-brand-slate uppercase font-semibold">
            {row.type?.replace('_', ' ') || 'Transit'}
          </span>
        </div>
      ),
    },
    {
      header: 'Vehicle & Operator',
      key: 'busNumber',
      render: (row) => (
        <div>
          <span className="font-medium text-brand-navy text-xs">{row.busNumber || 'Assigned Bus'}</span>
          <p className="text-[11px] text-brand-slate">{row.driverName || 'Designated Driver'}</p>
        </div>
      ),
    },
    {
      header: 'Date & Scheduled Window',
      key: 'date',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-brand-navy text-xs">{row.date || 'Today'}</p>
          <p className="text-[11px] text-brand-slate">
            {row.scheduledStart || '07:30 AM'} – {row.scheduledEnd || '08:15 AM'}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => getStatusBadge(row.status),
    },
  ];

  return (
    <DashboardLayout title="Trip Dispatch & Operations Schedule">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Fleet Dispatch Calendar & Trip Log</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Control daily runs, mark departure / arrival milestones, and log transit delays.
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
              Queue Trip
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={trips}
          loading={loading}
          searchPlaceholder="Search trips by route, bus number, or driver..."
          searchField={(row, q) =>
            (row.routeName && row.routeName.toLowerCase().includes(q)) ||
            (row.busNumber && row.busNumber.toLowerCase().includes(q)) ||
            (row.driverName && row.driverName.toLowerCase().includes(q))
          }
          emptyTitle="No trips scheduled"
          emptyDescription="Queue morning or afternoon trips to initiate driver logs."
          emptyActionText="Queue First Trip"
          onEmptyAction={handleOpenCreate}
          actions={(row) => (
            <div className="flex items-center gap-1.5">
              {/* Quick Status Modifiers */}
              {row.status === TRIP_STATUS.SCHEDULED && (
                <button
                  onClick={() => handleUpdateStatus(row.id, TRIP_STATUS.IN_PROGRESS)}
                  className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-brand-teal text-[10px] font-bold rounded-lg transition-colors"
                >
                  Start
                </button>
              )}
              {row.status === TRIP_STATUS.IN_PROGRESS && (
                <button
                  onClick={() => handleUpdateStatus(row.id, TRIP_STATUS.COMPLETED)}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg transition-colors"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedTrip(row);
                  setIsDetailOpen(true);
                }}
                className="p-1.5 rounded-lg text-brand-slate hover:bg-slate-100 hover:text-brand-navy transition-colors"
                title="Inspect Trip"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />

        {/* Queue Trip Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title="Queue New School Transit Trip"
          subtitle="Generate trip operational record and notify driver dispatch."
        >
          <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-brand-navy mb-1">Route Corridor *</label>
              <select
                required
                value={formData.routeId}
                onChange={(e) => {
                  const rId = e.target.value;
                  const foundRoute = routes.find((r) => r.id === rId);
                  setFormData({
                    ...formData,
                    routeId: rId,
                    busId: foundRoute?.assignedBusId || formData.busId,
                    driverId: foundRoute?.assignedDriverId || formData.driverId,
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
              >
                <option value="">Select Route</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.routeCode} ({r.routeCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Assigned Bus *</label>
                <select
                  required
                  value={formData.busId}
                  onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value="">Select Bus</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.model || 'Standard'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Assigned Driver *</label>
                <select
                  required
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none bg-white"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Trip Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Scheduled Start</label>
                <input
                  type="text"
                  value={formData.scheduledStart}
                  onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                  placeholder="07:30 AM"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy mb-1">Scheduled End</label>
                <input
                  type="text"
                  value={formData.scheduledEnd}
                  onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                  placeholder="08:15 AM"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={saving}>
                Queue Trip
              </Button>
            </div>
          </form>
        </Modal>

        {/* Trip Detail & Status Controller Dialog */}
        {selectedTrip && (
          <Modal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            title={`Trip Manifest: ${selectedTrip.routeName || 'Corridor'}`}
            subtitle={`Trip ID: ${selectedTrip.id}`}
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-slate">Operational Status:</span>
                  {getStatusBadge(selectedTrip.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-slate">Vehicle:</span>
                  <span className="font-bold text-brand-navy">{selectedTrip.busNumber || 'Assigned Bus'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-slate">Driver:</span>
                  <span className="font-bold text-brand-navy">{selectedTrip.driverName || 'Designated'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-slate">Departure Time:</span>
                  <span className="font-medium text-brand-navy">{selectedTrip.scheduledStart}</span>
                </div>
              </div>

              {/* Status Update Actions */}
              <div>
                <label className="block font-bold text-brand-navy uppercase tracking-wider text-[11px] mb-2">
                  Override Status / Log Event
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedTrip.id, TRIP_STATUS.IN_PROGRESS)}
                    className="p-2 rounded-xl border border-teal-200 bg-teal-50 text-brand-teal font-semibold text-[11px] hover:bg-teal-100 transition-colors"
                  >
                    Start Run
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTrip.id, TRIP_STATUS.COMPLETED)}
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-[11px] hover:bg-emerald-100 transition-colors"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTrip.id, TRIP_STATUS.DELAYED)}
                    className="p-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 font-semibold text-[11px] hover:bg-amber-100 transition-colors"
                  >
                    Flag Delay
                  </button>
                </div>
              </div>

              {/* Real-time Tracking Foundation Note */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-brand-blue">
                <span className="font-bold">Live Tracking Readiness:</span> This trip entity is configured to receive GPS stream telemetry and automated stop geofence check-ins in Stage 8.
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TripsManagementPage;
